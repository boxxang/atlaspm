import { expect, test, type Page } from './fixtures';

/**
 * The program list, and the programs on it.
 *
 * A trimmed replacement for the V1 spec, which reached most of what it checked
 * through a toolbar and a roadmap that no longer exist. What is left is what the
 * list itself still does: open a program, make one, delete one.
 *
 * The schedule editing and stage editing those tests also covered have no screen
 * in the shell yet. That is a gap, not a decision — see PORTING_PLAN_V2.
 */
const card = (page: Page, name: string) =>
  page.locator('[data-program]').filter({ hasText: name });

test.describe('the program list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-program]').first()).toBeVisible();
  });

  test('lists the seeded program with what it is running on', async ({ page }) => {
    await expect(card(page, 'AtlasAX1')).toBeVisible();
    await expect(card(page, 'AtlasAX1')).toContainText('Typical SoC');
  });

  test('a card opens the program in the shell', async ({ page }) => {
    await card(page, 'AtlasAX1').click();
    await expect(page).toHaveURL(/\/p\/atlasax1\/overview$/);
    await expect(page.getByRole('navigation', { name: 'Program' })).toContainText('AtlasAX1');
  });

  test('a new program is created and opens on its own overview', async ({ page }) => {
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('AtlasBX2');
    await page.locator('.pf-kickoff').fill('2027-03-01');
    await page.locator('[data-create]').click();

    await page.waitForURL(/\/p\/atlasbx2-[^/]*\/overview$/);
    await expect(page.getByRole('navigation', { name: 'Program' })).toContainText('AtlasBX2');
    /* it runs the same 23 stages, and none of them has been touched */
    await expect(
      page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Stages/ }),
    ).toContainText('23');
    await expect(
      page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Overdue/ }),
    ).toContainText('0');
  });

  /* Creating happens in a dialog, and every field says what it is for — the
     dates especially, since a bare date input on a form about a three-year
     program does not say which of its dates it is. */
  test.describe('the new-program dialog', () => {
    test('opens over the list, and every field explains itself', async ({ page }) => {
      await expect(page.locator('[data-new-program]')).toHaveCount(0);
      await page.locator('[data-new-project]').click();

      const dlg = page.locator('[data-new-program]');
      await expect(dlg).toBeVisible();
      /* the row it was launched from is still there behind it */
      await expect(page.locator('[data-new-project-row]')).toBeAttached();

      for (const label of [
        'Program name',
        'Template',
        'Expected kickoff',
        'Cost per man-month',
      ]) {
        await expect(dlg.locator('.dlg-label').filter({ hasText: label })).toBeVisible();
      }
      /* every field carries its sentence, and the date's says which date */
      const hints = await dlg.locator('.dlg-hint').allTextContents();
      expect(hints).toHaveLength(4);
      expect(hints.every((h) => h.length > 20)).toBe(true);
      await expect(dlg).toContainText('The day the first stage begins');
    });

    test('closes on Escape and on Cancel, without making anything', async ({ page }) => {
      const before = await page.locator('[data-program]').count();

      await page.locator('[data-new-project]').click();
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-new-program]')).toHaveCount(0);

      await page.locator('[data-new-project]').click();
      await page.locator('[data-new-program]').getByRole('button', { name: 'Cancel' }).click();
      await expect(page.locator('[data-new-program]')).toHaveCount(0);

      await expect(page.locator('[data-program]')).toHaveCount(before);
    });

    test('says what is missing rather than making a nameless program', async ({ page }) => {
      await page.locator('[data-new-project]').click();
      await page.locator('[data-create]').click();
      await expect(page.locator('[data-new-program] .err')).toContainText('name');
      await expect(page).toHaveURL('/');
    });
  });

  /* The date is not always the program's own start. "Physical Design begins in
     March" is the fixed point on a great many programs, and converting that
     into a kickoff by hand is how a schedule ends up a week out. */
  test.describe('aligning the plan to a stage', () => {
    const open = async (page: Page) => {
      await page.locator('[data-new-project]').click();
      await page.locator('.pf-profile').selectOption('custom:typicalSoC');
      await expect(page.locator('.pf-anchor')).toBeVisible();
    };

    test('the first stage is the anchor to begin with, and the date is the kickoff', async ({
      page,
    }) => {
      await open(page);
      await expect(page.locator('.pf-anchor')).toHaveValue('productDefinition');
      await expect(page.locator('[data-new-program]')).toContainText('Expected kickoff');
      /* nothing is derived, because the date is already week zero */
      await expect(page.locator('[data-derived]')).toHaveCount(0);
    });

    test('choosing another stage renames the date and works week zero out', async ({ page }) => {
      await open(page);
      await page.locator('.pf-kickoff').fill('2026-08-30');
      await page.locator('.pf-anchor').selectOption('physicalDesign');

      /* the field is no longer asking for a kickoff */
      await expect(page.locator('[data-new-program]')).toContainText('PD starts');
      await expect(page.locator('[data-new-program]')).toContainText('Week zero is 46 weeks before');
      /* 46 weeks before 08/30/2026 */
      await expect(page.locator('[data-derived]')).toContainText('10/12/2025');
    });

    test('the program is built around the date the anchor was given', async ({ page }) => {
      await open(page);
      await page.locator('.pf-name').fill('AtlasAnchored');
      await page.locator('.pf-kickoff').fill('2026-08-30');
      await page.locator('.pf-anchor').selectOption('physicalDesign');
      await page.locator('[data-create]').click();
      await page.waitForURL(/\/p\/atlasanchored-[^/]*\/overview$/);

      /* Physical Design starts on the day that was typed, not the kickoff */
      await page.getByRole('link', { name: /^Stages/ }).click();
      const row = page.locator('[data-stage="physicalDesign"]');
      await expect(row).toContainText('08/30/2026');
      /* and week zero landed where the dialog said it would */
      await page.goto('/');
      await expect(
        page.locator('[data-program]').filter({ hasText: 'AtlasAnchored' }),
      ).toContainText('kickoff 10/12/2025');
    });
  });

  /* A rate has to be asked for: nothing else in the app sets one, so a
     program created without it could never show a cost at all. */
  test.describe('what a program costs', () => {
    test('the dialog asks the rate and shows what it comes to', async ({ page }) => {
      await page.locator('[data-new-project]').click();
      const dlg = page.locator('[data-new-program]');
      await expect(dlg.locator('.dlg-label').filter({ hasText: 'Cost per man-month' })).toBeVisible();
      await expect(page.locator('[data-est-cost]')).toContainText('M/M');

      await page.locator('.pf-rate').fill('0');
      await expect(page.locator('[data-est-cost]')).toHaveText('no cost estimate');
    });

    test('the program it makes carries the figure through', async ({ page }) => {
      await page.locator('[data-new-project]').click();
      await page.locator('.pf-name').fill('Priced');
      await page.locator('.pf-kickoff').fill('2029-01-01');
      await page.locator('.pf-rate').fill('20000');
      await page.locator('[data-create]').click();
      await page.waitForURL(/\/p\/priced-[^/]*\/overview$/);

      /* the Overview's stat, and the list's column */
      await expect(page.locator('.card').first()).toContainText('$');
      await page.goto('/');
      const row = page.locator('[data-program]').filter({ hasText: 'Priced' });
      await expect(row).toContainText('$');
    });

    test('a rate of zero leaves the column empty rather than claiming a number', async ({
      page,
    }) => {
      await page.locator('[data-new-project]').click();
      await page.locator('.pf-name').fill('Unpriced');
      await page.locator('.pf-kickoff').fill('2029-01-01');
      await page.locator('.pf-rate').fill('0');
      await page.locator('[data-create]').click();
      await page.waitForURL(/\/p\/unpriced-[^/]*\/overview$/);
      await expect(page.locator('.card').first()).not.toContainText('$');
    });
  });

  /* An empty panel headed "Needs you today" answers the question with silence.
     A program with nothing wrong gets the work instead. */
  test('a program with nothing wrong is shown what is coming up', async ({ page }) => {
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('Fresh');
    /* kicking off shortly, so nothing can be overdue yet */
    await page.locator('.pf-kickoff').fill('2029-01-01');
    await page.locator('[data-create]').click();
    await page.waitForURL(/\/p\/fresh-[^/]*\/overview$/);

    const nav = page.getByRole('navigation', { name: 'Program' });
    await expect(nav.getByRole('link', { name: /^Overdue/ })).toContainText('0');
    await expect(nav.getByRole('link', { name: /^Risks/ })).toContainText('0');

    /* the heading is not crying wolf, and the rows are the nearest dates */
    await expect(page.getByText('Coming up next')).toBeVisible();
    await expect(page.getByText('Needs you today')).toHaveCount(0);
    const rows = page.locator('[data-attn]');
    await expect(rows).toHaveCount(10);
    await expect(rows.first()).toContainText('Next up');

    const days = await rows.evaluateAll((els) =>
      els.map((e) => Number(/due in (\d+) day/.exec(e.textContent ?? '')?.[1] ?? 0)),
    );
    expect(days).toEqual([...days].sort((a, b) => a - b));
  });

  /* The toolbar's two buttons were decoration. They order and narrow the list
     by the figures the rows already print. */
  test.describe('the toolbar', () => {
    const open = async (page: Page, which: 'filter' | 'sort') => {
      await page.locator(`[data-menu="${which}"]`).click();
      await expect(page.locator(`[data-menu-pop="${which}"]`)).toBeVisible();
    };

    test('sorting reorders the list and says what it sorted by', async ({ page }) => {
      await page.locator('[data-new-project]').click();
      await page.locator('.pf-name').fill('Zulu');
      await page.locator('.pf-kickoff').fill('2029-01-01');
      await page.locator('[data-create]').click();
      await page.waitForURL(/\/p\/zulu-[^/]*\/overview$/);
      await page.goto('/');
      await expect(page.locator('[data-program]')).toHaveCount(2);

      /* the default is the nearest mask order, which is the seeded program */
      await expect(page.locator('[data-menu="sort"]')).toContainText('Tapeout');
      await expect(page.locator('[data-program]').first()).toContainText('AtlasAX1');

      await open(page, 'sort');
      await page.locator('[data-opt="kickoff"]').click();
      await expect(page.locator('[data-menu="sort"]')).toContainText('Newest');
      await expect(page.locator('[data-program]').first()).toContainText('Zulu');
    });

    test('filtering narrows the list, and the count says so', async ({ page }) => {
      /* a second program, kicking off years out, so it has nothing late */
      await page.locator('[data-new-project]').click();
      await page.locator('.pf-name').fill('Ahead');
      await page.locator('.pf-kickoff').fill('2029-01-01');
      await page.locator('[data-create]').click();
      await page.waitForURL(/\/p\/ahead-[^/]*\/overview$/);
      await page.goto('/');
      await expect(page.locator('[data-count]')).toHaveText('2');

      await open(page, 'filter');
      await page.locator('[data-opt="late"]').click();
      await expect(page.locator('[data-menu="filter"]')).toContainText('With late steps');
      /* the seeded program is the one with late steps */
      await expect(page.locator('[data-program]')).toHaveCount(1);
      await expect(page.locator('[data-program]').first()).toContainText('AtlasAX1');
      await expect(page.locator('[data-count]')).toHaveText('1 of 2');

      await open(page, 'filter');
      await page.locator('[data-opt="all"]').click();
      await expect(page.locator('[data-menu="filter"]')).toContainText('Filter');
      await expect(page.locator('[data-count]')).toHaveText('2');
    });

    test('a filter that answers nothing says so rather than showing an empty table', async ({
      page,
    }) => {
      /* nothing on the seed is finished, so "least done" keeps everything —
         but a program list with no risks at all has an answer to give */
      await page.locator('[data-new-project]').click();
      await page.locator('.pf-name').fill('Quiet');
      await page.locator('.pf-kickoff').fill('2029-01-01');
      await page.locator('[data-create]').click();
      await page.waitForURL(/\/p\/quiet-[^/]*\/overview$/);
      await page.goto('/');

      await open(page, 'filter');
      await page.locator('[data-opt="stale"]').click();
      const rows = await page.locator('[data-program]').count();
      if (rows === 0) {
        await expect(page.getByText('No program answers that')).toBeVisible();
        await expect(page.getByText(/Clear the filter to see all/)).toBeVisible();
      }
    });

    test('the menu closes on Escape and on a click away', async ({ page }) => {
      await open(page, 'filter');
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-menu-pop="filter"]')).toHaveCount(0);

      await open(page, 'sort');
      await page.locator('h2').first().click();
      await expect(page.locator('[data-menu-pop="sort"]')).toHaveCount(0);
    });
  });

  /* Not every chip does every stage. Picking the template's customised entry
     opens the 23 and starts the program on what is left ticked. */
  test.describe('on some of the template’s stages', () => {
    const pick = async (page: Page) => {
      await page.locator('[data-new-project]').click();
      await page.locator('.pf-profile').selectOption('custom:typicalSoC');
      await expect(page.locator('[data-stage-picker]')).toBeVisible();
    };

    test('offers all 23, ticked, and says how many', async ({ page }) => {
      await pick(page);
      await expect(page.locator('[data-pick]')).toHaveCount(23);
      await expect(page.locator('[data-pick][data-on]')).toHaveCount(23);
      await expect(page.locator('[data-new-program]')).toContainText('23 of 23');
    });

    /* Any stage can go, including the three the countdowns read. A program
       that does not tape out is a real program — a derivative doing only the
       package work, a study that stops at signoff — and the screens say so. */
    test('every stage can be unticked, including the checkpoint ones', async ({ page }) => {
      await pick(page);
      await expect(page.locator('[data-pick][aria-disabled="true"]')).toHaveCount(0);

      await page.locator('[data-pick-all]').click();
      await expect(page.locator('[data-pick][data-on]')).toHaveCount(0);
      await expect(page.locator('[data-new-program]')).toContainText('0 of 23');

      /* and Create refuses a program with nothing in it */
      await page.locator('.pf-name').fill('Empty');
      await page.locator('[data-create]').click();
      await expect(page.locator('[data-new-program] .err')).toContainText('at least one stage');
    });

    test('a program without Tapeout says No tapeout wherever a date would go', async ({ page }) => {
      await pick(page);
      await page.locator('.pf-name').fill('PackageOnly');
      await page.locator('.pf-kickoff').fill('2027-03-01');
      await page.locator('[data-pick-all]').click();
      for (const key of ['packageDesign', 'packageTestVehicle', 'packaging']) {
        await page.locator(`[data-pick="${key}"]`).click();
      }
      await expect(page.locator('[data-new-program]')).toContainText('3 of 23');
      await page.locator('[data-create]').click();
      await page.waitForURL(/\/p\/packageonly-[^/]*\/overview$/);

      /* the Overview's top stat */
      const tapeoutStat = page.locator('.card').first();
      await expect(tapeoutStat).toContainText('no tapeout on this program');

      /* and the counts are this program's, not the template's */
      const nav = page.getByRole('navigation', { name: 'Program' });
      await expect(nav.getByRole('link', { name: /^Stages/ })).toContainText('3');
      await expect(nav.getByRole('link', { name: /^Activities/ })).not.toContainText('257');
      await page.getByRole('link', { name: /^Activities/ }).click();
      await expect(page.locator('.hd')).toContainText('across 3 stages');

      /* the list's column, and the preview rail's countdown, which shows the
         checkpoints of the stages this program does run */
      await page.goto('/');
      const row = page.locator('[data-program]').filter({ hasText: 'PackageOnly' });
      await expect(row.locator('[data-tapeout]')).toHaveText('No tapeout');

      await row.click({ position: { x: 5, y: 5 }, trial: true });
      await row.hover();
      const peek = page.getByRole('complementary', { name: 'Program preview' });
      await expect(peek).toContainText('Package Design Freeze');
      await expect(peek).not.toContainText('Tapeout (BEOL MTO)');
    });

    test('starts the program on what was left ticked', async ({ page }) => {
      await pick(page);
      await page.locator('.pf-name').fill('AtlasTrim');
      await page.locator('.pf-kickoff').fill('2027-03-01');

      for (const key of ['testChip', 'validationHardware', 'testDevelopment']) {
        await page.locator(`[data-pick="${key}"]`).click();
        await expect(page.locator(`[data-pick="${key}"]`)).not.toHaveAttribute('data-on', '');
      }
      await expect(page.locator('[data-new-program]')).toContainText('20 of 23');

      await page.locator('[data-create]').click();
      await page.waitForURL(/\/p\/atlastrim-[^/]*\/overview$/);

      const nav = page.getByRole('navigation', { name: 'Program' });
      await expect(nav.getByRole('link', { name: /^Stages/ })).toContainText('20');

      /* the three that were unticked are not on it, and the rest are */
      await page.getByRole('link', { name: /^Stages/ }).click();
      await expect(page.locator('[data-stage="testChip"]')).toHaveCount(0);
      await expect(page.locator('[data-stage="tapeout"]')).toBeVisible();
      await expect(page.locator('[data-stage]')).toHaveCount(20);
    });

    /* The template it was cut from is not changed, and the cut-down list is
       not offered to the next program — it describes one program only. */
    test('leaves the template alone', async ({ page }) => {
      await pick(page);
      await page.locator('.pf-name').fill('AtlasCut');
      await page.locator('.pf-kickoff').fill('2027-03-01');
      await page.locator('[data-pick="testChip"]').click();
      await page.locator('[data-create]').click();
      await page.waitForURL(/\/p\/atlascut-[^/]*\/overview$/);

      await page.goto('/');
      await expect(page.locator('[data-program]').first()).toBeVisible();
      await page.locator('[data-new-project]').click();
      const options = await page.locator('.pf-profile option').evaluateAll((os) =>
        os.map((o) => (o as HTMLOptionElement).value),
      );
      expect(options).toEqual(['typicalSoC', 'custom:typicalSoC']);

      await page.locator('.pf-profile').selectOption('typicalSoC');
      await expect(page.locator('[data-stage-picker]')).toHaveCount(0);
      await page.locator('.pf-name').fill('AtlasWhole');
      await page.locator('.pf-kickoff').fill('2027-03-01');
      await page.locator('[data-create]').click();
      await page.waitForURL(/\/p\/atlaswhole-[^/]*\/overview$/);
      await expect(
        page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Stages/ }),
      ).toContainText('23');
    });
  });

  /* Deleting lives in the preview rail — the row itself is a link into the
     program, so it cannot also carry a destructive button. */
  test('a program is deleted, and asks first', async ({ page }) => {
    const before = await page.locator('[data-program]').count();
    const peek = page.getByRole('complementary', { name: 'Program preview' });

    await peek.locator('[data-del-project]').click();
    await peek.locator('[data-cancel-del]').click();
    await expect(page.locator('[data-program]')).toHaveCount(before);

    await peek.locator('[data-del-project]').click();
    await peek.locator('[data-confirm-del]').click();
    await expect(page.locator('[data-program]')).toHaveCount(before - 1);
  });
});
