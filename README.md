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

## Layout

```
src/data/      schedule profiles, journey content, project seed — pure, no DOM
src/lib/       schedule math, derivations, DB access, DB↔store mapping
src/store/     Zustand stores (app state, modal state)
src/components/ UI, ported 1:1 from the prototype
src/app/       route, server actions
prisma/        schema, seed
```

Pure logic never imports UI, and `/src/lib` + `/src/data` never touch the DOM —
`tests/unit/purity.test.ts` enforces both.

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
npm test          # 76 unit tests: schedule engine, derivations, purity guard
npm run e2e       # 73 Playwright tests
```

The e2e suite runs against its own database (`test.db`) on port 3100, so it never
touches `dev.db` or a running dev server. Every test reseeds in-process before it
runs, which is why the suite is single-worker: parallel workers would reseed out
from under each other.
