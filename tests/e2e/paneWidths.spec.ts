import { expect, type Page } from '@playwright/test';
import { SHELL_PATH, test } from './fixtures';

/**
 * Dragging the side panels.
 *
 * The widths are a display preference, kept in the browser, so what these
 * tests hold still is the gesture and what survives it: the drag moves the
 * border, the choice outlives a reload, a panel dragged shut can be pulled
 * back out, and double-click puts it back where it shipped.
 */
/* A fixed window, because every number here is a width in pixels and the
   panels give room back on a narrow one — which is its own test, below. */
test.use({ viewport: { width: 1500, height: 950 } });

const STAGE = `${SHELL_PATH}/stage/physicalDesign/activity`;

const widthOf = (page: Page, sel: string) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    return el ? Math.round(el.getBoundingClientRect().width) : 0;
  }, sel);

/** Pull a grip sideways. Positive is rightwards, whichever panel it belongs to. */
const drag = async (page: Page, pane: 'side' | 'peek', dx: number) => {
  const grip = page.locator(`.panegrip[data-pane="${pane}"]`);
  const box = (await grip.boundingBox())!;
  const y = box.y + Math.min(300, box.height / 2);
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + dx, y, { steps: 10 });
  await page.mouse.up();
};

/* The stored width belongs to the browser, not the program, so each test
   starts from the shipped defaults rather than from what the last one left. */
const fresh = async (page: Page) => {
  await page.goto(STAGE);
  await page.evaluate(() => window.localStorage.removeItem('atlaspm.panes.v1'));
  await page.reload();
  await expect(page.locator('#side')).toBeVisible();
};

test('drags the navigation wider, and keeps it', async ({ page }) => {
  await fresh(page);
  expect(await widthOf(page, '#side')).toBe(232);

  await drag(page, 'side', 90);
  expect(await widthOf(page, '#side')).toBe(322);

  await page.reload();
  await expect(page.locator('#side')).toBeVisible();
  expect(await widthOf(page, '#side')).toBe(322);
});

test('drags the properties rail wider from its own edge', async ({ page }) => {
  await fresh(page);
  expect(await widthOf(page, '#peek')).toBe(442);
  /* the rail grows leftwards, so its grip moving left makes it wider */
  await drag(page, 'peek', -120);
  expect(await widthOf(page, '#peek')).toBe(562);
});

/* A panel pinned at its smallest useful width looks like the drag failed, so
   past half the minimum it shuts — and the grip is what is left to reopen it. */
test('shuts a panel dragged past its minimum, and opens it again', async ({ page }) => {
  await fresh(page);

  await drag(page, 'side', -400);
  /* one pixel of border, not the seventeen its padding would have held open */
  expect(await widthOf(page, '#side')).toBe(1);
  await expect(page.locator('#side .nav').first()).toBeHidden();
  /* the main column took the room */
  expect(await widthOf(page, '#view')).toBeGreaterThan(1000);

  const grip = page.locator('.panegrip[data-pane="side"]');
  await expect(grip).toBeVisible();
  expect((await grip.boundingBox())!.x).toBeLessThan(10);

  await drag(page, 'side', 260);
  expect(await widthOf(page, '#side')).toBe(260);
  await expect(page.locator('#side .nav').first()).toBeVisible();
});

/* At the window's edge only five of the grip's nine pixels are reachable and
   the rest is under the scrollbar, so a shut panel leaves a handle as well. */
test('a shut panel leaves a handle that is on the screen and opens it', async ({ page }) => {
  await fresh(page);
  await drag(page, 'peek', 500);
  await drag(page, 'side', -400);

  for (const pane of ['side', 'peek'] as const) {
    const handle = page.locator(`.panereopen[data-pane="${pane}"]`);
    await expect(handle).toBeVisible();
    const box = (await handle.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1500);
  }

  await page.locator('.panereopen[data-pane="peek"]').click();
  expect(await widthOf(page, '#peek')).toBe(442);
  await expect(page.locator('.panereopen[data-pane="peek"]')).toHaveCount(0);

  await page.locator('.panereopen[data-pane="side"]').click();
  expect(await widthOf(page, '#side')).toBe(232);

  /* and it stays open */
  await page.reload();
  await expect(page.locator('#side')).toBeVisible();
  expect(await widthOf(page, '#side')).toBe(232);
  expect(await widthOf(page, '#peek')).toBe(442);
});

test('a shut rail leaves the grip that reopens it, and remembers being shut', async ({ page }) => {
  await fresh(page);
  await drag(page, 'peek', 500);
  expect(await widthOf(page, '#peek')).toBe(1);

  await page.reload();
  await expect(page.locator('#side')).toBeVisible();
  expect(await widthOf(page, '#peek')).toBe(1);

  await drag(page, 'peek', -420);
  expect(await widthOf(page, '#peek')).toBe(420);
});

test('double-click puts a panel back where it shipped', async ({ page }) => {
  await fresh(page);
  await drag(page, 'side', 120);
  expect(await widthOf(page, '#side')).toBe(352);

  await page.locator('.panegrip[data-pane="side"]').dblclick();
  expect(await widthOf(page, '#side')).toBe(232);

  await page.reload();
  await expect(page.locator('#side')).toBeVisible();
  expect(await widthOf(page, '#side')).toBe(232);
});

/* A width chosen on a wide monitor arrives on a laptop still asking for it.
   The panels give room back rather than squeezing the main column to nothing,
   and the choice itself is not overwritten. */
test('gives room back when the window cannot hold both panels', async ({ page }) => {
  await fresh(page);
  await drag(page, 'peek', -260);
  expect(await widthOf(page, '#peek')).toBe(702);

  await page.setViewportSize({ width: 1000, height: 900 });
  await expect.poll(() => widthOf(page, '#view')).toBeGreaterThanOrEqual(480);
  expect(await widthOf(page, '#side')).toBe(232);

  await page.setViewportSize({ width: 1600, height: 900 });
  await expect.poll(() => widthOf(page, '#peek')).toBe(702);
});
