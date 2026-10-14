import { test, expect } from '@playwright/test';

test('l’accueil montre le nom en français et en tifinagh', async ({ page }) => {
  await page.goto('./');
  const h1 = page.locator('h1');
  await expect(h1).toContainText('Djura Cuisines');
  await expect(page.locator('.tifinagh')).toHaveText('ⴷⵊⵓⵔⴰ ⵜⵉⴽⵓⵣⵉⵏⵉⵏ');
  await expect(page.locator('.tifinagh')).toHaveAttribute('lang', 'kab-Tfng');
});

test('le bouton principal ouvre WhatsApp avec le message de devis', async ({ page }) => {
  await page.goto('./');
  const bouton = page.getByRole('link', { name: /devis sur WhatsApp/i }).first();
  const href = await bouton.getAttribute('href');
  expect(href).toMatch(/^https:\/\/wa\.me\/213776312821\?text=/);
  expect(decodeURIComponent(href!.split('?text=')[1])).toBe(
    'Bonjour, je souhaite un devis pour une cuisine / un dressing.'
  );
});

test('les données structurées LocalBusiness sont présentes et pointent sous la base', async ({ page }) => {
  await page.goto('./');
  const blocs = await page.locator('script[type="application/ld+json"]').allTextContents();
  const entreprise = blocs.map((b) => JSON.parse(b)).find((s) => s['@type'] === 'HomeAndConstructionBusiness');
  expect(entreprise?.url).toBe('https://ahmeedatm.github.io/djura-cuisines/');
});
