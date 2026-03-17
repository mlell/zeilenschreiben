/* Test file for TypingLine.svelte - Character-by-character feedback.
 * Focuses on visual feedback for typed characters, errors, and completion states.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import TypingLine from './TypingLine.svelte';

describe('TypingLine.svelte - Character-by-character feedback', () => {
  // ========== CHARACTER FEEDBACK ========== //
  describe('Character styling', () => {
    it('highlights correctly typed characters in bold green', () => {
      const { container } = render(TypingLine, {
        props: { targetText: 'Hello', typedText: 'Hel', hasError: false },
      });

      const charSpans = container.querySelectorAll('.char');
      // First 3 characters should be typed and correct
      for (let i = 0; i < 3; i++) {
        expect(charSpans[i]?.classList.contains('typed')).toBe(true);
        expect(charSpans[i]?.classList.contains('correct')).toBe(true);
        // Check that the .correct class is applied (which sets color via CSS)
        // The computed style would show rgb values but we verify via class presence
      }
      // Remaining characters should not be typed
      for (let i = 3; i < 5; i++) {
        expect(charSpans[i]?.classList.contains('typed')).toBe(false);
        expect(charSpans[i]?.classList.contains('correct')).toBe(false);
      }
    });

    it('displays cursor at the current typing position', () => {
      const { container } = render(TypingLine, {
        props: { targetText: 'Hello', typedText: 'Hel', hasError: false },
      });

      const cursorChar = container.querySelector('.char.cursor');
      expect(cursorChar).not.toBeNull();
      // Get the text content without child elements (bubbles)
      expect(cursorChar?.textContent?.replace(/\s+$/, '').replace(/^\s+/, '')).toBe('l'); // Cursor at 4th character ('l')
    });

    it('applies line-through and error color when hasError is true', () => {
      const { container } = render(TypingLine, {
        props: { targetText: 'Hello', typedText: 'Hel', hasError: true },
      });

      const textDisplay = container.querySelector('.text-display.error');
      expect(textDisplay).not.toBeNull();
      // Check that the error class is applied (which sets text-decoration via CSS)
      expect(textDisplay?.classList.contains('error')).toBe(true);
    });
  });

  // ========== MESSAGE BUBBLES ========== //
  describe('Message bubbles', () => {
    it('shows error bubble when typing error occurs', () => {
      render(TypingLine, {
        props: { targetText: 'Hello', typedText: 'Hel', hasError: true },
      });

      const errorBubble = screen.getByTestId('error-bubble');
      expect(errorBubble).toBeTruthy();
      expect(errorBubble.textContent).toBe('ENTER drücken');
      expect(errorBubble.classList.contains('error-bubble')).toBe(true);
    });

    it('shows success bubble when line is completed correctly', () => {
      render(TypingLine, {
        props: { targetText: 'Hello', typedText: 'Hello', hasError: false },
      });

      const successBubble = screen.getByTestId('success-bubble');
      expect(successBubble).toBeTruthy();
      expect(successBubble.textContent).toBe('ENTER drücken');
      expect(successBubble.classList.contains('success-bubble')).toBe(true);
    });

    it('does not show any bubble when typing is in progress without errors', () => {
      render(TypingLine, {
        props: { targetText: 'Hello', typedText: 'Hel', hasError: false },
      });

      expect(screen.queryByTestId('error-bubble')).toBeNull();
      expect(screen.queryByTestId('success-bubble')).toBeNull();
    });

    it('does not show success bubble if line is incomplete', () => {
      render(TypingLine, {
        props: { targetText: 'Hello', typedText: 'Hell', hasError: false },
      });

      expect(screen.queryByTestId('success-bubble')).toBeNull();
    });
  });

  // ========== SPACE HANDLING ========== //
  describe('Space character handling', () => {
    it('renders spaces as non-breaking spaces for consistent width', () => {
      const { container } = render(TypingLine, {
        props: { targetText: 'Hello world', typedText: 'Hello ', hasError: false },
      });

      const charSpans = container.querySelectorAll('.char');
      // The 6th character is a space - check raw text content
      const spaceCharText = charSpans[5]?.textContent;
      expect(spaceCharText?.charCodeAt(0)).toBe(160); // Non-breaking space Unicode
    });

    it('highlights typed spaces as correct when matched', () => {
      const { container } = render(TypingLine, {
        props: { targetText: 'Hello world', typedText: 'Hello ', hasError: false },
      });

      const spaceChar = container.querySelectorAll('.char')[5];
      expect(spaceChar?.classList.contains('typed')).toBe(true);
      expect(spaceChar?.classList.contains('correct')).toBe(true);
    });
  });

  // ========== EDGE CASES ========== //
  describe('Edge cases', () => {
    it('handles empty target text gracefully', () => {
      const { container } = render(TypingLine, {
        props: { targetText: '', typedText: '', hasError: false },
      });

      const charSpans = container.querySelectorAll('.char');
      expect(charSpans.length).toBe(0); // No characters to render
    });

    it('handles typed text longer than target text (should not happen in practice)', () => {
      const { container } = render(TypingLine, {
        props: { targetText: 'Hi', typedText: 'Hello', hasError: false },
      });

      const charSpans = container.querySelectorAll('.char');
      // Only first 2 characters should exist (targetText is 'Hi' with 2 chars)
      expect(charSpans.length).toBe(2);
      expect(charSpans[0]?.classList.contains('typed')).toBe(true);
      expect(charSpans[1]?.classList.contains('typed')).toBe(true);
      // There should be no third character span since targetText has only 2 chars
      expect(charSpans[2]).toBeUndefined();
    });
  });
});