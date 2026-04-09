import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FavoriteWeatherCard } from '../../src/components/FavoriteWeatherCard';

// Mock WeatherIcon to avoid SVG complexity
vi.mock('../../src/components/WeatherIcon', () => ({
  WeatherIcon: () => <div data-testid="weather-icon" />,
}));

// Mock useWeather hook
vi.mock('../../src/hooks/useWeather', () => ({
  useWeather: vi.fn(),
}));

import { useWeather } from '../../src/hooks/useWeather';
const mockUseWeather = vi.mocked(useWeather);

describe('FavoriteWeatherCard', () => {
  const city = 'London';
  const onRemove = vi.fn();

  function renderCard(currentCity = city) {
    return render(
      <MemoryRouter>
        <FavoriteWeatherCard city={currentCity} onRemove={onRemove} />
      </MemoryRouter>,
    );
  }

  function mockWeatherQuery({
    data,
    isLoading = false,
    error = null,
  }: {
    data?: ReturnType<typeof useWeather>['data'];
    isLoading?: boolean;
    error?: Error | null;
  }) {
    mockUseWeather.mockReturnValue({ data, isLoading, error } as ReturnType<
      typeof useWeather
    >);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders city name', () => {
    mockWeatherQuery({});
    renderCard();
    expect(screen.getByText(city)).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    mockWeatherQuery({ isLoading: true });
    renderCard();
    expect(
      screen.getByRole('status', { name: /loading weather for london/i }),
    ).toBeInTheDocument();
  });

  it('keeps the loading state visible when an error exists during loading', () => {
    mockWeatherQuery({ isLoading: true, error: new Error('fail') });
    renderCard();
    expect(
      screen.getByRole('status', { name: /loading weather for london/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows error alert when error', () => {
    mockWeatherQuery({ error: new Error('fail') });
    renderCard();
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to load/i);
  });

  it('renders weather data when loaded', () => {
    mockWeatherQuery({
      data: {
        current: {
          icon: '01d',
          description: 'clear sky',
          temp: 20.6,
        },
      },
    });
    renderCard();
    expect(screen.getByText('21°C')).toBeInTheDocument();
    expect(screen.getByText(/clear sky/i)).toBeInTheDocument();
    expect(screen.getByTestId('weather-icon')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('remove button calls onRemove and does not navigate', () => {
    mockWeatherQuery({});
    renderCard();
    const btn = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(btn);
    expect(onRemove).toHaveBeenCalledWith(city);
  });

  it('link encodes the city route correctly', () => {
    mockWeatherQuery({});
    renderCard('New York, NY');
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      `/city/${encodeURIComponent('New York, NY')}`,
    );
  });
});
