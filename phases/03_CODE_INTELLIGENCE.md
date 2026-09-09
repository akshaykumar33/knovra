# Phase 03 — Rust Code Intelligence Engine

## Goal

Create fast multi-language structural code indexing.

## Build

Rust crates:

- scanner
- language detection
- parser abstraction
- symbols
- imports
- exports
- dependency graph
- storage adapter

Use Tree-sitter.

Initial languages:

- TypeScript
- JavaScript
- Python
- Go
- Rust

Extract:

- files
- modules
- functions
- methods
- classes
- interfaces/types where supported
- imports
- exports
- basic call relationships where reliably resolvable

## Requirements

- stable symbol identifiers
- file content hashes
- parse errors must be retained and reported
- parallel scanning
- deterministic output
- benchmark representative repositories

## Acceptance criteria

Knovra can inspect a repository and produce a queryable structural symbol/dependency model.
