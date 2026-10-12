# Phase 15 — Cloud, Teams and Security

## Goal

Create the production multi-user platform.

## SaaS capabilities

- organizations
- workspaces
- teams
- membership
- RBAC
- project isolation
- integration credentials
- audit logs
- subscriptions
- quotas

## Security

- tenant isolation
- secret scanning/redaction
- encryption in transit
- encryption at rest
- credential vaulting
- scoped agent tokens
- API key hashing
- audit trails
- least privilege
- rate limiting
- abuse protection

## Deployment

- AWS
- Terraform
- managed Postgres
- Neo4j deployment
- Redis
- NATS
- S3
- ECS/EKS only when justified
- CloudFront for web assets

## Acceptance criteria

Two organizations cannot access one another's projects, graph, embeddings, sessions, artifacts or integration credentials.
