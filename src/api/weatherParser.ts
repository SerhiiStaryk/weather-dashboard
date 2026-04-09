import type {
  CurrentWeatherRaw,
  ForecastRaw,
  ForecastItemRaw,
  WeatherCondition,
  ForecastDay,
} from '@/types/weather';
import { ParseError } from '@/api/errors';

// ─── Guards / assertion helpers ───────────────────────────────────────────────

function assertField<T>(value: T | undefined | null, field: string): T {
  if (value === undefined || value === null) {
    throw new ParseError(field);
  }
  return value;
}

function assertNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ParseError(field);
  }
  return value;
}

function assertString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ParseError(field);
  }
  return value;
}

// ─── Current weather ──────────────────────────────────────────────────────────

export function parseCurrentWeather(raw: unknown): WeatherCondition {
  if (raw === null || typeof raw !== 'object') {
    throw new ParseError('response body');
  }

  const data = raw as CurrentWeatherRaw;

  const name = assertString(data.name, 'name');
  const country = assertString(data.sys?.country, 'sys.country');
  const temp = assertNumber(data.main?.temp, 'main.temp');
  const feelsLike = assertNumber(data.main?.feels_like, 'main.feels_like');
  const humidity = assertNumber(data.main?.humidity, 'main.humidity');
  const windSpeed = assertNumber(data.wind?.speed, 'wind.speed');
  const dt = assertNumber(data.dt, 'dt');

  const weatherArr = assertField(data.weather, 'weather');
  if (!Array.isArray(weatherArr) || weatherArr.length === 0) {
    throw new ParseError('weather[0]');
  }

  const condition = weatherArr[0];
  const description = assertString(
    condition.description,
    'weather[0].description',
  );
  const icon = assertString(condition.icon, 'weather[0].icon');

  return {
    cityName: name,
    country,
    temp,
    feelsLike,
    humidity,
    windSpeed,
    description,
    icon,
    dt,
  };
}

// ─── Forecast ─────────────────────────────────────────────────────────────────

export function parseForecastItems(raw: unknown): ForecastDay[] {
  if (raw === null || typeof raw !== 'object') {
    throw new ParseError('response body');
  }

  const data = raw as ForecastRaw;

  if (!data.list || !Array.isArray(data.list)) {
    throw new ParseError('list');
  }

  if (data.list.length === 0) {
    return [];
  }

  // Group 3-hour intervals by date (YYYY-MM-DD)
  const byDate = new Map<string, ForecastItemRaw[]>();
  for (const item of data.list) {
    if (typeof item.dt_txt !== 'string') continue;
    const date = item.dt_txt.slice(0, 10);
    const existing = byDate.get(date) ?? [];
    existing.push(item);
    byDate.set(date, existing);
  }

  const days: ForecastDay[] = [];
  for (const [date, items] of byDate) {
    if (days.length >= 3) break;

    // Prefer the 12:00 reading for a representative midday snapshot; fall back to last item
    const midday = items.find((i) => i.dt_txt.includes('12:00:00'));
    const representative = midday ?? items[items.length - 1];

    const tempMin = Math.min(...items.map((i) => i.main?.temp_min ?? Infinity));
    const tempMax = Math.max(
      ...items.map((i) => i.main?.temp_max ?? -Infinity),
    );

    const weatherArr = representative.weather;
    if (!Array.isArray(weatherArr) || weatherArr.length === 0) continue;

    days.push({
      date,
      tempMin: isFinite(tempMin) ? tempMin : representative.main.temp,
      tempMax: isFinite(tempMax) ? tempMax : representative.main.temp,
      description: weatherArr[0].description ?? '',
      icon: weatherArr[0].icon ?? '',
    });
  }

  return days;
}
