import { expect, test } from '@playwright/test';
import { SHELL_PATH } from './fixtures';

/**
 * A template is a blueprint, not a live reference.
 *
 * The proof is which profile row a programme points at: its own, never the
 * template's. Through the UI alone that is invisible — two programmes with
 * identical stage lists look the same whether they share a row or not — so
 * this creates one, reads back the stage list it was given, and the plan's
 * accompanying psql check confirms the row it sits on.
 */
test('a new program gets its own stage list, copied from the template', async ({ page }) => {
  const name = `EBlue${Date.now()}`;

  await page.goto('/');
  await page.locator('[data-new-project]').click();
  await page.locator('.pf-name').fill(name);
  await page.locator('.pf-kickoff').fill('2027-03-01');
  await page.locator('[data-create]').click();

  /* Creating opens the programme it made. */
  await page.waitForURL(/\/p\/eblue[^/]*\/overview$/);

  /* Every stage of the template it was made from, on a list of its own. */
  await expect(
    page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Stages/ }),
  ).toContainText('23');
});

/* AtlasAX1 predates the blueprint rule and still shares the built-in row,
   which is safe only because the built-in template is read-only. The rule
   applies to programmes created from here on, and this holds that line. */
test('the seeded program still opens, sharing the built-in template', async ({ page }) => {
  await page.goto(`${SHELL_PATH}/stages`);
  await expect(page.locator('[data-stage]')).toHaveCount(23);
});
