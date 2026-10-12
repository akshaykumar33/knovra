"""Knovra Context Engine - Decision & Rule Memory Models (Phase 06).

Defines architectural decision records, supersession lineage,
and project rule governance models.
"""

from datetime import UTC, datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class DecisionStatus(str, Enum):
    PROPOSED = "proposed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    DEPRECATED = "deprecated"
    SUPERSEDED = "superseded"


class Alternative(BaseModel):
    name: str = Field(..., description="Name of alternative option considered")
    description: str = Field("", description="Summary of alternative")
    pros: list[str] = Field(default_factory=list, description="Advantages of alternative")
    cons: list[str] = Field(default_factory=list, description="Disadvantages of alternative")
    rejection_reason: str = Field("", description="Why this alternative was not selected")


class Decision(BaseModel):
    id: str = Field(..., description="Unique decision ID, e.g. adr-001")
    title: str = Field(..., description="Title of the architectural decision")
    description: str = Field("", description="Summary of what was decided")
    reason: str = Field(..., description="Problem context and rationale")
    alternatives: list[Alternative] = Field(default_factory=list, description="Alternatives evaluated")
    affected_entities: list[str] = Field(default_factory=list, description="Files, modules, symbols affected")
    created_by: str = Field("architect", description="Author or agent")
    confidence: float = Field(1.0, ge=0.0, le=1.0, description="Confidence level")
    status: DecisionStatus = Field(DecisionStatus.ACCEPTED, description="Current decision lifecycle status")
    source: str = Field("", description="Source file or provenance URI")
    created_at: str = Field(default_factory=lambda: datetime.now(UTC).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(UTC).isoformat())
    supersedes: str | None = Field(None, description="Prior decision ID that this replaces")
    superseded_by: str | None = Field(None, description="Newer decision ID that replaces this")
    metadata: dict[str, Any] = Field(default_factory=dict)


class DecisionLineageResponse(BaseModel):
    decision: Decision
    ancestors: list[Decision] = Field(default_factory=list, description="Chain of superseded older decisions")
    descendants: list[Decision] = Field(default_factory=list, description="Chain of superseding newer decisions")
    active_version: Decision = Field(..., description="The currently active decision in this lineage")


class RuleCategory(str, Enum):
    PROJECT = "project"
    ARCHITECTURE = "architecture"
    SECURITY = "security"
    CONVENTION = "convention"


class RuleSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class Rule(BaseModel):
    id: str = Field(..., description="Unique rule identifier")
    title: str = Field(..., description="Human-readable rule title")
    instruction: str = Field(..., description="Actionable constraint or rule statement")
    category: RuleCategory = Field(RuleCategory.PROJECT, description="Category of rule")
    severity: RuleSeverity = Field(RuleSeverity.HIGH, description="Severity of violation")
    scope: str = Field("*", description="Glob pattern or module scope where rule applies")
    rationale: str = Field("", description="Why this rule exists")
    source: str = Field("knovra.yaml", description="Origin of rule")
    enforcement: str = Field("strict", description="Enforcement level: strict, warning, advisory")


class RuleCheckRequest(BaseModel):
    file_paths: list[str] = Field(..., description="File paths to evaluate against rules")
    contents: dict[str, str] | None = Field(None, description="Optional map of file path to file content")


class RuleCheckViolation(BaseModel):
    rule_id: str
    rule_title: str
    severity: RuleSeverity
    file_path: str
    message: str


class RuleCheckResponse(BaseModel):
    total_rules_evaluated: int
    violations: list[RuleCheckViolation]
    passed: bool
