# Phase 05 — Semantic Memory

## Goal

Add semantic retrieval without replacing graph retrieval.

## Embed

- README and docs
- code summaries
- module summaries
- decisions
- requirements
- issues/PR descriptions
- conversation summaries
- errors/solutions

Use PostgreSQL + pgvector initially.

## Retrieval API

Support:

- semantic query
- filters by project/repository/type
- top-k
- source/provenance return
- minimum relevance threshold

## Requirements

- embedding model/version stored
- re-embedding strategy
- batching
- deduplication
- chunk identity
- deletion/update propagation

## Acceptance criteria

Natural-language queries return semantically relevant project artifacts with provenance.
