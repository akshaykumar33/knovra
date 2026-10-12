# Local Beta roadmap

## Shipped in 0.2.0

- Offline SQLite + FTS5 project index with incremental hashes.
- Git-aware file discovery, secret redaction, size limits, and symlink checks.
- Search, bounded context packs, durable memories, doctor checks, and Markdown export.
- CLI and newline-delimited MCP server with the same local core.
- Package tests and a sample-project smoke test.

## Next milestones

1. Connect the parser adapter boundary to optional AST implementations where a project wants parser-level accuracy.
2. Add a small agent integration guide with copy-paste MCP configurations for common clients.
3. Add release CI for Node versions, package provenance, and cross-platform smoke tests.
4. Add opt-in encrypted sync only after the local contract is stable and threat-modeled.
