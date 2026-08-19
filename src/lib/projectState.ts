import { STAGE_ORDER, scheduleProfiles } from '@/data/scheduleProfiles';
import type {
  Contact,
  Deliverable,
  ItemKind,
  Leader,
  StageContent,
  StageId,
} from '@/data/types';
import type { StageOverrides } from '@/lib/schedule';

/** Everything the client store needs to boot, as one serialisable payload. */
export interface ProjectState {
  projectId: string;
  projectName: string;
  kickoff: Date;
  profileId: keyof typeof scheduleProfiles;
  overrides: StageOverrides;
  content: Record<StageId, StageContent>;
  deliverables: Record<StageId, Deliverable[]>;
  leaders: Record<StageId, Leader>;
  contacts: Record<StageId, Contact[]>;
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

export const emptyContent = (): Record<StageId, StageContent> => {
  const out = {} as Record<StageId, StageContent>;
  for (const id of STAGE_ORDER) out[id] = { keyinfo: [], activities: [], risks: [] };
  return out;
};

export const emptyLists = <T>(): Record<StageId, T[]> => {
  const out = {} as Record<StageId, T[]>;
  for (const id of STAGE_ORDER) out[id] = [];
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
  updates: { id: string; text: string; createdAt: Date }[];
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

const isStage = (id: string): id is StageId => (STAGE_ORDER as readonly string[]).includes(id);

/** Fold flat DB rows into the per-stage shape the store holds. */
export function buildProjectState(project: {
  id: string;
  name: string;
  kickoff: Date;
  profileId: string;
  overrides: OverrideRow[];
  items: ItemRow[];
  deliverables: DeliverableRow[];
  leaders: LeaderRow[];
  contacts: ContactRow[];
}): ProjectState {
  const content = emptyContent();
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
      updates: row.updates
        .map((u) => ({ id: u.id, text: u.text, date: u.createdAt }))
        .sort((a, b) => b.date.getTime() - a.date.getTime()),
    });
  }

  const deliverables = emptyLists<Deliverable>();
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

  const leaders = {} as Record<StageId, Leader>;
  for (const l of project.leaders) {
    if (!isStage(l.stageId)) continue;
    leaders[l.stageId] = { name: l.name, short: l.short, phone: l.phone, email: l.email };
  }

  const contacts = emptyLists<Contact>();
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

  return {
    projectId: project.id,
    projectName: project.name,
    kickoff: project.kickoff,
    profileId: (project.profileId in scheduleProfiles
      ? project.profileId
      : 'typicalSoC') as keyof typeof scheduleProfiles,
    overrides,
    content,
    deliverables,
    leaders,
    contacts,
  };
}
