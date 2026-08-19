import { expect, test, type Page } from './fixtures';

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
  await page.goto('/');
  await expect(page.locator('.stage-panel.selected')).toBeVisible();
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
      await page.locator('[data-computed="tapeout"]').textContent() as string,
    );
    // D-day is derived, so recompute it rather than pinning a calendar date
    const date = (await tapeout.locator('.sub').textContent())!;
    const [m, d, y] = date.split('/').map(Number);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.ceil((new Date(y, m - 1, d).getTime() - today.getTime()) / 86400000);
    await expect(tapeout.locator('.v')).toHaveText(`D−${days}`);

    const risks = stat(page, 'Open Risks');
    await expect(risks.locator('.v')).toHaveText('7');
    await expect(risks).toHaveClass(/alert/);
    await expect(risks.locator('.v')).toHaveCSS('color', 'rgb(208, 59, 59)');
    await expect(risks.locator('.sub')).toHaveText(
      'Physical Design, Signoff, Tapeout, Advanced Packaging',
    );

    const overdue = stat(page, 'Overdue Activities');
    await expect(overdue.locator('.v')).toHaveText('1');
    await expect(overdue).toHaveClass(/alert/);
  });

  test('the counters follow the data', async ({ page }) => {
    // complete one deliverable on Physical Design: 23/45 → 24/45 = 53%
    await page.locator('.rm-station', { hasText: /^06 / }).hover();
    const panel = page.locator('.stage-panel.selected');
    await panel.locator('.dlv-list li').nth(2).locator('input[type="checkbox"]').check();
    await openDash(page);
    await expect(stat(page, 'Program Progress').locator('.v')).toHaveText('53%');
    await expect(stat(page, 'Program Progress').locator('.sub')).toHaveText(
      '24 of 45 deliverables complete',
    );
  });

  test('a stage with no open risks drops out of the risk list', async ({ page }) => {
    await page.locator('.rm-station', { hasText: /^02 / }).hover();
    const panel = page.locator('.stage-panel.selected');
    await panel.locator('[data-potential]').click();
    await panel.locator('.pr-add').first().click();
    await openDash(page);
    await expect(stat(page, 'Open Risks').locator('.v')).toHaveText('8');
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
  test('rows are 36px and the TODAY line is drawn', async ({ page }) => {
    await openDash(page);
    const rows = page.locator('#gantt-b .g-row');
    await expect(rows).toHaveCount(12);
    await expect(rows.first()).toHaveCSS('height', '36px');
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

  test('the label chip flips left near the right edge', async ({ page }) => {
    await openDash(page);
    // Mass Production is the last milestone — its chip hangs to the left
    const chip = page.locator('#gantt-b .g-row[data-index="11"] .g-cp');
    await expect(chip).toHaveClass(/flip/);
    const dot = (await page
      .locator('#gantt-b .g-row[data-index="11"] .g-msdot')
      .boundingBox())!;
    const box = (await chip.boundingBox())!;
    expect(box.x + box.width).toBeLessThan(dot.x + dot.width / 2);
    // Arch Freeze sits mid-chart, so its chip hangs to the right
    const early = page.locator('#gantt-b .g-row[data-index="1"] .g-cp');
    await expect(early).not.toHaveClass(/flip/);
  });

  test('a date edit moves the bar and its diamond together', async ({ page }) => {
    await page.locator('.rm-station', { hasText: /^04 / }).hover();
    const panel = page.locator('.stage-panel.selected');
    const end = await panel.locator('[data-role="end-edit"]').inputValue();
    const [y, m, d] = end.split('-').map(Number);
    const moved = new Date(y, m - 1, d);
    moved.setDate(moved.getDate() + 28);
    const p2 = (n: number) => String(n).padStart(2, '0');
    await panel
      .locator('[data-role="end-edit"]')
      .fill(`${moved.getFullYear()}-${p2(moved.getMonth() + 1)}-${p2(moved.getDate())}`);

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
    await page.locator('#set-scope button[data-scope="dash"]').click();
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

  test('a Main font change leaves the Dashboard at 18px', async ({ page }) => {
    await page.locator('#settings-btn').click();
    await page.locator('#set-font').fill('22');
    expect(await cssVar(page, '--fs-base')).toBe('22px');
    await expect(page.locator('body')).toHaveCSS('font-size', '22px');
    await expect(page.locator('#schedule-view')).toHaveCSS('font-size', '18px');
  });

  test('Row height is Dashboard-only and resizes the schedule rows', async ({ page }) => {
    await openDash(page);
    await expect(page.locator('#gantt-b .g-row').first()).toHaveCSS('height', '36px');
    await page.locator('#settings-btn').click();
    await page.locator('#set-scope button[data-scope="dash"]').click();
    await page.locator('#set-drow').fill('64');
    await expect(page.locator('#gantt-b .g-row').first()).toHaveCSS('height', '64px');
    // the roadmap's mini gantt is driven by --gbar-h, not the dashboard row var
    await expect(page.locator('#rm-gantt .g-row').first()).not.toHaveCSS('height', '64px');
  });
});
