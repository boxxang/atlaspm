# AtlasPM Porting Plan — reference/index.html → Next.js + Prisma

Run one phase per Claude Code session (use `/clear` between phases). Each phase
ends with its acceptance criteria green and a commit. The reference prototype is
the source of truth for behavior.

## Phase 0 — Repo & reference
- Init git repo. Place `reference/index.html` and this plan + CLAUDE.md at root.
- Scaffold: `npx create-next-app@latest atlaspm --ts --tailwind --app --eslint`.
- Add Vitest + Playwright. CI-less is fine; scripts: `dev`, `test`, `e2e`.
- **Accept:** `npm run dev` shows default page; `npm test` runs an empty suite.

## Phase 1 — Design tokens & layout shell
- Port every `:root` variable from the reference into `globals.css` (same names).
- Build the app shell: sticky toolbar (project name editable, kickoff date,
  profile select, computed Tapeout/First Silicon/Production, EDITED flag, info
  popover, settings popover skeleton, Main|Dashboard toggle), AtlasPM badge.
- **Accept:** toolbar visually matches reference at 1280/1440/1920; no data yet.

## Phase 2 — Pure data & schedule engine (tests first)
- Extract to `/src/data`: scheduleProfiles, milestoneDefs, lifecyclePhases,
  journeyData (incl. potentialRisks, leader), TEAM_SEEDS, projectSeed content.
- Extract to `/src/lib/schedule.ts`: computeSchedule, applyDateEdit ripple
  (start edit shifts stage+later; end edit changes duration+shifts later;
  fractional weeks preserve days), formatters (MM/DD/YYYY, fmtDT, fmtW).
- Vitest: (a) baseline dates for kickoff 2027-05-12 match the spec table;
  (b) DV end +28d moves Tapeout exactly +28d and DV TAT 16→20W; (c) reset
  restores baseline; (d) milestone dates track stage ends; (e) overdue/progress
  derivations.
- **Accept:** all unit tests green; zero DOM imports in /src/lib and /src/data.

## Phase 3 — Main page (client state only, no DB yet)
- Zustand store seeded from projectSeed. Port components: Roadmap (stations,
  regions, milestone diamonds, TODAY marker pixel-aligned to the mini gantt),
  mini concurrency Gantt (past-gray/future-color split, risk-red bars, hover
  select), stage panel (leader row, editable start/end dates, three boards with
  latest-3 + latest-update preview, Show more), stage details inline area open
  by default (What Happens, Eng|Program, deliverables table with due/completedAt,
  contacts CRUD), SVG stage visualizations.
- Board column drag-resize (per-kind CSS vars, boundary-follows-cursor) and
  deliverables column drag.
- **Accept (Playwright):** hover station 6 selects PD; DV end-date edit ripples
  to toolbar Tapeout; keyinfo board has no DUE column; activities drag doesn't
  move risks widths; deliverable check stamps completedAt and updates counter.

## Phase 4 — Modal board system
- Pop-up: board view (10/page pager, fixed 1120px × 88vh), item view (status
  update thread w/ post/edit/delete, edit keeps original timestamp), editor
  (title/owner/due/body), +Add from main closes-on-save, aggregate boards
  (Open Risks / Overdue / Status Updates — all stages, stage tags, row click
  drills in, ‹ Board back).
- **Accept (Playwright):** post→edit→delete a status update in modal; add from
  main appears as first row; agg risks shows 7 with stage tags (seed data).

## Phase 5 — Dashboard
- Stat tiles (Progress = deliverables done/total, Tapeout D-day, clickable Open
  Risks / Overdue), Upcoming Milestones with D-days, In-Flight chips (risky =
  red), Recent Status Updates two-line feed (click → item modal, Show more →
  updates board), Program Schedule gantt: 36px rows, milestone diamond exactly
  on its date with side label chip (flip near right edge), TODAY line.
- Scoped display settings: Main|Dashboard scopes with independent values
  (dashboard vars scoped on the dashboard root; font anchored via
  `font-size:var(--fs-base)`).
- **Accept (Playwright):** seed dashboard shows 51% / D−xx / 7 / 1; diamond
  center == bar end (±1px) for Tapeout; dash font change leaves Main at 18px.

## Phase 6 — Persistence (Prisma)
- Schema per CLAUDE.md domain model. `prisma db seed` = projectSeed.
- Server actions: item CRUD + status updates, deliverable toggle/add/delete/due,
  leader/contact CRUD, schedule overrides (store effective offsets/durations),
  project rename, kickoff/profile. Store hydrates from DB on load; optimistic
  updates with revalidation. Decide + document where display settings live.
- **Accept:** create an activity, post an update, check a deliverable, edit DV
  end date, rename project → hard-refresh → all persist. `npm run db:reset`
  restores AtlasAX1 exactly.

## Phase 7 — E2E regression sweep & polish
- Port the prototype's full check list into Playwright: column alignment px,
  TODAY alignment 0px, boundary drags, pagination, ESC layering (modal →
  dashboard → inline), responsive stops (1280 stack, 1100 columns, 640 title),
  reduced-motion sanity.
- Lighthouse pass; remove dead code; README with run/seed/deploy notes.
- **Accept:** e2e suite green; side-by-side with reference shows no regressions.

## Phase 8 (optional) — Deploy
- Vercel + hosted Postgres (Neon/Supabase): switch Prisma provider, run
  migrations, env docs. Auth is OUT OF SCOPE for this pass — note it as the
  next milestone if the tool goes multi-user.

## Suggested per-phase prompt
> Read CLAUDE.md and PORTING_PLAN.md. We are starting Phase N. First present a
> short plan (files you'll create/modify, test list), then implement, then run
> the phase's acceptance checks and show me the results. Reference behavior:
> reference/index.html.
