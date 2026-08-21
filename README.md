# AtlasPM

A semiconductor program-management tool (TPM view of an SoC program): roadmap,
per-stage boards, deliverables, risks and a program dashboard.

`reference/index.html` is the single-file prototype and the spec for this port —
see `CLAUDE.md` and `PORTING_PLAN.md`.

## Getting started

```bash
npm install
npm run db:push     # create dev.db from prisma/schema.prisma
npm run db:seed     # load the AtlasAX1 program
npm run dev         # http://localhost:3000
```

`npm run db:reset` does all three from scratch — deleting `dev.db` and
reseeding restores AtlasAX1 exactly.

The seed's kickoff is 30 weeks before the day you seed, so "today" always lands
mid-program (in Physical Design), the way the prototype boots. Deliverables are
dated across their stage rather than all on its last day, and finished ones are
stamped a few days either side of their due date, so a seeded program reads like
one that actually ran. Product
Definition is seeded full — twelve key information entries, twelve activities
and twelve open risks — so the scrolling board windows have something to show;
the other stages carry the prototype's own content.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `npm test` | Vitest — pure logic in `/src/lib` and `/src/data` |
| `npm run e2e` | Playwright — see *Testing* below |
| `npm run db:push` / `db:seed` / `db:reset` / `db:studio` | Prisma |

## Programs

The toolbar carries the program, the milestone template it runs on and the way
into editing that template. Dates are not in it: the milestone axis below shows
them positioned in time, which is where they are read and edited.

`/` lists every program as a card — progress, kickoff, Tapeout with its D-day,
open risks, overdue count and the stage in flight today. Opening a card goes to
`/p/[projectId]`, which is the program view; `‹ Programs` in the toolbar comes
back.

Creating a program asks for a name, an expected kickoff and a schedule profile.
The profiles offered are the ones in the database: the built-in `Typical SoC`,
plus any profile someone has forked by editing a program's stages.

A new program starts with **empty boards** — no key information, activities or
risks — and no leaders or contacts, because those would be someone else's
example data. What it does get is the stage scaffolding: each stage's standard
deliverables from `/src/data/journey.ts`, dated to that stage's end. Milestones
need no rows at all; they fall out of kickoff + profile offsets like every other
date in the app.

Per program the database holds kickoff, profile, schedule overrides, items,
deliverables, leaders and contacts. The stages themselves belong to the
profile, which is shared by every program on it.

## Layout

```
src/data/      the built-in profile, journey content, project seed — pure, no DOM
src/lib/       schedule math, profile→stages resolution, derivations, DB access
src/store/     Zustand stores (app state, modal state)
src/components/ UI, ported 1:1 from the prototype
src/app/       routes (/ program list, /p/[projectId] program), server actions
prisma/        schema, seed
```

Pure logic never imports UI, and `/src/lib` + `/src/data` never touch the DOM —
`tests/unit/purity.test.ts` enforces both.

## Working features beyond the prototype

- **Email export.** Envelope buttons compose a draft and hand it to the OS mail
  client. The dashboard exports a program summary; each activity, risk and key
  information row exports itself addressed to its owner, and an activity board
  exports the whole list to everyone on it. Owner addresses are matched
  best-effort against the program's leaders and contacts — `Item.owner` is free
  text, so `src/lib/people.ts` tries the full name, the short form and a
  surname. `mailto:` URLs are capped near 2 KB, so bodies are trimmed with a
  note rather than losing their tail.
- **Schedule preview.** Editing a stage date — either end of it, or the number
  of weeks between them, which moves the completion date and leaves the start
  where it is — stages the change instead of saving it. The roadmap and both gantts draw the proposal with the saved schedule
  ghosted underneath, and a bar lists every stage and milestone that moves with
  its shift in days. Apply commits, Discard reverts, a reload throws it away.
- **Stages are editable.** *Stages* in the toolbar opens the profile's stage
  list: rename, reorder, move a stage into another lifecycle band, change its
  start and length, add one, remove one. A stage that carries a milestone
  (Tapeout, First Silicon, Mass Production and the four freezes) cannot be
  removed, since the milestone is anchored to its end; removing any other stage
  says first how many board entries, deliverables and contacts go with it.
- **Editing stages is about one program.** Save applies the list to the program
  you are looking at and to nothing else: a program sharing its profile — the
  built-in one, or a template another program picked — quietly moves onto a
  private copy first, so nobody else is rescheduled by the edit. Editing again
  lands in that copy rather than breeding another. *Save as template…* is the
  other thing you might want: it publishes the same list under a name, which is
  what puts it in the toolbar select and the create-program picker for other
  programs to start from. Two profiles may not share a name, case included.
  Stage keys survive the copy, so a stage's boards, deliverables, leader and
  contacts travel with it; content on a removed stage is deleted with it, and a
  manual date edit survives only where the baseline it was made against did not
  move.
- **Stage detail editing.** Three things are edited separately, because they are
  three different things: the pencil in the Stage Details header opens that
  program's copy of the stage *text*, and the engineering list and the
  deliverables each carry their own Edit switch. A text field only becomes an
  override when it differs from the shared definition, so emptying it restores
  the default; the engineering list and its man-months are the program's own and
  pass through the text form untouched.
- **A deliverable without a date.** Adding one with the due date left blank asks
  first, and saves it as **TBD** if that is what was meant. It reads TBD on the
  board and takes a date whenever one is known. Ticking one off stamps the day
  it was finished; edit mode makes that stamp a date like any other, because a
  thing is often ticked off some days after it was done.
- **Stage panel layout.** Title, leader and dates sit beside the stage's
  drawing, which stretches to end on the dates row rather than running past it.
  The stage-details sheet is directly below them; then the boards — Activity
  down the left, key information over risk down the right — and engineering
  contacts last. The engineering table and the deliverables table are read side
  by side, so they share one window and start and end on the same lines. Below
  them, Activity runs the full height down the left (600px, then it scrolls)
  and key information and risk split that same height down the right, 60/40, so
  the three boards end level. A board shorter than its ceiling keeps *Show more*
  directly under the last entry instead of stranded at the bottom of an empty
  window.
- **One date axis, read twice.** The roadmap carries the lifecycle bands and the
  milestone diamonds across the top, positioned by date; the twelve stages are
  the concurrency chart's y-axis. Both share the same geometry and gutter, so a
  diamond sits exactly over the bar end it marks. Opening a program opens the
  stage today falls in — the lowest of them where stages overlap — and picking
  its bar again closes it.
- **The chart folds into one stage — unless it is pinned.** The pin beside the
  Concurrency caption holds the whole chart open; unpinned, move the pointer
  down out of it and the bar chart collapses to the open stage alone,
  animated, and redraws at the scale of that stage: its bar takes about 70% of
  the width, centred, with the calendar rescaled to match. What never folds is
  the date axis above — lifecycle bands, milestone diamonds, every month — so
  the top of the page still reads the whole program while the chart below reads
  one stage of it. That stage's deliverables ride on its bar as dated markers:
  the name above, the date inside the diamond, the position taken from the date
  itself, so editing a date in the sheet below moves the marker. An open
  deliverable is marked on the day it is due; a finished one moves to the day it
  was finished and fills in.
- **Dates on the diamonds.** Every mark on the axis carries its own date
  (`10/15`) inside the diamond rather than waiting for a hover — kickoff
  included, which is also where the kickoff date is edited. They are all the
  same shape and weight; the only thing that varies is the fill, and that says
  time: a date already behind us is filled, one still ahead is hollow, so the
  axis reads as a progress bar.
- **Owner picker.** An item's owner is chosen from the stage's leader and its
  engineering contacts rather than typed. It stores the short form
  (`M. Bianchi`), which keeps the Owner column consistent and lets the envelope
  button resolve an address.
- **Effort and cost.** A stage's engineering activities are a board — add,
  rename, delete, each line carrying man-months — behind that table's own edit
  mode, as are deliverable due dates. Ticking a deliverable off stays always
  available, since that is day-to-day work rather than editing the stage. The
  stage's total rides on its gantt bar, and the program's total drives an
  estimate on the program card. The rate is a program setting, edited on the
  dashboard, and defaults to 0 so no cost is invented. AtlasAX1 is seeded with
  illustrative figures — 709 MM at $15,000, about $10.6M — which are example
  content like the rest of that program, not a benchmark.
- **Dates and times.** A board row carries the day it was last updated; the
  clock time appears in *Show more*, where a thread is read in order and the
  minute matters.
- **Checkpoint labels.** On the dashboard each milestone label sits past the end
  of its bar, beside its diamond, with an arrow pointing back at it — so a label
  never lies over the schedule it annotates, at any row height.
- **Attachments.** Files and images attach while an item is being written, to
  an item that already exists, or to a status update.
  Bytes live in the database (`Attachment.data`), because the documented deploy
  target has a read-only filesystem and `Bytes` maps to BLOB on SQLite and
  bytea on Postgres. That caps a file at 5 MB — moving to object storage means
  replacing that column with a URL and nothing else. Only PNG, JPEG, GIF and
  WebP render inline; everything else, SVG included, is served as a download
  with `nosniff`, because inline user content from our own origin is an XSS
  vector.

- **One pop-up, not three screens.** *Show more* opens the board in a window
  that keeps the list at the top; opening an entry, writing a new one and
  editing an existing one all happen in the pane under it, with the row it is
  showing marked in the list. Opening a row from a cross-stage board — open
  risks, overdue, status updates — shows that row's own stage in the pane and
  leaves the list exactly where it was, page and all.

## Persistence

Prisma + SQLite locally (`DATABASE_URL=file:./dev.db`). The schema stays
Postgres-compatible: no SQLite-only types, `kind`/`profileId` are `String`
rather than enums, and ids are supplied by the caller. Switching to Postgres
means changing the `provider` in `prisma/schema.prisma` and the adapter in
`src/lib/db.ts` — no model changes.

Prisma 7 keeps the connection URL out of the schema: Migrate reads it from
`prisma.config.ts`, and `PrismaClient` gets a driver adapter.

Reads go through a server component (`src/app/page.tsx` → `getProjectState()`),
so the client store boots from the RSC payload. Writes are server actions in
`src/app/actions.ts`. The UI updates optimistically first and the action follows;
ids are minted client-side so the optimistic row and the stored row share an
identity. There is no rollback in this pass — a failed write logs loudly and
reconciles on the next load.

"Today" is applied on the client, not the server: TODAY markers and overdue
counts belong to the viewer's timezone, so the store hydrates on mount.

### Display settings follow the view

The settings panel adjusts the view it was opened from: from the program page
it offers text size, icon scale, bar thickness and milestone text; from the
dashboard it offers text size, bar thickness, milestone text and row height.
There is no Main/Dashboard switch inside the panel — the view you are in is the
scope. Each scope keeps its own values, centred on their defaults (Main
18/2×/16/11, Dashboard 16/16/13/32), so every slider starts mid-track and moves
the same distance either way.

### Where display settings live

**localStorage, not the database** (`atlaspm.display.v1`).

Text size, icon scale, bar thickness, dashboard row height and dragged column
widths are per-browser preferences. This pass has no auth, so a `DisplaySettings`
table would be global to the database — one viewer bumping the font would resize
it for everyone. The tradeoff is that settings do not follow a user across
browsers or devices, and clearing site data resets them. When auth arrives, move
them to a row keyed by user id; the stored shape is already `{ scope, json }`, so
that is a read/write swap rather than a redesign.

## Testing

```bash
npm test          # 171 unit tests: schedule engine, stages/profiles, derivations, effort, mail, purity
npm run e2e       # 240 Playwright tests
```

The e2e suite runs against its own database (`test.db`) on port 3100, so it never
touches `dev.db` or a running dev server. Every test reseeds in-process before it
runs, which is why the suite is single-worker: parallel workers would reseed out
from under each other.

Writes are optimistic and fire-and-forget, so `tests/e2e/fixtures.ts` counts the
POSTs in flight and drains them before any navigation — a reload would otherwise
cancel the action it was meant to verify.

`tests/e2e/regression.spec.ts` holds the prototype's own check list — the
measurements that rot silently: board/deliverable/contact grid alignment, the
roadmap TODAY marker sitting 0px off the gantt's today line, column drags moving
the boundary pixel for pixel and clamping at 56/420, pagination, the ESC stack
(pop-up → dashboard → inline sheets), the responsive steps at 1280/1100/900/640,
and reduced-motion.

### Comparing against the prototype

Open `reference/index.html` next to a production build (`npm run build && npm start`)
— a dev build adds Next's dev-tools badge, which is the only thing that differs.
Page geometry was verified identical at 1920/1440/1280/1100/900/640: toolbar,
roadmap, gantt, stage panel, boards and total page height all match to 0.1px.

## Deploying

Auth is out of scope for this pass, so anything deployed is world-readable and
world-writable. Put it behind access control before it holds anything real.

1. **Database.** Provision Postgres (Neon, Supabase, RDS). In
   `prisma/schema.prisma` change the datasource to `provider = "postgresql"`,
   and in `src/lib/db.ts` swap `PrismaBetterSqlite3` for
   `@prisma/adapter-pg`. No model changes are needed.
2. **Migrations.** Local dev uses `prisma db push`, which is fine for a schema
   that is still moving. Before the first deploy, cut a baseline migration
   (`prisma migrate dev --name init`) and run `prisma migrate deploy` on release
   so production schema changes are reviewable and repeatable.
3. **Environment.** Set `DATABASE_URL`. Nothing else is required.
4. **Seed.** Run `prisma db seed` once against the new database, or write a real
   project through the UI. The seed's kickoff is relative to the day it runs.
5. **Vercel.** `npm run build` and `npm start` are the standard commands. The
   `/` route is `force-dynamic` because it reads the database on every request,
   so it will not be prerendered at build time.

### Known accessibility gaps

Lighthouse on a production build: performance 97, accessibility 92,
best practices 100, SEO 100. Two accessibility failures remain, both inherited
from the prototype's design rather than from the port, and both needing a design
decision rather than a code fix:

- **Colour contrast** — `--ink-3` (`#898781`) on `--page` (`#f9f9f7`) is 3.4:1
  where WCAG AA wants 4.5:1. It is the colour of every caption, column header
  and secondary date in the app. `#767471` would reach 4.42:1 and `#6f6d69`
  4.90:1, at the cost of a visibly darker secondary layer.
- **Touch target size** — deliverable checkboxes are 16×16 where the mobile
  guidance is 24×24.

Fixed during the port, since neither changes anything on screen: `role="tabpanel"`
moved off `<article>` (ARIA does not allow it there), and roadmap stations now
carry their visible text inside their accessible name (WCAG 2.5.3).
