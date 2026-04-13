// src/ui/pages/StudentForm.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/svelte';
import StudentForm from './StudentForm.svelte';
import * as connectionContext from '../../connections/connectionContext';

const mockGetSessionByCode = vi.fn();
const mockSaveStudentResult = vi.fn().mockResolvedValue({});

vi.spyOn(connectionContext, 'getConnectionContext').mockReturnValue({
  getSessionByCode: mockGetSessionByCode,
  saveStudentResult: mockSaveStudentResult,
  createSession: vi.fn(),
  getSessionResults: vi.fn(),
} as any);

const mockOnNavigate = vi.fn();

function renderForm(props = {}) {
  return render(StudentForm, {
    props: {
      onNavigate: mockOnNavigate,
      backendAvailable: true,
      ...props,
    },
  });
}

describe('StudentForm', () => {
  beforeEach(() => {
    mockGetSessionByCode.mockReset();
    mockSaveStudentResult.mockReset();
    mockSaveStudentResult.mockResolvedValue({});
    mockOnNavigate.mockReset();
  });

  describe('Validation — code join mode', () => {
    it('shows error when name is empty', async () => {
      renderForm();
      await fireEvent.click(screen.getByText('Mit Code starten'));
      expect(screen.getByText('Bitte geben Sie Ihren Namen ein.')).toBeTruthy();
    });

    it('shows error when name is too short', async () => {
      renderForm();
      const nameInput = screen.getByPlaceholderText('Vor- und Nachname');
      await fireEvent.input(nameInput, { target: { value: 'A' } });
      await fireEvent.click(screen.getByText('Mit Code starten'));
      expect(screen.getByText('Der Name muss mindestens 2 Zeichen lang sein.')).toBeTruthy();
    });

    it('shows error when code is empty', async () => {
      renderForm();
      const nameInput = screen.getByPlaceholderText('Vor- und Nachname');
      await fireEvent.input(nameInput, { target: { value: 'Max Mustermann' } });
      await fireEvent.click(screen.getByText('Mit Code starten'));
      expect(screen.getByText('Bitte geben Sie einen Code ein.')).toBeTruthy();
    });

    it('shows error when code is not 6 characters', async () => {
      renderForm();
      const nameInput = screen.getByPlaceholderText('Vor- und Nachname');
      await fireEvent.input(nameInput, { target: { value: 'Max Mustermann' } });
      const codeInput = screen.getByPlaceholderText('z.B. ABC123');
      await fireEvent.input(codeInput, { target: { value: 'ABC' } });
      await fireEvent.click(screen.getByText('Mit Code starten'));
      expect(screen.getByText('Der Code muss 6 Zeichen lang sein.')).toBeTruthy();
    });

    it('shows error when session not found', async () => {
      mockGetSessionByCode.mockResolvedValue(null);
      renderForm();
      const nameInput = screen.getByPlaceholderText('Vor- und Nachname');
      await fireEvent.input(nameInput, { target: { value: 'Max Mustermann' } });
      const codeInput = screen.getByPlaceholderText('z.B. ABC123');
      await fireEvent.input(codeInput, { target: { value: 'ABC123' } });
      await fireEvent.click(screen.getByText('Mit Code starten'));
      await waitFor(() => {
        expect(
          screen.getByText('Session nicht gefunden. Bitte überprüfen Sie den Code.')
        ).toBeTruthy();
      });
    });

    it('transitions to typing session when valid code is submitted', async () => {
      mockGetSessionByCode.mockResolvedValue({
        id: 'session-1',
        code: 'ABC123',
        text: 'hello\nworld',
        created_at: '2026-01-01T00:00:00Z',
        time_limit_seconds: null,
      });
      renderForm();
      const nameInput = screen.getByPlaceholderText('Vor- und Nachname');
      await fireEvent.input(nameInput, { target: { value: 'Max Mustermann' } });
      const codeInput = screen.getByPlaceholderText('z.B. ABC123');
      await fireEvent.input(codeInput, { target: { value: 'ABC123' } });
      await fireEvent.click(screen.getByText('Mit Code starten'));
      await waitFor(() => {
        expect(screen.getByText('Max Mustermann')).toBeTruthy();
      });
    });
  });

  describe('Validation — self practice mode', () => {
    it('switches to self practice mode', async () => {
      renderForm();
      await fireEvent.click(screen.getByText('Selbstständig Üben'));
      expect(
        screen.getByPlaceholderText('Schreiben Sie hier den Text, den Sie üben möchten...')
      ).toBeTruthy();
    });

    it('shows error when practice text is empty', async () => {
      renderForm();
      await fireEvent.click(screen.getByText('Selbstständig Üben'));
      await fireEvent.click(screen.getByText('Selbstständig starten'));
      expect(screen.getByText('Bitte geben Sie einen Übungstext ein.')).toBeTruthy();
    });

    it('starts self practice session when text is provided', async () => {
      renderForm();
      await fireEvent.click(screen.getByText('Selbstständig Üben'));
      const textArea = screen.getByPlaceholderText(
        'Schreiben Sie hier den Text, den Sie üben möchten...'
      );
      await fireEvent.input(textArea, { target: { value: 'Hallo Welt' } });
      await fireEvent.click(screen.getByText('Selbstständig starten'));
      await waitFor(() => {
        expect(screen.getByText('Selbstständige Übung')).toBeTruthy();
      });
    });
  });

  describe('Backend unavailable', () => {
    it('shows error when backend unavailable and code mode attempted', async () => {
      renderForm({ backendAvailable: false });
      const nameInput = screen.getByPlaceholderText('Vor- und Nachname');
      await fireEvent.input(nameInput, { target: { value: 'Max Mustermann' } });
      // Code input is disabled when !backendAvailable, so trigger submit directly
      await fireEvent.click(screen.getByText('Mit Code starten'));
      expect(
        screen.getByText('Server ist nicht verfügbar. Bitte nutzen Sie Selbstständig Üben.')
      ).toBeTruthy();
    });
  });
});
