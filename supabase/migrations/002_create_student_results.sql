-- Create the student_results table for storing typing session outcomes
-- Links students to sessions and tracks their performance

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

-- Index for fast session lookups (teachers view results by session)
CREATE INDEX IF NOT EXISTS idx_student_results_session_id ON student_results(session_id);

-- Enable Row Level Security
ALTER TABLE student_results ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read results (teachers view student performance)
CREATE POLICY "Allow anonymous read" ON student_results
    FOR SELECT
    USING (true);

-- Allow anonymous users to insert results (students submit their work)
CREATE POLICY "Allow anonymous insert" ON student_results
    FOR INSERT
    WITH CHECK (true);
