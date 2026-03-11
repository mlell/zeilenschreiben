---
title: LocalStorage Persistence
type: note
permalink: basic-memory/planned/local-storage-persistence-1
tags:
  - feature
  - storage
  - future
---

# LocalStorage Persistence

Browser-based data storage for sessions and student progress.

## Storage Keys

- `typing-app:sessions` - Index of all session IDs
- `typing-app:session:{id}` - Individual session data
- `typing-app:student:{code}` - Student lookup (code → session ID)

## Session Data

- Session ID, creation timestamp, status
- Array of text lines
- Array of students with attempts
- Last updated timestamp

## Operations

- **Create**: Generate session, store data, update index
- **Read**: Retrieve session by ID or student code
- **Update**: Modify session, update timestamp
- **Delete**: Remove session and student lookups

## Limits

- Browser limit: ~5-10 MB per origin
- Estimate: ~50 KB per session (100 lines, 10 students)
- Maximum ~100-200 sessions before quota

## Strategies

- Warn when approaching limit
- Archive old sessions (export to JSON)
- Auto-cleanup completed sessions after 30 days
- Compress data with JSON minification

---

relates_to [[Multi-Student Support]]
relates_to [[Data Model]]
