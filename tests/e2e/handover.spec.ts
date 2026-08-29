import { expect, test, SHELL_PATH, writesSettled } from './fixtures';

/**
 * Completing a key deliverable.
 *
 * The rule the prototype settled on: a deliverable is complete because the
 * artefact is here, somebody said what it was, and there is a date it was
 * accepted. Not because a box was ticked — there is no box.
 */
const DELIVERABLES = `${SHELL_PATH}/stage/physicalDesign/deliverables`;

const rail = (page: import('./fixtures').Page) =>
  page.getByRole('complementary', { name: 'Details' });

const openFirstOpen = async (page: import('./fixtures').Page) => {
  await page.goto(DELIVERABLES);
  await expect(page.locator('.pdeliv').first()).toBeVisible();
  const row = page.locator('.pdeliv').filter({ hasNot: page.locator('.ppill.ok') }).first();
  const title = await row.locator('th[scope="row"]').innerText();
  await row.click();
  await expect(rail(page)).toContainText('Handover');
  return { row, title: title.trim() };
};

const attach = (page: import('./fixtures').Page, name: string, body: string) =>
  rail(page)
    .getByLabel('Attach an artefact')
    .setInputFiles({ name, mimeType: 'text/plain', buffer: Buffer.from(body) });

test.describe('the deliverables tab', () => {
  test('lists the stage’s key deliverables with a status word each', async ({ page }) => {
    await page.goto(DELIVERABLES);
    await expect(page.locator('.pdeliv').first()).toBeVisible();
    await expect(page.locator('.pdeliv')).toHaveCount(9);
    const words = await page.locator('.pdeliv .ppill').allTextContents();
    for (const w of words) {
      expect(['Completed', 'Delayed', 'In progress', 'Not started']).toContain(w);
    }
  });

  /* Synthesis is the stage carrying delayed deliverables on the seeded
     schedule — Physical Design's are all still ahead of their dates. */
  test('a deliverable past its date with nothing handed over reads Delayed', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/synthesis/deliverables`);
    await expect(page.locator('.pdeliv').first()).toBeVisible();
    const delayed = page.locator('.pdeliv').filter({ hasText: 'Delayed' });
    expect(await delayed.count()).toBeGreaterThan(0);
    /* and the date it is late against is drawn as late */
    await expect(delayed.first().locator('.num.late')).toBeVisible();
  });

  test('Delayed is not Overdue: it is not on the Overdue board', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/synthesis/deliverables`);
    await expect(page.locator('.pdeliv').first()).toBeVisible();
    const title = (
      await page.locator('.pdeliv').filter({ hasText: 'Delayed' }).first().locator('th').innerText()
    ).trim();

    await page.goto(`${SHELL_PATH}/overdue`);
    await expect(page.locator('.pboard, .pview-todo')).toBeVisible();
    /* Overdue counts steps. A late deliverable says Delayed where deliverables
       are listed, and does not appear here. */
    await expect(page.locator('.pboard')).not.toContainText(title);
  });
});

test.describe('handing one over', () => {
  test('needs all three, and says which are missing', async ({ page }) => {
    await openFirstOpen(page);
    await expect(rail(page)).toContainText('Not handed over');
    await expect(rail(page)).toContainText('what was handed over');
    await expect(rail(page)).toContainText('an artefact');
    await expect(rail(page)).toContainText('the date');

    /* the body alone is not enough */
    await rail(page).getByLabel('What was handed over').fill('Released to the fab.');
    await rail(page).getByLabel('Accepted').click();
    await expect(rail(page)).toContainText('Not handed over');
    await expect(rail(page)).not.toContainText('what was handed over');

    /* nor the body and the artefact without a date */
    await attach(page, 'release.txt', 'the artefact');
    await expect(rail(page)).toContainText('release.txt');
    await expect(rail(page)).toContainText('Not handed over');

    /* all three, and it is complete */
    await rail(page).getByLabel('Accepted').fill('2026-08-01');
    await expect(rail(page).locator('.ppill.ok')).toHaveText('Completed');
  });

  test('completes the row, and survives a reload', async ({ page }) => {
    const { title } = await openFirstOpen(page);
    await rail(page).getByLabel('What was handed over').fill('Signed off by the owner.');
    await attach(page, 'signoff.txt', 'evidence');
    await rail(page).getByLabel('Accepted').fill('2026-08-01');
    await expect(rail(page).locator('.ppill.ok')).toHaveText('Completed');
    await writesSettled(page);

    const row = page.locator('.pdeliv').filter({ hasText: title });
    await expect(row.locator('.ppill')).toHaveText('Completed');
    await expect(row).toContainText('08/01/2026');

    await page.reload();
    await expect(page.locator('.pdeliv').filter({ hasText: title }).locator('.ppill')).toHaveText(
      'Completed',
    );
  });

  test('the clip opens the artefact itself', async ({ page }) => {
    const { title } = await openFirstOpen(page);
    await rail(page).getByLabel('What was handed over').fill('Here it is.');
    await attach(page, 'artefact.txt', 'the bytes');
    await rail(page).getByLabel('Accepted').fill('2026-08-01');
    await writesSettled(page);

    const clip = page.locator('.pdeliv').filter({ hasText: title }).locator('.pclip');
    await expect(clip).toBeVisible();
    const href = (await clip.getAttribute('href'))!;
    expect(href).toMatch(/^\/api\/attachments\//);
    const res = await page.request.get(href);
    expect(res.status()).toBe(200);
    expect(await res.text()).toBe('the bytes');
  });

  test('removing the last artefact reopens it', async ({ page }) => {
    const { title } = await openFirstOpen(page);
    await rail(page).getByLabel('What was handed over').fill('Filed.');
    await attach(page, 'only.txt', 'one');
    await rail(page).getByLabel('Accepted').fill('2026-08-01');
    await expect(rail(page).locator('.ppill.ok')).toHaveText('Completed');
    await writesSettled(page);

    await rail(page).getByRole('button', { name: 'Remove only.txt' }).click();
    await expect(rail(page)).toContainText('Not handed over');
    await expect(page.locator('.pdeliv').filter({ hasText: title }).locator('.ppill')).not.toHaveText(
      'Completed',
    );
    await writesSettled(page);

    await page.reload();
    await expect(
      page.locator('.pdeliv').filter({ hasText: title }).locator('.ppill'),
    ).not.toHaveText('Completed');
  });

  test('a handover takes comments, and they survive', async ({ page }) => {
    const { title } = await openFirstOpen(page);
    await rail(page).getByLabel('What was handed over').fill('First cut.');
    await attach(page, 'cut.txt', 'x');
    await rail(page).getByLabel('Accepted').fill('2026-08-01');
    await writesSettled(page);

    await rail(page).getByLabel('Reply…').fill('Checked against the spec — looks right.');
    await rail(page).locator('.pcomposer.small').getByRole('button', { name: 'Post' }).click();
    await expect(rail(page).locator('.preplies .ppost-text')).toHaveText(
      'Checked against the spec — looks right.',
    );
    await writesSettled(page);

    /* the rail clears on a reload, so the same row has to be picked again by
       name — .picked is gone and .first() is a different deliverable */
    await page.reload();
    await expect(page.locator('.pdeliv').first()).toBeVisible();
    await page.locator('.pdeliv').filter({ hasText: title }).click();
    await expect(rail(page).locator('.preplies .ppost-text')).toContainText('Checked against');
  });
});

test.describe('the team', () => {
  const TEAM = `${SHELL_PATH}/stage/physicalDesign/team`;

  /* the shell renders nothing until it hydrates, so a one-shot count() has to
     be told to wait for the table */
  const openTeam = async (page: import('./fixtures').Page) => {
    await page.goto(TEAM);
    await expect(page.locator('[data-person="leader"]')).toBeVisible();
  };

  test('lists the stage lead alongside everyone else', async ({ page }) => {
    await openTeam(page);
    await expect(page.locator('[data-person="leader"]')).toContainText('Grace Park');
    await expect(page.locator('[data-person="leader"] .ppill')).toHaveText('Lead');
    expect(await page.locator('tr[data-person]').count()).toBeGreaterThan(1);
  });

  test('somebody added here can be put on a step straight away', async ({ page }) => {
    await openTeam(page);
    await page.getByRole('button', { name: '+ Add someone' }).click();
    await page.getByLabel('Name').fill('Yuna Cho');
    await page.getByLabel('Role').fill('SI engineer');
    await page.getByLabel('Email').fill('yuna.cho@example.com');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('tr[data-person]').filter({ hasText: 'Yuna Cho' })).toBeVisible();
    await writesSettled(page);

    /* the owner picker reads this list, so a new person can be put on a step
       without a reload */
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/activity`);
    await expect(page.locator('tr.pact').first()).toBeVisible();
    await page.locator('[data-act="PD-10"]').click();
    await page.locator('[data-step="PD-10:2"]').click();
    await rail(page).getByLabel('Owner').selectOption('Yuna Cho');
    await expect(rail(page).getByLabel('Owner')).toHaveValue('Yuna Cho');
  });

  test('a person is edited in place, and the change sticks', async ({ page }) => {
    await openTeam(page);
    const row = page.locator('tr[data-person]').nth(1);
    const id = await row.getAttribute('data-person');
    await row.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Role').fill('Floorplan owner');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator(`[data-person="${id}"]`)).toContainText('Floorplan owner');
    await writesSettled(page);

    await page.reload();
    await expect(page.locator(`[data-person="${id}"]`)).toContainText('Floorplan owner');
  });

  test('a person is removed, and stays removed', async ({ page }) => {
    await openTeam(page);
    const before = await page.locator('tr[data-person]').count();
    /* the lead cannot be removed from here, so this takes the first person who
       is not the lead */
    const row = page.locator('tr[data-person]:not([data-person="leader"])').first();
    const id = await row.getAttribute('data-person');
    await row.getByRole('button', { name: 'Remove' }).click();
    await expect(page.locator(`[data-person="${id}"]`)).toHaveCount(0);
    await expect(page.locator('tr[data-person]')).toHaveCount(before - 1);
    await writesSettled(page);

    await page.reload();
    await expect(page.locator('tr[data-person]')).toHaveCount(before - 1);
  });
});
