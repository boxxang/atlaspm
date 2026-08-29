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

test.describe('the rail', () => {
  test('says nothing is picked until something is', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stages`);
    const rail = page.getByRole('complementary', { name: 'Details' });
    await expect(rail).toContainText('Pick a stage');
  });

  test('follows the selection', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stages`);
    const rail = page.getByRole('complementary', { name: 'Details' });
    await page.getByRole('row', { name: /Physical Design/ }).getByText('Grace Park').click();
    await expect(rail).toContainText('Properties');
    await expect(rail).toContainText('Grace Park');
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
    await expect(rail).toContainText('Pick a stage');
    await expect(rail).not.toContainText('Grace Park');
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
