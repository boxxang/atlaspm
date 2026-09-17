import { describe, expect, it } from 'vitest';
import { activitySteps } from '@/data/activitySteps';
import { ATLAS_SOC_SCENARIO } from '@/data/atlasSocDemo';
import { journeyData } from '@/data/journey';
import { RISK_AUTHOR } from '@/data/riskSeeds';
import { BUILTIN_PROFILE } from '@/data/scheduleProfiles';
import { buildScenario } from '@/lib/scenario';
import { computeSchedule, fmtDate } from '@/lib/schedule';
import { plannedSteps } from '@/lib/steps';

/**
 * AtlasSoC: a netlist-turnkey program whose EVT0 tapeout slipped two months.
 *
 * The PM tells this story in interviews, so the record has to hold together
 * the way a real program's would: the plan and what happened are both there
 * and two months apart, the story's events are on the days it says, every
 * issue has an owner and every action a due date and a close, and nothing the
 * record points at is missing. And because the app reads today from the
 * clock, a finished program has to be finished — an open step from 2023 would
 * be the first thing anyone saw.
 */
const demo = buildScenario(ATLAS_SOC_SCENARIO, { builtin: BUILTIN_PROFILE, library: activitySteps });
const plan = computeSchedule(demo.project.kickoff, { ...demo.profile, stages: demo.template.stages }, {});
const ME = RISK_AUTHOR;

const dayOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const meetingsOn = (date: string) =>
  demo.meetings.meetings.filter((m) => dayOf(new Date(m.startsAt.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))) === date);
const decisionsOf = (meetingIds: string[]) => demo.meetings.decisions.filter((d) => meetingIds.includes(d.meetingId));
const milestone = (s: typeof plan, id: string) => {
  const m = s.milestones.find((x) => x.id === id);
  return m ? fmtDate(m.date) : null;
};

describe('the Netlist Turnkey template and AtlasSoC', () => {
  it('runs physical design through production on the SoC stages', () => {
    expect(demo.template.id).toBe('netlistTurnkey');
    expect(demo.template.name).toBe('Netlist Turnkey');
    expect(demo.project.name).toBe('AtlasSoC');
    expect(demo.template.stages.map((s) => s.key)).toEqual([
      'physicalDesign',
      'testDevelopment',
      'signoff',
      'packaging',
      'tapeout',
      'fabrication',
      'bringup',
      'qualification',
    ]);
    for (const st of demo.template.stages) expect(st.baseKey, st.key).toBe(st.key);
    expect(fmtDate(demo.project.kickoff)).toBe('03/06/2023');
  });

  it('taped out two months after the plan, and reached production five weeks late', () => {
    expect(milestone(plan, 'tapeoutBeolMto')).toBe('01/29/2024');
    expect(milestone(demo.schedule, 'tapeoutBeolMto')).toBe('03/25/2024');
    expect(milestone(plan, 'massProduction')).toBe('01/13/2025');
    expect(milestone(demo.schedule, 'massProduction')).toBe('02/17/2025');
  });

  it('did not compress the fab — DPML was already at the minimum', () => {
    expect(demo.schedule.stages.fabrication.durationWeeks).toBe(plan.stages.fabrication.durationWeeks);
  });

  it('attaches die once the wafers are out, and starts bring-up early on the priority lot', () => {
    const WEEK = 7 * 86400000;
    const assy = demo.activities.find((a) => a.ref === 'ASSY-05')!;
    const [first] = plannedSteps(demo.schedule.stages.packaging.start, assy);
    const fabEnd = demo.schedule.stages.fabrication.end.getTime();
    expect(first.start.getTime()).toBeGreaterThanOrEqual(fabEnd - 2 * WEEK);
    /* bring-up overlaps assembly by four weeks instead of the plan's one */
    const lead = (s: typeof plan) => (s.stages.packaging.end.getTime() - s.stages.bringup.start.getTime()) / WEEK;
    expect(Math.round(lead(plan))).toBe(1);
    expect(Math.round(lead(demo.schedule))).toBe(4);
  });

  it('keeps every activity’s steps inside its window, as the template does', () => {
    for (const a of demo.activities) {
      const start = demo.schedule.stages[a.stageId].start;
      const steps = plannedSteps(start, a);
      const windowEnd = start.getTime() + a.window[1] * 7 * 86400000;
      expect(steps[steps.length - 1].end.getTime(), a.ref).toBeLessThanOrEqual(windowEnd + 2 * 86400000);
    }
  });
});

describe('the deliverables are dated by the schedule that actually ran', () => {
  /* The activity windows of the stages that stretched are re-timed; a
     deliverable due date left on the template's weeks would say the final
     routed database was done before the FFN it is routed from arrived. */
  it('dates each deliverable inside its stage, after the work that makes it has started', () => {
    for (const d of demo.deliverables) {
      const span = demo.schedule.stages[d.stageId];
      expect(d.due!.getTime(), d.id).toBeGreaterThanOrEqual(span.start.getTime());
      expect(d.due!.getTime(), d.id).toBeLessThanOrEqual(span.end.getTime());
    }
    /* and in the stages this program re-timed, no deliverable is due before the
       last step of the activity that makes it has started. (The template has
       three of its own that are — PDK-D1, RTL-D1, MP-D2 — which re-timing
       neither causes nor fixes.) */
    const retimed = new Set(['physicalDesign', 'signoff', 'testDevelopment']);
    for (const d of demo.deliverables.filter((x) => retimed.has(x.stageId))) {
      const stage = journeyData.find((j) => j.id === d.stageId)!;
      const from = stage.deliverableFrom?.[d.position];
      if (from == null) continue;
      const ref = demo.activities.filter((a) => a.stageId === d.stageId)[from].ref;
      const act = demo.activities.find((a) => a.ref === ref)!;
      const steps = plannedSteps(demo.schedule.stages[d.stageId].start, act);
      expect(d.due!.getTime(), `${d.id} (${ref})`).toBeGreaterThanOrEqual(steps[steps.length - 1].start.getTime());
    }
  });
});

describe('a finished program is finished', () => {
  it('has every step and every deliverable done', () => {
    for (const a of demo.activities) {
      for (const p of plannedSteps(demo.schedule.stages[a.stageId].start, a)) {
        const s = demo.stepStates.find((x) => x.activityRef === a.ref && x.stepN === p.n);
        expect(s?.done, `${a.ref}:${p.n}`).toBe(true);
        expect(s!.doneAt!.getTime(), `${a.ref}:${p.n}`).toBeLessThanOrEqual(new Date(2025, 2, 3).getTime());
      }
    }
    for (const d of demo.deliverables) expect(d.done, d.id).toBe(true);
  });

  it('has closed every risk, each with the word that answered it', () => {
    const risks = demo.posts.filter((p) => p.kind === 'risk');
    expect(risks.length).toBeGreaterThanOrEqual(4);
    for (const r of risks) {
      expect(r.doneAt, r.id).toBeTruthy();
      const closing = demo.posts.filter((p) => p.parentId === r.id).sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
      expect(closing.length, r.id).toBeGreaterThan(0);
      expect(closing[closing.length - 1].text, r.id).toMatch(/^Closed/);
    }
  });

  it('has held every meeting, closed every action, and ended every series', () => {
    expect(demo.meetings.meetings.length).toBeGreaterThanOrEqual(12);
    for (const m of demo.meetings.meetings) expect(m.status, m.title).toBe('completed');
    for (const a of demo.meetings.actions) {
      expect(a.status, a.description).toBe('done');
      expect(a.owner, a.description).toBeTruthy();
      expect(a.dueDate, a.description).toBeTruthy();
      expect(a.evidence.length, a.description).toBeGreaterThan(20);
      expect(a.completedAt, a.description).toBeTruthy();
    }
    for (const s of demo.meetings.series) expect(s.status, s.title).toBe('inactive');
  });
});

describe('the TPM ran it', () => {
  it('convened every meeting and verified the actions others owned', () => {
    for (const m of demo.meetings.meetings) expect(m.owner).toBe(ME);
    const delegated = demo.meetings.actions.filter((a) => a.owner !== ME);
    expect(delegated.length).toBeGreaterThanOrEqual(15);
    for (const a of delegated) expect(a.verifiedBy, a.description).toBe(ME);
    for (const d of demo.meetings.decisions) expect(d.approvedBy, d.title).toBeTruthy();
  });

  it('carried an action that did not close into the next sitting', () => {
    expect(demo.meetings.actions.some((a) => a.carriedToMeetingId)).toBe(true);
  });
});

describe('the story happened on the days it says', () => {
  const post = (id: string) => demo.posts.find((p) => p.id === `atlassoc:post:${id}`)!;

  it('received the FFN on 09/29/2023 and found nine of sixty blocks grown', () => {
    expect(dayOf(post('ffn-received').createdAt)).toBe('2023-09-29');
    const risk = post('risk-gate-count');
    expect(risk.kind).toBe('risk');
    expect(dayOf(risk.createdAt)).toBe('2023-10-04');
    for (const w of ['9 of 60', '11%']) expect(risk.text).toContain(w);
  });

  it('was refused a larger die on 10/12/2023', () => {
    const d = decisionsOf(meetingsOn('2023-10-12').map((m) => m.id));
    expect(d.map((x) => x.title).join(' ')).toMatch(/die size/i);
  });

  it('judged a normal signoff out of reach on 11/28/2023', () => {
    expect(meetingsOn('2023-11-28').length).toBe(1);
    expect(post('risk-signoff').text).toMatch(/signoff/i);
    expect(dayOf(post('risk-signoff').createdAt)).toBe('2023-11-28');
  });

  it('agreed EVT0 on relaxed criteria on 12/05/2023, with the fixes in EVT1', () => {
    const text = decisionsOf(meetingsOn('2023-12-05').map((m) => m.id))
      .map((d) => `${d.title} ${d.description}`)
      .join(' ');
    for (const w of ['130 MHz', '100 MHz', 'HVQK', '3σ', '1.5σ', 'OCV', '50 wafers', 'EVT1', 'functional validation']) {
      expect(text, w).toContain(w);
    }
  });

  it('found the fab cycle fixed on 12/14/2023 and the assembly pulled in on 01/11/2024', () => {
    expect(decisionsOf(meetingsOn('2023-12-14').map((m) => m.id)).map((d) => d.description).join(' ')).toContain('DPML');
    expect(decisionsOf(meetingsOn('2024-01-11').map((m) => m.id)).map((d) => d.title).join(' ')).toMatch(/assembly/i);
  });

  it('closes on a retrospective after tapeout', () => {
    const retro = meetingsOn('2024-03-28');
    expect(retro.length).toBe(1);
    const note = demo.posts.find((p) => p.kind === 'note' && /retrospective/i.test(p.text));
    expect(note).toBeTruthy();
  });
});

describe('everything the record points at exists', () => {
  const stageIds = new Set(demo.template.stages.map((s) => s.key));
  const refs = new Set(demo.activities.map((a) => a.ref));
  const postIds = new Set(demo.posts.map((p) => p.id));
  const deliverableIds = new Set(demo.deliverables.map((d) => d.id));
  const milestones = new Set(demo.schedule.milestones.map((m) => m.id));

  it('links meetings, agenda, decisions and actions to things on the plan', () => {
    expect(demo.meetings.links.length).toBeGreaterThan(30);
    for (const l of demo.meetings.links) {
      const at = `${l.targetType}:${l.targetRef}`;
      if (l.targetType === 'stage') expect(stageIds.has(l.targetRef), at).toBe(true);
      else if (l.targetType === 'activity') expect(refs.has(l.targetRef), at).toBe(true);
      else if (l.targetType === 'step') {
        const [act, n] = l.targetRef.split(':');
        expect(refs.has(act) && activitySteps[act].s.some((s) => s[0] === Number(n)), at).toBe(true);
      } else if (l.targetType === 'risk') expect(postIds.has(l.targetRef), at).toBe(true);
      else if (l.targetType === 'deliverable') expect(deliverableIds.has(l.targetRef), at).toBe(true);
      else if (l.targetType === 'milestone') expect(milestones.has(l.targetRef), at).toBe(true);
    }
  });

  it('files posts on steps the program runs, and replies under their threads', () => {
    for (const p of demo.posts) {
      if (p.activityRef) expect(refs.has(p.activityRef), p.id).toBe(true);
      if (p.stageId) expect(stageIds.has(p.stageId), p.id).toBe(true);
      if (p.parentId) expect(postIds.has(p.parentId), p.id).toBe(true);
    }
  });
});
