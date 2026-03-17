// Test file for TypingSession.svelte - Countdown logic and session termination.
// Focuses on timer behavior, session completion, and edge cases.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import TypingSession from './TypingSession.svelte';

// Mock the getConnection function to avoid Supabase calls
vi.mock('../../connections', () => ({
  getConnection: vi.fn(() => ({
    saveStudentResult: vi.fn().mockResolvedValue({}),
  })),
}));

describe('TypingSession.svelte - Countdown logic and session termination', () => {
  const mockSessionBase = {
    id: 'session-1',
    code: 'ABC123',
    text: 'Line one\nLine two\nLine three',
    created_at: '2026-03-17T00:00:00Z',
  };

  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  // ========== COUNTDOWN INITIALIZATION ========== //
  describe('Countdown initialization', () => {
    it('does not start countdown when time_limit_seconds is null', () => {
      const session = { ...mockSessionBase, time_limit_seconds: null };
      const { component } = render(TypingSession, {
        props: { session, studentName: 'Test Student', onBack: mockOnBack },
      });

      expect(component.remainingSeconds).toBeNull();
      expect(component.countdownInterval).toBeNull();
    });

    it('does not start countdown when time_limit_seconds is 0', () => {
      const session = { ...mockSessionBase, time_limit_seconds: 0 };
      const { component } = render(TypingSession, {
        props: { session, studentName: 'Test Student', onBack: mockOnBack },
      });

      expect(component.remainingSeconds).toBeNull();
      expect(component.countdownInterval).toBeNull();
    });

    it('starts countdown with correct initial time when time_limit_seconds is set', () => {
      const session = { ...mockSessionBase, time_limit_seconds: 120 }; // 2 minutes
      const { component } = render(TypingSession, {
        props: { session, studentName: 'Test Student', onBack: mockOnBack },
      });

      expect(component.remainingSeconds).toBe(120);
      expect(component.countdownInterval).not.toBeNull();
    });
  });

  // ========== COUNTDOWN BEHAVIOR ========== //
  describe('Countdown behavior', () => {
    it('decrements remaining time every second', () => {
      const session = { ...mockSessionBase, time_limit_seconds: 5 };
      const { component } = render(TypingSession, {
        props: { session, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Fast-forward time by 2 seconds
      vi.advanceTimersByTime(2000);
      expect(component.remainingSeconds).toBe(3);
    });

    it('formats remaining time as MM:SS', async () => {
      const session = { ...mockSessionBase, time_limit_seconds: 90 }; // 1:30
      const { component } = render(TypingSession, {
        props: { session, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Fast-forward time by 30 seconds
      vi.advanceTimersByTime(30000);
      await component.$$.update(); // Trigger reactive statement
      expect(component.formattedRemainingTime).toBe('1:00');
    });

    it('pads single-digit seconds with leading zero', async () => {
      const session = { ...mockSessionBase, time_limit_seconds: 65 }; // 1:05
      const { component } = render(TypingSession, {
        props: { session, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Fast-forward time by 60 seconds
      vi.advanceTimersByTime(60000);
      await component.$$.update();
      expect(component.formattedRemainingTime).toBe('0:05');
    });
  });

  // ========== SESSION TERMINATION ========== //
  describe('Session termination', () => {
    it('completes session when countdown reaches zero', async () => {
      const session = { ...mockSessionBase, time_limit_seconds: 2 };
      const { component } = render(TypingSession, {
        props: { session, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Fast-forward time to trigger timeout
      vi.advanceTimersByTime(2000);
      await component.$$.update();

      expect(component.remainingSeconds).toBe(0);
      expect(component.isComplete).toBe(true);
    });

    it('stops countdown when session is completed manually', async () => {
      const session = { ...mockSessionBase, time_limit_seconds: 10 };
      const { component } = render(TypingSession, {
        props: { session, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Complete the session by typing all lines
      for (const line of ['Line one', 'Line two', 'Line three']) {
        for (const char of line) {
          await fireEvent.keyDown(window, { key: char });
        }
        await fireEvent.keyDown(window, { key: 'Enter' });
      }

      // Verify session is complete
      expect(component.isComplete).toBe(true);
      const remainingTime = component.remainingSeconds;

      // Fast-forward time - countdown should not decrement
      vi.advanceTimersByTime(2000);
      expect(component.remainingSeconds).toBe(remainingTime);
    });

    it('records current attempt when session terminates due to timeout', async () => {
      const session = { ...mockSessionBase, time_limit_seconds: 2 };
      const { component } = render(TypingSession, {
        props: { session, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Type some characters before timeout
      await fireEvent.keyDown(window, { key: 'L' });
      await fireEvent.keyDown(window, { key: 'i' });

      // Fast-forward time to trigger timeout
      vi.advanceTimersByTime(2000);
      await component.$$.update();

      expect(component.attempts.length).toBe(1); // Attempt recorded
      expect(component.isComplete).toBe(true);
    });

    it('does not record attempt if no typing occurred before timeout', async () => {
      const session = { ...mockSessionBase, time_limit_seconds: 2 };
      const { component } = render(TypingSession, {
        props: { session, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Fast-forward time to trigger timeout without typing
      vi.advanceTimersByTime(2000);
      await component.$$.update();

      expect(component.attempts.length).toBe(0); // No attempt recorded
      expect(component.isComplete).toBe(true);
    });
  });

  // ========== COUNTDOWN LIFECYCLE ========== //
  describe('Countdown lifecycle', () => {
    it('stops countdown when component is destroyed', () => {
      const session = { ...mockSessionBase, time_limit_seconds: 10 };
      const { unmount, component } = render(TypingSession, {
        props: { session, studentName: 'Test Student', onBack: mockOnBack },
      });

      const initialInterval = component.countdownInterval;
      expect(initialInterval).not.toBeNull();

      // Unmount the component
      unmount();
      expect(component.countdownInterval).toBeNull();
    });

    it('restarts countdown when session is restarted', async () => {
      const session = { ...mockSessionBase, time_limit_seconds: 10 };
      const { component } = render(TypingSession, {
        props: { session, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Fast-forward time by 3 seconds
      vi.advanceTimersByTime(3000);
      expect(component.remainingSeconds).toBe(7);

      // Restart the session
      await component.restart();
      expect(component.remainingSeconds).toBe(10); // Reset to full time
    });
  });

  // ========== UI FEEDBACK ========== //
  describe('UI feedback', () => {
    it('displays remaining time when countdown is active', async () => {
      const session = { ...mockSessionBase, time_limit_seconds: 60 };
      const { getByText } = render(TypingSession, {
        props: { session, studentName: 'Test Student', onBack: mockOnBack },
      });

      // Fast-forward time by 1 second to ensure reactive update
      vi.advanceTimersByTime(1000);
      await new Promise(resolve => setTimeout(resolve, 0)); // Allow reactive update

      expect(getByText(/Zeit übrig:/)).toBeTruthy();
      expect(getByText('1:00')).toBeTruthy();
    });

    it('does not display remaining time when countdown is inactive', () => {
      const session = { ...mockSessionBase, time_limit_seconds: null };
      const { queryByText } = render(TypingSession, {
        props: { session, studentName: 'Test Student', onBack: mockOnBack },
      });

      expect(queryByText(/Zeit übrig:/)).toBeNull();
    });
  });
});