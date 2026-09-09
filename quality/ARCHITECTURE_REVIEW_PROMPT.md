# Architecture Review Prompt

Review Knovra's current architecture for boundary erosion and unnecessary complexity.

Check whether each responsibility still belongs in its intended layer:

- Next.js -> product UI
- NestJS -> SaaS/business API
- Go -> runtime/CLI/gateway
- Rust -> code intelligence
- Python -> AI/context intelligence
- Neo4j -> relationships
- PostgreSQL -> transactional truth
- pgvector -> semantic vectors
- Redis -> ephemeral cache
- NATS -> asynchronous events

Identify:

- duplicate services
- circular dependencies
- cross-layer database access
- duplicated schemas
- poorly defined ownership
- unnecessary microservices
- premature abstractions
- performance bottlenecks
- missing contracts
- inconsistent IDs
- stale data risks

Recommend only changes with a clear correctness, scalability, maintainability or operational benefit.
