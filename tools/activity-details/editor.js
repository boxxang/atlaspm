/* Builds docs/activity-editor.html — every field of every activity, editable,
   with the edits saved out as a patch this repo can apply back. */
const REPO = require('path').resolve(__dirname, '../..');
const fs = require('fs');
const { details, links, tensions } = require('./derive.js');
const { tpl } = require('./validate.js');
const glossary = require('./glossary.js');

const termsOf = id => {
  const d = details[id];
  const hay = ' ' + [...d.purpose, ...d.risks, ...d.consumes, ...d.produces, ...d.entry, ...d.exit,
    ...d.measuredBy, d.flowNote || '', ...d.steps.map(x => x.text), ...d.rel.map(x => x.text),
    ...d.roles.map(r => r.r + ' ' + r.d), ...d.effort.map(e => e[0])].join(' ').replace(/<[^>]+>/g, ' ') + ' ';
  return Object.keys(glossary).filter(k => {
    const t = k.replace(/ \(.*\)$/, '');
    return new RegExp('(^|[^A-Za-z0-9/-])' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^A-Za-z0-9/-]|$)').test(hay);
  });
};

const DATA = JSON.stringify({
  stages: tpl.stages.map(s => ({
    code: s.code, name: s.name, n: s.n, band: s.band,
    start: s.startOffsetWeeks, dur: s.durationWeeks,
    activities: s.activities.map(a => ({ id: a.id, text: a.text, tat: a.tatWeeks, mm: a.manMonths, cont: a.continuous })),
    deliverables: s.deliverables,
  })),
  bands: tpl.bands,
  details: Object.fromEntries(Object.entries(details).map(([id, d]) => [id, {
    ...d, links: links[id], terms: termsOf(id),
  }])),
  glossary,
  tensions,
});

const render = require('./viewer.js');
fs.writeFileSync(REPO + '/docs/activity-editor.html', render(DATA, true));
console.log('editor built ·', Object.keys(details).length, 'activities, every item editable in place');
