import { PrismaPg } from '@prisma/adapter-pg';
import { expect, test as base, type Page } from '@playwright/test';
import { PrismaClient } from '../../src/generated/prisma/client';
import { seedProject } from '../../prisma/seedProject';

/**
 * Phase 6 made the app stateful, so tests now share a database. Each test gets
 * a freshly seeded one: the suite runs against its own database (never the
 * developer's) and reseeds in-process before every test, which is why e2e runs
 * on a single worker — parallel workers would reseed out from under each other.
 *
 * Postgres, the same engine the deployed app runs on. TEST_DATABASE_URL can be
 * overridden for CI; locally it is the database `createdb atlaspm_test` makes.
 */
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? `postgresql://${process.env.USER ?? 'postgres'}@localhost:5432/atlaspm_test`;

/** The seeded program, and the shell it opens in. */
export const SEED_PROJECT_ID = 'atlasax1';
export const SHELL_PATH = `/p/${SEED_PROJECT_ID}`;

let client: PrismaClient | null = null;
const prisma = () =>
  (client ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: TEST_DATABASE_URL }),
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

/**
 * Waits for the writes already sent.
 *
 * Every mutation is optimistic and fire-and-forget, so a reload can outrun one.
 * The page counts what is in flight; this drains it before a navigation that
 * would otherwise cancel a pending action.
 */
export async function writesSettled(page: Page) {
  const count = inflight.get(page);
  if (count) await expect.poll(() => count.n, { timeout: 10_000 }).toBe(0);
}

export { expect, type Page } from '@playwright/test';
