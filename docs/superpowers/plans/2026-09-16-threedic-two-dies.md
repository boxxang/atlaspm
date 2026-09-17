# 3DIC Two Dies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The 3DIC template builds a bottom and a top die, bonds them in a stage of its own, and runs to a schedule in which nothing starts before what it consumes exists.

**Architecture:** The SoC stages are the bottom die. The top die's seven stages, activities, deliverables and write-ups are derived in code from the SoC ones: references remapped, effort at 90%. STK is authored beside the other stack stages. The 3DIC profile carries its own baselines for the stages that move.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Playwright. Pure data modules under `src/data`.

**Spec:** `docs/superpowers/specs/2026-09-16-threedic-two-dies-design.md`

## Global Constraints

- The SoC template, its content and its references do not change. `tests/unit/builtins.test.ts` asserts `ALL_ACTIVITIES[ref] === activitySteps[ref]` for every SoC ref.
- Generated modules (`journey.ts`, `activitySteps.ts`, `activityIndex.ts`, `activityDetails.ts`) are not edited.
- Write-up prose stays server-side: only `page.tsx` imports the detail modules.
- Top die effort share: `0.9`. Split prefixes: `SYN PD SO DFT TO FAB TEST` → `SYNT PDT SOT DFTT TOT FABT TESTT`.
- All user-facing text is English. No schema change.
- Verification before merge: `npm run test && npm run typecheck && npx playwright test && npm run lint`, with no `next dev` running.

---

### Task 1: Milestones from both templates reach the schedule

**Files:**
- Modify: `src/lib/schedule.ts` (import and the `milestoneDefs` filter near line 109)
- Test: `tests/unit/schedule.test.ts` (append a case)

**Interfaces:**
- Produces: `computeSchedule(...).milestones` includes any `ALL_MILESTONES` entry whose anchor stage the profile runs.

- [ ] **Step 1: Write the failing test**

```ts
import { THREE_DIC_PROFILE } from '@/data/threeDic';

describe('the 3DIC template’s checkpoints', () => {
  it('reach the schedule of a program that runs their stages', () => {
    const s = computeSchedule(new Date('2027-03-01T00:00:00'), THREE_DIC_PROFILE, {});
    const ids = s.milestones.map((m) => m.id);
    expect(ids).toContain('dctvAssemblySignoff');
    expect(ids).toContain('tapeoutBeolMto');
  });
});
```

- [ ] **Step 2: Run it.** `npx vitest run tests/unit/schedule.test.ts`. Expected: FAIL, because `dctvAssemblySignoff` is missing.

- [ ] **Step 3: Implement.** In `src/lib/schedule.ts`, replace `import { milestoneDefs } from '@/data/scheduleProfiles';` with `import { ALL_MILESTONES } from '@/data/builtins';`, and change `const milestones = milestoneDefs` to `const milestones = ALL_MILESTONES`.

- [ ] **Step 4: Run** `npm run test`. Expected: PASS.

- [ ] **Step 5: Commit** with the message "The 3DIC checkpoints reach the schedule".

### Task 2: The top die, derived

**Files:**
- Create: `src/data/threeDicTopDie.ts`
- Create: `src/data/threeDicTopDieDetails.ts` (server-only)
- Test: `tests/unit/threeDicTopDie.test.ts`

**Interfaces:**
- Produces, from `threeDicTopDie.ts`:
  - `TOP_DIE_SHARE = 0.9`
  - `TOP_DIE_SPLIT: readonly { base; key; from; to }[]`
  - `toTopRef(text: string): string`
  - `baseRefOf(topRef: string): string`
  - `TOP_DIE_STAGES: readonly JourneyStage[]`
  - `TOP_DIE_ACTIVITIES: Record<string, ActivityStepEntry>`
  - `TOP_DIE_ACTIVITY_TITLES: Record<string, string>`
  - `TOP_DIE_DELIVERABLES: Record<string, string>`
- Produces, from `threeDicTopDieDetails.ts`: `topDieDetail(id: string): ActivityDetail | undefined`

- [ ] **Step 1: Write the failing tests** (`tests/unit/threeDicTopDie.test.ts`):

```ts
import { describe, expect, it } from 'vitest';
import { activitySteps } from '@/data/activitySteps';
import { detailActivityTitles, detailDeliverables } from '@/data/activityIndex';
import { activityDetail } from '@/data/activityDetails';
import { journeyData } from '@/data/journey';
import {
  TOP_DIE_ACTIVITIES, TOP_DIE_ACTIVITY_TITLES, TOP_DIE_DELIVERABLES, TOP_DIE_SHARE,
  TOP_DIE_SPLIT, TOP_DIE_STAGES, baseRefOf, toTopRef,
} from '@/data/threeDicTopDie';
import { topDieDetail } from '@/data/threeDicTopDieDetails';
import { deliverableRefs } from '@/lib/deliverableRefs';

describe('references move to the top die only for the split stages', () => {
  it('remaps activity and deliverable IDs of the seven split prefixes', () => {
    expect(toTopRef('netlist from SYN-12 and PD-D3, into TO-05')).toBe('netlist from SYNT-12 and PDT-D3, into TOT-05');
    expect(toTopRef('RTL-05, PDK-02, SIPI-05, ISO-26262, TESTS-1')).toBe('RTL-05, PDK-02, SIPI-05, ISO-26262, TESTS-1');
    expect(baseRefOf('TESTT-06')).toBe('TEST-06');
    expect(baseRefOf('PDT-16')).toBe('PD-16');
  });
});

describe('the top die mirrors the bottom one', () => {
  it('has a stage per split stage, effort at the share, deliverables it can be told apart by', () => {
    expect(TOP_DIE_STAGES.map((s) => s.id)).toEqual(TOP_DIE_SPLIT.map((s) => s.key));
    for (const split of TOP_DIE_SPLIT) {
      const base = journeyData.find((s) => s.id === split.base)!;
      const top = TOP_DIE_STAGES.find((s) => s.id === split.key)!;
      expect(top.shortTitle).toBe(split.to);
      expect(top.title).toBe(`${base.title} — Top Die`);
      top.engineeringEffort.forEach((mm, i) => expect(mm).toBeCloseTo(base.engineeringEffort[i] * TOP_DIE_SHARE, 9));
      expect(top.deliverables).toHaveLength(base.deliverables.length);
      for (const d of top.deliverables) expect(Object.values(detailDeliverables)).not.toContain(d);
    }
  });

  it('runs every activity of the base stage, same steps and outputs, remapped relations', () => {
    for (const split of TOP_DIE_SPLIT) {
      const baseRefs = Object.keys(activitySteps).filter((r) => activitySteps[r].st === split.base);
      const topRefs = Object.keys(TOP_DIE_ACTIVITIES).filter((r) => TOP_DIE_ACTIVITIES[r].st === split.key);
      expect(topRefs).toEqual(baseRefs.map(toTopRef));
      for (const ref of topRefs) {
        const a = TOP_DIE_ACTIVITIES[ref];
        const b = activitySteps[baseRefOf(ref)];
        expect(a.s).toBe(b.s);
        expect(a.o).toBe(b.o);
        expect(a.w).toEqual(b.w);
        expect(a.ro).toBe(b.ro);
        expect(a.r).toEqual(b.r.map(([d, rel]) => [toTopRef(d), rel]));
        for (const [d] of a.r) expect(TOP_DIE_DELIVERABLES[d], `${ref} → ${d}`).toBeTruthy();
        expect(TOP_DIE_ACTIVITY_TITLES[ref]).toBe(`${detailActivityTitles[baseRefOf(ref)]} (Top Die)`);
        expect(activitySteps[ref], `${ref} collides with an SoC ref`).toBeUndefined();
      }
      const top = TOP_DIE_STAGES.find((s) => s.id === split.key)!;
      expect(top.engineeringView).toEqual(topRefs.map((r) => TOP_DIE_ACTIVITY_TITLES[r]));
    }
  });

  it('tags both dies’ deliverable rows, each with its own die’s reference', () => {
    const prefixOf: Record<string, string> = {};
    for (const [ref, a] of Object.entries({ ...activitySteps, ...TOP_DIE_ACTIVITIES })) prefixOf[ref.split('-')[0]] = a.st;
    const stages = [...journeyData, ...TOP_DIE_STAGES];
    const rows = stages.flatMap((s) => s.deliverables.map((title, i) => ({ id: `${s.id}:${i}`, title, stageId: s.id })));
    const refOf = deliverableRefs(rows, { ...detailDeliverables, ...TOP_DIE_DELIVERABLES }, prefixOf);
    for (const s of TOP_DIE_STAGES) {
      s.deliverables.forEach((_, i) => expect(refOf.get(`${s.id}:${i}`)).toBe(`${s.shortTitle}-D${i + 1}`));
    }
  });
});

describe('a top-die write-up is its base write-up, pointed at the top die', () => {
  it('remaps stage, relations, connections and prose, and scales the effort', () => {
    for (const ref of Object.keys(TOP_DIE_ACTIVITIES)) {
      const d = topDieDetail(ref)!;
      const b = activityDetail(baseRefOf(ref))!;
      expect(d, ref).toBeTruthy();
      expect(d.stage).toBe(TOP_DIE_ACTIVITIES[ref].st);
      expect(d.steps).toBe(b.steps);
      expect(d.rel.map((r) => r.id)).toEqual(b.rel.map((r) => toTopRef(r.id)));
      expect(d.links.dependsOn).toEqual(b.links.dependsOn.map(toTopRef));
      expect(d.purpose).toEqual(b.purpose.map(toTopRef));
      d.effort.forEach(([, mm], i) => expect(mm).toBeCloseTo(b.effort[i][1] * TOP_DIE_SHARE, 9));
    }
    expect(topDieDetail('PD-06')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run** `npx vitest run tests/unit/threeDicTopDie.test.ts`. Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/data/threeDicTopDie.ts`**

```ts
/**
 * /data/threeDicTopDie.ts — the top die of a 3DIC program, derived.
 *
 * A stack is two chips. The SoC stages that are done once per chip —
 * synthesis, physical design, signoff, DFT, tapeout, fabrication and test
 * development — are the bottom die, unchanged, and this module derives the top
 * die's counterparts from them: the same activities and steps, the references
 * moved onto the top die's prefixes, and the effort at the share a smaller top
 * die takes. Derived rather than authored so the two dies cannot drift apart
 * by accident, and so the generated SoC modules stay untouched.
 */
import { activitySteps, type ActivityStepEntry } from './activitySteps';
import { detailActivityTitles } from './activityIndex';
import { journeyData } from './journey';
import type { JourneyStage } from './types';

/** The top die's effort against the bottom die's. */
export const TOP_DIE_SHARE = 0.9;

export const TOP_DIE_SPLIT = [
  { base: 'synthesis', key: 'synthesisTop', from: 'SYN', to: 'SYNT' },
  { base: 'physicalDesign', key: 'physicalDesignTop', from: 'PD', to: 'PDT' },
  { base: 'signoff', key: 'signoffTop', from: 'SO', to: 'SOT' },
  { base: 'dft', key: 'dftTop', from: 'DFT', to: 'DFTT' },
  { base: 'tapeout', key: 'tapeoutTop', from: 'TO', to: 'TOT' },
  { base: 'fabrication', key: 'fabricationTop', from: 'FAB', to: 'FABT' },
  { base: 'testDevelopment', key: 'testDevelopmentTop', from: 'TEST', to: 'TESTT' },
] as const;

const UP: Record<string, string> = Object.fromEntries(TOP_DIE_SPLIT.map((s) => [s.from, s.to]));
const DOWN: Record<string, string> = Object.fromEntries(TOP_DIE_SPLIT.map((s) => [s.to, s.from]));

/* An activity (PD-06) or a deliverable (PD-D3) of a split stage, and nothing
   that merely starts with the same letters: PDK-02 and ISO-26262 are left. */
const SPLIT_REF = /\b(SYN|PD|SO|DFT|TO|FAB|TEST)-(D?\d{1,2})\b/g;

/** Every reference to a split stage, moved onto the top die. */
export const toTopRef = (text: string): string =>
  text.replace(SPLIT_REF, (_, prefix: string, n: string) => `${UP[prefix]}-${n}`);

/** The SoC activity a top-die one is derived from: PDT-06 → PD-06. */
export const baseRefOf = (topRef: string): string =>
  topRef.replace(/^([A-Z]+)-/, (m, prefix: string) => (DOWN[prefix] ? `${DOWN[prefix]}-` : m));

const topTitle = (title: string) => `${title} (Top Die)`;

export const TOP_DIE_ACTIVITIES: Record<string, ActivityStepEntry> = Object.fromEntries(
  TOP_DIE_SPLIT.flatMap(({ base, key }) =>
    Object.entries(activitySteps)
      .filter(([, a]) => a.st === base)
      .map(([ref, a]): [string, ActivityStepEntry] => [
        toTopRef(ref),
        { ...a, st: key, r: a.r.map(([d, rel]) => [toTopRef(d), rel]) },
      ]),
  ),
);

export const TOP_DIE_ACTIVITY_TITLES: Record<string, string> = Object.fromEntries(
  Object.keys(TOP_DIE_ACTIVITIES).map((ref) => [ref, topTitle(detailActivityTitles[baseRefOf(ref)])]),
);

export const TOP_DIE_STAGES: readonly JourneyStage[] = TOP_DIE_SPLIT.map(({ base, key, to }) => {
  const s = journeyData.find((j) => j.id === base)!;
  return {
    ...s,
    id: key,
    shortTitle: to,
    title: `${s.title} — Top Die`,
    description: `For the top die: ${s.description}`,
    /* A title the bottom die's row does not share, or the tag matcher cannot
       tell PD-D3 from PDT-D3. */
    deliverables: s.deliverables.map((d) => `${d} — top die`),
    engineeringView: s.engineeringView.map(topTitle),
    engineeringEffort: s.engineeringEffort.map((mm) => mm * TOP_DIE_SHARE),
  };
});

export const TOP_DIE_DELIVERABLES: Record<string, string> = Object.fromEntries(
  TOP_DIE_STAGES.flatMap((s) => s.deliverables.map((title, i) => [`${s.shortTitle}-D${i + 1}`, title])),
);
```

- [ ] **Step 4: Implement `src/data/threeDicTopDieDetails.ts`**

```ts
/**
 * /data/threeDicTopDieDetails.ts — the top die's write-ups.
 *
 * Server-only, like the write-ups it derives from: each is the SoC write-up of
 * the activity it mirrors, with every reference to a split stage moved onto
 * the top die — its relations, its connections and the IDs in its prose — and
 * its effort at the top die's share.
 */
import type { ActivityDetail } from './activityDetailTypes';
import { activityDetail } from './activityDetails';
import { TOP_DIE_ACTIVITIES, TOP_DIE_SHARE, baseRefOf, toTopRef } from './threeDicTopDie';

const all = (xs: readonly string[]) => xs.map(toTopRef);

export const topDieDetail = (id: string): ActivityDetail | undefined => {
  const top = TOP_DIE_ACTIVITIES[id];
  const base = top ? activityDetail(baseRefOf(id)) : undefined;
  if (!top || !base) return undefined;
  return {
    ...base,
    stage: top.st,
    purpose: all(base.purpose),
    flowNote: toTopRef(base.flowNote),
    consumes: all(base.consumes),
    rel: base.rel.map((r) => ({ ...r, id: toTopRef(r.id), text: toTopRef(r.text) })),
    risks: all(base.risks),
    effort: base.effort.map(([label, mm]) => [label, mm * TOP_DIE_SHARE]),
    entry: all(base.entry),
    exit: all(base.exit),
    dependsOn: all(base.dependsOn),
    dependsNote: base.dependsNote && toTopRef(base.dependsNote),
    feedsInto: all(base.feedsInto),
    measuredBy: all(base.measuredBy),
    links: {
      dependsOn: all(base.links.dependsOn),
      feedsInto: all(base.links.feedsInto),
      runsWith: all(base.links.runsWith),
      revisedBy: all(base.links.revisedBy),
      feedsBackInto: all(base.links.feedsBackInto),
    },
  };
};
```

- [ ] **Step 5: Run** `npx vitest run tests/unit/threeDicTopDie.test.ts`. Expected: PASS.
- [ ] **Step 6: Commit** with the message "Derive the top die of a 3DIC program from the SoC stages".

### Task 3: STK — Product Stack Bonding

**Files:**
- Modify: `src/data/threeDic.ts` (stage keys, phase, baseline, activities, titles, stage content, milestone)
- Create: `src/data/threeDicWriteUps/stk.ts`
- Modify: `src/data/threeDicDetails.ts` (spread `STK_WRITE_UPS`)
- Test: the existing `tests/unit/threeDicContent.test.ts` covers STK once it is in `THREE_DIC_ACTIVITIES`

**Interfaces:**
- Produces: stage key `stackBonding`, prefix `STK`, refs `STK-01`..`STK-04`, deliverables `STK-D1`..`STK-D4`, milestone `stackBonded`.

- [ ] **Step 1: Add the stage to `THREE_DIC_STAGE_KEYS`** (after `kgdSort`), `PHASE_OF_3DIC.stackBonding = 'manufacture'`, and `THREE_DIC_BASELINES.stackBonding = { startOffsetWeeks: 116, durationWeeks: 8 }`.

- [ ] **Step 2: Add the activities** before `multiDieTest`'s block in `THREE_DIC_ACTIVITIES`:

```ts
  /* --- product stack bonding --- */
  'STK-01': act(
    'stackBonding',
    [0, 3],
    'Stack integration engineer',
    [
      [1, 'Confirm the bond recipe against the frozen process window', 0.5],
      [2, 'Plan the die pairing and bond sequence from the binning plan', 0.5, 1],
      [3, 'Prepare and plasma-activate the bonding surfaces of both dies', 0.5],
      [4, 'Bond the known-good dies and run the bond anneal', 1.5],
    ],
    ['Bond recipe checked against the process window', 'Die pairing and bond sequence', 'Activated bonding surfaces on both dies', 'Bonded stack lots'],
    [['STK-D1', 'produces'], ['STK-D4', 'feeds']],
  ),
  'STK-02': act(
    'stackBonding',
    [2, 4],
    'Stack quality engineer',
    [
      [1, 'Scan the bonded stacks by CSAM for voids and delamination', 0.75],
      [2, 'Measure bond overlay and alignment by IR metrology', 0.5, 1],
      [3, 'X-ray the stacks for bond and TSV defects', 0.5],
      [4, 'Disposition the stacks against the inspection limits', 0.75],
    ],
    ['CSAM void and delamination map', 'Bond overlay measurements', 'X-ray defect results', 'Post-bond inspection disposition'],
    [['STK-D2', 'produces']],
  ),
  'STK-03': act(
    'stackBonding',
    [3, 7],
    'Backside process engineer',
    [
      [1, 'Thin the bottom die substrate to the TSV reveal target', 1],
      [2, 'Reveal the TSVs and passivate the backside', 1],
      [3, 'Form the backside RDL and the package bumps', 1.5],
      [4, 'Measure TSV resistance and bump coplanarity', 0.5],
    ],
    ['Thinned bottom die at the reveal target', 'Revealed and passivated TSVs', 'Backside RDL and package bumps', 'TSV resistance and bump coplanarity data'],
    [['STK-D3', 'produces'], ['STK-D4', 'feeds']],
  ),
  'STK-04': act(
    'stackBonding',
    [6, 8],
    'Operations planner',
    [
      [1, 'Dice the bonded wafers into stacks', 0.5],
      [2, 'Link each stack to its top and bottom die records', 0.5, 1],
      [3, 'Sort the stacks for assembly on the post-bond results', 0.5],
      [4, 'Release the known-good stacks to package assembly', 1],
    ],
    ['Singulated stacks', 'Stack-to-die traceability records', 'Stack sort for assembly', 'Released stacks for package assembly'],
    [['STK-D4', 'produces']],
  ),
```

- [ ] **Step 3: Add the titles**
  - `STK-01`: `'Product Hybrid Bonding Run on Known-Good Dies'`
  - `STK-02`: `'Post-Bond Inspection and Overlay Verification'`
  - `STK-03`: `'Backside Thinning, TSV Reveal and Backside RDL'`
  - `STK-04`: `'Stack Singulation, Traceability and Release to Assembly'`

- [ ] **Step 4: Add the stage content** to `THREE_DIC_STAGES`, after `kgdSort`:

```ts
  {
    id: 'stackBonding',
    stage: 31,
    title: 'Product Stack Bonding',
    shortTitle: 'STK',
    tagline: 'Join the dies that sorted good, and prove the joint before it is packaged.',
    description:
      'Bond the product: known-good top and bottom dies joined in the process window the vehicle froze, inspected for voids and overlay, thinned to reveal the bottom die’s TSVs, given their backside redistribution and bumps, and released to package assembly as stacks that can be traced back to both dies.',
    activities: ['Bonding run', 'Post-bond inspection', 'Backside and TSV reveal', 'Release to assembly'],
    deliverables: [
      'Bonded product stack lots',
      'Post-bond inspection report',
      'Backside-processed stack wafers',
      'Stack release record for package assembly',
    ],
    deliverableFrom: [0, 1, 2, 3],
    deliverableWeek: [3, 4, 7, 8],
    engineeringView: [
      'Product Hybrid Bonding Run on Known-Good Dies',
      'Post-Bond Inspection and Overlay Verification',
      'Backside Thinning, TSV Reveal and Backside RDL',
      'Stack Singulation, Traceability and Release to Assembly',
    ],
    engineeringTat: [3, 2, 4, 2],
    engineeringEffort: [6, 3, 6, 3],
    engineeringStart: [0, 2, 3, 6],
    risks: ['Bond yield below the vehicle’s', 'TSV reveal damage found after RDL'],
    potentialRisks: [
      'Bonding run started before both dies’ KGD data is in',
      'Surface contamination between activation and bond',
      'Voids found by CSAM with no rule for what to scrap',
      'Traceability from stack to die lost at dicing',
    ],
    leader: leaderOf('Ji-won Seo', 'J. Seo', '0519', 'jiwon.seo@example.com'),
    collaboration: ['Foundry', 'OSAT', 'Product engineering', 'Quality'],
    tools: ['Hybrid bonders', 'CSAM, X-ray and IR metrology', 'Backside grind and CMP'],
    programView: ['Stack bonding yield', 'Stacks released to assembly', 'Post-bond inspection escapes'],
    perspective: 'A short engineering or program-management insight will appear here.',
  },
```

- [ ] **Step 5: Add the milestone** to `THREE_DIC_MILESTONES`: `{ id: 'stackBonded', label: 'Stack Bonded', anchor: { stage: 'stackBonding', at: 'end' }, major: true }`.

- [ ] **Step 6: Author `src/data/threeDicWriteUps/stk.ts`** (`export const STK_WRITE_UPS: Record<string, ActivityWriteUp>`) for STK-01..04, in the SoC shape the content test enforces:
  - 2 purpose paragraphs, a flow note, 5 inputs and 5 risks.
  - 5 roles, with `roles[0].r` equal to the activity's `ro`.
  - Effort summing to `[6, 3, 6, 3]`.
  - 3 entry criteria, 3 exit criteria and 3 measures.
  - Connections that exist, and terms from `ALL_GLOSSARY`.
  - A `rel` sentence for each relation in the activity's `r`.

  Spread it in `threeDicDetails.ts`.

- [ ] **Step 7: Run** `npx vitest run tests/unit/threeDicContent.test.ts`. Expected: PASS.
- [ ] **Step 8: Commit** with the message "A 3DIC program bonds its product in a stage of its own".

### Task 4: The 3DIC profile runs both dies on a schedule that holds

**Files:**
- Modify: `src/data/threeDic.ts` (baselines, 3DI-06 window and 3DI arrays, top-die milestones, profile composition)
- Modify: `src/data/builtins.ts` (fold in `TOP_DIE_*`)
- Modify: `src/app/p/[projectId]/activity/[activityId]/page.tsx` (add `topDieDetail`)
- Test: `tests/unit/threeDic.test.ts`, `tests/unit/builtins.test.ts`

**Interfaces:**
- Consumes: `TOP_DIE_*` (Task 2), `stackBonding` (Task 3).
- Produces: `THREE_DIC_PROFILE` with 38 stages over 159 weeks; `ALL_ACTIVITIES`, `ALL_ACTIVITY_TITLES`, `ALL_STAGE_CONTENT`, `ALL_DELIVERABLE_TITLES` and `ALL_WRITTEN_ACTIVITIES` including the top die.

- [ ] **Step 1: Replace the order test in `tests/unit/threeDic.test.ts`.** Replace `'starts every stack stage where the work it consumes exists'` with the test below, and update the stage-count assertion to `BUILTIN_PROFILE.stages.length + TOP_DIE_SPLIT.length + THREE_DIC_STAGE_KEYS.length`.

```ts
  it('runs nothing before what it consumes exists', () => {
    const at = (key: string) => {
      const st = THREE_DIC_PROFILE.stages.find((s) => s.key === key)!;
      return { start: st.startOffsetWeeks, end: st.startOffsetWeeks + st.durationWeeks };
    };
    const act = (ref: string) => {
      const a = ALL_ACTIVITIES[ref];
      const s = at(a.st);
      return { start: s.start + a.w[0], end: s.start + a.w[1] };
    };
    expect(at('chipletPartitioning').start).toBeLessThanOrEqual(at('rtl').start);
    expect(at('tsvHybridBond').start).toBeLessThanOrEqual(at('threeDIntegration').start);
    expect(at('dctv').end).toBeLessThanOrEqual(at('tapeout').start);
    /* the stack is signed off once both dies are, and each die tapes out after */
    expect(act('3DI-06').end).toBeGreaterThanOrEqual(Math.max(at('signoff').end, at('signoffTop').end));
    expect(at('tapeout').start).toBeGreaterThanOrEqual(act('3DI-06').end);
    expect(at('tapeoutTop').start).toBeGreaterThanOrEqual(act('3DI-06').end);
    /* dies are binned once wafers ship, and released once both dies' have */
    expect(act('KGD-03').start).toBeGreaterThanOrEqual(act('FAB-10').start);
    expect(act('KGD-04').end).toBeGreaterThanOrEqual(act('FABT-10').end);
    /* bonded from released dies, and bonded before the package takes the stack */
    expect(act('STK-01').start).toBeGreaterThanOrEqual(act('KGD-04').start);
    expect(at('stackBonding').end).toBeLessThanOrEqual(act('ASSY-05').start);
    /* the link is brought up on a stack that exists */
    expect(act('MDT-02').start).toBeGreaterThanOrEqual(act('STK-02').end);
    /* and the program ends with qualification */
    const end = Math.max(...THREE_DIC_PROFILE.stages.map((s) => s.startOffsetWeeks + s.durationWeeks));
    expect(end).toBe(at('qualification').end);
    expect(end).toBe(159);
  });

  it('costs about a third more than the SoC flow, not a few percent', () => {
    const mm = (keys: readonly string[]) =>
      keys.reduce((t, k) => t + stageContent(k)!.engineeringEffort.reduce((a, b) => a + b, 0), 0);
    const soc = mm(BUILTIN_PROFILE.stages.map((s) => s.key));
    const dic = mm(THREE_DIC_PROFILE.stages.map((s) => s.baseKey!));
    expect(dic / soc).toBeGreaterThan(1.3);
    expect(dic / soc).toBeLessThan(1.4);
  });
```

  The imports this adds are `ALL_ACTIVITIES` and `stageContent` from `@/data/builtins`, and `TOP_DIE_SPLIT` from `@/data/threeDicTopDie`. In the checkpoint test, `expect(THREE_DIC_STAGE_KEYS).toContain(m.anchor.stage)` becomes "is a stack stage or a top-die stage".

- [ ] **Step 2: Run** `npx vitest run tests/unit/threeDic.test.ts`. Expected: FAIL.

- [ ] **Step 3: Implement the baselines** in `threeDic.ts`:

```ts
/**
 * Where the SoC stages run in a 3DIC program. They are the bottom die, and a
 * bottom die waits on the stack: its floorplan follows the 3D floorplan, its
 * tapeout follows the stack signoff, and everything after fabrication waits on
 * dies being sorted and bonded. Moved, never stretched — a stretched stage
 * keeps its activities and ends in weeks of nothing.
 */
const SOC_IN_3DIC: Record<string, { startOffsetWeeks: number; durationWeeks: number }> = {
  ...BASELINES,
  physicalDesign: { startOffsetWeeks: 50, durationWeeks: 30 },
  signoff: { startOffsetWeeks: 66, durationWeeks: 16 },
  tapeout: { startOffsetWeeks: 86, durationWeeks: 8 },
  fabrication: { startOffsetWeeks: 90, durationWeeks: 19 },
  testDevelopment: { startOffsetWeeks: 62, durationWeeks: 42 },
  packaging: { startOffsetWeeks: 99, durationWeeks: 31 },
  bringup: { startOffsetWeeks: 129, durationWeeks: 18 },
  qualification: { startOffsetWeeks: 133, durationWeeks: 26 },
};

/** The top die runs two weeks behind the bottom one, which carries the TSVs. */
const TOP_DIE_BASELINES: Record<string, { startOffsetWeeks: number; durationWeeks: number }> = {
  dftTop: { startOffsetWeeks: 20, durationWeeks: 60 },
  synthesisTop: { startOffsetWeeks: 44, durationWeeks: 24 },
  physicalDesignTop: { startOffsetWeeks: 52, durationWeeks: 30 },
  signoffTop: { startOffsetWeeks: 68, durationWeeks: 16 },
  tapeoutTop: { startOffsetWeeks: 88, durationWeeks: 8 },
  fabricationTop: { startOffsetWeeks: 92, durationWeeks: 19 },
  testDevelopmentTop: { startOffsetWeeks: 64, durationWeeks: 42 },
};
```

  Then:
  - In `THREE_DIC_BASELINES`, set `threeDIntegration: { startOffsetWeeks: 46, durationWeeks: 40 }`, `kgdSort: { startOffsetWeeks: 102, durationWeeks: 16 }` and `multiDieTest: { startOffsetWeeks: 114, durationWeeks: 30 }`, and rewrite their comments to match.
  - Set the `3DI-06` window to `[30, 40]`. In the `threeDIntegration` content, set `engineeringTat: [8, 8, 10, 10, 10, 10]`, `engineeringStart: [0, 4, 8, 10, 12, 30]` and `deliverableWeek: [8, 12, 18, 20, 22, 40]`.
  - Add the milestones `{ id: 'topDieTapeout', label: 'Top Die Tapeout', anchor: { stage: 'tapeoutTop', at: 'end' }, major: true }` and `{ id: 'topDieFirstSilicon', label: 'Top Die First Silicon', anchor: { stage: 'fabricationTop', at: 'end' }, major: true }`.

- [ ] **Step 4: Compose the profile**

```ts
const SPLIT_BASES = new Set<string>(TOP_DIE_SPLIT.map((s) => s.base));

const socStage = (key: string, order: number): ProfileStageDef => {
  const content = journeyData.find((s) => s.id === key)!;
  return {
    key,
    order,
    title: SPLIT_BASES.has(key) ? `${content.title} — Bottom Die` : content.title,
    shortTitle: content.shortTitle,
    phaseId: PHASE_OF_3DIC[key],
    baseKey: key,
    ...SOC_IN_3DIC[key],
  };
};

const topDieStage = (key: string, order: number): ProfileStageDef => {
  const split = TOP_DIE_SPLIT.find((s) => s.key === key)!;
  const content = TOP_DIE_STAGES.find((s) => s.id === key)!;
  return {
    key,
    order,
    title: content.title,
    shortTitle: content.shortTitle,
    phaseId: PHASE_OF[split.base],
    baseKey: key,
    ...TOP_DIE_BASELINES[key],
  };
};

export const THREE_DIC_PROFILE: ScheduleProfile = {
  id: 'threeDic',
  label: '3DIC (stacked die)',
  builtin: true,
  template: true,
  stages: [
    ...SOC_STAGE_KEYS.map((key) => ({ key, kind: 'soc' as const, ...SOC_IN_3DIC[key] })),
    ...TOP_DIE_SPLIT.map(({ key }) => ({ key, kind: 'top' as const, ...TOP_DIE_BASELINES[key] })),
    ...THREE_DIC_STAGE_KEYS.map((key) => ({ key, kind: 'stack' as const, ...THREE_DIC_BASELINES[key] })),
  ]
    .sort((a, b) => a.startOffsetWeeks - b.startOffsetWeeks)
    .map(({ key, kind }, order) =>
      kind === 'soc' ? socStage(key, order) : kind === 'top' ? topDieStage(key, order) : stackStage(key, order),
    ),
};
```

- [ ] **Step 5: Fold the top die into `builtins.ts`**
  - `ALL_ACTIVITIES` gains `...TOP_DIE_ACTIVITIES`.
  - `ALL_ACTIVITY_TITLES` gains `...TOP_DIE_ACTIVITY_TITLES`.
  - `ALL_STAGE_CONTENT` becomes `[...journeyData, ...THREE_DIC_STAGES, ...TOP_DIE_STAGES]`.
  - `ALL_DELIVERABLE_TITLES` gains `...TOP_DIE_DELIVERABLES`.
  - `ALL_WRITTEN_ACTIVITIES` gains `...Object.keys(TOP_DIE_ACTIVITIES)`.

  In `builtins.test.ts`, the activity and stage-content counts gain the top die's. In `page.tsx`, add `?? topDieDetail(id)`.

- [ ] **Step 6: Run** `npm run test`. Expected: PASS.
- [ ] **Step 7: Commit** with the message "The 3DIC template builds two dies on a schedule that holds".

### Task 5: Through the screens

**Files:**
- Modify: `tests/e2e/threeDic.spec.ts`

- [ ] **Step 1: Update the counts.** Change `'30'` to `'38'` in the two assertions.
- [ ] **Step 2: Add the test**

```ts
  test('builds a top die beside the bottom one, and bonds them', async ({ page }) => {
    const id = await newProgram(page, 'AtlasStack4', 'threeDic');
    await page.goto(`/p/${id}/stages`);
    for (const key of ['physicalDesignTop', 'tapeoutTop', 'fabricationTop', 'stackBonding']) {
      await expect(page.locator(`[data-stage="${key}"]`), key).toBeVisible();
    }

    await page.goto(`/p/${id}/stage/physicalDesignTop/activity`);
    const fp = page.locator('[data-act="PDT-02"]');
    await expect(fp).toContainText('(Top Die)');
    await expect(fp).toContainText('PDT-D');

    await page.goto(`/p/${id}/stage/stackBonding/deliverables`);
    await expect(page.locator('[data-board] [data-deliverable]').first()).toContainText('STK-D1');

    await page.goto(`/p/${id}/activity/PDT-06`);
    await expect(page.locator('.ad-title')).toContainText('(Top Die)');
    await page.goto(`/p/${id}/activity/STK-03`);
    await expect(page.locator('.ad-title')).toHaveText('Backside Thinning, TSV Reveal and Backside RDL');
  });
```

- [ ] **Step 3: Verify.** Stop `next dev`, then run `npm run test && npm run typecheck && npx playwright test && npm run lint`. Expected: all pass.
- [ ] **Step 4: Eyeball.** Start `next dev`, create a 3DIC program, and look at Stages, Timeline (38 rows, 159 weeks, the new checkpoints), a top-die stage, STK, and one top-die write-up.
- [ ] **Step 5: Commit** with the message "Check the two-die 3DIC template through the screens".
