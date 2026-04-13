-- Database initialization script for Zeilenschreiben
-- Combines all migrations into a single initialization file for PostgreSQL + PostgREST

-- Create typing_sessions table
CREATE TABLE IF NOT EXISTS typing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(6) UNIQUE NOT NULL,
    text TEXT NOT NULL,
    time_limit_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create student_results table
CREATE TABLE IF NOT EXISTS student_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES typing_sessions(id) ON DELETE CASCADE,
    student_name VARCHAR(100) NOT NULL,
    typed_text TEXT NOT NULL,
    success_count INTEGER NOT NULL DEFAULT 0,
    failure_count INTEGER NOT NULL DEFAULT 0,
    accuracy INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_typing_sessions_code ON typing_sessions(code);
CREATE INDEX IF NOT EXISTS idx_student_results_session_id ON student_results(session_id);

-- Enable Row Level Security
ALTER TABLE typing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_results ENABLE ROW LEVEL SECURITY;

-- RLS policies for typing_sessions
CREATE POLICY "Allow anonymous read" ON typing_sessions
    FOR SELECT
    USING (true);

CREATE POLICY "Allow anonymous insert" ON typing_sessions
    FOR INSERT
    WITH CHECK (true);

-- RLS policies for student_results
CREATE POLICY "Allow anonymous read" ON student_results
    FOR SELECT
    USING (true);

CREATE POLICY "Allow anonymous insert" ON student_results
    FOR INSERT
    WITH CHECK (true);
