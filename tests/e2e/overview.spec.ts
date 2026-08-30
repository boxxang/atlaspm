import { expect, test, SHELL_PATH } from './fixtures';

/**
 * Overview and Timeline.
 *
 * The two screens that answer "where is the programme" — the first in figures
 * and a list of what to do, the second in time.
 */

const open = async (page: import('./fixtures').Page, path: string, ready: string) => {
  await page.goto(path);
  await expect(page.locator(ready).first()).toBeVisible();
};

test.describe('Overview', () => {
  test.beforeEach(async ({ page }) => {
    await open(page, `${SHELL_PATH}/overview`, '[data-attn]');
  });

  test('the figures agree with the pages behind them', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Program' });
    const risks = await nav.getByRole('link', { name: /^Risks/ }).locator('.c, .cr').innerText();
    const overdue = await nav.getByRole('link', { name: /^Overdue/ }).locator('.c, .cr').innerText();

    await expect(page.locator('.subcap').filter({ hasText: 'Open risks' }).locator('..')).toContainText(risks);
    await expect(page.locator('.subcap').filter({ hasText: 'Overdue' }).locator('..')).toContainText(overdue);
  });

  /* The figures are a summary bar, not links — the two lists they summarise get
     their own buttons on the card below, which is where the mockup puts them. */
  test('the two lists that need answering are one click away', async ({ page }) => {
    await page.getByRole('link', { name: 'All overdue' }).click();
    await expect(page).toHaveURL(/\/overdue$/);
  });

  test('Needs you today is ranked, and hides nothing', async ({ page }) => {
    const rows = page.locator('[data-attn]');
    const n = await rows.count();
    expect(n).toBeGreaterThan(10);
    /* the count in the header is the whole list, not what fits */
    await expect(
      page.locator('.card').filter({ hasText: 'Needs you today' }).locator('.pill').first(),
    ).toHaveText(String(n));

    /* every overdue row comes before every due-soon row */
    const tags = await page.locator('[data-attn] .pill').allTextContents();
    const lastOverdue = tags.lastIndexOf('Overdue');
    const firstOther = tags.findIndex((t) => t !== 'Overdue');
    if (firstOther !== -1) expect(lastOverdue).toBeLessThan(firstOther);
  });

  test('every overdue step is on it — none are capped away', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Program' });
    const overdue = Number(
      await nav.getByRole('link', { name: /^Overdue/ }).locator('.c, .cr').innerText(),
    );
    const steps = await page.locator('[data-attn^="s:"]').count();
    expect(steps).toBe(overdue);
  });

  test('a row goes to the work it is about, and says so in the link', async ({ page }) => {
    const row = page.locator('[data-attn^="s:"]').first();
    const [, act, n] = (await row.getAttribute('data-attn'))!.split(':');
    await row.click();

    /* the step travels in the URL, so the link is one somebody can send */
    await expect(page).toHaveURL(new RegExp(`/stage/\\w+/activity\\?step=${act}:${n}$`));
    const rail = page.getByRole('complementary', { name: 'Details' });
    await expect(rail).toContainText(`Step ${n} of`);
    await expect(rail.locator('.ref')).toHaveText(act);
  });

  /* A deliverable row goes to the step that hands it over, not to the
     deliverables list: the thing to do about a late deliverable is the work
     that produces it. Only a deliverable nobody produces falls back to the
     list, since there is no step to send anyone to. */
  test('a deliverable row goes to the step that hands it over', async ({ page }) => {
    const row = page.locator('[data-attn^="d:"]').first();
    await row.click();
    await expect(page).toHaveURL(/\/(activity\?step=|deliverables\?deliverable=)/);

    const rail = page.getByRole('complementary', { name: 'Details' });
    await expect(rail).toContainText(page.url().includes('step=') ? 'Step' : 'Handover');
  });

  test('in flight today lists the stages running now, with what is late', async ({ page }) => {
    const card = page.locator('.card').filter({ hasText: 'In flight today' });
    expect(await card.locator('.trow').count()).toBeGreaterThan(0);
  });

  test('the effort figure is the programme’s, not the rows on screen', async ({ page }) => {
    const card = page.locator('.card').filter({ hasText: 'Where the effort goes' });
    const total = Number((await card.locator('.num').first().innerText()).replace(/[^\d]/g, ''));
    const shown = (await card.locator('.num').allInnerTexts())
      .slice(1)
      .map((t) => Number(t.replace(/[^\d]/g, '')))
      .reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(shown);
  });
});

test.describe('Timeline', () => {
  test.beforeEach(async ({ page }) => {
    await open(page, `${SHELL_PATH}/timeline`, '[data-timeline]');
  });

  test('draws a bar per stage, grouped by phase, in the order they run', async ({ page }) => {
    await expect(page.locator('[data-tl]')).toHaveCount(23);
    /* the seven lifecycle phases the built-in profile runs on */
    await expect(page.locator('.tl-ph')).toHaveCount(7);
    const lefts = await page
      .locator('.tl-bar')
      .evaluateAll((els) => els.map((e) => (e as HTMLElement).getBoundingClientRect().left));
    /* the first stage starts before the last one does */
    expect(lefts[0]).toBeLessThan(lefts[lefts.length - 1]);
  });

  test('a checkpoint rides the bar of the stage whose end it is', async ({ page }) => {
    const row = page.locator('[data-tl]').filter({ hasText: 'Tapeout & Mask Release' });
    await expect(row.locator('.ms-chip')).toContainText('Tapeout');
    /* the diamond sits at the end of that stage's bar, not in a band of its own,
       and it carries its own date so nothing has to be traced down a column */
    const bar = (await row.locator('.tl-bar').boundingBox())!;
    const dia = (await row.locator('.ms-chip .dia').boundingBox())!;
    expect(Math.abs(dia.x + dia.width / 2 - (bar.x + bar.width))).toBeLessThan(30);
    await expect(row.locator('.ms-chip .dia')).toHaveText(/^\d\d\/\d\d$/);
  });

  /* A bar that ends near the right edge would write its label off the chart, so
     that one writes leftwards instead. Nothing may hang off the edge. */
  test('no checkpoint label is written off the chart', async ({ page }) => {
    for (const size of ['S', 'M', 'L']) {
      await page.getByRole('button', { name: size, exact: true }).click();
      const spill = await page.locator('[data-timeline]').evaluate((box) => {
        let worst = 0;
        for (const el of box.querySelectorAll('.tl-tail')) {
          const lane = el.parentElement!;
          worst = Math.max(
            worst,
            el.getBoundingClientRect().right - lane.getBoundingClientRect().right,
          );
        }
        return Math.round(worst);
      });
      expect(spill, `${size} rows: a label hangs ${spill}px off the chart`).toBeLessThanOrEqual(1);
    }
  });

  test('row height is a setting, and it changes the rows', async ({ page }) => {
    const height = async () => (await page.locator('[data-tl]').first().boundingBox())!.height;
    await page.getByRole('button', { name: 'S', exact: true }).click();
    const tight = await height();
    await page.getByRole('button', { name: 'L', exact: true }).click();
    expect(await height()).toBeGreaterThan(tight);
    await expect(page.getByRole('button', { name: 'L', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('a stage carrying an open risk is drawn as one, and its phase says so', async ({ page }) => {
    /* read the token rather than hard-coding the colour: the palette is the
       mockup's and the test should not be the second place it is written down */
    const risky = await page.locator('.tl-bar').evaluateAll((els) => {
      const want = getComputedStyle(document.documentElement)
        .getPropertyValue('--st-risk')
        .trim();
      const probe = document.createElement('span');
      probe.style.color = want;
      document.body.append(probe);
      const wanted = getComputedStyle(probe).color;
      probe.remove();
      return els.filter((e) => getComputedStyle(e).backgroundColor === wanted).length;
    });
    expect(risky).toBeGreaterThan(0);
    await expect(page.locator('.tl-ph').filter({ hasText: 'at risk' }).first()).toBeVisible();
  });

  /* Opening a stage adds its activities under it on the same axis rather than
     navigating away — what the bar is made of, answered where it is asked. */
  test('a bar opens its activities under it, on the same axis', async ({ page }) => {
    await page.locator('[data-tl="physicalDesign"]').click();
    await expect(page.locator('.tl-head')).toContainText('16 activities');
    await expect(page.locator('[data-tl-act="PD-10"]')).toBeVisible();
    await page.getByRole('button', { name: 'Open stage' }).click();
    await expect(page).toHaveURL(/\/stage\/physicalDesign\/activity$/);
  });

  /* And an activity row goes to the work, not to the write-up: the stage's
     Activity tab with that activity already open and in the rail. Landing on a
     page of prose is a different question from the one the chart asked. */
  test('an activity row opens that activity where the work is', async ({ page }) => {
    await page.locator('[data-tl="physicalDesign"]').click();
    await page.locator('[data-tl-act="PD-10"]').click();
    await expect(page).toHaveURL(/\/stage\/physicalDesign\/activity\?act=PD-10$/);

    /* open, without a second click */
    await expect(page.locator('[data-act="PD-10"]')).toHaveClass(/open/);
    await expect(page.locator('[data-stepblock] .chead')).toContainText('PD-10');
    const rail = page.getByRole('complementary', { name: 'Details' });
    await expect(rail).toContainText('Signal and Power Integrity');

    /* and it still closes on a click, rather than being pinned open by the URL */
    await page.locator('[data-act="PD-10"]').click();
    await expect(page.locator('[data-stepblock]')).toHaveCount(0);
  });
});
