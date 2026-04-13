/**
 * connectionFactory.ts - Environment-aware connection factory.
 * Detects runtime environment and creates appropriate connection implementation.
 */

import type { Connection } from './Connection';
import { PostgrestConnection } from './SupabaseConnection';
import { FileSystemConnection } from './FileSystemConnection';

/**
 * Detect if running in Tauri desktop environment.
 */
function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

/**
 * Create connection instance based on environment.
 * - Desktop (Tauri): FileSystemConnection
 * - Web: PostgrestConnection
 * - Development without postgrestUrl: FileSystemConnection (for offline/local testing)
 */
export function createConnection(postgrestUrl?: string): Connection {
  if (isTauriEnvironment()) {
    return new FileSystemConnection();
  }

  // In development without postgrestUrl, fall back to FileSystemConnection
  // This allows testing desktop features locally during development
  if (!postgrestUrl) {
    if (import.meta.env.DEV) {
      console.warn(
        'No postgrestUrl provided in development mode, using FileSystemConnection for testing'
      );
      return new FileSystemConnection();
    }
    throw new Error('postgrestUrl required for web mode');
  }

  return new PostgrestConnection(postgrestUrl);
}
