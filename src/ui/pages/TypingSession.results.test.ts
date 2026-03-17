// Test file for TypingSession.svelte - Results calculation and display.
// Focuses on accuracy calculation, attempt tracking, and results saving.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import TypingSession from './TypingSession.svelte';

// Mock the getConnection function to avoid Supabase calls
vi.mock('../../connections', () => ({
  getConnection: vi.fn(() => ({
    saveStudentResult: vi.fn().mockResolvedValue({}),
  })),
}));

describe('TypingSession.svelte - Results calculation', () => {
  const mockSession = {
    id: 'session-1',
    code: 'ABC123',
    text: 'Line one\nLine two\nLine three',
    time_limit_seconds: null,
    created_at: '2026-03-17T00:00:00Z',
  };

  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ========== ATTEMPT TRACKING ========== //
  describe('Attempt tracking', () => {
    it('records successful attempt when line is completed correctly', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Type the first line correctly
      const firstLine = 'Line one';
      for (const char of firstLine) {
        await fireEvent.keyDown(window, { key: char });
      }

      // Press Enter to record the attempt
      await fireEvent.keyDown(window, { key: 'Enter' });

      expect(component.attempts).toEqual([true]);
      expect(component.typedLines).toEqual(['Line one']);
    });

    it('records failed attempt when line has errors', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Type an incorrect character
      await fireEvent.keyDown(window, { key: 'X' });
      expect(component.hasError).toBe(true);

      // Press Enter to record the failed attempt
      await fireEvent.keyDown(window, { key: 'Enter' });

      expect(component.attempts).toEqual([false]);
      expect(component.typedLines).toEqual(['X']);
    });

    it('records multiple attempts correctly', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // First line - successful
      const firstLine = 'Line one';
      for (const char of firstLine) {
        await fireEvent.keyDown(window, { key: char });
      }
      await fireEvent.keyDown(window, { key: 'Enter' });

      // Second line - failed
      await fireEvent.keyDown(window, { key: 'X' });
      await fireEvent.keyDown(window, { key: 'Enter' });

      // Third line - successful
      const thirdLine = 'Line three';
      for (const char of thirdLine) {
        await fireEvent.keyDown(window, { key: char });
      }
      await fireEvent.keyDown(window, { key: 'Enter' });

      expect(component.attempts).toEqual([true, false, true]);
      expect(component.typedLines).toEqual(['Line one', 'X', 'Line three']);
    });
  });

  // ========== RESULTS CALCULATION ========== //
  describe('Results calculation', () => {
    it('calculates success count correctly', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Simulate attempts: 2 successful, 1 failed
      component.attempts = [true, true, false];
      await component.$$.update();

      expect(component.successCount).toBe(2);
    });

    it('calculates failure count correctly', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Simulate attempts: 1 successful, 2 failed
      component.attempts = [true, false, false];
      await component.$$.update();

      expect(component.failureCount).toBe(2);
    });

    it('calculates accuracy as percentage of successful attempts', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Simulate 3 attempts: 2 successful, 1 failed
      component.attempts = [true, true, false];
      await component.$$.update();

      expect(component.accuracy).toBe(67); // 2/3 ≈ 67%
    });

    it('returns 0 accuracy when no attempts have been made', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // No attempts made
      expect(component.attempts.length).toBe(0);
      expect(component.accuracy).toBe(0);
    });

    it('returns 100 accuracy when all attempts are successful', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Simulate all successful attempts
      component.attempts = [true, true, true];
      await component.$$.update();

      expect(component.accuracy).toBe(100);
    });

    it('returns 0 accuracy when all attempts are failed', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Simulate all failed attempts
      component.attempts = [false, false, false];
      await component.$$.update();

      expect(component.accuracy).toBe(0);
    });

    it('rounds accuracy to nearest integer', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Simulate 1 successful out of 3 attempts (33.333...%)
      component.attempts = [true, false, false];
      await component.$$.update();

      expect(component.accuracy).toBe(33); // Rounded down

      // Simulate 2 successful out of 3 attempts (66.666...%)
      component.attempts = [true, true, false];
      await component.$$.update();

      expect(component.accuracy).toBe(67); // Rounded up
    });
  });

  // ========== SESSION COMPLETION ========== //
  describe('Session completion', () => {
    it('marks session as complete when all lines are finished', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Complete all lines
      for (const line of ['Line one', 'Line two', 'Line three']) {
        for (const char of line) {
          await fireEvent.keyDown(window, { key: char });
        }
        await fireEvent.keyDown(window, { key: 'Enter' });
      }

      expect(component.isComplete).toBe(true);
    });

    it('triggers results saving when session is completed', async () => {
      const mockSave = vi.fn().mockResolvedValue({});
      vi.mock('../../connections', () => ({
        getConnection: vi.fn(() => ({
          saveStudentResult: mockSave,
        })),
      }));

      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Complete all lines
      for (const line of ['Line one', 'Line two', 'Line three']) {
        for (const char of line) {
          await fireEvent.keyDown(window, { key: char });
        }
        await fireEvent.keyDown(window, { key: 'Enter' });
      }

      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledWith(
        mockSession.id,
        'Test Student',
        'Line one\nLine two\nLine three',
        3, // successCount
        0, // failureCount
        100 // accuracy
      );
    });

    it('handles errors during results saving gracefully', async () => {
      const mockError = new Error('Database error');
      vi.mock('../../connections', () => ({
        getConnection: vi.fn(() => ({
          saveStudentResult: vi.fn().mockRejectedValue(mockError),
        })),
      }));

      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Complete all lines
      for (const line of ['Line one', 'Line two', 'Line three']) {
        for (const char of line) {
          await fireEvent.keyDown(window, { key: char });
        }
        await fireEvent.keyDown(window, { key: 'Enter' });
      }

      expect(component.isSaving).toBe(false);
      expect(component.saveError).toBe('Database error');
    });
  });

  // ========== RESTART FUNCTIONALITY ========== //
  describe('Restart functionality', () => {
    it('resets all state when session is restarted', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Complete the session
      for (const line of ['Line one', 'Line two', 'Line three']) {
        for (const char of line) {
          await fireEvent.keyDown(window, { key: char });
        }
        await fireEvent.keyDown(window, { key: 'Enter' });
      }

      expect(component.isComplete).toBe(true);
      expect(component.attempts.length).toBe(3);

      // Restart the session
      await component.restart();

      expect(component.currentLineIndex).toBe(0);
      expect(component.typedText).toBe('');
      expect(component.hasError).toBe(false);
      expect(component.attempts).toEqual([]);
      expect(component.typedLines).toEqual([]);
      expect(component.isComplete).toBe(false);
      expect(component.saveError).toBe('');
    });

    it('resets countdown when session is restarted', async () => {
      const timedSession = { ...mockSession, time_limit_seconds: 10 };
      const { component } = render(TypingSession, {
        props: { session: timedSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Fast-forward time by 3 seconds
      vi.advanceTimersByTime(3000);
      expect(component.remainingSeconds).toBe(7);

      // Restart the session
      await component.restart();
      expect(component.remainingSeconds).toBe(10); // Reset to full time
    });
  });

  // ========== EDGE CASES ========== //
  describe('Edge cases', () => {
    it('handles session with no lines', async () => {
      const emptySession = { ...mockSession, text: '' };
      const { component } = render(TypingSession, {
        props: { session: emptySession, studentName: 'Test Student', onBack: mockOnBack },
      });

      expect(component.lines.length).toBe(0);
      expect(component.isComplete).toBe(true); // Automatically complete
    });

    it('handles session with only empty lines', async () => {
      const emptyLinesSession = { ...mockSession, text: '\n\n\n' };
      const { component } = render(TypingSession, {
        props: { session: emptyLinesSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      expect(component.lines.length).toBe(0); // Empty lines are filtered
      expect(component.isComplete).toBe(true); // Automatically complete
    });

    it('handles session with single line', async () => {
      const singleLineSession = { ...mockSession, text: 'Single line' };
      const { component } = render(TypingSession, {
        props: { session: singleLineSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Type the single line
      for (const char of 'Single line') {
        await fireEvent.keyDown(window, { key: char });
      }
      await fireEvent.keyDown(window, { key: 'Enter' });

      expect(component.isComplete).toBe(true);
      expect(component.attempts).toEqual([true]);
    });
  });
});