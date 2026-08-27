/** Prints an activity's steps with the outputs pinned to each. For review. */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const src = fs.readFileSync(`${ROOT}/src/data/activityDetails.ts`, 'utf8');
const open = src.indexOf('{', src.indexOf('export const activityDetails'));
let depth = 0, end = -1, inStr = false, q = '', esc = false;
for (let i = open; i < src.length; i++) {
  const c = src[i];
  if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === q) inStr = false; continue; }
  if (c === '"' || c === "'" || c === '`') { inStr = true; q = c; continue; }
  if (c === '{') depth++; else if (c === '}' && --depth === 0) { end = i; break; }
}
const D = JSON.parse(src.slice(open, end + 1));
for (const id of process.argv.slice(2)) {
  const d = D[id];
  if (!d) { console.log(id, 'NOT FOUND'); continue; }
  const by = {};
  d.producedBy.forEach((n, i) => (by[n] = by[n] || []).push(d.produces[i]));
  console.log(`\n## ${id}`);
  for (const s of d.steps) console.log(`${s.n}| ${s.text}\n   => ${(by[s.n] || ['(nothing)']).join('  ||  ')}`);
}
