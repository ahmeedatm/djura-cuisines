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

test('l’image de partage est une photo de réalisation sous la base', async ({ page }) => {
  await page.goto('./');
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(og).toBeTruthy();
  expect(og).not.toContain('default');
  expect(new URL(og!).pathname.startsWith('/djura-cuisines/')).toBe(true);
});

test('aucune trace du modèle AstroWind ni appel à un service tiers', async ({ page }) => {
  const externes: string[] = [];
  page.on('request', (r) => {
    const host = new URL(r.url()).hostname;
    if (host === 'img.shields.io' || host === 'images.unsplash.com') externes.push(r.url());
  });
  await page.goto('./');
  await page.waitForLoadState('networkidle');
  const texte = await page.locator('body').innerText();
  for (const interdit of ['AstroWind', 'Astro v7', 'Get template']) expect(texte).not.toContain(interdit);
  expect(externes).toEqual([]);
});
