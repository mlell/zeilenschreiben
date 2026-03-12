<!--
  Renders a line of text with character-by-character typing feedback.
  Shows typed characters as bold, and displays error state with strikethrough.
-->
<script lang="ts">
  /** The target text the user should type */
  export let targetText: string = '';
  /** What the user has typed so far */
  export let typedText: string = '';
  /** Whether the user made a typing error on this line */
  export let hasError: boolean = false;
</script>

<div class="inline-flex flex-col flex-1">
  <div class="text-display font-mono text-lg" class:error={hasError}>
    {#each targetText.split('') as char, i}
      <span
        class="char inline-block"
        class:typed={i < typedText.length}
        class:correct={i < typedText.length && typedText[i] === char}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    {/each}
  </div>

  {#if hasError}
    <div class="mt-2 text-sm font-bold text-error">Fehler, ENTER drücken</div>
  {/if}
</div>

<style>
  .text-display {
    letter-spacing: var(--letter-spacing-tight);
  }

  .char { color: var(--color-text-muted); }
  .char.correct { color: var(--color-text-correct); font-weight: bold; }

  /* Error state requires line-through which needs scoped style */
  .text-display.error {
    text-decoration: line-through;
    color: var(--color-error);
  }

  @media (prefers-color-scheme: dark) {
    .text-display.error { color: var(--color-error-muted); }
  }
</style>
