"""Tests for Knovra Model Context Protocol (MCP) and Universal Agent Gateway (Phase 09)."""

import pytest
from starlette.testclient import TestClient

from app.decision import Decision, DecisionStatus, Rule, RuleCategory, RuleSeverity
from app.git_memory import GitCommit
from app.main import app, decision_store, git_store


@pytest.fixture
def client():
    return TestClient(app)


def test_mcp_initialize(client):
    """Verifies standard MCP initialize handshake."""
    req = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "test-agent", "version": "1.0.0"},
        },
    }
    resp = client.post("/mcp/rpc", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert data["jsonrpc"] == "2.0"
    assert data["id"] == 1
    assert "result" in data
    result = data["result"]
    assert result["protocolVersion"] == "2024-11-05"
    assert "tools" in result["capabilities"]
    assert result["serverInfo"]["name"] == "knovra"


def test_mcp_tools_list(client):
    """Verifies that tools/list enumerates all 12 required MCP tools."""
    req = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/list",
        "params": {},
    }
    resp = client.post("/mcp/rpc", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert "result" in data
    tools = data["result"]["tools"]
    assert len(tools) >= 12

    tool_names = [t["name"] for t in tools]
    expected_tools = [
        "knovra.search",
        "knovra.context",
        "knovra.project",
        "knovra.architecture",
        "knovra.related_code",
        "knovra.dependencies",
        "knovra.decisions",
        "knovra.rules",
        "knovra.history",
        "knovra.errors",
        "knovra.remember",
        "knovra.record_decision",
        "knovra.impact",
    ]
    for expected in expected_tools:
        assert expected in tool_names, f"Missing required MCP tool: {expected}"


def test_mcp_convenience_tools_endpoint(client):
    """Verifies GET /mcp/tools returns the tool definitions."""
    resp = client.get("/mcp/tools")
    assert resp.status_code == 200
    data = resp.json()
    assert "tools" in data
    assert len(data["tools"]) >= 12


def test_mcp_tool_calls_suite(client):
    """Verifies execution of project intelligence tools via tools/call."""
    # Seed decision, rule, git commit
    decision_store.record_decision(
        Decision(
            id="ADR-001",
            title="Polyglot Monorepo Architecture",
            status=DecisionStatus.ACCEPTED,
            description="Use Go, Rust, and Python",
            reason="Polyglot system requirements with strict isolation",
        )
    )
    decision_store.record_rule(
        Rule(
            id="R-001",
            title="No direct Python imports in Go runtime",
            instruction="Go runtime must not import Python directly",
            category=RuleCategory.ARCHITECTURE,
            severity=RuleSeverity.HIGH,
        )
    )
    git_store.add_commit(
        GitCommit(
            hash="abcdef1234567890abcdef1234567890abcdef12",
            short_hash="abcdef1",
            author_name="akshaykumar33",
            author_email="dev@knovra.internal",
            date="2026-09-09T10:00:00Z",
            subject="feat(planner): implement Phase 08 Context Planner",
            body="Synthesizes context bundles",
            linked_decisions=["ADR-001"],
        )
    )

    # 1. knovra.project
    resp = client.post(
        "/mcp/rpc",
        json={
            "jsonrpc": "2.0",
            "id": 101,
            "method": "tools/call",
            "params": {"name": "knovra.project", "arguments": {}},
        },
    )
    assert resp.status_code == 200
    res = resp.json()["result"]
    assert not res["isError"]
    assert "Polyglot Monorepo" in res["content"][0]["text"]

    # 2. knovra.architecture
    resp = client.post(
        "/mcp/rpc",
        json={
            "jsonrpc": "2.0",
            "id": 102,
            "method": "tools/call",
            "params": {"name": "knovra.architecture", "arguments": {}},
        },
    )
    res = resp.json()["result"]
    assert not res["isError"]
    assert "ADR-001" in res["content"][0]["text"]

    # 3. knovra.dependencies
    resp = client.post(
        "/mcp/rpc",
        json={
            "jsonrpc": "2.0",
            "id": 103,
            "method": "tools/call",
            "params": {"name": "knovra.dependencies", "arguments": {}},
        },
    )
    res = resp.json()["result"]
    assert not res["isError"]
    assert "go.mod" in res["content"][0]["text"]

    # 4. knovra.record_decision
    resp = client.post(
        "/mcp/rpc",
        json={
            "jsonrpc": "2.0",
            "id": 104,
            "method": "tools/call",
            "params": {
                "name": "knovra.record_decision",
                "arguments": {
                    "id": "ADR-009",
                    "title": "Universal MCP Agent Gateway",
                    "status": "ACCEPTED",
                    "context": "Agent interoperability requirement",
                    "decision": "Support stdio and SSE MCP protocols",
                    "consequences": "Seamless IDE and agent agent access",
                },
            },
        },
    )
    res = resp.json()["result"]
    assert not res["isError"]
    assert "ADR-009" in res["content"][0]["text"]

    # 5. knovra.decisions
    resp = client.post(
        "/mcp/rpc",
        json={
            "jsonrpc": "2.0",
            "id": 105,
            "method": "tools/call",
            "params": {"name": "knovra.decisions", "arguments": {"query": "Universal"}},
        },
    )
    res = resp.json()["result"]
    assert not res["isError"]
    assert "ADR-009" in res["content"][0]["text"]

    # 6. knovra.rules
    resp = client.post(
        "/mcp/rpc",
        json={
            "jsonrpc": "2.0",
            "id": 106,
            "method": "tools/call",
            "params": {"name": "knovra.rules", "arguments": {"severity": "high"}},
        },
    )
    res = resp.json()["result"]
    assert not res["isError"]
    assert "R-001" in res["content"][0]["text"]

    # 7. knovra.remember
    resp = client.post(
        "/mcp/rpc",
        json={
            "jsonrpc": "2.0",
            "id": 107,
            "method": "tools/call",
            "params": {
                "name": "knovra.remember",
                "arguments": {
                    "text": "Always run cargo check and cargo test before committing Rust indexer changes",
                    "category": "rule",
                },
            },
        },
    )
    res = resp.json()["result"]
    assert not res["isError"]
    assert "Successfully remembered" in res["content"][0]["text"]

    # 8. knovra.history
    resp = client.post(
        "/mcp/rpc",
        json={
            "jsonrpc": "2.0",
            "id": 108,
            "method": "tools/call",
            "params": {"name": "knovra.history", "arguments": {"limit": 5}},
        },
    )
    res = resp.json()["result"]
    assert not res["isError"]
    assert "abcdef1" in res["content"][0]["text"]

    # 9. knovra.context
    resp = client.post(
        "/mcp/rpc",
        json={
            "jsonrpc": "2.0",
            "id": 109,
            "method": "tools/call",
            "params": {
                "name": "knovra.context",
                "arguments": {
                    "prompt": "Implement MCP agent gateway for Claude and Cursor",
                    "budget": 2000,
                    "format": "markdown",
                },
            },
        },
    )
    res = resp.json()["result"]
    assert not res["isError"]
    assert "CONTEXT BUNDLE" in res["content"][0]["text"]


def test_mcp_secret_redaction_invariant(client):
    """Verifies that secrets are scrubbed from MCP responses (Invariant #6)."""
    resp = client.post(
        "/mcp/rpc",
        json={
            "jsonrpc": "2.0",
            "id": 201,
            "method": "tools/call",
            "params": {
                "name": "knovra.remember",
                "arguments": {
                    "text": "The AWS production key is AKIAIOSFODNN7EXAMPLE and must not be leaked.",
                    "category": "insight",
                },
            },
        },
    )
    assert resp.status_code == 200
    res = resp.json()["result"]
    assert not res["isError"]
    # Ensure raw secret is NOT in output
    assert "AKIAIOSFODNN7EXAMPLE" not in res["content"][0]["text"]
    assert "[REDACTED_AWS_KEY]" in res["content"][0]["text"]


def test_mcp_error_handling(client):
    """Verifies structured errors for unknown methods or tools."""
    # Unknown method
    resp = client.post(
        "/mcp/rpc",
        json={
            "jsonrpc": "2.0",
            "id": 301,
            "method": "unknown/method",
            "params": {},
        },
    )
    data = resp.json()
    assert data["error"]["code"] == -32601

    # Unknown tool
    resp = client.post(
        "/mcp/rpc",
        json={
            "jsonrpc": "2.0",
            "id": 302,
            "method": "tools/call",
            "params": {"name": "knovra.nonexistent_tool", "arguments": {}},
        },
    )
    res = resp.json()["result"]
    assert res["isError"] is True
    assert "Unknown tool" in res["content"][0]["text"]
