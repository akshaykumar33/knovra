# Phase 10 — Agent Event System

## Goal

Continuously learn from agent work.

## Event model

- AgentStarted
- TaskStarted
- PromptReceived
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
- TaskCompleted

Use NATS JetStream for event delivery.

## Requirements

- idempotent event handling
- event IDs
- timestamps
- project/agent/session IDs
- schema version
- retry policy
- dead-letter behavior
- ordering assumptions documented

## Acceptance criteria

Agent activity updates Knovra history and relevant project intelligence without manual import.
