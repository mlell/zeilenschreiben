<script lang="ts">
  import TypingLine from './lib/TypingLine.svelte';

  // Hardcoded text lines for MVP
  const lines: string[] = [
    'Der schnelle braune Fuchs springt über den faulen Hund.',
    'Übung macht den Meister.',
    'Programmieren ist wie Fahrrad fahren lernen.',
    'Fehler sind Chancen zum Lernen.',
    'Jeder Experte war einmal ein Anfänger.',
  ];

  // Application state
  let currentLineIndex: number = 0;
  let typedText: string = '';
  let hasError: boolean = false;
  let attempts: boolean[] = [];
  let isComplete: boolean = false;

  // Get current line
  $: currentLine = lines[currentLineIndex] || '';

  // Handle keyboard input
  function handleKeyDown(event: KeyboardEvent): void {
    // Prevent default behavior for all keys we handle
    if (event.key === 'Enter' || event.key === 'Backspace' || event.key.length === 1) {
      event.preventDefault();
    }

    // If complete, ignore all input
    if (isComplete) return;

    // Handle Enter key - advance to next line
    if (event.key === 'Enter') {
      if (hasError || typedText.length === currentLine.length) {
        recordAttempt();
        advanceToNextLine();
      }
      return;
    }

    // Prevent backspace
    if (event.key === 'Backspace') {
      return;
    }

    // Only process single character keys
    if (event.key.length !== 1) {
      return;
    }

    // If already has error, ignore further input until Enter
    if (hasError) {
      return;
    }

    // Check if character is correct
    const expectedChar = currentLine[typedText.length];
    if (event.key === expectedChar) {
      typedText += event.key;
    } else {
      hasError = true;
    }
  }

  // Record the attempt result
  function recordAttempt(): void {
    const success: boolean = !hasError && typedText.length === currentLine.length;
    attempts = [...attempts, success];
  }

  // Advance to next line or complete
  function advanceToNextLine(): void {
    if (currentLineIndex < lines.length - 1) {
      currentLineIndex++;
      typedText = '';
      hasError = false;
    } else {
      isComplete = true;
    }
  }

  // Calculate results
  $: successCount = attempts.filter((a) => a).length;
  $: failureCount = attempts.filter((a) => !a).length;
  $: accuracy = attempts.length > 0 ? Math.round((successCount / attempts.length) * 100) : 0;

  // Restart the application
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
    <div class="typing-container">
      <div class="progress">
        Zeile {currentLineIndex + 1} von {lines.length}
      </div>

      <div class="lines-display">
        <!-- Past lines (completed) -->
        {#each lines.slice(Math.max(0, currentLineIndex - 2), currentLineIndex) as line, idx}
          <div class="line past-line">
            <span class="line-text">{line}</span>
          </div>
        {/each}

        <!-- Current line (active) -->
        <div class="line current-line">
          <div class="current-line-bg"></div>
          <div class="current-line-content">
            <TypingLine targetText={currentLine} {typedText} {hasError} />
          </div>
        </div>

        <!-- Future lines (upcoming) -->
        {#each lines.slice(currentLineIndex + 1, Math.min(lines.length, currentLineIndex + 3)) as line, idx}
          <div class="line future-line">
            <span class="line-text">{line}</span>
          </div>
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

.typing-container {
  /* Container for the typing interface section */
  margin: var(--spacing-lg) 0;
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

.line {
  /* Individual line container with flex layout */
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs);
  border-radius: var(--border-radius);
  text-align: left;
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

.progress {
  /* Progress indicator showing current line number with adaptive color */
  font-size: var(--font-size-lg);
  color: var(--color-body-text);
  font-weight: var(--font-weight-emphasis);
  margin-bottom: var(--spacing-sm);
}

.line-text {
  /* Monospace text for displaying lines with adaptive color */
  font-family: var(--font-mono);
  font-size: var(--font-size-lg);
  color: var(--color-line-text);
  font-weight: var(--font-weight-emphasis);
  flex: 1;
}

.instructions {
  /* User instructions text below the typing area with adaptive color */
  margin-top: var(--spacing-lg);
  font-size: var(--font-size-md);
  color: var(--color-body-text);
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

/* === Line States === */
.past-line {
  /* Completed lines with reduced opacity */
  opacity: var(--opacity-muted);
}

.current-line {
  /* Active line with relative positioning for background layer */
  position: relative;
  padding: var(--spacing-sm);
}

.current-line-bg {
  /* Semi-transparent background layer behind the text */
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(33, 150, 243, 0.2);
  border: var(--border-width) solid var(--color-primary);
  border-radius: var(--border-radius);
  pointer-events: none;
}

.current-line-content {
  /* Content layer with full opacity text */
  position: relative;
  z-index: 1;
}

.future-line {
  /* Upcoming lines with disabled opacity */
  opacity: var(--opacity-disabled);
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
