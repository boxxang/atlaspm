import 'server-only';
import { prisma } from './db';
import { sumEffortText } from './effort';
import { buildProjectState, type ProjectState } from './projectState';

const ATTACHMENT_META = { id: true, filename: true, mimeType: true, size: true } as const;
import type { ProfileId } from '@/data/scheduleProfiles';
import type { StageBaseline, StageId } from '@/data/types';

export async function getProjectState(projectId: string): Promise<ProjectState | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      overrides: true,
      leaders: true,
      /* metadata only — the bytes are streamed by /api/attachments/[id] */
      items: {
        include: {
          updates: { include: { attachments: { select: ATTACHMENT_META } } },
          attachments: { select: ATTACHMENT_META },
        },
      },
      deliverables: { orderBy: { position: 'asc' } },
      contacts: { orderBy: { position: 'asc' } },
      stageDetails: true,
    },
  });
  return project ? buildProjectState(project) : null;
}

/**
 * One row per program for the landing page.
 *
 * Everything here is clock-free on purpose: schedule dates, progress and open
 * risks are pure functions of stored data, so the cards server-render. The
 * values that need "today" (D-day, overdue, the in-flight stage) are derived on
 * the client from `openActivityDues` and the schedule — the viewer's timezone
 * decides those, not the server's.
 */
export interface ProjectSummary {
  id: string;
  name: string;
  kickoff: Date;
  profileId: ProfileId;
  createdAt: Date;
  costPerManMonth: number;
  currency: string;
  /** Summed across every stage's engineering lines. */
  manMonths: number;
  overrides: Partial<Record<StageId, StageBaseline>>;
  edited: boolean;
  deliverablesDone: number;
  deliverablesTotal: number;
  openRisks: number;
  items: number;
  /** Due dates of open, dated activities — the client counts the overdue ones. */
  openActivityDues: Date[];
}

export async function getProjectSummaries(): Promise<ProjectSummary[]> {
  const [projects, dlv, risks, items, dues] = await Promise.all([
    prisma.project.findMany({
      orderBy: { createdAt: 'asc' },
      include: { overrides: true, stageDetails: { select: { engineeringEffort: true } } },
    }),
    prisma.deliverable.groupBy({ by: ['projectId', 'done'], _count: true }),
    prisma.item.groupBy({ by: ['projectId'], where: { kind: 'risk' }, _count: true }),
    prisma.item.groupBy({ by: ['projectId'], _count: true }),
    prisma.item.findMany({
      where: { kind: 'activity', done: false, due: { not: null } },
      select: { projectId: true, due: true },
    }),
  ]);

  const sum = (rows: { projectId: string; _count: number }[], id: string) =>
    rows.filter((r) => r.projectId === id).reduce((n, r) => n + r._count, 0);

  return projects.map((p) => {
    const overrides: Partial<Record<StageId, StageBaseline>> = {};
    for (const o of p.overrides) {
      overrides[o.stageId as StageId] = {
        startOffsetWeeks: o.startOffsetWeeks,
        durationWeeks: o.durationWeeks,
      };
    }
    const mine = dlv.filter((d) => d.projectId === p.id);
    return {
      id: p.id,
      name: p.name,
      kickoff: p.kickoff,
      profileId: p.profileId as ProfileId,
      createdAt: p.createdAt,
      costPerManMonth: p.costPerManMonth,
      currency: p.currency,
      manMonths:
        Math.round(
          p.stageDetails.reduce((n, d) => n + sumEffortText(d.engineeringEffort), 0) * 10,
        ) / 10,
      overrides,
      edited: p.overrides.length > 0,
      deliverablesDone: mine.filter((d) => d.done).reduce((n, d) => n + d._count, 0),
      deliverablesTotal: mine.reduce((n, d) => n + d._count, 0),
      openRisks: sum(risks, p.id),
      items: sum(items, p.id),
      openActivityDues: dues.filter((d) => d.projectId === p.id).map((d) => d.due!),
    };
  });
}
