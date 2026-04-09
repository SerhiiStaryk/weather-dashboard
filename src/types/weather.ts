// ─── Raw API shapes (OpenWeatherMap response) ─────────────────────────────────

export interface RawWeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface RawMain {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

export interface RawWind {
  speed: number;
  deg: number;
}

export interface CurrentWeatherRaw {
  id: number;
  name: string;
  sys: { country: string };
  weather: RawWeatherCondition[];
  main: RawMain;
  wind: RawWind;
  visibility?: number;
  dt: number;
}

export interface ForecastItemRaw {
  dt: number;
  dt_txt: string;
  weather: RawWeatherCondition[];
  main: RawMain;
  wind: RawWind;
}

export interface ForecastRaw {
  city: { name: string; country: string };
  list: ForecastItemRaw[];
}

// ─── Normalized / UI shapes ────────────────────────────────────────────────────

export interface WeatherCondition {
  cityName: string;
  country: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  /** Unix timestamp (seconds) */
  dt: number;
}

export interface ForecastDay {
  /** Date string in YYYY-MM-DD format */
  date: string;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
}

export interface WeatherData {
  current: WeatherCondition;
  forecast: ForecastDay[];
}
