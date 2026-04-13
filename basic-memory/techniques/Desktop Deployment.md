---
title: Desktop Deployment
type: note
permalink: desktop-deployment
tags:
- deployment
- tauri
- desktop
- offline
---

# Desktop Deployment

Tauri-based desktop application for offline typing practice. Dual-mode architecture supports both web (PostgreSQL) and desktop (file-based) deployments.

## Observations

- [decision] Use Tauri 2.x for cross-platform desktop builds #deployment
- [architecture] Environment-aware connection layer switches between web/desktop modes via `src/connections/connectionFactory.ts::createConnection()` #design
- [technique] Dependency injection via Svelte context API (`src/connections/connectionContext.ts`) for connection abstraction #pattern
- [fact] Desktop mode loads sessions from markdown files via `src/connections/FileSystemConnection.ts::FileSystemConnection`, no backend required #offline
- [fact] Rust backend commands in `src-tauri/src/commands.rs::read_session_file()` parse session files #implementation
- [requirement] Session files use YAML frontmatter with code and optional timeLimit, documented in `sessions/README.md` #format
- [decision] Results displayed but not persisted in desktop mode (student-only) #limitation
- [fact] Configuration in `src-tauri/tauri.conf.json` bundles sessions directory with app #packaging

## Relations

- extends [[Architecture Overview]]
- implements [[Domain Model]]
- uses [[Connection Abstraction Layer]]
- uses [[Session File Format]]