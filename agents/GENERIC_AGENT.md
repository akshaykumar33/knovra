# Generic Agent Contract

Any agent integrating with Knovra should follow this lifecycle:

## Before task

- identify project/workspace
- request task context
- retrieve relevant rules
- retrieve current decisions
- retrieve relevant code/dependencies

## During task

Emit normalized events where supported:

- AgentStarted
- TaskStarted
- FileRead
- FileCreated
- FileModified
- CommandExecuted
- TestExecuted
- TestFailed
- TestPassed
- DecisionMade
- ErrorObserved
- SolutionApplied

## After task

Emit:

- TaskCompleted
- summary
- changed files
- tests
- unresolved risks
- decisions
- follow-up requirements

The agent must not assume it owns permanent memory.
