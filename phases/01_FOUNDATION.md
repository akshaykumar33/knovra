# Phase 01 — Foundation

## Goal

Create a production-quality Knovra monorepo and local development environment.

## Build

- Next.js web app
- NestJS application API
- Go CLI/runtime skeleton
- Rust workspace
- Python context-engine service
- PostgreSQL
- Neo4j
- Redis
- NATS
- MinIO
- Docker Compose
- shared contracts folder
- CI skeleton

## Required repository structure

```text
apps/
  web/
  api/

services/
  runtime/
  context-engine/
  code-indexer/

packages/
  contracts/
  config/
  mcp/

infra/
  docker/
  terraform/

graph/
docs/
```

## Requirements

- one command starts local infrastructure
- health checks for every service
- environment validation
- no committed secrets
- structured logs
- initial OpenTelemetry wiring
- language-specific lint/typecheck/test commands
- root orchestration commands

## Acceptance criteria

- clean checkout can start locally
- all services report healthy
- CI executes successfully
- root README documents setup
