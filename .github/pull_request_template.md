<!--
Knovra Pull Request
Title must match the conventional commit format: <type>(<scope>): <summary>
Full governance: docs/GIT_RULES.md
Delete sections that genuinely do not apply — do not delete the checklists.
-->

## Motivation & Context

<!-- WHY this change exists. What architectural need or user goal it satisfies. Link the phase file or issue. -->

## Subsystems Affected

<!-- e.g. apps/web, apps/api, services/runtime, packages/contracts, infra/docker -->

-

## Detailed Changes

- **`path/to/file`** —
- **`path/to/file`** —

## UI / UX Evidence

<!-- Required for any change that alters something a human sees. Delete only for non-visual changes. -->

| Surface | Before | After |
| --- | --- | --- |
|  |  |  |

- [ ] Verified at 360px, 768px, 1280px and 1920px
- [ ] Verified in every supported theme
- [ ] Keyboard-only path works (tab order, focus visible, Escape closes overlays)
- [ ] Loading, empty, error and success states all exist and were exercised
- [ ] Respects `prefers-reduced-motion`

## Functional Evidence

<!-- Prove the feature works, not just that it renders. Commands, test output, request/response samples, screen recording. -->

```text

```

## Architectural Invariants Preserved

- [ ] #1 Knovra owns context; agents consume it
- [ ] #2 Provenance attached to all derived entities
- [ ] #3 Non-destructive, supersession-aware history
- [ ] #6 Zero secret leakage in logs, embeddings, graph properties or version control
- [ ] #7 Local-first offline execution preserved

## Sensitive Data Gate

- [ ] `npm run scan:secrets:branch` passes on this branch
- [ ] No `.env`, key material, token, dump or customer data added
- [ ] Every new configuration value is documented in `.env.example` by **name only**
- [ ] Any scanner allowlist entry or `knovra:allow-secret` pragma added here is justified below

<!-- Justification for allowlist entries, if any: -->

## Zero-Defect Quality Gate

- [ ] Typecheck clean for every touched TypeScript workspace
- [ ] Lint clean for every touched subsystem
- [ ] Tests added or updated, and the full suite for touched subsystems passes
- [ ] CI green (no `|| true` masking, no skipped required job)
- [ ] No `--no-verify`, no suppressed compiler/linter errors, no dead commented-out code

## Breaking Changes & Migration

<!-- "None", or: schema migrations, renamed config, incompatible interfaces. -->

None

## Traceability

- **Phase target**: `phases/XX_<NAME>.md`
- **Milestone**:
- **Next step**:
