---
applyTo: 'src/api/**'
---

# API Layer Rules

Every value from an external API response **must** go through the parser before reaching the UI.

## Error hierarchy (`src/api/errors.ts`)

```
WeatherApiError (base)
  ├── CityNotFoundError  — HTTP 404
  ├── ApiKeyError        — HTTP 401
  ├── ServerError        — HTTP 5xx
  └── ParseError         — missing or wrong-typed field
```

- Always throw a typed subclass — never `throw new Error(...)` or `throw 'string'`
- Declare class fields explicitly (no constructor parameter properties):
  ```ts
  class WeatherApiError extends Error {
    readonly statusCode?: number;
    constructor(message: string, statusCode?: number) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  ```

## HTTP layer (`src/api/fetchWeather.ts`)

- Read base URL and API key from `import.meta.env.VITE_*` — never hardcode
- One `handleResponse` helper maps status codes to typed errors:
  - `401` → `ApiKeyError`
  - `404` → `CityNotFoundError(city)`
  - `5xx` → `ServerError(status)`
- No parsing logic in this file — HTTP only

## Parser layer (`src/api/weatherParser.ts`)

- Accept `unknown` — never assume the shape
- Validate every required field; throw `ParseError('field.path')` for anything missing or wrong-typed
- Return normalized types from `src/types/weather.ts`
- Pure functions — no `fetch`, no side effects

## Environment variables

| Variable                   | Purpose                                         |
| -------------------------- | ----------------------------------------------- |
| `VITE_OPENWEATHER_API_KEY` | OpenWeatherMap API key                          |
| `VITE_API_BASE_URL`        | API base URL (`https://api.openweathermap.org`) |

- Access via `import.meta.env.VITE_*`
- Never log or expose the API key in errors or UI
