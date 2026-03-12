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

    // Should have future class for dimmed appearance
    const line = container.querySelector('.line');
    expect(line?.classList.contains('future')).toBe(true);
  });

  it('shows success indicator with checkmark for successful completion', () => {
    const { container } = render(InactiveLine, {
      props: { text: 'Completed line', state: 'success' },
    });

    // Should show the success checkmark
    const indicator = container.querySelector('.status-indicator.success');
    expect(indicator).not.toBeNull();
    expect(indicator?.textContent).toBe('✓');

    // Should have past class for faded appearance
    const line = container.querySelector('.line');
    expect(line?.classList.contains('past')).toBe(true);
  });
});
