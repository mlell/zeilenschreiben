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

<main>
  <h1>Zeilenschreiben</h1>

  {#if !isComplete}
    <!-- Typing interface -->
    <TypingArea {lines} {currentLineIndex} {typedText} {hasError} {attempts} />
  {:else}
    <!-- Results display -->
    <div class="results">
      <h2>Ergebnisse</h2>

      <div class="stats">
        <div class="stat">
          <div class="stat-value success">{successCount}</div>
          <div class="stat-label">Erfolgreich</div>
        </div>

        <div class="stat">
          <div class="stat-value failure">{failureCount}</div>
          <div class="stat-label">Fehler</div>
        </div>

        <div class="stat">
          <div class="stat-value accuracy">{accuracy}%</div>
          <div class="stat-label">Genauigkeit</div>
        </div>
      </div>

      <button on:click={restart}>Nochmal versuchen</button>
    </div>
  {/if}
</main>

<style>

/* === Layout === */
main {
  /* Main container with max width and centered padding */
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.results {
  /* Results section container with top margin */
  margin-top: var(--spacing-xl);
}

.stats {
  /* Horizontal layout for displaying statistics */
  display: flex;
  justify-content: space-around;
  margin: var(--spacing-lg) 0;
  gap: var(--spacing-lg);
}

.stat {
  /* Individual stat card with adaptive background */
  flex: 1;
  padding: var(--spacing-md);
  background-color: var(--color-card-bg);
  border-radius: var(--border-radius);
}

/* === Typography === */
h1 {
  /* Main heading with large font size and adaptive color */
  font-size: var(--font-size-xxl);
  margin-bottom: var(--spacing-lg);
  color: var(--color-heading);
  font-weight: var(--font-weight-emphasis);
}

.results h2 {
  /* Results section heading with adaptive color */
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-lg);
  color: var(--color-heading);
  font-weight: var(--font-weight-emphasis);
}

.stat-value {
  /* Large number display for statistics */
  font-size: var(--font-size-huge);
  font-weight: bold;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  /* Label text below stat values with adaptive color */
  font-size: var(--font-size-base);
  color: var(--color-body-text);
  font-weight: var(--font-weight-emphasis);
}

/* === Results Stats === */
.stat-value.success {
  /* Green color for successful attempts */
  color: var(--color-success);
}

.stat-value.failure {
  /* Red color for failed attempts */
  color: var(--color-error);
}

.stat-value.accuracy {
  /* Blue color for accuracy percentage */
  color: var(--color-primary);
}

/* === Interactive Elements === */
button {
  /* Restart button with primary color and hover effect */
  margin-top: var(--spacing-lg);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-lg);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

button:hover {
  /* Darker shade on hover */
  background-color: var(--color-primary-dark);
}
</style>
