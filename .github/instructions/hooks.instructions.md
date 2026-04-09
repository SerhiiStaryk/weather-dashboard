---
applyTo: 'src/hooks/**'
---

# Hook Conventions

- Each hook file exports exactly one hook
- Named export — no default export

## `useWeather(city)`

Wraps TanStack Query `useQuery`:

```ts
useQuery<WeatherData, Error>({
  queryKey: ['weather', city],
  queryFn: () => fetchWeatherData(city!),
  enabled: Boolean(city),
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: 1,
});
```

- `queryFn` calls both `fetchCurrentWeather` + `fetchForecast`, then both parsers
- Returns the combined `WeatherData` shape from `src/types/weather.ts`
- Never bypass the parser — raw API data must not leave the API layer

## `useFavorites()`

Reads/writes `localStorage['weather-favorites']` as `string[]`:

```ts
const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
```

- `useState` initialised with `readFavorites()` — must handle corrupt JSON gracefully (try/catch, return `[]`)
- `addFavorite` and `removeFavorite` are stable `useCallback` references
- `isFavorite(city)` is a stable `useCallback` reference
- Normalise city strings with `.trim()` before storing
- Silently swallow `localStorage` write errors (quota / private browsing)

## General rules

- Do not use `useState` for server/async data — use TanStack Query
- Do not put business logic in page components — put it in hooks
- Do not access `localStorage` outside of `useFavorites`
