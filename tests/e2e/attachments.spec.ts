import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { expect, test, type Page, SEED_PROJECT_PATH, selectStage } from './fixtures';

/** A 32×32 PNG and a plain text file, written once for the suite. */
const dir = tmpdir();
const PNG = join(dir, 'atlaspm-shot.png');
const TXT = join(dir, 'atlaspm-spec.txt');
const BIG = join(dir, 'atlaspm-big.bin');
writeFileSync(
  PNG,
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAPElEQVR42u3OMQEAAAgDoC251a3gLzSgmXBPGiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIn4tXVAAAV6+wKMAAAAASUVORK5CYII=',
    'base64',
  ),
);
writeFileSync(TXT, 'PDN rev 2 notes\nball map pending');
writeFileSync(BIG, Buffer.alloc(6 * 1024 * 1024, 1)); // over the 5MB ceiling

const openItem = async (page: Page, title: string) => {
  await selectStage(page, 'physicalDesign');
  await page
    .locator('.stage-panel.selected .board[data-kind="activities"] [data-more]')
    .click();
  await page.locator('#modal-body .b-row').filter({ hasText: title }).click();
  await expect(page.locator('.iv-title')).toContainText(title);
};

test.beforeEach(async ({ page }) => {
  await page.goto(SEED_PROJECT_PATH);
  await selectStage(page, 'productDefinition');
});

test.describe('attaching to an item', () => {
  test('files attach, show their size, and survive a reload', async ({ page }) => {
    await openItem(page, 'ECO drop 1 planning');
    await expect(page.locator('.iv-attach .att')).toHaveCount(0);

    await page.locator('.iv-attach .att-input').setInputFiles([PNG, TXT]);
    await expect(page.locator('.iv-attach .att')).toHaveCount(2);
    await expect(page.locator('.iv-attach .att-name')).toHaveText([
      'atlaspm-shot.png',
      'atlaspm-spec.txt',
    ]);
    await expect(page.locator('.iv-attach .att-size').first()).toHaveText(/B$/);
    // the image previews inline, the text file does not
    await expect(page.locator('.iv-attach .att-link.img img')).toHaveCount(1);
    await expect(page.locator('.iv-attach .att-doc')).toHaveCount(1);

    await page.reload();
    await openItem(page, 'ECO drop 1 planning');
    await expect(page.locator('.iv-attach .att')).toHaveCount(2);
  });

  test('an image is served inline and a document is served as a download', async ({ page }) => {
    await openItem(page, 'ECO drop 1 planning');
    await page.locator('.iv-attach .att-input').setInputFiles([PNG, TXT]);
    await expect(page.locator('.iv-attach .att')).toHaveCount(2);

    const imgSrc = (await page.locator('.iv-attach .att-link.img').getAttribute('href'))!;
    const img = await page.request.get(imgSrc);
    expect(img.status()).toBe(200);
    expect(img.headers()['content-type']).toBe('image/png');
    expect(img.headers()['content-disposition']).toContain('inline');
    expect(img.headers()['x-content-type-options']).toBe('nosniff');

    const docSrc = (await page
      .locator('.iv-attach .att-link:not(.img)')
      .getAttribute('href'))!;
    const doc = await page.request.get(docSrc);
    expect(doc.status()).toBe(200);
    // never served with its own type, so nothing renders from our origin
    expect(doc.headers()['content-type']).toBe('application/octet-stream');
    expect(doc.headers()['content-disposition']).toContain('attachment');
  });

  test('an unknown attachment is a 404', async ({ page }) => {
    const r = await page.request.get('/api/attachments/does-not-exist');
    expect(r.status()).toBe(404);
  });

  test('removing one takes it off the item for good', async ({ page }) => {
    await openItem(page, 'ECO drop 1 planning');
    await page.locator('.iv-attach .att-input').setInputFiles([PNG, TXT]);
    await expect(page.locator('.iv-attach .att')).toHaveCount(2);

    await page.locator('.iv-attach .att').first().locator('[data-att-del]').click();
    await expect(page.locator('.iv-attach .att')).toHaveCount(1);
    await expect(page.locator('.iv-attach .att-name')).toHaveText(['atlaspm-spec.txt']);

    await page.reload();
    await openItem(page, 'ECO drop 1 planning');
    await expect(page.locator('.iv-attach .att')).toHaveCount(1);
  });

  test('a file over the ceiling is refused, with a reason', async ({ page }) => {
    await openItem(page, 'ECO drop 1 planning');
    await page.locator('.iv-attach .att-input').setInputFiles([BIG]);
    await expect(page.locator('.att-problems li')).toContainText('over 5 MB');
    await expect(page.locator('.iv-attach .att')).toHaveCount(0);
  });
});

test.describe('attaching while writing the item', () => {
  test('files picked in the editor land on the item once it is saved', async ({ page }) => {
    const board = page.locator('.stage-panel.selected .board[data-kind="activities"]');
    await board.locator('[data-add]').click();
    await page.locator('.ie-title').fill('Ball map review');
    await page.locator('.ie-attach .att-input').setInputFiles([PNG, TXT]);

    // they wait, named, until the item exists to hang them off
    await expect(page.locator('.ie-attach .att-list.pending .att')).toHaveCount(2);
    await expect(page.locator('.ie-attach .att-name')).toHaveText([
      'atlaspm-shot.png',
      'atlaspm-spec.txt',
    ]);
    await expect(page.locator('.att-pending')).toContainText('attached when you save');

    await page.locator('[data-save]').click();
    await expect(page.locator('#modal .modal-win')).toBeHidden();

    await board.locator('[data-more]').click();
    await page.locator('#modal-body .b-row').filter({ hasText: 'Ball map review' }).click();
    await expect(page.locator('.iv-attach .att')).toHaveCount(2);

    await page.reload();
    /* the board this test writes to belongs to the stage beforeEach opened */
    await selectStage(page, 'productDefinition');
    await board.locator('[data-more]').click();
    await page.locator('#modal-body .b-row').filter({ hasText: 'Ball map review' }).click();
    await expect(page.locator('.iv-attach .att')).toHaveCount(2);
  });

  test('a pending file can be dropped before saving', async ({ page }) => {
    const board = page.locator('.stage-panel.selected .board[data-kind="activities"]');
    await board.locator('[data-add]').click();
    await page.locator('.ie-title').fill('Only one file');
    await page.locator('.ie-attach .att-input').setInputFiles([PNG, TXT]);
    await expect(page.locator('.ie-attach .att')).toHaveCount(2);

    await page.locator('[data-pending-del="0"]').click();
    await expect(page.locator('.ie-attach .att')).toHaveCount(1);
    await page.locator('[data-save]').click();

    await board.locator('[data-more]').click();
    await page.locator('#modal-body .b-row').filter({ hasText: 'Only one file' }).click();
    await expect(page.locator('.iv-attach .att-name')).toHaveText(['atlaspm-spec.txt']);
  });

  test('an oversized file is refused while composing', async ({ page }) => {
    const board = page.locator('.stage-panel.selected .board[data-kind="activities"]');
    await board.locator('[data-add]').click();
    await page.locator('.ie-attach .att-input').setInputFiles([BIG]);
    await expect(page.locator('[data-form-error]')).toContainText('over 5 MB');
    await expect(page.locator('.ie-attach .att')).toHaveCount(0);
  });

  test('an existing item shows its attachments in the editor', async ({ page }) => {
    await openItem(page, 'ECO drop 1 planning');
    await page.locator('.iv-attach .att-input').setInputFiles(TXT);
    await expect(page.locator('.iv-attach .att')).toHaveCount(1);

    await page.locator('[data-edit]').click();
    await expect(page.locator('.ie-attach .att-name')).toHaveText(['atlaspm-spec.txt']);
    await page.locator('.ie-attach [data-att-del]').click();
    await expect(page.locator('.ie-attach .att')).toHaveCount(0);
  });
});

test.describe('attaching to a status update', () => {
  test('files picked before posting land on the update', async ({ page }) => {
    await openItem(page, 'ECO drop 1 planning');
    await expect(page.locator('.su-empty')).toBeVisible();

    await page.locator('.su-attach .att-input').setInputFiles(PNG);
    await expect(page.locator('.att-pending')).toContainText('atlaspm-shot.png');
    await page.locator('.su-input').fill('Ball map received — see attached.');
    await page.locator('[data-post]').click();

    await expect(page.locator('.su-item')).toHaveCount(1);
    await expect(page.locator('.su-item .att')).toHaveCount(1);
    await expect(page.locator('.su-item .att-name')).toHaveText('atlaspm-shot.png');
    // the pending list clears once posted
    await expect(page.locator('.att-pending')).toHaveCount(0);

    await page.reload();
    await openItem(page, 'ECO drop 1 planning');
    await expect(page.locator('.su-item .att')).toHaveCount(1);
    await expect(page.locator('.su-item .su-text')).toContainText('Ball map received');
  });

  test('a file can be added to an update that already exists', async ({ page }) => {
    await openItem(page, 'Top-level detailed routing');
    const first = page.locator('.su-item').first();
    await expect(first.locator('.att')).toHaveCount(0);

    await first.locator('.att-input').setInputFiles(TXT);
    await expect(first.locator('.att')).toHaveCount(1);

    await page.reload();
    await openItem(page, 'Top-level detailed routing');
    await expect(page.locator('.su-item').first().locator('.att')).toHaveCount(1);
  });

  test('deleting the update takes its attachments with it', async ({ page }) => {
    await openItem(page, 'ECO drop 1 planning');
    await page.locator('.su-attach .att-input').setInputFiles(PNG);
    await page.locator('.su-input').fill('Temporary note.');
    await page.locator('[data-post]').click();
    await expect(page.locator('.su-item .att')).toHaveCount(1);
    const src = (await page.locator('.su-item .att-link').getAttribute('href'))!;

    await page.locator('[data-su-del]').click();
    await expect(page.locator('.su-item')).toHaveCount(0);

    // the row cascades away with its update
    await page.reload();
    expect((await page.request.get(src)).status()).toBe(404);
  });

  test('Clear drops files picked but not yet posted', async ({ page }) => {
    await openItem(page, 'ECO drop 1 planning');
    await page.locator('.su-attach .att-input').setInputFiles([PNG, TXT]);
    await expect(page.locator('.att-pending')).toBeVisible();
    await page.locator('[data-clear-pending]').click();
    await expect(page.locator('.att-pending')).toHaveCount(0);

    await page.locator('.su-input').fill('No files on this one.');
    await page.locator('[data-post]').click();
    await expect(page.locator('.su-item')).toHaveCount(1);
    await expect(page.locator('.su-item .att')).toHaveCount(0);
  });
});
