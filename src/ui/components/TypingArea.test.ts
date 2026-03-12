import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import TypingArea from './TypingArea.svelte';

describe('TypingArea', () => {
  const defaultProps = {
    lines: ['Line one', 'Line two', 'Line three', 'Line four', 'Line five'],
    currentLineIndex: 2,
    typedText: 'Lin',
    hasError: false,
    attempts: [true, false],
  };

  it('displays progress indicator with current line number', () => {
    render(TypingArea, { props: defaultProps });

    // Progress should show "Zeile 3 von 5" (1-indexed)
    expect(screen.getByText('Zeile 3 von 5')).toBeDefined();
  });

  it('shows correct instruction based on typing state', () => {
    // Normal typing state
    const { unmount } = render(TypingArea, { props: defaultProps });
    expect(screen.getByText('Tippe die Zeile genau nach. Backspace ist deaktiviert.')).toBeDefined();
    unmount();

    // Error state shows different instruction
    render(TypingArea, { props: { ...defaultProps, hasError: true } });
    expect(screen.getByText('Drücke ENTER um fortzufahren')).toBeDefined();
  });
});
