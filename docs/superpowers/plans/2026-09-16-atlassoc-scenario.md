# AtlasSoC Scenario Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seed AtlasSoC, a netlist-turnkey program on a "Netlist Turnkey" template, carrying the EVT0 congestion story from the FFN through tapeout as posts, risks, notes, meetings, decisions and action items.

**Architecture:** Generalise the AtlasFX1 builder and seed into a scenario builder and seeder, then add AtlasSoC as a second scenario. Plan windows and baselines go in the template; actual windows and overrides go in the program.

**Tech Stack:** TypeScript, Prisma, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-16-atlassoc-scenario-design.md`

## Global Constraints

- `tests/unit/foundryDemo.test.ts` passes unchanged. It guards the refactor.
- All app text is English; `@me` is the TPM.
- No schema change and no app-screen change.
- Pure builders: no clock, no DB. Only `prisma/*.ts` touches the database.

---

### Task 1: Scenario builder, with AtlasFX1 as its first scenario

**Files:**
- Create: `src/data/scenarioTypes.ts`
- Create: `src/data/scenario.ts`
- Create: `src/lib/scenario.ts`
- Create: `prisma/scenarioSeed.ts`
- Modify: `src/data/foundryDemo.ts`, to import the types and export `FX1_SCENARIO`
- Modify: `src/lib/foundryDemo.ts`, to become a wrapper
- Modify: `prisma/seedFoundryDemo.ts`, to become a thin caller

**Interfaces:**
- Produces `Scenario`:

```ts
export interface Scenario {
  program: { id: string; name: string; kickoff: string; costPerManMonth: number; today: string; now: string;
    timeZone: string; emailDomain: string; phoneStart: number };
  template: { id: string; name: string;
    stages: readonly { key: string; startOffsetWeeks: number; durationWeeks: number }[];
    windows: Readonly<Record<string, readonly [number, number]>> };
  actual?: { overrides: Readonly<Record<string, { startOffsetWeeks: number; durationWeeks: number }>>;
    windows: Readonly<Record<string, readonly [number, number]>> };
  doneStages: readonly string[];
  leaders: Readonly<Record<string, ScenarioPerson>>;
  contacts: Readonly<Record<string, readonly ScenarioPerson[]>>;
  steps: readonly ScenarioStep[];
  deliverables: readonly ScenarioDeliverable[];
  posts: readonly ScenarioPost[];
  series: readonly ScenarioSeries[];
  meetings: readonly ScenarioMeeting[];
}
```

- Produces `buildScenario(s: Scenario, input: { builtin; library }): ScenarioDemo`. The result has the same fields as today's `FoundryDemo`, plus:
  - `overrides`: `{ stageId, startOffsetWeeks, durationWeeks }[]`
  - `programWindows`
- Produces `seedScenario(prisma, demo): Promise<void>`.

Steps:
- [ ] **Step 1: Move the types.** The `Fx*` interfaces move from `foundryDemo.ts` to `scenarioTypes.ts` under their new names:
  - `FxPerson` → `ScenarioPerson`
  - `FxPost` → `ScenarioPost`
  - `FxLink` → `ScenarioLink`
  - `FxSeries` → `ScenarioSeries`
  - `FxAgenda` → `ScenarioAgenda`
  - `FxDecision` → `ScenarioDecision`
  - `FxAction` → `ScenarioAction`
  - `FxMeeting` → `ScenarioMeeting`

  The inline step and deliverable record types become `ScenarioStep` and `ScenarioDeliverable`.
- [ ] **Step 2: Write `Scenario`** in `src/data/scenario.ts`. In `foundryDemo.ts`, add `FX1_SCENARIO` assembled from the existing FX1 constants: `doneStages: FX1_DONE_BEFORE_TODAY`, `emailDomain: 'atlasfx1.example'`, `phoneStart: 140`, no `actual`.
- [ ] **Step 3: Write `buildScenario`** in `src/lib/scenario.ts` from `buildFoundryDemo`, parameterised:
  - Every `FX1_*` constant becomes `s.*`, and `PID` becomes `s.program.id`.
  - The schedule is computed with `computeSchedule(kickoff, profile, s.actual?.overrides ?? {})`.
  - The activities the program runs take `s.actual?.windows[ref] ?? s.template.windows[ref]`.
  - The result gains `overrides` and `programWindows: s.actual?.windows ?? {}`.

  In `src/lib/foundryDemo.ts`, keep the row types re-exported and make `buildFoundryDemo = (input) => buildScenario(FX1_SCENARIO, input)`.
- [ ] **Step 4: Write `seedScenario`** in `prisma/scenarioSeed.ts` from today's `main()` body in `seedFoundryDemo.ts`. After `copyActivities(template → private)`, add:
  - `programWindows` updates on the private profile
  - `stageOverride.createMany` with `id: \`${projectId}:${stageId}\``

  `seedFoundryDemo.ts` then only builds and seeds.
- [ ] **Step 5: Run** `npm run test && npm run typecheck`. Expected: PASS, with `foundryDemo.test.ts` untouched.
- [ ] **Step 6: Commit** with the message "One scenario builder, with AtlasFX1 as its first scenario".

### Task 2: AtlasSoC

**Files:**
- Create: `src/data/atlasSocDemo.ts` (`ATLAS_SOC_SCENARIO`)
- Create: `prisma/seedAtlasSocDemo.ts`
- Test: `tests/unit/atlasSocDemo.test.ts`

- [ ] **Step 1: Write the failing tests** for everything listed under "Tests" in the spec, against `buildScenario(ATLAS_SOC_SCENARIO, { builtin: BUILTIN_PROFILE, library: activitySteps })`:

```ts
const demo = buildScenario(ATLAS_SOC_SCENARIO, { builtin: BUILTIN_PROFILE, library: activitySteps });
const plan = computeSchedule(demo.project.kickoff, { ...demo.profile, stages: demo.template.stages }, {});
it('taped out two months after the plan', () => {
  expect(fmtDate(plan.stages.tapeout.end)).toBe('01/29/2024');
  expect(fmtDate(demo.schedule.stages.tapeout.end)).toBe('03/25/2024');
});
it('is complete, so nothing reads overdue today', () => {
  for (const a of demo.activities)
    for (const p of plannedSteps(demo.schedule.stages[a.stageId].start, a)) {
      const s = demo.stepStates.find((x) => x.activityRef === a.ref && x.stepN === p.n);
      expect(s?.done, `${a.ref}:${p.n}`).toBe(true);
    }
  for (const d of demo.deliverables) expect(d.done, d.id).toBe(true);
});
it('decides at the escalation what the story says it decided', () => {
  const text = decisionsOn('2023-12-05').join(' ');
  for (const w of ['130', '100', 'HVQK', '1.5', 'OCV', '50', 'EVT1']) expect(text).toContain(w);
});
```

  Also cover: the story dates, action owners, due dates and evidence, approvals, links resolving, and the ASSY-05 check.
- [ ] **Step 2: Run** the test. Expected: FAIL (module missing).
- [ ] **Step 3: Author `atlasSocDemo.ts`.**
  - Program and template as the spec describes: `doneStages` is every stage, `today: '2025-03-31'`, `timeZone: 'Asia/Seoul'`.
  - Plan windows for PD, and actual windows for PD, SO, TEST and ASSY, generated by a local piecewise `remap(template windows of the stage, segments)` helper.
  - Content per the spec's beats.
- [ ] **Step 4: Run** the test. Expected: PASS.
- [ ] **Step 5: Seed.** Write `prisma/seedAtlasSocDemo.ts` as a thin caller, then run `npx tsx prisma/seedAtlasSocDemo.ts` locally. Expected: the "Created template … AtlasSoC …" line.
- [ ] **Step 6: Eyeball.** With `next dev`, check the program list, the timeline (tapeout 03/25/2024), Meetings (the escalation's decisions and actions), a risk thread, and the key-info notes.
- [ ] **Step 7: Verify and commit.** Run `npm run test && npm run typecheck && npm run lint`, then commit with the message "AtlasSoC: the EVT0 congestion story, from the FFN to tapeout".
