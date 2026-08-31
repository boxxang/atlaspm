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

/* The handover opens inline under its row, where the mockup opens it. */
const card = (page: import('./fixtures').Page) => page.locator('[data-handover]');

const openFirstOpen = async (page: import('./fixtures').Page) => {
  await page.goto(DELIVERABLES);
  await expect(page.locator('[data-board] [data-deliverable]').first()).toBeVisible();
  const row = page.locator('[data-board] [data-deliverable]').filter({ hasNot: page.locator('.pill.ok') }).first();
  const title = await row.locator('.wrapcell').first().innerText();
  await row.click();
  await expect(card(page)).toContainText('Handover');
  return { row, title: title.trim() };
};

const attach = (page: import('./fixtures').Page, name: string, body: string) =>
  card(page)
    .getByLabel('Attach an artefact')
    .setInputFiles({ name, mimeType: 'text/plain', buffer: Buffer.from(body) });

test.describe('the deliverables tab', () => {
  test('lists the stage’s key deliverables with a status word each', async ({ page }) => {
    await page.goto(DELIVERABLES);
    await expect(page.locator('[data-board] [data-deliverable]').first()).toBeVisible();
    await expect(page.locator('[data-board] [data-deliverable]')).toHaveCount(9);
    const words = await page.locator('[data-deliverable] .pill').allTextContents();
    for (const w of words) {
      expect(['Completed', 'Delayed', 'In progress', 'Not started']).toContain(w);
    }
  });

  /* Synthesis is the stage carrying delayed deliverables on the seeded
     schedule — Physical Design's are all still ahead of their dates. */
  test('a deliverable past its date with nothing handed over reads Delayed', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/synthesis/deliverables`);
    await expect(page.locator('[data-board] [data-deliverable]').first()).toBeVisible();
    const delayed = page.locator('[data-board] [data-deliverable]').filter({ hasText: 'Delayed' });
    expect(await delayed.count()).toBeGreaterThan(0);
    /* and the date it is late against is drawn as late */
    await expect(delayed.first().locator('.num').first()).toBeVisible();
  });

  test('Delayed is not Overdue: it is not on the Overdue board', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/stage/synthesis/deliverables`);
    await expect(page.locator('[data-board] [data-deliverable]').first()).toBeVisible();
    const title = (
      await page.locator('[data-board] [data-deliverable]').filter({ hasText: 'Delayed' }).first().locator('.wrapcell').first().innerText()
    ).trim();

    await page.goto(`${SHELL_PATH}/overdue`);
    await expect(page.locator('[data-board], .pview-todo')).toBeVisible();
    /* Overdue counts steps. A late deliverable says Delayed where deliverables
       are listed, and does not appear here. */
    await expect(page.locator('[data-board]')).not.toContainText(title);
  });
});

test.describe('handing one over', () => {
  /* The rule is enforced by the date field itself: it stays disabled until
     there is a body and something attached, so it cannot record an acceptance
     of nothing. */
  test('the date cannot be set until there is something to accept', async ({ page }) => {
    await openFirstOpen(page);
    const date = card(page).getByLabel('Completed on');
    await expect(date).toBeDisabled();
    await expect(card(page)).toContainText('a handover with nothing handed over cannot be');

    /* the body alone is not enough */
    await card(page).getByLabel('What was handed over').fill('Released to the fab.');
    await expect(date).toBeDisabled();

    /* the body and the artefact open it */
    await attach(page, 'release.txt', 'the artefact');
    await expect(card(page)).toContainText('release.txt');
    await expect(date).toBeEnabled();

    /* all three, and it is complete */
    await date.fill('2026-08-01');
    await card(page).getByRole('button', { name: /^(Post|Save)$/ }).click();
    await expect(card(page).locator('.pill')).toContainText('Completed 08/01/2026');
  });

  test('completes the row, and survives a reload', async ({ page }) => {
    const { title } = await openFirstOpen(page);
    await card(page).getByLabel('What was handed over').fill('Signed off by the owner.');
    await attach(page, 'signoff.txt', 'evidence');
    await card(page).getByLabel('Completed on').fill('2026-08-01');
    await card(page).getByRole('button', { name: /^(Post|Save)$/ }).click();
    await expect(card(page).locator('.pill')).toContainText('Completed 08/01/2026');
    await writesSettled(page);

    const row = page.locator('[data-board] [data-deliverable]').filter({ hasText: title });
    await expect(row.locator('.pill')).toHaveText('Completed');
    await expect(row).toContainText('08/01/2026');

    await page.reload();
    await expect(page.locator('[data-board] [data-deliverable]').filter({ hasText: title }).locator('.pill')).toHaveText(
      'Completed',
    );
  });

  /* The card's "Open PD-02 step 6 →" is the way from a handover to the step
     that produces it, and it has to go there — the step lives on another tab. */
  test('it leads to the step that hands it over', async ({ page }) => {
    await openFirstOpen(page);
    const go = card(page).getByRole('link', { name: /^Open .* step \d+ →$/ });
    await expect(go).toBeVisible();
    const label = (await go.innerText()).match(/Open (\S+) step (\d+)/)!;
    await go.click();
    await expect(page).toHaveURL(
      new RegExp(`/activity\\?step=${label[1]}:${label[2]}$`),
    );
    await expect(page.locator(`[data-step="${label[1]}:${label[2]}"]`)).toHaveClass(/sel/);
  });

  test('the clip opens the artefact itself', async ({ page }) => {
    const { title } = await openFirstOpen(page);
    await card(page).getByLabel('What was handed over').fill('Here it is.');
    await attach(page, 'artefact.txt', 'the bytes');
    await card(page).getByLabel('Completed on').fill('2026-08-01');
    await writesSettled(page);

    const clip = page.locator('[data-board] [data-deliverable]').filter({ hasText: title }).locator('.clip');
    await expect(clip).toBeVisible();
    const href = (await clip.getAttribute('href'))!;
    expect(href).toMatch(/^\/api\/attachments\//);
    const res = await page.request.get(href);
    expect(res.status()).toBe(200);
    expect(await res.text()).toBe('the bytes');
  });

  test('removing the last artefact reopens it', async ({ page }) => {
    const { title } = await openFirstOpen(page);
    await card(page).getByLabel('What was handed over').fill('Filed.');
    await attach(page, 'only.txt', 'one');
    await card(page).getByLabel('Completed on').fill('2026-08-01');
    await card(page).getByRole('button', { name: /^(Post|Save)$/ }).click();
    await expect(card(page).locator('.pill')).toContainText('Completed 08/01/2026');
    await writesSettled(page);

    /* The record stays — somebody wrote it — but the evidence behind the claim
       is gone, so the deliverable is no longer complete. */
    await card(page).getByRole('button', { name: 'Remove only.txt' }).click();
    await expect(page.locator('[data-board] [data-deliverable]').filter({ hasText: title }).locator('.pill')).not.toHaveText(
      'Completed',
    );
    await writesSettled(page);

    await page.reload();
    await expect(
      page.locator('[data-board] [data-deliverable]').filter({ hasText: title }).locator('.pill'),
    ).not.toHaveText('Completed');
  });

  test('a handover takes comments, and they survive', async ({ page }) => {
    const { title } = await openFirstOpen(page);
    await card(page).getByLabel('What was handed over').fill('First cut.');
    await attach(page, 'cut.txt', 'x');
    await card(page).getByLabel('Completed on').fill('2026-08-01');
    await writesSettled(page);

    await card(page).getByRole('button', { name: 'Post' }).click();
    await card(page).getByRole('button', { name: '+ Comment' }).click();
    await card(page)
      .getByLabel('Comment on this handover')
      .fill('Checked against the spec — looks right.');
    await card(page).getByRole('button', { name: 'Comment', exact: true }).click();
    await expect(card(page).locator('.replies .txt')).toHaveText(
      'Checked against the spec — looks right.',
    );
    await writesSettled(page);

    /* the card closes on a reload, so the same row has to be picked again by
       name — .first() is a different deliverable */
    await page.reload();
    await expect(page.locator('[data-board] [data-deliverable]').first()).toBeVisible();
    await page.locator('[data-board] [data-deliverable]').filter({ hasText: title }).click();
    await expect(card(page).locator('.replies .txt')).toContainText('Checked against');
  });

  /* A comment is a post like any other: correctable, and removed only after
     being asked about. Delete alone made a typo permanent. */
  test('a comment is corrected in place, and says it was edited', async ({ page }) => {
    const { title } = await openFirstOpen(page);
    await card(page).getByLabel('What was handed over').fill('Filed.');
    await attach(page, 'x.txt', 'x');
    await card(page).getByRole('button', { name: 'Post' }).click();
    await card(page).getByRole('button', { name: '+ Comment' }).click();
    await card(page).getByLabel('Comment on this handover').fill('Fisrt reading.');
    await card(page).getByRole('button', { name: 'Comment', exact: true }).click();

    const comment = card(page).locator('[data-comment]');
    await comment.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Edit comment').fill('First reading — checked twice.');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(comment.locator('.txt')).toHaveText('First reading — checked twice.');
    await expect(comment).toContainText('edited');
    await writesSettled(page);

    await page.reload();
    await page.locator('[data-board] [data-deliverable]').filter({ hasText: title }).click();
    await expect(card(page).locator('[data-comment] .txt')).toHaveText(
      'First reading — checked twice.',
    );
  });

  test('a comment is removed only after being asked about', async ({ page }) => {
    await openFirstOpen(page);
    await card(page).getByLabel('What was handed over').fill('Filed.');
    await attach(page, 'y.txt', 'y');
    await card(page).getByRole('button', { name: 'Post' }).click();
    await card(page).getByRole('button', { name: '+ Comment' }).click();
    await card(page).getByLabel('Comment on this handover').fill('Delete me.');
    await card(page).getByRole('button', { name: 'Comment', exact: true }).click();

    const comment = card(page).locator('[data-comment]');
    await comment.getByRole('button', { name: 'Delete' }).click();
    /* changing your mind leaves it where it was */
    await comment.getByRole('button', { name: 'Keep' }).click();
    await expect(comment.locator('.txt')).toHaveText('Delete me.');

    await comment.getByRole('button', { name: 'Delete' }).click();
    await comment.locator('.delconf').getByRole('button', { name: 'Delete' }).click();
    await expect(card(page).locator('[data-comment]')).toHaveCount(0);
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
    await expect(page.locator('[data-person="leader"]')).toContainText('Stage leader');
    expect(await page.locator('[data-person]').count()).toBeGreaterThan(1);
  });

  test('somebody added here can be put on a step straight away', async ({ page }) => {
    await openTeam(page);
    await page.getByRole('button', { name: /Add someone/ }).click();
    await page.getByLabel('Name').fill('Yuna Cho');
    await page.getByLabel('Responsibility').fill('SI engineer');
    await page.getByLabel('Email').fill('yuna.cho@example.com');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('[data-person]').filter({ hasText: 'Yuna Cho' })).toBeVisible();
    await writesSettled(page);

    /* the owner picker reads this list, so a new person can be put on a step
       without a reload */
    await page.goto(`${SHELL_PATH}/stage/physicalDesign/activity`);
    await expect(page.locator('[data-act]').first()).toBeVisible();
    await page.locator('[data-act="PD-10"]').click();
    await page.locator('[data-step="PD-10:2"]').click();
    await rail(page).locator('[data-edit-facts]').click();
    await rail(page).getByLabel('Owner').selectOption('Yuna Cho');
    await rail(page).getByRole('button', { name: 'Save' }).click();
    await expect(rail(page)).toContainText('Yuna Cho');
  });

  test('a person is edited in place, and the change sticks', async ({ page }) => {
    await openTeam(page);
    const row = page.locator('[data-person]:not([data-person="leader"])').first();
    const id = await row.getAttribute('data-person');
    await row.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Responsibility').fill('Floorplan owner');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator(`[data-person="${id}"]`)).toContainText('Floorplan owner');
    await writesSettled(page);

    await page.reload();
    await expect(page.locator(`[data-person="${id}"]`)).toContainText('Floorplan owner');
  });

  test('a person is removed, and stays removed', async ({ page }) => {
    await openTeam(page);
    const before = await page.locator('[data-person]').count();
    /* the lead cannot be removed from here, so this takes the first person who
       is not the lead */
    const row = page.locator('[data-person]:not([data-person="leader"])').first();
    const id = await row.getAttribute('data-person');
    /* Remove lives in the edit form, as the mockup puts it — a row you are only
       looking at has no way to delete anybody by mistake. */
    await row.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(page.locator(`[data-person="${id}"]`)).toHaveCount(0);
    await expect(page.locator('[data-person]')).toHaveCount(before - 1);
    await writesSettled(page);

    await page.reload();
    await expect(page.locator('[data-person]')).toHaveCount(before - 1);
  });
});
