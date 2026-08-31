#!/usr/bin/env node
/* Applies an edit file saved from docs/activity-editor.html back into the source
   of truth: the stage modules under /details and docs/stage-template-v2.json.
   Usage: node apply-edits.js <path-to-atlaspm-edits.json> [--dry] */
const REPO = require('path').resolve(__dirname, '../..');
const fs = require('fs');
const apply = require('./rewrite.js');
const { tpl } = require('./validate.js');

const file = process.argv[2];
const dry = process.argv.includes('--dry');
if (!file) { console.error('usage: node apply-edits.js <edits.json> [--dry]'); process.exit(1); }

const patch = JSON.parse(fs.readFileSync(file, 'utf8'));
if (patch.format !== 'atlaspm-activity-edits') { console.error('not an AtlasPM edit file'); process.exit(1); }

const STAGE_FILE = {};
for (const f of ['def','arch','tech','pdk','ipr','ams','tc','rtl','dv','dft','syn','pd','so',
                 'to','fab','pkgd','ptv','sipi','assy','evb','test','bu','mp'])
  for (const id of Object.keys(require('./' + f + '.js'))) STAGE_FILE[id] = f + '.js';

/* ---------- activity prose and structure ---------- */
const byFile = {};
for (const id in (patch.activities || {})) {
  const f = STAGE_FILE[id];
  if (!f) { console.error('unknown activity in edit file: ' + id); process.exit(1); }
  (byFile[f] = byFile[f] || {})[id] = patch.activities[id];
}
let acts = 0, fields = 0;
for (const f in byFile) {
  for (const id in byFile[f]) fields += Object.keys(byFile[f][id]).length;
  acts += Object.keys(byFile[f]).length;
  if (dry) continue;
  const banner = fs.readFileSync(__dirname + '/' + f, 'utf8').split('module.exports')[0].trimEnd();
  apply(f, banner, byFile[f]);
}

/* ---------- titles, TAT and M/M live in the template ---------- */
const TPL = REPO + '/docs/stage-template-v2.json';
let tplHits = 0;
if (patch.template && Object.keys(patch.template).length) {
  const t = JSON.parse(fs.readFileSync(TPL, 'utf8'));
  for (const s of t.stages) {
    if (patch.template[s.code]) { Object.assign(s, patch.template[s.code]); tplHits++; }
    for (const a of s.activities) if (patch.template[a.id]) { Object.assign(a, patch.template[a.id]); tplHits++; }
    for (const d of s.deliverables) if (patch.template[d.id]) { Object.assign(d, patch.template[d.id]); tplHits++; }
  }
  if (!dry) fs.writeFileSync(TPL, JSON.stringify(t, null, 1));
}

console.log(`${dry ? '[dry run] ' : ''}${fields} fields across ${acts} activities` +
            (tplHits ? ` · ${tplHits} template entries` : ''));
if (dry) process.exit(0);

/* ---------- prove the edits did not break the invariants ---------- */
for (const k of Object.keys(require.cache)) delete require.cache[k];
const { validate } = require('./validate.js');
const { details } = require('./derive.js');
const { errs, warns } = validate(details);
errs.forEach(e => console.error('ERROR ' + e));
console.log(`validator: ${errs.length} errors, ${warns.length} warnings`);
if (errs.length) { console.error('\nedits applied but invalid — fix the reported rows and re-save'); process.exit(1); }
console.log('\nnow run:  node build.js && node print.js && node topdf.js');
