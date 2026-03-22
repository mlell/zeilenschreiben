<!--
  Renders a line of text with character-by-character typing feedback.
  Shows typed characters as bold, and displays error state with strikethrough.
-->
<script lang="ts">
  import TypingLineOverlay from './TypingLineOverlay.svelte';

  /** The target text the user should type */
  export let targetText: string = '';
  /** What the user has typed so far */
  export let typedText: string = '';
  /** Whether the user made a typing error on this line */
  export let hasError: boolean = false;
  /** Line mode controls semantic styling across active and inactive rows */
  export let state: 'future' | 'current' | 'success' | 'failed' | 'past' = 'current';

  $: isComplete = typedText.length === targetText.length && !hasError;
</script>

<div class="inline-flex flex-col flex-1">
  <div class="text-display font-mono text-lg" class:error={state === 'failed' || hasError} class:future={state === 'future'}>
    {#each targetText.split('') as char, i}
      <span
        class="char inline-block relative"
        class:typed={state === 'current' && i < typedText.length}
        class:correct={i < typedText.length && typedText[i] === char && (state === 'current' || state === 'success')}
        class:wrong={i < typedText.length && typedText[i] !== char && (state === 'current' || state === 'failed')}
        class:cursor={state === 'current' && i === typedText.length && !hasError && !isComplete}
      >
        {#if i < typedText.length && typedText[i] !== char && (state === 'current' || state === 'failed')}
          {typedText[i] === ' ' ? '\u00A0' : typedText[i]}
        {:else}
          {char === ' ' ? '\u00A0' : char}
        {/if}

        {#if state === 'current' && i === typedText.length - 1 && hasError}
          <TypingLineOverlay variant="error" />
        {/if}

        {#if state === 'current' && i === typedText.length - 1 && isComplete}
          <TypingLineOverlay variant="success" />
        {/if}
      </span>
    {/each}
  </div>
</div>

<style>
  .text-display {
    letter-spacing: var(--letter-spacing-tight);
  }

  .text-display.future {
    opacity: 0.4;
  }

  .char { color: var(--color-text-muted); }
  .char.correct { color: var(--color-success); font-weight: bold; }
  .char.wrong {
    color: var(--color-error);
    font-weight: bold;
    text-decoration: line-through;
  }

  /* Preserve exact caret alignment by anchoring to the active character node. */
  .char.cursor::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: var(--color-text);
    animation: blink 1s step-end infinite;
  }

  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  @media (prefers-color-scheme: dark) {
    .text-display.error {
      color: var(--color-error-muted);
    }

    .char.wrong {
      color: var(--color-error-muted);
    }
  }
</style>
