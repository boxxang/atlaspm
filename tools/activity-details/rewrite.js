/* Applies a prose patch to a stage module and re-emits it.
   Patch shape: { 'DEF-01': { purpose:[...], flowNote:'', rel:{DEF-D1:'text'},
                              risks:[...], roles:['desc',...], <any other field> } } */
const fs = require('fs');
const q = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
const arr = (a, ind) => a.length
  ? '[\n' + a.map(x => ind + '  ' + q(x)).join(',\n') + ',\n' + ind + ']'
  : '[]';

function emit(id, d) {
  const i = '  ';
  const L = [];
  L.push(`'${id}': {`);
  L.push(`${i}stage:'${d.stage}', window:[${d.window.join(',')}], criticalPath:${d.criticalPath},`);
  L.push(`${i}purpose:${arr(d.purpose, i)},`);
  L.push(`${i}steps:[`);
  d.steps.forEach(s => L.push(`${i}  {n:${s.n}, text:${q(s.text)}, tat:${s.tat}, lane:'${s.lane}'},`));
  L.push(`${i}],`);
  L.push(`${i}flowNote:${d.flowNote ? q(d.flowNote) : 'null'},`);
  L.push(`${i}consumes:${arr(d.consumes, i)},`);
  L.push(`${i}produces:${arr(d.produces, i)},`);
  L.push(`${i}producedBy:[${d.producedBy.join(',')}],`);
  L.push(`${i}rel:[`);
  d.rel.forEach(r => L.push(`${i}  {id:'${r.id}', rel:'${r.rel}', text:${q(r.text)}},`));
  L.push(`${i}],`);
  L.push(`${i}risks:${arr(d.risks, i)},`);
  L.push(`${i}roles:[`);
  d.roles.forEach(r => L.push(`${i}  {r:${q(r.r)}, d:${q(r.d)}},`));
  L.push(`${i}],`);
  L.push(`${i}effort:[${d.effort.map(([l, v]) => `[${q(l)},${v}]`).join(', ')}],`);
  L.push(`${i}entry:${arr(d.entry, i)},`);
  L.push(`${i}exit:${arr(d.exit, i)},`);
  L.push(`${i}dependsOn:[${d.dependsOn.map(x => `'${x}'`).join(',')}],`);
  L.push(`${i}dependsNote:${d.dependsNote ? q(d.dependsNote) : 'null'},`);
  L.push(`${i}feedsInto:[${d.feedsInto.map(x => `'${x}'`).join(',')}],`);
  L.push(`${i}measuredBy:${arr(d.measuredBy, i)},`);
  L.push('},');
  return L.join('\n');
}

module.exports = function apply(stageFile, banner, patch) {
  const path = __dirname + '/' + stageFile;
  const mod = require(path);
  for (const id in patch) {
    if (!mod[id]) throw new Error('no such activity: ' + id);
    const p = patch[id];
    for (const k in p) {
      if (k === 'rel' && !Array.isArray(p.rel)) { for (const rid in p.rel) {
          const r = mod[id].rel.find(x => x.id === rid);
          if (!r) throw new Error(`${id} has no relation to ${rid}`);
          r.text = p.rel[rid];
        } }
      else if (k === 'roles' && typeof p.roles[0] === 'string') {
        p.roles.forEach((desc, n) => { if (desc) mod[id].roles[n].d = desc; });
      }
      else mod[id][k] = p[k];
    }
  }
  const body = Object.keys(mod).map(id => emit(id, mod[id])).join('\n\n');
  fs.writeFileSync(path, `${banner}\nmodule.exports = {\n\n${body}\n\n};\n`);
  return Object.keys(patch).length;
};
