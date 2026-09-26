import { describe, expect, it } from 'vitest';
import { activitySteps } from '@/data/activitySteps';
import { detailActivityTitles, detailDeliverables } from '@/data/activityIndex';
import { ALL_ACTIVITIES, ALL_DELIVERABLE_TITLES, BUILTIN_PROFILES, stageContent } from '@/data/builtins';
import {
  EMBEDDED_ACTIVITIES,
  EMBEDDED_ACTIVITY_TITLES,
  EMBEDDED_DELIVERABLES,
  EMBEDDED_INHERITED_KEYS,
  EMBEDDED_MILESTONES,
  EMBEDDED_PROFILE,
  EMBEDDED_STAGES,
  EMBEDDED_STAGE_KEYS,
} from '@/data/embeddedSoc';
import {
  EMBEDDED_DERIVED,
  EMBEDDED_DERIVED_ACTIVITIES,
  EMBEDDED_DERIVED_ACTIVITY_TITLES,
  EMBEDDED_DERIVED_STAGES,
  EMBEDDED_DROPPED,
  COUNTDOWN_STAGES,
  socRefOf,
} from '@/data/embeddedSocDerived';
import { EMBEDDED_EDITS } from '@/data/embeddedSocEdits';
import { journeyData } from '@/data/journey';
import { BASELINES, BUILTIN_PROFILE, lifecyclePhases, milestoneDefs } from '@/data/scheduleProfiles';
import { THREE_DIC_ACTIVITIES } from '@/data/threeDic';
import { TOP_DIE_ACTIVITIES } from '@/data/threeDicTopDie';
import { deliverableRefs } from '@/lib/deliverableRefs';
import { deliverableStep, producersOf } from '@/lib/deliverableStatus';
import { computeSchedule } from '@/lib/schedule';

/**
 * The Embedded SoC template: an ultra-low-power embedded processor sold with
 * its own compiler, SDK and evaluation kit.
 *
 * Three kinds of stage, and each is held to something different. The ones it
 * inherits from the SoC flow are the SoC's, untouched. The ones it derives are
 * the SoC's work at embedded scale, and must say nothing about hardware an
 * embedded part does not have. The ones it adds are authored, and held to the
 * invariants every other template's content is held to.
 */

const prefix = (ref: string) => ref.split('-')[0];
const own = [...EMBEDDED_STAGES, ...EMBEDDED_DERIVED_STAGES];
const ownActivities = { ...EMBEDDED_DERIVED_ACTIVITIES, ...EMBEDDED_ACTIVITIES };
const ownTitles = { ...EMBEDDED_DERIVED_ACTIVITY_TITLES, ...EMBEDDED_ACTIVITY_TITLES };
const refsOf = (stageKey: string) =>
  Object.keys(ownActivities).filter((ref) => ownActivities[ref].st === stageKey);

const stageAt = (key: string) => {
  const st = EMBEDDED_PROFILE.stages.find((s) => s.key === key);
  if (!st) throw new Error(`no stage ${key}`);
  return { start: st.startOffsetWeeks, end: st.startOffsetWeeks + st.durationWeeks };
};
/** [start, end] of an activity, in weeks from kickoff, in this template. */
const span = (ref: string) => {
  const a = ALL_ACTIVITIES[ref];
  if (!a) throw new Error(`no activity ${ref}`);
  const s = stageAt(a.st);
  return { start: s.start + a.w[0], end: s.start + a.w[1] };
};
/** The embedded counterpart of an SoC activity a derived stage runs. */
const emb = (socRef: string) => {
  const ref = Object.keys(EMBEDDED_DERIVED_ACTIVITIES).find((r) => socRefOf(r) === socRef);
  if (!ref) throw new Error(`${socRef} is not derived`);
  return ref;
};

describe('the Embedded SoC template', () => {
  it('ships as a third built-in, and leaves the other two alone', () => {
    expect(BUILTIN_PROFILES.map((p) => p.id)).toEqual(['typicalSoC', 'threeDic', 'embeddedSoc']);
    expect(EMBEDDED_PROFILE.builtin).toBe(true);
    expect(EMBEDDED_PROFILE.template).toBe(true);
    expect(EMBEDDED_PROFILE.label).toBe('Embedded SoC');
    expect(BUILTIN_PROFILE.stages).toHaveLength(23);
  });

  it('runs the inherited, derived and authored stages, in the order they start', () => {
    const keys = EMBEDDED_PROFILE.stages.map((s) => s.key);
    for (const k of EMBEDDED_INHERITED_KEYS) expect(keys, k).toContain(k);
    for (const d of EMBEDDED_DERIVED) expect(keys, d.key).toContain(d.key);
    for (const k of EMBEDDED_STAGE_KEYS) expect(keys, k).toContain(k);
    expect(keys).toHaveLength(EMBEDDED_INHERITED_KEYS.length + EMBEDDED_DERIVED.length + EMBEDDED_STAGE_KEYS.length);
    expect(new Set(keys).size).toBe(keys.length);

    const starts = EMBEDDED_PROFILE.stages.map((s) => s.startOffsetWeeks);
    expect([...starts].sort((a, b) => a - b)).toEqual(starts);
    EMBEDDED_PROFILE.stages.forEach((s, i) => {
      expect(s.order, s.key).toBe(i);
      expect(s.durationWeeks, s.key).toBeGreaterThan(0);
      expect(stageContent(s.baseKey), `${s.key} shows nothing`).toBeTruthy();
      expect(lifecyclePhases.map((p) => p.id), s.key).toContain(s.phaseId);
    });
  });

  /* The countdowns count to the ends of tapeout, fabrication and
     qualification. The embedded programme runs its own fabrication and
     qualification, and the countdowns read those. */
  it('gives the countdowns their dates, from its own fabrication and qualification', () => {
    expect(COUNTDOWN_STAGES.firstSilicon).toContain('fabricationEmb');
    expect(COUNTDOWN_STAGES.production).toContain('qualificationEmb');
    for (const key of ['tapeout', 'fabricationEmb', 'qualificationEmb']) {
      const st = EMBEDDED_PROFILE.stages.find((s) => s.key === key)!;
      expect(st, key).toBeTruthy();
    }
    const kickoff = new Date('2027-01-04T00:00:00Z');
    const plan = computeSchedule(kickoff, EMBEDDED_PROFILE);
    expect(plan.tapeout).toEqual(plan.stages.tapeout.end);
    expect(plan.firstSilicon).toEqual(plan.stages.fabricationEmb.end);
    expect(plan.production).toEqual(plan.stages.qualificationEmb.end);
    /* and their checkpoints are still the three the countdowns show */
    const majors = plan.milestones.filter((m) => m.major).map((m) => m.label);
    for (const label of ['Tapeout (BEOL MTO)', 'First Silicon', 'Mass Production']) expect(majors).toContain(label);
    /* the SoC programme's countdowns are where they were */
    const soc = computeSchedule(kickoff, BUILTIN_PROFILE);
    expect(soc.firstSilicon).toEqual(soc.stages.fabrication.end);
    expect(soc.production).toEqual(soc.stages.qualification.end);
  });

  it('drops the SoC stages an embedded part has no use for', () => {
    const keys = new Set(EMBEDDED_PROFILE.stages.map((s) => s.key));
    for (const gone of ['packageTestVehicle', 'chipPackageCoVerification', 'amsIp', 'testChip', 'packageDesign', 'packaging']) {
      expect(keys.has(gone), gone).toBe(false);
    }
    /* and runs none of the SoC content it rewrote */
    for (const gone of ['productDefinition', 'architecture', 'technology', 'rtl', 'fabrication', 'qualification']) {
      expect(keys.has(gone), gone).toBe(false);
    }
  });

  it('is shorter and cheaper than the leading-node SoC flow', () => {
    const end = Math.max(...EMBEDDED_PROFILE.stages.map((s) => s.startOffsetWeeks + s.durationWeeks));
    expect(end).toBe(stageAt('qualificationEmb').end);
    expect(end).toBeLessThan(136);
    const mm = (keys: readonly (string | null)[]) =>
      keys.reduce((t, k) => t + stageContent(k)!.engineeringEffort.reduce((a, b) => a + b, 0), 0);
    const soc = mm(BUILTIN_PROFILE.stages.map((s) => s.key));
    const embedded = mm(EMBEDDED_PROFILE.stages.map((s) => s.baseKey));
    expect(embedded / soc).toBeGreaterThan(0.4);
    expect(embedded / soc).toBeLessThan(0.75);
  });
});

/* The request this template answers: the compiler and the EVK ship with the
   part, and the programme is held to dates for both. */
describe('the compiler, SDK and EVK are part of the plan', () => {
  it('runs each as stages of its own, under the platform band', () => {
    for (const key of ['compiler', 'virtualPlatform', 'sdk', 'softwareRelease', 'evkDesign', 'evkLaunch', 'earlyAccess']) {
      expect(EMBEDDED_PROFILE.stages.find((s) => s.key === key)?.phaseId, key).toBe('platform');
    }
    const said = (stage: string) =>
      refsOf(stage)
        .map((r) => `${ownTitles[r]} ${ownActivities[r].s.map((s) => s[1]).join(' ')}`)
        .join(' ')
        .toLowerCase();
    for (const w of ['llvm', 'mlir', 'litert', 'onnx', 'simulator', 'energy profiler', 'alpha']) {
      expect(said('compiler'), `the compiler never mentions ${w}`).toContain(w);
    }
    for (const w of ['arduino', 'current', 'jtag', 'battery']) {
      expect(said('evkDesign'), `the EVK never mentions ${w}`).toContain(w);
    }
    for (const w of ['fcc', 'ce', 'pvt', 'general availability']) {
      expect(said('evkLaunch'), `the EVK launch never mentions ${w}`).toContain(w);
    }
    for (const w of ['boot rom', 'zephyr', 'freertos', 'hal']) {
      expect(said('sdk'), `the SDK never mentions ${w}`).toContain(w);
    }
  });

  it('closes each on a checkpoint', () => {
    const at = (stage: string) => EMBEDDED_MILESTONES.find((m) => m.anchor.stage === stage)?.label;
    expect(at('compiler')).toBe('Compiler Alpha');
    expect(at('virtualPlatform')).toBe('Developer Playground Launch');
    expect(at('sdk')).toBe('SDK Beta on Silicon');
    expect(at('softwareRelease')).toBe('Compiler & SDK 1.0 GA');
    expect(at('evkDesign')).toBe('EVK EVT Ready');
    expect(at('evkLaunch')).toBe('EVK General Availability');
    expect(at('earlyAccess')).toBe('First Customer Design-Win');
  });

  it('anchors every checkpoint to a stage it runs, colliding with no other template’s', () => {
    const keys = new Set(EMBEDDED_PROFILE.stages.map((s) => s.key));
    const socIds = new Set(milestoneDefs.map((m) => m.id));
    for (const m of EMBEDDED_MILESTONES) {
      expect(keys, m.id).toContain(m.anchor.stage);
      expect(socIds.has(m.id), `${m.id} collides with an SoC checkpoint`).toBe(false);
      expect(
        EMBEDDED_INHERITED_KEYS as readonly string[],
        `${m.id} would appear in an SoC programme too`,
      ).not.toContain(m.anchor.stage);
    }
    expect(new Set(EMBEDDED_MILESTONES.map((m) => m.id)).size).toBe(EMBEDDED_MILESTONES.length);
    /* every stage of its own closes on something */
    for (const s of own) expect(EMBEDDED_MILESTONES.some((m) => m.anchor.stage === s.id), s.id).toBe(true);
  });
});

/* FPGA verification is planned, run and signed off — not a platform brought
   up and handed over. */
describe('FPGA prototype verification', () => {
  it('is a stage of its own, with a plan, a campaign and a signoff', () => {
    const st = EMBEDDED_PROFILE.stages.find((s) => s.key === 'fpgaVerification')!;
    expect(st.phaseId).toBe('designVerify');
    const said = refsOf('fpgaVerification')
      .map((r) => `${ownTitles[r]} ${ownActivities[r].s.map((s) => s[1]).join(' ')}`)
      .join(' ')
      .toLowerCase();
    for (const w of ['exit criteria', 'test list', 'rtl drop', 'regression', 'soak', 'boot', 'sensors', 'models', 'go / no-go']) {
      expect(said, `FPGA verification never mentions ${w}`).toContain(w);
    }
    expect(EMBEDDED_MILESTONES.find((m) => m.anchor.stage === 'fpgaVerification')?.label).toBe(
      'FPGA Verification Signoff',
    );
  });

  it('is planned with the DV plan, runs on the RTL, and signs off on the final RTL before tapeout', () => {
    expect(span('FPV-01').start).toBeGreaterThanOrEqual(span(emb('DV-01')).start);
    expect(span('FPV-01').end).toBeLessThanOrEqual(span('FPV-03').start);
    expect(span('FPV-03').start).toBeGreaterThanOrEqual(stageAt('rtlEmb').start);
    expect(span('FPV-06').start).toBeGreaterThanOrEqual(stageAt('rtlEmb').end);
    expect(span('FPV-06').end).toBeLessThanOrEqual(span('TO-05').start);
    /* software gets the verified images, not its own build of them */
    expect(span('VP-02').start).toBeGreaterThanOrEqual(span('FPV-03').start);
  });

  it('owns the FPGA work alone — DV no longer brings up a prototype of its own', () => {
    expect(EMBEDDED_DROPPED.has('DV-03')).toBe(true);
    for (const [ref, a] of Object.entries(EMBEDDED_DERIVED_ACTIVITIES)) {
      if (a.st !== 'verificationEmb') continue;
      expect(EMBEDDED_DERIVED_ACTIVITY_TITLES[ref], ref).not.toMatch(/FPGA/);
    }
    expect(ownActivities[emb('DV-01')].s.map((s) => s[1]).join(' ')).toContain('FPGA prototype');
  });
});

describe('the embedded plan runs nothing before what it consumes exists', () => {
  it('freezes the co-design before RTL, and the boot ROM with the RTL', () => {
    expect(stageAt('fabricCodesign').end).toBeLessThanOrEqual(stageAt('rtlEmb').start);
    expect(span('SDK-01').end).toBeLessThanOrEqual(stageAt('rtlEmb').end);
  });

  it('hands the macros and the pin-out to physical design before the floorplan', () => {
    const floorplan = span(emb('PD-02')).start;
    expect(span('MRAM-05').end).toBeLessThanOrEqual(floorplan);
    expect(span('PMU-05').end).toBeLessThanOrEqual(floorplan);
    expect(span('EPKG-02').end).toBeLessThanOrEqual(floorplan);
  });

  it('launches the Playground on the compiler alpha, before tapeout', () => {
    expect(span('CMP-07').end).toBeLessThanOrEqual(span('VP-05').end);
    expect(stageAt('virtualPlatform').end).toBeLessThanOrEqual(stageAt('tapeout').end);
    expect(span('VP-02').start).toBeGreaterThanOrEqual(stageAt('rtlEmb').start);
    expect(span('EAP-03').start).toBeGreaterThanOrEqual(stageAt('virtualPlatform').end);
  });

  it('signs off before tapeout, and fabricates on the masks the tapeout ordered', () => {
    expect(stageAt('signoffEmb').end).toBeLessThanOrEqual(stageAt('tapeout').start);
    expect(span(emb('FAB-01')).start).toBeGreaterThanOrEqual(span('TO-08').end);
    expect(span(emb('FAB-03')).start).toBeGreaterThanOrEqual(span('TO-11').end);
  });

  /* The same DFT relations the SoC flow is held to, on the derived stages. */
  it('closes the scan and patterns in the order the SoC flow does', () => {
    expect(span(emb('DFT-08')).start).toBeGreaterThanOrEqual(span(emb('SYN-01')).start);
    expect(span(emb('DFT-08')).end).toBeLessThanOrEqual(span(emb('SYN-12')).end);
    expect(span(emb('DFT-09')).start).toBeGreaterThanOrEqual(span(emb('PD-02')).start);
    expect(span(emb('DFT-10')).end).toBeGreaterThanOrEqual(span(emb('SYN-12')).end);
    expect(span(emb('DFT-10')).end).toBeGreaterThanOrEqual(span(emb('PD-13')).end);
    expect(span(emb('DFT-11')).start).toBeGreaterThanOrEqual(span(emb('SYN-12')).end);
    expect(span(emb('DFT-11')).end).toBeLessThanOrEqual(span('TO-01').start);
  });

  it('builds the netlists before the turns that consume them', () => {
    expect(span(emb('PD-05')).start).toBeGreaterThanOrEqual(span(emb('SYN-08')).end);
    expect(span(emb('PD-11')).start).toBeGreaterThanOrEqual(span(emb('SYN-11')).end);
    expect(span(emb('PD-15')).start).toBeGreaterThanOrEqual(span(emb('SYN-12')).end);
  });

  it('sorts and assembles the wafers once they ship, and brings up the units once they exist', () => {
    expect(stageAt('packageEmb').end).toBeLessThanOrEqual(stageAt('assemblyEmb').start);
    expect(span('EASSY-02').start).toBeGreaterThanOrEqual(span(emb('FAB-10')).end);
    expect(stageAt('bringupEmb').start).toBeGreaterThanOrEqual(span('EASSY-03').end);
    expect(span('EVK-05').start).toBeGreaterThanOrEqual(span('EASSY-03').end);
    expect(span('SDK-06').start).toBeGreaterThanOrEqual(stageAt('bringupEmb').start);
    expect(span('CREL-01').start).toBeGreaterThanOrEqual(span('EASSY-03').end);
    expect(span('EAP-05').start).toBeGreaterThanOrEqual(span('EVK-05').end);
    expect(span(emb('TEST-04')).end).toBeLessThanOrEqual(span('EASSY-02').start);
    expect(stageAt('validationHardwareEmb').end).toBeLessThanOrEqual(stageAt('bringupEmb').start);
  });

  it('releases the software after the silicon is correlated, and the EVK on released software', () => {
    expect(span('CREL-05').start).toBeGreaterThanOrEqual(span('CREL-01').end);
    expect(stageAt('softwareRelease').end).toBeLessThanOrEqual(stageAt('evkLaunch').end);
    expect(stageAt('evkLaunch').end).toBeLessThanOrEqual(stageAt('qualificationEmb').end);
    expect(stageAt('earlyAccess').end).toBe(stageAt('qualificationEmb').end);
  });
});

/* ---------- content invariants, for every stage the template owns ---------- */

describe('every stage it owns lines up with its activities', () => {
  it('has activities, and arrays positioned on them', () => {
    for (const s of own) {
      const refs = refsOf(s.id);
      expect(refs.length, `${s.id} has no activities`).toBeGreaterThan(2);
      expect(s.engineeringView, s.id).toHaveLength(refs.length);
      expect(s.engineeringTat, s.id).toHaveLength(refs.length);
      expect(s.engineeringEffort, s.id).toHaveLength(refs.length);
      expect(s.engineeringStart, s.id).toHaveLength(refs.length);
      refs.forEach((ref, i) => {
        expect(ref, `${s.id}[${i}]`).toBe(`${s.shortTitle}-${String(i + 1).padStart(2, '0')}`);
        expect(s.engineeringView[i], ref).toBe(ownTitles[ref]);
        const a = ownActivities[ref];
        expect(Math.abs(s.engineeringTat[i]), ref).toBeCloseTo(a.w[1] - a.w[0], 5);
        expect(s.engineeringStart![i], ref).toBeCloseTo(a.w[0], 5);
        expect(s.engineeringEffort[i], ref).toBeGreaterThan(0);
      });
      expect(s.deliverableFrom, s.id).toHaveLength(s.deliverables.length);
      expect(s.deliverableWeek, s.id).toHaveLength(s.deliverables.length);
    }
  });

  it('runs every activity inside its stage', () => {
    for (const [ref, a] of Object.entries(ownActivities)) {
      const st = EMBEDDED_PROFILE.stages.find((s) => s.key === a.st)!;
      expect(st, `${ref} runs in ${a.st}`).toBeTruthy();
      expect(a.w[0], ref).toBeGreaterThanOrEqual(0);
      expect(a.w[1], ref).toBeGreaterThan(a.w[0]);
      expect(a.w[1], `${ref} runs past its stage`).toBeLessThanOrEqual(st.durationWeeks);
    }
    for (const s of own) {
      const dur = EMBEDDED_PROFILE.stages.find((st) => st.key === s.id)!.durationWeeks;
      for (const wk of s.deliverableWeek!) expect(wk, s.id).toBeLessThanOrEqual(dur);
    }
  });

  it('claims no reference another template owns', () => {
    for (const ref of Object.keys(ownActivities)) {
      expect(activitySteps[ref], ref).toBeUndefined();
      expect(detailActivityTitles[ref], ref).toBeUndefined();
      expect(THREE_DIC_ACTIVITIES[ref], ref).toBeUndefined();
      expect(TOP_DIE_ACTIVITIES[ref], ref).toBeUndefined();
      expect(ownTitles[ref], `${ref} has no title`).toBeTruthy();
    }
    for (const ref of Object.keys({ ...EMBEDDED_DELIVERABLES })) {
      expect(detailDeliverables[ref], ref).toBeUndefined();
    }
    /* prefixes are the stage's and nobody else's */
    const prefixes = own.map((s) => s.shortTitle);
    expect(new Set(prefixes).size).toBe(prefixes.length);
    for (const p of prefixes) {
      expect(journeyData.some((j) => j.shortTitle === p), p).toBe(false);
      expect(p, p).toMatch(/^[A-Z][A-Z0-9]{1,4}$/);
    }
  });

  it('gives each step a length, and each step one output', () => {
    for (const [ref, a] of Object.entries(ownActivities)) {
      expect(a.s.length, `${ref} has too few steps`).toBeGreaterThanOrEqual(3);
      a.s.forEach((step, i) => {
        expect(step[0], `${ref} step ${i}`).toBe(i + 1);
        expect(String(step[1]).length, `${ref} step ${i}`).toBeGreaterThan(8);
        expect(step[2], `${ref} step ${i}`).toBeGreaterThan(0);
      });
      expect(a.ro, `${ref} has no owner`).toBeTruthy();
      expect(a.ob, ref).toHaveLength(a.o.length);
      for (const n of a.ob) expect(a.s.some((st) => st[0] === n), `${ref} output step ${n}`).toBe(true);
    }
    for (const [ref, a] of Object.entries(EMBEDDED_ACTIVITIES)) {
      expect(a.o, ref).toHaveLength(a.s.length);
      for (const out of a.o) expect(out.length, `${ref}: "${out}"`).toBeGreaterThan(8);
    }
  });

  it('relates every activity to a deliverable of its own stage', () => {
    for (const [ref, a] of Object.entries(ownActivities)) {
      expect(a.r.length, `${ref} relates to no deliverable`).toBeGreaterThan(0);
      for (const [dref] of a.r) {
        expect(ALL_DELIVERABLE_TITLES[dref], `${ref} → ${dref}`).toBeTruthy();
        expect(prefix(dref), `${ref} → ${dref}`).toBe(prefix(ref));
      }
    }
  });

  it('names as each deliverable’s source an activity that produces it', () => {
    for (const s of own) {
      const refs = refsOf(s.id);
      s.deliverables.forEach((_, i) => {
        const dref = `${s.shortTitle}-D${i + 1}`;
        const from = ownActivities[refs[s.deliverableFrom![i]]];
        expect(
          from.r.some(([d, rel]) => d === dref && rel === 'produces'),
          `${dref} names ${refs[s.deliverableFrom![i]]}`,
        ).toBe(true);
      });
    }
    /* and, where it is authored, hands it over at that activity's release step */
    const producers = producersOf(EMBEDDED_ACTIVITIES);
    for (const s of EMBEDDED_STAGES) {
      const refs = refsOf(s.id);
      s.deliverables.forEach((_, i) => {
        const dref = `${s.shortTitle}-D${i + 1}`;
        expect(deliverableStep(dref, producers)?.act, dref).toBe(refs[s.deliverableFrom[i]]);
      });
    }
  });

  it('tags every seeded deliverable row, and an SoC row still gets the SoC tag', () => {
    const prefixOf: Record<string, string> = {};
    for (const [ref, a] of Object.entries(ALL_ACTIVITIES)) prefixOf[prefix(ref)] = a.st;
    const rows = [...own, ...journeyData].flatMap((s) =>
      s.deliverables.map((title, i) => ({ id: `${s.id}:${i}`, title, stageId: s.id })),
    );
    const refOf = deliverableRefs(rows, ALL_DELIVERABLE_TITLES, prefixOf);
    for (const s of own) {
      s.deliverables.forEach((title, i) => {
        expect(refOf.get(`${s.id}:${i}`), `${s.id} "${title}"`).toBe(`${s.shortTitle}-D${i + 1}`);
      });
    }
    /* the derived rows share the SoC titles; the stage decides whose tag is
       whose — in a programme that runs only one of the two, too */
    expect(refOf.get('rtl:6')).toBe('RTL-D7');
    expect(refOf.get('rtlEmb:6')).toBe('ERTL-D7');
    const socPrefixes: Record<string, string> = {};
    for (const [ref, a] of Object.entries(activitySteps)) socPrefixes[prefix(ref)] = a.st;
    const socRows = journeyData.flatMap((s) =>
      s.deliverables.map((title, i) => ({ id: `${s.id}:${i}`, title, stageId: s.id })),
    );
    const socRefOfRow = deliverableRefs(socRows, ALL_DELIVERABLE_TITLES, socPrefixes);
    for (const [id, ref] of socRefOfRow) expect(detailDeliverables[ref], `${id} → ${ref}`).toBeTruthy();
  });
});

describe('the derived stages', () => {
  /* The SoC template is a leading-node AI accelerator on a 2.5D package. What
     the embedded programme shows from it — derived or inherited — names none
     of that. HBM the ESD model is fine; HBM the memory is not. */
  it('say nothing about a product an embedded part is not', () => {
    const leading =
      /\b(HBM(?! ESD|, CDM)|PCIe|CXL|SerDes|D2D|die-to-die|chiplet|DRAM|DDR|UCIe|interposer|bumps?|EUV|LLM|tokens|TTFT|FP8|NoC|VRMs?|DVFS|cooling|airflow|thermal solution|high-speed)\b/i;
    const shown = [...EMBEDDED_DERIVED_STAGES, ...EMBEDDED_INHERITED_KEYS.map((k) => stageContent(k)!)];
    for (const s of shown) {
      const texts = [
        s.tagline,
        s.description,
        ...s.activities,
        ...s.deliverables,
        ...s.risks,
        ...s.potentialRisks,
        ...s.collaboration,
        ...s.tools,
        ...s.programView,
        ...s.engineeringView,
      ];
      for (const t of texts) expect(t, `${s.id}: "${t}"`).not.toMatch(leading);
    }
    const acts = Object.entries(ALL_ACTIVITIES).filter(([, a]) =>
      shown.some((s) => s.id === a.st),
    );
    expect(acts.length).toBeGreaterThan(100);
    for (const [ref, a] of acts) {
      for (const t of [...a.s.map((s) => String(s[1])), ...a.o]) expect(t, `${ref}: "${t}"`).not.toMatch(leading);
    }
  });

  it('refer to no activity or deliverable they dropped', () => {
    const texts = Object.values(EMBEDDED_DERIVED_ACTIVITIES).flatMap((a) => [...a.s.map((s) => String(s[1])), ...a.o]);
    for (const t of texts) for (const gone of EMBEDDED_DROPPED) expect(t, gone).not.toMatch(new RegExp(`\\b${gone}\\b`));
    for (const t of texts) {
      for (const d of EMBEDDED_DERIVED) expect(t, `${d.from} reference left in "${t}"`).not.toMatch(new RegExp(`\\b${d.from}-D?\\d`));
    }
  });

  /* Each edit names the SoC step it replaces. One that names a step the SoC
     flow no longer has — renumbered, or dropped — would silently edit nothing. */
  it('edit only steps the SoC flow still has, and change what they say', () => {
    for (const [base, edit] of Object.entries(EMBEDDED_EDITS)) {
      const d = EMBEDDED_DERIVED.find((x) => x.base === base);
      expect(d, `${base} is edited but not derived`).toBeTruthy();
      for (const [ref, e] of Object.entries(edit.activities ?? {})) {
        const a = activitySteps[ref];
        expect(a?.st, `${ref} is not an activity of ${base}`).toBe(base);
        expect((d!.drop as readonly string[]).includes(ref), `${ref} is dropped`).toBe(false);
        if (e.title) expect(e.title, ref).not.toBe(detailActivityTitles[ref]);
        for (const [n, step] of Object.entries(e.steps ?? {})) {
          const i = Number(n) - 1;
          expect(a.s[i]?.[0], `${ref} has no step ${n}`).toBe(Number(n));
          if (step.t) expect(step.t, `${ref} step ${n}`).not.toBe(a.s[i][1]);
        }
      }
      const soc = journeyData.find((j) => j.id === base)!;
      for (const n of Object.keys(edit.deliverables ?? {})) {
        expect(soc.deliverables[Number(n) - 1], `${base} has no deliverable ${n}`).toBeTruthy();
      }
    }
  });

  it('are no longer and no heavier than the SoC stages they come from', () => {
    for (const d of EMBEDDED_DERIVED) {
      const soc = stageContent(d.base)!;
      const mine = stageContent(d.key)!;
      const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);
      expect(sum(mine.engineeringEffort), d.key).toBeLessThanOrEqual(sum(soc.engineeringEffort) + 1e-6);
      const st = EMBEDDED_PROFILE.stages.find((s) => s.key === d.key)!;
      expect(st.durationWeeks, d.key).toBeLessThanOrEqual(BASELINES[d.base].durationWeeks);
      expect(st.title, d.key).toBe(soc.title);
    }
  });
});
