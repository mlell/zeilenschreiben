/**
 * config.ts - Environment configuration for the application.
 * Reads PostgREST API URL from environment variables set at build time.
 */

export const config = {
  postgrest: {
    url: import.meta.env.VITE_POSTGREST_URL as string,
  },
};

/**
 * Validate configuration. PostgREST URL is optional to allow offline/desktop mode.
 * Teacher features require a configured PostgREST backend.
 */
export function validateConfig(): void {
  // No required config in development - app works in offline mode with FileSystemConnection
  // Teacher features will be unavailable if postgrestUrl is not set
}
