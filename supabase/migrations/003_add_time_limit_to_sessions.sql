-- Add optional time limit to typing sessions
-- Stored in seconds to keep countdown math deterministic

ALTER TABLE typing_sessions
    ADD COLUMN IF NOT EXISTS time_limit_seconds INTEGER;

