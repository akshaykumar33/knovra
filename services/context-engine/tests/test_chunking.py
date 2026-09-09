import pytest
from app.chunking.chunker import Chunker
from app.models import DocType, DocumentInput, Provenance
from app.security.redactor import redact_secrets


def test_secret_redaction():
    raw = (
        "Project config: AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE "
        "and GITHUB_TOKEN=ghp_0123456789abcdef0123456789abcdef0123 "
        "and password='SuperSecretPassword123!'"
    )
    sanitized, count = redact_secrets(raw)
    assert count >= 3
    assert "AKIAIOSFODNN7EXAMPLE" not in sanitized
    assert "ghp_0123456789" not in sanitized
    assert "SuperSecretPassword123!" not in sanitized
    assert "[REDACTED_AWS_KEY]" in sanitized
    assert "[REDACTED_GITHUB_TOKEN]" in sanitized
    assert "[REDACTED_PASSWORD]" in sanitized


def test_single_chunk_document():
    chunker = Chunker(max_chunk_chars=500, overlap_chars=50)
    doc = DocumentInput(
        document_id="doc-001",
        project_id="knovra-core",
        repository_id="knovra",
        doc_type=DocType.DOCUMENT,
        title="Introduction",
        content="# Overview\nThis is a short document introducing Knovra.",
        provenance=Provenance(
            file_path="docs/README.md",
            byte_start=0,
            byte_end=55,
            line_start=1,
            line_end=2,
            content_hash="abc123hash",
        ),
    )

    chunks = chunker.chunk_document(doc)
    assert len(chunks) == 1
    chunk = chunks[0]
    assert chunk.document_id == "doc-001"
    assert chunk.chunk_index == 0
    assert chunk.total_chunks == 1
    assert chunk.chunk_id.startswith("doc-001:0:")
    assert chunk.provenance.file_path == "docs/README.md"
    assert chunk.provenance.line_start == 1


def test_multi_chunk_markdown_splitting():
    chunker = Chunker(max_chunk_chars=120, overlap_chars=20)
    content = (
        "# Section 1\nThis is the first section explaining architectural concepts in detail.\n\n"
        "# Section 2\nThis is the second section explaining storage layer choices and invariants.\n\n"
        "# Section 3\nThis is the third section explaining AI context planning and retrieval."
    )
    doc = DocumentInput(
        document_id="doc-002",
        project_id="knovra-core",
        repository_id="knovra",
        doc_type=DocType.DOCUMENT,
        title="Architecture Guide",
        content=content,
        provenance=Provenance(
            file_path="docs/ARCHITECTURE.md",
            content_hash="archhash999",
        ),
    )

    chunks = chunker.chunk_document(doc)
    assert len(chunks) >= 3
    assert chunks[0].total_chunks == len(chunks)
    for idx, c in enumerate(chunks):
        assert c.chunk_index == idx
        assert c.chunk_id.startswith(f"doc-002:{idx}:")
        assert c.provenance.content_hash != ""
