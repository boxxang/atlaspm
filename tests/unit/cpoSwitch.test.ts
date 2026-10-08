import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ALL_ACTIVITIES, ALL_DELIVERABLE_TITLES, ALL_GLOSSARY, ALL_MILESTONES, ALL_STAGE_CONTENT } from '@/data/builtins';
import {
  CPO_ACTIVITIES,
  CPO_ACTIVITY_TITLES,
  CPO_DELIVERABLES,
  CPO_MILESTONES,
  CPO_PROFILE,
  CPO_SKELETON,
  CPO_STAGES,
} from '@/data/cpoSwitch';
import { CPO_ITEMS, CPO_OWNERS } from '@/data/cpoSwitch/skeleton';
import { CPO_GLOSSARY } from '@/data/cpoSwitch/glossary';
import { CPO_WRITE_UPS, cpoDetail } from '@/data/cpoSwitchDetails';
import { deliverableRefs } from '@/lib/deliverableRefs';
import { deliverableStep, producersOf } from '@/lib/deliverableStatus';
import { parseRich, type RichNode } from '@/lib/activityRefs';
import { computeSchedule } from '@/lib/schedule';
import * as Flow from '../../tools/cpoFlow/analysis';
import { ACTIVITY_FATE, DELIVERABLE_FATE } from '../../tools/cpoFlow/refMap';

/**
 * The CPO Network Switch System template: a co-packaged-optics switch, from
 * concept to sustaining, staged by lifecycle with every component and
 * discipline running as parallel activities inside the stages.
 *
 * Held to what the other templates are held to — every stage lines up with
 * its activities, every step hands something over, every deliverable has a
 * producer, every write-up has its shape — and to what this template adds:
 * every dependency names an activity that exists, none of them forms a loop
 * or reaches forward in time, the long-lead workstreams start before the
 * silicon they serve is finished, and nothing names a real vendor, product or
 * standard revision.
 */

const GLOSSARY = { ...ALL_GLOSSARY, ...CPO_GLOSSARY };
/* what every other template claims — the builtins composition includes this one */
const OWN_KEYS = new Set(CPO_SKELETON.map((s) => s.key));
const OTHER_PREFIXES = new Set(ALL_STAGE_CONTENT.filter((s) => !OWN_KEYS.has(s.id)).map((s) => s.shortTitle));
const OTHER_MILESTONES = new Set(ALL_MILESTONES.filter((m) => !OWN_KEYS.has(m.anchor.stage)).map((m) => m.id));
const OTHER_ACTIVITIES = new Set(Object.keys(ALL_ACTIVITIES).filter((r) => !OWN_KEYS.has(ALL_ACTIVITIES[r].st)));
const refsOf = (key: string) => CPO_SKELETON.find((s) => s.key === key)!.activities.map((a) => a.ref);
const stageOfRef = (ref: string) => CPO_SKELETON.find((s) => s.activities.some((a) => a.ref === ref))!;
const absStart = (ref: string) => stageOfRef(ref).start + CPO_ACTIVITIES[ref].w[0];
const absEnd = (ref: string) => stageOfRef(ref).start + CPO_ACTIVITIES[ref].w[1];
const stageEnd = (key: string) => {
  const s = CPO_SKELETON.find((x) => x.key === key)!;
  return s.start + s.dur;
};

const refsIn = (nodes: RichNode[]): string[] =>
  nodes.flatMap((n) => (n.kind === 'ref' ? [n.id] : n.kind === 'tag' ? refsIn(n.children) : []));

/* Generic throughout: no real company, product line, tool vendor or pinned standard revision. */
const NAMED =
  /\b(Broadcom|Tomahawk|Cisco|Silicon One|NVIDIA|Nvidia|Spectrum-X|Quantum-X|Marvell|Intel|AMD|TSMC|GlobalFoundries|Samsung|Jericho|Ayar|Lumentum|Innovus|Cadence|Synopsys|Ansys|Keysight|Arista|Juniper)\b|\b(51\.2|102\.4|204\.8)\s?T(b\/s|bps)?\b|\b(112|224|448)G\b|\b(400|800)G(bE)?\b|\b1\.6T\b|\b3\.2T\b|\b802\.3[a-z]{2}\b/;

const proseOf = (ref: string): string[] => {
  const w = CPO_WRITE_UPS[ref];
  return [
    ...w.purpose,
    w.flowNote,
    ...w.consumes,
    ...Object.values(w.rel),
    ...w.risks,
    ...w.roles.flatMap((r) => [r.r, r.d]),
    ...w.effort.map(([l]) => l),
    ...w.entry,
    ...w.exit,
    ...w.measuredBy,
    ...(w.dependsNote ? [w.dependsNote] : []),
  ];
};

/* ---------------- the shape of the template ---------------- */

describe('CPO skeleton', () => {
  it('names each stage, prefix, gate and activity once, and no other template’s', () => {
    const keys = CPO_SKELETON.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
    const prefixes = CPO_SKELETON.map((s) => s.prefix);
    expect(new Set(prefixes).size).toBe(prefixes.length);
    for (const s of CPO_SKELETON) {
      expect(s.prefix, s.key).toMatch(/^[A-Z][A-Z0-9]{1,4}$/);
      expect(OTHER_PREFIXES.has(s.prefix), `${s.prefix} is another template’s`).toBe(false);
      expect(OTHER_MILESTONES.has(s.gate.id), `${s.gate.id} is another template’s`).toBe(false);
      expect(s.dur, s.key).toBeGreaterThan(0);
      expect(s.activities.length, `${s.key} has too few activities`).toBeGreaterThanOrEqual(3);
      s.activities.forEach((a, i) => {
        expect(a.ref, s.key).toBe(`${s.prefix}-${String(i + 1).padStart(2, '0')}`);
        expect(CPO_OWNERS as readonly string[], a.ref).toContain(a.owner);
        expect(a.w[0], a.ref).toBeGreaterThanOrEqual(0);
        expect(a.w[1], a.ref).toBeGreaterThan(a.w[0]);
        expect(a.w[1], `${a.ref} runs past its stage`).toBeLessThanOrEqual(s.dur);
        expect(OTHER_ACTIVITIES.has(a.ref), `${a.ref} is another template’s`).toBe(false);
      });
    }
    expect(new Set(CPO_SKELETON.map((s) => s.gate.id)).size).toBe(CPO_SKELETON.length);
  });

  it('tags every activity with the item it is work on, and carries the tag to its entry', () => {
    for (const s of CPO_SKELETON) {
      for (const a of s.activities) {
        expect(CPO_ITEMS as readonly string[], a.ref).toContain(a.item);
        expect(CPO_ACTIVITIES[a.ref].item, a.ref).toBe(a.item);
      }
    }
  });

  it('gives every die and both packages a track from design through validation', () => {
    const PHASES: Record<string, string[]> = {
      design: ['cpoDesign', 'cpoOeStackDesign'],
      'implementation or signoff': ['cpoImplementation', 'cpoSignoff'],
      'tapeout or build': ['cpoTapeoutOptical', 'cpoTapeout', 'cpoOeBuild', 'cpoAssembly'],
      validation: ['cpoPowerOn', 'cpoOpticalBringup', 'cpoSystemIntegration', 'cpoCharacterization', 'cpoQualification'],
    };
    for (const item of ['switch', 'io', 'eic', 'pic', 'oe', 'package'] as const) {
      for (const [phase, keys] of Object.entries(PHASES)) {
        const refs = CPO_SKELETON.filter((s) => keys.includes(s.key)).flatMap((s) => s.activities.filter((a) => a.item === item));
        expect(refs.length, `${item} has no ${phase} activity`).toBeGreaterThan(0);
      }
    }
  });

  it('is a fourth built-in profile, ordered by start, one gate per stage', () => {
    expect(CPO_PROFILE.id).toBe('cpoSwitch');
    expect(CPO_PROFILE.label).toBe('CPO Network Switch System');
    expect(CPO_PROFILE.builtin && CPO_PROFILE.template).toBe(true);
    const starts = CPO_PROFILE.stages.map((s) => s.startOffsetWeeks);
    expect([...starts].sort((a, b) => a - b)).toEqual(starts);
    expect(CPO_MILESTONES).toHaveLength(CPO_SKELETON.length);
    expect(CPO_MILESTONES.filter((m) => m.major).map((m) => m.id)).toEqual(
      expect.arrayContaining(['cpoTapeoutOptical', 'cpoTapeoutAll', 'cpoFirstSilicon', 'cpoKgoeReady', 'cpoFirstPackageBuild', 'cpoProductionRelease']),
    );
  });

  it('dates the countdowns in order: tapeout, first silicon, production', () => {
    const s = computeSchedule(new Date(2027, 0, 4), CPO_PROFILE, {});
    const at = (id: string) => s.milestones.find((m) => m.id === id)!.date.getTime();
    expect(at('cpoTapeoutOptical'), 'wave 1 tapes out before wave 2').toBeLessThan(at('cpoTapeoutAll'));
    expect(at('cpoTapeoutAll')).toBeLessThan(at('cpoFirstSilicon'));
    expect(at('cpoFirstSilicon')).toBeLessThan(at('cpoKgdReady'));
    expect(at('cpoKgdReady')).toBeLessThanOrEqual(at('cpoFirstPackageBuild'));
    expect(at('cpoKgoeReady')).toBeLessThanOrEqual(at('cpoFirstPackageBuild'));
    expect(at('cpoFirstPackageBuild')).toBeLessThanOrEqual(at('cpoFirstElectricalLink'));
    expect(at('cpoFirstElectricalLink')).toBeLessThan(at('cpoFirstOpticalLink'));
    expect(at('cpoFirstOpticalLink')).toBeLessThan(at('cpoFirstTraffic'));
    expect(at('cpoFirstTraffic')).toBeLessThan(at('cpoFullBandwidth'));
    expect(at('cpoQualComplete')).toBeLessThanOrEqual(at('cpoProductionRelease'));
    expect(at('cpoPvtComplete')).toBeLessThanOrEqual(at('cpoProductionRelease'));
  });

  it('freezes before it builds, and builds before it brings up', () => {
    /* the gates a later stage consumes close before it needs them */
    expect(stageEnd('cpoRequirements')).toBeLessThanOrEqual(stageEnd('cpoArchitecture'));
    expect(stageEnd('cpoArchitecture')).toBeLessThanOrEqual(stageEnd('cpoInterfaces'));
    expect(stageEnd('cpoInterfaces')).toBeLessThan(stageEnd('cpoDesign'));
    expect(stageEnd('cpoModeling')).toBeLessThan(stageEnd('cpoDesign'));
    expect(stageEnd('cpoDesign')).toBeLessThanOrEqual(stageEnd('cpoPresilicon'));
    expect(stageEnd('cpoPresilicon')).toBeLessThanOrEqual(stageEnd('cpoSignoff'));
    expect(stageEnd('cpoSignoff')).toBeLessThanOrEqual(stageEnd('cpoTapeout'));
    expect(stageEnd('cpoTestInfra')).toBeLessThanOrEqual(CPO_SKELETON.find((s) => s.key === 'cpoSort')!.start);
    expect(stageEnd('cpoSort')).toBeLessThanOrEqual(absStart('PKGA-03'));
  });

  it('freezes the optical engine stack before the photonic and electrical ICs tape out', () => {
    /* the bond pads and coupler keep-outs drawn into both dies come from the stack design */
    expect(stageEnd('cpoOeStackDesign')).toBeLessThanOrEqual(CPO_SKELETON.find((s) => s.key === 'cpoTapeoutOptical')!.start);
  });

  it('builds known-good optical engines from sorted dies, and mounts them only once they are known good', () => {
    /* the photonic and electrical dies are sorted and released before they are stacked */
    for (const ref of ['SORT-03', 'SORT-04', 'SORT-05']) expect(absEnd(ref), ref).toBeLessThanOrEqual(absStart('OEB-02'));
    /* the main package takes known-good engines and known-good Switch SoC and I/O dies, each after its gate */
    expect(stageEnd('cpoOeBuild')).toBeLessThanOrEqual(absStart('PKGA-04'));
    expect(stageEnd('cpoSort')).toBeLessThanOrEqual(absStart('PKGA-03'));
    expect(stageEnd('cpoOeBuild')).toBeLessThanOrEqual(stageEnd('cpoAssembly'));
    /* the electrical-only build and the dry run need no engine */
    for (const ref of ['PKGA-11', 'PKGA-12']) {
      const deps = [...CPO_WRITE_UPS[ref].links.dependsOn, ...CPO_WRITE_UPS[ref].dependsOn];
      expect(deps.filter((d) => d.startsWith('OEB-')), ref).toEqual([]);
      expect(absStart(ref), ref).toBeLessThan(stageEnd('cpoOeBuild'));
    }
  });

  it('starts the long-lead workstreams before the silicon they serve is finished', () => {
    const tapeoutStart = CPO_SKELETON.find((s) => s.key === 'cpoTapeout')!.start;
    const firstSilicon = stageEnd('cpoFabrication');
    /* package, board, optics, test and firmware are designed beside the silicon, not after it */
    for (const ref of ['SARC-05', 'DSGN-12', 'DSGN-13', 'DSGN-14', 'DSGN-15', 'TINF-01', 'TINF-09', 'TRDY-10']) {
      expect(absStart(ref), `${ref} starts after tapeout begins`).toBeLessThan(tapeoutStart);
    }
    for (const ref of ['DSGN-16', 'DSGN-17', 'PSV-09', 'MODL-09']) {
      expect(absStart(ref), `${ref} waits for silicon`).toBeLessThan(firstSilicon);
    }
    /* first-build material is ordered before the wafers come out */
    expect(absStart('PKGA-01')).toBeLessThan(firstSilicon);
  });
});

/* ---------------- every stage, as written ---------------- */

for (const sk of CPO_SKELETON) {
  describe(`${sk.prefix} — ${sk.title}`, () => {
    const st = CPO_STAGES.find((s) => s.id === sk.key)!;
    const refs = refsOf(sk.key);

    it('has its content written', () => {
      expect(st.tagline.length, 'tagline').toBeGreaterThan(20);
      expect(st.description.length, 'description').toBeGreaterThan(120);
      expect(st.activities, 'activity labels').toHaveLength(refs.length);
      expect(st.deliverables.length, 'deliverables').toBeGreaterThanOrEqual(3);
      expect(st.deliverableFrom, 'deliverableFrom').toHaveLength(st.deliverables.length);
      expect(st.deliverableWeek, 'deliverableWeek').toHaveLength(st.deliverables.length);
      for (const wk of st.deliverableWeek) {
        expect(wk).toBeGreaterThan(0);
        expect(wk, 'deliverable due after the stage ends').toBeLessThanOrEqual(sk.dur);
      }
      expect(st.engineeringEffort, 'effort').toHaveLength(refs.length);
      for (const e of st.engineeringEffort) expect(e).toBeGreaterThan(0);
      expect(st.risks.length).toBeGreaterThanOrEqual(2);
      expect(st.potentialRisks.length).toBeGreaterThanOrEqual(4);
      expect(st.leader.name.length).toBeGreaterThan(3);
      expect(st.collaboration.length).toBeGreaterThanOrEqual(3);
      expect(st.tools.length).toBeGreaterThanOrEqual(2);
      expect(st.programView.length).toBeGreaterThanOrEqual(2);
      expect(st.perspective.length).toBeGreaterThan(60);
      /* titles unique inside the template, so each carries its own tag */
      const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const all = CPO_STAGES.flatMap((s) => s.deliverables.map(norm));
      for (const d of st.deliverables) expect(all.filter((x) => x === norm(d)), d).toHaveLength(1);
    });

    it('gives every activity steps, one output per step, inside its window', () => {
      for (const ref of refs) {
        const a = CPO_ACTIVITIES[ref];
        expect(a.s.length, `${ref} has too few steps`).toBeGreaterThanOrEqual(3);
        expect(a.s.length, `${ref} has too many steps`).toBeLessThanOrEqual(10);
        a.s.forEach((step, i) => {
          expect(step[0], `${ref} step ${i}`).toBe(i + 1);
          expect(String(step[1]).length, `${ref} step ${i}`).toBeGreaterThan(8);
          expect(step[2], `${ref} step ${i}`).toBeGreaterThan(0);
        });
        expect(a.s[0][3], `${ref}: the first step cannot run beside nothing`).toBeFalsy();
        expect(a.o, ref).toHaveLength(a.s.length);
        for (const out of a.o) expect(out.length, `${ref}: "${out}"`).toBeGreaterThan(8);
        const mainLane = a.s.filter((x) => !x[3]).reduce((t, x) => t + x[2], 0);
        expect(mainLane, `${ref} main lane ${mainLane}w does not fit its ${a.w[1] - a.w[0]}w window`).toBeLessThanOrEqual(
          a.w[1] - a.w[0] + 1e-9,
        );
      }
    });

    it('relates every activity to its own deliverables, and names a producer for each', () => {
      for (const ref of refs) {
        const a = CPO_ACTIVITIES[ref];
        expect(a.r.length, `${ref} relates to no deliverable`).toBeGreaterThan(0);
        for (const [dref, rel] of a.r) {
          expect(CPO_DELIVERABLES[dref], `${ref} → ${dref}`).toBeTruthy();
          expect(dref.split('-')[0], `${ref} → ${dref}`).toBe(sk.prefix);
          expect(['produces', 'feeds', 'informs', 'gates'], `${ref} → ${dref}`).toContain(rel);
        }
      }
      const producers = producersOf(CPO_ACTIVITIES);
      st.deliverables.forEach((_, i) => {
        const dref = `${sk.prefix}-D${i + 1}`;
        const makers = refs.filter((r) => CPO_ACTIVITIES[r].r.some(([d, rel]) => d === dref && rel === 'produces'));
        expect(makers, `${dref} producers`).toHaveLength(1);
        expect(refs[st.deliverableFrom[i]], `${dref} deliverableFrom`).toBe(makers[0]);
        expect(deliverableStep(dref, producers)?.act, dref).toBe(makers[0]);
      });
    });

    it('writes up every activity in the shape the page prints', () => {
      refs.forEach((ref, i) => {
        const w = CPO_WRITE_UPS[ref];
        expect(w, `${ref} has no write-up`).toBeTruthy();
        expect(cpoDetail(ref), ref).toBeTruthy();
        expect(w.purpose, `${ref} purpose`).toHaveLength(2);
        expect(w.consumes, `${ref} consumes`).toHaveLength(5);
        expect(w.risks, `${ref} risks`).toHaveLength(5);
        expect(w.roles, `${ref} roles`).toHaveLength(5);
        expect(new Set(w.roles.map((r) => r.r)).size, `${ref} repeats a role`).toBe(5);
        expect(w.roles[0].r, `${ref} is owned by its skeleton owner`).toBe(CPO_ACTIVITIES[ref].ro);
        expect(w.entry, `${ref} entry`).toHaveLength(3);
        expect(w.exit, `${ref} exit`).toHaveLength(3);
        expect(w.measuredBy, `${ref} measuredBy`).toHaveLength(3);
        expect(w.effort.length, `${ref} effort`).toBeGreaterThanOrEqual(3);
        expect(w.effort.length, `${ref} effort`).toBeLessThanOrEqual(7);
        const sum = w.effort.reduce((t, [, mm]) => t + mm, 0);
        expect(sum, `${ref} effort adds to ${sum}, the stage says ${st.engineeringEffort[i]}`).toBeCloseTo(
          st.engineeringEffort[i],
          5,
        );
        expect(w.flowNote.length, `${ref} flowNote`).toBeGreaterThan(40);
        for (const risk of w.risks) expect(risk, ref).toMatch(/^<b>[^<]+<\/b> \S/);
        expect(Object.keys(w.rel).sort(), `${ref} rel`).toEqual(CPO_ACTIVITIES[ref].r.map(([d]) => d).sort());
        for (const [dref, text] of Object.entries(w.rel)) expect(text, `${ref} → ${dref}`).toMatch(/^<b>[^<]+<\/b> \S/);
        expect(new Set(w.terms).size, `${ref} repeats a term`).toBe(w.terms.length);
        for (const t of w.terms) expect(GLOSSARY[t], `${ref} term ${t}`).toBeTruthy();
      });
    });

    it('links only to CPO activities that exist, never to itself', () => {
      for (const ref of refs) {
        const w = CPO_WRITE_UPS[ref];
        const { links } = w;
        const all = [
          ...w.dependsOn,
          ...w.feedsInto,
          ...links.dependsOn,
          ...links.feedsInto,
          ...links.runsWith,
          ...links.revisedBy,
          ...links.feedsBackInto,
        ];
        for (const x of all) {
          expect(CPO_ACTIVITY_TITLES[x], `${ref} links to ${x}`).toBeTruthy();
          expect(x, ref).not.toBe(ref);
        }
        expect(links.dependsOn.length + links.feedsInto.length, `${ref} is connected to nothing`).toBeGreaterThan(0);
        for (const x of w.dependsOn) expect([...links.dependsOn, ...links.runsWith, ...links.revisedBy], `${ref} dependsOn ${x}`).toContain(x);
        for (const x of w.feedsInto) expect([...links.feedsInto, ...links.feedsBackInto], `${ref} feedsInto ${x}`).toContain(x);
      }
    });

    it('writes prose the page can print, naming no vendor and pinning no revision', () => {
      for (const ref of refs) {
        for (const s of proseOf(ref)) {
          expect(s.trim(), `${ref}: ${JSON.stringify(s)}`).toBe(s);
          expect(/\s{2,}|\n/.test(s), `${ref}: ${JSON.stringify(s)}`).toBe(false);
          for (const tag of s.match(/<\/?([a-z]+)[^>]*>/g) ?? []) expect(tag, `${ref}: ${s}`).toMatch(/^<\/?(b|code)>$/);
          for (const id of refsIn(parseRich(s))) expect(CPO_ACTIVITY_TITLES[id], `${ref} names ${id}`).toBeTruthy();
          expect(NAMED.test(s), `${ref}: ${s}`).toBe(false);
        }
        for (const s of [CPO_ACTIVITY_TITLES[ref], ...CPO_ACTIVITIES[ref].s.map((x) => String(x[1])), ...CPO_ACTIVITIES[ref].o]) {
          expect(NAMED.test(s), `${ref}: ${s}`).toBe(false);
        }
      }
      for (const s of [st.tagline, st.description, ...st.deliverables, ...st.risks, ...st.potentialRisks, ...st.tools, st.perspective]) {
        expect(NAMED.test(s), `${sk.prefix}: ${s}`).toBe(false);
      }
    });
  });
}

/* ---------------- dependency integrity across the template ---------------- */

describe('CPO dependency integrity', () => {
  const written = Object.keys(CPO_ACTIVITIES).filter((r) => CPO_WRITE_UPS[r]);
  const edges = written.flatMap((y) => CPO_WRITE_UPS[y].links.dependsOn.map((x) => [x, y] as const));

  it('forms no loop through what each activity depends on', () => {
    const next = new Map<string, string[]>();
    for (const [x, y] of edges) next.set(x, [...(next.get(x) ?? []), y]);
    const state = new Map<string, 0 | 1 | 2>();
    const cycle: string[] = [];
    const visit = (n: string, path: string[]): boolean => {
      if (state.get(n) === 1) {
        cycle.push(...path, n);
        return true;
      }
      if (state.get(n) === 2) return false;
      state.set(n, 1);
      for (const m of next.get(n) ?? []) if (visit(m, [...path, n])) return true;
      state.set(n, 2);
      return false;
    };
    for (const n of written) if (visit(n, [])) break;
    expect(cycle, `loop: ${cycle.join(' → ')}`).toEqual([]);
  });

  it('never depends on work that starts after it is due to finish', () => {
    for (const [x, y] of edges) {
      expect(absStart(x), `${y} (ends wk ${absEnd(y)}) depends on ${x} (starts wk ${absStart(x)})`).toBeLessThan(absEnd(y));
    }
    for (const x of written) {
      for (const y of CPO_WRITE_UPS[x].links.feedsInto) {
        expect(absStart(x), `${x} (starts wk ${absStart(x)}) feeds ${y} (ends wk ${absEnd(y)})`).toBeLessThan(absEnd(y));
      }
    }
  });

  it('keeps pre-tapeout work free of post-tapeout prerequisites', () => {
    const tapeout = stageEnd('cpoTapeout');
    for (const [x, y] of edges) {
      if (absEnd(y) <= tapeout) expect(absStart(x), `${y} is due before tapeout but depends on ${x}`).toBeLessThan(tapeout);
    }
  });

  it('closes every gate review on the work of its own stage', () => {
    for (const sk of CPO_SKELETON) {
      /* the stage's gate review: the last activity named as one */
      const last = [...sk.activities].reverse().find((a) => /Review|Decision|Freeze|Handover/.test(a.title));
      if (!last || !CPO_WRITE_UPS[last.ref]) continue;
      /* what it reviews: the stage's other work that starts before it does */
      const others = sk.activities.filter((a) => a.ref !== last.ref && a.w[0] < last.w[0]).map((a) => a.ref);
      if (!others.length) continue;
      const deps = new Set([...CPO_WRITE_UPS[last.ref].links.dependsOn, ...CPO_WRITE_UPS[last.ref].dependsOn]);
      const covered = others.filter((r) => deps.has(r)).length;
      expect(covered / others.length, `${last.ref} depends on ${covered} of ${others.length} activities it reviews`).toBeGreaterThanOrEqual(0.5);
    }
  });

  it('gives every deliverable a tag no other template claims', () => {
    for (const ref of Object.keys(CPO_DELIVERABLES)) expect(ALL_DELIVERABLE_TITLES[ref], ref).toBe(CPO_DELIVERABLES[ref]);
    const prefixOf: Record<string, string> = {};
    for (const [ref, a] of Object.entries(CPO_ACTIVITIES)) prefixOf[ref.split('-')[0]] = a.st;
    const rows = CPO_STAGES.flatMap((s) => s.deliverables.map((title, i) => ({ id: `${s.id}:${i}`, title, stageId: s.id })));
    const refOf = deliverableRefs(rows, CPO_DELIVERABLES, prefixOf);
    for (const s of CPO_STAGES) {
      s.deliverables.forEach((title, i) => {
        expect(refOf.get(`${s.id}:${i}`), `${s.id} "${title}"`).toBe(`${s.shortTitle}-D${i + 1}`);
      });
    }
  });
});

/* ---------------- the template as a program flow (tools/cpoFlow) ---------------- */

describe('CPO program flow', () => {
  const base = JSON.parse(readFileSync('tests/unit/fixtures/cpoSwitchBaseline.json', 'utf8')) as {
    activities: { ref: string }[];
    deliverables: { ref: string }[];
  };

  it('accounts for every activity and deliverable the template had before the die split', () => {
    for (const { ref } of base.activities) {
      const f = ACTIVITY_FATE[ref];
      expect(f, `${ref} is unaccounted for`).toBeTruthy();
      if (f.fate === 'deleted') expect(f.why, `${ref} deleted without a reason`).toBeTruthy();
      else for (const to of f.to) expect(CPO_ACTIVITY_TITLES[to], `${ref} → ${to}`).toBeTruthy();
    }
    for (const { ref } of base.deliverables) {
      const f = DELIVERABLE_FATE[ref];
      expect(f, `${ref} is unaccounted for`).toBeTruthy();
      if (f.fate === 'deleted') expect(f.why, `${ref} deleted without a reason`).toBeTruthy();
      else for (const to of f.to) expect(CPO_DELIVERABLES[to], `${ref} → ${to}`).toBeTruthy();
    }
  });

  it('links every input a write-up consumes to the activity that produces it, and leaves nothing isolated', () => {
    for (const y of Flow.ALL_REFS) {
      const l = CPO_WRITE_UPS[y].links;
      const linked = new Set([...l.dependsOn, ...l.runsWith, ...l.revisedBy, ...CPO_WRITE_UPS[y].dependsOn]);
      for (const x of Flow.namedProducers(y)) if (x !== y) expect(linked.has(x), `${y} consumes from ${x} without a link`).toBe(true);
    }
    expect(Flow.isolated()).toEqual([]);
  });

  it('makes the hand-offs the optical engine split exists for, each finished before it is used', () => {
    for (const h of Flow.KEY_HANDOFFS) {
      for (const y of h.to) {
        for (const x of h.from) {
          expect(Flow.predecessorsOf(y), `${h.what}: ${y} does not wait on ${x}`).toContain(x);
          expect(Flow.absEnd(x), `${h.what}: ${x} ends after ${y} ends`).toBeLessThanOrEqual(Flow.absEnd(y));
        }
      }
    }
  });

  it('closes every gate on an activity of its own stage, at the stage’s end', () => {
    for (const s of CPO_SKELETON) {
      const ref = Flow.GATE_CLOSERS[s.key];
      const a = s.activities.find((x) => x.ref === ref);
      expect(a, `${s.key} has no gate closer`).toBeTruthy();
      expect(a!.w[1], `${ref} ends ${s.dur - a!.w[1]} weeks before the ${s.gate.label} gate`).toBeGreaterThanOrEqual(s.dur - 2);
    }
  });

  it('sets the first package build by the photonic IC and optical engine path, with slack on the Switch SoC and I/O path', () => {
    const cpm = Flow.cpm();
    const intoBuild = cpm.chainTo('PKGA-06').map((s) => s.ref);
    for (const ref of ['OTO-02', 'WFAB-04', 'SORT-04', 'OEB-02', 'OEB-09', 'PKGA-04']) {
      expect(intoBuild, `the critical path into the first package build misses ${ref}`).toContain(ref);
    }
    /* no float on the engine path, two weeks on the Switch SoC and four on the I/O die, into the build and into production */
    const intoBuildFloat = cpm.floatTo('PKGA-06');
    const intoProduction = cpm.floatTo('RAMP-07');
    for (const ref of ['OTO-02', 'WFAB-04', 'SORT-04', 'SORT-05', 'OEB-02', 'OEB-09', 'PKGA-04']) {
      expect(intoBuildFloat(ref), `${ref} has float into the first package build`).toBe(0);
      expect(intoProduction(ref), `${ref} has float into production release`).toBe(0);
    }
    expect(intoBuildFloat('PKGA-03'), 'Switch SoC and I/O die attach').toBeGreaterThan(0);
    expect(intoBuildFloat('WFAB-01'), 'Switch SoC fab').toBeGreaterThan(0);
    expect(intoBuildFloat('WFAB-02'), 'I/O die fab').toBeGreaterThan(0);
  });

  it('stays within eight weeks of the program length it had before the split', () => {
    const before = JSON.parse(readFileSync('tests/unit/fixtures/cpoSwitchBaseline.json', 'utf8')).programWeeks as number;
    const after = Math.max(...CPO_SKELETON.map((s) => s.start + s.dur));
    expect(after - before).toBeLessThanOrEqual(8);
  });
});
