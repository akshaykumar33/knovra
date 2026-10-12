# ADR-001: Polyglot Monorepo Architecture

## Metadata
* **ID**: `adr-001`
* **Status**: Accepted
* **Created**: 2026-09-09
* **Created By**: Knovra Architecture Team
* **Confidence**: 0.95
* **Supersedes**: None
* **Superseded By**: None
* **Affected Entities**:
  - `services/code-indexer`
  - `services/runtime`
  - `services/context-engine`
  - `apps/web`
  - `apps/api`

## Context & Problem Statement
Knovra is an AI project intelligence and context engine designed to serve autonomous coding agents. It requires:
1. Sub-millisecond structural AST parsing and symbol extraction across multiple programming languages.
2. Lightweight local-first system daemon, MCP gateway, and file watching with near-zero memory footprint.
3. Sophisticated semantic retrieval, prompt planning, and AI model orchestration.
4. An interactive product dashboard for developers.

Single-language stacks create severe compromises in either AST performance (Node.js/Python), AI ecosystem integration (Go/Rust), or developer UI tooling (Go/Rust/Python).

## Decision
We adopt a polyglot monorepo structure with strict subsystem ownership:
- **Rust (`services/code-indexer`)**: Owns AST parsing, Tree-sitter integration, symbol extraction, and deterministic hashing.
- **Go (`services/runtime`)**: Owns local daemon, CLI, MCP gateway, file watching, and process management.
- **Python (`services/context-engine`)**: Owns semantic retrieval, chunking, AI model adapters, and prompt budgeting.
- **TypeScript (`apps/web`, `apps/api`, `packages/*`)**: Owns the web dashboard, SaaS API, and shared TypeScript contracts.

## Alternatives Considered
- **Single Python Stack**: Rejected due to high memory overhead for daemons and slow Tree-sitter AST traversals at scale.
- **Single Go Stack**: Rejected due to lack of mature AI/LLM chunking and embedding ecosystem compared to Python.
- **Single Rust Stack**: Rejected due to slower UI/web iteration speed compared to Next.js/React.

## Consequences
- **Positive**: Each subsystem uses the optimal language for its execution profile.
- **Negative**: Requires multi-language toolchain (Cargo, Go, Python/Poetry, pnpm) managed cleanly via Docker Compose.
