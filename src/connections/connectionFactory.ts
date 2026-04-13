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
 */
export function createConnection(postgrestUrl?: string): Connection {
  if (isTauriEnvironment()) {
    return new FileSystemConnection();
  }

  if (!postgrestUrl) {
    throw new Error('postgrestUrl required for web mode');
  }

  return new PostgrestConnection(postgrestUrl);
}
