import { expect, test, type Page } from './fixtures';

/**
 * The UCIe Advanced 64G Die-to-Die PHY IP template, through the screens.
 *
 * A fifth built-in, and the first IP program: it ends at production release
 * rather than production, and runs two bands no other template has — Silicon
 * Validation and IP Release & Enablement.
 */
const stagesLink = (page: Page) =>
  page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Stages/ });

const newProgram = async (page: Page, name: string, template = 'ucieAdv64') => {
  await page.goto('/');
  await page.locator('[data-new-project]').click();
  await page.locator('.pf-name').fill(name);
  await page.getByLabel('Template').selectOption(template);
  await page.locator('.pf-kickoff').fill('2027-01-04');
  await page.locator('[data-create]').click();
  await page.waitForURL(/\/p\/[^/]+\/overview$/);
  return page.url().split('/p/')[1].split('/')[0];
};

test.describe('the UCIe Advanced 64G Die-to-Die PHY IP template', () => {
  test('ships as a fifth built-in, copy-only, beside the other four', async ({ page }) => {
    await page.goto('/templates');
    const ucie = page.locator('[data-template="ucieAdv64"]');
    await expect(ucie).toBeVisible();
    await expect(ucie).toContainText('UCIe Advanced 64G Die-to-Die PHY IP');
    await expect(ucie).toContainText('Built-in');
    await expect(ucie).toContainText('25');
    await expect(ucie.locator('[data-edit-template]')).toHaveCount(0);
    await expect(ucie.locator('[data-flowchart="ucieAdv64"]')).toBeVisible();
    for (const id of ['typicalSoC', 'threeDic', 'embeddedSoc', 'cpoSwitch']) await expect(page.locator(`[data-template="${id}"]`)).toBeVisible();
  });

  test('starts a program whose timeline has the silicon validation and IP release bands', async ({ page }) => {
    const id = await newProgram(page, 'PhyOne');
    await expect(stagesLink(page)).toContainText('25');

    await page.goto(`/p/${id}/stages`);
    for (const key of ['ucieArchitecture', 'ucieAfe', 'ucieRtl', 'ucieChannel', 'ucieSignoff', 'ucieTapeout', 'ucieCharacterization', 'ucieReliability', 'uciePreSilicon', 'ucieGa', 'ucieCustomer']) {
      await expect(page.locator(`[data-stage="${key}"]`), key).toBeVisible();
    }

    await page.goto(`/p/${id}/timeline`);
    for (const band of ['Silicon Validation', 'IP Release & Enablement']) {
      await expect(page.locator('.tl-ph').filter({ hasText: band }).first(), band).toBeVisible();
    }
    for (const gate of ['Architecture Freeze', 'Hard Macro Signoff', 'Tapeout', 'Silicon in Hand', 'Silicon-Proven', 'v0.9 Release', 'IP Production Release']) {
      await expect(page.getByText(gate).first(), gate).toBeVisible();
    }
  });

  test('leaves the other templates’ timelines without the new bands', async ({ page }) => {
    for (const template of ['typicalSoC', 'cpoSwitch']) {
      const id = await newProgram(page, `NoBand-${template}`, template);
      await page.goto(`/p/${id}/timeline`);
      await expect(page.locator('.tl-ph').first()).toBeVisible();
      for (const band of ['Silicon Validation', 'IP Release & Enablement']) {
        await expect(page.locator('.tl-ph').filter({ hasText: band }), `${template}: ${band}`).toHaveCount(0);
      }
    }
  });

  test('opens a stage’s activities with steps and outputs, and an activity’s write-up', async ({ page }) => {
    const id = await newProgram(page, 'PhyTwo');
    await page.goto(`/p/${id}/stage/ucieRtl/activity`);
    await expect(page.locator('[data-act]')).toHaveCount(10);
    await expect(page.locator('[data-act="URTL-05"]')).toContainText('MBTRAIN');
    await page.locator('[data-act="URTL-05"]').click();
    expect(await page.locator('[data-step^="URTL-05:"]').count()).toBeGreaterThanOrEqual(3);
    await expect(page.locator('[data-step^="URTL-05:"] [data-col="Output"]').first()).not.toBeEmpty();

    await page.goto(`/p/${id}/activity/UCHR-09`);
    await expect(page.locator('.ad-title')).toHaveText('Measurement-to-Simulation Correlation');
    const body = page.locator('body');
    await expect(body).toContainText('UAMS-07');
    expect(await page.locator('.ad-steps li').count()).toBeGreaterThanOrEqual(3);
    for (const word of ['TSMC', 'Synopsys', 'Cadence', 'CoWoS', 'UCIe 3.0']) await expect(body).not.toContainText(word);
  });

  test('opens its flowchart in the app, with a way back', async ({ page }) => {
    await page.goto('/templates');
    await page.locator('[data-flowchart="ucieAdv64"]').click();
    await page.waitForURL(/\/templates\/ucieAdv64\/flowchart$/);
    const frame = page.frameLocator('iframe.flowframe');
    await expect(frame.locator('h1')).toContainText('UCIe Advanced 64G Die-to-Die PHY IP');
    for (const t of ['Implementation Architecture & Partitioning', 'Electrical PHY Circuits to Circuit Freeze', 'Channel Specification & Bump Map Co-Design', 'Production Release on Silicon Data']) {
      await expect(frame.getByText(t).first(), t).toBeVisible();
    }
    await page.locator('[data-back-templates]').click();
    await page.waitForURL(/\/templates$/);
  });
});
