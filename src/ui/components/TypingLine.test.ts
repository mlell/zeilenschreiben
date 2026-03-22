import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import TypingLine from './TypingLine.svelte';

describe('TypingLine', () => {
  it('renders target text with each character as a separate span', () => {
    render(TypingLine, { props: { targetText: 'Hello', typedText: '', hasError: false, state: 'current' } });

    const charSpans = screen.getAllByText(/./);
    expect(charSpans.length).toBe(5);
  });

  it('marks typed characters as correct when they match (current)', () => {
    const { container } = render(TypingLine, {
      props: { targetText: 'Hello', typedText: 'Hel', hasError: false, state: 'current' },
    });

    const charSpans = container.querySelectorAll('.char');
    expect(charSpans[0]!.classList.contains('typed')).toBe(true);
    expect(charSpans[0]!.classList.contains('correct')).toBe(true);
    expect(charSpans[2]!.classList.contains('typed')).toBe(true);
    expect(charSpans[2]!.classList.contains('correct')).toBe(true);

    expect(charSpans[3]!.classList.contains('typed')).toBe(false);
    expect(charSpans[4]!.classList.contains('typed')).toBe(false);
  });

  it('shows error bubble when hasError is true (current)', () => {
    render(TypingLine, {
      props: { targetText: 'Hello', typedText: 'HelX', hasError: true, state: 'current' },
    });

    const errorBubble = screen.getByTestId('error-bubble');
    expect(errorBubble).toBeTruthy();
    expect(errorBubble.textContent).toBe('ENTER drücken');
    expect(errorBubble.classList.contains('error-bubble')).toBe(true);
  });

  it('shows success bubble when line is completed successfully (current)', () => {
    render(TypingLine, {
      props: { targetText: 'Hello', typedText: 'Hello', hasError: false, state: 'current' },
    });

    const successBubble = screen.getByTestId('success-bubble');
    expect(successBubble).toBeTruthy();
    expect(successBubble.textContent).toBe('ENTER drücken');
    expect(successBubble.classList.contains('success-bubble')).toBe(true);
  });

  it('does not show any bubble when typing is in progress without error', () => {
    render(TypingLine, {
      props: { targetText: 'Hello', typedText: 'Hel', hasError: false, state: 'current' },
    });

    expect(screen.queryByTestId('error-bubble')).toBeNull();
    expect(screen.queryByTestId('success-bubble')).toBeNull();
  });

  it('does not show success bubble when line is incomplete', () => {
    render(TypingLine, {
      props: { targetText: 'Hello', typedText: 'Hell', hasError: false, state: 'current' },
    });

    expect(screen.queryByTestId('success-bubble')).toBeNull();
  });

  // Migrated intent from ActiveLine/InactiveLine tests
  it('renders dimmed future state', () => {
    const { container } = render(TypingLine, {
      props: { targetText: 'Future line', typedText: '', hasError: false, state: 'future' },
    });

    const display = container.querySelector('.text-display.future');
    expect(display).not.toBeNull();
  });

  it('renders a wrong character as wrong (failed)', () => {
    const { container } = render(TypingLine, {
      props: { targetText: 'Hello', typedText: 'HelX', hasError: true, state: 'failed' },
    });

    const charSpans = container.querySelectorAll('.char');
    expect(charSpans[3]!.classList.contains('wrong')).toBe(true);
  });
});
