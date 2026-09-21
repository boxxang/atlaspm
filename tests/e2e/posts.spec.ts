import { expect, test, SEED_PROJECT_ID, SHELL_PATH, testDb, writesSettled } from './fixtures';

/**
 * Posting: on a step, on a stage's key-info board, and as a reply.
 *
 * One shape in four places, so these check the shape once and then check that
 * each place lands it on the right target — a note on the stage, an update on
 * the step, a risk that the Risks board picks up.
 */

const STAGE = `${SHELL_PATH}/stage/physicalDesign`;

const openStep = async (page: import('./fixtures').Page, ref: string, n: number) => {
  await page.goto(`${STAGE}/activity`);
  await expect(page.locator('[data-act]').first()).toBeVisible();
  await page.locator(`[data-act="${ref}"]`).click();
  await page.locator(`[data-step="${ref}:${n}"]`).click();
};

const rail = (page: import('./fixtures').Page) =>
  page.getByRole('complementary', { name: 'Details' });

test.describe('key info', () => {
  const write = async (page: import('./fixtures').Page, title: string, body?: string) => {
    await page.getByRole('button', { name: 'New note' }).click();
    await page.getByLabel('Note title').fill(title);
    if (body) await page.getByLabel('Note', { exact: true }).fill(body);
    await page.getByRole('button', { name: 'Save note' }).click();
  };

  test.beforeEach(async ({ page }) => {
    await page.goto(`${STAGE}/keyinfo`);
    await expect(page.getByRole('button', { name: 'New note' })).toBeVisible();
  });

  test('starts empty, and says so', async ({ page }) => {
    await expect(page.getByText('Nothing recorded yet.')).toBeVisible();
  });

  test('a note is written, counted on the tab, and survives a reload', async ({ page }) => {
    await write(page, 'PDK 2.1 decks land in March.');
    await expect(page.locator('[data-note]')).toContainText('PDK 2.1 decks land in March.');
    await expect(page.getByRole('link', { name: /^Key info/ })).toContainText('1');
    await writesSettled(page);

    await page.reload();
    await expect(page.locator('[data-note]')).toContainText('PDK 2.1 decks land in March.');
  });

  /* The title is what the list shows and the filter searches; the body is what
     the note is actually for, and opens under the row. */
  test('a note carries a body, and the filter finds it by either', async ({ page }) => {
    /* saving opens what you just wrote, as the mockup does */
    await write(page, 'Foundry answer on the deep trench', 'They will not qualify it before Q3.');
    await expect(page.locator('.notecard')).toContainText('They will not qualify it before Q3.');

    await page.getByLabel('Filter these notes').fill('deep trench');
    await expect(page.locator('[data-note]')).toHaveCount(1);
    await page.getByLabel('Filter these notes').fill('qualify it before');
    await expect(page.locator('[data-note]')).toHaveCount(1);
    await page.getByLabel('Filter these notes').fill('nothing says this');
    await expect(page.locator('[data-note]')).toHaveCount(0);
    await expect(page.getByText('No note here says that.')).toBeVisible();
  });

  /* Everything written here is a post, which is the point — but a note is a
     page kept on a stage, not a thing said about the work on a day, and a feed
     of them drowns the updates it is mixed into. */
  test('a note stays off the Updates feed, and out of its count', async ({ page }) => {
    /* the programme's own Updates entry in the left nav, not the stage tab */
    const nav = page.locator(`a[href="${SHELL_PATH}/updates"]`).first();
    const before = Number((await nav.innerText()).replace(/\D+/g, '') || 0);

    await write(page, 'Deep trench capacitor decision', 'The foundry will not qualify it before Q3.');
    await expect(page.locator('[data-note]')).toContainText('Deep trench capacitor decision');
    await writesSettled(page);

    /* the badge does not move, and the page behind it does not either */
    await expect(nav).toContainText(String(before));
    await page.goto(`${SHELL_PATH}/updates`);
    await expect(page.locator('[data-update]')).toHaveCount(before);
    await expect(page.getByText('Deep trench capacitor decision')).toHaveCount(0);

    /* nor the overview's recent list, which reads the same rule */
    await page.goto(SHELL_PATH);
    await expect(page.locator('.ovfeed').filter({ hasText: 'Deep trench' })).toHaveCount(0);

    /* and the note is still on the stage that keeps it */
    await page.goto(`${STAGE}/keyinfo`);
    await expect(page.locator('[data-note]')).toContainText('Deep trench capacitor decision');
  });

  /* A table is the reason notes have documents: typed cell by cell, grown a
     row at a time, and still a table after a reload. */
  test('a note carries a real table, typed cell by cell, and keeps it', async ({ page }) => {
    await page.getByRole('button', { name: 'New note' }).click();
    await page.getByLabel('Note title').fill('Mask slots');
    const editor = page.getByLabel('Note', { exact: true });
    await expect(editor).toBeVisible();
    await page.locator('[data-notetool="table"]').click();
    await expect(editor.locator('table tr')).toHaveCount(3);

    await editor.locator('th').first().click();
    await page.keyboard.type('Layer set');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Slot');
    await editor.locator('td').first().click();
    await page.keyboard.type('FEOL');
    await page.keyboard.press('Tab');
    await page.keyboard.type('10/05');
    await page.locator('[data-notetool="addRow"]').click();
    await expect(editor.locator('table tr')).toHaveCount(4);
    await page.getByRole('button', { name: 'Save note' }).click();

    const shown = page.locator('.notecard [data-note-doc] table');
    await expect(shown.locator('th').first()).toHaveText('Layer set');
    await expect(shown.locator('tr')).toHaveCount(4);
    await writesSettled(page);

    await page.reload();
    await page.locator('[data-note]').filter({ hasText: 'Mask slots' }).click();
    await expect(page.locator('.notecard [data-note-doc] td').first()).toHaveText('FEOL');
    /* the filter reads what the cells say */
    await page.getByLabel('Filter these notes').fill('10/05');
    await expect(page.locator('[data-note]')).toHaveCount(1);
  });

  test('a range pasted from a spreadsheet arrives as a table', async ({ page }) => {
    await page.getByRole('button', { name: 'New note' }).click();
    await page.getByLabel('Note title').fill('Corner list');
    const editor = page.getByLabel('Note', { exact: true });
    await editor.click();
    await editor.evaluate((el) => {
      const data = new DataTransfer();
      data.setData('text/html', '<table><tr><td>Corner</td><td>WNS</td></tr><tr><td>SSGNP 0.72 V</td><td>-41 ps</td></tr></table>');
      data.setData('text/plain', 'Corner\tWNS\nSSGNP 0.72 V\t-41 ps');
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
    });
    await expect(editor.locator('table tr')).toHaveCount(2);
    await page.getByRole('button', { name: 'Save note' }).click();
    await expect(page.locator('.notecard [data-note-doc] table')).toContainText('-41 ps');
  });

  /* Notes written before notes had documents are plain text, and there are
     some on production. They read as they did, and editing one makes it a
     document without losing a line. */
  test('a note written before notes had documents reads as it did, and edits into one', async ({ page }) => {
    await testDb().post.create({
      data: {
        id: 'legacy-note',
        projectId: SEED_PROJECT_ID,
        kind: 'note',
        text: 'Split MTO\nFEOL 10/05\nBEOL 11/02',
        author: 'Sangwook Park',
        createdAt: new Date(),
        stageId: 'physicalDesign',
      },
    });
    await page.reload();
    await page.locator('[data-note="legacy-note"]').click();
    await expect(page.locator('.notecard .noteprose-text')).toContainText('BEOL 11/02');

    await page.getByRole('button', { name: 'Edit' }).click();
    const editor = page.getByLabel('Note', { exact: true });
    await expect(editor.locator('p')).toHaveCount(2);
    await page.getByRole('button', { name: 'Save note' }).click();
    await expect(page.locator('.notecard [data-note-doc]')).toContainText('BEOL 11/02');
    await expect(page.locator('[data-note="legacy-note"]')).toContainText('Split MTO');
  });

  test('a note is edited in place, and says it was edited', async ({ page }) => {
    await write(page, 'First wording.');
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Note title').fill('Second wording.');
    await page.getByRole('button', { name: 'Save note' }).click();
    await expect(page.locator('[data-note]')).toContainText('Second wording.');
    await expect(page.locator('.notecard-hd')).toContainText('edited');
    await writesSettled(page);

    await page.reload();
    await expect(page.locator('[data-note]')).toContainText('Second wording.');
  });

  test('a note is deleted, and stays deleted', async ({ page }) => {
    await write(page, 'Delete me.');
    await expect(page.locator('[data-note]')).toHaveCount(1);
    await page.locator('.notecard-hd').getByRole('button', { name: 'Delete' }).click();
    /* Delete asks before it throws anything away */
    await page.locator('.delconf').getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('[data-note]')).toHaveCount(0);
    await writesSettled(page);

    await page.reload();
    await expect(page.getByText('Nothing recorded yet.')).toBeVisible();
  });

  test('a note belongs to its own stage', async ({ page }) => {
    await write(page, 'Physical Design only.');
    await writesSettled(page);

    await page.goto(`${SHELL_PATH}/stage/signoff/keyinfo`);
    await expect(page.getByText('Nothing recorded yet.')).toBeVisible();
  });
});

test.describe('posting on a step', () => {
  test('an update lands on that step and nowhere else', async ({ page }) => {
    await openStep(page, 'PD-14', 2);
    await rail(page).getByLabel('What happened on step 2…').fill('Waiting on the spacing study.');
    await rail(page).getByRole('button', { name: 'Post' }).click();
    await expect(rail(page).locator('.txt')).toHaveText('Waiting on the spacing study.');
    await writesSettled(page);

    /* the step next door has its own thread */
    await page.locator('[data-step="PD-14:3"]').click();
    await expect(rail(page)).toContainText('No updates on this step yet.');
  });

  /* A blank line is how a post separates two thoughts and an indent is how it
     quotes a log line. Collapsing both is the browser's default, not a
     decision anybody made. */
  test('a post keeps the line breaks and spacing it was written with', async ({ page }) => {
    await openStep(page, 'PD-14', 4);
    const typed = 'First line.\n\nSecond paragraph.\n    indented   with   gaps';
    await rail(page).getByLabel('What happened on step 4…').fill(typed);
    await rail(page).getByRole('button', { name: 'Post' }).click();

    const body = rail(page).locator('.post .txt').first();
    await expect(body).toHaveText(typed);
    /* rendered, not merely stored: three lines of text occupy three lines */
    const lines = await body.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        ws: style.whiteSpace,
        rows: Math.round(el.getBoundingClientRect().height / parseFloat(style.lineHeight)),
      };
    });
    expect(lines.ws).toBe('pre-wrap');
    expect(lines.rows).toBeGreaterThanOrEqual(4);
    await writesSettled(page);

    await page.reload();
    await openStep(page, 'PD-14', 4);
    await expect(rail(page).locator('.post .txt').first()).toHaveText(typed);
  });

  test('ticking risk makes it a risk, and the boards pick it up', async ({ page }) => {
    await openStep(page, 'PD-08', 5);
    await rail(page).getByLabel('What happened on step 5…').fill('Antenna fixes need another routing turn.');
    await rail(page).getByRole('checkbox', { name: 'risk' }).check();
    await rail(page).getByRole('button', { name: 'Post' }).click();
    /* the rail already carries risk-coloured pills for an overdue step, so
       this asks for the one on the post */
    await expect(rail(page).locator('.post .pill.risk')).toHaveText('RISK');
    await writesSettled(page);

    /* the nav badge, the stage tab and the board all agree */
    await expect(
      page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Risks/ }),
    ).toContainText('7');
    await page.goto(`${SHELL_PATH}/risks`);
    await expect(page.locator('[data-row]')).toHaveCount(7);
    await expect(page.locator('[data-board]')).toContainText('Antenna fixes need another routing turn.');
  });

  /* A risk on the step that ticks a deliverable puts two flags beside its
     text, and with the rail open the column is narrow. The text used to give
     way to the flags until it was one letter wide. */
  test('a flagged step that ticks a deliverable keeps its text readable', async ({ page }) => {
    await openStep(page, 'PD-14', 1);
    const ticking = page.locator('[data-step^="PD-14:"]').filter({ hasText: 'TICKS' });
    await expect(ticking).toHaveCount(1);
    const ref = (await ticking.getAttribute('data-step'))!;
    const n = Number(ref.split(':')[1]);
    await ticking.click();
    await rail(page).getByLabel(`What happened on step ${n}…`).fill('Congestion on the last turn.');
    await rail(page).getByRole('checkbox', { name: 'risk' }).check();
    await rail(page).getByRole('button', { name: 'Post' }).click();

    const row = page.locator(`[data-step="${ref}"]`);
    await expect(row.getByText('RISK FLAGGED')).toBeVisible();
    await expect(rail(page)).toBeVisible();
    const text = row.locator('[data-col="Step"] > span').first();
    expect((await text.boundingBox())!.width).toBeGreaterThan(100);
    expect((await row.boundingBox())!.height).toBeLessThan(160);
  });

  test('a reply sits under the post it answers, and goes with it', async ({ page }) => {
    await openStep(page, 'PD-14', 2);
    await rail(page).getByLabel('What happened on step 2…').fill('The parent.');
    await rail(page).getByRole('button', { name: 'Post' }).click();
    await rail(page).getByRole('button', { name: 'Reply' }).click();
    await rail(page).getByLabel('Reply — what moved, and what closed it…').fill('The answer.');
    await rail(page).locator('.reply .composer').getByRole('button', { name: 'Reply' }).click();

    await expect(rail(page).locator('.replies .txt')).toHaveText('The answer.');
    await writesSettled(page);
    await page.reload();
    await openStep(page, 'PD-14', 2);
    await expect(rail(page).locator('.replies .txt')).toHaveText('The answer.');

    /* In the feed the reply has no target of its own, so it borrows its
       parent's: what it answers, and where that answer belongs. */
    await page.goto(`${SHELL_PATH}/updates`);
    const answer = page.locator('[data-update]').filter({ hasText: 'The answer.' });
    await expect(answer.locator('[data-subject]')).toHaveText('The parent.');
    await expect(answer.locator('[data-ref="PD-14"]')).toBeVisible();
    await expect(answer.locator('[data-step-link="PD-14:2"]')).toBeVisible();
    /* and the post it answers names nothing, because its own pills do */
    await expect(
      page.locator('[data-update]').filter({ hasText: 'The parent.' }).last().locator('[data-subject]'),
    ).toHaveCount(0);

    await openStep(page, 'PD-14', 2);
    /* deleting the parent takes the thread — a reply to nothing is not a post */
    await rail(page)
      /* the actions sit under the body now, not on the name's line */
      .locator('.thread > .post > div > .postacts')
      .getByRole('button', { name: 'Delete' })
      .click();
    await rail(page).locator('.delconf').getByRole('button', { name: 'Delete' }).click();
    await expect(rail(page).locator('.post')).toHaveCount(0);
    await writesSettled(page);
    await page.reload();
    await openStep(page, 'PD-14', 2);
    await expect(rail(page).locator('.post')).toHaveCount(0);
  });

  test('a risk raised here outlives its step, and closes when somebody says how', async ({
    page,
  }) => {
    await openStep(page, 'PD-08', 5);
    await rail(page).getByLabel('What happened on step 5…').fill('Blocked on the DRC deck.');
    await rail(page).getByRole('checkbox', { name: 'risk' }).check();
    await rail(page).getByRole('button', { name: 'Post' }).click();
    await writesSettled(page);
    const risks = page.getByRole('navigation', { name: 'Program' }).getByRole('link', { name: /^Risks/ });
    await expect(risks).toContainText('7');

    /* handing the step over does not answer it */
    await page.locator('[data-step="PD-08:5"]').getByRole('checkbox').check();
    await writesSettled(page);
    await expect(risks).toContainText('7');

    /* closing it does, and it wants to be told how */
    const post = rail(page).locator('.thread > .post').first();
    await post.getByRole('button', { name: 'Close risk' }).click();
    await expect(post.locator('[data-close-risk]')).toBeDisabled();
    await post.getByLabel('How the risk was answered').fill('Deck updated by the foundry; DRC clean on the next run.');
    await post.locator('[data-close-risk]').click();
    await writesSettled(page);
    await expect(risks).toContainText('6');

    /* the flag is kept and marked closed, not deleted, and the answer is under it */
    await expect(post.locator('.pill').first()).toContainText('RISK · CLOSED');
    await expect(post.locator('.replies .txt')).toContainText('Deck updated by the foundry');

    /* and it survives a reload, then reopens if it was closed too early */
    await page.reload();
    await openStep(page, 'PD-08', 5);
    const again = rail(page).locator('.thread > .post').first();
    await expect(again.locator('.pill').first()).toContainText('RISK · CLOSED');
    await again.getByRole('button', { name: 'Reopen' }).click();
    await writesSettled(page);
    await expect(risks).toContainText('7');
  });
});
