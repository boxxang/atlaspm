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
  const write = async (page: import('./fixtures').Page, title: string, body?: string) => {
    await page.getByRole('button', { name: 'New note' }).click();
    await page.getByLabel('Note title').fill(title);
    if (body) await page.getByLabel('Note', { exact: true }).fill(body);
    await page.getByRole('button', { name: 'Save note' }).click();
  };

  test.beforeEach(async ({ page }) => {
    await page.goto(`${STAGE}/keyinfo`);
    await expect(page.getByRole('button', { name: 'New note' })).toBeVisible();
  });

  test('starts empty, and says so', async ({ page }) => {
    await expect(page.getByText('Nothing recorded yet.')).toBeVisible();
  });

  test('a note is written, counted on the tab, and survives a reload', async ({ page }) => {
    await write(page, 'PDK 2.1 decks land in March.');
    await expect(page.locator('[data-note]')).toContainText('PDK 2.1 decks land in March.');
    await expect(page.getByRole('link', { name: /^Key info/ })).toContainText('1');
    await writesSettled(page);

    await page.reload();
    await expect(page.locator('[data-note]')).toContainText('PDK 2.1 decks land in March.');
  });

  /* The title is what the list shows and the filter searches; the body is what
     the note is actually for, and opens under the row. */
  test('a note carries a body, and the filter finds it by either', async ({ page }) => {
    /* saving opens what you just wrote, as the mockup does */
    await write(page, 'Foundry answer on the deep trench', 'They will not qualify it before Q3.');
    await expect(page.locator('.notecard')).toContainText('They will not qualify it before Q3.');

    await page.getByLabel('Filter these notes').fill('deep trench');
    await expect(page.locator('[data-note]')).toHaveCount(1);
    await page.getByLabel('Filter these notes').fill('qualify it before');
    await expect(page.locator('[data-note]')).toHaveCount(1);
    await page.getByLabel('Filter these notes').fill('nothing says this');
    await expect(page.locator('[data-note]')).toHaveCount(0);
    await expect(page.getByText('No note here says that.')).toBeVisible();
  });

  test('a note is edited in place, and says it was edited', async ({ page }) => {
    await write(page, 'First wording.');
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Note title').fill('Second wording.');
    await page.getByRole('button', { name: 'Save note' }).click();
    await expect(page.locator('[data-note]')).toContainText('Second wording.');
    await expect(page.locator('.notecard-hd')).toContainText('edited');
    await writesSettled(page);

    await page.reload();
    await expect(page.locator('[data-note]')).toContainText('Second wording.');
  });

  test('a note is deleted, and stays deleted', async ({ page }) => {
    await write(page, 'Delete me.');
    await expect(page.locator('[data-note]')).toHaveCount(1);
    await page.locator('.notecard-hd').getByRole('button', { name: 'Delete' }).click();
    /* Delete asks before it throws anything away */
    await page.locator('.delconf').getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('[data-note]')).toHaveCount(0);
    await writesSettled(page);

    await page.reload();
    await expect(page.getByText('Nothing recorded yet.')).toBeVisible();
  });

  test('a note belongs to its own stage', async ({ page }) => {
    await write(page, 'Physical Design only.');
    await writesSettled(page);

    await page.goto(`${SHELL_PATH}/stage/signoff/keyinfo`);
    await expect(page.getByText('Nothing recorded yet.')).toBeVisible();
  });
});

test.describe('posting on a step', () => {
  test('an update lands on that step and nowhere else', async ({ page }) => {
    await openStep(page, 'PD-10', 2);
    await rail(page).getByLabel('What happened on step 2…').fill('Waiting on the spacing study.');
    await rail(page).getByRole('button', { name: 'Post' }).click();
    await expect(rail(page).locator('.txt')).toHaveText('Waiting on the spacing study.');
    await writesSettled(page);

    /* the step next door has its own thread */
    await page.locator('[data-step="PD-10:3"]').click();
    await expect(rail(page)).toContainText('No updates on this step yet.');
  });

  test('ticking risk makes it a risk, and the boards pick it up', async ({ page }) => {
    await openStep(page, 'PD-08', 5);
    await rail(page).getByLabel('What happened on step 5…').fill('Antenna fixes need another routing turn.');
    await rail(page).getByRole('checkbox', { name: 'risk' }).check();
    await rail(page).getByRole('button', { name: 'Post' }).click();
    /* the rail already carries risk-coloured pills for an overdue step, so
       this asks for the one on the post */
    await expect(rail(page).locator('.post .pill.risk')).toHaveText('RISK');
    await writesSettled(page);

    /* the nav badge, the stage tab and the board all agree */
    await expect(
      page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Risks/ }),
    ).toContainText('7');
    await page.goto(`${SHELL_PATH}/risks`);
    await expect(page.locator('[data-row]')).toHaveCount(7);
    await expect(page.locator('[data-board]')).toContainText('Antenna fixes need another routing turn.');
  });

  test('a reply sits under the post it answers, and goes with it', async ({ page }) => {
    await openStep(page, 'PD-10', 2);
    await rail(page).getByLabel('What happened on step 2…').fill('The parent.');
    await rail(page).getByRole('button', { name: 'Post' }).click();
    await rail(page).getByRole('button', { name: 'Reply' }).click();
    await rail(page).getByLabel('Reply — what moved, and what closed it…').fill('The answer.');
    await rail(page).locator('.reply .composer').getByRole('button', { name: 'Reply' }).click();

    await expect(rail(page).locator('.replies .txt')).toHaveText('The answer.');
    await writesSettled(page);
    await page.reload();
    await openStep(page, 'PD-10', 2);
    await expect(rail(page).locator('.replies .txt')).toHaveText('The answer.');

    /* deleting the parent takes the thread — a reply to nothing is not a post */
    await rail(page)
      .locator('.thread > .post > div > .who')
      .getByRole('button', { name: 'Delete' })
      .click();
    await rail(page).locator('.delconf').getByRole('button', { name: 'Delete' }).click();
    await expect(rail(page).locator('.post')).toHaveCount(0);
    await writesSettled(page);
    await page.reload();
    await openStep(page, 'PD-10', 2);
    await expect(rail(page).locator('.post')).toHaveCount(0);
  });

  test('a risk raised here closes when its step is handed over', async ({ page }) => {
    await openStep(page, 'PD-08', 5);
    await rail(page).getByLabel('What happened on step 5…').fill('Blocked on the DRC deck.');
    await rail(page).getByRole('checkbox', { name: 'risk' }).check();
    await rail(page).getByRole('button', { name: 'Post' }).click();
    await writesSettled(page);

    await page.locator('[data-step="PD-08:5"]').getByRole('checkbox').check();
    await writesSettled(page);
    await expect(
      page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Risks/ }),
    ).toContainText('6');

    /* it stopped counting; it did not vanish from the thread. The step is still
       selected — clicking it again would toggle the selection off. */
    await expect(rail(page).locator('.txt')).toHaveText('Blocked on the DRC deck.');
    /* and it says so: the flag is kept and marked cleared, not deleted */
    await expect(rail(page).locator('.post .pill')).toContainText('RISK · CLEARED');
  });
});
