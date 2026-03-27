import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WeatherCard } from '../../src/components/WeatherCard';
import type { WeatherCondition } from '../../src/types/weather';

const mockCondition: WeatherCondition = {
  cityName: 'London',
  country: 'GB',
  temp: 15.2,
  feelsLike: 13.4,
  humidity: 72,
  windSpeed: 4.1,
  description: 'few clouds',
  icon: '02d',
  dt: 1711187200,
};

// Stub useFavorites
vi.mock('../../src/hooks/useFavorites', () => ({
  useFavorites: vi.fn(() => ({
    favorites: [],
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    isFavorite: vi.fn(() => false),
  })),
}));

describe('WeatherCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderCard = (overrides?: Partial<WeatherCondition>) =>
    render(
      <MemoryRouter>
        <WeatherCard data={{ ...mockCondition, ...overrides }} />
      </MemoryRouter>,
    );

  it('renders city name and country', () => {
    renderCard();
    expect(screen.getByText('London, GB')).toBeInTheDocument();
  });

  it('renders the temperature (rounded)', () => {
    renderCard();
    expect(screen.getByText('15°C')).toBeInTheDocument();
  });

  it('renders the weather description', () => {
    renderCard();
    expect(screen.getByText('few clouds')).toBeInTheDocument();
  });

  it('renders humidity', () => {
    renderCard();
    expect(screen.getByText('72%')).toBeInTheDocument();
  });

  it('renders wind speed', () => {
    renderCard();
    expect(screen.getByText('4.1 m/s')).toBeInTheDocument();
  });

  it('renders the weather icon with correct src', () => {
    renderCard();
    const img = screen.getByAltText('few clouds') as HTMLImageElement;
    expect(img.src).toContain('02d@2x.png');
  });

  it('clicking the star button calls addFavorite when not favorited', async () => {
    const { useFavorites } = await import('../../src/hooks/useFavorites');
    const addFavorite = vi.fn();
    vi.mocked(useFavorites).mockReturnValue({
      favorites: [],
      addFavorite,
      removeFavorite: vi.fn(),
      isFavorite: () => false,
    });
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /add to favorites/i }));
    expect(addFavorite).toHaveBeenCalledWith('London');
  });

  it('shows filled star and calls removeFavorite when already favorited', async () => {
    const { useFavorites } = await import('../../src/hooks/useFavorites');
    const removeFavorite = vi.fn();
    vi.mocked(useFavorites).mockReturnValue({
      favorites: ['London'],
      addFavorite: vi.fn(),
      removeFavorite,
      isFavorite: () => true,
    });
    renderCard();
    const btn = screen.getByRole('button', { name: /remove from favorites/i });
    expect(btn).toHaveTextContent('★');
    fireEvent.click(btn);
    expect(removeFavorite).toHaveBeenCalledWith('London');
  });
});
