import type { ForecastRaw } from '@/types/weather';

// 3 days × 8 slots/day of 3-hour intervals, starting 2024-03-23
const makeItem = (
  date: string,
  hour: string,
  temp: number,
  temp_min: number,
  temp_max: number,
  icon: string,
  description: string,
) => ({
  dt: new Date(`${date}T${hour}:00Z`).getTime() / 1000,
  dt_txt: `${date} ${hour}:00`,
  weather: [{ id: 801, main: 'Clouds', description, icon }],
  main: {
    temp,
    feels_like: temp - 1,
    temp_min,
    temp_max,
    pressure: 1012,
    humidity: 68,
  },
  wind: { speed: 3.5, deg: 215 },
});

export const londonForecast: ForecastRaw = {
  city: { name: 'London', country: 'GB' },
  list: [
    // Day 1 — 2024-03-23
    makeItem(
      '2024-03-23',
      '09:00',
      13.0,
      12.0,
      15.0,
      '03d',
      'scattered clouds',
    ),
    makeItem('2024-03-23', '12:00', 15.2, 12.0, 16.5, '02d', 'few clouds'),
    makeItem('2024-03-23', '15:00', 16.5, 12.0, 16.5, '01d', 'clear sky'),
    makeItem('2024-03-23', '18:00', 14.0, 12.0, 16.5, '02n', 'few clouds'),
    makeItem(
      '2024-03-23',
      '21:00',
      12.5,
      12.0,
      16.5,
      '03n',
      'scattered clouds',
    ),
    // Day 2 — 2024-03-24
    makeItem('2024-03-24', '00:00', 11.0, 10.0, 14.5, '04n', 'overcast clouds'),
    makeItem('2024-03-24', '03:00', 10.5, 10.0, 14.5, '04n', 'overcast clouds'),
    makeItem('2024-03-24', '06:00', 10.8, 10.0, 14.5, '10d', 'light rain'),
    makeItem('2024-03-24', '09:00', 11.5, 10.0, 14.5, '10d', 'light rain'),
    makeItem('2024-03-24', '12:00', 13.0, 10.0, 14.5, '09d', 'moderate rain'),
    makeItem('2024-03-24', '15:00', 14.5, 10.0, 14.5, '10d', 'light rain'),
    makeItem('2024-03-24', '18:00', 12.0, 10.0, 14.5, '10n', 'light rain'),
    makeItem('2024-03-24', '21:00', 10.5, 10.0, 14.5, '04n', 'overcast clouds'),
    // Day 3 — 2024-03-25
    makeItem('2024-03-25', '00:00', 9.8, 9.0, 13.5, '04n', 'overcast clouds'),
    makeItem('2024-03-25', '03:00', 9.5, 9.0, 13.5, '04n', 'overcast clouds'),
    makeItem('2024-03-25', '06:00', 10.0, 9.0, 13.5, '03d', 'scattered clouds'),
    makeItem('2024-03-25', '09:00', 11.8, 9.0, 13.5, '02d', 'few clouds'),
    makeItem('2024-03-25', '12:00', 13.5, 9.0, 13.5, '01d', 'clear sky'),
    makeItem('2024-03-25', '15:00', 13.0, 9.0, 13.5, '01d', 'clear sky'),
    makeItem('2024-03-25', '18:00', 11.0, 9.0, 13.5, '02n', 'few clouds'),
    makeItem('2024-03-25', '21:00', 10.0, 9.0, 13.5, '04n', 'overcast clouds'),
  ],
};
