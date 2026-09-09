# Knovra Product Definition

## One-line definition

Knovra is a universal persistent project-intelligence layer that lets every AI coding agent share the same accurate understanding of a software system.

## Problem

AI coding agents repeatedly lose important project context:

- architectural decisions
- why code exists
- prior failed attempts
- security rules
- related files and dependencies
- commit and PR history
- conversations from other agents
- project-specific conventions
- current versus superseded decisions

This causes duplicated work, regressions, hallucinated architecture, context-window waste, and vendor lock-in.

## Product promise

Knovra should answer:

- What is this project?
- How is it architected?
- What does this function depend on?
- What breaks if this file changes?
- Why was this technology selected?
- Which decision superseded an older one?
- What did Codex change yesterday?
- What did Claude try before that?
- What project rules apply to this task?
- What context does this agent need right now?

## Product boundary

Knovra is NOT:

- an LLM provider
- a replacement IDE
- a generic chatbot
- only a vector database
- only a Neo4j graph viewer
- a repository mirroring product

Knovra IS:

- project intelligence
- code graph
- decision graph
- semantic retrieval
- working memory
- historical memory
- agent interoperability
- context planning
- provenance and freshness management

## Golden rule

Models are replaceable.

Context is durable.

Knovra must remain useful even if the preferred models, agents, IDEs, or providers completely change.
