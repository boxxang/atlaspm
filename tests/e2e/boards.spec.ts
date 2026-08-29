import { expect, test, SHELL_PATH, writesSettled } from './fixtures';

/**
 * The three cross-programme boards: Risks, Overdue and Activities.
 *
 * The first two read the same resolver the nav badge does, which is the point
 * of phase V2-5 — a risk is a flag on a step now, and overdue means a step, so
 * every screen that counts them has to be counting the same thing.
 */

/* The shell renders nothing until it has hydrated — "today" has to come from
   the browser's clock — so a one-shot read like count() or allInnerTexts() has
   to be told to wait for the table first. */
const openBoard = async (page: import('./fixtures').Page, path: string) => {
  await page.goto(path);
  await expect(page.locator('.pboard, .pview-todo')).toBeVisible();
};

test.describe('Risks', () => {
  test.beforeEach(async ({ page }) => {
    await openBoard(page, `${SHELL_PATH}/risks`);
  });

  test('lists what the seed flagged, and agrees with the nav', async ({ page }) => {
    const rows = page.locator('.pboard tbody tr');
    await expect(rows).toHaveCount(6);
    const badge = await page
      .getByRole('navigation', { name: 'Program' })
      .getByRole('link', { name: /^Risks/ })
      .locator('.pnav-n')
      .innerText();
    expect(Number(badge)).toBe(6);
  });

  test('each row says which step it is flagged on', async ({ page }) => {
    const first = page.locator('.pboard tbody tr').first();
    await expect(first.locator('.pref')).toHaveText(/^[A-Z]+-\d\d$/);
    /* and the reference goes to the stage that runs it */
    await expect(first.locator('.pref')).toHaveAttribute('href', /\/stage\/\w+\/activity$/);
  });

  test('a risk nobody has answered in a week reads Stale', async ({ page }) => {
    /* the seed raises each risk on the day its step went late, and some of
       those are months back */
    await expect(page.locator('.ppill.warn').first()).toHaveText('Stale');
  });

  test('the risk text is not truncated', async ({ page }) => {
    const text = await page.locator('.pboard tbody th[scope="row"]').first().innerText();
    expect(text.length).toBeGreaterThan(80);
  });

  test('there is no stage column, because the reference already says it', async ({ page }) => {
    const heads = await page.locator('.pboard thead th').allTextContents();
    expect(heads.map((h) => h.trim())).toEqual([
      'Activity',
      'Step',
      'Risk',
      'Status',
      'Quiet for',
      'Raised by',
    ]);
  });

  test('a risk drops off the moment its step is handed over', async ({ page }) => {
    const first = page.locator('.pboard tbody tr').first();
    const ref = await first.locator('.pref').innerText();
    const step = (await first.locator('td.num').first().innerText()).trim();
    const href = (await first.locator('.pref').getAttribute('href'))!;

    await page.goto(href);
    await expect(page.locator('tr.pact').first()).toBeVisible();
    await page.locator(`[data-act="${ref}"]`).click();
    await page.locator(`[data-step="${ref}:${step}"] input[type="checkbox"]`).check();
    await writesSettled(page);

    await openBoard(page, `${SHELL_PATH}/risks`);
    await expect(page.locator('.pboard tbody tr')).toHaveCount(5);
    /* the post is still in the thread — it stopped counting, it did not vanish */
    await expect(
      page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Risks/ }),
    ).toContainText('5');
  });
});

test.describe('Overdue', () => {
  test.beforeEach(async ({ page }) => {
    await openBoard(page, `${SHELL_PATH}/overdue`);
  });

  test('lists late steps, soonest due first, and agrees with the nav', async ({ page }) => {
    const rows = page.locator('.pboard tbody tr');
    const n = await rows.count();
    expect(n).toBeGreaterThan(0);
    const badge = await page
      .getByRole('navigation', { name: 'Program' })
      .getByRole('link', { name: /^Overdue/ })
      .locator('.pnav-n')
      .innerText();
    expect(Number(badge)).toBe(n);

    const dues = await page.locator('.pboard tbody td.num.late').allInnerTexts();
    const dates = dues.filter((t) => t.includes('/')).map((t) => new Date(t).getTime());
    expect([...dates].sort((a, b) => a - b)).toEqual(dates);
  });

  test('says Unassigned rather than leaving the owner blank', async ({ page }) => {
    await expect(page.locator('.pboard tbody .pmuted').first()).toHaveText('Unassigned');
  });

  test('counts steps only — a delayed deliverable is not on this list', async ({ page }) => {
    const heads = await page.locator('.pboard thead th').allTextContents();
    expect(heads.map((h) => h.trim())).toEqual([
      'Activity',
      'Step',
      'What’s late',
      'Status',
      'Due',
      'Late by',
      'Owner',
    ]);
    /* every row is a step: each carries a step number */
    for (const cell of await page.locator('.pboard tbody td.num').allInnerTexts()) {
      expect(cell.trim()).not.toBe('');
    }
  });

  test('a step handed over leaves the list', async ({ page }) => {
    const before = await page.locator('.pboard tbody tr').count();
    const first = page.locator('.pboard tbody tr').first();
    const target = (await first.getAttribute('data-overdue'))!;
    const [ref, step] = target.split(':');
    await page.goto((await first.locator('.pref').getAttribute('href'))!);
    await expect(page.locator('tr.pact').first()).toBeVisible();
    await page.locator(`[data-act="${ref}"]`).click();
    await page.locator(`[data-step="${ref}:${step}"] input[type="checkbox"]`).check();
    await writesSettled(page);

    await openBoard(page, `${SHELL_PATH}/overdue`);
    await expect(page.locator('.pboard tbody tr')).toHaveCount(before - 1);
  });
});

test.describe('Activities', () => {
  test.beforeEach(async ({ page }) => {
    await openBoard(page, `${SHELL_PATH}/activities`);
  });

  test('lists all of them, grouped by the stage that runs them', async ({ page }) => {
    await expect(page.locator('.pboard tbody tr[data-activity]')).toHaveCount(257);
    await expect(page.locator('.ptable-group')).toHaveCount(23);
  });

  test('a stage heading opens that stage, and a reference opens the write-up', async ({
    page,
  }) => {
    await expect(page.locator('.ptable-group').first().getByRole('link')).toHaveAttribute(
      'href',
      /\/stage\/\w+\/activity$/,
    );
    await expect(page.locator('[data-activity="DEF-01"] .pref')).toHaveAttribute(
      'href',
      /\/activity\/DEF-01$/,
    );
  });

  test('a finished activity reads as finished, and a stalled one shows its late steps', async ({
    page,
  }) => {
    /* Product Definition closed long ago: every one of its activities is done */
    await expect(page.locator('[data-activity="DEF-01"] .pdone')).toHaveClass(/all/);
    /* and somewhere on the programme there is a late count */
    expect(await page.locator('.pboard tbody .late').count()).toBeGreaterThan(0);
  });
});
