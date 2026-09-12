/**
 * Repairs the index-aligned arrays in /data/journey.ts after the renumbering.
 *
 *   npx tsx tools/repair-journey-order.mjs <old-order.json> [--write]
 *
 * A stage in journey.ts carries arrays that are positions, not values.
 * `engineeringView`, `engineeringTat`, `engineeringEffort` and
 * `engineeringStart` are index-aligned to the stage's activity list, and
 * `deliverableFrom` holds indices into that same list. The file's own header
 * says so; nothing enforced it.
 *
 * `tools/renumber.mjs` reordered that list and `generate-activity-details.mjs`
 * rewrote `engineeringView` to match — and left the other four behind. 141
 * activities ended up wearing another activity's elapsed weeks and man-months,
 * and 112 deliverables pointed at the wrong producer. The renumbering's own
 * safety net could not see it: `[0, 2, 6, 3, 7, 8]` contains nothing shaped
 * like a reference, and every array it does check round-tripped perfectly.
 *
 * This applies the same permutation, read from the map that renumbering wrote,
 * and `tests/unit/journeyAlignment.test.ts` holds the invariants afterwards so
 * the next reorder cannot repeat it quietly.
 */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { journeyData } from '../src/data/journey.ts';
import { activitySteps } from '../src/data/activitySteps.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2).filter((a) => a !== '--write');
const WRITE = process.argv.includes('--write');
const fail = (m) => {
  console.error(`\n✗ ${m}\n`);
  process.exit(1);
};

const OLD_ORDER = JSON.parse(fs.readFileSync(args[0] ?? `${ROOT}/docs/renumber-old-order.json`, 'utf8'));
const MAP = JSON.parse(fs.readFileSync(`${ROOT}/docs/renumber-map.json`, 'utf8')).activities;

/** The list as it stands now, in the order the app walks it. */
const newOrder = {};
for (const [ref, a] of Object.entries(activitySteps)) (newOrder[a.st] ??= []).push(ref);

const moved = (ref) => MAP[ref] ?? ref;

/** A value at old position i belongs at the new position of that same activity. */
function permute(values, oldRefs, newRefs) {
  const at = new Map(newRefs.map((r, i) => [r, i]));
  const out = new Array(newRefs.length);
  oldRefs.forEach((ref, i) => {
    const to = at.get(moved(ref));
    if (to === undefined) fail(`${ref} has no place in the new order`);
    out[to] = values[i];
  });
  if (out.some((v) => v === undefined)) fail('the permutation left a hole');
  return out;
}

/** Here the value *is* a position, so it is translated rather than moved. */
function reindex(indices, oldRefs, newRefs) {
  const at = new Map(newRefs.map((r, i) => [r, i]));
  return indices.map((i) => {
    const ref = oldRefs[i];
    if (!ref) fail(`index ${i} points past a list of ${oldRefs.length}`);
    const to = at.get(moved(ref));
    if (to === undefined) fail(`${ref} has no place in the new order`);
    return to;
  });
}

/** Each stage's own slice of the file, so an identical array elsewhere is safe. */
function blockOf(src, stageId, ids) {
  const open = src.indexOf(`id: "${stageId}"`);
  if (open < 0) fail(`cannot find stage ${stageId} in journey.ts`);
  const next = ids
    .map((other) => src.indexOf(`id: "${other}"`))
    .filter((at) => at > open)
    .sort((a, b) => a - b)[0];
  return [open, next === undefined ? src.length : next];
}

const PERMUTED = ['engineeringTat', 'engineeringEffort', 'engineeringStart'];
const ids = journeyData.map((s) => s.id);

let src = fs.readFileSync(`${ROOT}/src/data/journey.ts`, 'utf8');
let touched = 0;

for (const stage of journeyData) {
  const oldRefs = OLD_ORDER[stage.id];
  const newRefs = newOrder[stage.id];
  if (!oldRefs || !newRefs) continue;
  if (oldRefs.length !== newRefs.length) {
    fail(`${stage.id}: ${oldRefs.length} activities became ${newRefs.length}`);
  }

  const fixed = Object.fromEntries(PERMUTED.map((k) => [k, permute(stage[k], oldRefs, newRefs)]));
  fixed.deliverableFrom = reindex(stage.deliverableFrom, oldRefs, newRefs);

  /* the file writes them one line each, a space after every comma */
  const literal = (a) => `[${a.join(', ')}]`;

  for (const [key, value] of Object.entries(fixed)) {
    const before = `${key}: ${literal([...stage[key]])}`;
    const after = `${key}: ${literal(value)}`;
    if (before === after) continue;

    const [from, to] = blockOf(src, stage.id, ids);
    const at = src.indexOf(before, from);
    if (at < 0 || at >= to) fail(`${stage.id}: cannot find ${key} inside its own block`);
    if (src.indexOf(before, at + 1) >= 0 && src.indexOf(before, at + 1) < to) {
      fail(`${stage.id}: ${key} appears twice in one stage`);
    }
    src = src.slice(0, at) + after + src.slice(at + before.length);
    touched++;
  }
}

console.log(`${touched} arrays rewritten across ${journeyData.length} stages`);
if (!WRITE) {
  console.log('nothing written — pass --write');
  process.exit(0);
}
fs.writeFileSync(`${ROOT}/src/data/journey.ts`, src);
console.log('wrote src/data/journey.ts');
