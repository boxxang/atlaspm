/**
 * tools/cpoFlow/analysis.ts — reads the CPO Network Switch System template as
 * a program flow rather than as content: when each activity runs in absolute
 * weeks, what it waits on, which chain of waits sets the production date, and
 * how much each owner carries at once.
 *
 * Pure functions over the template. The unit tests hold the template to what
 * these find (tests/unit/cpoSwitch.test.ts), and `npx tsx tools/cpoFlow/report.ts`
 * prints the same findings for the flow verification report.
 */
import { CPO_ACTIVITIES, CPO_SKELETON, CPO_STAGES } from '../../src/data/cpoSwitch';
import { CPO_WRITE_UPS } from '../../src/data/cpoSwitch/writeUps';

export const stageOfRef = (ref: string) => {
  const s = CPO_SKELETON.find((x) => x.activities.some((a) => a.ref === ref));
  if (!s) throw new Error(`No stage runs ${ref}`);
  return s;
};
export const absStart = (ref: string) => stageOfRef(ref).start + CPO_ACTIVITIES[ref].w[0];
export const absEnd = (ref: string) => stageOfRef(ref).start + CPO_ACTIVITIES[ref].w[1];
export const stageByKey = (key: string) => {
  const s = CPO_SKELETON.find((x) => x.key === key);
  if (!s) throw new Error(`No stage ${key}`);
  return s;
};
export const stageEnd = (key: string) => stageByKey(key).start + stageByKey(key).dur;
export const gateWeek = (gateId: string) => {
  const s = CPO_SKELETON.find((x) => x.gate.id === gateId);
  if (!s) throw new Error(`No gate ${gateId}`);
  return s.start + s.dur;
};

export const ALL_REFS = CPO_SKELETON.flatMap((s) => s.activities.map((a) => a.ref));

/** What an activity waits on: its write-up's dependencies, both lists. */
export const predecessorsOf = (ref: string): string[] => {
  const w = CPO_WRITE_UPS[ref];
  return [...new Set([...w.links.dependsOn, ...w.dependsOn])];
};

/** Every precedence edge, producer first. */
export const edges = (): [string, string][] => ALL_REFS.flatMap((y) => predecessorsOf(y).map((x): [string, string] => [x, y]));

export const successorsOf = (ref: string): string[] => {
  const w = CPO_WRITE_UPS[ref];
  const declared = [...w.links.feedsInto, ...w.feedsInto];
  const implied = ALL_REFS.filter((y) => predecessorsOf(y).includes(ref));
  return [...new Set([...declared, ...implied])];
};

/** Activities named in an activity's `consumes` lines — the producers of its inputs. */
export const namedProducers = (ref: string): string[] =>
  [...new Set(CPO_WRITE_UPS[ref].consumes.flatMap((c) => c.match(/\b[A-Z]{2,5}-\d{2}\b/g) ?? []))];

/** Activities connected to nothing either way. */
export const isolated = (): string[] => ALL_REFS.filter((r) => predecessorsOf(r).length === 0 && successorsOf(r).length === 0);

/**
 * How an edge sits in the schedule, and how far its producer could slip
 * before it pushed the consumer:
 *  - FS: the producer finishes before the consumer starts — slack is the gap.
 *  - FF: they overlap, but the producer finishes first — slack is the gap
 *    between the two finishes; the consumer can start on early output but
 *    cannot finish without the final one.
 *  - SS: the producer outlasts the consumer, which used an interim output
 *    (a down-select on early data, a plan from a draft) — slack is the gap
 *    between the two starts.
 */
export const edgeKind = (x: string, y: string): 'FS' | 'FF' | 'SS' =>
  absEnd(x) <= absStart(y) ? 'FS' : absEnd(x) <= absEnd(y) ? 'FF' : 'SS';
export const edgeSlack = (x: string, y: string): number => {
  const k = edgeKind(x, y);
  return k === 'FS' ? absStart(y) - absEnd(x) : k === 'FF' ? absEnd(y) - absEnd(x) : Math.max(0, absStart(y) - absStart(x));
};

export interface PathStep {
  ref: string;
  start: number;
  end: number;
  /** how this activity waits on the one before it in the chain, and the slack on that wait */
  kind: 'FS' | 'FF' | 'SS' | null;
  slack: number | null;
}

/**
 * The driving chain into an activity: from it, step back each time to the
 * predecessor with the least slack on its edge — the wait that actually sets
 * the date — until an activity waits on nothing. Ties go to a finish-to-start
 * wait, then to the predecessor that finishes last.
 */
export const drivingPath = (to: string, stopAt?: (ref: string) => boolean): PathStep[] => {
  const chain: PathStep[] = [];
  let cur: string | undefined = to;
  const seen = new Set<string>();
  const rank = { FS: 0, FF: 1, SS: 2 } as const;
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    const y: string = cur;
    const next: string | undefined = [...predecessorsOf(y)].sort(
      (a, b) =>
        edgeSlack(a, y) - edgeSlack(b, y) || rank[edgeKind(a, y)] - rank[edgeKind(b, y)] || absEnd(b) - absEnd(a),
    )[0];
    chain.unshift({
      ref: y,
      start: absStart(y),
      end: absEnd(y),
      kind: next ? edgeKind(next, y) : null,
      slack: next ? edgeSlack(next, y) : null,
    });
    if (stopAt?.(y)) break;
    cur = next;
  }
  return chain;
};

/** Slack along a chain the program names: the sum of its edge slacks. */
export const chainSlack = (refs: string[]): number =>
  refs.slice(1).reduce((t, y, i) => {
    const x = refs[i];
    if (!predecessorsOf(y).includes(x)) throw new Error(`${y} does not wait on ${x}`);
    return t + edgeSlack(x, y);
  }, 0);

/**
 * How long a branch could slip before it moved the join: the join's start
 * minus when the latest-finishing activity of the branch among the join's
 * predecessors ends.
 */
export const slackInto = (join: string, branch: (ref: string) => boolean): number => {
  const preds = predecessorsOf(join).filter(branch);
  if (!preds.length) throw new Error(`${join} waits on nothing in that branch`);
  return absStart(join) - Math.max(...preds.map(absEnd));
};

/** For each owner, the most activities it runs in one week, and the first week that happens. */
export const ownerPeaks = () => {
  const last = Math.max(...CPO_SKELETON.map((s) => s.start + s.dur));
  const owners = [...new Set(ALL_REFS.map((r) => CPO_ACTIVITIES[r].ro))];
  return owners
    .map((owner) => {
      const mine = ALL_REFS.filter((r) => CPO_ACTIVITIES[r].ro === owner);
      let peak = 0;
      let from = 0;
      let to = 0;
      for (let wk = 0; wk < last; wk++) {
        const n = mine.filter((r) => absStart(r) <= wk && wk < absEnd(r)).length;
        if (n > peak) {
          peak = n;
          from = wk;
          to = wk;
        } else if (n === peak && to === wk - 1) to = wk;
      }
      const at = mine.filter((r) => absStart(r) <= from && from < absEnd(r));
      return { owner, total: mine.length, peak, from, to, at };
    })
    .sort((a, b) => b.peak - a.peak);
};

/** Deliverables of the template, each with its producer and whether anything downstream uses it. */
export const deliverableUse = () =>
  CPO_STAGES.flatMap((s) =>
    s.deliverables.map((title, i) => {
      const ref = `${s.shortTitle}-D${i + 1}`;
      const producer = ALL_REFS.find((r) => CPO_ACTIVITIES[r].r.some(([d, rel]) => d === ref && rel === 'produces'))!;
      const inStage = ALL_REFS.filter((r) => r !== producer && CPO_ACTIVITIES[r].r.some(([d]) => d === ref));
      const downstream = successorsOf(producer);
      return { ref, title, producer, inStage, downstream };
    }),
  );

/**
 * The critical path by the dependency logic alone: a forward pass that starts
 * every activity as early as its waits allow — after a finish-to-start
 * predecessor finishes; for an overlap, no earlier than the template's lead
 * after the predecessor starts, and for a finish-to-finish one also late
 * enough to finish after it — with each activity keeping its template length. The schedule's padding falls out; what is left is the
 * chain of waits the production date cannot be earlier than.
 */
export const cpm = () => {
  const dur = (r: string) => CPO_ACTIVITIES[r].w[1] - CPO_ACTIVITIES[r].w[0];
  const es = new Map<string, number>();
  const by = new Map<string, string | null>();
  const visiting = new Set<string>();
  const visit = (y: string): number => {
    const known = es.get(y);
    if (known !== undefined) return known;
    if (visiting.has(y)) throw new Error(`loop at ${y}`);
    visiting.add(y);
    let best = 0;
    let driver: string | null = null;
    for (const x of predecessorsOf(y)) {
      const k = edgeKind(x, y);
      const ex = visit(x);
      /* an overlap keeps the lead the template gives it: the consumer starts no
         sooner after the producer starts than it does in the template — the
         first lot has to come through before the next step can begin */
      const lead = ex + (absStart(y) - absStart(x));
      const t = k === 'FS' ? ex + dur(x) : k === 'FF' ? Math.max(ex + dur(x) - dur(y), lead) : lead;
      if (t > best || (t === best && driver === null)) {
        best = Math.max(best, t);
        driver = x;
      }
    }
    visiting.delete(y);
    es.set(y, best);
    by.set(y, best > 0 ? driver : null);
    return best;
  };
  for (const r of ALL_REFS) visit(r);
  const ef = (r: string) => es.get(r)! + dur(r);
  const chainTo = (to: string) => {
    const out: { ref: string; es: number; ef: number; kind: 'FS' | 'FF' | 'SS' | null }[] = [];
    let cur: string | null = to;
    while (cur) {
      const d: string | null = by.get(cur) ?? null;
      out.unshift({ ref: cur, es: es.get(cur)!, ef: ef(cur), kind: d ? edgeKind(d, cur) : null });
      cur = d;
    }
    return out;
  };
  /**
   * Total float against one end activity: a backward pass from it, holding
   * every wait the forward pass held. Zero means the activity is on a
   * critical path to that end; an activity that does not lead to it has none.
   */
  const floatTo = (end: string) => {
    const lf = new Map<string, number>();
    const succ = new Map<string, string[]>();
    for (const y of ALL_REFS) for (const x of predecessorsOf(y)) succ.set(x, [...(succ.get(x) ?? []), y]);
    const visit = (x: string): number | undefined => {
      if (lf.has(x)) return lf.get(x);
      if (x === end) {
        lf.set(x, ef(x));
        return ef(x);
      }
      let best: number | undefined;
      for (const y of succ.get(x) ?? []) {
        const lfy = visit(y);
        if (lfy === undefined) continue;
        const lsy = lfy - dur(y);
        const lead = absStart(y) - absStart(x);
        const k = edgeKind(x, y);
        const t = k === 'FS' ? lsy : k === 'FF' ? Math.min(lfy, lsy - lead + dur(x)) : lsy - lead + dur(x);
        best = best === undefined ? t : Math.min(best, t);
      }
      if (best !== undefined) lf.set(x, best);
      return best;
    };
    return (r: string): number | undefined => {
      const l = visit(r);
      return l === undefined ? undefined : l - ef(r);
    };
  };
  return { es: (r: string) => es.get(r)!, ef, chainTo, floatTo };
};

/**
 * The activity that closes each stage's gate: a review or decision where the
 * gate is a judgement, the event itself where the gate is one (a tapeout
 * baseline recorded, a first link up, a die bank released).
 */
export const GATE_CLOSERS: Record<string, string> = {
  cpoConcept: 'CON-06',
  cpoRequirements: 'REQ-09',
  cpoArchitecture: 'SARC-12',
  cpoInterfaces: 'ICD-12',
  cpoProgramControl: 'PCTL-07',
  cpoFeasibility: 'FEAS-09',
  cpoReadiness: 'TRDY-11',
  cpoModeling: 'MODL-10',
  cpoDesign: 'DSGN-18',
  cpoPresilicon: 'PSV-11',
  cpoOeStackDesign: 'OESD-07',
  cpoImplementation: 'IMPL-12',
  cpoSignoff: 'SGNO-10',
  cpoTapeoutOptical: 'OTO-04',
  cpoTapeout: 'MTO-05',
  cpoFabrication: 'WFAB-07',
  cpoSort: 'SORT-07',
  cpoOeBuild: 'OEB-09',
  cpoTestInfra: 'TINF-11',
  cpoAssembly: 'PKGA-07',
  cpoPowerOn: 'PON-05',
  cpoOpticalBringup: 'OBU-03',
  cpoSystemIntegration: 'SINT-04',
  cpoCharacterization: 'CHAR-08',
  cpoDebug: 'SDBG-08',
  cpoCompliance: 'CERT-03',
  cpoQualification: 'RELQ-06',
  cpoNpi: 'NPI-08',
  cpoRamp: 'RAMP-07',
  cpoSustaining: 'SUST-07',
};

/** Hand-offs the optical engine split exists to make, producer first. */
export const KEY_HANDOFFS: { what: string; from: string[]; to: string[] }[] = [
  { what: 'Optical engine stack bond interface → photonic and electrical IC layout', from: ['OESD-01'], to: ['IMPL-04', 'IMPL-05'] },
  { what: 'Optical engine stack freeze → photonic and electrical IC signoff', from: ['OESD-07'], to: ['SGNO-03', 'SGNO-04', 'SGNO-12'] },
  { what: 'Photonic and electrical IC sort → known-good die release to the engine build', from: ['SORT-03', 'SORT-04'], to: ['SORT-05'] },
  { what: 'Known-good photonic and electrical dies → optical engine stacking', from: ['SORT-05'], to: ['OEB-02'] },
  { what: 'Known-good optical engines → main package engine mounting', from: ['OEB-09'], to: ['PKGA-04'] },
  { what: 'Known-good Switch SoC and I/O dies → main package die attach', from: ['SORT-07'], to: ['PKGA-03'] },
  { what: 'Substrate tooling release → first-build material', from: ['SGNO-11'], to: ['PKGA-01'] },
  { what: 'Engine unit test hardware → optical engine build and test', from: ['TINF-18'], to: ['OEB-02', 'OEB-05'] },
  { what: 'Optical engine standalone bring-up → system optical bring-up', from: ['OEB-06'], to: ['OBU-03'] },
];
