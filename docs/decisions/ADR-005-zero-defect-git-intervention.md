# ADR-005: Zero-Defect Git Intervention Quality Gate

## Metadata
* **ID**: `adr-005`
* **Status**: Accepted
* **Created**: 2026-09-09
* **Created By**: Knovra Architecture Team
* **Confidence**: 0.99
* **Supersedes**: None
* **Superseded By**: None
* **Affected Entities**:
  - `docs/GIT_RULES.md`
  - `.githooks/pre-commit`

## Context & Problem Statement
In fast-moving agentic workflows, agents and engineers often accumulate small typing warnings, compilation errors, and broken unit tests, postponing fixes with "fix later" commits. This degrades monorepo stability and causes cascading CI failures.

## Decision
Establish a mandatory **Zero-Defect Quality Gate Intervention**:
1. All modified subsystems must undergo complete error and issue verification before any commit, PR, or phase advancement.
2. If ANY error, warning, or test breakage is detected, the workflow must **Halt, Diagnose, Fix, Re-Verify, and only then Advance**.
3. Automated pre-commit hook (`.githooks/pre-commit`) blocks broken commits at the Git CLI layer.

## Consequences
- **Positive**: 100% clean, defect-free git history on `develop` and `main`. Eliminates cascading regressions.
- **Negative**: Pre-commit verification takes 1-3 seconds per commit (minimized by targeting only staged languages).
