# Knovra Git & Version Control Engineering Standards

This document establishes the mandatory Git governance, branching model, commit conventions, and the **Big Explanation Style** specification for all human engineers and AI agents contributing to the Knovra codebase.

---

## 1. Core Philosophy

In Knovra, **Git history is not disposable ephemeral logs; it is a primary input to project intelligence**.
AI coding agents (Codex, Claude, Antigravity) and human developers ingest Git commits, diffs, and PR descriptions to understand *why* code exists, what decisions were made, and how subsystems interact.

Therefore, every commit must be:
1. **Atomic & Scoped**: One logical change per commit.
2. **Deterministic & Buildable**: The repository must compile and pass tests at every commit on `main` and `develop`.
3. **Explanatory**: Commit messages must document context, rationale, affected subsystems, and verification evidence.

---

## 2. Branching Strategy

```text
main (v0.0.0) ───●──────────────────────────────────────────────● (v0.1.0)
                  \                                            /
develop            ●───────────●───────────●──────────────────●
                                \         /
feature/phase-05-semantic        ●───────●
```

### Branch Hierarchy

| Branch | Purpose | Protection Rules |
|---|---|---|
| `main` | Production-ready, fully tested releases. Every milestone release is strictly tagged here (`v0.0.0`, `v0.1.0`, `v1.0.0`). | Protected. No direct pushes. Merges only via approved PR from `develop`. |
| `develop` | Active integration branch. Where accepted phases and features converge. | Protected. Requires passing CI pipeline and Phase Acceptance sign-off. |
| `feature/phase-XX-<slug>` | Dedicated feature branch for each Knovra phase (e.g. `feature/phase-05-semantic-memory`). | Branched from `develop`, rebased onto `develop` before merge. |
| `fix/<slug>` | Bug fixes with regression tests. | Branched from `develop` (or `main` for hotfixes). |
| `docs/<slug>` | Documentation, governance, or specification updates. | Branched from `develop`. |

### Branch Naming Rules
- Must be all lowercase.
- Use hyphens (`-`) as word separators; never underscores or camelCase.
- Phase branches must follow: `feature/phase-<number>-<slug>`.
  - *Example*: `feature/phase-05-semantic-memory`
  - *Example*: `feature/phase-06-decision-memory`

---

## 3. Commit Title Conventions

Every commit must start with a semantic, conventional commit title:

```text
<type>(<scope>): <imperative summary under 72 chars>
```

### Allowed Types
* `feat`: A new feature, phase deliverable, or user-facing capability.
* `fix`: A bug fix, panic resolution, or regression correction.
* `refactor`: Code change that neither fixes a bug nor adds a feature.
* `perf`: Performance optimization (must include benchmark proof).
* `test`: Adding missing tests or correcting existing tests.
* `infra`: Docker, CI/CD, Terraform, or local runtime infrastructure.
* `docs`: Documentation, README, architectural specs, or comments.
* `chore`: Dependency updates, tooling, or repository housekeeping.

### Allowed Scopes
* `foundation`: Monorepo structure, tooling, base health checks (`Phase 01`)
* `ingest`: Repository scanner, language/framework detection (`Phase 02`)
* `indexer`: Rust Tree-sitter code intelligence engine (`Phase 03`)
* `graph`: Neo4j context knowledge graph & Cypher queries (`Phase 04`)
* `semantic`: PostgreSQL + pgvector vector memory & chunking (`Phase 05`)
* `decision`: Architecture Decision Records & supersession tracking (`Phase 06`)
* `git`: Git and conversation transcript ingestion (`Phase 07`)
* `planner`: Context bundle assembler & token budgeter (`Phase 08`)
* `gateway`: Model Context Protocol (MCP) server & CLI (`Phase 09`)
* `events`: NATS JetStream agent event pipeline (`Phase 10`)
* `incremental`: File watchers & cache invalidation (`Phase 11`)
* `impact`: Dependency traversal & blast-radius analysis (`Phase 12`)
* `web`: Next.js product dashboard & graph visualization (`Phase 13`)
* `desktop`: Tauri local-first desktop application (`Phase 14`)
* `security`: RBAC, multi-tenancy & secret redaction (`Phase 15`)
* `eval`: Benchmarks, reliability & production evaluation (`Phase 16`)

---

## 4. The "Big Explanation Style" Specification

Significant commits (especially phase completions, architectural additions, and cross-subsystem changes) **must** follow the **Big Explanation Style**.

### Template

```markdown
<type>(<scope>): <concise title under 72 characters>

### Motivation & Context
Explain WHY this change was made, what architectural need it satisfies, and what problem it resolves. Include references to user goals or Phase roadmap files.

### Subsystems Affected
- apps/web
- apps/api
- services/runtime
- services/code-indexer
- services/context-engine
- packages/contracts
- infra/docker

### Detailed Changes Breakdown
- **Component A (`path/to/file`)**: Detailed description of algorithmic choices, data models, or new exports.
- **Component B (`path/to/file`)**: Specific behavioral change or refactoring.
- **Component C (`path/to/file`)**: New test cases or configuration bindings.

### Architectural Invariants Preserved
- [x] Invariant #1: AI agents do not own Knovra context. Knovra owns context and agents consume it.
- [x] Invariant #2: Mandatory provenance attached to all derived entities.
- [x] Invariant #3: Non-destructive / supersession-aware history preserved.
- [x] Invariant #6: Zero secret leakage in logs, embeddings, or graph properties.
- [x] Invariant #7: Local-first offline execution capability maintained.

### Verification & Test Evidence
Provide actual command lines executed and proof of passing status:
```text
$ cargo test --manifest-path services/code-indexer/Cargo.toml
test result: ok. 7 passed; 0 failed

$ go test -v ./...
PASS: ok knovra/runtime/internal/graph
```

### Breaking Changes & Migration
State "None" or explicitly document:
- Schema migrations required
- Configuration variables added or renamed
- Incompatible interface changes

### Milestone & Phase Traceability
- **Phase Target**: `phases/XX_<NAME>.md`
- **Milestone**: Milestone V0 / V0.1 / V0.2 / etc.
- **Next Step**: Recommended follow-up phase or feature
```

---

## 5. Pull Request & Code Review Standards

Every Pull Request must:
1. Target `develop` (never merge directly into `main` except during milestone release tagging).
2. Have a clear descriptive title matching conventional commit format.
3. Include the Phase Acceptance checklist from `quality/PHASE_ACCEPTANCE_PROMPT.md`.
4. Pass all automated CI jobs (`.github/workflows/ci.yml`).
5. Maintain a clean, linear git history (prefer rebase and squash or semi-linear merge).

---

## 6. Milestone Tagging & Release Conventions

Releases are tagged on `main` following Semantic Versioning (`vMAJOR.MINOR.PATCH`):
- `v0.0.0`: Milestone V0 — Understand Code (Phases 01 - 04)
- `v0.1.0`: Milestone V0.1 — Retrieve Context (Phases 05 - 08)
- `v0.2.0`: Milestone V0.2 — Share Context Across Agents (Phases 09 - 10)
- `v0.3.0`: Milestone V0.3 — Continuous Project Intelligence (Phases 11 - 12)
- `v0.4.0`: Milestone V0.4 — Product Experience (Phases 13 - 14)
- `v1.0.0`: Milestone V1 — Production & Teams (Phases 15 - 16)

All tags must be annotated with a milestone release summary:
```bash
git tag -a v0.0.0 -m "Release v0.0.0: Milestone V0 — Understand Code Complete"
```
