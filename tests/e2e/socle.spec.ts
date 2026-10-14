import { test, expect } from '@playwright/test';

test('la page d’accueil répond en français sous la base', async ({ page }) => {
  const response = await page.goto('./');
  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page).toHaveTitle(/Djura Cuisines/);
});

test('aucune page de démo AstroWind ne subsiste', async ({ page }) => {
  for (const path of ['pricing', 'blog', 'homes/saas']) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
  }
});
