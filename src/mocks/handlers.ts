import { http, HttpResponse } from 'msw';
import { londonCurrentWeather } from './fixtures/currentWeather';
import { londonForecast } from './fixtures/forecast';

export const handlers = [
  // ─── Current weather ──────────────────────────────────────────────────────
  http.get('*/data/2.5/weather', ({ request }) => {
    const url = new URL(request.url);
    const city = (url.searchParams.get('q') ?? '').toLowerCase();

    if (city === 'unknown') {
      return HttpResponse.json(
        { cod: '404', message: 'city not found' },
        { status: 404 },
      );
    }

    if (city === 'error') {
      return HttpResponse.json(
        { cod: '500', message: 'internal server error' },
        { status: 500 },
      );
    }

    if (city === 'badkey') {
      return HttpResponse.json(
        { cod: 401, message: 'Invalid API key.' },
        { status: 401 },
      );
    }

    return HttpResponse.json(londonCurrentWeather);
  }),

  // ─── Forecast ─────────────────────────────────────────────────────────────
  http.get('*/data/2.5/forecast', ({ request }) => {
    const url = new URL(request.url);
    const city = (url.searchParams.get('q') ?? '').toLowerCase();

    if (city === 'unknown') {
      return HttpResponse.json(
        { cod: '404', message: 'city not found' },
        { status: 404 },
      );
    }

    if (city === 'error') {
      return HttpResponse.json(
        { cod: '500', message: 'internal server error' },
        { status: 500 },
      );
    }

    if (city === 'badkey') {
      return HttpResponse.json(
        { cod: 401, message: 'Invalid API key.' },
        { status: 401 },
      );
    }

    return HttpResponse.json(londonForecast);
  }),
];
