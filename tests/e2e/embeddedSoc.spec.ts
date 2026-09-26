import { expect, test, type Page } from './fixtures';

/**
 * The Embedded SoC template, through the screens.
 *
 * A third built-in: an ultra-low-power embedded processor sold with its own
 * compiler, SDK and evaluation kit. The compiler and the EVK are stages with
 * checkpoints, not lines in bring-up, and the SoC work it shares is run at
 * embedded scale under prefixes of its own.
 */
const stagesLink = (page: Page) =>
  page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Stages/ });

const newProgram = async (page: Page, name: string) => {
  await page.goto('/');
  await page.locator('[data-new-project]').click();
  await page.locator('.pf-name').fill(name);
  await page.getByLabel('Template').selectOption('embeddedSoc');
  await page.locator('.pf-kickoff').fill('2027-03-01');
  await page.locator('[data-create]').click();
  await page.waitForURL(/\/p\/[^/]+\/overview$/);
  return page.url().split('/p/')[1].split('/')[0];
};

test.describe('the Embedded SoC template', () => {
  test('ships as a built-in beside the other two, and is copy-only', async ({ page }) => {
    await page.goto('/templates');
    const emb = page.locator('[data-template="embeddedSoc"]');
    await expect(emb).toBeVisible();
    await expect(emb).toContainText('Built-in');
    await expect(emb).toContainText('Embedded SoC');
    /* 7 SoC stages as they are, 10 at embedded scale, 13 of its own */
    await expect(emb).toContainText('30');
    await expect(emb.locator('[data-duplicate]')).toHaveCount(1);
    await expect(emb.locator('[data-edit-template]')).toHaveCount(0);

    await expect(page.locator('[data-template="typicalSoC"]')).toContainText('23');
    await expect(page.locator('[data-template="threeDic"]')).toContainText('38');
  });

  test('starts a programme that runs the compiler, SDK and EVK as stages', async ({ page }) => {
    const id = await newProgram(page, 'AtlasEdge1');
    await expect(stagesLink(page)).toContainText('30');

    await page.goto(`/p/${id}/stages`);
    await expect(page.getByText('Developer Platform & Ecosystem').first()).toBeVisible();
    for (const key of ['compiler', 'virtualPlatform', 'sdk', 'evkDesign', 'evkLaunch', 'softwareRelease', 'earlyAccess']) {
      await expect(page.locator(`[data-stage="${key}"]`), key).toBeVisible();
    }
    for (const key of ['emram', 'pmu', 'fpgaVerification', 'rtlEmb', 'physicalDesignEmb', 'tapeout', 'fabricationEmb', 'qualificationEmb']) {
      await expect(page.locator(`[data-stage="${key}"]`), key).toBeVisible();
    }
    /* and none of the leading-node stages it has no use for */
    for (const key of ['packageTestVehicle', 'chipPackageCoVerification', 'amsIp', 'rtl', 'productDefinition', 'fabrication']) {
      await expect(page.locator(`[data-stage="${key}"]`), key).toHaveCount(0);
    }
  });

  test('builds the compiler activity by activity, to an alpha', async ({ page }) => {
    const id = await newProgram(page, 'AtlasEdge2');

    await page.goto(`/p/${id}/stage/compiler/activity`);
    const acts = page.locator('[data-act]');
    await expect(acts).toHaveCount(7);
    await expect(page.locator('[data-act="CMP-05"]')).toContainText('LiteRT and ONNX');
    await expect(page.locator('[data-act="CMP-07"]')).toContainText('Compiler Alpha');
    await expect(page.locator('[data-act="CMP-07"]')).toContainText('CMP-D7');

    await page.locator('[data-act="CMP-02"]').click();
    const steps = page.locator('[data-step^="CMP-02:"]');
    await expect(steps).toHaveCount(5);
    await expect(steps.first()).toContainText('Clang front end');
    await expect(page.locator('[data-step^="CMP-02:"] [data-col="Output"]').first()).toContainText(
      'Clang front end and target description',
    );
  });

  test('designs the EVK and tags its deliverables', async ({ page }) => {
    const id = await newProgram(page, 'AtlasEdge3');

    await page.goto(`/p/${id}/stage/evkDesign/activity`);
    await expect(page.locator('[data-act]')).toHaveCount(5);
    await expect(page.locator('[data-act="EVK-01"]')).toContainText('EVK Requirements');

    await page.goto(`/p/${id}/stage/evkDesign/deliverables`);
    const rows = page.locator('[data-board] [data-deliverable]');
    await expect(rows).toHaveCount(5);
    await expect(rows.first()).toContainText('EVK-D1');
    await expect(rows.last()).toContainText('EVK-D5');
  });

  /* The derived stages keep the SoC wording, so their rows share a title with
     an SoC row; the stage decides which tag they carry. */
  test('runs the SoC work at embedded scale under its own prefixes', async ({ page }) => {
    const id = await newProgram(page, 'AtlasEdge4');

    await page.goto(`/p/${id}/stage/physicalDesignEmb/activity`);
    await expect(page.locator('[data-act="EPD-02"]')).toContainText('Floorplan');
    await expect(page.locator('[data-act^="PD-"]')).toHaveCount(0);

    await page.goto(`/p/${id}/stage/rtlEmb/deliverables`);
    const rows = page.locator('[data-board] [data-deliverable]');
    await expect(rows.last()).toContainText('ERTL-D7');
  });

  test('plans, runs and signs off FPGA prototype verification', async ({ page }) => {
    const id = await newProgram(page, 'AtlasEdge5');

    await page.goto(`/p/${id}/stage/fpgaVerification/activity`);
    await expect(page.locator('[data-act]')).toHaveCount(6);
    await expect(page.locator('[data-act="FPV-01"]')).toContainText('FPGA Verification Plan');
    await expect(page.locator('[data-act="FPV-06"]')).toContainText('FPGA Verification Signoff');

    await page.locator('[data-act="FPV-04"]').click();
    await expect(page.locator('[data-step^="FPV-04:"]')).toHaveCount(6);
    await expect(page.locator('[data-step^="FPV-04:"]').first()).toContainText('Arduino shields');
  });

  test('cuts down its own stages, not the SoC flow’s', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-new-project]').click();
    await page.getByLabel('Template').selectOption('custom:embeddedSoc');
    const picker = page.locator('[data-stage-picker]');
    await expect(picker.locator('[data-pick="compiler"]')).toBeVisible();
    await expect(picker.locator('[data-pick="evkLaunch"]')).toContainText('EVK General Availability');
    await expect(picker.locator('[data-pick="packageTestVehicle"]')).toHaveCount(0);
    await expect(picker.locator('[data-pick]')).toHaveCount(30);
  });
});
