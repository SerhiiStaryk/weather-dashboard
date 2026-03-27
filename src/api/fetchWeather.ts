import type { CurrentWeatherRaw, ForecastRaw } from '@/types/weather';
import {
  ApiKeyError,
  CityNotFoundError,
  ServerError,
  WeatherApiError,
} from '@/api/errors';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://api.openweathermap.org';
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY ?? '';

async function handleResponse<T>(res: Response, city: string): Promise<T> {
  if (res.ok) {
    return res.json() as Promise<T>;
  }

  switch (res.status) {
    case 401:
      throw new ApiKeyError();
    case 404:
      throw new CityNotFoundError(city);
    default:
      if (res.status >= 500) {
        throw new ServerError(res.status);
      }
      throw new WeatherApiError(
        `Unexpected response: ${res.status}`,
        res.status,
      );
  }
}

export async function fetchCurrentWeather(
  city: string,
): Promise<CurrentWeatherRaw> {
  const url = `${BASE_URL}/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url);
  return handleResponse<CurrentWeatherRaw>(res, city);
}

export async function fetchForecast(city: string): Promise<ForecastRaw> {
  const url = `${BASE_URL}/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url);
  return handleResponse<ForecastRaw>(res, city);
}
