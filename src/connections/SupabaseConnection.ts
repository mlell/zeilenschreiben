/**
 * SupabaseConnection.ts - Supabase implementation of the Connection interface.
 * Uses PostgREST API via fetch to communicate with Supabase backend.
 * No SDK dependency - direct REST calls for minimal bundle size.
 */

import type { Connection, TypingSession } from './Connection';

/**
 * Generate a random 6-character alphanumeric code for session access.
 * Uses uppercase letters and digits for easy verbal communication.
 */
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit confusing chars: I, O, 0, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class SupabaseConnection implements Connection {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.baseUrl = `${supabaseUrl}/rest/v1`;
    this.apiKey = supabaseAnonKey;
  }

  private get headers(): HeadersInit {
    return {
      apikey: this.apiKey,
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    };
  }

  async createSession(text: string): Promise<TypingSession> {
    const code = generateCode();

    const response = await fetch(`${this.baseUrl}/typing_sessions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ code, text }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create session: ${error}`);
    }

    const [session] = await response.json();
    return session as TypingSession;
  }

  async getSessionByCode(code: string): Promise<TypingSession | null> {
    const normalizedCode = code.toUpperCase().trim();

    const response = await fetch(
      `${this.baseUrl}/typing_sessions?code=eq.${encodeURIComponent(normalizedCode)}&limit=1`,
      {
        method: 'GET',
        headers: this.headers,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch session: ${error}`);
    }

    const sessions = await response.json();
    return sessions.length > 0 ? (sessions[0] as TypingSession) : null;
  }
}
