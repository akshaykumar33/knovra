# Phase 16 — Evaluation and Production Readiness

## Goal

Prove Knovra improves agent performance.

## Benchmarks

Compare agents with and without Knovra on identical tasks.

Measure:

- context retrieval precision
- relevant-context recall
- decision retrieval accuracy
- task completion success
- regressions
- token use
- time to solution
- hallucinated project assumptions
- context freshness
- indexing latency
- context endpoint latency

## Reliability

Test:

- service restart
- queue redelivery
- partial Neo4j outage
- PostgreSQL outage
- Redis outage
- embedding provider failure
- index corruption
- sync conflict
- duplicate events

## Acceptance criteria

Publish an internal benchmark showing measurable improvement and known limitations.
