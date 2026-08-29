# AtlasPM Porting Plan V2 — design-canvas/atlaspm-prototype.html → the app

`PORTING_PLAN.md` took `reference/index.html` into Next.js + Prisma and finished.
This plan takes the app the rest of the way to the working prototype, which is now
the spec.

Same discipline as V1: one phase per session, `/clear` between phases, pure logic
gets its unit tests before the UI that uses it, each phase ends with its acceptance
criteria green and a commit.

Open the prototype and **use** the screen before you change its counterpart. Serve
the directory — Chrome will not open it over `file://`.

---

## The shape of the gap

This is not a set of feature deltas on the app's existing screens. The prototype
has a different information architecture:

| | app today | prototype |
|---|---|---|
| shell | Toolbar + Roadmap strip + a list of StagePanels, with a Main\|Dashboard toggle | left nav + one routed view at a time + a right rail that follows the selection |
| a stage | an inline panel in a long scrolling list | its own page: dashboard band + seven tabs |
| aggregates | modal boards (Open Risks / Overdue / Status Updates) | first-class pages in the nav |

So the port is mostly **new screens inside a new shell**, not edits to old ones.
Budget accordingly: the shell and the stage page are the bulk of it.

### Screen by screen

| prototype view | app counterpart | verdict |
|---|---|---|
| Programs | `ProjectList` (`/`) | **keep** — close enough |
| Activity write-up | `ActivityDetailView` (`/p/…/activity/…`) | **keep** — already matches |
| Overview | `Dashboard` + `Bottlenecks` | **rework** — stat row and effort split survive; *Needs you today*, the schedule chart and *In flight today* are new |
| Timeline | `Gantt` / `StageGantt` | **rework** — checkpoints ride their own stage bar, row height is a setting |
| Stages | — | **new** (STARTS / DUE / COMPLETE) |
| Stage page (7 tabs) | `StagePanel` inline | **new shape** — the biggest single item |
| Risks | aggregate board in `BoardModal` | **new** — headed table, ranked, filter chips |
| Overdue | aggregate board in `BoardModal` | **new** — and it now means *steps*, not items |
| Activities | — | **new** (grouped by stage) |
| Deliverables | `Deliverables` (per stage) | **rework** — grouping, Delayed, handover |
| Updates | aggregate board | **rework** — posts carry replies |
| Team | `Contacts` (per stage) | **rework** — add/edit people |

### State the app has nowhere to put

- **Step state** — done, percent, owner, due, completed, outputs, posts. Steps are
  static content today (`/data/activityDetails.ts`, generated, server-only).
- **Posts with attachments and replies** — on steps, as risks, as key-info notes, as
  deliverable handovers. One shape, four uses.
- **Notes** — the key-info board: body, attachments, edits.
- **Deliverable handover** — body + attachments + completion date + comments.
- **Team edits** — people added and corrected per stage.
- **Display settings** — timeline row height, column widths.

### Four redefinitions, not additions

These change what existing data *means*, so they land before the screens that read
them:

1. **A risk is a flag on a step**, not `Item(kind:"risk")`. Read by the sidebar
   count, the overview, timeline colours, bottlenecks.
2. **Overdue is a step past its due date**, not an item past its target date.
3. **A deliverable is completed by a handover**, not by a tick.
4. **A step's due date is editable** and defaults to the schedule's own end for it,
   so the schedule engine gains an override surface it did not have.

---

## Phase V2-1 — Data model — **done** (`ed5308d`)

**Decision: (a), one `Post` model.** `StatusUpdate` is folded into it. `kind` carries
`update | risk | note | handover | reply` — a discriminator rather than four booleans
or four tables — and the target is whichever of `itemId`, `deliverableId` or
`activityRef` + `stepN` applies. `parentId` nests a reply under what it answers.
`Attachment` hangs off a post rather than off a status update, and carries
`activityRef`/`stepN` for an output attached straight to a step.

The reason for (a) over (b): the prototype renders one post, one reply thread and one
attachment strip in four screens. Under (b) those would be four shapes that merely
look alike, and every screen would have to know which it was holding.

`StepState` addresses a step by `activityRef` + `stepN` within a project, not by a row
id, because steps are content — they live in `/data/activityDetails.ts` and have no
rows. Renumbering an activity must not silently move somebody's completion onto a
different step, so the address is the one the write-ups use.

Notes did **not** get a model. A key-info note is `Post(kind:"note")` on a stage; the
board is a list of posts, which is what it looks like.

The TypeScript layer still says `StatusUpdate`/`updates` on the item-board path. The
tables are the expensive thing to change later, so they went first; the names get
corrected when V2-5/6 rewrite those screens.

- **Accept:** ✅ schema pushed and reseeded; 221 unit and 272 e2e green.

## Phase V2-2 — Pure logic, tests first — **done**

Five modules, ported rather than reinvented:

| module | what it settles |
|---|---|
| `/lib/steps.ts` | `plannedSteps` (parallel lanes included), `resolveSteps`, `isStepLate`, `stageDoneAt`, `activityState`, `allOverdue` |
| `/lib/risks.ts` | a risk is a flagged post on a step, open while that step is |
| `/lib/deliverableStatus.ts` | Completed → **Delayed** → In progress → Not started; `deliverableStep`; `handoverComplete` |
| `/lib/attention.ts` | the Overdue → Due soon → Stale risk ladder, banded so tapeout never promotes across one |
| `/lib/stagePace.ts` | steps done against window spent, and the verdict on the gap |

Each returns plain data — a `kind` and its numbers, never a colour or a label the
component should own. The colours stayed with the components.

- **Accept:** ✅ 309 unit tests (was 221); `/lib` and `/data` still import no DOM.

## Phase V2-3 — Shell and navigation — **done**

Left nav, routed views, the right rail — `.pshell` is a three-column grid, and
every later phase renders a view into the middle of it.

**Built beside the V1 page, not on top of it.** The V1 program page moved to
`/p/:id/classic` and the shell took `/p/:id`. Replacing it outright would have
turned 272 passing e2e tests red for five phases — exactly while the riskiest
work happens — for screens that had not been replaced yet. So the V1 route stays
until its screens genuinely go, and its specs stay green as the regression net.
Program cards still open `/classic`; V2-8 drops the suffix and deletes the route.

Other decisions:

- **The tab is in the URL** (`/p/:id/stage/:key/:tab`), which the prototype does
  not do — its hash carries only the stage. A tab is where you are, so a link
  should reopen it. The list lives in `/lib/stageTabs.ts` rather than in the
  component, because the route validates the segment on the server; an unknown
  tab redirects to the default rather than 404ing, since the stage is real.
- **The prototype's palette is scoped to `.pshell`**, not `:root`. It differs
  from the reference — indigo `#5b5bd6` rather than blue `#256abf`, white ground
  rather than warm — and `/classic` is still the reference's. Custom properties
  inherit, so both are true at once. The block moves to `:root` when `/classic`
  goes.
- **The rail's selection is its own store**, not view state: every screen picks
  into the same slot, and it clears on navigation because a step picked on one
  screen is not selected on the next.
- **Risks and Overdue carry no count yet**, and the Stages list has no COMPLETE
  column. Both are derived from step state, which does not reach the browser
  until V2-4 ships the step index. A missing number says "not counted yet"; a
  zero would be a claim.

- **Accept:** ✅ 14 shell checks in `tests/e2e/shell.spec.ts`; the V1 suite still
  green (286 e2e total).

## Phase V2-4 — The stage page

Dashboard band, seven tabs, the step table with its indented open block, the step
panel in the rail (progress, owner, due/completed, outputs, updates).

- **Accept (Playwright):** opening a step selects it and only it; attaching an output
  completes the step and stamps the upload date; the completion date is editable
  afterwards; the deliverables a step hands over appear in its rail.

## Phase V2-5 — Risks, Overdue, Activities

The three cross-programme pages, and the risk redefinition with its migration.

- **Accept:** the sidebar count, the stage tab badge and the page agree; a step
  flagged as a risk appears within one render; a completed step drops its flag.

## Phase V2-6 — Key info, deliverables, team

The notes board, the handover flow, team add/edit.

- **Accept (Playwright):** a deliverable cannot be completed without a body and an
  attachment; the clip opens the file from `/api/attachments/:id`; removing the
  last attachment reopens the deliverable.

## Phase V2-7 — Overview and timeline

`Needs you today`, the schedule chart, checkpoints on their stage bars, row height.

- **Accept:** every row of *Needs you today* goes somewhere; no item is hidden from
  it; checkpoint labels never overlap at any row height.

## Phase V2-8 — Sweep

Side-by-side against the prototype, screen by screen. Delete what V1 left behind
that nothing renders any more. Specifically:

- delete `/p/[projectId]/classic` and `AppShell`, `Toolbar`, `Roadmap`,
  `StagePanel`, `BoardModal` and anything only they render;
- drop `/classic` from `ProjectList`'s card link and its create-and-open push,
  and from `ActivityDetailView`'s back link;
- move the `.pshell` token block to `:root` and delete the reference palette;
- delete the V1 specs whose screens have gone, and `SEED_PROJECT_PATH` with
  them.

---

## Decisions still open

- **Overdue's scope.** The prototype's sidebar counts late *steps* (10); the Overview
  card counts late steps *and* late deliverables (17). Deliberate there, probably
  wrong here. Pick one.
- **PDFs inline.** `/api/attachments/[id]` serves only raster images inline and
  downloads everything else, on purpose — inline user content from our own origin is
  an XSS hole. Opening a PDF in the browser needs a separate origin or signed
  storage URLs. Decide before promising "the clip opens the file".
- **Ownership of a step.** The prototype picks from the programme's people and shows
  `Unassigned` otherwise. The template's lead *role* is a different field and must
  not be shown in a column headed OWNER.

## Do not port

- The prototype's seeding leaves six activities deliberately stalled so the Overdue
  list is not empty on a demo. It is a demo device. The app must not ship it.
- Attachment metadata without bytes. The prototype records a file's name and size
  because localStorage cannot hold it; the app has `Attachment.data` and a route
  that serves it.
