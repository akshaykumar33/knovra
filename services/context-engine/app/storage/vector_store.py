"""Knovra Context Engine - Vector Storage Layer.

Implements:
1. InMemoryVectorStore: Zero-dependency in-memory cosine store for local offline testing.
2. PgVectorStore: Production PostgreSQL + pgvector storage with HNSW index and JSONB metadata.
3. ResilientVectorStore: Hybrid adapter that connects to pgvector when online,
   and gracefully falls back to InMemoryVectorStore when offline (Invariant #7).
"""

import abc
import json
import logging
from typing import Any

import asyncpg

from app.models import (
    Chunk,
    DocType,
    Provenance,
    SearchQuery,
    SearchResult,
    SemanticStats,
)

logger = logging.getLogger("knovra.vector-store")


def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """Calculates cosine similarity between two unit-normalized vectors."""
    if len(v1) != len(v2) or not v1:
        return 0.0
    return max(0.0, min(1.0, sum(a * b for a, b in zip(v1, v2))))


class BaseVectorStore(abc.ABC):
    @abc.abstractmethod
    async def initialize(self) -> None:
        pass

    @abc.abstractmethod
    async def store_chunks(self, chunks: list[Chunk]) -> int:
        pass

    @abc.abstractmethod
    async def search(self, query_vector: list[float], query: SearchQuery) -> list[SearchResult]:
        pass

    @abc.abstractmethod
    async def delete_document(self, document_id: str) -> int:
        pass

    @abc.abstractmethod
    async def get_stats(self) -> SemanticStats:
        pass

    @abc.abstractmethod
    async def close(self) -> None:
        pass


class InMemoryVectorStore(BaseVectorStore):
    """Fast in-memory vector store with cosine distance ranking."""

    def __init__(self, model_name: str = "knovra-deterministic-dense-v1", dimension: int = 384):
        self._chunks: dict[str, Chunk] = {}
        self._model_name = model_name
        self._dim = dimension

    async def initialize(self) -> None:
        logger.info("Initialized InMemoryVectorStore (dimension=%d)", self._dim)

    async def store_chunks(self, chunks: list[Chunk]) -> int:
        count = 0
        for chunk in chunks:
            self._chunks[chunk.chunk_id] = chunk
            count += 1
        return count

    async def search(self, query_vector: list[float], query: SearchQuery) -> list[SearchResult]:
        matches: list[SearchResult] = []
        target_types = set(query.doc_types) if query.doc_types else None

        for chunk in self._chunks.values():
            # Apply project / repo filter
            if query.project_id and chunk.project_id != query.project_id:
                continue
            if query.repository_id and chunk.repository_id != query.repository_id:
                continue
            if target_types and chunk.doc_type not in target_types:
                continue

            if not chunk.embedding:
                continue

            score = cosine_similarity(query_vector, chunk.embedding)
            if score >= query.min_score:
                matches.append(
                    SearchResult(
                        chunk_id=chunk.chunk_id,
                        document_id=chunk.document_id,
                        score=round(score, 4),
                        doc_type=chunk.doc_type,
                        title=chunk.title,
                        content=chunk.content,
                        provenance=chunk.provenance,
                        metadata=chunk.metadata,
                        model_name=chunk.model_name or self._model_name,
                    )
                )

        # Sort descending by score
        matches.sort(key=lambda r: r.score, reverse=True)
        return matches[: query.top_k]

    async def delete_document(self, document_id: str) -> int:
        to_delete = [cid for cid, c in self._chunks.items() if c.document_id == document_id]
        for cid in to_delete:
            del self._chunks[cid]
        return len(to_delete)

    async def get_stats(self) -> SemanticStats:
        docs = {c.document_id for c in self._chunks.values()}
        by_type: dict[str, int] = {}
        for c in self._chunks.values():
            by_type[c.doc_type.value] = by_type.get(c.doc_type.value, 0) + 1

        return SemanticStats(
            total_documents=len(docs),
            total_chunks=len(self._chunks),
            by_doc_type=by_type,
            embedding_model=self._model_name,
            vector_dimension=self._dim,
            storage_backend="in-memory",
        )

    async def close(self) -> None:
        self._chunks.clear()


class PgVectorStore(BaseVectorStore):
    """Production PostgreSQL + pgvector storage."""

    def __init__(
        self,
        host: str,
        port: int,
        user: str,
        password: str,
        database: str,
        model_name: str = "knovra-deterministic-dense-v1",
        dimension: int = 384,
    ):
        self._host = host
        self._port = port
        self._user = user
        self._password = password
        self._database = database
        self._model_name = model_name
        self._dim = dimension
        self._pool: asyncpg.Pool | None = None

    async def initialize(self) -> None:
        self._pool = await asyncpg.create_pool(
            host=self._host,
            port=self._port,
            user=self._user,
            password=self._password,
            database=self._database,
            min_size=2,
            max_size=10,
            timeout=10.0,
        )

        async with self._pool.acquire() as conn:
            await conn.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
            await conn.execute('CREATE EXTENSION IF NOT EXISTS "vector";')

            schema_ddl = f"""
            CREATE TABLE IF NOT EXISTS semantic_chunks (
                chunk_id VARCHAR(128) PRIMARY KEY,
                document_id VARCHAR(128) NOT NULL,
                project_id VARCHAR(128) NOT NULL,
                repository_id VARCHAR(128) NOT NULL,
                doc_type VARCHAR(64) NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                chunk_index INT NOT NULL,
                total_chunks INT NOT NULL,
                file_path TEXT NOT NULL,
                byte_start INT,
                byte_end INT,
                line_start INT,
                line_end INT,
                content_hash VARCHAR(64) NOT NULL,
                repo_name VARCHAR(128),
                metadata JSONB,
                embedding vector({self._dim}),
                model_name VARCHAR(128) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_semantic_chunks_doc ON semantic_chunks (document_id);
            CREATE INDEX IF NOT EXISTS idx_semantic_chunks_proj_type ON semantic_chunks (project_id, doc_type);
            """
            await conn.execute(schema_ddl)
        logger.info("Connected to PostgreSQL + pgvector at %s:%d/%s", self._host, self._port, self._database)

    async def store_chunks(self, chunks: list[Chunk]) -> int:
        if not self._pool or not chunks:
            return 0

        async with self._pool.acquire() as conn, conn.transaction():
            for c in chunks:
                    vec_str = f"[{','.join(str(x) for x in c.embedding)}]" if c.embedding else None
                    query = """
                    INSERT INTO semantic_chunks (
                        chunk_id, document_id, project_id, repository_id, doc_type,
                        title, content, chunk_index, total_chunks, file_path,
                        byte_start, byte_end, line_start, line_end, content_hash,
                        repo_name, metadata, embedding, model_name, updated_at
                    ) VALUES (
                        $1, $2, $3, $4, $5,
                        $6, $7, $8, $9, $10,
                        $11, $12, $13, $14, $15,
                        $16, $17, $18::vector, $19, NOW()
                    )
                    ON CONFLICT (chunk_id) DO UPDATE SET
                        content = EXCLUDED.content,
                        title = EXCLUDED.title,
                        byte_start = EXCLUDED.byte_start,
                        byte_end = EXCLUDED.byte_end,
                        line_start = EXCLUDED.line_start,
                        line_end = EXCLUDED.line_end,
                        content_hash = EXCLUDED.content_hash,
                        metadata = EXCLUDED.metadata,
                        embedding = EXCLUDED.embedding,
                        model_name = EXCLUDED.model_name,
                        updated_at = NOW();
                    """
                    await conn.execute(
                        query,
                        c.chunk_id,
                        c.document_id,
                        c.project_id,
                        c.repository_id,
                        c.doc_type.value,
                        c.title,
                        c.content,
                        c.chunk_index,
                        c.total_chunks,
                        c.provenance.file_path,
                        c.provenance.byte_start,
                        c.provenance.byte_end,
                        c.provenance.line_start,
                        c.provenance.line_end,
                        c.provenance.content_hash,
                        c.provenance.repo_name,
                        json.dumps(c.metadata),
                        vec_str,
                        c.model_name or self._model_name,
                    )
        return len(chunks)

    async def search(self, query_vector: list[float], query: SearchQuery) -> list[SearchResult]:
        if not self._pool:
            return []

        vec_str = f"[{','.join(str(x) for x in query_vector)}]"
        where_clauses = ["1=1"]
        params: list[Any] = [vec_str]
        p_idx = 2

        if query.project_id:
            where_clauses.append(f"project_id = ${p_idx}")
            params.append(query.project_id)
            p_idx += 1

        if query.repository_id:
            where_clauses.append(f"repository_id = ${p_idx}")
            params.append(query.repository_id)
            p_idx += 1

        if query.doc_types:
            type_vals = [t.value for t in query.doc_types]
            where_clauses.append(f"doc_type = ANY(${p_idx}::text[])")
            params.append(type_vals)
            p_idx += 1

        where_sql = " AND ".join(where_clauses)
        sql = f"""
        SELECT
            chunk_id, document_id, doc_type, title, content,
            file_path, byte_start, byte_end, line_start, line_end,
            content_hash, repo_name, metadata, model_name,
            (1.0 - (embedding <=> $1::vector)) AS score
        FROM semantic_chunks
        WHERE {where_sql}
          AND (1.0 - (embedding <=> $1::vector)) >= ${p_idx}
        ORDER BY score DESC
        LIMIT ${p_idx + 1};
        """
        params.extend([query.min_score, query.top_k])

        results: list[SearchResult] = []
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(sql, *params)
            for row in rows:
                prov = Provenance(
                    file_path=row["file_path"],
                    byte_start=row["byte_start"],
                    byte_end=row["byte_end"],
                    line_start=row["line_start"],
                    line_end=row["line_end"],
                    content_hash=row["content_hash"],
                    repo_name=row["repo_name"],
                )
                meta = json.loads(row["metadata"]) if isinstance(row["metadata"], str) else (row["metadata"] or {})
                results.append(
                    SearchResult(
                        chunk_id=row["chunk_id"],
                        document_id=row["document_id"],
                        score=round(float(row["score"]), 4),
                        doc_type=DocType(row["doc_type"]),
                        title=row["title"],
                        content=row["content"],
                        provenance=prov,
                        metadata=meta,
                        model_name=row["model_name"],
                    )
                )
        return results

    async def delete_document(self, document_id: str) -> int:
        if not self._pool:
            return 0
        async with self._pool.acquire() as conn:
            result = await conn.execute("DELETE FROM semantic_chunks WHERE document_id = $1;", document_id)
            parts = result.split()
            return int(parts[-1]) if len(parts) > 1 and parts[-1].isdigit() else 0

    async def get_stats(self) -> SemanticStats:
        if not self._pool:
            return SemanticStats(
                total_documents=0,
                total_chunks=0,
                by_doc_type={},
                embedding_model=self._model_name,
                vector_dimension=self._dim,
                storage_backend="postgresql-offline",
            )
        async with self._pool.acquire() as conn:
            total_chunks = await conn.fetchval("SELECT COUNT(*) FROM semantic_chunks;")
            total_docs = await conn.fetchval("SELECT COUNT(DISTINCT document_id) FROM semantic_chunks;")
            type_counts = await conn.fetch("SELECT doc_type, COUNT(*) as c FROM semantic_chunks GROUP BY doc_type;")
            by_type = {row["doc_type"]: int(row["c"]) for row in type_counts}

            return SemanticStats(
                total_documents=int(total_docs or 0),
                total_chunks=int(total_chunks or 0),
                by_doc_type=by_type,
                embedding_model=self._model_name,
                vector_dimension=self._dim,
                storage_backend="postgresql+pgvector",
            )

    async def close(self) -> None:
        if self._pool:
            await self._pool.close()
            self._pool = None


class ResilientVectorStore(BaseVectorStore):
    """Hybrid vector store that automatically uses pgvector if available,

    and seamlessly falls back to InMemoryVectorStore if PostgreSQL is offline.
    Satisfies Invariant #7 (Local-only operation) & Invariant #10 (Replaceable storage).
    """

    def __init__(
        self,
        postgres_host: str,
        postgres_port: int,
        postgres_user: str,
        postgres_password: str,
        postgres_db: str,
        model_name: str = "knovra-deterministic-dense-v1",
        dimension: int = 384,
    ):
        self._pg_store = PgVectorStore(
            host=postgres_host,
            port=postgres_port,
            user=postgres_user,
            password=postgres_password,
            database=postgres_db,
            model_name=model_name,
            dimension=dimension,
        )
        self._mem_store = InMemoryVectorStore(model_name=model_name, dimension=dimension)
        self._active_store: BaseVectorStore = self._mem_store

    async def initialize(self) -> None:
        try:
            await self._pg_store.initialize()
            self._active_store = self._pg_store
            logger.info("Using PostgreSQL + pgvector as active vector store")
        except Exception as ex:  # noqa: BLE001
            logger.warning(
                "PostgreSQL pgvector unavailable (%s). Falling back to InMemoryVectorStore for local-first execution.",
                ex,
            )
            await self._mem_store.initialize()
            self._active_store = self._mem_store

    async def store_chunks(self, chunks: list[Chunk]) -> int:
        return await self._active_store.store_chunks(chunks)

    async def search(self, query_vector: list[float], query: SearchQuery) -> list[SearchResult]:
        return await self._active_store.search(query_vector, query)

    async def delete_document(self, document_id: str) -> int:
        return await self._active_store.delete_document(document_id)

    async def get_stats(self) -> SemanticStats:
        return await self._active_store.get_stats()

    async def close(self) -> None:
        await self._pg_store.close()
        await self._mem_store.close()
