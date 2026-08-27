import { expect, test, SEED_PROJECT_PATH, settleLayout } from './fixtures';

/**
 * The dashboard says eight activities are overdue. The next question is which
 * of them is holding the programme up, and this panel answers it: an activity
 * whose Key Deliverable is late, ranked by how much downstream work has not
 * been able to start.
 */
const panel = '#bottlenecks';

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await settleLayout(page);
  await page.locator('#mode-toggle button[data-mode="schedule"]').click();
  await expect(page.locator(panel)).toBeVisible();
});

test('the heaviest blockage is read first', async ({ page }) => {
  const rows = page.locator(`${panel} .bn`);
  await expect(rows.first()).toBeVisible();

  const mm = await page
    .locator(`${panel} .bn-mm`)
    .evaluateAll((els) => els.map((e) => parseInt(e.textContent ?? '0', 10)));
  expect(mm.length).toBeGreaterThan(1);
  /* the size of what is stuck leads, so the column only ever falls */
  expect([...mm].sort((a, b) => b - a)).toEqual(mm);
});

test('the summary counts work held by two bottlenecks once', async ({ page }) => {
  const summary = await page.locator('[data-bn-summary]').textContent();
  const held = Number(summary?.match(/^(\d+) activities/)?.[1]);
  const perRow = await page
    .locator(`${panel} .bn-n`)
    .evaluateAll((els) => els.map((e) => parseInt(e.textContent ?? '0', 10)));
  /* rows overlap — three late Synthesis activities hold much of the same work */
  expect(held).toBeGreaterThan(0);
  expect(held).toBeLessThan(perRow.reduce((a, b) => a + b, 0));
});

test('a row opens the write-up at the reference it prints', async ({ page }) => {
  const first = page.locator(`${panel} .bn`).first();
  const id = (await first.getAttribute('data-bn'))!;
  expect(id).toMatch(/^[A-Z]+-\d{2}$/);
  await first.locator('.bn-id').click();
  await page.waitForURL(new RegExp(`/activity/${id}$`));
  await expect(page.locator(`[data-activity="${id}"]`)).toBeVisible();
});

test('opening a row shows what waits, grouped by the stage it waits in', async ({ page }) => {
  const first = page.locator(`${panel} .bn`).first();
  await expect(first.locator('.bn-chip')).toHaveCount(0);
  await first.locator('.bn-more').click();

  await expect(first.locator('.bn-why')).toContainText(/was due \d{2}\/\d{2}\/\d{4}/);
  const stages = await first.locator('.bn-stage').count();
  expect(stages).toBeGreaterThan(1);
  const chips = await first.locator('.bn-chip').count();
  expect(chips).toBeGreaterThan(stages);

  /* work already under way is shown but marked, because unblocking this
     activity does not release it */
  await expect(first.locator('.bn-chip.started').first()).toBeVisible();

  await first.locator('.bn-more').click();
  await expect(first.locator('.bn-chip')).toHaveCount(0);
});
