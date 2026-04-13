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
  let backendWarning: string = '';
  let isInitialized: boolean = false;
  let isBackendAvailable: boolean = false;

  onMount(() => {
    try {
      validateConfig();
      initConnection(config.postgrest.url);
      isBackendAvailable = true;
      isInitialized = true;
    } catch (e) {
      // Self-practice must remain usable even if backend credentials are absent.
      // We therefore downgrade connection bootstrap failures into a warning.
      // Teacher features and code-based joining still require backend connectivity.
      // This separation prevents offline users from being blocked on app startup.
      // It keeps server-dependent paths explicit while preserving core pedagogy.
      backendWarning = e instanceof Error ? e.message : 'Initialisierungsfehler';
      isBackendAvailable = false;
      isInitialized = true;
    }
  });

  function navigate(page: Page): void {
    currentPage = page;
  }
</script>

{#if !isInitialized}
  <Layout width="narrow">
    <div class="text-center">
      <p class="text-text-muted">Wird geladen...</p>
    </div>
  </Layout>
{:else if currentPage === 'home'}
  {#if backendWarning}
    <Layout width="narrow">
      <div class="p-4 mb-6 bg-error/10 border border-error rounded-md">
        <h2 class="text-lg text-error font-bold">Hinweis zur Server-Verbindung</h2>
        <p class="text-text mt-1">{backendWarning}</p>
        <p class="text-sm text-text-muted mt-2">
          Selbstständig Üben funktioniert weiterhin ohne Server.
        </p>
      </div>
    </Layout>
  {/if}
  <StudentForm onNavigate={navigate} backendAvailable={isBackendAvailable} />
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
