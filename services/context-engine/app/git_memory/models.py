"""Domain models for Git version history, commits, file modifications, and lineage traces."""

from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator


class FileChange(BaseModel):
    path: str = Field(..., description="Repository relative file path")
    status: str = Field("modified", description="added, modified, deleted, renamed")
    additions: int = Field(0, ge=0, description="Lines added")
    deletions: int = Field(0, ge=0, description="Lines removed")
    old_path: str | None = Field(None, description="Previous file path if renamed")
    patch: str | None = Field(None, description="Diff chunk or patch summary if captured")


class GitCommit(BaseModel):
    hash: str = Field(..., description="Full 40-character SHA-1/SHA-256 commit hash")
    short_hash: str = Field(..., description="7-character commit prefix")
    author_name: str = Field(..., description="Author display name")
    author_email: str = Field(..., description="Author email address")
    date: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="Author date in UTC",
    )
    subject: str = Field(..., description="First line commit message")
    body: str = Field("", description="Full commit explanation body")
    parents: list[str] = Field(default_factory=list, description="Parent commit hashes")
    changed_files: list[FileChange] = Field(default_factory=list, description="Files modified by commit")
    linked_decisions: list[str] = Field(default_factory=list, description="Referenced ADR IDs (e.g. adr-001)")
    pr_references: list[str] = Field(default_factory=list, description="Referenced PR or issue numbers")

    @field_validator("parents", "changed_files", "linked_decisions", "pr_references", mode="before")
    @classmethod
    def null_to_list_commit(cls, v: Any) -> Any:
        return v if v is not None else []


class GitBranch(BaseModel):
    name: str = Field(..., description="Branch name (e.g. main, develop)")
    commit_hash: str = Field(..., description="Commit hash pointer")
    is_head: bool = Field(False, description="Whether this branch is currently checked out HEAD")


class GitTag(BaseModel):
    name: str = Field(..., description="Tag name (e.g. v0.0.0)")
    commit_hash: str = Field(..., description="Target commit hash")
    tagger: str | None = Field(None, description="Tagger identity")
    message: str | None = Field(None, description="Tag annotation message")


class GitHistoryPayload(BaseModel):
    project_id: str = Field("default", description="Associated project ID")
    repository_id: str = Field("default", description="Associated repository ID")
    commits: list[GitCommit] = Field(default_factory=list, description="List of commit records")
    branches: list[GitBranch] = Field(default_factory=list, description="Branch heads")
    tags: list[GitTag] = Field(default_factory=list, description="Tags")

    @field_validator("commits", "branches", "tags", mode="before")
    @classmethod
    def null_to_list_payload(cls, v: Any) -> Any:
        return v if v is not None else []


class IngestGitResponse(BaseModel):
    commits_ingested: int
    branches_ingested: int
    tags_ingested: int
    decisions_linked: dict[str, list[str]] = Field(default_factory=dict)


class LineageTraceResult(BaseModel):
    query_type: str = Field(..., description="'decision' or 'file'")
    query_target: str = Field(..., description="Target ID or path")
    decision_id: str | None = Field(None, description="Matched decision ID")
    decision_title: str | None = Field(None, description="Matched decision title")
    decision_status: str | None = Field(None, description="Matched decision status")
    commits: list[GitCommit] = Field(default_factory=list, description="Linked Git commits")
    modified_files: list[str] = Field(default_factory=list, description="Associated modified files")
    conversations: list[dict[str, Any]] = Field(default_factory=list, description="Linked conversation sessions")
