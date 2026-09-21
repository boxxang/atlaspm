import { expect, test, type Page } from './fixtures';

/**
 * Reading a built-in template.
 *
 * A built-in cannot be edited — that rule is the reason every schedule here
 * can be trusted — but read-only is not the same as opaque. Its stages, their
 * weeks and their activities are the whole reason to start a programme from
 * it, so they open in the screen that already knows how to draw them, with
 * nothing on it that would write.
 */
const BUILTIN = 'Typical SoC';

const open = async (page: Page) => {
  await page.goto('/templates');
  await expect(page.locator('[data-template]').first()).toBeVisible();
};

const row = (page: Page, name: string) =>
  page.locator('[data-template]').filter({ hasText: name }).first();

test('a built-in opens to be read, and an editable one to be edited', async ({ page }) => {
  await open(page);

  const builtin = row(page, BUILTIN);
  await expect(builtin.locator('[data-view-template]')).toHaveText('View');
  await expect(builtin.locator('[data-edit-template]')).toHaveCount(0);
  /* and it still cannot be deleted */
  await expect(builtin.locator('[data-tpl-ask]')).toHaveCount(0);
});

test('shows every stage of a built-in, with nothing that would change it', async ({ page }) => {
  await open(page);
  await row(page, BUILTIN).locator('[data-view-template]').click();

  const dlg = page.locator('[data-stage-dialog]');
  await expect(dlg.locator('[data-stage-row]')).toHaveCount(23);
  /* the title is in a field, so it is read as a value rather than as text */
  await expect(
    dlg.locator('[data-stage-row="physicalDesign"]').locator('[data-stage-title]'),
  ).toHaveValue('Physical Design');

  /* the values read, and the fields refuse */
  await expect(dlg.locator('[data-stage-title]').first()).toHaveAttribute('readonly', '');
  await expect(dlg.locator('[data-tpl-rename]')).toHaveAttribute('readonly', '');
  await expect(dlg.locator('[data-stage-tat]').first()).toHaveAttribute('readonly', '');

  /* nothing that writes is on the screen at all */
  for (const sel of ['[data-tpl-save]', '[data-add-stage]', '[data-add-builtin]', '[data-del-stage]', '[data-move-up]']) {
    await expect(dlg.locator(sel)).toHaveCount(0);
  }
  await expect(dlg).toContainText('A built-in template is read-only');
});

/* The stages are the shape; the activities are what the stages are made of,
   and they are the reason a TPM reads a template before starting from it. */
test('opens a stage’s activities and their steps, to read', async ({ page }) => {
  await open(page);
  await row(page, BUILTIN).locator('[data-view-template]').click();
  await page
    .locator('[data-stage-dialog] [data-stage-row="physicalDesign"]')
    .locator('[data-edit-activities]')
    .click();

  const acts = page.locator('[data-act-dialog]');
  await expect(acts.locator('[data-activity-row]').first()).toBeVisible();
  const n = await acts.locator('[data-activity-row]').count();
  expect(n).toBeGreaterThan(5);
  await expect(acts.locator('[data-act-title]').first()).toHaveAttribute('readonly', '');

  await acts.locator('[data-edit-steps]').first().click();
  await expect(acts.locator('[data-step-row]').first()).toBeVisible();
  await expect(acts.locator('[data-step-text]').first()).toHaveAttribute('readonly', '');

  for (const sel of ['[data-tpl-save]', '[data-add-activity]', '[data-add-step]', '[data-del-activity]']) {
    await expect(acts.locator(sel)).toHaveCount(0);
  }
});

/* Wanting to change what you are reading is the ordinary next step. */
test('duplicating from the viewer opens the copy dialog on that template', async ({ page }) => {
  await open(page);
  await row(page, BUILTIN).locator('[data-view-template]').click();
  await page.locator('[data-stage-dialog] [data-tpl-dup-here]').click();

  await expect(page.locator('[data-stage-dialog]')).toHaveCount(0);
  const copy = page.locator('[data-copy-dialog]');
  await expect(copy).toBeVisible();
  await expect(copy.locator('[data-tpl-name]')).toHaveValue(new RegExp(BUILTIN));
});

test('an editable template still opens to be edited', async ({ page }) => {
  await open(page);
  await row(page, BUILTIN).locator('[data-duplicate]').click();
  await page.locator('[data-copy-dialog] [data-tpl-name]').fill('E2E readable copy');
  await page.locator('[data-copy-dialog] [data-tpl-save]').click();
  await expect(page.locator('[data-template]').filter({ hasText: 'E2E readable copy' })).toBeVisible();

  const copy = row(page, 'E2E readable copy');
  await expect(copy.locator('[data-edit-template]')).toHaveText('Edit');
  await copy.locator('[data-edit-template]').click();
  const dlg = page.locator('[data-stage-dialog]');
  await expect(dlg.locator('[data-tpl-save]')).toBeVisible();
  await expect(dlg.locator('[data-stage-title]').first()).not.toHaveAttribute('readonly', '');
});
