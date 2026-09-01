import 'server-only';
import { ensureBuiltinProfile } from './builtinProfile';
import { prisma } from './db';
import { buildProjectState, type ProjectState } from './projectState';
import { resolveStageDetail } from './stageDetail';
import { resolveStages } from './stages';
import { activitySteps } from '@/data/activitySteps';
import { resolveActivities, type ActivityRow } from './resolveActivities';
import { computeSchedule } from './schedule';
import { fromStepIndex, plannedSteps } from './steps';

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
      profile: {
        include: {
          stages: { orderBy: { order: 'asc' } },
          /* The program's own activities: which ones exist is a property of
             the program now that a template can be edited. */
          activities: {
            orderBy: { order: 'asc' },
            include: { steps: { orderBy: { n: 'asc' } } },
          },
        },
      },
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
      /* every post that is not a V1 board item's: step updates and risks, stage
         notes, deliverable handovers, and the replies under them */
      posts: {
        where: { itemId: null },
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
  /**
   * Risks flagged on steps and still open — the same thing the shell counts.
   * A risk on a step that has been handed over has been answered, so the query
   * excludes those rather than counting every risk ever raised.
   */
  openRisks: number;
  /** Of those, the ones nobody has said anything about in a week. */
  staleRisks: number;
  /**
   * Stages carrying an open risk. The card's schedule strip draws them red, the
   * same as every other chart in the app — which needs the stage, not the count.
   */
  riskyStages: string[];
  items: number;
  /**
   * Every step the program has finished, as `activityRef:stepN`. The card needs
   * it to count what is late, and lateness needs the viewer's clock — so the
   * count happens on the client and this is the input.
   */
  doneSteps: string[];
  /**
   * When each still-open step is due, as epoch milliseconds, sorted.
   *
   * The card counts how many of these are behind the viewer's own clock. It
   * used to enumerate every activity in the browser to work that out, which
   * stopped being possible once each program ran its own list — and computing
   * the count here instead would have moved "today" to the server, which is
   * exactly what the app refuses to do: an overdue count belongs to the
   * timezone of whoever is looking at it.
   */
  openStepEnds: number[];
}

/* Which stage runs which activity — a property of the generated write-ups, not
   of any one program, so it is built once. */
const stageOfActivity: Record<string, string> = {};
for (const [ref, a] of Object.entries(activitySteps)) stageOfActivity[ref] = a.st;

export async function getProjectSummaries(): Promise<ProjectSummary[]> {
  const [projects, dlv, risks, items, doneSteps] = await Promise.all([
    prisma.project.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        profile: {
        include: {
          stages: { orderBy: { order: 'asc' } },
          /* The program's own activities: which ones exist is a property of
             the program now that a template can be edited. */
          activities: {
            orderBy: { order: 'asc' },
            include: { steps: { orderBy: { n: 'asc' } } },
          },
        },
      },
        overrides: true,
        stageDetails: {
          select: { stageId: true, engineeringView: true, engineeringEffort: true },
        },
      },
    }),
    prisma.deliverable.groupBy({ by: ['projectId', 'done'], _count: true }),
    /* Risks are posts on steps now. The ones whose step is done are answered,
       which is a join the client already knows how to do — so both halves come
       back and the filtering happens where the rule lives. */
    prisma.post.findMany({
      where: { kind: 'risk', activityRef: { not: null } },
      select: {
        projectId: true,
        activityRef: true,
        stepN: true,
        createdAt: true,
        editedAt: true,
      },
    }),
    prisma.item.groupBy({ by: ['projectId'], _count: true }),
    prisma.stepState.findMany({
      where: { done: true },
      select: { projectId: true, activityRef: true, stepN: true },
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
    const mineDone = new Set(
      doneSteps
        .filter((x) => x.projectId === p.id)
        .map((x) => `${x.activityRef}:${x.stepN}`),
    );
    /* A risk on a step that has been handed over has been answered. Same rule
       as everywhere else, applied here so a card and the program inside it
       cannot show two different numbers for the same word. */
    const open = risks.filter(
      (r) => r.projectId === p.id && !mineDone.has(`${r.activityRef}:${r.stepN}`),
    );
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
      openRisks: open.length,
      /* "Nobody has answered this in a week" is a fact about the post, not
         about the viewer's clock — a week is a week in any timezone — so it is
         counted here rather than shipped to the browser to be counted again. */
      staleRisks: open.filter(
        (r) => Date.now() - (r.editedAt ?? r.createdAt).getTime() > 7 * 864e5,
      ).length,
      riskyStages: [
        ...new Set(
          open.map((r) => stageOfActivity[r.activityRef ?? '']).filter((x): x is string => !!x),
        ),
      ],
      items: sum(items, p.id),
      doneSteps: [...mineDone],
      openStepEnds: openStepEndsFor(p, mineDone),
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


/**
 * When each of a programme's still-open steps is due.
 *
 * Resolved here because the activity list is the programme's own now, and the
 * card must not have to hold every programme's whole index to print one
 * number. What is sent is the dates, not the count: the count depends on
 * "today", and today belongs to the browser.
 */
function openStepEndsFor(
  p: {
    kickoff: Date;
    profile: {
      id: string;
      name: string;
      builtin: boolean;
      template: boolean;
      stages: ProfileStageDef[];
      activities?: {
        ref: string;
        stageKey: string;
        order: number;
        title: string;
        windowFrom: number;
        windowTo: number;
        baseRef: string | null;
        steps?: { n: number; text: string; tat: number; lane: string }[];
      }[];
    };
  },
  done: Set<string>,
): number[] {
  const rows: ActivityRow[] = (p.profile.activities ?? []).map((a) => ({
    ref: a.ref,
    stageKey: a.stageKey,
    order: a.order,
    title: a.title,
    windowFrom: a.windowFrom,
    windowTo: a.windowTo,
    baseRef: a.baseRef ?? null,
    steps: (a.steps ?? []).map((st) => ({ n: st.n, text: st.text, tat: st.tat, lane: st.lane })),
  }));
  const resolved = resolveActivities(rows, activitySteps);
  const schedule = computeSchedule(p.kickoff, {
    id: p.profile.id,
    label: p.profile.name,
    builtin: p.profile.builtin,
    template: p.profile.template,
    stages: p.profile.stages,
  }, {});

  const ends: number[] = [];
  for (const [ref, a] of Object.entries(resolved)) {
    const span = schedule.stages[a.st];
    /* an activity whose stage this programme's profile does not run */
    if (!span) continue;
    for (const step of plannedSteps(span.start, fromStepIndex(ref, a))) {
      if (!done.has(`${ref}:${step.n}`)) ends.push(step.end.getTime());
    }
  }
  return ends.sort((x, y) => x - y);
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
