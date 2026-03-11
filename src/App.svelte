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

      <TypingLine targetText={currentLine} {typedText} {hasError} />

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
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    color: #333;
  }

  .typing-container {
    margin: 2rem 0;
  }

  .progress {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 1rem;
  }

  .instructions {
    margin-top: 2rem;
    font-size: 1.1rem;
    color: #666;
  }

  .results {
    margin-top: 3rem;
  }

  .results h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #333;
  }

  .stats {
    display: flex;
    justify-content: space-around;
    margin: 2rem 0;
    gap: 2rem;
  }

  .stat {
    flex: 1;
    padding: 1.5rem;
    background-color: #f5f5f5;
    border-radius: 8px;
  }

  .stat-value {
    font-size: 3rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .stat-value.success {
    color: #4caf50;
  }

  .stat-value.failure {
    color: #f44336;
  }

  .stat-value.accuracy {
    color: #2196f3;
  }

  .stat-label {
    font-size: 1rem;
    color: #666;
  }

  button {
    margin-top: 2rem;
    padding: 1rem 2rem;
    font-size: 1.2rem;
    background-color: #2196f3;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  button:hover {
    background-color: #1976d2;
  }

  @media (prefers-color-scheme: dark) {
    h1,
    .results h2 {
      color: #fff;
    }

    .progress,
    .instructions,
    .stat-label {
      color: #aaa;
    }

    .stat {
      background-color: #2a2a2a;
    }
  }
</style>
