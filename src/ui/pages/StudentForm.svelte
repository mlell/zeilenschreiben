<!--
  StudentForm.svelte - Student entry form for typing practice.
  Pure form component that collects student name and session code,
  then loads the session and transitions to the typing interface.
-->
<script lang="ts">
  import { getConnection, type TypingSession as SessionData } from '../../connections';
  import Layout from '../components/Layout.svelte';
  import TypingSessionView from './TypingSession.svelte';

  type PracticeMode = 'code' | 'self';

  type PersistResultInput = {
    sessionId: string;
    studentName: string;
    typedText: string;
    successCount: number;
    failureCount: number;
    accuracy: number;
  };

  export let onNavigate: (page: 'home' | 'teacher' | 'student') => void;
  export let backendAvailable: boolean = true;

  // Entry form state
  let mode: PracticeMode = 'code';
  let studentName: string = '';
  let code: string = '';
  let selfPracticeText: string = '';
  let selfPracticeTimeLimitMinutesInput: number | null = null;
  let isLoading: boolean = false;
  let error: string = '';

  // Loaded session state
  let session: SessionData | null = null;
  let confirmedName: string = '';

  let persistResultForSession: ((input: PersistResultInput) => Promise<void>) | null = null;

  function createSelfPracticeSession(text: string, timeLimitMinutes: number | null): SessionData {
    const now = new Date().toISOString();
    const normalizedTimeLimitSeconds =
      timeLimitMinutes === null ? null : Math.round(timeLimitMinutes * 60);

    return {
      // Local-only identifier documents that no backend session exists.
      // This prevents accidental assumptions about database provenance.
      // It also keeps result strategies mode-driven instead of id-driven.
      // The timestamp suffix improves traceability during manual debugging.
      // A synthetic code preserves type compatibility across shared UI.
      id: `local-${Date.now()}`,
      code: 'LOCAL',
      text,
      created_at: now,
      time_limit_seconds: normalizedTimeLimitSeconds,
    };
  }

  async function persistToBackend(input: PersistResultInput): Promise<void> {
    const connection = getConnection();
    await connection.saveStudentResult(
      input.sessionId,
      input.studentName,
      input.typedText,
      input.successCount,
      input.failureCount,
      input.accuracy
    );
  }

  async function persistLocally(): Promise<void> {
    // Intentionally no-op: self-practice is explicitly client-only.
    // This ensures the typing session can end cleanly without a server.
    // The UX still shows completion feedback via shared result UI.
    // We keep an async signature for strategy compatibility.
    // Future local history can be added without changing call sites.
    return Promise.resolve();
  }

  function validateStudentName(trimmedName: string): string | null {
    if (!trimmedName) return 'Bitte geben Sie Ihren Namen ein.';
    if (trimmedName.length < 2) return 'Der Name muss mindestens 2 Zeichen lang sein.';
    return null;
  }

  function validateCodeJoinInput(trimmedCode: string): string | null {
    if (!backendAvailable) return 'Server ist nicht verfügbar. Bitte nutzen Sie Selbstständig Üben.';
    if (!trimmedCode) return 'Bitte geben Sie einen Code ein.';
    if (trimmedCode.length !== 6) return 'Der Code muss 6 Zeichen lang sein.';
    return null;
  }

  function validateSelfPracticeInput(trimmedText: string, timeLimitMinutes: number | null): string | null {
    if (!trimmedText) return 'Bitte geben Sie einen Übungstext ein.';

    if (timeLimitMinutes !== null) {
      if (!Number.isFinite(timeLimitMinutes) || timeLimitMinutes <= 0) {
        return 'Bitte geben Sie ein gültiges Zeitlimit in Minuten ein.';
      }
    }

    return null;
  }

  async function handleSubmit(): Promise<void> {
    const trimmedName = studentName.trim();
    const trimmedCode = code.trim().toUpperCase();
    const trimmedSelfPracticeText = selfPracticeText.trim();
    const timeLimitMinutes = selfPracticeTimeLimitMinutesInput ?? null;

    if (mode === 'code') {
      const nameError = validateStudentName(trimmedName);
      if (nameError) {
        error = nameError;
        return;
      }
    }

    const modeError =
      mode === 'code'
        ? validateCodeJoinInput(trimmedCode)
        : validateSelfPracticeInput(trimmedSelfPracticeText, timeLimitMinutes);
    if (modeError) {
      error = modeError;
      return;
    }

    isLoading = true;
    error = '';

    try {
      if (mode === 'code') {
        const connection = getConnection();
        const loadedSession = await connection.getSessionByCode(trimmedCode);

        if (!loadedSession) {
          error = 'Session nicht gefunden. Bitte überprüfen Sie den Code.';
          return;
        }

        session = loadedSession;
        persistResultForSession = persistToBackend;
        confirmedName = trimmedName;
      } else {
        session = createSelfPracticeSession(trimmedSelfPracticeText, timeLimitMinutes);
        persistResultForSession = persistLocally;
        confirmedName = 'Selbstständige Übung';
      }
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

  function handleModeChange(newMode: PracticeMode): void {
    mode = newMode;
    error = '';
  }

  function goBack(): void {
    session = null;
    confirmedName = '';
    code = '';
    selfPracticeText = '';
    selfPracticeTimeLimitMinutesInput = null;
    persistResultForSession = null;
    error = '';
  }
</script>

{#if session}
  <Layout width="wide">
    <TypingSessionView
      {session}
      studentName={confirmedName}
      onBack={goBack}
      persistResult={persistResultForSession}
    />
  </Layout>
{:else}
  <Layout width="narrow">
    <h1 class="text-4xl mb-8 text-text font-normal text-center">Zeilenschreiben</h1>
    <p class="text-center text-text-muted mb-12">
      Übung macht den Meister – Zeile für Zeile.
    </p>

    <div class="space-y-6">
      <div>
        <div class="block text-lg mb-2 text-text">Modus</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            on:click={() => handleModeChange('code')}
            class={`px-4 py-3 rounded-md border text-left transition-colors ${mode === 'code'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-surface text-text hover:bg-surface-elevated'}`}
          >
            Mit Code beitreten
          </button>
          <button
            type="button"
            on:click={() => handleModeChange('self')}
            class={`px-4 py-3 rounded-md border text-left transition-colors ${mode === 'self'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-surface text-text hover:bg-surface-elevated'}`}
          >
            Selbstständig Üben
          </button>
        </div>
      </div>

      {#if mode === 'code'}
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
      {/if}

    {#if mode === 'code'}
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
          disabled={isLoading || !backendAvailable}
          autocomplete="off"
          autocapitalize="characters"
        />
        {#if backendAvailable}
          <p class="mt-2 text-sm text-text-muted text-center">
            Fragen Sie Ihren Lehrer nach dem Code.
          </p>
        {:else}
          <p class="mt-2 text-sm text-error text-center">
            Server nicht verfügbar. Bitte wechseln Sie zu Selbstständig Üben.
          </p>
        {/if}
      </div>
    {:else}
      <div>
        <label for="self-text-input" class="block text-lg mb-2 text-text">
          Übungstext
        </label>
        <textarea
          id="self-text-input"
          bind:value={selfPracticeText}
          placeholder="Schreiben Sie hier den Text, den Sie üben möchten..."
          rows="8"
          class="w-full p-4 text-base bg-surface border border-border rounded-md text-text resize-y focus:outline-none focus:border-primary"
          disabled={isLoading}
        ></textarea>
        <p class="mt-2 text-sm text-text-muted">
          Jede Zeile wird einzeln zum Tippen angezeigt.
        </p>
      </div>

      <div>
        <label for="self-time-limit-input" class="block text-lg mb-2 text-text">
          Zeitlimit (Minuten, optional)
        </label>
        <input
          id="self-time-limit-input"
          type="number"
          min="1"
          step="1"
          bind:value={selfPracticeTimeLimitMinutesInput}
          placeholder="z.B. 5"
          class="w-full max-w-xs p-4 text-lg bg-surface border border-border rounded-md text-text focus:outline-none focus:border-primary"
          disabled={isLoading}
        />
      </div>
    {/if}

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
      {isLoading ? 'Wird geladen...' : mode === 'code' ? 'Mit Code starten' : 'Selbstständig starten'}
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
