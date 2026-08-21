import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { expect, test as base, type Page } from '@playwright/test';
import { PrismaClient } from '../../src/generated/prisma/client';
import { seedProject } from '../../prisma/seedProject';

/**
 * Phase 6 made the app stateful, so tests now share a database. Each test gets
 * a freshly seeded one: the suite runs against test.db (never the developer's
 * dev.db) and reseeds in-process before every test, which is why e2e runs on a
 * single worker — parallel workers would reseed out from under each other.
 */
export const TEST_DATABASE_URL = 'file:./test.db';

/** The seeded program, and the route its detail view lives at. */
export const SEED_PROJECT_ID = 'atlasax1';
export const SEED_PROJECT_PATH = `/p/${SEED_PROJECT_ID}`;

let client: PrismaClient | null = null;
const prisma = () =>
  (client ??= new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: TEST_DATABASE_URL }),
  }));

/* Writes are optimistic and fire-and-forget, so a reload can outrun one. The
   POSTs in flight are counted here, and writesSettled() waits for them to
   drain — the browser's own load would otherwise cancel a pending action. */
const inflight = new WeakMap<Page, { n: number }>();

export const test = base.extend<{ seeded: void }>({
  seeded: [
    async ({}, use) => {
      /* seedProject only replaces its own program, so that `prisma db seed`
         never wipes programs someone else created. A test wants the whole
         database back, including anything a previous test created. */
      await prisma().project.deleteMany({});
      /* profiles forked by a test outlive its programs, and the pickers list
         them — clear everything the code did not ship */
      await prisma().profile.deleteMany({ where: { builtin: false } });
      await seedProject(prisma());
      await use();
    },
    { auto: true },
  ],
  page: async ({ page }, run) => {
    const count = { n: 0 };
    inflight.set(page, count);
    const isWrite = (r: { method(): string }) => r.method() === 'POST';
    page.on('request', (r) => isWrite(r) && count.n++);
    page.on('requestfinished', (r) => isWrite(r) && count.n--);
    page.on('requestfailed', (r) => isWrite(r) && count.n--);

    /* A load cancels whatever action is still in flight, and the app has no
       rollback — so every navigation drains the writes first. Without this,
       any test that reloads straight after an edit is a race. */
    const reload = page.reload.bind(page);
    page.reload = async (...args: Parameters<typeof reload>) => {
      await writesSettled(page);
      return reload(...args);
    };
    const goto = page.goto.bind(page);
    page.goto = async (...args: Parameters<typeof goto>) => {
      await writesSettled(page);
      return goto(...args);
    };

    await run(page);
  },
});

/**
 * Waits out any running transition. The concurrency chart folds to the open
 * stage when the pointer leaves it downward, which shifts everything below —
 * measurements taken mid-fold are stale.
 */
export async function settleLayout(page: Page) {
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))),
  );
}

/** Waits until every server action started by the last interactions has come back. */
export async function writesSettled(page: Page) {
  const count = inflight.get(page);
  if (count) await expect.poll(() => count.n, { timeout: 10_000 }).toBe(0);
}

export { expect, type Page } from '@playwright/test';

/** The roadmap's two-digit station numbers, as the stages they stand for. */
export const STAGE_BY_NUMBER: Record<string, string> = {
  '01': 'productDefinition',
  '02': 'architecture',
  '03': 'technology',
  '04': 'pdk',
  '05': 'ipReadiness',
  '06': 'amsIp',
  '07': 'testChip',
  '08': 'rtl',
  '09': 'verification',
  '10': 'dft',
  '11': 'synthesis',
  '12': 'physicalDesign',
  '13': 'signoff',
  '14': 'tapeout',
  '15': 'fabrication',
  '16': 'packageDesign',
  '17': 'packageTestVehicle',
  '18': 'chipPackageCoVerification',
  '19': 'packaging',
  '20': 'validationHardware',
  '21': 'testDevelopment',
  '22': 'bringup',
  '23': 'qualification',
};

/**
 * Stages are picked from the concurrency chart's y-axis, and nothing is
 * selected until you pick one — so most tests open a stage before asserting on
 * the panel below.
 */
/**
 * The stage sheet holds three things that are edited separately: the text
 * (the pencil), the engineering list and the deliverables (a switch each).
 */
export async function editStageDetail(page: Page) {
  const panel = page.locator('.stage-panel.selected');
  if (!(await panel.locator('.sd-edit').count())) {
    await panel.locator('[data-sd-edit]').click();
  }
  await expect(panel.locator('.sd-edit')).toBeVisible();
}

const toggleTable = async (page: Page, selector: string, on: boolean) => {
  const btn = page.locator('.stage-panel.selected').locator(selector);
  if ((await btn.getAttribute('aria-pressed')) !== String(on)) await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', String(on));
};

/** Turn the engineering table into a form (or back into a read-out). */
export const editEngineering = (page: Page, on = true) =>
  toggleTable(page, '[data-mm-edit]', on);

/** Turn the deliverables table into a form (or back into a read-out). */
export const editDeliverables = (page: Page, on = true) =>
  toggleTable(page, '[data-dlv-edit]', on);

/**
 * The toolbar carries no dates any more — the milestone axis does, and each
 * marker states its own in the tooltip it already had.
 */
export async function milestoneDate(page: Page, id: string): Promise<string> {
  const tip = await page.locator(`#rm-gantt .g-msdot[data-msid^="${id}"]`).first().getAttribute('data-tip');
  return (tip ?? '').split('|')[1]?.split(' ')[0] ?? '';
}

/* The milestone's id carries what the template calls it — 'tapeoutBeolMto' in
   the current one — so it is matched by prefix rather than pinned. */
export const tapeoutDate = (page: Page) => milestoneDate(page, 'tapeout');

/**
 * A deliverable is completed by filing its record, not by ticking a box: the
 * artefact is what the tick means. Opens the record, writes the history,
 * attaches the artefact and files it.
 */
export async function fileDeliverable(
  page: Page,
  title: string,
  file: string,
  note = 'Filed by the regression suite.',
) {
  await openDeliveryRecord(page, title);
  if (note) await page.locator('[data-dr-note]').fill(note);
  await page.locator('.dr-files .att-input').setInputFiles(file);
  await expect(page.locator('.dr-files .att')).toHaveCount(1);
  await page.locator('[data-dr-save]').click();
  await expect(page.locator('.dr-win')).toHaveCount(0);
}

/** Opens a deliverable's record from the sheet — the title is the way in. */
export async function openDeliveryRecord(page: Page, title: string) {
  await page
    .locator('.stage-panel.selected .dlv-list li')
    .filter({ hasText: title })
    .locator('[data-dlv-open]')
    .click();
  await expect(page.locator('.dr-win')).toBeVisible();
}

/** Kickoff is edited where it is drawn: click the diamond, type the date. */
export async function setKickoffDate(page: Page, iso: string) {
  await page.locator('#rm-gantt .g-kickoff-dot').click();
  const input = page.locator('#kickoff-input');
  await expect(input).toBeVisible();
  await input.fill(iso);
  await page.keyboard.press('Enter');
  await expect(input).toHaveCount(0);
}

/**
 * `ref` is a stage key ('physicalDesign') or, where a test is about the chart's
 * numbering itself, a two-digit station number. Keys are what the rest of the
 * suite uses: a stage's position moves whenever the profile changes, its key
 * does not.
 */
export async function selectStage(page: Page, ref: string) {
  const id = STAGE_BY_NUMBER[ref] ?? ref;
  /* The store hydrates on mount and opens the stage today falls in, so wait
     for the chart before reading the selection — asking too early sees nothing
     open and clicks the bar shut again. */
  await expect(page.locator('#rm-gantt')).toBeVisible();
  /* Idempotent: picking the selected bar again closes it, so only click when
     the stage is not already open. */
  if (!(await page.locator(`.stage-panel.selected[data-id="${id}"]`).count())) {
    /* The chart folds to the open stage once the pointer leaves downward, so
       move back into it first — unfolding is what a user does before picking
       another bar. */
    await page.locator('#roadmap').hover({ position: { x: 6, y: 6 } });
    const bar = page.locator(`#rm-gantt [data-select-stage="${id}"]`);
    await expect(bar).toBeVisible(); // the fold has to finish opening first
    await bar.click();
  }
  await expect(page.locator('.stage-panel.selected')).toHaveAttribute('data-id', id);
}
