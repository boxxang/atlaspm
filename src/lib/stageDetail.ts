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
import { parseEffort, parseTat, sumEffort } from './effort';

/** Newline-separated in the database, a list in the UI. */
export interface StageDetailOverride {
  description?: string | null;
  engineeringView?: string | null;
  /** Man-months per engineering line — kept even when the list is the default. */
  engineeringEffort?: string | null;
  /** Elapsed weeks per engineering line, negative where the activity runs on. */
  engineeringTat?: string | null;
  programView?: string | null;
  tools?: string | null;
  collaboration?: string | null;
}

export interface ResolvedStageDetail {
  description: string;
  engineeringView: string[];
  /** Aligned to engineeringView, zero where nothing has been recorded. */
  engineeringEffort: number[];
  /** Aligned to engineeringView; negative marks a continuous activity. */
  engineeringTat: number[];
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

/**
 * A stage reads as the template describes it until the program records its own
 * figures; from then on the program's are the figures, zeros included. The
 * fallback is per stage rather than per line on purpose: a line the program
 * deliberately zeroed must stay zero, and line by line there is no telling that
 * from a line it never filled in.
 */
const numbers = (
  recorded: string | null | undefined,
  parsed: readonly number[],
  fallback: readonly number[],
  length: number,
): number[] =>
  recorded === null || recorded === undefined
    ? Array.from({ length }, (_, i) => fallback[i] ?? 0)
    : Array.from({ length }, (_, i) => parsed[i] ?? 0);

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
  const ownList = rawView !== null && rawView !== undefined;
  const engineeringView = ownList ? toLines(rawView) : [...stage.engineeringView];
  if (ownList) overridden.add('engineeringView');
  /* Effort and TAT are data this program recorded, not a divergence from the
     shared stage text, so they deliberately do not count towards `overridden`.
     With the default list they fall back to the template's own numbers; once
     the program owns the list the indices no longer line up with the template,
     so only what the program recorded counts. */
  const engineeringEffort = numbers(
    override?.engineeringEffort,
    parseEffort(override?.engineeringEffort, engineeringView.length),
    ownList ? [] : stage.engineeringEffort,
    engineeringView.length,
  );
  const engineeringTat = numbers(
    override?.engineeringTat,
    parseTat(override?.engineeringTat, engineeringView.length),
    ownList ? [] : stage.engineeringTat,
    engineeringView.length,
  );

  return {
    description: text('description', stage.description),
    engineeringView,
    engineeringEffort,
    engineeringTat,
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
    programView: string;
    tools: string;
    collaboration: string;
    /**
     * Passed through, not edited here: the engineering list and its
     * man-months are managed in their own table, which can be open while this
     * form is. Carrying a copy of them through this form is how an edit made
     * in the table gets overwritten by a stale snapshot of it.
     */
    engineeringView?: string | null;
    engineeringEffort?: string | null;
    engineeringTat?: string | null;
  },
  stage: JourneyStage,
): StageDetailOverride {
  const differs = (value: string | null, fallback: string) =>
    value !== null && value !== fallback ? value : null;

  return {
    engineeringEffort: input.engineeringEffort ?? null,
    engineeringTat: input.engineeringTat ?? null,
    engineeringView: input.engineeringView ?? null,
    description: differs(pick(input.description), stage.description),
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
  !o.engineeringTat &&
  !o.programView &&
  !o.tools &&
  !o.collaboration;
