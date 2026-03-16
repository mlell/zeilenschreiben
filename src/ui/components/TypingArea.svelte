<!--
  Container component for the typing practice interface.
  Orchestrates display of past, current, and future lines with progress indicator.
-->
<script lang="ts">
  import ActiveLine from './ActiveLine.svelte';
  import InactiveLine from './InactiveLine.svelte';

  /** All lines of text to be typed in the session */
  export let lines: string[];
  /** Index of the currently active line (0-based) */
  export let currentLineIndex: number;
  /** What the user has typed on the current line */
  export let typedText: string;
  /** Whether the user made a typing error on the current line */
  export let hasError: boolean;
  /** Results of previous line attempts (true = success, false = failed) */
  export let attempts: boolean[];

  const PAST_LINES_VISIBLE = 2;
  const FUTURE_LINES_VISIBLE = 2;

  // Compute which past lines to display with their attempt results
  $: pastLines = lines
    .slice(Math.max(0, currentLineIndex - PAST_LINES_VISIBLE), currentLineIndex)
    .map((text, idx) => {
      const attemptIndex = Math.max(0, currentLineIndex - PAST_LINES_VISIBLE) + idx;
      const success = attempts[attemptIndex];
      const state: 'past' | 'success' | 'failed' = success === undefined ? 'past' : success ? 'success' : 'failed';
      return { text, state };
    });

  $: futureLines = lines.slice(
    currentLineIndex + 1,
    Math.min(lines.length, currentLineIndex + 1 + FUTURE_LINES_VISIBLE)
  );

  $: currentLine = lines[currentLineIndex] || '';
</script>

<div class="my-8">
  <div class="text-lg text-text-muted mb-4">
    Zeile {currentLineIndex + 1} von {lines.length}
  </div>

  <div class="flex flex-col gap-4 my-8 bg-surface p-8 rounded-md">
    {#each pastLines as line}
      <InactiveLine text={line.text} state={line.state} />
    {/each}

    <ActiveLine targetText={currentLine} {typedText} {hasError} />

    {#each futureLines as line}
      <InactiveLine text={line} state="future" />
    {/each}
  </div>

  <div class="mt-8 text-base text-text-muted">
    {#if hasError}
      <p>Drücke ENTER um fortzufahren</p>
    {:else if typedText.length === currentLine.length}
      <p>Zeile vollständig! Drücke ENTER für die nächste Zeile</p>
    {:else}
      <p>Tippe die Zeile genau nach. Backspace ist deaktiviert.</p>
    {/if}
  </div>
</div>
