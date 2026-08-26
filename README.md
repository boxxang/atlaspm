# AtlasPM

A semiconductor program-management tool (TPM view of an SoC program): roadmap,
per-stage boards, deliverables, risks and a program dashboard.

`reference/index.html` is the single-file prototype and the spec for this port —
see `CLAUDE.md` and `PORTING_PLAN.md`.

## Getting started

Postgres, the same engine the deployed app runs on:

```bash
brew install postgresql@17 && brew services start postgresql@17
createdb atlaspm_dev && createdb atlaspm_test
cp .env.example .env          # point DATABASE_URL at atlaspm_dev

npm install
npm run db:push     # create the schema from prisma/schema.prisma
npm run db:seed     # load the AtlasAX1 program
npm run dev         # http://localhost:3000
```

`npm run db:reset` pushes and reseeds — AtlasAX1 comes back exactly as it was.

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
- **Activity detail.** An engineering activity that has been written up opens a
  page of its own at `/p/<id>/activity/<ref>` — why it exists, the steps it runs
  in two lanes, what it needs and produces, who is on it, what to watch, and the
  activities either side of it. Product Definition (DEF-01…09) is written; the
  rest are not, and their rows stay plain text rather than pretending to lead
  somewhere. The write-up is authored elsewhere and exported into
  `/data/activityDetails.ts`; the numbers on the page come from the programme's
  own engineering table, and the weeks are resolved against its kickoff.
- **The stage timeline.** A stage read as a schedule rather than as two
  tables, spanning both of them, with the tables under it. The engineering
  list is bars and each deliverable is a diamond on the bar of the activity
  that produces it — because what a stage timeline is asked to show is not
  that an artefact is due, but what has to finish for it to exist.
  Every stage states its plan in /data/journey: `engineeringStart` (weeks
  from the stage start to each activity's own start), `deliverableFrom`
  (which activity produces each artefact) and `deliverableWeek` (the week it
  is due, which is the week that activity finishes). So both ends of every bar
  are recorded rather than guessed, and the seed and every new program date
  their deliverables from it. A stage given no plan still charts, from the
  order of its list — a guess, and the note above the chart says so.
- **The toolbar's three dates.** Kick-off, MTO and MP read beside the program
  name. The milestone axis below carries every checkpoint positioned in time,
  which is where to read the shape of a schedule and the wrong place to answer
  "when is tapeout" from across a room. They give way in order as the bar
  tightens — mass production first, kick-off last, being what the rest are
  counted from.
- **A stage ends on the artefact it ends with.** The last key deliverable of a
  stage falls on the day that stage closes, exactly: the gate reviews the
  closing artefact, so a stage that ends before it is a schedule nobody can
  work to. The rest of the list carries a few days of drift; that one does not.
- **An activity is work towards something.** Writing one names the key
  deliverable it is for, and the Activity board can then be read one
  deliverable at a time — which is the question a review opens with, not "show
  me every task". Opened, the board leads with that reference as its first
  column and filters on it there too; on the page there is no room for a
  column that would be the title's. Across stages there is no column at all:
  a reference belongs to a stage, and the same one means two different things
  in two of them. A deliverable is deleted without taking that record of the
  work with it (`SetNull`, not `Cascade`).
- **Potential risks** open over the page rather than inside it: the checklist
  is a reference you consult against the risk board, and the inline panel
  covered the board while you read it.
- **The delivery record.** A key deliverable is not completed by ticking a box:
  ticking says a thing was done, and the artefact *is* the thing. Its record —
  the development history, and the file that came out of it — is filed from the
  paperclip beside its title, and the tick follows whether an artefact is
  attached. Filing one with nothing attached leaves it open; removing the last
  artefact re-opens it. Seeded completions predate the record and keep their
  tick; the rule governs what is filed from here on. A completed row carries a
  clip that opens its artefact straight from the page, and its title reads the
  record back — months later the question is never "was it ticked" but "what
  was delivered, and what happened on the way". A filed record opens as a
  record: read, and reopened for changes with the pencil. The table's own Edit
  button opens one ready to be changed, title included.
- **Attachments.** Files and images attach while an item is being written, to
  an item that already exists (behind its Edit button, with every other change
  to the entry), or to a status update. An entry that carries files says so on
  the board with a clip beside its title.
  Bytes live in the database (`Attachment.data`, a `bytea`), because the deploy
  target has a read-only filesystem and instances that do not outlive a
  request. That caps a file at 5 MB — moving to object storage means replacing
  that column with a URL and nothing else. Only PNG, JPEG, GIF and
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

Prisma + Postgres, in development, in the e2e suite and deployed.

It was SQLite locally and Postgres in production until the app was deployed,
which does not work: Prisma fixes `provider` at generate time and will not read
it from the environment, so the two cannot share a schema — and a suite that
runs on a different engine from the one it ships on is not testing the thing it
ships. One engine everywhere costs a `brew install` and settles both.

The models never needed changing for the move: no engine-specific types,
`kind`/`profileId` are `String` rather than enums, ids are supplied by the
caller, and attachment bytes were already a `Bytes` column rather than a file
on disk. The whole change was the `provider`, the driver adapter in
`src/lib/db.ts`, and the connection strings.

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
npm test          # 173 unit tests: schedule engine, stages/profiles, derivations, effort, mail, purity
npm run e2e       # 266 Playwright tests
```

The e2e suite runs against its own database (`atlaspm_test`) on port 3100, so it
never touches the development one or a running dev server. `TEST_DATABASE_URL`
overrides it for CI. Every test reseeds in-process before it runs, which is why
the suite is single-worker: parallel workers would reseed out from under each
other.

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
