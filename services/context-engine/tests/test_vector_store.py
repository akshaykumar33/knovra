import pytest

from app.models import Chunk, DocType, Provenance, SearchQuery
from app.storage.vector_store import InMemoryVectorStore


@pytest.mark.asyncio
async def test_in_memory_vector_store_operations():
    store = InMemoryVectorStore(dimension=4)
    await store.initialize()

    chunk1 = Chunk(
        chunk_id="doc-1:0:hash1",
        document_id="doc-1",
        project_id="knovra",
        repository_id="repo-a",
        doc_type=DocType.CODE_SUMMARY,
        title="ExtractSymbols Function",
        content="Extracts symbols from source AST",
        chunk_index=0,
        total_chunks=1,
        provenance=Provenance(file_path="src/parser.rs", content_hash="hash1"),
        embedding=[1.0, 0.0, 0.0, 0.0],
    )
    chunk2 = Chunk(
        chunk_id="doc-2:0:hash2",
        document_id="doc-2",
        project_id="knovra",
        repository_id="repo-a",
        doc_type=DocType.DOCUMENT,
        title="Readme Overview",
        content="General documentation for Knovra",
        chunk_index=0,
        total_chunks=1,
        provenance=Provenance(file_path="README.md", content_hash="hash2"),
        embedding=[0.0, 1.0, 0.0, 0.0],
    )

    stored = await store.store_chunks([chunk1, chunk2])
    assert stored == 2

    # Search with query vector closest to chunk1
    query = SearchQuery(query="symbol parsing", top_k=5, min_score=0.1)
    results = await store.search(query_vector=[0.95, 0.05, 0.0, 0.0], query=query)
    assert len(results) == 1
    assert results[0].chunk_id == "doc-1:0:hash1"
    assert results[0].doc_type == DocType.CODE_SUMMARY

    # Filter by doc_type
    query_filtered = SearchQuery(
        query="anything",
        doc_types=[DocType.DOCUMENT],
        top_k=5,
        min_score=0.0,
    )
    results_filtered = await store.search(query_vector=[0.5, 0.5, 0.0, 0.0], query=query_filtered)
    assert len(results_filtered) == 1
    assert results_filtered[0].document_id == "doc-2"

    # Deletion propagation
    deleted = await store.delete_document("doc-1")
    assert deleted == 1

    stats = await store.get_stats()
    assert stats.total_documents == 1
    assert stats.total_chunks == 1
