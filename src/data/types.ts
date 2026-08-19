/**
 * /data/types.ts — the content + schedule model, lifted from the prototype.
 * Pure types; nothing here may reach for the DOM.
 */

export type StageId =
  | 'productDefinition'
  | 'architecture'
  | 'rtl'
  | 'verification'
  | 'synthesis'
  | 'physicalDesign'
  | 'signoff'
  | 'tapeout'
  | 'fabrication'
  | 'packaging'
  | 'bringup'
  | 'qualification';

/** The immutable per-stage baseline held in a profile. */
export interface StageBaseline {
  startOffsetWeeks: number;
  durationWeeks: number;
}

export interface ScheduleProfile {
  id: string;
  label: string;
  stages: Record<StageId, StageBaseline>;
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
  stages: readonly StageId[];
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
  programView: readonly string[];
  perspective: string;
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
  done: boolean;
  due: Date | null;
  completedAt: Date | null;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}
