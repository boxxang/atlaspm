import { describe, expect, it } from 'vitest';
import { activitySteps } from '@/data/activitySteps';
import { BUILTIN_PROFILE } from '@/data/scheduleProfiles';
import { journeyData } from '@/data/journey';

/**
 * Work cannot start before the thing it consumes exists.
 *
 * Four of these were wrong and none of them looked wrong, because the template
 * is written in weeks and a week number carries no relation to any other. The
 * mask shop was cutting glass two weeks before the data reached it; ATPG closed
 * its coverage nine weeks before the netlist it ran on was released. Both read
 * as ordinary integers.
 *
 * So the relations are written down here as relations. Each one names the two
 * activities and the reason, and none of them can drift back without a test
 * saying which.
 */

const stageStart = (key: string): number => {
  const st = BUILTIN_PROFILE.stages.find((s) => s.key === key);
  if (!st) throw new Error(`no stage ${key}`);
  return st.startOffsetWeeks;
};

/** [start, end] in weeks from the programme's kickoff. */
const span = (ref: string): [number, number] => {
  const a = activitySteps[ref];
  if (!a) throw new Error(`no activity ${ref}`);
  const base = stageStart(a.st);
  return [base + a.w[0], base + a.w[1]];
};

const starts = (ref: string) => span(ref)[0];
const ends = (ref: string) => span(ref)[1];

describe('the manufacturing hand-offs', () => {
  /* The MTO gate: no mask data is released until signoff and the co-verification
     are closed. A mask set that starts before the release is a mask set cut
     from a database nobody has sent. */
  it('FEOL mask fabrication starts after the FEOL data is released and ordered', () => {
    expect(starts('FAB-01')).toBeGreaterThanOrEqual(ends('TO-06'));
    expect(starts('FAB-01')).toBeGreaterThanOrEqual(ends('TO-08'));
  });

  it('BEOL mask fabrication starts after the BEOL data is released and ordered', () => {
    expect(starts('FAB-03')).toBeGreaterThanOrEqual(ends('TO-10'));
    expect(starts('FAB-03')).toBeGreaterThanOrEqual(ends('TO-11'));
  });

  it('wafers start once the FEOL masks exist, not before', () => {
    expect(starts('FAB-05')).toBeGreaterThanOrEqual(ends('FAB-01'));
  });

  it('back-end processing waits for the BEOL masks and the front end', () => {
    expect(starts('FAB-07')).toBeGreaterThanOrEqual(ends('FAB-03'));
    expect(starts('FAB-07')).toBeGreaterThanOrEqual(ends('FAB-06') - 1);
  });

  /* The whole fabrication stage sits after the mask order, which is the rule
     the stage was moved from week 79 to 80 for and then moved again to 82. */
  it('nothing in fabrication precedes the mask order', () => {
    const order = ends('TO-08');
    for (const [ref, a] of Object.entries(activitySteps)) {
      if (a.st !== 'fabrication') continue;
      expect(starts(ref), `${ref} starts before the masks are ordered`).toBeGreaterThanOrEqual(
        order - 1,
      );
    }
  });
});

describe('the DFT hand-offs', () => {
  /* Scan insertion happens inside synthesis; it cannot happen before synthesis
     has a netlist to insert into. */
  it('scan insertion runs during synthesis, not before it', () => {
    expect(starts('DFT-08')).toBeGreaterThanOrEqual(starts('SYN-01'));
    expect(ends('DFT-08')).toBeLessThanOrEqual(ends('SYN-12'));
  });

  it('scan routing feasibility waits for a floorplan', () => {
    expect(starts('DFT-09')).toBeGreaterThanOrEqual(starts('PD-02'));
  });

  /**
   * The one that prompted this. ATPG closed at week 56 against a final netlist
   * released at 65 and a scan chain reordered at 68 — patterns generated
   * against a design that did not exist yet, and never regenerated after the
   * chains moved underneath them.
   */
  it('ATPG closes after the final netlist and after the chains are reordered', () => {
    expect(ends('DFT-10')).toBeGreaterThanOrEqual(ends('SYN-12'));
    expect(ends('DFT-10')).toBeGreaterThanOrEqual(ends('PD-13'));
  });

  it('pattern validation runs on the closed patterns, not alongside them', () => {
    expect(starts('DFT-11')).toBeGreaterThanOrEqual(ends('SYN-12'));
    expect(ends('DFT-11')).toBeGreaterThanOrEqual(ends('DFT-10'));
  });

  /* Patterns are what the tester runs. Taping out with them still open is
     taping out without knowing whether the part can be tested. */
  it('the patterns are closed by the time the design is frozen', () => {
    expect(ends('DFT-11')).toBeLessThanOrEqual(starts('TO-01'));
  });
});

describe('every activity fits the stage that runs it', () => {
  it('starts at or after the stage and ends at or before it', () => {
    for (const [ref, a] of Object.entries(activitySteps)) {
      const st = BUILTIN_PROFILE.stages.find((s) => s.key === a.st);
      if (!st) continue;
      expect(a.w[0], `${ref} starts before its stage`).toBeGreaterThanOrEqual(0);
      expect(a.w[1], `${ref} runs past its stage`).toBeLessThanOrEqual(st.durationWeeks);
    }
  });
});

/**
 * A key deliverable is not due before the activity that produces it finishes.
 *
 * Scoped to DFT, the stage whose deliverable dates this correction moved.
 *
 * The rule holds across the whole template in principle and does not hold in
 * fact: forty-three other deliverables are dated ahead of the activity that
 * produces them — FAB-D1 by one week, PDK-D1 by twenty-six. Every one of them
 * predates this change and none has been reviewed, so widening the test would
 * be asserting a schedule nobody has checked. The count is written down here
 * rather than the test being quietly narrowed to whatever passes.
 *
 * Moving DFT-10 and DFT-11 to close after the final netlist left their
 * deliverables behind at week 58, due fourteen and twenty weeks before the work
 * that makes them. That is what this covers.
 */
describe('a deliverable is not due before what makes it', () => {
  const producer: Record<string, string> = {};
  for (const [ref, a] of Object.entries(activitySteps)) {
    for (const [dref, rel] of a.r) if (rel === 'produces') producer[dref] = ref;
  }

  const stageOf = (key: string) => BUILTIN_PROFILE.stages.find((s) => s.key === key)!;

  for (const stageKey of ['dft'] as const) {
    it(`holds for every ${stageKey} deliverable`, () => {
      const stage = stageOf(stageKey);
      const j = journeyData.find((s) => s.id === stageKey)!;
      const weeks = j.deliverableWeek ?? [];
      expect(weeks.length).toBe(j.deliverables.length);

      j.deliverables.forEach((title, i) => {
        const ref = `${stage.shortTitle}-D${i + 1}`;
        const made = producer[ref];
        if (!made) return;
        const due = stage.startOffsetWeeks + weeks[i];
        expect(due, `${ref} (${title}) is due before ${made} finishes`).toBeGreaterThanOrEqual(
          ends(made),
        );
      });
    });
  }
});
