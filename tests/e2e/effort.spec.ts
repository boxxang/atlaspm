import { expect, test, type Page, SEED_PROJECT_PATH, selectStage } from './fixtures';

/**
 * Man-months are recorded per engineering line, summed into a stage figure that
 * the gantt bars carry, and summed again into the program's effort and cost.
 */
const panel = (page: Page) => page.locator('.stage-panel.selected');

/** toHaveValue takes one value; the table has an input per line. */
const effortValues = (page: Page) =>
  page.locator('.stage-panel.selected .mm-input').evaluateAll((els) =>
    els.map((e) => (e as HTMLInputElement).value),
  );

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await selectStage(page, '01');
});

test.describe('the engineering table', () => {
  test('lists each activity with its man-months and a stage total', async ({ page }) => {
    await expect(panel(page).locator('.mm-cols > span').first()).toHaveText(
      'Engineering activity',
    );
    await expect(panel(page).locator('.mm-cols > span').nth(1)).toHaveText('M/M');
    const rows = panel(page).locator('.mm-list li');
    await expect(rows).toHaveCount(5);
    // each line is editable, so its title is an input
    await expect(rows.first().locator('.mm-t')).toHaveValue(
      'Performance / power / area target modeling',
    );
    expect(await effortValues(page)).toEqual(['2', '2', '1.5', '1.5', '1']);
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('8 MM');
  });

  test('editing a figure moves the stage total straight away', async ({ page }) => {
    await panel(page).locator('.mm-input').first().fill('6');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('12 MM');

    await panel(page).locator('.mm-input').nth(2).fill('0.5');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('11 MM');
  });

  test('a figure persists across a reload', async ({ page }) => {
    await panel(page).locator('.mm-input').first().fill('6');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('12 MM');
    await page.reload();
    await selectStage(page, '01');
    await expect(panel(page).locator('.mm-input').first()).toHaveValue('6');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('12 MM');
  });

  test('every stage keeps its own figures', async ({ page }) => {
    await selectStage(page, '04');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('180 MM');
    await selectStage(page, '06');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('140 MM');
    await selectStage(page, '08');
    await expect(panel(page).locator('.mm-list li')).toHaveCount(4);
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('10 MM');
  });

  test('editing the stage text leaves the figures alone', async ({ page }) => {
    await panel(page).locator('[data-sd-edit]').click();
    await panel(page).locator('.sd-description').fill('Reworded, same effort.');
    await panel(page).locator('[data-sd-save]').click();
    await expect(panel(page).locator('.sheet-what')).toHaveText('Reworded, same effort.');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('8 MM');
    expect(await effortValues(page)).toEqual(['2', '2', '1.5', '1.5', '1']);
  });
});

test.describe('managing the engineering list', () => {
  test('an activity can be added with its man-months', async ({ page }) => {
    await expect(panel(page).locator('.mm-list li')).toHaveCount(5);
    await panel(page).locator('.mm-new').fill('Package feasibility study');
    await panel(page).locator('.mm-new-mm').fill('3');
    await panel(page).locator('[data-mm-add]').click();

    const rows = panel(page).locator('.mm-list li');
    await expect(rows).toHaveCount(6);
    await expect(rows.last().locator('.mm-t')).toHaveValue('Package feasibility study');
    await expect(rows.last().locator('.mm-input')).toHaveValue('3');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('11 MM');
    // the inputs clear for the next one
    await expect(panel(page).locator('.mm-new')).toHaveValue('');
    await expect(panel(page).locator('.mm-new-mm')).toHaveValue('');
  });

  test('an activity can be renamed and deleted', async ({ page }) => {
    await panel(page).locator('.mm-t').first().fill('PPA modelling, our wording');
    await expect(panel(page).locator('.mm-t').first()).toHaveValue('PPA modelling, our wording');

    await panel(page).locator('.mm-list li').first().locator('[data-mm-del]').click();
    await expect(panel(page).locator('.mm-list li')).toHaveCount(4);
    // deleting takes its man-months with it
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('6 MM');
  });

  test('the list and its figures survive a reload', async ({ page }) => {
    await panel(page).locator('.mm-new').fill('Extra study');
    await panel(page).locator('.mm-new-mm').fill('4');
    await panel(page).locator('[data-mm-add]').click();
    await panel(page).locator('.mm-list li').first().locator('[data-mm-del]').click();
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('10 MM');

    await page.reload();
    await selectStage(page, '01');
    await expect(panel(page).locator('.mm-list li')).toHaveCount(5);
    await expect(panel(page).locator('.mm-t').last()).toHaveValue('Extra study');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('10 MM');
  });

  test('emptying the list leaves it empty rather than restoring the default', async ({
    page,
  }) => {
    for (let i = 0; i < 5; i++) {
      await panel(page).locator('.mm-list li').first().locator('[data-mm-del]').click();
    }
    await expect(panel(page).locator('.mm-empty')).toBeVisible();
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('0 MM');
    await page.reload();
    await selectStage(page, '01');
    await expect(panel(page).locator('.mm-empty')).toBeVisible();
  });

  test('a nameless activity will not be added', async ({ page }) => {
    await panel(page).locator('.mm-new-mm').fill('5');
    await panel(page).locator('[data-mm-add]').click();
    await expect(panel(page).locator('.mm-list li')).toHaveCount(5);
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('8 MM');
  });

  test('it belongs to one stage of one program', async ({ page }) => {
    await panel(page).locator('.mm-new').fill('Only here');
    await panel(page).locator('.mm-new-mm').fill('2');
    await panel(page).locator('[data-mm-add]').click();
    await expect(panel(page).locator('.mm-list li')).toHaveCount(6);

    await selectStage(page, '06');
    await expect(panel(page).locator('.mm-list li')).toHaveCount(5);
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('140 MM');
  });
});

test.describe('effort on the schedule', () => {
  test('each bar in the concurrency gantt is tagged with its stage effort', async ({ page }) => {
    const tags = page.locator('#rm-gantt .g-mm-tag');
    await expect(tags).toHaveCount(12);
    await expect(page.locator('#rm-gantt [data-stage-mm="verification"]')).toHaveText('180 MM');
    await expect(page.locator('#rm-gantt [data-stage-mm="tapeout"]')).toHaveText('10 MM');
  });

  test('the program schedule carries it on the bar itself', async ({ page }) => {
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await expect(page.locator('#gantt-b .g-bar-mm')).toHaveCount(12);
    await expect(page.locator('#gantt-b .g-row[data-index="3"] .g-bar-mm')).toHaveText('180 MM');
  });

  test('a changed figure reaches the bars', async ({ page }) => {
    await selectStage(page, '04');
    await panel(page).locator('.mm-input').first().fill('80');
    await expect(page.locator('#rm-gantt [data-stage-mm="verification"]')).toHaveText('200 MM');
  });

  test('a stage with nothing recorded shows no tag', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('EffortX1');
    await page.locator('.pf-kickoff').fill('2029-04-02');
    await page.locator('[data-create]').click();
    await page.waitForURL(/\/p\/effortx1-/);
    await expect(page.locator('#rm-gantt .g-mm-tag')).toHaveCount(0);
    await selectStage(page, '01');
    await expect(panel(page).locator('[data-stage-mm]')).toHaveText('0 MM');
    await expect(panel(page).locator('.mm-input').first()).toHaveValue('');
  });
});

test.describe('effort and cost for the program', () => {
  test('the dashboard totals the stages and prices them', async ({ page }) => {
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await expect(page.locator('[data-total-mm]')).toHaveText('709 MM');
    await expect(page.locator('[data-cost-rate]')).toHaveValue('15000');
    await expect(page.locator('[data-cost-currency]')).toHaveValue('USD');
    await expect(page.locator('[data-cost]')).toHaveText('$10,635,000');
  });

  test('changing the rate reprices it, and it sticks', async ({ page }) => {
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await page.locator('[data-cost-rate]').fill('20000');
    await expect(page.locator('[data-cost]')).toHaveText('$14,180,000');

    await page.locator('[data-cost-currency]').selectOption('KRW');
    await expect(page.locator('[data-cost]')).toContainText('14,180,000');

    /* mutations are fire-and-forget, so let the write land before reloading */
    await page.waitForLoadState('networkidle');
    await page.reload();
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await expect(page.locator('[data-cost-rate]')).toHaveValue('20000');
    await expect(page.locator('[data-cost-currency]')).toHaveValue('KRW');
  });

  test('a changed stage figure moves the program total', async ({ page }) => {
    await selectStage(page, '04');
    await panel(page).locator('.mm-input').first().fill('80');
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await expect(page.locator('[data-total-mm]')).toHaveText('729 MM');
    await expect(page.locator('[data-cost]')).toHaveText('$10,935,000');
  });

  test('the program card carries the effort and the estimate', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('.pl-card').filter({ hasText: 'AtlasAX1' });
    await expect(card.locator('[data-card-mm]')).toHaveText('709 MM');
    await expect(card.locator('[data-card-cost]')).toHaveText('$10,635,000');
    await expect(card.locator('[data-card-cost]')).toHaveAttribute(
      'title',
      '709 MM × $15,000 per man-month',
    );
  });

  test('the card follows an edit made inside the program', async ({ page }) => {
    await selectStage(page, '04');
    await panel(page).locator('.mm-input').first().fill('80');
    await page.locator('#to-programs').click();
    const card = page.locator('.pl-card').filter({ hasText: 'AtlasAX1' });
    await expect(card.locator('[data-card-mm]')).toHaveText('729 MM');
    await expect(card.locator('[data-card-cost]')).toHaveText('$10,935,000');
  });

  test('a program with no effort recorded shows no estimate', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('EffortX2');
    await page.locator('.pf-kickoff').fill('2029-04-02');
    await page.locator('[data-create]').click();
    await page.waitForURL(/\/p\/effortx2-/);
    await page.locator('#to-programs').click();

    const card = page.locator('.pl-card').filter({ hasText: 'EffortX2' });
    await expect(card.locator('[data-card-mm]')).toHaveText('—');
    await expect(card.locator('[data-card-cost]')).toHaveText('—');
    await expect(card.locator('[data-card-cost]')).toHaveAttribute(
      'title',
      /Set a cost per man-month/,
    );
  });
});
