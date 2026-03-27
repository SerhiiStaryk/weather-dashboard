---
applyTo: 'src/mocks/**'
---

# MSW Mock Conventions

## Handler routing (`src/mocks/handlers.ts`)

- Route patterns: `'*/data/2.5/weather'` and `'*/data/2.5/forecast'`
- Read `q` param with `.toLowerCase()` for case-insensitive matching
- City routing table:

| `q` value                           | Response                                               |
| ----------------------------------- | ------------------------------------------------------ |
| `london` (or any unrecognised city) | 200 + fixture                                          |
| `unknown`                           | 404 `{ cod: '404', message: 'city not found' }`        |
| `error`                             | 500 `{ cod: '500', message: 'internal server error' }` |
| `badkey`                            | 401 `{ cod: 401, message: 'Invalid API key.' }`        |

## Node server (`src/mocks/server.ts`)

- `setupServer(...handlers)` — used exclusively in Vitest
- Never imported from app code

## Browser worker (`src/mocks/browser.ts`)

- `setupWorker(...handlers)` — started in `main.tsx` only when `VITE_OPENWEATHER_API_KEY === 'your_api_key_here'`
- Pass `{ onUnhandledRequest: 'bypass' }` so real requests are not blocked

## Fixtures (`src/mocks/fixtures/`)

- `currentWeather.ts` — realistic `CurrentWeatherRaw` for London
- `forecast.ts` — `ForecastRaw` with ≥ 3 days of 3-hour intervals (8 slots/day minimum)
- Fixtures must include a 12:00:00 slot per day so the parser picks the correct midday reading
- Typed against the raw shapes in `src/types/weather.ts` — no `any`
