"""Domain models and schemas for Knovra Agent Event System (Phase 10)."""

import uuid
from datetime import UTC, datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class EventType(str, Enum):
    """The 14 core agent activity event types as specified in Phase 10."""

    AGENT_STARTED = "AgentStarted"
    TASK_STARTED = "TaskStarted"
    PROMPT_RECEIVED = "PromptReceived"
    FILE_READ = "FileRead"
    FILE_CREATED = "FileCreated"
    FILE_MODIFIED = "FileModified"
    COMMAND_EXECUTED = "CommandExecuted"
    TEST_EXECUTED = "TestExecuted"
    TEST_FAILED = "TestFailed"
    TEST_PASSED = "TestPassed"
    DECISION_MADE = "DecisionMade"
    ERROR_OBSERVED = "ErrorObserved"
    SOLUTION_APPLIED = "SolutionApplied"
    TASK_COMPLETED = "TaskCompleted"


class AgentEvent(BaseModel):
    """Standardized event envelope for all agent activity streams."""

    event_id: str = Field(
        default_factory=lambda: f"evt-{uuid.uuid4().hex[:16]}",
        description="Globally unique event identifier for idempotency deduplication",
    )
    event_type: EventType = Field(..., description="Type of agent event")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="Event creation timestamp in UTC",
    )
    project_id: str = Field("knovra", description="Project workspace identifier")
    agent_id: str = Field("agent-default", description="Identifier of the emitting agent")
    session_id: str = Field("sess-default", description="Correlation session ID")
    schema_version: str = Field("1.0.0", description="Event schema version")
    payload: dict[str, Any] = Field(default_factory=dict, description="Event-specific payload")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Contextual tags or telemetry")


class DecisionMadePayload(BaseModel):
    """Payload for DecisionMade event."""

    id: str = Field(..., description="ADR identifier (e.g. ADR-010)")
    title: str = Field(..., description="Title of the architectural decision")
    status: str = Field("accepted", description="Status: proposed, accepted, superseded")
    decision: str = Field(..., description="What was decided")
    reason: str = Field(..., description="Context and rationale")
    supersedes: str | None = Field(None, description="Superseded ADR ID if applicable")


class ErrorObservedPayload(BaseModel):
    """Payload for ErrorObserved event."""

    error_message: str = Field(..., description="Observed error string or symptom")
    stack_trace: str = Field("", description="Optional stack trace or compiler output")
    file_path: str = Field("", description="Source file associated with error")
    line_number: int | None = Field(None, description="Line number if known")


class SolutionAppliedPayload(BaseModel):
    """Payload for SolutionApplied event."""

    problem: str = Field(..., description="Problem description or resolved error")
    solution: str = Field(..., description="Solution applied or explanation")
    modified_files: list[str] = Field(default_factory=list, description="Files changed to fix problem")


class FileModifiedPayload(BaseModel):
    """Payload for FileModified event."""

    file_path: str = Field(..., description="Relative file path modified")
    additions: int = Field(0, ge=0, description="Lines added")
    deletions: int = Field(0, ge=0, description="Lines deleted")
    change_summary: str = Field("", description="Summary of changes")


class TestExecutedPayload(BaseModel):
    """Payload for TestExecuted, TestPassed, or TestFailed events."""

    test_name: str = Field(..., description="Name of the test suite or case")
    status: str = Field("passed", description="Status: passed, failed, skipped")
    duration_ms: float = Field(0.0, ge=0.0, description="Execution duration in milliseconds")
    error_message: str = Field("", description="Failure reason if failed")


class PublishEventResponse(BaseModel):
    """API response acknowledging published event."""

    event_id: str
    status: str
    idempotent_duplicate: bool = False
    processed_at: str
