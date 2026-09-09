# Knovra Refactor Prompt

Refactor only when there is a concrete maintainability, correctness, performance or architecture benefit.

First prove:

- what is duplicated
- what is tightly coupled
- what boundary is violated
- what performance problem exists
- what testing difficulty exists

Preserve behavior.

Prefer:

- explicit interfaces
- cohesive modules
- narrow service responsibilities
- typed contracts
- clear ownership of persistence
- dependency injection only where useful
- simple data flow

Avoid:

- speculative abstractions
- generic factories with one implementation
- excessive microservices
- class hierarchies without need
- cross-language fragmentation without performance or ownership justification

After refactoring, run all impacted tests and demonstrate behavioral equivalence.
