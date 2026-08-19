import { expect, test, type Page } from './fixtures';

/**
 * The landing page: one card per program, create and delete, and the contract
 * for a brand-new program — empty boards, but the stage scaffolding intact.
 */

const card = (page: Page, name: string) =>
  page.locator('.pl-card').filter({ has: page.locator('.pl-name', { hasText: name }) });

const createProgram = async (page: Page, name: string, kickoff: string) => {
  await page.locator('[data-new-project]').click();
  await page.locator('.pf-name').fill(name);
  await page.locator('.pf-kickoff').fill(kickoff);
  await page.locator('[data-create]').click();
  await page.waitForURL(/\/p\//);
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.pl-card').first()).toBeVisible();
});

test.describe('program list', () => {
  test('shows a card per program with its headline numbers', async ({ page }) => {
    await expect(page.locator('.pl-head h1')).toHaveText('Programs');
    await expect(page.locator('.pl-head .count')).toHaveText('1 program');

    const c = card(page, 'AtlasAX1');
    await expect(c.locator('.pl-profile')).toHaveText('Typical SoC');
    await expect(c.locator('.pl-pct .n')).toHaveText('51%');
    await expect(c.locator('.pl-pct')).toContainText('23 / 45 deliverables');
    await expect(c.locator('.pl-stage')).toHaveText('PD · Physical Design');
    await expect(c.locator('.pl-stage')).toHaveClass(/risky/);

    const facts = c.locator('.pl-fact');
    await expect(facts.nth(0)).toContainText('Kickoff');
    await expect(facts.nth(1).locator('.v')).toContainText(/^\d{2}\/\d{2}\/\d{4} · D−\d+$/);
    await expect(facts.nth(2).locator('.v')).toHaveText('7');
    await expect(facts.nth(2).locator('.v')).toHaveClass(/alert/);
    await expect(facts.nth(3).locator('.v')).toHaveText('1');
    // no manual date edits yet
    await expect(c.locator('.pl-flag')).toHaveCount(0);
  });

  test('a card opens its program, and the toolbar comes back', async ({ page }) => {
    await card(page, 'AtlasAX1').locator('.pl-open').click();
    await expect(page).toHaveURL(/\/p\/atlasax1$/);
    await expect(page.locator('.stage-panel.selected')).toBeVisible();
    await expect(page.locator('#project-name')).toHaveText('AtlasAX1');

    await page.locator('#to-programs').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.pl-head h1')).toHaveText('Programs');
  });

  test('the EDITED flag surfaces a manually edited schedule', async ({ page }) => {
    await page.goto('/p/atlasax1');
    const panel = page.locator('.stage-panel.selected');
    await page.locator('.rm-station', { hasText: /^04 / }).hover();
    const end = await panel.locator('[data-role="end-edit"]').inputValue();
    const [y, m, d] = end.split('-').map(Number);
    const moved = new Date(y, m - 1, d);
    moved.setDate(moved.getDate() + 14);
    const p2 = (n: number) => String(n).padStart(2, '0');
    await panel
      .locator('[data-role="end-edit"]')
      .fill(`${moved.getFullYear()}-${p2(moved.getMonth() + 1)}-${p2(moved.getDate())}`);
    await expect(page.locator('.edited-flag')).toBeVisible();

    await page.locator('#to-programs').click();
    await expect(card(page, 'AtlasAX1').locator('.pl-flag')).toHaveText('EDITED');
  });
});

test.describe('creating a program', () => {
  test('asks for name, kickoff and profile, then opens the new program', async ({ page }) => {
    await page.locator('[data-new-project]').click();
    await expect(page.locator('.pf-name')).toBeFocused();
    // only the modelled profile is selectable; the rest ship disabled
    await expect(page.locator('.pf-profile')).toHaveValue('typicalSoC');
    expect(await page.locator('.pf-profile option:not([disabled])').count()).toBe(1);

    // both fields are required
    await page.locator('[data-create]').click();
    await expect(page.locator('.pl-form .err')).toHaveText('Give the program a name.');
    await page.locator('.pf-name').fill('AtlasBX2');
    await page.locator('.pf-kickoff').fill('');
    await page.locator('[data-create]').click();
    await expect(page.locator('.pl-form .err')).toHaveText('Pick an expected kickoff date.');

    await page.locator('.pf-kickoff').fill('2027-03-01');
    await page.locator('[data-create]').click();
    await page.waitForURL(/\/p\/atlasbx2-/);
    await expect(page.locator('#project-name')).toHaveText('AtlasBX2');
  });

  test('milestones fall out of the kickoff and the profile TATs', async ({ page }) => {
    await createProgram(page, 'AtlasBX3', '2027-03-01');
    await expect(page.locator('#kickoff-input')).toHaveValue('2027-03-01');
    // Tapeout ends 38 weeks after kickoff, First Silicon 46, Production 66
    await expect(page.locator('[data-computed="tapeout"]')).toHaveText('11/22/2027');
    await expect(page.locator('[data-computed="firstSilicon"]')).toHaveText('01/17/2028');
    await expect(page.locator('[data-computed="production"]')).toHaveText('06/05/2028');
    await expect(page.locator('.rm-ms-label')).toHaveText([
      'Tapeout',
      'First Silicon',
      'Mass Production',
    ]);
    // and the stage rows agree
    await expect(page.locator('.stage-panel.selected [data-role="start-edit"]')).toHaveValue(
      '2027-03-01',
    );
    await expect(page.locator('.stage-panel.selected [data-role="tat"]')).toHaveText('4W TAT');
  });

  test('starts with empty boards but keeps the stage deliverables', async ({ page }) => {
    await createProgram(page, 'AtlasBX4', '2027-03-01');
    const panel = page.locator('.stage-panel.selected');

    for (const kind of ['keyinfo', 'activities', 'risks'] as const) {
      const board = panel.locator(`.board[data-kind="${kind}"]`);
      await expect(board.locator('.b-row')).toHaveCount(0);
      await expect(board.locator('.b-empty')).toHaveText('Nothing here yet.');
      await expect(board.locator('.board-head .note')).toHaveText(
        kind === 'risks' ? '0 open' : '0 items',
      );
    }

    // key deliverables survive: they are what the stage owes, not program content
    await expect(panel.locator('.dlv-list li')).toHaveCount(3);
    await expect(panel.locator('.dlv-t')).toHaveText([
      'Product requirements document',
      'Target specification',
      'Feasibility report',
    ]);
    await expect(panel.locator('.dlv-note')).toHaveText('0 / 3 complete');
    // dated to the stage end under this program's own schedule
    await expect(panel.locator('.dlv-due').first()).toHaveValue('2027-03-29');

    // leaders and contacts are the program's to fill in
    await expect(panel.locator('.l-name')).toHaveText('Unassigned');
    await expect(panel.locator('.contacts-sec .c-row')).toHaveCount(0);

    // the dashboard reads 0% with nothing overdue and no risks
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await expect(page.locator('.stat').first().locator('.v')).toHaveText('0%');
    await expect(page.locator('.dash-empty').first()).toBeVisible();
  });

  test('a new program is editable and independent of the seeded one', async ({ page }) => {
    await createProgram(page, 'AtlasBX5', '2027-03-01');
    const panel = page.locator('.stage-panel.selected');
    await panel.locator('.board[data-kind="activities"] [data-add]').click();
    await page.locator('.ie-title').fill('Kick off the definition review');
    await page.locator('[data-save]').click();
    await expect(panel.locator('.board[data-kind="activities"] .b-row')).toHaveCount(1);

    // the seeded program is untouched
    await page.goto('/p/atlasax1');
    await page.locator('.rm-station', { hasText: /^06 / }).hover();
    await expect(
      page.locator('.stage-panel.selected .board[data-kind="activities"] .board-head .note'),
    ).toHaveText('6 items · 6 updates');

    // and both are listed
    await page.goto('/');
    await expect(page.locator('.pl-card:not(.new)')).toHaveCount(2);
    await expect(card(page, 'AtlasBX5').locator('.pl-pct .n')).toHaveText('0%');
    await expect(card(page, 'AtlasAX1').locator('.pl-pct .n')).toHaveText('51%');
  });

  test('Cancel closes the form without creating anything', async ({ page }) => {
    await page.locator('[data-new-project]').click();
    await page.locator('.pf-name').fill('Never created');
    await page.locator('[data-cancel-create]').click();
    await expect(page.locator('.pl-form')).toHaveCount(0);
    await expect(page.locator('.pl-card:not(.new)')).toHaveCount(1);
  });
});

/**
 * The store is a module singleton, so client-side navigation between programs
 * is the case that breaks: nothing tears it down between routes. Every test
 * here navigates by clicking, never by page.goto — a full load would rebuild
 * the store and hide the bug.
 */
test.describe('switching programs without a page load', () => {
  test('a program created after opening another shows its own data', async ({ page }) => {
    // open the seeded program first, so the store is full of it
    await card(page, 'AtlasAX1').locator('.pl-open').click();
    await expect(page.locator('#project-name')).toHaveText('AtlasAX1');
    await page.locator('#to-programs').click();

    await createProgram(page, 'ZetaX1', '2029-06-04');
    const panel = page.locator('.stage-panel.selected');

    await expect(page.locator('#project-name')).toHaveText('ZetaX1');
    await expect(page.locator('#kickoff-input')).toHaveValue('2029-06-04');
    // milestones follow the kickoff that was just typed in
    await expect(page.locator('[data-computed="tapeout"]')).toHaveText('02/25/2030');
    await expect(page.locator('[data-computed="firstSilicon"]')).toHaveText('04/22/2030');
    await expect(panel.locator('[data-role="start-edit"]')).toHaveValue('2029-06-04');
    // and none of AtlasAX1's content came along
    await expect(panel.locator('.board[data-kind="keyinfo"] .b-row')).toHaveCount(0);
    await expect(panel.locator('.board[data-kind="activities"] .b-row')).toHaveCount(0);
    await expect(panel.locator('.l-name')).toHaveText('Unassigned');
    await expect(panel.locator('.contacts-sec .c-row')).toHaveCount(0);
    await expect(panel.locator('.dlv-note')).toHaveText('0 / 3 complete');
    await expect(page.locator('.edited-flag')).toBeHidden();
  });

  test('clicking between two programs swaps every panel', async ({ page }) => {
    await createProgram(page, 'ZetaX2', '2029-06-04');
    await page.locator('#to-programs').click();
    await card(page, 'AtlasAX1').locator('.pl-open').click();
    await expect(page.locator('#project-name')).toHaveText('AtlasAX1');
    await expect(page.locator('#kickoff-input')).not.toHaveValue('2029-06-04');

    await page.locator('#to-programs').click();
    await card(page, 'ZetaX2').locator('.pl-open').click();
    await expect(page.locator('#project-name')).toHaveText('ZetaX2');
    await expect(page.locator('#kickoff-input')).toHaveValue('2029-06-04');
    await expect(page.locator('[data-computed="tapeout"]')).toHaveText('02/25/2030');
    await expect(
      page.locator('.stage-panel.selected .board[data-kind="activities"] .b-row'),
    ).toHaveCount(0);
  });

  test('the dashboard follows the switch too', async ({ page }) => {
    await card(page, 'AtlasAX1').locator('.pl-open').click();
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await expect(page.locator('.stat').first().locator('.v')).toHaveText('51%');
    await page.locator('#mode-toggle button[data-mode="journey"]').click();

    await page.locator('#to-programs').click();
    await createProgram(page, 'ZetaX3', '2029-06-04');
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await expect(page.locator('#dash-title')).toHaveText('ZetaX3 — Dashboard');
    await expect(page.locator('.stat').first().locator('.v')).toHaveText('0%');
    await expect(page.locator('.dash-flight span')).toHaveText('No stage active today');
  });

  test('the view resets: selected stage and open sheets do not carry over', async ({ page }) => {
    await card(page, 'AtlasAX1').locator('.pl-open').click();
    await page.locator('.rm-station', { hasText: /^09 / }).hover();
    await expect(page.locator('.stage-panel.selected')).toHaveAttribute('data-id', 'fabrication');

    await page.locator('#to-programs').click();
    await createProgram(page, 'ZetaX4', '2029-06-04');
    // back to stage 1 with its details open, as on a fresh load
    await expect(page.locator('.stage-panel.selected')).toHaveAttribute(
      'data-id',
      'productDefinition',
    );
    await expect(
      page.locator('.stage-panel.selected .inline-area[data-kind="stage"]'),
    ).toBeVisible();
  });

  test('leaving with a pop-up open does not strand the page lock', async ({ page }) => {
    await card(page, 'AtlasAX1').locator('.pl-open').click();
    await page.locator('.stage-panel.selected .board[data-kind="keyinfo"] [data-more]').click();
    await expect(page.locator('#modal .modal-win')).toBeVisible();
    await expect(page.locator('body')).toHaveClass(/modal-open/);

    /* the scrim covers the toolbar on purpose, so browser back is the only way
       out of a pop-up without closing it */
    await page.goBack();
    await expect(page.locator('.pl-card').first()).toBeVisible();
    await expect(page.locator('body')).not.toHaveClass(/modal-open/);

    // and the pop-up does not reappear over a different program
    await createProgram(page, 'ZetaX5', '2029-06-04');
    await expect(page.locator('#modal .modal-win')).toBeHidden();
    await expect(page.locator('body')).not.toHaveClass(/modal-open/);
  });

  test('leaving from the dashboard leaves the program list scrollable', async ({ page }) => {
    await card(page, 'AtlasAX1').locator('.pl-open').click();
    await page.locator('#mode-toggle button[data-mode="schedule"]').click();
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');

    await page.locator('#to-programs').click();
    await expect(page.locator('.pl-card').first()).toBeVisible();
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
    await expect(page.locator('body')).not.toHaveClass(/schedule-mode/);
  });

  test('editing one program after switching writes to that program', async ({ page }) => {
    await card(page, 'AtlasAX1').locator('.pl-open').click();
    await page.locator('#to-programs').click();
    await createProgram(page, 'ZetaX6', '2029-06-04');

    await page.locator('.stage-panel.selected .board[data-kind="risks"] [data-add]').click();
    await page.locator('.ie-title').fill('Written to the new program');
    await page.locator('[data-save]').click();
    await expect(
      page.locator('.stage-panel.selected .board[data-kind="risks"] .b-row'),
    ).toHaveCount(1);

    // the write landed on ZetaX6, not on the program the store was holding
    await page.reload();
    await expect(page.locator('#project-name')).toHaveText('ZetaX6');
    await expect(
      page.locator('.stage-panel.selected .board[data-kind="risks"] .b-row'),
    ).toHaveCount(1);
    await page.goto('/p/atlasax1');
    await expect(page.locator('.stage-panel.selected .board[data-kind="risks"] .b-row')).toHaveCount(
      0,
    );
  });
});

test.describe('deleting a program', () => {
  test('asks first, and Cancel keeps it', async ({ page }) => {
    await card(page, 'AtlasAX1').locator('[data-del-project]').click();
    await expect(page.locator('.pl-confirm')).toContainText('Delete AtlasAX1?');
    await page.locator('[data-cancel-del]').click();
    await expect(page.locator('.pl-confirm')).toHaveCount(0);
    await expect(page.locator('.pl-card:not(.new)')).toHaveCount(1);
  });

  test('removes the program and everything under it', async ({ page }) => {
    await createProgram(page, 'AtlasBX6', '2027-03-01');
    await page.goto('/');
    await expect(page.locator('.pl-card:not(.new)')).toHaveCount(2);

    await card(page, 'AtlasBX6').locator('[data-del-project]').click();
    await page.locator('[data-confirm-del]').click();
    await expect(page.locator('.pl-card:not(.new)')).toHaveCount(1);
    await expect(page.locator('.pl-name')).toHaveText('AtlasAX1');

    // it survives a reload, and its route is gone
    await page.reload();
    await expect(page.locator('.pl-card:not(.new)')).toHaveCount(1);
  });

  test('deleting one program leaves the other intact', async ({ page }) => {
    await createProgram(page, 'AtlasBX7', '2027-03-01');
    await page.goto('/');
    await card(page, 'AtlasBX7').locator('[data-del-project]').click();
    await page.locator('[data-confirm-del]').click();
    await expect(page.locator('.pl-card:not(.new)')).toHaveCount(1);

    await page.goto('/p/atlasax1');
    await expect(page.locator('#project-name')).toHaveText('AtlasAX1');
    await expect(page.locator('[data-computed="tapeout"]')).not.toBeEmpty();
  });
});
