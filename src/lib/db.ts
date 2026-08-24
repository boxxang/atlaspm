import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

/**
 * One client per process. Next's dev server reloads modules on every edit, so
 * without the global the pool count climbs until Postgres refuses connections.
 *
 * Postgres everywhere — development, the e2e suite and production — rather
 * than SQLite locally and Postgres deployed. Prisma's `provider` is fixed at
 * generate time and cannot be read from the environment, so the two cannot
 * share a schema; and a suite that runs on a different engine from the one it
 * ships on is not testing the thing it ships. See README, Running it.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
