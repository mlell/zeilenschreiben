import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import TypingLine from './TypingLine.svelte';

describe('TypingLine', () => {
  it('renders target text with each character as a separate span', () => {
    render(TypingLine, { props: { targetText: 'Hello', typedText: '', hasError: false } });

    // Each character should be rendered individually
    const chars = screen.getAllByText(/./);
    expect(chars.length).toBe(5);
  });

  it('marks typed characters as correct when they match', () => {
    const { container } = render(TypingLine, {
      props: { targetText: 'Hello', typedText: 'Hel', hasError: false },
    });

    // First 3 characters should have the "typed" and "correct" classes
    const charSpans = container.querySelectorAll('.char');
    expect(charSpans[0].classList.contains('typed')).toBe(true);
    expect(charSpans[0].classList.contains('correct')).toBe(true);
    expect(charSpans[2].classList.contains('typed')).toBe(true);
    expect(charSpans[2].classList.contains('correct')).toBe(true);

    // Remaining characters should not be typed
    expect(charSpans[3].classList.contains('typed')).toBe(false);
    expect(charSpans[4].classList.contains('typed')).toBe(false);
  });
});
