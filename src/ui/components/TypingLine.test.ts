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
    expect(charSpans[0]!.classList.contains('typed')).toBe(true);
    expect(charSpans[0]!.classList.contains('correct')).toBe(true);
    expect(charSpans[2]!.classList.contains('typed')).toBe(true);
    expect(charSpans[2]!.classList.contains('correct')).toBe(true);

    // Remaining characters should not be typed
    expect(charSpans[3]!.classList.contains('typed')).toBe(false);
    expect(charSpans[4]!.classList.contains('typed')).toBe(false);
  });

  it('shows error bubble when hasError is true', () => {
    render(TypingLine, {
      props: { targetText: 'Hello', typedText: 'Hel', hasError: true },
    });

    const errorBubble = screen.getByTestId('error-bubble');
    expect(errorBubble).toBeTruthy();
    expect(errorBubble.textContent).toBe('ENTER drücken');
    expect(errorBubble.classList.contains('error-bubble')).toBe(true);
  });

  it('shows success bubble when line is completed successfully', () => {
    render(TypingLine, {
      props: { targetText: 'Hello', typedText: 'Hello', hasError: false },
    });

    const successBubble = screen.getByTestId('success-bubble');
    expect(successBubble).toBeTruthy();
    expect(successBubble.textContent).toBe('ENTER drücken');
    expect(successBubble.classList.contains('success-bubble')).toBe(true);
  });

  it('does not show any bubble when typing is in progress without error', () => {
    render(TypingLine, {
      props: { targetText: 'Hello', typedText: 'Hel', hasError: false },
    });

    const errorBubble = screen.queryByTestId('error-bubble');
    const successBubble = screen.queryByTestId('success-bubble');
    expect(errorBubble).toBeNull();
    expect(successBubble).toBeNull();
  });

  it('does not show success bubble when line is incomplete', () => {
    render(TypingLine, {
      props: { targetText: 'Hello', typedText: 'Hell', hasError: false },
    });

    const successBubble = screen.queryByTestId('success-bubble');
    expect(successBubble).toBeNull();
  });
});
