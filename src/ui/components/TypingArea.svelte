<!--
  Container component for the typing practice interface.
  Orchestrates display of past, current, and future lines with progress indicator.
-->
<script lang="ts">
  import TypingLine from './TypingLine.svelte';

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
  /** Persisted typed content for completed lines */
  export let typedLines: string[] = [];

  const PAST_LINES_VISIBLE = 2;
  const FUTURE_LINES_VISIBLE = 2;

  // Keep historical rendering tied to persisted attempts to preserve error feedback.
  $: visibleStartIndex = Math.max(0, currentLineIndex - PAST_LINES_VISIBLE);

  $: pastLines = lines
    .slice(visibleStartIndex, currentLineIndex)
    .map((text, idx) => {
      const attemptIndex = visibleStartIndex + idx;
      const success = attempts[attemptIndex];
      const state: 'past' | 'success' | 'failed' = success === undefined ? 'past' : success ? 'success' : 'failed';
      const typedTextForLine = typedLines[attemptIndex] ?? '';
      return { text, state, typedTextForLine };
    });

  $: futureLines = lines.slice(currentLineIndex + 1, Math.min(lines.length, currentLineIndex + 1 + FUTURE_LINES_VISIBLE));

  $: currentLine = lines[currentLineIndex] || '';
</script>

<div class="my-8">
  <div class="text-lg text-text-muted mb-4">
    Zeile {currentLineIndex + 1} von {lines.length}
  </div>

  <div class="flex flex-col gap-4 my-8 bg-surface p-8 rounded-md">
    {#each pastLines as line}
      <div class="relative flex items-start gap-4 p-2 rounded-md text-left" class:line-success={line.state === 'success'} class:line-failed={line.state === 'failed'}>
        {#if line.state === 'success'}
          <span class="text-lg font-bold w-6 text-center text-success">✓</span>
        {:else if line.state === 'failed'}
          <span class="text-lg font-bold w-6 text-center text-error">✗</span>
        {/if}
        <TypingLine
          targetText={line.text}
          typedText={line.state === 'failed' ? line.typedTextForLine : line.text}
          state={line.state}
        />
      </div>
    {/each}

    <div class="relative flex items-start gap-4 p-4 rounded-md text-left active-line" class:active-line-error={hasError}>
      <div class="relative z-10 font-mono">
        <TypingLine targetText={currentLine} {typedText} {hasError} state="current" />
      </div>
    </div>

    {#each futureLines as line}
      <div class="relative flex items-start gap-4 p-2 rounded-md text-left opacity-40">
        <TypingLine targetText={line} typedText="" state="future" />
      </div>
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

<style>
  .line-success {
    background-color: rgba(76, 175, 80, 0.2);
    border: var(--border-width) solid var(--color-success);
  }

  .line-failed {
    background-color: rgba(211, 47, 47, 0.2);
    border: var(--border-width) solid var(--color-error);
  }

  .active-line {
    background-color: var(--color-primary-muted);
    border: var(--border-width) solid var(--color-primary);
  }

  .active-line-error {
    background-color: rgba(211, 47, 47, 0.2);
    border-color: var(--color-error);
  }

  @media (prefers-color-scheme: dark) {
    .line-failed {
      background-color: rgba(255, 107, 107, 0.2);
      border-color: var(--color-error-muted);
    }

    .active-line-error {
      background-color: rgba(255, 107, 107, 0.2);
      border-color: var(--color-error-muted);
    }
  }
</style>
