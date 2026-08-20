import {
  expect,
  test,
  type Page,
  SEED_PROJECT_PATH,
  selectStage,
  settleLayout,
} from './fixtures';

/**
 * The prototype's own check list, ported. These are the measurements that
 * silently rot: grid alignment, marker registration, drag arithmetic, the ESC
 * stack, and the responsive steps.
 */

const selectedPanel = (page: Page) => page.locator('.stage-panel.selected');

const lefts = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((els) =>
    els.map((e) => Math.round(e.getBoundingClientRect().left * 100) / 100),
  );

const centerX = async (page: Page, sel: string) => {
  const box = await page.locator(sel).boundingBox();
  return box!.x + box!.width / 2;
};

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await selectStage(page, '01');
});

test.describe('column alignment', () => {
  test('every board header cell sits exactly over its row cells', async ({ page }) => {
    // Physical Design carries rows on all three boards
    await selectStage(page, '06');
    for (const kind of ['keyinfo', 'activities', 'risks'] as const) {
      const board = `.stage-panel.selected .board[data-kind="${kind}"]`;
      const head = await lefts(page, `${board} .board-cols > span`);
      expect(head.length).toBe(kind === 'keyinfo' ? 3 : 4);

      const rows = page.locator(`${board} .b-row`);
      const n = await rows.count();
      expect(n).toBeGreaterThan(0);
      for (let i = 0; i < n; i++) {
        const cells = await rows
          .nth(i)
          .evaluateAll((els) =>
            [...els[0].children]
              .filter((c) => !c.classList.contains('b-latest'))
              .map((c) => Math.round(c.getBoundingClientRect().left * 100) / 100),
          );
        expect(cells.slice(0, head.length), `${kind} row ${i}`).toEqual(head);
      }
    }
  });

  test('the deliverables and contacts grids line up too', async ({ page }) => {
    const panel = selectedPanel(page);
    await expect(panel.locator('.dlv-list li')).not.toHaveCount(0);
    const dlvHead = await lefts(page, '.stage-panel.selected .dlv-cols > span');
    const dlvRow = await panel
      .locator('.dlv-list li')
      .first()
      .evaluateAll((els) =>
        [...els[0].children].map((c) => Math.round(c.getBoundingClientRect().left * 100) / 100),
      );
    expect(dlvRow).toEqual(dlvHead);

    const cHead = await lefts(page, '.stage-panel.selected .c-cols > span');
    const cRow = await panel
      .locator('.contacts-sec .c-row')
      .first()
      .evaluateAll((els) =>
        [...els[0].children].map((c) => Math.round(c.getBoundingClientRect().left * 100) / 100),
      );
    expect(cRow).toEqual(cHead);
  });

  test('alignment survives a column resize', async ({ page }) => {
    await selectStage(page, '06');
    const board = '.stage-panel.selected .board[data-kind="activities"]';
    await dragGrip(page, page.locator(`${board} .col-grip[data-col="date"]`), 40);
    const head = await lefts(page, `${board} .board-cols > span`);
    const row = await page
      .locator(`${board} .b-row`)
      .first()
      .evaluateAll((els) =>
        [...els[0].children]
          .filter((c) => !c.classList.contains('b-latest'))
          .map((c) => Math.round(c.getBoundingClientRect().left * 100) / 100),
      );
    expect(row.slice(0, head.length)).toEqual(head);
  });
});

test.describe('form control metrics', () => {
  test('date inputs keep the UA padding the reference renders with', async ({ page }) => {
    /* Tailwind's preflight zeroes ::-webkit-datetime-edit* padding, which makes
       every date input 2px shorter than the reference and shifts the whole page
       with it. globals.css reverts that; this pins it. */
    for (const sel of [
      '.stage-panel.selected [data-role="start-edit"]',
      '.stage-panel.selected [data-role="end-edit"]',
    ]) {
      const m = await page.locator(sel).evaluate((el) => {
        const cs = getComputedStyle(el);
        const n = (v: string) => parseFloat(v);
        return {
          height: el.getBoundingClientRect().height,
          lineBox:
            n(cs.lineHeight) +
            n(cs.paddingTop) +
            n(cs.paddingBottom) +
            n(cs.borderTopWidth) +
            n(cs.borderBottomWidth),
        };
      });
      // the field wrapper's own padding is what makes it taller than the line box
      expect(m.height - m.lineBox, sel).toBeCloseTo(2, 1);
    }
  });

  test('the toolbar is exactly one 58px row on desktop', async ({ page }) => {
    const box = (await page.locator('#toolbar').boundingBox())!;
    expect(box.height).toBe(58);
    expect(box.y).toBe(0);
  });
});

test.describe('marker registration', () => {
  test('the roadmap TODAY marker is 0px off the gantt today line', async ({ page }) => {
    const delta = (await centerX(page, '#rm-today')) - (await centerX(page, '#rm-gantt .g-today'));
    expect(delta).toBe(0);
  });

  test('it stays at 0px after a resize and after a date edit', async ({ page }) => {
    await page.setViewportSize({ width: 1500, height: 900 });
    await expect(page.locator('#rm-today')).toBeVisible();
    expect(
      (await centerX(page, '#rm-today')) - (await centerX(page, '#rm-gantt .g-today')),
    ).toBe(0);

    await selectStage(page, '04');
    const panel = selectedPanel(page);
    const end = await panel.locator('[data-role="end-edit"]').inputValue();
    const [y, m, d] = end.split('-').map(Number);
    const moved = new Date(y, m - 1, d);
    moved.setDate(moved.getDate() + 21);
    const p2 = (n: number) => String(n).padStart(2, '0');
    await panel
      .locator('[data-role="end-edit"]')
      .fill(`${moved.getFullYear()}-${p2(moved.getMonth() + 1)}-${p2(moved.getDate())}`);
    await page.locator('[data-apply-schedule]').click();

    /* The two charts share a scale only while the chart is open: folded, it is
       drawn at the scale of one stage, on purpose. Come back into it first. */
    await page.locator('#roadmap').hover({ position: { x: 8, y: 8 } });
    await settleLayout(page);
    expect(
      (await centerX(page, '#rm-today')) - (await centerX(page, '#rm-gantt .g-today')),
    ).toBe(0);
  });

  test('folded, the chart is a stage-sized window rather than the program', async ({ page }) => {
    await selectStage(page, '03');
    const wide = (await page.locator('#rm-gantt .g-row.current .g-bar').boundingBox())!.width;

    const box = (await page.locator('#roadmap').boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height + 40);
    await settleLayout(page);

    const zoomed = (await page.locator('#rm-gantt .g-row.current .g-bar').boundingBox())!;
    const track = (await page.locator('#rm-gantt .g-row.current .g-row-track').boundingBox())!;
    expect(zoomed.width).toBeGreaterThan(wide * 2);
    expect(zoomed.width / track.width).toBeCloseTo(0.7, 1);
    // the milestone axis above is untouched — it still reads the whole program
    await expect(page.locator('.rm-ms')).toHaveCount(8);
  });

});

/** Drag a grip by dx, with the grip scrolled clear of the sticky roadmap. */
async function dragGrip(page: Page, grip: ReturnType<Page['locator']>, dx: number) {
  await grip.evaluate((el) => el.scrollIntoView({ block: 'end' }));
  /* Moving down out of the chart folds it away and lifts the page; hover
     first and let that finish, or the grip slides out from under the cursor. */
  await grip.hover();
  await settleLayout(page);
  const box = (await grip.boundingBox())!;
  const y = box.y + box.height / 2;
  const onTop = await page.evaluate(
    ([x, yy]) => document.elementFromPoint(x, yy)?.className ?? 'none',
    [box.x + box.width / 2, y],
  );
  expect(onTop).toContain('col-grip');
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + dx, y, { steps: 10 });
  await page.mouse.up();
}

test.describe('boundary drags', () => {
  test('the boundary follows the cursor, pixel for pixel', async ({ page }) => {
    await selectStage(page, '06');
    const board = '.stage-panel.selected .board[data-kind="activities"]';
    const ownerLeft = async () => (await lefts(page, `${board} .board-cols > span`))[2];

    const before = await ownerLeft();
    await dragGrip(page, page.locator(`${board} .col-grip[data-col="owner"]`), -60);
    expect(Math.round((await ownerLeft()) - before)).toBe(-60);

    // and back the other way
    await dragGrip(page, page.locator(`${board} .col-grip[data-col="owner"]`), 25);
    expect(Math.round((await ownerLeft()) - before)).toBe(-35);
  });

  test('the Updated grip widens its own column by the drag distance', async ({ page }) => {
    const board = '.stage-panel.selected .board[data-kind="keyinfo"]';
    const w = async () =>
      (await page.locator(`${board} .board-cols > span`).first().boundingBox())!.width;
    const before = await w();
    await dragGrip(page, page.locator(`${board} .col-grip[data-col="date"]`), 45);
    expect(Math.round((await w()) - before)).toBe(45);
  });

  test('widths clamp between 56px and 420px', async ({ page }) => {
    const board = '.stage-panel.selected .board[data-kind="keyinfo"]';
    const w = async () =>
      (await page.locator(`${board} .board-cols > span`).first().boundingBox())!.width;
    await dragGrip(page, page.locator(`${board} .col-grip[data-col="date"]`), -600);
    expect(Math.round(await w())).toBe(56);
    await dragGrip(page, page.locator(`${board} .col-grip[data-col="date"]`), 900);
    expect(Math.round(await w())).toBe(420);
  });

  test('a drag leaves no resizing state behind', async ({ page }) => {
    const board = '.stage-panel.selected .board[data-kind="keyinfo"]';
    await dragGrip(page, page.locator(`${board} .col-grip[data-col="date"]`), 30);
    await expect(page.locator('body')).not.toHaveClass(/col-resizing/);
    await expect(page.locator('.col-grip.active')).toHaveCount(0);
  });

  test('the deliverables boundary follows the cursor as well', async ({ page }) => {
    const dueLeft = async () => (await lefts(page, '.stage-panel.selected .dlv-cols > span'))[1];
    const before = await dueLeft();
    await dragGrip(page, page.locator('.stage-panel.selected .col-grip[data-col="--dlv-due"]'), -50);
    expect(Math.round((await dueLeft()) - before)).toBe(-50);
  });
});

test.describe('pagination', () => {
  test('pages 10 at a time and clamps out-of-range pages', async ({ page }) => {
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await page.locator('[data-dash-open="updates"]').click();

    const rows = page.locator('#modal-body .su-brow');
    await expect(page.locator('.board-foot .note')).toHaveText('22 entries');
    await expect(rows).toHaveCount(10);
    await expect(page.locator('.pager button[aria-current="true"]')).toHaveText('1');
    await expect(page.locator('.pager button').first()).toBeDisabled();
    await expect(page.locator('.pager button').last()).toBeEnabled();

    await page.locator('.pager button').last().click(); // ›
    await expect(rows).toHaveCount(10);
    await expect(page.locator('.pager button[aria-current="true"]')).toHaveText('2');
    await expect(page.locator('.pager button').first()).toBeEnabled();
    await expect(page.locator('.pager button').last()).toBeEnabled();

    await page.locator('.pager button').last().click(); // ›
    await expect(rows).toHaveCount(2); // the tail of 22
    await expect(page.locator('.pager button[aria-current="true"]')).toHaveText('3');
    await expect(page.locator('.pager button').last()).toBeDisabled();

    await page.locator('.pager button').first().click(); // ‹
    await expect(rows).toHaveCount(10);

    // deleting entries until page 2 empties clamps the pager back to page 1
    await page.locator('#modal-close').click();
    await page.locator('#mode-toggle button[data-mode="journey"]').click();
    await selectStage(page, '06');
    await selectedPanel(page).locator('.board[data-kind="activities"] [data-more]').click();
    await expect(page.locator('#modal-body .b-row')).toHaveCount(6);
    await expect(page.locator('.pager')).toHaveCount(0); // 6 entries, one page
  });

  test('a single-page board shows no pager', async ({ page }) => {
    // Physical Design's key information is four entries — well under a page
    await selectStage(page, '06');
    await selectedPanel(page).locator('.board[data-kind="keyinfo"] [data-more]').click();
    await expect(page.locator('#modal-body .b-row')).toHaveCount(4);
    await expect(page.locator('.pager')).toHaveCount(0);
    await expect(page.locator('.board-foot .note')).toHaveCount(0);
  });
});

test.describe('ESC layering', () => {
  test('closes the pop-up, then the dashboard, leaving nothing stranded', async ({ page }) => {
    // inline sheet is open by default on the selected stage
    await expect(selectedPanel(page).locator('.inline-area')).toBeVisible();

    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await expect(page.locator('#schedule-view')).toBeVisible();
    await page.locator('[data-dash-open="risks"]').click();
    await expect(page.locator('#modal .modal-win')).toBeVisible();

    // 1 — the pop-up goes, the dashboard stays
    await page.keyboard.press('Escape');
    await expect(page.locator('#modal .modal-win')).toBeHidden();
    await expect(page.locator('#schedule-view')).toBeVisible();
    await expect(page.locator('body')).toHaveClass(/schedule-mode/);

    // 2 — the dashboard goes, and the inline sheet underneath closes with it
    await page.keyboard.press('Escape');
    await expect(page.locator('#schedule-view')).toBeHidden();
    await expect(page.locator('body')).not.toHaveClass(/schedule-mode/);
    await expect(selectedPanel(page).locator('.inline-area')).toHaveCount(0);

    // 3 — nothing left to close
    await page.keyboard.press('Escape');
    await expect(selectedPanel(page)).toBeVisible();
  });

  test('a pop-up opened from the main page leaves the inline sheet alone', async ({ page }) => {
    await selectedPanel(page).locator('.board[data-kind="keyinfo"] [data-more]').click();
    await page.keyboard.press('Escape');
    await expect(page.locator('#modal .modal-win')).toBeHidden();
    await expect(selectedPanel(page).locator('.inline-area')).toBeVisible();
  });

  test('the page behind a pop-up is locked, and unlocks on close', async ({ page }) => {
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
    await page.locator('#mode-toggle button[data-mode="journey"]').click();
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  });
});

test.describe('responsive stops', () => {
  test('1280 stacks the stage panel and lifts the visual above it', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    const twoCol = await selectedPanel(page).evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length,
    );
    expect(twoCol).toBe(2);

    await page.setViewportSize({ width: 1280, height: 900 });
    const oneCol = await selectedPanel(page).evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length,
    );
    expect(oneCol).toBe(1);
    // the visual moves above the text
    const viz = (await selectedPanel(page).locator('.viz').boundingBox())!;
    const info = (await selectedPanel(page).locator('.panel-info').boundingBox())!;
    expect(viz.y).toBeLessThan(info.y);
  });

  test('1100 steps the board and contact columns down', async ({ page }) => {
    const varAt = async (w: number, name: string) => {
      await page.setViewportSize({ width: w, height: 900 });
      return page.evaluate(
        (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
        name,
      );
    };
    expect(await varAt(1200, '--bck-activities-date')).toBe('9.5rem');
    expect(await varAt(1100, '--bck-activities-date')).toBe('8rem');
    expect(await varAt(1100, '--bck-risks-due')).toBe('6.5rem');
    // contacts drop from five wide columns to the narrow set
    await page.setViewportSize({ width: 1100, height: 900 });
    const cols = await selectedPanel(page)
      .locator('.c-cols')
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(cols).toBe(5);
  });

  test('the title is the last thing to shrink', async ({ page }) => {
    const titleVar = async (w: number) => {
      await page.setViewportSize({ width: w, height: 900 });
      return page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--title-size').trim(),
      );
    };
    expect(await titleVar(1400)).toBe('2.6rem');
    expect(await titleVar(1100)).toBe('2.2rem');
    expect(await titleVar(640)).toBe('1.8rem');
  });

  test('900 moves the toolbar and roadmap out of sticky', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 900 });
    await expect(page.locator('#toolbar')).toHaveCSS('position', 'static');
    await expect(page.locator('#roadmap')).toHaveCSS('position', 'static');
    // every panel is visible in the stacked mobile layout
    await expect(page.locator('.stage-panel').first()).toBeVisible();
    await expect(page.locator('.stage-panel').last()).toBeVisible();
  });
});

test.describe('reduced motion', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    /* a reload clears the selection, so open a stage again */
    await selectStage(page, '01');
    expect(
      await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
    ).toBe(true);
  });

  test('transitions and animations are stubbed out', async ({ page }) => {
    /* Chromium serialises the .01ms override as "1e-05s", so read the numbers
       rather than pinning a string format. */
    const durations = async (sel: string, prop: 'transitionDuration' | 'animationDuration') =>
      page
        .locator(sel)
        .first()
        .evaluate(
          (el, p) =>
            getComputedStyle(el)[p as 'transitionDuration']
              .split(',')
              .map((v) => parseFloat(v)),
          prop,
        );

    for (const d of await durations('#modal-scrim', 'transitionDuration')) {
      expect(d).toBeLessThan(0.001);
    }
    for (const d of await durations('.pop-panel', 'transitionDuration')) {
      expect(d).toBeLessThan(0.001);
    }
    for (const d of await durations('.inline-area', 'animationDuration')) {
      expect(d).toBeLessThan(0.001);
    }
    // without the preference these are the real durations
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.reload();
    await selectStage(page, '01');
    expect((await durations('#modal-scrim', 'transitionDuration'))[0]).toBeCloseTo(0.2, 2);
  });

  test('the app still works with motion off', async ({ page }) => {
    await selectStage(page, '06');
    await expect(selectedPanel(page)).toHaveAttribute('data-id', 'physicalDesign');
    await selectedPanel(page).locator('.board[data-kind="risks"] [data-more]').click();
    await expect(page.locator('#modal .modal-win')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#modal .modal-win')).toBeHidden();
  });
});
