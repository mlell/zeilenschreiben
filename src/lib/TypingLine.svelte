<script lang="ts">
  export let targetText: string = '';
  export let typedText: string = '';
  export let hasError: boolean = false;
</script>

<div class="typing-line">
  <!-- Display the target text with typed overlay -->
  <div class="text-display" class:error={hasError}>
    {#each targetText.split('') as char, i}
      <span
        class="char"
        class:typed={i < typedText.length}
        class:correct={i < typedText.length && typedText[i] === char}
      >
        {char}
      </span>
    {/each}
  </div>

  {#if hasError}
    <div class="error-message">Fehler, ENTER drücken</div>
  {/if}
</div>

<style>
  .typing-line {
    margin: 2rem 0;
  }

  .text-display {
    font-family: 'Courier New', monospace;
    font-size: 2rem;
    letter-spacing: 0.1em;
    padding: 1rem;
    background-color: #f5f5f5;
    border-radius: 8px;
    min-height: 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .text-display.error {
    text-decoration: line-through;
    background-color: #ffe0e0;
  }

  .char {
    display: inline-block;
    color: #999;
  }

  .char.typed {
    color: #333;
  }

  .char.correct {
    color: #000;
    font-weight: bold;
  }

  .error-message {
    margin-top: 1rem;
    color: #d32f2f;
    font-size: 1.2rem;
    font-weight: bold;
  }

  @media (prefers-color-scheme: dark) {
    .text-display {
      background-color: #2a2a2a;
    }

    .text-display.error {
      background-color: #4a2020;
    }

    .char {
      color: #666;
    }

    .char.typed {
      color: #ccc;
    }

    .char.correct {
      color: #fff;
    }
  }
</style>
