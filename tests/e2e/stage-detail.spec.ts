import { expect, test, type Page, SEED_PROJECT_PATH, selectStage } from './fixtures';

/**
 * Stage definitions live in code and are shared by every program. A program
 * edits its own copy; an emptied field falls back to the shared text rather
 * than freezing a copy of it.
 */
const panel = (page: Page) => page.locator('.stage-panel.selected');

const SHARED_DESCRIPTION =
  'Define what the product needs to achieve and establish the technical, business, cost, and schedule boundaries of the program before any design work begins.';

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await selectStage(page, '01');
});

test.describe('read mode versus edit mode', () => {
  test('the tables are read-outs until the pencil is pressed', async ({ page }) => {
    // engineering: values shown, nothing to type into
    await expect(panel(page).locator('[data-mm-text]')).toHaveCount(5);
    await expect(panel(page).locator('.mm-input:not(.read)')).toHaveCount(0);
    await expect(panel(page).locator('.mm-t.read')).toHaveCount(5);
    await expect(panel(page).locator('[data-mm-del]')).toHaveCount(0);
    await expect(panel(page).locator('.mm-add')).toHaveCount(0);

    // deliverables: due dates read as text, no add row, no delete
    await expect(panel(page).locator('[data-dlv-due-text]')).toHaveCount(4);
    await expect(panel(page).locator('input.dlv-due')).toHaveCount(0);
    await expect(panel(page).locator('[data-dlv-del]')).toHaveCount(0);
    await expect(panel(page).locator('.dlv-add')).toHaveCount(0);

    // …but ticking one off is day-to-day work, not editing
    await expect(panel(page).locator('.dlv-list input[type="checkbox"]')).toHaveCount(4);
    await expect(panel(page).locator('.dlv-list input[type="checkbox"]').first()).toBeEnabled();
  });

  test('the pencil turns both tables into forms, and Save turns them back', async ({ page }) => {
    await panel(page).locator('[data-sd-edit]').click();
    await expect(panel(page).locator('.mm-input:not(.read)')).toHaveCount(5);
    await expect(panel(page).locator('.mm-add')).toHaveCount(1);
    await expect(panel(page).locator('[data-mm-del]')).toHaveCount(5);
    await expect(panel(page).locator('input.dlv-due')).toHaveCount(5); // 4 rows + the add row
    await expect(panel(page).locator('.dlv-add')).toHaveCount(1);

    await panel(page).locator('[data-sd-save]').click();
    await expect(panel(page).locator('.mm-input:not(.read)')).toHaveCount(0);
    await expect(panel(page).locator('input.dlv-due')).toHaveCount(0);
    await expect(panel(page).locator('[data-mm-text]')).toHaveCount(5);
  });

  test('the read-out shows the same numbers the form holds', async ({ page }) => {
    await expect(panel(page).locator('[data-mm-text="0"]')).toHaveText('2');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('8 MM');

    await panel(page).locator('[data-sd-edit]').click();
    await panel(page).locator('[data-mm="0"]').fill('7');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('13 MM');
    await panel(page).locator('[data-sd-cancel]').click();

    // the table saves as it is typed, so Cancel on the text form does not undo it
    await expect(panel(page).locator('[data-mm-text="0"]')).toHaveText('7');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('13 MM');
  });

  test('a deliverable due date is only editable in edit mode', async ({ page }) => {
    const first = panel(page).locator('.dlv-list li').first();
    await expect(first.locator('[data-dlv-due-text]')).toHaveText(/^\d{2}\/\d{2}\/\d{4}$/);

    await panel(page).locator('[data-sd-edit]').click();
    await first.locator('input.dlv-due').fill('2027-01-15');
    await panel(page).locator('[data-sd-save]').click();
    await expect(first.locator('[data-dlv-due-text]')).toHaveText('01/15/2027');
  });
});

test.describe('editing stage detail', () => {
  test('the pencil opens an editor seeded with the current text', async ({ page }) => {
    await expect(panel(page).locator('.sheet-what')).toHaveText(SHARED_DESCRIPTION);
    await expect(panel(page).locator('.sd-flag')).toHaveCount(0);

    await panel(page).locator('[data-sd-edit]').click();
    await expect(panel(page).locator('.sd-edit')).toBeVisible();
    await expect(panel(page).locator('.sd-description')).toHaveValue(SHARED_DESCRIPTION);
    // lists arrive one per line
    await expect(panel(page).locator('.sd-tools')).toHaveValue(
      'Requirements management\nCost modeling\nFeasibility analysis',
    );
    // the engineering list is managed in its own table, not in this form
    await expect(panel(page).locator('.sd-eng')).toHaveCount(0);
    // the pencil hides while editing
    await expect(panel(page).locator('[data-sd-edit]')).toHaveCount(0);
  });

  test('saving rewrites the sheet and marks the stage edited', async ({ page }) => {
    await panel(page).locator('[data-sd-edit]').click();
    await panel(page).locator('.sd-description').fill('Our own framing of definition.');
    await panel(page).locator('[data-sd-save]').click();

    await expect(panel(page).locator('.sd-edit')).toHaveCount(0);
    await expect(panel(page).locator('.sheet-what')).toHaveText('Our own framing of definition.');
    await expect(panel(page).locator('.sd-flag')).toHaveText('EDITED');
    // untouched fields still come from the shared definition
    await expect(panel(page).locator('[data-pane="eng"] .view-foot .mono')).toHaveText(
      'Requirements management · Cost modeling · Feasibility analysis',
    );
  });

  test('the program view and teams are editable too', async ({ page }) => {
    await panel(page).locator('[data-sd-edit]').click();
    await panel(page).locator('.sd-prog').fill('Exec sign-off\nBudget release');
    await panel(page).locator('.sd-teams').fill('Product\nFinance');
    await panel(page).locator('[data-sd-save]').click();

    await panel(page).locator('.view-toggle button[data-view="prog"]').click();
    await expect(panel(page).locator('[data-pane="prog"] .view-list li')).toHaveText([
      'Exec sign-off',
      'Budget release',
    ]);
    await expect(panel(page).locator('[data-pane="prog"] .view-foot .mono')).toHaveText(
      'Product · Finance',
    );
  });

  test('Cancel throws the edit away', async ({ page }) => {
    await panel(page).locator('[data-sd-edit]').click();
    await panel(page).locator('.sd-description').fill('Never saved.');
    await panel(page).locator('[data-sd-cancel]').click();
    await expect(panel(page).locator('.sheet-what')).toHaveText(SHARED_DESCRIPTION);
    await expect(panel(page).locator('.sd-flag')).toHaveCount(0);
  });

  test('edits persist across a reload', async ({ page }) => {
    await panel(page).locator('[data-sd-edit]').click();
    await panel(page).locator('.sd-description').fill('Persisted framing.');
    await panel(page).locator('[data-sd-save]').click();
    await expect(panel(page).locator('.sheet-what')).toHaveText('Persisted framing.');

    await page.reload();
    await selectStage(page, '01');
    await expect(panel(page).locator('.sheet-what')).toHaveText('Persisted framing.');
    await expect(panel(page).locator('.sd-flag')).toHaveText('EDITED');
  });

  test('clearing a field restores the shared text', async ({ page }) => {
    await panel(page).locator('[data-sd-edit]').click();
    await panel(page).locator('.sd-description').fill('Temporary.');
    await panel(page).locator('[data-sd-save]').click();
    await expect(panel(page).locator('.sheet-what')).toHaveText('Temporary.');

    await panel(page).locator('[data-sd-edit]').click();
    await panel(page).locator('.sd-description').fill('   ');
    await panel(page).locator('[data-sd-save]').click();
    await expect(panel(page).locator('.sheet-what')).toHaveText(SHARED_DESCRIPTION);
    await expect(panel(page).locator('.sd-flag')).toHaveCount(0);
  });

  test('Restore defaults drops every edit on the stage', async ({ page }) => {
    await panel(page).locator('[data-sd-edit]').click();
    await panel(page).locator('.sd-description').fill('Custom.');
    await panel(page).locator('.sd-prog').fill('Only this');
    await panel(page).locator('[data-sd-save]').click();
    await expect(panel(page).locator('.sd-flag')).toBeVisible();

    await panel(page).locator('[data-sd-edit]').click();
    await panel(page).locator('[data-sd-restore]').click();
    await expect(panel(page).locator('.sheet-what')).toHaveText(SHARED_DESCRIPTION);
    await expect(panel(page).locator('.sd-flag')).toHaveCount(0);

    await page.reload();
    await selectStage(page, '01');
    await expect(panel(page).locator('.sheet-what')).toHaveText(SHARED_DESCRIPTION);
  });

  test('an edit belongs to one stage of one program', async ({ page }) => {
    await panel(page).locator('[data-sd-edit]').click();
    await panel(page).locator('.sd-description').fill('Definition, our words.');
    await panel(page).locator('[data-sd-save]').click();

    // another stage of the same program keeps the shared text
    await selectStage(page, '06');
    await expect(panel(page).locator('.sheet-what')).toContainText(
      'Transform the synthesized design into a physically realizable implementation',
    );
    await expect(panel(page).locator('.sd-flag')).toHaveCount(0);

    // and so does another program
    await page.goto('/');
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('DetailX1');
    await page.locator('.pf-kickoff').fill('2029-01-08');
    await page.locator('[data-create]').click();
    await page.waitForURL(/\/p\/detailx1-/);
    await selectStage(page, '01');
    await expect(panel(page).locator('.sheet-what')).toHaveText(SHARED_DESCRIPTION);
    await expect(panel(page).locator('.sd-flag')).toHaveCount(0);
  });
});
