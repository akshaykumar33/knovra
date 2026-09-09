# Phase 04 — Context Graph

## Goal

Persist project intelligence as a provenance-aware graph.

## Core nodes

- Organization
- Workspace
- Project
- Repository
- Directory
- File
- Module
- Package
- Function
- Class
- API
- Service
- DatabaseTable
- Commit
- Branch
- PullRequest
- Decision
- Reason
- Constraint
- Rule
- Requirement
- Conversation
- Session
- Message
- Agent
- ToolCall
- Error
- Solution

## Core relationships

Examples:

- Project HAS_REPOSITORY Repository
- Repository CONTAINS File
- File DECLARES Function
- File IMPORTS File
- Function CALLS Function
- Commit MODIFIES File
- Decision AFFECTS Module
- Decision JUSTIFIED_BY Reason
- Decision SUPERSEDES Decision
- Error RESOLVED_BY Solution
- Agent EXECUTED ToolCall

## Provenance fields

Every derived entity or relation must support:

- source
- source_id
- created_at
- updated_at
- confidence
- extractor/version
- project_id

## Acceptance criteria

Indexed code produces Neo4j nodes and relationships and remains traceable to its source.
