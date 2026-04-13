/**
 * TypingSession.svelte - Sparse test coverage for core typing mechanics.
 * Tests observable DOM behavior rather than internal component state.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/svelte';
import TypingSession from './TypingSession.svelte';
import * as connectionContext from '../../connections/connectionContext';

// Mock connection context to avoid Supabase calls
const mockSaveStudentResult = vi.fn().mockResolvedValue({});
vi.spyOn(connectionContext, 'getConnectionContext').mockReturnValue({
  saveStudentResult: mockSaveStudentResult,
  getSessionByCode: vi.fn(),
  createSession: vi.fn(),
  getStudentResults: vi.fn(),
  listSessions: vi.fn(),
  deleteSession: vi.fn(),
} as any);

describe('TypingSession.svelte', () => {
  const mockSession = {
    id: 'session-1',
    code: 'ABC123',
    text: 'abc\ndef',
    time_limit_seconds: null,
    created_at: '2026-03-17T00:00:00Z',
  };

  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Key press handling', () => {
    it('shows typed characters in the UI', async () => {
      render(TypingSession, {
        props: {
          session: mockSession,
          studentName: 'Test Student',
          onBack: mockOnBack,
          persistResult: vi.fn().mockResolvedValue(undefined),
        },
      });

      await fireEvent.keyDown(window, { key: 'a' });

      // The typed character should appear somewhere in the DOM
      const container = document.body;
      expect(container.textContent).toContain('a');
    });

    it('shows error state when wrong key is pressed', async () => {
      render(TypingSession, {
        props: {
          session: mockSession,
          studentName: 'Test Student',
          onBack: mockOnBack,
          persistResult: vi.fn().mockResolvedValue(undefined),
        },
      });

      // Type wrong character (expected 'a', typing 'x')
      await fireEvent.keyDown(window, { key: 'x' });

      // Error prompt should appear
      expect(screen.getByText('Drücke ENTER um fortzufahren')).toBeTruthy();
    });

    it('advances to next line when Enter is pressed after completing a line', async () => {
      render(TypingSession, {
        props: {
          session: mockSession,
          studentName: 'Test Student',
          onBack: mockOnBack,
          persistResult: vi.fn().mockResolvedValue(undefined),
        },
      });

      // Type first line correctly
      await fireEvent.keyDown(window, { key: 'a' });
      await fireEvent.keyDown(window, { key: 'b' });
      await fireEvent.keyDown(window, { key: 'c' });

      // Should show completion prompt
      expect(
        screen.getByText('Zeile vollständig! Drücke ENTER für die nächste Zeile')
      ).toBeTruthy();

      // Press Enter to advance
      await fireEvent.keyDown(window, { key: 'Enter' });

      // Success counter should show 1
      expect(screen.getByText('1 ✓')).toBeTruthy();
    });

    it('ignores Backspace key presses', async () => {
      render(TypingSession, {
        props: {
          session: mockSession,
          studentName: 'Test Student',
          onBack: mockOnBack,
          persistResult: vi.fn().mockResolvedValue(undefined),
        },
      });

      await fireEvent.keyDown(window, { key: 'a' });
      await fireEvent.keyDown(window, { key: 'Backspace' });

      // Should still show the typed 'a' and not be in error state
      expect(screen.queryByText('Drücke ENTER um fortzufahren')).toBeNull();
    });
  });

  describe('Session completion', () => {
    it('shows results when all lines are completed', async () => {
      const mockPersist = vi.fn().mockResolvedValue(undefined);
      render(TypingSession, {
        props: {
          session: mockSession,
          studentName: 'Test Student',
          onBack: mockOnBack,
          persistResult: mockPersist,
        },
      });

      // Complete first line
      for (const char of 'abc') {
        await fireEvent.keyDown(window, { key: char });
      }
      await fireEvent.keyDown(window, { key: 'Enter' });

      // Complete second line
      for (const char of 'def') {
        await fireEvent.keyDown(window, { key: char });
      }
      await fireEvent.keyDown(window, { key: 'Enter' });

      // Results should be displayed
      expect(screen.getByText('Ergebnisse')).toBeTruthy();
      expect(screen.getByText('100%')).toBeTruthy();
    });

    it('calls persistResult when session completes', async () => {
      const mockPersist = vi.fn().mockResolvedValue(undefined);
      render(TypingSession, {
        props: {
          session: mockSession,
          studentName: 'Test Student',
          onBack: mockOnBack,
          persistResult: mockPersist,
        },
      });

      // Complete both lines
      for (const char of 'abc') {
        await fireEvent.keyDown(window, { key: char });
      }
      await fireEvent.keyDown(window, { key: 'Enter' });

      for (const char of 'def') {
        await fireEvent.keyDown(window, { key: char });
      }
      await fireEvent.keyDown(window, { key: 'Enter' });

      expect(mockPersist).toHaveBeenCalledTimes(1);
      expect(mockPersist).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'session-1',
          studentName: 'Test Student',
        })
      );
    });
  });

  describe('Countdown timer', () => {
    it('displays remaining time when session has time limit', async () => {
      vi.useFakeTimers();

      const timedSession = { ...mockSession, time_limit_seconds: 60 };
      render(TypingSession, {
        props: {
          session: timedSession,
          studentName: 'Test Student',
          onBack: mockOnBack,
          persistResult: vi.fn().mockResolvedValue(undefined),
        },
      });

      expect(screen.getByText('Zeit übrig:')).toBeTruthy();
      expect(screen.getByText('1:00')).toBeTruthy();
    });

    it('does not display timer when no time limit', () => {
      render(TypingSession, {
        props: {
          session: mockSession,
          studentName: 'Test Student',
          onBack: mockOnBack,
          persistResult: vi.fn().mockResolvedValue(undefined),
        },
      });

      expect(screen.queryByText('Zeit übrig:')).toBeNull();
    });
  });

  describe('Countdown timeout', () => {
    it('completes the session when countdown reaches zero', async () => {
      vi.useFakeTimers();
      const mockPersist = vi.fn().mockResolvedValue(undefined);
      const timedSession = { ...mockSession, time_limit_seconds: 2 };

      render(TypingSession, {
        props: {
          session: timedSession,
          studentName: 'Test Student',
          onBack: mockOnBack,
          persistResult: mockPersist,
        },
      });

      await vi.advanceTimersByTimeAsync(3000);

      expect(screen.getByText('Ergebnisse')).toBeTruthy();
      expect(mockPersist).toHaveBeenCalledTimes(1);
    });

    it('records a partial attempt when timeout fires mid-line', async () => {
      vi.useFakeTimers();
      const mockPersist = vi.fn().mockResolvedValue(undefined);
      const timedSession = { ...mockSession, time_limit_seconds: 2 };

      render(TypingSession, {
        props: {
          session: timedSession,
          studentName: 'Test Student',
          onBack: mockOnBack,
          persistResult: mockPersist,
        },
      });

      await fireEvent.keyDown(window, { key: 'a' });
      await vi.advanceTimersByTimeAsync(3000);

      expect(mockPersist).toHaveBeenCalledTimes(1);
      expect(mockPersist).toHaveBeenCalledWith(expect.objectContaining({ sessionId: 'session-1' }));
    });

    it('decrements the timer each second', async () => {
      vi.useFakeTimers();
      const timedSession = { ...mockSession, text: 'abc', time_limit_seconds: 60 };

      render(TypingSession, {
        props: {
          session: timedSession,
          studentName: 'Test Student',
          onBack: mockOnBack,
          persistResult: vi.fn().mockResolvedValue(undefined),
        },
      });

      expect(screen.getByText('1:00')).toBeTruthy();

      await vi.advanceTimersByTimeAsync(1000);
      expect(screen.getByText('0:59')).toBeTruthy();
    });
  });

  describe('Save error handling', () => {
    it('shows error message when persistResult rejects', async () => {
      const mockPersist = vi.fn().mockRejectedValue(new Error('Netzwerkfehler'));
      render(TypingSession, {
        props: {
          session: mockSession,
          studentName: 'Test Student',
          onBack: mockOnBack,
          persistResult: mockPersist,
        },
      });

      for (const char of 'abc') {
        await fireEvent.keyDown(window, { key: char });
      }
      await fireEvent.keyDown(window, { key: 'Enter' });
      for (const char of 'def') {
        await fireEvent.keyDown(window, { key: char });
      }
      await fireEvent.keyDown(window, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Netzwerkfehler')).toBeTruthy();
      });
    });

    it('restarts the session when "Nochmal versuchen" is clicked', async () => {
      const mockPersist = vi.fn().mockResolvedValue(undefined);
      render(TypingSession, {
        props: {
          session: mockSession,
          studentName: 'Test Student',
          onBack: mockOnBack,
          persistResult: mockPersist,
        },
      });

      for (const char of 'abc') {
        await fireEvent.keyDown(window, { key: char });
      }
      await fireEvent.keyDown(window, { key: 'Enter' });
      for (const char of 'def') {
        await fireEvent.keyDown(window, { key: char });
      }
      await fireEvent.keyDown(window, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Ergebnisse')).toBeTruthy();
      });

      await fireEvent.click(screen.getByText('Nochmal versuchen'));

      expect(screen.queryByText('Ergebnisse')).toBeNull();
    });

    it('calls onBack when "Andere Session" is clicked', async () => {
      const mockPersist = vi.fn().mockResolvedValue(undefined);
      render(TypingSession, {
        props: {
          session: mockSession,
          studentName: 'Test Student',
          onBack: mockOnBack,
          persistResult: mockPersist,
        },
      });

      for (const char of 'abc') {
        await fireEvent.keyDown(window, { key: char });
      }
      await fireEvent.keyDown(window, { key: 'Enter' });
      for (const char of 'def') {
        await fireEvent.keyDown(window, { key: char });
      }
      await fireEvent.keyDown(window, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Ergebnisse')).toBeTruthy();
      });

      await fireEvent.click(screen.getByText('Andere Session'));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Student name display', () => {
    it('displays the student name prominently', () => {
      render(TypingSession, {
        props: {
          session: mockSession,
          studentName: 'Max Mustermann',
          onBack: mockOnBack,
          persistResult: vi.fn().mockResolvedValue(undefined),
        },
      });

      expect(screen.getByText('Max Mustermann')).toBeTruthy();
    });
  });
});
