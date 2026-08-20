import { expect, test, type Page, SEED_PROJECT_PATH } from './fixtures';

/**
 * Owners come from the people recorded on the stage — its leader and its
 * engineering contacts — rather than from free text.
 */
const panel = (page: Page) => page.locator('.stage-panel.selected');
const hoverStation = (page: Page, num: string) =>
  page.locator('.rm-station', { hasText: new RegExp(`^${num} `) }).hover();

const openEditor = async (page: Page, kind: string) => {
  await panel(page).locator(`.board[data-kind="${kind}"] [data-add]`).click();
  await expect(page.locator('.ie-owner')).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await expect(page.locator('.stage-panel.selected')).toBeVisible();
});

test.describe('picking an owner', () => {
  test('the field is a dropdown of the stage leader and its contacts', async ({ page }) => {
    await openEditor(page, 'activities');
    const select = page.locator('.ie-owner');
    await expect(select).toHaveJSProperty('tagName', 'SELECT');

    // Product Definition: leader Daniel Kim plus three contacts
    await expect(select.locator('optgroup[label="Stage leader"] option')).toHaveText([
      'Daniel Kim (D. Kim)',
    ]);
    await expect(select.locator('optgroup[label="Engineering contacts"] option')).toHaveText([
      'Nora Feld (N. Feld)',
      'Ian Brooks (I. Brooks)',
      'Seojin Ha (S. Ha)',
    ]);
    await expect(select.locator('option').first()).toHaveText('— Unassigned');
  });

  test('it stores the short form the boards already use', async ({ page }) => {
    await openEditor(page, 'activities');
    await page.locator('.ie-title').fill('Die size sensitivity study');
    await page.locator('.ie-owner').selectOption('I. Brooks');
    await page.locator('[data-save]').click();

    const row = panel(page)
      .locator('.board[data-kind="activities"] .b-row')
      .filter({ hasText: 'Die size sensitivity study' });
    await expect(row.locator('.b-owner')).toHaveText('I. Brooks');

    // and that is enough for the envelope to address them
    const href = (await row.locator('[data-mail]').getAttribute('href'))!;
    expect(href.startsWith('mailto:ian.brooks@example.com?')).toBe(true);
  });

  test('every board uses it — risks and key information too', async ({ page }) => {
    for (const kind of ['keyinfo', 'activities', 'risks'] as const) {
      await openEditor(page, kind);
      await expect(page.locator('select.ie-owner')).toBeVisible();
      await expect(
        page.locator('.ie-owner optgroup[label="Engineering contacts"] option'),
      ).toHaveCount(3);
      await page.locator('#modal-close').click();
    }
  });

  test('the list follows the stage you are on', async ({ page }) => {
    await hoverStation(page, '06');
    await openEditor(page, 'risks');
    await expect(page.locator('.ie-owner optgroup[label="Stage leader"] option')).toHaveText([
      'Grace Park (G. Park)',
    ]);
    await expect(
      page.locator('.ie-owner optgroup[label="Engineering contacts"] option'),
    ).toHaveText([
      'Marco Bianchi (M. Bianchi)',
      'Jiwoo Park (J. Park)',
      'Nate Coleman (N. Coleman)',
      'Ingrid Berg (I. Berg)',
    ]);
  });

  test('a contact added now is selectable now', async ({ page }) => {
    await panel(page).locator('[data-c-add]').click();
    await page.locator('.c-row.editing .cf-name').fill('Rae Lindqvist');
    await page.locator('.c-row.editing .cf-role').fill('Program analytics');
    await page.locator('.c-row.editing [data-c-save]').click();

    await openEditor(page, 'activities');
    await expect(
      page.locator('.ie-owner optgroup[label="Engineering contacts"] option'),
    ).toContainText(['Rae Lindqvist (R. Lindqvist)']);
  });

  test('an existing owner stays selected even when they left the contact list', async ({
    page,
  }) => {
    await hoverStation(page, '06');
    // "M. Bianchi" owns a seeded activity; remove the contact behind them
    const rows = panel(page).locator('.contacts-sec .c-row:not(.editing)');
    await rows.filter({ hasText: 'Marco Bianchi' }).locator('[data-c-del]').click();
    await expect(rows).toHaveCount(3);

    await panel(page).locator('.board[data-kind="activities"] [data-more]').click();
    await page.locator('#modal-body .b-row').filter({ hasText: 'Multi-corner timing closure' }).click();
    await page.locator('[data-edit]').click();
    // the value is preserved and flagged rather than silently reassigned
    await expect(page.locator('.ie-owner')).toHaveValue('M. Bianchi');
    await expect(page.locator('.ie-owner option[value="M. Bianchi"]')).toContainText(
      'not in this stage',
    );
  });

  test('an owner can be cleared', async ({ page }) => {
    await openEditor(page, 'activities');
    await page.locator('.ie-title').fill('Nobody owns this yet');
    await page.locator('.ie-owner').selectOption('');
    await page.locator('[data-save]').click();
    await expect(
      panel(page)
        .locator('.board[data-kind="activities"] .b-row')
        .filter({ hasText: 'Nobody owns this yet' })
        .locator('.b-owner'),
    ).toHaveText('—');
  });

  test('a program with no contacts yet says so', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('OwnerX1');
    await page.locator('.pf-kickoff').fill('2029-02-05');
    await page.locator('[data-create]').click();
    await page.waitForURL(/\/p\/ownerx1-/);

    await openEditor(page, 'activities');
    await expect(page.locator('.ie-owner option')).toHaveText([
      '— Unassigned',
      'Add engineering contacts to this stage first',
    ]);
  });
});
