import {
  expect,
  test,
  type Page,
  SEED_PROJECT_PATH,
  selectStage,
  tapeoutDate,
} from './fixtures';

const openDash = async (page: Page) => {
  await page.locator('#mode-toggle button[data-mode="schedule"]').click();
  await expect(page.locator('#schedule-view')).toBeVisible();
};

/** Match on the tile's own label — the risk tile's subtitle names stages too. */
const stat = (page: Page, label: string) =>
  page.locator('.stat').filter({ has: page.locator('.k', { hasText: label }) });

const cssVar = (page: Page, name: string) =>
  page.evaluate(
    (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
    name,
  );

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await selectStage(page, '01');
});

test.describe('stat tiles', () => {
  test('the seed program reads 51% / D−xx / 7 / 1', async ({ page }) => {
    await openDash(page);
    await expect(page.locator('#dash-title')).toHaveText('AtlasAX1 — Dashboard');

    const progress = stat(page, 'Program Progress');
    await expect(progress.locator('.v')).toHaveText('51%');
    await expect(progress.locator('.sub')).toHaveText('23 of 45 deliverables complete');

    const tapeout = stat(page, 'Tapeout');
    await expect(tapeout.locator('.v')).toHaveText(/^D−\d+$/);
    await expect(tapeout.locator('.sub')).toHaveText(
      await tapeoutDate(page) as string,
    );
    // D-day is derived, so recompute it rather than pinning a calendar date
    const date = (await tapeout.locator('.sub').textContent())!;
    const [m, d, y] = date.split('/').map(Number);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.ceil((new Date(y, m - 1, d).getTime() - today.getTime()) / 86400000);
    await expect(tapeout.locator('.v')).toHaveText(`D−${days}`);

    const risks = stat(page, 'Open Risks');
    await expect(risks.locator('.v')).toHaveText('19');
    await expect(risks).toHaveClass(/alert/);
    await expect(risks.locator('.v')).toHaveCSS('color', 'rgb(208, 59, 59)');
    await expect(risks.locator('.sub')).toHaveText(
      'Product Definition, Physical Design, Signoff, Tapeout, Advanced Packaging',
    );

    const overdue = stat(page, 'Overdue Activities');
    await expect(overdue.locator('.v')).toHaveText('1');
    await expect(overdue).toHaveClass(/alert/);
  });

  test('the counters follow the data', async ({ page }) => {
    // complete one deliverable on Physical Design: 23/45 → 24/45 = 53%
    await selectStage(page, '06');
    const panel = page.locator('.stage-panel.selected');
    await panel.locator('.dlv-list li').nth(2).locator('input[type="checkbox"]').check();
    await openDash(page);
    await expect(stat(page, 'Program Progress').locator('.v')).toHaveText('53%');
    await expect(stat(page, 'Program Progress').locator('.sub')).toHaveText(
      '24 of 45 deliverables complete',
    );
  });

  test('a stage with no open risks drops out of the risk list', async ({ page }) => {
    await selectStage(page, '02');
    const panel = page.locator('.stage-panel.selected');
    await panel.locator('[data-potential]').click();
    await panel.locator('.pr-add').first().click();
    await openDash(page);
    await expect(stat(page, 'Open Risks').locator('.v')).toHaveText('20');
    await expect(stat(page, 'Open Risks').locator('.sub')).toContainText('Architecture');
  });
});

test.describe('milestones, in-flight and updates', () => {
  test('upcoming milestones list with D-days, majors filled', async ({ page }) => {
    await openDash(page);
    const items = page.locator('.dash-item');
    await expect(items).toHaveCount(4);
    await expect(items.locator('.t')).toHaveText([
      '◇ Design Freeze',
      '◆ Tapeout',
      '◆ First Silicon',
      '◆ Mass Production',
    ]);
    for (const dd of await items.locator('.dday').allTextContents()) {
      expect(dd).toMatch(/^D−\d+$/);
    }
    // soonest first
    const days = (await items.locator('.dday').allTextContents()).map((t) =>
      Number(t.replace('D−', '')),
    );
    expect(days).toEqual([...days].sort((a, b) => a - b));
  });

  test('in-flight chips show today’s stage, red when risky', async ({ page }) => {
    await openDash(page);
    const chips = page.locator('.dash-flight span');
    await expect(chips).toHaveCount(1);
    await expect(chips).toHaveText('PD · Physical Design');
    await expect(chips).toHaveClass(/risky/);
    await expect(chips).toHaveCSS('color', 'rgb(208, 59, 59)');
  });

  test('recent updates are a two-line feed, newest first, capped at 6', async ({ page }) => {
    await openDash(page);
    const rows = page.locator('.dash-su');
    await expect(rows).toHaveCount(6);
    const first = rows.first();
    await expect(first.locator('.b-stage')).toHaveText('PD');
    await expect(first.locator('.t1')).toContainText('Multi-corner timing closure');
    await expect(first.locator('.t2')).toContainText('WNS −86');
    await expect(first.locator('.d')).toHaveText(/^\d{2}\/\d{2}\/\d{4} · \d{2}:\d{2}$/);
  });

  test('clicking an update opens that item; Show more opens the updates board', async ({
    page,
  }) => {
    await openDash(page);
    await page.locator('.dash-su').first().click();
    await expect(page.locator('#modal .modal-win')).toBeVisible();
    await expect(page.locator('.iv-title')).toHaveText('Multi-corner timing closure');
    await expect(page.locator('#modal-head .meta')).toHaveText('Physical Design');
    // opened directly, so there is no board to go back to
    await expect(page.locator('[data-back]')).toHaveCount(0);
    await page.locator('#modal-close').click();

    await page.locator('[data-dash-open="updates"]').click();
    await expect(page.locator('#modal-head h3')).toHaveText('Status Updates — All Stages');
  });
});

test.describe('program schedule gantt', () => {
  test('rows are 32px and the TODAY line is drawn', async ({ page }) => {
    await openDash(page);
    const rows = page.locator('#gantt-b .g-row');
    await expect(rows).toHaveCount(12);
    await expect(rows.first()).toHaveCSS('height', '32px');
    await expect(page.locator('#gantt-b .g-today')).toBeVisible();
    await expect(page.locator('#gantt-b .g-today-label')).toHaveText('Today');
    // full labels here, short codes on the roadmap's mini chart
    await expect(rows.first().locator('.g-row-label')).toHaveText('Product Definition');
  });

  test('the Tapeout diamond sits exactly on the bar end', async ({ page }) => {
    await openDash(page);
    const row = page.locator('#gantt-b .g-row[data-index="7"]');
    const bar = (await row.locator('.g-bar').boundingBox())!;
    const dot = (await row.locator('.g-msdot').boundingBox())!;
    const barEnd = bar.x + bar.width;
    const dotCenter = dot.x + dot.width / 2;
    expect(Math.abs(dotCenter - barEnd)).toBeLessThanOrEqual(1);
    await expect(row.locator('.g-cp')).toContainText('Tapeout · ');
  });

  test('every end-anchored milestone lands on its stage bar end', async ({ page }) => {
    await openDash(page);
    for (const index of ['1', '2', '3', '6', '7', '8', '11']) {
      const row = page.locator(`#gantt-b .g-row[data-index="${index}"]`);
      const bar = (await row.locator('.g-bar').boundingBox())!;
      const dot = (await row.locator('.g-msdot').boundingBox())!;
      expect(
        Math.abs(dot.x + dot.width / 2 - (bar.x + bar.width)),
      ).toBeLessThanOrEqual(1);
    }
  });

  test('every checkpoint label sits clear of the bars, beside its diamond', async ({
    page,
  }) => {
    await openDash(page);
    const rows = await page.locator('#gantt-b .g-row').evaluateAll((els) =>
      els
        .map((row) => {
          const bar = row.querySelector('.g-bar');
          const chip = row.querySelector('.g-cp');
          const dot = row.querySelector('.g-msdot');
          if (!bar || !chip || !dot) return null;
          const b = bar.getBoundingClientRect();
          const c = chip.getBoundingClientRect();
          const d = dot.getBoundingClientRect();
          return {
            stage: (row as HTMLElement).dataset.stage,
            /* the label never overlaps a bar… */
            overlapsBar:
              Math.min(b.right, c.right) > Math.max(b.left, c.left) &&
              Math.min(b.bottom, c.bottom) > Math.max(b.top, c.top),
            /* …and always sits to the right of the diamond it points at */
            rightOfDiamond: c.left > d.left,
          };
        })
        .filter(Boolean),
    );
    expect(rows).toHaveLength(7);
    for (const r of rows) {
      expect(r!.overlapsBar, r!.stage).toBe(false);
      expect(r!.rightOfDiamond, r!.stage).toBe(true);
    }
    // the arrow that ties label to diamond is on every one of them
    for (const i of [1, 11]) {
      const arrow = await page
        .locator(`#gantt-b .g-row[data-index="${i}"] .g-cp`)
        .evaluate((el) => getComputedStyle(el, '::before').borderRightWidth);
      expect(arrow).toBe('5px');
    }
  });

  test('a date edit moves the bar and its diamond together', async ({ page }) => {
    await selectStage(page, '04');
    const panel = page.locator('.stage-panel.selected');
    const end = await panel.locator('[data-role="end-edit"]').inputValue();
    const [y, m, d] = end.split('-').map(Number);
    const moved = new Date(y, m - 1, d);
    moved.setDate(moved.getDate() + 28);
    const p2 = (n: number) => String(n).padStart(2, '0');
    await panel
      .locator('[data-role="end-edit"]')
      .fill(`${moved.getFullYear()}-${p2(moved.getMonth() + 1)}-${p2(moved.getDate())}`);
    await page.locator('[data-apply-schedule]').click();

    await openDash(page);
    const row = page.locator('#gantt-b .g-row[data-index="3"]');
    const bar = (await row.locator('.g-bar').boundingBox())!;
    const dot = (await row.locator('.g-msdot').boundingBox())!;
    expect(Math.abs(dot.x + dot.width / 2 - (bar.x + bar.width))).toBeLessThanOrEqual(1);
    await expect(row.locator('.g-cp')).toContainText(
      `${p2(moved.getMonth() + 1)}/${p2(moved.getDate())}/${moved.getFullYear()}`,
    );
  });
});

test.describe('scoped display settings', () => {
  test('a Dashboard font change leaves Main at 18px', async ({ page }) => {
    await openDash(page);
    await page.locator('#settings-btn').click();
    // opened from the dashboard, so it is the dashboard being adjusted
    await expect(page.locator('.set-scope-note')).toHaveAttribute('data-scope', 'dash');
    await page.locator('#set-font').fill('13');

    await expect(page.locator('#schedule-view')).toHaveCSS('font-size', '13px');
    await expect(page.locator('#dash-title')).toHaveCSS('font-size', /px/);
    // :root and the main page are untouched
    expect(await cssVar(page, '--fs-base')).toBe('18px');
    await expect(page.locator('body')).toHaveCSS('font-size', '18px');
    await page.locator('#mode-toggle button[data-mode="journey"]').click();
    await expect(page.locator('.stage-panel.selected h2')).toBeVisible();
    await expect(page.locator('body')).toHaveCSS('font-size', '18px');
  });

  test('a Main font change leaves the Dashboard on its own default', async ({ page }) => {
    await page.locator('#settings-btn').click();
    // opened from the main page, so only main settings are offered
    await expect(page.locator('.set-scope-note')).toHaveAttribute('data-scope', 'main');
    await expect(page.locator('.set-row[data-key="drow"]')).toHaveCount(0);
    await page.locator('#set-font').fill('22');
    expect(await cssVar(page, '--fs-base')).toBe('22px');
    await expect(page.locator('body')).toHaveCSS('font-size', '22px');
    // the dashboard keeps its own 16px
    await expect(page.locator('#schedule-view')).toHaveCSS('font-size', '16px');
  });

  test('Row height is Dashboard-only and resizes the schedule rows', async ({ page }) => {
    await openDash(page);
    await expect(page.locator('#gantt-b .g-row').first()).toHaveCSS('height', '32px');
    await page.locator('#settings-btn').click();
    await page.locator('#set-drow').fill('48');
    await expect(page.locator('#gantt-b .g-row').first()).toHaveCSS('height', '48px');
    // the roadmap's mini gantt is driven by --gbar-h, not the dashboard row var
    await expect(page.locator('#rm-gantt .g-row').first()).not.toHaveCSS('height', '48px');
  });
});
