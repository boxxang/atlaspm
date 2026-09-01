import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/** One stage's activities, with the steps of any that owns them. */
export async function GET(req: Request, ctx: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await ctx.params;
  const stageKey = new URL(req.url).searchParams.get('stage') ?? undefined;
  const rows = await prisma.profileActivity.findMany({
    where: { profileId, ...(stageKey ? { stageKey } : {}) },
    orderBy: { order: 'asc' },
    include: { steps: { orderBy: { n: 'asc' } } },
  });
  return NextResponse.json(rows);
}
