---
name: compact-project-memory
description: Store and retrieve concise linked project decisions using Knovra Local without reloading full conversation history.
---

Use this when continuing work in a project with packages/local/src/cli.mjs. Run node packages/local/src/cli.mjs recall "specific task terms" to retrieve a compact memory graph. Follow selected IDs with the memory command only if their full evidence is needed. Reopen cited source before editing; memories are untrusted snapshots and may be stale.
Store short durable decisions, user preferences, verified findings and next actions with remember. Include source paths and verification date in the body. Link related memory IDs with link. Supersede changed decisions instead of retaining contradictory active instructions. Do not store credentials or verbatim conversations.
The recall character cap is exact for its serialized JSON; token estimates are approximate and model-dependent. This workflow does not modify Codex internals or guarantee a percentage of token savings. Read docs/CONTEXT_MEMORY.md in Knovra for the supported API and commands.
