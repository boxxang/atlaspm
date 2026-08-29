import { expect, test, SHELL_PATH } from './fixtures';

/**
 * Overview and Timeline.
 *
 * The two screens that answer "where is the programme" — the first in figures
 * and a list of what to do, the second in time.
 */

const open = async (page: import('./fixtures').Page, path: string, ready: string) => {
  await page.goto(path);
  await expect(page.locator(ready)).toBeVisible();
};

test.describe('Overview', () => {
  test.beforeEach(async ({ page }) => {
    await open(page, `${SHELL_PATH}/overview`, '.pstats');
  });

  test('the figures agree with the pages behind them', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Program' });
    const risks = await nav.getByRole('link', { name: /^Risks/ }).locator('.pnav-n').innerText();
    const overdue = await nav.getByRole('link', { name: /^Overdue/ }).locator('.pnav-n').innerText();

    await expect(page.locator('.pstat').filter({ hasText: 'Open risks' })).toContainText(risks);
    await expect(page.locator('.pstat').filter({ hasText: 'Overdue' })).toContainText(overdue);
  });

  test('every figure opens the list behind it', async ({ page }) => {
    await page.locator('.pstat').filter({ hasText: 'Overdue' }).click();
    await expect(page).toHaveURL(/\/overdue$/);
  });

  test('Needs you today is ranked, and hides nothing', async ({ page }) => {
    const rows = page.locator('[data-attn]');
    const n = await rows.count();
    expect(n).toBeGreaterThan(10);
    /* the count in the header is the whole list, not what fits */
    await expect(page.locator('.pcard').filter({ hasText: 'Needs you today' }).locator('.pview-count')).toHaveText(
      String(n),
    );

    /* every overdue row comes before every due-soon row */
    const tags = await page.locator('[data-attn] .ppill').allTextContents();
    const lastOverdue = tags.lastIndexOf('Overdue');
    const firstOther = tags.findIndex((t) => t !== 'Overdue');
    if (firstOther !== -1) expect(lastOverdue).toBeLessThan(firstOther);
  });

  test('every overdue step is on it — none are capped away', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Program' });
    const overdue = Number(
      await nav.getByRole('link', { name: /^Overdue/ }).locator('.pnav-n').innerText(),
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
    await expect(rail.locator('.pref')).toHaveText(act);
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
    if (page.url().includes('step=')) {
      await expect(rail).toContainText('Hands over');
    } else {
      await expect(rail).toContainText('Handover');
    }
  });

  test('in flight today lists the stages running now, with what is late', async ({ page }) => {
    const card = page.locator('.pcard').filter({ hasText: 'In flight today' });
    expect(await card.locator('li').count()).toBeGreaterThan(0);
    await expect(card.locator('.pflight-late').first()).toContainText('late');
  });

  test('the effort figure is the programme’s, not the rows on screen', async ({ page }) => {
    const card = page.locator('.pcard').filter({ hasText: 'Where the effort goes' });
    const total = Number((await card.locator('.pview-count').innerText()).replace(/[^\d.]/g, ''));
    const shown = (await card.locator('.pflight-n').allInnerTexts())
      .map((t) => Number(t.replace(/[^\d.]/g, '')))
      .reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(shown);
    /* and it matches the figure in the stat row */
    const stat = await page.locator('.pstat').filter({ hasText: 'Estimated cost' }).innerText();
    expect(Number(stat.replace(/[\s\S]*?([\d,.]+) MM[\s\S]*/, '$1').replace(/,/g, ''))).toBe(total);
  });
});

test.describe('Timeline', () => {
  test.beforeEach(async ({ page }) => {
    await open(page, `${SHELL_PATH}/timeline`, '.ptl-rows');
  });

  test('draws a bar per stage, ordered as the programme runs them', async ({ page }) => {
    await expect(page.locator('.ptl-row')).toHaveCount(23);
    const lefts = await page.locator('.ptl-bar').evaluateAll((els) =>
      els.map((e) => (e as HTMLElement).getBoundingClientRect().left),
    );
    /* the first stage starts before the last one does */
    expect(lefts[0]).toBeLessThan(lefts[lefts.length - 1]);
  });

  test('a checkpoint rides the bar of the stage whose end it is', async ({ page }) => {
    const row = page.locator('.ptl-row').filter({ hasText: 'Tapeout & Mask Release' });
    await expect(row.locator('.ptl-cp')).toContainText('Tapeout');
    /* the diamond sits at the end of that stage's bar, not in a band of its own */
    const bar = await row.locator('.ptl-bar').boundingBox();
    const dia = await row.locator('.ptl-dia').boundingBox();
    expect(Math.abs(dia!.x + dia!.width / 2 - (bar!.x + bar!.width))).toBeLessThan(12);
  });

  test('checkpoint labels never sit on top of their bar', async ({ page }) => {
    for (const h of ['Tight', 'Normal', 'Roomy']) {
      await page.getByRole('button', { name: h }).click();
      const rows = page.locator('.ptl-row').filter({ has: page.locator('.ptl-cp') });
      for (let i = 0; i < (await rows.count()); i++) {
        const row = rows.nth(i);
        const bar = (await row.locator('.ptl-bar').boundingBox())!;
        const label = (await row.locator('.ptl-cp-label').boundingBox())!;
        const overlap = Math.min(bar.x + bar.width, label.x + label.width) - Math.max(bar.x, label.x);
        expect(overlap, `${h}: row ${i} label overlaps its bar by ${overlap}px`).toBeLessThan(6);
      }
    }
  });

  test('row height is a setting, and it changes the rows', async ({ page }) => {
    const height = async () => (await page.locator('.ptl-row').first().boundingBox())!.height;
    await page.getByRole('button', { name: 'Tight' }).click();
    const tight = await height();
    await page.getByRole('button', { name: 'Roomy' }).click();
    expect(await height()).toBeGreaterThan(tight);
    await expect(page.getByRole('button', { name: 'Roomy' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('a stage carrying an open risk is drawn as one', async ({ page }) => {
    expect(await page.locator('.ptl-bar.risky').count()).toBeGreaterThan(0);
  });

  test('a bar opens its stage', async ({ page }) => {
    await page.locator('.ptl-name').filter({ hasText: 'Physical Design' }).click();
    await expect(page).toHaveURL(/\/stage\/physicalDesign\/activity$/);
  });
});
