import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  expect,
  test,
  type Page,
  SEED_PROJECT_PATH,
  selectStage,
  tapeoutDate,
  settleLayout,
  fileDeliverable,
} from './fixtures';

/** An artefact to file against a deliverable — any real file will do. */
const ARTEFACT = join(tmpdir(), 'atlaspm-artefact.txt');
writeFileSync(ARTEFACT, 'Signed off; report attached.');

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
  await selectStage(page, 'productDefinition');
});

test.describe('stat tiles', () => {
  test('the seed program reads 52% / D−xx / 23 / 7', async ({ page }) => {
    await openDash(page);
    await expect(page.locator('#dash-title')).toHaveText('AtlasAX1 — Dashboard');

    const progress = stat(page, 'Program Progress');
    await expect(progress.locator('.v')).toHaveText('52%');
    await expect(progress.locator('.sub')).toHaveText('87 of 167 deliverables complete');

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
    await expect(risks.locator('.v')).toHaveText('23');
    await expect(risks).toHaveClass(/alert/);
    /* --risk, which is the prototype's #e5484d now rather than the reference's
       #d03b3b: the app has one accent and one risk colour, and they are the
       prototype's because the prototype is the spec. */
    await expect(risks.locator('.v')).toHaveCSS('color', 'rgb(229, 72, 77)');
    /* the stages that carry them, in stage order */
    await expect(risks.locator('.sub')).toContainText('Product Definition, Physical Design');
    await expect(risks.locator('.sub')).toContainText('Test Development');

    const overdue = stat(page, 'Overdue Activities');
    await expect(overdue.locator('.v')).toHaveText('7');
    await expect(overdue).toHaveClass(/alert/);
  });

  test('the counters follow the data', async ({ page }) => {
    /* File one more deliverable and the tile counts it: 87 of 167 → 88. */
    await selectStage(page, 'physicalDesign');
    await settleLayout(page); // the sheet animates in
    /* Completing one means filing its record — the artefact is the tick. */
    await fileDeliverable(page, 'Interim physical DRC', ARTEFACT);
    await openDash(page);
    await expect(stat(page, 'Program Progress').locator('.sub')).toHaveText(
      '88 of 167 deliverables complete',
    );
    await expect(stat(page, 'Program Progress').locator('.v')).toHaveText('53%');
  });

  test('a stage with no open risks drops out of the risk list', async ({ page }) => {
    await selectStage(page, 'architecture');
    const panel = page.locator('.stage-panel.selected');
    await settleLayout(page);
    await panel.locator('[data-potential]').click();
    await panel.locator('.pr-add').first().click();
    // the checklist opens over the page now, so it is closed before moving on
    await page.locator('[data-pr-close]').click();
    await openDash(page);
    await expect(stat(page, 'Open Risks').locator('.v')).toHaveText('24');
    await expect(stat(page, 'Open Risks').locator('.sub')).toContainText('Architecture');
  });
});

test.describe('milestones, in-flight and updates', () => {
  test('upcoming milestones list with D-days, majors filled', async ({ page }) => {
    await openDash(page);
    /* The four soonest milestones still ahead — which four depends on the
       template, so the test pins the shape rather than the names. */
    const items = page.locator('.dash-item');
    await expect(items).toHaveCount(4);
    for (const t of await items.locator('.t').allTextContents()) {
      expect(t).toMatch(/^[◇◆] \S/);
    }
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
    /* Stages overlap, so several run today; Physical Design is one of them and
       carries open risks, which is what turns a chip red. */
    const chips = page.locator('.dash-flight span');
    expect(await chips.count()).toBeGreaterThan(0);
    const pd = chips.filter({ hasText: 'Physical Design' });
    await expect(pd).toHaveCount(1);
    await expect(pd).toHaveClass(/risky/);
    await expect(pd).toHaveCSS('color', 'rgb(229, 72, 77)');
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
    // the entry reads in the pane, with its stage's board listed above it
    await expect(page.locator('#modal-pane')).toBeVisible();
    await expect(page.locator('#modal-list .b-row').first()).toBeVisible();
    await page.locator('#modal-close').click();

    await page.locator('[data-dash-open="updates"]').click();
    await expect(page.locator('#modal-head h3')).toHaveText('Status Updates — All Stages');
  });
});

test.describe('program schedule gantt', () => {
  test('rows are 32px and the TODAY line is drawn', async ({ page }) => {
    await openDash(page);
    const rows = page.locator('#gantt-b .g-row');
    /* one row per stage of the program's template */
    await expect(rows).toHaveCount(23);
    await expect(rows.first()).toHaveCSS('height', '32px');
    await expect(page.locator('#gantt-b .g-today')).toBeVisible();
    /* the caption rides the calendar above the rows, so it stays in view
       however far down a 23-stage chart is scrolled */
    await expect(page.locator('#gantt-b .g-today-cap')).toHaveText(/^Today \d{1,2}\/\d{1,2}$/);
    // full labels here, short codes on the roadmap's mini chart
    await expect(rows.first().locator('.g-row-label')).toHaveText('Product Definition');
  });

  test('the Tapeout diamond sits exactly on the bar end', async ({ page }) => {
    await openDash(page);
    const row = page.locator('#gantt-b .g-row[data-stage="tapeout"]');
    const bar = (await row.locator('.g-bar').boundingBox())!;
    const dot = (await row.locator('.g-msdot').boundingBox())!;
    const barEnd = bar.x + bar.width;
    const dotCenter = dot.x + dot.width / 2;
    expect(Math.abs(dotCenter - barEnd)).toBeLessThanOrEqual(1);
    await expect(row.locator('.g-cp')).toContainText('Tapeout');
  });

  test('every end-anchored milestone lands on its stage bar end', async ({ page }) => {
    await openDash(page);
    /* every row that carries one, whichever stages the template anchors them to */
    const rows = page.locator('#gantt-b .g-row').filter({ has: page.locator('.g-msdot') });
    const count = await rows.count();
    expect(count).toBeGreaterThan(6);
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const stage = await row.getAttribute('data-stage');
      const bar = (await row.locator('.g-bar').boundingBox())!;
      const dot = (await row.locator('.g-msdot').first().boundingBox())!;
      expect(Math.abs(dot.x + dot.width / 2 - (bar.x + bar.width)), stage!).toBeLessThanOrEqual(1);
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
    /* one per milestone the template anchors to a stage end */
    expect(rows.length).toBeGreaterThan(6);
    for (const r of rows) {
      expect(r!.overlapsBar, r!.stage).toBe(false);
      expect(r!.rightOfDiamond, r!.stage).toBe(true);
    }
    // the arrow that ties label to diamond is on every one of them
    const arrows = await page
      .locator('#gantt-b .g-cp')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el, '::before').borderRightWidth));
    expect(new Set(arrows)).toEqual(new Set(['5px']));
  });

  test('a date edit moves the bar and its diamond together', async ({ page }) => {
    await selectStage(page, 'verification');
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
    const row = page.locator('#gantt-b .g-row[data-stage="verification"]');
    const bar = (await row.locator('.g-bar').boundingBox())!;
    const dot = (await row.locator('.g-msdot').boundingBox())!;
    expect(Math.abs(dot.x + dot.width / 2 - (bar.x + bar.width))).toBeLessThanOrEqual(1);
    await expect(row.locator('.g-cp')).toContainText(
      `${p2(moved.getMonth() + 1)}/${p2(moved.getDate())}/${moved.getFullYear()}`,
    );
  });
});

test.describe('scoped display settings', () => {
  test('a Dashboard font change leaves Main at its own size', async ({ page }) => {
    await openDash(page);
    await page.locator('#settings-btn').click();
    // opened from the dashboard, so it is the dashboard being adjusted
    await expect(page.locator('.set-scope-note')).toHaveAttribute('data-scope', 'dash');
    await page.locator('#set-font').fill('13');

    await expect(page.locator('#schedule-view')).toHaveCSS('font-size', '13px');
    await expect(page.locator('#dash-title')).toHaveCSS('font-size', /px/);
    // :root and the main page are untouched
    expect(await cssVar(page, '--fs-base')).toBe('15px');
    await expect(page.locator('body')).toHaveCSS('font-size', '15px');
    await page.locator('#mode-toggle button[data-mode="journey"]').click();
    await expect(page.locator('.stage-panel.selected h2')).toBeVisible();
    await expect(page.locator('body')).toHaveCSS('font-size', '15px');
  });

  test('a Main font change leaves the Dashboard on its own default', async ({ page }) => {
    await page.locator('#settings-btn').click();
    // opened from the main page, so only main settings are offered
    await expect(page.locator('.set-scope-note')).toHaveAttribute('data-scope', 'main');
    await expect(page.locator('.set-row[data-key="drow"]')).toHaveCount(0);
    await page.locator('#set-font').fill('20');
    expect(await cssVar(page, '--fs-base')).toBe('20px');
    await expect(page.locator('body')).toHaveCSS('font-size', '20px');
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
