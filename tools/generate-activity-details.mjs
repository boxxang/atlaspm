/**
 * Regenerates the activity data modules from the authoring document.
 *
 *   node tools/generate-activity-details.mjs [path/to/document.html]
 *
 * The document is the one named by the default below; pass another to port
 * from a newer draft. Only what the document renders is taken: a field it
 * carries but never shows is authoring scaffolding, not content.
 *
 * Writes /data/activityDetails.ts (the write-ups, server-side),
 * /data/activityIndex.ts (the small maps a browser may hold),
 * /data/activityDetailTypes.ts, and the engineeringView lists in
 * /data/journey.ts. Everything else in journey.ts is left alone.
 */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = process.argv[2] ?? 'docs/activitydetails_v9.html';
const h = fs.readFileSync(`${ROOT}/${SRC}`, 'utf8');
const D = JSON.parse(h.match(/<script id="ad-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);

const j1 = o => JSON.stringify(o, null, 1);
const ordered = (obj, keys) => { const o = {}; for (const k of keys) o[k] = obj[k]; return o; };

/*
 * The app's shape, named rather than inherited. Authoring drafts carry fields
 * the document itself never renders — v9 added `why`, `inputs`,
 * `deliverableNote` and a per-step `adds` that its own renderer ignores — and
 * a port that copied whatever it found would grow the page's contract by
 * accident. What the document shows is the content; the rest is scaffolding,
 * and it is dropped loudly.
 */
const DETAIL_FIELDS = ['stage', 'window', 'criticalPath', 'purpose', 'steps', 'flowNote',
  'consumes', 'produces', 'producedBy', 'rel', 'risks', 'roles', 'effort', 'entry', 'exit',
  'dependsOn', 'dependsNote', 'feedsInto', 'measuredBy', 'links', 'terms'];
const STEP_FIELDS = ['n', 'text', 'tat', 'lane'];

const dropped = new Set();
const pick = (o, fields) => {
  const out = {};
  for (const k of fields) if (k in o) out[k] = o[k];
  for (const k of Object.keys(o)) if (!fields.includes(k)) dropped.add(k);
  return out;
};

/* every activity in template order, so the file reads as the programme runs */
const allIds = D.stages.flatMap(s => s.activities.map(a => a.id));
const details = {};
for (const id of allIds) {
  const d = D.details[id];
  if (!d) continue;
  details[id] = pick(d, DETAIL_FIELDS);
  details[id].steps = d.steps.map(st => ({ ...pick(st, STEP_FIELDS), tat: Number(st.tat) || 0 }));
}

/* a step whose duration was blanked in the editor; the document lays it out at
   zero too (`Number(st.tat) || 0`), so the port agrees with it rather than
   inventing a length */
const blankTat = Object.entries(details).flatMap(([id, d]) =>
  d.steps.filter((st, i) => !(Number(D.details[id].steps[i].tat) > 0) && st.tat === 0)
    .map(st => ({ id, n: st.n, text: st.text })));

/* an output pinned to a step that does not exist never reaches the page */
const orphaned = Object.entries(details).flatMap(([id, d]) => {
  const ns = new Set(d.steps.map(s => s.n));
  return d.producedBy.map((n, i) => ({ id, n, out: d.produces[i] })).filter(x => !ns.has(x.n));
});

const titles = {};
for (const s of D.stages) for (const a of s.activities) titles[a.id] = a.text;
const deliverables = {};
for (const s of D.stages) for (const d of (s.deliverables || [])) deliverables[d.id] = d.title;
const glossary = ordered(D.glossary, Object.keys(D.glossary).sort());

/* ---------- the heavy module: the write-ups themselves ---------- */
fs.writeFileSync(`${ROOT}/src/data/activityDetails.ts`, `/**
 * Written-up detail for every engineering activity of the programme — what the
 * activity is for, the steps it runs, what it needs, what it produces, who is
 * on it, and what to watch.
 *
 * All ${allIds.length} activities of the 23 stages are written. Weeks are weeks from the
 * stage start; the programme turns them into dates.
 *
 * The source is a separate authoring document — ${SRC} —
 * and this module is its export, so nothing here is edited by hand. It is a
 * megabyte of prose and it is imported by the server only: the page reads the
 * one write-up it needs and hands it down. What a browser needs is the small
 * maps in /data/activityIndex.ts.
 */
import type { ActivityDetail } from './activityDetailTypes';

export type {
  ActivityDetail,
  DetailEffort,
  DetailLinks,
  DetailRelation,
  DetailRole,
  DetailStep,
} from './activityDetailTypes';

/** Keyed by activity reference — DEF-01, ARCH-01, … in template order. */
export const activityDetails: Record<string, ActivityDetail> = ${j1(details)};

/** The written-up detail for an activity, if one exists. */
export const activityDetail = (id: string): ActivityDetail | undefined =>
  activityDetails[id];
`);

/* ---------- the light module: what a browser is allowed to hold ---------- */
fs.writeFileSync(`${ROOT}/src/data/activityIndex.ts`, `/**
 * The small maps about activities — titles, deliverable titles, the glossary,
 * and which activities have been written up.
 *
 * Split from /data/activityDetails.ts because that module is a megabyte of
 * write-ups and this one is a few tens of kilobytes. Client components read
 * this; only the server reads the write-ups themselves.
 *
 * Generated from the same authoring document. Not edited by hand.
 */

export interface GlossaryTerm {
  full: string;
  group: string;
  note: string;
}

/** Every activity of the template, in the order the programme runs them. */
export const detailActivityTitles: Record<string, string> = ${j1(titles)};

/** Deliverable titles by reference, for the 'what it delivers' section. */
export const detailDeliverables: Record<string, string> = ${j1(deliverables)};

/** The terms a write-up may offer to explain. */
export const activityGlossary: Record<string, GlossaryTerm> = ${j1(glossary)};

/**
 * The activities that have a write-up, in template order — what the arrows walk
 * and what the engineering table decides to link on.
 */
export const writtenActivities: string[] = ${j1(Object.keys(details))};

const WRITTEN = new Set(writtenActivities);

/** Whether an activity opens a page. */
export const hasActivityDetail = (id: string): boolean => WRITTEN.has(id);
`);

/* ---------- the titles the engineering table prints ---------- */
let jr = fs.readFileSync(`${ROOT}/src/data/journey.ts`, 'utf8');
let n = 0, changed = 0;
jr = jr.replace(/(engineeringView:\s*\[)([\s\S]*?)(\n\s*\],)/g, (m, open, body, close) => {
  const s = D.stages[n++];
  const was = [...body.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(x => x[1]);
  const now = s.activities.map(a => a.text);
  was.forEach((t, i) => { if (t !== now[i].replace(/"/g, '\\"')) changed++; });
  const lines = now.map(t => `      "${t.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',\n');
  return `${open}\n${lines}${close}`;
});
if (n !== D.stages.length) throw new Error(`expected 23 engineeringView blocks, replaced ${n}`);
fs.writeFileSync(`${ROOT}/src/data/journey.ts`, jr);

console.log(`details ${Object.keys(details).length} | titles ${Object.keys(titles).length} | deliverables ${Object.keys(deliverables).length} | glossary ${Object.keys(glossary).length}`);
console.log(`engineeringView blocks rewritten: ${n}, titles changed: ${changed}`);
if (dropped.size) console.log(`fields the document carries but never renders, dropped: ${[...dropped].join(', ')}`);
if (blankTat.length) {
  console.log(`WARNING: ${blankTat.length} steps have no duration and are laid out at zero weeks:`);
  for (const b of blankTat) console.log(`         ${b.id} step ${b.n}: ${b.text}`);
}
if (orphaned.length) {
  console.log(`WARNING: ${orphaned.length} outputs are pinned to a step that does not exist, so the`);
  console.log('         steps table cannot show them. Fix them in the document:');
  for (const o of orphaned) console.log(`         ${o.id} step ${o.n}: ${o.out}`);
}
