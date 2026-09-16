import { expect, test, SEED_PROJECT_ID, type Page } from './fixtures';

/**
 * Editing a program after it exists: its name, when it starts, and the plan it
 * runs — stages, the activities in them, and the steps in those.
 *
 * A program's plan is its own. Editing it never touches the template it was
 * made from, nor any other program, which is the blueprint rule the creation
 * flow already keeps. And nothing reschedules itself: adding or removing a
 * stage leaves every other date where it was, because the dates are what the
 * reader typed.
 */
const open = async (page: Page, name: string) => {
  await page.goto('/');
  await expect(page.locator('[data-program]').first()).toBeVisible();
  const row = page.locator('[data-program]').filter({ hasText: name });
  await row.locator('[data-edit-program]').click();
  const dlg = page.locator('[data-edit-program-dialog]');
  await expect(dlg).toBeVisible();
  return dlg;
};

const stagesOf = (page: Page) =>
  page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Stages/ });

test.describe('editing a program', () => {
  test('the pencil opens it on its name, its kickoff and its stages', async ({ page }) => {
    const dlg = await open(page, 'AtlasAX1');
    await expect(dlg.getByLabel('Program name')).toHaveValue('AtlasAX1');
    await expect(dlg.getByLabel('Kickoff')).not.toHaveValue('');
    await expect(dlg.locator('[data-stage-row]')).toHaveCount(23);
    /* the pencil does not open the program */
    await expect(page).toHaveURL('/');
  });

  test('renames it and moves its kickoff, and both survive a reload', async ({ page }) => {
    const dlg = await open(page, 'AtlasAX1');
    await dlg.getByLabel('Program name').fill('AtlasAX1 Rev B');
    await dlg.getByLabel('Kickoff').fill('2025-07-07');
    await dlg.locator('[data-save-program]').click();
    await expect(dlg).toHaveCount(0);

    const row = page.locator('[data-program]').filter({ hasText: 'AtlasAX1 Rev B' });
    await expect(row).toContainText('kickoff 07/07/2025');
    await page.reload();
    await expect(page.locator('[data-program]').filter({ hasText: 'AtlasAX1 Rev B' })).toBeVisible();
  });

  test('adds a stage, and no other stage moves', async ({ page }) => {
    const dlg = await open(page, 'AtlasAX1');
    const before = await dlg.locator('[data-stage-row="signoff"] [data-stage-start]').inputValue();
    await dlg.locator('[data-add-stage]').click();
    await expect(dlg.locator('[data-stage-row]')).toHaveCount(24);
    /* the stage that was already there keeps its dates */
    expect(await dlg.locator('[data-stage-row="signoff"] [data-stage-start]').inputValue()).toBe(before);
    await dlg.locator('[data-save-program]').click();
    await expect(dlg).toHaveCount(0);

    await page.goto(`/p/${SEED_PROJECT_ID}/stages`);
    await expect(stagesOf(page)).toContainText('24');
  });

  /* Every built-in stage closes on a checkpoint, and a checkpoint cannot be
     left homeless — so the refusal belongs on the button, not on the save. */
  test('refuses to remove a stage that carries a checkpoint, and says which', async ({ page }) => {
    const dlg = await open(page, 'AtlasAX1');
    await dlg.locator('[data-stage-row="physicalDesign"] [data-del-stage]').click();
    await expect(dlg.locator('.err')).toContainText('PD Database Handoff');
    await expect(dlg.locator('[data-stage-usage]')).toHaveCount(0);
    await expect(dlg.locator('[data-stage-row="physicalDesign"]')).toBeVisible();
  });

  test('removes a stage it added, after asking, and the program keeps the rest', async ({ page }) => {
    let dlg = await open(page, 'AtlasAX1');
    await dlg.locator('[data-add-stage]').click();
    const added = (await dlg.locator('[data-stage-row]').last().getAttribute('data-stage-row'))!;
    await dlg.locator(`[data-stage-row="${added}"] [data-stage-title]`).fill('Split MTO window');
    await dlg.locator('[data-save-program]').click();
    await expect(dlg).toHaveCount(0);

    dlg = await open(page, 'AtlasAX1');
    await expect(dlg.locator('[data-stage-row]')).toHaveCount(24);
    await dlg.locator(`[data-stage-row="${added}"] [data-del-stage]`).click();
    const usage = dlg.locator('[data-stage-usage]');
    await expect(usage).toContainText('Split MTO window');
    /* nothing has been recorded on a stage added a moment ago */
    await expect(usage).toContainText('Nothing is recorded on it yet');
    await usage.locator('[data-confirm-del-stage]').click();
    await expect(dlg.locator(`[data-stage-row="${added}"]`)).toHaveCount(0);
    await dlg.locator('[data-save-program]').click();
    await expect(dlg).toHaveCount(0);

    await page.goto(`/p/${SEED_PROJECT_ID}/stages`);
    await expect(stagesOf(page)).toContainText('23');
  });

  test('adds an activity and a step to a stage of this program alone', async ({ page }) => {
    const dlg = await open(page, 'AtlasAX1');
    await dlg.locator('[data-stage-row="signoff"] [data-edit-activities]').click();
    const acts = page.locator('[data-act-dialog]');
    await expect(acts.locator('[data-activity-row]')).toHaveCount(12);

    await acts.locator('[data-add-activity]').click();
    const added = acts.locator('[data-activity-row]').last();
    await added.locator('[data-act-title]').fill('Split MTO readiness check');
    await added.locator('[data-edit-steps]').click();
    await acts.locator('[data-add-step]').click();
    await acts.locator('[data-step-row]').last().locator('[data-step-text]').fill('Confirm the FEOL layer list');
    await acts.locator('[data-save-activities]').click();
    await expect(acts).toHaveCount(0);
    await dlg.locator('[data-save-program]').click();
    await expect(dlg).toHaveCount(0);

    await page.goto(`/p/${SEED_PROJECT_ID}/stage/signoff/activity`);
    await expect(page.locator('[data-act]')).toHaveCount(13);
    await expect(
      page.locator('[data-act]').filter({ hasText: 'Split MTO readiness check' }),
    ).toHaveCount(1);
  });

  test('leaves the template it was made from, and every other program, alone', async ({ page }) => {
    /* a second program on the same built-in template */
    await page.goto('/');
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('AtlasUntouched');
    await page.locator('.pf-kickoff').fill('2027-03-01');
    await page.locator('[data-create]').click();
    await page.waitForURL(/\/p\/atlasuntouched-[^/]*\/overview$/);
    const other = page.url().split('/p/')[1].split('/')[0];

    const dlg = await open(page, 'AtlasAX1');
    await dlg.locator('[data-add-stage]').click();
    await dlg.locator('[data-save-program]').click();
    await expect(dlg).toHaveCount(0);

    await page.goto(`/p/${other}/stages`);
    await expect(stagesOf(page)).toContainText('23');
    await page.goto('/templates');
    await expect(page.locator('[data-template]').filter({ hasText: 'Typical SoC' }).first()).toContainText('23');
  });
});
