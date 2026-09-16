import { describe, expect, it } from 'vitest';
import { activityGlossary, detailDeliverables } from '@/data/activityIndex';
import { ALL_ACTIVITY_TITLES, ALL_DELIVERABLE_TITLES, ALL_GLOSSARY, hasWriteUp } from '@/data/builtins';
import {
  THREE_DIC_ACTIVITIES,
  THREE_DIC_DELIVERABLES,
  THREE_DIC_GLOSSARY,
  THREE_DIC_STAGES,
} from '@/data/threeDic';
import { THREE_DIC_WRITE_UPS, threeDicDetail } from '@/data/threeDicDetails';
import { parseRich, type RichNode } from '@/lib/activityRefs';
import { deliverableRefs } from '@/lib/deliverableRefs';
import { deliverableStep, producersOf } from '@/lib/deliverableStatus';

/**
 * What a 3DIC activity shows, held to what every SoC activity shows.
 *
 * The first cut of the template gave the stack stages steps and nothing else:
 * one output for a whole activity, no deliverable relations — so no reference
 * tags on the deliverables and an empty Delivers column — and no write-ups, so
 * every activity link was a 404. The SoC corpus has none of those gaps, and the
 * tests beside it say so; these say the same of the stack.
 */

const refsOf = (stageKey: string) =>
  Object.keys(THREE_DIC_ACTIVITIES).filter((ref) => THREE_DIC_ACTIVITIES[ref].st === stageKey);
const prefix = (ref: string) => ref.split('-')[0];

describe('every stack step hands something over', () => {
  it('gives each step exactly one output, in step order', () => {
    for (const [ref, a] of Object.entries(THREE_DIC_ACTIVITIES)) {
      expect(a.o, ref).toHaveLength(a.s.length);
      expect(a.ob, ref).toEqual(a.s.map((s) => s[0]));
      for (const out of a.o) {
        expect(out.trim(), ref).toBe(out);
        expect(out.length, `${ref}: "${out}"`).toBeGreaterThan(8);
      }
    }
  });
});

describe('the stack deliverables carry reference tags', () => {
  it('numbers them as the rows are numbered, clashing with no SoC tag', () => {
    for (const s of THREE_DIC_STAGES) {
      s.deliverables.forEach((title, i) => {
        expect(THREE_DIC_DELIVERABLES[`${s.shortTitle}-D${i + 1}`]).toBe(title);
      });
    }
    for (const ref of Object.keys(THREE_DIC_DELIVERABLES)) {
      expect(detailDeliverables[ref], `${ref} is already an SoC deliverable`).toBeUndefined();
      expect(ALL_DELIVERABLE_TITLES[ref]).toBe(THREE_DIC_DELIVERABLES[ref]);
    }
  });

  it('tags every seeded stack deliverable row', () => {
    const prefixOf: Record<string, string> = {};
    for (const [ref, a] of Object.entries(THREE_DIC_ACTIVITIES)) prefixOf[prefix(ref)] = a.st;
    const rows = THREE_DIC_STAGES.flatMap((s) =>
      s.deliverables.map((title, i) => ({ id: `${s.id}:${i}`, title, stageId: s.id })),
    );
    const refOf = deliverableRefs(rows, ALL_DELIVERABLE_TITLES, prefixOf);
    for (const s of THREE_DIC_STAGES) {
      s.deliverables.forEach((title, i) => {
        expect(refOf.get(`${s.id}:${i}`), `${s.id} "${title}"`).toBe(`${s.shortTitle}-D${i + 1}`);
      });
    }
  });

  it('relates every activity to a deliverable of its own stage', () => {
    for (const [ref, a] of Object.entries(THREE_DIC_ACTIVITIES)) {
      expect(a.r.length, `${ref} relates to no deliverable`).toBeGreaterThan(0);
      for (const [dref] of a.r) {
        expect(THREE_DIC_DELIVERABLES[dref], `${ref} → ${dref}`).toBeTruthy();
        expect(prefix(dref), `${ref} → ${dref}`).toBe(prefix(ref));
      }
      expect(new Set(a.r.map(([d]) => d)).size, ref).toBe(a.r.length);
    }
  });

  /* The same rule journeyAlignment holds the SoC stages to: the activity a
     deliverable names as its source claims to produce it, and is the last of
     those that do. */
  it('names as each deliverable’s source the last activity that produces it', () => {
    for (const s of THREE_DIC_STAGES) {
      const refs = refsOf(s.id);
      s.deliverables.forEach((_, i) => {
        const dref = `${s.shortTitle}-D${i + 1}`;
        const producers = refs.filter((r) =>
          THREE_DIC_ACTIVITIES[r].r.some(([d, rel]) => d === dref && rel === 'produces'),
        );
        expect(producers.length, `${dref} has no producer`).toBeGreaterThan(0);
        const last = [...producers].sort(
          (a, b) => THREE_DIC_ACTIVITIES[b].w[1] - THREE_DIC_ACTIVITIES[a].w[1],
        )[0];
        expect(refs[s.deliverableFrom[i]], dref).toBe(last);
      });
    }
  });

  it('hands each over at the release step of the activity that produces it, not one that feeds it', () => {
    const producers = producersOf(THREE_DIC_ACTIVITIES);
    for (const s of THREE_DIC_STAGES) {
      const refs = refsOf(s.id);
      s.deliverables.forEach((_, i) => {
        const dref = `${s.shortTitle}-D${i + 1}`;
        const step = deliverableStep(dref, producers);
        const from = refs[s.deliverableFrom[i]];
        /* DCTV-07 produces two, and each is released by the same activity */
        expect(step?.act, dref).toBe(from);
      });
    }
  });
});

describe('the stack terms', () => {
  it('adds to the glossary without redefining an SoC term', () => {
    for (const key of Object.keys(THREE_DIC_GLOSSARY)) {
      expect(activityGlossary[key], `${key} is already defined`).toBeUndefined();
      expect(ALL_GLOSSARY[key]).toBe(THREE_DIC_GLOSSARY[key]);
    }
  });
});

/* ---------- write-ups ---------- */

const refsIn = (nodes: RichNode[]): string[] =>
  nodes.flatMap((n) => (n.kind === 'ref' ? [n.id] : n.kind === 'tag' ? refsIn(n.children) : []));

describe('every stack activity is written up', () => {
  it('has a write-up for each activity, and none for an activity that does not exist', () => {
    for (const ref of Object.keys(THREE_DIC_ACTIVITIES)) {
      expect(threeDicDetail(ref), `${ref} has no write-up`).toBeTruthy();
      expect(hasWriteUp(ref), ref).toBe(true);
    }
    for (const ref of Object.keys(THREE_DIC_WRITE_UPS)) {
      expect(THREE_DIC_ACTIVITIES[ref], `${ref} is written up but not an activity`).toBeTruthy();
    }
  });

  it('takes where it runs, its steps and its outputs from the activity itself', () => {
    for (const [ref, a] of Object.entries(THREE_DIC_ACTIVITIES)) {
      const d = threeDicDetail(ref)!;
      expect(d.stage, ref).toBe(a.st);
      expect(d.window, ref).toEqual(a.w);
      expect(d.steps.map((s) => [s.n, s.text, s.tat, s.lane]), ref).toEqual(
        a.s.map(([n, text, tat, par]) => [n, text, tat, par ? 'par' : 'main']),
      );
      expect(d.produces, ref).toEqual(a.o);
      expect(d.producedBy, ref).toEqual(a.ob);
      expect(d.rel.map((r) => [r.id, r.rel]), ref).toEqual(a.r);
    }
  });

  it('is shaped like an SoC write-up', () => {
    for (const [ref, a] of Object.entries(THREE_DIC_ACTIVITIES)) {
      const w = THREE_DIC_WRITE_UPS[ref];
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
      /* the first role owns the activity, and it is the role the steps fall back to */
      expect(w.roles[0].r, ref).toBe(a.ro);
      expect(new Set(w.roles.map((r) => r.r)).size, `${ref} repeats a role`).toBe(5);
      /* a risk's bold opening is its headline */
      for (const risk of w.risks) expect(risk, ref).toMatch(/^<b>[^<]+<\/b> \S/);
      /* one sentence per relation the activity names, and no others */
      expect(Object.keys(w.rel).sort(), `${ref} rel`).toEqual(a.r.map(([d]) => d).sort());
      for (const [dref, text] of Object.entries(w.rel)) {
        expect(text, `${ref} → ${dref}`).toMatch(/^<b>[^<]+<\/b> \S/);
      }
      expect(new Set(w.terms).size, `${ref} repeats a term`).toBe(w.terms.length);
      for (const t of w.terms) expect(ALL_GLOSSARY[t], `${ref} term ${t}`).toBeTruthy();
    }
  });

  it('divides the man-months the stage gives the activity', () => {
    for (const s of THREE_DIC_STAGES) {
      refsOf(s.id).forEach((ref, i) => {
        const w = THREE_DIC_WRITE_UPS[ref];
        for (const [label, mm] of w.effort) {
          expect(label.trim().length, ref).toBeGreaterThan(3);
          expect(mm, `${ref} ${label}`).toBeGreaterThan(0);
        }
        const sum = w.effort.reduce((t, [, mm]) => t + mm, 0);
        expect(sum, `${ref} effort adds to ${sum}, the stage says ${s.engineeringEffort[i]}`).toBeCloseTo(
          s.engineeringEffort[i],
          5,
        );
      });
    }
  });

  it('connects only to activities that exist, and never to itself', () => {
    for (const ref of Object.keys(THREE_DIC_ACTIVITIES)) {
      const w = THREE_DIC_WRITE_UPS[ref];
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
        expect(ALL_ACTIVITY_TITLES[x], `${ref} connects to ${x}`).toBeTruthy();
        expect(x, ref).not.toBe(ref);
      }
      expect(links.dependsOn.length + links.feedsInto.length, `${ref} is connected to nothing`).toBeGreaterThan(0);
      for (const x of w.dependsOn) {
        expect([...links.dependsOn, ...links.runsWith, ...links.revisedBy], `${ref} dependsOn ${x}`).toContain(x);
      }
      for (const x of w.feedsInto) {
        expect([...links.feedsInto, ...links.feedsBackInto], `${ref} feedsInto ${x}`).toContain(x);
      }
    }
  });

  it('writes prose the page can print: known markup, known IDs, no stray whitespace', () => {
    for (const ref of Object.keys(THREE_DIC_ACTIVITIES)) {
      const w = THREE_DIC_WRITE_UPS[ref];
      const strings = [
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
      for (const s of strings) {
        expect(s.trim(), `${ref}: ${JSON.stringify(s)}`).toBe(s);
        expect(/\s{2,}|\n/.test(s), `${ref}: ${JSON.stringify(s)}`).toBe(false);
        for (const tag of s.match(/<\/?([a-z]+)[^>]*>/g) ?? []) {
          expect(tag, `${ref}: ${s}`).toMatch(/^<\/?(b|code)>$/);
        }
        for (const id of refsIn(parseRich(s))) {
          expect(ALL_ACTIVITY_TITLES[id], `${ref} names ${id}`).toBeTruthy();
        }
      }
    }
  });
});
