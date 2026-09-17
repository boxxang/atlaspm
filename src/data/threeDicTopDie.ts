/**
 * /data/threeDicTopDie.ts — the top die of a 3DIC program, derived.
 *
 * A stack is two chips. The SoC stages that are done once per chip —
 * synthesis, physical design, signoff, DFT, tapeout, fabrication and test
 * development — are the bottom die, unchanged, and this module derives the top
 * die's counterparts from them: the same activities and steps, the references
 * moved onto the top die's prefixes, and the effort at the share a smaller top
 * die takes. Derived rather than authored so the two dies cannot drift apart
 * by accident, and so the generated SoC modules stay untouched.
 */
import { activitySteps, type ActivityStepEntry } from './activitySteps';
import { detailActivityTitles } from './activityIndex';
import { journeyData } from './journey';
import type { JourneyStage } from './types';

/** The top die's effort against the bottom die's. */
export const TOP_DIE_SHARE = 0.9;

export const TOP_DIE_SPLIT = [
  { base: 'synthesis', key: 'synthesisTop', from: 'SYN', to: 'SYNT' },
  { base: 'physicalDesign', key: 'physicalDesignTop', from: 'PD', to: 'PDT' },
  { base: 'signoff', key: 'signoffTop', from: 'SO', to: 'SOT' },
  { base: 'dft', key: 'dftTop', from: 'DFT', to: 'DFTT' },
  { base: 'tapeout', key: 'tapeoutTop', from: 'TO', to: 'TOT' },
  { base: 'fabrication', key: 'fabricationTop', from: 'FAB', to: 'FABT' },
  { base: 'testDevelopment', key: 'testDevelopmentTop', from: 'TEST', to: 'TESTT' },
] as const;

const UP: Record<string, string> = Object.fromEntries(TOP_DIE_SPLIT.map((s) => [s.from, s.to]));
const DOWN: Record<string, string> = Object.fromEntries(TOP_DIE_SPLIT.map((s) => [s.to, s.from]));

/* An activity (PD-06) or a deliverable (PD-D3) of a split stage, and nothing
   that merely starts with the same letters: PDK-02 and ISO-26262 are left. */
const SPLIT_REF = /\b(SYN|PD|SO|DFT|TO|FAB|TEST)-(D?\d{1,2})\b/g;

/** Every reference to a split stage, moved onto the top die. */
export const toTopRef = (text: string): string =>
  text.replace(SPLIT_REF, (_, prefix: string, n: string) => `${UP[prefix]}-${n}`);

/** The SoC activity a top-die one is derived from: PDT-06 → PD-06. */
export const baseRefOf = (topRef: string): string =>
  topRef.replace(/^([A-Z]+)-/, (m, prefix: string) => (DOWN[prefix] ? `${DOWN[prefix]}-` : m));

const topTitle = (title: string) => `${title} (Top Die)`;

export const TOP_DIE_ACTIVITIES: Record<string, ActivityStepEntry> = Object.fromEntries(
  TOP_DIE_SPLIT.flatMap(({ base, key }) =>
    Object.entries(activitySteps)
      .filter(([, a]) => a.st === base)
      .map(([ref, a]): [string, ActivityStepEntry] => [
        toTopRef(ref),
        { ...a, st: key, r: a.r.map(([d, rel]) => [toTopRef(d), rel]) },
      ]),
  ),
);

export const TOP_DIE_ACTIVITY_TITLES: Record<string, string> = Object.fromEntries(
  Object.keys(TOP_DIE_ACTIVITIES).map((ref) => [ref, topTitle(detailActivityTitles[baseRefOf(ref)])]),
);

export const TOP_DIE_STAGES: readonly JourneyStage[] = TOP_DIE_SPLIT.map(({ base, key, to }) => {
  const s = journeyData.find((j) => j.id === base)!;
  return {
    ...s,
    id: key,
    shortTitle: to,
    title: `${s.title} — Top Die`,
    description: `For the top die: ${s.description}`,
    /* A title the bottom die's row does not share, or the tag matcher cannot
       tell PD-D3 from PDT-D3. */
    deliverables: s.deliverables.map((d) => `${d} — top die`),
    engineeringView: s.engineeringView.map(topTitle),
    engineeringEffort: s.engineeringEffort.map((mm) => mm * TOP_DIE_SHARE),
  };
});

export const TOP_DIE_DELIVERABLES: Record<string, string> = Object.fromEntries(
  TOP_DIE_STAGES.flatMap((s) => s.deliverables.map((title, i) => [`${s.shortTitle}-D${i + 1}`, title])),
);
