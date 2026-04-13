---
title: Domain Model
type: note
permalink: domain-model
tags:
  - domain
  - entities
---

# Domain Model

Core business entities for the touch typing application.

## TypingSession

Session created by instructor for students to practice typing.

- **Code reference**: `src/connections/Connection.ts::TypingSession`
- **Database**: `supabase/migrations/001_create_typing_sessions.sql`
- **Fields**: `id`, `code`, `text`, `created_at`, `time_limit_seconds`
- **Access pattern**: Students join via 6-character code
- **Time limit**: Optional countdown timer in seconds

## StudentResult

Aggregated result after student completes session.

- **Code reference**: `src/connections/Connection.ts::StudentResult`
- **Database**: `supabase/migrations/002_create_student_results.sql`
- **Fields**: `id`, `session_id`, `student_name`, `typed_text`, `success_count`, `failure_count`, `accuracy`, `completed_at`
- **Accuracy**: Integer percentage (0-100)
- **Tracking**: Counts successful vs failed line attempts

## Key Constraints

- Session code: 6 characters, unique
- Student name: Max 100 characters
- Text: Stored as single string (newline-separated)
- Accuracy: Integer 0-100
- Results: Linked to session via foreign key with cascade delete

---

relates_to [[Architecture Overview]]
relates_to [[Coding standards]]
