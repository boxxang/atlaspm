import { expect, test, SHELL_PATH, writesSettled } from './fixtures';

/**
 * Posting: on a step, on a stage's key-info board, and as a reply.
 *
 * One shape in four places, so these check the shape once and then check that
 * each place lands it on the right target — a note on the stage, an update on
 * the step, a risk that the Risks board picks up.
 */

const STAGE = `${SHELL_PATH}/stage/physicalDesign`;

const openStep = async (page: import('./fixtures').Page, ref: string, n: number) => {
  await page.goto(`${STAGE}/activity`);
  await expect(page.locator('[data-act]').first()).toBeVisible();
  await page.locator(`[data-act="${ref}"]`).click();
  await page.locator(`[data-step="${ref}:${n}"]`).click();
};

const rail = (page: import('./fixtures').Page) =>
  page.getByRole('complementary', { name: 'Details' });

test.describe('key info', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${STAGE}/keyinfo`);
    await expect(page.locator('.composer')).toBeVisible();
  });

  test('starts empty, and says so', async ({ page }) => {
    await expect(page.getByText('Nothing written down for this stage yet.')).toBeVisible();
  });

  test('a note is written, counted on the tab, and survives a reload', async ({ page }) => {
    await page.getByLabel('Something worth finding again…').fill('PDK 2.1 decks land in March.');
    await page.getByRole('button', { name: 'Post' }).click();
    await expect(page.locator('.post-text')).toHaveText('PDK 2.1 decks land in March.');
    await expect(page.getByRole('link', { name: /^Key info/ })).toContainText('1');
    await writesSettled(page);

    await page.reload();
    await expect(page.locator('.post-text')).toHaveText('PDK 2.1 decks land in March.');
  });

  test('a note is edited in place, and says it was edited', async ({ page }) => {
    await page.getByLabel('Something worth finding again…').fill('First wording.');
    await page.getByRole('button', { name: 'Post' }).click();
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Edit post').fill('Second wording.');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.post-text')).toHaveText('Second wording.');
    await expect(page.locator('.post-head')).toContainText('edited');
    await writesSettled(page);

    await page.reload();
    await expect(page.locator('.post-text')).toHaveText('Second wording.');
  });

  test('a note is deleted, and stays deleted', async ({ page }) => {
    await page.getByLabel('Something worth finding again…').fill('Delete me.');
    await page.getByRole('button', { name: 'Post' }).click();
    await expect(page.locator('.post')).toHaveCount(1);
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.post')).toHaveCount(0);
    await writesSettled(page);

    await page.reload();
    await expect(page.getByText('Nothing written down for this stage yet.')).toBeVisible();
  });

  test('a reply sits under the post it answers, and goes with it', async ({ page }) => {
    await page.getByLabel('Something worth finding again…').fill('The parent.');
    await page.getByRole('button', { name: 'Post' }).click();
    await page.getByLabel('Reply…').fill('The answer.');
    await page.locator('.composer.small').getByRole('button', { name: 'Post' }).click();

    await expect(page.locator('.replies .post-text')).toHaveText('The answer.');
    await writesSettled(page);
    await page.reload();
    await expect(page.locator('.replies .post-text')).toHaveText('The answer.');

    /* deleting the parent takes the thread — a reply to nothing is not a post */
    await page.locator('.posts > li > .post').getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.post')).toHaveCount(0);
    await writesSettled(page);
    await page.reload();
    await expect(page.locator('.post')).toHaveCount(0);
  });

  test('a note belongs to its own stage', async ({ page }) => {
    await page.getByLabel('Something worth finding again…').fill('Physical Design only.');
    await page.getByRole('button', { name: 'Post' }).click();
    await writesSettled(page);

    await page.goto(`${SHELL_PATH}/stage/signoff/keyinfo`);
    await expect(page.getByText('Nothing written down for this stage yet.')).toBeVisible();
  });
});

test.describe('posting on a step', () => {
  test('an update lands on that step and nowhere else', async ({ page }) => {
    await openStep(page, 'PD-10', 2);
    await rail(page).getByLabel('What happened on step 2?').fill('Waiting on the spacing study.');
    await rail(page).getByRole('button', { name: 'Post' }).click();
    await expect(rail(page).locator('.post-text')).toHaveText('Waiting on the spacing study.');
    await writesSettled(page);

    /* the step next door has its own thread */
    await page.locator('[data-step="PD-10:3"]').click();
    await expect(rail(page)).toContainText('No updates on this step yet.');
  });

  test('ticking risk makes it a risk, and the boards pick it up', async ({ page }) => {
    await openStep(page, 'PD-08', 5);
    await rail(page).getByLabel('What happened on step 5?').fill('Antenna fixes need another routing turn.');
    await rail(page).getByRole('checkbox', { name: 'risk' }).check();
    await rail(page).getByRole('button', { name: 'Post' }).click();
    /* the rail already carries risk-coloured pills for an overdue step, so
       this asks for the one on the post */
    await expect(rail(page).locator('.post .pill.risk')).toHaveText('Risk');
    await writesSettled(page);

    /* the nav badge, the stage tab and the board all agree */
    await expect(
      page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Risks/ }),
    ).toContainText('7');
    await page.goto(`${SHELL_PATH}/risks`);
    await expect(page.locator('[data-board] tbody tr')).toHaveCount(7);
    await expect(page.locator('[data-board]')).toContainText('Antenna fixes need another routing turn.');
  });

  test('a risk raised here closes when its step is handed over', async ({ page }) => {
    await openStep(page, 'PD-08', 5);
    await rail(page).getByLabel('What happened on step 5?').fill('Blocked on the DRC deck.');
    await rail(page).getByRole('checkbox', { name: 'risk' }).check();
    await rail(page).getByRole('button', { name: 'Post' }).click();
    await writesSettled(page);

    await page.locator('[data-step="PD-08:5"] input[type="checkbox"]').check();
    await writesSettled(page);
    await expect(
      page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Risks/ }),
    ).toContainText('6');

    /* it stopped counting; it did not vanish from the thread. The step is still
       selected — clicking it again would toggle the selection off. */
    await expect(rail(page).locator('.post-text')).toHaveText('Blocked on the DRC deck.');
    await expect(rail(page).locator('.post .pill.risk')).toHaveText('Risk');
  });
});
