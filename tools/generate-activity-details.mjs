/**
 * Regenerates the activity data modules from the authoring document.
 *
 *   node tools/generate-activity-details.mjs
 *
 * Writes /data/activityDetails.ts (the write-ups, server-side),
 * /data/activityIndex.ts (the small maps a browser may hold),
 * /data/activityDetailTypes.ts, and the engineeringView lists in
 * /data/journey.ts. Everything else in journey.ts is left alone.
 */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = 'docs/activity-details-ARCH06-onward-reviewed-v3-codefix.html';
const h = fs.readFileSync(`${ROOT}/${SRC}`, 'utf8');
const D = JSON.parse(h.match(/<script id="ad-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);

const j1 = o => JSON.stringify(o, null, 1);
const ordered = (obj, keys) => { const o = {}; for (const k of keys) o[k] = obj[k]; return o; };

/* every activity in template order, so the file reads as the programme runs */
const allIds = D.stages.flatMap(s => s.activities.map(a => a.id));
const details = ordered(D.details, allIds.filter(id => D.details[id]));

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
