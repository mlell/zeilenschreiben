import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileSystemConnection } from './FileSystemConnection';
import type { TypingSession } from './Connection';

// Mock Tauri invoke
const mockInvoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({
  invoke: (...args: unknown[]) => mockInvoke(...args),
}));

describe('FileSystemConnection', () => {
  let connection: FileSystemConnection;

  beforeEach(() => {
    connection = new FileSystemConnection();
    vi.clearAllMocks();
  });

  describe('getSessionByCode', () => {
    it('should load session from file and transform to TypingSession', async () => {
      const mockFileData = {
        code: 'ABC123',
        time_limit: 300,
        lines: ['Line 1', 'Line 2', 'Line 3'],
      };

      mockInvoke.mockResolvedValue(mockFileData);

      const result = await connection.getSessionByCode('ABC123');

      expect(mockInvoke).toHaveBeenCalledWith('read_session_file', { code: 'ABC123' });
      expect(result).toEqual({
        id: 'ABC123',
        code: 'ABC123',
        text: 'Line 1\nLine 2\nLine 3',
        created_at: expect.any(String),
        time_limit_seconds: 300,
      });
    });

    it('should handle session without time limit', async () => {
      const mockFileData = {
        code: 'XYZ789',
        time_limit: null,
        lines: ['Single line'],
      };

      mockInvoke.mockResolvedValue(mockFileData);

      const result = await connection.getSessionByCode('XYZ789');

      expect(result?.time_limit_seconds).toBeNull();
    });

    it('should return null when session file not found', async () => {
      mockInvoke.mockRejectedValue(new Error('Session file not found for code: NOTFOUND'));

      const result = await connection.getSessionByCode('NOTFOUND');

      expect(result).toBeNull();
    });

    it('should throw error for invalid frontmatter', async () => {
      mockInvoke.mockRejectedValue(new Error('Failed to parse frontmatter: invalid YAML'));

      await expect(connection.getSessionByCode('BAD123')).rejects.toThrow(
        'Failed to parse frontmatter'
      );
    });
  });

  describe('saveStudentResult', () => {
    it('should be a no-op and return result object', async () => {
      const result = await connection.saveStudentResult(
        'session-id',
        'Student Name',
        'typed text',
        5,
        2,
        71.4
      );

      expect(result).toEqual({
        id: expect.any(String),
        session_id: 'session-id',
        student_name: 'Student Name',
        typed_text: 'typed text',
        success_count: 5,
        failure_count: 2,
        accuracy: 71.4,
        completed_at: expect.any(String),
      });
      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });

  describe('createSession', () => {
    it('should throw error as not supported in desktop mode', async () => {
      await expect(connection.createSession('text', 300)).rejects.toThrow(
        'Session creation not supported in desktop mode'
      );
    });
  });

  describe('getSessionResults', () => {
    it('should return empty array as not supported in desktop mode', async () => {
      const results = await connection.getSessionResults('session-id');
      expect(results).toEqual([]);
    });
  });
});
