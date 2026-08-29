import 'server-only';
import { ensureBuiltinProfile } from './builtinProfile';
import { prisma } from './db';
import { buildProjectState, type ProjectState } from './projectState';
import { resolveStageDetail } from './stageDetail';
import { resolveStages } from './stages';

const ATTACHMENT_META = { id: true, filename: true, mimeType: true, size: true } as const;
import type {
  ProfileStageDef,
  ProfileSummary,
  ScheduleProfile,
  StageBaseline,
  StageId,
} from '@/data/types';

export async function getProjectState(projectId: string): Promise<ProjectState | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      profile: { include: { stages: { orderBy: { order: 'asc' } } } },
      overrides: true,
      leaders: true,
      /* metadata only — the bytes are streamed by /api/attachments/[id] */
      items: {
        include: {
          /* posts on a board item — what V1 called status updates */
          posts: { include: { attachments: { select: ATTACHMENT_META } } },
          attachments: { select: ATTACHMENT_META },
        },
      },
      deliverables: {
        orderBy: { position: 'asc' },
        include: { attachments: { select: ATTACHMENT_META } },
      },
      contacts: { orderBy: { position: 'asc' } },
      stageDetails: true,
      stepStates: true,
      /* posts that hang off a step rather than a board item — updates and the
         ones flagged as risks */
      posts: {
        where: { activityRef: { not: null } },
        include: { attachments: { select: ATTACHMENT_META } },
        orderBy: { createdAt: 'desc' },
      },
      /* outputs handed over on a step; the other three kinds arrive nested
         under the row they belong to */
      attachments: {
        where: { activityRef: { not: null } },
        select: { ...ATTACHMENT_META, activityRef: true, stepN: true },
        orderBy: { createdAt: 'asc' },
      },
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
  /** The program's own profile — cards need its stages to place today. */
  profile: ScheduleProfile;
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
      include: {
        profile: { include: { stages: { orderBy: { order: 'asc' } } } },
        overrides: true,
        stageDetails: {
          select: { stageId: true, engineeringView: true, engineeringEffort: true },
        },
      },
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
      profile: {
        id: p.profile.id,
        label: p.profile.name,
        builtin: p.profile.builtin,
        template: p.profile.template,
        stages: p.profile.stages,
      },
      createdAt: p.createdAt,
      costPerManMonth: p.costPerManMonth,
      currency: p.currency,
      /* The same arithmetic the stage sheet does: a line the program has not
         costed still carries the template's own figure, so the card and the
         dashboard agree on what the program takes. */
      manMonths: programManMonths(p.profile, p.stageDetails),
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

/** What a program takes in man-months, template figures included. */
function programManMonths(
  profile: { stages: readonly ProfileStageDef[] },
  details: { stageId: string; engineeringView: string | null; engineeringEffort: string | null }[],
): number {
  const stages = resolveStages({
    id: '',
    label: '',
    builtin: false,
    template: false,
    stages: profile.stages,
  });
  const total = stages.reduce((n, stage) => {
    const detail = details.find((d) => d.stageId === stage.id);
    return n + resolveStageDetail(stage, detail ?? null).manMonths;
  }, 0);
  return Math.round(total * 10) / 10;
}

/** Every profile a program can run on, oldest first, built-in leading. */
export async function listProfiles(): Promise<ProfileSummary[]> {
  /* A database that has never been seeded still has to offer a profile to
     create a program on. */
  await ensureBuiltinProfile(prisma);
  const rows = await prisma.profile.findMany({
    /* Templates only: a profile a program made for itself is that program's
       stage list, not something to start another program from. */
    where: { template: true },
    orderBy: [{ builtin: 'desc' }, { createdAt: 'asc' }],
    include: { _count: { select: { stages: true, projects: true } } },
  });
  return rows.map((p) => ({
    id: p.id,
    label: p.name,
    builtin: p.builtin,
    stageCount: p._count.stages,
    projectCount: p._count.projects,
  }));
}
