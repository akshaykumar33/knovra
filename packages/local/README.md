# @knovra/local

Current release: **0.3.0**. See [CHANGELOG.md](./CHANGELOG.md) for the release history.

Knovra Local is a durable local project-intelligence package for developers and coding agents. It indexes source, docs, and configuration into SQLite FTS5, then provides keyword search, bounded context packs, durable notes/decisions/rules, and an MCP stdio server.

It is deliberately offline and transparent: it does not execute indexed files, upload repository contents, or call a model. Common source files also get lightweight function, class, and declaration symbol entries; text indexing remains the fallback.

## Use it

```bash
npm install ./packages/local
cd your-project
npx knovra index
npx knovra search "tenant authentication"
npx knovra context "Add pagination to the tenant list endpoint"
npx knovra doctor
npx knovra export "Prepare an authentication change plan" docs/context.md
npx knovra watch
# For a single automation-safe refresh:
npx knovra watch --once
npx knovra remember "Tenant boundary" "Every query must scope by tenant id"
```

The database lives in `your-project/.knovra/local.sqlite`. Indexing respects Git ignored files, rejects symlinks, skips likely secret files and binaries, redacts common token patterns, and limits each file to 1 MiB and the index to 128 MiB.

## MCP configuration

```json
{
  "mcpServers": {
    "knovra": {
      "command": "npx",
      "args": ["knovra", "mcp", "--root", "/absolute/path/to/your-project"]
    }
  }
}
```

The server implements `initialize`, `ping`, `tools/list`, and `tools/call` over newline-delimited stdio JSON-RPC. Tools include status, indexing, search, context, export, doctor, memories, and durable notes.

See [INTEGRATION.md](./INTEGRATION.md) for copy-paste client configuration and the recommended agent workflow.

## Library API

```js
import { Knovra } from '@knovra/local';
const project = new Knovra(process.cwd());
project.index();
console.log(project.context('Fix authentication timeout').markdown);
project.close();
```

## Linked memory recall

Use `knovra remember "title" "body"` to save a note, `knovra link <source-id> <target-id> [relation]` to connect current notes, and `knovra recall "task words"` to retrieve a compact graph (default 4,000 characters). Fetch a full note with `knovra memory <id>`. The library exposes `link`, `recall` and `memory`; recall accepts `maxChars`, `hops` and `limit`. Token estimates are approximate. These new commands are available through the CLI/library; the existing MCP surface is unchanged.
