import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { STAGE_ORDER, scheduleProfiles } from '../../src/data/scheduleProfiles';
import { computeSchedule, startOfDay } from '../../src/lib/schedule';
import {
  expect,
  test,
  type Page,
  SEED_PROJECT_PATH,
  selectStage,
  editDeliverables,
  settleLayout,
  tapeoutDate,
  fileDeliverable,
  openDeliveryRecord,
} from './fixtures';

const cssVar = (page: Page, name: string) =>
  page.evaluate(
    (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
    name,
  );

const selectedPanel = (page: Page) => page.locator('.stage-panel.selected');

/** An artefact to file against a deliverable — any real file will do. */
const TXT = join(tmpdir(), 'atlaspm-deliverable.txt');
writeFileSync(TXT, 'Signed off; report attached.');


/** MM/DD/YYYY → Date at local midnight, so day arithmetic survives DST. */
const parseUS = (s: string) => {
  const [m, d, y] = s.split('/').map(Number);
  return new Date(y, m - 1, d);
};
const p2 = (n: number) => String(n).padStart(2, '0');
const fmtUS = (d: Date) => `${p2(d.getMonth() + 1)}/${p2(d.getDate())}/${d.getFullYear()}`;
const plusDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const isoPlusDays = (iso: string, n: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  return toISO(plusDays(new Date(y, m - 1, d), n));
};
const toISO = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;

/**
 * Grips sit far down the page. scrollIntoViewIfNeeded() ignores the sticky
 * roadmap, which would leave the grip parked behind it, so scroll it to the
 * bottom of the viewport and assert it is the element actually under the
 * cursor before pressing.
 */
const dragGrip = async (page: Page, grip: ReturnType<Page['locator']>, dx: number) => {
  await grip.evaluate((el) => el.scrollIntoView({ block: 'end' }));
  /* Leaving the chart folds it and lifts the page, so hover first and let that
     land before measuring — otherwise the grip moves out from under the mouse. */
  await grip.hover();
  await settleLayout(page);
  const box = (await grip.boundingBox())!;
  const y = box.y + box.height / 2;
  const onTop = await page.evaluate(
    ([x, yy]) => document.elementFromPoint(x, yy)?.className ?? 'none',
    [box.x + box.width / 2, y],
  );
  expect(onTop).toContain('col-grip');
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + dx, y, { steps: 8 });
  await page.mouse.up();
};

const centerX = async (page: Page, sel: string) => {
  const box = await page.locator(sel).boundingBox();
  return box ? box.x + box.width / 2 : null;
};

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await selectStage(page, 'productDefinition');
});

test.describe('roadmap', () => {
  test('opens on the stage running today', async ({ page }) => {
    await page.goto(SEED_PROJECT_PATH);
    // the seed kicks off 66 weeks ago, so today falls inside eleven of the
    // twenty-three bars; Test Development is the lowest of them
    await expect(page.locator('.stage-panel.selected')).toHaveAttribute(
      'data-id',
      'testDevelopment',
    );
    await expect(page.locator('#rm-gantt .g-row[data-index="20"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.locator('.panel-hint')).toHaveCount(0);
  });

  test('a program with nothing in flight opens on no stage', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('FutureX1');
    await page.locator('.pf-kickoff').fill('2031-05-05');
    await page.locator('[data-create]').click();
    await page.waitForURL(/\/p\/futurex1-/);
    await expect(page.locator('.stage-panel.selected')).toHaveCount(0);
    await expect(page.locator('.panel-hint')).toBeVisible();
  });

  test('selecting a bar opens that stage, and selecting it again closes it', async ({ page }) => {
    await selectStage(page, 'physicalDesign');
    await expect(selectedPanel(page)).toHaveAttribute('data-id', 'physicalDesign');
    await expect(selectedPanel(page).locator('h2')).toHaveText('Physical Design');
    await expect(page.locator('#rm-gantt .g-row[data-index="11"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    // the lifecycle band above the axis follows the selection
    await expect(page.locator('.rm-region.current')).toHaveText('Implement');

    await page.locator('#rm-gantt [data-select-stage="physicalDesign"]').click();
    await expect(page.locator('.stage-panel.selected')).toHaveCount(0);
    await expect(page.locator('.panel-hint')).toBeVisible();
  });

  test('the stages are the y-axis, and nothing but milestones is on the x-axis', async ({
    page,
  }) => {
    // one row per stage of the profile, labelled and legible
    const labels = page.locator('#rm-gantt .g-row-label');
    await expect(labels).toHaveCount(23);
    // numbered, so the order is readable at a glance
    await expect(labels).toHaveText([
      '01.DEF', '02.ARCH', '03.TECH', '04.PDK', '05.IPR', '06.AMS',
      '07.TC', '08.RTL', '09.DV', '10.DFT', '11.SYN', '12.PD',
      '13.SO', '14.TO', '15.FAB', '16.PKGD', '17.PTV', '18.SIPI',
      '19.ASSY', '20.EVB', '21.TEST', '22.BU', '23.MP',
    ]);
    const size = await labels.first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(size).toBeGreaterThanOrEqual(12);

    // the old station row is gone, and so is the separate milestone strip:
    // every checkpoint is a diamond on the bar of the stage that carries it
    await expect(page.locator('.rm-station')).toHaveCount(0);
    await expect(page.locator('#rm-progress')).toHaveCount(0);
    await expect(page.locator('#rm-line-wrap')).toHaveCount(0);
    // the fifteen a TPM is held to, three of them major, plus kickoff
    await expect(page.locator('#rm-gantt .g-msdot')).toHaveCount(15);
    await expect(page.locator('#rm-gantt .g-kickoff-dot')).toHaveCount(1);
    await expect(page.locator('#rm-gantt .g-msdot.major')).toHaveCount(3);
    await expect(page.locator('#rm-gantt .g-cp')).toHaveText([
      'Arch Freeze',
      'PDK 1.0 Release',
      'IP Plan Freeze',
      'AMS Macro Handoff',
      'Test Chip Silicon',
      'RTL Freeze',
      'DV Closure',
      'FFN Release',
      'Design Freeze',
      'Tapeout (BEOL MTO)',
      'First Silicon',
      'Package Design Freeze',
      'EVB Ready',
      'Probe Card Ready',
      'Mass Production',
    ]);
  });

  test('each diamond sits exactly over the bar end it marks', async ({ page }) => {
    const centre = async (sel: string) => {
      const b = (await page.locator(sel).boundingBox())!;
      return b.x + b.width / 2;
    };
    const barEnd = async (index: string) => {
      const b = (await page.locator(`#rm-gantt .g-row[data-index="${index}"] .g-bar`).boundingBox())!;
      return b.x + b.width;
    };
    for (const [milestone, index] of [
      ['archFreeze', '1'],
      ['pdk10Release', '3'],
      ['rtlFreeze', '7'],
      ['dvClosure', '8'],
      ['designFreeze', '12'],
      ['tapeoutBeolMto', '13'],
      ['firstSilicon', '14'],
      ['massProduction', '22'],
    ] as const) {
      expect(
        Math.abs((await centre(`#rm-gantt [data-msid="${milestone}"]`)) - (await barEnd(index))),
        milestone,
      ).toBeLessThanOrEqual(1);
    }
  });

  test('arrow keys walk the y-axis', async ({ page }) => {
    await selectStage(page, 'rtl');
    await page.locator('#rm-gantt [data-select-stage="rtl"]').focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(selectedPanel(page)).toHaveAttribute('data-id', 'verification');
    await page.locator('#rm-gantt [data-select-stage="verification"]').focus();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    await expect(selectedPanel(page)).toHaveAttribute('data-id', 'rtl');
  });

  test('a selected row stays legible — the highlight sits behind its text', async ({ page }) => {
    await selectStage(page, 'physicalDesign');
    const row = page.locator('#rm-gantt .g-row[data-index="11"]');
    await expect(row).toHaveAttribute('aria-selected', 'true');

    // the hit target on top is transparent; the wash is behind the content
    await expect(row.locator('.g-row-hit')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(row.locator('.g-row-label')).toHaveCSS('z-index', '1');
    await expect(row.locator('.g-row-track')).toHaveCSS('z-index', '1');

    // and a selected row reads heavier, not lighter
    await expect(row.locator('.g-row-label')).toHaveCSS('font-weight', '700');
    await expect(row.locator('.g-row-label')).toHaveCSS('color', 'rgb(11, 11, 11)');
    await expect(row.locator('.g-bar-mm')).toHaveCSS('font-weight', '700');
  });

  test('the TODAY line says which day it is, over the line itself', async ({ page }) => {
    await expect(page.locator('#rm-gantt .g-today')).toBeVisible();
    // a bare line says nothing, so it is captioned with the date it stands on
    await expect(page.locator('#rm-gantt .g-today-cap')).toHaveText(
      /^Today \d{1,2}\/\d{1,2}$/,
    );
    const line = await centerX(page, '#rm-gantt .g-today');
    const label = await centerX(page, '#rm-gantt .g-today-cap');
    expect(label).not.toBeNull();
    expect(Math.abs(label! - line!)).toBeLessThanOrEqual(1);
  });

  test('past bars render gray and risky bars render red', async ({ page }) => {
    // Technology closed long ago; its bar is fully past and carries no open risk
    const past = page.locator('#rm-gantt .g-row[data-index="2"] .g-bar');
    await expect(past).not.toHaveClass(/risky/);
    await expect(past.locator('.past-seg')).toHaveCSS('width', /.+/);
    // Physical Design holds open risks — risk color wins over past-gray
    const risky = page.locator('#rm-gantt .g-row[data-index="11"] .g-bar');
    await expect(risky).toHaveClass(/risky/);
    await expect(risky).toHaveCSS('background-color', 'rgb(208, 59, 59)');
    await expect(risky.locator('.past-seg')).toHaveCount(0);
  });
});

test.describe('stage panel', () => {
  test('DV end-date edit ripples to the Tapeout milestone', async ({ page }) => {
    const before = await tapeoutDate(page);

    await selectStage(page, 'verification');
    const panel = selectedPanel(page);
    await expect(panel).toHaveAttribute('data-id', 'verification');
    await expect(panel.locator('[data-role="tat-edit"]')).toHaveValue('40');

    const end = await panel.locator('[data-role="end-edit"]').inputValue();
    const iso = isoPlusDays(end, 28);
    await panel.locator('[data-role="end-edit"]').fill(iso);

    // the edit is staged: review it, then apply
    await expect(page.locator('#sched-preview')).toBeVisible();
    await expect(panel.locator('[data-role="tat-edit"]')).toHaveValue('44');
    await page.locator('[data-apply-schedule]').click();
    await expect(page.locator('#sched-preview')).toHaveCount(0);
    await expect(panel.locator('[data-role="end-edit"]')).toHaveValue(iso);

    // Tapeout lands exactly 28 calendar days later (compared as dates, not ms:
    // a DST transition inside the window makes the raw ms delta 28d + 1h).
    await expect.poll(() => tapeoutDate(page)).toBe(fmtUS(plusDays(parseUS(before), 28)));
    await expect(page.locator('.edited-flag')).toBeVisible();

    // reset restores the baseline and clears the flag
    await page.locator('#settings-btn').click();
    await page.locator('#sched-reset').click();
    await expect.poll(() => tapeoutDate(page)).toBe(before);
    await expect(page.locator('.edited-flag')).toBeHidden();
  });

  test('a start-date edit shifts the stage without changing its TAT', async ({ page }) => {
    await selectStage(page, 'signoff');
    const panel = selectedPanel(page);
    const tat = await panel.locator('[data-role="tat-edit"]').inputValue();
    const start = await panel.locator('[data-role="start-edit"]').inputValue();
    await panel.locator('[data-role="start-edit"]').fill(isoPlusDays(start, 7));
    await page.locator('[data-apply-schedule]').click();
    await expect(panel.locator('[data-role="tat-edit"]')).toHaveValue(tat);
    await expect(panel.locator('[data-role="start-edit"]')).toHaveValue(isoPlusDays(start, 7));
  });

  test('the key information board has no DUE column', async ({ page }) => {
    const panel = selectedPanel(page);
    const keyinfo = panel.locator('.board[data-kind="keyinfo"]');
    await expect(keyinfo.locator('.board-cols > span')).toHaveText([
      'Updated',
      'Title',
      'Owner',
    ]);
    await expect(keyinfo.locator('.b-due')).toHaveCount(0);
    // the other two boards do carry it
    for (const kind of ['activities', 'risks']) {
      await expect(
        panel.locator(`.board[data-kind="${kind}"] .board-cols > span`),
      ).toHaveText(['Updated', 'Title', 'Owner', 'Due']);
    }
  });

  test('activity shows up to ten, key information and risk up to five', async ({ page }) => {
    await selectStage(page, 'physicalDesign');
    const panel = selectedPanel(page);

    const acts = panel.locator('.board[data-kind="activities"]');
    await expect(acts.locator('.b-row')).toHaveCount(6); // all six fit inside the ten-entry window
    await expect(acts.locator('.board-head .note')).toHaveText('6 items · 6 updates');
    await expect(acts.locator('.b-row .b-latest').first()).toBeVisible();

    const risks = panel.locator('.board[data-kind="risks"]');
    await expect(risks.locator('.board-head .note')).toHaveText('3 open · 3 updates');
    await expect(risks.locator('.b-row').first()).toHaveClass(/risk/);

    await expect(panel.locator('.board[data-kind="keyinfo"] .b-row')).toHaveCount(4);
  });

  test('Show more is still there beside the window', async ({ page }) => {
    await selectStage(page, 'productDefinition');
    const keyinfo = selectedPanel(page).locator('.board[data-kind="keyinfo"]');
    await expect(keyinfo.locator('.board-head .note')).toHaveText('12 items');
    await expect(keyinfo.locator('.b-row')).toHaveCount(12);
    await keyinfo.locator('[data-more]').click();
    await expect(page.locator('#modal-head h3')).toHaveText('Key Info Board');
  });

  test('activity sits left, key information over risk on the right, contacts last', async ({
    page,
  }) => {
    await selectStage(page, 'physicalDesign');
    const panel = selectedPanel(page);
    const box = async (sel: string) => (await panel.locator(sel).boundingBox())!;

    const sheet = await box('.inline-area');
    const dates = await box('.dates-row');
    const act = await box('.board[data-kind="activities"]');
    const keyinfo = await box('.board[data-kind="keyinfo"]');
    const risk = await box('.board[data-kind="risks"]');
    const contacts = await box('.contacts-sec');

    // the sheet sits under the dates row, the boards under the sheet
    expect(sheet.y).toBeGreaterThan(dates.y + dates.height);
    expect(act.y).toBeGreaterThan(sheet.y);
    // activity on the left, the other two stacked on the right
    expect(act.x).toBeLessThan(keyinfo.x);
    expect(keyinfo.x).toBe(risk.x);
    expect(risk.y).toBeGreaterThan(keyinfo.y);
    /* Each board is now a fixed window on its list, so the two columns end
       near each other rather than exactly level — ten entries on the left
       against five plus five and an extra board chrome on the right. */
    /* fixed windows now, so the columns are near each other rather than level */
    expect(Math.abs(act.y + act.height - (risk.y + risk.height))).toBeLessThan(320);
    // and contacts stay at the very bottom
    expect(contacts.y).toBeGreaterThan(act.y + act.height);
  });

  test('the three boards end level, the right pair splitting the left 60/40', async ({
    page,
  }) => {
    /* Product Definition fills all three, which is when the split is a real
       one — 60/40 is a ceiling on the pair, not a reservation, so on a stage
       that fills neither of them each takes only what it holds. */
    await selectStage(page, 'productDefinition');
    const panel = selectedPanel(page);
    const box = async (kind: string) =>
      (await panel.locator(`.board[data-kind="${kind}"]`).boundingBox())!;

    const [act, ki, risk] = [await box('activities'), await box('keyinfo'), await box('risks')];
    // Activity down the left, the other two stacked down the right
    expect(Math.round(ki.y)).toBe(Math.round(act.y));
    expect(Math.round(risk.y + risk.height)).toBe(Math.round(act.y + act.height));
    // 60/40 of the Activity height, give or take the gap between them
    expect(ki.height / (ki.height + risk.height)).toBeCloseTo(0.6, 1);

    for (const kind of ['activities', 'keyinfo', 'risks'] as const) {
      const board = panel.locator(`.board[data-kind="${kind}"]`);
      const rows = (await board.locator('.board-rows').boundingBox())!;
      const foot = (await board.locator('.board-foot').boundingBox())!;
      // "Show more" sits directly under the window, not at the column's foot
      expect(foot.y - (rows.y + rows.height), kind).toBeLessThanOrEqual(1);
      await expect(board.locator('[data-more]')).toBeVisible();
      await expect(board.locator('.board-rows')).toHaveCSS('overflow-y', 'auto');
    }
  });

  test('an empty board keeps Show more directly under its own message', async ({ page }) => {
    // Architecture has nothing on its risk board
    await selectStage(page, 'architecture');
    const board = selectedPanel(page).locator('.board[data-kind="risks"]');
    await expect(board.locator('.b-row')).toHaveCount(0);
    const rows = (await board.locator('.board-rows').boundingBox())!;
    const empty = (await board.locator('.b-empty').boundingBox())!;
    const foot = (await board.locator('.board-foot').boundingBox())!;
    // the message is at the top of the window, not floating in the middle
    expect(Math.round(empty.y - rows.y)).toBeLessThanOrEqual(2);
    expect(foot.y - (rows.y + rows.height)).toBeLessThanOrEqual(1);
  });

  test('a board past its window scrolls instead of growing', async ({ page }) => {
    // Product Definition carries a full dozen on each board
    await selectStage(page, 'productDefinition');
    const panel = selectedPanel(page);
    const act = panel.locator('.board[data-kind="activities"]');
    await expect(act.locator('.b-row')).toHaveCount(12);
    // Activity grows with its content, but never past its ceiling
    const actH = Math.round((await act.locator('.board-rows').boundingBox())!.height);
    expect(actH).toBeGreaterThan(400);
    expect(actH).toBeLessThanOrEqual(600);

    // the pair beside it split that height rather than adding to it, so they
    // scroll inside their share instead of stretching the panel
    for (const kind of ['keyinfo', 'risks'] as const) {
      const rows = panel.locator(`.board[data-kind="${kind}"] .board-rows`);
      expect(
        await rows.evaluate((el) => el.scrollHeight > el.clientHeight),
        kind,
      ).toBe(true);
    }
  });

  test('the visual stops at the dates row rather than running past it', async ({ page }) => {
    /* only in the two-column layout — below 1280 the panel stacks and the
       visual takes an explicit height above the text */
    await page.setViewportSize({ width: 1440, height: 900 });
    await selectStage(page, 'physicalDesign');
    const panel = selectedPanel(page);
    const viz = (await panel.locator('.viz').boundingBox())!;
    const dates = (await panel.locator('.dates-row').boundingBox())!;
    expect(Math.abs(viz.y + viz.height - (dates.y + dates.height))).toBeLessThanOrEqual(1);
  });

  test('overdue activity dues render red', async ({ page }) => {
    await selectStage(page, 'physicalDesign');
    const overdue = selectedPanel(page).locator('.board[data-kind="activities"] .b-due.overdue');
    await expect(overdue.first()).toHaveCSS('color', 'rgb(208, 59, 59)');
    await expect(overdue.last()).toHaveCSS('color', 'rgb(208, 59, 59)');
  });
});

test.describe('board column resize', () => {
  test('dragging the activities Owner grip leaves the risks board alone', async ({ page }) => {
    const before = {
      actOwner: await cssVar(page, '--bck-activities-owner'),
      riskOwner: await cssVar(page, '--bck-risks-owner'),
      riskDue: await cssVar(page, '--bck-risks-due'),
      keyOwner: await cssVar(page, '--bck-keyinfo-owner'),
    };

    await dragGrip(
      page,
      selectedPanel(page).locator('.board[data-kind="activities"] .col-grip[data-col="owner"]'),
      -60,
    );

    // the dragged column moved…
    expect(await cssVar(page, '--bck-activities-owner')).not.toBe(before.actOwner);
    // …and nothing else did
    expect(await cssVar(page, '--bck-risks-owner')).toBe(before.riskOwner);
    expect(await cssVar(page, '--bck-risks-due')).toBe(before.riskDue);
    expect(await cssVar(page, '--bck-keyinfo-owner')).toBe(before.keyOwner);
    await expect(page.locator('body')).not.toHaveClass(/col-resizing/);
  });

  test('the deliverables grip resizes its own var', async ({ page }) => {
    const before = await cssVar(page, '--dlv-due');
    await dragGrip(
      page,
      selectedPanel(page).locator('.dlv-cols .col-grip[data-col="--dlv-due"]'),
      -40,
    );
    expect(await cssVar(page, '--dlv-due')).not.toBe(before);
  });
});

test.describe('stage details', () => {
  test('open by default on the selected stage, and on newly selected stages', async ({
    page,
  }) => {
    await expect(selectedPanel(page).locator('.inline-area[data-kind="stage"]')).toBeVisible();
    await selectStage(page, 'fabrication');
    await expect(selectedPanel(page).locator('.inline-area[data-kind="stage"]')).toBeVisible();
  });

  test('the sheet closes to a button, and the button opens it again', async ({ page }) => {
    const panel = selectedPanel(page);
    await expect(panel.locator('[data-toggle-detail]')).toHaveCount(0);

    await panel.locator('.inline-close').click();
    await expect(panel.locator('.inline-area')).toHaveCount(0);
    await expect(panel).not.toHaveClass(/detail-open/);
    await expect(panel.locator('[data-toggle-detail]')).toBeVisible();

    await panel.locator('[data-toggle-detail]').click();
    await expect(panel.locator('.inline-area[data-kind="stage"]')).toBeVisible();
    // contacts stay put whether the sheet is open or not
    await expect(panel.locator('.contacts-sec')).toBeVisible();
  });

  test('Engineering | Program swaps the pane', async ({ page }) => {
    const panel = selectedPanel(page);
    await expect(panel.locator('[data-pane="eng"]')).toBeVisible();
    await expect(panel.locator('[data-pane="prog"]')).toBeHidden();
    await panel.locator('.view-toggle button[data-view="prog"]').click();
    await expect(panel.locator('[data-pane="prog"]')).toBeVisible();
    await expect(panel.locator('[data-pane="eng"]')).toBeHidden();
    await expect(panel.locator('[data-pane="prog"] .view-foot .mono')).toContainText('Product');
  });

  test('filing a record completes the deliverable, and the artefact is the tick', async ({
    page,
  }) => {
    await selectStage(page, 'physicalDesign');
    const panel = selectedPanel(page);
    await expect(panel.locator('.dlv-note')).toHaveText('5 / 9 complete');

    const row = panel.locator('.dlv-list li').filter({ hasText: 'Interim physical DRC' });
    await expect(row.locator('.dlv-comp')).toHaveText('—');
    // the box is a read-out, not a control: pressing it opens the record
    await expect(row.locator('input[type="checkbox"]')).not.toBeChecked();
    await row.locator('input[type="checkbox"]').click();
    await expect(page.locator('.dr-win')).toBeVisible();
    // and says so, rather than quietly doing nothing
    await expect(page.locator('[data-dr-empty]')).toContainText('marked complete by its artefact');
    await page.locator('[data-dr-cancel]').click();
    await expect(row.locator('input[type="checkbox"]')).not.toBeChecked();

    await fileDeliverable(page, 'Interim physical DRC', TXT, 'DRC clean on the N2 drop.');

    await expect(row.locator('input[type="checkbox"]')).toBeChecked();
    await expect(row.locator('.dlv-comp')).toHaveText(/^\d{2}\/\d{2}\/\d{4}$/);
    await expect(row.locator('.dlv-t')).toHaveClass(/done/);
    await expect(panel.locator('.dlv-note')).toHaveText('6 / 9 complete');
    // and the row says it carries a file, without opening anything
    await expect(row.locator('.clip-badge')).toBeVisible();

    // the record reads back — which is the other half of filing one
    await openDeliveryRecord(page, 'Interim physical DRC');
    await expect(page.locator('[data-dr-note]')).toHaveValue('DRC clean on the N2 drop.');
    await expect(page.locator('.dr-files .att-name')).toHaveText('atlaspm-deliverable.txt');

    // taking the artefact away takes the tick with it
    await page.locator('.dr-files [data-att-del]').click();
    await page.locator('[data-dr-save]').click();
    await expect(row.locator('input[type="checkbox"]')).not.toBeChecked();
    await expect(row.locator('.dlv-comp')).toHaveText('—');
    await expect(panel.locator('.dlv-note')).toHaveText('5 / 9 complete');
  });

  test('deliverables can be added and deleted', async ({ page }) => {
    const panel = selectedPanel(page);
    const rows = panel.locator('.dlv-list li');
    await expect(rows).toHaveCount(6);
    // the table is a read-out until it is switched into edit mode
    await expect(panel.locator('.dlv-add')).toHaveCount(0);
    await expect(panel.locator('input.dlv-due')).toHaveCount(0);
    await editDeliverables(page);
    await panel.locator('.dlv-input').fill('Cost model refresh');
    await panel.locator('.dlv-input-due').fill('2026-12-11');
    await panel.locator('[data-dlv-add]').click();
    await expect(rows).toHaveCount(7);
    await expect(rows.last()).toContainText('Cost model refresh');
    await expect(panel.locator('.dlv-note')).toHaveText('6 / 7 complete');
    await rows.last().locator('[data-dlv-del]').click();
    await expect(rows).toHaveCount(6);
  });

  test('contacts can be added, edited and deleted', async ({ page }) => {
    const panel = selectedPanel(page);
    const rows = panel.locator('.contacts-sec .c-row:not(.editing)');
    await expect(rows).toHaveCount(3);

    await panel.locator('[data-c-add]').click();
    await panel.locator('.c-row.editing .cf-name').fill('Rae Lindqvist');
    await panel.locator('.c-row.editing .cf-role').fill('Program analytics');
    await panel.locator('.c-row.editing [data-c-save]').click();
    await expect(rows).toHaveCount(4);
    await expect(rows.last()).toContainText('Rae Lindqvist');
    await expect(panel.locator('.contacts-sec .note')).toHaveText('4 members');

    await rows.last().locator('[data-c-edit]').click();
    await panel.locator('.c-row.editing .cf-role').fill('Program analytics lead');
    await panel.locator('.c-row.editing [data-c-save]').click();
    await expect(rows.last()).toContainText('Program analytics lead');

    await rows.last().locator('[data-c-del]').click();
    await expect(rows).toHaveCount(3);
  });

  test('a nameless contact will not save', async ({ page }) => {
    const panel = selectedPanel(page);
    await panel.locator('[data-c-add]').click();
    await panel.locator('.c-row.editing .cf-role').fill('No name given');
    await panel.locator('.c-row.editing [data-c-save]').click();
    await expect(panel.locator('.c-row.editing')).toBeVisible();
  });
});

test.describe('risk library and leader', () => {
  test('a potential risk can be tracked onto the risk board', async ({ page }) => {
    await selectStage(page, 'architecture');
    const panel = selectedPanel(page);
    await expect(panel.locator('.board[data-kind="risks"] .b-row')).toHaveCount(0);
    await expect(panel.locator('.b-empty')).toBeVisible();

    await panel.locator('[data-potential]').click();
    const first = panel.locator('.pr-row').first();
    const title = await first.locator('.t').textContent();
    await first.locator('.pr-add').click();

    await expect(first.locator('.pr-add')).toHaveText('Added');
    await expect(first.locator('.pr-add')).toBeDisabled();
    await panel.locator('.inline-close').click();
    await expect(panel.locator('.board[data-kind="risks"] .b-row')).toHaveCount(1);
    await expect(panel.locator('.board[data-kind="risks"] .b-row .t')).toHaveText(title!);
    await expect(panel.locator('.board[data-kind="risks"] .board-head .note')).toHaveText(
      '1 open',
    );
    // a newly risky stage turns its gantt bar red
    await expect(page.locator('#rm-gantt .g-row[data-index="1"] .g-bar')).toHaveClass(/risky/);
  });

  test('the stage leader can be edited', async ({ page }) => {
    const panel = selectedPanel(page);
    await expect(panel.locator('.l-name')).toHaveText('Daniel Kim');
    await panel.locator('[data-leader-edit]').click();
    await panel.locator('.ie-l-name').fill('Dana Whitfield');
    await panel.locator('.ie-l-phone').fill('+1 (408) 555-0900');
    await panel.locator('[data-leader-save]').click();
    await expect(panel.locator('.l-name')).toHaveText('Dana Whitfield');
    await expect(panel.locator('.l-contact')).toContainText('+1 (408) 555-0900');
    // the sheet closes on save
    await expect(panel.locator('.inline-area')).toHaveCount(0);
  });
});

test.describe('escape', () => {
  test('closes the open inline sheets', async ({ page }) => {
    await expect(selectedPanel(page).locator('.inline-area')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(selectedPanel(page).locator('.inline-area')).toHaveCount(0);
  });
});


test.describe('the stage in flight', () => {
  test('a program opens on the stage today falls in', async ({ page }) => {
    // no clicking: the store picks the stage on hydration
    await page.goto(SEED_PROJECT_PATH);
    await expect(selectedPanel(page)).toHaveAttribute('data-id', 'testDevelopment');
    await expect(page.locator('#rm-gantt .g-row.current')).toHaveAttribute(
      'data-stage',
      'testDevelopment',
    );
    await expect(page.locator('.panel-hint')).toHaveCount(0);
  });

  test('where stages overlap it opens the lowest bar of them all', async ({ page }) => {
    /* Stages are concurrent by design: the profile has today under a dozen
       bars at once, which is exactly the case this rule is about. */
    const base = computeSchedule(startOfDay(new Date()), scheduleProfiles.typicalSoC, {});
    const today = startOfDay(new Date());
    expect(
      STAGE_ORDER.filter((id) => base.stages[id].start <= today && today <= base.stages[id].end)
        .length,
    ).toBeGreaterThan(0);

    await page.goto(SEED_PROJECT_PATH);

    // read the overlap off the chart: the bars the TODAY line crosses
    const inFlight = await page.locator('#rm-gantt').evaluate((chart) => {
      const line = chart.querySelector('.g-today')!.getBoundingClientRect();
      const x = line.left + line.width / 2;
      return [...chart.querySelectorAll('.g-row')]
        .filter((row) => {
          const bar = row.querySelector('.g-bar');
          if (!bar) return false;
          const b = bar.getBoundingClientRect();
          return b.left <= x && x <= b.right;
        })
        .map((row) => (row as HTMLElement).dataset.stage!);
    });

    expect(inFlight.length).toBeGreaterThan(1);
    await expect(selectedPanel(page)).toHaveAttribute('data-id', inFlight[inFlight.length - 1]);
  });
});

test.describe('the chart folds away', () => {
  test('folds to the open bar on the way out and unfolds on the way back', async ({ page }) => {
    const roadmap = page.locator('#roadmap');
    const height = async () => (await roadmap.boundingBox())!.height;

    await selectStage(page, 'physicalDesign');
    await roadmap.hover({ position: { x: 8, y: 8 } });
    await settleLayout(page);
    const open = await height();
    expect(open).toBeGreaterThan(200);

    // leave through the bottom edge, which is the gesture that folds it
    const box = (await roadmap.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height + 40);
    await settleLayout(page);

    const folded = await height();
    // the bar chart collapses; the axis above it does not, so the saving is
    // the nine rows that went, not the whole chart
    expect(folded).toBeLessThan(open - 100);
    await expect(roadmap).toHaveClass(/folded/);

    // the date axis survives — bands and every month of it
    await expect(page.locator('#rm-axis')).toBeVisible();
    await expect(page.locator('#rm-gantt-cap')).toBeVisible();
    await expect(page.locator('#rm-gantt .g-months .g-month').first()).toBeVisible();

    // what collapses is the bar chart, down to the open stage alone
    await expect(page.locator('#rm-gantt .g-row.current .g-bar')).toBeVisible();
    await expect(page.locator('#rm-gantt .g-row[data-index="11"]')).toBeVisible();
    await expect(page.locator('#rm-gantt .g-row[data-index="10"]')).toBeHidden();
    await expect(page.locator('#rm-gantt .g-row[data-index="12"]')).toBeHidden();
    await expect(page.locator('#rm-gantt .g-row[data-index="0"]')).toBeHidden();

    // and it is drawn at the scale of that stage: the bar takes ~70%, centred
    const bar = (await page.locator('#rm-gantt .g-row.current .g-bar').boundingBox())!;
    const track = (await page.locator('#rm-gantt .g-row.current .g-row-track').boundingBox())!;
    expect(bar.width / track.width).toBeCloseTo(0.7, 1);
    expect(bar.x + bar.width / 2 - (track.x + track.width / 2)).toBeCloseTo(0, 0);

    // the open row grows, so its deliverables have somewhere to sit
    const rowH = (await page.locator('#rm-gantt .g-row.current').boundingBox())!.height;
    expect(rowH).toBeGreaterThan(60);

    // and it is animated rather than snapping
    const transition = await page
      .locator('#rm-gantt .g-row')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(transition).not.toBe('0s');

    await roadmap.hover({ position: { x: 8, y: 8 } });
    await settleLayout(page);
    await expect(roadmap).not.toHaveClass(/folded/);
    expect(Math.round(await height())).toBe(Math.round(open));
  });
});

test.describe('the folded chart carries its dates', () => {
  const fold = async (page: Page) => {
    /* measure once the unfold has finished: a box taken mid-animation is
       shorter than the chart ends up, and the pointer lands inside it */
    await settleLayout(page);
    const box = (await page.locator('#roadmap').boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height + 40);
    await settleLayout(page);
    await expect(page.locator('#roadmap')).toHaveClass(/folded/);
  };

  test('every milestone diamond shows its own date, hover or not', async ({ page }) => {
    await selectStage(page, 'physicalDesign');
    const dots = page.locator('#rm-gantt .g-msdot');
    await expect(dots).toHaveCount(15); // the checkpoints a TPM is held to
    for (const text of await dots.locator('.g-msdot-date').allTextContents()) {
      expect(text).toMatch(/^\d{1,2}\/\d{1,2}$/);
    }
    // Tapeout's diamond says what the toolbar says
    const tapeout = await page
      .locator('#rm-gantt .g-msdot[data-msid^="tapeout"] .g-msdot-date')
      .first()
      .textContent();
    const toolbar = (await tapeoutDate(page))!;
    const [m, d] = toolbar.split('/');
    expect(tapeout).toBe(`${Number(m)}/${Number(d)}`);

    /* Folded, the chart is one stage, so what survives is that stage's own
       checkpoint — the diamond sits on its bar now, not on a strip above. */
    await selectStage(page, 'tapeout');
    await fold(page);
    await expect(
      page.locator('#rm-gantt .g-row.current .g-msdot[data-msid^="tapeout"] .g-msdot-date'),
    ).toBeVisible();
  });

  test('the month scale keeps every month, and follows the zoom', async ({ page }) => {
    await selectStage(page, 'physicalDesign');
    const before = await page.locator('#rm-gantt .g-month').allTextContents();
    /* Consecutive months, no gaps. Which month the chart opens on depends on
       when the seed was planted — its kickoff is 66 weeks before today — so
       the run of months is what is asserted, not the month it starts at. */
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // a January carries its year — "Jan '26" — so the label is read loosely
    const monthNo = (label: string) => MONTHS.findIndex((m) => label.startsWith(m));
    expect(before.length).toBeGreaterThan(12);
    for (const [i, label] of before.entries()) {
      expect(monthNo(label), label).toBeGreaterThanOrEqual(0);
      if (i > 0) expect((monthNo(before[i - 1]) + 1) % 12, label).toBe(monthNo(label));
    }

    /* Folded, the chart is one stage wide, so the calendar comes with it:
       fewer months, still every one of them, still in order. */
    await fold(page);
    const zoomed = await page.locator('#rm-gantt .g-month').allTextContents();
    expect(zoomed.length).toBeLessThan(before.length);
    expect(zoomed.length).toBeGreaterThan(1);
    expect(before.join(' ')).toContain(zoomed.join(' '));
  });

  test('the open stage wears its deliverables, and a new date moves one', async ({ page }) => {
    await selectStage(page, 'physicalDesign');
    await expect(page.locator('.g-dlv')).toHaveCount(0); // only once it folds
    await fold(page);

    const marks = page.locator('#rm-gantt .g-row.current .g-dlv');
    await expect(marks).toHaveCount(9); // Physical Design's nine deliverables
    // a finished deliverable is marked on the day it was finished
    const first = marks.filter({ hasText: 'Floorplan and PDN' });
    await expect(first.locator('.g-dlv-date')).toHaveText(/^\d{1,2}\/\d{1,2}$/);
    await expect(first).toHaveClass(/done/);
    // an open one still shows what it is due
    await expect(marks.filter({ hasText: 'Bump map' }).locator('.g-dlv-date')).toHaveText('9/13');

    // markers are placed by date: later date, further right
    const xs = await marks.evaluateAll((els) =>
      els.map((e) => e.getBoundingClientRect().left),
    );
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);

    // move a due date in the sheet below and the marker follows
    const open = marks.filter({ hasText: 'Bump map' });
    const before = (await open.boundingBox())!.x;
    await editDeliverables(page);
    await selectedPanel(page)
      .locator('.dlv-list li')
      .filter({ hasText: 'Bump map' })
      .locator('input.dlv-due')
      .fill('2026-09-24');
    await page.locator('#roadmap').hover({ position: { x: 8, y: 8 } });
    await fold(page);
    const moved = page.locator('#rm-gantt .g-row.current .g-dlv').filter({
      hasText: 'Bump map',
    });
    await expect(moved.locator('.g-dlv-date')).toHaveText('9/24');
    expect((await moved.boundingBox())!.x).toBeGreaterThan(before);
  });
});

test.describe('the pin holds the chart open', () => {
  test('pinned it never folds; unpinned it folds again', async ({ page }) => {
    await selectStage(page, 'physicalDesign');
    const roadmap = page.locator('#roadmap');
    const leave = async () => {
      await settleLayout(page);
      const box = (await roadmap.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height + 40);
      await settleLayout(page);
    };

    await page.locator('[data-pin]').click();
    await expect(page.locator('[data-pin]')).toHaveAttribute('aria-pressed', 'true');
    await leave();
    await expect(roadmap).not.toHaveClass(/folded/);
    await expect(page.locator('#rm-gantt .g-row')).toHaveCount(23);

    // it is a preference, so it survives a reload
    await page.reload();
    await expect(page.locator('[data-pin]')).toHaveAttribute('aria-pressed', 'true');
    await leave();
    await expect(roadmap).not.toHaveClass(/folded/);

    // unpinned, the fold comes back
    await page.locator('[data-pin]').click();
    await leave();
    await expect(roadmap).toHaveClass(/folded/);
  });

  test('the folded bar is drawn no thicker than the others', async ({ page }) => {
    await selectStage(page, 'physicalDesign');
    const bar = page.locator('#rm-gantt .g-row.current .g-bar');
    const before = (await bar.boundingBox())!.height;
    const box = (await page.locator('#roadmap').boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height + 40);
    await settleLayout(page);
    expect((await bar.boundingBox())!.height).toBe(before);
  });
});

test.describe('marks tell past from future', () => {
  test('a date behind us is filled, one ahead is hollow', async ({ page }) => {
    const marks = await page.locator('#rm-gantt .g-msdot').evaluateAll((els) =>
      els.map((el) => ({
        id: (el as HTMLElement).dataset.msid,
        past: el.classList.contains('past'),
        filled: getComputedStyle(el).backgroundColor,
      })),
    );
    const ink = marks.find((m) => m.past)!.filled;
    const paper = marks.find((m) => !m.past)!.filled;
    expect(ink).not.toBe(paper);

    // one shape for all of them: same border, same weight
    const shape = await page.locator('#rm-gantt .g-msdot').evaluateAll((els) =>
      els.map((el) => {
        const c = getComputedStyle(el);
        return `${c.borderTopWidth}|${getComputedStyle(el.firstElementChild!).fontWeight}`;
      }),
    );
    expect(new Set(shape).size).toBe(1);
    // and it is the date that decides, not whether the milestone is a major one
    for (const m of marks) expect(m.filled, m.id).toBe(m.past ? ink : paper);

    // Arch Freeze is long behind the seed's today, tapeout still ahead
    expect(marks.find((m) => m.id === 'archFreeze')!.past).toBe(true);
    expect(marks.find((m) => m.id === 'tapeoutBeolMto')!.past).toBe(false);
  });

  test('ticking a deliverable moves its marker onto the day it was finished', async ({
    page,
  }) => {
    await selectStage(page, 'physicalDesign');
    await fileDeliverable(page, 'Bump map', TXT);
    const row = selectedPanel(page)
      .locator('.dlv-list li')
      .filter({ hasText: 'Bump map' });
    await expect(row.locator('.dlv-comp')).not.toHaveText('—');

    const box = (await page.locator('#roadmap').boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height + 40);
    await settleLayout(page);

    const mark = page.locator('#rm-gantt .g-row.current .g-dlv').filter({
      hasText: 'Bump map',
    });
    await expect(mark).toHaveClass(/done/);
    const today = new Date();
    await expect(mark.locator('.g-dlv-date')).toHaveText(
      `${today.getMonth() + 1}/${today.getDate()}`,
    );
  });
});

test.describe('the stage duration is a field', () => {
  test('typing weeks moves the completion date and ripples on', async ({ page }) => {
    await selectStage(page, 'verification');
    const panel = selectedPanel(page);
    const start = await panel.locator('[data-role="start-edit"]').inputValue();
    await expect(panel.locator('[data-role="tat-edit"]')).toHaveValue('40');

    await panel.locator('[data-role="tat-edit"]').fill('44');
    // the start stays put and the end lands four weeks later
    await expect(panel.locator('[data-role="start-edit"]')).toHaveValue(start);
    await expect(panel.locator('[data-role="end-edit"]')).toHaveValue(isoPlusDays(start, 308));
    // and it is staged like any other date edit, not saved behind your back
    await expect(page.locator('#sched-preview')).toBeVisible();
    await page.locator('[data-discard-schedule]').click();
    await expect(panel.locator('[data-role="tat-edit"]')).toHaveValue('40');
  });
});

test.describe('board windows', () => {
  const boardHeight = async (page: Page, kind: string) =>
    Math.round(
      (await selectedPanel(page).locator(`.board[data-kind="${kind}"] .board-rows`).boundingBox())!
        .height,
    );

  test('the Activity ceiling holds, and the right pair follow its height', async ({ page }) => {
    const measure = async (kind: string) =>
      selectedPanel(page)
        .locator(`.board[data-kind="${kind}"] .board-rows`)
        .evaluate((el) => ({
          height: Math.round(el.getBoundingClientRect().height),
          content: el.scrollHeight,
        }));

    // Product Definition is seeded full — twelve entries on each board
    const acts = await measure('activities');
    /* The list stops short of the frame by the head and the foot, so "Show
       more" is inside the board rather than hanging off the bottom of it. */
    expect(acts.height).toBeLessThan(600);
    expect(acts.height).toBeGreaterThan(400);
    expect(acts.content).toBeGreaterThan(acts.height); // and it scrolls

    // the pair beside Activity divide its height rather than adding to it, so
    // the panel stays one screen and they scroll inside their share
    const ki = await measure('keyinfo');
    const risks = await measure('risks');
    expect(ki.height + risks.height).toBeLessThanOrEqual(acts.height);
    expect(ki.content).toBeGreaterThan(ki.height);
    expect(risks.content).toBeGreaterThan(risks.height);

    /* The 60/40 share is a ceiling, not a reservation. A stage with a handful
       of activities takes a handful of activities' worth: nobody is squeezed
       into two rows, and nobody holds half a screen of nothing open under a
       stranded "Show more". */
    await selectStage(page, 'physicalDesign');
    const short = await measure('activities');
    expect(short.height).toBeLessThanOrEqual(acts.height);
    expect(short.height).toBe(short.content); // its whole list, no scrolling
    expect(await boardHeight(page, 'keyinfo')).toBeGreaterThan(120);
  });

  test('a full board scrolls inside its window, with Show more just below', async ({ page }) => {
    // Key Info gets 60% of Activity's height, which its twelve rows overflow
    const board = selectedPanel(page).locator('.board[data-kind="keyinfo"]');
    await expect(board.locator('.b-row')).toHaveCount(12);

    const rows = board.locator('.board-rows');
    const fits = await rows.evaluate((el) => el.scrollHeight <= el.clientHeight);
    expect(fits).toBe(false);
    const scrolled = await rows.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
      return el.scrollTop;
    });
    expect(scrolled).toBeGreaterThan(0);

    const win = (await rows.boundingBox())!;
    const more = (await board.locator('[data-more]').boundingBox())!;
    expect(more.y).toBeGreaterThan(win.y + win.height - 2);
    expect(more.y - (win.y + win.height)).toBeLessThan(40);
  });
});
