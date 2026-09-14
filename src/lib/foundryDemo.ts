/**
 * /lib/foundryDemo.ts — AtlasFX1 and its template, as rows.
 *
 * The content is written in /data/foundryDemo.ts. This resolves it against the
 * built-in template the way the Templates and Programs screens would: stages
 * take their titles and content from the built-in stage of the same key, the
 * programme's deliverables are dated by its own schedule exactly as creating a
 * programme dates them, and a step the scenario does not mention is either
 * simply done — planned before today in a stage that was on track — or left
 * alone.
 *
 * Pure: no DOM, no database, no clock — the scenario's day is its own.
 */
import type { ActivityStepEntry } from '@/data/activitySteps';
import {
  FOUNDRY_ADDED_STAGES,
  FOUNDRY_STAGES,
  FOUNDRY_TAPEOUT_WINDOWS,
  FOUNDRY_TEMPLATE_ID,
  FOUNDRY_TEMPLATE_NAME,
  FX1_CONTACTS,
  FX1_COST_PER_MAN_MONTH,
  FX1_DELIVERABLES,
  FX1_DONE_BEFORE_TODAY,
  FX1_ID,
  FX1_KICKOFF,
  FX1_LEADERS,
  FX1_MEETINGS,
  FX1_NAME,
  FX1_NOW,
  FX1_POSTS,
  FX1_SERIES,
  FX1_STEPS,
  FX1_TIME_ZONE,
  FX1_TODAY,
  type FxLink,
} from '@/data/foundryDemo';
import { RISK_AUTHOR } from '@/data/riskSeeds';
import type { ProfileStageDef, ScheduleProfile } from '@/data/types';
import type { LinkSeedRow, MeetingSeed } from './meetingSeed';
import { parseStepRef } from './meetings/links';
import { zonedToUtc } from './meetings/zonedTime';
import { addWeeks, computeSchedule, DAY, type Schedule } from './schedule';
import { resolveStages } from './stages';
import { fromStepIndex, plannedSteps, type ActivitySteps } from './steps';

export interface FoundryDemoInput {
  /** The built-in template the foundry one is copied from. */
  builtin: ScheduleProfile;
  /** The built-in activities, by ref. */
  library: Readonly<Record<string, ActivityStepEntry>>;
}

export interface DemoPostRow {
  id: string;
  projectId: string;
  kind: string;
  text: string;
  author: string;
  createdAt: Date;
  editedAt: Date | null;
  itemId: string | null;
  activityRef: string | null;
  stepN: number | null;
  stageId: string | null;
  deliverableId: string | null;
  parentId: string | null;
  doneAt: Date | null;
  meetingId: string | null;
}

export interface DemoStepStateRow {
  id: string;
  projectId: string;
  activityRef: string;
  stepN: number;
  done: boolean;
  doneAt: Date | null;
  pct: number;
  owner: string;
  dueOverride: Date | null;
}

export interface DemoDeliverableRow {
  id: string;
  projectId: string;
  stageId: string;
  title: string;
  due: Date | null;
  done: boolean;
  completedAt: Date | null;
  position: number;
}

export interface FoundryDemo {
  template: {
    id: string;
    name: string;
    stages: ProfileStageDef[];
    windows: Readonly<Record<string, readonly [number, number]>>;
  };
  project: { id: string; name: string; kickoff: Date; costPerManMonth: number };
  profile: ScheduleProfile;
  schedule: Schedule;
  activities: ActivitySteps[];
  deliverables: DemoDeliverableRow[];
  leaders: { id: string; projectId: string; stageId: string; name: string; short: string; phone: string; email: string }[];
  contacts: { id: string; projectId: string; stageId: string; name: string; role: string; email: string; phone: string; position: number }[];
  stepStates: DemoStepStateRow[];
  posts: DemoPostRow[];
  meetings: MeetingSeed;
}

const PID = FX1_ID;
const ME = RISK_AUTHOR;

const day = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const at = (stamp: string) => {
  const [date, time = '00:00'] = stamp.split(' ');
  const [h, mi] = time.split(':').map(Number);
  const d = day(date);
  d.setHours(h, mi, 0, 0);
  return d;
};
const who = (name: string) => (name === '@me' ? ME : name);
const postId = (key: string) => `${PID}:post:${key}`;
const meetingId = (key: string) => `${PID}:m:${key}`;
const seriesId = (key: string) => `${PID}:ms:${key}`;

export function buildFoundryDemo({ builtin, library }: FoundryDemoInput): FoundryDemo {
  /* ---- the template's stages ---- */
  const base = new Map(builtin.stages.map((s) => [s.key, s]));
  const stages: ProfileStageDef[] = [
    ...FOUNDRY_STAGES.map((s) => {
      const b = base.get(s.key);
      if (!b) throw new Error(`The built-in template has no ${s.key} stage.`);
      return { ...b, baseKey: b.baseKey ?? b.key, startOffsetWeeks: s.startOffsetWeeks, durationWeeks: s.durationWeeks };
    }),
    ...FOUNDRY_ADDED_STAGES.map((s) => ({ ...s, order: 0, baseKey: null })),
  ].map((s, order) => ({ ...s, order }));

  const profile: ScheduleProfile = {
    id: `${PID}:stages`,
    label: `${FX1_NAME} stages`,
    builtin: false,
    template: false,
    stages,
  };
  const kickoff = day(FX1_KICKOFF);
  const today = day(FX1_TODAY);
  const now = at(FX1_NOW);
  const schedule = computeSchedule(kickoff, profile, {});

  const kept = new Set(stages.map((s) => s.key));
  const activities: ActivitySteps[] = Object.keys(library)
    .filter((ref) => kept.has(library[ref].st))
    .map((ref) => {
      const a = fromStepIndex(ref, library[ref]);
      const w = FOUNDRY_TAPEOUT_WINDOWS[ref];
      return w ? { ...a, window: w } : a;
    });
  for (const ref of Object.keys(FOUNDRY_TAPEOUT_WINDOWS)) {
    if (!activities.some((a) => a.ref === ref)) throw new Error(`No activity ${ref} to re-time.`);
  }

  /* ---- deliverables, dated the way creating a programme dates them ---- */
  const deliverables: DemoDeliverableRow[] = resolveStages(profile).flatMap((stage) => {
    const span = schedule.stages[stage.id];
    return stage.deliverables.map((title, position) => {
      let due = addWeeks(
        span.start,
        stage.deliverableWeek?.[position] ?? (span.durationWeeks * (position + 1)) / stage.deliverables.length,
      );
      let completedAt: Date | null = null;
      for (const o of FX1_DELIVERABLES) {
        if (o.stageId !== stage.id || (o.position !== 'all' && o.position !== position)) continue;
        if (o.due) due = day(o.due);
        if (o.doneAt) completedAt = o.doneAt === 'due' ? due : day(o.doneAt);
      }
      return {
        id: `${PID}:dlv:${stage.id}:${position}`,
        projectId: PID,
        stageId: stage.id,
        title,
        due,
        done: completedAt !== null,
        completedAt,
        position,
      };
    });
  });

  /* ---- people ---- */
  let line = 140;
  const reach = (name: string) => ({
    phone: `+82 31 555 0${line++}`,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@atlasfx1.example`,
  });
  const leaders = Object.entries(FX1_LEADERS).map(([stageId, p]) => {
    const [first, ...rest] = p.name.split(' ');
    return { id: `${PID}:leader:${stageId}`, projectId: PID, stageId, name: p.name, short: `${first[0]}. ${rest.join(' ')}`, ...reach(p.name) };
  });
  const contacts = Object.entries(FX1_CONTACTS).flatMap(([stageId, list]) =>
    list.map((p, position) => ({ id: `${PID}:contact:${stageId}:${position}`, projectId: PID, stageId, name: p.name, role: p.role, position, ...reach(p.name) })),
  );

  /* ---- step records ---- */
  const listed = new Map(FX1_STEPS.map((s) => [`${s.ref}:${s.n}`, s]));
  const stepStates: DemoStepStateRow[] = [];
  for (const a of activities) {
    for (const p of plannedSteps(schedule.stages[a.stageId].start, a)) {
      const key = `${a.ref}:${p.n}`;
      const s = listed.get(key);
      const onTrack = FX1_DONE_BEFORE_TODAY.includes(a.stageId) && p.end < today;
      if (!s && !onTrack) continue;
      const done = s ? !!s.doneAt : true;
      stepStates.push({
        id: `${PID}:step:${key}`,
        projectId: PID,
        activityRef: a.ref,
        stepN: p.n,
        done,
        /* the day the plan said, unless the record says otherwise */
        doneAt: done ? (s?.doneAt ? day(s.doneAt) : p.end) : null,
        pct: done ? 100 : (s?.pct ?? 0),
        owner: s?.owner ? who(s.owner) : '',
        dueOverride: s?.due ? day(s.due) : null,
      });
    }
  }
  for (const key of listed.keys()) {
    if (!stepStates.some((x) => `${x.activityRef}:${x.stepN}` === key)) throw new Error(`No such step: ${key}`);
  }

  /* ---- posts ---- */
  const posts: DemoPostRow[] = FX1_POSTS.map((p) => {
    const step = p.step ? parseStepRef(p.step) : null;
    if (p.step && !step) throw new Error(`Bad step reference: ${p.step}`);
    return {
      id: postId(p.key),
      projectId: PID,
      kind: p.kind,
      text: p.text,
      author: ME,
      createdAt: at(p.at),
      editedAt: null,
      itemId: null,
      activityRef: step?.act ?? null,
      stepN: step?.n ?? null,
      stageId: p.stageId ?? null,
      deliverableId: null,
      parentId: p.parent ? postId(p.parent) : null,
      doneAt: null,
      meetingId: p.meeting ? meetingId(p.meeting) : null,
    };
  });

  /* ---- meetings ---- */
  const out: MeetingSeed = { series: [], meetings: [], attendees: [], agenda: [], decisions: [], actions: [], links: [] };
  const target = (l: FxLink) => ({
    type: l.type,
    ref: l.type === 'risk' ? postId(l.ref) : l.type === 'deliverable' ? `${PID}:dlv:${l.ref}` : l.ref,
  });
  type LinkOwner = keyof Pick<LinkSeedRow, 'seriesId' | 'meetingId' | 'agendaItemId' | 'decisionId' | 'actionItemId'>;
  const link = (key: LinkOwner, id: string, links: readonly FxLink[] | undefined, createdAt: Date) =>
    (links ?? []).map(target).forEach((t, i) =>
      out.links.push({
        id: `${key}:${id}:${String(i).padStart(3, '0')}`,
        projectId: PID,
        seriesId: null,
        meetingId: null,
        agendaItemId: null,
        decisionId: null,
        actionItemId: null,
        [key]: id,
        targetType: t.type,
        targetRef: t.ref,
        createdAt,
        createdBy: ME,
      }),
    );

  const seriesByKey = new Map(FX1_SERIES.map((s) => [s.key, s]));
  for (const s of FX1_SERIES) {
    const id = seriesId(s.key);
    const made = new Date(at(`${s.startDate} 09:00`).getTime() - 3 * DAY);
    out.series.push({
      id,
      projectId: PID,
      title: s.title,
      purpose: s.purpose,
      type: s.type,
      owner: ME,
      attendees: s.attendees.map(who).join('\n'),
      recurrence: JSON.stringify({
        freq: s.freq,
        interval: 1,
        weekdays: [...s.weekdays],
        monthDay: null,
        startDate: s.startDate,
        time: s.time,
        until: null,
      }),
      durationMinutes: s.durationMinutes,
      agendaTemplate: s.agendaTemplate.join('\n'),
      timeZone: FX1_TIME_ZONE,
      location: s.location,
      accessScope: 'program',
      status: 'active',
      createdAt: made,
      updatedAt: made,
      createdBy: ME,
      updatedBy: ME,
      primaryStage: s.stage,
    });
    link('seriesId', id, s.links, made);
  }

  for (const m of FX1_MEETINGS) {
    const s = m.series ? seriesByKey.get(m.series) : undefined;
    if (m.series && !s) throw new Error(`No series ${m.series}.`);
    const id = meetingId(m.key);
    const startsAt = zonedToUtc(m.date, m.time, FX1_TIME_ZONE);
    const endsAt = new Date(startsAt.getTime() + (m.durationMinutes ?? s?.durationMinutes ?? 60) * 60000);
    const held = m.status === 'completed';
    const past = held || m.status === 'cancelled';
    const createdAt = past
      ? new Date(startsAt.getTime() - 3 * DAY)
      : new Date(Math.min(now.getTime() - DAY, startsAt.getTime() - 2 * DAY));
    const stamp = { createdAt, updatedAt: held ? endsAt : createdAt, createdBy: ME, updatedBy: ME };

    out.meetings.push({
      id,
      projectId: PID,
      seriesId: s ? seriesId(s.key) : null,
      title: m.title ?? s!.title,
      type: m.type ?? s!.type,
      status: m.status,
      startsAt,
      endsAt,
      timeZone: FX1_TIME_ZONE,
      owner: ME,
      facilitator: '',
      location: m.location ?? s?.location ?? '',
      purpose: m.purpose ?? s?.purpose ?? '',
      minutes: m.minutes ?? '',
      completedAt: held ? endsAt : null,
      cancelReason: '',
      primaryStage: m.stage ?? s!.stage,
      ...stamp,
    });
    [...new Set([ME, ...(m.attendees ?? s?.attendees ?? []).map(who)])].forEach((name, position) =>
      out.attendees.push({ id: `${id}:att:${position}`, projectId: PID, meetingId: id, name, optional: false, position }),
    );
    link('meetingId', id, m.links ?? s?.links, createdAt);

    const agendaIds = m.agenda.map((_, i) => `${id}:a:${i}`);
    m.agenda.forEach((a, i) => {
      out.agenda.push({
        id: agendaIds[i],
        projectId: PID,
        meetingId: id,
        position: i,
        title: a.title,
        description: '',
        presenter: who(a.presenter),
        minutes: a.minutes,
        notes: held ? (a.notes ?? '') : '',
        outcome: held ? (a.outcome ?? '') : '',
        status: held ? 'discussed' : 'pending',
        deferral: '',
        deferNote: '',
        carriedFromId: null,
        ...stamp,
      });
      link('agendaItemId', agendaIds[i], a.links, createdAt);
    });

    (m.decisions ?? []).forEach((d, i) => {
      const did = `${id}:d:${i}`;
      out.decisions.push({
        id: did,
        projectId: PID,
        meetingId: id,
        agendaItemId: d.agenda != null ? (agendaIds[d.agenda] ?? null) : null,
        title: d.title,
        description: d.description,
        owner: who(d.owner),
        approvedBy: d.approvedBy ? who(d.approvedBy) : '',
        decidedOn: d.status === 'proposed' ? null : day(m.date),
        rationale: d.rationale,
        scope: d.scope,
        status: d.status,
        supersedesId: null,
        createdAt: endsAt,
        updatedAt: endsAt,
        createdBy: ME,
        updatedBy: ME,
      });
      link('decisionId', did, d.links, endsAt);
    });

    (m.actions ?? []).forEach((a, i) => {
      const aid = `${id}:x:${i}`;
      out.actions.push({
        id: aid,
        projectId: PID,
        meetingId: id,
        agendaItemId: a.agenda != null ? (agendaIds[a.agenda] ?? null) : null,
        description: a.description,
        owner: who(a.owner),
        contributors: (a.contributors ?? []).map(who).join('\n'),
        dueDate: day(a.due),
        priority: a.priority,
        status: a.status,
        actionType: a.type,
        evidence: a.evidence ?? '',
        blocker: a.blocker ?? '',
        escalationDate: a.escalation ? day(a.escalation) : null,
        verifiedBy: a.verifiedBy ? who(a.verifiedBy) : '',
        completedAt: a.completed ? at(`${a.completed} 17:00`) : null,
        scheduleImpact: a.impact ?? '',
        impactNote: a.impactNote ?? '',
        carriedToMeetingId: a.carriedTo ? meetingId(a.carriedTo) : null,
        convertedActivityRef: null,
        convertedStepN: null,
        createdAt: endsAt,
        updatedAt: endsAt,
        createdBy: ME,
        updatedBy: ME,
      });
      link('actionItemId', aid, a.links, endsAt);
    });
  }

  return {
    template: { id: FOUNDRY_TEMPLATE_ID, name: FOUNDRY_TEMPLATE_NAME, stages, windows: FOUNDRY_TAPEOUT_WINDOWS },
    project: { id: PID, name: FX1_NAME, kickoff, costPerManMonth: FX1_COST_PER_MAN_MONTH },
    profile,
    schedule,
    activities,
    deliverables,
    leaders,
    contacts,
    stepStates,
    posts,
    meetings: out,
  };
}
