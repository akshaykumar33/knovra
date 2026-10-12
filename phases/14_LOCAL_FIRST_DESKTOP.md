# Phase 14 — Local-First and Desktop

## Goal

Make Knovra usable without requiring Knovra Cloud.

## Build

- Go daemon
- Tauri desktop app
- local configuration
- local project registry
- local cache/storage
- MCP endpoint
- local-only mode
- optional sync interface

## Requirements

- Windows
- macOS
- Linux
- safe lifecycle/startup
- no mandatory cloud account for local usage
- private repositories remain local in local-only mode

## Acceptance criteria

A developer can install Knovra locally, index a repository and use it from an agent without cloud infrastructure.
