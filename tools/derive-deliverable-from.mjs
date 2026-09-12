/**
 * Derives `deliverableFrom` in /data/journey.ts from the authoring corpus.
 *
 *   npx tsx tools/derive-deliverable-from.mjs [--write]
 *
 * Two places said which activity makes a key deliverable: the `produces` edge
 * in the write-ups, and this array of indices. They disagreed on fourteen of
 * the hundred and sixty-seven, and six of those were not disagreements at all —
 * the corpus allows a deliverable to have several producers (twenty-seven of
 * them do) and the array can only name one, so the two were answering different
 * questions and being compared as if they answered the same one.
 *
 * Worse, the array is positions. Renumbering the activities by schedule
 * reordered the list it indexes into and left it pointing at whatever now sits
 * at those positions. Nothing caught that, because a list of small integers
 * looks like data rather than like references.
 *
 * So it stops being written by hand. The producer that finishes last is the one
 * named: a deliverable cannot exist before its last contributor is done, which
 * is the question the array is actually asked — `bottlenecks.ts` reads it to
 * find what a late deliverable is waiting on.
 *
 * A discrete activity is preferred over one that runs continuously, and ties
 * then break on the later start and on the reference, so the answer never
 * depends on the order the corpus happens to be walked in.
 */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { journeyData } from '../src/data/journey.ts';
import { activitySteps } from '../src/data/activitySteps.ts';
import { detailDeliverables } from '../src/data/activityIndex.ts';
import { deliverableRefs } from '../src/lib/deliverableRefs.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const WRITE = process.argv.includes('--write');
const fail = (m) => {
  console.error(`\n✗ ${m}\n`);
  process.exit(1);
};

const refsOf = (stageId) =>
  Object.keys(activitySteps).filter((ref) => activitySteps[ref].st === stageId);

/** Every activity that claims to produce each deliverable. */
const producers = {};
for (const [ref, a] of Object.entries(activitySteps)) {
  for (const [dref, rel] of a.r) if (rel === 'produces') (producers[dref] ??= []).push(ref);
}

const ends = (ref) => activitySteps[ref].w[1];
const starts = (ref) => activitySteps[ref].w[0];

/**
 * An activity that runs continuously rather than for a duration of its own.
 * Read from the template, which is where the flag is authored.
 */
const tpl = JSON.parse(fs.readFileSync(`${ROOT}/docs/stage-template-v2.json`, 'utf8'));
const continuous = new Set(
  tpl.stages.flatMap((s) => s.activities.filter((a) => a.continuous).map((a) => a.id)),
);

/**
 * The last one to finish — a deliverable is not there until its last part is —
 * but a discrete activity ahead of a continuous one.
 *
 * Inline metrology monitors the whole of fabrication, so it finishes last by
 * definition and would win every tie it is in. That is the wrong answer to the
 * question this array is asked: `bottlenecks.ts` reads it to find what a late
 * deliverable is waiting on, and a thing that runs throughout is never what
 * anything waits on. It contributes; it does not gate.
 */
const lastProducer = (refs) =>
  [...refs].sort(
    (a, b) =>
      Number(continuous.has(a)) - Number(continuous.has(b)) ||
      ends(b) - ends(a) ||
      starts(b) - starts(a) ||
      a.localeCompare(b),
  )[0];

/* The reference each row carries, resolved exactly as the app resolves it. */
const prefixOf = {};
for (const [ref, a] of Object.entries(activitySteps)) prefixOf[ref.split('-')[0]] = a.st;
const rows = journeyData.flatMap((s) =>
  s.deliverables.map((title, i) => ({ id: `${s.id}:${i}`, title, stageId: s.id })),
);
const refOf = deliverableRefs(rows, detailDeliverables, prefixOf);

let src = fs.readFileSync(`${ROOT}/src/data/journey.ts`, 'utf8');
const ids = journeyData.map((s) => s.id);
let changed = 0;
const moves = [];

for (const stage of journeyData) {
  const refs = refsOf(stage.id);
  const derived = stage.deliverables.map((title, i) => {
    const dref = refOf.get(`${stage.id}:${i}`);
    if (!dref) fail(`${stage.id} deliverable ${i + 1} ("${title}") resolves to no reference`);
    const made = producers[dref];
    if (!made?.length) fail(`${dref} has no activity claiming to produce it`);
    const pick = lastProducer(made);
    const at = refs.indexOf(pick);
    if (at < 0) fail(`${pick} produces ${dref} but does not run in ${stage.id}`);
    const was = refs[stage.deliverableFrom[i]];
    if (was !== pick) moves.push(`  ${dref}  ${was} → ${pick}${made.length > 1 ? `  (of ${made.join(', ')})` : ''}`);
    return at;
  });

  const before = `deliverableFrom: [${[...stage.deliverableFrom].join(', ')}]`;
  const after = `deliverableFrom: [${derived.join(', ')}]`;
  if (before === after) continue;

  const open = src.indexOf(`id: "${stage.id}"`);
  if (open < 0) fail(`cannot find stage ${stage.id}`);
  const next = ids
    .map((o) => src.indexOf(`id: "${o}"`))
    .filter((at) => at > open)
    .sort((a, b) => a - b)[0];
  const at = src.indexOf(before, open);
  if (at < 0 || (next !== undefined && at >= next)) {
    fail(`${stage.id}: cannot find deliverableFrom inside its own block`);
  }
  src = src.slice(0, at) + after + src.slice(at + before.length);
  changed++;
}

console.log(`${moves.length} deliverables change producer, across ${changed} stages:`);
console.log(moves.join('\n'));

if (!WRITE) {
  console.log('\nnothing written — pass --write');
  process.exit(0);
}
fs.writeFileSync(`${ROOT}/src/data/journey.ts`, src);
console.log('\nwrote src/data/journey.ts');
