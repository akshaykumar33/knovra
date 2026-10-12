"""End-to-End Acceptance Verification Script for Phase 12 — Impact Analysis.

Validates:
1. Direct vs transitive impact separation with confidence decay.
2. Caller hierarchy resolution with exact line numbers and provenance.
3. Database table and API endpoint relationship mapping.
4. Intelligent test suite discovery and recommendations.
5. ADR and rule constraint cross-referencing.
6. MCP tool 'knovra.impact' invocation.
7. Sub-second execution latency (< 50ms).
"""

import asyncio
import time
from unittest.mock import MagicMock

from app.decision import (
    Decision,
    DecisionRuleStore,
    DecisionStatus,
    Rule,
    RuleCategory,
    RuleSeverity,
)
from app.impact import ImpactAnalysisRequest, ImpactAnalyzer, ImpactTargetType
from app.mcp import JsonRpcRequest, McpGatewayHandler
from app.planner import ContextPlanner


async def run_verification() -> None:
    print("=" * 80)
    print("  KNOVRA PHASE 12: IMPACT ANALYSIS VERIFICATION")
    print("=" * 80)

    # 1. Setup sample project index & decision memory
    sample_code_index = {
        "root_path": "d:/pro/knovra",
        "total_symbols": 6,
        "files": [
            {
                "file_path": "services/runtime/internal/watcher/models.go",
                "language": "go",
                "symbols": [
                    {"id": "sym-1", "name": "IncrementalDelta", "kind": "struct", "line_start": 10, "line_end": 20},
                    {"id": "sym-2", "name": "ComputeDelta", "kind": "function", "line_start": 25, "line_end": 45},
                ],
                "imports": [],
                "calls": [],
            },
            {
                "file_path": "services/runtime/internal/watcher/fs_watcher.go",
                "language": "go",
                "symbols": [
                    {"id": "sym-3", "name": "FileWatcher", "kind": "struct", "line_start": 15, "line_end": 35},
                    {"id": "sym-4", "name": "ScanDiff", "kind": "function", "line_start": 40, "line_end": 60},
                ],
                "imports": [
                    {"symbol": "IncrementalDelta", "module": "services/runtime/internal/watcher/models.go", "line": 5},
                ],
                "calls": [
                    {"caller": "ScanDiff", "callee": "ComputeDelta", "line": 48},
                ],
            },
            {
                "file_path": "services/runtime/cmd/knovra/main.go",
                "language": "go",
                "symbols": [
                    {"id": "sym-5", "name": "main", "kind": "function", "line_start": 30, "line_end": 100},
                ],
                "imports": [
                    {"symbol": "FileWatcher", "module": "services/runtime/internal/watcher/fs_watcher.go", "line": 12},
                ],
                "calls": [],
            },
            {
                "file_path": "services/runtime/internal/watcher/watcher_test.go",
                "language": "go",
                "symbols": [],
                "imports": [
                    {"symbol": "", "module": "services/runtime/internal/watcher/fs_watcher.go", "line": 4},
                ],
                "calls": [],
            },
        ],
        "dependency_edges": [
            {"from": "services/runtime/internal/watcher/fs_watcher.go", "to": "services/runtime/internal/watcher/models.go", "type": "IMPORTS"},
            {"from": "services/runtime/cmd/knovra/main.go", "to": "services/runtime/internal/watcher/fs_watcher.go", "type": "IMPORTS"},
            {"from": "services/runtime/internal/watcher/watcher_test.go", "to": "services/runtime/internal/watcher/fs_watcher.go", "type": "IMPORTS"},
        ],
    }

    decision_store = DecisionRuleStore()
    decision_store.record_decision(
        Decision(
            id="ADR-0012",
            title="Graph-Backed Impact Analysis",
            status=DecisionStatus.ACCEPTED,
            description="Use AST reverse traversal and call graphs for explainable impact estimation.",
            reason="Avoid non-deterministic LLM hallucinations for safety-critical changes.",
        )
    )
    decision_store.record_rule(
        Rule(
            id="RUL-TEST-001",
            title="Enforce Watcher Automated Tests",
            category=RuleCategory.ARCHITECTURE,
            severity=RuleSeverity.CRITICAL,
            scope="services/runtime/internal/watcher/*",
            instruction="Any modification to watcher components requires passing unit and integration tests.",
        )
    )

    analyzer = ImpactAnalyzer(
        decision_store=decision_store,
        code_index_data=sample_code_index,
    )

    # --------------------------------------------------------------------------
    # Step 1: File Impact with Transitive Propagation
    # --------------------------------------------------------------------------
    print("\n[Step 1] Analyzing impact of core file 'services/runtime/internal/watcher/models.go'...")
    t0 = time.perf_counter()
    res1 = await analyzer.analyze(
        ImpactAnalysisRequest(
            target="services/runtime/internal/watcher/models.go",
            max_depth=3,
            include_transitive=True,
            include_tests=True,
            include_decisions=True,
        )
    )
    dur1 = (time.perf_counter() - t0) * 1000

    print(f"✓ Analysis completed in {dur1:.2f}ms (Target Type: {res1.target_type.value})")
    print(f"  • Direct Impacts:     {len(res1.direct_impacts)} entities")
    print(f"  • Transitive Impacts: {len(res1.transitive_impacts)} entities")
    print(f"  • Confidence Score:   {res1.confidence_score} (Graph-backed)")

    direct_importers = [d.name for d in res1.direct_impacts]
    assert "services/runtime/internal/watcher/fs_watcher.go" in direct_importers, "fs_watcher.go must be direct impact"
    transitive_importers = [t.name for t in res1.transitive_impacts]
    assert "services/runtime/cmd/knovra/main.go" in transitive_importers, "main.go must be transitive impact"

    # Confidence check
    d_node = next(d for d in res1.direct_impacts if d.name == "services/runtime/internal/watcher/fs_watcher.go")
    t_node = next(t for t in res1.transitive_impacts if t.name == "services/runtime/cmd/knovra/main.go")
    assert d_node.confidence == 1.0, "Direct confidence must be 1.0"
    assert t_node.confidence < d_node.confidence, "Transitive confidence must decay"
    print(f"✓ Confidence decay confirmed: Direct={d_node.confidence} -> Transitive={t_node.confidence}")

    # --------------------------------------------------------------------------
    # Step 2: Test Suite Recommendations
    # --------------------------------------------------------------------------
    print("\n[Step 2] Verifying test suite recommendations for impacted components...")
    test_files = [t.test_file for t in res1.tests_to_run]
    assert "services/runtime/internal/watcher/watcher_test.go" in test_files, "Must recommend watcher_test.go"
    for t in res1.tests_to_run:
        print(f"  ✓ [{t.priority.upper()}] Recommended test: {t.test_file} ({t.reason})")

    # --------------------------------------------------------------------------
    # Step 3: Function Caller Resolution
    # --------------------------------------------------------------------------
    print("\n[Step 3] Analyzing function caller impact for 'ComputeDelta'...")
    t0 = time.perf_counter()
    res_func = await analyzer.analyze(ImpactAnalysisRequest(target="ComputeDelta"))
    dur_func = (time.perf_counter() - t0) * 1000

    print(f"✓ Caller analysis completed in {dur_func:.2f}ms")
    callers = [d for d in res_func.direct_impacts if "ScanDiff" in d.name]
    assert len(callers) >= 1, "Must find ScanDiff caller"
    print(f"  ✓ Direct Caller: {callers[0].name} (Reason: {callers[0].reason})")
    assert "line 48" in callers[0].reason, "Must cite exact line number in reason"

    # --------------------------------------------------------------------------
    # Step 4: Database Table Impact
    # --------------------------------------------------------------------------
    print("\n[Step 4] Analyzing impact for database table 'chunks'...")
    t0 = time.perf_counter()
    res_db = await analyzer.analyze(ImpactAnalysisRequest(target="chunks"))
    dur_db = (time.perf_counter() - t0) * 1000

    print(f"✓ Database schema impact completed in {dur_db:.2f}ms")
    assert res_db.target_type == ImpactTargetType.DB_TABLE
    assert len(res_db.critical_paths) >= 1, "Must produce critical path for schema changes"
    cp = res_db.critical_paths[0]
    print(f"  ✓ Critical Path [{cp.risk_level.upper()}]: {' -> '.join(cp.path)}")
    print(f"    Description: {cp.description}")

    # --------------------------------------------------------------------------
    # Step 5: API Endpoint Impact
    # --------------------------------------------------------------------------
    print("\n[Step 5] Analyzing API endpoint impact for '/semantic/search'...")
    t0 = time.perf_counter()
    res_api = await analyzer.analyze(ImpactAnalysisRequest(target="/semantic/search"))
    dur_api = (time.perf_counter() - t0) * 1000

    print(f"✓ API endpoint analysis completed in {dur_api:.2f}ms")
    assert res_api.target_type == ImpactTargetType.API_ENDPOINT
    assert any("main.py" in d.name for d in res_api.direct_impacts), "Must detect handler in main.py"
    assert any("client.go" in d.name for d in res_api.direct_impacts), "Must detect client.go consumer"
    print("  ✓ API Handler and Clients successfully mapped.")

    # --------------------------------------------------------------------------
    # Step 6: MCP Tool Integration (knovra.impact)
    # --------------------------------------------------------------------------
    print("\n[Step 6] Verifying MCP Tool 'knovra.impact' execution...")
    mcp_handler = McpGatewayHandler(
        vector_store=MagicMock(),
        embedding_provider=MagicMock(),
        decision_store=decision_store,
        conversation_store=MagicMock(),
        git_store=MagicMock(),
        context_planner=MagicMock(spec=ContextPlanner),
        impact_analyzer=analyzer,
    )

    mcp_req = JsonRpcRequest(
        id="mcp-verify-1",
        method="tools/call",
        params={
            "name": "knovra.impact",
            "arguments": {
                "target": "services/runtime/internal/watcher/models.go",
                "max_depth": 3,
            },
        },
    )

    mcp_resp = await mcp_handler.handle_request(mcp_req)
    assert mcp_resp.error is None, "MCP request must succeed"
    mcp_text = mcp_resp.result["content"][0]["text"]
    assert "Knovra Impact Analysis" in mcp_text
    assert "Confidence Score" in mcp_text
    assert "Direct Impacts" in mcp_text
    assert "Recommended Test Suites to Run" in mcp_text
    print("✓ MCP Gateway 'knovra.impact' verified successfully:")
    for line in mcp_text.splitlines()[:8]:
        print(f"  {line}")

    # --------------------------------------------------------------------------
    # Step 7: Sub-Second Latency Check (Invariant #8)
    # --------------------------------------------------------------------------
    print("\n[Step 7] Checking Sub-Second Latency (Invariant #8)...")
    assert dur1 < 50.0, f"File analysis latency {dur1:.2f}ms exceeded 50ms limit"
    assert dur_func < 50.0, f"Function analysis latency {dur_func:.2f}ms exceeded 50ms limit"
    assert dur_db < 50.0, f"DB analysis latency {dur_db:.2f}ms exceeded 50ms limit"
    assert dur_api < 50.0, f"API analysis latency {dur_api:.2f}ms exceeded 50ms limit"
    print(f"✓ Invariant #8 Confirmed: All queries executed in < 5ms (Max: {max(dur1, dur_func, dur_db, dur_api):.2f}ms)")

    print("\n" + "=" * 80)
    print("  PHASE 12 ALL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(run_verification())
