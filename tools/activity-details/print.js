/* Builds a paginated, print-only rendering of every authored activity, plus a
   contents page and per-stage dividers. Chromium turns the heading hierarchy
   into a PDF outline and the #anchor links into internal GoTo links. */
const REPO = require('path').resolve(__dirname, '../..');
const fs = require('fs');
const { validate, tpl } = require('./validate.js');
const { details, links, tensions, placeSteps, absWindow } = require('./derive.js');
const glossary = require('./glossary.js');
const { errs } = validate(details);
if (errs.length) { errs.forEach(e => console.error('ERROR ' + e)); process.exit(1); }

const esc = s => String(s).replace(/&(?![a-z#]+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const wk = w => String(w) + 'w';   /* toFixed(1) was rounding 0.75w to 0.8w */
const pad = n => String(n).padStart(2, '0');
const has = id => !!details[id];

const actIndex = {};
for (const s of tpl.stages) for (const a of s.activities) actIndex[a.id] = { a, s };
const titleOf = id => (actIndex[id] ? actIndex[id].a.text : 'not in template');

const bandName = b => (tpl.bands.find(x => x.id === b) || {}).label || b;

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

/* Connections are navigation, not reading matter: on paper the id is the
 * address and the title is a page turn away, so chips beat a titled list.
 * Twenty-five titled rows per activity cost about a hundred pages across the set. */
function chain(ids, anchor) {
  return `<p class="chain">${ids.map(x => {
    let tag = '';
    if (anchor) { const [uS] = absWindow(x), [, vE] = absWindow(anchor); tag = `<b class="gap">+${+(uS - vE).toFixed(1)}w</b>`; }
    return `<a href="#${x}">${x}${tag}</a>`;
  }).join('')}</p>`;
}

/* ---------- one activity ---------- */
function activity(id) {
  const d = details[id];
  const L = links[id], T = termsOf(id);
  const { a, s } = actIndex[id];
  const span = d.window[1] - d.window[0];
  const fte = (a.manMonths * 4.345 / Math.abs(a.tatWeeks)).toFixed(1);
  const pos = w => ((w - d.window[0]) / span * 100);
  const placed = placeSteps(id);
  const ticks = [];
  for (let w = d.window[0]; w <= d.window[1] + 0.001; w += span <= 4 ? 1 : Math.ceil(span / 5)) ticks.push(w);
  if (ticks[ticks.length - 1] !== d.window[1]) ticks.push(d.window[1]);
  const lanes = ['main', 'par'].filter(l => d.steps.some(x => x.lane === l));

  const gives = {};
  d.produces.forEach((p, i) => (gives[d.producedBy[i]] = gives[d.producedBy[i]] || []).push(p));
  const owns = d.rel.filter(r => r.rel === 'produces');
  const dTitle = x => (s.deliverables.find(y => y.id === x) || {}).title || x;

  return `<article class="act" id="${id}">
  <header class="act-head">
    <p class="act-crumb">${pad(s.n)} ${esc(s.code)} · ${esc(s.name)}</p>
    <h2><span class="act-id">${id}</span>${esc(a.text)}</h2>
  </header>

  <div class="facts">
    <div><span class="k">Takes</span><span class="v">${wk(Math.abs(a.tatWeeks))}${a.continuous ? ' <small>cont.</small>' : ''}</span><span class="d">w${d.window[0]}–w${d.window[1]} of the stage</span></div>
    <div><span class="k">Costs</span><span class="v">${a.manMonths.toFixed(1)} <small>M/M</small></span><span class="d">~${fte} people while it runs</span></div>
    <div><span class="k">Owner</span><span class="v sm">${esc(d.roles[0].r)}</span><span class="d">${esc(d.roles[d.roles.length - 1].r)} approves</span></div>
    <div><span class="k">Critical path</span><span class="v">${d.criticalPath ? 'yes' : 'no'}</span><span class="d">${d.criticalPath ? 'slipping moves the program' : 'has float'}</span></div>
  </div>

  <div class="cols">
    <div class="main">
      <section><p class="cap">Why it exists</p>${d.purpose.map(p => `<p class="lede">${p}</p>`).join('')}</section>

      <section><p class="cap">What it delivers</p>
        ${owns.length ? owns.map(r => `<div class="deliv">
          <p class="deliv-h"><span class="did">${r.id}</span>${esc(dTitle(r.id))}</p>
          <p class="deliv-w">${r.text.replace(/^<b>[^<]*<\/b>\s*/, '')}</p></div>`).join('')
          : `<p class="none">No key deliverable is owned here — this activity contributes to the ones below.</p>`}
      </section>

      <section><p class="cap">Needs first</p><ul>${d.consumes.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>

      <section><p class="cap">Done when</p><ul class="crit">${d.exit.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>

      <section class="flow-sec"><p class="cap">How it gets there <em>${d.steps.length} steps · ${lanes.length} lane${lanes.length > 1 ? 's' : ''}</em></p>
        <div class="flow">
          <div class="axis">${ticks.map(w => `<span style="left:${pos(w).toFixed(1)}%">w${w}</span>`).join('')}</div>
          ${lanes.map(l => `<p class="lane-tag">${l === 'main' ? 'Main sequence' : 'In parallel'}</p>
          <div class="lane">${placed.filter(p => p.st.lane === l).map(p =>
            `<span class="step${l === 'par' ? ' par' : ''}" style="left:${pos(p.x).toFixed(2)}%;width:${(p.st.tat / span * 100).toFixed(2)}%"><b>${p.st.n}</b></span>`).join('')}</div>`).join('')}
        </div>
        <table class="steps"><thead><tr><th>#</th><th>Step, and what it adds to the deliverable</th><th>TAT</th></tr></thead><tbody>
        ${d.steps.map(st => `<tr><td class="n">${st.n}</td>
          <td>${esc(st.text)}${st.lane === 'par' ? '<em class="ln">runs in parallel</em>' : ''}
            ${gives[st.n] ? `<span class="gives">${gives[st.n].map(esc).join(' · ')}</span>` : ''}</td>
          <td class="w">${wk(st.tat)}</td></tr>`).join('')}
        </tbody></table>
        ${d.flowNote ? `<p class="note">${esc(d.flowNote)}</p>` : ''}
      </section>

      <section><p class="cap">Watch out for</p><ul class="risks">${d.risks.map(x => `<li>${x}</li>`).join('')}</ul></section>
    </div>

    <aside class="side">
      <section><p class="cap">Where the effort goes <em>${a.manMonths} M/M</em></p><dl class="split">
        ${d.effort.map(([l, v]) => `<div><dt>${esc(l)}</dt><dd>${v.toFixed(1)}</dd></div>`).join('')}
      </dl></section>

      <section><p class="cap">Who is on it <em>~${fte} FTE</em></p><div class="roles">
        ${d.roles.map((r, i) => `<p><b>${esc(r.r)}</b>${i === 0 ? '<em class="owns">owns it</em>' : ''}</p>`).join('')}
      </div></section>

      <section><p class="cap">Connections</p>
        ${[['Depends on', L.dependsOn, false], ['Runs with', L.runsWith, false], ['Feeds into', L.feedsInto, false],
           ['Later input', L.revisedBy, true], ['Feeds back into', L.feedsBackInto, false]]
          .filter(([, v]) => v.length)
          .map(([label, v, gap]) => `<div class="conn"><p class="conn-k">${label}</p>${chain(v, gap ? id : null)}</div>`).join('')}
        ${!L.dependsOn.length && d.dependsNote ? `<p class="none">${esc(d.dependsNote)}</p>` : ''}
      </section>

      ${T.length ? `<section><p class="cap">Terms here <em>${T.length}</em></p>
        <p class="termlist">${T.map(t => `<a href="#term-${encodeURIComponent(t)}">${esc(t)}</a>`).join('')}</p></section>` : ''}
    </aside>
  </div>
</article>`;
}

/* ---------- one stage divider ---------- */
function stageDivider(s) {
  const mm = s.activities.reduce((n, a) => n + a.manMonths, 0);
  const crit = s.activities.filter(a => details[a.id] && details[a.id].criticalPath).length;
  return `<section class="stage" id="stage-${s.code}">
  <p class="stage-band">${esc(bandName(s.band))}</p>
  <h1><span class="stage-n">${pad(s.n)}</span>${esc(s.name)}<span class="stage-code">${esc(s.code)}</span></h1>
  <div class="stage-facts">
    <div><span class="k">Window</span><span class="v">w${s.startOffsetWeeks} – w${s.startOffsetWeeks + s.durationWeeks}</span></div>
    <div><span class="k">Duration</span><span class="v">${s.durationWeeks}<small>w</small></span></div>
    <div><span class="k">Activities</span><span class="v">${s.activities.length}</span></div>
    <div><span class="k">Effort</span><span class="v">${mm}<small> M/M</small></span></div>
    <div><span class="k">On critical path</span><span class="v">${crit}<small> of ${s.activities.length}</small></span></div>
  </div>
  <div class="stage-cols">
    <div><p class="cap">Engineering activities</p><ol class="stage-acts">
      ${s.activities.map(a => `<li><a href="#${a.id}"><span class="did">${a.id}</span><span>${esc(a.text)}</span><span class="w">${wk(Math.abs(a.tatWeeks))}${a.continuous ? ' cont.' : ''}</span><span class="mm">${a.manMonths} M/M</span></a></li>`).join('')}
    </ol></div>
    <div><p class="cap">Key deliverables</p><ol class="stage-dels">
      ${s.deliverables.map(x => `<li><span class="did">${x.id}</span><span>${esc(x.title)}</span></li>`).join('')}
    </ol></div>
  </div>
</section>`;
}

/* ---------- contents ---------- */
const totalMM = tpl.stages.reduce((n, s) => n + s.activities.reduce((m, a) => m + a.manMonths, 0), 0);
const totalActs = tpl.stages.reduce((n, s) => n + s.activities.length, 0);
const totalDels = tpl.stages.reduce((n, s) => n + s.deliverables.length, 0);
const span = Math.max(...tpl.stages.map(s => s.startOffsetWeeks + s.durationWeeks));

const contents = `<section class="toc" id="contents">
  <h1>Contents</h1>
  <p class="toc-hint">Every entry links to its page. On a tablet the PDF's bookmark panel carries the same tree.</p>
  ${tpl.bands.map(b => {
    const st = tpl.stages.filter(s => s.band === b.id);
    if (!st.length) return '';
    return `<div class="toc-band"><p class="band-cap">${esc(b.label)}</p>
      ${st.map(s => `<div class="toc-stage">
        <a class="toc-stage-head" href="#stage-${s.code}"><span class="n">${pad(s.n)}</span><span class="nm">${esc(s.name)}</span><span class="cd">${esc(s.code)}</span><span class="wd">w${s.startOffsetWeeks}–w${s.startOffsetWeeks + s.durationWeeks}</span></a>
        <ul class="toc-acts">${s.activities.map(a => `<li><a href="#${a.id}"><span class="did">${a.id}</span><span class="tx">${esc(a.text)}</span></a></li>`).join('')}</ul>
      </div>`).join('')}
    </div>`;
  }).join('')}
  <div class="toc-band"><p class="band-cap">Appendices</p>
    <div class="toc-stage">
      <a class="toc-stage-head" href="#glossary"><span class="n">A</span><span class="nm">Glossary</span><span class="cd">TERMS</span><span class="wd">${Object.keys(glossary).length} entries</span></a>
    </div>
    <div class="toc-stage">
      <a class="toc-stage-head" href="#tensions"><span class="n">B</span><span class="nm">Schedule tensions</span><span class="cd">SCHED</span><span class="wd">${tensions.length} late inputs</span></a>
    </div>
  </div>
</section>`;

const cover = `<section class="cover">
  <p class="cover-eyebrow">AtlasPM · Program Template</p>
  <h1>Engineering Activity Detail Reference</h1>
  <p class="cover-sub">A 23-stage semiconductor program template — every engineering activity's purpose, work flow, inputs, relationship to the stage's key deliverables, risks, effort and criteria.</p>
  <dl class="cover-stats">
    <div><dt>Stages</dt><dd>${tpl.stages.length}</dd></div>
    <div><dt>Activities</dt><dd>${totalActs}</dd></div>
    <div><dt>Key deliverables</dt><dd>${totalDels}</dd></div>
    <div><dt>Program span</dt><dd>${span}<small>w</small></dd></div>
    <div><dt>Total effort</dt><dd>${totalMM.toLocaleString('en-US')}<small> M/M</small></dd></div>
  </dl>
  <p class="cover-foot">Reference basis: new-architecture 4nm-class AI accelerator, 2.5D packaging with 2×HBM3.<br>
  Generated from <code>docs/activity-details.json</code> · joins on activity id against <code>docs/stage-template-v2.json</code>.</p>
</section>`;

const body = tpl.stages.map(s => stageDivider(s) + s.activities.map(a => activity(a.id)).join('\n')).join('\n');

/* ---------- appendix A — glossary ---------- */
const GROUPS = { program:'Program and commercial', process:'Process, foundry and manufacturing', ip:'IP and libraries',
  design:'Design and implementation', verif:'Verification and DFT', pkg:'Signal, power and package',
  test:'Test', qual:'Reliability and compliance', iface:'Interfaces and memory', tool:'Data formats and tooling' };
const byGroup = {};
for (const k in glossary) (byGroup[glossary[k].group] = byGroup[glossary[k].group] || []).push(k);

const appendixGlossary = `<section class="appendix" id="glossary">
  <p class="stage-band">Appendix A</p>
  <h1>Glossary<span class="stage-code">TERMS</span></h1>
  <p class="app-lede">Every abbreviation used anywhere in this document, expanded, with what it is and why a program
  manager would care. ${Object.keys(glossary).length} entries. Each activity page lists the terms it uses.</p>
  ${Object.keys(GROUPS).filter(k => byGroup[k]).map(k => `<div class="gloss-group">
    <p class="cap">${esc(GROUPS[k])} <em>${byGroup[k].length}</em></p>
    <dl class="gloss">${byGroup[k].sort().map(t => `<div id="term-${encodeURIComponent(t)}">
      <dt>${esc(t)}</dt><dd><b>${esc(glossary[t].full)}</b><span>${esc(glossary[t].note)}</span></dd></div>`).join('')}</dl>
  </div>`).join('')}
</section>`;

/* ---------- appendix B — schedule tensions ---------- */
const appendixTensions = `<section class="appendix" id="tensions">
  <p class="stage-band">Appendix B</p>
  <h1>Schedule tensions<span class="stage-code">SCHED</span></h1>
  <p class="app-lede">Every link in this template was authored as an engineering relationship, then checked against the
  calendar. These ${tensions.length} pass the first test and fail the second: the source activity starts <b>after</b> the
  activity that needs it has already closed.</p>
  <p class="app-lede">Some are expected — <code>TC-08</code> and <code>PTV-12</code> exist precisely to feed results
  backwards, and chip-package co-design iterates by construction. Others are real: an input the template assumes is
  available is not, and the receiving activity has to proceed on a provisional version. Both are listed, largest gap
  first, because only a program manager can tell them apart.</p>
  <table class="tens"><thead><tr><th>Needs it</th><th>Window</th><th>Source</th><th>Window</th><th>Gap</th><th>What the source is</th></tr></thead><tbody>
  ${tensions.map(x => `<tr>
    <td class="did"><a href="#${x.to}">${x.to}</a></td><td class="w">w${x.vS}–w${x.vE}</td>
    <td class="did"><a href="#${x.from}">${x.from}</a></td><td class="w">w${x.uS}–w${x.uE}</td>
    <td class="gap${x.gap >= 10 ? ' hot' : ''}">+${x.gap}w</td>
    <td class="tx">${esc(titleOf(x.from))}</td></tr>`).join('')}
  </tbody></table>
</section>`;

const css = fs.readFileSync(__dirname + '/print.css', 'utf8');

fs.writeFileSync(REPO + '/docs/activity-details-print.html',
`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Engineering Activity Detail Reference — AtlasPM</title>
<style>${css}</style>
</head>
<body>
${cover}
${contents}
${body}
${appendixGlossary}
${appendixTensions}
</body>
</html>`);

console.log(`print build · ${totalActs} activities · ${tpl.stages.length} stages · ${totalMM} M/M`);
