# Generic Phase Implementation Prompt

Implement the requested Knovra phase using the repository's current architecture and the master Knovra specification.

Before coding:

- inspect relevant code
- inspect interfaces and schemas
- inspect tests
- inspect dependent systems
- identify reusable functionality

During implementation:

- keep changes scoped to this phase
- preserve backward compatibility unless explicitly allowed otherwise
- use typed contracts
- add validation at boundaries
- add structured logging where needed
- add metrics/traces for critical paths
- add unit tests
- add integration tests where multiple services interact
- update docs/contracts when behavior changes

Do not:

- replace architecture with shortcuts
- create duplicate systems
- use mock implementations in production paths
- suppress errors or warnings
- hard-code environment-specific paths
- expose secrets
- skip migrations when schema changes are necessary

At completion provide:

## Implemented

## Files changed

## Interfaces/contracts changed

## Tests added

## Commands executed

## Verification results

## Known limitations

## Risks

## Next recommended phase
