import { expect, test } from '@playwright/test';

// Phase 0 acceptance: the dev server boots and serves the scaffolded page.
// Replaced in Phase 1 by real toolbar checks.
test('dev server serves the app shell', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('body')).toBeVisible();
});
