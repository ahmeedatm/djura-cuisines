import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
export const BASE_PATH = '/djura-cuisines/';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: `http://localhost:${PORT}${BASE_PATH}` },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `npm run build && npx astro preview --port ${PORT}`,
    url: `http://localhost:${PORT}${BASE_PATH}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // Sans cette variable, astro preview se détache en arrière-plan quand il détecte un agent IA
    // et Playwright croit alors que le serveur s'est arrêté.
    env: { ASTRO_PREVIEW_BACKGROUND: '1' },
  },
});
