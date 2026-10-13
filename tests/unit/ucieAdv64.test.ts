import { describe, expect, it } from 'vitest';
import { ALL_ACTIVITIES, ALL_GLOSSARY, ALL_MILESTONES, ALL_STAGE_CONTENT } from '@/data/builtins';
import { UCIE_ACTIVITIES, UCIE_ACTIVITY_TITLES, UCIE_DELIVERABLES, UCIE_STAGES } from '@/data/ucieAdv64';
import { UCIE_ITEMS, UCIE_OWNERS, UCIE_SKELETON } from '@/data/ucieAdv64/skeleton';
import { UCIE_GLOSSARY } from '@/data/ucieAdv64/glossary';
import { UCIE_WRITE_UPS, ucieDetail } from '@/data/ucieAdv64Details';
import { deliverableStep, producersOf } from '@/lib/deliverableStatus';
import { parseRich, type RichNode } from '@/lib/activityRefs';

/**
 * The UCIe Advanced 64G Die-to-Die PHY IP template: an IP program from
 * concept to general availability, staged by lifecycle, with the adapter,
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
