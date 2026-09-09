# ADR-004: Resilient Hybrid Vector Storage with Offline Fallback

## Metadata
* **ID**: `adr-004`
* **Status**: Accepted
* **Created**: 2026-09-09
* **Created By**: Knovra Architecture Team
* **Confidence**: 0.98
* **Supersedes**: `adr-003`
* **Superseded By**: None
* **Affected Entities**:
  - `services/context-engine/app/storage/vector_store.py`
  - `services/runtime/internal/semantic`

## Context & Problem Statement
ADR-003 introduced PostgreSQL + pgvector as the primary vector store. However, requiring PostgreSQL to be running at all times violated Invariant #7 ("Local-only operation must remain possible") and disrupted CI test runs when Docker was offline.

## Decision
We supersede ADR-003 and adopt the **Resilient Hybrid Vector Store** pattern:
1. Implement an abstract `BaseVectorStore` interface.
2. `PgVectorStore`: Connects to PostgreSQL + pgvector when Docker Compose is up, utilizing HNSW cosine indices and JSONB metadata.
3. `InMemoryVectorStore`: A high-performance in-memory cosine vector store with zero external dependencies.
4. `ResilientVectorStore`: Seamlessly attempts PostgreSQL first; if unreachable, falls back to `InMemoryVectorStore` without raising an error or blocking the CLI/agent.
5. Save offline artifact snapshots to `.knovra/semantic_artifacts.json`.

## Alternatives Considered
- **SQLite with sqlite-vss**: Considered, but requires native C-extension compilation which is complex across cross-platform host setups.
- **Fail-fast on DB error**: Rejected as it breaks developer ergonomics and offline autonomy.

## Consequences
- **Positive**: Strict adherence to Invariant #7 and Invariant #10. Tests run in under 2 seconds without Docker dependencies. Full HNSW scalability preserved when PostgreSQL is running.
- **Negative**: When running completely offline without PostgreSQL, in-memory vectors are re-indexed upon restart from `.knovra/semantic_artifacts.json`.
