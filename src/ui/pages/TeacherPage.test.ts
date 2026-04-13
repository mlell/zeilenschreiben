// src/ui/pages/TeacherPage.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/svelte';
import TeacherPage from './TeacherPage.svelte';
import * as connectionContext from '../../connections/connectionContext';

const mockCreateSession = vi.fn();
const mockGetSessionByCode = vi.fn();
const mockGetSessionResults = vi.fn();

vi.spyOn(connectionContext, 'getConnectionContext').mockReturnValue({
  createSession: mockCreateSession,
  getSessionByCode: mockGetSessionByCode,
  getSessionResults: mockGetSessionResults,
  saveStudentResult: vi.fn(),
} as any);

function renderPage() {
  return render(TeacherPage);
}

describe('TeacherPage', () => {
  beforeEach(() => {
    mockCreateSession.mockReset();
    mockGetSessionByCode.mockReset();
    mockGetSessionResults.mockReset();
  });

  describe('Create session', () => {
    it('shows validation error when text is empty', async () => {
      renderPage();
      await fireEvent.submit(document.querySelector('form')!);
      expect(screen.getByText('Bitte geben Sie einen Text ein.')).toBeTruthy();
    });

    it('shows generated code after successful session creation', async () => {
      mockCreateSession.mockResolvedValue({
        id: 'session-1',
        code: 'XYZ789',
        text: 'Hallo Welt',
        created_at: '2026-01-01T00:00:00Z',
        time_limit_seconds: null,
      });
      renderPage();
      const textArea = screen.getByPlaceholderText(
        'Fügen Sie hier den Text ein, den die Schüler tippen sollen...'
      );
      await fireEvent.input(textArea, { target: { value: 'Hallo Welt' } });
      await fireEvent.submit(document.querySelector('form')!);
      await waitFor(() => {
        expect(screen.getByText('XYZ789')).toBeTruthy();
        expect(screen.getByText('Session erstellt!')).toBeTruthy();
      });
    });

    it('shows error when session creation fails', async () => {
      mockCreateSession.mockRejectedValue(new Error('Datenbankfehler'));
      renderPage();
      const textArea = screen.getByPlaceholderText(
        'Fügen Sie hier den Text ein, den die Schüler tippen sollen...'
      );
      await fireEvent.input(textArea, { target: { value: 'Hallo Welt' } });
      await fireEvent.submit(document.querySelector('form')!);
      await waitFor(() => {
        expect(screen.getByText('Datenbankfehler')).toBeTruthy();
      });
    });
  });

  describe('Load existing session', () => {
    it('shows validation error when code is empty', async () => {
      renderPage();
      await fireEvent.click(screen.getByText('Session laden'));
      expect(screen.getByText('Bitte geben Sie einen Code ein.')).toBeTruthy();
    });

    it('shows validation error when code is not 6 characters', async () => {
      renderPage();
      const codeInput = screen.getByPlaceholderText('z.B. ABC123');
      await fireEvent.input(codeInput, { target: { value: 'ABC' } });
      await fireEvent.click(screen.getByText('Session laden'));
      expect(screen.getByText('Der Code muss 6 Zeichen lang sein.')).toBeTruthy();
    });

    it('shows error when session not found', async () => {
      mockGetSessionByCode.mockResolvedValue(null);
      renderPage();
      const codeInput = screen.getByPlaceholderText('z.B. ABC123');
      await fireEvent.input(codeInput, { target: { value: 'NOTFND' } });
      await fireEvent.click(screen.getByText('Session laden'));
      await waitFor(() => {
        expect(
          screen.getByText('Session nicht gefunden. Bitte überprüfen Sie den Code.')
        ).toBeTruthy();
      });
    });

    it('shows error when loading results fails', async () => {
      mockGetSessionByCode.mockResolvedValue({
        id: 'session-1',
        code: 'ABC123',
        text: 'Hallo',
        created_at: '2026-01-01T00:00:00Z',
        time_limit_seconds: null,
      });
      mockGetSessionResults.mockRejectedValue(new Error('Ergebnisse konnten nicht geladen werden'));
      renderPage();
      const codeInput = screen.getByPlaceholderText('z.B. ABC123');
      await fireEvent.input(codeInput, { target: { value: 'ABC123' } });
      await fireEvent.click(screen.getByText('Session laden'));
      await waitFor(() => {
        expect(screen.getByText('Ergebnisse konnten nicht geladen werden')).toBeTruthy();
      });
    });

    it('shows results table when session and results are loaded', async () => {
      mockGetSessionByCode.mockResolvedValue({
        id: 'session-1',
        code: 'ABC123',
        text: 'Hallo',
        created_at: '2026-01-01T00:00:00Z',
        time_limit_seconds: null,
      });
      mockGetSessionResults.mockResolvedValue([
        {
          id: 'result-1',
          session_id: 'session-1',
          student_name: 'Anna Schmidt',
          typed_text: 'Hallo',
          success_count: 1,
          failure_count: 0,
          accuracy: 100,
          completed_at: '2026-01-01T10:00:00Z',
        },
      ]);
      renderPage();
      const codeInput = screen.getByPlaceholderText('z.B. ABC123');
      await fireEvent.input(codeInput, { target: { value: 'ABC123' } });
      await fireEvent.click(screen.getByText('Session laden'));
      await waitFor(() => {
        expect(screen.getByText('Anna Schmidt')).toBeTruthy();
        expect(screen.getByText('100%')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('returns to main view when "← Zurück" is clicked from results', async () => {
      mockGetSessionByCode.mockResolvedValue({
        id: 'session-1',
        code: 'ABC123',
        text: 'Hallo',
        created_at: '2026-01-01T00:00:00Z',
        time_limit_seconds: null,
      });
      mockGetSessionResults.mockResolvedValue([]);
      renderPage();
      const codeInput = screen.getByPlaceholderText('z.B. ABC123');
      await fireEvent.input(codeInput, { target: { value: 'ABC123' } });
      await fireEvent.click(screen.getByText('Session laden'));
      await waitFor(() => {
        expect(screen.getByText('← Zurück')).toBeTruthy();
      });
      await fireEvent.click(screen.getByText('← Zurück'));
      // Back on main view: "Session laden" button is visible again
      expect(screen.getByText('Session laden')).toBeTruthy();
    });
  });
});
