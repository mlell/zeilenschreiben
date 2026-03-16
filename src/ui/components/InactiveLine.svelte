<!--
  Displays a non-active line of text (past or future).
  Past lines show completion status; future lines appear dimmed.
-->
<script lang="ts">
  /** The text content to display */
  export let text: string;
  /**
   * Line state determines visual styling:
   * - 'future': upcoming line, dimmed
   * - 'past': completed line, slightly faded
   * - 'success': completed without errors, green indicator
   * - 'failed': completed with errors, red indicator
   */
  export let state: 'future' | 'past' | 'success' | 'failed' = 'future';

  $: isFuture = state === 'future';
</script>

<div class="relative flex items-start gap-4 p-2 rounded-md text-left" class:opacity-40={isFuture}>
  <!-- Semi-transparent background overlay for success/failed states -->
  {#if state === 'success' || state === 'failed'}
    <div class="inactive-line-bg" class:success={state === 'success'} class:failed={state === 'failed'}></div>
  {/if}
  <div class="relative z-10 flex items-start gap-4 flex-1">
    {#if state === 'success'}
      <span class="text-lg font-bold w-6 text-center text-success">✓</span>
    {:else if state === 'failed'}
      <span class="text-lg font-bold w-6 text-center text-error">✗</span>
    {/if}
    <span class="flex-1 font-mono text-lg text-text">{text}</span>
  </div>
</div>

<style>
  .inactive-line-bg {
    position: absolute;
    inset: 0;
    border-radius: var(--radius-md);
    pointer-events: none;
  }

  .inactive-line-bg.success {
    background-color: rgba(76, 175, 80, 0.2);
    border: var(--border-width) solid var(--color-success);
  }

  .inactive-line-bg.failed {
    background-color: rgba(211, 47, 47, 0.2);
    border: var(--border-width) solid var(--color-error);
  }

  @media (prefers-color-scheme: dark) {
    .inactive-line-bg.failed {
      background-color: rgba(255, 107, 107, 0.2);
      border-color: var(--color-error-muted);
    }
  }
</style>
