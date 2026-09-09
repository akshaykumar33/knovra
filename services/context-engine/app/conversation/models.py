"""Domain models for conversation transcripts, messages, and extracted intelligence."""

from datetime import UTC, datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class MessageRole(str, Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"


class FactType(str, Enum):
    ENTITY = "entity"
    DECISION = "decision"
    REQUIREMENT = "requirement"
    ERROR = "error"
    SOLUTION = "solution"
    SUMMARY = "summary"


class Message(BaseModel):
    id: str = Field(..., description="Unique message identifier")
    role: MessageRole = Field(..., description="Role of the message sender")
    content: str = Field(..., description="Redacted text content of the message")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="Message timestamp in UTC",
    )
    metadata: dict[str, Any] = Field(default_factory=dict, description="Metadata flags or context")
    tool_calls: list[dict[str, Any]] = Field(default_factory=list, description="Tool invocations if any")


class ExtractedFact(BaseModel):
    id: str = Field(..., description="Unique fact ID")
    session_id: str = Field(..., description="Parent conversation session ID")
    message_id: str | None = Field(None, description="Source message ID if localized")
    fact_type: FactType = Field(..., description="Category of the extracted fact")
    text: str = Field(..., description="Extracted statement or description")
    confidence: float = Field(1.0, ge=0.0, le=1.0, description="Extraction confidence score")
    related_entities: list[str] = Field(default_factory=list, description="Extracted entity names or symbols")
    related_decisions: list[str] = Field(default_factory=list, description="Mentioned ADR or decision IDs")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Provenance and parsing context")


class ConversationSession(BaseModel):
    id: str = Field(..., description="Unique session ID")
    title: str = Field(..., description="Human-readable title or topic of conversation")
    source_format: str = Field("generic", description="Transcript format (claude_code, chatgpt, codex, generic)")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="Session creation timestamp",
    )
    messages: list[Message] = Field(default_factory=list, description="Chronological message sequence")
    extracted_facts: list[ExtractedFact] = Field(default_factory=list, description="Extracted intelligence")
    summary: str = Field("", description="Condensed summary of the conversation")
    raw_source_path: str | None = Field(None, description="Path to raw source file if preserved")


class IngestConversationRequest(BaseModel):
    title: str | None = Field(None, description="Optional title")
    format: str = Field("generic", description="Format: generic, claude_code, chatgpt, codex")
    content: str | dict[str, Any] | list[Any] = Field(..., description="Raw transcript text or JSON structure")
    project_id: str = Field("default", description="Associated project ID")
    session_id: str | None = Field(None, description="Explicit session ID if known")


class IngestConversationResponse(BaseModel):
    session_id: str
    title: str
    message_count: int
    fact_counts: dict[str, int]
    decisions_detected: list[str]
    indexed_into_semantic_memory: bool
