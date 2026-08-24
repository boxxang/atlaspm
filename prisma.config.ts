import 'dotenv/config';
import { defineConfig } from '@prisma/config';

/**
 * Prisma 7 moved the datasource URL out of schema.prisma. Migrate and the
 * seed command read it here; the client gets it through a driver adapter.
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
