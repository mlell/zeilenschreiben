<!--
  Container component for the typing practice interface.
  Orchestrates display of past, current, and future lines with progress indicator.
-->
<script lang="ts">
  import ActiveLine from './ActiveLine.svelte';
  import InactiveLine from './InactiveLine.svelte';

  /**
   * All lines of text to be typed in the session
   */
  export let lines: string[];

  /**
   * Index of the currently active line (0-based)
   */
  export let currentLineIndex: number;

  /**
   * What the user has typed on the current line
   */
  export let typedText: string;

  /**
   * Whether the user made a typing error on the current line
   */
  export let hasError: boolean;

  /**
   * Results of previous line attempts (true = success, false = failed)
   */
  export let attempts: boolean[];

  // Number of past lines to show above the current line
  const PAST_LINES_VISIBLE = 2;
  // Number of future lines to show below the current line
  const FUTURE_LINES_VISIBLE = 2;

  // Compute which past lines to display with their attempt results
  $: pastLines = lines
    .slice(Math.max(0, currentLineIndex - PAST_LINES_VISIBLE), currentLineIndex)
    .map((text, idx) => {
      const attemptIndex = Math.max(0, currentLineIndex - PAST_LINES_VISIBLE) + idx;
      const success = attempts[attemptIndex];
      return {
        text,
        state: success === undefined ? 'past' : success ? 'success' : 'failed'
      };
    });

  // Compute which future lines to display
  $: futureLines = lines.slice(
    currentLineIndex + 1,
    Math.min(lines.length, currentLineIndex + 1 + FUTURE_LINES_VISIBLE)
  );

  // Current line text
  $: currentLine = lines[currentLineIndex] || '';
</script>

<div class="typing-area">
  <div class="progress">
    Zeile {currentLineIndex + 1} von {lines.length}
  </div>

  <div class="lines-display">
    <!-- Past lines (completed) -->
    {#each pastLines as line}
      <InactiveLine text={line.text} state={line.state} />
    {/each}

    <!-- Current line (active) -->
    <ActiveLine targetText={currentLine} {typedText} {hasError} />

    <!-- Future lines (upcoming) -->
    {#each futureLines as line}
      <InactiveLine text={line} state="future" />
    {/each}
  </div>

  <div class="instructions">
    {#if hasError}
      <p>Drücke ENTER um fortzufahren</p>
    {:else if typedText.length === currentLine.length}
      <p>Zeile vollständig! Drücke ENTER für die nächste Zeile</p>
    {:else}
      <p>Tippe die Zeile genau nach. Backspace ist deaktiviert.</p>
    {/if}
  </div>
</div>

<style>
  .typing-area {
    /* Container for the typing interface section */
    margin: var(--spacing-lg) 0;
  }

  .progress {
    /* Progress indicator showing current line number */
    font-size: var(--font-size-lg);
    color: var(--color-body-text);
    font-weight: var(--font-weight-emphasis);
    margin-bottom: var(--spacing-sm);
  }

  .lines-display {
    /* Vertical stack of text lines with adaptive background */
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin: var(--spacing-lg) 0;
    background-color: var(--color-lines-bg);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius);
  }

  .instructions {
    /* User instructions text below the typing area */
    margin-top: var(--spacing-lg);
    font-size: var(--font-size-md);
    color: var(--color-body-text);
    font-weight: var(--font-weight-emphasis);
  }
</style>
