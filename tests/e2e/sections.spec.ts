import { test, expect } from '@playwright/test';

test('les quatre sections existent dans l’ordre', async ({ page }) => {
  await page.goto('./');
  const ids = await page.locator('#savoir-faire, #realisations, #etapes, #contact').evaluateAll((els) => els.map((e) => e.id));
  expect(ids).toEqual(['savoir-faire', 'realisations', 'etapes', 'contact']);
});

test('le contact donne appel, WhatsApp, itinéraire, horaires et Facebook', async ({ page }) => {
  await page.goto('./#contact');
  const contact = page.locator('#contact');
  await expect(contact.getByRole('link', { name: /\+213 776 31 28 21/ })).toHaveAttribute('href', 'tel:+213776312821');
  await expect(contact.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', /^https:\/\/wa\.me\/213776312821/);
  await expect(contact.getByRole('link', { name: /Itinéraire/ })).toHaveAttribute('href', /google\.com\/maps\/search/);
  await expect(contact).toContainText('Du dimanche au jeudi, 9h-17h');
  await expect(contact).toContainText('Fermé le vendredi et le samedi');
  await expect(contact.getByRole('link', { name: /Facebook/ })).toHaveAttribute('href', 'https://www.facebook.com/Djuracuisines/');
});

test('une photo de la galerie s’ouvre en grand puis se ferme', async ({ page }) => {
  await page.goto('./#realisations');
  await page.locator('#realisations [data-aw-gallery-open]').first().click();
  const visionneuse = page.locator('dialog[open]');
  await expect(visionneuse).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(visionneuse).toHaveCount(0);
});

test('le bouton WhatsApp collant apparaît après défilement sur mobile', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'desktop', 'barre collante réservée au mobile');
  await page.goto('./');
  await page.mouse.wheel(0, 1500);
  await expect(page.locator('aw-sticky-cta').getByRole('link', { name: /WhatsApp/ })).toBeInViewport();
});

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('la galerie reste visible', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('#realisations img').first()).toBeVisible();
  });
});

test('aucune image ne renvoie 404 sous la base', async ({ page }) => {
  const casses: string[] = [];
  page.on('response', (r) => {
    if (r.request().resourceType() === 'image' && r.status() >= 400) casses.push(r.url());
  });
  await page.goto('./');
  await page.mouse.wheel(0, 5000);
  await page.waitForLoadState('networkidle');
  expect(casses).toEqual([]);
});

test('tout lien target=_blank de l’accueil porte rel=noopener', async ({ page }) => {
  await page.goto('./');
  const rels = await page.locator('a[target="_blank"]').evaluateAll((els) => els.map((e) => e.getAttribute('rel') ?? ''));
  expect(rels.length).toBeGreaterThan(0);
  for (const rel of rels) expect(rel).toContain('noopener');
});

test('la page 404 est en français', async ({ page }) => {
  const reponse = await page.goto('page-qui-n-existe-pas');
  expect(reponse?.status()).toBe(404);
  await expect(page.getByText('Page introuvable').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Retour à l’accueil' })).toBeVisible();
});
