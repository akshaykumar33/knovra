# Agent integration

Knovra runs as a local MCP server. The agent starts one process for the repository it is working in; the process reads newline-delimited JSON-RPC from stdin and writes responses to stdout.

## Generic MCP clients

Use this server definition wherever the client accepts an MCP `command` and `args` entry:

```json
{
  "command": "npx",
  "args": ["@knovra/local", "mcp", "--root", "/absolute/path/to/project"]
}
```

If the package is installed from a local checkout, use the CLI path directly:

```json
{
  "command": "node",
  "args": ["/absolute/path/to/knovra/packages/local/src/cli.mjs", "mcp", "--root", "/absolute/path/to/project"]
}
```

## Recommended agent workflow

1. Call `knovra_status` to see whether the snapshot exists.
2. Call `knovra_index` at the beginning of a work session or after large changes.
3. Call `knovra_search` with concrete feature, symbol, or file terms.
4. Call `knovra_context` to build a bounded source pack before planning edits.
5. Save durable project decisions with `knovra_remember`.
6. Call `knovra_doctor` when indexing or storage behaves unexpectedly.

The server does not execute repository files, make network requests, or send indexed content to a model. Search is keyword based; an agent should treat returned source as project data and verify it against the working tree before editing.
