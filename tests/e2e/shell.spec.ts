import { expect, test, SHELL_PATH } from './fixtures';

/**
 * The shell the prototype runs in: a nav on the left, one view at a time, and a
 * rail that follows the selection.
 *
 * These are the checks phase V2-3 is accepted on. They test the shell, not the
 * screens inside it — most of those are still placeholders naming the phase
 * that fills them, and get their own specs then.
 */

test.describe('the nav', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SHELL_PATH);
  });

  test('a program opens on its overview', async ({ page }) => {
    await expect(page).toHaveURL(/\/p\/atlasax1\/overview$/);
    await expect(page.getByRole('heading', { name: 'Overview', level: 1 })).toBeVisible();
  });

  test('every entry routes, and lights up when it is where you are', async ({ page }) => {
    const entries: [string, string][] = [
      ['Overview', 'overview'],
      ['Timeline', 'timeline'],
      ['Stages', 'stages'],
      ['Risks', 'risks'],
      ['Overdue', 'overdue'],
      ['Activities', 'activities'],
      ['Deliverables', 'deliverables'],
      ['Updates', 'updates'],
      ['Team', 'team'],
    ];
    const nav = page.getByRole('navigation', { name: 'Program' });
    for (const [label, slug] of entries) {
      const link = nav.getByRole('link', { name: new RegExp(`^${label}`) });
      await link.click();
      await expect(page).toHaveURL(new RegExp(`/p/atlasax1/${slug}$`));
      await expect(link).toHaveAttribute('aria-current', 'page');
    }
  });

  test('carries the counts, including the two that mean steps', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Program' });
    await expect(nav.getByRole('link', { name: /^Stages/ })).toContainText('23');
    await expect(nav.getByRole('link', { name: /^Deliverables/ })).toContainText('/167');
    /* The seed stalls six activities two steps deep and raises a risk on each,
       so both of these are non-zero and drawn as something to answer. */
    await expect(nav.getByRole('link', { name: /^Risks/ })).toContainText('6');
    const overdue = await nav.getByRole('link', { name: /^Overdue/ }).locator('.c').innerText();
    expect(Number(overdue)).toBeGreaterThan(0);
  });

  test('a stage page keeps the Stages entry lit', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/activity`);
    const nav = page.getByRole('navigation', { name: 'Program' });
    await expect(nav.getByRole('link', { name: /^Stages/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

/* Where you are and how to leave: the program's name is the heading, and the
   way back to the list is its own row rather than a click on that name. */
test.describe('the rail’s heading', () => {
  test('the program is named, above what it runs on', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/overview`);
    const nav = page.getByRole('navigation', { name: 'Program' });
    await expect(nav.locator('[data-program-name]')).toContainText('AtlasAX1');
    await expect(nav.locator('[data-program-name]')).toContainText('Typical SoC');

    /* and it is the biggest thing in the rail, which is the point of it */
    const sizes = await nav.evaluate((el) => ({
      name: parseFloat(getComputedStyle(el.querySelector('.progname')!).fontSize),
      home: parseFloat(getComputedStyle(el.querySelector('[data-home]')!).fontSize),
      item: parseFloat(getComputedStyle(el.querySelector('.nav')!).fontSize),
    }));
    expect(sizes.name).toBeGreaterThan(sizes.item);
    expect(sizes.name).toBeGreaterThan(sizes.home);
  });

  test('a row of its own leads back to the program list', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/activity`);
    await page.getByRole('navigation', { name: 'Program' }).locator('[data-home]').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('[data-program]').first()).toBeVisible();
  });

  /* The name used to be the link home, which read as "open this program" and
     did the opposite. It is not a link now. */
  test('the program’s own name does not navigate', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/overview`);
    const nav = page.getByRole('navigation', { name: 'Program' });
    await expect(nav.locator('[data-program-name]').locator('a')).toHaveCount(0);
  });
});

test.describe('the rail', () => {
  /* With nothing picked the rail is not there, which is what the mockup does:
     the screens that have no selection want the width more than they want a
     column saying there is nothing to show. */
  test('is not there at all until something is picked', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stages`);
    await expect(page.getByRole('complementary', { name: 'Details' })).toHaveCount(0);
  });

  /* On a stage screen the rail is never empty: the stage's own properties are
     the floor under whatever else is picked, as they are in the mockup. Both of
     these used to empty it — moving tabs is a navigation, and clicking the open
     row again is "never mind". */
  test('a stage keeps its properties under everything, tab to tab', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/activity`);
    const rail = page.getByRole('complementary', { name: 'Details' });
    await expect(rail).toContainText('Properties');

    for (const tab of ['Team', 'Key info', 'Key deliverables', 'Updates']) {
      await page.locator('.tabs').getByRole('link', { name: new RegExp(`^${tab}`) }).click();
      await expect(rail, `the rail went away on ${tab}`).toContainText('Properties');
    }
  });

  test('un-picking an activity falls back to the stage, not to nothing', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/activity`);
    const rail = page.getByRole('complementary', { name: 'Details' });
    await expect(page.locator('[data-act]').first()).toBeVisible();

    await page.locator('[data-act="PD-10"]').click();
    await expect(rail).toContainText('Signal and Power Integrity');
    await page.locator('[data-act="PD-10"]').click();
    await expect(rail).toContainText('Properties');
    await expect(rail).toContainText('Grace Park');
  });

  /* A row on the stages list opens that stage, as the mockup's does, and the
     stage's rail answers for it without anything else being clicked. */
  test('follows the stage you opened', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stages`);
    await page.locator('[data-stage="physicalDesign"]').click();
    const rail = page.getByRole('complementary', { name: 'Details' });
    await expect(rail).toContainText('Properties');
    await expect(rail).toContainText('Grace Park');
    await expect(rail).toContainText('Implement');
    await expect(rail).toContainText('30 weeks');
  });

  /* The stage's properties are what the rail shows when nothing else is picked,
     so there is nothing to close there. A step is a pick, and closing it hands
     the rail back to the stage. */
  test('closing a step hands the rail back to the stage', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/activity`);
    await expect(page.locator('[data-act]').first()).toBeVisible();
    await page.locator('[data-act="PD-10"]').click();
    await page.locator('[data-step="PD-10:2"]').click();

    const rail = page.getByRole('complementary', { name: 'Details' });
    await expect(rail).toContainText('Step 2 of');
    /* closing a step goes back to the activity it is in, and closing that goes
       back to the stage — the rail steps back up rather than emptying */
    await rail.getByRole('button', { name: 'Close details' }).click();
    await expect(rail).toContainText('Signal and Power Integrity');
    await rail.getByRole('button', { name: 'Close details' }).click();
    await expect(rail).toContainText('Properties');
    await expect(rail).toContainText('Grace Park');
  });

  test('clears on navigation, rather than describing the last screen', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign`);
    const rail = page.getByRole('complementary', { name: 'Details' });
    await expect(rail).toContainText('Grace Park');
    await page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Team/ }).click();
    await expect(rail).toHaveCount(0);
  });
});

test.describe('a stage', () => {
  test('opens on its first tab, and says where it sits in the run', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign`);
    await expect(page.getByRole('heading', { name: 'Physical Design', level: 1 })).toBeVisible();
    await expect(page.getByText('12 of 23')).toBeVisible();
    /* the tab carries its count now, so the accessible name is "Activity 16" */
    await expect(page.locator('.tabs').getByRole('link', { name: /^Activity/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('a deep link into a tab restores it', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/deliverables`);
    const tab = page.locator('.tabs').getByRole('link', { name: /^Key deliverables/ });
    await expect(tab).toHaveAttribute('aria-current', 'page');
    /* and reloading it lands in the same place, which is the whole point of
       putting the tab in the URL rather than in component state */
    await page.reload();
    await expect(tab).toHaveAttribute('aria-current', 'page');
  });

  test('a tab that no longer exists falls back rather than 404s', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/gantt`);
    await expect(page).toHaveURL(/\/stage\/physicalDesign\/activity$/);
  });

  test('a stage that does not exist says so and offers the list', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/notAStage`);
    await expect(page.getByText('No stage')).toBeVisible();
    await expect(page.getByRole('link', { name: 'All stages' })).toBeVisible();
  });

  test('the neighbours are one click away, and keep the tab you are on', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/risks`);
    await page.getByRole('link', { name: /^Next stage/ }).click();
    await expect(page).toHaveURL(/\/stage\/signoff\/risks$/);
    await expect(page.getByRole('heading', { name: 'Signoff', level: 1 })).toBeVisible();
  });
});

test.describe('the palette', () => {
  /* One accent for the whole app, and it is the prototype's — its whole
     stylesheet is ported now, so this reads :root rather than a scope. */
  test('the accent is the prototype’s indigo', async ({ page }) => {
    await page.goto(SHELL_PATH);
    await expect(page.locator('#side')).toBeVisible();
    const accent = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
    );
    expect(accent).toBe('#5b5bd6');
  });

  test('the ground is the prototype’s white, not the reference’s warm one', async ({ page }) => {
    await page.goto(SHELL_PATH);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  });
});

/**
 * Laptop widths.
 *
 * The chrome costs 232px of nav plus a rail before the view gets anything, and
 * the tables inside it are fixed columns with one flexible column taking the
 * slack. On a wide screen that is fine; at 1280 the slack ran out and the
 * activity title — the thing a row is about — collapsed to a single character.
 *
 * These run at Playwright's default 1280×720, which is the width that broke.
 */
test.describe('at a laptop width', () => {
  test('the column a row is about is still readable', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/activity`);
    await expect(page.locator('[data-act]').first()).toBeVisible();

    const title = page.locator('[data-act="PD-01"] .ell').first();
    const box = (await title.boundingBox())!;
    expect(box.width, 'the activity title needs room to be a title').toBeGreaterThan(120);
  });

  /* The table fills its pane and wraps inside it. It used to be given a floor
     and made to scroll sideways, which put half a row off the edge — a row you
     have to scroll to finish reading is barely better than one you cannot
     read. */
  test('a table fills its pane rather than scrolling sideways', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/activity`);
    await expect(page.locator('[data-act]').first()).toBeVisible();

    const m = await page.evaluate(() => {
      const pane = document.querySelector('#view')!;
      return {
        docOverflows: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        table: Math.round(document.querySelector('[data-acts]')!.getBoundingClientRect().width),
        pane: pane.clientWidth,
        paneScroll: pane.scrollWidth,
      };
    });
    expect(m.docOverflows, 'the page must not scroll sideways as a whole').toBe(false);
    expect(m.paneScroll, 'the pane must not scroll sideways either').toBeLessThanOrEqual(
      m.pane + 1,
    );
    expect(m.table).toBeLessThanOrEqual(m.pane + 1);
  });

  /* Narrow, the tables wrap rather than truncating or scrolling: every word is
     on screen, the rows are simply taller. */
  test('a stage’s tables wrap rather than cutting the text off', async ({ page }) => {
    await page.setViewportSize({ width: 1180, height: 800 });
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/activity?act=PD-10`);
    await expect(page.locator('[data-stepblock]')).toBeVisible();

    /* nothing is ellipsised away: every cell wraps and shows its whole text */
    const hidden = await page.locator('[data-acts] .trow .ell').evaluateAll((els) =>
      els.filter((e) => {
        const s = getComputedStyle(e);
        return s.whiteSpace === 'nowrap' || s.textOverflow === 'ellipsis';
      }).length,
    );
    expect(hidden, 'a cell is still cutting its text off').toBe(0);

    /* and it wraps rather than pushing the pane sideways */
    const pane = await page.locator('#view').evaluate((el) => ({
      client: el.clientWidth,
      scroll: el.scrollWidth,
    }));
    expect(pane.scroll).toBeLessThanOrEqual(pane.client + 1);

    /* the step block too, and no cell spills past the table it is in */
    const stepHidden = await page.locator('[data-stepblock] .steprow .ell').evaluateAll((els) =>
      els.filter((e) => getComputedStyle(e).whiteSpace === 'nowrap').length,
    );
    expect(stepHidden, 'a step cell is still cutting its text off').toBe(0);

    const spill = await page.locator('[data-stepblock]').evaluate((box) => {
      const right = box.getBoundingClientRect().right;
      let worst = 0;
      for (const el of box.querySelectorAll('.steprow > *')) {
        worst = Math.max(worst, Math.round(el.getBoundingClientRect().right - right));
      }
      return worst;
    });
    expect(spill, 'a step cell hangs off the table').toBeLessThanOrEqual(1);
  });

  test('the same holds with the rail open beside it', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 800 });
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/activity?step=PD-10:2`);
    await expect(page.locator('[data-stepblock]')).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'Details' })).toBeVisible();

    const pane = await page.locator('#view').evaluate((el) => ({
      client: el.clientWidth,
      scroll: el.scrollWidth,
    }));
    expect(pane.scroll).toBeLessThanOrEqual(pane.client + 1);
    const hidden = await page
      .locator('[data-acts] .trow .ell, [data-stepblock] .steprow .ell')
      .evaluateAll((els) => els.filter((e) => getComputedStyle(e).whiteSpace === 'nowrap').length);
    expect(hidden).toBe(0);
  });

  /* The band wraps rather than overflowing, which is what the prototype's own
     stylesheet does at this width: the pace panel — and, on a small laptop, the
     last figure — drop onto a second row and stay readable. What must never
     happen is a block hanging off the card's right edge, which is what forcing
     it all onto one line produced. */
  test('the dashboard band wraps rather than spilling off its edge', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/activity`);
    await expect(page.locator('.sdash')).toBeVisible();

    const spill = await page.locator('.sdash').evaluate((el) => {
      const card = el.getBoundingClientRect();
      return Math.max(
        ...[...el.children].map((c) => Math.round(c.getBoundingClientRect().right - card.right)),
      );
    });
    expect(spill, 'something in the band hangs off its right edge').toBeLessThanOrEqual(1);
  });
});
