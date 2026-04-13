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
 * Validate that required environment variables are set.
 * @throws Error if any required config is missing
 */
export function validateConfig(): void {
  if (!config.postgrest.url) {
    throw new Error('VITE_POSTGREST_URL environment variable is required');
  }
}
