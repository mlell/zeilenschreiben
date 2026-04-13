/**
 * connectionContext.ts - Svelte context for dependency injection.
 * Provides connection instance to component tree without prop drilling.
 */

import { setContext, getContext } from 'svelte';
import type { Connection } from './Connection';

const CONNECTION_KEY = Symbol('connection');

/**
 * Set connection instance in Svelte context.
 * Call once in root component.
 */
export function setConnectionContext(connection: Connection): void {
  setContext(CONNECTION_KEY, connection);
}

/**
 * Get connection instance from Svelte context.
 * @throws Error if context not set
 */
export function getConnectionContext(): Connection {
  const connection = getContext<Connection>(CONNECTION_KEY);
  if (!connection) {
    throw new Error('Connection context not set. Call setConnectionContext() in root component.');
  }
  return connection;
}
