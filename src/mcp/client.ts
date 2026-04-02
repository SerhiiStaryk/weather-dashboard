import { fetchCurrentWeather, fetchForecast } from '@/api/fetchWeather';
import { WeatherApiError } from '@/api/errors';
import { mcpWeatherServer } from '@/mcp/server';
import type { CurrentWeatherRaw, ForecastRaw } from '@/types/weather';

interface WeatherRawPayload {
  current: CurrentWeatherRaw;
  forecast: ForecastRaw;
}

export interface McpWeatherFetchSuccess {
  ok: true;
  source: 'cache' | 'network' | 'fallback-cache';
  payload: WeatherRawPayload;
}

export interface McpWeatherFetchFailure {
  ok: false;
  source: 'none';
  error: Error;
}

export type McpWeatherFetchResult =
  | McpWeatherFetchSuccess
  | McpWeatherFetchFailure;

interface FetchMcpWeatherOptions {
  now?: number;
  verify?: (context: unknown) => boolean;
}

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new WeatherApiError('Unexpected weather fetch failure');
}

export async function fetchMcpWeather(
  city: string,
  options: FetchMcpWeatherOptions = {},
): Promise<McpWeatherFetchResult> {
  const store = mcpWeatherServer.getStore();
  const now = options.now ?? Date.now();

  const freshCache = store.readCache(city, now, false);
  if (freshCache) {
    return {
      ok: true,
      source: 'cache',
      payload: {
        current: freshCache.current,
        forecast: freshCache.forecast,
      },
    };
  }

  try {
    const [current, forecast] = await Promise.all([
      fetchCurrentWeather(city),
      fetchForecast(city),
    ]);

    store.stageCache(city, { current, forecast }, now);
    const verified = store.verify(options.verify);
    if (!verified) {
      store.rollback();
    } else {
      mcpWeatherServer.persistConfirmedContext();
    }

    return {
      ok: true,
      source: 'network',
      payload: { current, forecast },
    };
  } catch (error: unknown) {
    const cachedFallback = store.readCache(city, now, true);
    if (cachedFallback) {
      return {
        ok: true,
        source: 'fallback-cache',
        payload: {
          current: cachedFallback.current,
          forecast: cachedFallback.forecast,
        },
      };
    }

    return {
      ok: false,
      source: 'none',
      error: toError(error),
    };
  }
}
