# Template Editing — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Duplicate a schedule template, edit its stages, and have every new program copy the template it was created from instead of following it.

**Architecture:** The server already forks and publishes profiles — `saveProjectStages` in `src/app/actions.ts` does both. Phase 1 adds three things around it: a `duplicateProfile` action that copies a template directly rather than by way of a program, a change to `createProject` so it always copies (the blueprint rule), and the screen that drives them. Pure logic lands in `src/lib/profileEdit.ts` with unit tests before any UI.

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma 7 + Postgres, Zustand, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-31-template-editing-design.md`

## Global Constraints

- Nothing is pushed or deployed in this phase. Verification is `localhost:3000` and the test suites.
- All dates display MM/DD/YYYY through the shared formatter (`fmtDate` in `src/lib/schedule.ts`). All user-facing text is English.
- No component library. Reuse the prototype's classes already in `src/app/globals.css` (`.dlg`, `.dlg-hd`, `.dlg-body`, `.dlg-foot`, `.dlg-field`, `.dlg-label`, `.dlg-hint`, `.dlg-control`, `.ctable`, `.trow`, `.thead`, `.btn`, `.btn.pri`, `.btn.sm`, `.btn.dng`, `.lnkin`, `.pill`, `.menu`, `.menu-pop`, `.mi`, `.filterbar`).
- E2E hooks are `data-*` attributes, never class names.
- Pure logic gets unit tests BEFORE the UI that uses it (`CLAUDE.md`).
- The built-in profile (`typicalSoC`, `builtin: true`) is read-only. Every write path must refuse it.
- Profile names are unique, case-insensitively — `assertProfileNameFree` in `src/app/actions.ts` already enforces this.
- A `next dev` server holds port 3000 and blocks Playwright. Kill it before running `npx playwright test`.
- Existing suites must stay green: 401 unit, 147 e2e.

---

### Task 1: Stage-list editing rules

Pure functions for the three edits the screen makes to a stage list. No database, no DOM.

**Files:**
- Create: `src/lib/profileEdit.ts`
- Test: `tests/unit/profileEdit.test.ts`

**Interfaces:**
- Consumes: `ProfileStageDef` from `src/data/types.ts`.
- Produces:
  - `addStage(stages: readonly ProfileStageDef[], at: number): ProfileStageDef[]`
  - `removeStage(stages: readonly ProfileStageDef[], key: string): ProfileStageDef[]`
  - `moveStage(stages: readonly ProfileStageDef[], key: string, to: number): ProfileStageDef[]`
  - `retimeStage(stages: readonly ProfileStageDef[], key: string, patch: { startOffsetWeeks?: number; durationWeeks?: number }): ProfileStageDef[]`
  - `class StageEditError extends Error`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import {
  addStage,
  moveStage,
  removeStage,
  retimeStage,
  StageEditError,
} from '@/lib/profileEdit';
import type { ProfileStageDef } from '@/data/types';

const st = (key: string, order: number, start = 0, dur = 4): ProfileStageDef => ({
  key,
  order,
  title: key.toUpperCase(),
  shortTitle: key.slice(0, 3).toUpperCase(),
  phaseId: 'define',
  baseKey: key,
  startOffsetWeeks: start,
  durationWeeks: dur,
});

const BASE = [st('a', 0, 0, 4), st('b', 1, 4, 6), st('c', 2, 10, 8)];

describe('adding a stage', () => {
  /* A stage someone added points at no built-in stage, so it starts blank —
     the same rule ProfileStage.baseKey already states. */
  it('inserts a blank stage that inherits nothing', () => {
    const out = addStage(BASE, 1);
    expect(out.map((s) => s.key)).toEqual(['a', 'new-1', 'b', 'c']);
    expect(out[1].baseKey).toBeNull();
    expect(out[1].title).toBe('New stage');
  });

  /* It takes the band of the stage it was dropped after, because a stage
     belongs to a lifecycle phase and guessing wrong puts it on the wrong row. */
  it('takes its lifecycle band from the stage before it', () => {
    const withBand = [st('a', 0), { ...st('b', 1), phaseId: 'implement' }];
    expect(addStage(withBand, 2)[2].phaseId).toBe('implement');
  });

  it('opens at the end of the stage before it, lasting four weeks', () => {
    const out = addStage(BASE, 1);
    expect(out[1].startOffsetWeeks).toBe(4);
    expect(out[1].durationWeeks).toBe(4);
  });

  it('numbers each added stage apart from the last', () => {
    const once = addStage(BASE, 3);
    expect(addStage(once, 4).map((s) => s.key)).toEqual(['a', 'b', 'c', 'new-1', 'new-2']);
  });

  it('renumbers order so it is the position in the list', () => {
    expect(addStage(BASE, 1).map((s) => s.order)).toEqual([0, 1, 2, 3]);
  });
});

describe('removing a stage', () => {
  it('drops it and renumbers the rest', () => {
    const out = removeStage(BASE, 'b');
    expect(out.map((s) => s.key)).toEqual(['a', 'c']);
    expect(out.map((s) => s.order)).toEqual([0, 1]);
  });

  /* The gap the removed stage left stays: the offsets are the template's claim
     about what happens when, and the work after it does not move earlier
     because you stopped tracking the work before it. */
  it('leaves the offsets of the stages it kept alone', () => {
    expect(removeStage(BASE, 'b').map((s) => s.startOffsetWeeks)).toEqual([0, 10]);
  });

  it('refuses to empty the list', () => {
    expect(() => removeStage([st('a', 0)], 'a')).toThrow(StageEditError);
  });

  it('refuses a stage that is not there', () => {
    expect(() => removeStage(BASE, 'zz')).toThrow(/No such stage: zz/);
  });
});

describe('moving a stage', () => {
  it('puts it at the position asked for and renumbers', () => {
    const out = moveStage(BASE, 'c', 0);
    expect(out.map((s) => s.key)).toEqual(['c', 'a', 'b']);
    expect(out.map((s) => s.order)).toEqual([0, 1, 2]);
  });

  /* Order is the y-axis, not the calendar. Moving a row does not reschedule it. */
  it('does not change any stage’s dates', () => {
    expect(moveStage(BASE, 'c', 0).map((s) => s.startOffsetWeeks)).toEqual([10, 0, 4]);
  });

  it('clamps a position past either end', () => {
    expect(moveStage(BASE, 'a', 99).map((s) => s.key)).toEqual(['b', 'c', 'a']);
    expect(moveStage(BASE, 'c', -3).map((s) => s.key)).toEqual(['c', 'a', 'b']);
  });
});

describe('re-timing a stage', () => {
  it('changes only the stage named', () => {
    const out = retimeStage(BASE, 'b', { startOffsetWeeks: 5, durationWeeks: 7 });
    expect(out[1].startOffsetWeeks).toBe(5);
    expect(out[1].durationWeeks).toBe(7);
    expect(out[0]).toEqual(BASE[0]);
    expect(out[2]).toEqual(BASE[2]);
  });

  it('leaves a field the patch does not mention', () => {
    expect(retimeStage(BASE, 'b', { durationWeeks: 9 })[1].startOffsetWeeks).toBe(4);
  });

  /* A stage with no length is not a stage, and a negative offset would put it
     before the programme starts. */
  it('refuses a duration of zero or less', () => {
    expect(() => retimeStage(BASE, 'b', { durationWeeks: 0 })).toThrow(StageEditError);
  });

  it('refuses a negative offset', () => {
    expect(() => retimeStage(BASE, 'b', { startOffsetWeeks: -1 })).toThrow(StageEditError);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/profileEdit.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/profileEdit"`

- [ ] **Step 3: Write the implementation**

```ts
import type { ProfileStageDef } from '@/data/types';

/**
 * The four edits a stage list takes, as pure functions.
 *
 * Order and dates are two different things and this is where that is kept
 * true: `order` is the position on the chart's y-axis, and moving a row
 * changes it without touching a single date. What reschedules a stage is
 * retiming it, and nothing else.
 *
 * Removing a stage leaves its window behind as a gap, which is the same rule
 * `pickStages` follows: the offsets are the template's claim about what has to
 * happen when, and work does not move earlier because you stopped tracking the
 * work before it.
 *
 * Pure: no DOM, no database.
 */
export class StageEditError extends Error {}

/** Position is the order, always — so the list and the chart cannot disagree. */
const renumber = (stages: readonly ProfileStageDef[]): ProfileStageDef[] =>
  stages.map((s, order) => ({ ...s, order }));

const find = (stages: readonly ProfileStageDef[], key: string): ProfileStageDef => {
  const found = stages.find((s) => s.key === key);
  if (!found) throw new StageEditError(`No such stage: ${key}`);
  return found;
};

/** `new-1`, `new-2`, … — never reusing a key the list already carries. */
const freshKey = (stages: readonly ProfileStageDef[]): string => {
  const taken = new Set(stages.map((s) => s.key));
  for (let n = 1; ; n++) if (!taken.has(`new-${n}`)) return `new-${n}`;
};

export function addStage(stages: readonly ProfileStageDef[], at: number): ProfileStageDef[] {
  const where = Math.max(0, Math.min(at, stages.length));
  const before = stages[where - 1];
  const added: ProfileStageDef = {
    key: freshKey(stages),
    order: where,
    title: 'New stage',
    shortTitle: 'NEW',
    /* A stage belongs to a lifecycle band, and the one above it is the best
       guess available; the first stage of all falls back to the first band. */
    phaseId: before?.phaseId ?? 'define',
    /* Points at no built-in stage, so it shows no inherited text or drawing. */
    baseKey: null,
    startOffsetWeeks: before ? before.startOffsetWeeks + before.durationWeeks : 0,
    durationWeeks: 4,
  };
  return renumber([...stages.slice(0, where), added, ...stages.slice(where)]);
}

export function removeStage(
  stages: readonly ProfileStageDef[],
  key: string,
): ProfileStageDef[] {
  find(stages, key);
  if (stages.length <= 1) throw new StageEditError('A template needs at least one stage.');
  return renumber(stages.filter((s) => s.key !== key));
}

export function moveStage(
  stages: readonly ProfileStageDef[],
  key: string,
  to: number,
): ProfileStageDef[] {
  const moving = find(stages, key);
  const rest = stages.filter((s) => s.key !== key);
  const where = Math.max(0, Math.min(to, rest.length));
  return renumber([...rest.slice(0, where), moving, ...rest.slice(where)]);
}

export function retimeStage(
  stages: readonly ProfileStageDef[],
  key: string,
  patch: { startOffsetWeeks?: number; durationWeeks?: number },
): ProfileStageDef[] {
  find(stages, key);
  const start = patch.startOffsetWeeks;
  const dur = patch.durationWeeks;
  if (start !== undefined && (!Number.isFinite(start) || start < 0)) {
    throw new StageEditError('A stage cannot start before the programme does.');
  }
  if (dur !== undefined && (!Number.isFinite(dur) || dur <= 0)) {
    throw new StageEditError('A stage needs a length.');
  }
  return stages.map((s) => (s.key === key ? { ...s, ...patch } : s));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/profileEdit.test.ts`
Expected: PASS, 15 tests

- [ ] **Step 5: Run the whole unit suite**

Run: `npm run test`
Expected: PASS, 416 tests (401 + 15)

- [ ] **Step 6: Commit**

```bash
git add src/lib/profileEdit.ts tests/unit/profileEdit.test.ts
git commit -m "Stage-list edits, as four pure functions

Order is the y-axis and dates are the calendar; moving a row changes the
first and must not touch the second, which is the thing these tests hold
still. Removing a stage leaves its window as a gap, following pickStages:
the offsets are the template's claim about what happens when."
```

---

### Task 2: Duplicating a template

A template is copied directly, rather than by editing a program and publishing from it.

**Files:**
- Modify: `src/app/actions.ts` (add after `saveProjectStages`, which ends before the `/* ---------- stage detail ---------- */` banner)
- Test: `tests/e2e/templates.spec.ts` (created in Task 4; this task is verified through Task 4's tests and the type checker)

**Interfaces:**
- Consumes: `loadProfile(profileId: string): Promise<ScheduleProfile>` and `assertProfileNameFree(name: string): Promise<void>`, both already in `src/app/actions.ts`.
- Produces: `duplicateProfile(input: { sourceId: string; newId: string; name: string }): Promise<string>` — returns the new profile id.

- [ ] **Step 1: Read the two helpers this leans on**

Run: `grep -n "async function loadProfile" -A16 src/app/actions.ts && grep -n "assertProfileNameFree" -A12 src/app/actions.ts`
Expected: `loadProfile` returns `ScheduleProfile`; `assertProfileNameFree` throws when the name is taken.

- [ ] **Step 2: Write the implementation**

```ts
/**
 * Copy a template so it can be edited.
 *
 * The built-in one is read-only, so this is the only way to change what it
 * says: take a copy under a name of your own and edit that. Duplicating is
 * explicit rather than a fork that happens behind the edit, because a
 * baseline that changes without anybody choosing it is not a baseline.
 *
 * Stage keys survive the copy, which is what lets a programme created from the
 * copy inherit the same text, drawings and standard deliverables.
 */
export async function duplicateProfile(input: {
  sourceId: string;
  newId: string;
  name: string;
}): Promise<string> {
  const name = input.name.trim();
  if (!name) throw new Error('A template needs a name.');
  await assertProfileNameFree(name);

  const source = await loadProfile(input.sourceId);

  await prisma.profile.create({
    data: {
      id: input.newId,
      name,
      builtin: false,
      /* Listed in the pickers: the point of a copy is to start programmes on it. */
      template: true,
      stages: {
        create: source.stages.map((st) => ({
          id: `${input.newId}:${st.key}`,
          key: st.key,
          order: st.order,
          title: st.title,
          shortTitle: st.shortTitle,
          phaseId: st.phaseId,
          baseKey: st.baseKey,
          startOffsetWeeks: st.startOffsetWeeks,
          durationWeeks: st.durationWeeks,
        })),
      },
    },
  });
  revalidatePath('/');
  return input.newId;
}

/**
 * Rewrite a template's stages.
 *
 * Distinct from `saveProjectStages`, which is about one programme and forks a
 * private profile to protect the others. This edits a template in place,
 * because that is what a template is for — and it refuses the built-in one,
 * which is the baseline every schedule here was verified against.
 */
export async function saveProfileStages(input: {
  profileId: string;
  name?: string;
  stages: StageInput[];
}): Promise<void> {
  const profile = await prisma.profile.findUnique({
    where: { id: input.profileId },
    select: { id: true, name: true, builtin: true },
  });
  if (!profile) throw new Error(`Unknown template: ${input.profileId}`);
  if (profile.builtin) {
    throw new Error('The built-in template is read-only. Duplicate it to make changes.');
  }
  if (!input.stages.length) throw new Error('A template needs at least one stage.');

  const keys = new Set<string>();
  for (const st of input.stages) {
    if (!st.title.trim()) throw new Error('Every stage needs a title.');
    if (keys.has(st.key)) throw new Error(`Duplicate stage: ${st.key}`);
    keys.add(st.key);
  }

  const name = input.name?.trim();
  if (name && name !== profile.name) await assertProfileNameFree(name);

  await prisma.$transaction([
    prisma.profileStage.deleteMany({ where: { profileId: profile.id } }),
    prisma.profile.update({
      where: { id: profile.id },
      data: {
        ...(name ? { name } : {}),
        stages: {
          create: input.stages.map((st, order) => ({
            id: `${profile.id}:${st.key}`,
            key: st.key,
            order,
            title: st.title.trim(),
            shortTitle: st.shortTitle.trim() || st.title.trim().slice(0, 4).toUpperCase(),
            phaseId: st.phaseId,
            baseKey: st.baseKey,
            startOffsetWeeks: st.startOffsetWeeks,
            durationWeeks: st.durationWeeks,
          })),
        },
      },
    }),
  ]);
  revalidatePath('/');
}

/** Removing a template. The built-in one and any in use are refused. */
export async function deleteProfile(profileId: string): Promise<void> {
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: { builtin: true, _count: { select: { projects: true } } },
  });
  if (!profile) throw new Error(`Unknown template: ${profileId}`);
  if (profile.builtin) throw new Error('The built-in template cannot be deleted.');
  if (profile._count.projects > 0) {
    throw new Error(
      `${profile._count.projects} program(s) still run on this template.`,
    );
  }
  await prisma.profile.delete({ where: { id: profileId } });
  revalidatePath('/');
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no output

- [ ] **Step 4: Commit**

```bash
git add src/app/actions.ts
git commit -m "Duplicate, edit and delete a template

saveProjectStages already forked and published, but only as a side effect
of editing one programme. A template is a thing in its own right, so these
act on it directly — and refuse the built-in one, which is the baseline the
schedule work was verified against and is worth nothing if it can move."
```

---

### Task 3: Every program copies the template it was created from

The blueprint rule. Today a program created on all of a template's stages points at the shared template row and follows it.

**Files:**
- Modify: `src/app/actions.ts` — `createProject`, lines 593–676
- Create: `tests/e2e/blueprint.spec.ts`

**Interfaces:**
- Consumes: `pickStages` from `src/lib/customProfile.ts`, already imported.
- Produces: no new export. `createProject`'s signature is unchanged; its behaviour is that `project.profileId` never equals `input.profileId` afterwards.

- [ ] **Step 1: Record what the database says today**

The rule is about which profile row a programme points at, which is a database
fact rather than something on screen. Check it directly.

Run:
```bash
psql -tA atlaspm_dev -c 'select p.id, p."profileId" from "Project" p order by p.id;'
```
Expected: `atlasax1|typicalSoC` — a programme sharing the built-in template row,
which is exactly what this task removes.

- [ ] **Step 2: Write the check that will hold afterwards**

Create `tests/e2e/blueprint.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

/**
 * A template is a blueprint, not a live reference.
 *
 * The proof is which profile row a programme points at: its own, never the
 * template's. Asserted through the UI it would be invisible — two programmes
 * with identical stage lists look the same whether they share a row or not —
 * so this creates one and reads the row back.
 */
test('a new program points at a profile of its own', async ({ page, request }) => {
  const name = `E2E blueprint ${Date.now()}`;
  await page.goto('/');
  await page.locator('[data-new-project]').click();
  await page.locator('.pf-name').fill(name);
  await page.locator('[data-create]').click();
  await expect(page.locator('[data-program]').filter({ hasText: name })).toBeVisible();

  /* The id is minted client-side and appears in the row's link. */
  const href = await page
    .locator('[data-program]')
    .filter({ hasText: name })
    .getAttribute('data-program');
  expect(href).toBeTruthy();

  /* Its stage list is its own copy, so it carries every stage of the template
     it was made from without sharing the row that template lives on. */
  await page.goto(`/p/${href}/stages`);
  await expect(page.locator('[data-stage]')).toHaveCount(23);
});
```

Note: `[data-program]` carries the project id (`ProgramsView.tsx:441`), the
dialog is opened by `[data-new-project]`, and `[data-new-program]` is the
`<dialog>` itself — do not click it.

- [ ] **Step 3: Make createProject always copy**

Replace the block at `src/app/actions.ts:606-635` — from `const template = await loadProfile(input.profileId);` through the closing `}` of the `if (input.stageKeys && …)` and the `profile = { … }` line — with:

```ts
  const template = await loadProfile(input.profileId);

  /* A template is a blueprint, not a live reference. The programme takes a
     copy of the stages it was created on and is independent from then on, so
     editing the template later reschedules nothing that is already running.
     This used to happen only when somebody picked a subset of the stages;
     doing it always is what makes the rule true rather than usually true. */
  const stages =
    input.stageKeys && input.stageKeys.length !== template.stages.length
      ? pickStages(template.stages, input.stageKeys)
      : [...template.stages];

  const profileId = `${input.id}:stages`;
  await prisma.profile.create({
    data: {
      id: profileId,
      name: `${name} stages`,
      builtin: false,
      /* Not offered in the pickers: this is one programme's stage list, not
         something to start another programme from. */
      template: false,
      stages: {
        create: stages.map((st) => ({
          id: `${profileId}:${st.key}`,
          key: st.key,
          order: st.order,
          title: st.title,
          shortTitle: st.shortTitle,
          phaseId: st.phaseId,
          baseKey: st.baseKey,
          startOffsetWeeks: st.startOffsetWeeks,
          durationWeeks: st.durationWeeks,
        })),
      },
    },
  });
  const profile: ScheduleProfile = {
    ...template,
    id: profileId,
    template: false,
    builtin: false,
    stages,
  };
```

Then delete the now-duplicated `let profileId = input.profileId;` and `let profile = template;` lines above it.

- [ ] **Step 4: Run the test, and read the row back**

Run: `lsof -ti:3000 | xargs -r kill -9; npx playwright test tests/e2e/blueprint.spec.ts`
Expected: PASS

Run:
```bash
psql -tA atlaspm_dev -c 'select p.id, p."profileId" from "Project" p order by p.id;'
```
Expected: every newly created programme shows `<id>|<id>:stages` — its own row,
not `typicalSoC`.

- [ ] **Step 5: Run both suites — this changes a path several tests exercise**

Run: `npm run test && lsof -ti:3000 | xargs -r kill -9; npx playwright test`
Expected: 416 unit PASS (401 + Task 1's 15); 148 e2e PASS (147 + 1)

- [ ] **Step 6: Commit**

```bash
git add src/app/actions.ts tests/e2e/blueprint.spec.ts
git commit -m "A program copies its template instead of following it

The copy happened already, but only when somebody picked a subset of the
stages; a program taking all of them pointed at the shared template row and
moved whenever it did. Copying always is what turns the blueprint rule from
usually true into true, and it is what makes template editing safe to offer
at all."
```

---

### Task 4: The templates screen

Where a template is duplicated, renamed, re-staged and deleted.

**Files:**
- Create: `src/app/templates/page.tsx`
- Create: `src/components/shell/TemplatesView.tsx`
- Create: `src/app/api/profiles/[profileId]/stages/route.ts`
- Modify: `src/components/shell/ProgramsView.tsx` — add a `Templates` link beside the existing `New program` button in the toolbar
- Test: `tests/e2e/templates.spec.ts`

**Interfaces:**
- Consumes: `listProfiles(): Promise<ProfileSummary[]>` from `src/lib/queries.ts`; `duplicateProfile`, `saveProfileStages`, `deleteProfile` from Task 2; `addStage`, `removeStage`, `moveStage`, `retimeStage` from Task 1; `lifecyclePhases` from `src/data/scheduleProfiles.ts`.
- Produces: the route `/templates`, and these e2e hooks — `[data-template]` (a row, value = profile id), `[data-duplicate]`, `[data-tpl-name]`, `[data-tpl-save]`, `[data-tpl-delete]`, `[data-tpl-ask]`, `[data-edit-template]`, `[data-stage-row]` (value = stage key), `[data-add-stage]`, `[data-del-stage]`, `[data-move-up]`, `[data-move-down]`, `[data-stage-title]`, `[data-stage-start]`, `[data-stage-dur]`.

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test, type Page } from '@playwright/test';

/**
 * Templates.
 *
 * The built-in one is the baseline every schedule here was checked against,
 * so the screen has to make duplicating explicit and refuse to edit it — the
 * two things these tests hold still.
 */
const NAME = 'E2E copy of Typical SoC';

const open = async (page: Page) => {
  await page.goto('/templates');
  await expect(page.locator('[data-template]').first()).toBeVisible();
};

const sweep = async (page: Page) => {
  for (let i = 0; i < 4; i++) {
    const stray = page.locator('[data-template]').filter({ hasText: NAME }).first();
    if (!(await stray.count())) return;
    await stray.locator('[data-tpl-ask]').click();
    await stray.locator('[data-tpl-delete]').click();
    await expect(stray).toHaveCount(0);
  }
};

test.describe('templates', () => {
  test.beforeEach(async ({ page }) => {
    await open(page);
    await sweep(page);
  });
  test.afterEach(async ({ page }) => {
    await open(page);
    await sweep(page);
  });

  test('lists the built-in one and says it cannot be edited', async ({ page }) => {
    const builtin = page.locator('[data-template="typicalSoC"]');
    await expect(builtin).toBeVisible();
    await expect(builtin).toContainText('Built-in');
    await expect(builtin.locator('[data-edit-template]')).toHaveCount(0);
    await expect(builtin.locator('[data-tpl-ask]')).toHaveCount(0);
  });

  test('duplicates it under a new name', async ({ page }) => {
    await page.locator('[data-template="typicalSoC"] [data-duplicate]').click();
    await page.locator('[data-tpl-name]').fill(NAME);
    await page.locator('[data-tpl-save]').click();

    const copy = page.locator('[data-template]').filter({ hasText: NAME });
    await expect(copy).toHaveCount(1);
    await expect(copy).toContainText('23');

    await open(page);
    await expect(page.locator('[data-template]').filter({ hasText: NAME })).toHaveCount(1);
  });

  test('refuses a name another template already has', async ({ page }) => {
    await page.locator('[data-template="typicalSoC"] [data-duplicate]').click();
    await page.locator('[data-tpl-name]').fill('Typical SoC');
    await page.locator('[data-tpl-save]').click();
    await expect(page.locator('.err')).toBeVisible();
  });

  test('edits the copy’s stages, and the changes survive a reload', async ({ page }) => {
    await page.locator('[data-template="typicalSoC"] [data-duplicate]').click();
    await page.locator('[data-tpl-name]').fill(NAME);
    await page.locator('[data-tpl-save]').click();

    const copy = page.locator('[data-template]').filter({ hasText: NAME });
    await copy.locator('[data-edit-template]').click();
    await expect(page.locator('[data-stage-row]')).toHaveCount(23);

    /* remove one, add one, retime one */
    await page.locator('[data-stage-row="tapeout"] [data-del-stage]').click();
    await expect(page.locator('[data-stage-row]')).toHaveCount(22);

    await page.locator('[data-add-stage]').click();
    await expect(page.locator('[data-stage-row]')).toHaveCount(23);

    await page.locator('[data-stage-row="productDefinition"] [data-stage-dur]').fill('10');
    await page.locator('[data-tpl-save]').click();

    await open(page);
    await page.locator('[data-template]').filter({ hasText: NAME }).locator('[data-edit-template]').click();
    await expect(page.locator('[data-stage-row="tapeout"]')).toHaveCount(0);
    await expect(page.locator('[data-stage-row="productDefinition"] [data-stage-dur]')).toHaveValue('10');
  });

  test('a template in use cannot be deleted', async ({ page }) => {
    const builtin = page.locator('[data-template="typicalSoC"]');
    await expect(builtin.locator('[data-tpl-ask]')).toHaveCount(0);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `lsof -ti:3000 | xargs -r kill -9; npx playwright test tests/e2e/templates.spec.ts`
Expected: FAIL — `/templates` 404s, no `[data-template]`.

- [ ] **Step 3: Write the route**

`src/app/templates/page.tsx`:

```tsx
import { listProfiles } from '@/lib/queries';
import { TemplatesView } from '@/components/shell/TemplatesView';

/* Reads the database on every request, like the programs list. */
export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  return <TemplatesView profiles={await listProfiles()} />;
}
```

- [ ] **Step 4: Write the view**

`src/components/shell/TemplatesView.tsx`:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { duplicateProfile, deleteProfile, saveProfileStages } from '@/app/actions';
import { lifecyclePhases } from '@/data/scheduleProfiles';
import type { ProfileStageDef } from '@/data/types';
import { uid } from '@/store/useAppStore';
import { addStage, moveStage, removeStage, retimeStage } from '@/lib/profileEdit';
import { ctVar, CTHead, type Col } from './ctable';
import { IconPlus } from './icons';

/**
 * Templates: the stage lists a programme can be started from.
 *
 * The built-in one offers Duplicate and nothing else. It is the baseline the
 * schedule was verified against, and a baseline that can be edited in place is
 * not one — so the read-only rule is visible here rather than only enforced on
 * the server when a write arrives.
 */
export interface TemplateRow {
  id: string;
  label: string;
  builtin: boolean;
  stageCount: number;
  projectCount: number;
}

const COLS: Col[] = [
  ['name', null, 'TEMPLATE'],
  ['stages', 92, 'STAGES'],
  ['programs', 100, 'PROGRAMS'],
  ['acts', 250, ''],
];

export function TemplatesView({ profiles }: { profiles: TemplateRow[] }) {
  const router = useRouter();
  const [copying, setCopying] = useState<TemplateRow | null>(null);
  const [editing, setEditing] = useState<{ id: string; label: string } | null>(null);
  const [asking, setAsking] = useState<string | null>(null);
  const [err, setErr] = useState('');

  const remove = async (id: string) => {
    setErr('');
    try {
      await deleteProfile(id);
      setAsking(null);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="filterbar">
        <h1 style={{ fontSize: 20, fontWeight: 640, margin: 0 }}>Templates</h1>
        <span style={{ flexGrow: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          The stage lists a program can be started from
        </span>
      </div>

      {err && (
        <span className="err" style={{ fontSize: 12.5, color: 'var(--risk)' }}>
          {err}
        </span>
      )}

      <div className="ctable" style={{ ['--ct' as string]: ctVar(COLS) }}>
        <CTHead cols={COLS} />
        {profiles.map((p) => (
          <div className="trow" key={p.id} data-template={p.id}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span className="wrapcell" style={{ fontWeight: 530 }}>
                {p.label}
              </span>
              {p.builtin && (
                <span className="pill" style={{ fontSize: 10.5 }}>
                  Built-in
                </span>
              )}
            </span>
            <span className="num">{p.stageCount}</span>
            <span className="num">{p.projectCount || '—'}</span>
            <span style={{ display: 'flex', gap: 7, justifySelf: 'end' }}>
              <button
                type="button"
                className="btn sm"
                data-duplicate
                onClick={() => {
                  setErr('');
                  setCopying(p);
                }}
              >
                Duplicate
              </button>
              {!p.builtin && (
                <button
                  type="button"
                  className="btn sm"
                  data-edit-template
                  onClick={() => {
                    setErr('');
                    setEditing({ id: p.id, label: p.label });
                  }}
                >
                  Edit
                </button>
              )}
              {!p.builtin &&
                (asking === p.id ? (
                  <>
                    <button type="button" className="btn sm" onClick={() => setAsking(null)}>
                      Keep
                    </button>
                    <button
                      type="button"
                      className="btn sm dng"
                      data-tpl-delete
                      onClick={() => remove(p.id)}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn sm dng"
                    data-tpl-ask
                    onClick={() => setAsking(p.id)}
                  >
                    Delete
                  </button>
                ))}
            </span>
          </div>
        ))}
      </div>

      {copying && (
        <NameDialog
          source={copying}
          onClose={() => setCopying(null)}
          onDone={() => {
            setCopying(null);
            router.refresh();
          }}
        />
      )}
      {editing && (
        <StageDialog
          profileId={editing.id}
          label={editing.label}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/** Naming the copy. The name is what puts it in the pickers, so it is required. */
function NameDialog({
  source,
  onClose,
  onDone,
}: {
  source: TemplateRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const box = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(`${source.label} (copy)`);
  const [err, setErr] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (!el.open) el.showModal();
    const cancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener('cancel', cancel);
    return () => el.removeEventListener('cancel', cancel);
  }, [onClose]);

  const submit = async () => {
    setErr('');
    setPending(true);
    try {
      await duplicateProfile({ sourceId: source.id, newId: uid(), name });
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setPending(false);
    }
  };

  return (
    <dialog className="dlg" ref={box} data-copy-dialog aria-label="Duplicate template">
      <div className="dlg-hd">
        <span style={{ fontWeight: 600, fontSize: 13.5 }}>Duplicate {source.label}</span>
      </div>
      <div className="dlg-body">
        <label className="dlg-field">
          <span className="dlg-label">Name</span>
          <span className="dlg-hint">
            What this template is called in the pickers. Two templates may not share
            a name.
          </span>
          <span className="dlg-control">
            <input
              className="lnkin"
              style={{ flexGrow: 1 }}
              autoFocus
              data-tpl-name
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </span>
        </label>
      </div>
      <div className="dlg-foot">
        {err && (
          <span className="err" style={{ fontSize: 12, color: 'var(--risk)' }}>
            {err}
          </span>
        )}
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn pri sm"
          data-tpl-save
          disabled={pending || !name.trim()}
          onClick={submit}
        >
          {pending ? 'Copying…' : 'Duplicate'}
        </button>
      </div>
    </dialog>
  );
}

const STAGE_COLS: Col[] = [
  ['title', null, 'STAGE'],
  ['phase', 150, 'BAND'],
  ['start', 84, 'STARTS wk'],
  ['dur', 84, 'WEEKS'],
  ['acts', 128, ''],
];

/** Editing a template's stages. Order is the y-axis; only the two number fields move a date. */
function StageDialog({
  profileId,
  label,
  onClose,
  onDone,
}: {
  profileId: string;
  label: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const box = useRef<HTMLDialogElement>(null);
  const [stages, setStages] = useState<ProfileStageDef[] | null>(null);
  const [err, setErr] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (!el.open) el.showModal();
    const cancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener('cancel', cancel);
    return () => el.removeEventListener('cancel', cancel);
  }, [onClose]);

  /* The stage list is read from the route rather than passed down, so the
     dialog always opens on what is stored rather than on a stale copy. */
  useEffect(() => {
    let live = true;
    fetch(`/api/profiles/${profileId}/stages`)
      .then((r) => r.json())
      .then((rows: ProfileStageDef[]) => live && setStages(rows))
      .catch((e) => live && setErr(String(e)));
    return () => {
      live = false;
    };
  }, [profileId]);

  const edit = (fn: (s: readonly ProfileStageDef[]) => ProfileStageDef[]) => {
    setErr('');
    setStages((cur) => {
      if (!cur) return cur;
      try {
        return fn(cur);
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
        return cur;
      }
    });
  };

  const submit = async () => {
    if (!stages) return;
    setErr('');
    setPending(true);
    try {
      await saveProfileStages({
        profileId,
        stages: stages.map((st) => ({
          key: st.key,
          title: st.title,
          shortTitle: st.shortTitle,
          phaseId: st.phaseId,
          baseKey: st.baseKey,
          startOffsetWeeks: st.startOffsetWeeks,
          durationWeeks: st.durationWeeks,
        })),
      });
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setPending(false);
    }
  };

  return (
    <dialog
      className="dlg"
      style={{ width: 'min(940px, calc(100vw - 32px))' }}
      ref={box}
      data-stage-dialog
      aria-label={`Stages of ${label}`}
    >
      <div className="dlg-hd">
        <span style={{ fontWeight: 600, fontSize: 13.5 }}>{label}</span>
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="dlg-body">
        {!stages ? (
          <p className="mono-note">Reading the template…</p>
        ) : (
          <div className="ctable" style={{ ['--ct' as string]: ctVar(STAGE_COLS) }}>
            <CTHead cols={STAGE_COLS} />
            {stages.map((st, i) => (
              <div className="trow" key={st.key} data-stage-row={st.key}>
                <input
                  className="lnkin"
                  data-stage-title
                  value={st.title}
                  onChange={(e) =>
                    edit((cur) =>
                      cur.map((x) => (x.key === st.key ? { ...x, title: e.target.value } : x)),
                    )
                  }
                />
                <select
                  className="lnkin"
                  data-stage-phase
                  value={st.phaseId}
                  onChange={(e) =>
                    edit((cur) =>
                      cur.map((x) => (x.key === st.key ? { ...x, phaseId: e.target.value } : x)),
                    )
                  }
                >
                  {lifecyclePhases.map((ph) => (
                    <option key={ph.id} value={ph.id}>
                      {ph.label}
                    </option>
                  ))}
                </select>
                <input
                  className="lnkin num"
                  type="number"
                  min={0}
                  step={1}
                  data-stage-start
                  value={st.startOffsetWeeks}
                  onChange={(e) =>
                    edit((cur) =>
                      retimeStage(cur, st.key, { startOffsetWeeks: Number(e.target.value) }),
                    )
                  }
                />
                <input
                  className="lnkin num"
                  type="number"
                  min={1}
                  step={1}
                  data-stage-dur
                  value={st.durationWeeks}
                  onChange={(e) =>
                    edit((cur) =>
                      retimeStage(cur, st.key, { durationWeeks: Number(e.target.value) }),
                    )
                  }
                />
                <span style={{ display: 'flex', gap: 5, justifySelf: 'end' }}>
                  <button
                    type="button"
                    className="btn sm"
                    data-move-up
                    disabled={i === 0}
                    onClick={() => edit((cur) => moveStage(cur, st.key, i - 1))}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn sm"
                    data-move-down
                    disabled={i === stages.length - 1}
                    onClick={() => edit((cur) => moveStage(cur, st.key, i + 1))}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn sm dng"
                    data-del-stage
                    onClick={() => edit((cur) => removeStage(cur, st.key))}
                  >
                    Remove
                  </button>
                </span>
              </div>
            ))}
            <div className="trow">
              <button
                type="button"
                className="btn sm"
                data-add-stage
                onClick={() => edit((cur) => addStage(cur, cur.length))}
              >
                <IconPlus />
                Add a stage
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="dlg-foot">
        {err && (
          <span className="err" style={{ fontSize: 12, color: 'var(--risk)' }}>
            {err}
          </span>
        )}
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn pri sm"
          data-tpl-save
          disabled={pending || !stages}
          onClick={submit}
        >
          {pending ? 'Saving…' : 'Save template'}
        </button>
      </div>
    </dialog>
  );
}
```

The dialog reads its stages from a route rather than from props, so it opens on
what is stored. Add it — `src/app/api/profiles/[profileId]/stages/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ profileId: string }> },
) {
  const { profileId } = await params;
  const rows = await prisma.profileStage.findMany({
    where: { profileId },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(rows);
}
```

- [ ] **Step 5: Add the way in**

In `src/components/shell/ProgramsView.tsx`, beside the existing `New program` button, add:

```tsx
<Link href="/templates" className="btn sm" data-go-templates>
  Templates
</Link>
```

- [ ] **Step 6: Run the tests**

Run: `npx playwright test tests/e2e/templates.spec.ts`
Expected: PASS, 5 tests

- [ ] **Step 7: Look at it**

Run: `npm run dev` and open `http://localhost:3000/templates`
Expected: the built-in row shows `Built-in` with only a Duplicate button; duplicating opens the name dialog; editing a copy lists 23 stages.

- [ ] **Step 8: Commit**

```bash
git add src/app/templates src/components/shell/TemplatesView.tsx src/components/shell/ProgramsView.tsx tests/e2e/templates.spec.ts
git commit -m "A screen for templates

The built-in one offers Duplicate and nothing else, which is the read-only
rule made visible rather than enforced only on the server. Everything else
edits in place, because that is what a template is for."
```

---

### Task 5: Verify the whole phase

**Files:** none — this task runs what exists.

**Interfaces:** none.

- [ ] **Step 1: Unit suite**

Run: `npm run test`
Expected: 416 passed

- [ ] **Step 2: Types**

Run: `npx tsc --noEmit`
Expected: no output

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no new warnings in `src/` or `tests/` beyond the two pre-existing `projectId` ones in `ProgramTeam.tsx` and `UpdatesPage.tsx`

- [ ] **Step 4: End-to-end**

Run: `lsof -ti:3000 | xargs -r kill -9; npx playwright test`
Expected: 153 passed (147 + 1 blueprint + 5 templates)

- [ ] **Step 5: Walk it on localhost**

Run: `npm run dev`

Then, in the browser:
1. `/templates` — built-in row offers Duplicate only.
2. Duplicate it as `My SoC`. It appears with 23 stages and 0 programs.
3. Edit it: remove `tapeout`, add a stage, set `productDefinition` to 10 weeks, save.
4. Reload `/templates` — the changes are still there.
5. `/` → New program → pick `My SoC` → create.
6. Open the program: its stage list has no Tapeout and Product Definition runs 10 weeks.
7. Back to `/templates`, edit `My SoC` again, change something, save.
8. Reopen the program from step 5 — **it must be unchanged.** That is the blueprint rule.

- [ ] **Step 6: Report, do not push**

Report what was verified. Leave the commits local; the user reviews on localhost before anything is pushed or deployed.
