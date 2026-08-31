/* Gives every step an output. Where the authored name already exists in the
   activity's output list it was simply attributed to the wrong step, so it is
   re-pointed rather than duplicated. Outputs end up ordered by step. */
const apply = require('./rewrite.js');
const NEW = require('./step-outputs.js');
const fs = require('fs');

const FILES = ['def','arch','tech','pdk','ipr','ams','tc','rtl','dv','dft','syn','pd','so',
               'to','fab','pkgd','ptv','sipi','assy','evb','test','bu','mp'];
const norm = t => String(t).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean).join(' ');

let added = 0, repointed = 0, orphaned = [];
for (const f of FILES) {
  const mod = require('./' + f + '.js');
  const patch = {};
  for (const id in mod) {
    const want = NEW[id]; if (!want) continue;
    const d = mod[id];
    const produces = d.produces.slice(), producedBy = d.producedBy.slice();
    for (const n of Object.keys(want).map(Number).sort((a, b) => a - b)) {
      const text = want[n];
      const hit = produces.findIndex(p => norm(p) === norm(text));
      if (hit >= 0) { producedBy[hit] = n; repointed++; }
      else { produces.push(text); producedBy.push(n); added++; }
    }
    /* keep the list readable: outputs in the order their steps run */
    const order = producedBy.map((s, i) => i).sort((a, b) => producedBy[a] - producedBy[b] || a - b);
    patch[id] = { produces: order.map(i => produces[i]), producedBy: order.map(i => producedBy[i]) };
  }
  if (Object.keys(patch).length) {
    const banner = fs.readFileSync(__dirname + '/' + f + '.js', 'utf8').split('module.exports')[0].trimEnd();
    apply(f + '.js', banner, patch);
  }
}
for (const k of Object.keys(require.cache)) delete require.cache[k];
const { details } = require('./derive.js');
let steps = 0, covered = 0;
for (const id in details) {
  const d = details[id], has = new Set(d.producedBy.map(Number));
  steps += d.steps.length;
  d.steps.forEach(st => { if (has.has(st.n)) covered++; else orphaned.push(id + ' s' + st.n); });
}
console.log(`added ${added} outputs · re-pointed ${repointed} that were on the wrong step`);
console.log(`steps ${steps} · with an output ${covered} · without ${orphaned.length}`);
orphaned.slice(0, 12).forEach(x => console.log('  ' + x));
const { validate } = require('./validate.js');
const { errs, warns } = validate(details);
console.log(`validator: ${errs.length} errors, ${warns.length} warnings`);
errs.slice(0, 5).forEach(e => console.log('  ' + e));
