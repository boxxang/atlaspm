import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../src/generated/prisma/client';
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: 'file:./dev.db' }) });
const rows = await prisma.stageDetail.findMany({ where: { projectId: 'atlasax1' } });
for (const r of rows)
  console.log(r.stageId, '| view:', JSON.stringify(r.engineeringView), '| effort:', JSON.stringify(r.engineeringEffort));
const d = await prisma.deliverable.findMany({ where: { projectId: 'atlasax1', stageId: 'productDefinition' } });
console.log('deliverables:', d.map((x) => `${x.title} @ ${x.due?.toISOString().slice(0, 10) ?? 'null'}`));
await prisma.$disconnect();
