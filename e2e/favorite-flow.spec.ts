import { test, expect } from '@playwright/test';
import type { Page, Route } from '@playwright/test';
import { londonCurrentWeather } from '../src/mocks/fixtures/currentWeather';
import { londonForecast } from '../src/mocks/fixtures/forecast';

async function mockWeatherApi(page: Page) {
  await page.route(
    'https://api.openweathermap.org/data/2.5/weather**',
    async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(londonCurrentWeather),
      });
    },
  );
  await page.route(
    'https://api.openweathermap.org/data/2.5/forecast**',
    async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(londonForecast),
      });
    },
  );
}

async function openHomePage(page: Page) {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Weather Dashboard' }),
  ).toBeVisible();
  await page.evaluate(() => {
    window.localStorage.clear();
  });
  await page.reload();

  await expect(
    page.getByRole('heading', { name: 'Weather Dashboard' }),
  ).toBeVisible();

  const noFavoritesText = page.getByText(
    'No favorites yet. Search for a city and click ☆ to save it here.',
  );

  await expect(noFavoritesText).toBeVisible();

  return noFavoritesText;
}

async function addLondonToFavorites(page: Page) {
  await page.getByRole('textbox', { name: 'City name' }).fill('London');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByRole('button', { name: 'Add to favorites' }).click();
  await page.getByRole('link', { name: 'Back to home' }).click();
}

test('setFavorite city', async ({ page }) => {
  await mockWeatherApi(page);
  const noFavoritesText = await openHomePage(page);

  await addLondonToFavorites(page);

  const favoriteCity = page.getByRole('link', { name: /London/i });

  await expect(favoriteCity).toBeVisible();
  await expect(noFavoritesText).not.toBeVisible();
});

test('keeps a favorite after reload', async ({ page }) => {
  await mockWeatherApi(page);
  await openHomePage(page);

  await addLondonToFavorites(page);
  await page.reload();

  await expect(page.getByRole('link', { name: /London/i })).toBeVisible();
  await expect(
    page.getByText(
      'No favorites yet. Search for a city and click ☆ to save it here.',
    ),
  ).not.toBeVisible();
});

test('removes a favorite and restores the empty state', async ({ page }) => {
  await mockWeatherApi(page);
  const noFavoritesText = await openHomePage(page);

  await addLondonToFavorites(page);

  const favoriteCity = page.getByRole('link', { name: /London/i });
  await expect(favoriteCity).toBeVisible();
  await favoriteCity.hover();
  await page
    .getByRole('button', { name: 'Remove London from favorites' })
    .click();

  await expect(favoriteCity).not.toBeVisible();
  await expect(noFavoritesText).toBeVisible();
});
