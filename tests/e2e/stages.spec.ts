import { expect, test, type Page, SEED_PROJECT_PATH, selectStage,
  tapeoutDate,
} from './fixtures';

/**
 * Stages are rows, not code. Editing them is about the program in front of you:
 * Save applies the list to that program alone, taking a private copy of a
 * shared profile if it needs one. Save as template publishes the same list
 * under a name for other programs to start from.
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

/** Save, and publish the same stages as a named template. */
const saveAsTemplate = async (page: Page, name: string) => {
  await editor(page).locator('[data-save-as-template]').click();
  await editor(page).locator('[data-template-name]').fill(name);
  await editor(page).locator('[data-create-template]').click();
};

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
});

test.describe('the stage list', () => {
  test('mirrors the profile the program runs on', async ({ page }) => {
    await openEditor(page);
    await expect(rows(page)).toHaveCount(23);
    await expect(rows(page).first().locator('.se-title-input')).toHaveValue('Product Definition');
    await expect(rows(page).first().locator('.se-start')).toHaveValue('0');
    await expect(rows(page).first().locator('.se-dur')).toHaveValue('8');
    await expect(rows(page).last().locator('.se-title-input')).toHaveValue(
      'Qualification & Production',
    );

    // the legend reads exactly as the chart's y-axis does
    await expect(rows(page).first().locator('.se-legend-no')).toHaveText('01.');
    await expect(rows(page).first().locator('.se-short')).toHaveValue('DEF');
    await expect(rows(page).nth(5).locator('.se-legend-no')).toHaveText('06.');
    await expect(page.locator('#rm-gantt .g-row-label').nth(5)).toHaveText('06.AMS');

    // saving is about this program; the built-in profile is left alone
    await expect(editor(page).locator('.se-note')).toHaveAttribute('data-shared', 'yes');
    await expect(editor(page).locator('.se-note')).toContainText('this program only');
    await expect(editor(page).locator('[data-save-stages]')).toHaveText('Save');
    await expect(editor(page).locator('[data-save-as-template]')).toBeVisible();
  });

  test('the legend number follows a reorder before it is even saved', async ({ page }) => {
    await openEditor(page);
    await editor(page).locator('.se-row[data-stage="synthesis"] [data-up]').click();
    const moved = editor(page).locator('.se-row[data-stage="synthesis"]');
    await expect(moved.locator('.se-legend-no')).toHaveText('10.');
    await expect(moved.locator('.se-short')).toHaveValue('SYN');
  });

  test('a stage carrying a milestone cannot be removed', async ({ page }) => {
    await openEditor(page);
    const tapeout = editor(page).locator('.se-row[data-stage="tapeout"]');
    await expect(tapeout.locator('[data-del-stage]')).toBeDisabled();
    await expect(tapeout.locator('[data-del-stage]')).toHaveAttribute(
      'title',
      /carries the Tapeout \(BEOL MTO\) milestone/,
    );
    // a stage without one is removable
    await expect(
      editor(page).locator('.se-row[data-stage="dft"] [data-del-stage]'),
    ).toBeEnabled();
  });

  test('ESC and Cancel close it without touching the program', async ({ page }) => {
    await openEditor(page);
    await editor(page).locator('.se-row').first().locator('.se-title-input').fill('Renamed');
    await page.keyboard.press('Escape');
    await expect(editor(page)).toHaveCount(0);
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(23);
    await selectStage(page, 'productDefinition');
    await expect(page.locator('.stage-panel.selected h2')).toHaveText('Product Definition');
  });
});

test.describe('adding a stage', () => {
  test('applies to this program, and the new stage is on the chart and empty', async ({ page }) => {
    await openEditor(page);
    await addStage(page, 'Package Bring-up', { start: 50, length: 4, band: 'integrate' });
    await save(page);

    // the program is on its own stage list now, and Typical SoC is untouched
    await expect(page.locator('#profile-select')).toHaveValue(/^prof_/);
    await expect(page.locator('#profile-select option')).toHaveCount(2);
    await expect(page.locator('#profile-select option:checked')).toHaveText('AtlasAX1 stages');
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(24);

    const row = page.locator('#rm-gantt .g-row[data-index="23"]');
    // the mini chart's legend is the number and the short title
    await expect(row.locator('.g-row-label')).toHaveText('24.PBU');
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

  test('the seeded program is untouched by another program editing its stages', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('ForkTest');
    await page.locator('.pf-kickoff').fill('2027-02-01');
    await page.locator('[data-create]').click();
    await expect(page.locator('#project-name')).toHaveText('ForkTest');

    await openEditor(page);
    await addStage(page, 'Extra Study', { start: 2, length: 3 });
    await save(page);
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(24);

    await page.goto(SEED_PROJECT_PATH);
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(23);
    await expect(page.locator('#profile-select')).toHaveValue('typicalSoC');
  });

  test('a program can be created on a published template', async ({ page }) => {
    await openEditor(page);
    await addStage(page, 'Second Die', { start: 20, length: 6 });
    await saveAsTemplate(page, 'Two-die SoC');
    await expect(editor(page)).toHaveCount(0);

    await page.goto('/');
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('BX9');
    await page.locator('.pf-kickoff').fill('2027-06-01');
    await page.locator('.pf-profile').selectOption({ label: 'Two-die SoC — 24 stages' });
    await page.locator('[data-create]').click();

    await expect(page.locator('#project-name')).toHaveText('BX9');
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(24);
    await expect(page.locator('#profile-select')).toHaveValue(/^prof_/);
  });
});

test.describe('editing the list', () => {
  test('a second edit does not breed a second profile', async ({ page }) => {
    await openEditor(page);
    await addStage(page, 'Extra Study', { start: 2, length: 3 });
    await save(page);
    await expect(page.locator('#profile-select option')).toHaveCount(2);
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(24);

    // this program is the only one on it now, so the next edit lands in place
    await openEditor(page);
    await expect(editor(page).locator('.se-note')).toHaveAttribute('data-shared', 'no');
    await expect(editor(page).locator('.se-note')).toContainText('applies these stages');
    await addStage(page, 'One More', { start: 4, length: 2 });
    await save(page);

    await expect(page.locator('#profile-select option')).toHaveCount(2);
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(25);
  });

  test('a template name has to be one nobody has taken', async ({ page }) => {
    await openEditor(page);
    await editor(page).locator('[data-save-as-template]').click();
    await editor(page).locator('[data-template-name]').fill('Typical SoC');
    await editor(page).locator('[data-create-template]').click();
    await expect(editor(page).locator('[data-se-error]')).toContainText('already exists');
    await expect(editor(page)).toBeVisible(); // nothing saved

    // case does not make a name different either
    await editor(page).locator('[data-template-name]').fill('typical soc');
    await editor(page).locator('[data-create-template]').click();
    await expect(editor(page).locator('[data-se-error]')).toContainText('already exists');

    await editor(page).locator('[data-template-name]').fill('Typical SoC v2');
    await editor(page).locator('[data-create-template]').click();
    await expect(editor(page)).toHaveCount(0);
    await expect(page.locator('#profile-select option')).toHaveCount(2);
    await expect(page.locator('#profile-select option:checked')).toHaveText('Typical SoC v2');
  });

  test('reordering moves the bar and renumbers the legend', async ({ page }) => {
    await openEditor(page);
    // Synthesis (11th) above DFT (10th)
    await editor(page).locator('.se-row[data-stage="synthesis"] [data-up]').click();
    await save(page);

    const labels = page.locator('#rm-gantt .g-row-label');
    await expect(labels.nth(9)).toHaveText('10.SYN');
    await expect(labels.nth(10)).toHaveText('11.DFT');
  });

  test('a longer stage moves everything downstream', async ({ page }) => {
    const before = await tapeoutDate(page);
    await openEditor(page);
    await editor(page).locator('.se-row[data-stage="rtl"] .se-dur').fill('36');
    await save(page);
    // RTL runs four weeks longer; the stages after it keep their own offsets,
    // so Tapeout is where the profile puts it — the editor is the baseline now
    await expect(page.locator('.se-win')).toHaveCount(0);
    const rtl = page.locator('#rm-gantt .g-row[data-index="7"] .g-bar');
    await expect(rtl).toBeVisible();
    expect(await tapeoutDate(page)).toBe(before);
  });
});

test.describe('moving a program between profiles', () => {
  test('the toolbar select swaps the stage list', async ({ page }) => {
    // publish a shorter list as a template…
    await openEditor(page);
    await editor(page).locator('.se-row[data-stage="dft"] [data-del-stage]').click();
    await editor(page).locator('[data-confirm-del]').click();
    await saveAsTemplate(page, 'Short flow');
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(22);

    // …then move the program back onto the built-in one
    await page.locator('#profile-select').selectOption('typicalSoC');
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(23);
    await expect(page.locator('#profile-select')).toHaveValue('typicalSoC');

    // the template stays on offer for anyone else
    await expect(page.locator('#profile-select option')).toHaveCount(2);
    await expect(page.locator('#profile-select option').last()).toHaveText(/Short flow/);
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
    await expect(confirm).toContainText('6 deliverables');
    await expect(confirm).toContainText('3 contacts');

    await confirm.locator('[data-cancel-del]').click();
    await expect(rows(page)).toHaveCount(23);

    await row.locator('[data-del-stage]').click();
    await editor(page).locator('[data-confirm-del]').click();
    await expect(rows(page)).toHaveCount(22);
    await save(page);

    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(22);
    await expect(page.locator('#rm-gantt .g-row-label').first()).toContainText('01.ARCH');

    // and it stays gone, with its boards
    await page.reload();
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(22);
    await expect(page.locator('.stage-panel[data-id="productDefinition"]')).toHaveCount(0);
  });
});
