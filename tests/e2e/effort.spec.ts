import {
  expect,
  test,
  type Page,
  SEED_PROJECT_PATH,
  selectStage,
  editEngineering,
} from './fixtures';

/**
 * Man-months are recorded per engineering line, summed into a stage figure that
 * the gantt bars carry, and summed again into the program's effort and cost.
 */
const panel = (page: Page) => page.locator('.stage-panel.selected');

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await selectStage(page, 'productDefinition');
});

test.describe('the engineering table', () => {
  test('lists each activity with its man-months and a stage total', async ({ page }) => {
    /* One header row per table, so the two tables' columns line up: the
       engineering switch rides with the Engineering | Program toggle. */
    await expect(panel(page).locator('.sheet-head .view-toggle')).toBeVisible();
    await expect(panel(page).locator('.sheet-head [data-mm-edit]')).toBeVisible();
    /* Every line carries its reference id, its turn-around and its effort. */
    await expect(panel(page).locator('.mm-cols > span')).toHaveText([
      'ID',
      'Activity',
      'TAT',
      'M/M',
    ]);
    const rows = panel(page).locator('.mm-list li');
    await expect(rows).toHaveCount(9);
    // read-only until this table is switched into edit mode
    await expect(rows.first().locator('.mm-t')).toHaveText(
      'Market and customer requirements consolidation',
    );
    await expect(rows.first().locator('.row-id')).toHaveText('DEF-01');
    await expect(panel(page).locator('.mm-input:not(.read)')).toHaveCount(0);
    await expect(panel(page).locator('.mm-add')).toHaveCount(0);
    expect(await panel(page).locator('[data-mm-text]').allTextContents()).toEqual([
      '4', '6', '3', '3', '2', '2', '3', '3', '2',
    ]);
    expect(await panel(page).locator('[data-tat-text]').allTextContents()).toEqual([
      '4w', '5w', '4w', '4w', '3w', '4w', '4w', '4w', '3w',
    ]);
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('28 MM');
  });

  test('editing a figure moves the stage total straight away', async ({ page }) => {
    await editEngineering(page);
    /* the row carries a turn-around and an effort; this is the effort */
    await panel(page).locator('[data-mm="0"]').fill('6');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('30 MM');

    await panel(page).locator('[data-mm="2"]').fill('0.5');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('27.5 MM');
  });

  test('a figure persists across a reload', async ({ page }) => {
    await editEngineering(page);
    await panel(page).locator('[data-mm="0"]').fill('6');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('30 MM');
    await page.reload();
    await selectStage(page, 'productDefinition');
    // it reads back without needing edit mode
    await expect(panel(page).locator('[data-mm-text="0"]')).toHaveText('6');
    await editEngineering(page);
    await expect(panel(page).locator('[data-mm="0"]')).toHaveValue('6');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('30 MM');
  });

  test('every stage keeps its own figures', async ({ page }) => {
    await selectStage(page, 'verification');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('650 MM');
    await selectStage(page, 'physicalDesign');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('449 MM');
    await selectStage(page, 'tapeout');
    await expect(panel(page).locator('.mm-list li')).toHaveCount(11);
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('47 MM');
  });

  test('editing the stage text leaves the figures alone', async ({ page }) => {
    await panel(page).locator('[data-sd-edit]').click();
    await panel(page).locator('.sd-description').fill('Reworded, same effort.');
    await panel(page).locator('[data-sd-save]').click();
    await expect(panel(page).locator('.sheet-what')).toHaveText('Reworded, same effort.');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('28 MM');
    expect(await panel(page).locator('[data-mm-text]').allTextContents()).toEqual([
      '4', '6', '3', '3', '2', '2', '3', '3', '2',
    ]);
  });
});

test.describe('managing the engineering list', () => {
  test('an activity can be added with its man-months', async ({ page }) => {
    await editEngineering(page);
    await expect(panel(page).locator('.mm-list li')).toHaveCount(9);
    await panel(page).locator('.mm-new').fill('Package feasibility study');
    await panel(page).locator('.mm-new-tat').fill('2');
    await panel(page).locator('.mm-new-mm').fill('3');
    await panel(page).locator('[data-mm-add]').click();

    const rows = panel(page).locator('.mm-list li');
    await expect(rows).toHaveCount(10);
    await expect(rows.last().locator('.mm-t')).toHaveValue('Package feasibility study');
    await expect(rows.last().locator('[data-mm="9"]')).toHaveValue('3');
    await expect(rows.last().locator('[data-tat="9"]')).toHaveValue('2');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('31 MM');
    // the inputs clear for the next one
    await expect(panel(page).locator('.mm-new')).toHaveValue('');
    await expect(panel(page).locator('.mm-new-mm')).toHaveValue('');
    await expect(panel(page).locator('.mm-new-tat')).toHaveValue('');
  });

  test('an activity can be renamed and deleted', async ({ page }) => {
    await editEngineering(page);
    await panel(page).locator('.mm-t').first().fill('PPA modelling, our wording');
    await expect(panel(page).locator('.mm-t').first()).toHaveValue('PPA modelling, our wording');

    await panel(page).locator('.mm-list li').first().locator('[data-mm-del]').click();
    await expect(panel(page).locator('.mm-list li')).toHaveCount(8);
    // deleting takes its man-months with it
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('24 MM');
  });

  test('the list and its figures survive a reload', async ({ page }) => {
    await editEngineering(page);
    await panel(page).locator('.mm-new').fill('Extra study');
    await panel(page).locator('.mm-new-mm').fill('4');
    await panel(page).locator('[data-mm-add]').click();
    await panel(page).locator('.mm-list li').first().locator('[data-mm-del]').click();
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('28 MM');

    await page.reload();
    await selectStage(page, 'productDefinition');
    await expect(panel(page).locator('.mm-list li')).toHaveCount(9);
    await expect(panel(page).locator('.mm-t').last()).toHaveText('Extra study');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('28 MM');
  });

  test('emptying the list leaves it empty rather than restoring the default', async ({
    page,
  }) => {
    await editEngineering(page);
    /* wait for each delete to land before the next: clicks fired back to back
       race the re-render and the writes behind it */
    for (let left = 9; left > 0; left--) {
      await panel(page).locator('[data-mm-del]').first().click();
      await expect(panel(page).locator('[data-mm-del]')).toHaveCount(left - 1);
    }
    await expect(panel(page).locator('.mm-empty')).toBeVisible();
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('0 MM');
    await page.reload();
    await selectStage(page, 'productDefinition');
    await expect(panel(page).locator('.mm-empty')).toBeVisible();
  });

  test('a nameless activity will not be added', async ({ page }) => {
    await editEngineering(page);
    await panel(page).locator('.mm-new-mm').fill('5');
    await panel(page).locator('[data-mm-add]').click();
    await expect(panel(page).locator('.mm-list li')).toHaveCount(9);
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('28 MM');
  });

  test('it belongs to one stage of one program', async ({ page }) => {
    await editEngineering(page);
    await panel(page).locator('.mm-new').fill('Only here');
    await panel(page).locator('.mm-new-mm').fill('2');
    await panel(page).locator('[data-mm-add]').click();
    await expect(panel(page).locator('.mm-list li')).toHaveCount(10);

    await selectStage(page, 'physicalDesign');
    await expect(panel(page).locator('.mm-list li')).toHaveCount(16);
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('449 MM');
  });
});

test.describe('effort on the schedule', () => {
  test('each bar in the concurrency gantt is tagged with its stage effort', async ({ page }) => {
    const tags = page.locator('#rm-gantt .g-bar-mm');
    await expect(tags).toHaveCount(23); // one per stage of the template
    await expect(page.locator('#rm-gantt [data-stage-mm="verification"]')).toHaveText('650 MM');
    await expect(page.locator('#rm-gantt [data-stage-mm="tapeout"]')).toHaveText('47 MM');
  });

  test('the program schedule carries it on the bar itself', async ({ page }) => {
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await expect(page.locator('#gantt-b .g-bar-mm')).toHaveCount(23);
    await expect(
      page.locator('#gantt-b .g-row[data-stage="verification"] .g-bar-mm'),
    ).toHaveText('650 MM');
  });

  test('a changed figure reaches the bars', async ({ page }) => {
    await selectStage(page, 'verification');
    await editEngineering(page);
    /* its first line is 25 MM; 45 puts the stage 20 higher */
    await panel(page).locator('[data-mm="0"]').fill('45');
    await expect(page.locator('#rm-gantt [data-stage-mm="verification"]')).toHaveText('670 MM');
  });

  test('a new program starts on the template’s figures', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('EffortX1');
    await page.locator('.pf-kickoff').fill('2029-04-02');
    await page.locator('[data-create]').click();
    await page.waitForURL(/\/p\/effortx1-/);
    /* A new program starts on the template's own planning figures — they are
       what the template is for — and records over them line by line. */
    await selectStage(page, 'productDefinition');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('28 MM');
    await expect(panel(page).locator('[data-mm-text="0"]')).toHaveText('4');
    await editEngineering(page);
    await panel(page).locator('[data-mm="0"]').fill('0');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('24 MM');
  });
});

test.describe('effort and cost for the program', () => {
  test('the dashboard totals the stages and prices them', async ({ page }) => {
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await expect(page.locator('[data-total-mm]')).toHaveText('3653 MM');
    await expect(page.locator('[data-cost-rate]')).toHaveValue('15000');
    await expect(page.locator('[data-cost-currency]')).toHaveValue('USD');
    await expect(page.locator('[data-cost]')).toHaveText('$54,795,000');
  });

  test('changing the rate reprices it, and it sticks', async ({ page }) => {
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await page.locator('[data-cost-rate]').fill('20000');
    await expect(page.locator('[data-cost]')).toHaveText('$73,060,000');

    await page.locator('[data-cost-currency]').selectOption('KRW');
    await expect(page.locator('[data-cost]')).toContainText('73,060,000');

    /* mutations are fire-and-forget, so let the write land before reloading */
    await page.waitForLoadState('networkidle');
    await page.reload();
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await expect(page.locator('[data-cost-rate]')).toHaveValue('20000');
    await expect(page.locator('[data-cost-currency]')).toHaveValue('KRW');
  });

  test('a changed stage figure moves the program total', async ({ page }) => {
    await selectStage(page, 'verification');
    await editEngineering(page);
    await panel(page).locator('[data-mm="0"]').fill('45');
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await expect(page.locator('[data-total-mm]')).toHaveText('3673 MM');
    await expect(page.locator('[data-cost]')).toHaveText('$55,095,000');
  });

  test('the program card carries the effort and the estimate', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('.pl-card').filter({ hasText: 'AtlasAX1' });
    await expect(card.locator('[data-card-mm]')).toHaveText('3653 MM');
    await expect(card.locator('[data-card-cost]')).toHaveText('$54,795,000');
    await expect(card.locator('[data-card-cost]')).toHaveAttribute(
      'title',
      '3653 MM × $15,000 per man-month',
    );
  });

  test('the card follows an edit made inside the program', async ({ page }) => {
    await selectStage(page, 'verification');
    await editEngineering(page);
    await panel(page).locator('[data-mm="0"]').fill('45');
    await page.locator('#to-programs').click();
    const card = page.locator('.pl-card').filter({ hasText: 'AtlasAX1' });
    await expect(card.locator('[data-card-mm]')).toHaveText('3673 MM');
    await expect(card.locator('[data-card-cost]')).toHaveText('$55,095,000');
  });

  test('a program with no rate set shows effort but no estimate', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('EffortX2');
    await page.locator('.pf-kickoff').fill('2029-04-02');
    await page.locator('[data-create]').click();
    await page.waitForURL(/\/p\/effortx2-/);
    await page.locator('#to-programs').click();

    /* the template's planning figures come with the program; the rate does
       not, so there is effort to show and nothing to price it with */
    const card = page.locator('.pl-card').filter({ hasText: 'EffortX2' });
    await expect(card.locator('[data-card-mm]')).toHaveText('3653 MM');
    await expect(card.locator('[data-card-cost]')).toHaveText('—');
    await expect(card.locator('[data-card-cost]')).toHaveAttribute(
      'title',
      /Set a cost per man-month/,
    );
  });
});
