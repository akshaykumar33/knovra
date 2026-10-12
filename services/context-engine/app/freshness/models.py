"""Freshness and Incremental Indexing data models (Phase 11).

Supports the canonical 6 freshness attributes:
- created_at: initial ingestion timestamp
- updated_at: last modification timestamp
- valid_from: start of temporal validity
- valid_to: end of validity (None if currently valid)
- stale: boolean flag indicating if entity is superseded or invalidated
- superseded_by: entity/chunk ID that replaced this entity (None if active)
"""

from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field


class FreshnessMetadata(BaseModel):
    """Canonical freshness lifecycle tracking for any project intelligence entity."""

    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    valid_from: datetime = Field(default_factory=lambda: datetime.now(UTC))
    valid_to: datetime | None = None
    stale: bool = False
    superseded_by: str | None = None

    def invalidate(self, superseded_by: str | None = None) -> None:
        """Marks the entity as stale and seals its temporal validity window."""
        self.stale = True
        self.valid_to = datetime.now(UTC)
        self.updated_at = datetime.now(UTC)
        if superseded_by:
            self.superseded_by = superseded_by


class ChangedFileItem(BaseModel):
    """A file affected during incremental editing."""

    path: str
    content: str = ""
    doc_type: str = "code"
    metadata: dict[str, Any] = Field(default_factory=dict)


class DeltaIndexRequest(BaseModel):
    """Request payload for incremental delta indexing."""

    project_id: str = "knovra"
    repository_id: str = "knovra"
    modified_files: list[ChangedFileItem] = Field(default_factory=list)
    added_files: list[ChangedFileItem] = Field(default_factory=list)
    deleted_files: list[str] = Field(default_factory=list)
    invalidated_dependents: list[str] = Field(default_factory=list)


class DeltaIndexResponse(BaseModel):
    """Result of incremental delta indexing."""

    project_id: str
    indexed_chunks: int
    invalidated_chunks: int
    stale_dependents: list[str]
    duration_ms: float
    timestamp: str = Field(default_factory=lambda: datetime.now(UTC).isoformat())


class InvalidationRequest(BaseModel):
    """Explicit invalidation request for target files or symbols."""

    file_paths: list[str]
    reason: str | None = None


class FileFreshnessSummary(BaseModel):
    """Status summary of freshness for an indexed file."""

    file_path: str
    total_chunks: int
    active_chunks: int
    stale_chunks: int
    last_updated: str
    is_stale: bool
