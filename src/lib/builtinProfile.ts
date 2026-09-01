/**
 * /lib/builtinProfile.ts — writing the code-defined profile into the database.
 *
 * The built-in profile is immutable content, like the stage text: the seed and
 * the app both call this, so a database is never without a profile to create a
 * program on. Takes the client rather than importing it, so `prisma db seed`
 * (a plain script) and the server can share one implementation.
 */
import { activitySteps } from '@/data/activitySteps';
import { detailActivityTitles } from '@/data/activityIndex';
import { BUILTIN_PROFILE } from '@/data/scheduleProfiles';
import type { PrismaClient } from '@/generated/prisma/client';

/** Every built-in activity, as the rows a profile carries. */
const builtinActivities = Object.entries(activitySteps).map(([ref, a], order) => ({
  ref,
  stageKey: a.st,
  order,
  title: detailActivityTitles[ref] ?? ref,
  windowFrom: a.w[0],
  windowTo: a.w[1],
  /* Inherited: the row carries the list and the schedule, and the steps and
     write-up stay in the generated modules the browser already holds. Seeding
     them is what lets a copy of this template be edited without first moving a
     megabyte of authored prose into the database. */
  baseRef: ref,
}));

export const BUILTIN_PROFILE_ID = BUILTIN_PROFILE.id;

/** Upsert the built-in profile and bring its stages back in line with the code. */
export async function ensureBuiltinProfile(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.profile.findUnique({
    where: { id: BUILTIN_PROFILE.id },
    include: { stages: true, _count: { select: { activities: true } } },
  });
  /* The common case by far: it is already there and already matches. Reading
     first keeps every page render off the write path — and two renders racing
     to write the same rows is exactly how the unique constraint below trips. */
  if (existing && matches(existing)) return;

  try {
    await prisma.profile.upsert({
      where: { id: BUILTIN_PROFILE.id },
      create: {
        id: BUILTIN_PROFILE.id,
        name: BUILTIN_PROFILE.label,
        builtin: true,
        template: true,
      },
      update: { name: BUILTIN_PROFILE.label, builtin: true, template: true },
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
    /* Same rule as the stages: code is the source of truth for this one
       profile, so the rows are written to match rather than merged. */
    await prisma.profileActivity.deleteMany({ where: { profileId: BUILTIN_PROFILE.id } });
    await prisma.profileActivity.createMany({
      data: builtinActivities.map((a) => ({
        id: `${BUILTIN_PROFILE.id}:act:${a.ref}`,
        profileId: BUILTIN_PROFILE.id,
        ...a,
      })),
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

function matches(stored: {
  name: string;
  builtin: boolean;
  template: boolean;
  stages: StoredStage[];
  _count: { activities: number };
}): boolean {
  if (stored.name !== BUILTIN_PROFILE.label || !stored.builtin || !stored.template) return false;
  if (stored.stages.length !== BUILTIN_PROFILE.stages.length) return false;
  /* Counted rather than compared row by row: 259 activities on every page
     render is the wrong place to be thorough, and the only thing that writes
     them is this function. */
  if (stored._count.activities !== builtinActivities.length) return false;
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
