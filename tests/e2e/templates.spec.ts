import { expect, test, type Page } from '@playwright/test';

/**
 * Templates.
 *
 * The built-in one is the baseline every schedule here was checked against, so
 * the screen has to make duplicating explicit and refuse to edit it in place —
 * the two things these tests hold still.
 */
const NAME = 'E2E copy of Typical SoC';

const open = async (page: Page) => {
  await page.goto('/templates');
  await expect(page.locator('[data-template]').first()).toBeVisible();
};

const sweep = async (page: Page) => {
  for (let i = 0; i < 4; i++) {
    const stray = page.locator('[data-template]').filter({ hasText: NAME }).first();
    if (!(await stray.count())) return;
    await stray.locator('[data-tpl-ask]').click();
    await stray.locator('[data-tpl-delete]').click();
    await expect(page.locator('[data-template]').filter({ hasText: NAME })).toHaveCount(0);
  }
};

const duplicate = async (page: Page, name = NAME) => {
  await page.locator('[data-template="typicalSoC"] [data-duplicate]').click();
  await page.locator('[data-tpl-name]').fill(name);
  await page.locator('[data-copy-dialog] [data-tpl-save]').click();
};

test.describe('templates', () => {
  test.beforeEach(async ({ page }) => {
    await open(page);
    await sweep(page);
  });
  test.afterEach(async ({ page }) => {
    await open(page);
    await sweep(page);
  });

  test('lists the built-in one and offers only to copy it', async ({ page }) => {
    const builtin = page.locator('[data-template="typicalSoC"]');
    await expect(builtin).toBeVisible();
    await expect(builtin).toContainText('Built-in');
    await expect(builtin.locator('[data-duplicate]')).toHaveCount(1);
    await expect(builtin.locator('[data-edit-template]')).toHaveCount(0);
    await expect(builtin.locator('[data-tpl-ask]')).toHaveCount(0);
  });

  test('duplicates it under a new name, and the copy survives a reload', async ({ page }) => {
    await duplicate(page);
    const copy = page.locator('[data-template]').filter({ hasText: NAME });
    await expect(copy).toHaveCount(1);
    await expect(copy).toContainText('23');

    await open(page);
    await expect(page.locator('[data-template]').filter({ hasText: NAME })).toHaveCount(1);
  });

  test('refuses a name another template already has', async ({ page }) => {
    await page.locator('[data-template="typicalSoC"] [data-duplicate]').click();
    await page.locator('[data-tpl-name]').fill('Typical SoC');
    await page.locator('[data-copy-dialog] [data-tpl-save]').click();
    await expect(page.locator('[data-copy-dialog] .err')).toBeVisible();
  });

  test('edits the copy’s stages, and the changes survive a reload', async ({ page }) => {
    await duplicate(page);
    await page.locator('[data-template]').filter({ hasText: NAME }).locator('[data-edit-template]').click();
    await expect(page.locator('[data-stage-row]')).toHaveCount(23);

    await page.locator('[data-stage-row="tapeout"] [data-del-stage]').click();
    await expect(page.locator('[data-stage-row]')).toHaveCount(22);

    await page.locator('[data-add-stage]').click();
    await expect(page.locator('[data-stage-row]')).toHaveCount(23);

    await page.locator('[data-stage-row="productDefinition"] [data-stage-dur]').fill('10');
    await page.locator('[data-stage-dialog] [data-tpl-save]').click();
    await expect(page.locator('[data-stage-dialog]')).toHaveCount(0);

    await open(page);
    await page.locator('[data-template]').filter({ hasText: NAME }).locator('[data-edit-template]').click();
    await expect(page.locator('[data-stage-row="tapeout"]')).toHaveCount(0);
    await expect(page.locator('[data-stage-row="productDefinition"] [data-stage-dur]')).toHaveValue('10');
  });

  /* Moving a row is the y-axis, not the calendar: the dates must not follow. */
  test('reordering a stage leaves its dates alone', async ({ page }) => {
    await duplicate(page);
    await page.locator('[data-template]').filter({ hasText: NAME }).locator('[data-edit-template]').click();

    const first = page.locator('[data-stage-row]').first();
    const key = await first.getAttribute('data-stage-row');
    const start = await first.locator('[data-stage-start]').inputValue();

    await first.locator('[data-move-down]').click();
    const moved = page.locator(`[data-stage-row="${key}"]`);
    await expect(moved.locator('[data-stage-start]')).toHaveValue(start);
    await expect(page.locator('[data-stage-row]').nth(1)).toHaveAttribute('data-stage-row', key!);
  });
});
