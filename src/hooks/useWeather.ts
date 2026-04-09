import { useQuery } from '@tanstack/react-query';
import { parseCurrentWeather, parseForecastItems } from '@/api/weatherParser';
import { fetchMcpWeather } from '@/mcp/client';
import type { WeatherData } from '@/types/weather';

async function fetchWeatherData(city: string): Promise<WeatherData> {
  const result = await fetchMcpWeather(city);
  if (!result.ok) {
    throw result.error;
  }

  return {
    current: parseCurrentWeather(result.payload.current),
    forecast: parseForecastItems(result.payload.forecast),
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
