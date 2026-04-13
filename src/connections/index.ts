/**
 * connections/index.ts - Connection factory and context management.
 * Provides a centralized way to access the backend connection throughout the app.
 */

export type { Connection, TypingSession, StudentResult } from './Connection';
export { PostgrestConnection } from './SupabaseConnection';
export { FileSystemConnection } from './FileSystemConnection';
export { createConnection } from './connectionFactory';
export { setConnectionContext, getConnectionContext } from './connectionContext';
