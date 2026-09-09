# Phase 11 — Incremental Indexing and Freshness

## Goal

Keep project intelligence current without full re-indexing.

## Build

- filesystem watcher
- Git watcher
- content hashes
- changed-file detection
- changed-symbol detection
- dependency invalidation
- stale context invalidation
- graph updates
- vector updates

## Freshness model

Support:

- created_at
- updated_at
- valid_from
- valid_to
- stale
- superseded_by

## Acceptance criteria

Editing a source file causes only affected code, graph and semantic records to update.
