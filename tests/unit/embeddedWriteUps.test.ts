import { describe, expect, it } from 'vitest';
import { activityDetail } from '@/data/activityDetails';
import { ALL_ACTIVITIES, ALL_DELIVERABLE_TITLES, ALL_GLOSSARY, hasWriteUp } from '@/data/builtins';
import { EMBEDDED_ACTIVITIES, EMBEDDED_PROFILE, EMBEDDED_STAGES } from '@/data/embeddedSoc';
import { EMBEDDED_WRITE_UPS, embeddedDetail } from '@/data/embeddedSocDetails';
import { EMBEDDED_DERIVED_ACTIVITIES, EMBEDDED_DERIVED_STAGES, socRefOf } from '@/data/embeddedSocDerived';
import { EMBEDDED_WRITE_UP_EDITS } from '@/data/embeddedWriteUpEdits';
import { WRITE_UP_REF_MAP } from '@/data/embeddedWriteUpRefs';
import { activitySteps } from '@/data/activitySteps';
import { parseRich, type RichNode } from '@/lib/activityRefs';
import type { ActivityDetail } from '@/data/activityDetailTypes';

/**
 * Every Embedded SoC activity is written up, and what its page says is about
 * an embedded part.
 *
 * The authored ones are held to what the 3DIC ones are. The derived ones start
 * from an SoC write-up about a leading-node AI accelerator on a 2.5D package,
 * so they are held to naming none of that, and to linking only to work the
 * embedded programme runs — a write-up that sends its reader to the interposer
 * design or the PCIe bring-up is a page about some other chip.
 */

const runs = new Set(EMBEDDED_PROFILE.stages.map((s) => s.key));
const PROGRAM = new Set(Object.entries(ALL_ACTIVITIES).filter(([, a]) => runs.has(a.st)).map(([r]) => r));
const DELIVERABLES = new Set(
  [...EMBEDDED_STAGES, ...EMBEDDED_DERIVED_STAGES].flatMap((s) => s.deliverables.map((_, i) => `${s.shortTitle}-D${i + 1}`)),
);
const ALL_OWN = { ...EMBEDDED_DERIVED_ACTIVITIES, ...EMBEDDED_ACTIVITIES };
const stageOf = (st: string) => [...EMBEDDED_STAGES, ...EMBEDDED_DERIVED_STAGES].find((s) => s.id === st)!;
const refsOfStage = (st: string) => Object.keys(ALL_OWN).filter((r) => ALL_OWN[r].st === st);

/* The same vocabulary embeddedSoc.test keeps out of the stage tables, plus
   what only the prose tends to say. HBM the ESD model is allowed. */
const LEADING =
  /\b(HBM(?! ESD|, CDM| \(ESD)|PCIe|CXL|SerDes|D2D|die-to-die|chiplet|DRAM|DDR|UCIe|interposer|bumps?|EUV|LLM|tokens?|TTFT|FP8|NoC|VRMs?|DVFS|cooling|airflow|thermal solution|high-speed|CoWoS|2\.5D|reticle|MLPerf|HPC|datacenter|data center|(?:AI|ML|inference|neural(?:-network)?) accelerators?|recommendation (?:models?|systems?|workloads?|engines?))\b/i;

const refsIn = (nodes: RichNode[]): string[] =>
  nodes.flatMap((n) => (n.kind === 'ref' ? [n.id] : n.kind === 'tag' ? refsIn(n.children) : []));

const proseOf = (d: ActivityDetail): string[] => [
  ...d.purpose,
  d.flowNote,
  ...d.consumes,
  ...d.rel.map((r) => r.text),
  ...d.risks,
  ...d.roles.flatMap((r) => [r.r, r.d]),
  ...d.effort.map(([l]) => l),
  ...d.entry,
  ...d.exit,
  ...d.measuredBy,
  ...(d.dependsNote ? [d.dependsNote] : []),
];

describe('every Embedded SoC activity has a write-up', () => {
  it('is listed as written, and composes', () => {
    for (const ref of Object.keys(ALL_OWN)) {
      expect(hasWriteUp(ref), ref).toBe(true);
      expect(embeddedDetail(ref), `${ref} has no write-up`).toBeTruthy();
    }
    for (const ref of Object.keys(EMBEDDED_WRITE_UPS)) {
      expect(EMBEDDED_ACTIVITIES[ref], `${ref} is written up but not an activity`).toBeTruthy();
    }
  });
});

for (const [ref, a] of Object.entries(ALL_OWN)) {
  describe(`${ref} write-up`, () => {
    const d = embeddedDetail(ref);

    it('takes where it runs, its steps and its outputs from the activity', () => {
      expect(d).toBeTruthy();
      expect(d!.stage).toBe(a.st);
      expect(d!.window).toEqual(a.w);
      expect(d!.steps.map((s) => s.text)).toEqual(a.s.map((s) => s[1]));
      expect(d!.produces).toEqual(a.o);
      expect(d!.rel.map((r) => [r.id, r.rel])).toEqual(a.r);
      for (const r of d!.rel) expect(r.text, `${ref} → ${r.id}`).toMatch(/^<b>[^<]+<\/b> \S|^\S/);
    });

    it('divides the man-months the stage gives it', () => {
      const i = refsOfStage(a.st).indexOf(ref);
      const sum = d!.effort.reduce((t, [, mm]) => t + mm, 0);
      expect(sum).toBeCloseTo(stageOf(a.st).engineeringEffort[i], 5);
      for (const [label, mm] of d!.effort) {
        expect(label.trim().length, ref).toBeGreaterThan(3);
        expect(mm, `${ref} ${label}`).toBeGreaterThan(0);
      }
    });

    it('says nothing about a product an embedded part is not', () => {
      for (const s of [...proseOf(d!), ...d!.steps.map((x) => x.text), ...d!.produces]) {
        expect(s, `${ref}: "${s}"`).not.toMatch(LEADING);
      }
    });

    it('links only to work the embedded programme runs, and never to itself', () => {
      const all = [
        ...d!.dependsOn,
        ...d!.feedsInto,
        ...Object.values(d!.links).flat(),
        ...proseOf(d!).flatMap((s) => refsIn(parseRich(s))),
      ];
      for (const x of all) expect(PROGRAM.has(x), `${ref} names ${x}, which the programme does not run`).toBe(true);
      for (const x of [...d!.dependsOn, ...d!.feedsInto, ...Object.values(d!.links).flat()]) expect(x).not.toBe(ref);
      for (const s of proseOf(d!)) {
        for (const m of s.match(/\b\d?[A-Z][A-Z0-9]{1,4}-D\d{1,2}\b/g) ?? []) {
          expect(DELIVERABLES.has(m), `${ref} names deliverable ${m}, which the programme does not have`).toBe(true);
        }
      }
    });

    it('writes prose the page can print', () => {
      for (const s of proseOf(d!)) {
        expect(s.trim(), `${ref}: ${JSON.stringify(s)}`).toBe(s);
        expect(/\s{2,}|\n/.test(s), `${ref}: ${JSON.stringify(s)}`).toBe(false);
        for (const tag of s.match(/<\/?([a-z]+)[^>]*>/g) ?? []) expect(tag, `${ref}: ${s}`).toMatch(/^<\/?(b|code)>$/);
      }
      expect(new Set(d!.terms).size, `${ref} repeats a term`).toBe(d!.terms.length);
      for (const t of d!.terms) expect(ALL_GLOSSARY[t], `${ref} term ${t}`).toBeTruthy();
    });
  });
}

/* The authored ones are shaped like every other written activity. */
describe('the authored write-ups', () => {
  for (const [ref, a] of Object.entries(EMBEDDED_ACTIVITIES)) {
    it(`${ref} is shaped like an SoC write-up`, () => {
      const w = EMBEDDED_WRITE_UPS[ref];
      expect(w, `${ref} is not written up`).toBeTruthy();
      expect(w.purpose, `${ref} purpose`).toHaveLength(2);
      expect(w.consumes, `${ref} consumes`).toHaveLength(5);
      expect(w.risks, `${ref} risks`).toHaveLength(5);
      expect(w.roles, `${ref} roles`).toHaveLength(5);
      expect(w.entry, `${ref} entry`).toHaveLength(3);
      expect(w.exit, `${ref} exit`).toHaveLength(3);
      expect(w.measuredBy, `${ref} measuredBy`).toHaveLength(3);
      expect(w.effort.length, `${ref} effort`).toBeGreaterThanOrEqual(3);
      expect(w.effort.length, `${ref} effort`).toBeLessThanOrEqual(7);
      expect(w.flowNote.length, `${ref} flowNote`).toBeGreaterThan(40);
      expect(w.roles[0].r, ref).toBe(a.ro);
      expect(new Set(w.roles.map((r) => r.r)).size, `${ref} repeats a role`).toBe(5);
      for (const risk of w.risks) expect(risk, ref).toMatch(/^<b>[^<]+<\/b> \S/);
      expect(Object.keys(w.rel).sort(), `${ref} rel`).toEqual(a.r.map(([d]) => d).sort());
      for (const [dref, text] of Object.entries(w.rel)) expect(text, `${ref} → ${dref}`).toMatch(/^<b>[^<]+<\/b> \S/);
      expect(w.links.dependsOn.length + w.links.feedsInto.length, `${ref} is connected to nothing`).toBeGreaterThan(0);
      for (const x of w.dependsOn) {
        expect([...w.links.dependsOn, ...w.links.runsWith, ...w.links.revisedBy], `${ref} dependsOn ${x}`).toContain(x);
      }
      for (const x of w.feedsInto) {
        expect([...w.links.feedsInto, ...w.links.feedsBackInto], `${ref} feedsInto ${x}`).toContain(x);
      }
    });
  }
});

/* Each edit names an SoC write-up the embedded programme derives from, and a
   field the SoC write-up has — an edit to nothing edits nothing, silently. */
describe('the derived write-up edits', () => {
  const derivedSoc = new Set(Object.keys(EMBEDDED_DERIVED_ACTIVITIES).map((r) => socRefOf(r)!));
  for (const [socRef, e] of Object.entries(EMBEDDED_WRITE_UP_EDITS)) {
    it(`${socRef} edits a write-up the programme derives`, () => {
      expect(derivedSoc.has(socRef), `${socRef} is not derived`).toBe(true);
      const soc = activityDetail(socRef)!;
      for (const dref of Object.keys(e.rel ?? {})) {
        expect(soc.rel.some((r) => r.id === dref), `${socRef} has no relation to ${dref}`).toBe(true);
      }
      if (e.effortLabels) expect(e.effortLabels, socRef).toHaveLength(soc.effort.length);
      if (e.roles) {
        expect(e.roles, socRef).toHaveLength(soc.roles.length);
        expect(e.roles[0].r, socRef).toBe(soc.roles[0].r);
      }
      for (const k of ['purpose', 'consumes', 'risks', 'entry', 'exit', 'measuredBy'] as const) {
        if (e[k]) expect(e[k]!.length, `${socRef} ${k}`).toBeGreaterThan(0);
      }
    });
  }

  it('maps only SoC activities the embedded programme does not run', () => {
    for (const [from, to] of Object.entries(WRITE_UP_REF_MAP)) {
      expect(activitySteps[from], from).toBeTruthy();
      expect(PROGRAM.has(from), `${from} is run, and needs no mapping`).toBe(false);
      if (to) expect(PROGRAM.has(to), `${from} → ${to}`).toBe(true);
    }
  });
});

/* the deliverable catalogue a relation sentence may name */
it('knows every deliverable the Embedded SoC programme has', () => {
  for (const d of DELIVERABLES) expect(ALL_DELIVERABLE_TITLES[d], d).toBeTruthy();
});
