import { expect, test, type Page, SEED_PROJECT_PATH } from './fixtures';

/**
 * A stage date ripples through every later stage and every milestone, so edits
 * are staged and shown against the saved schedule before they are committed.
 */

const panel = (page: Page) => page.locator('.stage-panel.selected');
const hoverStation = (page: Page, num: string) =>
  page.locator('.rm-station', { hasText: new RegExp(`^${num} `) }).hover();

const p2 = (n: number) => String(n).padStart(2, '0');
const isoPlusDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  const x = new Date(y, m - 1, d);
  x.setDate(x.getDate() + n);
  return `${x.getFullYear()}-${p2(x.getMonth() + 1)}-${p2(x.getDate())}`;
};

/** Move a stage's end date by n days without committing it. */
const stageEdit = async (page: Page, station: string, days: number) => {
  await hoverStation(page, station);
  const input = panel(page).locator('[data-role="end-edit"]');
  const before = await input.inputValue();
  await input.fill(isoPlusDays(before, days));
  await expect(page.locator('#sched-preview')).toBeVisible();
  return before;
};

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await expect(page.locator('.stage-panel.selected')).toBeVisible();
});

test.describe('staging a schedule change', () => {
  test('nothing appears until a date is edited', async ({ page }) => {
    await expect(page.locator('#sched-preview')).toHaveCount(0);
    await expect(page.locator('.g-bar.ghost')).toHaveCount(0);
  });

  test('an edit opens the preview and leaves the saved schedule alone', async ({ page }) => {
    const tapeoutBefore = await page.locator('[data-computed="tapeout"]').textContent();
    await stageEdit(page, '04', 28);

    // the view shows the proposal
    await expect(panel(page).locator('[data-role="tat"]')).toHaveText('20W TAT');
    await expect(page.locator('[data-computed="tapeout"]')).not.toHaveText(tapeoutBefore!);
    // …but nothing is saved: the EDITED flag only turns on once applied
    await expect(page.locator('.edited-flag')).toBeHidden();

    // a reload throws the draft away
    await page.reload();
    await expect(page.locator('#sched-preview')).toHaveCount(0);
    await expect(page.locator('[data-computed="tapeout"]')).toHaveText(tapeoutBefore!);
  });

  test('both schedules are on the timeline at once', async ({ page }) => {
    await stageEdit(page, '04', 28);

    // the saved schedule is drawn underneath as a dashed outline
    const ghosts = page.locator('#rm-gantt .g-bar.ghost');
    await expect(ghosts.first()).toBeVisible();
    expect(await ghosts.count()).toBeGreaterThan(1);
    await expect(ghosts.first()).toHaveCSS('border-style', 'dashed');

    // the proposed bar sits to the right of the saved one it replaces
    const row = page.locator('#rm-gantt .g-row[data-index="7"]'); // Tapeout
    const was = (await row.locator('.g-bar.ghost').boundingBox())!;
    const now = (await row.locator('.g-bar:not(.ghost)').boundingBox())!;
    expect(now.x).toBeGreaterThan(was.x);

    // and the full gantt ghosts its milestone diamonds too
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await expect(page.locator('#gantt-b .g-msdot.ghost').first()).toBeVisible();
  });

  test('the table lists what moves, with the shift in days', async ({ page }) => {
    await stageEdit(page, '04', 28);
    const bar = page.locator('#sched-preview');
    await expect(bar.locator('.sp-tag')).toHaveText('Schedule preview');
    await expect(bar.locator('.sp-note')).toContainText('Nothing is saved yet.');

    // the edited stage keeps its start and grows its TAT
    const dv = bar.locator('tr[data-stage="verification"]');
    await expect(dv.locator('.sp-name')).toHaveText('Verification');
    await expect(dv.locator('td').nth(3)).toContainText('16W → 20W');
    await expect(dv.locator('.sp-delta')).toHaveText('+28d');

    // every later stage shifts by the same 28 days, and no earlier one appears
    await expect(bar.locator('tr[data-stage="synthesis"] .sp-delta')).toHaveText('+28d');
    await expect(bar.locator('tr[data-stage="rtl"]')).toHaveCount(0);
    await expect(bar.locator('tr[data-stage="productDefinition"]')).toHaveCount(0);

    // milestones from DV Closure onward move; Arch Freeze does not
    await expect(bar.locator('tr[data-milestone="dvClosure"] .sp-delta')).toHaveText('+28d');
    await expect(bar.locator('tr[data-milestone="tapeout"] .sp-delta')).toHaveText('+28d');
    await expect(bar.locator('tr[data-milestone="archFreeze"]')).toHaveCount(0);
  });

  test('several edits compound into one review', async ({ page }) => {
    await stageEdit(page, '04', 28);
    await expect(page.locator('#sched-preview tr[data-stage]')).toHaveCount(9);

    await hoverStation(page, '07'); // Signoff, downstream of DV
    const input = panel(page).locator('[data-role="end-edit"]');
    await input.fill(isoPlusDays(await input.inputValue(), 7));

    const bar = page.locator('#sched-preview');
    await expect(bar.locator('tr[data-stage="verification"] .sp-delta')).toHaveText('+28d');
    await expect(bar.locator('tr[data-stage="signoff"] .sp-delta')).toHaveText('+35d');
    await expect(bar.locator('tr[data-milestone="tapeout"] .sp-delta')).toHaveText('+35d');
  });

  test('a start-date edit is staged the same way', async ({ page }) => {
    await hoverStation(page, '06');
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
    const before = await page.locator('[data-computed="tapeout"]').textContent();
    const dvEnd = await stageEdit(page, '04', 28);

    await page.locator('[data-discard-schedule]').click();
    await expect(page.locator('#sched-preview')).toHaveCount(0);
    await expect(page.locator('.g-bar.ghost')).toHaveCount(0);
    await expect(page.locator('[data-computed="tapeout"]')).toHaveText(before!);
    await expect(panel(page).locator('[data-role="end-edit"]')).toHaveValue(dvEnd);
    await expect(panel(page).locator('[data-role="tat"]')).toHaveText('16W TAT');
    await expect(page.locator('.edited-flag')).toBeHidden();
  });

  test('Apply update commits it, and it survives a reload', async ({ page }) => {
    const before = await page.locator('[data-computed="tapeout"]').textContent();
    await stageEdit(page, '04', 28);
    const proposed = await page.locator('[data-computed="tapeout"]').textContent();
    expect(proposed).not.toBe(before);

    await page.locator('[data-apply-schedule]').click();
    await expect(page.locator('#sched-preview')).toHaveCount(0);
    await expect(page.locator('.g-bar.ghost')).toHaveCount(0);
    await expect(page.locator('[data-computed="tapeout"]')).toHaveText(proposed!);
    await expect(page.locator('.edited-flag')).toBeVisible();

    await page.reload();
    await expect(page.locator('[data-computed="tapeout"]')).toHaveText(proposed!);
    await expect(page.locator('.edited-flag')).toBeVisible();
    await hoverStation(page, '04');
    await expect(panel(page).locator('[data-role="tat"]')).toHaveText('20W TAT');
  });

  test('applying twice compares against the newly saved schedule', async ({ page }) => {
    await stageEdit(page, '04', 28);
    await page.locator('[data-apply-schedule]').click();
    await expect(page.locator('#sched-preview')).toHaveCount(0);

    await stageEdit(page, '04', 7);
    // the "current" column is now the 20W schedule, not the original 16W one
    const dv = page.locator('#sched-preview tr[data-stage="verification"]');
    await expect(dv.locator('td').nth(3)).toContainText('20W → 21W');
    await expect(dv.locator('.sp-delta')).toHaveText('+7d');
  });

  test('Reset schedule clears a draft along with the saved overrides', async ({ page }) => {
    const before = await page.locator('[data-computed="tapeout"]').textContent();
    await stageEdit(page, '04', 28);
    await page.locator('[data-apply-schedule]').click();
    await stageEdit(page, '06', 14);
    await expect(page.locator('#sched-preview')).toBeVisible();

    await page.locator('#settings-btn').click();
    await page.locator('#sched-reset').click();
    await expect(page.locator('#sched-preview')).toHaveCount(0);
    await expect(page.locator('[data-computed="tapeout"]')).toHaveText(before!);
    await expect(page.locator('.edited-flag')).toBeHidden();
  });

  test('changing kickoff drops a stale draft', async ({ page }) => {
    await stageEdit(page, '04', 28);
    await page.locator('#kickoff-input').fill('2028-01-03');
    await expect(page.locator('#sched-preview')).toHaveCount(0);
    await expect(page.locator('[data-computed="tapeout"]')).toHaveText('09/25/2028');
  });

  test('the bar leaves room for the page underneath it', async ({ page }) => {
    await stageEdit(page, '04', 28);
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
