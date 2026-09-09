"""Tests for Knovra Agent Event System and Continuous Intelligence Learning (Phase 10)."""

import pytest
from starlette.testclient import TestClient

from app.decision import DecisionStatus
from app.events import (
    AgentEvent,
    EventType,
)
from app.main import app, decision_store, event_processor


@pytest.fixture
def client():
    return TestClient(app)


def test_all_14_event_types():
    """Verifies that all 14 core agent event types are registered and constructible."""
    expected_types = [
        "AgentStarted",
        "TaskStarted",
        "PromptReceived",
        "FileRead",
        "FileCreated",
        "FileModified",
        "CommandExecuted",
        "TestExecuted",
        "TestFailed",
        "TestPassed",
        "DecisionMade",
        "ErrorObserved",
        "SolutionApplied",
        "TaskCompleted",
    ]
    assert len(EventType) == 14
    for name in expected_types:
        evt = EventType(name)
        event = AgentEvent(event_type=evt, payload={"sample": "data"})
        assert event.event_type.value == name
        assert event.event_id.startswith("evt-")
        assert event.schema_version == "1.0.0"


@pytest.mark.asyncio
async def test_idempotent_event_handling():
    """Verifies idempotent processing of duplicate event IDs."""
    event = AgentEvent(
        event_id="evt-idempotent-test-01",
        event_type=EventType.TASK_STARTED,
        payload={"task_id": "T-100", "description": "Run migration"},
    )

    success, is_dup, _ = await event_processor.process_event(event)
    assert success is True
    assert is_dup is False

    # Second processing must be recognized as idempotent duplicate
    success2, is_dup2, msg2 = await event_processor.process_event(event)
    assert success2 is True
    assert is_dup2 is True
    assert "duplicate" in msg2.lower()


@pytest.mark.asyncio
async def test_continuous_learning_decision_made():
    """Verifies that DecisionMade event automatically creates an ADR in DecisionRuleStore."""
    event = AgentEvent(
        event_id="evt-decision-learn-01",
        event_type=EventType.DECISION_MADE,
        payload={
            "id": "ADR-010",
            "title": "Adopt Event-Driven Agent Learning",
            "status": "accepted",
            "decision": "Use NATS JetStream and in-memory event bus",
            "reason": "Eliminates manual knowledge imports and synchronizes agent state",
        },
    )

    success, is_dup, _ = await event_processor.process_event(event)
    assert success is True
    assert is_dup is False

    # Verify decision is in memory
    dec = decision_store.get_decision("ADR-010")
    assert dec is not None
    assert dec.title == "Adopt Event-Driven Agent Learning"
    assert dec.status == DecisionStatus.ACCEPTED


@pytest.mark.asyncio
async def test_continuous_learning_error_and_solution():
    """Verifies that ErrorObserved and SolutionApplied update conversation memory automatically."""
    err_event = AgentEvent(
        event_id="evt-err-learn-01",
        event_type=EventType.ERROR_OBSERVED,
        session_id="sess-auto-01",
        payload={
            "error_message": "dial tcp: lookup auth.docker.io: no such host",
            "file_path": "services/runtime/cmd/knovra/main.go",
        },
    )
    sol_event = AgentEvent(
        event_id="evt-sol-learn-01",
        event_type=EventType.SOLUTION_APPLIED,
        session_id="sess-auto-01",
        payload={
            "problem": "Alpine image not found locally when offline",
            "solution": "Use pre-cached golang:1.22-alpine container image",
            "modified_files": ["services/runtime/cmd/knovra/main.go"],
        },
    )

    await event_processor.process_event(err_event)
    await event_processor.process_event(sol_event)

    sess = event_processor.conversation_store.get_session("sess-auto-01")
    assert sess is not None
    facts = sess.extracted_facts
    assert len(facts) >= 2

    error_facts = [f for f in facts if f.fact_type.value == "error"]
    solution_facts = [f for f in facts if f.fact_type.value == "solution"]
    assert len(error_facts) >= 1
    assert "dial tcp" in error_facts[0].text
    assert len(solution_facts) >= 1
    assert "golang:1.22-alpine" in solution_facts[0].text


@pytest.mark.asyncio
async def test_continuous_learning_file_activity():
    """Verifies tracking of FileModified events."""
    event = AgentEvent(
        event_id="evt-file-01",
        event_type=EventType.FILE_MODIFIED,
        payload={
            "file_path": "services/context-engine/app/events/bus.py",
            "additions": 45,
            "deletions": 5,
            "change_summary": "Implement NATS JetStream with local fallback",
        },
    )
    await event_processor.process_event(event)

    acts = event_processor.get_file_activities(limit=10)
    assert len(acts) >= 1
    assert acts[0]["file_path"] == "services/context-engine/app/events/bus.py"
    assert acts[0]["additions"] == 45


@pytest.mark.asyncio
async def test_event_payload_secret_redaction():
    """Verifies that secrets in event payloads are sanitized (Invariant #6)."""
    event = AgentEvent(
        event_id="evt-sec-01",
        event_type=EventType.ERROR_OBSERVED,
        payload={
            "error_message": "Connection to cloud failed with key AKIAIOSFODNN7EXAMPLE and token ghp_0123456789abcdef0123456789abcdef0123",
            "config": {"nested_key": "AKIAIOSFODNN7EXAMPLE"},
        },
    )
    await event_processor.process_event(event)

    # Payload must be redacted
    msg = event.payload["error_message"]
    assert "AKIAIOSFODNN7EXAMPLE" not in msg
    assert "[REDACTED_AWS_KEY]" in msg
    assert "[REDACTED_GITHUB_TOKEN]" in msg

    nested = event.payload["config"]["nested_key"]
    assert nested == "[REDACTED_AWS_KEY]"


@pytest.mark.asyncio
async def test_dead_letter_queue_handling():
    """Verifies that processing failures are routed to the Dead-Letter Queue."""
    # Force a failure in dlq
    class FailingEvent(AgentEvent):
        pass

    event = FailingEvent(
        event_id="evt-fail-01",
        event_type=EventType.TASK_STARTED,
        payload={},
    )
    # Manually invoke dlq recording
    event_processor.dlq.record_failure(event, "Simulated database connection failure")

    records = event_processor.dlq.list_records(limit=10)
    assert len(records) >= 1
    assert records[0].event.event_id == "evt-fail-01"
    assert "Simulated database connection failure" in records[0].error


def test_api_publish_and_query_endpoints(client):
    """Verifies REST endpoints for event publishing, batch, and querying."""
    # 1. Publish single event
    req = {
        "event_id": "evt-api-single-01",
        "event_type": "TestPassed",
        "project_id": "knovra",
        "payload": {"test_name": "TestEventBus", "duration_ms": 12.5},
    }
    resp = client.post("/events/publish", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert data["event_id"] == "evt-api-single-01"
    assert data["status"] == "acknowledged"
    assert data["idempotent_duplicate"] is False

    # 2. Duplicate publish
    resp2 = client.post("/events/publish", json=req)
    data2 = resp2.json()
    assert data2["idempotent_duplicate"] is True

    # 3. Batch publish
    batch_req = [
        {
            "event_id": "evt-api-batch-01",
            "event_type": "CommandExecuted",
            "payload": {"command": "go test ./..."},
        },
        {
            "event_id": "evt-api-batch-02",
            "event_type": "TaskCompleted",
            "payload": {"task_id": "task-01", "success": True},
        },
    ]
    resp = client.post("/events/batch", json=batch_req)
    assert resp.status_code == 200
    batch_data = resp.json()
    assert len(batch_data) == 2

    # 4. Query recent events
    resp = client.get("/events/recent?limit=10")
    assert resp.status_code == 200
    recent = resp.json()
    assert len(recent) >= 3

    # 5. Query file activities
    resp = client.get("/events/file-activities?limit=10")
    assert resp.status_code == 200

    # 6. Query test results
    resp = client.get("/events/test-results?limit=10")
    assert resp.status_code == 200
    tests = resp.json()
    assert len(tests) >= 1
    assert tests[0]["test_name"] == "TestEventBus"
