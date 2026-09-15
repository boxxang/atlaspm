import { describe, expect, it } from 'vitest';
import { activitySteps } from '@/data/activitySteps';
import { RISK_AUTHOR } from '@/data/riskSeeds';
import { BUILTIN_PROFILE } from '@/data/scheduleProfiles';
import { buildFoundryDemo } from '@/lib/foundryDemo';
import { parseStepRef } from '@/lib/meetings/links';
import { parseNoteDoc } from '@/lib/noteDoc';
import { fmtDate } from '@/lib/schedule';
import { plannedSteps } from '@/lib/steps';

/**
 * AtlasFX1: a foundry turnkey programme two weeks late in timing signoff,
 * splitting its mask release. It is a demo shown to people who have lived
 * through one, so what is checked is that the dates, the late work and the
 * record agree with each other the way they would on a real programme.
 */
const demo = buildFoundryDemo({ builtin: BUILTIN_PROFILE, library: activitySteps });
const TODAY = new Date(2026, 8, 14);
const NOW = new Date(2026, 8, 14, 12, 0);

const milestone = (id: string) => {
  const m = demo.schedule.milestones.find((x) => x.id === id);
  return m ? fmtDate(m.date) : null;
};
const stepsOf = (ref: string) => {
  const a = demo.activities.find((x) => x.ref === ref)!;
  return plannedSteps(demo.schedule.stages[a.stageId].start, a);
};

describe('the Foundry Turnkey template', () => {
  it('runs netlist hand-off to shipping, with shipping a stage of its own', () => {
    expect(demo.template.id).toBe('foundryTurnkey');
    expect(demo.template.name).toBe('Foundry Turnkey');
    expect(demo.template.stages.map((s) => s.key)).toEqual([
      'physicalDesign',
      'signoff',
      'tapeout',
      'fabrication',
      'testDevelopment',
      'packaging',
      'qualification',
      'shipping',
    ]);
    const ship = demo.template.stages.find((s) => s.key === 'shipping')!;
    expect(ship.baseKey).toBeNull();
    expect(ship.phaseId).toBe('validateRamp');
    const so = demo.template.stages.find((s) => s.key === 'signoff')!;
    expect(so.baseKey).toBe('signoff');
    expect(so.title).toBe('Signoff');
  });

  it('keeps only the activities of the stages it runs', () => {
    const kept = new Set(demo.template.stages.map((s) => s.key));
    expect(demo.activities.length).toBeGreaterThan(50);
    for (const a of demo.activities) expect(kept.has(a.stageId), a.ref).toBe(true);
  });
});

describe('the plan AtlasFX1 was committed to', () => {
  it('starts on netlist hand-off and lands the checkpoints on the agreed dates', () => {
    expect(fmtDate(demo.project.kickoff)).toBe('02/09/2026');
    expect(milestone('pdDatabaseHandoff')).toBe('09/07/2026');
    expect(milestone('designFreeze')).toBe('09/21/2026');
    expect(milestone('tapeoutBeolMto')).toBe('11/02/2026');
    expect(milestone('firstSilicon')).toBe('01/25/2027');
  });

  it('submits FEOL on 10/05 and BEOL on 11/02, to the day', () => {
    expect(fmtDate(stepsOf('TO-06').at(-1)!.end)).toBe('10/05/2026');
    expect(fmtDate(stepsOf('TO-10').at(-1)!.end)).toBe('11/02/2026');
  });

  it('dates the FEOL MTO release package for 10/05', () => {
    const feol = demo.deliverables.find((d) => d.stageId === 'tapeout' && d.position === 4)!;
    expect(feol.title).toMatch(/FEOL MTO/);
    expect(fmtDate(feol.due!)).toBe('10/05/2026');
  });
});

describe('where AtlasFX1 stands on 09/14', () => {
  const state = new Map(demo.stepStates.map((s) => [`${s.activityRef}:${s.stepN}`, s]));
  const openLate = demo.activities.flatMap((a) =>
    plannedSteps(demo.schedule.stages[a.stageId].start, a)
      .filter((p) => {
        const st = state.get(`${a.ref}:${p.n}`);
        return !st?.done && (st?.dueOverride ?? p.end) < TODAY;
      })
      .map((p) => `${a.ref}:${p.n}`),
  );

  it('started with the netlist maturity criteria in physical design, like every new program', () => {
    const notes = demo.posts.filter((p) => p.kind === 'note' && p.stageId === 'physicalDesign');
    expect(notes).toHaveLength(1);
    expect(notes[0].id).toBe('atlasfx1:note:netlist-maturity');
    expect(notes[0].text.split('\n')[0]).toMatch(/^Netlist drop maturity criteria/);
    expect(fmtDate(notes[0].createdAt)).toBe('02/09/2026');
  });

  it('keeps its timing closure status as tables: the burn-down, the 17 paths, the loop time', () => {
    const note = demo.posts.find((p) => p.id === 'atlasfx1:post:note-signoff')!;
    expect(note.stageId).toBe('signoff');
    expect(note.text.split('\n')[0]).toBe('Timing closure status — 09/11');
    const doc = parseNoteDoc(note.doc)!;
    const tables = doc.content.filter((b) => b.type === 'table');
    expect(tables).toHaveLength(3);
    expect(tables[0].content).toHaveLength(6);
    expect(tables[1].content).toHaveLength(4);
    expect(doc.content.some((b) => b.type === 'bulletList')).toBe(true);
    /* and says it as text, for the list and the filter */
    expect(note.text).toContain('Round 6 | 09/11 | 17');
    expect(note.text).toContain('CPU core ↔ L3 cache | 12 | Setup');
  });

  it('keeps its split MTO plan as tables: the two releases, what the ECO window admits, and what is still open', () => {
    const note = demo.posts.find((p) => p.id === 'atlasfx1:post:note-tapeout')!;
    expect(note.stageId).toBe('tapeout');
    expect(note.text.split('\n')[0]).toBe('Split MTO — how it works on this program');
    const doc = parseNoteDoc(note.doc)!;
    const tables = doc.content.filter((b) => b.type === 'table');
    expect(tables).toHaveLength(3);
    expect(tables[0].content).toHaveLength(3);
    expect(tables[1].content).toHaveLength(5);
    expect(tables[2].content).toHaveLength(4);
    expect(note.text).toContain('FEOL | Base layers through V0');
    expect(note.text).toContain('BEOL | M1 to top metal and RDL');
    /* the open items name the owners and dates the meeting actions carry */
    const hold = demo.meetings.actions.find((a) => /maximum FEOL hold/.test(a.description))!;
    expect(note.text).toContain(`${hold.owner} | ${fmtDate(hold.dueDate!).slice(0, 5)}`);
  });

  it('has physical design handed over, and its deliverables done', () => {
    const pd = demo.deliverables.filter((d) => d.stageId === 'physicalDesign');
    expect(pd.length).toBeGreaterThan(0);
    expect(pd.every((d) => d.done && d.completedAt)).toBe(true);
  });

  it('is late on exactly one step: the ECO iteration that should have stopped in August', () => {
    expect(openLate).toEqual(['SO-03:5']);
  });

  it('has moved timing signoff and the rest of signoff closure to 10/05', () => {
    const close = state.get('SO-03:7')!;
    expect(close.done).toBe(false);
    expect(fmtDate(close.dueOverride!)).toBe('10/05/2026');
    for (const k of ['SO-04:6', 'SO-05:6', 'SO-11:6']) expect(fmtDate(state.get(k)!.dueOverride!), k).toBe('10/05/2026');
  });

  it('carries three open risks: the timing slip, the metal-only question, and PV turnaround', () => {
    const risks = demo.posts.filter((p) => p.kind === 'risk');
    expect(risks).toHaveLength(3);
    for (const r of risks) expect(state.get(`${r.activityRef}:${r.stepN}`)?.done ?? false, r.id).toBe(false);
    expect(risks.find((r) => r.activityRef === 'SO-03')!.text).toMatch(/Design Freeze/);
    expect(risks.find((r) => r.activityRef === 'TO-06')!.text).toMatch(/17/);
    expect(risks.find((r) => r.activityRef === 'TO-06')!.meetingId).toBe('atlasfx1:m:split-decision');
  });

  it('writes every post against a step, a stage or a thread the programme has', () => {
    const ids = new Set(demo.posts.map((p) => p.id));
    const stages = new Set(demo.template.stages.map((s) => s.key));
    for (const p of demo.posts) {
      if (p.kind === 'reply') expect(ids.has(p.parentId!), p.id).toBe(true);
      else if (p.kind === 'note') expect(stages.has(p.stageId!), p.id).toBe(true);
      else expect(stepsOf(p.activityRef!).some((s) => s.n === p.stepN), p.id).toBe(true);
      expect(p.createdAt <= new Date(2026, 8, 14, 23, 59), p.id).toBe(true);
    }
  });
});

describe('the meeting record', () => {
  const m = demo.meetings;

  it('has the war-room, the readiness review, the decision review and what comes next', () => {
    expect(m.series.map((s) => s.title)).toEqual(['Timing Closure War-room', 'Weekly Tapeout Readiness Review']);
    const oneOffs = m.meetings.filter((x) => !x.seriesId).map((x) => x.title);
    expect(oneOffs).toEqual(['Split MTO decision review', 'Foundry alignment: FEOL/BEOL split MTO', 'FEOL MTO Go / No-Go']);
  });

  it('has held what is past and scheduled what is ahead', () => {
    for (const x of m.meetings) {
      if (x.status === 'completed' || x.status === 'cancelled') expect(x.endsAt <= NOW, x.id).toBe(true);
      else expect(x.startsAt > NOW, x.id).toBe(true);
    }
  });

  it('decided to split the release, and is still waiting to approve FEOL from round 6', () => {
    const d = (re: RegExp) => m.decisions.find((x) => re.test(x.title))!;
    expect(d(/^Split the mask release/).status).toBe('approved');
    expect(d(/^Release FEOL from the ECO round 6/).status).toBe('proposed');
    expect(d(/^Slip the full-mask tapeout/).status).toBe('rejected');
  });

  it('leaves the follow-up a PM would be chasing: one blocked on the foundry, one carried, one critical', () => {
    const blocked = m.actions.filter((a) => a.status === 'blocked');
    expect(blocked).toHaveLength(1);
    expect(blocked[0].blocker).toMatch(/Foundry/);
    const carried = m.actions.filter((a) => a.carriedToMeetingId);
    expect(carried).toHaveLength(1);
    expect(carried[0].carriedToMeetingId).toBe('atlasfx1:m:warroom-0914');
    expect(m.actions.some((a) => a.priority === 'critical' && /17 paths/.test(a.description))).toBe(true);
    for (const a of m.actions.filter((x) => x.status === 'done')) expect(a.completedAt).not.toBeNull();
  });

  it('links only to what AtlasFX1 has', () => {
    const acts = new Map(demo.activities.map((a) => [a.ref, a]));
    const risks = new Set(demo.posts.filter((p) => p.kind === 'risk').map((p) => p.id));
    const dlv = new Set(demo.deliverables.map((d) => d.id));
    const ms = new Set(demo.schedule.milestones.map((x) => x.id));
    const stages = new Set(demo.template.stages.map((s) => s.key));
    expect(m.links.length).toBeGreaterThan(40);
    for (const l of m.links) {
      if (l.targetType === 'stage') expect(stages.has(l.targetRef), l.targetRef).toBe(true);
      if (l.targetType === 'activity') expect(acts.has(l.targetRef), l.targetRef).toBe(true);
      if (l.targetType === 'step') {
        const s = parseStepRef(l.targetRef)!;
        expect(acts.get(s.act)?.steps.some((x) => x.n === s.n), l.targetRef).toBe(true);
      }
      if (l.targetType === 'risk') expect(risks.has(l.targetRef), l.targetRef).toBe(true);
      if (l.targetType === 'deliverable') expect(dlv.has(l.targetRef), l.targetRef).toBe(true);
      if (l.targetType === 'milestone') expect(ms.has(l.targetRef), l.targetRef).toBe(true);
    }
  });
});

describe('who wrote it', () => {
  it('is the PM, every word: posts, meetings, decisions and actions', () => {
    for (const p of demo.posts) expect(p.author).toBe(RISK_AUTHOR);
    for (const row of [...demo.meetings.series, ...demo.meetings.meetings, ...demo.meetings.agenda, ...demo.meetings.decisions, ...demo.meetings.actions]) {
      expect(row.createdBy, row.id).toBe(RISK_AUTHOR);
      expect(row.updatedBy, row.id).toBe(RISK_AUTHOR);
    }
  });

  it('names people the programme has', () => {
    const known = new Set([
      RISK_AUTHOR,
      ...demo.leaders.map((l) => l.name),
      ...demo.contacts.map((c) => c.name),
    ]);
    for (const a of demo.meetings.attendees) expect(known.has(a.name), a.name).toBe(true);
    for (const a of demo.meetings.actions) expect(known.has(a.owner), a.owner).toBe(true);
    for (const s of demo.stepStates.filter((x) => x.owner)) expect(known.has(s.owner), s.owner).toBe(true);
  });

  it('puts every row on AtlasFX1, with ids that do not collide', () => {
    const rows = [
      ...demo.posts,
      ...demo.stepStates,
      ...demo.contacts,
      ...demo.deliverables,
      ...demo.meetings.series,
      ...demo.meetings.meetings,
      ...demo.meetings.attendees,
      ...demo.meetings.agenda,
      ...demo.meetings.decisions,
      ...demo.meetings.actions,
      ...demo.meetings.links,
    ];
    const ids = rows.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of rows) expect(r.id.includes('atlasfx1'), r.id).toBe(true);
  });
});
