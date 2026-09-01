import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * A template's stages, in order.
 *
 * The editor reads them from here rather than taking them as props, so it
 * always opens on what is stored — a dialog seeded from a list rendered
 * earlier shows whatever was true when the page loaded.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ profileId: string }> },
) {
  const { profileId } = await ctx.params;
  const rows = await prisma.profileStage.findMany({
    where: { profileId },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(rows);
}
