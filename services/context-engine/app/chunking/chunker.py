"""Knovra Context Engine - Document and Code Chunking Engine.

Implements deterministic chunking, provenance calculation, and deduplication
for natural-language docs, markdown files, and code symbol summaries.
"""

import hashlib
import re
from typing import List

from app.models import Chunk, DocType, DocumentInput, Provenance
from app.security.redactor import redact_secrets


class Chunker:
    """Configurable chunker supporting markdown, natural language, and code summaries."""

    def __init__(self, max_chunk_chars: int = 1200, overlap_chars: int = 150):
        self.max_chunk_chars = max_chunk_chars
        self.overlap_chars = overlap_chars

    def chunk_document(self, doc: DocumentInput) -> List[Chunk]:
        """Splits a DocumentInput into one or more Chunks with provenance."""
        # Enforce Invariant #6: Zero secret leakage before chunking
        sanitized_content, _ = redact_secrets(doc.content)

        if not sanitized_content.strip():
            return []

        # If document fits within single chunk limit
        if len(sanitized_content) <= self.max_chunk_chars:
            content_hash = hashlib.sha256(sanitized_content.encode("utf-8")).hexdigest()
            chunk_id = f"{doc.document_id}:0:{content_hash[:16]}"
            lines = sanitized_content.splitlines()
            line_count = len(lines)

            prov = Provenance(
                file_path=doc.provenance.file_path,
                byte_start=doc.provenance.byte_start or 0,
                byte_end=(doc.provenance.byte_start or 0) + len(sanitized_content.encode("utf-8")),
                line_start=doc.provenance.line_start or 1,
                line_end=(doc.provenance.line_start or 1) + max(0, line_count - 1),
                content_hash=content_hash,
                repo_name=doc.provenance.repo_name,
            )

            return [
                Chunk(
                    chunk_id=chunk_id,
                    document_id=doc.document_id,
                    project_id=doc.project_id,
                    repository_id=doc.repository_id,
                    doc_type=doc.doc_type,
                    title=doc.title,
                    content=sanitized_content,
                    chunk_index=0,
                    total_chunks=1,
                    provenance=prov,
                    metadata=doc.metadata.copy(),
                )
            ]

        # Multi-chunk splitting
        raw_chunks = self._split_text(sanitized_content)
        total_chunks = len(raw_chunks)
        chunks: List[Chunk] = []

        current_byte = doc.provenance.byte_start or 0
        current_line = doc.provenance.line_start or 1

        for idx, text in enumerate(raw_chunks):
            chunk_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
            chunk_id = f"{doc.document_id}:{idx}:{chunk_hash[:16]}"
            text_bytes = len(text.encode("utf-8"))
            chunk_lines = len(text.splitlines())

            # Generate chunk title (extract heading if markdown or use doc title)
            header_match = re.search(r"^(#{1,4}\s+[^\n]+)", text)
            chunk_title = (
                f"{doc.title} > {header_match.group(1).lstrip('#').strip()}"
                if header_match
                else f"{doc.title} (Part {idx + 1}/{total_chunks})"
            )

            prov = Provenance(
                file_path=doc.provenance.file_path,
                byte_start=current_byte,
                byte_end=current_byte + text_bytes,
                line_start=current_line,
                line_end=current_line + max(0, chunk_lines - 1),
                content_hash=chunk_hash,
                repo_name=doc.provenance.repo_name,
            )

            chunks.append(
                Chunk(
                    chunk_id=chunk_id,
                    document_id=doc.document_id,
                    project_id=doc.project_id,
                    repository_id=doc.repository_id,
                    doc_type=doc.doc_type,
                    title=chunk_title,
                    content=text,
                    chunk_index=idx,
                    total_chunks=total_chunks,
                    provenance=prov,
                    metadata=doc.metadata.copy(),
                )
            )

            # Advance offsets taking overlap into account
            step_chars = max(1, len(text) - self.overlap_chars)
            step_bytes = len(text[:step_chars].encode("utf-8"))
            step_lines = len(text[:step_chars].splitlines())
            current_byte += step_bytes
            current_line += step_lines

        return chunks

    def _split_text(self, text: str) -> List[str]:
        """Splits text by markdown sections, paragraphs, or sliding window."""
        # Try splitting by markdown headings or double newlines first
        paragraphs = re.split(r"(\n#{1,3}\s+[^\n]+\n|\n\n+)", text)
        pieces: List[str] = []
        buf = ""

        for part in paragraphs:
            if not part:
                continue
            if len(buf) + len(part) <= self.max_chunk_chars:
                buf += part
            else:
                if buf.strip():
                    pieces.append(buf.strip())
                if len(part) > self.max_chunk_chars:
                    # Paragraph itself is too big: split with sliding window
                    sub_splits = self._sliding_window_split(part)
                    pieces.extend(sub_splits[:-1])
                    buf = sub_splits[-1] if sub_splits else ""
                else:
                    buf = part

        if buf.strip():
            pieces.append(buf.strip())

        return pieces if pieces else [text]

    def _sliding_window_split(self, text: str) -> List[str]:
        """Sliding window fallback for continuous text without headers/paragraphs."""
        splits: List[str] = []
        start = 0
        text_len = len(text)

        while start < text_len:
            end = min(start + self.max_chunk_chars, text_len)
            if end < text_len:
                # Try breaking at a space or punctuation
                last_space = text.rfind(" ", start, end)
                if last_space > start + (self.max_chunk_chars // 2):
                    end = last_space

            chunk_text = text[start:end].strip()
            if chunk_text:
                splits.append(chunk_text)

            if end >= text_len:
                break
            start = end - self.overlap_chars

        return splits
