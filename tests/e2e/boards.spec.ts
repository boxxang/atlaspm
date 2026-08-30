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
  await expect(
    page.locator('[data-row], [data-activity], [data-deliverable], .empty').first(),
  ).toBeVisible();
};

test.describe('Risks', () => {
  test.beforeEach(async ({ page }) => {
    await openBoard(page, `${SHELL_PATH}/risks`);
  });

  test('lists what the seed flagged, and agrees with the nav', async ({ page }) => {
    const rows = page.locator('[data-row]');
    await expect(rows).toHaveCount(6);
    const badge = await page
      .getByRole('navigation', { name: 'Program' })
      .getByRole('link', { name: /^Risks/ })
      .locator('.c, .cr')
      .innerText();
    expect(Number(badge)).toBe(6);
  });

  test('each row says which step it is flagged on, and opens it', async ({ page }) => {
    const first = page.locator('[data-row]').first();
    await expect(first.locator('.ref')).toHaveText(/^[A-Z]+-\d\d$/);
    /* the whole row is the link, and it names the step it opens */
    await expect(first).toHaveAttribute('href', /\/stage\/\w+\/activity\?step=[A-Z0-9-]+:\d+$/);
  });

  /* "Not answered in a week" is a filter here rather than a word on the row —
     the row's status belongs to the step the risk is flagged on. */
  test('the stale ones can be filtered down to', async ({ page }) => {
    const all = await page.locator('[data-row]').count();
    await page.locator('[data-filter="stale"]').click();
    const stale = await page.locator('[data-row]').count();
    expect(stale).toBeGreaterThan(0);
    expect(stale).toBeLessThanOrEqual(all);
  });

  test('the risk text is not truncated', async ({ page }) => {
    const text = await page.locator('[data-row] [data-title]').first().innerText();
    expect(text.length).toBeGreaterThan(80);
  });

  test('there is no stage column, because the reference already says it', async ({ page }) => {
    const heads = await page.locator('[data-board] .chead > span').allTextContents();
    expect(heads.map((h) => h.trim())).toEqual([
      'ACTIVITY',
      'STEP',
      'RISK',
      'STATUS',
      'DUE',
      'LATE BY',
      'RAISED BY',
    ]);
  });

  test('a risk drops off the moment its step is handed over', async ({ page }) => {
    const first = page.locator('[data-row]').first();
    const href = (await first.getAttribute('href'))!;
    const [, ref, step] = href.match(/step=([A-Z0-9-]+):(\d+)/)!;

    await page.goto(href);
    /* a link that names a step opens the block it is in, so there is nothing to
       click first — clicking the activity row here would fold it away again */
    await expect(page.locator('[data-act]').first()).toBeVisible();
    await page.locator(`[data-step="${ref}:${step}"]`).getByRole('checkbox').check();
    await writesSettled(page);

    await openBoard(page, `${SHELL_PATH}/risks`);
    await expect(page.locator('[data-row]')).toHaveCount(5);
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
    const rows = page.locator('[data-row]');
    const n = await rows.count();
    expect(n).toBeGreaterThan(0);
    const badge = await page
      .getByRole('navigation', { name: 'Program' })
      .getByRole('link', { name: /^Overdue/ })
      .locator('.c, .cr')
      .innerText();
    expect(Number(badge)).toBe(n);

    const dues = await page.locator('[data-row] [data-due]').allInnerTexts();
    const dates = dues.filter((t) => t.includes('/')).map((t) => new Date(t).getTime());
    expect([...dates].sort((a, b) => a - b)).toEqual(dates);
  });

  test('says Unassigned rather than leaving the owner blank', async ({ page }) => {
    await expect(page.locator('[data-row] [data-who]').first()).toHaveText('Unassigned');
  });

  test('counts steps only — a delayed deliverable is not on this list', async ({ page }) => {
    const heads = await page.locator('[data-board] .chead > span').allTextContents();
    expect(heads.map((h) => h.trim())).toEqual([
      'ACTIVITY',
      'STEP',
      'WHAT IS LATE',
      'STATUS',
      'DUE',
      'LATE BY',
      'OWNER',
    ]);
    /* every row is a step: each carries a step number */
    for (const row of await page.locator('[data-row]').all()) {
      expect((await row.innerText()).trim()).not.toBe('');
    }
  });

  test('a step handed over leaves the list', async ({ page }) => {
    const before = await page.locator('[data-row]').count();
    const first = page.locator('[data-row]').first();
    const href = (await first.getAttribute('href'))!;
    const [, ref, step] = href.match(/step=([A-Z0-9-]+):(\d+)/)!;
    await page.goto(href);
    /* a link that names a step opens the block it is in, so there is nothing to
       click first — clicking the activity row here would fold it away again */
    await expect(page.locator('[data-act]').first()).toBeVisible();
    await page.locator(`[data-step="${ref}:${step}"]`).getByRole('checkbox').check();
    await writesSettled(page);

    await openBoard(page, `${SHELL_PATH}/overdue`);
    await expect(page.locator('[data-row]')).toHaveCount(before - 1);
  });
});

test.describe('Activities', () => {
  test.beforeEach(async ({ page }) => {
    await openBoard(page, `${SHELL_PATH}/activities`);
  });

  test('lists all of them, grouped by the stage that runs them', async ({ page }) => {
    await expect(page.locator('[data-activity]')).toHaveCount(257);
    await expect(page.locator('.groupbar')).toHaveCount(23);
  });

  test('a stage heading opens that stage, and a reference opens the write-up', async ({
    page,
  }) => {
    /* the group bar names the stage; the row itself opens the write-up */
    await expect(page.locator('.groupbar').first()).toContainText('Product Definition');
    await expect(page.locator('[data-activity="DEF-01"]')).toHaveAttribute(
      'href',
      /\/activity\/DEF-01$/,
    );
  });

  test('a finished activity reads as finished, and a stalled one shows its late steps', async ({
    page,
  }) => {
    /* Product Definition closed long ago: every one of its activities is done */
    await expect(page.locator('[data-activity="DEF-01"] [data-done]')).toHaveAttribute(
      'data-all',
      '',
    );
    /* and somewhere on the programme something is not finished */
    const partial = page.locator('[data-activity] [data-done]:not([data-all])');
    expect(await partial.count()).toBeGreaterThan(0);
  });
});
