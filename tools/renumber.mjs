/**
 * Renumbers every activity and key deliverable by schedule, once.
 *
 *   npx tsx tools/renumber.mjs          # survey and check, write nothing
 *   npx tsx tools/renumber.mjs --write  # rewrite the files
 *
 * See docs/superpowers/specs/2026-09-12-activity-renumbering-design.md.
 *
 * An activity takes the position its window gives it inside its stage, a key
 * deliverable the position its due week gives it. The prefix comes from the
 * stage and never moves, so every change is a permutation *within* one stage —
 * which is exactly why a sequential find-and-replace corrupts the corpus
 * (`DEF-06 → DEF-02` then `DEF-02 → DEF-03` lands the first one on DEF-03) and
 * why every substitution here happens in one pass.
 *
 * The script is kept rather than thrown away after the run. Re-deriving the map
 * from the rewritten data has to come back as the identity, and that is a check
 * worth being able to run again.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { journeyData } from '../src/data/journey.ts';
import { detailDeliverables } from '../src/data/activityIndex.ts';
import { deliverableRefs } from '../src/lib/deliverableRefs.ts';
import { activitySteps } from '../src/data/activitySteps.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(import.meta.url);
const WRITE = process.argv.includes('--write');

const read = (p) => fs.readFileSync(`${ROOT}/${p}`, 'utf8');
const fail = (m) => {
  console.error(`\n✗ ${m}\n`);
  process.exit(1);
};

/* ── what carries a reference ─────────────────────────────────────────────── */

const STAGE_MODULES = ['def', 'arch', 'tech', 'pdk', 'ipr', 'ams', 'tc', 'rtl', 'dv', 'dft',
  'syn', 'pd', 'so', 'to', 'fab', 'pkgd', 'ptv', 'sipi', 'assy', 'evb', 'test', 'bu', 'mp'];

const CORPUS = STAGE_MODULES.map((m) => `tools/activity-details/${m}.js`);

/**
 * Files whose reference-shaped tokens are *computed*, not referenced.
 *
 * `/lib/rowIds.ts` derives a reference from a position — `activityRowId('DV', 8)`
 * is `DV-09` because 8 + 1 is 9, padded. Its tests are arithmetic wearing a
 * reference's clothes, and remapping them would assert that 8 + 1 is 11. The
 * distinction is the whole reason the rewrite is checked rather than trusted:
 * a token that looks like a reference is not always one.
 */
const POSITIONAL = new Set(['tests/unit/rowIds.test.ts']);

const TESTS = fs
  .readdirSync(`${ROOT}/tests/unit`)
  .map((f) => `tests/unit/${f}`)
  .concat(fs.readdirSync(`${ROOT}/tests/e2e`).map((f) => `tests/e2e/${f}`))
  .filter((p) => p.endsWith('.ts') && !POSITIONAL.has(p));

/**
 * Every file the maps are applied to.
 *
 * The four modules under `src/data/` are not here: they are regenerated
 * afterwards, and a file that is about to be overwritten is not a file to
 * rewrite. Comments elsewhere in `src/` quote references as illustrations of a
 * shape — "PD-01 step 6 · due 09/26/2026" is showing a wording, not naming an
 * activity — and one of them (`actions.ts`) reasons about the *numbers*, where a
 * remap would break the arithmetic the sentence is explaining. They stay.
 */
const TARGETS = [
  'docs/stage-template-v2.json',
  'docs/activitydetails_v9.html',
  'design-canvas/proto/activities.json',
  /* keyed by activity id, and read by the generator: data, not prose */
  'tools/activity-output-fixes.json',
  ...CORPUS,
  ...TESTS,
];

/* ── the maps ─────────────────────────────────────────────────────────────── */

/** DEF-01, PKGD-11 — never a deliverable, whose digits are preceded by a D. */
const ACT = /\b[A-Z]{2,5}-\d{2}\b/g;
/** DEF-D1, PD-D9. */
const DLV = /\b[A-Z]{2,5}-D\d+\b/g;

const num = (ref) => Number(ref.split('-')[1].replace(/^D/, ''));
const pre = (ref) => ref.split('-')[0];

/**
 * Activities, by the window they run in.
 *
 * Start week, then end week, then the number they carry today. Thirty-nine
 * start weeks are tied across the template, so the second and third keys do
 * real work: DEF-01 and DEF-06 tie on both weeks and the current number is what
 * keeps DEF-01 first.
 */
function activityMap() {
  const details = Object.assign({}, ...CORPUS.map((p) => require(`${ROOT}/${p}`)));
  const byPrefix = {};
  for (const [ref, d] of Object.entries(details)) (byPrefix[pre(ref)] ??= []).push({ ref, w: d.window });

  const map = {};
  for (const [prefix, list] of Object.entries(byPrefix)) {
    list.sort((a, b) => a.w[0] - b.w[0] || a.w[1] - b.w[1] || num(a.ref) - num(b.ref));
    list.forEach((a, i) => (map[a.ref] = `${prefix}-${String(i + 1).padStart(2, '0')}`));
  }
  return map;
}

/**
 * Key deliverables, by the week they are due.
 *
 * The programme's list is already in due order — `deliverableWeek` is ascending
 * in all twenty-three stages — so this walks that list and numbers it. The
 * current reference for each row comes from the same title match the app uses,
 * because the ids live in one file and the dates in another and nothing but
 * that match joins them.
 */
function deliverableMap() {
  /* Exactly what /shell/useDeliverableRefs.ts does, so the map is built through
     the same join the app resolves these references with. */
  const stageOfPrefix = {};
  for (const [ref, a] of Object.entries(activitySteps)) stageOfPrefix[pre(ref)] = a.st;

  const rows = [];
  for (const s of journeyData) {
    (s.deliverables ?? []).forEach((title, i) => rows.push({ id: `${s.id}:${i}`, title, stageId: s.id }));
  }
  const current = deliverableRefs(rows, detailDeliverables, stageOfPrefix);

  const map = {};
  for (const s of journeyData) {
    (s.deliverables ?? []).forEach((_, i) => {
      const ref = current.get(`${s.id}:${i}`);
      if (!ref) fail(`no reference resolves for ${s.id} deliverable ${i + 1}`);
      map[ref] = `${pre(ref)}-D${i + 1}`;
    });
  }
  return map;
}

/* ── the checks ───────────────────────────────────────────────────────────── */

const tokensIn = (text, re) => text.match(re) ?? [];

const counts = (list) => {
  const c = new Map();
  for (const t of list) c.set(t, (c.get(t) ?? 0) + 1);
  return c;
};

/**
 * Every reference-shaped token in every file is one the map knows.
 *
 * A survey, before anything is written. A token outside the domain is a typo, a
 * dead reference, or something that only looks like one, and each has to be
 * explained and then either added to the map or named here. The check is never
 * loosened to make a run go through: it is the one thing between a stale
 * cross-reference and a corpus where it silently names a different activity.
 */
const ALLOWED_OUTSIDE_MAP = new Set([
  /* Every one of these is a reference a test invented precisely *because* the
     template does not have it. Renaming them would destroy what they assert. */
  'DEF-99', 'ZZZ-01',           // assert that an un-written reference is not a link
  'GONE-99',                    // a baseRef the library has lost, and the row that survives it
  'NEW-01', 'NEW-04',           // an activity somebody added to a template
  'CUS-01', 'CUS-04', 'ZZ-09',  // renamed onto a prefix of their own, and the clash that follows
  'DONE-01', 'SOON-01',         // stepSeed's two synthetic activities: one finished, one not yet
  'ZZZ-09',                     // a bottleneck edge pointing at nothing
]);

function survey(files, actMap, dlvMap) {
  const strays = new Map();
  for (const [p, text] of files) {
    for (const [re, map, kind] of [[ACT, actMap, 'activity'], [DLV, dlvMap, 'deliverable']]) {
      for (const t of tokensIn(text, re)) {
        if (map[t] || ALLOWED_OUTSIDE_MAP.has(t)) continue;
        const key = `${kind} ${t}`;
        strays.set(key, (strays.get(key) ?? new Set()).add(p));
      }
    }
  }
  if (strays.size) {
    console.error('\nReferences no map accounts for:\n');
    for (const [k, where] of [...strays].sort()) {
      console.error(`  ${k}   in ${[...where].slice(0, 3).join(', ')}${where.size > 3 ? ` (+${where.size - 3})` : ''}`);
    }
    fail(`${strays.size} reference(s) outside the maps. Explain each, then add it to a map or to ALLOWED_OUTSIDE_MAP.`);
  }
}

/** One pass, both maps, so a permutation cannot chase its own tail. */
const applyMaps = (text, actMap, dlvMap) =>
  text
    .replace(DLV, (t) => dlvMap[t] ?? t)
    .replace(ACT, (t) => actMap[t] ?? t);

const invert = (m) => Object.fromEntries(Object.entries(m).map(([a, b]) => [b, a]));

/* ── re-sorting ───────────────────────────────────────────────────────────── */

/**
 * A rename leaves the entry where it was, and key order is what the app lists
 * by — `inheritedActivities()` walks `Object.entries(library)`. So every list
 * carrying these ids is re-sorted as well as remapped.
 */
const byRef = (a, b) => num(a) - num(b);

/**
 * A stage module, re-sorted without being re-serialised.
 *
 * These are hand-written JavaScript with comments in them, so they are moved as
 * text: each entry runs from its `'REF': {` line to the next one, and the
 * chunks are reassembled in the new order. The split is checked by putting the
 * file back together unchanged before anything is reordered.
 */
function resortModule(path, text) {
  const lines = text.split('\n');
  const heads = [];
  lines.forEach((l, i) => {
    const m = /^'([A-Z][A-Z0-9]*-\d{2})': \{$/.exec(l);
    if (m) heads.push({ ref: m[1], at: i });
  });
  if (!heads.length) fail(`${path}: no entries found`);

  const lastEnd = lines.reduce((n, l, i) => (l === '},' ? i : n), -1);
  if (lastEnd < heads[heads.length - 1].at) fail(`${path}: cannot find the last entry's end`);

  const header = lines.slice(0, heads[0].at).join('\n') + '\n';
  const footer = lines.slice(lastEnd + 1).join('\n');
  const chunks = heads.map((h, i) => ({
    ref: h.ref,
    text: lines.slice(h.at, i + 1 < heads.length ? heads[i + 1].at : lastEnd + 1).join('\n') + '\n',
  }));

  if (header + chunks.map((c) => c.text).join('') + footer !== text) {
    fail(`${path}: the entry split does not reassemble to the original`);
  }
  return header + [...chunks].sort((a, b) => byRef(a.ref, b.ref)).map((c) => c.text).join('') + footer;
}

const sortKeys = (obj, key = (k) => k) =>
  Object.fromEntries(Object.entries(obj).sort(([a], [b]) => byRef(key(a), key(b))));

function resortTemplate(json) {
  for (const s of json.stages) {
    s.activities.sort((a, b) => byRef(a.id, b.id));
    s.deliverables.sort((a, b) => byRef(a.id, b.id));
  }
  return json;
}

function resortAdData(json) {
  for (const s of json.stages) {
    s.activities.sort((a, b) => byRef(a.id, b.id));
    if (s.deliverables) s.deliverables.sort((a, b) => byRef(a.id, b.id));
  }
  /* details is keyed by activity id and its order is what the viewer lists by;
     sorted per stage, in the stages' own order */
  const order = json.stages.flatMap((s) => s.activities.map((a) => a.id));
  const rank = new Map(order.map((id, i) => [id, i]));
  json.details = Object.fromEntries(
    Object.entries(json.details).sort(([a], [b]) => (rank.get(a) ?? 0) - (rank.get(b) ?? 0)),
  );
  return json;
}

function resortProto(json) {
  json.acts = sortKeys(json.acts);
  json.deliv = sortKeys(json.deliv);
  return json;
}

/* ── run ──────────────────────────────────────────────────────────────────── */

const actMap = activityMap();
const dlvMap = deliverableMap();
const movedActs = Object.entries(actMap).filter(([a, b]) => a !== b).length;
const movedDlvs = Object.entries(dlvMap).filter(([a, b]) => a !== b).length;

console.log(`activities  ${Object.keys(actMap).length} total, ${movedActs} renumbered`);
console.log(`deliverables ${Object.keys(dlvMap).length} total, ${movedDlvs} renumbered`);

const files = TARGETS.map((p) => [p, read(p)]);

survey(files, actMap, dlvMap);
console.log('✓ every reference-shaped token is in a map');

const invAct = invert(actMap);
const invDlv = invert(dlvMap);

const rewritten = files.map(([p, text]) => {
  const out = applyMaps(text, actMap, dlvMap);

  /* a permutation moves references; it never creates or destroys one */
  for (const [re, map, kind] of [[ACT, actMap, 'activity'], [DLV, dlvMap, 'deliverable']]) {
    const before = counts(tokensIn(text, re));
    const after = counts(tokensIn(out, re));
    for (const [old, n] of before) {
      const now = map[old] ?? old;
      if ((after.get(now) ?? 0) !== n) {
        fail(`${p}: ${kind} ${old} → ${now} appears ${after.get(now) ?? 0} times, expected ${n}`);
      }
    }
    if ([...after.values()].reduce((a, b) => a + b, 0) !== [...before.values()].reduce((a, b) => a + b, 0)) {
      fail(`${p}: the number of ${kind} references changed`);
    }
  }

  /* and the inverse map puts it back byte for byte */
  if (applyMaps(out, invAct, invDlv) !== text) fail(`${p}: does not round-trip through the inverse map`);

  return [p, out];
});
console.log('✓ every file preserves its reference counts and round-trips');

const sorted = rewritten.map(([p, text]) => {
  if (p.startsWith('tools/activity-details/')) return [p, resortModule(p, text)];
  if (p === 'docs/stage-template-v2.json') {
    return [p, JSON.stringify(resortTemplate(JSON.parse(text)), null, 1)];
  }
  if (p === 'design-canvas/proto/activities.json') {
    return [p, JSON.stringify(resortProto(JSON.parse(text)))];
  }
  if (p === 'docs/activitydetails_v9.html') {
    const m = text.match(/(<script id="ad-data" type="application\/json">)([\s\S]*?)(<\/script>)/);
    if (!m) fail(`${p}: no ad-data payload`);
    return [p, text.replace(m[0], m[1] + JSON.stringify(resortAdData(JSON.parse(m[2]))) + m[3])];
  }
  return [p, text];
});
console.log('✓ every list re-sorted into schedule order');

if (!WRITE) {
  console.log('\nnothing written — pass --write');
  process.exit(0);
}

for (const [p, text] of sorted) fs.writeFileSync(`${ROOT}/${p}`, text);
fs.writeFileSync(
  `${ROOT}/docs/renumber-map.json`,
  JSON.stringify({ activities: actMap, deliverables: dlvMap }, null, 1),
);
console.log(`\nwrote ${sorted.length} files and docs/renumber-map.json`);
console.log('now: node tools/activity-details/build.js && node tools/activity-details/editor.js');
console.log('     node tools/activity-details/print.js');
console.log('     node tools/generate-activity-details.mjs');
console.log('     node design-canvas/proto/build.mjs');
