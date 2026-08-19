import { expect, test, type Page, SEED_PROJECT_PATH } from './fixtures';

/**
 * The envelope buttons are real mailto links, so the assertions read the href
 * rather than trying to observe a mail client the test machine does not have.
 */
const draft = async (page: Page, selector: string) => {
  const href = (await page.locator(selector).first().getAttribute('href'))!;
  const [head, query] = href.replace(/^mailto:/, '').split('?');
  const q = new URLSearchParams(query);
  return {
    href,
    to: decodeURIComponent(head),
    subject: q.get('subject') ?? '',
    body: q.get('body') ?? '',
  };
};

const hoverStation = (page: Page, num: string) =>
  page.locator('.rm-station', { hasText: new RegExp(`^${num} `) }).hover();

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await expect(page.locator('.stage-panel.selected')).toBeVisible();
});

test.describe('dashboard summary export', () => {
  test('the envelope composes a summary of the program', async ({ page }) => {
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    const link = page.locator('.dash-title-row [data-mail]');
    await expect(link).toBeVisible();

    const m = await draft(page, '.dash-title-row [data-mail]');
    expect(m.href.startsWith('mailto:?')).toBe(true); // recipients are the TPM's to fill in
    expect(m.subject).toMatch(/^AtlasAX1 — program summary \d{2}\/\d{2}\/\d{4}$/);

    // the numbers the dashboard shows are the numbers in the mail
    expect(m.body).toContain('51%  (23 of 45 deliverables)');
    expect(m.body).toMatch(/Open risks {5}7 {2}\(Physical Design, Signoff, Tapeout, Advanced Packaging\)/);
    expect(m.body).toMatch(/Overdue {8}1/);
    expect(m.body).toContain('PD · Physical Design');
    expect(m.body).toMatch(/Tapeout {8}\d{2}\/\d{2}\/\d{4} {2}D−\d+/);
    expect(m.body).toContain('UPCOMING MILESTONES');
    expect(m.body).toContain('Multi-corner timing closure');
    expect(m.body).toContain('Review before sending.');
  });

  test('it stays inside the mail client URL limit', async ({ page }) => {
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    const link = page.locator('.dash-title-row [data-mail]');
    expect((await link.getAttribute('href'))!.length).toBeLessThanOrEqual(1900);
    await expect(link).not.toHaveAttribute('data-truncated', 'true');
  });

  test('it tracks the data — checking a deliverable moves the summary', async ({ page }) => {
    await hoverStation(page, '06');
    await page
      .locator('.stage-panel.selected .dlv-list li')
      .nth(2)
      .locator('input[type="checkbox"]')
      .check();
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    const m = await draft(page, '.dash-title-row [data-mail]');
    expect(m.body).toContain('53%  (24 of 45 deliverables)');
  });
});

test.describe('activity export', () => {
  test('a row addresses its own owner and carries the activity', async ({ page }) => {
    await hoverStation(page, '06');
    const row = page
      .locator('.stage-panel.selected .board[data-kind="activities"] .b-row')
      .filter({ hasText: 'Top-level detailed routing' });
    await expect(row.locator('[data-mail]')).toHaveCount(1);

    const m = await draft(
      page,
      '.stage-panel.selected .board[data-kind="activities"] .b-row:has-text("Top-level detailed routing") [data-mail]',
    );
    expect(m.to).toBe('nate.coleman@example.com');
    expect(m.subject).toBe('[AtlasAX1 · PD] Top-level detailed routing');
    expect(m.body).toContain('ACTIVITY — Top-level detailed routing');
    expect(m.body).toContain('AtlasAX1 · Physical Design');
    expect(m.body).toContain('Owner          N. Coleman');
    expect(m.body).toContain('Status         Open');
    expect(m.body).toContain('Full-chip detail route to DRC-clean');
    // the status thread comes along
    expect(m.body).toContain('STATUS UPDATES');
    expect(m.body).toContain('82% routed');
  });

  test('an overdue activity says so in the draft', async ({ page }) => {
    await hoverStation(page, '06');
    const m = await draft(
      page,
      '.b-row:has-text("PDN IR-drop analysis rev 2") [data-mail]',
    );
    expect(m.to).toBe('ingrid.berg@example.com');
    expect(m.body).toMatch(/Target due {5}\d{2}\/\d{2}\/\d{4} {3}OVERDUE/);
  });

  test('the board header emails the whole list to everyone on it', async ({ page }) => {
    await hoverStation(page, '06');
    const m = await draft(
      page,
      '.stage-panel.selected .board[data-kind="activities"] .board-head [data-mail]',
    );
    expect(m.subject).toMatch(/^\[AtlasAX1 · PD\] Activity list — \d{2}\/\d{2}\/\d{4}$/);
    // every distinct owner on the list is a recipient
    for (const email of [
      'marco.bianchi@example.com',
      'jiwoo.park@example.com',
      'nate.coleman@example.com',
      'ingrid.berg@example.com',
    ]) {
      expect(m.to).toContain(email);
    }
    // two of the six PD activities are already closed
    expect(m.body).toContain('4 open of 6');
    expect(m.body).toContain('[ ] Top-level detailed routing');
    expect(m.body).toContain('[x] Floorplan rev C & macro placement');
    expect(m.body).toContain('OVERDUE');
    // a roll-up must fit the mail client without being trimmed
    expect(m.href.length).toBeLessThanOrEqual(1900);
  });

  test('the item view offers the same draft', async ({ page }) => {
    await hoverStation(page, '06');
    await page
      .locator('.stage-panel.selected .board[data-kind="activities"] .b-row')
      .filter({ hasText: 'Top-level detailed routing' })
      .click();
    await expect(page.locator('.iv-actions [data-mail]')).toBeVisible();
    const m = await draft(page, '.iv-actions [data-mail]');
    expect(m.to).toBe('nate.coleman@example.com');
    expect(m.subject).toBe('[AtlasAX1 · PD] Top-level detailed routing');
  });

  test('risks and key info get an envelope too', async ({ page }) => {
    await hoverStation(page, '06');
    const risk = await draft(
      page,
      '.stage-panel.selected .board[data-kind="risks"] .b-row [data-mail]',
    );
    expect(risk.subject).toContain('[AtlasAX1 · PD]');
    expect(risk.body.startsWith('RISK — ')).toBe(true);
    // key info has no whole-list envelope, only per-row ones
    await expect(
      page.locator('.stage-panel.selected .board[data-kind="keyinfo"] .board-head [data-mail]'),
    ).toHaveCount(0);
    await expect(
      page.locator('.stage-panel.selected .board[data-kind="keyinfo"] .b-row [data-mail]').first(),
    ).toHaveCount(1);
  });

  test('an unknown owner leaves the recipient blank rather than guessing', async ({ page }) => {
    const panel = page.locator('.stage-panel.selected');
    await panel.locator('.board[data-kind="activities"] [data-add]').click();
    await page.locator('.ie-title').fill('Owned by nobody on file');
    await page.locator('.ie-owner').fill('Someone Unlisted');
    await page.locator('[data-save]').click();

    const row = panel
      .locator('.board[data-kind="activities"] .b-row')
      .filter({ hasText: 'Owned by nobody on file' });
    await expect(row.locator('[data-mail]')).toHaveAttribute('data-no-recipient', 'true');
    const m = await draft(
      page,
      '.b-row:has-text("Owned by nobody on file") [data-mail]',
    );
    expect(m.to).toBe('');
    expect(m.body).toContain('Owner          Someone Unlisted');
  });

  test('clicking an envelope does not open the row behind it', async ({ page }) => {
    await hoverStation(page, '06');
    const row = page
      .locator('.stage-panel.selected .board[data-kind="activities"] .b-row')
      .first();
    // a mailto navigation is a no-op in the test browser; the pop-up must stay shut
    await row.locator('[data-mail]').click();
    await expect(page.locator('#modal .modal-win')).toBeHidden();
  });
});
