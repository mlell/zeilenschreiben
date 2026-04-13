---
title: Session File Format
type: note
permalink: session-file-format
tags:
- format
- desktop
- sessions
- markdown
---

# Session File Format

Markdown-based session format for desktop deployment with YAML frontmatter.

## Observations

- [format] YAML frontmatter delimited by `---` markers #file-format
- [requirement] Frontmatter contains `code` (6 alphanumeric chars) and optional `timeLimit` (seconds) #schema
- [requirement] Filename must match code: `{CODE}.md` (case-insensitive lookup via `src-tauri/src/commands.rs::find_session_file()`) #naming
- [fact] Content after second `---` becomes typing lines (one per line) #content
- [validation] Code must match between filename and frontmatter, validated by `src-tauri/src/commands.rs::validate_code()` #integrity
- [requirement] At least one content line required #validation
- [fact] Example files in `sessions/EXAMPLE.md` and `sessions/HELLO1.md`, documented in `sessions/README.md` #examples

## Relations

- part_of [[Desktop Deployment]]