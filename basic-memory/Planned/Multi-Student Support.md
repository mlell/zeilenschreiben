---
title: Multi-Student Support
type: note
permalink: basic-memory/planned/multi-student-support-1
tags:
  - feature
  - multi-user
  - future
---

# Multi-Student Support

Enable multiple students to participate in same session simultaneously.

## Features

- Multiple students per session
- Each student has unique access code
- Independent progress tracking per student
- Students cannot see each other's work
- Instructor sees all students in dashboard

## Data Structure

- Session contains array of students
- Each student has:
  - Name
  - Access code
  - Current line index
  - Array of attempts
  - Start/completion timestamps


## Synchronization

- No real-time sync (localStorage limitation)
- Dashboard polls for updates every 2 seconds
- Students write after each line completion
- Potential race conditions handled by last-write-wins

---

relates_to [[Instructor Features]]
relates_to [[LocalStorage Persistence]]
