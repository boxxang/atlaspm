import { expect, test, type Page } from './fixtures';

/**
 * The 3DIC template, through the screens.
 *
 * It ships beside the SoC one: a template a programme can be started from,
 * read-only like the other built-in, carrying the stages a stacked-die
 * programme adds — and the daisy chain test vehicle among them, with the work
 * that proves the assembly before product silicon exists.
 */
const stagesLink = (page: Page) =>
  page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Stages/ });

const newProgram = async (page: Page, name: string, profileId: string) => {
  await page.goto('/');
  await page.locator('[data-new-project]').click();
  await page.locator('.pf-name').fill(name);
  await page.getByLabel('Template').selectOption(profileId);
  await page.locator('.pf-kickoff').fill('2027-03-01');
  await page.locator('[data-create]').click();
  await page.waitForURL(/\/p\/[^/]+\/overview$/);
  return page.url().split('/p/')[1].split('/')[0];
};

test.describe('the 3DIC template', () => {
  test('ships as a built-in, beside the SoC one, and is copy-only', async ({ page }) => {
    await page.goto('/templates');
    const dic = page.locator('[data-template="threeDic"]');
    await expect(dic).toBeVisible();
    await expect(dic).toContainText('Built-in');
    await expect(dic).toContainText('3DIC');
    /* 23 SoC stages and the 7 a stack adds */
    await expect(dic).toContainText('30');
    await expect(dic.locator('[data-duplicate]')).toHaveCount(1);
    await expect(dic.locator('[data-edit-template]')).toHaveCount(0);
    await expect(dic.locator('[data-tpl-ask]')).toHaveCount(0);

    /* the SoC template is untouched by its arrival */
    await expect(page.locator('[data-template="typicalSoC"]')).toContainText('23');
  });

  test('starts a programme that runs the stack stages as well as the SoC ones', async ({ page }) => {
    const id = await newProgram(page, 'AtlasStack1', 'threeDic');
    await expect(stagesLink(page)).toContainText('30');

    await page.goto(`/p/${id}/stages`);
    for (const key of ['physicalDesign', 'signoff', 'tapeout']) {
      await expect(page.locator(`[data-stage="${key}"]`), key).toBeVisible();
    }
    for (const key of ['chipletPartitioning', 'tsvHybridBond', 'd2dInterface', 'dctv', 'threeDIntegration', 'kgdSort', 'multiDieTest']) {
      await expect(page.locator(`[data-stage="${key}"]`), key).toBeVisible();
    }
  });

  test('develops and verifies the daisy chain test vehicle, activity by activity', async ({ page }) => {
    const id = await newProgram(page, 'AtlasStack2', 'threeDic');

    await page.goto(`/p/${id}/stage/dctv/activity`);
    const acts = page.locator('[data-act]');
    await expect(acts).toHaveCount(7);
    await expect(acts.first()).toContainText('DCTV Scope and Chain Topology');
    await expect(page.locator('[data-act="DCTV-05"]')).toContainText('Continuity');

    /* its steps are the work, and they open like any other activity's */
    await page.locator('[data-act="DCTV-05"]').click();
    const steps = page.locator('[data-step^="DCTV-05:"]');
    await expect(steps).toHaveCount(5);
    await expect(steps.first()).toContainText('continuity measurement');
  });

  test('leaves the SoC template able to start a programme of 23 stages', async ({ page }) => {
    await newProgram(page, 'AtlasSoc1', 'typicalSoC');
    await expect(stagesLink(page)).toContainText('23');
  });
});
