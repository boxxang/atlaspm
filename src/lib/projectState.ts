import type {
  Contact,
  Deliverable,
  ItemKind,
  Leader,
  ScheduleProfile,
  StageContent,
  StageId,
} from '@/data/types';
import type { StageOverrides } from '@/lib/schedule';
import type { StageDetailOverride } from '@/lib/stageDetail';

/** Everything the client store needs to boot, as one serialisable payload. */
export interface ProjectState {
  projectId: string;
  projectName: string;
  kickoff: Date;
  /** The program's profile, stages and all — which stages exist is a property
      of the program, not of the code. */
  profile: ScheduleProfile;
  costPerManMonth: number;
  currency: string;
  overrides: StageOverrides;
  content: Record<StageId, StageContent>;
  deliverables: Record<StageId, Deliverable[]>;
  leaders: Record<StageId, Leader>;
  contacts: Record<StageId, Contact[]>;
  /** Per-program edits to the shared stage text, by stage. */
  stageDetails: Partial<Record<StageId, StageDetailOverride>>;
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

interface ItemRow {
  id: string;
  stageId: string;
  kind: string;
  title: string;
  body: string;
  owner: string;
  due: Date | null;
  done: boolean;
  updatedAt: Date;
  updates: {
    id: string;
    text: string;
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
  };
  overrides: OverrideRow[];
  items: ItemRow[];
  deliverables: DeliverableRow[];
  leaders: LeaderRow[];
  contacts: ContactRow[];
  stageDetails: StageDetailRow[];
}): ProjectState {
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
      due: row.due,
      done: row.done,
      /* DB column is updatedAt (CLAUDE.md); the UI type calls it updated */
      updated: row.updatedAt,
      attachments: row.attachments ?? [],
      updates: row.updates
        .map((u) => ({
          id: u.id,
          text: u.text,
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

  const stageDetails: Partial<Record<StageId, StageDetailOverride>> = {};
  for (const d of project.stageDetails) {
    if (!isStage(d.stageId)) continue;
    stageDetails[d.stageId] = {
      description: d.description,
      engineeringView: d.engineeringView,
      engineeringEffort: d.engineeringEffort,
      programView: d.programView,
      tools: d.tools,
      collaboration: d.collaboration,
    };
  }

  return {
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
  };
}
