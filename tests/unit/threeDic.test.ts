import { describe, expect, it } from 'vitest';
import { activitySteps } from '@/data/activitySteps';
import { detailActivityTitles } from '@/data/activityIndex';
import { journeyData } from '@/data/journey';
import { BUILTIN_PROFILE, milestoneDefs } from '@/data/scheduleProfiles';
import {
  THREE_DIC_ACTIVITIES,
  THREE_DIC_ACTIVITY_TITLES,
  THREE_DIC_MILESTONES,
  THREE_DIC_PROFILE,
  THREE_DIC_STAGES,
  THREE_DIC_STAGE_KEYS,
} from '@/data/threeDic';

/**
 * The 3DIC template: a stacked-die programme.
 *
 * It runs the SoC flow and the work a stack adds to it — partitioning the dies,
 * the die-to-die interface, the bonding process, the daisy-chain test vehicle
 * that proves the assembly before product silicon exists, the 3D stack's own
 * integration and signoff, known-good-die sorting, and testing a part whose
 * dies can only be reached through each other.
 *
 * Its stage content cannot live in journey.ts: that file and the activity
 * modules beside it are generated from the authoring corpus, and the alignment
 * test walks all three together. So the 3DIC stages carry their own content
 * here, held to the same invariants.
 */
const refsOf = (stageKey: string) =>
  Object.keys(THREE_DIC_ACTIVITIES).filter((ref) => THREE_DIC_ACTIVITIES[ref].st === stageKey);

describe('the 3DIC template', () => {
  it('is a built-in template of its own, and leaves the SoC one alone', () => {
    expect(THREE_DIC_PROFILE.id).toBe('threeDic');
    expect(THREE_DIC_PROFILE.builtin).toBe(true);
    expect(THREE_DIC_PROFILE.template).toBe(true);
    expect(THREE_DIC_PROFILE.label).toMatch(/3DIC/);
    expect(BUILTIN_PROFILE.stages).toHaveLength(23);
    expect(BUILTIN_PROFILE.id).toBe('typicalSoC');
  });

  it('runs the SoC stages and the stack ones, in the order they happen', () => {
    const keys = THREE_DIC_PROFILE.stages.map((s) => s.key);
    /* every stage the SoC template runs is still here — a 3DIC programme does
       all of it and more */
    for (const st of BUILTIN_PROFILE.stages) expect(keys, st.key).toContain(st.key);
    for (const key of THREE_DIC_STAGE_KEYS) expect(keys, key).toContain(key);
    expect(keys.length).toBe(BUILTIN_PROFILE.stages.length + THREE_DIC_STAGE_KEYS.length);

    const starts = THREE_DIC_PROFILE.stages.map((s) => s.startOffsetWeeks);
    expect([...starts].sort((a, b) => a - b)).toEqual(starts);
    THREE_DIC_PROFILE.stages.forEach((s, i) => {
      expect(s.order, s.key).toBe(i);
      expect(s.durationWeeks, s.key).toBeGreaterThan(0);
    });
  });

  it('gives every stack stage its own content, and inherits the rest', () => {
    for (const st of THREE_DIC_PROFILE.stages) {
      const own = THREE_DIC_STAGES.find((s) => s.id === st.key);
      const inherited = journeyData.find((s) => s.id === st.baseKey);
      expect(own || inherited, `${st.key} shows nothing`).toBeTruthy();
      if (own) expect(st.baseKey, st.key).toBe(st.key);
    }
    expect(THREE_DIC_STAGES.map((s) => s.id).sort()).toEqual([...THREE_DIC_STAGE_KEYS].sort());
  });

  /* The same invariants journeyAlignment holds the SoC content to: the arrays
     are positions, and a position that names another activity is invisible
     until something checks it. */
  it('lines each stack stage’s arrays up with its activities', () => {
    for (const s of THREE_DIC_STAGES) {
      const refs = refsOf(s.id);
      expect(refs.length, `${s.id} has no activities`).toBeGreaterThan(0);
      expect(s.engineeringView, s.id).toHaveLength(refs.length);
      expect(s.engineeringTat, s.id).toHaveLength(refs.length);
      expect(s.engineeringEffort, s.id).toHaveLength(refs.length);
      expect(s.engineeringStart, s.id).toHaveLength(refs.length);
      refs.forEach((ref, i) => {
        expect(s.engineeringView[i], `${s.id}[${i}] should be ${ref}`).toBe(
          THREE_DIC_ACTIVITY_TITLES[ref],
        );
        const a = THREE_DIC_ACTIVITIES[ref];
        expect(Math.abs(s.engineeringTat[i]), ref).toBeCloseTo(a.w[1] - a.w[0], 5);
        expect(s.engineeringStart[i], ref).toBeCloseTo(a.w[0], 5);
      });
      /* a deliverable is made by one of the stage's own activities */
      s.deliverableFrom.forEach((at, i) => {
        expect(at, `${s.id} deliverable ${i}`).toBeGreaterThanOrEqual(0);
        expect(at, `${s.id} deliverable ${i}`).toBeLessThan(refs.length);
      });
      expect(s.deliverableFrom, s.id).toHaveLength(s.deliverables.length);
      expect(s.deliverableWeek, s.id).toHaveLength(s.deliverables.length);
    }
  });

  it('numbers its activities like every other stage, and clashes with none', () => {
    for (const [ref, a] of Object.entries(THREE_DIC_ACTIVITIES)) {
      expect(activitySteps[ref], `${ref} already belongs to the SoC template`).toBeUndefined();
      expect(detailActivityTitles[ref], ref).toBeUndefined();
      expect(THREE_DIC_ACTIVITY_TITLES[ref], `${ref} has no title`).toBeTruthy();
      expect(THREE_DIC_STAGE_KEYS, `${ref} runs in ${a.st}`).toContain(a.st);
      expect(a.w[1], ref).toBeGreaterThan(a.w[0]);
      expect(a.s.length, `${ref} has no steps`).toBeGreaterThanOrEqual(3);
      a.s.forEach((step, i) => {
        expect(step[0], `${ref} step ${i}`).toBe(i + 1);
        expect(String(step[1]).length, `${ref} step ${i}`).toBeGreaterThan(8);
        expect(step[2], `${ref} step ${i}`).toBeGreaterThan(0);
      });
      expect(a.ro, `${ref} has no owning role`).toBeTruthy();
      /* every output is handed over by a step the activity actually has */
      expect(a.ob, ref).toHaveLength(a.o.length);
      for (const n of a.ob) expect(a.s.some((st) => st[0] === n), `${ref} output step ${n}`).toBe(true);
    }
  });

  /* The one the request turns on: the daisy chain test vehicle is where a 3DIC
     programme finds out whether its stack can be assembled at all. */
  it('develops and verifies a daisy chain test vehicle, as a stage of its own', () => {
    expect(THREE_DIC_STAGE_KEYS).toContain('dctv');
    const dctv = THREE_DIC_STAGES.find((s) => s.id === 'dctv')!;
    expect(dctv.title).toMatch(/Daisy Chain Test Vehicle|DCTV/i);
    const refs = refsOf('dctv');
    expect(refs.length).toBeGreaterThanOrEqual(5);
    const said = refs.map((r) => `${THREE_DIC_ACTIVITY_TITLES[r]} ${THREE_DIC_ACTIVITIES[r].s.map((s) => s[1]).join(' ')}`).join(' ').toLowerCase();
    for (const word of ['daisy chain', 'continuity', 'assembly', 'yield', 'process window']) {
      expect(said, `DCTV never mentions ${word}`).toContain(word);
    }
    /* and it closes on a checkpoint, because the assembly window depends on it */
    expect(THREE_DIC_MILESTONES.some((m) => m.anchor.stage === 'dctv')).toBe(true);
  });

  it('anchors its checkpoints to stages it runs, and adds none to the SoC template', () => {
    const keys = new Set(THREE_DIC_PROFILE.stages.map((s) => s.key));
    const ids = new Set(milestoneDefs.map((m) => m.id));
    for (const m of THREE_DIC_MILESTONES) {
      expect(keys, m.id).toContain(m.anchor.stage);
      expect(THREE_DIC_STAGE_KEYS, `${m.id} belongs to a stack stage`).toContain(m.anchor.stage);
      expect(ids.has(m.id), `${m.id} collides with an SoC checkpoint`).toBe(false);
    }
    expect(THREE_DIC_MILESTONES.length).toBeGreaterThanOrEqual(4);
  });

  it('starts every stack stage where the work it consumes exists', () => {
    const at = (key: string) => {
      const st = THREE_DIC_PROFILE.stages.find((s) => s.key === key)!;
      return { start: st.startOffsetWeeks, end: st.startOffsetWeeks + st.durationWeeks };
    };
    /* partitioning is an architecture decision: it cannot follow the design it
       decides the shape of */
    expect(at('chipletPartitioning').start).toBeLessThanOrEqual(at('rtl').start);
    /* the bonding process has to be chosen before the stack is designed around it */
    expect(at('tsvHybridBond').start).toBeLessThanOrEqual(at('threeDIntegration').start);
    /* the vehicle exists to be measured before the product is assembled */
    expect(at('dctv').end).toBeLessThanOrEqual(at('packaging').end);
    /* dies are sorted before they are stacked, and tested after */
    expect(at('kgdSort').start).toBeLessThanOrEqual(at('packaging').start);
    expect(at('multiDieTest').start).toBeGreaterThanOrEqual(at('kgdSort').start);
  });
});
