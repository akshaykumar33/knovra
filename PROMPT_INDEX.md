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

## Product surface work (UI/UX + functionality)

`prompts/07_UIUX_DELIVERY_PROMPT.md`

Use this for anything a human sees or interacts with: `apps/web`, `apps/desktop`, docs surfaces,
design system. It makes UI/UX **and** working functionality both mandatory, grants explicit
authority to choose or replace libraries for the product surface, and defines the delivery
protocol — branch, protect, commit, pull request, merge.

Pair it with the specifications it builds on:

- `prompts/05_WEB_DEV_PROMPT.md` — visual language and page-by-page spec
- `prompts/06_RESPONSIVE_PROMPT.md` — responsive, navigation and layout spec

## Shipping any change

`docs/GIT_RULES.md`

Mandatory for every contributor, human or agent:

- §2 branching model and branch creation protocol
- §5 zero-defect quality gate and hook installation
- §6 sensitive data gate (secret scanning, forbidden files, incident protocol)
- §7 pull request, review and merge standards

Install the hooks once per clone before doing anything else:

```bash
npm run hooks:install
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
