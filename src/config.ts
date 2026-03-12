/**
 * config.ts - Environment configuration for the application.
 * Reads Supabase credentials from environment variables set at build time.
 */

export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL as string,
    anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
  },
};

/**
 * Validate that required environment variables are set.
 * @throws Error if any required config is missing
 */
export function validateConfig(): void {
  if (!config.supabase.url) {
    throw new Error('VITE_SUPABASE_URL environment variable is required');
  }
  if (!config.supabase.anonKey) {
    throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY environment variable is required');
  }
}
