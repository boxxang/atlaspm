/**
 * /lib/profileCopy.ts — copying a profile's activities onto another profile.
 *
 * Shared by the server actions that fork a profile: creating a programme,
 * duplicating a template, and giving a programme its own copy before one of
 * its activities is changed. Takes the client rather than importing it, like
 * /lib/builtinProfile, so it is not itself something a browser can call.
 *
 * Refs survive the copy, which is the whole point: the copy shows the same
 * write-ups, and a programme made from it records work against the same
 * references its template names.
 */
import type { PrismaClient } from '@/generated/prisma/client';

type Db = Pick<PrismaClient, 'profileActivity' | 'profileStep'>;

export async function copyActivities(prisma: Db, fromProfileId: string, toProfileId: string) {
  const rows = await prisma.profileActivity.findMany({
    where: { profileId: fromProfileId },
    orderBy: { order: 'asc' },
    include: { steps: { orderBy: { n: 'asc' } } },
  });
  if (!rows.length) return;

  await prisma.profileActivity.createMany({
    data: rows.map((a) => ({
      id: `${toProfileId}:act:${a.ref}`,
      profileId: toProfileId,
      stageKey: a.stageKey,
      ref: a.ref,
      order: a.order,
      title: a.title,
      windowFrom: a.windowFrom,
      windowTo: a.windowTo,
      baseRef: a.baseRef,
    })),
  });

  const steps = rows.flatMap((a) =>
    a.steps.map((s) => ({
      id: `${toProfileId}:act:${a.ref}:${s.n}`,
      activityId: `${toProfileId}:act:${a.ref}`,
      n: s.n,
      text: s.text,
      tat: s.tat,
      lane: s.lane,
    })),
  );
  if (steps.length) await prisma.profileStep.createMany({ data: steps });
}
