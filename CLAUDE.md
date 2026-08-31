# AtlasPM — Next.js Port

AtlasPM is a semiconductor program-management web app (TPM tool). A fully working
single-file prototype lives at `design-canvas/atlaspm-prototype.html` — **it is the
spec.** Every behavior, layout and interaction in it must survive unless
`PORTING_PLAN_V2.md` says otherwise.

`reference/index.html` was the spec for the original port and the app matches it.
It is now history: the prototype has gone well past it, and where the two disagree
the prototype wins. Do not port from `reference/index.html` again.

The prototype is generated. Edit `design-canvas/proto/app.template.html`, then run
`node design-canvas/proto/build.mjs`, which pours the three JSON payloads into it
and writes `atlaspm-prototype.html`. Editing the built file is silently lost. To
open it in a browser, serve the directory — Chrome refuses `file://` for this.

## Working rules

- Follow `PORTING_PLAN_V2.md` phase by phase. Do not start a phase before the
  previous one's acceptance criteria pass. One commit (or a few) per phase.
  `PORTING_PLAN.md` covers the original port and is finished; keep it for history.
- Before writing code in any phase, open the prototype and use the screen you are
  about to change. It is the only place the intended behaviour is complete, and
  reading its source is not the same as watching what it does.
- Pure logic (schedule calculator, date-edit ripple, progress/overdue derivations)
  gets unit tests BEFORE the UI that uses it.
- Never put schedule assumptions, seed content, or date math inside components.
  UI renders data; data never imports UI.
- Keep the visual language: light documentation theme, design tokens as CSS
  variables (they are all in `:root` of the reference), system font stacks,
  single accent #5b5bd6, risk #e5484d — the prototype's, not the reference's,
  because the prototype is the spec. The rest of the prototype's palette (white
  ground, its greys) is scoped to `.pshell` while `/p/:id/classic` still renders
  the reference's warm theme; it moves to `:root` when that route goes. Do not
  introduce a component library.
- All dates display as MM/DD/YYYY via one shared formatter. All user-facing text
  is English.

## Stack

- Next.js (App Router) + TypeScript + Tailwind (tokens mapped from the reference
  `:root` variables into CSS custom properties, not Tailwind theme colors only).
- State: Zustand store mirroring the prototype's `state` + `userContent` shapes.
- Persistence: Prisma + Postgres everywhere — development, the e2e suite and
  the deployed app. Prisma fixes `provider` at generate time and will not read
  it from the environment, so there is no second engine to keep in step. Mutations via server actions; reads via server
  components where natural. Optimistic UI on board/deliverable mutations.
- Tests: Vitest for /lib, Playwright for e2e (port the checks listed in
  PORTING_PLAN Phase 7).

## Domain model (from the prototype)

- Profile { id, name, builtin, template } with ProfileStage { key, order, title,
  shortTitle, phaseId, baseKey, startOffsetWeeks, durationWeeks } — the stages a
  program runs on. The built-in profile (`typicalSoC`) is seeded from
  `/data/scheduleProfiles.ts` and stays immutable. Editing a program's stages
  applies to THAT program: if it shares its profile, it moves onto a private
  copy (`template: false`, not offered in the pickers) so nobody else is
  rescheduled. `template: true` is a profile published to start programs from,
  and profile names are unique. `baseKey` points at the built-in stage whose
  text and drawing the stage shows; a stage someone added points at nothing and
  starts blank.
- Project { id, name, kickoff, profileId }
- StageOverride { stageId, startOffsetWeeks, durationWeeks } — the only
  PER-PROGRAM schedule mutation surface. Baselines are edited in the profile,
  which is a different thing: it changes every program on that profile, which is
  why editing forks.
- Item { id, stageId, kind: keyinfo|activity|risk, title, body, owner, due?,
  done, updatedAt } with StatusUpdate { id, itemId, text, createdAt } children.
- Deliverable { id, stageId, title, due?, done, completedAt? }
- Leader { stageId, name, phone, email } / Contact { id, stageId, name, role,
  email, phone }
- DisplaySettings { scope: main|dash, json } and board column widths — persist
  per user/browser (a settings table or localStorage is acceptable here; decide
  in Phase 6 and note the tradeoff).

Which stages exist is a property of a program's profile, never of the code:
`StageId` is a plain string, `/lib/stages.ts` resolves a profile into the
`Stage[]` the UI reads, and every per-stage map is built by walking that list in
order. Components read `useAppStore(s => s.stages)`; `journeyData` is content
that stages inherit, not the list of them.

## What the prototype changed (and the app does not have yet)

Most of these redefine things the app already stores, so they are not additive:

- **Steps carry state.** An activity's steps are static content today
  (`/data/activityDetails.ts`, generated, server-only). The prototype gives each
  step a done flag, a percent, an owner, a due date, a completion date, attached
  outputs and a post thread. None of that has a table.
- **A risk is a flag on a step**, not an `Item(kind:"risk")`. The sidebar count,
  the overview, the timeline colours and the bottleneck rows all read this, so it
  is decided before any screen that shows it.
- **Overdue is a step past its due date**, not an item past its target date.
- **A deliverable is completed by a handover** — a post with a body, at least one
  attachment and a completion date — not by ticking a box. `Attachment.deliverableId`
  already anticipates this.
- Key info is a board of notes with bodies and attachments; posts everywhere take
  comments; steps, risks, notes and handovers are all "a post with attachments and
  replies", which is one shape, not four.

## Derived values (never stored)

Stage dates (kickoff + offsets), milestones (anchored to stage ends), progress %
(done deliverables / total), overdue (a step whose due date has passed with nothing
handed over), risk-red bars (a stage with a live risk flag), TODAY markers. Port the
formulas from the prototype, do not reinvent — and note that overdue and risk are the
two the prototype redefined, so the old shapes in the app are wrong, not merely older.

## Verification habit

After each phase: `npm run lint && npm run test`, then the phase's Playwright
checks, then eyeball against the prototype side by side — served, not on
`file://`. If a pixel-level question comes up, the prototype wins; it is the
spec, and this line used to name `reference/index.html`, which the top of this
file has already retired.

## Shipping it

The app is what deploys; the prototype is the spec and never ships. Vercel is
wired to the GitHub repo and builds `main`, so a push to `main` is a release.
Work on a branch, merge with `--ff-only`, push. A failed build leaves the last
good deployment serving, which is the one thing that has consistently saved us.

Before merging, with no `next dev` running (it holds :3000 and Playwright will
not start):

    npm run test && npx tsc --noEmit && npx playwright test && npm run lint

If the prototype changed, `node design-canvas/proto/build.mjs` — the built file
is generated and editing it is silently lost.

### When `prisma/schema.prisma` changed

This is the only thing that makes a release risky, because **the schema has to
reach the database before the code that needs it**. There is no migration
history: the repo is on `prisma db push`, which is declarative and moves no
data.

Apply it from a machine that can reach the database, never from the build:

    # Neon console -> Connection string -> the host WITHOUT `-pooler`
    # into .env.production.local as DATABASE_URL
    set -a && . ./.env.production.local && set +a
    npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma
    npx prisma db push        # never --accept-data-loss
    git push origin main      # code second

The `migrate diff` is not optional. It reads the live database rather than
assuming it matches some commit, and it is how we found that production was
three tables behind rather than the three columns we had assumed.

An additive change — a nullable column, one with a default, a new table — has
no broken window: the running code ignores what it does not know about. A
destructive one does. Dropping or renaming anything breaks the deployed code
the instant it lands, so either take the outage knowingly or do it in two
releases: add the new shape, deploy, move the data, then drop the old shape.
`db push` will not move the data for you.

### Three traps, each of which cost a deploy

**Do not put `prisma db push` in the build.** It reads well — the schema could
never lag the code again — and it fails: Vercel's build cannot reach the
database. Two production deploys died on it before the idea was abandoned. The
underlying reason is still unknown; `npx vercel inspect <id> --logs` would say.

**`vercel env pull` cannot read `DATABASE_URL`.** It is stored Sensitive, so
the pull writes the literal string `[SENSITIVE]` and Prisma rejects it as a
malformed URL. Get the string from the Neon console.

**Use the direct host, not the pooled one.** `db push` is DDL and PgBouncer is
in transaction mode; the pooled string is for the app at runtime and is what
Vercel's `DATABASE_URL` should stay set to.

### Seeding

`npx prisma db seed` deletes and recreates `atlasax1` alone — other programs
are left. Run it against production only after a baseline moved: deliverable
and item dates are computed from the schedule and then stored, so they are
stale the moment the schedule changes. Nothing else is a reason to run it.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
