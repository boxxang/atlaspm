import { expect, test, SEED_PROJECT_PATH, selectStage, settleLayout } from './fixtures';
import { writtenActivities } from '../../src/data/activityIndex';
import { journeyData } from '../../src/data/journey';

/**
 * An engineering activity that has been written up opens a page of its own —
 * a long read with an address, reached by leaving the programme rather than by
 * covering it, and returned from by the bar at the top.
 *
 * Every activity of the 23 stages is written up now, so every row of every
 * stage opens. The code still knows how to refuse — an ID that names nothing
 * is not a page, and a connection to an unwritten activity is an inert chip —
 * and that refusal is checked where it can be reached, on the units.
 */
const panel = '.stage-panel.selected';

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await selectStage(page, 'productDefinition');
  await settleLayout(page);
});

test.describe('opening an activity', () => {
  test('the row leads to the activity, and the bar leads back', async ({ page }) => {
    const row = page.locator(`${panel} [data-activity-link="DEF-01"]`);
    await expect(row).toBeVisible();
    await row.click();

    // a whole-page move, not a panel over the programme
    await page.waitForURL(/\/p\/atlasax1\/activity\/DEF-01$/);
    await expect(page.locator('#roadmap')).toHaveCount(0);
    await expect(page.locator('[data-activity="DEF-01"]')).toBeVisible();
    await expect(page.locator('.ad-title')).toHaveText(
      'Customer and Market Requirements Definition',
    );

    // and back to the programme it is dated against
    await page.locator('[data-ad-back]').click();
    await page.waitForURL(/\/p\/atlasax1$/);
    await expect(page.locator('#roadmap')).toBeVisible();
  });

  test('the first activity of every stage opens', async ({ page }) => {
    expect(writtenActivities).toHaveLength(257);
    /* one page per stage: a stage whose data is malformed fails here rather
       than the day somebody opens it */
    const first = journeyData.map((s) => `${s.shortTitle}-01`);
    expect(first).toHaveLength(23);
    for (const id of first) {
      await page.goto(`/p/atlasax1/activity/${id}`);
      await expect(page.locator(`[data-activity="${id}"]`), id).toBeVisible();
      // the four figures, the steps, and at least one thing to watch
      await expect(page.locator('.ad-fact'), id).toHaveCount(4);
      await expect(page.locator('.ad-steps li').first(), id).toBeVisible();
      await expect(page.locator('.ad-risks li').first(), id).toBeVisible();
    }
  });

  test('a later stage links every row it lists', async ({ page }) => {
    await selectStage(page, 'physicalDesign');
    await settleLayout(page);
    const rows = journeyData.find((s) => s.id === 'physicalDesign')!.engineeringView.length;
    await expect(page.locator(`${panel} [data-activity-link]`)).toHaveCount(rows);
    await expect(page.locator(`${panel} [data-activity-link="PD-01"]`)).toBeVisible();
  });

  test('an ID that names no activity is not a page', async ({ page }) => {
    const res = await page.goto('/p/atlasax1/activity/DEF-99');
    expect(res?.status()).toBe(404);
  });
});

test.describe('what the page says', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/p/atlasax1/activity/DEF-01');
    await expect(page.locator('[data-activity="DEF-01"]')).toBeVisible();
  });

  test('the numbers are the programme’s, and the dates are real', async ({ page }) => {
    /* The title, TAT and effort come off the programme's own engineering
       table, so a stage whose numbers were edited reads its own numbers. */
    const facts = page.locator('.ad-fact');
    await expect(facts.nth(0).locator('.v')).toHaveText('4W');
    await expect(facts.nth(1).locator('.v')).toContainText('4.0');
    // weeks into the stage, resolved against this programme's kickoff
    await expect(facts.nth(3).locator('.v')).toHaveText(/^\d{2}\/\d{2}\/\d{4}$/);
    await expect(facts.nth(3).locator('.d')).toHaveText(/^to \d{2}\/\d{2}\/\d{4}$/);
  });

  test('the steps lay out in two lanes, parallel ones alongside', async ({ page }) => {
    await expect(page.locator('.ad-steps li')).toHaveCount(7);
    await expect(page.locator('.ad-lane')).toHaveCount(2);
    // a parallel step starts where the main step it follows started
    const par = page.locator('.ad-step.par').first();
    await expect(par).toBeVisible();
    expect(await par.evaluate((e) => parseFloat((e as HTMLElement).style.left))).toBeGreaterThan(0);
  });

  test('every connection is a link, across stages as well as within one', async ({ page }) => {
    const chips = page.locator('.ad-chip');
    const total = await chips.count();
    expect(total).toBeGreaterThan(0);
    /* nothing is inert any more: every activity a write-up names is written */
    await expect(page.locator('.ad-chip:not(.on)')).toHaveCount(0);
    await expect(chips.first()).toHaveAttribute('href', /\/activity\/[A-Z]+-\d{2}$/);
    // DEF-01 feeds activities of other stages, and those lead away too
    const hrefs = await chips.evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''));
    expect(hrefs.some((h) => !h.includes('/DEF-'))).toBe(true);
  });

  test('following a connection lands on that activity', async ({ page }) => {
    await page.locator('.ad-chip.on').first().click();
    await page.waitForURL(/\/activity\/DEF-\d+$/);
    await expect(page.locator('.ad-title')).not.toHaveText(
      'Customer and Market Requirements Definition',
    );
  });

  test('a term opens its glossary entry', async ({ page }) => {
    await page.locator('.ad-terms button').first().click();
    const card = page.locator('.ad-termcard');
    await expect(card).toBeVisible();
    await expect(card.locator('.tp-note')).not.toBeEmpty();
    await page.locator('[data-term-close]').click();
    await expect(card).toHaveCount(0);
  });
});
