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
  $: isPast = state === 'past' || state === 'success' || state === 'failed';
</script>

<div
  class="flex items-start gap-4 p-2 rounded-md text-left"
  class:opacity-40={isFuture}
  class:opacity-50={isPast}
>
  {#if state === 'success'}
    <span class="text-lg font-bold w-6 text-center text-success">✓</span>
  {:else if state === 'failed'}
    <span class="text-lg font-bold w-6 text-center text-error">✗</span>
  {/if}
  <span class="flex-1 font-mono text-lg text-text">{text}</span>
</div>
