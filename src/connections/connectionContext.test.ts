import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as svelte from 'svelte';
import { setConnectionContext, getConnectionContext } from './connectionContext';
import type { Connection } from './Connection';

vi.mock('svelte', () => ({
  setContext: vi.fn(),
  getContext: vi.fn(),
}));

const mockConnection: Connection = {
  createSession: vi.fn(),
  getSessionByCode: vi.fn(),
  saveStudentResult: vi.fn(),
  getSessionResults: vi.fn(),
};

describe('getConnectionContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('throws when context is not set', () => {
    vi.mocked(svelte.getContext).mockReturnValue(undefined);

    expect(() => getConnectionContext()).toThrow(
      'Connection context not set. Call setConnectionContext() in root component.'
    );
  });

  it('returns the connection when context is set', () => {
    vi.mocked(svelte.getContext).mockReturnValue(mockConnection);

    const result = getConnectionContext();

    expect(result).toBe(mockConnection);
  });
});

describe('setConnectionContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calls setContext with the connection as second argument', () => {
    setConnectionContext(mockConnection);

    expect(svelte.setContext).toHaveBeenCalledWith(expect.any(Symbol), mockConnection);
  });
});
