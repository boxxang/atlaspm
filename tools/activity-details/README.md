# Activity detail pipeline

Source of truth for the 257 engineering-activity detail entries. The three
published artifacts under `docs/` are all generated from here — never edit them
by hand.

## Files

- `<stage>.js` — one module per stage (`def.js`, `arch.js`, … `mp.js`), holding
  the authored content for that stage's activities.
- `glossary.js` — every abbreviation used anywhere in the corpus, expanded.
- `validate.js` — the invariants (main-lane TAT sums to the activity TAT, effort
  splits sum to its M/M, windows sit inside the stage, relations point at real
  deliverables, outputs point at real steps).
- `derive.js` — everything computed rather than stored: parallel-step placement,
  the symmetric link graph, feedback edges, schedule tensions.
- `rewrite.js` — re-emits a stage module after a field-level patch.
- `build.js` — writes `docs/activity-details.json` and `docs/activity-details.html`.
- `editor.js` — writes `docs/activity-editor.html`.
- `print.js` + `print.css` — writes `docs/activity-details-print.html`.
- `topdf.js` — renders that to `docs/AtlasPM-Activity-Details.pdf`.
- `apply-edits.js` — applies an edit file saved from the editor.

## Editing by hand

    open docs/activity-editor.html          # edit, then Save edits

Then apply what it saved and rebuild:

    node tools/activity-details/apply-edits.js atlaspm-edits.json --dry   # report only
    node tools/activity-details/apply-edits.js atlaspm-edits.json
    node tools/activity-details/build.js
    node tools/activity-details/editor.js
    node tools/activity-details/print.js && node tools/activity-details/topdf.js

`apply-edits.js` re-runs every invariant after writing and exits non-zero if an
edit broke one, so a bad edit never reaches the artifacts.
