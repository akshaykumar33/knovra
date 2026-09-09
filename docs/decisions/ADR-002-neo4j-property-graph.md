# ADR-002: Neo4j Property Graph for Code Intelligence

## Metadata
* **ID**: `adr-002`
* **Status**: Accepted
* **Created**: 2026-09-09
* **Created By**: Knovra Architecture Team
* **Confidence**: 0.90
* **Supersedes**: None
* **Superseded By**: None
* **Affected Entities**:
  - `services/runtime/internal/graph`
  - `graph/schema.cypher`
  - `graph/queries.cypher`

## Context & Problem Statement
AI agents fail on complex tasks because standard vector search cannot represent transitive relationships (e.g. "Who calls function X?", "What breaks if module Y changes?", "Which interface does struct Z implement?"). Relational databases require expensive recursive CTEs for variable-length dependency traversals.

## Decision
Use **Neo4j** as the core context property graph engine:
1. Represent project entities as nodes: `:Project`, `:Repository`, `:Module`, `:File`, `:Symbol`, `:Interface`, `:Call`, `:Decision`.
2. Model relationships natively: `[:CONTAINS]`, `[:IMPORTS]`, `[:CALLS]`, `[:IMPLEMENTS]`, `[:EXTENDS]`, `[:SUPERSEDES]`.
3. Provide offline Cypher batch transaction export (`.knovra/graph_export.cypher`) to guarantee zero network dependency when Neo4j is offline.

## Alternatives Considered
- **Relational PostgreSQL Foreign Keys**: Rejected due to high query complexity and latency for multi-hop graph traversals.
- **Pure In-Memory Graph (petgraph/gonum)**: Rejected because agents require persistent state across CLI invocations without re-indexing the entire codebase.

## Consequences
- **Positive**: Expressive Cypher pattern matching for blast-radius and call-graph analysis.
- **Negative**: Requires Neo4j service dependency (mitigated by offline Cypher batch export capability).
