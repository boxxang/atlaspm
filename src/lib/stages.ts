/**
 * /lib/stages.ts — turning a stored profile into the stages the UI reads.
 *
 * A profile row carries structure (order, title, band, schedule baseline) and
 * points at the built-in stage whose text and drawing it shows. A stage someone
 * added points at nothing and starts blank, so every consumer downstream sees
 * the same shape and never asks which kind it is.
 *
 * Pure: no DOM, no state, no UI imports.
 */
import { journeyData } from '@/data/journey';
import { lifecyclePhases, phaseById } from '@/data/scheduleProfiles';
import type { JourneyStage, ProfileStageDef, ScheduleProfile, Stage } from '@/data/types';

export const BLANK_LEADER = { name: '', short: '', phone: '', email: '' };

/** Everything a stage shows before anyone has written a word of it. */
const BLANK: JourneyStage = {
  id: '',
  stage: 0,
  title: '',
  shortTitle: '',
  tagline: '',
  description: '',
  activities: [],
  deliverables: [],
  risks: [],
  potentialRisks: [],
  leader: BLANK_LEADER,
  collaboration: [],
  tools: [],
  engineeringView: [],
  engineeringTat: [],
  engineeringEffort: [],
  programView: [],
  perspective: '',
};

const builtin = (key: string | null) =>
  key ? journeyData.find((s) => s.id === key) : undefined;

/** The profile's stages, in order, each with the content it inherits. */
export function resolveStages(profile: ScheduleProfile): Stage[] {
  return [...profile.stages]
    .sort((a, b) => a.order - b.order)
    .map((row, i) => {
      const base = builtin(row.baseKey);
      return {
        ...(base ?? BLANK),
        id: row.key,
        /* the station number follows the profile, not the built-in content */
        stage: i + 1,
        title: row.title,
        shortTitle: row.shortTitle,
        phaseId: row.phaseId,
        baseline: {
          startOffsetWeeks: row.startOffsetWeeks,
          durationWeeks: row.durationWeeks,
        },
        vizKey: base ? base.id : null,
      };
    });
}

/** Back the resolved stages out into the rows a profile stores. */
export const toProfileStages = (stages: readonly Stage[]): ProfileStageDef[] =>
  stages.map((s, i) => ({
    key: s.id,
    order: i,
    title: s.title,
    shortTitle: s.shortTitle,
    phaseId: s.phaseId,
    baseKey: s.vizKey,
    startOffsetWeeks: s.baseline.startOffsetWeeks,
    durationWeeks: s.baseline.durationWeeks,
  }));

export interface Band {
  id: string;
  label: string;
  stages: string[];
}

/**
 * The roadmap's bands, in stage order. Consecutive stages sharing a phase form
 * one band, so a stage added inside Implement widens Implement rather than
 * opening a second band with the same name.
 */
export function stageBands(stages: readonly Stage[]): Band[] {
  const bands: Band[] = [];
  for (const s of stages) {
    const last = bands[bands.length - 1];
    if (last && last.id === s.phaseId) last.stages.push(s.id);
    else bands.push({ id: s.phaseId, label: phaseById(s.phaseId).label, stages: [s.id] });
  }
  return bands;
}

/** A blank stage to add to a profile, keyed so it can never collide. */
export function newStage(
  key: string,
  title: string,
  opts: { shortTitle?: string; phaseId?: string; startOffsetWeeks: number; durationWeeks: number },
): Stage {
  return {
    ...BLANK,
    id: key,
    stage: 0,
    title,
    shortTitle: opts.shortTitle?.trim() || defaultShortTitle(title),
    phaseId: opts.phaseId ?? lifecyclePhases[0].id,
    vizKey: null,
    baseline: {
      startOffsetWeeks: opts.startOffsetWeeks,
      durationWeeks: opts.durationWeeks,
    },
  };
}

/**
 * The y-axis legend is the short title, so a stage that arrives without one
 * gets initials: "Package Bring-up" → "PBU", "Trial" → "TRI".
 */
export function defaultShortTitle(title: string): string {
  const words = title.trim().split(/[\s-]+/).filter(Boolean);
  if (!words.length) return 'NEW';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .map((w) => w[0])
    .join('')
    .slice(0, 4)
    .toUpperCase();
}

/** "Typical SoC" → "Typical SoC (copy)", then "(copy 2)" … */
export function forkName(label: string, taken: readonly string[]): string {
  const base = `${label} (copy)`;
  if (!taken.includes(base)) return base;
  for (let n = 2; ; n++) {
    const next = `${label} (copy ${n})`;
    if (!taken.includes(next)) return next;
  }
}
