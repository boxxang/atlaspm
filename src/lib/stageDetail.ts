/**
 * /lib/stageDetail.ts — merging a program's edits over the shared stage text.
 *
 * Stage definitions live in /data/journey.ts and are the same for every
 * program. A program can override any field; an absent or empty override falls
 * back to the shared default, so "restore" is a delete rather than a re-copy.
 *
 * Pure: no DOM.
 */
import type { JourneyStage } from '@/data/types';
import { parseEffort, sumEffort } from './effort';

/** Newline-separated in the database, a list in the UI. */
export interface StageDetailOverride {
  description?: string | null;
  engineeringView?: string | null;
  /** Man-months per engineering line — kept even when the list is the default. */
  engineeringEffort?: string | null;
  programView?: string | null;
  tools?: string | null;
  collaboration?: string | null;
}

export interface ResolvedStageDetail {
  description: string;
  engineeringView: string[];
  /** Aligned to engineeringView, zero where nothing has been recorded. */
  engineeringEffort: number[];
  manMonths: number;
  programView: string[];
  tools: string[];
  collaboration: string[];
  /** Which *text* fields this program has edited — drives the "edited" marker. */
  overridden: Set<keyof StageDetailOverride>;
}

export const toLines = (text: string): string[] =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

export const fromLines = (lines: readonly string[]): string => lines.join('\n');

/** Blank input means "no override" — it clears rather than storing emptiness. */
const pick = (override: string | null | undefined) => {
  const v = override?.trim();
  return v ? v : null;
};

export function resolveStageDetail(
  stage: JourneyStage,
  override?: StageDetailOverride | null,
): ResolvedStageDetail {
  const overridden = new Set<keyof StageDetailOverride>();
  const text = (key: keyof StageDetailOverride, fallback: string) => {
    const v = pick(override?.[key]);
    if (v === null) return fallback;
    overridden.add(key);
    return v;
  };
  const list = (key: keyof StageDetailOverride, fallback: readonly string[]) => {
    const v = pick(override?.[key]);
    if (v === null) return [...fallback];
    overridden.add(key);
    return toLines(v);
  };

  /**
   * engineeringView is the one field with a third state. The pencil form treats
   * a blank as "restore the shared text", but the engineering board is a list
   * the program owns: emptying it means the stage has no engineering activities,
   * not that it should inherit five again. So null means "not overridden" and an
   * empty string means "deliberately empty".
   */
  const rawView = override?.engineeringView;
  const engineeringView =
    rawView === null || rawView === undefined ? [...stage.engineeringView] : toLines(rawView);
  if (rawView !== null && rawView !== undefined) overridden.add('engineeringView');
  /* Effort is data this program recorded, not a divergence from the shared
     stage text, so it deliberately does not count towards `overridden`. */
  const engineeringEffort = parseEffort(override?.engineeringEffort, engineeringView.length);

  return {
    description: text('description', stage.description),
    engineeringView,
    engineeringEffort,
    manMonths: sumEffort(engineeringEffort),
    programView: list('programView', stage.programView),
    tools: list('tools', stage.tools),
    collaboration: list('collaboration', stage.collaboration),
    overridden,
  };
}

/**
 * The form's values, normalised for storage.
 *
 * A field is only an override when it actually differs from the shared stage
 * text. The editor is seeded with the resolved values, so without this check
 * editing one field would freeze copies of all the others — the stage would
 * read as edited for ever and stop tracking the shared definition.
 * Blank clears the override too.
 */
export function normaliseOverride(
  input: {
    description: string;
    engineeringView: string;
    programView: string;
    tools: string;
    collaboration: string;
    /** Passed through: effort is edited in the table, not in this form. */
    engineeringEffort?: string | null;
  },
  stage: JourneyStage,
): StageDetailOverride {
  const differs = (value: string | null, fallback: string) =>
    value !== null && value !== fallback ? value : null;

  return {
    engineeringEffort: input.engineeringEffort ?? null,
    description: differs(pick(input.description), stage.description),
    engineeringView: differs(
      pick(fromLines(toLines(input.engineeringView))),
      fromLines(stage.engineeringView),
    ),
    programView: differs(
      pick(fromLines(toLines(input.programView))),
      fromLines(stage.programView),
    ),
    tools: differs(pick(fromLines(toLines(input.tools))), fromLines(stage.tools)),
    collaboration: differs(
      pick(fromLines(toLines(input.collaboration))),
      fromLines(stage.collaboration),
    ),
  };
}

/** True when nothing is overridden any more, so the row can be dropped. */
export const isEmptyOverride = (o: StageDetailOverride) =>
  !o.description &&
  /* '' is a real value here — see resolveStageDetail */
  o.engineeringView == null &&
  !o.engineeringEffort &&
  !o.programView &&
  !o.tools &&
  !o.collaboration;
