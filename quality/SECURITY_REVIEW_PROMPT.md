# Security Review Prompt

Perform a security-focused review of Knovra.

Inspect:

- authentication
- authorization
- project/tenant isolation
- graph query scoping
- vector query scoping
- object storage
- MCP endpoints
- agent credentials
- integration tokens
- logs
- embeddings
- imported conversations
- repository contents
- environment configuration
- Docker/cloud configuration

Specifically test for:

- cross-project access
- cross-organization access
- insecure direct object references
- prompt/context data leakage
- secret ingestion
- secret embedding
- token logging
- unbounded graph/Cypher access
- unsafe file paths
- command injection
- path traversal
- SSRF
- injection
- missing rate limits
- overly broad cloud permissions

Return findings with severity, evidence, exploit scenario and remediation.
