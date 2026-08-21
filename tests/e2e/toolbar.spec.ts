import {
  expect,
  test,
  type Page,
  SEED_PROJECT_PATH,
  tapeoutDate,
  setKickoffDate,
} from './fixtures';

const cssVar = (page: Page, name: string) =>
  page.evaluate(
    (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
    name,
  );

test.describe('design tokens', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SEED_PROJECT_PATH);
  });

  test('root carries the reference token values', async ({ page }) => {
    expect(await cssVar(page, '--page')).toBe('#f9f9f7');
    expect(await cssVar(page, '--ink')).toBe('#0b0b0b');
    expect(await cssVar(page, '--accent')).toBe('#256abf');
    expect(await cssVar(page, '--risk')).toBe('#d03b3b');
    expect(await cssVar(page, '--line')).toBe('#e1e0d9');
    expect(await cssVar(page, '--fs-base')).toBe('15px');
    expect(await cssVar(page, '--toolbar-h')).toBe('58px');
    expect(await cssVar(page, '--dash-row-h')).toBe('36px');
    expect(await cssVar(page, '--bck-activities-due')).toBe('5.4rem');
  });

  test('body uses the page background and base font size', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(249, 249, 247)');
    await expect(body).toHaveCSS('font-size', '15px');
  });
});

test.describe('toolbar layout', () => {
  test('is sticky, 58px tall, and pinned to the top', async ({ page }) => {
    await page.goto(SEED_PROJECT_PATH);
    const toolbar = page.locator('#toolbar');
    await expect(toolbar).toHaveCSS('position', 'sticky');
    const box = await toolbar.boundingBox();
    expect(box?.height).toBe(58);
    expect(box?.y).toBe(0);
  });

  for (const width of [1920, 1440, 1280] as const) {
    test(`carries the program, its template and the way in at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(SEED_PROJECT_PATH);
      // Dates are not in the toolbar any more — the milestone axis carries them.
      await expect(page.locator('[data-computed]')).toHaveCount(0);
      await expect(page.locator('#kickoff-input')).toHaveCount(0);
      await expect(page.locator('#project-name')).toBeVisible();
      await expect(page.locator('#profile-select')).toBeVisible();
      await expect(page.locator('#stages-btn')).toBeVisible();
      // The toolbar stays on one row at every desktop stop.
      expect((await page.locator('#toolbar').boundingBox())?.height).toBe(58);
    });
  }

  test('brand badge sits bottom-right and ignores pointers', async ({ page }) => {
    await page.goto(SEED_PROJECT_PATH);
    const badge = page.locator('#brand-badge');
    await expect(badge).toHaveText('AtlasPM');
    await expect(badge).toHaveCSS('position', 'fixed');
    await expect(badge).toHaveCSS('pointer-events', 'none');
  });

  test('EDITED flag is hidden until the schedule has overrides', async ({ page }) => {
    await page.goto(SEED_PROJECT_PATH);
    await expect(page.locator('.edited-flag')).toBeHidden();
    await page.evaluate(() => document.body.classList.add('has-overrides'));
    await expect(page.locator('.edited-flag')).toBeVisible();
  });
});

test.describe('toolbar controls', () => {
  test('project name edits inline, Enter commits and Escape reverts', async ({ page }) => {
    await page.goto(SEED_PROJECT_PATH);
    await page.locator('#project-name').click();
    await page.locator('#project-name-input').fill('AtlasAX1');
    await page.keyboard.press('Enter');
    await expect(page.locator('#project-name')).toHaveText('AtlasAX1');

    await page.locator('#project-name').click();
    await page.locator('#project-name-input').fill('Discarded');
    await page.keyboard.press('Escape');
    await expect(page.locator('#project-name')).toHaveText('AtlasAX1');
  });

  test('kickoff is edited on the axis, and the template select round-trips', async ({ page }) => {
    await page.goto(SEED_PROJECT_PATH);
    // The seed kicks off 66 weeks before today, so "today" sits mid-program.
    const expected = new Date();
    expected.setHours(0, 0, 0, 0);
    expected.setDate(expected.getDate() - 66 * 7);
    await expect(page.locator('#rm-gantt .g-kickoff-date')).toHaveText(
      `${expected.getMonth() + 1}/${expected.getDate()}`,
    );

    await setKickoffDate(page, '2028-01-03');
    await expect(page.locator('#rm-gantt .g-kickoff-date')).toHaveText('1/3');
    // changing kickoff moves the whole program
    await expect.poll(() => tapeoutDate(page)).toBe('08/27/2029');

    const profile = page.locator('#profile-select');
    await expect(page.locator('label[for="profile-select"]')).toHaveText('Milestone template');
    await expect(profile).toHaveValue('typicalSoC');
    // Profiles are rows now: a fresh database ships with the built-in one only.
    await expect(profile.locator('option')).toHaveCount(1);
    await expect(profile.locator('option')).toHaveText('Typical SoC');
    await expect(page.locator('#stages-btn')).toHaveText('Edit template');
  });

  test('mode toggle drives body.schedule-mode and the dashboard overlay', async ({ page }) => {
    await page.goto(SEED_PROJECT_PATH);
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
    await page.goto(SEED_PROJECT_PATH);
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
    await page.goto(SEED_PROJECT_PATH);
    await page.locator('#settings-btn').click();
    await expect(page.locator('#settings-panel')).toBeVisible();

    /* the slider is centred on 15, so 20 is inside its range */
    await page.locator('#set-font').fill('20');
    expect(await cssVar(page, '--fs-base')).toBe('20px');
    await expect(page.locator('#set-font-val')).toHaveText('20px');
    await expect(page.locator('body')).toHaveCSS('font-size', '20px');

    await page.locator('#set-reset').click();
    expect(await cssVar(page, '--fs-base')).toBe('15px');
    await expect(page.locator('#set-font-val')).toHaveText('15px');
  });

  test('Programs leads the bar, the program fields sit centred between the controls', async ({
    page,
  }) => {
    await page.goto(SEED_PROJECT_PATH);
    const programs = (await page.locator('#to-programs').boundingBox())!;
    const centre = (await page.locator('.tb-centre').boundingBox())!;
    const settings = (await page.locator('#settings-btn').boundingBox())!;
    const modes = (await page.locator('#mode-toggle').boundingBox())!;

    // the link comes first, the view controls last, the rest between them
    expect(programs.x + programs.width).toBeLessThanOrEqual(centre.x + 1);
    expect(centre.x + centre.width).toBeLessThanOrEqual(settings.x + 1);
    expect(settings.x).toBeLessThan(modes.x);

    // and that middle group is centred in the space they leave it
    const content = (await page.locator('#project-name').boundingBox())!;
    const last = (await page.locator('#info-note').boundingBox())!;
    const mid = (content.x + last.x + last.width) / 2;
    expect(Math.abs(mid - (centre.x + centre.width / 2))).toBeLessThan(2);

    // it reads as a button rather than a caption
    const style = await page.locator('#to-programs').evaluate((el) => {
      const c = getComputedStyle(el);
      return { border: c.borderTopWidth, transform: c.textTransform, weight: c.fontWeight };
    });
    expect(style).toEqual({ border: '1px', transform: 'uppercase', weight: '700' });

    await page.locator('#to-programs').click();
    await expect(page.locator('.pl-card').first()).toBeVisible();
  });

  test('the panel offers the settings of the view it was opened from', async ({ page }) => {
    await page.goto(SEED_PROJECT_PATH);
    await page.locator('#settings-btn').click();
    // Main: icon size applies, the dashboard's row height does not
    await expect(page.locator('.set-scope-note')).toHaveAttribute('data-scope', 'main');
    await expect(page.locator('.set-row[data-key="icon"]')).toBeVisible();
    await expect(page.locator('.set-row[data-key="drow"]')).toHaveCount(0);
    await expect(page.locator('.set-scope')).toHaveCount(0); // no scope switch any more

    await page.keyboard.press('Escape');
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await page.locator('#settings-btn').click();
    await expect(page.locator('.set-scope-note')).toHaveAttribute('data-scope', 'dash');
    await expect(page.locator('.set-row[data-key="icon"]')).toHaveCount(0);
    await expect(page.locator('.set-row[data-key="drow"]')).toBeVisible();

    // Dashboard text size writes onto #schedule-view, leaving Main at 16px.
    await page.locator('#set-font').fill('15');
    expect(await cssVar(page, '--fs-base')).toBe('15px');
    await expect(page.locator('#schedule-view')).toHaveCSS('font-size', '15px');
  });

  test('icon multiplier renders trimmed', async ({ page }) => {
    await page.goto(SEED_PROJECT_PATH);
    await page.locator('#settings-btn').click();
    await expect(page.locator('#set-icon-val')).toHaveText('2×');
    await page.locator('#set-icon').fill('2.25');
    await expect(page.locator('#set-icon-val')).toHaveText('2.25×');
    expect(await cssVar(page, '--icon-scale')).toBe('2.25');
  });
});
