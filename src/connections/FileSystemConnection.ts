/**
 * FileSystemConnection.ts - Desktop mode connection implementation.
 * Loads and creates typing sessions as markdown files via Tauri filesystem commands.
 * Does not support result persistence (results are displayed locally only).
 */

import { invoke } from '@tauri-apps/api/core';
import type { Connection, TypingSession, StudentResult } from './Connection';

interface SessionFileData {
  code: string;
  time_limit: number | null;
  lines: string[];
}

export class FileSystemConnection implements Connection {
  /**
   * Load session from markdown file by code.
   * @param code - 6-character session code
   * @returns Session object or null if not found
   */
  async getSessionByCode(code: string): Promise<TypingSession | null> {
    try {
      const fileData = await invoke<SessionFileData>('read_session_file', { code });

      return {
        id: fileData.code,
        code: fileData.code,
        text: fileData.lines.join('\n'),
        created_at: new Date().toISOString(),
        time_limit_seconds: fileData.time_limit,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * No-op implementation for desktop mode.
   * Results are displayed but not persisted.
   */
  async saveStudentResult(
    sessionId: string,
    studentName: string,
    typedText: string,
    successCount: number,
    failureCount: number,
    accuracy: number
  ): Promise<StudentResult> {
    return {
      id: crypto.randomUUID(),
      session_id: sessionId,
      student_name: studentName,
      typed_text: typedText,
      success_count: successCount,
      failure_count: failureCount,
      accuracy,
      completed_at: new Date().toISOString(),
    };
  }

  /**
   * Create a new session by writing a markdown file.
   * @param text - Session content (lines separated by newlines)
   * @param timeLimitSeconds - Optional time limit in seconds
   * @returns Created session object
   */
  async createSession(text: string, timeLimitSeconds: number | null): Promise<TypingSession> {
    const fileData = await invoke<SessionFileData>('create_session_file', {
      text,
      time_limit_seconds: timeLimitSeconds,
    });

    return {
      id: fileData.code,
      code: fileData.code,
      text: fileData.lines.join('\n'),
      created_at: new Date().toISOString(),
      time_limit_seconds: fileData.time_limit,
    };
  }

  /**
   * Not supported in desktop mode - no result persistence.
   */
  async getSessionResults(_sessionId: string): Promise<StudentResult[]> {
    return [];
  }
}
