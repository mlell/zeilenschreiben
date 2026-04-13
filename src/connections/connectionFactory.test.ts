import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createConnection } from './connectionFactory';
import { PostgrestConnection } from './SupabaseConnection';
import { FileSystemConnection } from './FileSystemConnection';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('createConnection', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    // Reset window to a plain object (non-Tauri)
    Object.defineProperty(globalThis, 'window', {
      value: {},
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
  });

  it('returns PostgrestConnection when postgrestUrl is provided', () => {
    const conn = createConnection('http://localhost:3000');
    expect(conn).toBeInstanceOf(PostgrestConnection);
  });

  it('returns FileSystemConnection in Tauri environment', () => {
    Object.defineProperty(globalThis, 'window', {
      value: { __TAURI__: {} },
      writable: true,
      configurable: true,
    });
    const conn = createConnection('http://localhost:3000');
    expect(conn).toBeInstanceOf(FileSystemConnection);
  });

  // Note on the "no URL" case:
  // import.meta.env.DEV is TRUE in vitest runs, so createConnection() without a URL
  // returns FileSystemConnection (dev fallback), not throw.
  it('returns FileSystemConnection when no postgrestUrl in dev mode', () => {
    const conn = createConnection();
    expect(conn).toBeInstanceOf(FileSystemConnection);
  });
});
