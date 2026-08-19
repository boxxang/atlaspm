/**
 * /lib/scheduleCalculator.ts — schedule math and the one date formatter set.
 * Pure: no DOM, no state, no UI imports. Ported 1:1 from the prototype.
 */
import { STAGE_ORDER, milestoneDefs } from '@/data/scheduleProfiles';
import type {
  MilestoneDef,
  ScheduleProfile,
  StageBaseline,
  StageId,
} from '@/data/types';

export const DAY = 864e5;

export function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + Math.round(weeks * 7));
  return d;
}

/* single date format everywhere: MM/DD/YYYY */
const p2 = (n: number) => String(n).padStart(2, '0');
export const fmtDate = (d: Date) =>
  `${p2(d.getMonth() + 1)}/${p2(d.getDate())}/${d.getFullYear()}`;
export const fmtDateShort = fmtDate;
export const toISO = (d: Date) =>
  `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
/** Weeks, one decimal at most: 16 → "16W", 20.04 → "20W", 4.5 → "4.5W". */
export const fmtW = (w: number) => {
  const r = Math.round(w * 10) / 10;
  return (Number.isInteger(r) ? r : r.toFixed(1)) + 'W';
};
export const fmtTime = (d: Date) => `${p2(d.getHours())}:${p2(d.getMinutes())}`;
export const fmtDT = (d: Date) => `${fmtDateShort(d)} · ${fmtTime(d)}`;
export const fmtDTFull = (d: Date) => `${fmtDate(d)} · ${fmtTime(d)}`;

/** Parse the toolbar's yyyy-mm-dd into a local-midnight Date. */
export const fromISO = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Local midnight — every schedule date is anchored to it. */
export const startOfDay = (d: Date = new Date()): Date => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

/* ============================================================
   Schedule
   ============================================================ */

/** StageOverride: the only schedule mutation surface. */
export type StageOverrides = Partial<Record<StageId, StageBaseline>>;
/** Every stage present — what applyDateEdit() and the DB both hold. */
export type FullOverrides = Record<StageId, StageBaseline>;

export interface StageSchedule extends StageBaseline {
  start: Date;
  end: Date;
}

export interface Milestone extends MilestoneDef {
  /** Weeks from kickoff — the roadmap positions off this. */
  week: number;
  date: Date;
}

export interface Schedule {
  stages: Record<StageId, StageSchedule>;
  totalWeeks: number;
  milestones: Milestone[];
  tapeout: Date;
  firstSilicon: Date;
  production: Date;
}

export function computeSchedule(
  kickoff: Date,
  profile: ScheduleProfile,
  overrides: StageOverrides = {},
): Schedule {
  const stages = {} as Record<StageId, StageSchedule>;
  let totalWeeks = 0;
  for (const id of STAGE_ORDER) {
    const p = { ...profile.stages[id], ...(overrides[id] || {}) };
    const start = addWeeks(kickoff, p.startOffsetWeeks);
    const end = addWeeks(start, p.durationWeeks);
    stages[id] = { ...p, start, end };
    totalWeeks = Math.max(totalWeeks, p.startOffsetWeeks + p.durationWeeks);
  }
  const milestones = milestoneDefs.map((m) => {
    const s = stages[m.anchor.stage];
    const week =
      m.anchor.at === 'end' ? s.startOffsetWeeks + s.durationWeeks : s.startOffsetWeeks;
    return { ...m, week, date: m.anchor.at === 'end' ? s.end : s.start };
  });
  return {
    stages,
    totalWeeks,
    milestones,
    tapeout: stages.tapeout.end,
    firstSilicon: stages.fabrication.end,
    production: stages.qualification.end,
  };
}

/** Fold the profile baseline into overrides so every stage carries a value. */
export function materializeOverrides(
  profile: ScheduleProfile,
  overrides: StageOverrides = {},
): FullOverrides {
  const out = {} as FullOverrides;
  for (const id of STAGE_ORDER) {
    const eff = { ...profile.stages[id], ...(overrides[id] || {}) };
    out[id] = {
      startOffsetWeeks: eff.startOffsetWeeks,
      durationWeeks: eff.durationWeeks,
    };
  }
  return out;
}

/**
 * Drag a stage's start or end to a new date and ripple downstream.
 *  - start edit: shifts this stage and every later stage by the same delta.
 *  - end edit:   changes this stage's duration and shifts every later stage.
 * Deltas are fractional weeks, so day-level edits survive (addWeeks rounds to
 * whole days). Returns a new full override map; the caller owns the state.
 */
export function applyDateEdit(
  profile: ScheduleProfile,
  overrides: StageOverrides,
  schedule: Schedule,
  stageId: StageId,
  which: 'start' | 'end',
  newDate: Date,
): FullOverrides {
  const idx = STAGE_ORDER.indexOf(stageId);
  const cur = schedule.stages[stageId];
  const next = materializeOverrides(profile, overrides);
  if (which === 'start') {
    const dw = (newDate.getTime() - cur.start.getTime()) / (7 * DAY);
    for (let i = idx; i < STAGE_ORDER.length; i++)
      next[STAGE_ORDER[i]].startOffsetWeeks += dw;
  } else {
    const dw = (newDate.getTime() - cur.end.getTime()) / (7 * DAY);
    const o = next[stageId];
    /* a stage can never shrink below a single day */
    o.durationWeeks = Math.max(1 / 7, o.durationWeeks + dw);
    for (let i = idx + 1; i < STAGE_ORDER.length; i++)
      next[STAGE_ORDER[i]].startOffsetWeeks += dw;
  }
  return next;
}

/** Reset to baseline: drop every override. */
export const resetOverrides = (): StageOverrides => ({});

/** True once any stage deviates from its profile baseline (drives EDITED). */
export function hasOverrides(
  profile: ScheduleProfile,
  overrides: StageOverrides,
): boolean {
  return STAGE_ORDER.some((id) => {
    const o = overrides[id];
    if (!o) return false;
    const b = profile.stages[id];
    return (
      o.startOffsetWeeks !== b.startOffsetWeeks || o.durationWeeks !== b.durationWeeks
    );
  });
}
