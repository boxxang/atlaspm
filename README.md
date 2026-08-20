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
mid-program (in Physical Design), the way the prototype boots.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `npm test` | Vitest — pure logic in `/src/lib` and `/src/data` |
| `npm run e2e` | Playwright — see *Testing* below |
| `npm run db:push` / `db:seed` / `db:reset` / `db:studio` | Prisma |

## Programs

`/` lists every program as a card — progress, kickoff, Tapeout with its D-day,
open risks, overdue count and the stage in flight today. Opening a card goes to
`/p/[projectId]`, which is the program view; `‹ Programs` in the toolbar comes
back.

Creating a program asks for a name, an expected kickoff and a schedule profile.
Only `typicalSoC` is modelled, so the other three profiles are listed disabled
exactly as the prototype lists them — adding a real one means adding its stage
offsets and durations to `src/data/scheduleProfiles.ts`, nothing more.

A new program starts with **empty boards** — no key information, activities or
risks — and no leaders or contacts, because those would be someone else's
example data. What it does get is the stage scaffolding: each stage's standard
deliverables from `/src/data/journey.ts`, dated to that stage's end. Milestones
need no rows at all; they fall out of kickoff + profile offsets like every other
date in the app.

Every stage definition is shared across programs (they live in code). Per
program the database holds only kickoff, profile, schedule overrides, items,
deliverables, leaders and contacts.

## Layout

```
src/data/      schedule profiles, journey content, project seed — pure, no DOM
src/lib/       schedule math, derivations, DB access, DB↔store mapping
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
- **Schedule preview.** Editing a stage date stages the change instead of saving
  it. The roadmap and both gantts draw the proposal with the saved schedule
  ghosted underneath, and a bar lists every stage and milestone that moves with
  its shift in days. Apply commits, Discard reverts, a reload throws it away.
- **Stage detail editing.** The pencil in the Stage Details header edits that
  program's copy of the stage text. A field only becomes an override when it
  differs from the shared definition, so emptying it restores the default.
- **One date axis, read twice.** The roadmap carries the lifecycle bands and the
  milestone diamonds across the top, positioned by date; the twelve stages are
  the concurrency chart's y-axis. Both share the same geometry and gutter, so a
  diamond sits exactly over the bar end it marks. Nothing is open until you pick
  a bar; picking it again closes it.
- **Owner picker.** An item's owner is chosen from the stage's leader and its
  engineering contacts rather than typed. It stores the short form
  (`M. Bianchi`), which keeps the Owner column consistent and lets the envelope
  button resolve an address.
- **Effort and cost.** A stage's engineering activities are a board — add,
  rename, delete, each line carrying man-months — behind the sheet's edit mode,
  as are deliverable due dates. Ticking a deliverable off stays always
  available, since that is day-to-day work rather than editing the stage. The
  stage's total rides on its gantt bar, and the program's total drives an
  estimate on the program card. The rate is a program setting, edited on the
  dashboard, and defaults to 0 so no cost is invented. AtlasAX1 is seeded with
  illustrative figures — 709 MM at $15,000, about $10.6M — which are example
  content like the rest of that program, not a benchmark.
- **Attachments.** Files and images attach to an item or to a status update.
  Bytes live in the database (`Attachment.data`), because the documented deploy
  target has a read-only filesystem and `Bytes` maps to BLOB on SQLite and
  bytea on Postgres. That caps a file at 5 MB — moving to object storage means
  replacing that column with a URL and nothing else. Only PNG, JPEG, GIF and
  WebP render inline; everything else, SVG included, is served as a download
  with `nosniff`, because inline user content from our own origin is an XSS
  vector.

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
npm test          # 136 unit tests: schedule engine, derivations, effort, mail, purity
npm run e2e       # 188 Playwright tests
```

The e2e suite runs against its own database (`test.db`) on port 3100, so it never
touches `dev.db` or a running dev server. Every test reseeds in-process before it
runs, which is why the suite is single-worker: parallel workers would reseed out
from under each other.

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
