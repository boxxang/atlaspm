# Template editing

Editing a schedule template, and duplicating one to make another: stages,
the activities inside a stage, and the steps inside an activity.

## Why it is safe to change a template

Nothing in a template is a date. A stage is `startOffsetWeeks` and
`durationWeeks`, an activity is a `[from, to]` window in weeks from its
stage's start, and a step is a `tat` in weeks. The thirteen `DateTime`
columns in the schema all belong to a programme — a due date somebody set, a
day something was finished — never to a template.

So a template can be reshaped freely and a programme created from it re-derives
every milestone from its own kickoff. That is the premise this rests on, and it
was checked against the schema rather than assumed.

## Three decisions

**A template is a blueprint, not a live reference.** A programme copies what it
needs when it is created and is independent from then on; editing a template
never reschedules a programme already running. This changes today's behaviour,
where a programme holds a live `profileId` and follows its profile — the reason
editing a programme's stages currently has to fork a private profile first. Under
the blueprint rule that fork stops being a special case: **every** programme gets
its own private profile at creation, and the existing fork machinery becomes the
normal path rather than the exception.

**Editing reaches the schedule skeleton only** — an activity's title, its window,
and its steps' text and TAT. The write-ups (`purpose`, `consumes`, `produces`,
`risks`, `roles`, and a dozen more fields, about 1 MB across 259 activities) are
authored elsewhere and stay read-only. An activity somebody adds therefore has no
detail page, which is already how an un-written activity behaves.

**The built-in `Typical SoC` is read-only.** To change it you duplicate it first.
It is the baseline the schedule work verified against published cycle times, and
a baseline that can be edited in place is not one. `CLAUDE.md` already says it
stays immutable; this keeps that promise rather than quietly forking behind the
user's back, because a thing that happens silently is a thing nobody can explain
later.

## Model: inherit or own, one level down

`ProfileStage` already carries `baseKey` — "the built-in stage whose text and
drawing this stage shows; null for a stage someone added, which starts blank."
This design applies that same idea to activities rather than inventing a second
pattern.

```
ProfileActivity
  profileId, stageKey, ref, order, title, windowFrom, windowTo, baseRef

  baseRef = "ASSY-03"  inherited: steps and the write-up come from the
                       generated modules, and nothing is stored for them
  baseRef = null       owned: steps live in ProfileStep, and there is no
                       write-up
ProfileStep
  profileActivityId, n, text, tat, lane
```

Editing any step of an inherited activity materialises **all** of its steps into
`ProfileStep` and clears `baseRef`. An activity is therefore inherited or owned,
never half of each, and the row says which — so no reader ever has to consult two
sources at once. One function, `resolveActivities(profile)`, turns a profile into
the activity list the UI reads, sitting beside `/lib/stages.ts`, which already
does exactly this for stages.

### Why not put everything in the database

The obvious alternative is to migrate all 259 activities and 1,664 steps into
tables and be done with the generated modules. It was rejected on a measurement:
`src/data/activitySteps.ts` is 270 KB and is imported by eleven modules, most of
them client components, because steps carry state and the browser needs them.
Today that is one cached static chunk shared by every programme. Moving it into
the database means re-sending it in each programme's RSC payload — a real
regression paid on every load, to buy uniformity nobody asked for.

## Phasing

Each phase is usable on its own and is verified on `localhost:3000` before the
next one starts.

**Phase 1 — stage editing, template duplication, and the blueprint rule.** The
data model exists (`Profile`, `ProfileStage`, with `builtin` and `template`
flags); what is missing is the UI, the actions, and the copy at creation.
Duplicate a template, rename it, add, remove, reorder and re-time its stages, and
start a programme from it — where "start a programme" now means copying the
chosen template into a private profile for that programme rather than pointing at
the template. This alone delivers "make my own template".

**Phase 2 — activities and their steps, together.** Introduce `ProfileActivity`
and `ProfileStep`, seeded from the generated index with `baseRef` set for every
built-in activity. Add, edit and delete activities and the steps inside them;
programme creation copies the rows into that programme's private profile
alongside its stages.

These were two phases until the plan for the first one was written, and
splitting them turned out to be wrong on two counts. An activity with no steps
is not a usable thing in this app — steps carry the dates, the completion, the
overdue and the risk, so an activity added without them is an empty row that
cannot be filled until the next phase. And the eleven modules that read
`activitySteps` would have to be refactored twice: once for a resolver that
takes steps from code only, then again for one that takes them from code or the
database. One resolver, one refactor, one phase.

The cost is a wider surface to verify at once, which is what the split was
protecting. That protection was worth less than the two problems it created.

## Reference identity

Activity references (`ASSY-10`) are derived from position today
(`/lib/rowIds.ts`), which is why an activity added in this session had to be
appended rather than inserted: inserting renumbers everything after it, and
`StepState`, `Post` and `Attachment` rows are keyed on those strings.

Inside a template being edited this is harmless, because nothing points at a
template's activities yet. It stops being harmless the moment a programme exists.
So from Phase 2 a `ProfileActivity.ref` is **stored, not derived** — assigned when
the activity is created and never reassigned. Deleting the third of eleven
activities leaves a gap in the numbering, and a gap is the correct outcome: the
alternative is silently repointing somebody's recorded work at a different step.

## Testing

Unit tests before the UI, per `CLAUDE.md`: profile duplication, stage add/remove
with offsets preserved, `resolveActivities` for both inherited and owned
activities, and the materialise-on-edit transition. End-to-end tests for each
phase's screen. The existing 401 unit and 147 end-to-end tests must stay green —
Phase 1 changes programme creation, which several of them exercise.

## Non-goals

Editing write-ups. Editing the built-in template in place. Programme-level
activity editing (a programme's copy is fixed once created; reshaping work is a
template concern). Migrating the programmes that already exist. The blueprint rule
applies to programmes created from Phase 1 onward. Of the two here, `atlasax2`
is already on a private profile because somebody edited its stages, and
`atlasax1` still points at the built-in one — which is safe precisely because
the built-in template is read-only, so nothing it shares can move underneath
it. Neither needs converting, and converting them would rewrite history for no
gain.
