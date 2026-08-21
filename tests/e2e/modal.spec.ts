import { expect, test, type Page, SEED_PROJECT_PATH, selectStage } from './fixtures';

const selectedPanel = (page: Page) => page.locator('.stage-panel.selected');

/** The aggregate boards are reached from the dashboard's stat tiles. */
const openAgg = async (page: Page, type: 'risks' | 'overdue' | 'updates') => {
  await page.locator('#mode-toggle button[data-mode="schedule"]').click();
  await expect(page.locator('#schedule-view')).toBeVisible();
  await page.locator(`[data-dash-open="${type}"]`).click();
  await expect(page.locator('#modal .modal-win')).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await selectStage(page, 'productDefinition');
});

test.describe('board pop-up', () => {
  test('the board carries the day, the pop-up adds the time', async ({ page }) => {
    const board = selectedPanel(page).locator('.board[data-kind="activities"]');
    await expect(board.locator('.b-date').first()).toHaveText(/^\d{2}\/\d{2}\/\d{4}$/);
    await expect(board.locator('.lu-date').first()).toHaveText(/^\d{2}\/\d{2}\/\d{4}$/);

    await board.locator('[data-more]').click();
    await expect(page.locator('#modal-body .b-date').first()).toHaveText(
      /^\d{2}\/\d{2}\/\d{4} · \d{2}:\d{2}$/,
    );
    await expect(page.locator('#modal-body .lu-date').first()).toHaveText(
      /^\d{2}\/\d{2}\/\d{4} · \d{2}:\d{2}$/,
    );
  });

  test('Show more opens the full board, ESC and the scrim close it', async ({ page }) => {
    await selectStage(page, 'physicalDesign');
    await selectedPanel(page)
      .locator('.board[data-kind="activities"] [data-more]')
      .click();

    await expect(page.locator('#modal .modal-win')).toBeVisible();
    await expect(page.locator('body')).toHaveClass(/modal-open/);
    await expect(page.locator('#modal-head h3')).toHaveText('Activity Board');
    await expect(page.locator('#modal-head .meta')).toHaveText('Physical Design');
    // full board, not the main page's latest-3
    await expect(page.locator('#modal-body .b-row')).toHaveCount(6);

    await page.keyboard.press('Escape');
    await expect(page.locator('#modal .modal-win')).toBeHidden();
    await expect(page.locator('body')).not.toHaveClass(/modal-open/);

    await selectedPanel(page).locator('.board[data-kind="risks"] [data-more]').click();
    await expect(page.locator('#modal-head h3')).toHaveText('Risk Board');
    await page.locator('#modal-scrim').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('#modal .modal-win')).toBeHidden();
  });

  test('the window is 1120px wide and 88vh tall', async ({ page }) => {
    await selectedPanel(page).locator('.board[data-kind="keyinfo"] [data-more]').click();
    const win = (await page.locator('.modal-win').boundingBox())!;
    const vh = page.viewportSize()!.height;
    expect(Math.round(win.width)).toBe(1120);
    expect(Math.round(win.height)).toBe(Math.round(vh * 0.88));
  });

  test('ESC closes the pop-up before the dashboard or the inline sheets', async ({ page }) => {
    await expect(selectedPanel(page).locator('.inline-area')).toBeVisible();
    await selectedPanel(page).locator('.board[data-kind="keyinfo"] [data-more]').click();
    await expect(page.locator('#modal .modal-win')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('#modal .modal-win')).toBeHidden();
    // the sheet underneath survives the first ESC
    await expect(selectedPanel(page).locator('.inline-area')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(selectedPanel(page).locator('.inline-area')).toHaveCount(0);
  });

  test('clicking a main-page row opens it in the pane, list still above', async ({ page }) => {
    await selectStage(page, 'physicalDesign');
    const row = selectedPanel(page)
      .locator('.board[data-kind="risks"] .b-row')
      .first();
    const title = await row.locator('.t').textContent();
    await row.click();
    await expect(page.locator('#modal-head h3')).toHaveText('Risk Board');
    await expect(page.locator('.mb-pane-head > .cap')).toHaveText('Risk');
    await expect(page.locator('.iv-title')).toHaveText(title!);
    /* the list never goes away — the entry opens under it, and the row it is
       showing is marked */
    await expect(page.locator('#modal-list .b-row').first()).toHaveAttribute(
      'aria-current',
      'true',
    );
    await page.locator('[data-close-pane]').click();
    await expect(page.locator('#modal-pane')).toHaveCount(0);
    await expect(page.locator('#modal-list .b-row').first()).toBeVisible();
  });
});

test.describe('one window', () => {
  test('reading, writing and editing all happen under the list', async ({ page }) => {
    await selectStage(page, 'physicalDesign');
    await selectedPanel(page).locator('.board[data-kind="activities"] [data-more]').click();
    const list = page.locator('#modal-list .b-row');
    await expect(list).toHaveCount(6);
    await expect(page.locator('#modal-pane')).toHaveCount(0);

    // + Add writes in the pane, with the board still listed above it
    await page.locator('#modal-head [data-add]').click();
    await expect(page.locator('.mb-pane-head > .cap')).toHaveText('New Activity');
    await expect(list).toHaveCount(6);
    await page.locator('.ie-title').fill('Package ball map review');
    await page.locator('[data-save]').click();
    await expect(list).toHaveCount(7);
    // the saved entry reads in the pane, and its row is marked in the list
    await expect(page.locator('.iv-title')).toHaveText('Package ball map review');
    await expect(page.locator('#modal-list .b-row[aria-current="true"] .t')).toHaveText(
      'Package ball map review',
    );

    // editing it stays in the same window too
    await page.locator('#modal-pane [data-edit]').click();
    await expect(page.locator('.mb-pane-head > .cap')).toHaveText('Edit Activity');
    await expect(list).toHaveCount(7);
    await page.locator('.ie-title').fill('Package ball map review v2');
    await page.locator('[data-save]').click();
    await expect(page.locator('.iv-title')).toHaveText('Package ball map review v2');

    // and another row swaps what the pane shows without touching the list
    await list.nth(3).click();
    await expect(page.locator('.iv-title')).not.toHaveText('Package ball map review v2');
    await expect(list).toHaveCount(7);
  });
});

test.describe('status update thread', () => {
  test('post, edit and delete an update', async ({ page }) => {
    await selectStage(page, 'physicalDesign');
    await selectedPanel(page)
      .locator('.board[data-kind="activities"] [data-more]')
      .click();
    // "ECO drop 1 planning" carries no updates yet
    await page.locator('#modal-body .b-row', { hasText: 'ECO drop 1 planning' }).click();
    await expect(page.locator('.su-empty')).toBeVisible();

    // post
    await page.locator('.su-input').fill('Drop 1 scope agreed with DV — 4 ECOs queued.');
    await page.locator('[data-post]').click();
    await expect(page.locator('.su-item')).toHaveCount(1);
    await expect(page.locator('.su-item .su-text')).toHaveText(
      'Drop 1 scope agreed with DV — 4 ECOs queued.',
    );
    await expect(page.locator('.su-empty')).toHaveCount(0);
    const posted = await page.locator('.su-item .su-date').textContent();
    expect(posted).toMatch(/^\d{2}\/\d{2}\/\d{4} · \d{2}:\d{2}$/);

    // edit — the timestamp is the post time, not the edit time
    await page.locator('[data-su-edit]').click();
    await page.locator('.su-edit-input').fill('Drop 1 scope agreed — 6 ECOs queued.');
    await page.locator('[data-su-save]').click();
    await expect(page.locator('.su-item .su-text')).toHaveText(
      'Drop 1 scope agreed — 6 ECOs queued.',
    );
    await expect(page.locator('.su-item .su-date')).toHaveText(posted!);

    // an empty edit is refused, and Cancel backs out
    await page.locator('[data-su-edit]').click();
    await page.locator('.su-edit-input').fill('   ');
    await page.locator('[data-su-save]').click();
    await expect(page.locator('.su-item .su-text')).toHaveText(
      'Drop 1 scope agreed — 6 ECOs queued.',
    );
    await page.locator('[data-su-edit]').click();
    await page.locator('[data-su-cancel]').click();
    await expect(page.locator('.su-edit-input')).toHaveCount(0);

    // delete
    await page.locator('[data-su-del]').click();
    await expect(page.locator('.su-item')).toHaveCount(0);
    await expect(page.locator('.su-empty')).toBeVisible();
  });

  test('editing a seeded update keeps its original timestamp', async ({ page }) => {
    await selectStage(page, 'physicalDesign');
    await selectedPanel(page)
      .locator('.board[data-kind="activities"] .b-row')
      .filter({ hasText: 'Top-level detailed routing' })
      .click();
    const first = page.locator('.su-item').first();
    const stamp = await first.locator('.su-date').textContent();

    await first.locator('[data-su-edit]').click();
    await page.locator('.su-edit-input').fill('Rewritten, same clock.');
    await page.locator('[data-su-save]').click();
    await expect(first.locator('.su-text')).toHaveText('Rewritten, same clock.');
    await expect(first.locator('.su-date')).toHaveText(stamp!);
  });

  test('a posted update surfaces on the main board preview', async ({ page }) => {
    await selectStage(page, 'architecture');
    const board = selectedPanel(page).locator('.board[data-kind="activities"]');
    await board.locator('.b-row').first().click();
    await page.locator('.su-input').fill('Bandwidth budget re-checked against final NoC.');
    await page.locator('[data-post]').click();
    await page.locator('#modal-close').click();

    const top = board.locator('.b-row').first();
    await expect(top.locator('.b-latest')).toContainText(
      'Bandwidth budget re-checked against final NoC.',
    );
    await expect(board.locator('.board-head .note')).toContainText('updates');
  });
});

test.describe('item editor', () => {
  test('+ Add from the main page closes on save and lands as the first row', async ({
    page,
  }) => {
    await selectStage(page, 'physicalDesign');
    const board = selectedPanel(page).locator('.board[data-kind="activities"]');
    await expect(board.locator('.board-head .note')).toHaveText('6 items · 6 updates');

    await board.locator('[data-add]').click();
    await expect(page.locator('.mb-pane-head > .cap')).toHaveText('New Activity');
    // the board is listed above the form, whatever the form was opened for
    await expect(page.locator('#modal-list .b-row')).toHaveCount(6);

    await page.locator('.ie-title').fill('Package ball map review');
    await page.locator('.ie-owner').selectOption('I. Berg');
    await page.locator('.ie-due').fill('2030-04-01');
    await page.locator('.ie-body').fill('Blocking PDN rev 2.');
    await page.locator('[data-save]').click();

    // the pop-up closes; the save lands on the main page
    await expect(page.locator('#modal .modal-win')).toBeHidden();
    const top = board.locator('.b-row').first();
    await expect(top.locator('.t')).toHaveText('Package ball map review');
    await expect(top.locator('.b-owner')).toHaveText('I. Berg');
    await expect(top.locator('.b-due')).toHaveText('04/01/2030');
    await expect(board.locator('.board-head .note')).toHaveText('7 items · 6 updates');
  });

  test('a titleless item says what is missing and marks the field', async ({ page }) => {
    await selectedPanel(page).locator('.board[data-kind="risks"] [data-add]').click();
    await page.locator('.ie-body').fill('No title given');
    await expect(page.locator('[data-form-error]')).toHaveCount(0);

    await page.locator('[data-save]').click();
    await expect(page.locator('#modal .modal-win')).toBeVisible();
    await expect(page.locator('[data-form-error]')).toHaveText('Risk title is required.');
    await expect(page.locator('.ie-title')).toHaveClass(/invalid/);
    await expect(page.locator('.ie-title')).toBeFocused();
    // the empty field blinks so it is obvious which one it is
    expect(await page.locator('.ie-title').evaluate((el) => el.getAnimations().length)).toBe(1);

    // filling it in lets the save through — opened with +Add, so it closes
    await page.locator('.ie-title').fill('Now it has one');
    await page.locator('[data-save]').click();
    await expect(page.locator('#modal .modal-win')).toBeHidden();
    await expect(
      selectedPanel(page).locator('.board[data-kind="risks"] .b-row').first().locator('.t'),
    ).toHaveText('Now it has one');
  });

  test('the message names the board it came from', async ({ page }) => {
    await selectedPanel(page).locator('.board[data-kind="keyinfo"] [data-add]').click();
    await page.locator('[data-save]').click();
    await expect(page.locator('[data-form-error]')).toHaveText('Key Info title is required.');
    await page.locator('#modal-close').click();

    await selectedPanel(page).locator('.board[data-kind="activities"] [data-add]').click();
    await page.locator('[data-save]').click();
    await expect(page.locator('[data-form-error]')).toHaveText('Activity title is required.');
  });

  test('a second Add opens on an empty form', async ({ page }) => {
    const board = selectedPanel(page).locator('.board[data-kind="activities"]');

    await board.locator('[data-add]').click();
    await page.locator('.ie-title').fill('First one');
    await page.locator('.ie-owner').selectOption('N. Feld');
    await page.locator('.ie-body').fill('Some detail.');
    await page.locator('.ie-due').fill('2030-02-01');
    await page.locator('[data-save]').click();
    await expect(page.locator('#modal .modal-win')).toBeHidden();

    await board.locator('[data-add]').click();
    await expect(page.locator('.mb-pane-head > .cap')).toHaveText('New Activity');
    await expect(page.locator('.ie-title')).toHaveValue('');
    await expect(page.locator('.ie-owner')).toHaveValue('');
    await expect(page.locator('.ie-body')).toHaveValue('');
    await expect(page.locator('.ie-due')).toHaveValue('');
    await expect(page.locator('[data-form-error]')).toHaveCount(0);
  });

  test('a warning from one attempt does not linger into the next Add', async ({ page }) => {
    const board = selectedPanel(page).locator('.board[data-kind="activities"]');
    await board.locator('[data-add]').click();
    await page.locator('[data-save]').click();
    await expect(page.locator('[data-form-error]')).toBeVisible();
    await page.locator('#modal-close').click();

    await board.locator('[data-add]').click();
    await expect(page.locator('[data-form-error]')).toHaveCount(0);
    await expect(page.locator('.ie-title')).not.toHaveClass(/invalid/);
  });

  test('editing an existing item still opens on its own values', async ({ page }) => {
    const board = selectedPanel(page).locator('.board[data-kind="activities"]');
    await board.locator('[data-add]').click();
    await page.locator('.ie-title').fill('Has values');
    await page.locator('[data-save]').click();

    await board.locator('.b-row').filter({ hasText: 'Has values' }).click();
    await page.locator('[data-edit]').click();
    await expect(page.locator('.ie-title')).toHaveValue('Has values');
  });

  test('editing from the item view returns to the item, and Delete returns to the board', async ({
    page,
  }) => {
    await selectStage(page, 'physicalDesign');
    await selectedPanel(page).locator('.board[data-kind="risks"] [data-more]').click();
    await expect(page.locator('#modal-body .b-row')).toHaveCount(3);

    await page.locator('#modal-body .b-row').first().click();
    await page.locator('[data-edit]').click();
    await expect(page.locator('.mb-pane-head > .cap')).toHaveText('Edit Risk');
    await page.locator('.ie-title').fill('Routing congestion — crossbar (revised)');
    await page.locator('[data-save]').click();

    // save from a drilled-in item returns to the item view
    await expect(page.locator('#modal-head h3')).toHaveText('Risk Board');
    await expect(page.locator('.mb-pane-head > .cap')).toHaveText('Risk');
    await expect(page.locator('.iv-title')).toHaveText('Routing congestion — crossbar (revised)');

    await page.locator('[data-edit]').click();
    await page.locator('[data-del]').click();
    await expect(page.locator('#modal-head h3')).toHaveText('Risk Board');
    await expect(page.locator('#modal-body .b-row')).toHaveCount(2);
    await page.locator('#modal-close').click();
    await expect(
      selectedPanel(page).locator('.board[data-kind="risks"] .board-head .note'),
    ).toContainText('2 open');
  });
});

test.describe('aggregate boards', () => {
  test('Open Risks lists every one across stages, each tagged, and drills in', async ({
    page,
  }) => {
    await openAgg(page, 'risks');
    await expect(page.locator('#modal-head h3')).toHaveText('Open Risks — All Stages');
    await expect(page.locator('#modal-head .meta')).toHaveText('AtlasAX1');
    // an aggregate board is read-only at the top level
    await expect(page.locator('#modal-head [data-add]')).toHaveCount(0);

    // every open risk on the program, from whichever stage carries it
    await expect(page.locator('.board-foot .note')).toHaveText('23 entries');
    const rows = page.locator('#modal-body .b-row');
    await expect(rows).toHaveCount(10); // ten to a page
    // every row carries its stage tag
    await expect(rows.locator('.b-stage')).toHaveCount(10);
    // newest-updated first, regardless of stage
    await expect(rows.locator('.b-stage').first()).toHaveText('PD');

    /* Opening a row from an aggregate shows that row's own stage in the pane
       and leaves the aggregate list exactly where it was. */
    await expect(rows.first().locator('.b-stage')).toHaveText('PD');
    await rows.first().click();
    await expect(page.locator('#modal-head h3')).toHaveText('Open Risks — All Stages');
    await expect(page.locator('.mb-pane-head > .cap')).toHaveText('Risk');
    await expect(page.locator('.mb-pane-head > .meta')).toHaveText('Physical Design');
    await expect(page.locator('#modal-list .b-row')).toHaveCount(10);
    await page.locator('[data-close-pane]').click();
    await expect(page.locator('#modal-pane')).toHaveCount(0);
    await expect(page.locator('#modal-body .b-row')).toHaveCount(10);
  });

  test('Overdue lists only open, past-due activities', async ({ page }) => {
    await openAgg(page, 'overdue');
    await expect(page.locator('#modal-head h3')).toHaveText('Overdue Activities — All Stages');
    const rows = page.locator('#modal-body .b-row');
    await expect(rows).toHaveCount(7);
    await expect(rows.locator('.t').first()).toHaveText('Multi-corner timing closure');
    await expect(rows.locator('.b-stage').first()).toHaveText('PD');
    for (const due of await rows.locator('.b-due').all()) {
      await expect(due).toHaveClass(/overdue/);
    }
  });

  test('Status Updates pages 10 at a time and drills into the item', async ({ page }) => {
    await openAgg(page, 'updates');
    await expect(page.locator('#modal-head h3')).toHaveText('Status Updates — All Stages');
    await expect(page.locator('.su-cols')).toHaveText('PostedItem — Update');

    const rows = page.locator('#modal-body .su-brow');
    await expect(rows).toHaveCount(10);
    await expect(page.locator('.board-foot .note')).toHaveText('30 entries');
    await expect(page.locator('.pager button[data-page-m]')).toHaveCount(5); // ‹ 1 2 3 ›
    await expect(page.locator('.pager button[aria-current="true"]')).toHaveText('1');
    await expect(page.locator('.pager button').first()).toBeDisabled();

    // newest first
    await expect(rows.first().locator('.b-stage')).toHaveText('PD');

    await page.locator('.pager button', { hasText: '3' }).click();
    await expect(rows).toHaveCount(10); // thirty entries divide evenly
    await expect(page.locator('.pager button').last()).toBeDisabled();

    await rows.first().click();
    await expect(page.locator('.iv-title')).toBeVisible();
    // the list keeps the page you were on while the entry reads below it
    await expect(page.locator('#modal-body .su-brow')).toHaveCount(10);
    await expect(page.locator('.pager button[aria-current="true"]')).toHaveText('3');
    await page.locator('[data-close-pane]').click();
    await expect(page.locator('#modal-body .su-brow')).toHaveCount(10);
  });
});
