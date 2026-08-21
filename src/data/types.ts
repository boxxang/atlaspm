/**
 * /data/types.ts — the content + schedule model, lifted from the prototype.
 * Pure types; nothing here may reach for the DOM.
 */

/**
 * A stage's key. The twelve built-in stages keep the prototype's names
 * ('rtl', 'signoff', …); stages added to a profile mint their own. Profiles are
 * rows now, so this cannot be a union — which stages exist is a question about
 * the program's profile, not about the code.
 */
export type StageId = string;

/** The per-stage baseline held in a profile. */
export interface StageBaseline {
  startOffsetWeeks: number;
  durationWeeks: number;
}

/** One stage of a profile, as stored. */
export interface ProfileStageDef extends StageBaseline {
  key: StageId;
  /** Position on the chart's y-axis, and the order the ripple walks. */
  order: number;
  title: string;
  shortTitle: string;
  /** Which lifecycle band the stage sits under. */
  phaseId: string;
  /**
   * The built-in stage whose text and drawing this one shows; null for a stage
   * someone added, which starts blank and is filled in per program.
   */
  baseKey: string | null;
}

/** A schedule profile: an ordered list of stages, shared by the programs on it. */
export interface ScheduleProfile {
  id: string;
  label: string;
  /** Built-in profiles are immutable — editing one copies it first. */
  builtin: boolean;
  /** Listed in the pickers as something to start from; private copies are not. */
  template: boolean;
  /** Ordered by `order`. */
  stages: readonly ProfileStageDef[];
}

/** A profile as the pickers list it — no stages, just what to show. */
export interface ProfileSummary {
  id: string;
  label: string;
  builtin: boolean;
  stageCount: number;
  /** Programs on it: a profile used once can be edited without forking. */
  projectCount: number;
}

export interface MilestoneDef {
  id: string;
  label: string;
  anchor: { stage: StageId; at: 'start' | 'end' };
  major?: boolean;
}

export interface LifecyclePhase {
  id: string;
  label: string;
}

export interface Leader {
  name: string;
  short: string;
  phone: string;
  email: string;
}

export interface JourneyStage {
  id: StageId;
  /** 1-based station number on the roadmap. */
  stage: number;
  title: string;
  shortTitle: string;
  /** Stations drawn as a moment rather than a span (tapeout, fab, MP). */
  moment?: boolean;
  tagline: string;
  description: string;
  activities: readonly string[];
  deliverables: readonly string[];
  risks: readonly string[];
  /** PM must-check library — adoptable into the risks board. */
  potentialRisks: readonly string[];
  leader: Leader;
  collaboration: readonly string[];
  tools: readonly string[];
  engineeringView: readonly string[];
  /**
   * Elapsed weeks per engineering activity, index-aligned to engineeringView.
   * Negative marks an activity that runs continuously across the stage rather
   * than closing once — the magnitude is still its span.
   */
  engineeringTat: readonly number[];
  /** Man-months per engineering activity, index-aligned to engineeringView. */
  engineeringEffort: readonly number[];
  programView: readonly string[];
  perspective: string;
}

/**
 * A stage as the app reads it: the profile's row for it, plus the text and
 * drawing it inherits from the built-in content. A stage someone added carries
 * the same shape with the text blank, so nothing downstream has to ask which
 * kind it is.
 */
export interface Stage extends JourneyStage {
  phaseId: string;
  baseline: StageBaseline;
  /** Which drawing to show, if any — an added stage has none. */
  vizKey: string | null;
}

/* ---------- user content ---------- */

export type ItemKind = 'keyinfo' | 'activities' | 'risks';

export interface AttachmentRef {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface StatusUpdate {
  id: string;
  text: string;
  date: Date;
  attachments: AttachmentRef[];
}

export interface Item {
  id: string;
  title: string;
  /** The key deliverable this is work towards — activities only. */
  deliverableId?: string | null;
  body: string;
  owner: string;
  due: Date | null;
  done: boolean;
  /** Newest update's date, else the stage end (done) or a recent stamp. */
  updated: Date;
  /** Newest first. */
  updates: StatusUpdate[];
  attachments: AttachmentRef[];
}

export type StageContent = Record<ItemKind, Item[]>;

export interface Deliverable {
  id: string;
  title: string;
  /**
   * Complete because the artefact is here, not because someone said so: this
   * follows `attachments` once a delivery record has been filed against it.
   */
  done: boolean;
  due: Date | null;
  completedAt: Date | null;
  /** The delivery record's development history. Empty until one is filed. */
  note: string;
  /** The artefact itself — what makes the deliverable delivered. */
  attachments: AttachmentRef[];
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}
