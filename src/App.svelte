<!--
  App.svelte - Main application entry point with simple routing.
  Provides navigation between Teacher and Student pages, and initializes
  the Supabase connection on startup.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { initConnection } from './connections';
  import { config, validateConfig } from './config';
  import Layout from './ui/components/Layout.svelte';
  import TeacherPage from './ui/pages/TeacherPage.svelte';
  import StudentForm from './ui/pages/StudentForm.svelte';

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
  <Layout width="narrow">
    <div class="p-6 bg-error/10 border border-error rounded-md">
      <h2 class="text-xl mb-4 text-error font-bold">Konfigurationsfehler</h2>
      <p class="text-text">{initError}</p>
      <p class="mt-4 text-sm text-text-muted">
        Bitte stellen Sie sicher, dass die Umgebungsvariablen korrekt gesetzt sind.
      </p>
    </div>
  </Layout>
{:else if !isInitialized}
  <Layout width="narrow">
    <div class="text-center">
      <p class="text-text-muted">Wird geladen...</p>
    </div>
  </Layout>
{:else if currentPage === 'home'}
  <StudentForm onNavigate={navigate} />
{:else if currentPage === 'teacher'}
  <Layout width="wide">
    <div class="mb-4">
      <button
        on:click={() => navigate('home')}
        class="text-sm text-text-muted hover:text-text transition-colors cursor-pointer"
      >
        ← Zurück zur Startseite
      </button>
    </div>
    <TeacherPage />
  </Layout>
{/if}
