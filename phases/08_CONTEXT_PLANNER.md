# Phase 08 — Context Planner

## Goal

Generate small, high-quality task-specific context instead of dumping project data.

## Pipeline

1. task classification
2. entity extraction
3. graph retrieval
4. semantic retrieval
5. recent memory
6. rules retrieval
7. candidate merge
8. deduplication
9. ranking
10. compression
11. token budgeting
12. ContextBundle output

## ContextBundle

Include:

- task
- project summary
- architecture
- rules
- files
- symbols
- dependencies
- decisions
- prior errors/solutions
- recent changes
- relevant conversations
- provenance
- freshness
- token usage

## Acceptance criteria

A task query returns a bounded, explainable context package with materially relevant information.
