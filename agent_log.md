# Agent Log — Weather Dashboard

## Project Overview

**Goal**: MVP weather dashboard — city search, current conditions, 3-day forecast, favorites list, offline-capable test suite.  
**Date**: 2026-03-23

---

## Key Architectural Decisions

### 1. MSW strategy: real API in dev, mocks only in tests

- Real API calls in dev allow testing the full integration path during development.
- MSW Node server (`src/mocks/server.ts`) intercepts all `fetch` calls in Vitest — no network traffic, deterministic results, CI-safe.
- MSW browser worker (`src/mocks/browser.ts`) auto-starts in dev when the API key is the placeholder value, letting the app be demoed without needing a real key.

### 2. Typed error hierarchy

`WeatherApiError` → `CityNotFoundError (404)` | `ApiKeyError (401)` | `ServerError (5xx)` | `ParseError`

This allows the `ErrorMessage` component to pattern-match on error type and display specific copy rather than generic "error" messages. ParseErrors also surface data-shape regressions early.

### 3. Parser as a pure function module

`src/api/weatherParser.ts` contains no HTTP calls, only data transformation. This makes it trivially unit-testable without any mocking infrastructure. All 12 unit tests in `weatherParser.test.ts` run in < 5ms with no async overhead.

### 4. TanStack Query for server state

Eliminates manual loading/error state, provides automatic stale-while-revalidate, deduplication, and cache keyed on `['weather', cityName]`. `staleTime: 5min` prevents re-fetching on quick tab switches. `retry: 1` avoids hammering a down server but gives one retry for transient failures.

### 5. Forecast endpoint choice: free `/data/2.5/forecast`

The free tier returns 3h intervals up to 5 days. The parser groups by `dt_txt.slice(0,10)` (date string), picks the 12:00 slot as the most representative reading, and accumulates min/max across all slots for that day. Only the first 3 dates are returned for the 3-day view.

### 6. React Router v7 — two routes only

`/` → `HomePage` (search + favorites), `/city/:name` → `CityPage` (data). All unknown paths redirect to `/`. The city name travels as a URL param, which makes the detail view deep-linkable and refreshable.

### 7. No global state manager

TanStack Query owns all server state. `useFavorites` is the only client-side persistent state, implemented as a lightweight hook that syncs a `string[]` to `localStorage`. No Redux, no Zustand, no Context needed for this scope.

---

## File Map (key files)

| File                        | Responsibility                                         |
| --------------------------- | ------------------------------------------------------ |
| `src/types/weather.ts`      | All TypeScript interfaces (raw API + normalized)       |
| `src/api/errors.ts`         | Error class hierarchy                                  |
| `src/api/weatherParser.ts`  | `parseCurrentWeather`, `parseForecastItems`            |
| `src/api/fetchWeather.ts`   | `fetchCurrentWeather`, `fetchForecast`                 |
| `src/mocks/handlers.ts`     | MSW handlers: London fixture, 404/500/401 paths        |
| `src/mocks/fixtures/`       | Static London current + forecast payloads              |
| `src/hooks/useWeather.ts`   | TanStack Query integration                             |
| `src/hooks/useFavorites.ts` | localStorage persistence                               |
| `src/pages/CityPage.tsx`    | Data orchestration with loading/error/success branches |
| `tests/setup.ts`            | Global test wiring (MSW server, jest-dom)              |

---

## Test Coverage Summary

| Suite              | File                    | Cases  |
| ------------------ | ----------------------- | ------ |
| Unit — parser      | `weatherParser.test.ts` | 12     |
| Integration — HTTP | `fetchWeather.test.ts`  | 9      |
| Component          | `WeatherCard.test.tsx`  | 8      |
| Component          | `CitySearch.test.tsx`   | 6      |
| **Total**          |                         | **35** |

---

## Failure Handling Coverage

| Failure type       | How triggered                        | UI response                                      |
| ------------------ | ------------------------------------ | ------------------------------------------------ |
| City not found     | HTTP 404 from API / MSW city=UNKNOWN | "City not found" heading                         |
| Invalid API key    | HTTP 401 / MSW city=badkey           | "Invalid API key" heading                        |
| Server error       | HTTP 5xx / MSW city=ERROR            | "Service unavailable" heading                    |
| Malformed response | Missing field in JSON                | "Unexpected response" heading                    |
| Empty input        | Submit with blank input              | Inline validation error                          |
| Network error      | fetch throws                         | TanStack Query retries once, then surfaces error |

---

## Tradeoffs / Excluded Scope

- No geolocation (would require user permission UX)
- No °C/°F toggle (trivial to add, would slightly complicate state)
- No hourly detail view (out of scope for MVP)
- No authentication or accounts (favorites are local-only)
- Tailwind utility classes used directly in JSX (no component library) — avoids shadcn/ui peer dependency conflicts with Tailwind v4
