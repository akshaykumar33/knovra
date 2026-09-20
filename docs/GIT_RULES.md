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
| `feature/<slug>` | Capability work outside the numbered phase roadmap. | Branched from `develop`. |
| `fix/<slug>` | Bug fixes with regression tests. | Branched from `develop` (or `main` for hotfixes). |
| `ui/<slug>` | Visual, layout, design-system, or responsive work. | Branched from `develop`. Requires UI/UX evidence in the PR. |
| `docs/<slug>` | Documentation, governance, or specification updates. | Branched from `develop`. |
| `chore/<slug>` | Dependencies, tooling, repository housekeeping. | Branched from `develop`. |
| `hotfix/<slug>` | Urgent production defect. | Branched from `main`; merged to `main` **and** back-merged to `develop`. |

### Branch Naming Rules
- Must be all lowercase.
- Use hyphens (`-`) as word separators; never underscores or camelCase.
- Phase branches must follow: `feature/phase-<number>-<slug>`.
  - *Example*: `feature/phase-05-semantic-memory`
  - *Example*: `feature/phase-06-decision-memory`
- One concern per branch. If the name needs the word "and", the work must be split.
- Slugs describe the *outcome*, not the activity: `ui/graph-focus-mode`, never `ui/changes`.

### Branch Creation Protocol

> [!IMPORTANT]
> **No work begins on `main` or `develop`.** The `.githooks/pre-commit` branch guard rejects direct
> commits to both. This is not advisory — it is enforced locally and must also be enforced by
> GitHub branch protection (see §2.1).

Always branch from a freshly synced integration branch:

```bash
git switch develop
git pull --ff-only origin develop        # never a merge-pull; if this fails, reconcile deliberately
git switch -c feature/phase-13-context-graph-focus-mode
```

If you started editing on `develop` by mistake, nothing is lost — carry the work over:

```bash
git switch -c feature/phase-13-context-graph-focus-mode   # uncommitted changes follow you
```

If you already committed to a protected branch locally (before hooks were installed):

```bash
git switch -c feature/<slug>          # branch keeps the commits
git switch develop
git reset --hard origin/develop       # restore develop to the remote state
```

Keep the branch current while you work, and rebase rather than merge:

```bash
git fetch origin
git rebase origin/develop
git push --force-with-lease            # never plain --force
```

Delete the branch after merge (`gh pr merge --delete-branch` does this for you). Long-lived
feature branches accumulate conflicts and are themselves a defect.

### 2.1 Required GitHub Branch Protection

Local hooks protect the developer; branch protection protects the repository. Both `main` and
`develop` must be configured with:

- Require a pull request before merging (no direct pushes, no force-pushes, no deletions).
- Require all status checks from `.github/workflows/ci.yml` to pass, including the secret scan job.
- Require branches to be up to date before merging.
- Require conversation resolution before merging.
- Dismiss stale approvals when new commits are pushed.
- Restrict who can push to `main` to release engineering only.
- Enable GitHub secret scanning **and** push protection at the repository level.

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

## 5. Mandatory Git Intervention: Zero-Defect Quality Gate ("Check All Errors & Fix Before Proceeding")

> [!CAUTION]
> **NON-NEGOTIABLE RULE**: Every commit, pull request, and phase transition MUST pass through the **Zero-Defect Intervention Gate**.
> If ANY compiler error, type check failure, linter warning, test breakage, or unhandled defect exists in modified or affected subsystems, you **MUST STOP IMMEDIATELY**, diagnose and fix the root cause, re-verify until 100% green, and **ONLY THEN** proceed.

### The Intervention Protocol

1. **Stop & Inspect Before Committing**:
   - Never commit code with failing tests, compilation errors, or unresolved linter warnings.
   - Never use `--no-verify` or bypass flags to escape failing checks.
   - Never defer a broken build with "TODO: fix later" commits.

2. **Mandatory Multi-Language Quality Verification**:
   Before staging and committing, run the verification matrix for all touched subsystems:

   | Subsystem / Language | Check / Lint Command | Test Command | Required Outcome |
   |---|---|---|---|
   | **Rust (`code-indexer`)** | `cargo check --workspace` | `cargo test --workspace` | 0 errors, 0 test failures |
   | **Go (`runtime`)** | `go vet ./...` | `go test -v ./...` | Clean exit code 0, all tests pass |
   | **Python (`context-engine`)** | `ruff check .` | `pytest -v` | All checks passed, 100% green tests |
   | **TypeScript (`apps/*`, `packages/*`)** | `pnpm typecheck` / `pnpm lint` | `pnpm test` | 0 type errors, 0 failures |

3. **Immediate Remediation Workflow**:
   If an error or issue is detected during verification:
   - **Step A (Halt)**: Cease new feature development immediately.
   - **Step B (Diagnose)**: Identify the exact file, line, and root cause (syntax, type mismatch, contract divergence, unhandled edge case).
   - **Step C (Fix)**: Implement the minimal, robust, and clean fix preserving all architectural invariants.
   - **Step D (Re-Verify)**: Re-run the full subsystem test suite to guarantee zero regressions.
   - **Step E (Advance)**: Only when all checks exit with code 0 may the commit be crafted and pushed.

4. **Automated Git Hook Enforcement**:
   Repository hooks live in `.githooks/`. **Install them once per clone — this is the first command you run after `git clone`:**
   ```bash
   git config core.hooksPath .githooks
   ```

   | Hook | Enforces |
   |---|---|
   | `.githooks/pre-commit` | Branch guard, sensitive data gate, hygiene checks, `apps/web` typecheck, Go/Python/Rust subsystem verification |
   | `.githooks/commit-msg` | Conventional commit subject: valid type, valid scope, ≤72 chars, no trailing period |

   Verify the installation:
   ```bash
   git config --get core.hooksPath      # must print .githooks
   ```

   > [!CAUTION]
   > `--no-verify` is **forbidden**. It is not a shortcut for a slow gate, a flaky check, or an
   > urgent fix — it is how broken code and leaked credentials enter history. If a gate is wrong,
   > fix the gate in its own `chore/` pull request.

---

## 6. Codebase Protection: The Sensitive Data Gate

> [!CAUTION]
> **A committed secret is a leaked secret.** Git history is distributed, mirrored, and — in this
> repository specifically — *ingested by AI agents*. Deleting a line later does not revoke a
> credential. Prevention is the only working control.

### 6.1 Never Commit

| Category | Examples |
|---|---|
| Environment files with real values | `.env`, `.env.local`, `.env.production` (commit `.env.example` instead) |
| Key material | `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.jks`, `id_rsa`, SSH/GPG keys |
| Provider credentials | AWS/GCP/Azure keys, `service-account.json`, Anthropic/OpenAI keys, GitHub/GitLab/Slack tokens |
| Registry credentials | `.npmrc` with `_authToken`, `.pypirc`, Docker `config.json` |
| Connection strings with inline passwords | `postgres://user:<password>@host/db`, `bolt://neo4j:<password>@host` — with a real value in place of `<password>` |
| Signed tokens | JWTs, session cookies, signed URLs |
| Infrastructure state | `terraform.tfstate` (embeds provider secrets in plaintext) |
| Real data | Customer data, PII, production dumps, captured agent transcripts containing customer code |
| Oversized blobs | Anything over 2 MB — build output, datasets, binaries, screenshots-as-fixtures |

Configuration is documented **by variable name only**, in `.env.example`. Values live in a secret
manager or the developer's local untracked environment. This is Invariant #6, and it applies to
logs, embeddings, graph properties, prompts and test fixtures — not just source files.

### 6.2 Mandatory Pre-Commit Verification Sequence

Run this every time, in this order. Do not stage with `git add .` — stage deliberately.

```bash
git add -p                 # 1. review every hunk as you stage it
git status                 # 2. confirm nothing unexpected is staged
git diff --cached          # 3. read the exact diff you are about to publish
npm run scan:secrets       # 4. sensitive data gate over staged changes
git commit                 # 5. hooks re-run every gate before the commit is created
```

Step 3 is not optional ceremony. Most leaked credentials arrive as collateral inside an unrelated
file that nobody actually read before committing.

### 6.3 The Scanner

`tools/scan-secrets.mjs` inspects **only added lines**, so pre-existing content never blocks you.

```bash
npm run scan:secrets                  # staged changes (what the hook runs)
npm run scan:secrets:all              # every uncommitted change vs HEAD, plus untracked files
npm run scan:secrets:branch           # the whole branch vs origin/develop — run before opening a PR
node tools/scan-secrets.mjs --range origin/main..HEAD
```

It detects credential formats (provider tokens, private key blocks, JWTs, connection strings with
inline passwords), credential-shaped assignments, forbidden file paths, and oversized blobs.
Placeholders, `process.env` lookups, and `*.example` templates are ignored by design. Findings are
always **redacted** in output, so a scanner log never becomes a second leak.

Reviewed false positives — and nothing else:

- Append `knovra:allow-secret` as a trailing comment on the specific line, **or**
- Add a path or literal substring to `.secret-scan-allow` in the repository root.

Every allowlist entry and pragma must be justified in the pull request description. An unexplained
allowlist entry is grounds to reject the pull request.

### 6.4 Incident Protocol — A Secret Reached a Commit

Execute in this order. Step 1 is not negotiable and comes before any Git work.

1. **Rotate the credential.** Revoke the old value at the provider. Assume it is compromised the
   moment it was written to disk, whether or not the commit was pushed.
2. **Contain.** Not yet pushed → `git reset --soft HEAD~1`, remove the value, recommit. Already
   pushed → proceed to step 3.
3. **Purge history.** Use `git filter-repo` (preferred) or the BFG to strip the blob, then
   `git push --force-with-lease`. Note that GitHub may retain the object in cached views — rotation
   in step 1 is what actually protects you.
4. **Notify.** Tell everyone on the affected branch before rewriting shared history.
5. **Close the hole.** Add the variable to `.env.example`, move the value to the secret manager, and
   add a scanner rule if the pattern slipped past the gate.
6. **Record it.** Write a decision record under `docs/decisions/` — cause, blast radius, fix,
   prevention. Incidents are project intelligence too.

---

## 7. Pull Request, Review & Merge Standards

**Every change reaches `develop` through a pull request — including solo work.** The pull request is
the reviewable record of *why* a change exists, and Knovra ingests it as project intelligence.

### 7.1 Raising a Pull Request

```bash
git push -u origin feature/phase-13-context-graph-focus-mode

gh pr create \
  --base develop \
  --title "feat(web): add focus mode to the context graph explorer" \
  --body-file .github/pull_request_template.md
```

Then complete `.github/pull_request_template.md` in full. A pull request is not review-ready until:

1. It targets `develop` (only a milestone release targets `main`).
2. The title matches the conventional commit format from §3.
3. Motivation, affected subsystems, and a per-file change breakdown are written out.
4. **UI/UX evidence** is attached for any user-visible change — before/after images or a recording,
   across breakpoints and themes (see `prompts/07_UIUX_DELIVERY_PROMPT.md` §1).
5. **Functional evidence** is attached: the commands run and their real output. "Tests pass" without
   output is not evidence.
6. The invariant, sensitive-data and Zero-Defect checklists are honestly ticked.
7. The Phase Acceptance checklist from `quality/PHASE_ACCEPTANCE_PROMPT.md` is included for phase work.
8. Every new dependency carries its justification (§3 of the UI/UX prompt).
9. All CI jobs are green. A red job, or a job masked with `|| true`, blocks the merge.

Keep pull requests reviewable: under ~400 changed lines where the work allows, and never mixing a
refactor with a behavior change. Open it as a draft while work is in flight.

### 7.2 Review Standards

A reviewer must verify, not skim:

- Architectural invariants hold, and boundaries were not crossed for convenience.
- Claimed evidence actually exists, and screenshots match the described behavior.
- Failure paths are handled — not just the happy path.
- No secret, key, dump, or PII anywhere in the diff.
- No suppressed type/lint errors, no dead commented-out code, no unexplained `any`.
- Tests genuinely exercise the new behavior rather than asserting trivia.

Approval with unresolved threads is not approval. The author resolves every comment or explains why
it does not apply.

### 7.3 Merging

Rebase onto the target, re-run the local gates, then merge:

```bash
git fetch origin
git rebase origin/develop
npm run scan:secrets:branch     # rebase can pull in new content — verify again
git push --force-with-lease

gh pr merge --squash --delete-branch
```

Merge rules:

- **Default: `--squash`.** One logical change becomes one commit on `develop`. Ensure the squash
  commit message carries the Big Explanation Style body, not a list of "wip" subjects.
- **`--merge` only for milestone `develop` → `main` releases**, where individual commits carry their
  own Big Explanation bodies and must be preserved.
- **Never `--rebase`-merge a branch whose commits were not individually verified.**
- Never merge while CI is pending. Never merge past an unresolved review comment.
- Never merge your own pull request without at least one other reviewer when one is available; when
  working solo, state explicitly in the description that the change was self-reviewed and how.
- Delete the branch on merge. Keep `develop` linear.

Immediately after merge:

```bash
git switch develop
git pull --ff-only origin develop
```

For a `hotfix/*` merged into `main`, open a second pull request back-merging `main` into `develop`
the same day, or the fix will be lost at the next release.

---

## 8. Milestone Tagging & Release Conventions

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

