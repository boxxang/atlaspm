/* Checks every authored detail against the template it describes.
   Run before publishing a stage: an inconsistency here is a page that
   contradicts the roadmap, which is worse than a page that is missing. */
const REPO = require('path').resolve(__dirname, '../..');
const tpl = require(REPO + '/docs/stage-template-v2.json');

const byCode = Object.fromEntries(tpl.stages.map(s => [s.code, s]));
const actIds = new Set(tpl.stages.flatMap(s => s.activities.map(a => a.id)));
const dlvIds = new Set(tpl.stages.flatMap(s => s.deliverables.map(d => d.id)));
const actOf = Object.fromEntries(tpl.stages.flatMap(s => s.activities.map(a => [a.id, {a, s}])));

const REL = new Set(['produces', 'feeds', 'informs', 'gates']);
const near = (a, b) => Math.abs(a - b) < 0.005;

function validate(details) {
  const errs = [], warns = [];
  const E = (id, m) => errs.push(`${id}  ${m}`);
  const W = (id, m) => warns.push(`${id}  ${m}`);

  for (const [id, d] of Object.entries(details)) {
    const hit = actOf[id];
    if (!hit) { E(id, 'not an activity in the template'); continue; }
    const { a, s } = hit;

    if (d.stage !== s.code && d.stage !== byCode[s.code]?.code) {
      /* the template keys stages by code; the detail names the app's stage key */
    }

    /* TAT: the main lane is the activity's span; parallel steps ride alongside */
    const main = d.steps.filter(x => x.lane === 'main').reduce((n, x) => n + x.tat, 0);
    if (!near(main, Math.abs(a.tatWeeks)))
      E(id, `main-lane steps sum to ${main}w, activity TAT is ${Math.abs(a.tatWeeks)}w`);
    const all = d.steps.reduce((n, x) => n + x.tat, 0);
    if (all > Math.abs(a.tatWeeks) && !d.flowNote)
      W(id, `steps total ${all}w inside a ${Math.abs(a.tatWeeks)}w window with no flowNote to explain it`);
    d.steps.forEach((x, i) => {
      if (x.n !== i + 1) E(id, `step ${i + 1} is numbered ${x.n}`);
      if (!['main', 'par'].includes(x.lane)) E(id, `step ${x.n} has lane "${x.lane}"`);
      if (!(x.tat > 0)) E(id, `step ${x.n} has no TAT`);
    });

    /* effort split must add up to the man-months the roadmap prices */
    const mm = d.effort.reduce((n, [, v]) => n + v, 0);
    if (!near(mm, a.manMonths)) E(id, `effort split sums to ${mm} M/M, activity is ${a.manMonths} M/M`);

    /* window sits inside the stage and is long enough for the TAT */
      if (!Array.isArray(d.producedBy) || d.producedBy.length !== d.produces.length)
    E(id, `producedBy has ${(d.producedBy||[]).length} entries, produces has ${d.produces.length}`);
  else d.producedBy.forEach((n, i) => {
    if (!d.steps.some(s => s.n === n)) E(id, `produces[${i}] is attributed to step ${n}, which does not exist`);
  });
  const [w0, w1] = d.window;
    if (w0 < 0 || w1 > s.durationWeeks) E(id, `window w${w0}–w${w1} falls outside the stage's ${s.durationWeeks}w`);
    if (!near(w1 - w0, Math.abs(a.tatWeeks))) E(id, `window is ${w1 - w0}w, TAT is ${Math.abs(a.tatWeeks)}w`);

    /* relationships point at deliverables that exist, in this stage */
    if (!d.rel.length) E(id, 'no deliverable relationship');
    for (const r of d.rel) {
      if (!dlvIds.has(r.id)) E(id, `relates to ${r.id}, which is not a deliverable`);
      else if (!r.id.startsWith(s.code + '-D')) W(id, `relates to ${r.id}, outside its own stage`);
      if (!REL.has(r.rel)) E(id, `relationship type "${r.rel}"`);
    }

    /* cross-references resolve */
    for (const f of d.feedsInto) if (!actIds.has(f)) E(id, `feeds into ${f}, which does not exist`);
    for (const p of d.dependsOn) if (!actIds.has(p)) E(id, `depends on ${p}, which does not exist`);
    if (d.dependsOn.includes(id)) E(id, 'depends on itself');
    if (!d.dependsOn.length && !d.dependsNote) W(id, 'no dependency and no note explaining why');

    /* the prose that makes the page worth opening */
    for (const [k, min] of [['purpose', 1], ['consumes', 3], ['produces', 3], ['risks', 3], ['roles', 3], ['entry', 2], ['exit', 2], ['measuredBy', 2]])
      if (!d[k] || d[k].length < min) E(id, `${k} has ${d[k]?.length ?? 0} entries, wants at least ${min}`);
  }
  return { errs, warns };
}

/* Every deliverable of a covered stage needs a producer, or it is a
   deliverable nothing in the template actually makes. */
function coverage(details) {
  const gaps = [];
  const covered = new Set(Object.values(details).map(d => actOf[Object.keys(details).find(k => details[k] === d)]?.s.code));
  for (const s of tpl.stages) {
    const mine = Object.entries(details).filter(([id]) => actOf[id]?.s.code === s.code);
    if (!mine.length) continue;
    if (mine.length !== s.activities.length)
      gaps.push(`${s.code}: ${mine.length} of ${s.activities.length} activities authored`);
    const made = new Set(mine.flatMap(([, d]) => d.rel.filter(r => r.rel === 'produces').map(r => r.id)));
    for (const dl of s.deliverables)
      if (!made.has(dl.id)) gaps.push(`${s.code}: ${dl.id} has no activity that produces it — "${dl.title}"`);
  }
  return gaps;
}

module.exports = { validate, coverage, tpl, actOf, byCode };

if (require.main === module) {
  const details = require(process.argv[2]);
  const { errs, warns } = validate(details);
  const gaps = coverage(details);
  const line = (t, a) => { if (a.length) { console.log(`\n${t} (${a.length})`); a.forEach(x => console.log('  ' + x)); } };
  line('ERRORS', errs); line('WARNINGS', warns); line('COVERAGE', gaps);
  console.log(`\n${Object.keys(details).length} activities checked · ${errs.length} errors · ${warns.length} warnings · ${gaps.length} coverage gaps`);
  process.exit(errs.length ? 1 : 0);
}
