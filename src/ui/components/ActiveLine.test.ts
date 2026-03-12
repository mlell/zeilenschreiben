import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ActiveLine from './ActiveLine.svelte';

describe('ActiveLine', () => {
  it('renders with the active-line container and background highlight', () => {
    const { container } = render(ActiveLine, {
      props: { targetText: 'Test line', typedText: '', hasError: false },
    });

    // Should have the active-line wrapper with background highlight
    const activeLine = container.querySelector('.active-line');
    expect(activeLine).not.toBeNull();

    const background = container.querySelector('.active-line-bg');
    expect(background).not.toBeNull();
  });

  it('passes props correctly to the nested TypingLine component', () => {
    const { container } = render(ActiveLine, {
      props: { targetText: 'Hello', typedText: 'Hel', hasError: false },
    });

    // TypingLine should render the characters with correct typed state
    const charSpans = container.querySelectorAll('.char');
    expect(charSpans.length).toBe(5);

    // First 3 should be typed
    expect(charSpans[0].classList.contains('typed')).toBe(true);
    expect(charSpans[2].classList.contains('typed')).toBe(true);
    expect(charSpans[3].classList.contains('typed')).toBe(false);
  });
});
