<!--
  App.svelte - Main application entry point with simple routing.
  Provides navigation between Teacher and Student pages, and initializes
  the Supabase connection on startup.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { initConnection } from './connections';
  import { config, validateConfig } from './config';
  import TeacherPage from './ui/pages/TeacherPage.svelte';
  import StudentPage from './ui/pages/StudentPage.svelte';

  type Page = 'home' | 'teacher' | 'student';

  let currentPage: Page = 'home';
  let initError: string = '';
  let isInitialized: boolean = false;

  onMount(() => {
    try {
      validateConfig();
      initConnection(config.supabase.url, config.supabase.anonKey);
      isInitialized = true;
    } catch (e) {
      initError = e instanceof Error ? e.message : 'Initialisierungsfehler';
    }
  });

  function navigate(page: Page): void {
    currentPage = page;
  }
</script>

{#if initError}
  <main class="max-w-xl mx-auto p-8">
    <div class="p-6 bg-error/10 border border-error rounded-md">
      <h2 class="text-xl mb-4 text-error font-bold">Konfigurationsfehler</h2>
      <p class="text-text">{initError}</p>
      <p class="mt-4 text-sm text-text-muted">
        Bitte stellen Sie sicher, dass die Umgebungsvariablen korrekt gesetzt sind.
      </p>
    </div>
  </main>
{:else if !isInitialized}
  <main class="max-w-xl mx-auto p-8 text-center">
    <p class="text-text-muted">Wird geladen...</p>
  </main>
{:else if currentPage === 'home'}
  <main class="max-w-xl mx-auto p-8">
    <h1 class="text-4xl mb-8 text-text font-normal text-center">Zeilenschreiben</h1>
    <p class="text-center text-text-muted mb-12">
      Übung macht den Meister – Zeile für Zeile.
    </p>

    <div class="flex flex-col gap-4">
      <button
        on:click={() => navigate('teacher')}
        class="w-full px-8 py-6 text-xl bg-primary text-white border-none rounded-md cursor-pointer transition-colors duration-300 hover:bg-primary-hover"
      >
        Ich bin Lehrer
      </button>

      <button
        on:click={() => navigate('student')}
        class="w-full px-8 py-6 text-xl bg-surface border-2 border-primary text-primary rounded-md cursor-pointer transition-colors duration-300 hover:bg-primary/10"
      >
        Ich bin Schüler
      </button>
    </div>
  </main>
{:else if currentPage === 'teacher'}
  <div class="mb-4 p-4">
    <button
      on:click={() => navigate('home')}
      class="text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
    >
      ← Zurück zur Startseite
    </button>
  </div>
  <TeacherPage />
{:else if currentPage === 'student'}
  <div class="mb-4 p-4">
    <button
      on:click={() => navigate('home')}
      class="text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
    >
      ← Zurück zur Startseite
    </button>
  </div>
  <StudentPage />
{/if}
