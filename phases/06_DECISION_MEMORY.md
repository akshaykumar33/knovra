# Phase 06 — Decision and Rule Memory

## Goal

Make Knovra remember why the project is built the way it is.

## Decision model

A decision should support:

- title
- description
- reason
- alternatives
- affected entities
- created_by
- confidence
- status
- source
- created_at
- supersedes
- superseded_by

## Rules

Support:

- project rules
- architecture constraints
- security constraints
- conventions
- severity
- scope

Add `knovra.yaml` project configuration.

## Acceptance criteria

A user or agent can ask why a technology or pattern exists and retrieve the current historical decision with source and supersession state.
