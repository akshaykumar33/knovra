# Knovra Architecture

## Major layers

```text
Developers / Agents
        |
        v
MCP / SDK / API / CLI
        |
        v
Agent Gateway / Go Runtime
        |
        v
Context Planner
        |
   +----+-------------------------+
   |              |              |
   v              v              v
Graph Search   Semantic Search   Working Memory
Neo4j          pgvector          Redis
   |              |              |
   +--------------+--------------+
                  |
                  v
            Context Bundle
                  |
                  v
                Agent
                  |
                  v
             Agent Events
                  |
                  v
       Event Normalizer / NATS
                  |
      +-----------+------------+
      |           |            |
      v           v            v
 Rust Indexer   Git          Decisions
      |
      v
Code Knowledge Graph
```

## Language responsibilities

### TypeScript / Next.js

Owns the product-facing experience:

- dashboard
- graph explorer
- project screens
- agent session history
- decision timelines
- architecture visualization
- settings
- documentation and marketing site

### NestJS

Owns SaaS/business capabilities:

- users
- organizations
- teams
- workspaces
- projects
- RBAC
- subscriptions
- integrations
- API keys
- billing hooks
- dashboard APIs

### Go

Owns runtime and local-system behavior:

- CLI
- daemon
- MCP server
- repository watching
- Git watching
- agent gateway
- process lifecycle
- sync
- local HTTP API
- event forwarding

### Rust

Owns performance-sensitive code intelligence:

- repository scanning
- Tree-sitter parsing
- AST analysis
- symbols
- imports and exports
- call graphs
- dependency graphs
- incremental indexing
- diff-aware indexing
- impact analysis

### Python

Owns AI intelligence:

- query interpretation
- entity extraction
- semantic retrieval
- decision extraction
- summarization
- reranking
- context compression
- context planning
- model adapters

## Storage responsibilities

### PostgreSQL

Transactional product truth.

### Neo4j

Relationships, architecture, code graph, decisions, provenance.

### pgvector

Semantic vectors for code summaries, docs, decisions, issues, PRs, conversations.

### Redis

Ephemeral cache, hot context, rate limits, locks.

### S3 / MinIO

Raw conversation imports, repository snapshots, large artifacts, exports.

## Architectural invariants

1. No agent-specific data model in the core context engine.
2. Every derived fact must retain provenance.
3. Decisions must support supersession.
4. Repository indexing must be incremental.
5. The context engine must never dump the entire graph into an LLM.
6. Secrets must be filtered before model context assembly.
7. Local-only operation must remain possible.
8. Cloud sync must be optional.
9. Core schemas must be versioned.
10. Storage engines should remain replaceable behind interfaces where practical.
