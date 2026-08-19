import { expect, test, type Page } from './fixtures';

const cssVar = (page: Page, name: string) =>
  page.evaluate(
    (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
    name,
  );

test.describe('design tokens', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('root carries the reference token values', async ({ page }) => {
    expect(await cssVar(page, '--page')).toBe('#f9f9f7');
    expect(await cssVar(page, '--ink')).toBe('#0b0b0b');
    expect(await cssVar(page, '--accent')).toBe('#256abf');
    expect(await cssVar(page, '--risk')).toBe('#d03b3b');
    expect(await cssVar(page, '--line')).toBe('#e1e0d9');
    expect(await cssVar(page, '--fs-base')).toBe('18px');
    expect(await cssVar(page, '--toolbar-h')).toBe('58px');
    expect(await cssVar(page, '--dash-row-h')).toBe('36px');
    expect(await cssVar(page, '--bck-risks-due')).toBe('7.5rem');
  });

  test('body uses the page background and base font size', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(249, 249, 247)');
    await expect(body).toHaveCSS('font-size', '18px');
  });
});

test.describe('toolbar layout', () => {
  test('is sticky, 58px tall, and pinned to the top', async ({ page }) => {
    await page.goto('/');
    const toolbar = page.locator('#toolbar');
    await expect(toolbar).toHaveCSS('position', 'sticky');
    const box = await toolbar.boundingBox();
    expect(box?.height).toBe(58);
    expect(box?.y).toBe(0);
  });

  for (const [width, opt1, opt2] of [
    [1920, true, true],
    [1440, false, false],
    [1280, false, false],
  ] as const) {
    test(`shows the right computed fields at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      // Tapeout is never dropped; First Silicon / Production shed at 1560/1760.
      await expect(page.locator('[data-computed="tapeout"]')).toBeVisible();
      await expect(page.locator('.tb-opt1')).toBeVisible({ visible: opt1 });
      await expect(page.locator('.tb-opt2')).toBeVisible({ visible: opt2 });
      // The toolbar stays on one row at every desktop stop.
      expect((await page.locator('#toolbar').boundingBox())?.height).toBe(58);
    });
  }

  test('brand badge sits bottom-right and ignores pointers', async ({ page }) => {
    await page.goto('/');
    const badge = page.locator('#brand-badge');
    await expect(badge).toHaveText('AtlasPM');
    await expect(badge).toHaveCSS('position', 'fixed');
    await expect(badge).toHaveCSS('pointer-events', 'none');
  });

  test('EDITED flag is hidden until the schedule has overrides', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.edited-flag')).toBeHidden();
    await page.evaluate(() => document.body.classList.add('has-overrides'));
    await expect(page.locator('.edited-flag')).toBeVisible();
  });
});

test.describe('toolbar controls', () => {
  test('project name edits inline, Enter commits and Escape reverts', async ({ page }) => {
    await page.goto('/');
    await page.locator('#project-name').click();
    await page.locator('#project-name-input').fill('AtlasAX1');
    await page.keyboard.press('Enter');
    await expect(page.locator('#project-name')).toHaveText('AtlasAX1');

    await page.locator('#project-name').click();
    await page.locator('#project-name-input').fill('Discarded');
    await page.keyboard.press('Escape');
    await expect(page.locator('#project-name')).toHaveText('AtlasAX1');
  });

  test('kickoff and profile round-trip their values', async ({ page }) => {
    await page.goto('/');
    // The store seeds kickoff 30 weeks before today, so "today" sits mid-program.
    const expected = new Date();
    expected.setHours(0, 0, 0, 0);
    expected.setDate(expected.getDate() - 210);
    const p2 = (n: number) => String(n).padStart(2, '0');
    await expect(page.locator('#kickoff-input')).toHaveValue(
      `${expected.getFullYear()}-${p2(expected.getMonth() + 1)}-${p2(expected.getDate())}`,
    );
    await page.locator('#kickoff-input').fill('2028-01-03');
    await expect(page.locator('#kickoff-input')).toHaveValue('2028-01-03');
    // changing kickoff moves the whole program
    await expect(page.locator('[data-computed="tapeout"]')).toHaveText('09/25/2028');

    const profile = page.locator('#profile-select');
    await expect(profile).toHaveValue('typicalSoC');
    // The other three profiles ship disabled, as in the reference.
    expect(await profile.locator('option:not([disabled])').count()).toBe(1);
  });

  test('mode toggle drives body.schedule-mode and the dashboard overlay', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('#mode-toggle button[data-mode="journey"]');
    const dash = page.locator('#mode-toggle button[data-mode="schedule"]');
    await expect(main).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#schedule-view')).toBeHidden();

    await dash.click();
    await expect(dash).toHaveAttribute('aria-pressed', 'true');
    await expect(main).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#schedule-view')).toBeVisible();
    await expect(page.locator('body')).toHaveClass(/schedule-mode/);

    await page.keyboard.press('Escape');
    await expect(page.locator('#schedule-view')).toBeHidden();
    await expect(main).toHaveAttribute('aria-pressed', 'true');
  });

  test('info popover opens on click and closes on outside click', async ({ page }) => {
    await page.goto('/');
    const panel = page.locator('#info-note .pop-panel');
    await expect(panel).toBeHidden();
    await page.locator('#info-btn').click();
    await expect(panel).toBeVisible();
    await expect(page.locator('#info-btn')).toHaveAttribute('aria-expanded', 'true');
    await page.locator('#stage-panels').click({ position: { x: 5, y: 5 }, force: true });
    await expect(panel).toBeHidden();
  });
});

test.describe('display settings', () => {
  test('text size writes --fs-base on :root for the Main scope', async ({ page }) => {
    await page.goto('/');
    await page.locator('#settings-btn').click();
    await expect(page.locator('#settings-panel')).toBeVisible();

    await page.locator('#set-font').fill('22');
    expect(await cssVar(page, '--fs-base')).toBe('22px');
    await expect(page.locator('#set-font-val')).toHaveText('22px');
    await expect(page.locator('body')).toHaveCSS('font-size', '22px');

    await page.locator('#set-reset').click();
    expect(await cssVar(page, '--fs-base')).toBe('18px');
    await expect(page.locator('#set-font-val')).toHaveText('18px');
  });

  test('scopes hold independent rows — icon is Main-only, row height Dashboard-only', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('#settings-btn').click();
    await expect(page.locator('.set-row[data-key="icon"]')).toBeVisible();
    await expect(page.locator('.set-row[data-key="drow"]')).toBeHidden();

    await page.locator('#set-scope button[data-scope="dash"]').click();
    await expect(page.locator('.set-row[data-key="icon"]')).toBeHidden();
    await expect(page.locator('.set-row[data-key="drow"]')).toBeVisible();

    // Dashboard text size writes onto #schedule-view, leaving Main at 18px.
    await page.locator('#set-font').fill('15');
    expect(await cssVar(page, '--fs-base')).toBe('18px');
    await expect(page.locator('#schedule-view')).toHaveCSS('font-size', '15px');
  });

  test('icon multiplier renders trimmed', async ({ page }) => {
    await page.goto('/');
    await page.locator('#settings-btn').click();
    await expect(page.locator('#set-icon-val')).toHaveText('2×');
    await page.locator('#set-icon').fill('2.25');
    await expect(page.locator('#set-icon-val')).toHaveText('2.25×');
    expect(await cssVar(page, '--icon-scale')).toBe('2.25');
  });
});
