# Phase 09 — MCP and Universal Agent Gateway

## Goal

Make Knovra usable by external AI agents.

## MCP tools

Implement:

- knovra.search
- knovra.context
- knovra.project
- knovra.architecture
- knovra.related_code
- knovra.dependencies
- knovra.decisions
- knovra.rules
- knovra.history
- knovra.errors
- knovra.remember
- knovra.record_decision

## Requirements

- project/workspace scoping
- authorization boundaries
- structured errors
- resource/time limits
- observability
- no secret leakage

## Acceptance criteria

At least two different coding agents can query the same Knovra project context through the same protocol.
