import { expect, test, type Page, SEED_PROJECT_PATH, selectStage, editStageDetail } from './fixtures';

const cssVar = (page: Page, name: string) =>
  page.evaluate(
    (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
    name,
  );

const selectedPanel = (page: Page) => page.locator('.stage-panel.selected');


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
  await selectStage(page, '01');
});

test.describe('roadmap', () => {
  test('nothing is open until a bar is selected', async ({ page }) => {
    await page.goto(SEED_PROJECT_PATH);
    await expect(page.locator('.stage-panel.selected')).toHaveCount(0);
    await expect(page.locator('.panel-hint')).toBeVisible();
    await expect(page.locator('#rm-gantt .g-row[aria-selected="true"]')).toHaveCount(0);
  });

  test('selecting a bar opens that stage, and selecting it again closes it', async ({ page }) => {
    await selectStage(page, '06');
    await expect(selectedPanel(page)).toHaveAttribute('data-id', 'physicalDesign');
    await expect(selectedPanel(page).locator('h2')).toHaveText('Physical Design');
    await expect(page.locator('#rm-gantt .g-row[data-index="5"]')).toHaveAttribute(
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
    // twelve rows down the side, labelled and legible
    const labels = page.locator('#rm-gantt .g-row-label');
    await expect(labels).toHaveCount(12);
    await expect(labels).toHaveText([
      'DEF', 'ARCH', 'RTL', 'DV', 'SYN', 'PD', 'SO', 'TO', 'FAB', 'PKG', 'BU', 'MP',
    ]);
    const size = await labels.first().evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(size).toBeGreaterThanOrEqual(12);

    // the old station row is gone; the axis carries the seven milestones
    await expect(page.locator('.rm-station')).toHaveCount(0);
    await expect(page.locator('#rm-progress')).toHaveCount(0);
    await expect(page.locator('.rm-ms')).toHaveCount(7);
    await expect(page.locator('.rm-ms.major')).toHaveCount(3);
    await expect(page.locator('.rm-ms-label')).toHaveText([
      'Arch Freeze',
      'RTL Freeze',
      'DV Closure',
      'Design Freeze',
      'Tapeout',
      'First Silicon',
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
      ['rtlFreeze', '2'],
      ['dvClosure', '3'],
      ['designFreeze', '6'],
      ['tapeout', '7'],
      ['firstSilicon', '8'],
      ['massProduction', '11'],
    ] as const) {
      expect(
        Math.abs((await centre(`[data-msid="${milestone}"]`)) - (await barEnd(index))),
        milestone,
      ).toBeLessThanOrEqual(1);
    }
  });

  test('arrow keys walk the y-axis', async ({ page }) => {
    await selectStage(page, '03');
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
    await selectStage(page, '06');
    const row = page.locator('#rm-gantt .g-row[data-index="5"]');
    await expect(row).toHaveAttribute('aria-selected', 'true');

    // the hit target on top is transparent; the wash is behind the content
    await expect(row.locator('.g-row-hit')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(row.locator('.g-row-label')).toHaveCSS('z-index', '1');
    await expect(row.locator('.g-row-track')).toHaveCSS('z-index', '1');

    // and a selected row reads heavier, not lighter
    await expect(row.locator('.g-row-label')).toHaveCSS('font-weight', '700');
    await expect(row.locator('.g-row-label')).toHaveCSS('color', 'rgb(11, 11, 11)');
    await expect(row.locator('.g-mm-tag')).toHaveCSS('font-weight', '700');
  });

  test('TODAY marker aligns pixel-exact with the gantt today line', async ({ page }) => {
    await expect(page.locator('#rm-today')).toBeVisible();
    const marker = await centerX(page, '#rm-today');
    const line = await centerX(page, '#rm-gantt .g-today');
    expect(marker).not.toBeNull();
    expect(Math.abs(marker! - line!)).toBeLessThanOrEqual(1);
  });

  test('past bars render gray and risky bars render red', async ({ page }) => {
    // RTL closed long ago; its bar is fully past and carries no open risk
    const past = page.locator('#rm-gantt .g-row[data-index="2"] .g-bar');
    await expect(past).not.toHaveClass(/risky/);
    await expect(past.locator('.past-seg')).toHaveCSS('width', /.+/);
    // Physical Design holds 3 open risks — risk color wins over past-gray
    const risky = page.locator('#rm-gantt .g-row[data-index="5"] .g-bar');
    await expect(risky).toHaveClass(/risky/);
    await expect(risky).toHaveCSS('background-color', 'rgb(208, 59, 59)');
    await expect(risky.locator('.past-seg')).toHaveCount(0);
  });
});

test.describe('stage panel', () => {
  test('DV end-date edit ripples to the toolbar Tapeout', async ({ page }) => {
    const tapeout = page.locator('[data-computed="tapeout"]');
    const before = await tapeout.textContent();

    await selectStage(page, '04');
    const panel = selectedPanel(page);
    await expect(panel).toHaveAttribute('data-id', 'verification');
    await expect(panel.locator('[data-role="tat"]')).toHaveText('16W TAT');

    const end = await panel.locator('[data-role="end-edit"]').inputValue();
    const iso = isoPlusDays(end, 28);
    await panel.locator('[data-role="end-edit"]').fill(iso);

    // the edit is staged: review it, then apply
    await expect(page.locator('#sched-preview')).toBeVisible();
    await expect(panel.locator('[data-role="tat"]')).toHaveText('20W TAT');
    await page.locator('[data-apply-schedule]').click();
    await expect(page.locator('#sched-preview')).toHaveCount(0);
    await expect(panel.locator('[data-role="end-edit"]')).toHaveValue(iso);

    // Tapeout lands exactly 28 calendar days later (compared as dates, not ms:
    // a DST transition inside the window makes the raw ms delta 28d + 1h).
    await expect(tapeout).toHaveText(fmtUS(plusDays(parseUS(before!), 28)));
    await expect(page.locator('.edited-flag')).toBeVisible();

    // reset restores the baseline and clears the flag
    await page.locator('#settings-btn').click();
    await page.locator('#sched-reset').click();
    await expect(tapeout).toHaveText(before!);
    await expect(page.locator('.edited-flag')).toBeHidden();
  });

  test('a start-date edit shifts the stage without changing its TAT', async ({ page }) => {
    await selectStage(page, '07');
    const panel = selectedPanel(page);
    const tat = await panel.locator('[data-role="tat"]').textContent();
    const start = await panel.locator('[data-role="start-edit"]').inputValue();
    await panel.locator('[data-role="start-edit"]').fill(isoPlusDays(start, 7));
    await page.locator('[data-apply-schedule]').click();
    await expect(panel.locator('[data-role="tat"]')).toHaveText(tat!);
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

  test('boards show the latest 3 with an update preview', async ({ page }) => {
    await selectStage(page, '06');
    const panel = selectedPanel(page);
    const acts = panel.locator('.board[data-kind="activities"]');
    await expect(acts.locator('.b-row')).toHaveCount(3);
    await expect(acts.locator('.board-head .note')).toHaveText('6 items · 6 updates');
    // newest first
    await expect(acts.locator('.b-row .b-latest').first()).toBeVisible();
    const risks = panel.locator('.board[data-kind="risks"]');
    await expect(risks.locator('.board-head .note')).toHaveText('3 open · 3 updates');
    await expect(risks.locator('.b-row').first()).toHaveClass(/risk/);
  });

  test('overdue activity dues render red', async ({ page }) => {
    await selectStage(page, '06');
    await expect(
      selectedPanel(page).locator('.board[data-kind="activities"] .b-due.overdue'),
    ).toHaveCSS('color', 'rgb(208, 59, 59)');
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
    await selectStage(page, '09');
    await expect(selectedPanel(page).locator('.inline-area[data-kind="stage"]')).toBeVisible();
  });

  test('the Stage Details button toggles the sheet', async ({ page }) => {
    const panel = selectedPanel(page);
    await panel.locator('[data-toggle-detail]').click();
    await expect(panel.locator('.inline-area')).toHaveCount(0);
    await expect(panel).not.toHaveClass(/detail-open/);
    await panel.locator('[data-toggle-detail]').click();
    await expect(panel.locator('.inline-area[data-kind="stage"]')).toBeVisible();
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

  test('checking a deliverable stamps completedAt and updates the counter', async ({
    page,
  }) => {
    await selectStage(page, '06');
    const panel = selectedPanel(page);
    await expect(panel.locator('.dlv-note')).toHaveText('2 / 5 complete');

    const row = panel.locator('.dlv-list li').nth(2); // Routed database — open
    await expect(row.locator('.dlv-comp')).toHaveText('—');
    await row.locator('input[type="checkbox"]').check();

    await expect(row.locator('.dlv-comp')).toHaveText(/^\d{2}\/\d{2}\/\d{4} · \d{2}:\d{2}$/);
    await expect(row.locator('.dlv-t')).toHaveClass(/done/);
    await expect(panel.locator('.dlv-note')).toHaveText('3 / 5 complete');

    // unchecking clears the stamp again
    await row.locator('input[type="checkbox"]').uncheck();
    await expect(row.locator('.dlv-comp')).toHaveText('—');
    await expect(panel.locator('.dlv-note')).toHaveText('2 / 5 complete');
  });

  test('deliverables can be added and deleted', async ({ page }) => {
    const panel = selectedPanel(page);
    const rows = panel.locator('.dlv-list li');
    await expect(rows).toHaveCount(4);
    // the table is a read-out until the sheet is opened for editing
    await expect(panel.locator('.dlv-add')).toHaveCount(0);
    await expect(panel.locator('input.dlv-due')).toHaveCount(0);
    await editStageDetail(page);
    await panel.locator('.dlv-input').fill('Cost model refresh');
    await panel.locator('[data-dlv-add]').click();
    await expect(rows).toHaveCount(5);
    await expect(rows.last()).toContainText('Cost model refresh');
    await expect(panel.locator('.dlv-note')).toHaveText('4 / 5 complete');
    await rows.last().locator('[data-dlv-del]').click();
    await expect(rows).toHaveCount(4);
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
    await selectStage(page, '02');
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
