/**
 * /lib/scenario.ts — a seeded program scenario, as rows.
 *
 * The content is written in /data (AtlasFX1 in foundryDemo.ts, AtlasSoC in
 * atlasSocDemo.ts). This resolves it against the built-in template the way the
 * Templates and Programs screens would: stages take their titles and content
 * from the built-in stage of the same key, the program's deliverables are
 * dated by its own schedule exactly as creating a program dates them, and a
 * step the scenario does not mention is either simply done — planned before
 * the scenario's day in a stage listed as done — or left alone.
 *
 * A scenario whose schedule moved says so in `actual`: its stage overrides feed
 * the program's schedule, and its activity windows are the program's own, while
 * the template keeps the plan.
 *
 * Pure: no DOM, no database, no clock — the scenario's day is its own.
 */
import type { ActivityStepEntry } from '@/data/activitySteps';
import type { Scenario } from '@/data/scenario';
import type { ScenarioLink } from '@/data/scenarioTypes';
import { RISK_AUTHOR } from '@/data/riskSeeds';
import type { ProfileStageDef, ScheduleProfile } from '@/data/types';
import type { LinkSeedRow, MeetingSeed } from './meetingSeed';
import { parseStepRef } from './meetings/links';
import { zonedToUtc } from './meetings/zonedTime';
import { addWeeks, computeSchedule, DAY, type Schedule } from './schedule';
import { noteText, type NoteDoc } from './noteDoc';
import { noteBlock, stageNotesFor } from './stageNotes';
import { resolveStages } from './stages';
import { fromStepIndex, plannedSteps, type ActivitySteps } from './steps';

export interface ScenarioInput {
  /** The built-in template the scenario's is copied from. */
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
  doc: string | null;
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

export interface ScenarioDemo {
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
  /** Where the program's stages actually ran, where that is not the plan. */
  overrides: { stageId: string; startOffsetWeeks: number; durationWeeks: number }[];
  /** The program's own activity windows, where they are not the template's. */
  programWindows: Readonly<Record<string, readonly [number, number]>>;
}

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

export function buildScenario(scenario: Scenario, { builtin, library }: ScenarioInput): ScenarioDemo {
  const { program } = scenario;
  const PID = program.id;
  const postId = (key: string) => `${PID}:post:${key}`;
  const meetingId = (key: string) => `${PID}:m:${key}`;
  const seriesId = (key: string) => `${PID}:ms:${key}`;

  /* ---- the template's stages ---- */
  const base = new Map(builtin.stages.map((s) => [s.key, s]));
  const stages: ProfileStageDef[] = scenario.template.stages.map((s, order) => {
    const b = base.get(s.key);
    if (!b) throw new Error(`The built-in template has no ${s.key} stage.`);
    return {
      ...b,
      order,
      baseKey: b.baseKey ?? b.key,
      startOffsetWeeks: s.startOffsetWeeks,
      durationWeeks: s.durationWeeks,
    };
  });

  const profile: ScheduleProfile = {
    id: `${PID}:stages`,
    label: `${program.name} stages`,
    builtin: false,
    template: false,
    stages,
  };
  const kickoff = day(program.kickoff);
  const today = day(program.today);
  const now = at(program.now);
  const overrides = scenario.actual?.overrides ?? {};
  const schedule = computeSchedule(kickoff, profile, overrides);

  const kept = new Set(stages.map((s) => s.key));
  const activities: ActivitySteps[] = Object.keys(library)
    .filter((ref) => kept.has(library[ref].st))
    .map((ref) => {
      const a = fromStepIndex(ref, library[ref]);
      /* the program's own window if it moved, else the template's re-timing */
      const w = scenario.actual?.windows[ref] ?? scenario.template.windows[ref];
      return w ? { ...a, window: [w[0], w[1]] as [number, number] } : a;
    });
  for (const ref of [...Object.keys(scenario.template.windows), ...Object.keys(scenario.actual?.windows ?? {})]) {
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
      for (const o of scenario.deliverables) {
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
  let line = program.phoneStart;
  const reach = (name: string) => ({
    phone: `+82 31 555 0${line++}`,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@${program.emailDomain}`,
  });
  const leaders = Object.entries(scenario.leaders).map(([stageId, p]) => {
    const [first, ...rest] = p.name.split(' ');
    return { id: `${PID}:leader:${stageId}`, projectId: PID, stageId, name: p.name, short: `${first[0]}. ${rest.join(' ')}`, ...reach(p.name) };
  });
  const contacts = Object.entries(scenario.contacts).flatMap(([stageId, list]) =>
    list.map((p, position) => ({ id: `${PID}:contact:${stageId}:${position}`, projectId: PID, stageId, name: p.name, role: p.role, position, ...reach(p.name) })),
  );

  /* ---- step records ---- */
  const listed = new Map(scenario.steps.map((s) => [`${s.ref}:${s.n}`, s]));
  const stepStates: DemoStepStateRow[] = [];
  for (const a of activities) {
    for (const p of plannedSteps(schedule.stages[a.stageId].start, a)) {
      const key = `${a.ref}:${p.n}`;
      const s = listed.get(key);
      const onTrack = scenario.doneStages.includes(a.stageId) && p.end < today;
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

  /* ---- posts: the notes the program started with, then what the PM wrote ---- */
  const startedWith: DemoPostRow[] = stageNotesFor(stages, PID, ME, at(`${program.kickoff} 09:00`)).map((n) => ({
    ...n,
    editedAt: null,
    itemId: null,
    activityRef: null,
    stepN: null,
    deliverableId: null,
    parentId: null,
    doneAt: null,
    meetingId: null,
  }));
  const written: DemoPostRow[] = scenario.posts.map((p) => {
    const step = p.step ? parseStepRef(p.step) : null;
    if (p.step && !step) throw new Error(`Bad step reference: ${p.step}`);
    /* a note written as blocks is stored the way the key-info editor stores one */
    const doc: NoteDoc | null = p.blocks ? { type: 'doc', content: p.blocks.map(noteBlock) } : null;
    return {
      id: postId(p.key),
      projectId: PID,
      kind: p.kind,
      text: doc ? noteText(p.text, doc) : p.text,
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
      doc: doc ? JSON.stringify(doc) : null,
    };
  });

  const posts: DemoPostRow[] = [...startedWith, ...written];

  /* ---- meetings ---- */
  const out: MeetingSeed = { series: [], meetings: [], attendees: [], agenda: [], decisions: [], actions: [], links: [] };
  const target = (l: ScenarioLink) => ({
    type: l.type,
    ref: l.type === 'risk' ? postId(l.ref) : l.type === 'deliverable' ? `${PID}:dlv:${l.ref}` : l.ref,
  });
  type LinkOwner = keyof Pick<LinkSeedRow, 'seriesId' | 'meetingId' | 'agendaItemId' | 'decisionId' | 'actionItemId'>;
  const link = (key: LinkOwner, id: string, links: readonly ScenarioLink[] | undefined, createdAt: Date) =>
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

  const seriesByKey = new Map(scenario.series.map((s) => [s.key, s]));
  for (const s of scenario.series) {
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
      timeZone: program.timeZone,
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

  for (const m of scenario.meetings) {
    const s = m.series ? seriesByKey.get(m.series) : undefined;
    if (m.series && !s) throw new Error(`No series ${m.series}.`);
    const id = meetingId(m.key);
    const startsAt = zonedToUtc(m.date, m.time, program.timeZone);
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
      timeZone: program.timeZone,
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
    template: { id: scenario.template.id, name: scenario.template.name, stages, windows: scenario.template.windows },
    project: { id: PID, name: program.name, kickoff, costPerManMonth: program.costPerManMonth },
    profile,
    schedule,
    activities,
    deliverables,
    leaders,
    contacts,
    stepStates,
    posts,
    meetings: out,
    overrides: Object.entries(overrides).map(([stageId, o]) => ({ stageId, ...o })),
    programWindows: scenario.actual?.windows ?? {},
  };
}
