---
title: Architecture Overview
type: note
permalink: architecture-overview
tags:
  - architecture
  - design
  - svelte
---
# Architecture Overview

Touch typing grading web application built with Svelte + PostgreSQL + PostgREST, following clean architecture with domain-driven design.

## System Components

- **Frontend**: Svelte SPA with TypeScript
- **Backend**: PostgreSQL 16 + PostgREST (self-hosted)
- **Deployment**: Docker Compose with nginx reverse proxy

## System Roles

- **Teacher**: Creates sessions with text and optional time limits, generates session codes, views results
- **Student**: Accesses via 6-character code, types text line-by-line, receives immediate feedback

## Core Layers

- **Domain**: Business entities (Session, Student, TypingAttempt, Results)
- **Services**: Orchestration (SessionService, TypingService)
- **Storage**: PostgreSQL via PostgREST API (`src/connections/SupabaseConnection.ts::PostgrestConnection`)
- **UI**: Svelte components (pages and reusable components)

## Key Decisions

- **Self-hosted backend**: PostgreSQL + PostgREST instead of Supabase
- **Code-based access**: 6-character codes instead of authentication
- **Strict error policy**: Any mistake invalidates entire line
- **Anonymous access**: Row Level Security allows public read/insert
- **German UI**: User text in German, code/comments in English

## Data Flow

- **Session Creation**: Teacher creates session → generates code → stores in PostgreSQL
- **Typing Practice**: Student enters code → retrieves session → types lines → validates characters → records results
- **Results**: Teacher views dashboard → fetches results from PostgreSQL → displays statistics

## Infrastructure

- **postgres**: PostgreSQL 16 with automatic schema initialization
- **postgrest**: REST API layer (port 3000)
- **app**: Svelte frontend (port 8080)
- **nginx**: Reverse proxy with rate limiting (port 80)
  - API: 60 req/min per IP
  - App: 10 req/sec per IP


## Deployment Modes

- **Web Mode**: PostgreSQL + PostgREST backend, full teacher/student features
- **Desktop Mode**: Tauri app with file-based sessions, student-only (no result persistence)

---

relates_to [[MVP Scope]]
relates_to [[Domain Model]]
supports [[Desktop Deployment]]
uses [[Connection Abstraction Layer]]