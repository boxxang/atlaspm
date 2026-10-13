import { describe, expect, it } from 'vitest';
import { ALL_ACTIVITIES, ALL_GLOSSARY, ALL_MILESTONES, ALL_STAGE_CONTENT } from '@/data/builtins';
import { UCIE_ACTIVITIES, UCIE_ACTIVITY_TITLES, UCIE_DELIVERABLES, UCIE_STAGES } from '@/data/ucieAdv64';
import { UCIE_ITEMS, UCIE_OWNERS, UCIE_SKELETON } from '@/data/ucieAdv64/skeleton';
import { UCIE_GLOSSARY } from '@/data/ucieAdv64/glossary';
import { UCIE_WRITE_UPS, ucieDetail } from '@/data/ucieAdv64Details';
import { deliverableStep, producersOf } from '@/lib/deliverableStatus';
import { parseRich, type RichNode } from '@/lib/activityRefs';
import { computeSchedule } from '@/lib/schedule';
import { BUILTIN_PROFILES } from '@/data/builtins';
import { UCIE_COUNTDOWN_KEYS, UCIE_MILESTONES, UCIE_PROFILE } from '@/data/ucieAdv64';
import * as Flow from '../../tools/ucieFlow/analysis';

/**
 * The UCIe Advanced 64G Die-to-Die PHY IP template: an IP program from
 * concept to production release, staged by lifecycle, with the adapter,
 * logical PHY, electrical PHY, channel, test chip and release workstreams
 * running as parallel activities inside the stages.
 */
const OWN_KEYS = new Set(UCIE_SKELETON.map((s) => s.key));
const OTHER_PREFIXES = new Set(ALL_STAGE_CONTENT.filter((s) => !OWN_KEYS.has(s.id)).map((s) => s.shortTitle));
const OTHER_MILESTONES = new Set(ALL_MILESTONES.filter((m) => !OWN_KEYS.has(m.anchor.stage)).map((m) => m.id));
const OTHER_ACTIVITIES = new Set(Object.keys(ALL_ACTIVITIES).filter((r) => !OWN_KEYS.has(ALL_ACTIVITIES[r].st)));
const GLOSSARY = { ...ALL_GLOSSARY, ...UCIE_GLOSSARY };
const refsOf = (key: string) => UCIE_SKELETON.find((s) => s.key === key)!.activities.map((a) => a.ref);

const refsIn = (nodes: RichNode[]): string[] =>
  nodes.flatMap((n) => (n.kind === 'ref' ? [n.id] : n.kind === 'tag' ? refsIn(n.children) : []));

/*
 * Generic throughout: no foundry, assembly house, EDA or test-equipment
 * company, no IP vendor, no package-technology brand — and no pinned
 * specification revision. "UCIe" and "64 GT/s" are the subject; the revision
 * that defines 64 GT/s is never numbered.
 */
const NAMED =
  /\b(TSMC|Samsung|Intel|GlobalFoundries|UMC|SMIC|Rapidus|ASE|Amkor|JCET|SPIL|Powertech|Cadence|Synopsys|Siemens|Mentor|Ansys|Keysight|Teradyne|Advantest|Tektronix|Alphawave|Eliyan|Marvell|Broadcom|NVIDIA|Nvidia|AMD|Avery|Truechip|CoWoS(-[SLR])?|EMIB|Foveros|InFO|SoIC|I-Cube|X-Cube)\b|\bUCIe\s*[0-9]\.[0-9]\b|\b(PCIe|CXL)\s*[0-9]\.[0-9]\b|\b([Rr]evision|[Rr]ev\.?|[Vv]ersion)\s*[0-9]\.[0-9]\b|\bJESD\d+/;

const proseOf = (ref: string): string[] => {
  const w = UCIE_WRITE_UPS[ref];
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

describe('UCIe skeleton', () => {
  it('names each stage, prefix, gate and activity once, and no other template’s', () => {
    const keys = UCIE_SKELETON.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
    const prefixes = UCIE_SKELETON.map((s) => s.prefix);
    expect(new Set(prefixes).size).toBe(prefixes.length);
    for (const s of UCIE_SKELETON) {
      expect(s.prefix, s.key).toMatch(/^[A-Z][A-Z0-9]{1,4}$/);
      expect(OTHER_PREFIXES.has(s.prefix), `${s.prefix} is another template’s`).toBe(false);
      expect(OTHER_MILESTONES.has(s.gate.id), `${s.gate.id} is another template’s`).toBe(false);
      expect(s.activities.length, `${s.key} activities`).toBeGreaterThanOrEqual(4);
      expect(s.activities.length, `${s.key} activities`).toBeLessThanOrEqual(12);
      s.activities.forEach((a, i) => {
        expect(a.ref, s.key).toBe(`${s.prefix}-${String(i + 1).padStart(2, '0')}`);
        expect(UCIE_OWNERS as readonly string[], a.ref).toContain(a.owner);
        expect(UCIE_ITEMS as readonly string[], a.ref).toContain(a.item);
        expect(a.w[0], a.ref).toBeGreaterThanOrEqual(0);
        expect(a.w[1], a.ref).toBeGreaterThan(a.w[0]);
        expect(a.w[1], `${a.ref} runs past its stage`).toBeLessThanOrEqual(s.dur);
        expect(OTHER_ACTIVITIES.has(a.ref), `${a.ref} is another template’s`).toBe(false);
      });
    }
    expect(new Set(UCIE_SKELETON.map((s) => s.gate.id)).size).toBe(UCIE_SKELETON.length);
    const total = UCIE_SKELETON.reduce((t, s) => t + s.activities.length, 0);
    expect(total).toBeGreaterThanOrEqual(180);
    expect(total).toBeLessThanOrEqual(230);
  });
});

/* ---------------- every stage, as written ---------------- */

for (const sk of UCIE_SKELETON) {
  describe(`${sk.prefix} — ${sk.title}`, () => {
    const st = UCIE_STAGES.find((s) => s.id === sk.key)!;
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
      expect(st.leader.email, 'a placeholder address').toMatch(/@example\.com$/);
      expect(st.collaboration.length).toBeGreaterThanOrEqual(3);
      expect(st.tools.length).toBeGreaterThanOrEqual(2);
      expect(st.programView.length).toBeGreaterThanOrEqual(2);
      expect(st.perspective.length).toBeGreaterThan(60);
      const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const all = UCIE_STAGES.flatMap((s) => s.deliverables.map(norm));
      for (const d of st.deliverables) expect(all.filter((x) => x === norm(d)), d).toHaveLength(1);
    });

    it('gives every activity steps, one output per step, inside its window', () => {
      for (const ref of refs) {
        const a = UCIE_ACTIVITIES[ref];
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
        const a = UCIE_ACTIVITIES[ref];
        expect(a.r.length, `${ref} relates to no deliverable`).toBeGreaterThan(0);
        for (const [dref, rel] of a.r) {
          expect(UCIE_DELIVERABLES[dref], `${ref} → ${dref}`).toBeTruthy();
          expect(dref.split('-')[0], `${ref} → ${dref}`).toBe(sk.prefix);
          expect(['produces', 'feeds', 'informs', 'gates'], `${ref} → ${dref}`).toContain(rel);
        }
      }
      const producers = producersOf(UCIE_ACTIVITIES);
      st.deliverables.forEach((_, i) => {
        const dref = `${sk.prefix}-D${i + 1}`;
        const makers = refs.filter((r) => UCIE_ACTIVITIES[r].r.some(([d, rel]) => d === dref && rel === 'produces'));
        expect(makers, `${dref} producers`).toHaveLength(1);
        expect(refs[st.deliverableFrom[i]], `${dref} deliverableFrom`).toBe(makers[0]);
        expect(deliverableStep(dref, producers)?.act, dref).toBe(makers[0]);
      });
    });

    it('writes up every activity in the shape the page prints', () => {
      refs.forEach((ref, i) => {
        const w = UCIE_WRITE_UPS[ref];
        expect(w, `${ref} has no write-up`).toBeTruthy();
        expect(ucieDetail(ref), ref).toBeTruthy();
        expect(w.purpose, `${ref} purpose`).toHaveLength(2);
        expect(w.consumes, `${ref} consumes`).toHaveLength(5);
        expect(w.risks, `${ref} risks`).toHaveLength(5);
        expect(w.roles, `${ref} roles`).toHaveLength(5);
        expect(new Set(w.roles.map((r) => r.r)).size, `${ref} repeats a role`).toBe(5);
        expect(w.roles[0].r, `${ref} is owned by its skeleton owner`).toBe(UCIE_ACTIVITIES[ref].ro);
        expect(w.entry, `${ref} entry`).toHaveLength(3);
        expect(w.exit, `${ref} exit`).toHaveLength(3);
        expect(w.measuredBy, `${ref} measuredBy`).toHaveLength(3);
        expect(w.effort.length, `${ref} effort`).toBeGreaterThanOrEqual(3);
        expect(w.effort.length, `${ref} effort`).toBeLessThanOrEqual(7);
        const sum = w.effort.reduce((t, [, mm]) => t + mm, 0);
        expect(sum, `${ref} effort adds to ${sum}, the stage says ${st.engineeringEffort[i]}`).toBeCloseTo(st.engineeringEffort[i], 5);
        expect(w.flowNote.length, `${ref} flowNote`).toBeGreaterThan(40);
        for (const risk of w.risks) expect(risk, ref).toMatch(/^<b>[^<]+<\/b> \S/);
        expect(Object.keys(w.rel).sort(), `${ref} rel`).toEqual(UCIE_ACTIVITIES[ref].r.map(([d]) => d).sort());
        for (const [dref, text] of Object.entries(w.rel)) expect(text, `${ref} → ${dref}`).toMatch(/^<b>[^<]+<\/b> \S/);
        expect(new Set(w.terms).size, `${ref} repeats a term`).toBe(w.terms.length);
        for (const t of w.terms) expect(GLOSSARY[t], `${ref} term ${t}`).toBeTruthy();
      });
    });

    it('links only to UCIe activities that exist, never to itself', () => {
      for (const ref of refs) {
        const w = UCIE_WRITE_UPS[ref];
        const { links } = w;
        const all = [...w.dependsOn, ...w.feedsInto, ...links.dependsOn, ...links.feedsInto, ...links.runsWith, ...links.revisedBy, ...links.feedsBackInto];
        for (const x of all) {
          expect(UCIE_ACTIVITY_TITLES[x], `${ref} links to ${x}`).toBeTruthy();
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
          for (const id of refsIn(parseRich(s))) expect(UCIE_ACTIVITY_TITLES[id], `${ref} names ${id}`).toBeTruthy();
          expect(NAMED.test(s), `${ref}: ${s}`).toBe(false);
        }
        for (const s of [UCIE_ACTIVITY_TITLES[ref], ...UCIE_ACTIVITIES[ref].s.map((x) => String(x[1])), ...UCIE_ACTIVITIES[ref].o]) {
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

const stageOfRef = (ref: string) => UCIE_SKELETON.find((s) => s.activities.some((a) => a.ref === ref))!;
const absStart = (ref: string) => stageOfRef(ref).start + UCIE_ACTIVITIES[ref].w[0];
const absEnd = (ref: string) => stageOfRef(ref).start + UCIE_ACTIVITIES[ref].w[1];
const stageEnd = (key: string) => {
  const s = UCIE_SKELETON.find((x) => x.key === key)!;
  return s.start + s.dur;
};

describe('UCIe dependency integrity', () => {
  const written = Object.keys(UCIE_ACTIVITIES).filter((r) => UCIE_WRITE_UPS[r]);
  const edges = written.flatMap((y) =>
    [...new Set([...UCIE_WRITE_UPS[y].links.dependsOn, ...UCIE_WRITE_UPS[y].dependsOn])].map((x) => [x, y] as const),
  );

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
      for (const y of UCIE_WRITE_UPS[x].links.feedsInto) {
        expect(absStart(x), `${x} (starts wk ${absStart(x)}) feeds ${y} (ends wk ${absEnd(y)})`).toBeLessThan(absEnd(y));
      }
    }
  });

  it('keeps pre-tapeout work free of post-tapeout prerequisites', () => {
    const tapeout = stageEnd('ucieTapeout');
    for (const [x, y] of edges) {
      if (absEnd(y) <= tapeout) expect(absStart(x), `${y} is due before tapeout but depends on ${x}`).toBeLessThan(tapeout);
    }
  });

  it('closes every gate review on the work of its own stage', () => {
    for (const sk of UCIE_SKELETON) {
      const last = [...sk.activities].reverse().find((a) => /Review|Decision|Freeze|Handover/.test(a.title));
      if (!last || !UCIE_WRITE_UPS[last.ref]) continue;
      const others = sk.activities.filter((a) => a.ref !== last.ref && a.w[0] < last.w[0]).map((a) => a.ref);
      if (!others.length) continue;
      const deps = new Set([...UCIE_WRITE_UPS[last.ref].links.dependsOn, ...UCIE_WRITE_UPS[last.ref].dependsOn]);
      const covered = others.filter((r) => deps.has(r)).length;
      expect(covered / others.length, `${last.ref} depends on ${covered} of ${others.length} activities it reviews`).toBeGreaterThanOrEqual(0.5);
    }
  });

  it('links every input a write-up names to a dependency on its producer', () => {
    for (const y of written) {
      const w = UCIE_WRITE_UPS[y];
      const linked = new Set([...w.links.dependsOn, ...w.links.runsWith, ...w.links.revisedBy, ...w.dependsOn]);
      const named = [...new Set(w.consumes.flatMap((c) => c.match(/\b[A-Z]{2,5}-\d{2}\b/g) ?? []))];
      for (const x of named) if (x !== y) expect(linked.has(x), `${y} consumes from ${x} without a link`).toBe(true);
    }
  });
});

/* ---------------- the template as a built-in, and its flow rules ---------------- */

const dependsOnAll = (y: string, xs: string[]) => {
  const up = Flow.upstreamOf(y);
  for (const x of xs) expect(up.has(x), `${y} does not wait on ${x}`).toBe(true);
};

describe('UCIe as a built-in', () => {
  it('is the fifth built-in, offered, ordered by start, one gate per stage', () => {
    expect(BUILTIN_PROFILES.map((p) => p.id)).toContain('ucieAdv64');
    expect(UCIE_PROFILE.label).toBe('UCIe Advanced 64G Die-to-Die PHY IP');
    expect(UCIE_PROFILE.builtin && UCIE_PROFILE.template).toBe(true);
    const starts = UCIE_PROFILE.stages.map((s) => s.startOffsetWeeks);
    expect([...starts].sort((a, b) => a - b)).toEqual(starts);
    expect(UCIE_MILESTONES).toHaveLength(UCIE_SKELETON.length);
    expect(UCIE_MILESTONES.filter((m) => m.major).map((m) => m.id)).toEqual(
      expect.arrayContaining(['ucieArchitectureFreeze', 'ucieHardMacroSignoff', 'ucieTapeout', 'ucieSiliconProven', 'ucieIpGa']),
    );
  });

  it('dates its countdowns in order — tapeout, silicon in hand, production release — and runs about 128 weeks to production release', () => {
    const sch = computeSchedule(new Date(2027, 0, 4), UCIE_PROFILE, {});
    expect(sch.tapeout!.getTime()).toBeLessThan(sch.firstSilicon!.getTime());
    expect(sch.firstSilicon!.getTime()).toBeLessThan(sch.production!.getTime());
    expect(UCIE_COUNTDOWN_KEYS).toEqual({ tapeout: 'ucieTapeout', firstSilicon: 'ucieFab', production: 'ucieGa' });
    const ga = stageEnd('ucieGa');
    expect(ga).toBeGreaterThanOrEqual(124);
    expect(ga).toBeLessThanOrEqual(132);
  });

  it('gives every block a track from definition through design to silicon or release', () => {
    const IN = (keys: string[]) => (item: string) =>
      UCIE_SKELETON.filter((s) => keys.includes(s.key)).flatMap((s) => s.activities.filter((a) => a.item === item));
    const define = IN(['ucieRequirements', 'ucieArchitecture', 'ucieTechnology']);
    const build = IN(['ucieAfe', 'ucieRtl', 'ucieDft', 'ucieDv', 'ucieAms', 'ucieDigitalPd', 'ucieLayout', 'ucieSignoff', 'ucieChannel', 'ucieTestChip', 'ucieTestVehicle', 'ucieTapeout', 'ucieFab']);
    const prove = IN(['ucieBringup', 'ucieCharacterization', 'ucieCompliance', 'ucieReliability', 'uciePreSilicon', 'ucieGa']);
    for (const item of ['adapter', 'logicalPhy', 'afe', 'channel', 'testchip', 'program']) {
      if (item !== 'testchip') expect(define(item).length, `${item} is not defined`).toBeGreaterThan(0);
      expect(build(item).length, `${item} is not built`).toBeGreaterThan(0);
      if (item !== 'testchip') expect(prove(item).length, `${item} is not proven or released`).toBeGreaterThan(0);
    }
  });
});

describe('UCIe flow rules', () => {
  it('freezes before it builds: architecture before design, RTL and circuits before implementation, signoff before tapeout', () => {
    for (const ref of ['UAFE-02', 'UAFE-03', 'UAFE-04', 'UAFE-05', 'UAFE-06', 'UAFE-07', 'URTL-02', 'URTL-03', 'URTL-04', 'URTL-05', 'URTL-06', 'URTL-07', 'URTL-08']) {
      dependsOnAll(ref, ['UARC-12']);
      expect(absStart(ref), ref).toBeGreaterThanOrEqual(stageEnd('ucieArchitecture'));
    }
    for (const ref of ['UDPD-02', 'UDPD-03', 'UDPD-04', 'UDPD-05', 'UDPD-06', 'UDPD-07']) {
      dependsOnAll(ref, ['URTL-10']);
      expect(absStart(ref), ref).toBeGreaterThanOrEqual(stageEnd('ucieRtl'));
    }
    for (const ref of ['ULAY-02', 'ULAY-03', 'ULAY-04', 'ULAY-05', 'ULAY-06', 'ULAY-07']) {
      dependsOnAll(ref, ['UAFE-09']);
      expect(absStart(ref), ref).toBeGreaterThanOrEqual(stageEnd('ucieAfe'));
    }
    dependsOnAll('UTCI-05', ['USGN-07']);
    expect(absEnd('UTCI-05')).toBeGreaterThanOrEqual(stageEnd('ucieSignoff'));
    dependsOnAll('UTPO-04', ['USGN-07', 'UTCI-06']);
    expect(absStart('UTPO-04')).toBeGreaterThanOrEqual(stageEnd('ucieSignoff'));
  });

  it('co-designs the channel: it starts before the architecture freezes, and freezes the bump map before layout and the test chip use it', () => {
    expect(UCIE_SKELETON.find((s) => s.key === 'ucieChannel')!.start).toBeLessThan(stageEnd('ucieArchitecture'));
    for (const ref of ['ULAY-04', 'UTCI-03']) {
      dependsOnAll(ref, ['UCHN-03']);
      expect(absEnd('UCHN-03'), ref).toBeLessThanOrEqual(absStart(ref));
    }
  });

  it('has the test vehicle, boards, ATE and lab ready before the silicon is in hand', () => {
    for (const a of UCIE_SKELETON.find((s) => s.key === 'ucieTestVehicle')!.activities) {
      expect(absEnd(a.ref), a.ref).toBeLessThanOrEqual(stageEnd('ucieFab'));
    }
  });

  it('releases to customers in step: v0.5 after RTL freeze, v0.9 after signoff, production release on every silicon result, support from v0.5 past production release', () => {
    dependsOnAll('UPRE-02', ['URTL-10']);
    expect(absStart('UPRE-02')).toBeGreaterThanOrEqual(stageEnd('ucieRtl'));
    dependsOnAll('UPRE-08', ['USGN-07']);
    expect(absStart('UPRE-08')).toBeGreaterThanOrEqual(stageEnd('ucieSignoff'));
    for (const x of ['UCHR-10', 'UCMP-05', 'URLQ-06']) expect(Flow.predecessorsOf('UGA-05'), `Production release approval waits on ${x}`).toContain(x);
    const customer = UCIE_SKELETON.find((s) => s.key === 'ucieCustomer')!;
    expect(customer.start).toBeGreaterThanOrEqual(absStart('UPRE-02'));
    expect(stageEnd('ucieCustomer')).toBeGreaterThan(stageEnd('ucieGa'));
    dependsOnAll('UCUS-01', ['UPRE-02']);
  });

  it('holds what the reviews added: a partner before the bump map, hardware before stress, production release after silicon-proven, a margin before tapeout', () => {
    expect(absEnd('UTEC-07')).toBeLessThanOrEqual(absStart('UCHN-03'));
    dependsOnAll('UCHN-03', ['UTEC-07']);
    expect(absEnd('UTVP-08')).toBeLessThanOrEqual(absStart('UFAB-03'));
    dependsOnAll('URLQ-02', ['UTVP-09']);
    expect(absStart('URLQ-02')).toBeGreaterThanOrEqual(absEnd('UBUP-04'));
    dependsOnAll('UGA-04', ['URLQ-06']);
    expect(absStart('UGA-04')).toBeGreaterThanOrEqual(absEnd('URLQ-06'));
    expect(absStart('UTPO-04') - absEnd('USGN-07'), 'weeks between hard macro signoff and database release').toBeGreaterThanOrEqual(2);
    dependsOnAll('USGN-07', ['USGN-08', 'UCHN-08', 'UDV-12', 'UAMS-08']);
    dependsOnAll('UBUP-07', ['UBUP-04']);
  });

  it('carries the pre-silicon test plan and margin predictions into bring-up and characterization, and correlates them', () => {
    for (const ref of ['UBUP-05', 'UTVP-06']) dependsOnAll(ref, ['UDV-11', 'UAMS-07']);
    dependsOnAll('UCHR-01', ['UDV-11']);
    expect(UCIE_ACTIVITY_TITLES['UCHR-09']).toMatch(/Correlation/);
    dependsOnAll('UCHR-09', ['UAMS-07', 'UCHR-02', 'UCHR-03']);
  });

  it('closes every gate on an activity of its own stage, at the stage’s end, and leaves nothing isolated', () => {
    for (const s of UCIE_SKELETON) {
      const ref = Flow.GATE_CLOSERS[s.key];
      const a = s.activities.find((x) => x.ref === ref);
      expect(a, `${s.key} has no gate closer`).toBeTruthy();
      expect(a!.w[1], `${ref} ends ${s.dur - a!.w[1]} weeks before the ${s.gate.label} gate`).toBeGreaterThanOrEqual(s.dur - 2);
    }
    expect(Flow.isolated()).toEqual([]);
  });
});
