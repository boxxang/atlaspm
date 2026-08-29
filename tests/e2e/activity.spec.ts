import { expect, test, SHELL_PATH } from './fixtures';

/**
 * The activity write-up.
 *
 * Its own page rather than a panel: it is a page of prose, and the server reads
 * one write-up at a time out of a megabyte that never reaches the browser. The
 * shell's step index knows the steps; this knows what they are for.
 *
 * This replaces the V1 spec, which reached the page by clicking a row on a
 * screen that no longer exists.
 */
test.describe('an activity write-up', () => {
  test('opens on its own route and says what the activity is for', async ({ page }) => {
    await page.goto('/p/atlasax1/activity/DEF-01');
    await expect(page.locator('[data-activity="DEF-01"]')).toBeVisible();
    await expect(page.locator('.ad-title')).toHaveText(
      'Customer and Market Requirements Definition',
    );
    /* the steps the shell dates are the steps written up here */
    expect(await page.locator('.ad-steps li').count()).toBeGreaterThan(0);
  });

  test('leads back to the program', async ({ page }) => {
    await page.goto('/p/atlasax1/activity/DEF-01');
    await page.locator('[data-ad-back]').click();
    await expect(page).toHaveURL(/\/p\/atlasax1\/overview$/);
  });

  test('the rail links to it from the activity it is about', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/activity`);
    await expect(page.locator('[data-act]').first()).toBeVisible();
    await page.locator('[data-act="PD-10"]').click();

    const rail = page.getByRole('complementary', { name: 'Details' });
    await rail.getByRole('link', { name: /Read PD-10/ }).click();
    await expect(page).toHaveURL(/\/activity\/PD-10$/);
    await expect(page.locator('.ad-title')).toContainText('Signal and Power Integrity');
  });

  test('an activity nobody wrote up says so rather than breaking', async ({ page }) => {
    await page.goto('/p/atlasax1/activity/DEF-99');
    await expect(page.locator('[data-activity="DEF-01"]')).toHaveCount(0);
  });
});
