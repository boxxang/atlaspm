import { expect, test, SHELL_PATH, writesSettled, type Page } from './fixtures';

/**
 * Meetings: series and sittings, agenda and minutes, decisions and action
 * items, and how they reach the work they are about.
 *
 * The seed gives the programme ten series, their recent sittings and a few
 * one-off meetings, placed
 * relative to today, so some of these read what the seed wrote and the rest
 * build what they test through the screens.
 */

const MEETINGS = `${SHELL_PATH}/meetings`;

const rail = (page: Page) => page.getByRole('complementary', { name: 'Details' });

/** A day key a few days from today, in the browser's own zone. */
const dayFromToday = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

async function openSeededSitting(page: Page, series: string, status: 'Completed' | 'Scheduled') {
  await page.goto(`${MEETINGS}?tab=all`);
  await page.getByLabel('Meeting series').selectOption({ label: series });
  await page.getByLabel('Status').selectOption({ label: status });
  const row = page.locator('[data-meeting]').first();
  await expect(row).toBeVisible();
  await row.getByRole('link', { name: series }).click();
  await expect(page.getByRole('heading', { level: 1, name: series })).toBeVisible();
  return page.url().split('/meetings/')[1].split('?')[0];
}

async function createMeeting(page: Page, title: string) {
  await page.goto(MEETINGS);
  await page.locator('[data-new-meeting]').click();
  const dlg = page.locator('[data-meeting-dialog]');
  await dlg.getByLabel('Title', { exact: true }).fill(title);
  await dlg.getByLabel('Date').fill(dayFromToday(2));
  await dlg.getByLabel('Agenda item').fill('Review the routing convergence plan');
  await dlg.getByLabel('Agenda item').press('Enter');
  await dlg.getByLabel('Agenda item').fill('Agree the next turn');
  await dlg.getByLabel('Agenda item').press('Enter');
  await dlg.locator('[data-save-meeting]').click();
  await expect(page).toHaveURL(/\/meetings\/[^/?]+$/);
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
  return page.url().split('/meetings/')[1];
}

test.describe('getting there', () => {
  test('the Work menu opens Meetings, right after Activities, and keeps it lit inside a meeting', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/overview`);
    const nav = page.getByRole('navigation', { name: 'Program' });
    const link = nav.getByRole('link', { name: /^Meetings/ });
    await expect(link).toBeVisible();
    const labels = await nav.locator('a.nav').allInnerTexts();
    const at = labels.findIndex((l) => l.startsWith('Activities'));
    expect(at).toBeGreaterThan(-1);
    expect(labels[at + 1]).toMatch(/^Meetings/);

    await link.click();
    await expect(page).toHaveURL(/\/p\/atlasax1\/meetings$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Meetings' })).toBeVisible();
    await expect(link).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('[data-meetings-tab="calendar"]')).toHaveAttribute('aria-current', 'page');

    await page.locator('[data-meetings-tab="upcoming"]').click();
    await page.locator('[data-meeting-row]').first().getByRole('link').first().click();
    await expect(page).toHaveURL(/\/meetings\/[^/?]+/);
    await expect(nav.getByRole('link', { name: /^Meetings/ })).toHaveAttribute('aria-current', 'page');
  });

  test('the five tabs are Calendar, Upcoming, Action Items, All Meetings and Series — nothing else', async ({ page }) => {
    await page.goto(MEETINGS);
    const tabs = page.getByRole('navigation', { name: 'Meetings' }).getByRole('link');
    await expect(tabs).toHaveCount(5);
    expect((await tabs.allInnerTexts()).map((t) => t.replace(/\s*\d+$/, ''))).toEqual([
      'Calendar',
      'Upcoming',
      'Action Items',
      'All Meetings',
      'Series',
    ]);
  });

  test('the Action Items tab opens my open actions, and stays lit there', async ({ page }) => {
    await page.goto(MEETINGS);
    await page.locator('[data-meetings-tab="actions"]').click();
    await expect(page).toHaveURL(/\/meetings\/actions\?view=mine$/);
    await expect(page.getByRole('heading', { level: 1, name: 'My open actions' })).toBeVisible();
    await expect(page.locator('[data-meetings-tab="actions"]')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('[data-action-view="mine"]')).toHaveAttribute('aria-current', 'page');

    /* the other tabs still go where they went */
    await page.locator('[data-meetings-tab="series"]').click();
    await expect(page).toHaveURL(/\/meetings\?tab=series$/);
  });
});

test.describe('Upcoming', () => {
  test('sums up the follow-up, and each summary opens its list', async ({ page }) => {
    await page.goto(`${MEETINGS}?tab=upcoming`);
    for (const hook of ['mine', 'overdue', 'blocked', 'awaiting']) {
      await expect(page.locator(`[data-summary="${hook}"]`)).toBeVisible();
    }
    /* the seed leaves two actions blocked: one on the foundry, one on the emulator */
    await expect(page.locator('[data-summary="blocked"]')).toContainText('2');
    await page.locator('[data-summary="blocked"]').click();
    await expect(page).toHaveURL(/\/meetings\/actions\?view=blocked$/);
    await expect(page.locator('[data-action]')).toHaveCount(2);
    const foundry = page.locator('[data-action]').filter({ hasText: 'non-default routing rule' });
    await expect(foundry).toContainText('Blocked');
  });

  test('lists the overdue actions between the summaries and today’s meetings', async ({ page }) => {
    await page.goto(`${MEETINGS}?tab=upcoming`);
    const card = page.locator('[data-card="overdue-actions"]');
    const rows = card.locator('[data-action]');
    await expect(rows.first()).toBeVisible();
    const summary = (await page.locator('[data-summary="overdue"] .num').innerText()).trim();
    await expect(rows).toHaveCount(Number(summary));
    await expect(rows.first()).toContainText('Overdue');

    const order = await page.evaluate(() => {
      const after = (a: Element, b: Element) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
      const q = (s: string) => document.querySelector(s)!;
      return [after(q('[data-summary="overdue"]'), q('[data-card="overdue-actions"]')), after(q('[data-card="overdue-actions"]'), q('[data-card="today"]'))];
    });
    expect(order).toEqual([true, true]);

    await card.getByRole('link', { name: 'All overdue actions' }).click();
    await expect(page).toHaveURL(/\/meetings\/actions\?view=overdue$/);
  });

  test('lists coming meetings, what to prepare, what was carried over, and what is waiting for a decision', async ({ page }) => {
    await page.goto(`${MEETINGS}?tab=upcoming`);
    await expect(page.locator('[data-card="coming"] [data-meeting-row]').first()).toBeVisible();
    await expect(page.locator('[data-card="mine"]')).toContainText('Tapeout Readiness Review');
    await expect(page.locator('[data-prep]').first()).toBeVisible();
    await expect(page.locator('[data-carried]').filter({ hasText: 'tester-time budget' })).toHaveCount(1);
    await expect(page.locator('[data-awaiting]').filter({ hasText: 'Move macro M3' })).toHaveCount(1);
  });
});

test.describe('series and sittings', () => {
  test('a series is created, and its next sittings are scheduled from it', async ({ page }) => {
    await page.goto(`${MEETINGS}?tab=series`);
    await page.locator('[data-new-series]').click();
    const dlg = page.locator('[data-series-dialog]');
    await dlg.getByLabel('Series title').fill('Pattern Budget Sync');
    await dlg.getByLabel('Default agenda').fill('Pattern count\nTester time');
    await expect(dlg.locator('[data-series-preview]')).toContainText('Next sittings');
    await dlg.locator('[data-save-series]').click();

    const row = page.locator('[data-series]').filter({ hasText: 'Pattern Budget Sync' });
    await expect(row).toContainText('Weekly on');
    await expect(row).toContainText('No sitting scheduled');
    await row.locator('[data-menu^="schedule-"]').click();
    await row.locator('[data-opt="4"]').click();
    await expect(row.locator('[data-scheduled-note]')).toContainText('Scheduled 4 sittings');
    await expect(row.locator('[data-next-sitting]')).toBeVisible();
    await writesSettled(page);

    await page.goto(`${MEETINGS}?tab=all`);
    await page.getByLabel('Meeting series').selectOption({ label: 'Pattern Budget Sync' });
    await expect(page.locator('[data-meeting]')).toHaveCount(4);

    /* each sitting starts with the series' agenda, and belongs to the sitting */
    await page.locator('[data-meeting]').first().getByRole('link', { name: 'Pattern Budget Sync' }).click();
    await page.locator('[data-meeting-tab="agenda"]').click();
    await expect(page.locator('[data-agenda-item]')).toHaveCount(2);
  });

  test('a single meeting is created, linked to activities, steps, risks and deliverables', async ({ page }) => {
    await page.goto(MEETINGS);
    await page.locator('[data-new-meeting]').click();
    const dlg = page.locator('[data-meeting-dialog]');
    await dlg.getByLabel('Title', { exact: true }).fill('PD crosstalk deep dive');
    await dlg.getByLabel('Date').fill(dayFromToday(3));

    const picker = dlg.locator('[data-link-picker="Related items"]');
    for (const [group, query] of [
      ['activity', 'PD-'],
      ['step', 'PD-'],
      ['risk', 'Crosstalk'],
      ['deliverable', 'Floorplan'],
    ] as const) {
      await picker.locator(`[data-link-group="${group}"]`).click();
      await picker.getByLabel('Search related items').fill(query);
      await picker.locator(`[data-pick-link^="${group}:"]`).first().click();
    }
    await expect(picker.locator('[data-picked] .mt-link')).toHaveCount(4);
    await dlg.locator('[data-save-meeting]').click();

    await expect(page.getByRole('heading', { level: 1, name: 'PD crosstalk deep dive' })).toBeVisible();
    const chips = page.locator('[data-overview-tab] [data-card="facts"] [data-link]');
    await expect(chips).toHaveCount(4);
    for (const kind of ['activity', 'step', 'risk', 'deliverable']) {
      await expect(page.locator(`[data-card="facts"] [data-link^="${kind}:"]`)).toHaveCount(1);
    }
    await writesSettled(page);
    await page.reload();
    await expect(page.locator('[data-card="facts"] [data-link]')).toHaveCount(4);
  });
});

test.describe('inside a meeting', () => {
  test('agenda and minutes are written, and a decision and an action come out of an agenda item', async ({ page }) => {
    await createMeeting(page, 'Routing convergence review');
    await page.locator('[data-meeting-tab="agenda"]').click();

    await page.getByLabel('Meeting minutes').fill('Marco and Nate walked the congestion map.');
    await page.locator('[data-save-minutes]').click();

    const item = page.locator('[data-agenda-item]').first();
    const open = () => item.getByRole('button', { name: 'Review the routing convergence plan', exact: true }).click();
    await open();
    await item.getByLabel('Discussion notes').fill('Overflow down to 1.1% after re-bundling.');
    await item.getByLabel('Outcome').selectOption({ label: 'Decision made' });
    await item.locator('[data-save-agenda]').click();
    await expect(item).toContainText('Overflow down to 1.1%');
    await expect(item.locator('[data-outcome="decision"]')).toBeVisible();

    await open();
    await item.locator('[data-decision-from-agenda]').click();
    const decisionDlg = page.getByRole('dialog', { name: 'Decision from this agenda item' });
    await decisionDlg.getByLabel('Decision title').fill('Keep the re-bundled NoC links for Turn 3');
    await decisionDlg.getByLabel('Decision status').selectOption({ label: 'Approved' });
    await decisionDlg.locator('[data-save-decision]').click();
    await expect(decisionDlg).toHaveCount(0);

    await item.locator('[data-action-from-agenda]').click();
    const actionDlg = page.getByRole('dialog', { name: 'Action item from this agenda item' });
    await actionDlg.getByLabel('Action description').fill('Rerun DRC on the re-bundled region');
    /* asked for, and said so, before it is saved */
    await expect(actionDlg.locator('[data-action-warnings]')).toContainText('No accountable owner');
    await expect(actionDlg.locator('[data-action-warnings]')).toContainText('No due date');
    await actionDlg.getByLabel('Accountable owner').fill('Nate Coleman');
    await actionDlg.getByLabel('Due date').fill(dayFromToday(5));
    await expect(actionDlg.locator('[data-action-warnings]')).toHaveCount(0);
    await actionDlg.locator('[data-save-action]').click();

    await page.locator('[data-meeting-tab="decisions"]').click();
    await expect(page.locator('[data-decision]')).toContainText('Keep the re-bundled NoC links');
    await expect(page.locator('[data-decision]')).toContainText('From agenda item 1');

    await page.locator('[data-meeting-tab="actions"]').click();
    const action = page.locator('[data-action]').filter({ hasText: 'Rerun DRC' });
    await expect(action).toContainText('Nate Coleman');
    await expect(action).toContainText('Open');

    await writesSettled(page);
    await page.reload();
    await expect(page.locator('[data-action]').filter({ hasText: 'Rerun DRC' })).toContainText('Nate Coleman');
    await page.locator('[data-meeting-tab="agenda"]').click();
    await page.locator('[data-read-minutes]').click();
    await expect(page.locator('[data-minutes-document]')).toContainText('Marco and Nate walked the congestion map.');
    await expect(page.locator('[data-minutes-document]')).toContainText('Rerun DRC on the re-bundled region');
  });

  test('completing a meeting checks its actions, blocks when the program requires it, and keeps tracking them', async ({ page }) => {
    const id = await createMeeting(page, 'Signoff exceptions review');
    const meetingUrl = page.url();
    await page.locator('[data-meeting-tab="actions"]').click();
    await page.locator('[data-new-action]').click();
    await page.getByLabel('Action description').fill('Collect the waiver list from STA');
    await page.locator('[data-save-action]').click();
    await expect(page.locator('[data-action]').filter({ hasText: 'Collect the waiver list' })).toContainText('No accountable owner');

    await page.locator('[data-complete]').click();
    const dlg = page.getByRole('dialog', { name: 'Complete meeting' });
    await expect(dlg.locator('[data-check="owners"]')).toContainText('1 open action item has no owner.');
    await expect(dlg.locator('[data-check="dueDates"]')).toContainText('1 open action item has no due date.');
    await dlg.getByRole('button', { name: 'Cancel' }).click();

    /* the program decides whether the checks are enforced — a program setting,
       so it lives on the Meetings page rather than on one meeting */
    const setMode = async (mode: 'block' | 'warn') => {
      await page.goto(MEETINGS);
      await page.locator('[data-menu="completion-mode"]').click();
      await page.locator(`[data-opt="${mode}"]`).click();
      await writesSettled(page);
      await page.goto(meetingUrl);
    };
    await setMode('block');
    await page.locator('[data-complete]').click();
    await expect(dlg.locator('[data-completion-mode="block"]')).toBeVisible();
    await expect(dlg.locator('[data-confirm-complete]')).toBeDisabled();
    await dlg.getByRole('button', { name: 'Cancel' }).click();

    await setMode('warn');
    await page.locator('[data-complete]').click();
    await dlg.locator('[data-confirm-complete]').click();
    await expect(page.locator('.hd [data-meeting-status]')).toHaveText('Completed');

    /* the action is still there, still open, still owed */
    await page.locator('[data-meeting-tab="actions"]').click();
    await expect(page.locator('[data-action]').filter({ hasText: 'Collect the waiver list' })).toContainText('Open');
    await writesSettled(page);

    await page.goto(`${MEETINGS}?tab=all`);
    await page.getByLabel('Status').selectOption({ label: 'Completed' });
    await expect(page.locator(`[data-meeting="${id}"]`)).toBeVisible();
    await page.getByLabel('When').selectOption({ label: 'Still to happen' });
    await expect(page.locator(`[data-meeting="${id}"]`)).toHaveCount(0);
  });

  test('unfinished actions carry into the next sitting of the series', async ({ page }) => {
    await openSeededSitting(page, 'DFT Weekly Review', 'Completed');
    await page.locator('[data-meeting-tab="actions"]').click();
    const bar = page.locator('[data-carry-bar]');
    await expect(bar).toContainText('can be carried');
    await expect(bar.getByLabel('Carry into')).toContainText('(next in series)');
    await bar.locator('[data-carry]').click();
    await expect(page.locator('[data-carried-note]')).toContainText('They still belong to this meeting.');
    await writesSettled(page);

    await page.locator('[data-meeting-tab="overview"]').click();
    const next = page.locator('[data-card="facts"] [data-sitting-link]').last();
    await next.click();
    await page.locator('[data-meeting-tab="actions"]').click();
    const carried = page.locator('[data-action]').filter({ hasText: 'Analyse untestable faults' });
    await expect(carried).toBeVisible();
    await expect(carried).toContainText('from DFT Weekly Review');
  });

  test('a risk raised in a meeting goes through the risk flow and names the meeting', async ({ page }) => {
    await page.goto(`${SHELL_PATH}/overview`);
    const nav = page.getByRole('navigation', { name: 'Program' });
    const count = nav.getByRole('link', { name: /^Risks/ }).locator('.cr');
    await expect(count).toBeVisible();
    const before = Number(await count.innerText());

    await openSeededSitting(page, 'Physical Design Closure Review', 'Scheduled');
    await page.locator('[data-raise-risk]').click();
    /* the meeting's own activity and its first open step are offered first */
    await expect(page.getByLabel('Risk activity')).not.toHaveValue('');
    await expect(page.getByLabel('Risk step')).not.toHaveValue('');
    await expect(page.getByLabel('Risk step').locator('option:checked')).not.toContainText('handed over');
    await page.getByLabel('Risk text').fill('Congestion near M3 may need a second macro move.');
    await page.locator('[data-confirm-risk]').click();
    await expect(page.locator('[data-risk-raised]')).toBeVisible();
    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.locator('[data-meeting-risk]')).toContainText('second macro move');
    await expect(count).toHaveText(String(before + 1));
    await writesSettled(page);

    await page.goto(`${SHELL_PATH}/risks`);
    await page.locator('[data-row]').filter({ hasText: 'second macro move' }).click();
    await expect(rail(page).locator('[data-meeting-source]')).toContainText('Physical Design Closure Review');
  });

  test('turning an action into a step asks first, then adds the step to this program', async ({ page }) => {
    await createMeeting(page, 'DFT scope review');
    await page.locator('[data-meeting-tab="actions"]').click();
    await page.locator('[data-new-action]').click();
    const editor = page.locator('[data-action-editor]');
    await editor.getByLabel('Action description').fill('Add a compression sweep across three ratios');
    await editor.getByLabel('Accountable owner').fill('Yusuf Demir');
    await editor.getByLabel('Due date').fill(dayFromToday(9));
    await editor.getByLabel('Action type').selectOption({ label: 'Convert to New Step' });
    const picker = editor.locator('[data-link-picker]');
    await picker.locator('[data-link-group="activity"]').click();
    await picker.getByLabel('Search action related items').fill('DFT-0');
    await picker.locator('[data-pick-link^="activity:"]').first().click();
    const act = (await picker.locator('[data-picked] .mt-link b').first().innerText()).trim();
    await editor.locator('[data-save-action]').click();

    await page.locator('[data-action]').filter({ hasText: 'compression sweep' }).click();
    await page.locator('[data-convert]').click();
    const dlg = page.locator('[data-convert-dialog]');
    await expect(dlg.locator('[data-convert-preview]')).toContainText(`to ${act}`);
    await expect(dlg.locator('[data-convert-preview]')).toContainText('the template is not changed');
    const confirm = page.locator('[data-confirm-convert]');
    await expect(confirm).toBeDisabled();
    await page.getByLabel('Confirm the change to the plan').check();
    await confirm.click();

    const converted = page.locator('[data-action]').filter({ hasText: 'compression sweep' }).locator('[data-converted]');
    await expect(converted).toBeVisible();
    const n = (await converted.innerText()).match(/step (\d+)/)![1];
    await writesSettled(page);

    await page.goto(`${SHELL_PATH}/stage/dft/activity?step=${act}:${n}`);
    await expect(rail(page)).toContainText(`Step ${n} of ${n}`);
    await expect(rail(page)).toContainText('Add a compression sweep across three ratios');
  });
});

test.describe('on the work itself', () => {
  test('the overview lists today’s meetings between Needs you today and the schedule', async ({ page }) => {
    await page.goto(MEETINGS);
    await page.locator('[data-new-meeting]').click();
    const dlg = page.locator('[data-meeting-dialog]');
    await dlg.getByLabel('Title', { exact: true }).fill('Same-day ECO sync');
    await dlg.getByLabel('Date').fill(dayFromToday(0));
    await dlg.locator('[data-save-meeting]').click();
    await expect(page.getByRole('heading', { level: 1, name: 'Same-day ECO sync' })).toBeVisible();
    await writesSettled(page);

    await page.goto(`${SHELL_PATH}/overview`);
    const card = page.locator('[data-today-meetings]');
    await expect(card).toContainText('Today’s meetings');
    const row = card.locator('[data-meeting-row]').filter({ hasText: 'Same-day ECO sync' });
    await expect(row).toBeVisible();

    const order = await page.evaluate(() => {
      const needs = document.querySelector('[data-attn-count]')!;
      const today = document.querySelector('[data-today-meetings]')!;
      const schedule = document.querySelector('[data-schedule-card]')!;
      const after = (a: Element, b: Element) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
      return [after(needs, today), after(today, schedule)];
    });
    expect(order).toEqual([true, true]);

    await row.getByRole('link', { name: 'Same-day ECO sync' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Same-day ECO sync' })).toBeVisible();
  });

  test('an activity panel lists the meetings, decisions and action items about it', async ({ page }) => {
    await openSeededSitting(page, 'DFT Weekly Review', 'Completed');
    const act = (await page.locator('[data-card="facts"] [data-link^="activity:"]').first().getAttribute('data-link'))!.split(':')[1];

    await page.goto(`${SHELL_PATH}/stage/dft/activity?act=${act}`);
    const related = rail(page).locator(`[data-related-meetings="${act}"]`);
    await expect(related).toContainText('DFT Weekly Review');
    await expect(related.locator('[data-related-decision]').first()).toBeVisible();
    await expect(related).toContainText('Keep 60x compression');
    await expect(related.locator('[data-last-reviewed]')).not.toHaveText('Not yet');
    await expect(related.locator('[data-related-action]').first()).toBeVisible();
  });

  test('finishing an action completes no step and moves no date', async ({ page }) => {
    await openSeededSitting(page, 'Physical Design Closure Review', 'Completed');
    await page.locator('[data-meeting-tab="actions"]').click();
    const row = page.locator('[data-action]').filter({ hasText: 'Rerun SI analysis' });
    const stepRef = (await row.locator('[data-link^="step:"]').first().getAttribute('data-link'))!.slice('step:'.length);

    const stepUrl = `${SHELL_PATH}/stage/physicalDesign/activity?step=${stepRef}`;
    const status = () => rail(page).locator('.peek-body > div').nth(0);
    const due = () => rail(page).locator('.prop').filter({ hasText: /^Due/ });
    await page.goto(stepUrl);
    await expect(due()).toBeVisible();
    const statusBefore = await status().innerText();
    const dueBefore = await due().innerText();

    await openSeededSitting(page, 'Physical Design Closure Review', 'Completed');
    await page.locator('[data-meeting-tab="actions"]').click();
    await page.locator('[data-action]').filter({ hasText: 'Rerun SI analysis' }).click();
    const editor = page.locator('[data-action-editor]');
    await editor.getByLabel('Action status value').selectOption({ label: 'Done' });
    await expect(editor.locator('[data-done-note]')).toContainText('does not complete');
    await editor.locator('[data-save-action]').click();
    await expect(page.locator('[data-action]').filter({ hasText: 'Rerun SI analysis' })).toContainText('Done');
    await writesSettled(page);

    await page.goto(stepUrl);
    await expect(due()).toBeVisible();
    expect(await status().innerText()).toBe(statusBefore);
    expect(await due().innerText()).toBe(dueBefore);
  });
});

test.describe('the calendar', () => {
  test('shows each meeting with its time, type, status and whether it recurs, in words', async ({ page }) => {
    await page.goto(`${MEETINGS}?tab=calendar`);
    const ev = page.locator('[data-calendar-meeting]').first();
    await expect(ev).toBeVisible();
    await expect(ev).toContainText(/\d\d:\d\d/);
    await expect(ev).toContainText(/Scheduled|Completed|Cancelled|Draft|In Progress/);
    await expect(page.locator('[data-calendar-meeting]').filter({ hasText: 'Recurring' }).first()).toBeVisible();

    await page.getByRole('button', { name: 'Week', exact: true }).click();
    await expect(page.locator('[data-calendar="week"] [data-day]')).toHaveCount(7);
  });
});

test('another program sees none of these meetings', async ({ page }) => {
  await page.goto(`${MEETINGS}?tab=all`);
  const theirs = await page.locator('[data-meeting]').first().getAttribute('data-meeting');
  expect(theirs).toBeTruthy();

  await page.goto('/');
  await page.locator('[data-new-project]').click();
  await page.getByLabel('Program name').fill('Isolation Check');
  await page.locator('[data-create]').click();
  await expect(page).toHaveURL(/\/p\/[^/]+\/overview$/);
  const other = page.url().split('/p/')[1].split('/')[0];

  await page.goto(`/p/${other}/meetings?tab=all`);
  await expect(page.locator('[data-meeting]')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Program' }).locator('[data-meetings-count]')).toHaveText('0');

  await page.goto(`/p/${other}/meetings/${theirs}`);
  await expect(page.locator('[data-meeting-missing]')).toBeVisible();
});
