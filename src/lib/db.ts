import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@/generated/prisma/client';

/**
 * One client per process. Next's dev server reloads modules on every edit, so
 * without the global the connection count climbs until SQLite complains.
 *
 * Production Postgres: swap PrismaBetterSqlite3 for @prisma/adapter-pg and
 * flip the provider in schema.prisma. No model or query changes.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./dev.db' }),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
