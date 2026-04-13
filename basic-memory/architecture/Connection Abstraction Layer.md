---
title: Connection Abstraction Layer
type: note
permalink: connection-abstraction-layer
tags:
- architecture
- abstraction
- dependency-injection
- pattern
---

# Connection Abstraction Layer

Abstraction layer enabling dual-mode deployment (web/desktop) through environment-aware dependency injection.

## Observations

- [pattern] Strategy pattern for connection implementations via `src/connections/Connection.ts::Connection` interface #design-pattern
- [technique] Factory pattern in `src/connections/connectionFactory.ts::createConnection()` detects Tauri environment via `window.__TAURI__` #runtime-detection
- [technique] Svelte context API (`src/connections/connectionContext.ts::getConnectionContext()`) provides connection instance to component tree #dependency-injection
- [fact] Two implementations: `src/connections/PostgrestConnection.ts::PostgrestConnection` (web) and `src/connections/FileSystemConnection.ts::FileSystemConnection` (desktop) #implementations
- [decision] Deprecated singleton pattern in favor of context-based DI, initialized in `src/main.ts` #refactoring

## Relations

- part_of [[Desktop Deployment]]
- enables [[Architecture Overview]]