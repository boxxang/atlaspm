import { expect, test, type Page } from './fixtures';

/**
 * The CPO Network Switch System template, through the screens.
 *
 * A fourth built-in: a co-packaged-optics switch staged by lifecycle, each
 * stage closing on a gate every workstream reaches together, with the
 * components running as parallel activities inside the stages.
 */
const stagesLink = (page: Page) =>
  page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Stages/ });

const newProgram = async (page: Page, name: string) => {
  await page.goto('/');
  await page.locator('[data-new-project]').click();
  await page.locator('.pf-name').fill(name);
  await page.getByLabel('Template').selectOption('cpoSwitch');
  await page.locator('.pf-kickoff').fill('2027-01-04');
  await page.locator('[data-create]').click();
  await page.waitForURL(/\/p\/[^/]+\/overview$/);
  return page.url().split('/p/')[1].split('/')[0];
};

test.describe('the CPO Network Switch System template', () => {
  test('ships as a fourth built-in, copy-only, beside the other three', async ({ page }) => {
    await page.goto('/templates');
    const cpo = page.locator('[data-template="cpoSwitch"]');
    await expect(cpo).toBeVisible();
    await expect(cpo).toContainText('CPO Network Switch System');
    await expect(cpo).toContainText('Built-in');
    await expect(cpo).toContainText('27');
    await expect(cpo.locator('[data-edit-template]')).toHaveCount(0);
    await expect(cpo.locator('[data-flowchart="cpoSwitch"]')).toBeVisible();
    for (const id of ['typicalSoC', 'threeDic', 'embeddedSoc']) await expect(page.locator(`[data-template="${id}"]`)).toBeVisible();
  });

  test('starts a program staged by lifecycle, with the gates it is held to', async ({ page }) => {
    const id = await newProgram(page, 'SwitchOne');
    await expect(stagesLink(page)).toContainText('27');

    await page.goto(`/p/${id}/stages`);
    for (const key of [
      'cpoConcept',
      'cpoArchitecture',
      'cpoInterfaces',
      'cpoProgramControl',
      'cpoDesign',
      'cpoPresilicon',
      'cpoTapeout',
      'cpoAssembly',
      'cpoOpticalBringup',
      'cpoQualification',
      'cpoRamp',
      'cpoSustaining',
    ]) {
      await expect(page.locator(`[data-stage="${key}"]`), key).toBeVisible();
    }

    /* the countdowns read this template's tapeout, first silicon and production release */
    await page.goto(`/p/${id}/timeline`);
    for (const gate of ['Interface Freeze', 'Tapeout — All Dies', 'First Silicon', 'First Optical Link', 'Production Release']) {
      await expect(page.getByText(gate).first(), gate).toBeVisible();
    }
  });

  test('runs every workstream as a parallel activity inside a stage, with steps and outputs', async ({ page }) => {
    const id = await newProgram(page, 'SwitchTwo');
    await page.goto(`/p/${id}/stage/cpoInterfaces/activity`);
    await expect(page.locator('[data-act]')).toHaveCount(10);
    await expect(page.locator('[data-act="ICD-03"]')).toContainText('Photonic');
    await page.locator('[data-act="ICD-03"]').click();
    const steps = page.locator('[data-step^="ICD-03:"]');
    expect(await steps.count()).toBeGreaterThanOrEqual(3);
    await expect(page.locator('[data-step^="ICD-03:"] [data-col="Output"]').first()).not.toBeEmpty();
  });

  test('opens a write-up with what it needs first, what it delivers and when it is done', async ({ page }) => {
    const id = await newProgram(page, 'SwitchThree');
    await page.goto(`/p/${id}/activity/PCTL-03`);
    await expect(page.locator('.ad-title')).toHaveText('Interface Change Control Board Operation After the Interface Freeze');
    const body = page.locator('body');
    await expect(body).toContainText('ICD-10');
    expect(await page.locator('.ad-steps li').count()).toBeGreaterThanOrEqual(3);

    await page.goto(`/p/${id}/activity/DSGN-06`);
    await expect(page.locator('.ad-title')).toContainText('Photonic IC Design');
    for (const word of ['Broadcom', 'Tomahawk', 'NVIDIA', 'Cisco']) await expect(body).not.toContainText(word);
  });

  test('opens its flowchart in the app, with a way back', async ({ page }) => {
    await page.goto('/templates');
    await page.locator('[data-flowchart="cpoSwitch"]').click();
    await page.waitForURL(/\/templates\/cpoSwitch\/flowchart$/);
    await expect(page.frameLocator('iframe.flowframe').locator('h1')).toContainText('CPO Network Switch System');
    await page.locator('[data-back-templates]').click();
    await page.waitForURL(/\/templates$/);
  });
});
