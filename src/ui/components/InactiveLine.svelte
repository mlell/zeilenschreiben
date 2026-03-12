<!--
  Displays a non-active line of text (past or future).
  Past lines show completion status; future lines appear dimmed.
-->
<script lang="ts">
  /**
   * The text content to display
   */
  export let text: string;

  /**
   * Line state determines visual styling:
   * - 'future': upcoming line, dimmed
   * - 'past': completed line, slightly faded
   * - 'success': completed without errors, green indicator
   * - 'failed': completed with errors, red indicator
   */
  export let state: 'future' | 'past' | 'success' | 'failed' = 'future';
</script>

<div class="line" class:future={state === 'future'} class:past={state === 'past' || state === 'success' || state === 'failed'}>
  {#if state === 'success'}
    <span class="status-indicator success">✓</span>
  {:else if state === 'failed'}
    <span class="status-indicator failed">✗</span>
  {/if}
  <span class="line-text">{text}</span>
</div>

<style>
  .line {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs);
    border-radius: var(--border-radius);
    text-align: left;
  }

  .line-text {
    font-family: var(--font-mono);
    font-size: var(--font-size-lg);
    color: var(--color-line-text);
    font-weight: var(--font-weight-emphasis);
    flex: 1;
  }

  /* Future lines appear dimmed to indicate they're upcoming */
  .future {
    opacity: var(--opacity-disabled);
  }

  /* Past lines are slightly faded to shift focus to current line */
  .past {
    opacity: var(--opacity-muted);
  }

  .status-indicator {
    font-size: var(--font-size-lg);
    font-weight: bold;
    width: 1.5em;
    text-align: center;
  }

  .status-indicator.success {
    color: var(--color-success);
  }

  .status-indicator.failed {
    color: var(--color-error);
  }
</style>
