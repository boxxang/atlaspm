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
  '03': 'rtl',
  '04': 'verification',
  '05': 'synthesis',
  '06': 'physicalDesign',
  '07': 'signoff',
  '08': 'tapeout',
  '09': 'fabrication',
  '10': 'packaging',
  '11': 'bringup',
  '12': 'qualification',
};

/**
 * Stages are picked from the concurrency chart's y-axis, and nothing is
 * selected until you pick one — so most tests open a stage before asserting on
 * the panel below.
 */
/**
 * The engineering table and the deliverables table are read-outs until the
 * stage sheet is in edit mode; the pencil opens it.
 */
export async function editStageDetail(page: Page) {
  const panel = page.locator('.stage-panel.selected');
  if (!(await panel.locator('.sd-edit').count())) {
    await panel.locator('[data-sd-edit]').click();
  }
  await expect(panel.locator('.sd-edit')).toBeVisible();
}

export async function selectStage(page: Page, num: string) {
  const id = STAGE_BY_NUMBER[num];
  /* The store hydrates on mount and opens the stage today falls in, so wait
     for the chart before reading the selection — asking too early sees nothing
     open and clicks the bar shut again. */
  await expect(page.locator('#rm-gantt .g-row').first()).toBeVisible();
  /* Idempotent: picking the selected bar again closes it, so only click when
     the stage is not already open. */
  if (!(await page.locator(`.stage-panel.selected[data-id="${id}"]`).count())) {
    /* The chart folds to the open stage once the pointer leaves downward, so
       move back into it first — unfolding is what a user does before picking
       another bar. */
    await page.locator('#roadmap').hover({ position: { x: 6, y: 6 } });
    await page.locator(`#rm-gantt [data-select-stage="${id}"]`).click();
  }
  await expect(page.locator('.stage-panel.selected')).toHaveAttribute('data-id', id);
}
