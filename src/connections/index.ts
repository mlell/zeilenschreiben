/**
 * connections/index.ts - Connection factory and singleton management.
 * Provides a centralized way to access the backend connection throughout the app.
 */

export type { Connection, TypingSession, StudentResult } from './Connection';
export { PostgrestConnection } from './SupabaseConnection';

import type { Connection } from './Connection';
import { PostgrestConnection } from './SupabaseConnection';

let connectionInstance: Connection | null = null;

/**
 * Initialize the connection with PostgREST API URL.
 * Must be called once at app startup before using getConnection().
 */
export function initConnection(postgrestUrl: string): void {
  connectionInstance = new PostgrestConnection(postgrestUrl);
}

/**
 * Get the singleton connection instance.
 * @throws Error if initConnection() hasn't been called
 */
export function getConnection(): Connection {
  if (!connectionInstance) {
    throw new Error('Connection not initialized. Call initConnection() first.');
  }
  return connectionInstance;
}
