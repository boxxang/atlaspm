/**
 * The shape of a written-up activity.
 *
 * Its own module because /data/activityDetails.ts is a megabyte of prose the
 * browser must never be handed, while the page that renders one write-up needs
 * to name its type. A type import costs nothing at runtime; importing it from
 * the data module would still tie the two together in a reader's mind.
 */
/** One step inside an activity. `par` runs alongside the main step before it. */
export interface DetailStep {
  n: number;
  text: string;
  tat: number;
  lane: 'main' | 'par';
}

/**
 * A deliverable this activity stands in some relation to. `produces` means the
 * activity owns it; the rest mean it contributes to one somebody else owns.
 */
export interface DetailRelation {
  id: string;
  rel: 'produces' | 'feeds' | 'informs' | 'gates';
  /** Sentence explaining the relationship. Carries inline <b> markup. */
  text: string;
}

export interface DetailRole {
  /** Role name. The first owns the activity, the last approves it. */
  r: string;
  d: string;
}

/** How the activity's man-months divide, as [label, man-months]. */
export type DetailEffort = [string, number];

export interface DetailLinks {
  dependsOn: string[];
  feedsInto: string[];
  runsWith: string[];
  revisedBy: string[];
  feedsBackInto: string[];
}

export interface ActivityDetail {
  stage: string;
  /** [from, to] in weeks from the stage start. */
  window: [number, number];
  criticalPath: boolean;
  /** Lead paragraphs. Carry inline <b> markup. */
  purpose: string[];
  steps: DetailStep[];
  flowNote: string;
  consumes: string[];
  produces: string[];
  /** Index-aligned to `produces`: the step number that yields each output. */
  producedBy: number[];
  rel: DetailRelation[];
  /** Carry inline <b> markup: the bold half is the headline. */
  risks: string[];
  roles: DetailRole[];
  effort: DetailEffort[];
  entry: string[];
  exit: string[];
  dependsOn: string[];
  /** Present only where there is something to say about the dependencies. */
  dependsNote: string | null;
  feedsInto: string[];
  measuredBy: string[];
  links: DetailLinks;
  terms: string[];
}
