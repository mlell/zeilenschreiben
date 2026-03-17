/**
 * Test file for InactiveLine.svelte - Line styling for past lines.
 * Focuses on visual feedback for success, failure, and future states.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import InactiveLine from './InactiveLine.svelte';

describe('InactiveLine.svelte - Line styling', () => {
  // ========== SUCCESS STATE ========== //
  describe('Success state', () => {
    it('displays a checkmark indicator for successful lines', () => {
      render(InactiveLine, {
        props: { text: 'Successfully completed line', state: 'success' },
      });

      const checkmark = screen.getByText('✓');
      expect(checkmark).toBeTruthy();
      expect(checkmark.classList.contains('text-success')).toBe(true);
    });

    it('applies success background styling', () => {
      const { container } = render(InactiveLine, {
        props: { text: 'Successfully completed line', state: 'success' },
      });

      const background = container.querySelector('.inactive-line-bg.success');
      expect(background).not.toBeNull();
      expect(background?.classList.contains('inactive-line-bg')).toBe(true);
      expect(background?.classList.contains('success')).toBe(true);
    });
  });

  // ========== FAILED STATE ========== //
  describe('Failed state', () => {
    it('displays a cross indicator for failed lines', () => {
      render(InactiveLine, {
        props: { text: 'Failed line', state: 'failed' },
      });

      const cross = screen.getByText('✗');
      expect(cross).toBeTruthy();
      expect(cross.classList.contains('text-error')).toBe(true);
    });

    it('applies error background styling', () => {
      const { container } = render(InactiveLine, {
        props: { text: 'Failed line', state: 'failed' },
      });

      const background = container.querySelector('.inactive-line-bg.failed');
      expect(background).not.toBeNull();
      expect(background?.classList.contains('inactive-line-bg')).toBe(true);
      expect(background?.classList.contains('failed')).toBe(true);
    });
  });

  // ========== PAST STATE ========== //
  describe('Past state', () => {
    it('displays line text without any indicators', () => {
      render(InactiveLine, {
        props: { text: 'Past line without attempt result', state: 'past' },
      });

      expect(screen.queryByText('✓')).toBeNull();
      expect(screen.queryByText('✗')).toBeNull();
    });

    it('does not apply success or error background styling', () => {
      const { container } = render(InactiveLine, {
        props: { text: 'Past line without attempt result', state: 'past' },
      });

      expect(container.querySelector('.inactive-line-bg.success')).toBeNull();
      expect(container.querySelector('.inactive-line-bg.failed')).toBeNull();
    });
  });

  // ========== FUTURE STATE ========== //
  describe('Future state', () => {
    it('applies dimmed opacity to future lines', () => {
      const { container } = render(InactiveLine, {
        props: { text: 'Future line', state: 'future' },
      });

      const wrapper = container.firstElementChild;
      expect(wrapper?.classList.contains('opacity-40')).toBe(true);
    });

    it('does not apply opacity to non-future lines', () => {
      const { container } = render(InactiveLine, {
        props: { text: 'Past line', state: 'past' },
      });

      const wrapper = container.firstElementChild;
      expect(wrapper?.classList.contains('opacity-40')).toBe(false);
    });
  });

  // ========== ACCESSIBILITY ========== //
  describe('Accessibility', () => {
    it('renders text in a font-mono for consistent character width', () => {
      const { container } = render(InactiveLine, {
        props: { text: 'Test line for mono font', state: 'past' },
      });

      const textElement = container.querySelector('.font-mono');
      expect(textElement).not.toBeNull();
      expect(textElement?.textContent).toBe('Test line for mono font');
    });

    it('maintains proper contrast for readability in all states', () => {
      // Success state
      const { container: successContainer } = render(InactiveLine, {
        props: { text: 'Success line', state: 'success' },
      });
      const successText = successContainer.querySelector('.text-text');
      expect(successText).not.toBeNull();

      // Failed state
      const { container: failedContainer } = render(InactiveLine, {
        props: { text: 'Failed line', state: 'failed' },
      });
      const failedText = failedContainer.querySelector('.text-text');
      expect(failedText).not.toBeNull();

      // Future state
      const { container: futureContainer } = render(InactiveLine, {
        props: { text: 'Future line', state: 'future' },
      });
      const futureText = futureContainer.querySelector('.text-text');
      expect(futureText).not.toBeNull();
    });
  });
});
