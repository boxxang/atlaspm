import { describe, expect, it } from 'vitest';
import {
  BUILTIN_PROFILE,
  STAGE_ORDER,
  milestoneDefs,
  scheduleProfiles,
} from '@/data/scheduleProfiles';
import { journeyData } from '@/data/journey';
import type { StageId } from '@/data/types';
import {
  addWeeks,
  applyDateEdit,
  computeSchedule,
  fmtDT,
  fmtDate,
  fmtW,
  fromISO,
  hasOverrides,
  materializeOverrides,
  resetOverrides,
  toISO,
} from '@/lib/schedule';

const typicalSoC = scheduleProfiles.typicalSoC;
const KICKOFF = new Date(2027, 4, 12); // 05/12/2027
const baseline = () => computeSchedule(KICKOFF, typicalSoC, {});
const span = (s: ReturnType<typeof baseline>, id: StageId) =>
  [fmtDate(s.stages[id].start), fmtDate(s.stages[id].end)];

describe('stage ordering', () => {
  it('matches journeyData and the profile key order', () => {
    expect([...STAGE_ORDER]).toEqual(journeyData.map((s) => s.id));
    expect([...STAGE_ORDER]).toEqual(typicalSoC.stages.map((st) => st.key));
  });
});

describe('(a) baseline schedule for kickoff 05/12/2027', () => {
  const s = baseline();

  it('places every stage on the spec dates', () => {
    expect(Object.fromEntries(STAGE_ORDER.map((id) => [id, span(s, id)]))).toEqual({
      productDefinition: ['05/12/2027', '07/07/2027'],
      architecture: ['06/23/2027', '10/27/2027'],
      technology: ['05/12/2027', '08/18/2027'],
      pdk: ['07/07/2027', '03/15/2028'],
      ipReadiness: ['06/09/2027', '11/10/2027'],
      amsIp: ['09/15/2027', '07/05/2028'],
      testChip: ['10/13/2027', '07/19/2028'],
      rtl: ['09/29/2027', '05/10/2028'],
      verification: ['11/10/2027', '08/16/2028'],
      dft: ['09/15/2027', '06/21/2028'],
      synthesis: ['03/01/2028', '08/16/2028'],
      physicalDesign: ['03/29/2028', '10/25/2028'],
      signoff: ['07/19/2028', '11/08/2028'],
      tapeout: ['11/08/2028', '01/03/2029'],
      fabrication: ['11/22/2028', '04/04/2029'],
      packageDesign: ['10/27/2027', '10/25/2028'],
      packageTestVehicle: ['01/19/2028', '01/17/2029'],
      chipPackageCoVerification: ['04/26/2028', '10/25/2028'],
      packaging: ['10/25/2028', '05/30/2029'],
      validationHardware: ['05/10/2028', '01/31/2029'],
      testDevelopment: ['05/24/2028', '03/14/2029'],
      bringup: ['05/23/2029', '09/26/2029'],
      qualification: ['06/20/2029', '12/19/2029'],
    });
  });

  it('exposes the three toolbar dates and the program length', () => {
    expect(fmtDate(s.tapeout!)).toBe('01/03/2029');
    expect(fmtDate(s.firstSilicon!)).toBe('04/04/2029');
    expect(fmtDate(s.production!)).toBe('12/19/2029');
    expect(s.totalWeeks).toBe(136);
  });

  it('keeps stages overlapping — the program is concurrent by design', () => {
    expect(s.stages.architecture.start < s.stages.productDefinition.end).toBe(true);
    expect(s.stages.verification.start < s.stages.rtl.end).toBe(true);
  });
});

describe('(d) milestones anchor to stage ends', () => {
  it('dates every milestone at its anchor stage boundary', () => {
    const s = baseline();
    for (const m of s.milestones) {
      const st = s.stages[m.anchor.stage];
      expect(m.date).toEqual(m.anchor.at === 'end' ? st.end : st.start);
      expect(m.week).toBe(
        m.anchor.at === 'end'
          ? st.startOffsetWeeks + st.durationWeeks
          : st.startOffsetWeeks,
      );
    }
    expect(s.milestones).toHaveLength(milestoneDefs.length);
  });

  it('names the three major milestones', () => {
    const major = baseline().milestones.filter((m) => m.major);
    expect(major.map((m) => m.label)).toEqual([
      'Tapeout (BEOL MTO)',
      'First Silicon',
      'Mass Production',
    ]);
  });

  it('tracks the stage end after an edit', () => {
    const base = baseline();
    const ov = applyDateEdit(
      typicalSoC,
      {},
      base,
      'verification',
      'end',
      addWeeks(base.stages.verification.end, 4),
    );
    const s = computeSchedule(KICKOFF, typicalSoC, ov);
    const dv = s.milestones.find((m) => m.id === 'dvClosure')!;
    expect(dv.date).toEqual(s.stages.verification.end);
    expect(fmtDate(dv.date)).toBe('09/13/2028');
  });
});

describe('(b) DV end edit ripples downstream', () => {
  const base = baseline();
  const newEnd = new Date(base.stages.verification.end);
  newEnd.setDate(newEnd.getDate() + 28);
  const ov = applyDateEdit(typicalSoC, {}, base, 'verification', 'end', newEnd);
  const s = computeSchedule(KICKOFF, typicalSoC, ov);

  it('moves DV TAT from 40W to 44W', () => {
    expect(fmtW(base.stages.verification.durationWeeks)).toBe('40W');
    expect(fmtW(s.stages.verification.durationWeeks)).toBe('44W');
    expect(fmtDate(s.stages.verification.end)).toBe('09/13/2028');
  });

  it('leaves the DV start put', () => {
    expect(s.stages.verification.start).toEqual(base.stages.verification.start);
  });

  it('moves Tapeout exactly +28 days', () => {
    const delta =
      (s.stages.tapeout.end.getTime() - base.stages.tapeout.end.getTime()) / 864e5;
    expect(Math.round(delta)).toBe(28);
    expect(fmtDate(s.tapeout!)).toBe('01/31/2029');
  });

  it('shifts every later stage by the same 28 days, and no earlier one', () => {
    for (const id of STAGE_ORDER) {
      const d = Math.round(
        (s.stages[id].start.getTime() - base.stages[id].start.getTime()) / 864e5,
      );
      const later = STAGE_ORDER.indexOf(id) > STAGE_ORDER.indexOf('verification');
      expect([id, d]).toEqual([id, later ? 28 : 0]);
    }
  });

  it('flags the schedule as edited', () => {
    expect(hasOverrides(typicalSoC, {})).toBe(false);
    expect(hasOverrides(typicalSoC, ov)).toBe(true);
  });
});

describe('start edits shift the stage and everything after it', () => {
  const base = baseline();
  const newStart = new Date(base.stages.physicalDesign.start);
  newStart.setDate(newStart.getDate() + 14);
  const ov = applyDateEdit(typicalSoC, {}, base, 'physicalDesign', 'start', newStart);
  const s = computeSchedule(KICKOFF, typicalSoC, ov);

  it('moves the stage without changing its duration', () => {
    expect(s.stages.physicalDesign.durationWeeks).toBe(
      base.stages.physicalDesign.durationWeeks,
    );
    const shift = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 864e5);
    expect(shift(s.stages.physicalDesign.start, base.stages.physicalDesign.start)).toBe(14);
    expect(shift(s.stages.physicalDesign.end, base.stages.physicalDesign.end)).toBe(14);
  });

  it('carries the shift to every later stage', () => {
    const shift = Math.round(
      (s.stages.qualification.start.getTime() -
        base.stages.qualification.start.getTime()) / 864e5,
    );
    expect(shift).toBe(14);
    expect(s.stages.signoff.start > base.stages.signoff.start).toBe(true);
    expect(s.stages.synthesis.start).toEqual(base.stages.synthesis.start);
  });
});

describe('fractional weeks preserve days', () => {
  it('survives a 3-day end edit as whole days', () => {
    const base = baseline();
    const newEnd = new Date(base.stages.rtl.end);
    newEnd.setDate(newEnd.getDate() + 3);
    const ov = applyDateEdit(typicalSoC, {}, base, 'rtl', 'end', newEnd);
    const s = computeSchedule(KICKOFF, typicalSoC, ov);
    expect(s.stages.rtl.end).toEqual(newEnd);
    expect(fmtW(s.stages.rtl.durationWeeks)).toBe('32.4W');
    const shift =
      (s.stages.tapeout.end.getTime() - base.stages.tapeout.end.getTime()) / 864e5;
    expect(Math.round(shift)).toBe(3);
  });

  it('never shrinks a stage below one day', () => {
    const base = baseline();
    const way = new Date(base.stages.tapeout.start);
    way.setDate(way.getDate() - 90);
    const ov = applyDateEdit(typicalSoC, {}, base, 'tapeout', 'end', way);
    expect(ov.tapeout.durationWeeks).toBeCloseTo(1 / 7, 10);
    const s = computeSchedule(KICKOFF, typicalSoC, ov);
    const days =
      (s.stages.tapeout.end.getTime() - s.stages.tapeout.start.getTime()) / 864e5;
    expect(Math.round(days)).toBe(1);
  });

  it('stacks successive edits', () => {
    const base = baseline();
    const e1 = applyDateEdit(
      typicalSoC, {}, base, 'verification', 'end',
      addWeeks(base.stages.verification.end, 2),
    );
    const s1 = computeSchedule(KICKOFF, typicalSoC, e1);
    const e2 = applyDateEdit(
      typicalSoC, e1, s1, 'verification', 'end',
      addWeeks(s1.stages.verification.end, 2),
    );
    const s2 = computeSchedule(KICKOFF, typicalSoC, e2);
    expect(fmtW(s2.stages.verification.durationWeeks)).toBe('44W');
    expect(fmtDate(s2.stages.tapeout.end)).toBe('01/31/2029');
  });
});

describe('(c) reset restores the baseline', () => {
  it('drops every override', () => {
    const base = baseline();
    const ov = applyDateEdit(
      typicalSoC, {}, base, 'verification', 'end',
      addWeeks(base.stages.verification.end, 4),
    );
    expect(computeSchedule(KICKOFF, typicalSoC, ov).tapeout).not.toEqual(base.tapeout);

    const reset = resetOverrides();
    const s = computeSchedule(KICKOFF, typicalSoC, reset);
    expect(hasOverrides(typicalSoC, reset)).toBe(false);
    for (const id of STAGE_ORDER) {
      expect(s.stages[id].start).toEqual(base.stages[id].start);
      expect(s.stages[id].end).toEqual(base.stages[id].end);
    }
  });

  it('treats materialized baseline values as unedited', () => {
    const full = materializeOverrides(typicalSoC, {});
    expect(hasOverrides(typicalSoC, full)).toBe(false);
    expect(computeSchedule(KICKOFF, typicalSoC, full).stages).toEqual(baseline().stages);
  });
});

describe('formatters', () => {
  it('prints MM/DD/YYYY everywhere', () => {
    expect(fmtDate(new Date(2027, 4, 12))).toBe('05/12/2027');
    expect(fmtDate(new Date(2028, 11, 1))).toBe('12/01/2028');
  });

  it('round-trips ISO for the toolbar date input', () => {
    expect(toISO(new Date(2027, 4, 12))).toBe('2027-05-12');
    expect(fromISO('2027-05-12')).toEqual(new Date(2027, 4, 12));
    expect(toISO(fromISO('2028-02-29'))).toBe('2028-02-29');
  });

  it('prints weeks with at most one decimal', () => {
    expect(fmtW(16)).toBe('16W');
    expect(fmtW(20.0059)).toBe('20W');
    expect(fmtW(12.4286)).toBe('12.4W');
    expect(fmtW(1 / 7)).toBe('0.1W');
  });

  it('prints date · time for status updates', () => {
    expect(fmtDT(new Date(2027, 4, 12, 9, 5))).toBe('05/12/2027 · 09:05');
    expect(fmtDT(new Date(2027, 4, 12, 14, 30))).toBe('05/12/2027 · 14:30');
  });

  it('addWeeks rounds fractional weeks to whole days', () => {
    expect(addWeeks(new Date(2027, 4, 12), 1)).toEqual(new Date(2027, 4, 19));
    expect(addWeeks(new Date(2027, 4, 12), 1 / 7)).toEqual(new Date(2027, 4, 13));
    expect(addWeeks(new Date(2027, 4, 12), -30)).toEqual(new Date(2026, 9, 14));
  });
});

/**
 * Three stages of the built-in profile close on the same day, and two more do
 * as a pair. Anything pairing a checkpoint with a stage has to go by the
 * anchor: matching on the date put Package Design Freeze on Physical Design,
 * which carries no checkpoint at all.
 */
describe('a checkpoint belongs to the stage it is anchored to', () => {
  const schedule = computeSchedule(new Date(2025, 4, 24), BUILTIN_PROFILE, {});

  it('every checkpoint lands on its own stage’s end', () => {
    for (const m of schedule.milestones) {
      expect(m.date.getTime()).toBe(schedule.stages[m.anchor.stage].end.getTime());
    }
  });

  /* The coincidence this is guarding against. If the seed ever changes so that
     these no longer collide, the guard is still right — but the reader should
     know the collision was real. */
  it('several stages really do close on the same day', () => {
    const byDay = new Map<number, string[]>();
    for (const st of BUILTIN_PROFILE.stages) {
      const t = schedule.stages[st.key].end.getTime();
      byDay.set(t, [...(byDay.get(t) ?? []), st.key]);
    }
    const shared = [...byDay.values()].filter((keys) => keys.length > 1);
    expect(shared.length).toBeGreaterThan(0);
    expect(shared.some((keys) => keys.includes('physicalDesign') && keys.includes('packageDesign'))).toBe(
      true,
    );
  });

  /* Each of the colliding stages gets its own, never the neighbour's. */
  it('stages that close together keep their own checkpoints', () => {
    const of = (id: string) => schedule.milestones.filter((m) => m.anchor.stage === id);
    expect(of('physicalDesign').map((m) => m.label)).toEqual(['PD Database Handoff']);
    expect(of('packageDesign').map((m) => m.label)).toEqual(['Package Design Freeze']);
    expect(of('chipPackageCoVerification').map((m) => m.label)).toEqual([
      'Co-Verification Signoff',
    ]);
    expect(of('verification').map((m) => m.label)).toEqual(['DV Closure']);
    expect(of('synthesis').map((m) => m.label)).toEqual(['FFN Release']);
  });

  /* The rule the seed now keeps: every stage closes on something, and on
     exactly one thing. A stage whose end date nobody can name is a stage
     nobody can give you the status of. */
  it('every stage carries exactly one checkpoint', () => {
    for (const st of BUILTIN_PROFILE.stages) {
      const mine = schedule.milestones.filter((m) => m.anchor.stage === st.key);
      expect(mine, `${st.key} carries ${mine.length}`).toHaveLength(1);
    }
    expect(schedule.milestones).toHaveLength(BUILTIN_PROFILE.stages.length);
  });

  /* and only three of them are what the countdowns read */
  it('three of them are major, and they are the ones every screen counts to', () => {
    expect(schedule.milestones.filter((m) => m.major).map((m) => m.label)).toEqual([
      'Tapeout (BEOL MTO)',
      'First Silicon',
      'Mass Production',
    ]);
  });
});
