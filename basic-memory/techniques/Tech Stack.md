---
title: Tech Stack
type: note
permalink: tech-stack
tags:
- tech-stack
- technologies
- tools
---

# Tech Stack

Technology stack for Zeilenschreiben typing practice application.

## Frontend

- [tech] Svelte 5 with TypeScript #framework
- [tech] Vite for build tooling #build
- [tech] Vitest for unit testing #testing

## Backend (Web Mode)

- [tech] PostgreSQL 16 for data storage #database
- [tech] PostgREST for REST API generation #api
- [tech] Docker Compose for orchestration #deployment

## Desktop Mode

- [tech] Tauri 2.x for cross-platform desktop apps #desktop
- [tech] Rust (serde, serde_yaml, walkdir) for backend commands #backend
- [tech] Markdown files with YAML frontmatter for sessions #storage

## Infrastructure

- [tech] nginx for reverse proxy and rate limiting #proxy
- [tech] Docker for containerization #containers

## Relations

- implements [[Architecture Overview]]
- enables [[Desktop Deployment]]
- supports [[Connection Abstraction Layer]]