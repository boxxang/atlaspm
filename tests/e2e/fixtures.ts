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
});

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
  /* Idempotent: picking the selected bar again closes it, so only click when
     the stage is not already open. */
  if (!(await page.locator(`.stage-panel.selected[data-id="${id}"]`).count())) {
    await page.locator(`#rm-gantt [data-select-stage="${id}"]`).click();
  }
  await expect(page.locator('.stage-panel.selected')).toHaveAttribute('data-id', id);
}
