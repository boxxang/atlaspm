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

  test('the reference opens the write-up', async ({ page }) => {
    const row = stepRow(page);
    const ref = await row.locator('[data-ref]').innerText();

    await row.locator('[data-ref]').click();
    await expect(page).toHaveURL(new RegExp(`/activity/${ref}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(detailActivityTitles[ref]);
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
