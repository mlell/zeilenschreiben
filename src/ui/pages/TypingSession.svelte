<!--
  TypingSession.svelte - Typing practice interface for students.
  Displays the student name prominently, handles typing mechanics,
  and saves results to the database upon completion.
-->
<script lang="ts">
  import TypingArea from '../components/TypingArea.svelte';
  import { getConnection, type TypingSession as TypingSessionType } from '../../connections';

  export let session: TypingSessionType;
  export let studentName: string;
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
  let typedLines: string[] = [];
  let isComplete: boolean = false;
  let isSaving: boolean = false;
  let saveError: string = '';

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
    typedLines = [...typedLines, typedText];
  }

  async function advanceToNextLine(): Promise<void> {
    if (currentLineIndex < lines.length - 1) {
      currentLineIndex++;
      typedText = '';
      hasError = false;
    } else {
      isComplete = true;
      await saveResults();
    }
  }

  // Results computation
  $: successCount = attempts.filter((a) => a).length;
  $: failureCount = attempts.filter((a) => !a).length;
  $: accuracy = attempts.length > 0 ? Math.round((successCount / attempts.length) * 100) : 0;

  async function saveResults(): Promise<void> {
    isSaving = true;
    saveError = '';

    try {
      const connection = getConnection();
      const fullTypedText = typedLines.join('\n');
      await connection.saveStudentResult(
        session.id,
        studentName,
        fullTypedText,
        successCount,
        failureCount,
        accuracy
      );
    } catch (e) {
      saveError = e instanceof Error ? e.message : 'Fehler beim Speichern.';
    } finally {
      isSaving = false;
    }
  }

  function restart(): void {
    currentLineIndex = 0;
    typedText = '';
    hasError = false;
    attempts = [];
    typedLines = [];
    isComplete = false;
    saveError = '';
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="flex items-center justify-between mb-4">
  <h1 class="text-4xl text-text font-normal">Zeilenschreiben</h1>
  <button
    on:click={onBack}
    class="px-4 py-2 text-sm bg-surface border border-border text-text rounded-md cursor-pointer hover:bg-surface-elevated transition-colors"
  >
    ← Zurück
  </button>
</div>

  <!-- Student Name Display - prominent positioning -->
  <div class="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
    <div class="text-2xl font-semibold text-primary">
      {studentName}
    </div>
  </div>

  <div class="mb-4 text-sm text-text-muted">
    Aufgaben-Code: <span class="font-mono font-bold">{session.code}</span>
  </div>

  {#if !isComplete}
    <TypingArea {lines} {currentLineIndex} {typedText} {hasError} {attempts} />
  {:else}
    <div class="mt-12">
      <h2 class="text-xl mb-8 text-text font-normal">Ergebnisse</h2>

      {#if isSaving}
        <div class="p-4 bg-surface-elevated rounded-md text-text-muted mb-8">
          Ergebnisse werden gespeichert...
        </div>
      {:else if saveError}
        <div class="p-4 bg-error/10 border border-error rounded-md text-error mb-8">
          {saveError}
        </div>
      {:else}
        <div class="p-4 bg-success/10 border border-success/30 rounded-md text-success mb-8">
          Ergebnisse wurden gespeichert!
        </div>
      {/if}

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
