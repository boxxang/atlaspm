import { expect, test, type Page, SEED_PROJECT_PATH, selectStage } from './fixtures';

/**
 * Stages are rows, not code: a profile is a list of them, and editing that list
 * forks a named profile so the programs already on it keep their schedule.
 */
const editor = (page: Page) => page.locator('#stage-editor');
const rows = (page: Page) => editor(page).locator('.se-row');

const openEditor = async (page: Page) => {
  await page.locator('#stages-btn').click();
  await expect(editor(page)).toBeVisible();
};

const addStage = async (
  page: Page,
  title: string,
  opts: { start: number; length: number; band?: string },
) => {
  await editor(page).locator('[data-add-stage]').click();
  const row = rows(page).last();
  await row.locator('.se-title-input').fill(title);
  await row.locator('.se-start').fill(String(opts.start));
  await row.locator('.se-dur').fill(String(opts.length));
  if (opts.band) await row.locator('.se-band').selectOption(opts.band);
  return row;
};

const save = async (page: Page) => {
  await editor(page).locator('[data-save-stages]').click();
  await expect(editor(page)).toHaveCount(0);
};

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
});

test.describe('the stage list', () => {
  test('mirrors the profile the program runs on', async ({ page }) => {
    await openEditor(page);
    await expect(rows(page)).toHaveCount(12);
    await expect(rows(page).first().locator('.se-title-input')).toHaveValue('Product Definition');
    await expect(rows(page).first().locator('.se-start')).toHaveValue('0');
    await expect(rows(page).first().locator('.se-dur')).toHaveValue('4');
    await expect(rows(page).last().locator('.se-title-input')).toHaveValue(
      'Qualification & Production',
    );

    // the built-in profile belongs to the code, so saving would fork it
    await expect(editor(page).locator('.se-note')).toHaveAttribute('data-forks', 'yes');
    await expect(editor(page).locator('.se-name-input')).toHaveValue('Typical SoC (copy)');
    await expect(editor(page).locator('[data-save-stages]')).toHaveText('Save as new profile');
  });

  test('a stage carrying a milestone cannot be removed', async ({ page }) => {
    await openEditor(page);
    const tapeout = editor(page).locator('.se-row[data-stage="tapeout"]');
    await expect(tapeout.locator('[data-del-stage]')).toBeDisabled();
    await expect(tapeout.locator('[data-del-stage]')).toHaveAttribute(
      'title',
      /carries the Tapeout milestone/,
    );
    // a stage without one is removable
    await expect(
      editor(page).locator('.se-row[data-stage="synthesis"] [data-del-stage]'),
    ).toBeEnabled();
  });

  test('ESC and Cancel close it without touching the program', async ({ page }) => {
    await openEditor(page);
    await editor(page).locator('.se-row').first().locator('.se-title-input').fill('Renamed');
    await page.keyboard.press('Escape');
    await expect(editor(page)).toHaveCount(0);
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(12);
    await selectStage(page, '01');
    await expect(page.locator('.stage-panel.selected h2')).toHaveText('Product Definition');
  });
});

test.describe('adding a stage', () => {
  test('forks a profile, and the new stage is on the chart and empty', async ({ page }) => {
    await openEditor(page);
    await addStage(page, 'Package Bring-up', { start: 50, length: 4, band: 'integrate' });
    await save(page);

    // the program moved to the fork; the built-in profile still exists
    await expect(page.locator('#profile-select')).toHaveValue(/^prof_/);
    await expect(page.locator('#profile-select option')).toHaveCount(2);
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(13);

    const row = page.locator('#rm-gantt .g-row[data-index="12"]');
    // the mini chart's legend is the number and the short title
    await expect(row.locator('.g-row-label')).toHaveText('13.PBU');
    await expect(row.locator('.g-row-label')).toHaveAttribute('title', 'Package Bring-up');

    /* the chart folds once the pointer has left it, so come back in first */
    await page.locator('#roadmap').hover({ position: { x: 6, y: 6 } });
    await row.locator('[data-select-stage]').click();
    const panel = page.locator('.stage-panel.selected');
    await expect(panel).toHaveAttribute('data-id', /^stg_/);
    await expect(panel.locator('h2')).toHaveText('Package Bring-up');
    // nothing has been written about it yet
    await expect(panel.locator('.board[data-kind="activities"] .b-row')).toHaveCount(0);
    await expect(panel.locator('.dlv-row')).toHaveCount(0);
    await expect(panel.locator('.viz svg')).toHaveCount(0);
  });

  test('the seeded program is untouched by another program forking', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('ForkTest');
    await page.locator('.pf-kickoff').fill('2027-02-01');
    await page.locator('[data-create]').click();
    await expect(page.locator('#project-name')).toHaveText('ForkTest');

    await openEditor(page);
    await addStage(page, 'Extra Study', { start: 2, length: 3 });
    await save(page);
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(13);

    await page.goto(SEED_PROJECT_PATH);
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(12);
    await expect(page.locator('#profile-select')).toHaveValue('typicalSoC');
  });

  test('a program can be created on a forked profile', async ({ page }) => {
    await openEditor(page);
    await editor(page).locator('.se-name-input').fill('Two-die SoC');
    await addStage(page, 'Second Die', { start: 20, length: 6 });
    await save(page);

    await page.goto('/');
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('BX9');
    await page.locator('.pf-kickoff').fill('2027-06-01');
    await page.locator('.pf-profile').selectOption({ label: 'Two-die SoC — 13 stages' });
    await page.locator('[data-create]').click();

    await expect(page.locator('#project-name')).toHaveText('BX9');
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(13);
    await expect(page.locator('#profile-select')).toHaveValue(/^prof_/);
  });
});

test.describe('editing the list', () => {
  test('a profile this program alone uses is edited in place, and renames', async ({ page }) => {
    await openEditor(page);
    await editor(page).locator('.se-name-input').fill('AtlasAX1 flow');
    await save(page);
    await expect(page.locator('#profile-select option')).toHaveCount(2);

    // second time round there is nobody else on it, so it is edited, not copied
    await openEditor(page);
    await expect(editor(page).locator('.se-note')).toHaveAttribute('data-forks', 'no');
    await expect(editor(page).locator('.se-name-input')).toHaveValue('AtlasAX1 flow');
    await expect(editor(page).locator('[data-save-stages]')).toHaveText('Save');
    await editor(page).locator('.se-name-input').fill('AtlasAX1 flow v2');
    await save(page);

    await expect(page.locator('#profile-select option')).toHaveCount(2);
    await expect(
      page.locator('#profile-select option:checked'),
    ).toHaveText('AtlasAX1 flow v2');
  });

  test('reordering moves the bar and renumbers the legend', async ({ page }) => {
    await openEditor(page);
    // Synthesis (5th) above Verification (4th)
    await editor(page).locator('.se-row[data-stage="synthesis"] [data-up]').click();
    await save(page);

    const labels = page.locator('#rm-gantt .g-row-label');
    await expect(labels.nth(3)).toHaveText('04.SYN');
    await expect(labels.nth(4)).toHaveText('05.DV');
  });

  test('a longer stage moves everything downstream', async ({ page }) => {
    const before = await page.locator('[data-computed="tapeout"]').textContent();
    await openEditor(page);
    await editor(page).locator('.se-row[data-stage="rtl"] .se-dur').fill('16');
    await save(page);
    // RTL runs four weeks longer; the stages after it keep their own offsets,
    // so Tapeout is where the profile puts it — the editor is the baseline now
    await expect(page.locator('.se-win')).toHaveCount(0);
    const rtl = page.locator('#rm-gantt .g-row[data-index="2"] .g-bar');
    await expect(rtl).toBeVisible();
    expect(await page.locator('[data-computed="tapeout"]').textContent()).toBe(before);
  });
});

test.describe('moving a program between profiles', () => {
  test('the toolbar select swaps the stage list', async ({ page }) => {
    // fork a profile off one program…
    await openEditor(page);
    await editor(page).locator('.se-name-input').fill('Short flow');
    await editor(page).locator('.se-row[data-stage="synthesis"] [data-del-stage]').click();
    await editor(page).locator('[data-confirm-del]').click();
    await save(page);
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(11);

    // …then move the program back onto the built-in one
    await page.locator('#profile-select').selectOption('typicalSoC');
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(12);
    await expect(page.locator('#profile-select')).toHaveValue('typicalSoC');

    // the fork is still on offer, with its own stage count
    await expect(page.locator('#profile-select option')).toHaveCount(2);
  });
});

test.describe('deleting a stage', () => {
  test('says what goes with it, and takes the content when confirmed', async ({ page }) => {
    await openEditor(page);
    const row = editor(page).locator('.se-row[data-stage="productDefinition"]');
    await row.locator('[data-del-stage]').click();

    const confirm = editor(page).locator('.se-confirm');
    await expect(confirm).toContainText('Remove Product Definition?');
    await expect(confirm).toContainText('36 board entries');
    await expect(confirm).toContainText('4 deliverables');
    await expect(confirm).toContainText('3 contacts');

    await confirm.locator('[data-cancel-del]').click();
    await expect(rows(page)).toHaveCount(12);

    await row.locator('[data-del-stage]').click();
    await editor(page).locator('[data-confirm-del]').click();
    await expect(rows(page)).toHaveCount(11);
    await save(page);

    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(11);
    await expect(page.locator('#rm-gantt .g-row-label').first()).toContainText('01.ARCH');

    // and it stays gone, with its boards
    await page.reload();
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(11);
    await expect(page.locator('.stage-panel[data-id="productDefinition"]')).toHaveCount(0);
  });
});
