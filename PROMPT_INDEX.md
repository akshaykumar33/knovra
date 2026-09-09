# Prompt Index

## Start here

`prompts/00_MASTER_SYSTEM_PROMPT.md`

Give this once at the beginning of a Knovra implementation session.

## Before each phase

`prompts/01_REPO_AUDIT_PROMPT.md`

Use it to force the agent to understand the existing repository before changing it.

## Implementing a phase

`prompts/02_IMPLEMENT_PHASE_PROMPT.md`

Append the contents of the target file from `phases/`.

Example:

```text
[MASTER PROMPT]

[GENERIC PHASE IMPLEMENTATION PROMPT]

[phases/03_CODE_INTELLIGENCE.md]
```

## Bugs

Use:

`prompts/03_DEBUG_PROMPT.md`

## Refactoring

Use:

`prompts/04_REFACTOR_PROMPT.md`

## End of each phase

Use:

`quality/PHASE_ACCEPTANCE_PROMPT.md`

Prefer a different agent/model than the implementation agent when possible.

## Periodic reviews

Security:

`quality/SECURITY_REVIEW_PROMPT.md`

Architecture:

`quality/ARCHITECTURE_REVIEW_PROMPT.md`

Performance:

`quality/PERFORMANCE_REVIEW_PROMPT.md`

## Agent-specific instruction files

- `agents/CODEX.md`
- `agents/CLAUDE.md`
- `agents/GENERIC_AGENT.md`
