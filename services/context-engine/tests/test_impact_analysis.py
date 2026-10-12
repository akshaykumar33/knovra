"""Unit tests for Knovra Impact Analysis Subsystem (Phase 12)."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.decision import (
    Decision,
    DecisionRuleStore,
    DecisionStatus,
    Rule,
    RuleCategory,
    RuleSeverity,
)
from app.impact import (
    ImpactAnalysisRequest,
    ImpactAnalyzer,
    ImpactTargetType,
    ImpactType,
)
from app.main import app
from app.mcp import JsonRpcRequest, McpGatewayHandler


@pytest.fixture
def sample_code_index():
    return {
        "root_path": "d:/pro/knovra",
        "total_symbols": 5,
        "files": [
            {
                "file_path": "services/runtime/internal/watcher/models.go",
                "language": "go",
                "content_hash": "hash-models",
                "symbols": [
                    {"id": "sym-1", "name": "IncrementalDelta", "kind": "struct", "line_start": 10, "line_end": 20, "signature": "type IncrementalDelta struct"},
                    {"id": "sym-2", "name": "ComputeDelta", "kind": "function", "line_start": 25, "line_end": 45, "signature": "func ComputeDelta()"},
                ],
                "imports": [],
                "exports": [{"symbol": "IncrementalDelta", "line": 10}, {"symbol": "ComputeDelta", "line": 25}],
                "calls": [],
            },
            {
                "file_path": "services/runtime/internal/watcher/fs_watcher.go",
                "language": "go",
                "content_hash": "hash-fs",
                "symbols": [
                    {"id": "sym-3", "name": "FileWatcher", "kind": "struct", "line_start": 15, "line_end": 35, "signature": "type FileWatcher struct"},
                ],
                "imports": [
                    {"symbol": "IncrementalDelta", "module": "services/runtime/internal/watcher/models.go", "line": 5},
                ],
                "exports": [],
                "calls": [
                    {"caller": "ScanDiff", "callee": "ComputeDelta", "line": 42},
                ],
            },
            {
                "file_path": "services/runtime/cmd/knovra/main.go",
                "language": "go",
                "content_hash": "hash-main",
                "symbols": [
                    {"id": "sym-4", "name": "main", "kind": "function", "line_start": 20, "line_end": 60, "signature": "func main()"},
                ],
                "imports": [
                    {"symbol": "FileWatcher", "module": "services/runtime/internal/watcher/fs_watcher.go", "line": 8},
                ],
                "exports": [],
                "calls": [],
            },
            {
                "file_path": "services/runtime/internal/watcher/watcher_test.go",
                "language": "go",
                "content_hash": "hash-test",
                "symbols": [],
                "imports": [
                    {"symbol": "", "module": "services/runtime/internal/watcher/fs_watcher.go", "line": 4},
                ],
                "exports": [],
                "calls": [],
            },
        ],
        "dependency_edges": [
            {"from": "services/runtime/internal/watcher/fs_watcher.go", "to": "services/runtime/internal/watcher/models.go", "type": "IMPORTS"},
            {"from": "services/runtime/cmd/knovra/main.go", "to": "services/runtime/internal/watcher/fs_watcher.go", "type": "IMPORTS"},
            {"from": "services/runtime/internal/watcher/watcher_test.go", "to": "services/runtime/internal/watcher/fs_watcher.go", "type": "IMPORTS"},
        ],
    }


@pytest.fixture
def decision_store_with_rules():
    store = DecisionRuleStore()
    store.record_decision(
        Decision(
            id="ADR-0012",
            title="Graph-Backed Impact Analysis",
            status=DecisionStatus.ACCEPTED,
            description="Use reverse AST traversals and call graphs for change impact estimation.",
            reason="Prevent regressions without relying on non-deterministic LLM hallucination.",
        )
    )
    store.record_rule(
        Rule(
            id="RUL-TEST-001",
            title="Require Tests for Watcher Subsystem",
            category=RuleCategory.ARCHITECTURE,
            severity=RuleSeverity.CRITICAL,
            scope="services/runtime/internal/watcher/*",
            instruction="All modifications to file system watcher must include automated test verification.",
        )
    )
    return store


@pytest.mark.asyncio
async def test_target_type_auto_detection(sample_code_index):
    analyzer = ImpactAnalyzer(code_index_data=sample_code_index)

    assert analyzer.detect_target_type("services/runtime/config.py") == ImpactTargetType.FILE
    assert analyzer.detect_target_type("fs_watcher.go") == ImpactTargetType.FILE
    assert analyzer.detect_target_type("ComputeDelta") == ImpactTargetType.FUNCTION
    assert analyzer.detect_target_type("FileWatcher") == ImpactTargetType.CLASS
    assert analyzer.detect_target_type("chunks") == ImpactTargetType.DB_TABLE
    assert analyzer.detect_target_type("/semantic/search") == ImpactTargetType.API_ENDPOINT
    assert analyzer.detect_target_type("POST /events/publish") == ImpactTargetType.API_ENDPOINT
    assert analyzer.detect_target_type("runtime") == ImpactTargetType.SERVICE


@pytest.mark.asyncio
async def test_file_impact_transitive_traversal(sample_code_index, decision_store_with_rules):
    analyzer = ImpactAnalyzer(
        decision_store=decision_store_with_rules,
        code_index_data=sample_code_index,
    )

    req = ImpactAnalysisRequest(
        target="services/runtime/internal/watcher/models.go",
        max_depth=3,
        include_transitive=True,
        include_tests=True,
        include_decisions=True,
    )
    res = await analyzer.analyze(req)

    assert res.target == "services/runtime/internal/watcher/models.go"
    assert res.target_type == ImpactTargetType.FILE
    assert res.total_impacted >= 2

    # Direct impact should include fs_watcher.go
    direct_names = [d.name for d in res.direct_impacts]
    assert "services/runtime/internal/watcher/fs_watcher.go" in direct_names

    # Transitive impact should include cmd/knovra/main.go
    transitive_names = [t.name for t in res.transitive_impacts]
    assert "services/runtime/cmd/knovra/main.go" in transitive_names

    # Confidence should decay with depth
    direct_node = next(d for d in res.direct_impacts if d.name == "services/runtime/internal/watcher/fs_watcher.go")
    transitive_node = next(t for t in res.transitive_impacts if t.name == "services/runtime/cmd/knovra/main.go")
    assert direct_node.confidence == 1.0
    assert transitive_node.confidence < direct_node.confidence

    # Tests to run should recommend watcher_test.go
    test_files = [t.test_file for t in res.tests_to_run]
    assert "services/runtime/internal/watcher/watcher_test.go" in test_files

    # Related decisions and rules should match scope
    assert any(d.decision_id == "ADR-0012" for d in res.related_decisions)


@pytest.mark.asyncio
async def test_function_caller_impact(sample_code_index):
    analyzer = ImpactAnalyzer(code_index_data=sample_code_index)

    req = ImpactAnalysisRequest(target="ComputeDelta")
    res = await analyzer.analyze(req)

    assert res.target_type == ImpactTargetType.FUNCTION
    caller_impacts = [d for d in res.direct_impacts if "ScanDiff" in d.name]
    assert len(caller_impacts) >= 1
    assert caller_impacts[0].impact_type == ImpactType.DIRECT
    assert caller_impacts[0].confidence == 1.0
    assert "line 42" in caller_impacts[0].reason


@pytest.mark.asyncio
async def test_database_table_impact(sample_code_index):
    analyzer = ImpactAnalyzer(code_index_data=sample_code_index)

    req = ImpactAnalysisRequest(target="chunks")
    res = await analyzer.analyze(req)

    assert res.target_type == ImpactTargetType.DB_TABLE
    assert len(res.direct_impacts) >= 2
    impacted_files = [d.name for d in res.direct_impacts]
    assert any("vector_store.py" in f for f in impacted_files)
    assert len(res.critical_paths) >= 1
    assert res.critical_paths[0].risk_level == "critical"


@pytest.mark.asyncio
async def test_api_endpoint_impact(sample_code_index):
    analyzer = ImpactAnalyzer(code_index_data=sample_code_index)

    req = ImpactAnalysisRequest(target="/semantic/search")
    res = await analyzer.analyze(req)

    assert res.target_type == ImpactTargetType.API_ENDPOINT
    impacted_names = [d.name for d in res.direct_impacts]
    assert any("main.py" in n for n in impacted_names)
    assert any("client.go" in n for n in impacted_names)


@pytest.mark.asyncio
async def test_mcp_tool_knovra_impact(sample_code_index, decision_store_with_rules):
    from unittest.mock import MagicMock

    from app.planner import ContextPlanner

    vector_store = MagicMock()
    embedding_provider = MagicMock()
    conversation_store = MagicMock()
    git_store = MagicMock()
    planner = MagicMock(spec=ContextPlanner)

    analyzer = ImpactAnalyzer(
        decision_store=decision_store_with_rules,
        code_index_data=sample_code_index,
    )

    handler = McpGatewayHandler(
        vector_store=vector_store,
        embedding_provider=embedding_provider,
        decision_store=decision_store_with_rules,
        conversation_store=conversation_store,
        git_store=git_store,
        context_planner=planner,
        impact_analyzer=analyzer,
    )

    req = JsonRpcRequest(
        id="test-mcp-impact",
        method="tools/call",
        params={
            "name": "knovra.impact",
            "arguments": {
                "target": "services/runtime/internal/watcher/models.go",
                "max_depth": 3,
            },
        },
    )

    resp = await handler.handle_request(req)
    assert resp.error is None
    result_text = resp.result["content"][0]["text"]
    assert "Knovra Impact Analysis" in result_text
    assert "Confidence Score" in result_text
    assert "Direct Impacts" in result_text
    assert "Recommended Test Suites to Run" in result_text


@pytest.mark.asyncio
async def test_fastapi_impact_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # POST /impact/analyze
        resp = await client.post(
            "/impact/analyze",
            json={
                "target": "chunks",
                "max_depth": 3,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["target"] == "chunks"
        assert data["target_type"] == "db_table"
        assert data["graph_backed"] is True
        assert len(data["direct_impacts"]) >= 1

        # GET /impact/target
        resp_get = await client.get("/impact/target?target=/semantic/search")
        assert resp_get.status_code == 200
        get_data = resp_get.json()
        assert get_data["target"] == "/semantic/search"
        assert get_data["target_type"] == "api_endpoint"
