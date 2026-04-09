import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FavoritesList } from '../../src/components/FavoritesList';

vi.mock('../../src/hooks/useFavorites', () => ({
  useFavorites: vi.fn(),
}));

vi.mock('../../src/components/FavoriteWeatherCard', () => ({
  FavoriteWeatherCard: ({ city }: { city: string }) => (
    <div data-testid={`favorite-card-${city}`}>{city}</div>
  ),
}));

import { useFavorites } from '../../src/hooks/useFavorites';

const mockUseFavorites = vi.mocked(useFavorites);

describe('FavoritesList', () => {
  const mockRemoveFavorite = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no favorites', () => {
    mockUseFavorites.mockReturnValue({
      favorites: [],
      addFavorite: vi.fn(),
      removeFavorite: mockRemoveFavorite,
      isFavorite: vi.fn(() => false),
    });

    render(<FavoritesList />);

    expect(screen.getByText(/no favorites yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/search for a city and click ☆ to save it here/i),
    ).toBeInTheDocument();
  });

  it('renders favorite cities when favorites exist', () => {
    mockUseFavorites.mockReturnValue({
      favorites: ['London', 'Paris', 'Tokyo'],
      addFavorite: vi.fn(),
      removeFavorite: mockRemoveFavorite,
      isFavorite: vi.fn(() => true),
    });

    render(<FavoritesList />);

    expect(screen.getByTestId('favorite-card-London')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-card-Paris')).toBeInTheDocument();
    expect(screen.getByTestId('favorite-card-Tokyo')).toBeInTheDocument();
  });

  it('does not render empty state when favorites exist', () => {
    mockUseFavorites.mockReturnValue({
      favorites: ['London'],
      addFavorite: vi.fn(),
      removeFavorite: mockRemoveFavorite,
      isFavorite: vi.fn(() => true),
    });

    render(<FavoritesList />);

    expect(screen.queryByText(/no favorites yet/i)).not.toBeInTheDocument();
  });

  it('renders section with heading', () => {
    mockUseFavorites.mockReturnValue({
      favorites: [],
      addFavorite: vi.fn(),
      removeFavorite: mockRemoveFavorite,
      isFavorite: vi.fn(() => false),
    });

    render(<FavoritesList />);

    expect(
      screen.getByRole('heading', { name: /favorites/i }),
    ).toBeInTheDocument();
  });

  it('renders star icon in empty state', () => {
    mockUseFavorites.mockReturnValue({
      favorites: [],
      addFavorite: vi.fn(),
      removeFavorite: mockRemoveFavorite,
      isFavorite: vi.fn(() => false),
    });

    const { container } = render(<FavoritesList />);

    const starIcon = container.querySelector('svg');
    expect(starIcon).toBeInTheDocument();
  });
});
