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

## Phase V2-1 — Data model

Decide the shape before writing any of it. The prototype has four things that are
the same thing — a post with a body, attachments and replies — and the app already
has `Item`, `StatusUpdate` and `Attachment`. Choose between:

- **(a) one `Post` model** with a polymorphic target (step / deliverable / stage note)
  plus `parentId` for replies, folding `StatusUpdate` into it; or
- **(b) extend what is there** — `StatusUpdate` gains a parent and new foreign keys.

(a) is the prototype's own model and makes the four screens one renderer. (b) is a
smaller migration. Write the decision and the reason into this file before coding.

Also needed: `StepState` (activity ref + step number + project → done, doneAt, pct,
owner, dueOverride), and a `Note` model unless notes become `Item(kind:"keyinfo")`
with a body and attachments, which they nearly are already.

- **Accept:** migration applies to a copy of the seeded database; `npm test` green;
  no UI yet.

## Phase V2-2 — Pure logic, tests first

Port from the prototype, do not reinvent: `stepDueDate` / `stepLate` / `stepDoneAt`,
`allOverdue`, risk derivation from flagged posts, `delivStatus` including **Delayed**,
`delivStep`, the stage dashboard's pace figures, and the Overview `attention()`
ladder (Overdue → Due soon → Stale risk, with the mask-order bonus scoped inside a
band so it never promotes across one).

- **Accept:** Vitest covers each; `/lib` and `/data` still import no DOM.

## Phase V2-3 — Shell and navigation

Left nav, routed views, the right rail. Nothing else moves until this exists,
because every later phase renders into it.

- **Accept (Playwright):** each nav entry routes; the rail follows the selection and
  clears on navigation; deep links (`/p/:id/stage/:key/:tab`) restore the view.

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
that nothing renders any more.

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
