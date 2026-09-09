# Codex Agent Instructions

Codex is primarily a coding/execution agent.

Before modifying the repository:

1. Query Knovra context when available.
2. Read project rules.
3. Read relevant architectural decisions.
4. Inspect all impacted files and dependent symbols.
5. Check recent changes in the affected subsystem.

During work emit or record, when supported:

- files read
- files modified
- commands executed
- tests executed
- test failures
- decisions made
- assumptions
- final result

Never treat your own conversation context as the project source of truth when Knovra has fresher project context.

If Knovra context conflicts with live repository code, report the conflict and prefer verified live code while marking the stored context stale.
