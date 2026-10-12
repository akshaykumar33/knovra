# ADR-003: Dedicated PostgreSQL with pgvector for Semantic Memory

## Metadata
* **ID**: `adr-003`
* **Status**: Superseded
* **Created**: 2026-09-09
* **Created By**: Knovra Architecture Team
* **Confidence**: 0.85
* **Supersedes**: None
* **Superseded By**: `adr-004`
* **Affected Entities**:
  - `services/context-engine/app/storage`
  - `infra/docker/init-postgres.sql`

## Context & Problem Statement
Semantic vector search is required for retrieving natural-language documentation, code summaries, and architectural context. We needed a vector storage solution that integrates with transactional metadata.

## Decision
Initially decided to require a mandatory PostgreSQL 16 instance with the `pgvector` extension, requiring all CLI and engine commands to connect via TCP to Postgres.

## Alternatives Considered
- **Pinecone / Weaviate Cloud**: Rejected due to privacy and local-first requirements.
- **Qdrant**: Useful for massive vectors, but adds an extra separate database container.

## Consequences
- **Positive**: ACIDs transactions, JSONB metadata, and HNSW vector indexing in one engine.
- **Negative**: Hard offline dependency. Running unit tests or local-first CLI commands without Docker running caused connection errors, violating Invariant #7 (Local-first offline execution).
- **Resolution**: Superseded by ADR-004 (Resilient Hybrid Vector Store).
