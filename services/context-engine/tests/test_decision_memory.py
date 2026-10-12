import pytest
from httpx import ASGITransport, AsyncClient

from app.decision.models import (
    Alternative,
    Decision,
    DecisionStatus,
    Rule,
    RuleCategory,
    RuleSeverity,
)
from app.decision.storage import DecisionRuleStore
from app.main import app


def test_decision_storage_and_supersession():
    store = DecisionRuleStore()

    # 1. Record initial decision
    dec1 = Decision(
        id="adr-001",
        title="Monorepo Structure",
        reason="Polyglot architecture requirement",
        alternatives=[
            Alternative(name="Polyrepo", rejection_reason="Too much drift"),
        ],
        affected_entities=["services/code-indexer", "services/runtime"],
        status=DecisionStatus.ACCEPTED,
        source="docs/decisions/ADR-001.md",
    )
    store.record_decision(dec1)

    fetched = store.get_decision("adr-001")
    assert fetched is not None
    assert fetched.status == DecisionStatus.ACCEPTED
    assert fetched.superseded_by is None

    # 2. Record superseding decision
    dec2 = Decision(
        id="adr-002",
        title="Turborepo Monorepo Structure",
        reason="Need remote caching",
        supersedes="adr-001",
        status=DecisionStatus.ACCEPTED,
        source="docs/decisions/ADR-002.md",
    )
    store.record_decision(dec2)

    # Invariant #3: Non-destructive supersession verification
    old = store.get_decision("adr-001")
    new = store.get_decision("adr-002")
    assert old is not None
    assert new is not None
    assert old.status == DecisionStatus.SUPERSEDED
    assert old.superseded_by == "adr-002"
    assert new.status == DecisionStatus.ACCEPTED
    assert new.supersedes == "adr-001"

    # Lineage check
    lineage_old = store.get_lineage("adr-001")
    assert lineage_old is not None
    assert len(lineage_old.descendants) == 1
    assert lineage_old.descendants[0].id == "adr-002"
    assert lineage_old.active_version.id == "adr-002"

    lineage_new = store.get_lineage("adr-002")
    assert lineage_new is not None
    assert len(lineage_new.ancestors) == 1
    assert lineage_new.ancestors[0].id == "adr-001"
    assert lineage_new.active_version.id == "adr-002"


def test_rule_evaluation():
    store = DecisionRuleStore()

    # Add security rule
    store.record_rule(
        Rule(
            id="rule-sec-01",
            title="No Raw Secrets",
            instruction="Never commit unredacted secrets",
            category=RuleCategory.SECURITY,
            severity=RuleSeverity.CRITICAL,
            scope="*",
        )
    )

    # 1. Clean file passes
    resp_clean = store.evaluate_rules(
        file_paths=["src/main.py"],
        contents={"src/main.py": "print('Hello, world!')"},
    )
    assert resp_clean.passed
    assert len(resp_clean.violations) == 0

    # 2. File with unredacted secret fails
    resp_dirty = store.evaluate_rules(
        file_paths=["src/config.py"],
        contents={"src/config.py": "AWS_KEY = 'AKIA1234567890ABCDEF'"},
    )
    assert not resp_dirty.passed
    assert len(resp_dirty.violations) == 1
    assert resp_dirty.violations[0].rule_id == "rule-sec-01"


@pytest.mark.asyncio
async def test_decision_api_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Create Decision ADR-101
        payload1 = {
            "id": "adr-101",
            "title": "Use Neo4j for Graph",
            "reason": "Variable length traversal requirements",
            "alternatives": [
                {"name": "Postgres CTE", "rejection_reason": "Too slow at scale"}
            ],
            "affected_entities": ["graph/schema.cypher"],
            "created_by": "lead-architect",
            "status": "accepted",
            "source": "docs/decisions/ADR-101.md",
        }
        res1 = await client.post("/decisions", json=payload1)
        assert res1.status_code == 201
        data1 = res1.json()
        assert data1["id"] == "adr-101"
        assert data1["status"] == "accepted"

        # 2. List decisions
        list_res = await client.get("/decisions?active_only=true")
        assert list_res.status_code == 200
        dec_list = list_res.json()
        assert any(d["id"] == "adr-101" for d in dec_list)

        # 3. Supersede ADR-101 with ADR-102
        payload2 = {
            "id": "adr-102",
            "title": "Use Neo4j Aura Cloud",
            "reason": "Managed scalability",
            "alternatives": [],
            "affected_entities": ["graph/schema.cypher"],
            "created_by": "devops-lead",
            "status": "accepted",
            "source": "docs/decisions/ADR-102.md",
        }
        res2 = await client.post("/decisions/adr-101/supersede", json=payload2)
        assert res2.status_code == 200
        data2 = res2.json()
        assert data2["id"] == "adr-102"
        assert data2["supersedes"] == "adr-101"

        # 4. Verify lineage of ADR-101
        lin_res = await client.get("/decisions/adr-101")
        assert lin_res.status_code == 200
        lin_data = lin_res.json()
        assert lin_data["decision"]["status"] == "superseded"
        assert lin_data["decision"]["superseded_by"] == "adr-102"
        assert lin_data["active_version"]["id"] == "adr-102"

        # 5. Verify semantic memory automatic indexing of decisions
        search_res = await client.post(
            "/semantic/search",
            json={"query": "Variable length traversal requirements", "doc_types": ["decision"]},
        )
        assert search_res.status_code == 200
        results = search_res.json()
        assert len(results) > 0
        assert results[0]["doc_type"] == "decision"
        assert "provenance" in results[0]

        # 6. Rule API check
        rule_payload = {
            "id": "rule-test-01",
            "title": "Strict Provenance",
            "instruction": "All entities must track source",
            "category": "convention",
            "severity": "high",
            "scope": "*",
        }
        rule_res = await client.post("/rules", json=rule_payload)
        assert rule_res.status_code == 201

        rules_list_res = await client.get("/rules?category=convention")
        assert rules_list_res.status_code == 200
        assert any(r["id"] == "rule-test-01" for r in rules_list_res.json())
