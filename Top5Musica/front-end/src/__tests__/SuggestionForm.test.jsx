import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import SuggestionForm from '../components/SuggestionForm';

// Mock da função fetch do navegador
globalThis.fetch = vi.fn();

describe('SuggestionForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('mostra aviso de login quando o usuário NÃO está logado', () => {
    render(
      <MemoryRouter>
        <SuggestionForm user={null} />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Você precisa estar conectado para enviar novas sugestões/i)
    ).toBeInTheDocument();
  });

  it('renderiza os campos do formulário quando o usuário ESTÁ logado', () => {
    const mockUser = { id: 1, name: 'João' };

    render(
      <MemoryRouter>
        <SuggestionForm user={mockUser} />
      </MemoryRouter>
    );

    expect(
      screen.getByPlaceholderText(/Nome da Música/i)
    ).toBeInTheDocument();
  });

  it('exibe a prévia da thumbnail quando o link do YouTube é válido', () => {
    render(
      <MemoryRouter>
        <SuggestionForm user={{ id: 1, name: 'Teste' }} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Cole aqui o link do YouTube/i), {
      target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
    });

    const previewImage = screen.getByAltText(/Thumbnail do vídeo sugerido/i);

    expect(previewImage).toBeInTheDocument();
    expect(previewImage).toHaveAttribute('src', expect.stringContaining('dQw4w9WgXcQ'));
  });

  it('mostra feedback discreto quando o link informado não é do YouTube', () => {
    render(
      <MemoryRouter>
        <SuggestionForm user={{ id: 1, name: 'Teste' }} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Cole aqui o link do YouTube/i), {
      target: { value: 'https://example.com/video' }
    });

    expect(
      screen.getByText(/Cole um link válido do YouTube para visualizar a prévia/i)
    ).toBeInTheDocument();
    expect(screen.queryByAltText(/Thumbnail do vídeo sugerido/i)).not.toBeInTheDocument();
  });

  it('exibe mensagem de sucesso ao enviar o formulário corretamente', async () => {
    Storage.prototype.getItem = vi.fn(() => 'token-falso');

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Música sugerida com sucesso!' })
    });

    render(
      <MemoryRouter>
        <SuggestionForm user={{ id: 1, name: 'Teste' }} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Nome da Música/i), {
      target: { value: 'Nova Música' }
    });

    fireEvent.change(screen.getByPlaceholderText(/Cole aqui o link do YouTube/i), {
      target: { value: 'https://youtube.com/watch?v=123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Enviar Link/i }));

    await waitFor(() => {
      expect(screen.getByText(/Música sugerida com sucesso!/i)).toBeInTheDocument();
    });
  });

  it('exibe mensagem de erro da API se algo der errado', async () => {
    Storage.prototype.getItem = vi.fn(() => 'token-falso');

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Link do YouTube já existe.' })
    });

    render(
      <MemoryRouter>
        <SuggestionForm user={{ id: 1, name: 'Teste' }} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Nome da Música/i), {
      target: { value: 'Música Repetida' }
    });

    fireEvent.change(screen.getByPlaceholderText(/Cole aqui o link do YouTube/i), {
      target: { value: 'https://youtube.com/watch?v=123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Enviar Link/i }));

    await waitFor(() => {
      expect(screen.getByText(/Link do YouTube já existe./i)).toBeInTheDocument();
    });
  });
});
