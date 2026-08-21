import { expect, test, type Page, SEED_PROJECT_PATH, selectStage } from './fixtures';

/**
 * Text that lands on other text is the kind of rot a screenshot catches and a
 * unit test never does. This walks the painted leaves of a region and reports
 * any two whose visible boxes intersect — visible being the point: a row
 * scrolled out of its board still has a box, so every rect is clipped against
 * the scrolling ancestors before it is compared.
 *
 * The profile decides how crowded the axis gets — 23 stages put 18 milestones
 * and 30 months on one line — so the sweep runs at three desktop widths.
 */
const overlaps = (page: Page, root: string) =>
  page.evaluate((sel) => {
    const host = document.querySelector(sel);
    if (!host) return [`(missing) ${sel}`];
    const visibleRect = (el: HTMLElement): DOMRect | null => {
      let r = el.getBoundingClientRect();
      let p = el.parentElement;
      while (p) {
        const cs = getComputedStyle(p);
        if (/(auto|scroll|hidden)/.test(cs.overflowY + cs.overflowX)) {
          const pr = p.getBoundingClientRect();
          const top = Math.max(r.top, pr.top);
          const bottom = Math.min(r.bottom, pr.bottom);
          const left = Math.max(r.left, pr.left);
          const right = Math.min(r.right, pr.right);
          if (bottom - top <= 0 || right - left <= 0) return null;
          r = new DOMRect(left, top, right - left, bottom - top);
        }
        p = p.parentElement;
      }
      return r;
    };
    const leaves: { el: HTMLElement; r: DOMRect }[] = [];
    for (const el of host.querySelectorAll<HTMLElement>('*')) {
      if (el.children.length) continue;
      if (!(el.textContent ?? '').trim()) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
      const r = visibleRect(el);
      if (r && r.width > 1 && r.height > 1) leaves.push({ el, r });
    }
    const name = (el: HTMLElement) =>
      `${el.className || el.tagName}:"${(el.textContent ?? '').trim().slice(0, 16)}"`;
    const out: string[] = [];
    for (let i = 0; i < leaves.length; i++) {
      for (let j = i + 1; j < leaves.length; j++) {
        const a = leaves[i].r;
        const b = leaves[j].r;
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        /* a couple of pixels is antialiasing, not an overlap */
        if (ox > 2 && oy > 2) out.push(`${name(leaves[i].el)} ↔ ${name(leaves[j].el)}`);
      }
    }
    return out;
  }, root);

for (const width of [1440, 1280, 1100] as const) {
  test(`nothing overprints anything at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(SEED_PROJECT_PATH);
    await expect(page.locator('.stage-panel.selected')).toBeVisible();
    await selectStage(page, 'physicalDesign');

    expect(await overlaps(page, '#roadmap'), 'roadmap').toEqual([]);
    expect(await overlaps(page, '#toolbar'), 'toolbar').toEqual([]);
    expect(await overlaps(page, '.stage-panel.selected'), 'stage panel').toEqual([]);

    await page.locator('.stage-panel.selected .board[data-kind="activities"] [data-more]').click();
    await expect(page.locator('#modal .modal-win')).toBeVisible();
    expect(await overlaps(page, '#modal'), 'board pop-up').toEqual([]);
    await page.keyboard.press('Escape');

    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await expect(page.locator('#schedule-view')).toBeVisible();
    expect(await overlaps(page, '#schedule-view'), 'dashboard').toEqual([]);
  });
}
