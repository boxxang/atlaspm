import { expect, test, SHELL_PATH, writesSettled } from './fixtures';

/**
 * The stage page: the activity table, the steps inside the one that is open,
 * and the step panel in the rail.
 *
 * Physical Design is the stage these use throughout. It runs from 04/10/2026 to
 * 11/06/2026 on the seeded kickoff, so its steps have dates on both sides of a
 * clock set to 2026 — which is what makes Overdue and In progress both visible
 * on one screen.
 */
const STAGE = `${SHELL_PATH}/stage/physicalDesign/activity`;

const openActivity = async (page: import('./fixtures').Page, ref: string) => {
  await expect(page.locator('tr.pact').first()).toBeVisible();
  await page.locator(`[data-act="${ref}"]`).click();
  await expect(page.locator('.pstepblock')).toBeVisible();
};

/**
 * The seed's kickoff is 66 weeks before the day it runs, so every date in the
 * programme moves with the clock. Nothing here may hardcode one: these read the
 * date off the screen and assert what is true about it instead.
 */
const dueOf = async (page: import('./fixtures').Page, step: string) =>
  (await page.locator(`[data-step="${step}"] [data-due]`).innerText()).trim();

const asDate = (mmddyyyy: string) => {
  const [m, d, y] = mmddyyyy.split('/').map(Number);
  return new Date(y, m - 1, d);
};

test.describe('the activity table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STAGE);
  });

  test('lists the stage’s activities with what each hands over', async ({ page }) => {
    const rows = page.locator('tr.pact');
    await expect(rows).toHaveCount(16);
    const pd10 = page.locator('[data-act="PD-10"]');
    await expect(pd10).toContainText('Signal and Power Integrity Iteration');
    await expect(pd10).toContainText('SI/PI engineer');
    /* the deliverables it stands against, by reference — the titles drift
       between the two seed lists, the references cannot */
    await expect(pd10).toContainText('PD-D6');
  });

  test('opens an activity in place, and dims the rest of the stage', async ({ page }) => {
    await expect(page.locator('.pstepblock')).toHaveCount(0);
    await openActivity(page, 'PD-10');
    await expect(page.locator('table.pacts')).toHaveClass(/dimmed/);
    await expect(page.locator('[data-act="PD-10"]')).toHaveClass(/open/);
    /* six steps, and the two parallel ones are marked as such */
    await expect(page.locator('.pstepblock .pstep')).toHaveCount(6);
    await expect(page.locator('.pstepblock-cap')).toContainText('2 run in parallel');
  });

  test('a second click closes it again', async ({ page }) => {
    await openActivity(page, 'PD-10');
    await page.locator('[data-act="PD-10"]').click();
    await expect(page.locator('.pstepblock')).toHaveCount(0);
  });

  test('a step past its date with nothing handed over says Overdue', async ({ page }) => {
    await openActivity(page, 'PD-10');
    const step1 = page.locator('[data-step="PD-10:1"]');
    await expect(step1).toContainText('Overdue');
    /* and the date it is late against is drawn as late, and is in the past */
    const late = step1.locator('.num.late');
    await expect(late).toBeVisible();
    expect(asDate(await late.innerText()).getTime()).toBeLessThan(Date.now());
  });
});

test.describe('picking a step', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STAGE);
    await openActivity(page, 'PD-10');
  });

  test('selects it and only it', async ({ page }) => {
    await page.locator('[data-step="PD-10:2"]').click();
    await expect(page.locator('[data-step="PD-10:2"]')).toHaveClass(/picked/);
    await expect(page.locator('.pstep.picked')).toHaveCount(1);
  });

  test('does not close the block it is in', async ({ page }) => {
    await page.locator('[data-step="PD-10:2"]').click();
    await expect(page.locator('.pstepblock')).toBeVisible();
  });

  test('fills the rail with everything about it', async ({ page }) => {
    await page.locator('[data-step="PD-10:2"]').click();
    const rail = page.getByRole('complementary', { name: 'Details' });
    await expect(rail).toContainText('Step 2 of 6');
    await expect(rail).toContainText('Fix crosstalk');
    await expect(rail).toContainText('SI/PI engineer');
    await expect(rail.getByLabel('Owner')).toHaveValue('');
    await expect(rail.getByLabel('Completed')).toHaveValue('');
    /* the rail and the row are held to the same date */
    const [m, d, y] = (await dueOf(page, 'PD-10:2')).split('/');
    await expect(rail.getByLabel('Due')).toHaveValue(`${y}-${m}-${d}`);
  });

  test('the release step carries the activity’s key deliverables', async ({ page }) => {
    const rail = page.getByRole('complementary', { name: 'Details' });
    await page.locator('[data-step="PD-10:6"]').click();
    await expect(rail).toContainText('Hands over');
    await expect(rail).toContainText('PD-D6');
    /* and the steps before it do not: they produce outputs, not deliverables */
    await page.locator('[data-step="PD-10:2"]').click();
    await expect(rail).not.toContainText('Hands over');
  });
});

test.describe('changing a step', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STAGE);
    await openActivity(page, 'PD-10');
    await page.locator('[data-step="PD-10:2"]').click();
  });

  const rail = (page: import('./fixtures').Page) =>
    page.getByRole('complementary', { name: 'Details' });

  test('marking it complete stamps the date and survives a reload', async ({ page }) => {
    await rail(page).getByRole('button', { name: 'Mark complete' }).click();
    await expect(page.locator('[data-step="PD-10:2"]')).toContainText('Completed');
    await writesSettled(page);

    await page.reload();
    await openActivity(page, 'PD-10');
    await expect(page.locator('[data-step="PD-10:2"]')).toContainText('Completed');
    await expect(page.locator('[data-step="PD-10:2"] input[type="checkbox"]')).toBeChecked();
  });

  test('the completion date is editable afterwards', async ({ page }) => {
    await rail(page).getByRole('button', { name: 'Mark complete' }).click();
    await rail(page).getByLabel('Completed').fill('2026-07-01');
    await writesSettled(page);
    await page.reload();
    await openActivity(page, 'PD-10');
    await expect(page.locator('[data-step="PD-10:2"]')).toContainText('07/01/2026');
  });

  test('clearing the completion date reopens the step', async ({ page }) => {
    await rail(page).getByRole('button', { name: 'Mark complete' }).click();
    await rail(page).getByLabel('Completed').fill('');
    await expect(page.locator('[data-step="PD-10:2"] input[type="checkbox"]')).not.toBeChecked();
  });

  test('the checkbox in the table does the same thing', async ({ page }) => {
    await page.locator('[data-step="PD-10:3"] input[type="checkbox"]').check();
    await expect(page.locator('[data-step="PD-10:3"]')).toContainText('Completed');
    /* and ticking a row does not select it — the box is about the step, the
       row is about what the rail shows */
    await expect(page.locator('[data-step="PD-10:2"]')).toHaveClass(/picked/);
  });

  test('a moved due date is flagged as edited, and clearing it restores the plan', async ({
    page,
  }) => {
    const planned = await dueOf(page, 'PD-10:2');

    await rail(page).getByLabel('Due').fill('2027-12-01');
    await expect(rail(page)).toContainText('edited');
    await expect(page.locator('[data-step="PD-10:2"]')).toContainText('12/01/2027');
    /* and it is not late against a date that far out */
    await expect(page.locator('[data-step="PD-10:2"]')).not.toContainText('Overdue');

    await rail(page).getByLabel('Due').fill('');
    await expect(rail(page)).not.toContainText('edited');
    await expect(page.locator('[data-step="PD-10:2"]')).toContainText(planned);
  });

  test('an owner comes from the stage’s own people', async ({ page }) => {
    const owner = rail(page).getByLabel('Owner');
    await expect(owner.locator('option')).toContainText(['Unassigned', 'Grace Park']);
    await owner.selectOption('Grace Park');
    await writesSettled(page);
    await page.reload();
    await openActivity(page, 'PD-10');
    await page.locator('[data-step="PD-10:2"]').click();
    await expect(rail(page).getByLabel('Owner')).toHaveValue('Grace Park');
  });

  test('progress is recorded, and a completed step reads 100', async ({ page }) => {
    await rail(page).getByLabel('Progress').fill('40');
    await expect(rail(page)).toContainText('40%');
    await rail(page).getByRole('button', { name: 'Mark complete' }).click();
    await expect(rail(page)).toContainText('100%');
    await expect(rail(page).getByLabel('Progress')).toBeDisabled();
  });
});

test.describe('handing an output over', () => {
  const rail = (page: import('./fixtures').Page) =>
    page.getByRole('complementary', { name: 'Details' });

  test.beforeEach(async ({ page }) => {
    await page.goto(STAGE);
    await openActivity(page, 'PD-10');
    await page.locator('[data-step="PD-10:2"]').click();
  });

  test('completes the step and stamps the day it arrived', async ({ page }) => {
    await expect(rail(page)).toContainText('Nothing handed over yet');
    await rail(page)
      .getByLabel('Attach an output')
      .setInputFiles({ name: 'crosstalk-fixes.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 fixes') });

    await expect(rail(page)).toContainText('crosstalk-fixes.pdf');
    await expect(page.locator('[data-step="PD-10:2"]')).toContainText('Completed');
    /* stamped today, and the row says so */
    const today = new Date();
    const stamp = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
    await expect(page.locator('[data-step="PD-10:2"]')).toContainText(stamp);
  });

  test('the file is there to open, and survives a reload', async ({ page }) => {
    await rail(page)
      .getByLabel('Attach an output')
      .setInputFiles({ name: 'si-report.txt', mimeType: 'text/plain', buffer: Buffer.from('closed') });
    await expect(rail(page)).toContainText('si-report.txt');
    await writesSettled(page);

    const href = await rail(page).getByRole('link', { name: 'si-report.txt' }).getAttribute('href');
    expect(href).toMatch(/^\/api\/attachments\//);
    const res = await page.request.get(href!);
    expect(res.status()).toBe(200);
    expect(await res.text()).toBe('closed');

    await page.reload();
    await openActivity(page, 'PD-10');
    await page.locator('[data-step="PD-10:2"]').click();
    await expect(rail(page)).toContainText('si-report.txt');
    await expect(page.locator('[data-step="PD-10:2"]')).toContainText('Completed');
  });

  test('taking the last one back reopens the step', async ({ page }) => {
    await rail(page)
      .getByLabel('Attach an output')
      .setInputFiles({ name: 'draft.txt', mimeType: 'text/plain', buffer: Buffer.from('draft') });
    await expect(page.locator('[data-step="PD-10:2"]')).toContainText('Completed');

    await rail(page).getByRole('button', { name: 'Remove draft.txt' }).click();
    await expect(rail(page)).toContainText('Nothing handed over yet');
    await expect(page.locator('[data-step="PD-10:2"]')).not.toContainText('Completed');
    await expect(page.locator('[data-step="PD-10:2"] input[type="checkbox"]')).not.toBeChecked();
  });

  test('an output belongs to one program, not to every program with that step', async ({
    page,
  }) => {
    await rail(page)
      .getByLabel('Attach an output')
      .setInputFiles({ name: 'mine.txt', mimeType: 'text/plain', buffer: Buffer.from('mine') });
    await expect(rail(page)).toContainText('mine.txt');
    await writesSettled(page);

    /* PD-10 step 2 names a step of every program on this profile. The other
       one must not be showing this program's evidence. */
    await page.goto('/');
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('Second');
    await page.locator('.pf-kickoff').fill('2025-05-23');
    await page.locator('[data-create]').click();
    await page.waitForURL(/\/p\/second-/);
    const other = new URL(page.url()).pathname.replace(/\/overview$/, '');

    await page.goto(`${other}/stage/physicalDesign/activity`);
    await openActivity(page, 'PD-10');
    await page.locator('[data-step="PD-10:2"]').click();
    await expect(rail(page)).toContainText('Nothing handed over yet');
  });
});

/**
 * What a fresh install looks like.
 *
 * A programme half way through its baseline has finished most of the work whose
 * window has closed, and is stuck on a few things. Both halves matter: without
 * the first it reads as 0 of 1,649 with everything overdue, and without the
 * second the Overdue list is empty, which is not a programme either.
 */
test.describe('the seeded programme', () => {
  test('has finished the work behind it', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/productDefinition/activity`);
    await expect(page.locator('tr.pact').first()).toBeVisible();
    /* Product Definition is the first stage and long closed, so every one of
       its activities is complete. */
    const rows = page.locator('tr.pact .pdone');
    const counts = await rows.allInnerTexts();
    expect(counts.length).toBeGreaterThan(0);
    for (const c of counts) {
      const [done, total] = c.split('/').map(Number);
      expect(done, `a closed stage should be finished, saw ${c}`).toBe(total);
    }
  });

  test('is stuck on a few things, and stuck at the frontier', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/activity`);
    await expect(page.locator('tr.pact').first()).toBeVisible();
    /* an in-flight stage has work still open */
    const partial = page.locator('tr.pact').filter({ hasNot: page.locator('.pdone.all') });
    expect(await partial.count()).toBeGreaterThan(0);
  });

  test('never shows an open step behind a finished one', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/activity`);
    await expect(page.locator('tr.pact').first()).toBeVisible();
    const refs = await page.locator('tr.pact').evaluateAll((rows) =>
      rows.map((r) => r.getAttribute('data-act')!),
    );
    for (const ref of refs) {
      await page.locator(`[data-act="${ref}"]`).click();
      const pattern = (
        await page
          .locator('.pstepblock .pstep input[type="checkbox"]')
          .evaluateAll((boxes) => boxes.map((b) => ((b as HTMLInputElement).checked ? 'D' : 'o')))
      ).join('');
      expect(pattern, `${ref} runs ${pattern}`).toMatch(/^D*o*$/);
      await page.locator(`[data-act="${ref}"]`).click();
    }
  });
});
