import { expect, test, SEED_PROJECT_PATH, selectStage, settleLayout } from './fixtures';

/**
 * A first look at reading a stage as a timeline rather than as two tables.
 * One stage carries it for now — RTL — because the question it answers is
 * whether derived starts are worth having, and one stage answers that.
 */
const panel = '.stage-panel.selected';

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await selectStage(page, 'rtl');
  await settleLayout(page);
});

test.describe('the stage timeline', () => {
  test('opens from its own switch, between the switch and the table', async ({ page }) => {
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

    // between the head it opened from and the table it belongs to
    const head = (await page.locator(`${panel} .sheet-head`).first().boundingBox())!;
    const box = (await gantt.boundingBox())!;
    const table = (await page.locator(`${panel} .mm-cols`).boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(head.y + head.height - 1);
    expect(box.y + box.height).toBeLessThanOrEqual(table.y + 1);

    await btn.click();
    await expect(page.locator('[data-stage-gantt]')).toHaveCount(0);
  });

  test('every engineering line and every artefact, on the stage’s own axis', async ({ page }) => {
    await page.locator(`${panel} [data-stage-chart]`).click();
    const gantt = page.locator('[data-stage-gantt]');

    // one row per engineering activity, one per deliverable
    await expect(gantt.locator('[data-sg-act]')).toHaveCount(10);
    await expect(gantt.locator('[data-sg-dlv]')).toHaveCount(7);

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
    const last = (await gantt.locator('[data-sg-dlv]').last().locator('.sg-dot').boundingBox())!;
    expect(Math.abs(last.x + last.width / 2 - gate.x)).toBeLessThanOrEqual(2);
  });

  test('it is one stage’s trial, not every stage’s', async ({ page }) => {
    await selectStage(page, 'physicalDesign');
    await settleLayout(page);
    await expect(page.locator(`${panel} [data-stage-chart]`)).toHaveCount(0);
    await expect(page.locator(`${panel} .sheet-head [data-wrap="engineering"]`)).toHaveCount(1);
  });
});
