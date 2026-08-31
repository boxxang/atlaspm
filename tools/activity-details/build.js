const REPO = require('path').resolve(__dirname, '../..');
const fs = require('fs');
const { validate, coverage, tpl, actOf } = require('./validate.js');
const { details, links, tensions, placeSteps, absWindow, DROP } = require('./derive.js');
const glossary = require('./glossary.js');

const { errs, warns } = validate(details);
if (errs.length) { errs.forEach(e => console.error('ERROR ' + e)); process.exit(1); }

/* ---------- the asset: what eventually goes into the app ---------- */
const glossaryHits = id => {
  const d = details[id];
  const hay = ' ' + [...d.purpose, ...d.risks, ...d.consumes, ...d.produces, ...d.entry, ...d.exit,
    ...d.measuredBy, d.flowNote || '', ...d.steps.map(x => x.text), ...d.rel.map(x => x.text),
    ...d.roles.map(r => r.r + ' ' + r.d), ...d.effort.map(e => e[0])].join(' ').replace(/<[^>]+>/g, ' ') + ' ';
  return Object.keys(glossary).filter(k => {
    const t = k.replace(/ \(.*\)$/, '');
    return new RegExp('(^|[^A-Za-z0-9/-])' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^A-Za-z0-9/-]|$)').test(hay);
  });
};

const asset = {
  version: 'v3',
  note: 'Activity detail content. Titles, TAT, M/M and stage windows are NOT duplicated here — join on the id against docs/stage-template-v2.json. `links` is derived: dependsOn/feedsInto are the authored edges taken as one symmetric set, runsWith holds pairs where each side hands off to the other, and revisedBy/feedsBackInto hold edges whose source starts after its target ends. `steps[].startWeek` is derived too: a parallel step runs alongside the main step it follows. `producedBy` is index-aligned to `produces` and names the step each output comes out of, so a page can show what every step contributes to the deliverable. `terms` lists the glossary keys the entry uses.',
  authored: Object.keys(details).length,
  totalActivities: tpl.stages.reduce((n, s) => n + s.activities.length, 0),
  activities: Object.fromEntries(Object.entries(details).map(([id, d]) => [id, {
    ...d,
    steps: placeSteps(id).map(p => ({ ...p.st, startWeek: +p.x.toFixed(2), endWeek: +p.end.toFixed(2) })),
    absWindow: absWindow(id),
    links: links[id],
    terms: glossaryHits(id),
  }])),
  glossary,
  scheduleTensions: tensions,
  droppedEdges: [...DROP],
};
fs.writeFileSync(REPO + '/docs/activity-details.json', JSON.stringify(asset, null, 2));

/* ---------- the viewer ---------- */
const esc = s => String(s).replace(/&(?![a-z#]+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const DATA = JSON.stringify({
  stages: tpl.stages.map(s => ({
    code: s.code, name: s.name, n: s.n, band: s.band,
    start: s.startOffsetWeeks, dur: s.durationWeeks,
    activities: s.activities.map(a => ({ id: a.id, text: a.text, tat: a.tatWeeks, mm: a.manMonths, cont: a.continuous })),
    deliverables: s.deliverables,
  })),
  bands: tpl.bands,
  details: Object.fromEntries(Object.entries(details).map(([id, d]) => [id, {
    ...d,
    placed: placeSteps(id).map(p => ({ n: p.st.n, x: +p.x.toFixed(3), tat: p.st.tat, lane: p.st.lane })),
    links: links[id],
    terms: glossaryHits(id),
  }])),
  glossary,
  tensions,
});

const render = require('./viewer.js');
fs.writeFileSync(REPO + '/docs/activity-details.html', render(DATA, false));

const gaps = coverage(details);
console.log(`built · ${Object.keys(details).length} authored of ${asset.totalActivities} · ${warns.length} warnings · ${gaps.length} coverage gaps`);

