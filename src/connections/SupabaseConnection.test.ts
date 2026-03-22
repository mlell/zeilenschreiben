/**
 * Test file for SupabaseConnection.ts - Database connection and API interactions.
 * Focuses on session creation, retrieval, and student result saving.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseConnection } from './SupabaseConnection';

type MockFetch = ReturnType<typeof vi.fn>;

describe('SupabaseConnection', () => {
  const mockUrl = 'https://mock-supabase-url.supabase.co';
  const mockKey = 'mock-anon-key';
  let connection: SupabaseConnection;

  beforeEach(() => {
    connection = new SupabaseConnection(mockUrl, mockKey);
    vi.clearAllMocks();
  });

  // ========== CONSTRUCTOR AND CONFIGURATION ========== //
  describe('Constructor and configuration', () => {
    it('initializes with correct base URL and API key', () => {
      expect(connection).toBeInstanceOf(SupabaseConnection);
      // Note: We can't directly test private properties, but we can verify behavior
    });

    it('generates correct headers for Supabase API', () => {
      // Access the headers through a method that uses them
      const headers = connection['headers'];
      expect(headers).toEqual({
        apikey: mockKey,
        Authorization: `Bearer ${mockKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      });
    });
  });

  // ========== CODE GENERATION ========== //
  describe('Code generation', () => {
    it('generates 6-character alphanumeric codes', () => {
      const code = connection['generateCode']();
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[A-Z2-9]+$/); // Uppercase letters and digits (excluding I, O, 0, 1)
    });

    it('generates different codes on multiple calls', () => {
      const code1 = connection['generateCode']();
      const code2 = connection['generateCode']();
      // Very unlikely to be the same, but possible
      expect(code1).not.toBe(code2);
    });

    it('excludes confusing characters (I, O, 0, 1)', () => {
      for (let i = 0; i < 100; i++) {
        const code = connection['generateCode']();
        expect(code).not.toMatch(/[IO01]/);
      }
    });
  });

  // ========== SESSION CREATION ========== //
  describe('Session creation', () => {
    it('creates session with correct payload structure', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([{ id: '1', code: 'ABC123', text: 'Test', time_limit_seconds: 300 }]),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      const session = await connection.createSession('Test text', 300);

      const fetchMock = fetch as unknown as MockFetch;
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [, requestOptions] = fetchMock.mock.calls[0]!;

      expect(requestOptions.method).toBe('POST');
      expect(requestOptions.headers).toBe(connection['headers']);

      const body = JSON.parse(requestOptions.body);
      expect(body.text).toBe('Test text');
      expect(body.time_limit_seconds).toBe(300);
      expect(body.code).toMatch(/^[A-Z2-9]{6}$/);

      expect(session).toEqual({ id: '1', code: 'ABC123', text: 'Test', time_limit_seconds: 300 });
    });

    it('handles session creation with null time limit', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([{ id: '1', code: 'ABC123', text: 'Test', time_limit_seconds: null }]),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      const session = await connection.createSession('Test text', null);

      const fetchMock = fetch as unknown as MockFetch;
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [, requestOptions] = fetchMock.mock.calls[0]!;

      expect(requestOptions.method).toBe('POST');
      expect(requestOptions.headers).toBe(connection['headers']);

      const body = JSON.parse(requestOptions.body);
      expect(body.text).toBe('Test text');
      expect(body.time_limit_seconds).toBeNull();
      expect(body.code).toMatch(/^[A-Z2-9]{6}$/);

      expect(session).toEqual({ id: '1', code: 'ABC123', text: 'Test', time_limit_seconds: null });
    });

    it('throws error when session creation fails', async () => {
      const mockResponse = {
        ok: false,
        text: vi.fn().mockResolvedValue('Database error'),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(connection.createSession('Test text', 300)).rejects.toThrow(
        'Failed to create session: Database error'
      );
    });
  });

  // ========== SESSION RETRIEVAL ========== //
  describe('Session retrieval', () => {
    it('retrieves session by code successfully', async () => {
      const mockSession = { id: '1', code: 'ABC123', text: 'Test', time_limit_seconds: 300 };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([mockSession]),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      const session = await connection.getSessionByCode('abc123');

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        `${mockUrl}/rest/v1/typing_sessions?code=eq.ABC123&limit=1`,
        {
          method: 'GET',
          headers: connection['headers'],
        }
      );

      expect(session).toEqual(mockSession);
    });

    it('normalizes code to uppercase and trims whitespace', async () => {
      const mockSession = { id: '1', code: 'ABC123', text: 'Test', time_limit_seconds: 300 };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([mockSession]),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      await connection.getSessionByCode('  abc123  ');

      expect(fetch).toHaveBeenCalledWith(
        `${mockUrl}/rest/v1/typing_sessions?code=eq.ABC123&limit=1`,
        expect.any(Object)
      );
    });

    it('returns null when session is not found', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([]), // Empty array
      };

      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      const session = await connection.getSessionByCode('NONE123');

      expect(session).toBeNull();
    });

    it('throws error when session retrieval fails', async () => {
      const mockResponse = {
        ok: false,
        text: vi.fn().mockResolvedValue('Network error'),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(connection.getSessionByCode('ABC123')).rejects.toThrow(
        'Failed to fetch session: Network error'
      );
    });
  });

  // ========== STUDENT RESULT SAVING ========== //
  describe('Student result saving', () => {
    it('saves student result with correct payload structure', async () => {
      const mockResult = {
        id: '1',
        session_id: 'session-1',
        student_name: 'Test Student',
        typed_text: 'Typed text',
        success_count: 2,
        failure_count: 1,
        accuracy: 67,
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([mockResult]),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await connection.saveStudentResult(
        'session-1',
        'Test Student',
        'Typed text',
        2,
        1,
        67
      );

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(`${mockUrl}/rest/v1/student_results`, {
        method: 'POST',
        headers: connection['headers'],
        body: JSON.stringify({
          session_id: 'session-1',
          student_name: 'Test Student',
          typed_text: 'Typed text',
          success_count: 2,
          failure_count: 1,
          accuracy: 67,
        }),
      });

      expect(result).toEqual(mockResult);
    });

    it('throws error when result saving fails', async () => {
      const mockResponse = {
        ok: false,
        text: vi.fn().mockResolvedValue('Validation error'),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(
        connection.saveStudentResult('session-1', 'Test Student', 'Typed text', 2, 1, 67)
      ).rejects.toThrow('Failed to save result: Validation error');
    });
  });

  // ========== SESSION RESULTS RETRIEVAL ========== //
  describe('Session results retrieval', () => {
    it('retrieves all results for a session', async () => {
      const mockResults = [
        { id: '1', student_name: 'Student 1', success_count: 2, failure_count: 1, accuracy: 67 },
        { id: '2', student_name: 'Student 2', success_count: 3, failure_count: 0, accuracy: 100 },
      ];

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResults),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      const results = await connection.getSessionResults('session-1');

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        `${mockUrl}/rest/v1/student_results?session_id=eq.session-1&order=completed_at.desc`,
        {
          method: 'GET',
          headers: connection['headers'],
        }
      );

      expect(results).toEqual(mockResults);
    });

    it('returns empty array when no results exist', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([]),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      const results = await connection.getSessionResults('session-1');

      expect(results).toEqual([]);
    });

    it('throws error when results retrieval fails', async () => {
      const mockResponse = {
        ok: false,
        text: vi.fn().mockResolvedValue('Authentication error'),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(connection.getSessionResults('session-1')).rejects.toThrow(
        'Failed to fetch results: Authentication error'
      );
    });
  });

  // ========== ERROR HANDLING ========== //
  describe('Error handling', () => {
    it('handles network errors gracefully', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network timeout'));

      await expect(connection.createSession('Test', 300)).rejects.toThrow();
      await expect(connection.getSessionByCode('ABC123')).rejects.toThrow();
      await expect(
        connection.saveStudentResult('session-1', 'Student', 'Text', 1, 0, 100)
      ).rejects.toThrow();
      await expect(connection.getSessionResults('session-1')).rejects.toThrow();
    });

    it('includes error details in thrown exceptions', async () => {
      const mockResponse = {
        ok: false,
        text: vi.fn().mockResolvedValue('Custom error message'),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      try {
        await connection.createSession('Test', 300);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toContain('Custom error message');
        }
      }
    });
  });

  // ========== EDGE CASES ========== //
  describe('Edge cases', () => {
    it('handles empty text in session creation', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([{ id: '1', code: 'ABC123', text: '', time_limit_seconds: null }]),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      const session = await connection.createSession('', null);

      const fetchMock = fetch as unknown as MockFetch;
      const [, requestOptions] = fetchMock.mock.calls[0]!;
      const body = JSON.parse(requestOptions.body);

      expect(body.text).toBe('');
      expect(body.time_limit_seconds).toBeNull();
      expect(body.code).toMatch(/^[A-Z2-9]{6}$/);

      expect(session).toEqual({ id: '1', code: 'ABC123', text: '', time_limit_seconds: null });
    });

    it('handles special characters in student names', async () => {
      const mockResult = {
        id: '1',
        session_id: 'session-1',
        student_name: 'Student "Test" O\'Brien',
        typed_text: 'Text',
        success_count: 1,
        failure_count: 0,
        accuracy: 100,
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([mockResult]),
      };

      globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await connection.saveStudentResult(
        'session-1',
        'Student "Test" O\'Brien',
        'Text',
        1,
        0,
        100
      );

      expect(fetch).toHaveBeenCalledWith(
        `${mockUrl}/rest/v1/student_results`,
        expect.objectContaining({
          body: JSON.stringify({
            session_id: 'session-1',
            student_name: 'Student "Test" O\'Brien',
            typed_text: 'Text',
            success_count: 1,
            failure_count: 0,
            accuracy: 100,
          }),
        })
      );

      expect(result).toEqual(mockResult);
    });
  });
});
