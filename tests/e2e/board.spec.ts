import { expect, test, type Page } from '@playwright/test';

/**
 * The communication board — where the people on a program talk to each other.
 *
 * The two facts a post is useless without are what it is about and who raised
 * it, so both are checked on the row rather than only inside the window. The
 * window itself is the whole point of the tab: reading a thread, and having
 * edit, delete and reply behind that read rather than on a row somebody is
 * scanning past.
 */
const BOARD = '/p/atlasax1/stage/packaging/board';
const SUBJECT = 'E2E who signs off the interposer warpage limit';

const open = async (page: Page) => {
  await page.goto(BOARD);
  await expect(page.locator('[data-board]')).toBeVisible();
};

/* The board is shared state and an earlier run may have died mid-way. */
const sweep = async (page: Page) => {
  for (let i = 0; i < 6; i++) {
    const stray = page.locator('[data-item]').filter({ hasText: SUBJECT }).first();
    if (!(await stray.count())) return;
    await stray.click();
    await page.locator('[data-entry-ask]').click();
    await page.locator('[data-entry-delete]').click();
    await expect(page.locator('[data-post-window]')).toHaveCount(0);
  }
};

/** Opens the composer and posts a subject, optionally about one step. */
const post = async (page: Page, opts: { about?: string; step?: string } = {}) => {
  await page.locator('[data-add-entry]').first().click();
  await page.locator('[data-entry-title]').fill(SUBJECT);
  await page.locator('[data-entry-body]').fill('PTV says 180um, the OSAT quotes 150um.');
  if (opts.about) {
    await page.locator('[data-entry-activity]').selectOption(opts.about);
    if (opts.step) await page.locator('[data-entry-step]').selectOption(opts.step);
  }
  await page.locator('[data-entry-save]').click();
  await expect(page.locator('[data-item]').filter({ hasText: SUBJECT })).toHaveCount(1);
};

test.describe('the communication board', () => {
  test.beforeEach(async ({ page }) => {
    await open(page);
    await sweep(page);
  });
  test.afterEach(async ({ page }) => {
    await open(page);
    await sweep(page);
  });

  test('is the last tab, and says it is not in use yet', async ({ page }) => {
    await expect(page.locator('a.tab').last()).toContainText('Communication board (N/A)');
  });

  /* What it is about is the post's own claim, not a guess: it is chosen when
     the post is written and it survives the round trip. */
  test('a post names the step it is about, and who raised it', async ({ page }) => {
    await post(page, { about: 'ASSY-10', step: '7' });
    const row = page.locator('[data-item]').filter({ hasText: SUBJECT });
    await expect(row.locator('[data-about]')).toHaveAttribute('data-about', 'ASSY-10 · step 7');
    await expect(row.locator('[data-poster]')).toHaveAttribute('data-poster', /\S/);

    await open(page);
    await expect(
      page.locator('[data-item]').filter({ hasText: SUBJECT }).locator('[data-about]'),
    ).toHaveAttribute('data-about', 'ASSY-10 · step 7');
  });

  /* A post that belongs to the stage rather than to one piece of work says so
     rather than claiming a precision it does not have. */
  test('a post about nothing in particular reads as stage-wide', async ({ page }) => {
    await post(page);
    const row = page.locator('[data-item]').filter({ hasText: SUBJECT });
    await expect(row.locator('[data-about]')).toHaveText('Stage-wide');
  });

  test('opens as a window, and closes again', async ({ page }) => {
    await post(page);
    await page.locator('[data-item]').filter({ hasText: SUBJECT }).click();
    const win = page.locator('[data-post-window]');
    await expect(win).toBeVisible();
    await expect(win).toContainText(SUBJECT);
    await expect(win).toContainText('Posted by');
    await page.locator('[data-post-close]').click();
    await expect(win).toHaveCount(0);
  });

  test('takes a comment, and the count on the row follows it', async ({ page }) => {
    await post(page);
    const row = () => page.locator('[data-item]').filter({ hasText: SUBJECT });
    await row().click();
    await page.locator('[data-comment-box]').fill('OSAT number wins.');
    await page.locator('[data-comment-post]').click();
    await expect(page.locator('[data-comment]')).toHaveCount(1);
    await page.locator('[data-post-close]').click();
    await expect(row().locator('[data-comments]')).toHaveAttribute('data-comments', '1');

    await open(page);
    await expect(row().locator('[data-comments]')).toHaveAttribute('data-comments', '1');
  });

  test('edits and deletes a comment', async ({ page }) => {
    await post(page);
    await page.locator('[data-item]').filter({ hasText: SUBJECT }).click();
    await page.locator('[data-comment-box]').fill('First reading.');
    await page.locator('[data-comment-post]').click();
    await expect(page.locator('[data-comment]')).toHaveCount(1);

    await page.locator('[data-comment-edit-open]').click();
    await page.locator('[data-comment-edit]').fill('Second reading, agreed at the sync.');
    await page.locator('[data-comment-save]').click();
    await expect(page.locator('[data-comment]')).toContainText('Second reading');

    await page.locator('[data-comment-delete]').click();
    await expect(page.locator('[data-comment]')).toHaveCount(0);
  });

  /* Reading is the default and editing is a mode: a board is read far more
     often than it is written. */
  test('opens for reading, and edits only when asked', async ({ page }) => {
    await post(page);
    await page.locator('[data-item]').filter({ hasText: SUBJECT }).click();
    await expect(page.locator('[data-entry-title]')).toHaveCount(0);
    await page.locator('[data-entry-edit]').click();
    await page.locator('[data-entry-title]').fill(`${SUBJECT} settled`);
    await page.locator('[data-entry-save]').click();
    await expect(page.locator('[data-post-window]')).toContainText(`${SUBJECT} settled`);

    await open(page);
    await expect(page.locator('[data-item]').filter({ hasText: `${SUBJECT} settled` })).toHaveCount(1);
  });

  test('deletes only after asking, and the post stays gone', async ({ page }) => {
    await post(page);
    const before = await page.locator('[data-item]').count();
    await page.locator('[data-item]').filter({ hasText: SUBJECT }).click();
    await expect(page.locator('[data-entry-delete]')).toHaveCount(0);
    await page.locator('[data-entry-ask]').click();
    await page.locator('[data-entry-delete]').click();

    await expect(page.locator('[data-post-window]')).toHaveCount(0);
    await open(page);
    await expect(page.locator('[data-item]')).toHaveCount(before - 1);
    await expect(page.locator('[data-item]').filter({ hasText: SUBJECT })).toHaveCount(0);
  });

  test('filters by status and by who posted', async ({ page }) => {
    await post(page);
    const row = () => page.locator('[data-item]').filter({ hasText: SUBJECT });
    await row().locator('input[type=checkbox]').check();
    await expect(row().locator('input[type=checkbox]')).toBeChecked();

    await page.locator('[data-status-filter]').click();
    await page.locator('[data-status="open"]').click();
    await expect(row()).toHaveCount(0);

    await page.locator('[data-status-filter]').click();
    await page.locator('[data-status="done"]').click();
    await expect(row()).toHaveCount(1);

    await page.locator('[data-status-filter]').click();
    await page.locator('[data-status="all"]').click();
    await expect(page.locator('[data-poster-filter]')).toBeVisible();
  });
});
