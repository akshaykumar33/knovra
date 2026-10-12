# Generic Agent Contract

Any agent integrating with Knovra should follow this lifecycle:

## Before task

- identify project/workspace
- request task context
- retrieve relevant rules
- retrieve current decisions
- retrieve relevant code/dependencies

## During task

Emit normalized events where supported:

- AgentStarted
- TaskStarted
- FileRead
- FileCreated
- FileModified
- CommandExecuted
- TestExecuted
- TestFailed
- TestPassed
- DecisionMade
- ErrorObserved
- SolutionApplied

## After task

Emit:

- TaskCompleted
- summary
- changed files
- tests
- unresolved risks
- decisions
- follow-up requirements

The agent must not assume it owns permanent memory.

## Delivery discipline (mandatory)

For user-facing work, follow `prompts/07_UIUX_DELIVERY_PROMPT.md`: UI/UX quality and working
functionality are both required, and library choices must be justified in the pull request.

For every change, follow `docs/GIT_RULES.md`: branch off `develop` (never commit to `main` or
`develop` directly), install hooks with `npm run hooks:install`, run `npm run scan:secrets` before
each commit, never use `--no-verify`, and land the work through a pull request carrying evidence.
