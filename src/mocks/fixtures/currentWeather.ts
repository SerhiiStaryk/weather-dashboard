import type { CurrentWeatherRaw } from '@/types/weather';

export const londonCurrentWeather: CurrentWeatherRaw = {
  id: 2643743,
  name: 'London',
  sys: { country: 'GB' },
  weather: [
    { id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' },
  ],
  main: {
    temp: 15.2,
    feels_like: 14.6,
    temp_min: 13.0,
    temp_max: 16.8,
    pressure: 1013,
    humidity: 72,
  },
  wind: { speed: 4.1, deg: 230 },
  visibility: 10000,
  dt: 1711187200, // 2024-03-23 12:00:00 UTC
};
