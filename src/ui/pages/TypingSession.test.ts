// Test file for TypingSession.svelte - Core typing logic and session management.
// Focuses on key press handling, countdown logic, and session completion.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import TypingSession from './TypingSession.svelte';

// Mock the getConnection function to avoid Supabase calls
vi.mock('../../connections', () => ({
  getConnection: vi.fn(() => ({
    saveStudentResult: vi.fn().mockResolvedValue({}),
  })),
}));

describe('TypingSession.svelte', () => {
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
    vi.useFakeTimers();
  });

  // ========== KEY PRESS LOGIC ========== //
  describe('Key press handling', () => {
    it('processes valid character key presses and updates typedText', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Simulate typing 'L' (first character of first line)
      await fireEvent.keyDown(window, { key: 'L' });
      expect(component.typedText).toBe('L');

      // Simulate typing 'i' (second character)
      await fireEvent.keyDown(window, { key: 'i' });
      expect(component.typedText).toBe('Li');
    });

    it('ignores Backspace key presses to enforce no-backspace pedagogy', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Type a character first
      await fireEvent.keyDown(window, { key: 'L' });
      expect(component.typedText).toBe('L');

      // Attempt to press Backspace - should be ignored
      await fireEvent.keyDown(window, { key: 'Backspace' });
      expect(component.typedText).toBe('L'); // No change
    });

    it('detects typing errors and sets hasError flag', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Type an incorrect character
      await fireEvent.keyDown(window, { key: 'X' }); // First character should be 'L'
      expect(component.hasError).toBe(true);
      expect(component.typedText).toBe('X');
    });

    it('advances to next line when Enter is pressed after completing a line', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Type the entire first line correctly
      const firstLine = 'Line one';
      for (const char of firstLine) {
        await fireEvent.keyDown(window, { key: char });
      }
      expect(component.typedText).toBe(firstLine);
      expect(component.hasError).toBe(false);

      // Press Enter to advance
      await fireEvent.keyDown(window, { key: 'Enter' });
      expect(component.currentLineIndex).toBe(1); // Moved to second line
      expect(component.typedText).toBe(''); // Reset for new line
      expect(component.hasError).toBe(false);
    });

    it('records failed attempt when Enter is pressed with an error', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Type an incorrect character
      await fireEvent.keyDown(window, { key: 'X' });
      expect(component.hasError).toBe(true);

      // Press Enter to record the failed attempt
      await fireEvent.keyDown(window, { key: 'Enter' });
      expect(component.attempts).toEqual([false]); // Failed attempt recorded
      expect(component.currentLineIndex).toBe(1); // Moved to next line
    });
  });

  // ========== COUNTDOWN LOGIC ========== //
  describe('Countdown timer', () => {
    it('starts countdown when session has a time limit', async () => {
      const timedSession = {
        ...mockSession,
        time_limit_seconds: 10, // 10-second limit
      };

      const { component } = render(TypingSession, {
        props: { session: timedSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Verify countdown starts at the full time limit
      expect(component.remainingSeconds).toBe(10);
    });

    it('decrements remaining time every second', async () => {
      const timedSession = {
        ...mockSession,
        time_limit_seconds: 5, // 5-second limit
      };

      const { component } = render(TypingSession, {
        props: { session: timedSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Fast-forward time by 2 seconds
      vi.advanceTimersByTime(2000);
      expect(component.remainingSeconds).toBe(3);
    });

    it('terminates session when countdown reaches zero', async () => {
      const timedSession = {
        ...mockSession,
        time_limit_seconds: 2, // 2-second limit
      };

      const { component } = render(TypingSession, {
        props: { session: timedSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Fast-forward time to trigger timeout
      vi.advanceTimersByTime(2000);
      expect(component.remainingSeconds).toBe(0);
      expect(component.isComplete).toBe(true);
    });

    it('stops countdown when session is completed manually', async () => {
      const timedSession = {
        ...mockSession,
        time_limit_seconds: 10,
      };

      const { component } = render(TypingSession, {
        props: { session: timedSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Complete the session by typing all lines
      for (const line of ['Line one', 'Line two', 'Line three']) {
        for (const char of line) {
          await fireEvent.keyDown(window, { key: char });
        }
        await fireEvent.keyDown(window, { key: 'Enter' });
      }

      // Verify session is complete and countdown is stopped
      expect(component.isComplete).toBe(true);
      const remainingTime = component.remainingSeconds;
      vi.advanceTimersByTime(2000); // Fast-forward 2 seconds
      expect(component.remainingSeconds).toBe(remainingTime); // No change
    });
  });

  // ========== RESULTS CALCULATION ========== //
  describe('Results calculation', () => {
    it('calculates accuracy based on successful and failed attempts', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Simulate 2 successful attempts and 1 failed attempt
      component.attempts = [true, true, false];
      await component.$$.update(); // Trigger reactive statement

      expect(component.successCount).toBe(2);
      expect(component.failureCount).toBe(1);
      expect(component.accuracy).toBe(67); // 2/3 ≈ 67%
    });

    it('handles division by zero when no attempts have been made', async () => {
      const { component } = render(TypingSession, {
        props: { session: mockSession, studentName: 'Test Student', onBack: mockOnBack },
      });

      // No attempts made
      expect(component.attempts.length).toBe(0);
      expect(component.accuracy).toBe(0); // Default to 0%
    });
  });
});