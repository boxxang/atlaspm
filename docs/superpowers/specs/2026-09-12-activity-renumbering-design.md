# Renumbering activities and key deliverables

`DEF-01` is followed by `DEF-06`. Both start in week 0 of the stage, so the
second one should be `DEF-02` and is not. The same is true of twenty-two of the
twenty-three stages, and of the key deliverables in twenty of them.

This renumbers both, once, by schedule. A reference is an address people quote
in reviews and paste into messages, so the whole point is that `DEF-02` becomes
a different activity — the second one to start rather than the second one
somebody happened to write up. That is worth doing once and not worth doing
twice, which is why the map is built from data rather than typed, and why the
rewrite carries its own proof that it did not lose or invent a reference.

## What the numbers are today

Per stage, sorted as the app lists them:

    productDefinition  DEF-01[0-4] DEF-02[1-6] DEF-03[3-7] DEF-04[3-7]
                       DEF-05[2-5] DEF-06[0-4] DEF-07[4-8] DEF-08[4-8] DEF-09[5-8]

    productDefinition  DEF-D1 DEF-D2 DEF-D4 DEF-D3 DEF-D5 DEF-D6
    architecture       ARCH-D4 ARCH-D5 ARCH-D2 ARCH-D3 ARCH-D6 ARCH-D1 ARCH-D7
    physicalDesign     PD-D1 PD-D4 PD-D7 PD-D2 PD-D6 PD-D5 PD-D8 PD-D3 PD-D9

**165 of 259** activity references change, and **84 of 167** deliverable
references. Every one of those is a permutation *within* its stage: the prefix
comes from the stage's short title and never moves, so no reference ever leaves
the stage it belongs to.

Because they are permutations, a sequential find-and-replace corrupts the data —
`DEF-06 → DEF-02` followed by `DEF-02 → DEF-03` turns the first one into
`DEF-03`. Every substitution in this work is simultaneous, and the invariants
below exist to catch the case where it was not.

## The ordering rules

**An activity** sorts by its window: `window[0]`, then `window[1]`, then its
current number. Thirty-nine start weeks are tied across the template, so the
second and third keys are not decoration. `DEF-01[0-4]` and `DEF-06[0-4]` tie on
both weeks and fall back to the current number, which keeps `DEF-01` first and
makes `DEF-06` into `DEF-02` — the case that prompted this.

**A key deliverable** takes the order it already has. `journeyData[stage]
.deliverableWeek` is ascending in all twenty-three stages, so the programme's
list is already in due order and only the number attached to each row is wrong.
The rule is therefore: walk `journeyData[stage].deliverables` in list order and
assign `PREFIX-D1 … PREFIX-Dn`.

The reason the numbers drifted is that they come from a different file than the
dates do. `docs/stage-template-v2.json` holds the deliverable ids, `journey.ts`
holds the titles and the due weeks, and `/lib/deliverableRefs.ts` joins the two
by fuzzy title match at runtime. Renumbering does not change that join — it
matches on titles, which this work does not touch — but the join is what the map
is computed through, and step 5 of the invariants asserts it still lands every
row.

## Where the references live

There are two authored sources, not one, and they are joined by id:

| | holds |
|---|---|
| `docs/stage-template-v2.json` | each stage's activity ids, titles, TAT and M/M, and its deliverable ids and titles |
| `tools/activity-details/*.js` | the write-up per activity: `window` (the sort key), the prose, and `rel` ids naming deliverables |
| `src/data/journey.ts` | deliverable titles and `deliverableWeek` — hand-maintained, and the deliverable sort key |

`tools/activity-details/validate.js` joins the first two and enforces that a
window sits inside its stage and that every `rel` points at a deliverable that
exists. It runs again after the rewrite, which is most of why the authored
sources are rewritten rather than only their outputs.

### The snapshot in the middle

`tools/generate-activity-details.mjs` — the generator that writes the four
modules under `src/data/` — reads `docs/activitydetails_v9.html`. **No tool in
this repo writes that file.** It is a snapshot of an authoring draft. It is not
the same file as `docs/activity-details.html`, which `tools/activity-details/
build.js` does write: the two carry identical activity ids (259) and identical
deliverable ids (167) but different payloads.

So rewriting the authored sources and re-running the generators does not reach
`src/data/` on its own. This work applies the map to the v9 snapshot's embedded
JSON as well, and keeps feeding it to the generator. The effect is that
`src/data/` comes out byte-identical to today apart from the renaming and the
reordering, which is the property worth having while 165 references are moving.

Pointing the generator at `docs/activity-details.html` instead would be a
cleaner pipeline and is the obvious follow-up, but nobody has audited what the
two files disagree about. Doing it inside this change would mix an unaudited
content diff into a rename. **Out of scope; worth a separate piece of work.**

## Reordering, not only renaming

A textual substitution renames an entry without moving it, so `Object.keys()`
would read `DEF-01, DEF-03, DEF-05, DEF-06, DEF-04, DEF-02` — names in schedule
order, entries in the old one. That key order *is* the app's list order:
`inheritedActivities()` walks `Object.entries(library)` and hands the result its
`order` field, and the seeder walks `Object.keys(activitySteps)`.

So every list that carries these ids is re-sorted as well as remapped: the
`activities` and `deliverables` arrays in `stage-template-v2.json`, the entry
order of each `tools/activity-details/*.js` module, the arrays in the v9
snapshot, the `acts` and `deliv` key order in `design-canvas/proto/
activities.json`, and the `engineeringView` lists in `journey.ts` (which the
generator rewrites anyway).

## What gets touched

| | how |
|---|---|
| `docs/stage-template-v2.json` | both maps, arrays re-sorted |
| `tools/activity-details/*.js` (23 modules, 4,431 refs) | both maps — keys, prose cross-references, `rel` ids — entries re-sorted |
| `docs/activitydetails_v9.html` (embedded JSON) | both maps, arrays re-sorted |
| `docs/activity-details.{json,html}`, `activity-editor.html`, `activity-details-print.html` | regenerated by `build.js`, `editor.js`, `print.js` |
| `src/data/activityDetails.ts`, `activityIndex.ts`, `activitySteps.ts`, `journey.ts` | regenerated by `generate-activity-details.mjs` |
| `design-canvas/proto/activities.json` (3,779 refs) | both maps + re-sort, then `node design-canvas/proto/build.mjs` |
| `tests/**` hardcoded refs | both maps |
| the database | reseeded (`npx prisma db seed`) |

Deliberately **not** touched: `PORTING_PLAN.md`, `PORTING_PLAN_V2.md`,
`docs/superpowers/plans/**` and `docs/superpowers/specs/**` other than this
file. They record what was done at the time, and the numbers they quote were
correct then. Rewriting history to match the present makes both harder to read.

### The one schema change, found during the work

This was written expecting `prisma/schema.prisma` to be untouched: a reference
is a `String` and nothing about its shape changes. That was wrong, and the
reason is worth keeping.

`ensureBuiltinProfile()` decides whether the stored built-in profile still says
what the code says, on every render, and it decided it by **counting**: 259 rows
stored against 259 rows in the code meant up to date. The comment said why —
comparing 259 rows on every page render is the wrong place to be thorough, and
nothing but that function writes them.

Renumbering is invisible to a count. The stages do not change, the number of
activities does not change, and most references keep their spelling — `PD-14`
existed before and exists after. What changed is what `PD-14` *means*. So the
check passed on a database holding one numbering's titles and windows under
another numbering's references, and `prisma db seed` could not fix it either,
because the seed calls the same function and takes the same early return.

The fix is a digest instead of a count: `Profile.activityRevision`, a nullable
`String`, holding an FNV-1a hash of the rows the profile was written from. It is
O(1) on the read path, which is what the count was protecting, and it catches
any future content change rather than only this one. A profile stored before the
column existed has `null` and is rewritten once, which is exactly the behaviour
wanted on the deploy that carries this.

The column is nullable and additive, so `npm run build`'s `prisma db push`
carries it with no data loss and no hand-run migration.

## The rewriting tool

One script, `tools/renumber.mjs`, run once and kept — a map this size is worth
being able to re-derive and re-check, and the invariants are the reason to keep
it rather than paste a sed command into a commit message.

It builds both maps from the data described above, writes them to
`docs/renumber-map.json` for the record, and applies them simultaneously across
the file list. It refuses to write anything unless all of the following hold.

1. **Domain.** Every `[A-Z]{2,5}-\d{2}` and `[A-Z]{2,5}-D\d+` token found in the
   files to be rewritten is in the corresponding map's domain. This runs as a
   survey first, before anything is written. A token that is not in the domain is
   a typo, a dead reference, or something that merely looks like a reference —
   and each of those has to be explained and then either added to the map or
   named in an explicit exclusion list in the script. The check is never
   loosened to make a run go through: it is the one thing standing between a
   stale cross-reference and a corpus where it silently names a different
   activity.
2. **Multiset preservation.** For each map, the number of occurrences of every
   new token after the rewrite equals the number of occurrences of its old token
   before. A permutation moves references; it never creates or destroys one.
   This is the check that catches a non-simultaneous substitution.
3. **Round trip.** Applying the inverse map to the rewritten text reproduces the
   original byte for byte, before the re-sorting pass.
4. **`validate.js` passes** on the rewritten authored sources.
5. **Every deliverable row still gets a reference.** `deliverableRefs()` tags all
   167 rows today. The match is on titles and this work does not touch titles, so
   this should be unaffected — which is exactly why it is asserted rather than
   assumed.
6. **Schedule order holds.** Re-deriving the maps from the rewritten data yields
   the identity map: every stage's activities now run `01..n` by window and its
   deliverables `D1..Dn` by due week.

Invariants 1, 2, 3 and 6 belong to the script. Invariant 5 belongs to a unit
test in `tests/unit/` that will keep running long after the script has.

## Verification

`npm run lint && npm run test && npm run typecheck && npx playwright test` — 457
unit tests and 175 e2e tests pass today and must pass after, with the hardcoded
references in them remapped and nothing else about them changed. A test that
needs its *assertions* changed, rather than only its reference strings, is a
signal that something beyond a rename happened, and is to be investigated rather
than updated.

Three did, and the investigations are the most useful thing this work produced.

One was the count in `ensureBuiltinProfile()` above — a real defect, fixed at
the source. The other two were assertions pinned to a coincidence:

`stepSeed.test.ts` capped the late steps at `STALL_DEPTH * 6`. That bounds the
steps the seed deliberately leaves open on a stalled activity, and silently
assumed the other population — steps whose window closed while a step before
them is still running — was empty. It was four. The sum fitted under twelve only
for as long as the stalls fell where they did, and `pickStalls()` takes the
middle of each stage's candidate list, so reordering the list moved them. The
test now states both populations and asserts every late step belongs to one.

`steps.spec.ts` asserted that a named activity's first step says Overdue. It did,
because it happened to be the stalled one. Which activity carries the stall is
the seed's business, so the test now finds the stalled row on the page and
checks the rule.

Neither was a renaming error, and neither was fixed by moving the number until
it passed. A test that is measuring a coincidence is worth finding.

Then the screens, against the served prototype: the Activities board, a stage's
Activity tab, the key deliverables table and a write-up page, checking that each
stage's rows now read `01, 02, 03 …` and `D1, D2, D3 …` down the page.

## Release

The database is reseeded rather than migrated. That was decided explicitly: the
alternative is an `UPDATE` across `Post.activityRef`, `StepState.activityRef`,
`Item.activityRef`, `Attachment.activityRef` and `ProfileActivity.ref/baseRef`,
and the content in those rows today is seed content, not anybody's writing.

`npx prisma db seed` deletes and recreates `atlasax1` alone, which is what makes
this acceptable. Any programme somebody created by hand keeps rows pointing at
references that no longer exist; those rows resolve to an activity with no steps
rather than throwing — `resolveActivities()` already handles a `baseRef` the
library has lost — so nothing breaks, but nothing recovers either. If such a
programme exists when this ships, delete it or accept that it is stale.

Order of operations: deploy the code, then reseed. The reseed is what makes the
programme's own rows agree with the code, and running it first would leave the
old code reading new references for as long as the build takes.

The built-in profile's rows do not wait for the reseed: `activityRevision` is
null or stale on the deployed database, so the first render after the deploy
rewrites all 259 of them. That is the mechanism, and it is why the reseed on its
own would not have been enough — a point that only came out because three tests
refused to pass.
