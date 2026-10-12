# Phase 07 — Conversation and Git Memory

## Goal

Connect human/agent discussion and Git history to project intelligence.

## Conversation ingestion

Build import abstraction for:

- Codex sessions
- Claude Code sessions
- ChatGPT export
- generic JSON transcript

Extract:

- entities
- decisions
- requirements
- errors
- solutions
- summaries

Keep raw source separately.

## Git ingestion

Capture:

- commits
- authors
- branches
- changed files
- diffs/patch metadata
- tags
- PR references when known

Connect:

Decision -> IMPLEMENTED_BY -> Commit
Commit -> MODIFIES -> File

## Acceptance criteria

Knovra can trace from a decision to relevant conversation and code history.
