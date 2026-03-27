import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../src/mocks/server';
import { fetchCurrentWeather, fetchForecast } from '../src/api/fetchWeather';
import { CityNotFoundError, ApiKeyError, ServerError } from '../src/api/errors';

// ─── fetchCurrentWeather ──────────────────────────────────────────────────────

describe('fetchCurrentWeather', () => {
  it('resolves CurrentWeatherRaw for London (happy path)', async () => {
    const data = await fetchCurrentWeather('London');
    expect(data.name).toBe('London');
    expect(data.sys.country).toBe('GB');
    expect(typeof data.main.temp).toBe('number');
  });

  it('throws CityNotFoundError for unknown city (404)', async () => {
    await expect(fetchCurrentWeather('UNKNOWN')).rejects.toBeInstanceOf(
      CityNotFoundError,
    );
  });

  it('throws ServerError for city=ERROR (500)', async () => {
    await expect(fetchCurrentWeather('ERROR')).rejects.toBeInstanceOf(
      ServerError,
    );
  });

  it('throws ApiKeyError when server returns 401', async () => {
    server.use(
      http.get('*/data/2.5/weather', () =>
        HttpResponse.json(
          { cod: 401, message: 'Invalid API key.' },
          { status: 401 },
        ),
      ),
    );
    await expect(fetchCurrentWeather('London')).rejects.toBeInstanceOf(
      ApiKeyError,
    );
  });

  it('error message includes city name for CityNotFoundError', async () => {
    await expect(fetchCurrentWeather('UNKNOWN')).rejects.toThrow('UNKNOWN');
  });
});

// ─── fetchForecast ────────────────────────────────────────────────────────────

describe('fetchForecast', () => {
  it('resolves ForecastRaw for London (happy path)', async () => {
    const data = await fetchForecast('London');
    expect(data.city.name).toBe('London');
    expect(Array.isArray(data.list)).toBe(true);
    expect(data.list.length).toBeGreaterThan(0);
  });

  it('throws CityNotFoundError for unknown city (404)', async () => {
    await expect(fetchForecast('UNKNOWN')).rejects.toBeInstanceOf(
      CityNotFoundError,
    );
  });

  it('throws ServerError for city=ERROR (500)', async () => {
    await expect(fetchForecast('ERROR')).rejects.toBeInstanceOf(ServerError);
  });

  it('throws ApiKeyError when server returns 401', async () => {
    server.use(
      http.get('*/data/2.5/forecast', () =>
        HttpResponse.json(
          { cod: 401, message: 'Invalid API key.' },
          { status: 401 },
        ),
      ),
    );
    await expect(fetchForecast('London')).rejects.toBeInstanceOf(ApiKeyError);
  });
});
