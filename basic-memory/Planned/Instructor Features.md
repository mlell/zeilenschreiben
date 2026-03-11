---
title: Instructor Features
type: note
permalink: basic-memory/planned/instructor-features-1
tags:
  - feature
  - instructor
  - future
---

# Instructor Features

Session creation and monitoring capabilities for instructors.

## Session Creation

- Paste text content (splits into lines)
- Enter student names (one per line)
- Generate unique 6-character access codes per student
- Display codes for distribution
- Store session in localStorage

## Dashboard

- View all students in session
- Real-time progress updates (poll every 2 seconds)
- Display metrics per student:
  - Current line number
  - Completed lines
  - Successful lines
  - Accuracy percentage
  - Average WPM
  - Fastest WPM
- Session management:
  - End session
  - View/copy access codes
  - Export results

## Validation

- Text: minimum 1 line, maximum 1000 lines, 1-200 chars per line
- Students: minimum 1, no duplicate names, max 50 chars per name
- Access codes: format `[A-Z0-9]{6}`, unique across active sessions

---

relates_to [[Architecture Overview]]
relates_to [[Multi-Student Support]]
