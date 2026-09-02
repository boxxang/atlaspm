import { expect, test, type Page } from '@playwright/test';

/**
 * Templates.
 *
 * The built-in one is the baseline every schedule here was checked against, so
 * the screen has to make duplicating explicit and refuse to edit it in place —
 * the two things these tests hold still.
 */
const NAME = 'E2E copy of Typical SoC';
const RENAMED = 'E2E renamed template';

const open = async (page: Page) => {
  await page.goto('/templates');
  await expect(page.locator('[data-template]').first()).toBeVisible();
};

const sweep = async (page: Page) => {
  for (let i = 0; i < 8; i++) {
    const stray = page
      .locator('[data-template]')
      .filter({ hasText: /E2E (copy of Typical SoC|renamed template)/ })
      .first();
    if (!(await stray.count())) return;
    await stray.locator('[data-tpl-ask]').click();
    await stray.locator('[data-tpl-delete]').click();
    await expect(stray).toHaveCount(0);
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

  /* Editing a step materialises the whole activity: it stops inheriting and
     owns every step, so no reader ever consults two sources at once. */
  test('adds an activity to a stage, and gives it a step', async ({ page }) => {
    await duplicate(page);
    await page
      .locator('[data-template]')
      .filter({ hasText: NAME })
      .locator('[data-edit-template]')
      .click();
    await page.locator('[data-stage-row="productDefinition"] [data-edit-activities]').click();
    /* The dialog fetches its list, so wait for a row before counting — count()
       does not retry the way an expect does. */
    await expect(page.locator('[data-activity-row]').first()).toBeVisible();
    const before = await page.locator('[data-activity-row]').count();

    await page.locator('[data-add-activity]').click();
    await expect(page.locator('[data-activity-row]')).toHaveCount(before + 1);

    const added = page.locator('[data-activity-row]').last();
    await added.locator('[data-act-title]').fill('Stakeholder sign-off');
    await added.locator('[data-edit-steps]').click();
    await page.locator('[data-add-step]').click();
    await page
      .locator('[data-step-row]')
      .last()
      .locator('[data-step-text]')
      .fill('Collect the signatures');
    await page.locator('[data-step-row]').last().locator('[data-step-tat]').fill('2');
    await page.locator('[data-act-dialog] [data-tpl-save]').click();
    await expect(page.locator('[data-act-dialog]')).toHaveCount(0);

    await open(page);
    await page
      .locator('[data-template]')
      .filter({ hasText: NAME })
      .locator('[data-edit-template]')
      .click();
    await page.locator('[data-stage-row="productDefinition"] [data-edit-activities]').click();
    /* The title lives in an input, so it is asserted on the value — hasText
       reads text content and would never see it. */
    await expect(page.locator('[data-activity-row]').first()).toBeVisible();
    await expect(
      page.locator('[data-activity-row] [data-act-title]').last(),
    ).toHaveValue('Stakeholder sign-off');
    await expect(page.locator('[data-activity-row]')).toHaveCount(before + 1);
  });

  test('removes an activity, and the gap in the numbering stays', async ({ page }) => {
    await duplicate(page);
    await page
      .locator('[data-template]')
      .filter({ hasText: NAME })
      .locator('[data-edit-template]')
      .click();
    await page.locator('[data-stage-row="productDefinition"] [data-edit-activities]').click();

    const rows = page.locator('[data-activity-row]');
    await expect(rows.first()).toBeVisible();
    const before = await rows.count();
    const secondRef = await rows.nth(1).getAttribute('data-activity-row');
    const thirdRef = await rows.nth(2).getAttribute('data-activity-row');

    await rows.nth(1).locator('[data-del-activity]').click();
    await expect(rows).toHaveCount(before - 1);
    /* The one that followed keeps its own reference rather than sliding into
       the deleted one's — that is what stops recorded work being repointed. */
    await expect(rows.nth(1)).toHaveAttribute('data-activity-row', thirdRef!);
    await expect(page.locator(`[data-activity-row="${secondRef}"]`)).toHaveCount(0);
  });

  /* Renaming and re-staging are one act of editing this template, so they share
     a form and a save button rather than being two screens. */
  /* The prefix is what DEF-01 is made of, so it is typed rather than derived
     from a title nobody chose it for. */
  test('gives an added stage a prefix nobody else holds, and lets it be typed', async ({
    page,
  }) => {
    await duplicate(page);
    await page
      .locator('[data-template]')
      .filter({ hasText: NAME })
      .locator('[data-edit-template]')
      .click();

    await page.locator('[data-add-stage]').click();
    const added = page.locator('[data-stage-row="new-1"]');
    await expect(added.locator('[data-stage-prefix]')).toHaveValue('NEW');

    await page.locator('[data-add-stage]').click();
    await expect(
      page.locator('[data-stage-row="new-2"] [data-stage-prefix]'),
    ).toHaveValue('NEW2');

    /* Upper-cased as it is typed, and nothing is removed — a character a
       reference cannot carry is reported rather than swallowed, because
       swallowing it is what made the field look like it took only digits. */
    await added.locator('[data-stage-prefix]').fill('cus-t');
    await expect(added.locator('[data-stage-prefix]')).toHaveValue('CUS-T');
    await expect(page.locator('[data-stage-dialog] .err')).toContainText('CUS-T');
    await expect(page.locator('[data-stage-dialog] [data-tpl-save]')).toBeDisabled();

    await added.locator('[data-stage-prefix]').fill('cust');
    await expect(added.locator('[data-stage-prefix]')).toHaveValue('CUST');

    await page.locator('[data-stage-dialog] [data-tpl-save]').click();
    await expect(page.locator('[data-stage-dialog]')).toHaveCount(0);

    await open(page);
    await page
      .locator('[data-template]')
      .filter({ hasText: NAME })
      .locator('[data-edit-template]')
      .click();
    await expect(
      page.locator('[data-stage-row="new-1"] [data-stage-prefix]'),
    ).toHaveValue('CUST');
  });

  /* The bug this rule was written for: a Korean input source answers the `d`
     key with `ㅇ`, the field deleted it before it could be seen, and the field
     reported taking only digits. It has to survive long enough to be named. */
  test('keeps a character it cannot use, and says why', async ({ page }) => {
    await duplicate(page);
    await page
      .locator('[data-template]')
      .filter({ hasText: NAME })
      .locator('[data-edit-template]')
      .click();

    const field = page.locator('[data-stage-row="productDefinition"] [data-stage-prefix]');
    await field.fill('ㅇㄷ');
    await expect(field).toHaveValue('ㅇㄷ');
    await expect(page.locator('[data-stage-dialog] .err')).toContainText('letters and digits');
    await expect(page.locator('[data-stage-dialog] [data-tpl-save]')).toBeDisabled();

    await field.fill('def');
    await expect(field).toHaveValue('DEF');
    await expect(page.locator('[data-stage-dialog] [data-tpl-save]')).toBeEnabled();
  });

  test('refuses two stages that would share a prefix', async ({ page }) => {
    await duplicate(page);
    await page
      .locator('[data-template]')
      .filter({ hasText: NAME })
      .locator('[data-edit-template]')
      .click();

    const first = page.locator('[data-stage-row]').first();
    const taken = await first.locator('[data-stage-prefix]').inputValue();
    await page.locator('[data-stage-row]').nth(1).locator('[data-stage-prefix]').fill(taken);

    await expect(page.locator('[data-stage-dialog] .err')).toContainText(taken);
    await expect(page.locator('[data-stage-dialog] [data-tpl-save]')).toBeDisabled();

    /* And a stage left with no prefix at all is refused for its own reason. */
    await page.locator('[data-stage-row]').nth(1).locator('[data-stage-prefix]').fill('');
    await expect(page.locator('[data-stage-dialog] .err')).toContainText(/prefix/i);
    await expect(page.locator('[data-stage-dialog] [data-tpl-save]')).toBeDisabled();
  });

  /* The prefix is the stage's identity and the number is the activity's.
     Moving the first must leave the second exactly where it was. */
  test('carries the activity references when a prefix changes, numbers intact', async ({
    page,
  }) => {
    await duplicate(page);
    await page
      .locator('[data-template]')
      .filter({ hasText: NAME })
      .locator('[data-edit-template]')
      .click();

    await page.locator('[data-stage-row="productDefinition"] [data-edit-activities]').click();
    await expect(page.locator('[data-activity-row="DEF-01"]')).toBeVisible();
    const refs = await page.locator('[data-activity-row]').count();
    await page.locator('[data-act-dialog] [data-tpl-save]').click();
    await expect(page.locator('[data-act-dialog]')).toHaveCount(0);

    await page
      .locator('[data-stage-row="productDefinition"] [data-stage-prefix]')
      .fill('CUS');
    await page.locator('[data-stage-dialog] [data-tpl-save]').click();
    await expect(page.locator('[data-stage-dialog]')).toHaveCount(0);

    await open(page);
    await page
      .locator('[data-template]')
      .filter({ hasText: NAME })
      .locator('[data-edit-template]')
      .click();
    await page.locator('[data-stage-row="productDefinition"] [data-edit-activities]').click();
    await expect(page.locator('[data-activity-row="CUS-01"]')).toBeVisible();
    await expect(page.locator('[data-activity-row="DEF-01"]')).toHaveCount(0);
    await expect(page.locator('[data-activity-row]')).toHaveCount(refs);
  });

  test('renames the copy, and the new name survives a reload', async ({ page }) => {
    await duplicate(page);
    await page
      .locator('[data-template]')
      .filter({ hasText: NAME })
      .locator('[data-edit-template]')
      .click();
    await expect(page.locator('[data-tpl-rename]')).toHaveValue(NAME);
    await page.locator('[data-tpl-rename]').fill(RENAMED);
    await page.locator('[data-stage-dialog] [data-tpl-save]').click();
    await expect(page.locator('[data-stage-dialog]')).toHaveCount(0);

    await expect(page.locator('[data-template]').filter({ hasText: RENAMED })).toHaveCount(1);
    await open(page);
    await expect(page.locator('[data-template]').filter({ hasText: RENAMED })).toHaveCount(1);
    await expect(page.locator('[data-template]').filter({ hasText: NAME })).toHaveCount(0);
  });

  test('refuses a rename onto a name another template holds', async ({ page }) => {
    await duplicate(page);
    await page
      .locator('[data-template]')
      .filter({ hasText: NAME })
      .locator('[data-edit-template]')
      .click();
    await page.locator('[data-tpl-rename]').fill('Typical SoC');
    await page.locator('[data-stage-dialog] [data-tpl-save]').click();
    await expect(page.locator('[data-stage-dialog] .err')).toBeVisible();
    /* still open, still the copy — a refused save changes nothing */
    await expect(page.locator('[data-stage-dialog]')).toHaveCount(1);
  });

  test('goes back to the programs list', async ({ page }) => {
    await open(page);
    await page.locator('[data-go-programs]').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('[data-program]').first()).toBeVisible();
  });
});
