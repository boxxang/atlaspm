import 'dotenv/config';
import { defineConfig } from '@prisma/config';

/**
 * Prisma 7 moved the datasource URL out of schema.prisma. Migrate and the
 * seed command read it here; the client gets it through a driver adapter.
 * Switching to Postgres in production means changing the provider in
 * schema.prisma and the adapter in src/lib/db.ts — no model changes.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
