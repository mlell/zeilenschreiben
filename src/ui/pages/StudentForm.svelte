<!--
  StudentForm.svelte - Student entry form for typing practice.
  Pure form component that collects student name and session code,
  then loads the session and transitions to the typing interface.
-->
<script lang="ts">
  import { getConnection, type TypingSession as SessionData } from '../../connections';
  import Layout from '../components/Layout.svelte';
  import TypingSessionView from './TypingSession.svelte';

  export let onNavigate: (page: 'home' | 'teacher' | 'student') => void;

  // Entry form state
  let studentName: string = '';
  let code: string = '';
  let isLoading: boolean = false;
  let error: string = '';

  // Loaded session state
  let session: SessionData | null = null;
  let confirmedName: string = '';

  async function handleSubmit(): Promise<void> {
    const trimmedName = studentName.trim();
    const trimmedCode = code.trim().toUpperCase();

    // Validate name first
    if (!trimmedName) {
      error = 'Bitte geben Sie Ihren Namen ein.';
      return;
    }

    if (trimmedName.length < 2) {
      error = 'Der Name muss mindestens 2 Zeichen lang sein.';
      return;
    }

    // Validate code
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
      confirmedName = trimmedName;
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
    confirmedName = '';
    code = '';
    error = '';
  }
</script>

{#if session}
  <Layout width="wide">
    <TypingSessionView {session} studentName={confirmedName} onBack={goBack} />
  </Layout>
{:else}
  <Layout width="narrow">
    <h1 class="text-4xl mb-8 text-text font-normal text-center">Zeilenschreiben</h1>
    <p class="text-center text-text-muted mb-12">
      Übung macht den Meister – Zeile für Zeile.
    </p>

    <div class="space-y-6">
      <!-- Name Input -->
    <div>
      <label for="name-input" class="block text-lg mb-2 text-text">
        Dein Name
      </label>
      <input
        id="name-input"
        type="text"
        bind:value={studentName}
        on:keydown={handleKeyDown}
        placeholder="Vor- und Nachname"
        maxlength="100"
        class="w-full p-4 text-lg bg-surface border border-border rounded-md text-text focus:outline-none focus:border-primary"
        disabled={isLoading}
        autocomplete="name"
      />
    </div>

    <!-- Code Input -->
    <div>
      <label for="code-input" class="block text-lg mb-2 text-text">
        Aufgaben-Code
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

    <button
      on:click={() => onNavigate('teacher')}
      class="w-full px-1 py-2 text-sm bg-background text-gray border border-border rounded-md cursor-pointer transition-colors duration-300 hover:bg-primary-hover mt-6"
    >
      Ich bin Lehrer
    </button>
  </Layout>
{/if}
