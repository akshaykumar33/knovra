# Phase 02 — Repository / Project Ingestion

## Goal

Allow Knovra to register and inspect a local Git repository.

## Build

Go runtime/CLI commands:

```bash
knovra init
knovra add .
knovra status
knovra inspect
```

Detect:

- Git repository
- root directory
- languages
- frameworks
- package managers
- workspaces/monorepos
- config files
- Docker
- CI
- cloud/IaC signals

Implement ignore behavior for:

- node_modules
- build output
- vendored/generated files
- binaries
- .git internals
- configurable exclusions

Persist repository/project metadata.

## Acceptance criteria

A real multi-language repository can be added and inspected without parsing code symbols yet.
