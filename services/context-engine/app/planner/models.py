"""Data models for task classification, context budgeting, and ContextBundle output."""

from datetime import UTC, datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator


class TaskType(str, Enum):
    BUGFIX = "bugfix"
    FEATURE = "feature"
    REFACTOR = "refactor"
    ARCHITECTURE = "architecture"
    CODE_REVIEW = "code_review"
    GENERAL = "general"


class TokenBudgetConfig(BaseModel):
    max_tokens: int = Field(4000, ge=500, le=64000, description="Hard token ceiling for bundle")
    reserve_tokens: int = Field(200, ge=0, description="Tokens reserved for prompt framing")


class ContextItem(BaseModel):
    category: str = Field(..., description="Category (rule, file, symbol, decision, error_solution, commit, conversation)")
    title: str = Field(..., description="Short descriptive label")
    content: str = Field(..., description="Synthesized text or snippet content")
    relevance_score: float = Field(..., ge=0.0, description="Composite ranking score")
    token_count: int = Field(0, ge=0, description="Estimated token size")
    provenance: dict[str, Any] = Field(default_factory=dict, description="File path, lines, hash, or commit")


class ContextBundle(BaseModel):
    task: str = Field(..., description="Original user or agent task description")
    task_type: TaskType = Field(TaskType.GENERAL, description="Detected or specified task classification")
    project_summary: str = Field("", description="High-level project monorepo summary")
    architecture: list[str] = Field(default_factory=list, description="Core architectural patterns and stacks")
    rules: list[dict[str, Any]] = Field(default_factory=list, description="Applicable governance rules")
    files: list[dict[str, Any]] = Field(default_factory=list, description="Key files and code snippets")
    symbols: list[dict[str, Any]] = Field(default_factory=list, description="Relevant AST symbols and signatures")
    dependencies: list[str] = Field(default_factory=list, description="Call graph and import dependencies")
    decisions: list[dict[str, Any]] = Field(default_factory=list, description="Relevant ADR decisions and status")
    prior_errors_solutions: list[dict[str, Any]] = Field(default_factory=list, description="Past errors and fixes")
    recent_changes: list[dict[str, Any]] = Field(default_factory=list, description="Recent relevant Git commits")
    relevant_conversations: list[dict[str, Any]] = Field(default_factory=list, description="Past discussions")
    provenance: list[dict[str, Any]] = Field(default_factory=list, description="Traceability audit trail")
    freshness: str = Field("fresh", description="Freshness status indicator")
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC), description="Generation timestamp in UTC")
    token_usage: dict[str, int] = Field(default_factory=dict, description="Token consumption per category")
    total_tokens: int = Field(0, description="Total estimated tokens used in bundle")


class ContextPlanRequest(BaseModel):
    prompt: str = Field(..., min_length=3, description="Task prompt or user query")
    task_type: TaskType | None = Field(None, description="Optional override for task classification")
    max_tokens: int = Field(4000, ge=500, le=32000, description="Maximum token budget for context bundle")
    file_hints: list[str] = Field(default_factory=list, description="Known file paths or modules to prioritize")
    project_id: str = Field("knovra", description="Project identifier")

    @field_validator("file_hints", mode="before")
    @classmethod
    def null_to_list(cls, v: Any) -> Any:
        return v if v is not None else []


class ContextPlanResponse(BaseModel):
    bundle: ContextBundle
    markdown_prompt: str = Field(..., description="Prompt-ready markdown context for LLM consumption")
