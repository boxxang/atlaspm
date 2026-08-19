import { describe, expect, it } from 'vitest';
import { STAGE_ORDER, milestoneDefs, scheduleProfiles } from '@/data/scheduleProfiles';
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
    expect([...STAGE_ORDER]).toEqual(Object.keys(typicalSoC.stages));
  });
});

describe('(a) baseline schedule for kickoff 05/12/2027', () => {
  const s = baseline();

  it('places every stage on the spec dates', () => {
    expect(Object.fromEntries(STAGE_ORDER.map((id) => [id, span(s, id)]))).toEqual({
      productDefinition: ['05/12/2027', '06/09/2027'],
      architecture: ['06/02/2027', '07/14/2027'],
      rtl: ['06/30/2027', '09/22/2027'],
      verification: ['07/21/2027', '11/10/2027'],
      synthesis: ['09/29/2027', '10/27/2027'],
      physicalDesign: ['10/13/2027', '01/05/2028'],
      signoff: ['12/15/2027', '01/26/2028'],
      tapeout: ['01/26/2028', '02/02/2028'],
      fabrication: ['02/02/2028', '03/29/2028'],
      packaging: ['03/29/2028', '04/26/2028'],
      bringup: ['04/26/2028', '06/07/2028'],
      qualification: ['05/24/2028', '08/16/2028'],
    });
  });

  it('exposes the three toolbar dates and the program length', () => {
    expect(fmtDate(s.tapeout)).toBe('02/02/2028');
    expect(fmtDate(s.firstSilicon)).toBe('03/29/2028');
    expect(fmtDate(s.production)).toBe('08/16/2028');
    expect(s.totalWeeks).toBe(66);
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
      'Tapeout',
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
    expect(fmtDate(dv.date)).toBe('12/08/2027');
  });
});

describe('(b) DV end edit ripples downstream', () => {
  const base = baseline();
  const newEnd = new Date(base.stages.verification.end);
  newEnd.setDate(newEnd.getDate() + 28);
  const ov = applyDateEdit(typicalSoC, {}, base, 'verification', 'end', newEnd);
  const s = computeSchedule(KICKOFF, typicalSoC, ov);

  it('moves DV TAT from 16W to 20W', () => {
    expect(fmtW(base.stages.verification.durationWeeks)).toBe('16W');
    expect(fmtW(s.stages.verification.durationWeeks)).toBe('20W');
    expect(fmtDate(s.stages.verification.end)).toBe('12/08/2027');
  });

  it('leaves the DV start put', () => {
    expect(s.stages.verification.start).toEqual(base.stages.verification.start);
  });

  it('moves Tapeout exactly +28 days', () => {
    const delta =
      (s.stages.tapeout.end.getTime() - base.stages.tapeout.end.getTime()) / 864e5;
    expect(Math.round(delta)).toBe(28);
    expect(fmtDate(s.tapeout)).toBe('03/01/2028');
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
    expect(fmtW(s.stages.rtl.durationWeeks)).toBe('12.4W');
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
    expect(fmtW(s2.stages.verification.durationWeeks)).toBe('20W');
    expect(fmtDate(s2.stages.tapeout.end)).toBe('03/01/2028');
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
