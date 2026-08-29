import { expect, test, type Page } from './fixtures';

/**
 * The program list, and the programs on it.
 *
 * A trimmed replacement for the V1 spec, which reached most of what it checked
 * through a toolbar and a roadmap that no longer exist. What is left is what the
 * list itself still does: open a program, make one, delete one.
 *
 * The schedule editing and stage editing those tests also covered have no screen
 * in the shell yet. That is a gap, not a decision — see PORTING_PLAN_V2.
 */
const card = (page: Page, name: string) => page.locator('.pl-card').filter({ hasText: name });

test.describe('the program list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.pl-card').first()).toBeVisible();
  });

  test('lists the seeded program with what it is running on', async ({ page }) => {
    await expect(card(page, 'AtlasAX1')).toBeVisible();
    await expect(card(page, 'AtlasAX1')).toContainText('Typical SoC');
  });

  test('a card opens the program in the shell', async ({ page }) => {
    await card(page, 'AtlasAX1').locator('.pl-open').click();
    await expect(page).toHaveURL(/\/p\/atlasax1\/overview$/);
    await expect(page.getByRole('navigation', { name: 'Program' })).toContainText('AtlasAX1');
  });

  test('a new program is created and opens on its own overview', async ({ page }) => {
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('AtlasBX2');
    await page.locator('.pf-kickoff').fill('2027-03-01');
    await page.locator('[data-create]').click();

    await page.waitForURL(/\/p\/atlasbx2-[^/]*\/overview$/);
    await expect(page.getByRole('navigation', { name: 'Program' })).toContainText('AtlasBX2');
    /* it runs the same 23 stages, and none of them has been touched */
    await expect(
      page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Stages/ }),
    ).toContainText('23');
    await expect(
      page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Overdue/ }),
    ).toContainText('0');
  });

  test('a program is deleted, and asks first', async ({ page }) => {
    const before = await page.locator('.pl-card').count();
    await card(page, 'AtlasAX1').locator('[data-del-project]').click();
    await page.locator('[data-cancel-del]').click();
    await expect(page.locator('.pl-card')).toHaveCount(before);

    await card(page, 'AtlasAX1').locator('[data-del-project]').click();
    await page.locator('[data-confirm-del]').click();
    await expect(page.locator('.pl-card')).toHaveCount(before - 1);
  });
});
