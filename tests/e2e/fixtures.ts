import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { test as base } from '@playwright/test';
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
