/** `prisma db seed` — writes the AtlasAX1 program into DATABASE_URL. */
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { seedProject } from './seedProject';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

seedProject(prisma)
  .then((c) => {
    console.log(
      `Seeded ${c.projectName}: ${c.stages} stages, ${c.items} items, ` +
        `${c.updates} status updates, ${c.deliverables} deliverables. ` +
        `Kickoff ${c.kickoff.toDateString()}.`,
    );
    return prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
