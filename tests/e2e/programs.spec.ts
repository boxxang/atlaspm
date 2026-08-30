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

  /* Not every chip does every stage. Picking the template's customised entry
     opens the 23 and starts the program on what is left ticked. */
  test.describe('on some of the template’s stages', () => {
    const pick = async (page: Page) => {
      await page.locator('[data-new-project]').click();
      await page.locator('.pf-profile').selectOption({ label: 'Typical SoC (Customized)' });
      await expect(page.locator('[data-stage-picker]')).toBeVisible();
    };

    test('offers all 23, ticked, and says how many', async ({ page }) => {
      await pick(page);
      await expect(page.locator('[data-pick]')).toHaveCount(23);
      await expect(page.locator('[data-pick][data-on]')).toHaveCount(23);
      await expect(page.locator('[data-new-program-form]')).toContainText('23 of 23 stages');
    });

    /* The three the countdowns read cannot be dropped; everything else can.
       They are disabled, so the click never lands rather than being undone. */
    test('locks the stages the checkpoints hang off, and only those', async ({ page }) => {
      await pick(page);
      await expect(page.locator('[data-pick][aria-disabled="true"]')).toHaveCount(3);
      for (const key of ['tapeout', 'fabrication', 'qualification']) {
        await expect(page.locator(`[data-pick="${key}"]`)).toHaveAttribute('aria-disabled', 'true');
      }
      /* one that carries a lesser checkpoint is not locked */
      const testChip = page.locator('[data-pick="testChip"]');
      await expect(testChip).not.toHaveAttribute('aria-disabled', 'true');
      await testChip.click();
      await expect(testChip).not.toHaveAttribute('data-on', '');
    });

    test('starts the program on what was left ticked', async ({ page }) => {
      await pick(page);
      await page.locator('.pf-name').fill('AtlasTrim');
      await page.locator('.pf-kickoff').fill('2027-03-01');

      for (const key of ['testChip', 'validationHardware', 'testDevelopment']) {
        await page.locator(`[data-pick="${key}"]`).click();
        await expect(page.locator(`[data-pick="${key}"]`)).not.toHaveAttribute('data-on', '');
      }
      await expect(page.locator('[data-new-program-form]')).toContainText('20 of 23 stages');

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
      const options = await page.locator('.pf-profile option').allTextContents();
      expect(options).toEqual(['Typical SoC', 'Typical SoC (Customized)']);

      await page.locator('.pf-profile').selectOption({ label: 'Typical SoC' });
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
