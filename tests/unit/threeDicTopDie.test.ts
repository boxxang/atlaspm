/**
 * The top die of a 3DIC program, derived from the SoC stages that are done
 * once per chip. It has to mirror the bottom die exactly — same activities,
 * same steps — while every reference it carries names the top die's own work,
 * and its deliverables can be told apart from the bottom die's by the tag
 * matcher, which matches on titles.
 */
import { describe, expect, it } from 'vitest';
import { activitySteps } from '@/data/activitySteps';
import { detailActivityTitles, detailDeliverables } from '@/data/activityIndex';
import { activityDetail } from '@/data/activityDetails';
import { journeyData } from '@/data/journey';
import {
  TOP_DIE_ACTIVITIES, TOP_DIE_ACTIVITY_TITLES, TOP_DIE_DELIVERABLES, TOP_DIE_SHARE,
  TOP_DIE_SPLIT, TOP_DIE_STAGES, baseRefOf, toTopRef,
} from '@/data/threeDicTopDie';
import { topDieDetail } from '@/data/threeDicTopDieDetails';
import { deliverableRefs } from '@/lib/deliverableRefs';

describe('references move to the top die only for the split stages', () => {
  it('remaps activity and deliverable IDs of the seven split prefixes', () => {
    expect(toTopRef('netlist from SYN-12 and PD-D3, into TO-05')).toBe('netlist from SYNT-12 and PDT-D3, into TOT-05');
    expect(toTopRef('RTL-05, PDK-02, SIPI-05, ISO-26262, TESTS-1')).toBe('RTL-05, PDK-02, SIPI-05, ISO-26262, TESTS-1');
    expect(baseRefOf('TESTT-06')).toBe('TEST-06');
    expect(baseRefOf('PDT-16')).toBe('PD-16');
  });
});

describe('the top die mirrors the bottom one', () => {
  it('has a stage per split stage, effort at the share, deliverables it can be told apart by', () => {
    expect(TOP_DIE_STAGES.map((s) => s.id)).toEqual(TOP_DIE_SPLIT.map((s) => s.key));
    for (const split of TOP_DIE_SPLIT) {
      const base = journeyData.find((s) => s.id === split.base)!;
      const top = TOP_DIE_STAGES.find((s) => s.id === split.key)!;
      expect(top.shortTitle).toBe(split.to);
      expect(top.title).toBe(`${base.title} — Top Die`);
      top.engineeringEffort.forEach((mm, i) => expect(mm).toBeCloseTo(base.engineeringEffort[i] * TOP_DIE_SHARE, 9));
      expect(top.deliverables).toHaveLength(base.deliverables.length);
      for (const d of top.deliverables) expect(Object.values(detailDeliverables)).not.toContain(d);
    }
  });

  it('runs every activity of the base stage, same steps and outputs, remapped relations', () => {
    for (const split of TOP_DIE_SPLIT) {
      const baseRefs = Object.keys(activitySteps).filter((r) => activitySteps[r].st === split.base);
      const topRefs = Object.keys(TOP_DIE_ACTIVITIES).filter((r) => TOP_DIE_ACTIVITIES[r].st === split.key);
      expect(topRefs).toEqual(baseRefs.map(toTopRef));
      for (const ref of topRefs) {
        const a = TOP_DIE_ACTIVITIES[ref];
        const b = activitySteps[baseRefOf(ref)];
        expect(a.s).toBe(b.s);
        expect(a.o).toBe(b.o);
        expect(a.w).toEqual(b.w);
        expect(a.ro).toBe(b.ro);
        expect(a.r).toEqual(b.r.map(([d, rel]) => [toTopRef(d), rel]));
        for (const [d] of a.r) expect(TOP_DIE_DELIVERABLES[d], `${ref} → ${d}`).toBeTruthy();
        expect(TOP_DIE_ACTIVITY_TITLES[ref]).toBe(`${detailActivityTitles[baseRefOf(ref)]} (Top Die)`);
        expect(activitySteps[ref], `${ref} collides with an SoC ref`).toBeUndefined();
      }
      const top = TOP_DIE_STAGES.find((s) => s.id === split.key)!;
      expect(top.engineeringView).toEqual(topRefs.map((r) => TOP_DIE_ACTIVITY_TITLES[r]));
    }
  });

  it('tags both dies’ deliverable rows, each with its own die’s reference', () => {
    const prefixOf: Record<string, string> = {};
    for (const [ref, a] of Object.entries({ ...activitySteps, ...TOP_DIE_ACTIVITIES })) prefixOf[ref.split('-')[0]] = a.st;
    const stages = [...journeyData, ...TOP_DIE_STAGES];
    const rows = stages.flatMap((s) => s.deliverables.map((title, i) => ({ id: `${s.id}:${i}`, title, stageId: s.id })));
    const refOf = deliverableRefs(rows, { ...detailDeliverables, ...TOP_DIE_DELIVERABLES }, prefixOf);
    for (const s of TOP_DIE_STAGES) {
      s.deliverables.forEach((_, i) => expect(refOf.get(`${s.id}:${i}`)).toBe(`${s.shortTitle}-D${i + 1}`));
    }
  });
});

describe('a top-die write-up is its base write-up, pointed at the top die', () => {
  it('remaps stage, relations, connections and prose, and scales the effort', () => {
    for (const ref of Object.keys(TOP_DIE_ACTIVITIES)) {
      const d = topDieDetail(ref)!;
      const b = activityDetail(baseRefOf(ref))!;
      expect(d, ref).toBeTruthy();
      expect(d.stage).toBe(TOP_DIE_ACTIVITIES[ref].st);
      expect(d.steps).toBe(b.steps);
      expect(d.rel.map((r) => r.id)).toEqual(b.rel.map((r) => toTopRef(r.id)));
      expect(d.links.dependsOn).toEqual(b.links.dependsOn.map(toTopRef));
      expect(d.purpose).toEqual(b.purpose.map(toTopRef));
      d.effort.forEach(([, mm], i) => expect(mm).toBeCloseTo(b.effort[i][1] * TOP_DIE_SHARE, 9));
    }
    expect(topDieDetail('PD-06')).toBeUndefined();
  });
});
