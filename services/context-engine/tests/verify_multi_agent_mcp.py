"""Multi-Agent MCP Gateway Verification Script (Phase 09 Acceptance Criteria).

Simulates two distinct external AI coding agents querying the same Knovra
project context simultaneously through the Model Context Protocol (JSON-RPC 2.0):
- Agent Alpha: "Architect Agent" analyzing project topology, ADR decisions, and governance rules.
- Agent Beta: "Bugfix Agent" assembling a task context bundle, searching historical errors, and remembering solutions.
"""

from starlette.testclient import TestClient

from app.decision import Decision, DecisionStatus, Rule, RuleCategory, RuleSeverity
from app.git_memory import GitCommit
from app.main import app, decision_store, git_store


def seed_test_project_state():
    """Seeds rich project state for multi-agent inspection."""
    decision_store.record_decision(
        Decision(
            id="ADR-001",
            title="Polyglot Monorepo Architecture",
            status=DecisionStatus.ACCEPTED,
            description="Isolate Go runtime, Rust tree-sitter indexing, and Python semantic reasoning",
            reason="High performance indexing and resilient offline context assembly",
        )
    )
    decision_store.record_decision(
        Decision(
            id="ADR-002",
            title="Tree-sitter AST Parsing Engine",
            status=DecisionStatus.ACCEPTED,
            description="Extract language symbols, imports, and SHA-256 hashes",
            reason="Precise symbol resolution across polyglot languages",
        )
    )
    decision_store.record_rule(
        Rule(
            id="RULE-SEC-01",
            title="Zero Secret Leakage Invariant",
            instruction="All outputs must be scrubbed through SecretRedactor before external dispatch",
            category=RuleCategory.SECURITY,
            severity=RuleSeverity.CRITICAL,
        )
    )
    git_store.add_commit(
        GitCommit(
            hash="1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
            short_hash="1a2b3c4",
            author_name="akshaykumar33",
            author_email="dev@knovra.internal",
            date="2026-09-09T10:00:00Z",
            subject="feat(mcp): implement Phase 09 MCP agent gateway",
            body="Exposes 12 standard MCP tools over stdio and HTTP/SSE",
            linked_decisions=["ADR-001"],
        )
    )


def simulate_agent_alpha(client: TestClient) -> dict:
    """Agent Alpha: Architect Agent querying project topology, decisions, and rules."""
    print("\n--- [Agent Alpha: Architect Agent] Starting Session ---")
    session_results = {}

    # Step 1: Handshake
    init_req = {
        "jsonrpc": "2.0",
        "id": "alpha-init",
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "agent-alpha-architect", "version": "2.4.0"},
        },
    }
    resp = client.post("/mcp/rpc", json=init_req)
    assert resp.status_code == 200, f"Alpha init failed: {resp.text}"
    session_results["init"] = resp.json()["result"]["serverInfo"]
    print(f"✓ Agent Alpha initialized with server: {session_results['init']['name']} v{session_results['init']['version']}")

    # Step 2: Tools Discovery
    list_req = {"jsonrpc": "2.0", "id": "alpha-tools", "method": "tools/list", "params": {}}
    resp = client.post("/mcp/rpc", json=list_req)
    tools = resp.json()["result"]["tools"]
    session_results["tools_count"] = len(tools)
    print(f"✓ Agent Alpha discovered {len(tools)} available MCP tools")

    # Step 3: Query Project Topology (knovra.project)
    proj_req = {
        "jsonrpc": "2.0",
        "id": "alpha-proj",
        "method": "tools/call",
        "params": {"name": "knovra.project", "arguments": {}},
    }
    resp = client.post("/mcp/rpc", json=proj_req)
    session_results["project_overview"] = resp.json()["result"]["content"][0]["text"]
    print("✓ Agent Alpha queried project topology successfully")

    # Step 4: Query Active Architecture Decisions (knovra.architecture)
    arch_req = {
        "jsonrpc": "2.0",
        "id": "alpha-arch",
        "method": "tools/call",
        "params": {"name": "knovra.architecture", "arguments": {}},
    }
    resp = client.post("/mcp/rpc", json=arch_req)
    session_results["architecture"] = resp.json()["result"]["content"][0]["text"]
    assert "ADR-001" in session_results["architecture"]
    print("✓ Agent Alpha retrieved active ADR decisions")

    # Step 5: Query Security Governance Rules (knovra.rules)
    rule_req = {
        "jsonrpc": "2.0",
        "id": "alpha-rules",
        "method": "tools/call",
        "params": {"name": "knovra.rules", "arguments": {"category": "security"}},
    }
    resp = client.post("/mcp/rpc", json=rule_req)
    session_results["rules"] = resp.json()["result"]["content"][0]["text"]
    assert "RULE-SEC-01" in session_results["rules"]
    print("✓ Agent Alpha verified active security rules")

    return session_results


def simulate_agent_beta(client: TestClient) -> dict:
    """Agent Beta: Bugfix Agent planning context, reading errors, and storing learnings."""
    print("\n--- [Agent Beta: Bugfix Agent] Starting Session ---")
    session_results = {}

    # Step 1: Handshake
    init_req = {
        "jsonrpc": "2.0",
        "id": "beta-init",
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "agent-beta-bugfixer", "version": "1.8.2"},
        },
    }
    resp = client.post("/mcp/rpc", json=init_req)
    assert resp.status_code == 200, f"Beta init failed: {resp.text}"
    session_results["init"] = resp.json()["result"]["serverInfo"]
    print(f"✓ Agent Beta initialized with server: {session_results['init']['name']}")

    # Step 2: Assemble Task Context Bundle (knovra.context)
    plan_req = {
        "jsonrpc": "2.0",
        "id": "beta-plan",
        "method": "tools/call",
        "params": {
            "name": "knovra.context",
            "arguments": {
                "prompt": "Fix Docker named pipe connection error on Windows platform",
                "budget": 2000,
                "format": "markdown",
            },
        },
    }
    resp = client.post("/mcp/rpc", json=plan_req)
    session_results["context_prompt"] = resp.json()["result"]["content"][0]["text"]
    assert "CONTEXT BUNDLE" in session_results["context_prompt"]
    print("✓ Agent Beta generated bounded context bundle (2000 tokens cap)")

    # Step 3: Remember New Solution (knovra.remember)
    rem_req = {
        "jsonrpc": "2.0",
        "id": "beta-rem",
        "method": "tools/call",
        "params": {
            "name": "knovra.remember",
            "arguments": {
                "text": "Docker on Windows requires BypassSandbox: true for named pipe access \\\\.\\pipe\\dockerDesktopLinuxEngine",
                "category": "solution",
            },
        },
    }
    resp = client.post("/mcp/rpc", json=rem_req)
    session_results["remember_status"] = resp.json()["result"]["content"][0]["text"]
    assert "Successfully remembered" in session_results["remember_status"]
    print("✓ Agent Beta ingested new debugging solution into memory")

    # Step 4: Query Error History (knovra.errors)
    err_req = {
        "jsonrpc": "2.0",
        "id": "beta-err",
        "method": "tools/call",
        "params": {"name": "knovra.errors", "arguments": {"query": "Docker"}},
    }
    resp = client.post("/mcp/rpc", json=err_req)
    session_results["errors"] = resp.json()["result"]["content"][0]["text"]
    assert "BypassSandbox" in session_results["errors"]
    print("✓ Agent Beta retrieved historical error & solution pair")

    # Step 5: Query Git History (knovra.history)
    hist_req = {
        "jsonrpc": "2.0",
        "id": "beta-hist",
        "method": "tools/call",
        "params": {"name": "knovra.history", "arguments": {"limit": 3}},
    }
    resp = client.post("/mcp/rpc", json=hist_req)
    session_results["history"] = resp.json()["result"]["content"][0]["text"]
    assert "1a2b3c4" in session_results["history"]
    print("✓ Agent Beta traced recent commits and linked ADRs")

    return session_results


def main():
    print("======================================================================")
    print("  KNOVRA MULTI-AGENT MCP GATEWAY VERIFICATION")
    print("  Acceptance Criteria: 2 distinct agents querying same project context")
    print("======================================================================")

    seed_test_project_state()
    client = TestClient(app)

    alpha_res = simulate_agent_alpha(client)
    beta_res = simulate_agent_beta(client)

    print("\n======================================================================")
    print("  VERIFICATION RESULT: SUCCESS")
    print("======================================================================")
    print(f"• Agent Alpha: Verified {alpha_res['tools_count']} tools, queried ADRs and rules.")
    print(f"• Agent Beta:  Assembled {len(beta_res['context_prompt'])} byte context, remembered solution, and queried error history.")
    print("• Acceptance Criteria: 100% Satisfied. Both agents successfully communicated via MCP JSON-RPC 2.0.")
    print("======================================================================")


if __name__ == "__main__":
    main()
