# AtlasSoC: a netlist-turnkey program whose first tapeout slipped two months

Date: 2026-09-16 · Status: approved in conversation, implementing

## Why

The PM uses this program in interviews to tell one failure story end to end:
what went wrong, how it was resolved, and what the TPM did — which meetings,
which owners, which action items, followed up how. It has to read as a real
program's record, not a slide.

## The story (as given)

- The customer hands over a gate-level netlist. The program runs physical
  design through production.
- The FFN arrives at the end of September 2023. Nine of its 60 blocks have
  grown by 11% in gate count on average. Congestion is expected, so the team
  asks for a larger die, and the customer refuses.
- Neighbouring blocks are shrunk and the congested ones grown. Shorts and
  timing violations persist, and by the end of November 2023 a normal timing
  signoff is judged out of reach.
- EVT0 is agreed as a functional-validation tapeout under relaxed signoff
  criteria. The SoW already includes two tapeouts, so the fixes go into EVT1,
  which goes to production. The relaxations:
  - TAP clock 130 MHz → 100 MHz
  - the HVQK corner relaxed
  - FEOL/BEOL variation 3σ → 1.5σ
  - OCV margin removed
  - 50 extra wafers, to cover the sample-quantity risk
- Tapeout lands in March 2024, two months after the original plan.
- DPML is already at the contracted minimum, so fab time cannot be cut. The
  customer pulls assembly in, which recovers part of the slip.
- The record has to show the TPM convening the meetings, confirming issues,
  naming owners, and raising and following up action items.

## Decisions (made in conversation)

- **Template "Netlist Turnkey"**, a copy of Typical SoC keeping PD, TEST, SO,
  ASSY, TO, FAB, BU and MP. **Program "AtlasSoC"** (`atlassoc`), kickoff
  2023-03-06 (N0 netlist, physical design starts), $15k per man-month,
  time zone Asia/Seoul.
- **One flow.** EVT0 and EVT1 appear in the record (decisions, notes), not as
  separate stages.
- **Issue content runs to the EVT0 tapeout** (March 2024) and the retrospective
  after it. Stages after tapeout carry no story.
- **Everything is complete.** The app reads today from the clock (2026), so a
  step left open would read as years overdue. Every step and deliverable is
  done on the date the program's actual schedule gives it.
- **Plan in the template, actual in the program.** The template's baselines
  and activity windows are the plan (tapeout 2024-01-29). The program's
  StageOverrides and its own activity windows are what happened (tapeout
  2024-03-25).
- **The AtlasFX1 builder is generalised** into a scenario builder rather than
  copied; AtlasFX1 becomes the first scenario and its tests guard the refactor.

## Schedule (weeks from 2023-03-06)

| stage | plan | actual | why |
|---|---|---|---|
| PD | 0–38 | 0–45 | congestion recovery after the FFN, closure again on relaxed criteria |
| TEST | 10–52 | 10–60 | TAP clock change and the 50 extra wafers |
| SO | 24–40 | 24–47 | normal signoff abandoned 11/28; relaxed signoff through January |
| ASSY | 37–68 | 42–73 | front end as planned, shifted; back end compressed 8 → 5 weeks by the customer's pull-in |
| TO | 39–47 | 47–55 | tapeout 2024-01-29 → 2024-03-25 |
| FAB | 43–62 | 51–70 | DPML at the minimum; no compression |
| BU | 67–85 | 72–90 | |
| MP | 71–97 | 76–102 | net slip at production: five weeks |

Activity windows are re-timed piecewise, per stage:

- **PD.** Template week 19, where the final turn on the FFN starts, maps to
  program week 29.5, the FFN date. Plan: [0,19]→[0,29.5], [19,30]→[29.5,38].
  Actual: [0,19]→[0,29.5], [19,30]→[29.5,45].
- **SO** (actual [0,16]→[0,23]) and **TEST** (actual [0,42]→[0,50]) are linear.
- **ASSY** actual: [0,20]→[0,20] and [20,31]→[24,31]. The substrate build is
  unchanged; the back end starts two weeks before wafers ship and is five
  weeks shorter than planned.
- **TO, FAB, BU and MP** keep their template windows.

## The record

All app text is in English. `@me` is the TPM (the tool's single user).

**Meeting series.**
- PD Weekly Sync (Wednesdays, all year)
- AtlasSoC Customer Weekly (Thursdays)
- Congestion Task Force (Tuesdays and Fridays, 10/17 – 11/24)
- Tapeout Readiness Review (Tuesdays, 01/09 – 03/19)

**One-off meetings.**
- FFN QoR alignment (10/04)
- Die-size proposal review (10/06)
- Signoff criteria escalation with the customer (12/05)
- Foundry fab-cycle review (12/14)
- EVT0 go/no-go (03/19)
- EVT0 retrospective (03/28)

**Beats.** Each is posts on the steps it concerns, risks where it is a risk,
decisions and action items in the meeting where it was decided, and key-info
notes with tables where a table is the clearest record:

| date | beat |
|---|---|
| 09/29 | FFN received |
| 10/04 | 9 of 60 blocks at +11% gate count on average; risk raised; block table note |
| 10/06 | die-size increase proposed (impact analysis, customer proposal) |
| 10/12 | customer rejects it; decision: keep the die size and rebalance the floorplan |
| 10/17 – 11/24 | task force: per-turn shorts and WNS; not converging; actions carried over |
| 11/28 | normal signoff judged unreachable; options A/B/C prepared by the TPM |
| 12/05 | option B agreed: EVT0 for functional validation, the relaxations, 50 wafers, fixes in EVT1 under the two-tapeout SoW, tapeout in March; owner and due date per item |
| 12/14 | DPML at minimum, fab cycle fixed; customer asked to pull in assembly |
| 01/10 | pull-in accepted; schedule re-baselined |
| Jan – Mar | relaxed signoff closure, waiver review, FEOL MTO, BEOL MTO 03/25 |
| 03/28 | retrospective note: cause, response, the TPM's part, prevention |

The prevention items are a gate-count delta gate at every netlist drop,
congestion early warning from N1, and a die-size change clause in the SoW.

**Invented numbers** (the PM may change them): block names, the gate-count
spread, the die-size increase asked for, shorts and WNS per turn, the base
wafer count, and people's names.

## Architecture

- `src/data/scenarioTypes.ts` holds the scenario content types (`ScenarioPost`,
  `ScenarioSeries`, `ScenarioMeeting`, `ScenarioAgenda`, `ScenarioDecision`,
  `ScenarioAction`, `ScenarioLink`, `ScenarioPerson`), moved from
  `foundryDemo.ts` and renamed. `FxPerson` and the others are no longer
  exported under their old names.
- `src/data/scenario.ts`: `interface Scenario { program; template; actual?;
  doneStages; leaders; contacts; steps; deliverables; posts; series;
  meetings }`.
  - `program`: `{ id, name, kickoff, costPerManMonth, today, now, timeZone,
    emailDomain, phoneStart }`.
  - `template`: `{ id, name, stages: {key, startOffsetWeeks, durationWeeks}[],
    windows }`.
  - `actual`: `{ overrides: Record<stageKey, {startOffsetWeeks,
    durationWeeks}>, windows }`, optional.
- `src/data/foundryDemo.ts` exports `FX1_SCENARIO: Scenario`, built from its
  existing constants, which stay exported.
- `src/data/atlasSocDemo.ts` exports `ATLAS_SOC_SCENARIO: Scenario`.
- `src/lib/scenario.ts` exports `buildScenario(scenario, { builtin, library })`
  — today's `buildFoundryDemo`, parameterised. It adds `overrides` (stage
  overrides, fed to `computeSchedule`) and `programWindows`.
  `src/lib/foundryDemo.ts` keeps `buildFoundryDemo(input) =
  buildScenario(FX1_SCENARIO, input)`.
- `prisma/scenarioSeed.ts` exports `seedScenario(prisma, demo)` — the body of
  today's seed, plus StageOverride rows and program activity windows.
  - `prisma/seedFoundryDemo.ts` and a new `prisma/seedAtlasSocDemo.ts` are
    thin callers.
  - Re-running replaces that scenario's program and template and nothing else.

No schema change.

## Tests

- **`foundryDemo.test.ts` unchanged** and still passing — the refactor's guard.
- **`atlasSocDemo.test.ts`:**
  - The template's stages and plan tapeout (2024-01-29) are right, and so are
    the program's actual tapeout (2024-03-25) and production end.
  - Every step and deliverable is done, on or before its actual date, and
    nothing is overdue on 2026-09-16.
  - The story's dates hold:
    - FFN post 2023-09-29
    - rejection decision 2023-10-12
    - signoff judged unreachable 2023-11-28
    - agreement 2023-12-05, which carries the four relaxations, the 50
      wafers and EVT1
    - BEOL MTO 2024-03-25
  - Every action item has an owner and a due date, and every completed one has
    evidence and a completion date.
  - Every decision is approved by someone.
  - Every link resolves: steps, risks, deliverables, milestones.
  - Die attach (ASSY-05) starts no earlier than two weeks before FAB ends in
    the actual schedule.

## Out of scope

EVT1 as its own stages or content, any change to the app's screens, and
seeding production (the PM runs the seed command).
