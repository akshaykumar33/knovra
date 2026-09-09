# Knovra Build Roadmap

## Milestone V0 — Understand Code

Phases:

1. Foundation
2. Project ingestion
3. Code intelligence
4. Context graph

Outcome:

Knovra can ingest a repository and build a structural code/project graph.

## Milestone V0.1 — Retrieve Context

Phases:

5. Semantic memory
6. Decision memory
7. Conversation/Git memory
8. Context planner

Outcome:

Knovra can answer project questions using hybrid graph + semantic + historical memory.

## Milestone V0.2 — Share Context Across Agents

Phases:

9. MCP/agent gateway
10. Agent events

Outcome:

Codex, Claude or another agent can consume the same persistent context and contribute back history.

## Milestone V0.3 — Continuous Project Intelligence

Phases:

11. Incremental indexing
12. Impact analysis

Outcome:

Knovra stays current as the repository changes and can estimate change impact.

## Milestone V0.4 — Product Experience

Phases:

13. Web dashboard
14. Local-first desktop

Outcome:

Knovra becomes a usable developer product rather than only backend infrastructure.

## Milestone V1 — Production

Phases:

15. Cloud/team/security
16. Evaluation/production readiness

Outcome:

Knovra is ready for real organizations, measurable evaluation and external users.

## Do not build too early

Delay until V1 core is validated:

- Kubernetes
- C++ optimization
- many SaaS connectors
- custom vector database
- multi-agent autonomous orchestration
- billing complexity
- dozens of model adapters
- plugin marketplace
- custom local LLM runtime

The core proof is simple:

A real repository is indexed once, two different agents can correctly retrieve the same project intelligence, and Knovra preserves the reason/history behind changes.
