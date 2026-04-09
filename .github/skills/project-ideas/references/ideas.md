# Project Ideas Catalog

A categorized list of improvement ideas for the weather dashboard.
Loaded on-demand by the `project-ideas` skill.

---

## 🌟 New Features

| Idea                       | Description                                                                                                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| °C / °F toggle             | Add a `useUnit` hook that stores the preference in `localStorage` and converts temps app-wide. Touches `WeatherCard`, `ForecastCard`, `FavoriteWeatherCard`.                            |
| Geolocation                | "Use my location" button on `HomePage` — calls `navigator.geolocation.getCurrentPosition`, reverse-geocodes via OpenWeatherMap's coordinates endpoint, then navigates to `/city/:name`. |
| Weather alerts             | Fetch `/data/2.5/onecall?alerts=true` and surface active alerts as a dismissible banner on `CityPage`.                                                                                  |
| Hourly forecast (next 24h) | Use existing `/data/2.5/forecast` list (already fetched) — render the next 8 × 3-hour slots as a horizontal scroll strip below the current weather card. Zero new API calls needed.     |
| Refresh button             | Add a manual refetch button to `CityPage` that calls `refetch()` from `useWeather`. Show a spinner during refetch.                                                                      |
| "Last updated" timestamp   | Display the `dt` field from `WeatherCondition` as a human-readable "Updated X min ago" label on `WeatherCard`.                                                                          |
| Share city link            | Copy-to-clipboard button on `CityPage` that writes `window.location.href` — makes the deep-linked URL easy to share.                                                                    |
| Recently viewed cities     | Store the last N visited city names in a second `localStorage` key; show them below `CitySearch` on `HomePage` as quick-access chips.                                                   |
| Weather map embed          | Embed an OpenWeatherMap tile layer (`openweathermap.org/weathermap`) in an `<iframe>` on `CityPage` for a visual overview.                                                              |

---

## 🎨 UX Polish

| Idea                          | Description                                                                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Animated weather icons        | Replace static OpenWeatherMap PNG icons with [Lottie weather animations](https://lottiefiles.com/) or animated SVGs for a more polished feel.                     |
| Dark / light mode toggle      | Tailwind v4 supports `@variant dark` — add a `ThemeToggle` component that sets `class="dark"` on `<html>` and persists choice in `localStorage`.                  |
| Empty favorites prompt        | When `FavoritesList` is empty, show a friendly illustration + "Search for a city and click ☆ to save it here" instead of rendering nothing.                       |
| Skeleton matching real layout | The `LoadingSkeleton` is generic — make it structurally match the `WeatherCard` + `ForecastCard` layout so the transition is seamless.                            |
| Better 404 / error page       | When navigating to a bad city name, render a full-page `ErrorMessage` with a "Back to search" CTA rather than a bare error banner.                                |
| Keyboard navigation           | Ensure `FavoriteWeatherCard`'s remove button is reachable via keyboard (currently only visible on hover — use `group-focus-within` in addition to `group-hover`). |
| Responsive favorites grid     | On mobile (1 column), each `FavoriteWeatherCard` is cramped — increase padding and font size for small screens.                                                   |

---

## 🛠 Developer Experience

| Idea                | Description                                                                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Storybook           | Add `@storybook/react-vite` and write stories for `WeatherCard`, `ForecastCard`, `ErrorMessage`, `LoadingSkeleton`. Enables visual development without running the full app. |
| `.env.example`      | Add the example env file mentioned in `README.md` but not present in the repo (`VITE_OPENWEATHER_API_KEY=your_key_here`).                                                    |
| Husky + lint-staged | Run `eslint --fix` and `vitest run` on staged files pre-commit to catch regressions before they reach CI.                                                                    |
| GitHub Actions CI   | Add a `.github/workflows/ci.yml` that runs `npm run lint` + `npm test` on every push and pull request.                                                                       |
| Path alias in tests | Add `@/` path alias to `tsconfig.test.json` so test files can use `@/` imports instead of `../../src/...` (requires `vite.config.ts` alias already present).                 |
| Barrel exports      | Add `src/components/index.ts` and `src/hooks/index.ts` barrel files so import lines stay short and refactoring is easier.                                                    |

---

## 🧪 Testing

| Idea                                  | Description                                                                                                            |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `FavoritesList` component tests       | Tests for the grid render, empty-state, and remove interaction are missing.                                            |
| `FavoriteWeatherCard` component tests | Loading / error / data branches are untested.                                                                          |
| `ForecastCard` component tests        | No existing test file.                                                                                                 |
| `ErrorMessage` component tests        | Each error type (`CityNotFoundError`, `ApiKeyError`, etc.) should assert the correct heading text.                     |
| `CityPage` page tests                 | Tests for loading / error / data render branches and the `decodedName` URL decoding logic.                             |
| `HomePage` page tests                 | Smoke-test that `CitySearch` and `FavoritesList` are rendered.                                                         |
| `useFavorites` hook tests             | Unit-test `addFavorite`, `removeFavorite`, `isFavorite`, duplicate prevention, and `localStorage` corruption recovery. |
| Coverage threshold enforcement        | Add `coverage: { thresholds: { lines: 80 } }` to `vite.config.ts` to fail the build when coverage drops.               |

---

## 🏗 Architecture

| Idea                            | Description                                                                                                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React Error Boundary            | Wrap `CityPage` content in a `<ErrorBoundary>` to catch unexpected render errors and show `ErrorMessage` gracefully.                                                              |
| Query error serialization       | TanStack Query serializes errors as plain objects by default — ensure `instanceof` checks still work by using `throwOnError` + custom `onError`. Verify with an integration test. |
| Abstracted icon component       | Extract `<img src={`.../${icon}@2x.png`} />` into a shared `<WeatherIcon icon={icon} description={description} size={N} />` component used by all three card types.               |
| `WeatherData` cache persistence | Use `@tanstack/react-query-persist-client` + `localStorage` to serve stale weather data instantly on page refresh before revalidating.                                            |
| Route-based code splitting      | Wrap `CityPage` and `HomePage` in `React.lazy` + `<Suspense>` to reduce initial bundle size.                                                                                      |
