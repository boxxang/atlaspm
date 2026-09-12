import { describe, expect, it } from 'vitest';
import { journeyData } from '@/data/journey';
import { activitySteps } from '@/data/activitySteps';
import { detailActivityTitles, detailDeliverables } from '@/data/activityIndex';
import { deliverableRefs } from '@/lib/deliverableRefs';

/**
 * The arrays in journey.ts that are positions rather than values.
 *
 * A stage carries `engineeringView`, `engineeringTat`, `engineeringEffort` and
 * `engineeringStart`, all index-aligned to the stage's activity list, and
 * `deliverableFrom`, which holds indices into that same list. The file's header
 * has always said so. Nothing checked it.
 *
 * Renumbering the activities by schedule reordered that list. The generator
 * rewrote `engineeringView` to match and left the other four where they were,
 * so 141 activities wore another activity's elapsed weeks and man-months and
 * 112 deliverables named the wrong producer. Every reference in the repository
 * was correct; only the positions were wrong, and positions are invisible to a
 * check that looks for references.
 *
 * These are the invariants that would have caught it in the same minute.
 */

const refsOf = (stageId: string): string[] =>
  Object.keys(activitySteps).filter((ref) => activitySteps[ref].st === stageId);

describe('a stage’s activity arrays line up with its activities', () => {
  it('has one entry per activity in all four', () => {
    for (const s of journeyData) {
      const n = refsOf(s.id).length;
      expect(s.engineeringView, s.id).toHaveLength(n);
      expect(s.engineeringTat, s.id).toHaveLength(n);
      expect(s.engineeringEffort, s.id).toHaveLength(n);
      expect(s.engineeringStart, s.id).toHaveLength(n);
    }
  });

  it('names the activity the index actually holds', () => {
    for (const s of journeyData) {
      refsOf(s.id).forEach((ref, i) => {
        expect(s.engineeringView[i], `${s.id}[${i}] should be ${ref}`).toBe(
          detailActivityTitles[ref],
        );
      });
    }
  });

  /**
   * Elapsed weeks are the activity's own window, and the sign is the flag for
   * one that runs continuously rather than a duration of its own. So the
   * magnitudes have to agree exactly — this is the check that turns a shuffled
   * array from invisible into loud.
   */
  it('gives each activity its own elapsed weeks', () => {
    for (const s of journeyData) {
      refsOf(s.id).forEach((ref, i) => {
        const a = activitySteps[ref];
        expect(Math.abs(s.engineeringTat[i]), `${ref} in ${s.id}`).toBeCloseTo(a.w[1] - a.w[0], 5);
      });
    }
  });

  /* Man-months are authored per activity and derivable from nothing, so the
     only thing to hold is that they are positive and there is one each. */
  it('gives each activity a positive man-month figure', () => {
    for (const s of journeyData) {
      for (const [i, mm] of s.engineeringEffort.entries()) {
        expect(mm, `${s.id}[${i}]`).toBeGreaterThan(0);
      }
    }
  });
});

describe('deliverableFrom points at the activity that makes the deliverable', () => {
  const prefixOf: Record<string, string> = {};
  for (const [ref, a] of Object.entries(activitySteps)) prefixOf[ref.split('-')[0]] = a.st;

  const rows = journeyData.flatMap((s) =>
    s.deliverables.map((title, i) => ({ id: `${s.id}:${i}`, title, stageId: s.id })),
  );
  const refOf = deliverableRefs(rows, detailDeliverables, prefixOf);

  /** The authoring corpus's own claim about who produces what. */
  const produces: Record<string, string> = {};
  for (const [ref, a] of Object.entries(activitySteps)) {
    for (const [dref, rel] of a.r) if (rel === 'produces') produces[dref] = ref;
  }

  it('indexes an activity the stage actually runs', () => {
    for (const s of journeyData) {
      const n = refsOf(s.id).length;
      expect(s.deliverableFrom, s.id).toHaveLength(s.deliverables.length);
      for (const [i, at] of s.deliverableFrom.entries()) {
        expect(at, `${s.id} deliverable ${i + 1}`).toBeGreaterThanOrEqual(0);
        expect(at, `${s.id} deliverable ${i + 1}`).toBeLessThan(n);
      }
    }
  });

  /**
   * Two sources say who produces a deliverable: this array, and the `produces`
   * edge in the authoring corpus. They agree on 153 of 167 and have disagreed
   * on these fourteen since before any of this work — a separate inconsistency
   * that has not been reviewed and is not being papered over here.
   *
   * The number is what matters: when the renumbering shuffled the array, it
   * went from fourteen to a hundred and twelve.
   */
  const KNOWN_DISAGREEMENTS = [
    'ARCH-D7', 'TECH-D1', 'PDK-D2', 'AMS-D2', 'TC-D3', 'RTL-D7', 'DV-D8',
    'PD-D9', 'TO-D5', 'PKGD-D3', 'ASSY-D1', 'ASSY-D2', 'TEST-D4', 'MP-D5',
  ];

  it('agrees with the corpus everywhere but the fourteen known rows', () => {
    const differ: string[] = [];
    for (const s of journeyData) {
      const refs = refsOf(s.id);
      s.deliverables.forEach((_, i) => {
        const dref = refOf.get(`${s.id}:${i}`);
        const made = dref && produces[dref];
        const named = refs[s.deliverableFrom[i]];
        if (dref && made && named && made !== named) differ.push(dref);
      });
    }
    expect(differ.sort()).toEqual([...KNOWN_DISAGREEMENTS].sort());
  });
});
