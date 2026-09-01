import type {
  AttachmentRef,
  Contact,
  Deliverable,
  ItemKind,
  Leader,
  ScheduleProfile,
  StageContent,
  StageId,
} from '@/data/types';
import { inheritedActivities, type ActivityRow } from '@/lib/resolveActivities';
import { activitySteps } from '@/data/activitySteps';
import type { StageOverrides } from '@/lib/schedule';
import type { StageDetailOverride } from '@/lib/stageDetail';
import { stepKey, type StepStateRecord } from '@/lib/steps';

export type { StepStateRecord };

/** Everything the client store needs to boot, as one serialisable payload. */
export interface ProjectState {
  projectId: string;
  projectName: string;
  kickoff: Date;
  /** The program's profile, stages and all — which stages exist is a property
      of the program, not of the code. */
  profile: ScheduleProfile;
  /**
   * The activities this program runs, unresolved.
   *
   * Which activities exist is a property of the program too, now that a
   * template can be edited: two programs on two templates run different lists.
   * Resolved against the generated library by /lib/resolveActivities on the
   * way into the store, so every reader keeps the shape it already had.
   */
  activities: ActivityRow[];
  costPerManMonth: number;
  currency: string;
  overrides: StageOverrides;
  content: Record<StageId, StageContent>;
  deliverables: Record<StageId, Deliverable[]>;
  leaders: Record<StageId, Leader>;
  contacts: Record<StageId, Contact[]>;
  /** Per-program edits to the shared stage text, by stage. */
  stageDetails: Partial<Record<StageId, StageDetailOverride>>;
  /**
   * What has happened to each step, keyed the way steps are addressed —
   * `activityRef:stepN`. Only steps somebody has touched are in here; the rest
   * fall back to the plan in /data/activitySteps.ts.
   */
  stepStates: Record<string, StepStateRecord>;
  /**
   * The outputs handed over on each step, keyed the same way. Attaching one is
   * what completes a step, so these are evidence rather than decoration.
   */
  stepOutputs: Record<string, AttachmentRef[]>;
  /**
   * Every post that is not a V1 board item's: updates and risks on steps, notes
   * on a stage's key-info board, deliverable handovers, and the replies under
   * any of them. One list, because they are one shape.
   */
  posts: ProgramPost[];
}

/** A post, wherever it lands. Exactly one target is set; a reply sets parentId. */
export interface ProgramPost {
  id: string;
  /** update | risk | note | handover | reply */
  kind: string;
  text: string;
  author: string;
  createdAt: Date;
  editedAt: Date | null;
  activityRef: string | null;
  stepN: number | null;
  stageId: string | null;
  deliverableId: string | null;
  parentId: string | null;
  /** Set on a handover: the day the deliverable was accepted. */
  doneAt: Date | null;
  attachments: AttachmentRef[];
}

/**
 * CLAUDE.md spells the stored kinds singular (keyinfo|activity|risk); the UI
 * keys its content map with the plural board names. One pair of mappers keeps
 * that translation in a single place.
 */
export const DB_KIND: Record<ItemKind, string> = {
  keyinfo: 'keyinfo',
  activities: 'activity',
  risks: 'risk',
};

const UI_KIND: Record<string, ItemKind> = {
  keyinfo: 'keyinfo',
  activity: 'activities',
  risk: 'risks',
};

export const toUiKind = (kind: string): ItemKind | null => UI_KIND[kind] ?? null;

/* Both builders walk the stage list in order, so every map keyed by stage
   iterates chronologically without carrying the order alongside it. */
export const emptyContent = (
  stageIds: readonly StageId[],
): Record<StageId, StageContent> => {
  const out: Record<StageId, StageContent> = {};
  for (const id of stageIds) out[id] = { keyinfo: [], activities: [], risks: [] };
  return out;
};

export const emptyLists = <T>(stageIds: readonly StageId[]): Record<StageId, T[]> => {
  const out: Record<StageId, T[]> = {};
  for (const id of stageIds) out[id] = [];
  return out;
};

/* ---------- row shapes, structural so this module stays client-safe ---------- */

interface ProfileActivityRow {
  ref: string;
  stageKey: string;
  order: number;
  title: string;
  windowFrom: number;
  windowTo: number;
  baseRef: string | null;
  steps?: { n: number; text: string; tat: number; lane: string }[];
}

interface ItemRow {
  id: string;
  stageId: string;
  kind: string;
  title: string;
  body: string;
  owner: string;
  author?: string;
  activityRef?: string | null;
  stepN?: number | null;
  due: Date | null;
  done: boolean;
  updatedAt: Date;
  deliverableId?: string | null;
  posts: {
    id: string;
    text: string;
    author?: string;
    createdAt: Date;
    attachments?: AttachmentRow[];
  }[];
  attachments?: AttachmentRow[];
}
interface AttachmentRow {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}
interface DeliverableRow {
  id: string;
  stageId: string;
  title: string;
  due: Date | null;
  done: boolean;
  completedAt: Date | null;
  note: string;
  attachments?: AttachmentRow[];
}
interface LeaderRow {
  stageId: string;
  name: string;
  short: string;
  phone: string;
  email: string;
}
interface ContactRow {
  id: string;
  stageId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}
interface OverrideRow {
  stageId: string;
  startOffsetWeeks: number;
  durationWeeks: number;
}
interface StageDetailRow extends StageDetailOverride {
  stageId: string;
}
interface StepAttachmentRow extends AttachmentRow {
  activityRef: string | null;
  stepN: number | null;
}
interface ProgramPostRow {
  id: string;
  kind: string;
  text: string;
  author: string;
  createdAt: Date;
  editedAt: Date | null;
  activityRef: string | null;
  stepN: number | null;
  stageId: string | null;
  deliverableId: string | null;
  parentId: string | null;
  doneAt: Date | null;
  attachments?: AttachmentRow[];
}
interface StepStateRow {
  activityRef: string;
  stepN: number;
  done: boolean;
  doneAt: Date | null;
  pct: number;
  owner: string;
  dueOverride: Date | null;
}

interface ProfileStageRow {
  key: string;
  order: number;
  title: string;
  shortTitle: string;
  phaseId: string;
  baseKey: string | null;
  startOffsetWeeks: number;
  durationWeeks: number;
}

/** Fold flat DB rows into the per-stage shape the store holds. */
export function buildProjectState(project: {
  id: string;
  name: string;
  kickoff: Date;
  profileId: string;
  costPerManMonth: number;
  currency: string;
  profile: {
    id: string;
    name: string;
    builtin: boolean;
    template: boolean;
    stages: ProfileStageRow[];
    activities?: ProfileActivityRow[];
  };
  overrides: OverrideRow[];
  items: ItemRow[];
  deliverables: DeliverableRow[];
  leaders: LeaderRow[];
  contacts: ContactRow[];
  stageDetails: StageDetailRow[];
  stepStates: StepStateRow[];
  attachments: StepAttachmentRow[];
  posts: ProgramPostRow[];
}): ProjectState {
  const storedActivities: ActivityRow[] = (project.profile.activities ?? []).map((a) => ({
    ref: a.ref,
    stageKey: a.stageKey,
    order: a.order,
    title: a.title,
    windowFrom: a.windowFrom,
    windowTo: a.windowTo,
    baseRef: a.baseRef ?? null,
    steps: (a.steps ?? []).map((st) => ({
      n: st.n,
      text: st.text,
      tat: st.tat,
      lane: st.lane,
    })),
  }));

  /* A profile written before activities were stored has stages and nothing
     else. It falls back to what it was showing then rather than to nothing. */
  const activities = storedActivities.length
    ? storedActivities
    : inheritedActivities(
        project.profile.stages.map((st) => st.key),
        activitySteps,
      );

  const profile: ScheduleProfile = {
    id: project.profile.id,
    label: project.profile.name,
    builtin: project.profile.builtin,
    template: project.profile.template,
    stages: [...project.profile.stages].sort((a, b) => a.order - b.order),
  };
  /* Rows for a stage the profile no longer carries are ignored rather than
     crashing a page — a fork deletes them, but a database edited by hand
     should still render. */
  const stageIds = profile.stages.map((st) => st.key);
  const known = new Set(stageIds);
  const isStage = (id: string) => known.has(id);

  const content = emptyContent(stageIds);
  for (const row of project.items) {
    const kind = toUiKind(row.kind);
    if (!kind || !isStage(row.stageId)) continue;
    content[row.stageId][kind].push({
      id: row.id,
      title: row.title,
      body: row.body,
      owner: row.owner,
      author: row.author ?? '',
      activityRef: row.activityRef ?? null,
      stepN: row.stepN ?? null,
      due: row.due,
      done: row.done,
      deliverableId: row.deliverableId ?? null,
      /* DB column is updatedAt (CLAUDE.md); the UI type calls it updated */
      updated: row.updatedAt,
      attachments: row.attachments ?? [],
      /* the row calls them posts, because a post on an item is one of four things
         a post can be; the UI type still calls this list updates */
      updates: row.posts
        .map((u) => ({
          id: u.id,
          text: u.text,
          author: u.author ?? '',
          date: u.createdAt,
          attachments: u.attachments ?? [],
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime()),
    });
  }

  const deliverables = emptyLists<Deliverable>(stageIds);
  for (const d of project.deliverables) {
    if (!isStage(d.stageId)) continue;
    deliverables[d.stageId].push({
      id: d.id,
      title: d.title,
      due: d.due,
      done: d.done,
      completedAt: d.completedAt,
      note: d.note ?? '',
      attachments: d.attachments ?? [],
    });
  }

  const leaders: Record<StageId, Leader> = {};
  for (const l of project.leaders) {
    if (!isStage(l.stageId)) continue;
    leaders[l.stageId] = { name: l.name, short: l.short, phone: l.phone, email: l.email };
  }
  /* A new program has no leader rows until someone fills them in. */
  for (const id of stageIds) {
    leaders[id] ??= { name: '', short: '', phone: '', email: '' };
  }

  const contacts = emptyLists<Contact>(stageIds);
  for (const c of project.contacts) {
    if (!isStage(c.stageId)) continue;
    contacts[c.stageId].push({
      id: c.id,
      name: c.name,
      role: c.role,
      email: c.email,
      phone: c.phone,
    });
  }

  const overrides: StageOverrides = {};
  for (const o of project.overrides) {
    if (!isStage(o.stageId)) continue;
    overrides[o.stageId] = {
      startOffsetWeeks: o.startOffsetWeeks,
      durationWeeks: o.durationWeeks,
    };
  }

  /* Keyed by activity ref and step number, not by row id: steps are content,
     and the address has to be the one the write-ups use. */
  const stepStates: Record<string, StepStateRecord> = {};
  for (const st of project.stepStates) {
    stepStates[stepKey(st.activityRef, st.stepN)] = {
      done: st.done,
      doneAt: st.doneAt,
      pct: st.pct,
      owner: st.owner,
      dueOverride: st.dueOverride,
    };
  }

  const stepOutputs: Record<string, AttachmentRef[]> = {};
  for (const at of project.attachments) {
    if (!at.activityRef || at.stepN == null) continue;
    const key = stepKey(at.activityRef, at.stepN);
    (stepOutputs[key] ??= []).push({
      id: at.id,
      filename: at.filename,
      mimeType: at.mimeType,
      size: at.size,
    });
  }

  const posts: ProgramPost[] = project.posts.map((p) => ({
    id: p.id,
    kind: p.kind,
    text: p.text,
    author: p.author,
    createdAt: p.createdAt,
    editedAt: p.editedAt,
    activityRef: p.activityRef,
    stepN: p.stepN,
    stageId: p.stageId,
    deliverableId: p.deliverableId,
    parentId: p.parentId,
    doneAt: p.doneAt,
    attachments: p.attachments ?? [],
  }));

  const stageDetails: Partial<Record<StageId, StageDetailOverride>> = {};
  for (const d of project.stageDetails) {
    if (!isStage(d.stageId)) continue;
    stageDetails[d.stageId] = {
      description: d.description,
      engineeringView: d.engineeringView,
      engineeringEffort: d.engineeringEffort,
      engineeringTat: d.engineeringTat,
      programView: d.programView,
      tools: d.tools,
      collaboration: d.collaboration,
    };
  }

  return {
    activities,
    projectId: project.id,
    projectName: project.name,
    kickoff: project.kickoff,
    profile,
    costPerManMonth: project.costPerManMonth,
    currency: project.currency,
    overrides,
    content,
    deliverables,
    leaders,
    contacts,
    stageDetails,
    stepStates,
    stepOutputs,
    posts,
  };
}
