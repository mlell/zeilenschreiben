-- Create the typing_sessions table for storing teacher-created sessions
-- Each session has a unique code that students use to access the text

CREATE TABLE IF NOT EXISTS typing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(6) UNIQUE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast code lookups (students access by code)
CREATE INDEX IF NOT EXISTS idx_typing_sessions_code ON typing_sessions(code);

-- Enable Row Level Security
ALTER TABLE typing_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read sessions (students need to fetch by code)
CREATE POLICY "Allow anonymous read" ON typing_sessions
    FOR SELECT
    USING (true);

-- Allow anonymous users to create sessions (teachers create without auth)
CREATE POLICY "Allow anonymous insert" ON typing_sessions
    FOR INSERT
    WITH CHECK (true);
