# Repository Audit Prompt

Before implementing any new Knovra phase, audit the current repository.

Do not modify code during the audit.

Produce:

1. Current monorepo structure.
2. Applications and services that exist.
3. Languages and frameworks in use.
4. Databases, queues, caches and external infrastructure.
5. Existing build/test/lint/typecheck commands.
6. Existing Docker and development workflow.
7. Existing API boundaries.
8. Existing schema/contracts.
9. Existing event model.
10. Existing authentication/authorization mechanisms.
11. Known TODOs, stubs and unfinished implementations.
12. Duplicate or conflicting implementations.
13. Technical debt that directly blocks the requested phase.
14. Security concerns relevant to the requested phase.
15. Recommended minimal implementation path.

Also determine whether the repository already contains equivalent functionality before creating anything new.

End with:

READY FOR PHASE: YES / NO

If NO, list only blockers that genuinely prevent safe implementation.
