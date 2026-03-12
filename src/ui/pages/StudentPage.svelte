<!--
  StudentPage.svelte - Student entry point for typing practice.
  Students enter a session code to load the practice text, then
  proceed to the typing interface once the session is loaded.
-->
<script lang="ts">
  import { getConnection, type TypingSession as SessionData } from '../../connections';
  import TypingSessionView from './TypingSession.svelte';

  // Code entry state
  let code: string = '';
  let isLoading: boolean = false;
  let error: string = '';

  // Loaded session state
  let session: SessionData | null = null;

  async function handleSubmit(): Promise<void> {
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      error = 'Bitte geben Sie einen Code ein.';
      return;
    }

    if (trimmedCode.length !== 6) {
      error = 'Der Code muss 6 Zeichen lang sein.';
      return;
    }

    isLoading = true;
    error = '';

    try {
      const connection = getConnection();
      const loadedSession = await connection.getSessionByCode(trimmedCode);

      if (!loadedSession) {
        error = 'Session nicht gefunden. Bitte überprüfen Sie den Code.';
        return;
      }

      session = loadedSession;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten.';
    } finally {
      isLoading = false;
    }
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }

  function goBack(): void {
    session = null;
    code = '';
    error = '';
  }
</script>

{#if session}
  <TypingSessionView {session} onBack={goBack} />
{:else}
  <main class="max-w-xl mx-auto p-8">
    <h1 class="text-4xl mb-8 text-text font-normal">Schüler-Bereich</h1>

    <div class="space-y-6">
      <div>
        <label for="code-input" class="block text-lg mb-2 text-text">
          Session-Code eingeben
        </label>
        <input
          id="code-input"
          type="text"
          bind:value={code}
          on:keydown={handleKeyDown}
          placeholder="z.B. ABC123"
          maxlength="6"
          class="w-full p-4 text-2xl font-mono text-center tracking-widest uppercase bg-surface border border-border rounded-md text-text focus:outline-none focus:border-primary"
          disabled={isLoading}
          autocomplete="off"
          autocapitalize="characters"
        />
        <p class="mt-2 text-sm text-text-muted text-center">
          Fragen Sie Ihren Lehrer nach dem Code.
        </p>
      </div>

      {#if error}
        <div class="p-4 bg-error/10 border border-error rounded-md text-error text-center">
          {error}
        </div>
      {/if}

      <button
        on:click={handleSubmit}
        disabled={isLoading}
        class="w-full px-8 py-4 text-lg bg-primary text-white border-none rounded-md cursor-pointer transition-colors duration-300 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Wird geladen...' : 'Starten'}
      </button>
    </div>
  </main>
{/if}
