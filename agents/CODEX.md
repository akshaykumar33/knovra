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

## Delivery discipline (mandatory)

For user-facing work, follow `prompts/07_UIUX_DELIVERY_PROMPT.md`: UI/UX quality and working
functionality are both required, and library choices must be justified in the pull request.

For every change, follow `docs/GIT_RULES.md`: branch off `develop` (never commit to `main` or
`develop` directly), install hooks with `npm run hooks:install`, run `npm run scan:secrets` before
each commit, never use `--no-verify`, and land the work through a pull request carrying evidence.
