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
    for (const key of ['emram', 'pmu', 'fpgaVerification', 'rtlEmb', 'physicalDesignEmb', 'tapeoutEmb', 'fabricationEmb', 'qualificationEmb']) {
      await expect(page.locator(`[data-stage="${key}"]`), key).toBeVisible();
    }
    /* and none of the leading-node stages it has no use for */
    for (const key of ['packageTestVehicle', 'chipPackageCoVerification', 'amsIp', 'rtl', 'productDefinition', 'tapeout', 'fabrication']) {
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

  /* Every activity has a page, and the page is about this part: the authored
     ones are written for it, and the derived ones are the SoC write-up with
     what does not fit it rewritten and its links moved onto this programme. */
  test('opens a write-up for an authored and a derived activity alike', async ({ page }) => {
    const id = await newProgram(page, 'AtlasEdge6');

    await page.goto(`/p/${id}/activity/CMP-04`);
    await expect(page.locator('.ad-title')).toHaveText('Placement, Routing and Static Scheduling');
    await expect(page.locator('.ad-steps li')).toHaveCount(6);
    await expect(page.locator('body')).toContainText('FCD-03');

    await page.goto(`/p/${id}/activity/EDEF-03`);
    await expect(page.locator('.ad-title')).toHaveText('Workload Definition and KPI Targets');
    const body = page.locator('body');
    await expect(body).toContainText('duty cycle');
    for (const word of ['LLM', 'TTFT', 'HBM', 'tokens/s']) await expect(body).not.toContainText(word);

    /* the activity's panel links to it, as it does for every written activity */
    await page.goto(`/p/${id}/stage/compiler/activity`);
    await page.locator('[data-act="CMP-04"]').click();
    await page.getByRole('link', { name: 'Read CMP-04 →' }).click();
    await page.waitForURL(/\/activity\/CMP-04$/);
    await expect(page.locator('.ad-title')).toHaveText('Placement, Routing and Static Scheduling');
  });

  /* A gate deliverable's handover opens its checklist; the workbook of the
     same items is on the checklist's page. */
  test('offers a Checklist beside the Handover heading, and only on a gate', async ({ page }) => {
    const id = await newProgram(page, 'AtlasEdge7');

    await page.goto(`/p/${id}/stage/verificationEmb/deliverables`);
    const rows = page.locator('[data-board] [data-deliverable]');
    await rows.filter({ hasText: 'EDV-D7' }).click();
    const card = page.locator('[data-handover]');
    await expect(card).toContainText('Handover');
    const open = card.locator('[data-signoff-open="EDV-D7"]');
    await expect(open).toHaveText('Checklist');
    await expect(card.locator('[data-template-download]')).toHaveCount(0);
    await open.click();
    await page.waitForURL(/\/signoff\/EDV-D7$/);
    await expect(page.locator('[data-signoff="EDV-D7"] [data-item]')).toHaveCount(24);
    const link = page.getByRole('link', { name: /Excel/ });
    await expect(link).toHaveAttribute('href', '/templates/EDV-D7-dv-closure-signoff.xlsx');

    /* a deliverable that is not a gate offers nothing */
    await page.goto(`/p/${id}/stage/verificationEmb/deliverables`);
    await rows.filter({ hasText: 'EDV-D1' }).click();
    await expect(page.locator('[data-handover]')).toContainText('Handover');
    await expect(page.locator('[data-signoff-open]')).toHaveCount(0);
  });

  /* ESO-D7 is confirmed in the app as well as in the workbook: the same
     items, the same rules, saved as it is typed. */
  test('confirms ESO-D7 item by item in the app', async ({ page }) => {
    const id = await newProgram(page, 'AtlasEdge8');

    /* the people a sign-off can name are the programme team: a stage lead and
       an engineer on the signoff stage */
    await page.goto(`/p/${id}/stage/signoffEmb/team`);
    await page.locator('[data-add-person="signoffEmb"]').click();
    await page.getByLabel('Name', { exact: true }).fill('Tomas Rivera');
    await page.locator('[data-person-role]').selectOption('lead');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('[data-person]')).toHaveCount(1);
    await page.locator('[data-add-person="signoffEmb"]').click();
    await page.getByLabel('Name', { exact: true }).fill('Grace Park');
    await page.locator('[data-person-role]').selectOption('manual');
    await page.locator('[data-person-role-text]').fill('Timing closure lead');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('[data-person]')).toHaveCount(2);

    await page.goto(`/p/${id}/stage/signoffEmb/deliverables`);
    await page.locator('[data-board] [data-deliverable]').filter({ hasText: 'ESO-D7' }).click();
    const card = page.locator('[data-handover]');
    await card.locator('[data-signoff-open="ESO-D7"]').click();
    await page.waitForURL(/\/signoff\/ESO-D7$/);

    const board = page.locator('[data-signoff="ESO-D7"]');
    await expect(board.locator('[data-item]')).toHaveCount(23);

    /* the columns: result, evidence and waiver live in the opened item, and
       every header sits on one line */
    const heads = board.locator('.so-head [data-col-head]');
    await expect(heads).toHaveText([
      'REF', 'ITEM AND TARGET', 'EVIDENCE OWNER', 'EVIDENCE STATUS', 'ITEM STATUS', 'CONFIRMED BY', 'CONFIRMED ON', 'FLAG',
    ]);
    for (const h of await heads.all()) {
      const box = await h.locator('.so-thl').evaluate((el) => ({ w: el.scrollWidth, cw: el.clientWidth, h: el.getBoundingClientRect().height }));
      expect(box.w).toBeLessThanOrEqual(box.cw);
      expect(box.h).toBeLessThan(24);
    }
    /* a boundary is dragged left or right and follows the pointer: the
       column on its right gains what the item column gives */
    const owner = board.locator('[data-col-head="owner"]');
    const before = (await owner.boundingBox())!.width;
    const grip = (await board.locator('[data-grip="item"]').boundingBox())!;
    await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
    await page.mouse.down();
    await page.mouse.move(grip.x + grip.width / 2 - 60, grip.y + grip.height / 2, { steps: 4 });
    await page.mouse.up();
    await expect.poll(async () => Math.round((await owner.boundingBox())!.width - before)).toBe(60);
    const moved = (await board.locator('[data-grip="item"]').boundingBox())!;
    expect(Math.abs(moved.x - (grip.x - 60))).toBeLessThan(2);
    /* and back to the right, between two fixed columns: the status column
       gives what the owner column gains, and the item column is left alone */
    const item0 = (await board.locator('[data-col-head="item"]').boundingBox())!.width;
    const g2 = (await board.locator('[data-grip="owner"]').boundingBox())!;
    await page.mouse.move(g2.x + g2.width / 2, g2.y + g2.height / 2);
    await page.mouse.down();
    await page.mouse.move(g2.x + g2.width / 2 + 10, g2.y + g2.height / 2, { steps: 2 });
    await page.mouse.up();
    await expect.poll(async () => Math.round((await owner.boundingBox())!.width - before)).toBe(70);
    expect(Math.round((await board.locator('[data-col-head="item"]').boundingBox())!.width)).toBe(Math.round(item0));
    await expect(board.locator('[data-outcome]')).toHaveText('In review');

    /* the page scrolls in the shell like every other page */
    const scrolled = await page.locator('#view').evaluate((el) => {
      el.scrollTop = 100000;
      return el.scrollTop;
    });
    expect(scrolled).toBeGreaterThan(0);
    await page.locator('#view').evaluate((el) => (el.scrollTop = 0));

    /* an item reads as a post until Edit: no inputs in view mode */
    await board.locator('[data-item="C-01"]').click();
    const item = board.locator('[data-card="C-01"]');
    await expect(item.locator('[data-view="C-01"]')).toContainText('Nothing recorded yet');
    await expect(item.locator('input, select, textarea')).toHaveCount(0);

    /* the two statuses and what they offer */
    await item.locator('[data-edit-item="C-01"]').click();
    await expect(item.getByLabel('C-01 evidence status').locator('option')).toHaveText(['Not updated', 'Under review', 'Confirmed']);
    await expect(item.getByLabel('C-01 item status').locator('option')).toHaveText(['Pending', 'Under review', 'Confirmed']);
    await expect(item.getByLabel('C-01 evidence status')).toHaveValue('Not updated');
    await expect(item.getByLabel('C-01 item status')).toHaveValue('Pending');

    /* a confirmation without evidence is flagged, and clears when it has some */
    await item.getByLabel('C-01 item status').selectOption('Confirmed');
    /* confirming the item confirms its evidence */
    await expect(item.getByLabel('C-01 evidence status')).toHaveValue('Confirmed');
    /* only the stage lead or the TPM can be named */
    await expect(item.getByLabel('C-01 confirmed by').locator('option:not([value=""])')).toHaveText([/Tomas Rivera/, /Sangwook Park/]);
    await item.locator('[data-save-item="C-01"]').click();
    /* confirming names the stage lead unless somebody else is picked */
    await expect(board.locator('[data-item="C-01"] [data-col="confirmed-by"] .so-name')).toHaveText('Tomas Rivera');
    /* names wear their initials, as everywhere else in the app */
    await expect(board.locator('[data-item="C-01"] [data-col="confirmed-by"] .av')).toHaveText('TR');
    /* the opened item says where the confirmation stands */
    await expect(item.locator('[data-card-state="Confirmed"]')).toContainText('Tomas Rivera');
    await expect(board.locator('[data-item="C-01"] [data-owner-status]')).toHaveText('Confirmed');
    await expect(board.locator('[data-item="C-01"] [data-lead]')).toHaveText('Confirmed');
    await expect(board.locator('[data-item="C-01"] [data-flag]')).toHaveText('Evidence missing');
    await expect(board.locator('[data-stat="flagged"]')).toHaveText('1');
    await item.locator('[data-edit-item="C-01"]').click();
    await item.getByLabel('Evidence — link or file name').fill('sta/final/signoff_summary.rpt');
    /* the evidence owner is picked from the programme team */
    await item.getByLabel('C-01 evidence owner').selectOption('Grace Park');
    await item.locator('[data-save-item="C-01"]').click();
    await expect(board.locator('[data-item="C-01"] [data-col="evidence-owner"] .so-name')).toHaveText('Grace Park');
    await expect(item.locator('[data-view="C-01"]')).toContainText('sta/final/signoff_summary.rpt');
    await expect(board.locator('[data-item="C-01"] [data-flag]')).toHaveText('');
    await expect(board.locator('[data-stat="confirmed"]')).toHaveText('1/23');

    /* Cancel keeps nothing */
    await item.locator('[data-edit-item="C-01"]').click();
    await item.getByLabel('Evidence — link or file name').fill('something else');
    await item.getByRole('button', { name: 'Cancel' }).click();
    await expect(item.locator('[data-view="C-01"]')).toContainText('sta/final/signoff_summary.rpt');

    /* evidence can be a file: attached while editing, it stands in for a
       written link, and stays attached */
    await item.locator('[data-edit-item="C-01"]').click();
    await item.getByLabel('Attach evidence to C-01').setInputFiles({
      name: 'sta_summary.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('WNS 0.012 ns'),
    });
    await expect(item.locator('[data-evidence-files]')).toContainText('sta_summary.txt');
    await item.getByLabel('Evidence — link or file name').fill('');
    await item.locator('[data-save-item="C-01"]').click();
    await expect(item.locator('[data-view="C-01"] [data-evidence-files]')).toContainText('sta_summary.txt');
    await expect(board.locator('[data-item="C-01"] [data-flag]')).toHaveText('');
    await expect(board.locator('[data-item="C-01"] .so-clip')).toContainText('1');

    /* the TPM is on the team whatever the Team tab says */
    await item.locator('[data-edit-item="C-01"]').click();
    await expect(item.getByLabel('C-01 evidence owner').locator('option', { hasText: 'Sangwook Park' })).toHaveCount(1);
    await item.getByRole('button', { name: 'Cancel' }).click();

    /* reopening puts the item back to Pending and its evidence to Not
       updated, with what was recorded kept to be brought up to date */
    await item.locator('[data-reopen-item="C-01"]').click();
    await expect(board.locator('[data-item="C-01"] [data-lead]')).toHaveText('Pending');
    await expect(board.locator('[data-item="C-01"] [data-owner-status]')).toHaveText('Not updated');
    await expect(board.locator('[data-item="C-01"] [data-col="confirmed-by"]')).toHaveText('—');
    await expect(item.locator('[data-view="C-01"] [data-evidence-files]')).toContainText('sta_summary.txt');
    await expect(item.locator('[data-reopen-item]')).toHaveCount(0);
    await item.locator('[data-edit-item="C-01"]').click();
    await item.getByLabel('C-01 evidence status').selectOption('Under review');
    await item.getByLabel('C-01 item status').selectOption('Under review');
    await item.locator('[data-save-item="C-01"]').click();
    await expect(board.locator('[data-item="C-01"] [data-lead]')).toHaveText('Under review');
    await expect(board.locator('[data-item="C-01"] [data-owner-status]')).toHaveText('Under review');
    await expect(board.locator('[data-stat="confirmed"]')).toHaveText('0/23');
    await expect(board.locator('[data-stat="review"]')).toHaveText('1');
    await item.locator('[data-edit-item="C-01"]').click();
    await item.getByLabel('C-01 item status').selectOption('Confirmed');
    await item.getByLabel('C-01 confirmed by').selectOption('Sangwook Park');
    await item.locator('[data-save-item="C-01"]').click();
    await expect(board.locator('[data-item="C-01"] [data-owner-status]')).toHaveText('Confirmed');
    await expect(board.locator('[data-item="C-01"] [data-col="confirmed-by"] .so-name')).toHaveText('Sangwook Park');

    /* setting a confirmed item's evidence back reopens the item */
    await item.locator('[data-edit-item="C-01"]').click();
    await item.getByLabel('C-01 evidence status').selectOption('Under review');
    await expect(item.getByLabel('C-01 item status')).toHaveValue('Pending');
    await item.getByRole('button', { name: 'Cancel' }).click();

    /* a waiver is raised against its item, and needs an approver */
    await board.locator('[data-so-tab="waivers"]').click();
    await board.locator('[data-add="waiver"]').click();
    await board.getByLabel('W-01 Item').selectOption('C-02');
    await board.getByLabel('W-01 Approved by').selectOption('Tomas Rivera');
    await board.locator('[data-save-row="W-01"]').click();
    await expect(board.locator('[data-row="W-01"]')).toContainText('Tomas Rivera');
    await expect(board.locator('[data-row="W-01"] input')).toHaveCount(0);
    await board.locator('[data-so-tab="checklist"]').click();

    /* signing off against the counts is allowed, and called out */
    await board.locator('[data-so-tab="signoff"]').click();
    await board.locator('[data-edit-decision]').click();
    await board.getByLabel('Final decision').selectOption('Signed off');
    await board.locator('[data-save-decision]').click();
    await expect(board.locator('[data-decision]')).toHaveText('Signed off');
    await expect(board.locator('[data-warning]')).toContainText('not ready');

    /* it was saved */
    await expect(page.locator('.so-save')).toHaveText('Saved');
    await page.reload();
    await expect(page.locator('[data-signoff="ESO-D7"] [data-stat="confirmed"]')).toHaveText('1/23');
    await expect(page.locator('[data-signoff="ESO-D7"] [data-item="C-01"] [data-lead]')).toHaveText('Confirmed');
  });

  /* Every gate is a checklist now, and a complete one closes its deliverable. */
  test('closes a gate deliverable when its checklist reaches 100%, and reopens it', async ({ page }) => {
    const id = await newProgram(page, 'AtlasEdge9');
    await page.goto(`/p/${id}/stage/rtlEmb/deliverables`);
    const row = page.locator('[data-board] [data-deliverable]').filter({ hasText: 'ERTL-D7' });
    await expect(row.locator('.cb.on')).toHaveCount(0);
    await row.click();
    await page.locator('[data-signoff-open="ERTL-D7"]').click();
    await page.waitForURL(/\/signoff\/ERTL-D7$/);
    const board = page.locator('[data-signoff="ERTL-D7"]');
    const ids = await board.locator('[data-item]').evaluateAll((els) => els.map((e) => e.getAttribute('data-item')!));
    expect(ids).toHaveLength(23);
    /* the stage has no lead, so the TPM confirms */
    for (const it of ids) {
      await board.locator(`[data-item="${it}"]`).click();
      const card = board.locator(`[data-card="${it}"]`);
      await card.locator(`[data-edit-item="${it}"]`).click();
      await card.getByLabel(`${it} item status`).selectOption('Confirmed');
      await expect(card.getByLabel(`${it} confirmed by`)).toHaveValue('Sangwook Park');
      await card.locator(`[data-save-item="${it}"]`).click();
      await board.locator(`[data-item="${it}"]`).click();
    }
    await expect(board.locator('[data-stat="confirmed"]')).toHaveText('23/23');
    await expect(board.locator('[data-summary]')).toContainText('ERTL-D7 closed');
    await expect(page.locator('.so-save')).toHaveText('Saved');

    /* the deliverable is closed, and says by what — after a reload too */
    await page.goto(`/p/${id}/stage/rtlEmb/deliverables`);
    await expect(row.locator('.cb.on')).toHaveCount(1);
    await row.click();
    await expect(page.locator('[data-closed-by-checklist]')).toContainText('Closed by its checklist');

    /* reopening one item reopens the deliverable */
    await page.locator('[data-signoff-open="ERTL-D7"]').click();
    await page.waitForURL(/\/signoff\/ERTL-D7$/);
    await board.locator(`[data-item="${ids[0]}"]`).click();
    await board.locator(`[data-reopen-item="${ids[0]}"]`).click();
    await expect(board.locator('[data-stat="confirmed"]')).toHaveText('22/23');
    await expect(page.locator('.so-save')).toHaveText('Saved');
    await page.goto(`/p/${id}/stage/rtlEmb/deliverables`);
    await expect(row.locator('.cb.on')).toHaveCount(0);
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
