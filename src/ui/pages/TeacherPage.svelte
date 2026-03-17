<!--
  TeacherPage.svelte - Session management interface for instructors.
  Allows teachers to create new sessions or view existing session results.
-->
<script lang="ts">
  import { getConnection, type TypingSession as SessionData, type StudentResult } from '../../connections';

  // View mode: 'main' | 'success' | 'results'
  type ViewMode = 'main' | 'success' | 'results';
  let viewMode: ViewMode = 'main';

  // New session form state
  let text: string = '';
  let timeLimitMinutesInput: number | null = null;
  let isSubmitting: boolean = false;
  let error: string = '';
  let generatedCode: string = '';

  // Existing session state
  let existingCode: string = '';
  let isLoadingSession: boolean = false;
  let loadedSession: SessionData | null = null;
  let sessionResults: StudentResult[] = [];

  async function handleCreateSession(): Promise<void> {
    if (!text.trim()) {
      error = 'Bitte geben Sie einen Text ein.';
      return;
    }

    // Allow untimed practice by keeping the time limit optional for instructors.
    const timeLimitMinutes = timeLimitMinutesInput ?? null;

    if (timeLimitMinutes !== null) {
      if (!Number.isFinite(timeLimitMinutes) || timeLimitMinutes <= 0) {
        error = 'Bitte geben Sie ein gültiges Zeitlimit in Minuten ein.';
        return;
      }
    }

    isSubmitting = true;
    error = '';

    try {
      const connection = getConnection();
      const timeLimitSeconds = timeLimitMinutes === null ? null : Math.round(timeLimitMinutes * 60);
      const session = await connection.createSession(text.trim(), timeLimitSeconds);
      generatedCode = session.code;
      viewMode = 'success';
    } catch (e) {
      error = e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten.';
    } finally {
      isSubmitting = false;
    }
  }

  async function handleLoadSession(): Promise<void> {
    const trimmedCode = existingCode.trim().toUpperCase();

    if (!trimmedCode) {
      error = 'Bitte geben Sie einen Code ein.';
      return;
    }

    if (trimmedCode.length !== 6) {
      error = 'Der Code muss 6 Zeichen lang sein.';
      return;
    }

    isLoadingSession = true;
    error = '';

    try {
      const connection = getConnection();
      const session = await connection.getSessionByCode(trimmedCode);

      if (!session) {
        error = 'Session nicht gefunden. Bitte überprüfen Sie den Code.';
        return;
      }

      loadedSession = session;
      sessionResults = await connection.getSessionResults(session.id);
      viewMode = 'results';
    } catch (e) {
      error = e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten.';
    } finally {
      isLoadingSession = false;
    }
  }

  async function refreshResults(): Promise<void> {
    if (!loadedSession) return;

    try {
      const connection = getConnection();
      sessionResults = await connection.getSessionResults(loadedSession.id);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Fehler beim Aktualisieren.';
    }
  }

  function downloadCSV(): void {
    if (!loadedSession || sessionResults.length === 0) return;

    const headers = ['Name', 'Erfolgreich', 'Fehler', 'Genauigkeit (%)', 'Abgeschlossen', 'Getippter Text'];
    const rows = sessionResults.map((r) => [
      r.student_name,
      r.success_count.toString(),
      r.failure_count.toString(),
      r.accuracy.toString(),
      new Date(r.completed_at).toLocaleString('de-DE'),
      `"${r.typed_text.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `session-${loadedSession.code}-ergebnisse.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function copyCode(): void {
    navigator.clipboard.writeText(generatedCode);
  }

  async function viewSessionResults(): Promise<void> {
    existingCode = generatedCode;
    await handleLoadSession();
  }

  function goToMain(): void {
    viewMode = 'main';
    text = '';
    timeLimitMinutesInput = null;
    existingCode = '';
    generatedCode = '';
    loadedSession = null;
    sessionResults = [];
    error = '';
  }

  function handleExistingKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      handleLoadSession();
    }
  }
</script>

<h1 class="text-4xl mb-8 text-text font-normal">Lehrer-Bereich</h1>

  <!-- Main View: Existing Session first, then New Session -->
  {#if viewMode === 'main'}
    <div class="space-y-8">
      <!-- Existing Session Section -->
      <div class="space-y-4">
        <div>
          <label for="code-input" class="block text-lg mb-2 text-text">
            Existierende Aufgabe laden: Code eingeben
          </label>
          <input
            id="code-input"
            type="text"
            bind:value={existingCode}
            on:keydown={handleExistingKeyDown}
            placeholder="z.B. ABC123"
            maxlength="6"
            class="w-full max-w-xs p-4 text-2xl font-mono text-center tracking-widest uppercase bg-surface border border-border rounded-md text-text focus:outline-none focus:border-primary"
            disabled={isLoadingSession}
            autocomplete="off"
            autocapitalize="characters"
          />

          <button
            on:click={handleLoadSession}
            disabled={isLoadingSession}
            class="px-8 py-4 text-lg bg-primary text-white border-none rounded-md cursor-pointer transition-colors duration-300 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingSession ? 'Wird geladen...' : 'Session laden'}
          </button>
        </div>
      </div>

      <!-- Divider -->
      <div class="flex items-center gap-4 my-8">
        <div class="flex-1 h-px bg-border"></div>
        <span class="text-text-muted text-xl font-medium">ODER</span>
        <div class="flex-1 h-px bg-border"></div>
      </div>

      <!-- New Session Section -->
      <form on:submit|preventDefault={handleCreateSession} class="space-y-6">
        <div>
          <label for="text-input" class="block text-lg mb-2 text-text">
            Neue Session erstellen
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

        <div>
          <label for="time-limit-input" class="block text-lg mb-2 text-text">
            Zeitlimit (Minuten, optional)
          </label>
          <input
            id="time-limit-input"
            type="number"
            min="1"
            step="1"
            bind:value={timeLimitMinutesInput}
            placeholder="z.B. 5"
            class="w-full max-w-xs p-4 text-lg bg-surface border border-border rounded-md text-text focus:outline-none focus:border-primary"
            disabled={isSubmitting}
          />
          <p class="mt-2 text-sm text-text-muted">
            Leer lassen, um ohne Zeitlimit zu starten.
          </p>
        </div>


        <button
          type="submit"
          disabled={isSubmitting}
          class="px-8 py-4 text-lg bg-primary text-white border-none rounded-md cursor-pointer transition-colors duration-300 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Wird erstellt...' : 'Session erstellen'}
        </button>
      </form>

      <!-- Error Display -->
      {#if error}
        <div class="p-4 bg-error/10 border border-error rounded-md text-error">
          {error}
        </div>
      {/if}
    </div>

  <!-- Success: Session Created -->
  {:else if viewMode === 'success'}
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

      <div class="flex gap-4">
        <button
          on:click={viewSessionResults}
          class="px-8 py-4 text-lg bg-primary text-white border-none rounded-md cursor-pointer transition-colors duration-300 hover:bg-primary-hover"
        >
          Ergebnisse anzeigen
        </button>
        <button
          on:click={goToMain}
          class="px-8 py-4 text-lg bg-surface border border-border text-text rounded-md cursor-pointer transition-colors duration-300 hover:bg-surface-elevated"
        >
          Zurück zur Übersicht
        </button>
      </div>
    </div>

  <!-- Results View -->
  {:else if viewMode === 'results' && loadedSession}
    <button
      on:click={goToMain}
      class="mb-6 px-4 py-2 text-sm bg-surface border border-border text-text rounded-md cursor-pointer hover:bg-surface-elevated transition-colors"
    >
      ← Zurück
    </button>

    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl text-text font-normal">
            Session: <span class="font-mono font-bold text-primary">{loadedSession.code}</span>
          </h2>
          <p class="text-text-muted text-sm mt-1">
            Erstellt am {new Date(loadedSession.created_at).toLocaleString('de-DE')}
          </p>
        </div>
        <div class="flex gap-3">
          <button
            on:click={refreshResults}
            class="px-4 py-2 text-sm bg-surface border border-border text-text rounded-md cursor-pointer hover:bg-surface-elevated transition-colors"
          >
            Aktualisieren
          </button>
          <button
            on:click={downloadCSV}
            disabled={sessionResults.length === 0}
            class="px-4 py-2 text-sm bg-primary text-white rounded-md cursor-pointer hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            CSV herunterladen
          </button>
        </div>
      </div>

      <!-- Results Table -->
      {#if sessionResults.length === 0}
        <div class="p-8 bg-surface-elevated rounded-lg text-center">
          <p class="text-text-muted">Noch keine Ergebnisse vorhanden.</p>
          <p class="text-text-muted text-sm mt-2">
            Sobald Schüler die Session abschließen, erscheinen ihre Ergebnisse hier.
          </p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-surface-elevated">
                <th class="p-3 text-left text-text font-medium border-b border-border">Name</th>
                <th class="p-3 text-center text-text font-medium border-b border-border">Erfolgreich</th>
                <th class="p-3 text-center text-text font-medium border-b border-border">Fehler</th>
                <th class="p-3 text-center text-text font-medium border-b border-border">Genauigkeit</th>
                <th class="p-3 text-left text-text font-medium border-b border-border">Abgeschlossen</th>
              </tr>
            </thead>
            <tbody>
              {#each sessionResults as result}
                <tr class="hover:bg-surface-elevated transition-colors">
                  <td class="p-3 text-text border-b border-border">{result.student_name}</td>
                  <td class="p-3 text-center text-success border-b border-border">{result.success_count}</td>
                  <td class="p-3 text-center text-error border-b border-border">{result.failure_count}</td>
                  <td class="p-3 text-center text-primary border-b border-border">{result.accuracy}%</td>
                  <td class="p-3 text-text-muted text-sm border-b border-border">
                    {new Date(result.completed_at).toLocaleString('de-DE')}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}

      <!-- Session Text Preview -->
      <details class="bg-surface rounded-lg">
        <summary class="p-4 cursor-pointer text-text hover:bg-surface-elevated rounded-lg transition-colors">
          Übungstext anzeigen
        </summary>
        <div class="p-4 pt-0">
          <pre class="whitespace-pre-wrap text-text-muted text-sm">{loadedSession.text}</pre>
        </div>
      </details>
    </div>
  {/if}
