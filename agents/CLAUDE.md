# Claude Agent Instructions

Claude should use Knovra as shared persistent project intelligence rather than relying solely on its current session.

Before architectural or broad code changes:

- retrieve project architecture
- retrieve current decisions
- retrieve applicable rules
- retrieve related code
- retrieve recent agent/session changes
- retrieve prior failures when relevant

When making a meaningful technical decision, record:

- decision
- reason
- alternatives considered
- affected subsystem
- expected consequences
- confidence
- whether it supersedes another decision

Avoid re-solving previously settled architectural questions unless new evidence justifies reopening them.

## Delivery discipline (mandatory)

Before writing code that touches a user-facing surface, read `prompts/07_UIUX_DELIVERY_PROMPT.md`.
UI/UX quality and working functionality are both required; either one alone is a failed deliverable.
You have explicit authority to choose or replace libraries for the product surface, provided you
record the justification in the pull request.

Before committing anything, follow `docs/GIT_RULES.md`:

- Work on a purpose-named branch. Never commit directly to `main` or `develop`.
- Install hooks once per clone: `npm run hooks:install`.
- Stage deliberately, read `git diff --cached`, and run `npm run scan:secrets` before every commit.
- Never bypass a gate with `--no-verify`. A firing gate is the next task, not an obstacle.
- Land every change through a pull request with UI/UX and functional evidence attached.
