import { describe, it, expect } from 'vitest';
import {
  parseCurrentWeather,
  parseForecastItems,
} from '../src/api/weatherParser';
import { ParseError } from '../src/api/errors';
import { londonCurrentWeather } from '../src/mocks/fixtures/currentWeather';
import { londonForecast } from '../src/mocks/fixtures/forecast';

// ─── parseCurrentWeather ──────────────────────────────────────────────────────

describe('parseCurrentWeather', () => {
  it('returns normalized WeatherCondition from a valid London fixture', () => {
    const result = parseCurrentWeather(londonCurrentWeather);

    expect(result.cityName).toBe('London');
    expect(result.country).toBe('GB');
    expect(result.temp).toBe(15.2);
    expect(result.feelsLike).toBe(14.6);
    expect(result.humidity).toBe(72);
    expect(result.windSpeed).toBe(4.1);
    expect(result.description).toBe('few clouds');
    expect(result.icon).toBe('02d');
    expect(result.dt).toBe(1711187200);
  });

  it('throws ParseError when main.temp is missing', () => {
    const broken = {
      ...londonCurrentWeather,
      main: { ...londonCurrentWeather.main, temp: undefined },
    };
    expect(() => parseCurrentWeather(broken)).toThrow(ParseError);
    expect(() => parseCurrentWeather(broken)).toThrow('main.temp');
  });

  it('throws ParseError when weather array is empty', () => {
    const broken = { ...londonCurrentWeather, weather: [] };
    expect(() => parseCurrentWeather(broken)).toThrow(ParseError);
  });

  it('throws ParseError when city name is missing', () => {
    const broken = { ...londonCurrentWeather, name: undefined };
    expect(() => parseCurrentWeather(broken)).toThrow(ParseError);
  });

  it('throws ParseError for null input', () => {
    expect(() => parseCurrentWeather(null)).toThrow(ParseError);
  });

  it('throws ParseError for non-object input', () => {
    expect(() => parseCurrentWeather('bad string')).toThrow(ParseError);
  });
});

// ─── parseForecastItems ───────────────────────────────────────────────────────

describe('parseForecastItems', () => {
  it('returns 3 ForecastDay items from the London fixture', () => {
    const result = parseForecastItems(londonForecast);
    expect(result).toHaveLength(3);
  });

  it('each day has correct date format (YYYY-MM-DD)', () => {
    const result = parseForecastItems(londonForecast);
    for (const day of result) {
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('picks midday (12:00) reading for description and icon', () => {
    const result = parseForecastItems(londonForecast);
    // Day 1 midday is 'few clouds', icon '02d'
    expect(result[0].description).toBe('few clouds');
    expect(result[0].icon).toBe('02d');
  });

  it('tempMin is the minimum across all slots for that day', () => {
    const result = parseForecastItems(londonForecast);
    // Day 1 min is 12.0
    expect(result[0].tempMin).toBe(12.0);
  });

  it('tempMax is the maximum across all slots for that day', () => {
    const result = parseForecastItems(londonForecast);
    // Day 1 max is 16.5
    expect(result[0].tempMax).toBe(16.5);
  });

  it('returns empty array when list is empty', () => {
    const empty = { ...londonForecast, list: [] };
    expect(parseForecastItems(empty)).toEqual([]);
  });

  it('throws ParseError when list field is missing', () => {
    const broken = { ...londonForecast, list: undefined };
    expect(() => parseForecastItems(broken)).toThrow(ParseError);
  });

  it('throws ParseError for null input', () => {
    expect(() => parseForecastItems(null)).toThrow(ParseError);
  });
});
