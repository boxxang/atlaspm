import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { journeyData } from '../../src/data/journey';
import {
  expect,
  test,
  type Page,
  SEED_PROJECT_PATH,
  selectStage,
  editEngineering,
  editDeliverables,
  settleLayout,
  fileDeliverable,
} from './fixtures';

/** An artefact to file against a deliverable — any real file will do. */
const ARTEFACT = join(tmpdir(), 'atlaspm-artefact.txt');
writeFileSync(ARTEFACT, 'Signed off; report attached.');

/**
 * Stage definitions live in code and are shared by every program. A program
 * edits its own copy; an emptied field falls back to the shared text rather
 * than freezing a copy of it.
 */
const panel = (page: Page) => page.locator('.stage-panel.selected');

/* Read from the data rather than copied out of it: the shared text is what a
   stage falls back to, and a test that hardcodes it only proves it was pasted
   correctly on the day it was written. */
const stageText = (id: string) => journeyData.find((j) => j.id === id)!.description;
const SHARED_DESCRIPTION = stageText('productDefinition');

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await selectStage(page, 'productDefinition');
});

test.describe('read mode versus edit mode', () => {
  test('the tables are read-outs until the pencil is pressed', async ({ page }) => {
    // engineering: values shown, nothing to type into
    await expect(panel(page).locator('[data-mm-text]')).toHaveCount(9);
    await expect(panel(page).locator('.mm-input:not(.read)')).toHaveCount(0);
    await expect(panel(page).locator('.mm-t.read')).toHaveCount(9);
    await expect(panel(page).locator('[data-mm-del]')).toHaveCount(0);
    await expect(panel(page).locator('.mm-add')).toHaveCount(0);

    // deliverables: due dates read as text, no add row, no delete
    await expect(panel(page).locator('[data-dlv-due-text]')).toHaveCount(6);
    await expect(panel(page).locator('input.dlv-due')).toHaveCount(0);
    await expect(panel(page).locator('[data-dlv-del]')).toHaveCount(0);
    await expect(panel(page).locator('.dlv-add')).toHaveCount(0);

    /* The tick is not a control at all now: it reads the record's state, and
       pressing it opens the record — where the artefact that makes it true
       is filed. So there is nothing on this table to toggle. */
    await expect(panel(page).locator('.dlv-list input[type="checkbox"]')).toHaveCount(6);
    await expect(panel(page).locator('.dlv-list input[type="checkbox"]').first()).toHaveJSProperty(
      'readOnly',
      true,
    );
    // and every row offers the way in, closed or open
    await expect(panel(page).locator('[data-dlv-record]')).toHaveCount(6);
    await expect(panel(page).locator('[data-dlv-open]')).toHaveCount(6);
  });

  test('each table has its own switch — the text, the list and the deliverables', async ({
    page,
  }) => {
    // the engineering list opens on its own, and the deliverables stay read-only
    await editEngineering(page);
    // one row is two fields — man-months and TAT — so nine rows are eighteen
    await expect(panel(page).locator('.mm-input:not(.read)')).toHaveCount(18);
    await expect(panel(page).locator('.mm-add')).toHaveCount(1);
    await expect(panel(page).locator('[data-mm-del]')).toHaveCount(9);
    await expect(panel(page).locator('input.dlv-due')).toHaveCount(0);
    await expect(panel(page).locator('.sd-edit')).toHaveCount(0);

    // …and the deliverables open on theirs, without closing the list
    await editDeliverables(page);
    await expect(panel(page).locator('input.dlv-due')).toHaveCount(7); // 6 rows + the add row
    await expect(panel(page).locator('.dlv-add')).toHaveCount(1);
    await expect(panel(page).locator('.mm-input:not(.read)')).toHaveCount(18);

    // …and the pencil is the stage text, which leaves both of them alone
    await panel(page).locator('[data-sd-edit]').click();
    await expect(panel(page).locator('.sd-edit')).toBeVisible();
    await expect(panel(page).locator('.mm-input:not(.read)')).toHaveCount(18);
    await panel(page).locator('[data-sd-save]').click();

    await editEngineering(page, false);
    await editDeliverables(page, false);
    await expect(panel(page).locator('.mm-input:not(.read)')).toHaveCount(0);
    await expect(panel(page).locator('input.dlv-due')).toHaveCount(0);
    await expect(panel(page).locator('[data-mm-text]')).toHaveCount(9);
  });

  test('saving the stage text keeps an activity added while it was open', async ({ page }) => {
    /* The regression: the text form used to carry the engineering list as it
       was when the form opened, so anything added meanwhile was overwritten. */
    await panel(page).locator('[data-sd-edit]').click();
    await editEngineering(page);
    await panel(page).locator('.mm-new').fill('Added while editing the text');
    await panel(page).locator('.mm-new-mm').fill('3');
    await panel(page).locator('[data-mm-add]').click();
    await expect(panel(page).locator('.mm-list li')).toHaveCount(10);

    await panel(page).locator('.sd-description').fill('Reworded, same list.');
    await panel(page).locator('[data-sd-save]').click();
    await expect(panel(page).locator('.sheet-what')).toHaveText('Reworded, same list.');
    await expect(panel(page).locator('.mm-list li')).toHaveCount(10);

    await page.reload();
    await selectStage(page, 'productDefinition');
    await expect(panel(page).locator('.mm-list li')).toHaveCount(10);
    await expect(panel(page).locator('.mm-t').last()).toHaveText('Added while editing the text');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('31 MM');
  });

  test('the read-out shows the same numbers the form holds', async ({ page }) => {
    await expect(panel(page).locator('[data-mm-text="0"]')).toHaveText('4');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('28 MM');

    await editEngineering(page);
    await panel(page).locator('[data-mm="0"]').fill('7');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('31 MM');
    await editEngineering(page, false);

    // the table saves as it is typed, so closing it changes nothing
    await expect(panel(page).locator('[data-mm-text="0"]')).toHaveText('7');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('31 MM');
  });

  test('a deliverable due date is only editable in edit mode', async ({ page }) => {
    const first = panel(page).locator('.dlv-list li').first();
    await expect(first.locator('[data-dlv-due-text]')).toHaveText(/^\d{2}\/\d{2}\/\d{4}$/);

    await editDeliverables(page);
    await first.locator('input.dlv-due').fill('2027-01-15');
    await editDeliverables(page, false);
    await expect(first.locator('[data-dlv-due-text]')).toHaveText('01/15/2027');
  });

  test('the two tables share one window', async ({ page }) => {
    /* the pane animates in — measure once it has landed */
    await settleLayout(page);
    /* Engineering activity on the left, key deliverables on the right: read
       side by side, so they start on the same line and their columns end on
       the same line — the engineering side sets the height, its total and its
       tools line included, and the deliverables list takes what is left. */
    const heads = await panel(page)
      .locator('.mm-cols, .dlv-cols')
      .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(heads[0]).toBe(heads[1]);

    const cols = await panel(page)
      .locator('.sheet-grid > *')
      .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    expect(cols[0]).toBe(cols[1]);

    const lists = await panel(page)
      .locator('.mm-list, .dlv-list')
      .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(lists[0]).toBe(lists[1]);
  });

  test('the completion date is the filing stamp, and edit mode corrects it', async ({
    page,
  }) => {
    /* Product Definition's are all closed in the seed, so file one from a
       stage that is still running. */
    await selectStage(page, 'physicalDesign');
    const row = panel(page).locator('.dlv-list li').filter({ hasText: 'Bump map' });
    await expect(row.locator('.dlv-comp')).toHaveText('—');

    // filing its record stamps today
    await fileDeliverable(page, 'Bump map', ARTEFACT);
    const today = new Date();
    const p2 = (n: number) => String(n).padStart(2, '0');
    const iso = `${today.getFullYear()}-${p2(today.getMonth() + 1)}-${p2(today.getDate())}`;
    await expect(row.locator('.dlv-comp')).toContainText(
      `${p2(today.getMonth() + 1)}/${p2(today.getDate())}/${today.getFullYear()}`,
    );

    // and the stamp is a date like any other once the table is open
    await editDeliverables(page);
    await expect(row.locator('[data-comp-edit]')).toHaveValue(iso);
    await row.locator('[data-comp-edit]').fill('2026-05-04');
    await editDeliverables(page, false);
    await expect(row.locator('.dlv-comp')).toContainText('05/04/2026');

    await page.reload();
    await selectStage(page, 'physicalDesign');
    await expect(
      panel(page)
        .locator('.dlv-list li')
        .filter({ hasText: 'Bump map' })
        .locator('.dlv-comp'),
    ).toContainText('05/04/2026');
  });

  test('a deliverable with no date is asked about, then reads TBD', async ({ page }) => {
    await editDeliverables(page);
    await panel(page).locator('.dlv-input').fill('Vendor quote');
    await panel(page).locator('[data-dlv-add]').click();

    // nothing is written until the question is answered
    const ask = panel(page).locator('.dlv-tbd');
    await expect(ask).toContainText('No due date for “Vendor quote”');
    await expect(panel(page).locator('.dlv-list li')).toHaveCount(6);

    await ask.locator('[data-dlv-tbd-cancel]').click();
    await expect(ask).toHaveCount(0);
    await expect(panel(page).locator('.dlv-input')).toHaveValue('Vendor quote');

    // a date makes the question moot
    await panel(page).locator('.dlv-input-due').fill('2026-11-02');
    await panel(page).locator('[data-dlv-add]').click();
    await expect(panel(page).locator('.dlv-list li')).toHaveCount(7);
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
    await selectStage(page, 'productDefinition');
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
    await selectStage(page, 'productDefinition');
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
    await selectStage(page, 'productDefinition');
    await expect(panel(page).locator('.sheet-what')).toHaveText(SHARED_DESCRIPTION);
  });

  test('an edit belongs to one stage of one program', async ({ page }) => {
    await panel(page).locator('[data-sd-edit]').click();
    await panel(page).locator('.sd-description').fill('Definition, our words.');
    await panel(page).locator('[data-sd-save]').click();

    // another stage of the same program keeps the shared text
    await selectStage(page, 'physicalDesign');
    await expect(panel(page).locator('.sheet-what')).toHaveText(stageText('physicalDesign'));
    await expect(panel(page).locator('.sd-flag')).toHaveCount(0);

    // and so does another program
    await page.goto('/');
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('DetailX1');
    await page.locator('.pf-kickoff').fill('2029-01-08');
    await page.locator('[data-create]').click();
    await page.waitForURL(/\/p\/detailx1-/);
    await selectStage(page, 'productDefinition');
    await expect(panel(page).locator('.sheet-what')).toHaveText(SHARED_DESCRIPTION);
    await expect(panel(page).locator('.sd-flag')).toHaveCount(0);
  });
});
