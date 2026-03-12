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
}
