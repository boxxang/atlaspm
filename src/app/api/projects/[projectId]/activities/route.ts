import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * One stage's activities on a program's own plan, with the steps of any that
 * owns them.
 *
 * The program's profile is looked up here rather than passed in: which profile
 * a program runs on changes the moment it is edited — a program sharing one
 * gets a private copy — and an editor holding the old id would write to the
 * plan it just stopped using.
 */
export async function GET(req: Request, ctx: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await ctx.params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { profileId: true },
  });
  if (!project) return NextResponse.json({ error: 'No such program' }, { status: 404 });

  const stageKey = new URL(req.url).searchParams.get('stage') ?? undefined;
  const rows = await prisma.profileActivity.findMany({
    where: { profileId: project.profileId, ...(stageKey ? { stageKey } : {}) },
    orderBy: { order: 'asc' },
    include: { steps: { orderBy: { n: 'asc' } } },
  });
  return NextResponse.json(rows);
}
