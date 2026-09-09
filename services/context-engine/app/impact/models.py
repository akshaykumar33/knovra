"""Data models for Knovra Impact Analysis Engine (Phase 12)."""

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ImpactTargetType(str, Enum):
    """Target entity types analyzable for change impact."""
    FILE = "file"
    FUNCTION = "function"
    CLASS = "class"
    MODULE = "module"
    DB_TABLE = "db_table"
    API_ENDPOINT = "api_endpoint"
    SERVICE = "service"


class ImpactType(str, Enum):
    """Depth classification of impact."""
    DIRECT = "direct"
    TRANSITIVE = "transitive"


class ImpactEdgeType(str, Enum):
    """Semantic relationship edge in the dependency graph."""
    IMPORTS = "imports"
    CALLS = "calls"
    TESTS = "tests"
    DB_RELATION = "db_relation"
    API_CONSUMER = "api_consumer"
    GOVERNED_BY = "governed_by"
    MODIFIED_BY = "modified_by"


class ImpactNode(BaseModel):
    """An entity impacted by changes to the target."""
    name: str
    target_type: ImpactTargetType
    impact_type: ImpactType
    distance: int = 1
    confidence: float = 1.0
    reason: str
    critical: bool = False
    provenance: dict[str, Any] = Field(default_factory=dict)


class CriticalPath(BaseModel):
    """A high-risk dependency chain connecting target to critical boundaries."""
    path: list[str]
    risk_level: str = "high"  # "critical", "high", "medium", "low"
    description: str


class TestRecommendation(BaseModel):
    """A recommended test to run to validate changes against regressions."""
    test_file: str
    test_name: str | None = None
    target_file: str
    priority: str = "high"  # "critical", "high", "medium", "low"
    reason: str


class RelatedDecisionImpact(BaseModel):
    """An Architectural Decision Record (ADR) or Rule governing the impacted surface."""
    decision_id: str
    title: str
    status: str
    reason: str
    rules: list[dict[str, Any]] = Field(default_factory=list)


class ImpactAnalysisRequest(BaseModel):
    """Request payload for impact analysis."""
    target: str
    target_type: ImpactTargetType | None = None
    max_depth: int = Field(default=3, ge=1, le=10)
    include_transitive: bool = True
    include_tests: bool = True
    include_decisions: bool = True
    include_commits: bool = True


class ImpactAnalysisResponse(BaseModel):
    """Structured, explainable, graph-backed impact analysis result."""
    target: str
    target_type: ImpactTargetType
    direct_impacts: list[ImpactNode] = Field(default_factory=list)
    transitive_impacts: list[ImpactNode] = Field(default_factory=list)
    total_impacted: int = 0
    confidence_score: float = 1.0
    critical_paths: list[CriticalPath] = Field(default_factory=list)
    tests_to_run: list[TestRecommendation] = Field(default_factory=list)
    related_decisions: list[RelatedDecisionImpact] = Field(default_factory=list)
    recent_commits: list[dict[str, Any]] = Field(default_factory=list)
    graph_backed: bool = True
    explanation: str = ""
    execution_time_ms: float = 0.0
