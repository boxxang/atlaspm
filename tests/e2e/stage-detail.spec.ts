import {
  expect,
  test,
  type Page,
  SEED_PROJECT_PATH,
  selectStage,
  editEngineering,
  editDeliverables,
} from './fixtures';

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

  test('each table has its own switch — the text, the list and the deliverables', async ({
    page,
  }) => {
    // the engineering list opens on its own, and the deliverables stay read-only
    await editEngineering(page);
    await expect(panel(page).locator('.mm-input:not(.read)')).toHaveCount(5);
    await expect(panel(page).locator('.mm-add')).toHaveCount(1);
    await expect(panel(page).locator('[data-mm-del]')).toHaveCount(5);
    await expect(panel(page).locator('input.dlv-due')).toHaveCount(0);
    await expect(panel(page).locator('.sd-edit')).toHaveCount(0);

    // …and the deliverables open on theirs, without closing the list
    await editDeliverables(page);
    await expect(panel(page).locator('input.dlv-due')).toHaveCount(5); // 4 rows + the add row
    await expect(panel(page).locator('.dlv-add')).toHaveCount(1);
    await expect(panel(page).locator('.mm-input:not(.read)')).toHaveCount(5);

    // …and the pencil is the stage text, which leaves both of them alone
    await panel(page).locator('[data-sd-edit]').click();
    await expect(panel(page).locator('.sd-edit')).toBeVisible();
    await expect(panel(page).locator('.mm-input:not(.read)')).toHaveCount(5);
    await panel(page).locator('[data-sd-save]').click();

    await editEngineering(page, false);
    await editDeliverables(page, false);
    await expect(panel(page).locator('.mm-input:not(.read)')).toHaveCount(0);
    await expect(panel(page).locator('input.dlv-due')).toHaveCount(0);
    await expect(panel(page).locator('[data-mm-text]')).toHaveCount(5);
  });

  test('saving the stage text keeps an activity added while it was open', async ({ page }) => {
    /* The regression: the text form used to carry the engineering list as it
       was when the form opened, so anything added meanwhile was overwritten. */
    await panel(page).locator('[data-sd-edit]').click();
    await editEngineering(page);
    await panel(page).locator('.mm-new').fill('Added while editing the text');
    await panel(page).locator('.mm-new-mm').fill('3');
    await panel(page).locator('[data-mm-add]').click();
    await expect(panel(page).locator('.mm-list li')).toHaveCount(6);

    await panel(page).locator('.sd-description').fill('Reworded, same list.');
    await panel(page).locator('[data-sd-save]').click();
    await expect(panel(page).locator('.sheet-what')).toHaveText('Reworded, same list.');
    await expect(panel(page).locator('.mm-list li')).toHaveCount(6);

    await page.reload();
    await selectStage(page, '01');
    await expect(panel(page).locator('.mm-list li')).toHaveCount(6);
    await expect(panel(page).locator('.mm-t').last()).toHaveText('Added while editing the text');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('11 MM');
  });

  test('the read-out shows the same numbers the form holds', async ({ page }) => {
    await expect(panel(page).locator('[data-mm-text="0"]')).toHaveText('2');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('8 MM');

    await editEngineering(page);
    await panel(page).locator('[data-mm="0"]').fill('7');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('13 MM');
    await editEngineering(page, false);

    // the table saves as it is typed, so closing it changes nothing
    await expect(panel(page).locator('[data-mm-text="0"]')).toHaveText('7');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('13 MM');
  });

  test('a deliverable due date is only editable in edit mode', async ({ page }) => {
    const first = panel(page).locator('.dlv-list li').first();
    await expect(first.locator('[data-dlv-due-text]')).toHaveText(/^\d{2}\/\d{2}\/\d{4}$/);

    await editDeliverables(page);
    await first.locator('input.dlv-due').fill('2027-01-15');
    await editDeliverables(page, false);
    await expect(first.locator('[data-dlv-due-text]')).toHaveText('01/15/2027');
  });

  test('the two tables end on the same line', async ({ page }) => {
    /* Engineering activity on the left, key deliverables on the right: they are
       read side by side, so the columns are the same height whatever they hold. */
    const [engineering, deliverables] = await panel(page)
      .locator('.sheet-grid > *')
      .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    expect(engineering).toBe(deliverables);

    // one header row each, so the column heads line up too
    const heads = await panel(page)
      .locator('.mm-cols, .dlv-cols')
      .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(heads[0]).toBe(heads[1]);
  });

  test('a deliverable with no date is asked about, then reads TBD', async ({ page }) => {
    await editDeliverables(page);
    await panel(page).locator('.dlv-input').fill('Vendor quote');
    await panel(page).locator('[data-dlv-add]').click();

    // nothing is written until the question is answered
    const ask = panel(page).locator('.dlv-tbd');
    await expect(ask).toContainText('No due date for “Vendor quote”');
    await expect(panel(page).locator('.dlv-list li')).toHaveCount(4);

    await ask.locator('[data-dlv-tbd-cancel]').click();
    await expect(ask).toHaveCount(0);
    await expect(panel(page).locator('.dlv-input')).toHaveValue('Vendor quote');

    // a date makes the question moot
    await panel(page).locator('.dlv-input-due').fill('2026-11-02');
    await panel(page).locator('[data-dlv-add]').click();
    await expect(panel(page).locator('.dlv-list li')).toHaveCount(5);
    await expect(panel(page).locator('.dlv-list li').last().locator('input.dlv-due')).toHaveValue(
      '2026-11-02',
    );

    // and TBD is a real answer: it saves, reads back as TBD, and can be dated later
    await panel(page).locator('.dlv-input').fill('Second sourcing plan');
    await panel(page).locator('[data-dlv-add]').click();
    await panel(page).locator('[data-dlv-tbd-ok]').click();
    const last = panel(page).locator('.dlv-list li').last();
    await expect(last).toContainText('Second sourcing plan');
    await expect(last.locator('input.dlv-due')).toHaveValue('');

    await editDeliverables(page, false);
    await expect(last.locator('[data-dlv-due-text]')).toHaveText('TBD');

    await page.reload();
    await selectStage(page, '01');
    await expect(panel(page).locator('.dlv-list li').last().locator('[data-dlv-due-text]')).toHaveText(
      'TBD',
    );
    await editDeliverables(page);
    await panel(page).locator('.dlv-list li').last().locator('input.dlv-due').fill('2027-03-04');
    await editDeliverables(page, false);
    await expect(
      panel(page).locator('.dlv-list li').last().locator('[data-dlv-due-text]'),
    ).toHaveText('03/04/2027');
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
