import { describe, expect, it } from 'vitest';
import { ALL_ACTIVITIES } from '@/data/builtins';
import { E2_SCENARIO } from '@/data/e2Demo';
import { EMBEDDED_PROFILE } from '@/data/embeddedSoc';
import { RISK_AUTHOR } from '@/data/riskSeeds';
import { buildScenario } from '@/lib/scenario';
import { computeSchedule, fmtDate } from '@/lib/schedule';
import { plannedSteps } from '@/lib/steps';

/**
 * Embedded_SoC: the E2 interview example, read on 09/27/2026 in the second
 * week of the final turn on the FFN.
 *
 * It is shown live, so it has to hold together the way a running programme
 * does: the plan and what happened are both there, the story's events are on
 * the days it says, nothing after today is done and nothing before it is
 * left hanging without a reason, every risk sits on a step, and everything a
 * meeting or a post points at exists.
 */
const demo = buildScenario(E2_SCENARIO, { builtin: EMBEDDED_PROFILE, library: ALL_ACTIVITIES });
const plan = computeSchedule(demo.project.kickoff, demo.profile, {});
const ME = RISK_AUTHOR;
const TODAY = new Date(2026, 8, 27);

const milestone = (s: typeof plan, id: string) => {
  const m = s.milestones.find((x) => x.id === id);
  return m ? fmtDate(m.date) : null;
};

describe('Embedded_SoC — E2 in the final turn on the FFN', () => {
  it('replaces the existing programme in place, on the built-in template, without adding one', () => {
    expect(demo.project.id).toBe('embedded-soc-cd0t9');
    expect(demo.project.name).toBe('Embedded_SoC');
    expect(demo.template.create).toBe(false);
    expect(demo.template.id).toBe(EMBEDDED_PROFILE.id);
    expect(demo.template.stages.map((s) => s.key)).toEqual(EMBEDDED_PROFILE.stages.map((s) => s.key));
    expect(fmtDate(demo.project.kickoff)).toBe('08/18/2025');
  });

  it('is in physical design today, and the FFN went out two weeks late', () => {
    const pd = demo.schedule.stages.physicalDesignEmb;
    expect(pd.start <= TODAY && TODAY <= pd.end).toBe(true);
    expect(milestone(plan, 'ffnReleaseEmb')).toBe('08/31/2026');
    expect(milestone(demo.schedule, 'ffnReleaseEmb')).toBe('09/14/2026');
  });

  it('holds Design Freeze and the MTO', () => {
    for (const id of ['designFreezeEmb', 'tapeoutBeolMtoEmb', 'firstSiliconEmb'])
      expect(milestone(demo.schedule, id), id).toBe(milestone(plan, id));
    expect(milestone(demo.schedule, 'designFreezeEmb')).toBe('11/23/2026');
    expect(milestone(demo.schedule, 'tapeoutBeolMtoEmb')).toBe('01/18/2027');
  });

  it('has the final turn under way: intake and placement done, CTS and IR in progress, the rest ahead', () => {
    const st = (ref: string, n: number) => demo.stepStates.find((s) => s.activityRef === ref && s.stepN === n);
    expect(st('EPD-13', 1)?.done).toBe(true);
    expect(st('EPD-13', 2)?.done).toBe(true);
    expect(st('EPD-13', 4)).toMatchObject({ done: false, pct: 40 });
    expect(st('EPD-13', 5)).toMatchObject({ done: false, pct: 30 });
    for (const n of [6, 7, 8, 9, 10]) expect(st('EPD-13', n)?.done, `EPD-13:${n}`).toBe(false);
    expect(st('ESYN-12', 6)?.doneAt && fmtDate(st('ESYN-12', 6)!.doneAt!)).toBe('09/11/2026');
  });

  it('marks nothing done after today', () => {
    for (const s of demo.stepStates) if (s.doneAt) expect(s.doneAt <= TODAY, `${s.activityRef}:${s.stepN}`).toBe(true);
    for (const d of demo.deliverables) if (d.completedAt) expect(d.completedAt <= TODAY, d.id).toBe(true);
  });

  it('leaves open only the steps the story leaves open', () => {
    /* a step planned to finish before today that is not done is one the record explains */
    const listed = new Set(E2_SCENARIO.steps.map((s) => `${s.ref}:${s.n}`));
    for (const a of demo.activities)
      for (const p of plannedSteps(demo.schedule.stages[a.stageId].start, a)) {
        if (p.end >= TODAY) continue;
        const rec = demo.stepStates.find((s) => s.activityRef === a.ref && s.stepN === p.n);
        if (!rec?.done) expect(listed.has(`${a.ref}:${p.n}`), `${a.ref}:${p.n} overdue without a record`).toBe(true);
      }
  });

  it('delivered the FFN late, and past deliverables of running stages on their dates', () => {
    const ffn = demo.deliverables.find((d) => d.id === 'embedded-soc-cd0t9:dlv:synthesisEmb:7')!;
    expect(ffn.title).toMatch(/FFN/);
    expect(fmtDate(ffn.completedAt!)).toBe('09/11/2026');
    expect(ffn.completedAt! > ffn.due!).toBe(true);
    const open = demo.deliverables.filter((d) => d.due && d.due < TODAY && !d.done);
    expect(open).toEqual([]);
    expect(demo.deliverables.find((d) => d.id.endsWith('validationHardwareEmb:1'))?.done).toBe(false);
  });

  it('is written by the PM, with every risk on a step and every thread answered where closed', () => {
    for (const p of demo.posts) expect(p.author).toBe(ME);
    const risks = E2_SCENARIO.posts.filter((p) => p.kind === 'risk');
    expect(risks.filter((r) => !r.closed).map((r) => r.key).sort()).toEqual(['risk-atpg-volume', 'risk-fabric-timing', 'risk-mram-ir']);
    for (const r of risks) {
      expect(r.step, r.key).toBeTruthy();
      if (r.closed) expect(E2_SCENARIO.posts.some((p) => p.parent === r.key), r.key).toBe(true);
    }
    const keys = new Set(E2_SCENARIO.posts.map((p) => p.key));
    for (const p of E2_SCENARIO.posts) if (p.parent) expect(keys.has(p.parent), p.key).toBe(true);
  });

  it('points only at things that exist', () => {
    const stepRefs = new Set(demo.activities.flatMap((a) => a.steps.map((s) => `${a.ref}:${s.n}`)));
    const riskIds = new Set(demo.posts.filter((p) => p.kind === 'risk').map((p) => p.id));
    const dlvIds = new Set(demo.deliverables.map((d) => d.id));
    const stages = new Set(demo.template.stages.map((s) => s.key));
    const milestones = new Set(demo.schedule.milestones.map((m) => m.id));
    for (const l of demo.meetings.links) {
      if (l.targetType === 'step') expect(stepRefs.has(l.targetRef), l.targetRef).toBe(true);
      if (l.targetType === 'risk') expect(riskIds.has(l.targetRef), l.targetRef).toBe(true);
      if (l.targetType === 'deliverable') expect(dlvIds.has(l.targetRef), l.targetRef).toBe(true);
      if (l.targetType === 'stage') expect(stages.has(l.targetRef), l.targetRef).toBe(true);
      if (l.targetType === 'milestone') expect(milestones.has(l.targetRef), l.targetRef).toBe(true);
    }
    for (const p of E2_SCENARIO.posts) if (p.step) expect(stepRefs.has(p.step), p.step).toBe(true);
  });

  it('holds its meetings on the series day, done before today and scheduled after', () => {
    const tz = E2_SCENARIO.program.timeZone;
    for (const m of E2_SCENARIO.meetings) {
      expect(m.status === 'completed' ? m.date < '2026-09-27' : m.date > '2026-09-27', m.key).toBe(true);
      if (!m.series) continue;
      const s = E2_SCENARIO.series.find((x) => x.key === m.series)!;
      const [y, mo, d] = m.date.split('-').map(Number);
      expect(s.weekdays, m.key).toContain(new Date(y, mo - 1, d).getDay());
      expect(m.date >= s.startDate, m.key).toBe(true);
    }
    expect(tz).toBe('America/New_York');
    /* every action is owned and dated, and a done one says how and who checked */
    for (const a of demo.meetings.actions) {
      expect(a.owner, a.id).toBeTruthy();
      expect(a.dueDate, a.id).toBeTruthy();
      if (a.status === 'done') expect(a.evidence && a.verifiedBy && a.completedAt, a.id).toBeTruthy();
      if (a.status === 'blocked') expect(a.blocker, a.id).toBeTruthy();
    }
  });
});

describe('Embedded_SoC — the sign-off checklists', () => {
  it('fill the gates’ own items, confirmed by the stage lead or the TPM, naming people on the team', async () => {
    const { E2_SIGNOFFS, E2_SIGNOFF_CLOSED } = await import('@/data/e2Signoffs');
    const { signoffDefinition } = await import('@/lib/signoffDefinition');
    const { parseSignoff, checklistCompletedOn, entryOf, summarize } = await import('@/lib/signoff');
    const { E2_LEADERS, E2_CONTACTS } = await import('@/data/e2Demo');
    const team = new Set([
      '@me',
      ...Object.values(E2_LEADERS).map((p) => p.name),
      ...Object.values(E2_CONTACTS).flatMap((l) => l.map((p) => p.name)),
    ]);
    for (const [ref, payload] of Object.entries(E2_SIGNOFFS)) {
      const def = signoffDefinition(ref)!;
      const ids = new Set(def.items.map((i) => i.id));
      const lead = E2_LEADERS[def.stageKey].name;
      for (const [id, e] of Object.entries(payload.items)) {
        expect(ids.has(id), `${ref} ${id}`).toBe(true);
        expect(team.has(e.evidenceOwner), `${ref} ${id} ${e.evidenceOwner}`).toBe(true);
        if (e.lead === 'Confirmed') expect([lead, '@me'], `${ref} ${id}`).toContain(e.confirmedBy);
        if (e.confirmedOn) expect(e.confirmedOn <= '2026-09-27', `${ref} ${id}`).toBe(true);
      }
      for (const r of Object.values(payload.roles)) expect(team.has(r.name), `${ref} ${r.name}`).toBe(true);
      const state = parseSignoff(JSON.stringify(payload));
      expect(checklistCompletedOn(def.items, state), ref).toBe(E2_SIGNOFF_CLOSED[ref] ?? '');
      /* a closed gate is ready: nothing flagged, nothing blocking */
      if (E2_SIGNOFF_CLOSED[ref]) expect(summarize(def.items, state).outcome, ref).toBe('Ready to sign off');
      else expect(def.items.some((i) => entryOf(state, i.id).lead === 'Pending'), ref).toBe(true);
    }
  });
});
