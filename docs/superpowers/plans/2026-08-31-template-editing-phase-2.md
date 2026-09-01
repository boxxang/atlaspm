# Template Editing — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add, edit and delete the activities inside a template's stages, and the steps inside those activities.

**Architecture:** Two tables, `ProfileActivity` and `ProfileStep`, hang off a profile. An activity is *inherited* — `baseRef` names a built-in activity and its steps come from the generated modules — or *owned*, with its steps stored. One pure resolver turns a profile's rows plus the generated index into exactly the `Record<ref, ActivityStepEntry>` shape eleven modules already read, so those modules change where they get the map from and nothing about what they do with it.

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma 7 + Postgres, Zustand, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-31-template-editing-design.md`

## Global Constraints

- Nothing is pushed or deployed. Verification is `localhost:3000` and the suites.
- Phase 1 is on the branch `template-editing` and this builds on it.
- The built-in profile (`typicalSoC`) is read-only. Every write path refuses it.
- E2E hooks are `data-*` attributes, never class names.
- Pure logic gets unit tests BEFORE the UI that uses it (`CLAUDE.md`).
- `npm run build` runs `prisma db push` first, so a schema change applies itself locally; a destructive one stops the build on purpose.
- A `next dev` server holds port 3000 and blocks Playwright. Kill it before `npx playwright test`.
- Baseline to hold: 419 unit, 154 e2e, `tsc` clean, 4 pre-existing lint warnings.
- **The shape is the contract.** `ActivityStepEntry` is `{ st, w, s, o, ob, r, ro }` (`src/data/activitySteps.ts`). The resolver returns exactly this. Any reader that would need a different shape is a sign the seam is in the wrong place — stop and say so.

---

### Task 1: The tables, and the built-in profile seeded into them

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seedProject.ts`
- Modify: `src/lib/builtinProfile.ts`

**Interfaces:**
- Produces: `ProfileActivity` and `ProfileStep` rows for `typicalSoC`, one activity per entry in `activitySteps`, every one with `baseRef` set and no `ProfileStep` rows.

- [ ] **Step 1: Add the models**

In `prisma/schema.prisma`, after `model ProfileStage`:

```prisma
/// An activity a template's stage runs.
///
/// Inherited or owned, never half of each. `baseRef` names the built-in
/// activity whose steps and write-up this one shows, the way ProfileStage.baseKey
/// names the stage whose text and drawing it shows; null means the activity was
/// added or edited here and owns its steps in ProfileStep.
model ProfileActivity {
  id        String @id
  profileId String
  /// The stage it belongs to, by key rather than by row: stage keys survive a
  /// copy, which is what lets an activity travel with its stage.
  stageKey  String
  /// Stored, not derived from position. Deleting the third of eleven leaves a
  /// gap, and a gap is correct — the alternative is silently repointing
  /// somebody's recorded work at a different activity.
  ref       String
  order     Int
  title     String
  /// Weeks from the stage's own start.
  windowFrom Float
  windowTo   Float
  /// The built-in activity this one shows; null for one added or edited here.
  baseRef   String?

  profile Profile       @relation(fields: [profileId], references: [id], onDelete: Cascade)
  steps   ProfileStep[]

  @@unique([profileId, ref])
  @@index([profileId, stageKey])
}

/// A step of an owned activity. An inherited activity has none of these.
model ProfileStep {
  id         String @id
  activityId String
  n          Int
  text       String
  /// Weeks.
  tat        Float
  /// main | par — a parallel step runs alongside the main step before it.
  lane       String @default("main")

  activity ProfileActivity @relation(fields: [activityId], references: [id], onDelete: Cascade)

  @@unique([activityId, n])
  @@index([activityId])
}
```

And add to `model Profile`, beside `stages`:

```prisma
  activities ProfileActivity[]
```

- [ ] **Step 2: Push the schema**

Run: `npm run db:push`
Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 3: Seed the built-in profile's activities**

In `src/lib/builtinProfile.ts`, inside `ensureBuiltinProfile`, after the stages are created, add:

```ts
  /* Every built-in activity, inherited: the row carries the list and the
     schedule, and the steps and write-up stay in the generated modules that
     already ship to the browser. Seeding them is what lets a copy of this
     template be edited without first migrating a megabyte of prose. */
  const existing = await prisma.profileActivity.count({ where: { profileId: BUILTIN_PROFILE.id } });
  if (existing === 0) {
    const rows = Object.entries(activitySteps).map(([ref, a], i) => ({
      id: `${BUILTIN_PROFILE.id}:act:${ref}`,
      profileId: BUILTIN_PROFILE.id,
      stageKey: a.st,
      ref,
      order: i,
      title: detailActivityTitles[ref] ?? ref,
      windowFrom: a.w[0],
      windowTo: a.w[1],
      baseRef: ref,
    }));
    await prisma.profileActivity.createMany({ data: rows });
  }
```

with these imports at the top of the file:

```ts
import { activitySteps } from '@/data/activitySteps';
import { detailActivityTitles } from '@/data/activityIndex';
```

- [ ] **Step 4: Reseed and count**

Run:
```bash
npm run db:reset
psql -tA atlaspm_dev -c 'select count(*) from "ProfileActivity" where "profileId" = '"'"'typicalSoC'"'"';'
```
Expected: `259`

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma src/lib/builtinProfile.ts
git commit -m "Tables for a template's activities and their steps

An activity is inherited or owned, never half of each: baseRef names the
built-in activity whose steps and write-up it shows, the way
ProfileStage.baseKey names the stage whose text it shows. The ref is stored
rather than derived from position, so deleting one leaves a gap instead of
repointing somebody's recorded work at a different activity."
```

---

### Task 2: The resolver

Turns a profile's rows plus the generated index into the map eleven modules read.

**Files:**
- Create: `src/lib/resolveActivities.ts`
- Test: `tests/unit/resolveActivities.test.ts`

**Interfaces:**
- Consumes: `ActivityStepEntry`, `StepTuple`, `DeliverableRelation` from `src/data/activitySteps.ts`.
- Produces:
  - `interface ActivityRow { ref: string; stageKey: string; order: number; title: string; windowFrom: number; windowTo: number; baseRef: string | null; steps: { n: number; text: string; tat: number; lane: string }[] }`
  - `resolveActivities(rows: readonly ActivityRow[], library: Record<string, ActivityStepEntry>): Record<string, ActivityStepEntry>`
  - `resolvedTitles(rows: readonly ActivityRow[], library: Record<string, string>): Record<string, string>`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { resolveActivities, resolvedTitles, type ActivityRow } from '@/lib/resolveActivities';
import type { ActivityStepEntry } from '@/data/activitySteps';

const LIB: Record<string, ActivityStepEntry> = {
  'DEF-01': {
    st: 'productDefinition',
    w: [0, 4],
    s: [
      [1, 'Interview the customers', 1.5],
      [2, 'Write it down', 0.5, 1],
    ],
    o: ['A requirements list'],
    ob: [2],
    r: [['DEF-D1', 'produces']],
    ro: 'Product manager',
  },
};

const row = (over: Partial<ActivityRow> & { ref: string }): ActivityRow => ({
  stageKey: 'productDefinition',
  order: 0,
  title: 'Requirements',
  windowFrom: 0,
  windowTo: 4,
  baseRef: null,
  steps: [],
  ...over,
});

describe('an inherited activity', () => {
  /* Its steps, outputs and deliverable relations come from the generated
     modules, which is what lets a template be edited without first moving a
     megabyte of authored prose into the database. */
  it('takes its steps and outputs from the library', () => {
    const out = resolveActivities([row({ ref: 'DEF-01', baseRef: 'DEF-01' })], LIB);
    expect(out['DEF-01'].s).toEqual(LIB['DEF-01'].s);
    expect(out['DEF-01'].o).toEqual(LIB['DEF-01'].o);
    expect(out['DEF-01'].r).toEqual(LIB['DEF-01'].r);
    expect(out['DEF-01'].ro).toBe('Product manager');
  });

  /* But the stage and the window are the template's, because moving an
     activity to another stage or re-timing it is exactly what editing is. */
  it('takes its stage and window from the row, not the library', () => {
    const out = resolveActivities(
      [row({ ref: 'DEF-01', baseRef: 'DEF-01', stageKey: 'architecture', windowFrom: 2, windowTo: 9 })],
      LIB,
    );
    expect(out['DEF-01'].st).toBe('architecture');
    expect(out['DEF-01'].w).toEqual([2, 9]);
  });

  /* A baseRef pointing at nothing is a template that outlived its library. It
     resolves to an activity with no steps rather than throwing, because one
     stale row must not take a whole programme down. */
  it('survives a baseRef the library does not have', () => {
    const out = resolveActivities([row({ ref: 'X-01', baseRef: 'GONE-99' })], LIB);
    expect(out['X-01'].s).toEqual([]);
    expect(out['X-01'].o).toEqual([]);
  });
});

describe('an owned activity', () => {
  it('takes its steps from its own rows, in step order', () => {
    const out = resolveActivities(
      [
        row({
          ref: 'NEW-01',
          steps: [
            { n: 2, text: 'Second', tat: 1, lane: 'main' },
            { n: 1, text: 'First', tat: 2, lane: 'main' },
          ],
        }),
      ],
      LIB,
    );
    expect(out['NEW-01'].s).toEqual([
      [1, 'First', 2],
      [2, 'Second', 1],
    ]);
  });

  /* The fourth element of a step tuple is the parallel flag, and it is present
     only when true — that is the shape the browser already reads. */
  it('marks a parallel step and leaves the others three long', () => {
    const out = resolveActivities(
      [
        row({
          ref: 'NEW-01',
          steps: [
            { n: 1, text: 'Main', tat: 1, lane: 'main' },
            { n: 2, text: 'Alongside', tat: 1, lane: 'par' },
          ],
        }),
      ],
      LIB,
    );
    expect(out['NEW-01'].s[0]).toHaveLength(3);
    expect(out['NEW-01'].s[1]).toEqual([2, 'Alongside', 1, 1]);
  });

  /* It has no write-up, so it produces nothing and relates to no deliverable.
     An added activity is a plan, not a document. */
  it('has no outputs, relations or inherited role', () => {
    const out = resolveActivities([row({ ref: 'NEW-01' })], LIB);
    expect(out['NEW-01'].o).toEqual([]);
    expect(out['NEW-01'].ob).toEqual([]);
    expect(out['NEW-01'].r).toEqual([]);
    expect(out['NEW-01'].ro).toBe('');
  });
});

describe('the map as a whole', () => {
  it('is keyed by ref and ordered by the row order', () => {
    const out = resolveActivities(
      [row({ ref: 'B', order: 1 }), row({ ref: 'A', order: 0 })],
      LIB,
    );
    expect(Object.keys(out)).toEqual(['A', 'B']);
  });

  it('is empty for a profile with no activities', () => {
    expect(resolveActivities([], LIB)).toEqual({});
  });
});

describe('titles', () => {
  it('prefers the row’s title over the library’s', () => {
    const out = resolvedTitles(
      [row({ ref: 'DEF-01', baseRef: 'DEF-01', title: 'Renamed here' })],
      { 'DEF-01': 'Customer and Market Requirements Definition' },
    );
    expect(out['DEF-01']).toBe('Renamed here');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/unit/resolveActivities.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/resolveActivities"`

- [ ] **Step 3: Write the implementation**

```ts
import type { ActivityStepEntry, DeliverableRelation, StepTuple } from '@/data/activitySteps';

/**
 * A profile's activities, resolved into the map the app already reads.
 *
 * Eleven modules read `Record<ref, ActivityStepEntry>` and none of them should
 * have to know where it came from, so this returns exactly that shape. What
 * changes is where the rows come from: a programme's own profile rather than a
 * module constant shared by every programme.
 *
 * An activity is inherited or owned. Inherited means `baseRef` names a built-in
 * activity, and its steps, outputs, deliverable relations and role come from
 * the generated library — which is why editing a template does not require
 * moving a megabyte of authored prose into the database first. Owned means the
 * activity was added or its steps were edited, and it carries them itself.
 *
 * Either way the stage and the window come from the row, because moving an
 * activity to another stage or re-timing it is exactly what editing is.
 *
 * Pure: no DOM, no database.
 */
export interface ActivityRow {
  ref: string;
  stageKey: string;
  order: number;
  title: string;
  windowFrom: number;
  windowTo: number;
  baseRef: string | null;
  steps: { n: number; text: string; tat: number; lane: string }[];
}

const EMPTY: Omit<ActivityStepEntry, 'st' | 'w' | 's'> = {
  o: [],
  ob: [],
  r: [] as [string, DeliverableRelation][],
  ro: '',
};

const ownSteps = (rows: ActivityRow['steps']): StepTuple[] =>
  [...rows]
    .sort((a, b) => a.n - b.n)
    .map((s) =>
      s.lane === 'par'
        ? ([s.n, s.text, s.tat, 1] as StepTuple)
        : ([s.n, s.text, s.tat] as StepTuple),
    );

export function resolveActivities(
  rows: readonly ActivityRow[],
  library: Record<string, ActivityStepEntry>,
): Record<string, ActivityStepEntry> {
  const out: Record<string, ActivityStepEntry> = {};
  for (const row of [...rows].sort((a, b) => a.order - b.order)) {
    /* A baseRef the library has lost is a template that outlived its content.
       It resolves to an activity with no steps rather than throwing: one stale
       row must not take a whole programme down. */
    const base = row.baseRef ? library[row.baseRef] : undefined;
    out[row.ref] = {
      st: row.stageKey,
      w: [row.windowFrom, row.windowTo],
      s: base ? base.s : ownSteps(row.steps),
      o: base ? base.o : EMPTY.o,
      ob: base ? base.ob : EMPTY.ob,
      r: base ? base.r : EMPTY.r,
      ro: base ? base.ro : EMPTY.ro,
    };
  }
  return out;
}

/** Titles, with the row's own winning — renaming an activity is an edit. */
export function resolvedTitles(
  rows: readonly ActivityRow[],
  library: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const row of [...rows].sort((a, b) => a.order - b.order)) {
    out[row.ref] = row.title || library[row.baseRef ?? row.ref] || row.ref;
  }
  return out;
}
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run tests/unit/resolveActivities.test.ts`
Expected: PASS, 9 tests

- [ ] **Step 5: Run the whole unit suite**

Run: `npm run test`
Expected: PASS, 430 (419 + 9 + 2 purity)

- [ ] **Step 6: Commit**

```bash
git add src/lib/resolveActivities.ts tests/unit/resolveActivities.test.ts
git commit -m "Resolve a profile's activities into the map the app reads

Eleven modules read Record<ref, ActivityStepEntry> and none of them should
have to know where it came from, so this returns exactly that shape and
changes only where the rows come from. Inherited activities take their steps
and write-up from the generated library; owned ones carry their own. Stage
and window always come from the row, because moving or re-timing an activity
is what editing one means.

A baseRef the library has lost resolves to an activity with no steps rather
than throwing — one stale row must not take a whole program down."
```

---

### Task 3: Copying the rows

Both the duplicate and the create paths carry activities and steps alongside the stages.

**Files:**
- Modify: `src/app/actions.ts` — `duplicateProfile` and `createProject`

**Interfaces:**
- Consumes: nothing new.
- Produces: no signature change. After either call, the new profile has one `ProfileActivity` per activity of the source, and a `ProfileStep` per step of each owned one.

- [ ] **Step 1: Write a helper both paths use**

Add above `duplicateProfile` in `src/app/actions.ts`:

```ts
/**
 * Copy a profile's activities and their steps onto another profile.
 *
 * Refs survive the copy, which is the whole point: the copy shows the same
 * write-ups, and a programme made from it records work against the same
 * references its template names.
 */
async function copyActivities(fromProfileId: string, toProfileId: string) {
  const rows = await prisma.profileActivity.findMany({
    where: { profileId: fromProfileId },
    orderBy: { order: 'asc' },
    include: { steps: { orderBy: { n: 'asc' } } },
  });
  if (!rows.length) return;

  await prisma.profileActivity.createMany({
    data: rows.map((a) => ({
      id: `${toProfileId}:act:${a.ref}`,
      profileId: toProfileId,
      stageKey: a.stageKey,
      ref: a.ref,
      order: a.order,
      title: a.title,
      windowFrom: a.windowFrom,
      windowTo: a.windowTo,
      baseRef: a.baseRef,
    })),
  });

  const steps = rows.flatMap((a) =>
    a.steps.map((s) => ({
      id: `${toProfileId}:act:${a.ref}:${s.n}`,
      activityId: `${toProfileId}:act:${a.ref}`,
      n: s.n,
      text: s.text,
      tat: s.tat,
      lane: s.lane,
    })),
  );
  if (steps.length) await prisma.profileStep.createMany({ data: steps });
}
```

- [ ] **Step 2: Call it from both paths**

In `duplicateProfile`, after the `prisma.profile.create({...})` call and before `revalidatePath('/')`:

```ts
  await copyActivities(input.sourceId, input.newId);
```

In `createProject`, after its `prisma.profile.create({...})` call and before `const profile: ScheduleProfile = {`:

```ts
  await copyActivities(input.profileId, profileId);
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no output

- [ ] **Step 4: Prove it copies**

Run:
```bash
npm run dev &
sleep 9
# create a program through the UI, then:
psql -tA atlaspm_dev -c 'select "profileId", count(*) from "ProfileActivity" group by 1 order by 2 desc;'
```
Expected: `typicalSoC|259` and one row per program that has been created since, each also `259`.

- [ ] **Step 5: Commit**

```bash
git add src/app/actions.ts
git commit -m "Duplicating and creating carry the activities too

Refs survive the copy, which is the point: the copy shows the same write-ups,
and a program made from it records work against the references its template
names. A stage list without its activities would be a template of empty
stages."
```

---

### Task 4: Reading the program's own activities

The seam. Eleven modules stop importing the module constant.

**Files:**
- Modify: `src/lib/projectState.ts` — carry the profile's activities into `ProjectState`
- Modify: `src/lib/queries.ts` — load them, and count overdue steps on the server
- Modify: `src/store/useAppStore.ts` — hold them
- Create: `src/components/shell/useProgramActivities.ts`
- Modify the ten client readers: `useStageSteps.ts`, `useAttention.ts`, `useProgramWork.ts`, `useDeliverableRefs.ts`, `DeliverableLines.tsx`, `DeliverableTable.tsx`, `HandoverPanel.tsx`, `OverviewPage.tsx`, `UpdatesPage.tsx`, `ProgramsView.tsx`

**Interfaces:**
- Produces: `useProgramActivities(): Record<string, ActivityStepEntry>` and `useProgramActivityTitles(): Record<string, string>`.
- `ProjectState` gains `activities: ActivityRow[]`.
- `ProjectSummary` gains `overdue: number`; `doneSteps` stays for the cards that read it.

- [ ] **Step 1: Carry the rows into ProjectState**

In `src/lib/projectState.ts`, add to the `ProjectState` interface:

```ts
  /** The programme's own activities, resolved against the generated library. */
  activities: ActivityRow[];
```

with `import type { ActivityRow } from './resolveActivities';`, and add `activities` to the object `buildProjectState` returns, taken from a new `activities` field on its input row.

- [ ] **Step 2: Load them**

In `src/lib/queries.ts`, in the query that builds a project's state, include:

```ts
    activities: {
      orderBy: { order: 'asc' },
      include: { steps: { orderBy: { n: 'asc' } } },
    },
```
on the profile, and map the rows into `ActivityRow[]`.

- [ ] **Step 3: Hold them in the store**

In `src/store/useAppStore.ts`, add `activities: Record<string, ActivityStepEntry>` and `activityTitles: Record<string, string>` to `AppState`, defaulted to `{}`, and set both in `hydrate` with `resolveActivities(initial.activities, activitySteps)` and `resolvedTitles(initial.activities, detailActivityTitles)`.

- [ ] **Step 4: Write the hooks**

`src/components/shell/useProgramActivities.ts`:

```ts
'use client';

import { useAppStore } from '@/store/useAppStore';
import type { ActivityStepEntry } from '@/data/activitySteps';

/**
 * The activities this programme runs.
 *
 * Was a module constant shared by every programme, which stopped being true
 * the moment a template could be edited: two programmes on two templates run
 * different lists. The shape is unchanged, so every reader that took the
 * constant takes this instead.
 */
export const useProgramActivities = (): Record<string, ActivityStepEntry> =>
  useAppStore((s) => s.activities);

export const useProgramActivityTitles = (): Record<string, string> =>
  useAppStore((s) => s.activityTitles);
```

- [ ] **Step 5: Switch the client readers, one file at a time**

For each of `useStageSteps.ts`, `useAttention.ts`, `useProgramWork.ts`, `useDeliverableRefs.ts`, `DeliverableLines.tsx`, `DeliverableTable.tsx`, `HandoverPanel.tsx`, `OverviewPage.tsx`, `UpdatesPage.tsx`:

1. Delete `import { activitySteps } from '@/data/activitySteps';`
2. Add `import { useProgramActivities } from './useProgramActivities';` (or `'../shell/useProgramActivities'` from `src/components/`)
3. Inside the hook or component body add `const activitySteps = useProgramActivities();`
4. Move any module-level `BY_STAGE`-style precomputation inside the hook, memoised on `activitySteps`

`useStageSteps.ts` specifically: replace the module-level `BY_STAGE` loop with, inside `useStageSteps`:

```ts
  const activitySteps = useProgramActivities();
  const byStage = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const [ref, a] of Object.entries(activitySteps)) {
      const list = m.get(a.st);
      if (list) list.push(ref);
      else m.set(a.st, [ref]);
    }
    return m;
  }, [activitySteps]);
```
and use `byStage` where `BY_STAGE` was. Run `npx tsc --noEmit` after each file.

- [ ] **Step 6: Move the list's overdue count to the server**

`ProgramsView.tsx` counts overdue steps for every programme in the list, which needs each one's activities — 259 entries per programme shipped to a page that only prints a number. Compute it where the profiles already are.

In `src/lib/queries.ts`, inside the loop that builds each `ProjectSummary`, add:

```ts
      /* Counted here rather than in the browser: the list would otherwise
         need every programme's whole activity index to print one number. */
      overdue: countOverdueSteps(
        resolveActivities(activityRowsFor(p.profileId), activitySteps),
        computeSchedule(p.kickoff, profileOf(p), {}),
        new Set(mineDone),
        today,
      ),
```

and add `overdue: number` to `ProjectSummary`. In `ProgramsView.tsx`, delete the local `overdueSteps` function and its `activitySteps` import, and read `p.overdue`.

- [ ] **Step 7: Typecheck and run both suites**

Run: `npx tsc --noEmit && npm run test`
Expected: no output; 430 unit PASS

Run: `lsof -ti:3000 | xargs -r kill -9; npx playwright test`
Expected: 154 e2e PASS — **this is the task's real gate.** The suite covers the overview ladder, the stage tables, deliverables, handovers and updates, all of which read this map. If it stays green, the seam is in the right place.

- [ ] **Step 8: Commit**

```bash
git add -A src/lib src/store src/components
git commit -m "A program reads its own activities, not everyone's

The map was a module constant shared by every program, which stopped being
true the moment a template could be edited: two programs on two templates
run different lists. The shape is unchanged — Record<ref, ActivityStepEntry>
— so the eleven readers change where they get it and nothing about what they
do with it.

The programs list counted overdue steps in the browser, which would now need
every program's whole activity index to print one number. It is counted on
the server, where the profiles already are."
```

---

### Task 5: Editing activities and steps

**Files:**
- Modify: `src/app/actions.ts` — extend `saveProfileStages` into `saveTemplate`
- Create: `src/app/api/profiles/[profileId]/activities/route.ts`
- Modify: `src/components/shell/TemplatesView.tsx`
- Test: `tests/e2e/templates.spec.ts`

**Interfaces:**
- Produces: `saveTemplateActivities(input: { profileId: string; stageKey: string; activities: { ref: string; title: string; windowFrom: number; windowTo: number; baseRef: string | null; steps: { n: number; text: string; tat: number; lane: string }[] }[] }): Promise<void>`
- New hooks: `[data-edit-activities]` (on a stage row), `[data-activity-row]`, `[data-act-title]`, `[data-act-from]`, `[data-act-to]`, `[data-add-activity]`, `[data-del-activity]`, `[data-edit-steps]`, `[data-step-row]`, `[data-step-text]`, `[data-step-tat]`, `[data-step-lane]`, `[data-add-step]`, `[data-del-step]`.

- [ ] **Step 1: Write the failing test**

Add to `tests/e2e/templates.spec.ts`, inside the existing `test.describe('templates', …)`:

```ts
  /* Editing a step materialises the whole activity: it stops inheriting and
     owns every step, so no reader ever consults two sources at once. */
  test('adds an activity to a stage, and gives it a step', async ({ page }) => {
    await duplicate(page);
    await page.locator('[data-template]').filter({ hasText: NAME }).locator('[data-edit-template]').click();
    await page.locator('[data-stage-row="productDefinition"] [data-edit-activities]').click();

    const before = await page.locator('[data-activity-row]').count();
    expect(before).toBeGreaterThan(0);

    await page.locator('[data-add-activity]').click();
    await expect(page.locator('[data-activity-row]')).toHaveCount(before + 1);

    const added = page.locator('[data-activity-row]').last();
    await added.locator('[data-act-title]').fill('Stakeholder sign-off');
    await added.locator('[data-edit-steps]').click();
    await page.locator('[data-add-step]').click();
    await page.locator('[data-step-row]').last().locator('[data-step-text]').fill('Collect the signatures');
    await page.locator('[data-step-row]').last().locator('[data-step-tat]').fill('2');
    await page.locator('[data-tpl-save]').click();
    await expect(page.locator('[data-stage-dialog]')).toHaveCount(0);

    await open(page);
    await page.locator('[data-template]').filter({ hasText: NAME }).locator('[data-edit-template]').click();
    await page.locator('[data-stage-row="productDefinition"] [data-edit-activities]').click();
    await expect(
      page.locator('[data-activity-row]').filter({ hasText: 'Stakeholder sign-off' }),
    ).toHaveCount(1);
  });

  test('removes an activity, and the gap in the numbering stays', async ({ page }) => {
    await duplicate(page);
    await page.locator('[data-template]').filter({ hasText: NAME }).locator('[data-edit-template]').click();
    await page.locator('[data-stage-row="productDefinition"] [data-edit-activities]').click();

    const rows = page.locator('[data-activity-row]');
    const before = await rows.count();
    const secondRef = await rows.nth(1).getAttribute('data-activity-row');
    const thirdRef = await rows.nth(2).getAttribute('data-activity-row');

    await rows.nth(1).locator('[data-del-activity]').click();
    await expect(rows).toHaveCount(before - 1);
    /* The one that followed keeps its own reference rather than sliding into
       the deleted one's — that is what stops recorded work being repointed. */
    await expect(rows.nth(1)).toHaveAttribute('data-activity-row', thirdRef!);
    await expect(page.locator(`[data-activity-row="${secondRef}"]`)).toHaveCount(0);
  });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `lsof -ti:3000 | xargs -r kill -9; npx playwright test tests/e2e/templates.spec.ts -g "activity"`
Expected: FAIL — no `[data-edit-activities]`

- [ ] **Step 3: Write the action**

Add to `src/app/actions.ts`:

```ts
/**
 * Rewrite one stage's activities in a template.
 *
 * Editing any step of an inherited activity materialises all of them: the row
 * drops its baseRef and owns every step from then on. An activity is inherited
 * or owned, never half of each, so no reader consults two sources at once.
 */
export async function saveTemplateActivities(input: {
  profileId: string;
  stageKey: string;
  activities: {
    ref: string;
    title: string;
    windowFrom: number;
    windowTo: number;
    baseRef: string | null;
    steps: { n: number; text: string; tat: number; lane: string }[];
  }[];
}): Promise<void> {
  const profile = await prisma.profile.findUnique({
    where: { id: input.profileId },
    select: { id: true, builtin: true },
  });
  if (!profile) throw new Error(`Unknown template: ${input.profileId}`);
  if (profile.builtin) {
    throw new Error('The built-in template is read-only. Duplicate it to make changes.');
  }

  const refs = new Set<string>();
  for (const a of input.activities) {
    if (!a.title.trim()) throw new Error('Every activity needs a title.');
    if (refs.has(a.ref)) throw new Error(`Duplicate activity: ${a.ref}`);
    refs.add(a.ref);
    if (a.windowTo <= a.windowFrom) {
      throw new Error(`${a.ref} has to end after it starts.`);
    }
  }

  await prisma.$transaction([
    prisma.profileActivity.deleteMany({
      where: { profileId: profile.id, stageKey: input.stageKey },
    }),
    ...input.activities.map((a, order) =>
      prisma.profileActivity.create({
        data: {
          id: `${profile.id}:act:${a.ref}`,
          profileId: profile.id,
          stageKey: input.stageKey,
          ref: a.ref,
          order,
          title: a.title.trim(),
          windowFrom: a.windowFrom,
          windowTo: a.windowTo,
          baseRef: a.baseRef,
          steps: a.baseRef
            ? undefined
            : {
                create: a.steps.map((s, i) => ({
                  id: `${profile.id}:act:${a.ref}:${i + 1}`,
                  n: i + 1,
                  text: s.text.trim(),
                  tat: s.tat,
                  lane: s.lane === 'par' ? 'par' : 'main',
                })),
              },
        },
      }),
    ),
  ]);
  revalidatePath('/');
  revalidatePath('/templates');
}
```

- [ ] **Step 4: Write the read route**

`src/app/api/profiles/[profileId]/activities/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/** One stage's activities, with the steps of any that owns them. */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ profileId: string }> },
) {
  const { profileId } = await ctx.params;
  const stageKey = new URL(req.url).searchParams.get('stage') ?? undefined;
  const rows = await prisma.profileActivity.findMany({
    where: { profileId, ...(stageKey ? { stageKey } : {}) },
    orderBy: { order: 'asc' },
    include: { steps: { orderBy: { n: 'asc' } } },
  });
  return NextResponse.json(rows);
}
```

- [ ] **Step 5: Extend the stage editor**

In `TemplatesView.tsx`, give each `[data-stage-row]` an `[data-edit-activities]` button that opens an `ActivityDialog`. That dialog:

- fetches `/api/profiles/<id>/activities?stage=<key>`
- lists `[data-activity-row]` (value = ref) with `[data-act-title]`, `[data-act-from]`, `[data-act-to]` and `[data-del-activity]`
- `[data-add-activity]` appends a row with a fresh ref — `<SHORT>-<n>` where `n` is one past the highest number already used in that stage, so a deleted number is never reissued
- `[data-edit-steps]` on a row expands a step table: `[data-step-row]` with `[data-step-text]`, `[data-step-tat]`, `[data-step-lane]` (select main/par) and `[data-del-step]`, plus `[data-add-step]`. Opening it on an inherited activity copies the library's steps into the row and clears `baseRef` — the materialise rule, applied at the moment somebody starts editing
- `[data-tpl-save]` calls `saveTemplateActivities`

Follow the `StageDialog` shape already in the file: `useModal`, a local `useState` list, errors caught into `.err` rather than thrown.

- [ ] **Step 6: Run the tests**

Run: `npx playwright test tests/e2e/templates.spec.ts`
Expected: PASS, 7 tests

- [ ] **Step 7: Commit**

```bash
git add -A src/app src/components tests/e2e/templates.spec.ts
git commit -m "Edit the activities in a stage, and the steps in an activity

Opening the step editor on an inherited activity copies the library's steps
onto it and drops its baseRef. That is the materialise rule: an activity is
inherited or owned, never half of each, so nothing downstream has to consult
two sources for one activity.

An added activity takes the next unused number in its stage. A deleted number
is never reissued — a reference is an identity, and recorded work is keyed on
it."
```

---

### Task 6: Verify the whole phase

- [ ] **Step 1: Unit, types, lint**

Run: `npm run test && npx tsc --noEmit && npm run lint`
Expected: 430 unit PASS; no tsc output; 4 pre-existing warnings and no new ones

- [ ] **Step 2: End-to-end**

Run: `lsof -ti:3000 | xargs -r kill -9; npx playwright test`
Expected: 156 PASS (154 + 2 new)

- [ ] **Step 3: Walk it on localhost**

Run: `npm run dev`

1. `/templates` → duplicate `Typical SoC` as `Phase2 SoC`.
2. Edit it → Product Definition → **Edit activities**. Nine activities are listed, each with its window.
3. Add one, title it, give it two steps, save.
4. Reload and reopen — the activity and its steps are there.
5. `/` → New program on `Phase2 SoC`.
6. Open the program → Product Definition → Activity tab. **The added activity is in the table with its steps and dates.**
7. Go back to `/templates`, delete an activity from `Phase2 SoC`, save.
8. Reopen the program from step 5 — **unchanged.** The blueprint rule holds one level deeper.

- [ ] **Step 4: Report, do not push**

Report what was verified, including step 6 — an activity that exists in no generated module appearing in a programme's table is the whole phase working. Leave the commits local.
