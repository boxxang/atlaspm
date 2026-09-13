/**
 * /lib/meetingSeed.ts — the seeded programme's meetings, placed in time.
 *
 * The content is written in /data/meetingSeeds.ts; this decides where it
 * lands. Each series meets on its own rule from the day its stage started, and
 * a sitting is named by its place around today — the last one before today,
 * the next one after — so the record reads the same whichever day the seed
 * runs. A series whose stage has not started holds no sittings.
 *
 * What a meeting is about is chosen from what is actually happening: the
 * activity and step a risk was seeded on, or failing that an activity with a
 * step running today. So the meetings, the risks and the Overdue list tell one
 * story, and no meeting is about work that has not begun.
 *
 * Pure: no DOM, no database, no clock of its own — now and today are passed in.
 */
import { MEETING_SEEDS, type SeedLink, type SeedSeries } from '@/data/meetingSeeds';
import { keyOfLocal } from './meetings/calendar';
import { nextOccurrences } from './meetings/recurrence';
import type { RecurrenceRule } from './meetings/types';
import { DAY } from './schedule';
import { plannedSteps, type ActivitySteps } from './steps';

export interface MeetingSeedInput {
  projectId: string;
  now: Date;
  today: Date;
  timeZone: string;
  stages: readonly { id: string; start: Date; end: Date }[];
  activities: readonly ActivitySteps[];
  risks: readonly { postId: string; activityRef: string; stepN: number }[];
  deliverables: readonly { id: string; stageId: string; title: string; done: boolean }[];
  milestones: readonly { id: string; stageId: string }[];
  people: Readonly<Record<string, { lead: string; team: readonly string[] }>>;
  me: string;
}

interface Stamp {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface SeriesSeedRow extends Stamp {
  id: string;
  projectId: string;
  title: string;
  purpose: string;
  type: string;
  owner: string;
  attendees: string;
  recurrence: string;
  durationMinutes: number;
  agendaTemplate: string;
  timeZone: string;
  location: string;
  accessScope: string;
  status: string;
  /** Not a column: the stage the series is about, for the checks. */
  primaryStage: string;
}

export interface MeetingSeedRow extends Stamp {
  id: string;
  projectId: string;
  seriesId: string | null;
  title: string;
  type: string;
  status: string;
  startsAt: Date;
  endsAt: Date;
  timeZone: string;
  owner: string;
  facilitator: string;
  location: string;
  purpose: string;
  minutes: string;
  completedAt: Date | null;
  cancelReason: string;
}

export interface AttendeeSeedRow {
  id: string;
  projectId: string;
  meetingId: string;
  name: string;
  optional: boolean;
  position: number;
}

export interface AgendaSeedRow extends Stamp {
  id: string;
  projectId: string;
  meetingId: string;
  position: number;
  title: string;
  description: string;
  presenter: string;
  minutes: number;
  notes: string;
  outcome: string;
  status: string;
  deferral: string;
  deferNote: string;
  carriedFromId: string | null;
}

export interface DecisionSeedRow extends Stamp {
  id: string;
  projectId: string;
  meetingId: string;
  agendaItemId: string | null;
  title: string;
  description: string;
  owner: string;
  approvedBy: string;
  decidedOn: Date | null;
  rationale: string;
  scope: string;
  status: string;
  supersedesId: string | null;
}

export interface ActionSeedRow extends Stamp {
  id: string;
  projectId: string;
  meetingId: string | null;
  agendaItemId: string | null;
  description: string;
  owner: string;
  contributors: string;
  dueDate: Date | null;
  priority: string;
  status: string;
  actionType: string;
  evidence: string;
  blocker: string;
  escalationDate: Date | null;
  verifiedBy: string;
  completedAt: Date | null;
  scheduleImpact: string;
  impactNote: string;
  carriedToMeetingId: string | null;
  convertedActivityRef: string | null;
  convertedStepN: number | null;
}

export interface LinkSeedRow {
  id: string;
  projectId: string;
  seriesId: string | null;
  meetingId: string | null;
  agendaItemId: string | null;
  decisionId: string | null;
  actionItemId: string | null;
  targetType: string;
  targetRef: string;
  createdAt: Date;
  createdBy: string;
}

export interface MeetingSeed {
  series: SeriesSeedRow[];
  meetings: MeetingSeedRow[];
  attendees: AttendeeSeedRow[];
  agenda: AgendaSeedRow[];
  decisions: DecisionSeedRow[];
  actions: ActionSeedRow[];
  links: LinkSeedRow[];
}

/** How far back to look for the sittings a series has already held. */
const LOOKBACK_DAYS = 90;

const dayOf = (at: Date, days = 0) => {
  const d = new Date(at);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
};

export function buildMeetingSeed(input: MeetingSeedInput): MeetingSeed {
  const { projectId, now, timeZone, me } = input;
  const out: MeetingSeed = { series: [], meetings: [], attendees: [], agenda: [], decisions: [], actions: [], links: [] };

  const link = (owner: { key: keyof Omit<LinkSeedRow, 'id' | 'projectId' | 'targetType' | 'targetRef' | 'createdAt' | 'createdBy'>; id: string }, targets: readonly { type: string; ref: string }[], at: Date, by: string) =>
    targets.forEach((t, i) =>
      out.links.push({
        id: `${owner.key}:${owner.id}:${String(i).padStart(3, '0')}`,
        projectId,
        seriesId: null,
        meetingId: null,
        agendaItemId: null,
        decisionId: null,
        actionItemId: null,
        [owner.key]: owner.id,
        targetType: t.type,
        targetRef: t.ref,
        createdAt: at,
        createdBy: by,
      }),
    );

  for (const s of MEETING_SEEDS) {
    const stage = input.stages.find((x) => x.id === s.stage);
    if (!stage) continue;
    const lead = input.people[s.stage]?.lead || me;
    const who = (name: string) => (name === '@me' ? me : name === '@lead' ? lead : name);
    const owner = who(s.owner);
    const work = workOf(s.stage, stage.start, input);
    const deliverable = deliverableOf(s, input);

    const target = (kind: SeedLink | undefined): { type: string; ref: string } | null => {
      switch (kind) {
        case 'stage':
          return { type: 'stage', ref: s.stage };
        case 'activity':
          return work.activity ? { type: 'activity', ref: work.activity } : null;
        case 'step':
          return work.step ? { type: 'step', ref: work.step } : null;
        case 'risk':
          return work.risk ? { type: 'risk', ref: work.risk } : work.step ? { type: 'step', ref: work.step } : null;
        case 'deliverable':
          return deliverable ? { type: 'deliverable', ref: deliverable } : null;
        case 'milestone':
          return s.milestone && input.milestones.some((m) => m.id === s.milestone) ? { type: 'milestone', ref: s.milestone } : null;
        default:
          return null;
      }
    };
    const targets = (kinds: readonly (SeedLink | undefined)[]) =>
      kinds.map(target).filter((t): t is { type: string; ref: string } => !!t);

    const seriesId = `${projectId}:ms:${s.key}`;
    const rule: RecurrenceRule = {
      freq: s.freq,
      interval: s.interval,
      weekdays: s.weekdays,
      monthDay: null,
      startDate: keyOfLocal(stage.start),
      time: s.time,
      until: null,
    };
    const seriesLinks = [
      { type: 'stage', ref: s.stage },
      ...(s.alsoStages ?? []).filter((id) => input.stages.some((x) => x.id === id)).map((ref) => ({ type: 'stage', ref })),
      ...targets(['activity', 'milestone', s.deliverable ? 'deliverable' : undefined]),
    ];

    /* Where each sitting falls: counted back from now for the ones held, and
       forward for the ones to come — never before the stage started, because
       the rule itself starts there. */
    const held = s.active
      ? nextOccurrences(rule, timeZone, new Date(now.getTime() - LOOKBACK_DAYS * DAY), 400)
          .filter((d) => d < now)
          .reverse()
      : [];
    const ahead = s.active ? nextOccurrences(rule, timeZone, now, 4) : [];
    const placed = s.sittings
      .map((sitting) => ({ sitting, startsAt: sitting.when < 0 ? held[-sitting.when - 1] : ahead[sitting.when - 1] }))
      .filter((p): p is { sitting: (typeof s.sittings)[number]; startsAt: Date } => !!p.startsAt)
      .map((p) => ({ ...p, id: `${projectId}:m:${s.key}:${p.sitting.when}` }));

    const first = placed[0]?.startsAt;
    const madeAt = first ? new Date(Math.min(first.getTime() - 7 * DAY, now.getTime())) : now;
    out.series.push({
      id: seriesId,
      projectId,
      title: s.title,
      purpose: s.purpose,
      type: s.type,
      owner,
      attendees: s.attendees.map(who).join('\n'),
      recurrence: JSON.stringify(rule),
      durationMinutes: s.durationMinutes,
      agendaTemplate: s.agendaTemplate.join('\n'),
      timeZone,
      location: s.location,
      accessScope: 'program',
      status: s.active ? 'active' : 'inactive',
      createdAt: madeAt,
      updatedAt: madeAt,
      createdBy: me,
      updatedBy: me,
      primaryStage: s.stage,
    });
    link({ key: 'seriesId', id: seriesId }, seriesLinks, madeAt, me);

    placed.forEach(({ sitting, startsAt, id }, k) => {
      const endsAt = new Date(startsAt.getTime() + s.durationMinutes * 60000);
      const past = sitting.status === 'completed' || sitting.status === 'cancelled';
      const createdAt = past ? new Date(startsAt.getTime() - 7 * DAY) : new Date(Math.min(now.getTime() - DAY, startsAt.getTime()));
      const updatedAt = sitting.status === 'completed' ? endsAt : createdAt;
      const stamp = { createdAt, updatedAt, createdBy: owner, updatedBy: owner };
      const next = placed.slice(k + 1).find((p) => p.sitting.status === 'scheduled' || p.sitting.status === 'draft');

      out.meetings.push({
        id,
        projectId,
        seriesId,
        title: s.title,
        type: s.type,
        status: sitting.status,
        startsAt,
        endsAt,
        timeZone,
        owner,
        facilitator: '',
        location: s.location,
        purpose: s.purpose,
        minutes: sitting.minutes ?? '',
        completedAt: sitting.status === 'completed' ? endsAt : null,
        cancelReason: sitting.cancelReason ?? '',
        ...stamp,
      });
      [...new Set(s.attendees.map(who))].forEach((name, position) =>
        out.attendees.push({ id: `${id}:att:${position}`, projectId, meetingId: id, name, optional: false, position }),
      );
      link({ key: 'meetingId', id }, seriesLinks, createdAt, owner);

      const agendaIds = sitting.agenda.map((_, i) => `${id}:a:${i}`);
      sitting.agenda.forEach((a, i) => {
        out.agenda.push({
          id: agendaIds[i],
          projectId,
          meetingId: id,
          position: i,
          title: a.title,
          description: '',
          presenter: who(a.presenter),
          minutes: a.minutes,
          notes: sitting.status === 'completed' ? (a.notes ?? '') : '',
          outcome: sitting.status === 'completed' ? (a.outcome ?? '') : '',
          status: sitting.status === 'completed' ? 'discussed' : 'pending',
          deferral: sitting.status === 'completed' ? (a.deferral ?? '') : '',
          deferNote: '',
          carriedFromId: null,
          ...stamp,
        });
        link({ key: 'agendaItemId', id: agendaIds[i] }, targets([a.link]), createdAt, owner);
      });

      (sitting.decisions ?? []).forEach((d, i) => {
        const did = `${id}:d:${i}`;
        out.decisions.push({
          id: did,
          projectId,
          meetingId: id,
          agendaItemId: d.agenda != null ? (agendaIds[d.agenda] ?? null) : null,
          title: d.title,
          description: d.description,
          owner: who(d.owner),
          approvedBy: d.approvedBy ? who(d.approvedBy) : '',
          decidedOn: d.status === 'proposed' ? null : dayOf(startsAt),
          rationale: d.rationale,
          scope: d.scope,
          status: d.status,
          supersedesId: null,
          createdAt: endsAt,
          updatedAt: endsAt,
          createdBy: owner,
          updatedBy: owner,
        });
        link({ key: 'decisionId', id: did }, targets([d.link]), endsAt, owner);
      });

      (sitting.actions ?? []).forEach((a, i) => {
        const aid = `${id}:x:${i}`;
        const due = dayOf(startsAt, a.dueAfter);
        const done = a.status === 'done';
        out.actions.push({
          id: aid,
          projectId,
          meetingId: id,
          agendaItemId: a.agenda != null ? (agendaIds[a.agenda] ?? null) : null,
          description: a.description,
          owner: who(a.owner),
          contributors: (a.contributors ?? []).map(who).join('\n'),
          dueDate: due,
          priority: a.priority,
          status: a.status,
          actionType: a.type,
          evidence: a.evidence ?? '',
          blocker: a.blocker ?? '',
          escalationDate: a.escalateAfter != null ? dayOf(startsAt, a.escalateAfter) : null,
          verifiedBy: a.verifiedBy ? who(a.verifiedBy) : '',
          /* finished a day before it was due, and never after the seed ran */
          completedAt: done ? new Date(Math.min(dayOf(startsAt, Math.max(1, a.dueAfter - 1)).getTime() + 16 * 3600000, now.getTime())) : null,
          scheduleImpact: a.impact ?? '',
          impactNote: a.impactNote ?? '',
          carriedToMeetingId: a.carry && next ? next.id : null,
          convertedActivityRef: null,
          convertedStepN: null,
          createdAt: endsAt,
          updatedAt: endsAt,
          createdBy: owner,
          updatedBy: owner,
        });
        link({ key: 'actionItemId', id: aid }, targets([a.link]), endsAt, owner);
      });
    });
  }
  return out;
}

/**
 * What a stage's meetings are about: the step a risk was seeded on, if the
 * stage has one — that is the work people are meeting about — otherwise an
 * activity with a step running today, otherwise the stage's first activity.
 */
function workOf(
  stageId: string,
  stageStart: Date,
  input: MeetingSeedInput,
): { activity: string | null; step: string | null; risk: string | null } {
  const mine = input.activities.filter((a) => a.stageId === stageId);
  const risk = input.risks.find((r) => mine.some((a) => a.ref === r.activityRef));
  if (risk) return { activity: risk.activityRef, step: `${risk.activityRef}:${risk.stepN}`, risk: risk.postId };
  for (const a of mine) {
    const running = plannedSteps(stageStart, a).find((st) => st.start <= input.today && input.today < st.end);
    if (running) return { activity: a.ref, step: `${a.ref}:${running.n}`, risk: null };
  }
  const first = mine[0];
  return first ? { activity: first.ref, step: `${first.ref}:1`, risk: null } : { activity: null, step: null, risk: null };
}

/** The deliverable a series reviews: by its words, in its stages, still open if possible. */
function deliverableOf(s: SeedSeries, input: MeetingSeedInput): string | null {
  const stages = new Set([s.stage, ...(s.alsoStages ?? [])]);
  const pool = input.deliverables.filter((d) => stages.has(d.stageId));
  const words = s.deliverable?.toLowerCase();
  const named = words ? pool.filter((d) => d.title.toLowerCase().includes(words)) : [];
  return (named.find((d) => !d.done) ?? named[0] ?? pool.find((d) => !d.done) ?? pool[0])?.id ?? null;
}
