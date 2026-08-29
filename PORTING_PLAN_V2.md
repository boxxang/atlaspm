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

## Phase V2-4 — The stage page — **done** (steps; posts pending)

The activity table, the indented step block inside the open activity, and the
step panel in the rail: progress, owner, due and completed dates, and outputs.

**The browser needed the steps.** They were content — a megabyte of prose in
`/data/activityDetails.ts`, server-only — and nothing about them was answerable
in a browser. Now they carry state, so the generator emits a third module,
`/data/activitySteps.ts`: 1,649 steps across 257 activities, 250 KB, tuples
rather than objects because at that count the key names cost more than the
content. `fromStepIndex` in `/lib/steps.ts` is where the wire shape ends.

**An attachment gained a `projectId`.** The other three targets carry the
programme implicitly — through the item, post or deliverable they hang off. An
output attached to a step has no such row: "PD-10 step 2" names a step of every
programme on the profile at once. Without the column, one programme's evidence
showed on another's step. There is an e2e check for exactly that.

Other decisions:

- **`StepState.id` is minted by the database**, unlike every other id in the
  schema. A step is addressed by (projectId, activityRef, stepN), which the
  client already knows, so there is no optimistic row to keep an id in step with.
- **The panel writes straight through**, with no Save button. A percentage, an
  owner and a date are what a TPM corrects in passing.
- **Attaching an output completes the step** and stamps the day it arrived;
  removing the last one reopens it. The date stays editable, because work
  finished last week and filed today should say last week.
- **A step's key deliverables show on the release step only** — the last one.
  The steps before it produce outputs, not deliverables.

- **Accept:** ✅ 19 checks in `tests/e2e/steps.spec.ts`, covering all four
  criteria.

Still to come on this page, with the phases that own them: the dashboard band
(V2-7's figures), and the other six tabs (V2-5 risks, V2-6 the rest). The posts
on a step — the update thread and the risk flag — land in V2-5, which is where
the risk redefinition is.

## Phase V2-5 — Risks, Overdue, Activities — **done**

The three cross-programme pages, and the risk redefinition.

**Not a migration.** The plan said "the risk redefinition with its migration",
meaning the 23 seeded `Item(kind:'risk')` rows would be matched to the steps
their titles echo, as the prototype does. Matching prose to steps is guesswork,
and a risk on the wrong step is worse than no risk. So the V2 risks are written
instead — one per stage in `/data/riskSeeds.ts` — and raised on the step where
the work actually stopped, which means the Risks board and the Overdue board
point at the same activities and explain each other.

The old rows stay for now. They are `Item`, the new ones are `Post`; the two do
not collide, V1 still renders the old board, and both go with `/classic`.

Other decisions:

- **One resolver.** `useProgramWork` resolves every activity's steps once; the
  nav badge and both boards read it, so a count and its page cannot disagree.
  There is a test that reads the badge and counts the rows.
- **Risks are ordered longest-unanswered first**, not newest first. The resolver
  returns newest-first, which is right for a thread and wrong for a list of what
  needs answering.
- **No stage column on either board.** Every row carries its activity reference
  and the reference says which stage — a column repeating it is noise. Headings
  centred over the short columns, left over the one that reads as a sentence.
- **Replies sit indented under the risk they answer**, because how a risk was
  argued down is the part worth reading.

- **Accept:** ✅ 13 checks in `tests/e2e/boards.spec.ts`, including "a risk drops
  off the moment its step is handed over" and the badge/page agreement.

## Phase V2-6 — Key info, deliverables, team — **done**

The notes board, the handover flow, team add/edit — and the post write path all
three needed, which V2-4 had deferred.

**`Post` gained `stageId`.** It could point at an item, a step or a deliverable,
and a key-info note is about none of those: it belongs to the stage. The plan
already said a note was a post on a stage; there was no column for the stage.

**The handover rule grew a third half.** `handoverComplete` was a body and an
attachment; it is now a body, an attachment **and a date it was accepted**. A
handover without a date is a record of what was sent, not a claim that it is
finished — and the schema had said exactly that on `Post.doneAt` since V2-1.
The old two-field rule survives as `recordComplete` while `/classic` still files
delivery records that way.

**A deliverable's stored `done` follows its handover.** The flag is derived, but
it is also a column the progress figures and the V1 page read. `syncHandoverDone`
derives it in one place and writes it there, so the two cannot disagree.

Other decisions:

- **One `PostThread` for all four surfaces.** They differ only in which target
  they hand it. Replies do not nest: one indent, no argument about the second.
- **Editing sends the text, not the post.** Spreading a stored post back at the
  server hands Prisma an `attachments` array and a `createdAt` it has no columns
  for — and the write fails behind an optimistic update that already showed the
  new wording, which is the worst shape a bug can take. Found by a test.
- **The stage lead is listed with everyone else** on the Team tab, marked rather
  than duplicated. The question the tab answers is "who do I talk to", and a
  separate box for the lead makes that two questions.

- **Accept:** ✅ 9 checks in `tests/e2e/posts.spec.ts` and 12 in
  `tests/e2e/handover.spec.ts`, covering all three criteria plus "Delayed is not
  Overdue".

## Phase V2-7 — Overview and timeline — **done**

*Needs you today*, the stat row, in-flight stages, the effort split, and the
timeline with checkpoints on their stage bars and row height as a setting.

**The rail selection travels in the URL.** The Overview's rows open the work
they are about, and setting the rail before navigating is a race the shell's
clear-on-navigation always wins. So a row links to `?step=PD-10:2` or
`?deliverable=…` and the stage page reads it — which also makes the link one
somebody can send.

**A deliverable row goes to the step that hands it over**, not to the
deliverables list: the thing to do about a late deliverable is the work that
produces it. Only one nobody produces falls back to the list.

**Checkpoint labels never flip.** Flipping them left near the right edge put
them straight back over their own bar — a checkpoint sits at its stage's *end*,
so everything to the left of it is that bar. They always flow right and the
chart reserves a tail for them. There is a test that measures the overlap at
every row height.

**Nothing is capped.** The prototype's per-tag limit meant that with seventeen
things overdue, thirteen were missing from the one list that says what to
answer. The list scrolls, and a test checks every overdue step is on it.

- **Accept:** ✅ 14 checks in `tests/e2e/overview.spec.ts`, covering all three
  criteria.

## Phase V2-8 — Sweep — **done**

The V1 page and everything only it rendered are gone: `/p/:id/classic`,
`AppShell`, `Toolbar`, `Roadmap`, `StagePanel`, `BoardModal`, `Dashboard`,
`Board`, `Bottlenecks`, `Gantt`, `StageGantt`, `SchedulePreview`,
`StageEditor`, `DeliveryRecord`, `Contacts`, `ItemView`, `Deliverables`,
`PotentialRisks`, `SettingsPopover`, `InlineArea`, `MailButton`,
`OwnerSelect`, `ColGrip`, `WrapToggle`, `Popover`, `ProjectName`, `Tooltip`,
`Attachments`, and `recordComplete`, which had no caller once `/classic` went.
`src/components` holds the program list, the activity write-up, and `shell/`.

The prototype's palette moved to `:root`. What is left of the reference block is
only what the two surviving V1-era screens still read.

**The program card was still answering with V1's arithmetic** — 23 open risks
and 7 overdue, against the shell's 6 and 12, for the same two words. It counts
`Post(kind:'risk')` on open steps and late steps now, so a card and the program
inside it cannot disagree.

### What the deletion cost

Seventeen e2e specs went with their screens: ~250 checks down to 93. Deliberate,
and agreed — the alternative was porting tests for screens that were about to be
deleted. What is now **uncovered** and was not before:

- schedule editing (dragging a stage date, the ripple, apply/discard);
- stage editing (adding, deleting, reordering; profile forking);
- the effort and cost editors;
- display settings (text size, icon scale, column widths);
- mail drafts;
- the concurrency chart and its folding behaviour.

Most of those have **no screen in the shell at all** yet, so the gap is a
missing feature rather than a missing test. `programs.spec.ts` was rewritten to
cover what the program list still does; `activity.spec.ts` replaces the V1 spec
for the write-up page, which survived.

## Decisions made

- **Overdue counts steps, and only steps.** The prototype's sidebar counts late
  steps while its Overview card counts late steps *and* late deliverables, which
  made the same word mean two things on one screen. Overdue is a step past its
  due date with nothing handed over; a key deliverable past its date is
  **Delayed**, which is a different word for a different thing and already has
  one. Every count in the app reads `allOverdue`.
- **The accent is the prototype's indigo (`#5b5bd6`), everywhere.** Not scoped:
  `:root` carries it, along with `--accent-soft` and `--risk`, and CLAUDE.md
  names them. The rest of the prototype's theme — white ground, its greys — is
  still on `.pshell` because `/classic` is on the reference's warm one, and that
  half moves to `:root` when the route goes.
- **Ownership of a step** picks from the programme's people and shows
  `Unassigned` otherwise. The template's lead *role* is a different field and is
  shown under its own heading, never under OWNER.

## Decisions still open

- **PDFs inline.** `/api/attachments/[id]` serves only raster images inline and
  downloads everything else, on purpose — inline user content from our own origin is
  an XSS hole. Opening a PDF in the browser needs a separate origin or signed
  storage URLs. Decide before promising "the clip opens the file".

## Do not port

- Attachment metadata without bytes. The prototype records a file's name and size
  because localStorage cannot hold it; the app has `Attachment.data` and a route
  that serves it.

### Reversed: the stalled activities

This list used to say the prototype's six deliberately-stalled activities were a
demo device the app must not ship. The user asked for them, and they were right
to: a seeded programme with no step state reads as 0 of 1,649 done with every
past-due step overdue, which is not a programme anybody recognises — and one
where nothing has ever slipped is not one either.

So `/lib/stepSeed.ts` ports it, with two corrections to the prototype's version:

- **Finished work is a prefix, not a filter.** "Its window has closed" is not
  monotonic in step number — a parallel step starts where the main step before it
  started, so it can end after the main step that follows. Filtering on the date
  alone finished step 5 while step 4 was still open, which is the exact shape the
  prototype had to be fixed out of. Caught by a test over all 257 activities.
- **A limit of none means none.** `pickStalls` checked its limit after pushing,
  so asking for zero stalls still produced one.

Seeded today: 1,039 steps done, 12 left late across 6 stages, closed stages 100%
and future stages untouched.
