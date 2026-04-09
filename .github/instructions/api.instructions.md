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

### API Key Masking

Always mask API keys in logs, error messages, and debugging output:

```ts
function maskApiKey(key: string): string {
  if (key.length < 8) return '***';
  return `${key.slice(0, 4)}${'*'.repeat(key.length - 8)}${key.slice(-4)}`;
}

// Usage in error logging:
console.error('API request failed', {
  url: url.replace(/appid=[^&]+/, `appid=${maskApiKey(apiKey)}`),
});
```

## Validation Helpers

Use helper functions to validate and extract fields from `unknown` API responses:

```ts
// Type guards
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

// Field extractors
function getString(obj: unknown, path: string): string {
  if (!isObject(obj)) {
    throw new ParseError(`Expected object at root, got ${typeof obj}`);
  }

  const value = obj[path];
  if (!isString(value)) {
    throw new ParseError(`${path}: expected string, got ${typeof value}`);
  }

  return value;
}

function getNumber(obj: unknown, path: string): number {
  if (!isObject(obj)) {
    throw new ParseError(`Expected object at root, got ${typeof obj}`);
  }

  const value = obj[path];
  if (!isNumber(value)) {
    throw new ParseError(`${path}: expected number, got ${typeof value}`);
  }

  return value;
}

function getOptionalString(obj: unknown, path: string): string | undefined {
  if (!isObject(obj)) return undefined;
  const value = obj[path];
  return isString(value) ? value : undefined;
}
```

## Extra Fields Policy

**Ignore unknown fields** — do not validate or throw errors for extra properties in API responses.

- Extract only the fields defined in `src/types/weather.ts`
- Additional fields from the API should be silently ignored
- This provides forward compatibility when the API adds new fields

```ts
// ✅ Correct: Extract only known fields
export function parseWeather(data: unknown): Weather {
  const name = getString(data, 'name');
  const temp = getNumber(getObject(data, 'main'), 'temp');
  // ... extract only what we need
  // Ignore any extra fields like 'sys.sunrise', 'timezone', etc.
  return { name, temp, ... };
}

// ❌ Wrong: Don't validate that ONLY expected fields exist
```

## Complete handleResponse Example

```ts
async function handleResponse(
  response: Response,
  city: string,
): Promise<unknown> {
  // Handle error status codes
  if (!response.ok) {
    switch (response.status) {
      case 401:
      case 403:
        throw new ApiKeyError('Invalid API key');

      case 404:
        throw new CityNotFoundError(city);

      case 429:
        throw new ServerError('Rate limit exceeded', 429);

      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(
          `Server error (${response.status})`,
          response.status,
        );

      default:
        throw new WeatherApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
        );
    }
  }

  // Parse JSON response
  let data: unknown;
  try {
    data = await response.json();
  } catch (err) {
    throw new ParseError('Invalid JSON response');
  }

  return data;
}
```

## Retry & Circuit Breaker

### Simple Retry Logic

Implement exponential backoff for transient failures (5xx, network errors):

```ts
async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetcher();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry client errors (4xx)
      if (err instanceof ApiKeyError || err instanceof CityNotFoundError) {
        throw err;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Usage:
export async function fetchWeather(city: string): Promise<Weather> {
  return fetchWithRetry(async () => {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    // ... rest of fetch logic
  });
}
```

### Circuit Breaker Pattern

For production apps, implement a circuit breaker to prevent cascading failures:

```ts
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private readonly threshold = 5,
    private readonly timeout = 60000, // 60s
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - (this.lastFailureTime ?? 0) > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new ServerError('Circuit breaker is open', 503);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = 'open';
    }
  }
}

// Singleton instance
const weatherApiBreaker = new CircuitBreaker();

// Usage:
export async function fetchWeather(city: string): Promise<Weather> {
  return weatherApiBreaker.execute(() =>
    fetchWithRetry(async () => {
      // ... fetch logic
    }),
  );
}
```

## Error Handling Best Practices

1. **Specific errors first**: Check for specific errors (401, 404) before generic ones (5xx)
2. **Network errors**: Wrap `fetch()` in try-catch to handle network failures
3. **Timeout**: Consider adding `AbortController` with timeout
4. **User-friendly messages**: Map technical errors to user-friendly text in UI layer

```ts
// Good: Network error handling
try {
  const response = await fetch(url);
  return handleResponse(response, city);
} catch (err) {
  if (err instanceof TypeError && err.message.includes('fetch')) {
    throw new ServerError('Network error - check your connection', 0);
  }
  throw err;
}
```

## Testing Guidelines

- **Mock fetch**: Use MSW for integration tests (already configured)
- **Parser tests**: Test with malformed data, missing fields, wrong types
- **Error tests**: Verify correct error types are thrown for each status code
- **Retry tests**: Mock transient failures to verify retry logic
- **Never**: Mock `import.meta.env` — use `.env.test` file instead
