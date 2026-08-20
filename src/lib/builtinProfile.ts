/**
 * /lib/builtinProfile.ts — writing the code-defined profile into the database.
 *
 * The built-in profile is immutable content, like the stage text: the seed and
 * the app both call this, so a database is never without a profile to create a
 * program on. Takes the client rather than importing it, so `prisma db seed`
 * (a plain script) and the server can share one implementation.
 */
import { BUILTIN_PROFILE } from '@/data/scheduleProfiles';
import type { PrismaClient } from '@/generated/prisma/client';

export const BUILTIN_PROFILE_ID = BUILTIN_PROFILE.id;

/** Upsert the built-in profile and bring its stages back in line with the code. */
export async function ensureBuiltinProfile(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.profile.findUnique({
    where: { id: BUILTIN_PROFILE.id },
    include: { stages: true },
  });
  /* The common case by far: it is already there and already matches. Reading
     first keeps every page render off the write path — and two renders racing
     to write the same rows is exactly how the unique constraint below trips. */
  if (existing && matches(existing)) return;

  try {
    await prisma.profile.upsert({
      where: { id: BUILTIN_PROFILE.id },
      create: { id: BUILTIN_PROFILE.id, name: BUILTIN_PROFILE.label, builtin: true },
      update: { name: BUILTIN_PROFILE.label, builtin: true },
    });
    /* Code is the source of truth for this one profile, so its rows are
       written to match rather than merged — nothing else edits them. */
    for (const st of BUILTIN_PROFILE.stages) {
      const row = {
        order: st.order,
        title: st.title,
        shortTitle: st.shortTitle,
        phaseId: st.phaseId,
        baseKey: st.baseKey,
        startOffsetWeeks: st.startOffsetWeeks,
        durationWeeks: st.durationWeeks,
      };
      await prisma.profileStage.upsert({
        where: { profileId_key: { profileId: BUILTIN_PROFILE.id, key: st.key } },
        create: {
          id: `${BUILTIN_PROFILE.id}:${st.key}`,
          profileId: BUILTIN_PROFILE.id,
          key: st.key,
          ...row,
        },
        update: row,
      });
    }
    await prisma.profileStage.deleteMany({
      where: {
        profileId: BUILTIN_PROFILE.id,
        key: { notIn: BUILTIN_PROFILE.stages.map((st) => st.key) },
      },
    });
  } catch (e) {
    /* Another request wrote the same rows first — its version is this version. */
    if (!isUniqueViolation(e)) throw e;
  }
}

interface StoredStage {
  key: string;
  order: number;
  title: string;
  shortTitle: string;
  phaseId: string;
  baseKey: string | null;
  startOffsetWeeks: number;
  durationWeeks: number;
}

function matches(stored: { name: string; builtin: boolean; stages: StoredStage[] }): boolean {
  if (stored.name !== BUILTIN_PROFILE.label || !stored.builtin) return false;
  if (stored.stages.length !== BUILTIN_PROFILE.stages.length) return false;
  return BUILTIN_PROFILE.stages.every((st) => {
    const row = stored.stages.find((r) => r.key === st.key);
    return (
      row &&
      row.order === st.order &&
      row.title === st.title &&
      row.shortTitle === st.shortTitle &&
      row.phaseId === st.phaseId &&
      row.baseKey === st.baseKey &&
      row.startOffsetWeeks === st.startOffsetWeeks &&
      row.durationWeeks === st.durationWeeks
    );
  });
}

const isUniqueViolation = (e: unknown) =>
  typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002';
