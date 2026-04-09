import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChatWindow } from '../../src/components/ChatWindow';

vi.mock('../../src/hooks/useFavorites', () => ({
  useFavorites: vi.fn(),
}));

import { useFavorites } from '../../src/hooks/useFavorites';

const mockUseFavorites = vi.mocked(useFavorites);

describe('ChatWindow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial assistant message', () => {
    mockUseFavorites.mockReturnValue({
      favorites: [],
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      isFavorite: vi.fn(() => false),
    });

    render(<ChatWindow />);

    expect(screen.getByText(/hi, i am your weather helper/i)).toBeInTheDocument();
  });

  it('sends a user message and shows an assistant reply', async () => {
    const user = userEvent.setup();

    mockUseFavorites.mockReturnValue({
      favorites: ['London'],
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      isFavorite: vi.fn(() => true),
    });

    render(<ChatWindow />);

    await user.type(screen.getByRole('textbox', { name: /chat message/i }), 'What should I wear tomorrow?');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(screen.getByText('What should I wear tomorrow?')).toBeInTheDocument();
    expect(screen.getByText(/start with layers: a breathable base/i)).toBeInTheDocument();
  });

  it('clears chat history back to the initial assistant message', async () => {
    const user = userEvent.setup();

    mockUseFavorites.mockReturnValue({
      favorites: ['London'],
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      isFavorite: vi.fn(() => true),
    });

    render(<ChatWindow />);

    await user.type(screen.getByRole('textbox', { name: /chat message/i }), 'Tell me about favorite cities');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(screen.getByText('Tell me about favorite cities')).toBeInTheDocument();
    expect(screen.getByText(/favorite cities section/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear chat/i }));

    expect(screen.getByText(/hi, i am your weather helper/i)).toBeInTheDocument();
    expect(screen.queryByText('Tell me about favorite cities')).not.toBeInTheDocument();
    expect(screen.queryByText(/favorite cities section/i)).not.toBeInTheDocument();
  });

  it('shows favorite cities list in the chat card', () => {
    mockUseFavorites.mockReturnValue({
      favorites: ['London', 'Paris'],
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      isFavorite: vi.fn(() => true),
    });

    render(<ChatWindow />);

    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });
});
