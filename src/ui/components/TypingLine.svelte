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

  $: isComplete = typedText.length === targetText.length && !hasError;
</script>

<div class="inline-flex flex-col flex-1">
  <div class="text-display font-mono text-lg" class:error={hasError}>
    {#each targetText.split('') as char, i}
      <span
        class="char inline-block relative"
        class:typed={i < typedText.length}
        class:correct={i < typedText.length && typedText[i] === char}
        class:cursor={i === typedText.length && !hasError && !isComplete}
      >
        {char === ' ' ? '\u00A0' : char}
        {#if i === typedText.length && hasError}
          <span class="message-bubble error-bubble" data-testid="error-bubble">ENTER drücken</span>
        {/if}
        {#if i === typedText.length - 1 && isComplete}
          <span class="message-bubble success-bubble" data-testid="success-bubble">ENTER drücken</span>
        {/if}
      </span>
    {/each}
  </div>
</div>

<style>
  .text-display {
    letter-spacing: var(--letter-spacing-tight);
  }

  .char { color: var(--color-text-muted); }
  .char.correct { color: var(--color-success); font-weight: bold; }

  /* Cursor indicator at current typing position */
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

  /* Message bubble positioned after cursor */
  .message-bubble {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: bold;
    white-space: nowrap;
    z-index: 20;
  }

  .error-bubble {
    background-color: var(--color-error);
    color: white;
  }

  .success-bubble {
    background-color: var(--color-success);
    color: white;
  }

  @media (prefers-color-scheme: dark) {
    .error-bubble {
      background-color: var(--color-error-muted);
    }
  }

  /* Error state requires line-through which needs scoped style */
  .text-display.error {
    text-decoration: line-through;
    color: var(--color-error);
  }

  @media (prefers-color-scheme: dark) {
    .text-display.error { color: var(--color-error-muted); }
  }
</style>
