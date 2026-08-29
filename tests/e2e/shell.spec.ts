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

  test('counts it can prove are there, and the two it cannot are not', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Program' });
    await expect(nav.getByRole('link', { name: /^Stages/ })).toContainText('23');
    await expect(nav.getByRole('link', { name: /^Deliverables/ })).toContainText('/167');
    /* Risks and Overdue mean steps now, and step state does not reach the
       browser yet. No badge until it does — a zero would be a claim. */
    await expect(nav.getByRole('link', { name: /^Risks/ })).toHaveText('Risks');
    await expect(nav.getByRole('link', { name: /^Overdue/ })).toHaveText('Overdue');
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

  test('closes when asked', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign`);
    const rail = page.getByRole('complementary', { name: 'Details' });
    await expect(rail).toContainText('Grace Park');
    await rail.getByRole('button', { name: 'Close details' }).click();
    await expect(rail).toContainText('Pick a stage');
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
    await expect(page.getByRole('link', { name: 'Activity', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  test('a deep link into a tab restores it', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/deliverables`);
    await expect(page.getByRole('link', { name: 'Key deliverables' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    /* and reloading it lands in the same place, which is the whole point of
       putting the tab in the URL rather than in component state */
    await page.reload();
    await expect(page.getByRole('link', { name: 'Key deliverables' })).toHaveAttribute(
      'aria-current',
      'page',
    );
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
  /* The prototype's colours are the ones the app is heading to, but the V1 page
     at /classic is still the reference's — so they are scoped to the shell
     until that route goes. Both have to be true at once. */
  test('the shell carries the prototype tokens, and the root still carries the reference ones', async ({
    page,
  }) => {
    await page.goto(SHELL_PATH);
    const shell = page.locator('.pshell');
    await expect(shell).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    const accents = await page.evaluate(() => ({
      shell: getComputedStyle(document.querySelector('.pshell')!)
        .getPropertyValue('--accent')
        .trim(),
      root: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
    }));
    expect(accents.shell).toBe('#5b5bd6');
    expect(accents.root).toBe('#256abf');
  });
});
