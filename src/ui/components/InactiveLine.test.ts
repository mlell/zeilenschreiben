import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import InactiveLine from './InactiveLine.svelte';

describe('InactiveLine', () => {
  it('renders text and applies future state styling by default', () => {
    const { container } = render(InactiveLine, {
      props: { text: 'Future line' },
    });

    // Text should be displayed
    expect(screen.getByText('Future line')).toBeDefined();

    // Should have opacity-40 class for dimmed appearance (future state)
    const wrapper = container.firstElementChild;
    expect(wrapper?.classList.contains('opacity-40')).toBe(true);
  });

  it('shows success indicator with checkmark for successful completion', () => {
    const { container } = render(InactiveLine, {
      props: { text: 'Completed line', state: 'success' },
    });

    // Should show the success checkmark
    expect(screen.getByText('✓')).toBeDefined();

    // Should NOT have opacity-40 class (only future state has it)
    const wrapper = container.firstElementChild;
    expect(wrapper?.classList.contains('opacity-40')).toBe(false);
  });
});
