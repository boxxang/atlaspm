/**
 * Reads the ported data and reports outputs that look pinned to the wrong step.
 *
 *   node tools/check-step-outputs.mjs [--all]
 *
 * The steps table prints each output against the step that adds it. Nothing
 * enforces that they are about the same thing, and an authoring pass that
 * reorders steps leaves the outputs where they were. This scores every output
 * against every step of its activity on the words they share, and reports the
 * ones a different step claims more strongly than the one they sit on.
 *
 * It reads words, not meaning, so it is a shortlist for a person, not a verdict.
 */
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
  if (c === '{') depth++;
  else if (c === '}' && --depth === 0) { end = i; break; }
}
const D = JSON.parse(src.slice(open, end + 1));

/* Words that say nothing about which step this is. */
const STOP = new Set(('the and for with from into that this per against across between of a an to on in by '
  + 'its their our are is be been being where when which what who how each all any both other '
  + 'define defining definition record recording report reporting review reviewing result results '
  + 'plan planning list listing set setting run running check checking make making take taking '
  + 'data note notes item items thing things work working step steps activity program product '
  + 'design designs required require requires needed needs use uses used').split(' '));

/* Enough of a stem that "qualification" reaches "qualified". */
const stem = w => w.replace(/(ations?|ation|ings?|ment|ised|ized|ise|ize|ers?|ies|ed|s)$/, '');
const words = s => [...new Set(String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ')
  .filter(w => w.length > 2 && !STOP.has(w)).map(stem).filter(w => w.length > 2))];

const score = (a, b) => {
  const A = words(a), B = words(b);
  if (!A.length || !B.length) return 0;
  const hit = A.filter(w => B.includes(w)).length;
  return hit / Math.min(A.length, B.length);
};

const showAll = process.argv.includes('--all');
const flags = [];
let outputs = 0;

for (const [id, d] of Object.entries(D)) {
  const byStep = {};
  d.producedBy.forEach((n, i) => (byStep[n] = byStep[n] || []).push(d.produces[i]));
  for (const [nStr, outs] of Object.entries(byStep)) {
    const n = Number(nStr);
    const mine = d.steps.find(s => s.n === n);
    if (!mine) continue;
    for (const out of outs) {
      outputs++;
      const here = score(out, mine.text);
      let best = { n, s: here, text: mine.text };
      for (const s of d.steps) {
        const v = score(out, s.text);
        if (v > best.s + 1e-9) best = { n: s.n, s: v, text: s.text };
      }
      /* two nets: a step that claims it more strongly, and a step that shares
         nothing with it at all while some other step does */
      const stolen = best.n !== n && best.s - here >= 0.34;
      const stranger = here === 0 && best.s > 0;
      if (stolen || stranger) {
        flags.push({ id, out, on: n, onText: mine.text, onScore: here, better: best.n,
          betterText: best.text, betterScore: best.s, why: stolen ? 'claimed' : 'stranger' });
      }
    }
  }
}

flags.sort((a, b) => (b.betterScore - b.onScore) - (a.betterScore - a.onScore));
console.log(`${outputs} outputs across ${Object.keys(D).length} activities`);
console.log(`${flags.length} sit on a step another step claims more strongly\n`);
for (const f of (showAll ? flags : flags.slice(0, 40))) {
  console.log(`${f.id}  "${f.out}"`);
  console.log(`   on step ${f.on} (${f.onScore.toFixed(2)}): ${f.onText}`);
  console.log(`   fits step ${f.better} (${f.betterScore.toFixed(2)}): ${f.betterText}`);
}
if (!showAll && flags.length > 40) console.log(`\n… and ${flags.length - 40} more; pass --all`);
