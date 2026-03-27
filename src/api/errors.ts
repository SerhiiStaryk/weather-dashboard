export class WeatherApiError extends Error {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'WeatherApiError';
    this.statusCode = statusCode;
  }
}

/** HTTP 404 — city not found */
export class CityNotFoundError extends WeatherApiError {
  constructor(city: string) {
    super(`City "${city}" not found.`, 404);
    this.name = 'CityNotFoundError';
  }
}

/** HTTP 401 — bad or missing API key */
export class ApiKeyError extends WeatherApiError {
  constructor() {
    super(
      'Invalid or missing API key. Check your VITE_OPENWEATHER_API_KEY.',
      401,
    );
    this.name = 'ApiKeyError';
  }
}

/** HTTP 5xx — server-side failure */
export class ServerError extends WeatherApiError {
  constructor(statusCode = 500) {
    super(
      'Weather service is currently unavailable. Please try again later.',
      statusCode,
    );
    this.name = 'ServerError';
  }
}

/** Unexpected response shape — parser could not extract required fields */
export class ParseError extends WeatherApiError {
  constructor(field: string) {
    super(`Failed to parse weather data: missing or invalid field "${field}".`);
    this.name = 'ParseError';
  }
}
