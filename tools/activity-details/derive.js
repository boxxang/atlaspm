/* /details/derive.js — everything the renderers should compute rather than trust.
 *
 * Three things were wrong with reading the authored fields directly:
 *   1. parallel steps were drawn from the window start, so a step that can only
 *      begin once an earlier main step has produced something was drawn before it;
 *   2. dependsOn and feedsInto were authored independently, so 764 of the 1369
 *      edges existed in only one direction and the chips were one-way streets;
 *   3. an edge whose source starts after its target ends is not a hand-off at all
 *      — it is feedback, and the template has activities (TC-08, PTV-12) whose
 *      whole job is exactly that.
 * All three are resolved here, from the data, so nothing is stored twice.
 */
const { tpl } = require('./validate.js');

const MODULES = ['./def.js','./arch.js','./tech.js','./pdk.js','./ipr.js','./ams.js','./tc.js','./rtl.js',
                 './dv.js','./dft.js','./syn.js','./pd.js','./so.js','./to.js','./fab.js','./pkgd.js',
                 './ptv.js','./sipi.js','./assy.js','./evb.js','./test.js','./bu.js','./mp.js'];
const details = Object.assign({}, ...MODULES.map(m => require(m)));

/* Edges the audit showed to be simply wrong rather than late: the arrow points
 * the wrong way, or the input is already produced inside the depending activity. */
const DROP = new Set([
  'FAB-10>TEST-05',   // sort program feeds wafer logistics, not the reverse
  'ASSY-05>ASSY-06',  // ASSY-05 carries its own final visual and dimensional inspection
  'MP-12>BU-12',      // BU-12 needs a preliminary datasheet, which it assembles itself
]);

const index = {};
for (const s of tpl.stages) for (const a of s.activities) index[a.id] = { a, s };
const has = id => !!details[id];
const absWindow = id => {
  const d = details[id], s = index[id].s;
  return [s.startOffsetWeeks + d.window[0], s.startOffsetWeeks + d.window[1]];
};

/* ---------- 1. step placement ---------- */
/** A parallel step runs alongside the main step it follows in the numbering;
 *  consecutive parallel steps queue behind each other. */
function placeSteps(id) {
  const d = details[id];
  let main = d.window[0], par = d.window[0], prevMainStart = d.window[0], prevWasMain = false;
  return d.steps.map(st => {
    if (st.lane === 'main') {
      const x = main; prevMainStart = x; main += st.tat; prevWasMain = true;
      return { st, x, end: main };
    }
    if (prevWasMain) par = prevMainStart;
    const x = par; par += st.tat; prevWasMain = false;
    return { st, x, end: par };
  });
}

/* ---------- 2 + 3. the link graph ---------- */
const edges = new Set();
for (const id in details) {
  for (const x of details[id].feedsInto) if (has(x)) edges.add(id + '>' + x);
  for (const x of details[id].dependsOn) if (has(x)) edges.add(x + '>' + id);
}
for (const e of DROP) edges.delete(e);

const links = {};
for (const id in details) links[id] = { dependsOn: [], feedsInto: [], runsWith: [], revisedBy: [], feedsBackInto: [] };
const tensions = [];
const forward = e => { const [u, v] = e.split('>'); const [uS] = absWindow(u), [, vE] = absWindow(v); return uS < vE; };
for (const e of edges) {
  const [u, v] = e.split('>');
  const [uS, uE] = absWindow(u), [vS, vE] = absWindow(v);
  if (uS >= vE) {                       // cannot be a hand-off: u begins after v is done
    links[v].revisedBy.push(u);
    links[u].feedsBackInto.push(v);
    tensions.push({ from: u, to: v, uS, uE, vS, vE, gap: +(uS - vE).toFixed(1) });
  } else if (edges.has(v + '>' + u) && forward(v + '>' + u)) {
    /* both directions are hand-offs and the windows overlap: neither leads. */
    links[u].runsWith.push(v);
  } else {
    links[v].dependsOn.push(u);
    links[u].feedsInto.push(v);
  }
}
for (const id in links) links[id].runsWith = [...new Set(links[id].runsWith)];
const byOrder = (a, b) => (index[a].s.n - index[b].s.n) || a.localeCompare(b, 'en', { numeric: true });
for (const id in links) for (const k in links[id]) links[id][k].sort(byOrder);
tensions.sort((a, b) => b.gap - a.gap);

module.exports = { details, index, has, absWindow, placeSteps, links, tensions, edges, DROP };
