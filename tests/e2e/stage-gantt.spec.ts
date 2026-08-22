import { expect, test, SEED_PROJECT_PATH, selectStage, settleLayout } from './fixtures';

/**
 * A stage read as a timeline rather than as two tables. RTL carries most of
 * the assertions because its plan is the one worked through first, but every
 * stage draws one from a plan of its own.
 */
const panel = '.stage-panel.selected';

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await selectStage(page, 'rtl');
  await settleLayout(page);
});

test.describe('the stage timeline', () => {
  test('opens from its own switch, above the headers and the tables', async ({ page }) => {
    await expect(page.locator('[data-stage-gantt]')).toHaveCount(0);

    const btn = page.locator(`${panel} [data-stage-chart]`);
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
    // left of the wrap toggle, which is left of Edit
    const [chart, wrap, edit] = await Promise.all([
      btn.boundingBox(),
      page.locator(`${panel} .sheet-head [data-wrap="engineering"]`).boundingBox(),
      page.locator(`${panel} .sheet-head [data-mm-edit]`).boundingBox(),
    ]);
    expect(chart!.x).toBeLessThan(wrap!.x);
    expect(wrap!.x).toBeLessThan(edit!.x);

    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
    const gantt = page.locator('[data-stage-gantt]');
    await expect(gantt).toBeVisible();

    /* Above both header rows, which title the tables rather than the
       timeline: a column heading belongs against the column it heads. */
    const box = (await gantt.boundingBox())!;
    for (const head of await page.locator(`${panel} .sheet-head`).all()) {
      const h = (await head.boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(h.y + 1);
    }
    const table = (await page.locator(`${panel} .mm-cols`).boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(table.y + 1);

    await btn.click();
    await expect(page.locator('[data-stage-gantt]')).toHaveCount(0);
  });

  test('every engineering line and every artefact, on the stage’s own axis', async ({ page }) => {
    await page.locator(`${panel} [data-stage-chart]`).click();
    const gantt = page.locator('[data-stage-gantt]');

    // one row per engineering activity; the artefacts ride the work
    await expect(gantt.locator('[data-sg-act]')).toHaveCount(10);
    await expect(gantt.locator('.sg-row.dlv')).toHaveCount(0);
    await expect(gantt.locator('[data-sg-dlv]')).toHaveCount(7);
    // each on the bar of the activity that produces it
    await expect(gantt.locator('[data-sg-on="RTL-07"]')).toHaveCount(1); // the register map
    await expect(gantt.locator('[data-sg-on="RTL-08"]')).toHaveCount(1); // the freeze package

    /* Durations are the table's TATs, not a second set of numbers: RTL-02 is
       recorded as 24 weeks and reads as 24 weeks. */
    const bar = gantt.locator('[data-sg-act="RTL-02"]');
    await expect(bar.locator('.sg-bar-t')).toHaveText('24W');
    await expect(
      page.locator(`${panel} .mm-list li`).nth(1).locator('.mm-input.tat'),
    ).toContainText('24');

    // a continuous line runs the stage rather than a length of it
    const cont = gantt.locator('[data-sg-act="RTL-09"] .sg-bar');
    await expect(cont).toHaveClass(/cont/);
    await expect(gantt.locator('[data-sg-act="RTL-09"] .sg-bar-t')).toHaveText('cont.');

    // and the last artefact is due on the gate, which is drawn
    const gate = (await gantt.locator('[data-sg-gate]').boundingBox())!;
    const last = (await gantt.locator('[data-sg-on="RTL-08"]').boundingBox())!;
    expect(Math.abs(last.x + last.width / 2 - gate.x)).toBeLessThanOrEqual(2);
  });

  test('every stage draws one, from its own plan', async ({ page }) => {
    for (const stage of ['productDefinition', 'physicalDesign', 'tapeout', 'qualification']) {
      await selectStage(page, stage);
      await settleLayout(page);
      await page.locator(`${panel} [data-stage-chart]`).click();
      const gantt = page.locator('[data-stage-gantt]');
      await expect(gantt, stage).toBeVisible();
      // drawn from what the stage states, not from the order of its list
      await expect(gantt.locator('.sg-cap .note'), stage).toContainText('the stage’s own plan');
      // one bar per engineering line, every artefact on the work that makes it
      expect(await gantt.locator('[data-sg-act]').count(), stage).toBe(
        await page.locator(`${panel} .mm-list li`).count(),
      );
      await expect(gantt.locator('.sg-row.dlv'), stage).toHaveCount(0);
      expect(await gantt.locator('[data-sg-dlv]').count(), stage).toBe(
        await page.locator(`${panel} .dlv-list li`).count(),
      );
      await page.locator(`${panel} [data-stage-chart]`).click();
    }
  });

  test('January says which January it is', async ({ page }) => {
    /* A stage that crosses a new year should say so on its axis rather than
       only in the caption above it — the roadmap's axis does the same. */
    await selectStage(page, 'tapeout'); // runs from November into January
    await settleLayout(page);
    await page.locator(`${panel} [data-stage-chart]`).click();
    const months = await page.locator('[data-stage-gantt] .sg-month').allTextContents();
    expect(months.some((m) => /^Jan ’\d{2}$/.test(m))).toBe(true);
    for (const m of months) expect(m).toMatch(/^[A-Z][a-z]{2}( ’\d{2})?$/);
  });
});

test.describe('the chart is read at the width of the stage', () => {
  test('it spans both tables, which sit under it', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1300 });
    await page.locator(`${panel} [data-stage-chart]`).click();
    const gantt = (await page.locator('[data-stage-gantt]').boundingBox())!;
    const bodies = await page.locator(`${panel} .sheet-grid .sh-body`).all();
    const [left, right] = await Promise.all(bodies.map((b) => b.boundingBox()));

    // as wide as the two tables together, and above both of them
    expect(gantt.x).toBeLessThanOrEqual(left!.x + 1);
    expect(gantt.x + gantt.width).toBeGreaterThanOrEqual(right!.x + right!.width - 1);
    expect(gantt.y + gantt.height).toBeLessThanOrEqual(left!.y + 1);
    expect(gantt.y + gantt.height).toBeLessThanOrEqual(right!.y + 1);

    // and the tables still finish level with it open
    expect(Math.round(left!.height)).toBe(Math.round(right!.height));
  });

  test('the bars are the stage’s plan, not a guess at one', async ({ page }) => {
    await page.locator(`${panel} [data-stage-chart]`).click();
    const gantt = page.locator('[data-stage-gantt]');
    await expect(gantt.locator('.sg-cap .note')).toContainText('the stage’s own plan');

    /* The plan opens with the specification and starts the RTL under its tail
       rather than after it — which is the whole point of stating one. */
    const x = async (id: string) =>
      (await gantt.locator(`[data-sg-act="${id}"] .sg-bar`).boundingBox())!;
    const spec = await x('RTL-01');
    const rtl = await x('RTL-02');
    const regmap = await x('RTL-07');
    expect(Math.round(spec.x)).toBe(Math.round(regmap.x) - Math.round(regmap.x - spec.x));
    expect(rtl.x).toBeGreaterThan(spec.x); // starts later
    expect(rtl.x).toBeLessThan(spec.x + spec.width); // but before the spec ends
    // and the two continuous lines run the whole stage
    for (const id of ['RTL-09', 'RTL-10']) {
      const b = await x(id);
      expect(Math.round(b.x)).toBe(Math.round(spec.x));
      expect(b.width).toBeGreaterThan(spec.width * 2);
    }
  });
});
