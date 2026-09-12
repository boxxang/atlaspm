import { expect, test, SHELL_PATH, type Page } from './fixtures';
import { detailActivityTitles } from '../../src/data/activityIndex';

/**
 * The Updates feed's row: what it says, and where each pill goes.
 *
 * The feed carries two kinds of row and they are not interchangeable. A post
 * was written on a step, so it names an activity and a step and the pills can
 * take you to both. A board update was filed against an entry on one of the
 * stage boards, so it names neither, and its own subject is the only thing
 * saying what it is about — which is why one kind loses its subject line and
 * the other keeps it.
 */

const UPDATES = `${SHELL_PATH}/updates`;

/** The first row written on a step, whichever the seed's schedule made it. */
const stepRow = (page: Page) =>
  page.locator('[data-update]').filter({ has: page.locator('[data-ref]') }).first();

const rail = (page: Page) => page.getByRole('complementary', { name: 'Details' });

test.describe('the updates feed', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(UPDATES);
    await expect(page.locator('[data-update]').first()).toBeVisible();
  });

  /* The reference and the step say what the post is about, and the write-up is
     one click away — so spelling the activity's name out under every row was
     the same sentence twice. */
  test('a post on a step shows its reference, not the activity name', async ({ page }) => {
    const row = stepRow(page);
    const ref = await row.locator('[data-ref]').innerText();
    const name = detailActivityTitles[ref];
    expect(name, `${ref} should be a written-up activity`).toBeTruthy();

    await expect(row.locator('[data-ref]')).toHaveText(ref);
    await expect(row).not.toContainText(name);
  });

  /* The stage's Activity tab, with the row open — not the write-up. The
     write-up is about the template; the work is on the stage. */
  test('the reference opens the activity on its stage', async ({ page }) => {
    const row = stepRow(page);
    const ref = await row.locator('[data-ref]').innerText();

    await row.locator('[data-ref]').click();
    await expect(page).toHaveURL(new RegExp(`/stage/[^/]+/activity\\?act=${ref}$`));
    /* open, not merely present: its steps are showing */
    await expect(page.locator(`[data-step^="${ref}:"]`).first()).toBeVisible();
    await expect(page.locator(`[data-act="${ref}"]`)).toHaveAttribute('aria-expanded', 'true');
  });

  /* Not the write-up: the step's own state and thread live on the stage's
     Activity tab, and that is what the post was written on. */
  test('the step pill opens that step, with its thread', async ({ page }) => {
    const row = page
      .locator('[data-update]')
      .filter({ has: page.locator('[data-step-link]') })
      .first();
    const target = await row.locator('[data-step-link]').getAttribute('data-step-link');
    expect(target).toMatch(/^[A-Z]+-\d+:\d+$/);

    await row.locator('[data-step-link]').click();
    await expect(page.locator(`[data-step="${target}"]`)).toBeVisible();
    await expect(rail(page)).toContainText(`Step ${target!.split(':')[1]} of`);
  });

  /* Opening the rail is not arriving. The step row is most of the way down a
     stage page, so a link that only selects it leaves the reader looking at the
     stage header wondering what happened. */
  test('the step pill scrolls the step into view, not just the stage', async ({ page }) => {
    const row = page
      .locator('[data-update]')
      .filter({ has: page.locator('[data-step-link]') })
      .first();
    const target = await row.locator('[data-step-link]').getAttribute('data-step-link');

    await row.locator('[data-step-link]').click();
    const step = page.locator(`[data-step="${target}"]`);
    await expect(step).toBeVisible();

    /* inside the viewport on arrival, with nobody having scrolled */
    const where = await step.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, h: window.innerHeight };
    });
    expect(where.top).toBeGreaterThanOrEqual(0);
    expect(where.bottom).toBeLessThanOrEqual(where.h);
  });

  test('the stage pill opens the stage', async ({ page }) => {
    const pill = page.locator('[data-update] [data-stage-pill]').first();
    const stageId = await pill.getAttribute('data-stage-pill');

    await pill.click();
    await expect(page).toHaveURL(new RegExp(`/stage/${stageId}/activity$`));
  });

  /* A board update has no activity to point at, so its own subject is all it
     has. It moves onto the name's line rather than being dropped. */
  test('a board update keeps its subject, on the name line', async ({ page }) => {
    const row = page
      .locator('[data-update]')
      .filter({ has: page.locator('[data-subject]') })
      .first();

    await expect(row.locator('[data-subject]')).not.toBeEmpty();
    await expect(row.locator('[data-ref]')).toHaveCount(0);
    await expect(row.locator('[data-step-link]')).toHaveCount(0);
  });
});

/* On the stage's own Updates tab every row is that stage's, so the pill is a
   label that never varies. */
test('the stage tab drops the stage pill', async ({ page }) => {
  await page.goto(UPDATES);
  const stageId = await page
    .locator('[data-update] [data-stage-pill]')
    .first()
    .getAttribute('data-stage-pill');

  await page.goto(`${SHELL_PATH}/stage/${stageId}/updates`);
  await expect(page.locator('[data-update]').first()).toBeVisible();
  await expect(page.locator('[data-update] [data-stage-pill]')).toHaveCount(0);
});
