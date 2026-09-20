import path from 'node:path';
import { expect } from '@playwright/test';
import { SHELL_PATH, test, writesSettled } from './fixtures';

/**
 * The QoR dashboard.
 *
 * It holds no numbers of its own — everything comes from a workbook somebody
 * loads — so what these tests hold still is that: the tab belongs to Physical
 * Design and nowhere else, a file that goes in comes back out, what survives a
 * reload is what was loaded, and a number nobody reported never becomes a zero
 * on the way through.
 */
const WORKBOOK = path.join(__dirname, '../../design-canvas/qor-template.xlsx');
const QOR = `${SHELL_PATH}/stage/physicalDesign/qor`;

const load = async (page: import('@playwright/test').Page, file = WORKBOOK) => {
  await page.setInputFiles('.qor input[type=file]', file);
  await expect(page.locator('.qor-loadmsg')).toContainText('block rows across');
};

test('the tab belongs to Physical Design, and to no other stage', async ({ page }) => {
  await page.goto(`${SHELL_PATH}/stage/physicalDesign/activity`);
  await expect(page.getByRole('link', { name: /^QoR Dashboard/ })).toBeVisible();

  await page.goto(`${SHELL_PATH}/stage/signoff/activity`);
  await expect(page.getByRole('link', { name: /^QoR Dashboard/ })).toHaveCount(0);
});

/* A link to /qor on another stage is stale, not wrong: it falls back to the
   stage's default section rather than showing an empty panel. */
test('a QoR link on another stage falls back to its first tab', async ({ page }) => {
  await page.goto(`${SHELL_PATH}/stage/signoff/qor`);
  await expect(page.getByRole('link', { name: /^Activity/ })).toHaveClass(/on/);
  await expect(page.locator('.qor')).toHaveCount(0);
});

test('offers the template before any workbook exists', async ({ page }) => {
  await page.goto(QOR);
  await expect(page.locator('.qor-srcname')).toHaveText('No workbook loaded');
  await expect(page.locator('.qor-drops')).toHaveCount(0);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download template' }).click();
  expect((await download).suggestedFilename()).toBe('qor-template.xlsx');
});

test('draws the chip and the blocks from a loaded workbook, and keeps it', async ({ page }) => {
  await page.goto(QOR);
  await load(page);

  await expect(page.locator('.qor-srcname')).toHaveText('qor-template.xlsx');
  /* four netlist drops, opening on the newest — the one being argued about */
  await expect(page.locator('.qor-drop')).toHaveCount(4);
  await expect(page.locator('.qor-drop[aria-selected="true"] .k')).toHaveText('FFN');
  await expect(page.locator('.qor-tile').first()).toContainText('Setup WNS');
  await expect(page.locator('.qor-qtbl')).toContainText('Setup failing endpoints');

  await page.getByRole('tab', { name: /By block/ }).click();
  await expect(page.locator('.qor-tbody .qor-trow')).toHaveCount(60);
  await expect(page.locator('.qor-count')).toHaveText('60 of 60 blocks');

  /* the workbook is stored, not held in the page */
  await writesSettled(page);
  await page.reload();
  await expect(page.locator('.qor-srcname')).toHaveText('qor-template.xlsx');
  await expect(page.locator('.qor-qtbl')).toContainText('Setup WNS');
});

test('the column sets show different measures, and no measure twice', async ({ page }) => {
  await page.goto(QOR);
  await load(page);
  await page.getByRole('tab', { name: /By block/ }).click();

  const head = page.locator('.qor-thead');
  await expect(head).toContainText('Setup WNS');
  await page.getByRole('tab', { name: 'Hold', exact: true }).click();
  await expect(head).toContainText('Hold WNS');
  await expect(head).not.toContainText('Setup WNS');
  await page.getByRole('tab', { name: 'DRV' }).click();
  await expect(head).toContainText('Max tran viol');
  await expect(head).toContainText('Worst tran');
});

test('filters the blocks by the status they read as', async ({ page }) => {
  await page.goto(QOR);
  await load(page);
  await page.getByRole('tab', { name: /By block/ }).click();

  const chips = page.locator('.qor-toolbar');
  await chips.getByRole('button', { name: /^Failing/ }).click();
  const failing = await page.locator('.qor-tbody .qor-trow').count();
  expect(failing).toBeGreaterThan(0);
  expect(failing).toBeLessThan(60);
  for (const chip of await page.locator('.qor-tbody .qor-st').allInnerTexts()) expect(chip).toBe('Failing');

  await chips.getByRole('button', { name: /^All/ }).click();
  await page.locator('.qor-search').fill('npu');
  await expect(page.locator('.qor-tbody .r-name')).toHaveCount(4);
});

/* The rule the whole format exists for: a cell nobody filled in is not a zero,
   and a zero is what would have read as "met the target". */
test('a value nobody reported shows as a dash, not as a zero', async ({ page }) => {
  /* the flat shape a design script writes, with one block's slack never
     filled in — the case that used to read as "met the target" */
  const csv = [
    'Drop,Group,Block,pnr_stage,setup_wns,setup_tns,setup_failing_endpoints,hold_failing_endpoints,global_route_overflow,drc_after_route,utilization',
    'FFN,CPU,alpha,Route,-50,-2,10,0,0.5,3,70',
    'FFN,CPU,beta,Route,,,,0,0.5,3,70',
  ].join('\n');

  await page.goto(QOR);
  await page.setInputFiles('.qor input[type=file]', {
    name: 'run.csv', mimeType: 'text/csv', buffer: Buffer.from(csv),
  });
  await expect(page.locator('.qor-loadmsg')).toContainText('2 block rows across 1 drops');
  /* a column the file never had counts the same as a cell it left empty:
     both are measures nobody reported, and the message says how many */
  await expect(page.locator('.qor-loadmsg')).toContainText('values blank or unreadable');
  await expect(page.locator('.qor-loadmsg')).not.toContainText('is not on the Blocks sheet');

  await page.getByRole('tab', { name: /By block/ }).click();
  const alpha = page.locator('.qor-tbody .qor-trow').filter({ hasText: 'alpha' });
  const beta = page.locator('.qor-tbody .qor-trow').filter({ hasText: 'beta' });
  await expect(alpha.locator('.num').first()).toHaveText('-50');
  await expect(alpha.locator('.qor-st')).toHaveText('Failing');
  await expect(beta.locator('.num').first()).toHaveText('—');
  await expect(beta.locator('.qor-st')).toHaveText('Not reported');

  /* and the chip does not average it in: the worst slack is alpha's, alone */
  await page.getByRole('tab', { name: /Full chip/ }).click();
  const wns = page.locator('.qor-qrow').filter({ hasText: 'Setup WNS' });
  await expect(wns.locator('.num').nth(1)).toHaveText('-50');
});

test('removing the workbook takes the numbers with it', async ({ page }) => {
  await page.goto(QOR);
  await load(page);
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.locator('.qor-srcname')).toHaveText('No workbook loaded');
  await expect(page.locator('.qor-qtbl')).toHaveCount(0);

  await writesSettled(page);
  await page.reload();
  await expect(page.locator('.qor-srcname')).toHaveText('No workbook loaded');
});
