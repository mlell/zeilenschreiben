<!--
  App.svelte - Main orchestrator for a typing practice session.
  Manages the learner's journey through a set of practice lines, enforcing
  the pedagogical constraint that mistakes cannot be corrected mid-line.
-->
<script lang="ts">
  import TypingArea from './ui/components/TypingArea.svelte';

  // Practice content - hardcoded for MVP, will be configurable later
  const lines: string[] = [
    'Der schnelle braune Fuchs springt über den faulen Hund.',
    'Übung macht den Meister.',
    'Programmieren ist wie Fahrrad fahren lernen.',
    'Fehler sind Chancen zum Lernen.',
    'Jeder Experte war einmal ein Anfänger.',
  ];

  // Session State
  // Tracks the learner's progress through the practice lines. Each line is
  // attempted exactly once, and the session ends when all lines are completed.
  let currentLineIndex: number = 0;
  let typedText: string = '';
  let hasError: boolean = false;
  let attempts: boolean[] = [];
  let isComplete: boolean = false;

  $: currentLine = lines[currentLineIndex] || '';

  // Input Processing
  // Enforces the "no backspace" pedagogy: learners must commit to their
  // keystrokes and cannot correct mistakes. This builds muscle memory and
  // encourages careful, deliberate typing over fast, sloppy input.
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

    // Backspace is intentionally disabled to enforce commitment
    if (event.key === 'Backspace') return;

    if (event.key.length !== 1) return;

    // Once an error occurs, the line is "locked" until Enter
    if (hasError) return;

    const expectedChar = currentLine[typedText.length];
    if (event.key === expectedChar) {
      typedText += event.key;
    } else {
      hasError = true;
    }
  }

  // Progress Tracking
  // Records success/failure for each line to provide meaningful feedback
  // at session end. A line is successful only if completed without errors.
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

  // Results Computation
  // Provides immediate accuracy feedback to help learners gauge their
  // performance and motivate improvement in subsequent sessions.
  $: successCount = attempts.filter((a) => a).length;
  $: failureCount = attempts.filter((a) => !a).length;
  $: accuracy = attempts.length > 0 ? Math.round((successCount / attempts.length) * 100) : 0;

  // Session Reset
  // Allows learners to retry immediately without page reload, reducing
  // friction and encouraging repeated practice.
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
  <h1 class="text-4xl mb-8 text-text font-normal">Zeilenschreiben</h1>

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

      <button
        class="mt-8 px-8 py-4 text-lg bg-primary text-white border-none rounded-md cursor-pointer transition-colors duration-300 hover:bg-primary-hover"
        on:click={restart}
      >
        Nochmal versuchen
      </button>
    </div>
  {/if}
</main>
