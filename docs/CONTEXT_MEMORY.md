# Compact project memory

Knovra Local now persists a graph of short notes, decisions and rules in `.knovra/local.sqlite`. It retrieves matching records and their linked neighbors into a compact JSON pack. It does not ingest the conversation automatically or change Codex's internal memory system.

From the repository root, with Node 24 or newer:

```powershell
node packages/local/src/cli.mjs remember "Design direction" "Use editorial typography, spacious work surfaces and restrained lavender. Source: docs/design/reference-manifest.json"
node packages/local/src/cli.mjs memories
node packages/local/src/cli.mjs link <first-memory-id> <second-memory-id> explains
node packages/local/src/cli.mjs recall "design typography"
node packages/local/src/cli.mjs memory <memory-id>
```

`remember` returns the ID used by `link` and `memory`. `recall` prints compact JSON only, with a default 4,000-character budget, up to 12 notes and one relationship hop. Match specific task words. Full records are fetched only when needed. The existing `context` command retrieves indexed source excerpts; `recall` retrieves durable memory summaries. Run `index` before source retrieval.

For custom budgets or decision supersession, use the library:

```js
import { Knovra } from './packages/local/src/index.mjs';
const project = new Knovra(process.cwd());
try {
  const pack = project.recall('graph responsive typography', {
    maxChars: 2400, hops: 2, limit: 8,
  });
  console.log(pack.json);
  // Save revised decisions with remember({ ..., supersedes: priorId }).
} finally {
  project.close();
}
```

The serialized `json` respects `maxChars`; transport wrappers and caller-added text are outside that cap. Token counts are approximate (`characters / 4`), not a model-specific tokenizer or guaranteed token limit. Notes are deduplicated, summaries are limited to 480 characters, and superseded records are excluded from recall. Links are explicit relationships between memories, not automatically inferred code dependencies. Retrieval uses keyword matching and bounded traversal; it can omit relevant material. Check source files before acting on a note.

The `compact-project-memory` personal skill teaches Codex this workflow. Skills extend reusable workflows and load details when selected; they do not modify the underlying model. See the [official skills documentation](https://learn.chatgpt.com/docs/build-skills).

## Verification

Tests exercise persistence, relationship cycles, output caps, supersession, redaction, invalid links and the real CLI with and without an explicit project root. The skill creator's Python validator could not start because its environment lacks PyYAML; the six simple scalar frontmatters and installed copies were checked separately.
