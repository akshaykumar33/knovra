"""Knovra Context Engine - Data Models for Semantic Memory (Phase 05).

Defines document inputs, chunk entities, search parameters, and provenance invariants.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DocType(str, Enum):
    DOCUMENT = "doc"
    CODE_SUMMARY = "code_summary"
    MODULE_SUMMARY = "module_summary"
    DECISION = "decision"
    REQUIREMENT = "requirement"
    ISSUE = "issue"
    CONVERSATION = "conversation"
    ERROR_SOLUTION = "error_solution"


class Provenance(BaseModel):
    file_path: str = Field(..., description="Relative or repository file path")
    byte_start: Optional[int] = Field(None, description="Starting byte offset in source file")
    byte_end: Optional[int] = Field(None, description="Ending byte offset in source file")
    line_start: Optional[int] = Field(None, description="Starting line number (1-indexed)")
    line_end: Optional[int] = Field(None, description="Ending line number (1-indexed)")
    content_hash: str = Field(..., description="SHA-256 hash of original source content")
    repo_name: Optional[str] = Field("knovra", description="Repository name")


class DocumentInput(BaseModel):
    document_id: str = Field(..., description="Unique document identifier")
    project_id: str = Field("default", description="Project identifier")
    repository_id: str = Field("default", description="Repository identifier")
    doc_type: DocType = Field(..., description="Type of document")
    title: str = Field(..., description="Title or summary label")
    content: str = Field(..., description="Raw text or markdown content")
    provenance: Provenance = Field(..., description="Mandatory provenance information")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Arbitrary additional metadata")


class Chunk(BaseModel):
    chunk_id: str = Field(..., description="Deterministic chunk identifier: <doc_id>:<chunk_idx>:<hash>")
    document_id: str = Field(..., description="Parent document identifier")
    project_id: str = Field("default", description="Project identifier")
    repository_id: str = Field("default", description="Repository identifier")
    doc_type: DocType = Field(..., description="Type of document")
    title: str = Field(..., description="Title or chunk header")
    content: str = Field(..., description="Chunk text content")
    chunk_index: int = Field(..., description="0-indexed position in parent document")
    total_chunks: int = Field(..., description="Total chunks in parent document")
    provenance: Provenance = Field(..., description="Source provenance with byte/line offsets")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata dictionary")
    embedding: Optional[List[float]] = Field(None, description="Vector embedding representation")
    model_name: Optional[str] = Field(None, description="Name and version of embedding model used")


class SearchQuery(BaseModel):
    query: str = Field(..., min_length=1, description="Natural-language search query")
    project_id: Optional[str] = Field(None, description="Filter by project ID")
    repository_id: Optional[str] = Field(None, description="Filter by repository ID")
    doc_types: Optional[List[DocType]] = Field(None, description="Filter by specific document types")
    top_k: int = Field(10, ge=1, le=100, description="Maximum number of results to return")
    min_score: float = Field(0.0, ge=0.0, le=1.0, description="Minimum cosine similarity threshold")


class SearchResult(BaseModel):
    chunk_id: str
    document_id: str
    score: float = Field(..., description="Cosine similarity score between 0.0 and 1.0")
    doc_type: DocType
    title: str
    content: str
    provenance: Provenance
    metadata: Dict[str, Any] = Field(default_factory=dict)
    model_name: Optional[str] = None


class IndexBatchRequest(BaseModel):
    documents: List[DocumentInput] = Field(..., min_length=1, description="List of documents to chunk and index")
    reembed: bool = Field(False, description="Whether to re-embed if document already exists")


class IndexBatchResponse(BaseModel):
    indexed_documents: int
    indexed_chunks: int
    doc_types: Dict[str, int]
    model_name: str
    elapsed_ms: float


class SemanticStats(BaseModel):
    total_documents: int
    total_chunks: int
    by_doc_type: Dict[str, int]
    embedding_model: str
    vector_dimension: int
    storage_backend: str
