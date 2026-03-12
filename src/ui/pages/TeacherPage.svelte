<!--
  TeacherPage.svelte - Session creation interface for instructors.
  Allows teachers to paste practice text and receive a shareable code
  that students can use to access the typing session.
-->
<script lang="ts">
  import { getConnection } from '../../connections';

  // Form state
  let text: string = '';
  let isSubmitting: boolean = false;
  let error: string = '';

  // Result state after successful creation
  let generatedCode: string = '';
  let showSuccess: boolean = false;

  async function handleSubmit(): Promise<void> {
    if (!text.trim()) {
      error = 'Bitte geben Sie einen Text ein.';
      return;
    }

    isSubmitting = true;
    error = '';

    try {
      const connection = getConnection();
      const session = await connection.createSession(text.trim());
      generatedCode = session.code;
      showSuccess = true;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten.';
    } finally {
      isSubmitting = false;
    }
  }

  function createAnother(): void {
    text = '';
    generatedCode = '';
    showSuccess = false;
    error = '';
  }

  function copyCode(): void {
    navigator.clipboard.writeText(generatedCode);
  }
</script>

<main class="max-w-3xl mx-auto p-8">
  <h1 class="text-4xl mb-8 text-text font-normal">Lehrer-Bereich</h1>

  {#if !showSuccess}
    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <div>
        <label for="text-input" class="block text-lg mb-2 text-text">
          Übungstext eingeben
        </label>
        <textarea
          id="text-input"
          bind:value={text}
          placeholder="Fügen Sie hier den Text ein, den die Schüler tippen sollen..."
          rows="10"
          class="w-full p-4 text-base bg-surface border border-border rounded-md text-text resize-y focus:outline-none focus:border-primary"
          disabled={isSubmitting}
        ></textarea>
        <p class="mt-2 text-sm text-text-muted">
          Jede Zeile wird einzeln zum Tippen angezeigt.
        </p>
      </div>

      {#if error}
        <div class="p-4 bg-error/10 border border-error rounded-md text-error">
          {error}
        </div>
      {/if}

      <button
        type="submit"
        disabled={isSubmitting}
        class="px-8 py-4 text-lg bg-primary text-white border-none rounded-md cursor-pointer transition-colors duration-300 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Wird erstellt...' : 'Session erstellen'}
      </button>
    </form>
  {:else}
    <div class="space-y-8">
      <div class="p-8 bg-surface-elevated rounded-lg text-center">
        <h2 class="text-xl mb-4 text-text font-normal">Session erstellt!</h2>
        <p class="text-text-muted mb-6">
          Teilen Sie diesen Code mit Ihren Schülern:
        </p>

        <div class="flex items-center justify-center gap-4">
          <div class="text-5xl font-mono font-bold tracking-widest text-primary">
            {generatedCode}
          </div>
          <button
            on:click={copyCode}
            class="p-3 bg-surface border border-border rounded-md cursor-pointer hover:bg-surface-elevated transition-colors"
            title="Code kopieren"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-text"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="p-6 bg-surface rounded-lg">
        <h3 class="text-lg mb-3 text-text font-normal">Vorschau des Textes:</h3>
        <pre class="whitespace-pre-wrap text-text-muted text-sm">{text}</pre>
      </div>

      <button
        on:click={createAnother}
        class="px-8 py-4 text-lg bg-surface border border-border text-text rounded-md cursor-pointer transition-colors duration-300 hover:bg-surface-elevated"
      >
        Neue Session erstellen
      </button>
    </div>
  {/if}
</main>
