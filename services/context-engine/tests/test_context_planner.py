"""Test suite for Phase 08: Context Planner."""

from datetime import UTC, datetime

import pytest
from starlette.testclient import TestClient

from app.conversation import (
    ConversationSession,
    ConversationStore,
    ExtractedFact,
    FactType,
    Message,
    MessageRole,
)
from app.decision import (
    Decision,
    DecisionRuleStore,
    DecisionStatus,
    Rule,
    RuleCategory,
    RuleSeverity,
)
from app.embeddings.adapter import DeterministicLocalEmbeddingProvider
from app.git_memory import FileChange, GitCommit, GitMemoryStore
from app.main import app
from app.planner import (
    ContextPlanner,
    ContextPlanRequest,
    TaskType,
    classify_task,
    estimate_tokens,
    extract_task_entities,
    pack_context_items,
)
from app.planner.models import ContextItem
from app.storage.vector_store import InMemoryVectorStore


@pytest.fixture
def test_client():
    return TestClient(app)


def test_task_classification():
    assert classify_task("Fix connection timeout bug in postgres") == TaskType.BUGFIX
    assert classify_task("Implement Context Planner bundle synthesis") == TaskType.FEATURE
    assert classify_task("Refactor chunking logic to improve token estimate") == TaskType.REFACTOR
    assert classify_task("Review architecture tradeoffs in ADR-004") == TaskType.ARCHITECTURE
    assert classify_task("Review code quality and check for defects") == TaskType.CODE_REVIEW
    assert classify_task("What is the purpose of the runtime?") == TaskType.GENERAL


def test_entity_extraction():
    prompt = "Please inspect services/context-engine/app/main.py regarding ADR-004 and `ContextPlanner`."
    entities = extract_task_entities(prompt, file_hints=["services/runtime/cmd/main.go"])

    assert "services/context-engine/app/main.py" in entities["files"]
    assert "services/runtime/cmd/main.go" in entities["files"]
    assert "adr-004" in entities["adrs"]
    assert "ContextPlanner" in entities["symbols"]


def test_token_estimation_and_packing():
    text = "Short sentence for token budgeting."
    tokens = estimate_tokens(text)
    assert tokens > 0
    assert tokens < 20

    items = [
        ContextItem(category="rule", title="R1", content="Rule content", relevance_score=1.0, token_count=50),
        ContextItem(category="decision", title="D1", content="ADR content", relevance_score=0.9, token_count=100),
        ContextItem(category="file", title="F1", content="File content", relevance_score=0.8, token_count=200),
        ContextItem(category="conversation", title="C1", content="Discussion", relevance_score=0.5, token_count=300),
    ]

    packed, usage, total = pack_context_items(items, max_tokens=200)
    assert total <= 200
    assert any(i.category == "rule" for i in packed)
    assert "rule" in usage


@pytest.mark.asyncio
async def test_context_planner_engine_synthesis():
    vector_store = InMemoryVectorStore()
    embedding_provider = DeterministicLocalEmbeddingProvider()
    decision_store = DecisionRuleStore()
    conversation_store = ConversationStore()
    git_store = GitMemoryStore()

    # Seed rule
    decision_store.record_rule(
        Rule(
            id="RUL-TEST-001",
            title="Local-First Offline Fallback",
            instruction="System must degrade gracefully to in-memory store if postgres is down",
            category=RuleCategory.ARCHITECTURE,
            severity=RuleSeverity.CRITICAL,
            scope="services/context-engine/*",
        )
    )

    # Seed decision
    decision_store.record_decision(
        Decision(
            id="adr-004",
            title="Resilient Hybrid Vector Store",
            status=DecisionStatus.ACCEPTED,
            reason="Allow local-first execution without external docker dependency",
            description="Use ResilientVectorStore with in-memory fallback",
        )
    )

    # Seed git commit
    git_store.add_commit(
        GitCommit(
            hash="3333333333333333333333333333333333333333",
            short_hash="3333333",
            author_name="Knovra Core",
            author_email="dev@knovra.io",
            date=datetime.now(UTC),
            subject="feat(storage): implement resilient hybrid vector store per ADR-004",
            body="Handles offline fallbacks.",
            changed_files=[
                FileChange(path="services/context-engine/app/storage/vector_store.py", status="modified", additions=50, deletions=5)
            ],
            linked_decisions=["adr-004"],
        )
    )

    # Seed conversation with error & solution
    conv_session = ConversationSession(
        id="conv-seed-01",
        title="Vector Store Troubleshooting",
        summary="Discussion on Postgres connection failure and in-memory workaround.",
        messages=[
            Message(
                id="m1",
                role=MessageRole.USER,
                content="PostgreSQL connection refused on port 5432 for ADR-004.",
            ),
            Message(
                id="m2",
                role=MessageRole.ASSISTANT,
                content="Fallback automatically to InMemoryVectorStore when connection fails.",
            ),
        ],
        extracted_facts=[
            ExtractedFact(
                id="f1",
                session_id="conv-seed-01",
                fact_type=FactType.ERROR,
                text="PostgreSQL connection refused on port 5432.",
                related_decisions=["adr-004"],
            ),
            ExtractedFact(
                id="f2",
                session_id="conv-seed-01",
                fact_type=FactType.SOLUTION,
                text="Fallback automatically to InMemoryVectorStore when connection fails.",
                related_decisions=["adr-004"],
            ),
        ],
    )
    conversation_store.add_session(conv_session)

    planner = ContextPlanner(
        vector_store=vector_store,
        embedding_provider=embedding_provider,
        decision_store=decision_store,
        conversation_store=conversation_store,
        git_store=git_store,
    )

    req = ContextPlanRequest(
        prompt="Fix postgres connection timeout in services/context-engine/app/storage/vector_store.py using ADR-004",
        max_tokens=3000,
    )

    res = await planner.plan(req)
    bundle = res.bundle

    assert bundle.task_type == TaskType.BUGFIX
    assert bundle.total_tokens <= 3000
    assert len(bundle.rules) >= 1
    assert any("RUL-TEST-001" in r.get("title", "") or "Local-First" in r.get("title", "") for r in bundle.rules)
    assert len(bundle.decisions) >= 1
    assert any(d.get("id") == "adr-004" for d in bundle.decisions)
    assert len(bundle.files) >= 1
    assert len(bundle.prior_errors_solutions) >= 1
    assert len(bundle.recent_changes) >= 1

    # Verify Markdown rendering
    assert "# CONTEXT BUNDLE:" in res.markdown_prompt
    assert "BUGFIX" in res.markdown_prompt
    assert "Local-First Offline Fallback" in res.markdown_prompt
    assert "ADR-004" in res.markdown_prompt


def test_planner_api_endpoints_e2e(test_client):
    req_payload = {
        "prompt": "Implement Phase 08 Context Planner with token budgeting",
        "task_type": "feature",
        "max_tokens": 2500,
        "file_hints": ["services/context-engine/app/main.py"],
    }

    # 1. POST /planner/bundle
    resp = test_client.post("/planner/bundle", json=req_payload)
    assert resp.status_code == 200
    bundle = resp.json()
    assert bundle["task_type"] == "feature"
    assert bundle["total_tokens"] <= 2500
    assert "rules" in bundle
    assert "files" in bundle

    # 2. POST /planner/prompt
    resp = test_client.post("/planner/prompt", json=req_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "bundle" in data
    assert "markdown_prompt" in data
    assert "# CONTEXT BUNDLE:" in data["markdown_prompt"]
