import { useQuery } from '@tanstack/react-query';
import { fetchCurrentWeather, fetchForecast } from '@/api/fetchWeather';
import { parseCurrentWeather, parseForecastItems } from '@/api/weatherParser';
import type { WeatherData } from '@/types/weather';

async function fetchWeatherData(city: string): Promise<WeatherData> {
  const [currentRaw, forecastRaw] = await Promise.all([
    fetchCurrentWeather(city),
    fetchForecast(city),
  ]);

  return {
    current: parseCurrentWeather(currentRaw),
    forecast: parseForecastItems(forecastRaw),
  };
}

export function useWeather(city: string | undefined) {
  return useQuery<WeatherData, Error>({
    queryKey: ['weather', city],
    queryFn: () => fetchWeatherData(city!),
    enabled: Boolean(city),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
