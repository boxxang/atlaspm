import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  expect,
  test,
  type Page,
  SEED_PROJECT_PATH,
  selectStage,
  editDeliverables,
  tapeoutDate,
  setKickoffDate,
  fileDeliverable,
  openDeliveryRecord,
} from './fixtures';

/** An artefact to file against a deliverable — any real file will do. */
const ARTEFACT = join(tmpdir(), 'atlaspm-artefact.txt');
writeFileSync(ARTEFACT, 'Signed off; report attached.');

/**
 * Phase 6 acceptance: every mutation survives a hard refresh.
 *
 * These run against the seeded dev database and mutate it, so they run serially
 * and each one undoes what it did — `npm run db:reset` restores AtlasAX1 if a
 * run is interrupted.
 */
test.describe.configure({ mode: 'serial' });

const selectedPanel = (page: Page) => page.locator('.stage-panel.selected');

/** Full document reload — nothing survives in memory. */
const hardRefresh = async (page: Page) => {
  await page.reload({ waitUntil: 'load' });
  /* a reload clears the stage selection, so reopen the first stage */
  await selectStage(page, 'productDefinition');
};

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await selectStage(page, 'productDefinition');
});

test('creating an activity persists', async ({ page }) => {
  await selectStage(page, 'physicalDesign');
  const board = selectedPanel(page).locator('.board[data-kind="activities"]');
  await board.locator('[data-add]').click();
  await page.locator('.ie-title').fill('Persisted ECO review');
  await page.locator('.ie-owner').selectOption('I. Berg');
  await page.locator('.ie-due').fill('2031-03-04');
  await page.locator('.ie-body').fill('Written straight to SQLite.');
  await page.locator('[data-save]').click();
  await expect(page.locator('#modal .modal-win')).toBeHidden();

  await hardRefresh(page);
  await selectStage(page, 'physicalDesign');
  const top = selectedPanel(page).locator('.board[data-kind="activities"] .b-row').first();
  await expect(top.locator('.t')).toHaveText('Persisted ECO review');
  await expect(top.locator('.b-owner')).toHaveText('I. Berg');
  await expect(top.locator('.b-due')).toHaveText('03/04/2031');

  // body round-trips too
  await top.click();
  await expect(page.locator('.iv-body')).toHaveText('Written straight to SQLite.');

  // clean up
  await page.locator('[data-edit]').click();
  await page.locator('[data-del]').click();
  await page.locator('#modal-close').click();
  await hardRefresh(page);
  await selectStage(page, 'physicalDesign');
  await expect(
    selectedPanel(page).locator('.board[data-kind="activities"] .b-row').first().locator('.t'),
  ).not.toHaveText('Persisted ECO review');
});

test('posting a status update persists, and editing keeps its timestamp', async ({ page }) => {
  await selectStage(page, 'physicalDesign');
  await selectedPanel(page).locator('.board[data-kind="activities"] [data-more]').click();
  await page.locator('#modal-body .b-row', { hasText: 'ECO drop 1 planning' }).click();
  await page.locator('.su-input').fill('Persisted through a reload.');
  await page.locator('[data-post]').click();
  const stamp = await page.locator('.su-item .su-date').textContent();

  await hardRefresh(page);
  await selectStage(page, 'physicalDesign');
  await selectedPanel(page).locator('.board[data-kind="activities"] [data-more]').click();
  await page.locator('#modal-body .b-row', { hasText: 'ECO drop 1 planning' }).click();
  await expect(page.locator('.su-item')).toHaveCount(1);
  await expect(page.locator('.su-item .su-text')).toHaveText('Persisted through a reload.');
  await expect(page.locator('.su-item .su-date')).toHaveText(stamp!);

  // an edit rewrites the text and holds the original post time
  await page.locator('[data-su-edit]').click();
  await page.locator('.su-edit-input').fill('Edited, then reloaded.');
  await page.locator('[data-su-save]').click();
  await hardRefresh(page);
  await selectStage(page, 'physicalDesign');
  await selectedPanel(page).locator('.board[data-kind="activities"] [data-more]').click();
  await page.locator('#modal-body .b-row', { hasText: 'ECO drop 1 planning' }).click();
  await expect(page.locator('.su-item .su-text')).toHaveText('Edited, then reloaded.');
  await expect(page.locator('.su-item .su-date')).toHaveText(stamp!);

  await page.locator('[data-su-del]').click();
  await expect(page.locator('.su-empty')).toBeVisible();
  await hardRefresh(page);
  await selectStage(page, 'physicalDesign');
  await selectedPanel(page).locator('.board[data-kind="activities"] [data-more]').click();
  await page.locator('#modal-body .b-row', { hasText: 'ECO drop 1 planning' }).click();
  await expect(page.locator('.su-empty')).toBeVisible();
});

test('a filed deliverable persists with its record and its stamp', async ({ page }) => {
  await selectStage(page, 'physicalDesign');
  const panel = selectedPanel(page);
  const row = panel.locator('.dlv-list li').nth(5); // the first still open
  await expect(row.locator('.dlv-comp')).toHaveText('—');
  await fileDeliverable(page, 'Interim physical DRC', ARTEFACT, 'Clean on the N2 drop.');
  const stamped = await row.locator('.dlv-comp').textContent();
  await expect(panel.locator('.dlv-note')).toHaveText('4 / 9 complete');

  await hardRefresh(page);
  await selectStage(page, 'physicalDesign');
  const after = selectedPanel(page).locator('.dlv-list li').nth(5);
  await expect(after.locator('input[type="checkbox"]')).toBeChecked();
  await expect(after.locator('.dlv-comp')).toHaveText(stamped!);
  await expect(selectedPanel(page).locator('.dlv-note')).toHaveText('4 / 9 complete');
  // and the dashboard counts it
  await page.locator('#mode-toggle button[data-mode="schedule"]').click();
  await expect(page.locator('.stat').first().locator('.v')).toHaveText('54%');
  await page.locator('#mode-toggle button[data-mode="journey"]').click();

  // the record came back with it, history and artefact both
  await openDeliveryRecord(page, 'Interim physical DRC');
  await expect(page.locator('[data-dr-note-text]')).toHaveText('Clean on the N2 drop.');
  await expect(page.locator('.dr-files .att-name')).toHaveText('atlaspm-artefact.txt');

  // and taking the artefact off takes the completion with it
  await page.locator('[data-dr-edit]').click();
  await page.locator('.dr-files [data-att-del]').click();
  await page.locator('[data-dr-save]').click();
  await hardRefresh(page);
  await selectStage(page, 'physicalDesign');
  await expect(
    selectedPanel(page).locator('.dlv-list li').nth(5).locator('.dlv-comp'),
  ).toHaveText('—');
});

test('a DV end-date edit persists as effective overrides', async ({ page }) => {
  const before = await tapeoutDate(page);

  await selectStage(page, 'verification');
  const panel = selectedPanel(page);
  const end = await panel.locator('[data-role="end-edit"]').inputValue();
  const [y, m, d] = end.split('-').map(Number);
  const moved = new Date(y, m - 1, d);
  moved.setDate(moved.getDate() + 28);
  const p2 = (n: number) => String(n).padStart(2, '0');
  const iso = `${moved.getFullYear()}-${p2(moved.getMonth() + 1)}-${p2(moved.getDate())}`;
  await panel.locator('[data-role="end-edit"]').fill(iso);
  await expect(panel.locator('[data-role="tat-edit"]')).toHaveValue('44');
  await page.locator('[data-apply-schedule]').click();
  await expect(page.locator('#sched-preview')).toHaveCount(0);
  const shifted = await tapeoutDate(page);
  expect(shifted).not.toBe(before);

  await hardRefresh(page);
  await expect.poll(() => tapeoutDate(page)).toBe(shifted);
  await expect(page.locator('.edited-flag')).toBeVisible();
  await selectStage(page, 'verification');
  await expect(selectedPanel(page).locator('[data-role="tat-edit"]')).toHaveValue('44');
  await expect(selectedPanel(page).locator('[data-role="end-edit"]')).toHaveValue(iso);

  // reset clears the stored overrides too
  await page.locator('#settings-btn').click();
  await page.locator('#sched-reset').click();
  await expect.poll(() => tapeoutDate(page)).toBe(before);
  await hardRefresh(page);
  await expect.poll(() => tapeoutDate(page)).toBe(before);
  await expect(page.locator('.edited-flag')).toBeHidden();
});

test('renaming the project persists', async ({ page }) => {
  await page.locator('#project-name').click();
  await page.locator('#project-name-input').fill('AtlasAX2');
  await page.keyboard.press('Enter');
  await expect(page.locator('#project-name')).toHaveText('AtlasAX2');

  await hardRefresh(page);
  await expect(page.locator('#project-name')).toHaveText('AtlasAX2');
  await page.locator('#mode-toggle button[data-mode="schedule"]').click();
  await expect(page.locator('#dash-title')).toHaveText('AtlasAX2 — Dashboard');
  await page.locator('#mode-toggle button[data-mode="journey"]').click();

  await page.locator('#project-name').click();
  await page.locator('#project-name-input').fill('AtlasAX1');
  await page.keyboard.press('Enter');
  await hardRefresh(page);
  await expect(page.locator('#project-name')).toHaveText('AtlasAX1');
});

test('kickoff, leader, contact and deliverable edits persist', async ({ page }) => {
  // kickoff moves the whole program
  await setKickoffDate(page, '2028-01-03');
  await expect.poll(() => tapeoutDate(page)).toBe('08/27/2029');
  await hardRefresh(page);
  await expect(page.locator('#rm-gantt .g-kickoff-date')).toHaveText('1/3');
  await expect.poll(() => tapeoutDate(page)).toBe('08/27/2029');

  // leader
  const panel = selectedPanel(page);
  await panel.locator('[data-leader-edit]').click();
  await panel.locator('.ie-l-name').fill('Dana Whitfield');
  await panel.locator('[data-leader-save]').click();
  await hardRefresh(page);
  await expect(selectedPanel(page).locator('.l-name')).toHaveText('Dana Whitfield');

  // contact
  await selectedPanel(page).locator('[data-c-add]').click();
  await page.locator('.c-row.editing .cf-name').fill('Rae Lindqvist');
  await page.locator('.c-row.editing .cf-role').fill('Program analytics');
  await page.locator('.c-row.editing [data-c-save]').click();
  await hardRefresh(page);
  const rows = selectedPanel(page).locator('.contacts-sec .c-row:not(.editing)');
  await expect(rows).toHaveCount(4);
  await expect(rows.last()).toContainText('Rae Lindqvist');

  // deliverable add
  await editDeliverables(page);
  await selectedPanel(page).locator('.dlv-input').fill('Cost model refresh');
  await selectedPanel(page).locator('.dlv-input-due').fill('2026-09-30');
  await selectedPanel(page).locator('[data-dlv-add]').click();
  await hardRefresh(page);
  const dlv = selectedPanel(page).locator('.dlv-list li');
  await expect(dlv).toHaveCount(7);
  await expect(dlv.last()).toContainText('Cost model refresh');
  await expect(dlv.last().locator('.dlv-due.read')).toHaveText('09/30/2026');

  // undo all of it
  await editDeliverables(page);
  await dlv.last().locator('[data-dlv-del]').click();
  await rows.last().locator('[data-c-del]').click();
  await selectedPanel(page).locator('[data-leader-edit]').click();
  await selectedPanel(page).locator('.ie-l-name').fill('Daniel Kim');
  await selectedPanel(page).locator('[data-leader-save]').click();
  await setKickoffDate(
    page,
    await page.evaluate(() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - 66 * 7);
      const p = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    }),
  );
  await hardRefresh(page);
  await expect(selectedPanel(page).locator('.l-name')).toHaveText('Daniel Kim');
  await expect(selectedPanel(page).locator('.dlv-list li')).toHaveCount(6);
  await expect(selectedPanel(page).locator('.contacts-sec .c-row')).toHaveCount(3);
});

test('display settings persist in localStorage, not the database', async ({ page }) => {
  await page.locator('#settings-btn').click();
  await page.locator('#set-font').fill('20');
  await expect(page.locator('body')).toHaveCSS('font-size', '20px');

  const stored = await page.evaluate(() => localStorage.getItem('atlaspm.display.v1'));
  expect(stored).toContain('20');

  await hardRefresh(page);
  await expect(page.locator('body')).toHaveCSS('font-size', '20px');

  await page.locator('#settings-btn').click();
  await page.locator('#set-reset').click();
  await expect(page.locator('body')).toHaveCSS('font-size', '15px');
  await hardRefresh(page);
  await expect(page.locator('body')).toHaveCSS('font-size', '15px');
});
