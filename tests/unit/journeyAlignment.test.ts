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

  /** Every activity the corpus says produces each deliverable — often several. */
  const produces: Record<string, string[]> = {};
  for (const [ref, a] of Object.entries(activitySteps)) {
    for (const [dref, rel] of a.r) if (rel === 'produces') (produces[dref] ??= []).push(ref);
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
   * `deliverableFrom` is derived from the corpus now, not written by hand —
   * see tools/derive-deliverable-from.mjs. Two sources used to answer this and
   * disagreed on fourteen of the hundred and sixty-seven; six of those were not
   * disagreements at all, because a deliverable may have several producers
   * (twenty-seven do) and the array can only name one.
   *
   * What is left is one rule, and these are its two halves: the activity named
   * must actually claim to produce the deliverable, and among those that do it
   * must be the one a reader would be sent to — the last discrete contributor,
   * since a continuous activity runs throughout and gates nothing.
   */
  it('names an activity that claims to produce it', () => {
    for (const s of journeyData) {
      const refs = refsOf(s.id);
      s.deliverables.forEach((title, i) => {
        const dref = refOf.get(`${s.id}:${i}`);
        expect(dref, `${s.id} deliverable ${i + 1} ("${title}") resolves to no reference`).toBeTruthy();
        const named = refs[s.deliverableFrom[i]];
        expect(produces[dref!], `${dref} has no producer`).toContain(named);
      });
    }
  });

  it('names the last discrete producer of the ones that do', () => {
    /* the flag for an activity that runs throughout rather than for a length */
    const continuous = new Set<string>();
    for (const s of journeyData) {
      refsOf(s.id).forEach((ref, i) => {
        if (s.engineeringTat[i] < 0) continuous.add(ref);
      });
    }
    const later = (a: string, b: string) =>
      Number(continuous.has(a)) - Number(continuous.has(b)) ||
      activitySteps[b].w[1] - activitySteps[a].w[1] ||
      activitySteps[b].w[0] - activitySteps[a].w[0] ||
      a.localeCompare(b);

    for (const s of journeyData) {
      const refs = refsOf(s.id);
      s.deliverables.forEach((_, i) => {
        const dref = refOf.get(`${s.id}:${i}`)!;
        const best = [...produces[dref]].sort(later)[0];
        expect(refs[s.deliverableFrom[i]], `${dref} should name ${best}`).toBe(best);
      });
    }
  });
});
