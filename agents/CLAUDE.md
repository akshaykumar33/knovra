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
