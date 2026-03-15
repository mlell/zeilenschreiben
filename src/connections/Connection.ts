/**
 * Connection.ts - Abstract interface for backend storage operations.
 * Encapsulates the data access pattern, allowing different backends
 * (Supabase, localStorage, mock) to be swapped without changing business logic.
 */

export interface TypingSession {
  id: string;
  code: string;
  text: string;
  created_at: string;
}

export interface StudentResult {
  id: string;
  session_id: string;
  student_name: string;
  typed_text: string;
  success_count: number;
  failure_count: number;
  accuracy: number;
  completed_at: string;
}

export interface Connection {
  /**
   * Store a new typing session with the given text.
   * @returns The generated session with its unique access code
   */
  createSession(text: string): Promise<TypingSession>;

  /**
   * Retrieve a session by its access code.
   * @returns The session if found, null otherwise
   */
  getSessionByCode(code: string): Promise<TypingSession | null>;

  /**
   * Save a student's typing result for a session.
   * @returns The saved result with generated id and timestamp
   */
  saveStudentResult(
    sessionId: string,
    studentName: string,
    typedText: string,
    successCount: number,
    failureCount: number,
    accuracy: number
  ): Promise<StudentResult>;

  /**
   * Get all student results for a session.
   * @returns Array of results ordered by completion time (newest first)
   */
  getSessionResults(sessionId: string): Promise<StudentResult[]>;
}
