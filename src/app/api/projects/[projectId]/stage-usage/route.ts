import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * What each of a program's stages holds, by stage key.
 *
 * Removing a stage from a program takes its content with it, so the editor
 * says what would go before it asks. Counting here rather than in the program
 * list keeps a screen that never opens the dialog from paying for six
 * aggregate queries.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await ctx.params;

  const [items, deliverables, posts, leaders, contacts, details] = await Promise.all([
    prisma.item.groupBy({ by: ['stageId'], where: { projectId }, _count: true }),
    prisma.deliverable.groupBy({ by: ['stageId'], where: { projectId }, _count: true }),
    prisma.post.groupBy({ by: ['stageId'], where: { projectId, stageId: { not: null } }, _count: true }),
    prisma.leader.groupBy({ by: ['stageId'], where: { projectId }, _count: true }),
    prisma.contact.groupBy({ by: ['stageId'], where: { projectId }, _count: true }),
    prisma.stageDetail.groupBy({ by: ['stageId'], where: { projectId }, _count: true }),
  ]);

  const usage: Record<string, { items: number; deliverables: number; notes: number; people: number; details: number }> = {};
  const at = (stageId: string | null) => {
    const key = stageId ?? '';
    return (usage[key] ??= { items: 0, deliverables: 0, notes: 0, people: 0, details: 0 });
  };
  for (const r of items) at(r.stageId).items += r._count;
  for (const r of deliverables) at(r.stageId).deliverables += r._count;
  for (const r of posts) at(r.stageId).notes += r._count;
  for (const r of leaders) at(r.stageId).people += r._count;
  for (const r of contacts) at(r.stageId).people += r._count;
  for (const r of details) at(r.stageId).details += r._count;

  return NextResponse.json(usage);
}
