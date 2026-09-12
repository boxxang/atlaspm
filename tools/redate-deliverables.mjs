/**
 * Moves a key deliverable that is due before the activity that makes it.
 *
 *   npx tsx tools/redate-deliverables.mjs [--write]
 *
 * Forty-four deliverables across the template were dated ahead of their own
 * producer — PDK-D1 by twenty-six weeks, RTL-D1 by twenty-six. They read on
 * screen as artefacts that should already exist and do not, and none of them
 * could have been spotted from the file, because a deliverable's week and its
 * producer's window are written down in different places and nothing joined
 * them until `deliverableFrom` became derived.
 *
 * Three rules, and the second and third are the ones worth arguing about.
 *
 * **Only the late ones move.** A deliverable due after its producer finishes is
 * left alone: that gap is review, approval or a gate meeting, and it is not
 * this script's business to compress it.
 *
 * **Nothing produced continuously moves.** Eleven of the forty-four are made by
 * an activity that runs throughout its stage, and every one of them is an
 * artefact that is maintained rather than finished — a dashboard, a per-drop
 * report, a burn-down, a change-control log. Their date is when the thing first
 * has to exist, and pushing it to the week the monitoring stops would say the
 * opposite of what they are.
 *
 * **The rest land on the producer's end plus the stage's own habit** — the
 * median gap of the deliverables in that stage that are already sound. Median
 * rather than mean: most gaps are zero and a few are long, so the mean reports
 * six weeks for a stage whose gaps are [0, 0, 0, 6, 22]. Nothing lands past the
 * end of its stage, whatever the habit says.
 *
 * The list is then re-sorted into due order, because the D references are
 * assigned by position and that position is supposed to mean "when it is due".
 * Run `tools/renumber.mjs` afterwards to reissue them.
 */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { journeyData } from '../src/data/journey.ts';
import { activitySteps } from '../src/data/activitySteps.ts';
import { BUILTIN_PROFILE } from '../src/data/scheduleProfiles.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const WRITE = process.argv.includes('--write');
const fail = (m) => {
  console.error(`\n✗ ${m}\n`);
  process.exit(1);
};

const refsOf = (id) => Object.keys(activitySteps).filter((r) => activitySteps[r].st === id);
const durationOf = (id) => BUILTIN_PROFILE.stages.find((s) => s.key === id)?.durationWeeks ?? Infinity;

/** Negative elapsed weeks is the flag for an activity that runs throughout. */
const continuous = new Set();
for (const s of journeyData) {
  refsOf(s.id).forEach((ref, i) => {
    if (s.engineeringTat[i] < 0) continuous.add(ref);
  });
}

const median = (xs) => {
  const a = [...xs].sort((x, y) => x - y);
  if (!a.length) return 0;
  return a.length % 2 ? a[(a.length - 1) / 2] : Math.round((a[a.length / 2 - 1] + a[a.length / 2]) / 2);
};

const ids = journeyData.map((s) => s.id);
const literal = (a) => `[${a.join(', ')}]`;
const quoted = (a) => a.map((t) => JSON.stringify(t));

let src = fs.readFileSync(`${ROOT}/src/data/journey.ts`, 'utf8');
const report = [];
let moved = 0;

for (const stage of journeyData) {
  const refs = refsOf(stage.id);
  const made = stage.deliverables.map((_, i) => refs[stage.deliverableFrom[i]]);
  if (made.some((r) => !r)) fail(`${stage.id}: deliverableFrom points past the activity list`);

  const ends = made.map((r) => activitySteps[r].w[1]);
  const due = [...stage.deliverableWeek];
  const movable = (i) => !continuous.has(made[i]);

  /* the stage's own habit, from the rows that are already sound */
  const habit = median(due.map((d, i) => d - ends[i]).filter((g, i) => g >= 0 && movable(i)));

  const next = due.map((d, i) =>
    movable(i) && d < ends[i] ? Math.min(ends[i] + habit, durationOf(stage.id)) : d,
  );

  next.forEach((d, i) => {
    if (d === due[i]) return;
    moved++;
    report.push(
      `  ${stage.shortTitle}-D${i + 1}  w${due[i]} → w${d}   ${made[i]} ends w${ends[i]}` +
        `${d === durationOf(stage.id) && ends[i] + habit > d ? '  (clamped to the stage end)' : ''}`,
    );
  });

  /* Re-sorted so position still means due order, stable where two share a week. */
  const order = next.map((d, i) => i).sort((a, b) => next[a] - next[b] || a - b);
  const rewrite = {
    deliverables: quoted(order.map((i) => stage.deliverables[i])),
    deliverableFrom: order.map((i) => stage.deliverableFrom[i]),
    deliverableWeek: order.map((i) => next[i]),
  };

  const open = src.indexOf(`id: "${stage.id}"`);
  if (open < 0) fail(`cannot find stage ${stage.id}`);
  const end = ids.map((o) => src.indexOf(`id: "${o}"`)).filter((at) => at > open).sort((a, b) => a - b)[0];

  for (const [key, value] of Object.entries(rewrite)) {
    const before =
      key === 'deliverables'
        ? `${key}: [\n      ${quoted(stage.deliverables).join(',\n      ')}\n    ]`
        : `${key}: ${literal([...stage[key]])}`;
    const after =
      key === 'deliverables'
        ? `${key}: [\n      ${value.join(',\n      ')}\n    ]`
        : `${key}: ${literal(value)}`;
    if (before === after) continue;
    const at = src.indexOf(before, open);
    if (at < 0 || (end !== undefined && at >= end)) fail(`${stage.id}: cannot find ${key} in its block`);
    src = src.slice(0, at) + after + src.slice(at + before.length);
  }
}

console.log(`${moved} deliverables move:`);
console.log(report.join('\n'));

if (!WRITE) {
  console.log('\nnothing written — pass --write');
  process.exit(0);
}
fs.writeFileSync(`${ROOT}/src/data/journey.ts`, src);
console.log('\nwrote src/data/journey.ts — now run tools/renumber.mjs to reissue the D references');
