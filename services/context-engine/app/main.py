"""Knovra Context Engine - Universal AI Project Intelligence and Context Planner.

Phase 05 Deliverable: Semantic Memory with pgvector and resilient offline fallback.
Provides semantic retrieval, chunking, and provenance-tracked search for AI agents.
"""

import logging
import time
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from typing import Any

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

from app.chunking.chunker import Chunker
from app.config import settings
from app.embeddings.adapter import BaseEmbeddingProvider, get_embedding_provider
from app.models import (
    Chunk,
    IndexBatchRequest,
    IndexBatchResponse,
    SearchQuery,
    SearchResult,
    SemanticStats,
)
from app.storage.vector_store import BaseVectorStore, ResilientVectorStore

logging.basicConfig(
    level=logging.INFO if settings.knovra_log_level.lower() == "info" else logging.DEBUG,
    format='{"timestamp":"%(asctime)s","level":"%(levelname)s","service":"knovra-context-engine","message":"%(message)s"}',
)
logger = logging.getLogger("knovra.context-engine")

start_time = time.time()

# Global singleton dependencies
vector_store: BaseVectorStore = ResilientVectorStore(
    postgres_host=settings.postgres_host,
    postgres_port=settings.postgres_port,
    postgres_user=settings.postgres_user,
    postgres_password=settings.postgres_password,
    postgres_db=settings.postgres_db,
    model_name=settings.embedding_model,
    dimension=settings.embedding_dimension,
)
embedding_provider: BaseEmbeddingProvider = get_embedding_provider(
    provider_type=settings.embedding_provider,
    api_key=settings.openai_api_key,
    model_name=settings.embedding_model,
    dimension=settings.embedding_dimension,
)
chunker: Chunker = Chunker(
    max_chunk_chars=settings.chunk_max_chars,
    overlap_chars=settings.chunk_overlap_chars,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes database connections and vector indices on startup."""
    logger.info("Initializing Knovra Semantic Memory...")
    try:
        await vector_store.initialize()
    except Exception as ex:  # noqa: BLE001
        logger.error("Error during vector store initialization: %s", ex)

    yield
    logger.info("Shutting down Knovra Semantic Memory...")
    await vector_store.close()


app = FastAPI(
    title="Knovra Context Engine",
    version="0.1.0",
    description="Universal AI Project Intelligence, Semantic Memory, and Context Planner",
    lifespan=lifespan,
)


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str
    uptime_seconds: float
    details: dict[str, Any]


@app.get("/")
async def root():
    return {
        "service": "knovra-context-engine",
        "version": "0.1.0",
        "description": "AI Context Engine and Semantic Memory",
    }


@app.get("/health", response_model=HealthResponse)
async def health():
    stats = await vector_store.get_stats()
    return HealthResponse(
        status="ok",
        service="knovra-context-engine",
        version="0.1.0",
        timestamp=datetime.now(UTC).isoformat(),
        uptime_seconds=round(time.time() - start_time, 2),
        details={
            "environment": settings.knovra_env,
            "semantic_retrieval": "ready",
            "context_planner": "ready",
            "storage_backend": stats.storage_backend,
            "embedding_model": stats.embedding_model,
            "total_documents": stats.total_documents,
            "total_chunks": stats.total_chunks,
        },
    )


@app.post("/semantic/index", response_model=IndexBatchResponse)
async def index_documents(request: IndexBatchRequest):
    """Chunks documents, computes dense vector embeddings, and stores them with provenance."""
    t0 = time.time()
    all_chunks: list[Chunk] = []
    doc_types: dict[str, int] = {}

    for doc in request.documents:
        # If reembed is False, check and delete prior version if updating
        await vector_store.delete_document(doc.document_id)

        chunks = chunker.chunk_document(doc)
        all_chunks.extend(chunks)
        doc_types[doc.doc_type.value] = doc_types.get(doc.doc_type.value, 0) + 1

    if not all_chunks:
        return IndexBatchResponse(
            indexed_documents=len(request.documents),
            indexed_chunks=0,
            doc_types=doc_types,
            model_name=embedding_provider.model_name,
            elapsed_ms=round((time.time() - t0) * 1000, 2),
        )

    # Batch embed chunk contents
    texts = [c.content for c in all_chunks]
    embeddings = await embedding_provider.embed_texts(texts)

    for chunk, emb in zip(all_chunks, embeddings):
        chunk.embedding = emb
        chunk.model_name = embedding_provider.model_name

    # Persist chunks
    await vector_store.store_chunks(all_chunks)

    elapsed_ms = round((time.time() - t0) * 1000, 2)
    logger.info(
        "Indexed %d documents (%d chunks) in %.2fms",
        len(request.documents),
        len(all_chunks),
        elapsed_ms,
    )

    return IndexBatchResponse(
        indexed_documents=len(request.documents),
        indexed_chunks=len(all_chunks),
        doc_types=doc_types,
        model_name=embedding_provider.model_name,
        elapsed_ms=elapsed_ms,
    )


@app.post("/semantic/search", response_model=list[SearchResult])
async def search(query: SearchQuery):
    """Semantic vector search across project artifacts with provenance and filters."""
    query_vector = await embedding_provider.embed_query(query.query)
    results = await vector_store.search(query_vector=query_vector, query=query)
    return results


@app.delete("/semantic/documents/{document_id}")
async def delete_document(document_id: str):
    """Propagates document deletion across the vector store."""
    deleted_chunks = await vector_store.delete_document(document_id)
    if deleted_chunks == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Document {document_id} not found")
    return {"status": "deleted", "document_id": document_id, "chunks_removed": deleted_chunks}


@app.get("/semantic/stats", response_model=SemanticStats)
async def get_stats():
    """Returns vector store inventory, counts by doc type, and model configuration."""
    return await vector_store.get_stats()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.port_context_engine)
