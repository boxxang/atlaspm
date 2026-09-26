/**
 * /data/embeddedSocDerived.ts — the SoC stages an embedded programme runs
 * smaller, derived.
 *
 * An embedded SoC on a mature node with embedded MRAM still writes RTL,
 * verifies it, inserts scan, synthesises, places and routes, signs off, builds
 * a bring-up board, develops a test program and brings silicon up. It does the
 * same work as the leading-node flow, on a smaller die with no high-speed
 * interfaces and no interposer, so it does it in less time and with fewer
 * people — and a handful of the SoC activities do not happen at all: there is
 * no bump map or RDL to co-design, no chip-package power model to hand to an
 * SI/PI team that does not exist, no PCIe or HBM to train, and no forced-air
 * cooling for a part that draws milliwatts.
 *
 * So each stage here is derived from its SoC counterpart, the way the 3DIC top
 * die is: the same activities and steps, minus the ones named in `drop`, with
 * windows, step lengths and deliverable dates scaled by `time` and man-months
 * by `effort`. The references move onto an E-prefix and renumber after the
 * drops, because a row's ID is its position (see /lib/rowIds). Derived rather
 * than authored so the embedded flow cannot drift from the SoC one by accident,
 * and so the generated SoC modules stay untouched.
 *
 * Tapeout, fabrication and qualification are not derived: the mask, wafer and
 * reliability flows are the node's rather than the design's, and the
 * countdowns every screen shows read those three stage keys.
 */
import { activitySteps, type ActivityStepEntry } from './activitySteps';
import { detailActivityTitles } from './activityIndex';
import { journeyData } from './journey';
import { BASELINES } from './scheduleProfiles';
import type { JourneyStage } from './types';

export interface EmbeddedDerivation {
  /** The SoC stage it is derived from. */
  base: string;
  /** Its own key in the embedded template. */
  key: string;
  /** The SoC prefix, and the one its references move to. */
  from: string;
  to: string;
  /** SoC activities that have no counterpart in an embedded programme. */
  drop: readonly string[];
  /** Elapsed time against the SoC stage. */
  time: number;
  /** Man-months against the SoC stage. */
  effort: number;
}

export const EMBEDDED_DERIVED = [
  /* A mature, production PDK: no version churn to chase, and the custom memory
     decision is the eMRAM stage's. */
  { base: 'pdk', key: 'pdkEmb', from: 'PDK', to: 'EPDK', drop: ['PDK-11'], time: 22 / 36, effort: 0.5 },
  /* A tiled fabric is one tile designed well and replicated, plus a small
     scalar subsystem and peripherals. */
  { base: 'rtl', key: 'rtlEmb', from: 'RTL', to: 'ERTL', drop: [], time: 0.75, effort: 0.4 },
  /* Emulation and the FPGA prototype are a stage of their own here, with a
     plan, a campaign and a signoff, rather than one platform bring-up inside
     DV (see fpgaVerification in /data/embeddedSoc). */
  {
    base: 'verification',
    key: 'verificationEmb',
    from: 'DV',
    to: 'EDV',
    drop: ['DV-03'],
    time: 0.75,
    effort: 0.4,
  },
  { base: 'dft', key: 'dftEmb', from: 'DFT', to: 'EDFT', drop: [], time: 0.75, effort: 0.5 },
  { base: 'synthesis', key: 'synthesisEmb', from: 'SYN', to: 'ESYN', drop: [], time: 0.75, effort: 0.5 },
  /* Wire-bond or FC-CSP: the pad ring is planned with the package in EPKG, and
     there is no chip power model for a co-verification stage the template
     does not run. */
  {
    base: 'physicalDesign',
    key: 'physicalDesignEmb',
    from: 'PD',
    to: 'EPD',
    drop: ['PD-04', 'PD-10'],
    time: 0.8,
    effort: 0.45,
  },
  { base: 'signoff', key: 'signoffEmb', from: 'SO', to: 'ESO', drop: ['SO-12'], time: 0.75, effort: 0.5 },
  /* The internal bring-up board. The EVK customers buy is a stage of its own. */
  {
    base: 'validationHardware',
    key: 'validationHardwareEmb',
    from: 'EVB',
    to: 'EEVB',
    drop: ['EVB-06'],
    time: 24 / 38,
    effort: 0.6,
  },
  { base: 'testDevelopment', key: 'testDevelopmentEmb', from: 'TEST', to: 'ETEST', drop: [], time: 32 / 42, effort: 0.6 },
  /* No PCIe, CXL, HBM or die-to-die link to train, and no DRAM controller to
     validate: the memories are on the die, and eMRAM is brought up by its own
     trim and test flow. */
  {
    base: 'bringup',
    key: 'bringupEmb',
    from: 'BU',
    to: 'EBU',
    drop: ['BU-06', 'BU-07'],
    time: 14 / 18,
    effort: 0.6,
  },
] as const satisfies readonly EmbeddedDerivation[];

/**
 * SoC wording that names hardware an embedded part does not have, where the
 * step itself still happens. Matched on the whole text, so a change to the SoC
 * wording shows up as a test failure rather than a silent miss.
 */
export const EMBEDDED_REWORDED: Record<string, string> = {
  'Develop the interface and HBM test content': 'Develop the interface, eMRAM and analog test content',
  'Interface and HBM test content': 'Interface, eMRAM and analog test content',
  'Extract the probe card requirement and bump map': 'Extract the probe card requirement and pad map',
  'Probe card requirement and bump map': 'Probe card requirement and pad map',
  /* the FPGA prototype is a verification method in its own right here */
  'Assign a verification strategy per feature — simulation, formal or emulation':
    'Assign a verification strategy per feature — simulation, formal, emulation or the FPGA prototype',
};

const reword = (text: string): string => EMBEDDED_REWORDED[text] ?? toEmbeddedRef(text);

const quarter = (x: number) => Math.round(x * 4) / 4;
const tenth = (x: number) => Math.max(0.1, Math.round(x * 10) / 10);
const pad = (n: number) => String(n).padStart(2, '0');

const socRefsOf = (stage: string) => Object.keys(activitySteps).filter((r) => activitySteps[r].st === stage);
const socStage = (id: string) => journeyData.find((s) => s.id === id)!;

interface Plan {
  d: EmbeddedDerivation;
  soc: JourneyStage;
  /** The SoC activities it keeps, in order. */
  kept: string[];
  /** The indices of the SoC deliverables it keeps, in order. */
  keptDeliverables: number[];
}

const PLANS: Plan[] = EMBEDDED_DERIVED.map((d) => {
  const soc = socStage(d.base);
  const kept = socRefsOf(d.base).filter((r) => !(d.drop as readonly string[]).includes(r));
  /* A deliverable leaves with the activities that made it: one nobody left in
     the stage produces is a row nobody can hand over. */
  const keptDeliverables = soc.deliverables
    .map((_, i) => i)
    .filter((i) =>
      kept.some((r) => activitySteps[r].r.some(([dref, rel]) => dref === `${d.from}-D${i + 1}` && rel === 'produces')),
    );
  return { d, soc, kept, keptDeliverables };
});

/** Every SoC reference a derived stage carries, and the one it becomes. */
const REF_MAP: Record<string, string> = {};
for (const p of PLANS) {
  p.kept.forEach((ref, i) => (REF_MAP[ref] = `${p.d.to}-${pad(i + 1)}`));
  p.keptDeliverables.forEach((i, j) => (REF_MAP[`${p.d.from}-D${i + 1}`] = `${p.d.to}-D${j + 1}`));
}

/** SoC references that name something the embedded flow does not run. */
export const EMBEDDED_DROPPED: ReadonlySet<string> = new Set(
  PLANS.flatMap((p) => [
    ...p.d.drop,
    ...p.soc.deliverables.map((_, i) => i).filter((i) => !p.keptDeliverables.includes(i)).map((i) => `${p.d.from}-D${i + 1}`),
  ]),
);

const REF = /\b\d?[A-Z][A-Z0-9]{1,4}-D?\d{1,2}\b/g;

/** Every reference to a derived stage, moved onto its embedded counterpart. */
export const toEmbeddedRef = (text: string): string => text.replace(REF, (m) => REF_MAP[m] ?? m);

/** The SoC activity or deliverable an embedded one is derived from. */
export const socRefOf = (embeddedRef: string): string | undefined =>
  Object.keys(REF_MAP).find((k) => REF_MAP[k] === embeddedRef);

/** The stage's length in the embedded template: the SoC baseline, scaled. */
export const EMBEDDED_DERIVED_DURATION: Record<string, number> = Object.fromEntries(
  EMBEDDED_DERIVED.map((d) => [d.key, Math.round(BASELINES[d.base].durationWeeks * d.time)]),
);

const scaleWindow = (w: [number, number], p: Plan): [number, number] => {
  const duration = EMBEDDED_DERIVED_DURATION[p.d.key];
  const from = Math.min(quarter(w[0] * p.d.time), duration - 0.25);
  const to = Math.min(duration, Math.max(from + 0.25, quarter(w[1] * p.d.time)));
  return [from, to];
};

export const EMBEDDED_DERIVED_ACTIVITIES: Record<string, ActivityStepEntry> = Object.fromEntries(
  PLANS.flatMap((p) =>
    p.kept.map((ref): [string, ActivityStepEntry] => {
      const a = activitySteps[ref];
      return [
        REF_MAP[ref],
        {
          st: p.d.key,
          w: scaleWindow(a.w, p),
          s: a.s.map((step) => {
            const out = [...step] as typeof step;
            out[1] = reword(step[1]);
            out[2] = Math.max(0.25, quarter(step[2] * p.d.time));
            return out;
          }),
          o: a.o.map(reword),
          ob: [...a.ob],
          /* Relations to a deliverable the stage no longer has go with it. */
          r: a.r.filter(([d]) => REF_MAP[d]).map(([d, rel]) => [REF_MAP[d], rel]),
          ro: a.ro,
        },
      ];
    }),
  ),
);

export const EMBEDDED_DERIVED_ACTIVITY_TITLES: Record<string, string> = Object.fromEntries(
  PLANS.flatMap((p) => p.kept.map((ref) => [REF_MAP[ref], detailActivityTitles[ref]])),
);

export const EMBEDDED_DERIVED_STAGES: readonly JourneyStage[] = PLANS.map((p) => {
  const { d, soc, kept, keptDeliverables } = p;
  const socRefs = socRefsOf(d.base);
  const at = (ref: string) => socRefs.indexOf(ref);
  const acts = kept.map((ref) => EMBEDDED_DERIVED_ACTIVITIES[REF_MAP[ref]]);
  const duration = EMBEDDED_DERIVED_DURATION[d.key];

  /* The same rule journeyAlignment holds the SoC to: a deliverable names the
     last discrete activity that produces it, and a continuous one runs
     throughout and gates nothing. */
  const continuous = (i: number) => soc.engineeringTat[at(kept[i])] < 0;
  const producerOf = (dref: string) => {
    const producers = kept
      .map((_, i) => i)
      .filter((i) => acts[i].r.some(([x, rel]) => x === dref && rel === 'produces'));
    return producers.sort(
      (a, b) =>
        Number(continuous(a)) - Number(continuous(b)) ||
        acts[b].w[1] - acts[a].w[1] ||
        acts[b].w[0] - acts[a].w[0] ||
        kept[a].localeCompare(kept[b]),
    )[0];
  };
  const deliverableFrom = keptDeliverables.map((_, j) => producerOf(`${d.to}-D${j + 1}`));

  return {
    ...soc,
    id: d.key,
    shortTitle: d.to,
    activities: soc.activities,
    deliverables: keptDeliverables.map((i) => soc.deliverables[i]),
    deliverableFrom,
    /* Due when the SoC date says, scaled — but never before the work that
       makes it, which the SoC dates do not all honour. */
    deliverableWeek: keptDeliverables.map((i, j) =>
      Math.min(duration, Math.max(quarter((soc.deliverableWeek?.[i] ?? duration) * d.time), acts[deliverableFrom[j]].w[1])),
    ),
    engineeringView: kept.map((ref) => detailActivityTitles[ref]),
    engineeringTat: kept.map((ref, i) => {
      const span = acts[i].w[1] - acts[i].w[0];
      return soc.engineeringTat[at(ref)] < 0 ? -span : span;
    }),
    engineeringEffort: kept.map((ref) => tenth(soc.engineeringEffort[at(ref)] * d.effort)),
    engineeringStart: acts.map((a) => a.w[0]),
  };
});

export const EMBEDDED_DERIVED_DELIVERABLES: Record<string, string> = Object.fromEntries(
  EMBEDDED_DERIVED_STAGES.flatMap((s) => s.deliverables.map((title, i) => [`${s.shortTitle}-D${i + 1}`, title])),
);
