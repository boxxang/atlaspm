import { expect, test, type Page, SEED_PROJECT_PATH, selectStage,
  tapeoutDate,
  setKickoffDate,
} from './fixtures';

/**
 * A stage date ripples through every later stage and every milestone, so edits
 * are staged and shown against the saved schedule before they are committed.
 */

const panel = (page: Page) => page.locator('.stage-panel.selected');

const p2 = (n: number) => String(n).padStart(2, '0');
const isoPlusDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  const x = new Date(y, m - 1, d);
  x.setDate(x.getDate() + n);
  return `${x.getFullYear()}-${p2(x.getMonth() + 1)}-${p2(x.getDate())}`;
};

/** Move a stage's end date by n days without committing it. */
const stageEdit = async (page: Page, station: string, days: number) => {
  await selectStage(page, station);
  const input = panel(page).locator('[data-role="end-edit"]');
  const before = await input.inputValue();
  await input.fill(isoPlusDays(before, days));
  await expect(page.locator('#sched-preview')).toBeVisible();
  return before;
};

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await selectStage(page, 'productDefinition');
});

test.describe('staging a schedule change', () => {
  test('nothing appears until a date is edited', async ({ page }) => {
    await expect(page.locator('#sched-preview')).toHaveCount(0);
    await expect(page.locator('.g-bar.ghost')).toHaveCount(0);
  });

  test('an edit opens the preview and leaves the saved schedule alone', async ({ page }) => {
    const tapeoutBefore = await tapeoutDate(page);
    await stageEdit(page, '09', 28);

    // the view shows the proposal
    await expect(panel(page).locator('[data-role="tat-edit"]')).toHaveValue('44');
    await expect.poll(() => tapeoutDate(page)).not.toBe(tapeoutBefore!);
    // …but nothing is saved: the EDITED flag only turns on once applied
    await expect(page.locator('.edited-flag')).toBeHidden();

    // a reload throws the draft away
    await page.reload();
    await expect(page.locator('#sched-preview')).toHaveCount(0);
    await expect.poll(() => tapeoutDate(page)).toBe(tapeoutBefore!);
  });

  test('both schedules are on the timeline at once', async ({ page }) => {
    await stageEdit(page, '09', 28);

    // the saved schedule is drawn underneath as a dashed outline
    const ghosts = page.locator('#rm-gantt .g-bar.ghost');
    await expect(ghosts.first()).toBeVisible();
    expect(await ghosts.count()).toBeGreaterThan(1);
    await expect(ghosts.first()).toHaveCSS('border-style', 'dashed');

    // the proposed bar sits to the right of the saved one it replaces
    const row = page.locator('#rm-gantt .g-row[data-index="13"]'); // Tapeout
    const was = (await row.locator('.g-bar.ghost').boundingBox())!;
    const now = (await row.locator('.g-bar:not(.ghost)').boundingBox())!;
    expect(now.x).toBeGreaterThan(was.x);

    // and the full gantt ghosts its milestone diamonds too
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await expect(page.locator('#gantt-b .g-msdot.ghost').first()).toBeVisible();
  });

  test('the table lists what moves, with the shift in days', async ({ page }) => {
    await stageEdit(page, '09', 28);
    const bar = page.locator('#sched-preview');
    await expect(bar.locator('.sp-tag')).toHaveText('Schedule preview');
    await expect(bar.locator('.sp-note')).toContainText('Nothing is saved yet.');

    // the edited stage keeps its start and grows its TAT
    const dv = bar.locator('tr[data-stage="verification"]');
    await expect(dv.locator('.sp-name')).toHaveText('Verification');
    await expect(dv.locator('td').nth(3)).toContainText('40W → 44W');
    await expect(dv.locator('.sp-delta')).toHaveText('+28d');

    // every later stage shifts by the same 28 days, and no earlier one appears
    await expect(bar.locator('tr[data-stage="synthesis"] .sp-delta')).toHaveText('+28d');
    await expect(bar.locator('tr[data-stage="rtl"]')).toHaveCount(0);
    await expect(bar.locator('tr[data-stage="productDefinition"]')).toHaveCount(0);

    // milestones from DV Closure onward move; Arch Freeze does not
    await expect(bar.locator('tr[data-milestone="dvClosure"] .sp-delta')).toHaveText('+28d');
    await expect(bar.locator('tr[data-milestone="tapeoutBeolMto"] .sp-delta')).toHaveText('+28d');
    await expect(bar.locator('tr[data-milestone="archFreeze"]')).toHaveCount(0);
  });

  test('several edits compound into one review', async ({ page }) => {
    await stageEdit(page, '09', 28);
    await expect(page.locator('#sched-preview tr[data-stage]')).toHaveCount(15);

    await selectStage(page, 'signoff'); // Signoff, downstream of DV
    const input = panel(page).locator('[data-role="end-edit"]');
    await input.fill(isoPlusDays(await input.inputValue(), 7));

    const bar = page.locator('#sched-preview');
    await expect(bar.locator('tr[data-stage="verification"] .sp-delta')).toHaveText('+28d');
    await expect(bar.locator('tr[data-stage="signoff"] .sp-delta')).toHaveText('+35d');
    await expect(bar.locator('tr[data-milestone="tapeoutBeolMto"] .sp-delta')).toHaveText('+35d');
  });

  test('a start-date edit is staged the same way', async ({ page }) => {
    await selectStage(page, 'physicalDesign');
    const input = panel(page).locator('[data-role="start-edit"]');
    await input.fill(isoPlusDays(await input.inputValue(), 14));
    await expect(page.locator('#sched-preview')).toBeVisible();
    await expect(
      page.locator('#sched-preview tr[data-stage="physicalDesign"] .sp-delta'),
    ).toHaveText('+14d');
  });
});

test.describe('resolving the review', () => {
  test('Discard puts the saved dates back', async ({ page }) => {
    const before = await tapeoutDate(page);
    const dvEnd = await stageEdit(page, '09', 28);

    await page.locator('[data-discard-schedule]').click();
    await expect(page.locator('#sched-preview')).toHaveCount(0);
    await expect(page.locator('.g-bar.ghost')).toHaveCount(0);
    await expect.poll(() => tapeoutDate(page)).toBe(before!);
    await expect(panel(page).locator('[data-role="end-edit"]')).toHaveValue(dvEnd);
    await expect(panel(page).locator('[data-role="tat-edit"]')).toHaveValue('40');
    await expect(page.locator('.edited-flag')).toBeHidden();
  });

  test('Apply update commits it, and it survives a reload', async ({ page }) => {
    const before = await tapeoutDate(page);
    await stageEdit(page, '09', 28);
    const proposed = await tapeoutDate(page);
    expect(proposed).not.toBe(before);

    await page.locator('[data-apply-schedule]').click();
    await expect(page.locator('#sched-preview')).toHaveCount(0);
    await expect(page.locator('.g-bar.ghost')).toHaveCount(0);
    await expect.poll(() => tapeoutDate(page)).toBe(proposed!);
    await expect(page.locator('.edited-flag')).toBeVisible();

    await page.reload();
    await expect.poll(() => tapeoutDate(page)).toBe(proposed!);
    await expect(page.locator('.edited-flag')).toBeVisible();
    await selectStage(page, 'verification');
    await expect(panel(page).locator('[data-role="tat-edit"]')).toHaveValue('44');
  });

  test('applying twice compares against the newly saved schedule', async ({ page }) => {
    await stageEdit(page, '09', 28);
    await page.locator('[data-apply-schedule]').click();
    await expect(page.locator('#sched-preview')).toHaveCount(0);

    /* selecting the same stage again would close it, so reopen deliberately */
    await stageEdit(page, '09', 7);
    // the "current" column is now the 44W schedule, not the original 40W one
    const dv = page.locator('#sched-preview tr[data-stage="verification"]');
    await expect(dv.locator('td').nth(3)).toContainText('44W → 45W');
    await expect(dv.locator('.sp-delta')).toHaveText('+7d');
  });

  test('Reset schedule clears a draft along with the saved overrides', async ({ page }) => {
    const before = await tapeoutDate(page);
    await stageEdit(page, '09', 28);
    await page.locator('[data-apply-schedule]').click();
    await stageEdit(page, '06', 14);
    await expect(page.locator('#sched-preview')).toBeVisible();

    await page.locator('#settings-btn').click();
    await page.locator('#sched-reset').click();
    await expect(page.locator('#sched-preview')).toHaveCount(0);
    await expect.poll(() => tapeoutDate(page)).toBe(before!);
    await expect(page.locator('.edited-flag')).toBeHidden();
  });

  test('changing kickoff drops a stale draft', async ({ page }) => {
    await stageEdit(page, '09', 28);
    await setKickoffDate(page, '2028-01-03');
    await expect(page.locator('#sched-preview')).toHaveCount(0);
    // Tapeout ends 86 weeks after kickoff on the built-in profile
    await expect.poll(() => tapeoutDate(page)).toBe('08/27/2029');
  });

  test('the bar leaves room for the page underneath it', async ({ page }) => {
    await stageEdit(page, '09', 28);
    const pad = await page
      .locator('#stage-panels')
      .evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));
    const bar = (await page.locator('#sched-preview').boundingBox())!;
    expect(pad).toBeGreaterThan(bar.height);
    await page.locator('[data-discard-schedule]').click();
    const after = await page
      .locator('#stage-panels')
      .evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));
    expect(after).toBeLessThan(pad);
  });
});
