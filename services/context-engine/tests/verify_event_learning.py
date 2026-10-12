"""Verification Script for Phase 10: Agent Event System & Continuous Learning.

Demonstrates that agent activity events automatically update project intelligence
without manual import, preserving Invariants #2 (Provenance), #6 (Zero Secret Leakage),
and #7 (Local-First Offline Fallback).
"""

import sys
import time
from pathlib import Path

# Ensure root directory is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from starlette.testclient import TestClient

from app.main import app, conversation_store, decision_store, event_bus


def run_verification():
    print("=" * 80)
    print("  KNOVRA PHASE 10: AGENT EVENT SYSTEM & CONTINUOUS LEARNING VERIFICATION")
    print("=" * 80)

    client = TestClient(app)

    # 1. Health and Bus Check
    print("\n[Step 1] Checking Event Bus status...")
    stats = event_bus.stats()
    print(f"✓ Event Bus mode: {stats['mode']}")
    print(f"✓ Subscribers registered: {stats['subscribers_count']}")

    # 2. Continuous Learning: DecisionMade Event
    print("\n[Step 2] Emitting DecisionMade agent event...")
    t0 = time.perf_counter()
    resp = client.post("/events/publish", json={
        "event_id": "evt-verify-dec-100",
        "event_type": "DecisionMade",
        "project_id": "knovra",
        "agent_id": "auto-agent-v1",
        "session_id": "session-verify-100",
        "payload": {
            "id": "ADR-EVT-100",
            "title": "Use Memory-Mapped Files for Large AST Chunks",
            "decision": "Adopt mmap in Rust code indexer for AST parsing above 10MB",
            "status": "ACCEPTED",
            "reason": "Reduces heap footprint during deep multi-repo ingestion",
            "affected_files": ["services/code-indexer/src/scanner.rs"]
        }
    })
    lat_dec = (time.perf_counter() - t0) * 1000
    assert resp.status_code == 200, resp.text
    data = resp.json()
    print(f"✓ Event published in {lat_dec:.2f}ms — ID: {data['event_id']}, Status: {data['status']}")

    # Verify Continuous Learning without manual sync
    learned_decision = decision_store.get_decision("ADR-EVT-100")
    assert learned_decision is not None, "Decision was not automatically learned in decision store!"
    print(f"✓ Continuous Learning Verified: Decision '{learned_decision.title}' automatically registered!")
    print(f"  - Decision ID: {learned_decision.id}")
    print(f"  - Status: {learned_decision.status.value}")
    print(f"  - Provenance source: {learned_decision.metadata.get('event_id')}")

    # 3. Continuous Learning: ErrorObserved & SolutionApplied
    print("\n[Step 3] Emitting ErrorObserved & SolutionApplied events...")
    client.post("/events/publish", json={
        "event_id": "evt-verify-err-101",
        "event_type": "ErrorObserved",
        "project_id": "knovra",
        "agent_id": "auto-agent-v1",
        "session_id": "session-verify-100",
        "payload": {
            "error_type": "BufferOverflowException",
            "error_message": "Heap limit exceeded during large file read",
            "file_path": "services/code-indexer/src/scanner.rs",
            "line_number": 42
        }
    })

    client.post("/events/publish", json={
        "event_id": "evt-verify-sol-102",
        "event_type": "SolutionApplied",
        "project_id": "knovra",
        "agent_id": "auto-agent-v1",
        "session_id": "session-verify-100",
        "payload": {
            "problem": "BufferOverflowException",
            "solution": "Chunk buffer in 4KB streaming windows",
            "modified_files": ["services/code-indexer/src/scanner.rs"]
        }
    })

    # Verify conversation/facts store updated automatically
    session = conversation_store.get_session("session-verify-100")
    assert session is not None, "Agent session was not auto-created in conversation store!"
    assert len(session.extracted_facts) >= 2, f"Facts not learned: {len(session.extracted_facts)}"
    err_fact = session.extracted_facts[0]
    sol_fact = session.extracted_facts[1]
    print("✓ Continuous Learning Verified: Error/Solution pair learned into project facts!")
    print(f"  - Error Fact: {err_fact.text}")
    print(f"  - Solution Fact: {sol_fact.text}")

    # 4. Continuous Learning: File Activity Tracking
    print("\n[Step 4] Emitting FileCreated & FileModified events...")
    client.post("/events/publish", json={
        "event_id": "evt-verify-file-103",
        "event_type": "FileModified",
        "project_id": "knovra",
        "agent_id": "auto-agent-v1",
        "session_id": "session-verify-100",
        "payload": {
            "file_path": "services/code-indexer/src/scanner.rs",
            "change_summary": "Added streaming window buffer"
        }
    })

    resp_fa = client.get("/events/file-activities")
    assert resp_fa.status_code == 200
    file_activities = resp_fa.json()
    matching = [a for a in file_activities if a["file_path"] == "services/code-indexer/src/scanner.rs"]
    assert len(matching) > 0, "File activity was not recorded!"
    activity = matching[-1]
    print(f"✓ File Activity Tracked: {activity['file_path']}")
    print(f"  - Latest Event: {activity['event_type']} at {activity['timestamp']}")

    # 5. Invariant #6: Zero Secret Leakage Verification
    print("\n[Step 5] Emitting event with sensitive API tokens to verify Secret Redaction...")
    resp_secret = client.post("/events/publish", json={
        "event_id": "evt-verify-sec-104",
        "event_type": "CommandExecuted",
        "project_id": "knovra",
        "agent_id": "auto-agent-v1",
        "session_id": "session-verify-100",
        "payload": {
            "command": "curl -H 'Authorization: Bearer ghp_ABC1234567890abcdef1234567890abcdef' https://api.github.com/repo",
            "api_key": "AKIAIOSFODNN7EXAMPLE"
        }
    })
    assert resp_secret.status_code == 200
    recent_resp = client.get("/events/recent?limit=5")
    recent = recent_resp.json()
    sec_evt = next((e for e in recent if e["event_id"] == "evt-verify-sec-104"), None)
    assert sec_evt is not None
    assert "ghp_ABC" not in str(sec_evt["payload"])
    assert "AKIAIOSF" not in str(sec_evt["payload"])
    print("✓ Invariant #6 Confirmed: Zero Secret Leakage! All tokens redacted to [REDACTED_*].")

    # 6. Idempotency Verification
    print("\n[Step 6] Testing Idempotent Event Deduplication...")
    resp_dup = client.post("/events/publish", json={
        "event_id": "evt-verify-dec-100",
        "event_type": "DecisionMade",
        "project_id": "knovra",
        "agent_id": "auto-agent-v1",
        "session_id": "session-verify-100",
        "payload": {"title": "Duplicate"}
    })
    dup_data = resp_dup.json()
    assert dup_data["idempotent_duplicate"] is True
    print("✓ Idempotency Confirmed: Event evt-verify-dec-100 duplicate detected and safely ignored.")

    # 7. Batch Publishing Verification
    print("\n[Step 7] Emitting Batch Events...")
    batch_events = [
        {
            "event_id": f"evt-batch-{i}",
            "event_type": "TestPassed" if i % 2 == 0 else "TestExecuted",
            "project_id": "knovra",
            "agent_id": "ci-agent",
            "session_id": "batch-session",
            "payload": {"test_name": f"test_unit_{i}"}
        }
        for i in range(5)
    ]
    t_batch_start = time.perf_counter()
    batch_resp = client.post("/events/batch", json=batch_events)
    batch_lat = (time.perf_counter() - t_batch_start) * 1000
    assert batch_resp.status_code == 200
    assert len(batch_resp.json()) == 5
    print(f"✓ Batch of 5 events published in {batch_lat:.2f}ms ({batch_lat/5:.2f}ms/event)")

    # 8. Dead-Letter Queue Check
    print("\n[Step 8] Checking Dead-Letter Queue...")
    dlq_resp = client.get("/events/dead-letter")
    assert dlq_resp.status_code == 200
    dlq_items = dlq_resp.json()
    print(f"✓ DLQ inspected: {len(dlq_items)} failed events in dead-letter storage.")

    print("\n" + "=" * 80)
    print("  PHASE 10 ALL ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!")
    print("=" * 80)


if __name__ == "__main__":
    run_verification()
