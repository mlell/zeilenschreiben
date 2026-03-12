<!--
  TypingSession.svelte - Typing practice interface for students.
  Displays the loaded session text and handles the typing mechanics.
  Reuses the existing TypingArea component for consistent UX.
-->
<script lang="ts">
  import TypingArea from '../components/TypingArea.svelte';
  import type { TypingSession as TypingSessionType } from '../../connections';

  export let session: TypingSessionType;
  export let onBack: () => void;

  // Parse text into lines, filtering empty lines
  $: lines = session.text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // Session State
  let currentLineIndex: number = 0;
  let typedText: string = '';
  let hasError: boolean = false;
  let attempts: boolean[] = [];
  let isComplete: boolean = false;

  $: currentLine = lines[currentLineIndex] || '';

  // Input Processing - enforces "no backspace" pedagogy
  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === 'Backspace' || event.key.length === 1) {
      event.preventDefault();
    }

    if (isComplete) return;

    if (event.key === 'Enter') {
      if (hasError || typedText.length === currentLine.length) {
        recordAttempt();
        advanceToNextLine();
      }
      return;
    }

    // Backspace intentionally disabled
    if (event.key === 'Backspace') return;

    if (event.key.length !== 1) return;

    // Line locked after error until Enter
    if (hasError) return;

    const expectedChar = currentLine[typedText.length];
    if (event.key === expectedChar) {
      typedText += event.key;
    } else {
      hasError = true;
    }
  }

  function recordAttempt(): void {
    const success: boolean = !hasError && typedText.length === currentLine.length;
    attempts = [...attempts, success];
  }

  function advanceToNextLine(): void {
    if (currentLineIndex < lines.length - 1) {
      currentLineIndex++;
      typedText = '';
      hasError = false;
    } else {
      isComplete = true;
    }
  }

  // Results computation
  $: successCount = attempts.filter((a) => a).length;
  $: failureCount = attempts.filter((a) => !a).length;
  $: accuracy = attempts.length > 0 ? Math.round((successCount / attempts.length) * 100) : 0;

  function restart(): void {
    currentLineIndex = 0;
    typedText = '';
    hasError = false;
    attempts = [];
    isComplete = false;
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<main class="max-w-5xl mx-auto p-8">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-4xl text-text font-normal">Zeilenschreiben</h1>
    <button
      on:click={onBack}
      class="px-4 py-2 text-sm bg-surface border border-border text-text rounded-md cursor-pointer hover:bg-surface-elevated transition-colors"
    >
      ← Zurück
    </button>
  </div>

  <div class="mb-4 text-sm text-text-muted">
    Session-Code: <span class="font-mono font-bold">{session.code}</span>
  </div>

  {#if !isComplete}
    <TypingArea {lines} {currentLineIndex} {typedText} {hasError} {attempts} />
  {:else}
    <div class="mt-12">
      <h2 class="text-xl mb-8 text-text font-normal">Ergebnisse</h2>

      <div class="flex justify-around my-8 gap-8">
        <div class="flex-1 p-6 bg-surface-elevated rounded-md">
          <div class="text-5xl font-bold mb-2 text-success">{successCount}</div>
          <div class="text-base text-text-muted">Erfolgreich</div>
        </div>

        <div class="flex-1 p-6 bg-surface-elevated rounded-md">
          <div class="text-5xl font-bold mb-2 text-error">{failureCount}</div>
          <div class="text-base text-text-muted">Fehler</div>
        </div>

        <div class="flex-1 p-6 bg-surface-elevated rounded-md">
          <div class="text-5xl font-bold mb-2 text-primary">{accuracy}%</div>
          <div class="text-base text-text-muted">Genauigkeit</div>
        </div>
      </div>

      <div class="flex gap-4">
        <button
          class="px-8 py-4 text-lg bg-primary text-white border-none rounded-md cursor-pointer transition-colors duration-300 hover:bg-primary-hover"
          on:click={restart}
        >
          Nochmal versuchen
        </button>
        <button
          class="px-8 py-4 text-lg bg-surface border border-border text-text rounded-md cursor-pointer transition-colors duration-300 hover:bg-surface-elevated"
          on:click={onBack}
        >
          Andere Session
        </button>
      </div>
    </div>
  {/if}
</main>
