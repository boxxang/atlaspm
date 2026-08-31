/* viewer.js — the one renderer behind both docs/activity-details.html and
 * docs/activity-editor.html. `EDIT` turns the pencils on; nothing else differs. */
module.exports = function render(DATA, EDIT) {
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${EDIT ? 'Activity Editor' : 'Activity Details'} — AtlasPM</title>
<style>
:root{
  --edit:#8a6d1f;--edit-soft:#fdf6e3;--ok:#2f7d4f;
  --page:#f9f9f7;--surface:#fcfcfb;--ink:#0b0b0b;--ink-2:#52514e;--ink-3:#898781;
  --line:#e1e0d9;--line-strong:#c3c2b7;--accent:#256abf;--accent-soft:#e7effa;
  --risk:#d03b3b;--risk-soft:#fbeceb;--fs-base:17px;
  --mono:ui-monospace,"SF Mono","Cascadia Mono",Menlo,monospace;
  --sans:system-ui,-apple-system,"Segoe UI",sans-serif;
  --serif:Georgia,"Times New Roman",serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{font-family:var(--sans);font-size:var(--fs-base);line-height:1.5;color:var(--ink);background:var(--page);-webkit-font-smoothing:antialiased}
button{font:inherit;color:inherit;background:none;border:none;cursor:pointer}
code{font-family:var(--mono);font-size:.86em}

.shell{display:grid;grid-template-columns:296px minmax(0,1fr);height:100vh}

/* ---------- nav ---------- */
.nav{border-right:1px solid var(--line);background:var(--surface);display:flex;flex-direction:column;min-height:0}
.nav-head{padding:16px 18px 12px;border-bottom:1px solid var(--line)}
.nav-head h1{font-size:.86em;font-weight:650;letter-spacing:-.01em;margin-bottom:3px}
.nav-head .sub{font-family:var(--mono);font-size:.62em;color:var(--ink-3);letter-spacing:.05em}
.nav-head input{
  width:100%;margin-top:10px;border:1px solid var(--line);border-radius:4px;background:var(--page);
  padding:5px 9px;font-size:.78em;font-family:var(--sans);
}
.nav-head input:focus-visible{outline:none;border-color:var(--accent)}
.nav-tools{display:flex;gap:6px;margin-top:8px}
.nav-tools button{
  font-family:var(--mono);font-size:.58em;letter-spacing:.06em;text-transform:uppercase;
  border:1px solid var(--line-strong);border-radius:3px;padding:4px 8px;color:var(--ink-2);
}
.nav-tools button[aria-pressed="true"]{background:var(--ink);color:var(--page);border-color:var(--ink)}
.nav-list{overflow-y:auto;padding:8px 0 30px;min-height:0;flex:1}
.nav-stage{
  font-family:var(--mono);font-size:.58em;font-weight:700;letter-spacing:.11em;text-transform:uppercase;
  color:var(--ink-3);padding:12px 18px 5px;display:flex;justify-content:space-between;gap:8px;
}
.nav-stage .cnt{font-weight:400;letter-spacing:.04em}
.nav-stage.full .cnt{color:var(--accent)}
.nav-a{
  display:grid;grid-template-columns:3.9rem minmax(0,1fr);gap:8px;align-items:baseline;
  width:100%;text-align:left;padding:5px 18px;font-size:.76em;color:var(--ink-3);line-height:1.35;
  border-left:2px solid transparent;
}
.nav-a .id{font-family:var(--mono);font-size:.86em}
.nav-a.has{color:var(--ink-2)}
.nav-a.has:hover{background:var(--accent-soft)}
.nav-a[aria-current="true"]{background:var(--accent-soft);border-left-color:var(--accent);color:var(--ink)}
.nav-a:not(.has){opacity:.55;cursor:default}
.nav-a:not(.has) .id::after{content:" ·";color:var(--line-strong)}

/* ---------- detail pane ---------- */
.pane{overflow:hidden;min-height:0;display:flex;flex-direction:column}
.pane-inner{max-width:1100px;width:100%;margin:0 auto;padding:0 34px;flex:1;min-height:0;display:flex;flex-direction:column}
/* only the reading column moves; the dashboard and the rail stay put */
.pane-scroll{flex:1;min-height:0;overflow-y:auto;padding-bottom:60px}
.empty{padding:80px 34px;color:var(--ink-3);font-size:.9em;max-width:56ch;line-height:1.6}

.ad-head{
  flex:none;background:var(--page);
  display:flex;align-items:baseline;gap:13px;flex-wrap:wrap;
  padding:20px 0 13px;border-bottom:1px solid var(--line-strong);margin-bottom:22px;
}
.ad-id{font-family:var(--mono);font-size:.72em;font-weight:600;letter-spacing:.08em;color:var(--accent);background:var(--accent-soft);padding:3px 9px;border-radius:3px}
.ad-head h2{font-size:1.1em;font-weight:650;letter-spacing:-.01em}
.ad-head .spacer{flex:1}
.ad-crumb{font-family:var(--mono);font-size:.68em;color:var(--ink-3);letter-spacing:.04em}
.ad-nav{display:flex;gap:5px}
.ad-nav button{font-family:var(--mono);font-size:.66em;border:1px solid var(--line);border-radius:3px;padding:2px 8px;color:var(--ink-3)}
.ad-nav button:hover{color:var(--accent);border-color:var(--accent)}

.ad-facts{flex:none;display:grid;grid-template-columns:repeat(auto-fit,minmax(126px,1fr));border:1px solid var(--line);border-radius:5px;background:var(--surface);margin-bottom:26px;overflow:hidden}
.ad-fact{padding:11px 14px;border-right:1px solid var(--line)}
.ad-fact:last-child{border-right:0}
.ad-fact .k{display:block;font-family:var(--mono);font-size:.56em;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);margin-bottom:3px}
.ad-fact .v{font-family:var(--mono);font-size:.96em;font-variant-numeric:tabular-nums}
.ad-fact .v small{font-size:.64em;color:var(--ink-3)}
.ad-fact .d{font-family:var(--mono);font-size:.6em;color:var(--ink-3);display:block;margin-top:2px}

.ad-grid{display:grid;grid-template-columns:minmax(0,2.49fr) minmax(0,1fr);gap:32px;align-items:stretch;
  flex:1;min-height:0}
.ad-main{overflow-y:auto;min-height:0;padding:0 14px 60px 0}
.ad-main::-webkit-scrollbar{width:9px}
.ad-main::-webkit-scrollbar-thumb{background:var(--line-strong);border-radius:5px}
section.ad-sec{margin-bottom:28px}
.cap{font-family:var(--mono);font-size:.6em;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);display:flex;align-items:baseline;gap:10px;padding-bottom:6px;border-bottom:1px solid var(--line-strong);margin-bottom:12px}
.cap .n{color:var(--ink-3);font-weight:400;letter-spacing:.04em}
.ad-lede{font-family:var(--serif);font-size:.95em;line-height:1.62;color:var(--ink-2);max-width:64ch}
.ad-lede+.ad-lede{margin-top:10px}
.ad-lede b{color:var(--ink);font-weight:600}
.ad-note{font-size:.82em;line-height:1.5;color:var(--ink-2);margin-top:12px}

.ad-flow{border:1px solid var(--line);border-radius:5px;background:var(--surface);padding:14px 16px 12px}
.ad-axis{position:relative;height:15px;margin-bottom:8px;border-bottom:1px solid var(--line-strong)}
.ad-axis span{position:absolute;top:0;font-family:var(--mono);font-size:.56em;color:var(--ink-3);transform:translateX(-50%);white-space:nowrap}
.ad-lane{position:relative;height:26px;margin-bottom:5px}
.ad-lane::before{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:var(--line)}
.ad-step{position:absolute;top:2px;height:22px;border-radius:3px;background:var(--accent);color:#fff;display:flex;align-items:center;gap:6px;padding:0 7px;overflow:hidden;font-family:var(--mono);font-size:.58em;letter-spacing:.03em;white-space:nowrap}
.ad-step.par{background:var(--accent-soft);color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}
.ad-step b{font-weight:700}
.ad-lane-tag{font-family:var(--mono);font-size:.55em;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-3);margin:6px 0 2px}
.ad-steps-head,.ad-steps li{display:grid;grid-template-columns:1.6rem minmax(0,1fr) 4rem 3.8rem;gap:12px}
.ad-steps-head{font-family:var(--mono);font-size:.54em;font-weight:700;letter-spacing:.11em;text-transform:uppercase;color:var(--ink-3);padding-bottom:5px;border-bottom:1px solid var(--line-strong);margin-top:16px}
.ad-steps-head span:nth-child(4){text-align:right}
.ad-steps li .w{text-align:right}
.ad-steps{list-style:none}
.ad-steps li{align-items:baseline;padding:6px 0;border-bottom:1px solid var(--line);font-size:.85em}
.ad-steps li:last-child{border-bottom:0}
.ad-steps .n{font-family:var(--mono);font-size:.76em;color:var(--ink-3)}
.ad-steps .w{font-family:var(--mono);font-size:.74em;text-align:right;color:var(--ink-2);font-variant-numeric:tabular-nums}
.ad-steps .lane{font-family:var(--mono);font-size:.62em;letter-spacing:.06em;text-transform:uppercase;text-align:right;color:var(--ink-3)}
.ad-steps .lane.par{color:var(--accent)}

.ad-io{display:grid;grid-template-columns:1fr 1fr;gap:26px}
.ad-io h4{font-family:var(--mono);font-size:.58em;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-2);margin-bottom:8px}
ul.ad-list{list-style:none;display:flex;flex-direction:column;gap:5px}
ul.ad-list li{display:flex;gap:9px;font-size:.85em;line-height:1.45;color:var(--ink-2)}
ul.ad-list li::before{content:"—";color:var(--line-strong);font-family:var(--mono);flex:none}

.ad-rel{list-style:none}
.ad-rel li{display:grid;grid-template-columns:4.4rem 5.4rem minmax(0,1fr);gap:11px;align-items:baseline;padding:9px 0;border-bottom:1px solid var(--line)}
.ad-rel li:last-child{border-bottom:0}
.ad-rel .did{font-family:var(--mono);font-size:.7em;color:var(--accent);font-weight:600}
.rel{font-family:var(--mono);font-size:.55em;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border:1px solid currentColor;border-radius:3px;padding:2px 0;text-align:center}
.rel.produces{color:var(--accent);background:var(--accent-soft)}
.rel.feeds,.rel.informs{color:var(--ink-2)}
.rel.gates{color:var(--risk);background:var(--risk-soft)}
.ad-rel .txt{font-size:.87rem;font-size:.85em;line-height:1.45;color:var(--ink-2)}
.ad-rel .txt b{color:var(--ink);font-weight:600}

ul.ad-risks{list-style:none}
ul.ad-risks.simple li{padding:5px 0 5px 22px}
.ad-risks.simple li::before{top:9px}
.ad-risks li{display:flex;gap:10px;font-size:.85em;line-height:1.45;color:var(--ink-2);padding:8px 0;border-bottom:1px solid var(--line);align-items:baseline}
ul.ad-risks li:last-child{border-bottom:0}
ul.ad-risks li::before{content:"▲";color:var(--risk);font-size:.7em;flex:none}
ul.ad-risks b{color:var(--ink);font-weight:600}

.ad-side{border:1px solid var(--line);border-radius:5px;background:var(--surface);padding:16px 18px 18px;
  overflow-y:auto;min-height:0;align-self:stretch}
.ad-side section{margin-bottom:22px}
.ad-side section:last-child{margin-bottom:0}
.ad-kv,.ad-split,.ad-roles{display:flex;flex-direction:column}
.ad-kv div{display:flex;justify-content:space-between;gap:12px;align-items:baseline;padding:6px 0;border-bottom:1px solid var(--line);font-size:.82em}
.ad-kv div:last-child{border-bottom:0}
.ad-kv .k{color:var(--ink-3)}
.ad-kv .v{font-family:var(--mono);font-size:.92em;font-variant-numeric:tabular-nums;text-align:right}
.ad-split div{display:grid;grid-template-columns:minmax(0,1fr) 2.6rem;gap:10px;align-items:baseline;padding:5px 0;border-bottom:1px solid var(--line);font-size:.8em;color:var(--ink-2)}
.ad-split div:last-child{border-bottom:0;color:var(--ink);font-weight:600}
.ad-split .mm{font-family:var(--mono);font-size:.92em;text-align:right;font-variant-numeric:tabular-nums}
.ad-roles div{padding:7px 0;border-bottom:1px solid var(--line);font-size:.79em;color:var(--ink-3);line-height:1.4}
.ad-roles div:last-child{border-bottom:0}
.ad-roles b{display:block;color:var(--ink);font-weight:600;font-size:1.04em;margin-bottom:1px}
.ad-crit li{font-size:.82em}
.ad-crit li::before{content:"·";color:var(--ink-3);font-family:var(--mono)}
.ad-chain{display:flex;flex-wrap:wrap;gap:5px}
.ad-chain button{font-family:var(--mono);font-size:.66em;letter-spacing:.04em;color:var(--ink-2);border:1px solid var(--line);border-radius:3px;padding:3px 7px;background:var(--page)}
.ad-chain button:hover{color:var(--accent);border-color:var(--accent);background:var(--accent-soft)}
.ad-chain button.dead{opacity:.45;cursor:default}
.ad-none{font-size:.78em;color:var(--ink-3);line-height:1.45}

@media (max-width:1080px){.ad-grid{grid-template-columns:minmax(0,1fr)}.ad-io{grid-template-columns:1fr}}
/* ---------- term card ---------- */
#termpop[hidden]{display:none}
#termpop{position:fixed;inset:0;z-index:40;display:grid;place-items:center;padding:24px}
.tp-scrim{position:absolute;inset:0;background:rgba(18,18,16,.34)}
.tp-card{position:relative;width:min(430px,100%);background:var(--surface);border:1px solid var(--line-strong);
  border-radius:7px;box-shadow:0 18px 44px rgba(0,0,0,.19);padding:20px 22px 18px}
.tp-x{position:absolute;top:9px;right:11px;font-size:1.15rem;line-height:1;color:var(--ink-3);padding:3px 6px;border-radius:3px}
.tp-x:hover{color:var(--ink);background:var(--page)}
.tp-group{font-family:var(--mono);font-size:.58rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--ink-3)}
.tp-k{font-family:var(--mono);font-size:1.24rem;font-weight:700;color:var(--accent);letter-spacing:.02em;margin-top:7px}
.tp-full{font-size:1rem;font-weight:600;color:var(--ink);margin-top:3px}
.tp-note{font-size:.88rem;line-height:1.55;color:var(--ink-2);margin-top:9px}
.tp-more{margin-top:15px;padding-top:12px;border-top:1px solid var(--line)}
.tp-more button{font-family:var(--mono);font-size:.66rem;letter-spacing:.06em;color:var(--accent)}
.tp-more button:hover{text-decoration:underline}

/* ---------- edit layer ---------- */
[data-e]{position:relative}
[data-e]>.pen{position:absolute;top:-3px;right:-26px;width:21px;height:21px;border-radius:4px;
  display:flex;align-items:center;justify-content:center;color:var(--ink-3);background:var(--surface);
  border:1px solid var(--line-strong);font-size:11px;line-height:1;z-index:2;
  opacity:.18;transition:opacity .12s}
[data-e]:hover>.pen,[data-e].on>.pen{opacity:1}
[data-e]>.pen:hover{color:var(--accent);border-color:var(--accent)}
[data-e].on{background:var(--edit-soft);box-shadow:0 0 0 4px var(--edit-soft);border-radius:3px}
[data-e].on>.pen{color:var(--edit);border-color:var(--edit)}
.ad-steps li [data-e]>.pen,.ad-side [data-e]>.pen{right:-20px}
.give{display:block}
.give-none{color:var(--ink-3)}

#tools{position:fixed;right:18px;bottom:16px;z-index:30;display:flex;align-items:center;gap:7px;
  background:var(--surface);border:1px solid var(--line-strong);border-radius:7px;
  box-shadow:0 6px 20px rgba(0,0,0,.13);padding:7px 10px}
#tools .st{font-family:var(--mono);font-size:.66rem;color:var(--ink-3);padding-right:3px}
#tools .st b{color:var(--edit)}
#tools .st .bad{color:var(--risk)}
#tools button{font-family:var(--mono);font-size:.63rem;letter-spacing:.05em;border:1px solid var(--line-strong);
  border-radius:4px;padding:4px 9px;color:var(--ink-2)}
#tools button:hover{border-color:var(--accent);color:var(--accent)}
#tools button.primary{background:var(--accent);border-color:var(--accent);color:#fff}
#tools button:disabled{opacity:.4;cursor:default;border-color:var(--line-strong);color:var(--ink-3)}

#ep{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:24px}
#ep[hidden]{display:none}
#ep .scrim{position:absolute;inset:0;background:rgba(18,18,16,.3)}
#ep .card{position:relative;width:min(620px,100%);max-height:84vh;overflow-y:auto;background:var(--surface);
  border:1px solid var(--line-strong);border-radius:7px;box-shadow:0 18px 44px rgba(0,0,0,.2);padding:18px 20px}
#ep .ttl{font-family:var(--mono);font-size:.6rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--ink-3)}
#ep .sub{font-size:.78rem;color:var(--ink-3);margin-top:3px}
#ep label{display:block;font-family:var(--mono);font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;
  color:var(--ink-3);margin:12px 0 4px}
#ep textarea,#ep input,#ep select{width:100%;padding:7px 9px;font-size:.86rem;line-height:1.5;
  border:1px solid var(--line-strong);border-radius:4px;background:var(--page);font-family:var(--sans);resize:vertical}
#ep textarea:focus,#ep input:focus,#ep select:focus{outline:2px solid var(--accent-soft);border-color:var(--accent)}
#ep .prev{font-size:.82rem;line-height:1.5;color:var(--ink-2);border-left:2px solid var(--line);padding:4px 0 0 9px;margin-top:7px}
#ep .prev b{color:var(--ink)} #ep .prev code{background:var(--page);padding:1px 4px;border-radius:3px}
#ep .row{display:flex;gap:8px;margin-top:16px;align-items:center}
#ep .row .grow{flex:1}
#ep .row button{font-family:var(--mono);font-size:.66rem;border:1px solid var(--line-strong);border-radius:4px;padding:6px 12px;color:var(--ink-2)}
#ep .row button.primary{background:var(--accent);border-color:var(--accent);color:#fff}
#ep .row button.warn{color:var(--edit);border-color:var(--edit)}
#ep .chk{margin-top:13px;padding-top:11px;border-top:1px solid var(--line)}
#ep .chk p{font-size:.78rem;line-height:1.5;padding-left:15px;position:relative;color:var(--ink-2)}
#ep .chk p.bad{color:var(--risk)}
#ep .chk p.bad::before{content:"!";position:absolute;left:0;font-weight:700}
#ep .chk p.ok::before{content:"✓";position:absolute;left:0;color:var(--ok)}

@media (max-width:1000px){
  /* too narrow to hold a rail open — fall back to one scrolling document */
  .pane{overflow-y:auto}
  .pane-inner{display:block;padding-bottom:60px}
  .ad-head{position:sticky;top:0;z-index:3}
  .ad-grid{display:block;min-height:0}
  .ad-main{overflow:visible;padding:0}
  .ad-side{overflow:visible;margin-top:26px}
  .pane-scroll{overflow:visible}
}

/* ---------- outcome-first layout ---------- */
.sub-cap{font-family:var(--mono);font-size:.6rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;
  color:var(--ink-3);display:flex;align-items:baseline;gap:9px;margin:18px 0 8px}
.sub-cap .n{letter-spacing:.02em;text-transform:none;font-weight:400;opacity:.8}
.deliv{border-left:3px solid var(--accent);background:var(--accent-soft);border-radius:0 5px 5px 0;padding:11px 14px;margin-bottom:9px}
.deliv+.deliv{margin-top:9px}
.deliv-h{display:flex;align-items:baseline;gap:9px;font-size:1.02rem;font-weight:600;letter-spacing:-.01em;color:var(--ink)}
.deliv-h .did{font-family:var(--mono);font-size:.72rem;font-weight:700;color:#fff;background:var(--accent);
  padding:2px 6px;border-radius:3px;flex:none}
.deliv-w{font-size:.87rem;line-height:1.5;color:var(--ink-2);margin-top:5px}
.deliv-w b{color:var(--ink);font-weight:600}
.ad-from{font-size:.87rem;line-height:1.5;color:var(--ink-2);margin-top:11px}
.ad-from b{font-family:var(--mono);font-size:.8em;color:var(--accent)}
.stepref{font-family:var(--mono);font-size:.68rem;color:var(--accent);letter-spacing:.03em}
.ad-steps-head{grid-template-columns:2rem minmax(0,1.5fr) minmax(0,1fr) 3.4rem !important}
.ad-steps li{grid-template-columns:2rem minmax(0,1.5fr) minmax(0,1fr) 3.4rem !important;align-items:baseline}
.ad-steps li.par>span:nth-child(2){color:var(--ink-2)}
.ad-steps li em.ln{display:block;font-style:normal;font-family:var(--mono);font-size:.62rem;
  letter-spacing:.08em;color:var(--accent);opacity:.8;margin-top:2px}
.ad-steps .gives{font-size:.8rem;line-height:1.4;color:var(--ink-2)}
.ad-roles em{font-style:normal;font-family:var(--mono);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;
  color:var(--accent);margin-left:7px}
.conn+.conn{margin-top:11px}
.conn-k{font-family:var(--mono);font-size:.6rem;letter-spacing:.11em;text-transform:uppercase;color:var(--ink-3);margin-bottom:5px}

/* ---------- derived link chips, glossary, tensions ---------- */
.ad-chain button em{font-style:normal;font-size:.82em;opacity:.62;margin-left:4px;letter-spacing:0}
.ad-terms{display:flex;flex-wrap:wrap;gap:5px}
.ad-terms button{font-family:var(--mono);font-size:.7rem;padding:3px 7px;border:1px solid var(--line-strong);
  border-radius:4px;color:var(--ink-2);background:var(--surface)}
.ad-terms button:hover{border-color:var(--accent);color:var(--accent)}
dl.gloss>div{display:grid;grid-template-columns:9.5rem minmax(0,1fr);gap:14px;padding:9px 0;
  border-bottom:1px solid var(--line);border-radius:4px}
dl.gloss>div:last-child{border-bottom:0}
dl.gloss>div.lit{background:var(--accent-soft);box-shadow:0 0 0 6px var(--accent-soft)}
dl.gloss dt{font-family:var(--mono);font-size:.78rem;font-weight:700;color:var(--accent);line-height:1.5}
dl.gloss dd b{display:block;font-size:.86rem;font-weight:600;color:var(--ink)}
dl.gloss dd span{display:block;font-size:.84rem;line-height:1.5;color:var(--ink-2);margin-top:2px}
.tens-head,.tens li{display:grid;grid-template-columns:5rem 6.6rem 5rem 6.6rem 4rem minmax(0,1fr);gap:10px;align-items:baseline}
.tens-head{font-family:var(--mono);font-size:.6rem;letter-spacing:.13em;text-transform:uppercase;color:var(--ink-3);
  padding-bottom:6px;border-bottom:1px solid var(--line-strong);margin-bottom:4px}
.tens li{padding:7px 0;border-bottom:1px solid var(--line)}
.tens li:last-child{border-bottom:0}
.tens button{font-family:var(--mono);font-size:.76rem;font-weight:700;color:var(--accent);text-align:left}
.tens .w{font-family:var(--mono);font-size:.72rem;color:var(--ink-3)}
.tens .gap{font-family:var(--mono);font-size:.74rem;color:var(--ink-2)}
.tens .gap.hot{color:var(--risk);font-weight:700}
.tens .tx{font-size:.8rem;line-height:1.4;color:var(--ink-2)}
@media (max-width:820px){.ad-terms button{font-size:.66rem}}
@media (max-width:820px){.shell{grid-template-columns:minmax(0,1fr)}.nav{display:none}}
</style>
</head>
<body>
<div class="shell">
  <nav class="nav">
    <div class="nav-head">
      <h1>Activity details</h1>
      <div class="sub" id="tally"></div>
      <input id="q" type="search" placeholder="Search id or text…" aria-label="Search activities">
      <div class="nav-tools">
        <button id="f-all" aria-pressed="true">All</button>
        <button id="f-has" aria-pressed="false">Written only</button>
      </div>
    </div>
    <div class="nav-list" id="list"></div>
  </nav>
  <main class="pane" id="pane"></main>
</div>

${EDIT ? `<div id="tools">
  <span class="st" id="tool-st"></span>
  <button id="t-revert">Revert activity</button>
  <button id="t-import">Import</button>
  <button id="t-export" class="primary" title="Writes atlaspm-edits.json and a read-only activity-details-edited.html">Save edits</button>
  <input type="file" id="t-file" accept="application/json" hidden>
</div>
<div id="ep" hidden><div class="scrim" data-ep-close></div><div class="card" id="ep-card"></div></div>` : ''}

<div id="termpop" hidden>
  <div class="tp-scrim" data-close-term></div>
  <div class="tp-card" role="dialog" aria-modal="true" aria-labelledby="tp-k">
    <button class="tp-x" data-close-term aria-label="Close">&times;</button>
    <p class="tp-group"></p>
    <p class="tp-k" id="tp-k"></p>
    <p class="tp-full"></p>
    <p class="tp-note"></p>
    <p class="tp-more"><button data-go="__glossary" data-close-term>Open the full glossary &rarr;</button></p>
  </div>
</div>

<script id="ad-data" type="application/json">${DATA.replace(/</g, '\\u003c')}</script>
<script>
const EDIT = ${EDIT};
const D = JSON.parse(document.getElementById('ad-data').textContent);
/* marks a node the pencil can attach to; inert in the read-only build */
const ed = p => EDIT ? ' data-e="' + p + '"' : '';
const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const wk = n => String(n) + 'w';   /* decimals, not fractions: 0.5w, 0.75w */
const has = id => Object.prototype.hasOwnProperty.call(D.details, id);
const findAct = id => { for (const s of D.stages) { const a = s.activities.find(x => x.id === id); if (a) return {a, s}; } return null; };
const ALL = D.stages.flatMap(s => s.activities.map(a => a.id));
let current = null, onlyWritten = false, query = '';

/* ---------- nav ---------- */
function renderNav(){
  const q = query.trim().toLowerCase();
  let h = '';
  for (const s of D.stages) {
    const acts = s.activities.filter(a =>
      (!onlyWritten || has(a.id)) &&
      (!q || a.id.toLowerCase().includes(q) || a.text.toLowerCase().includes(q)));
    if (!acts.length) continue;
    const n = s.activities.filter(a => has(a.id)).length;
    h += \`<div class="nav-stage\${n === s.activities.length ? ' full' : ''}">
      <span>\${String(s.n).padStart(2,'0')} · \${esc(s.code)}</span>
      <span class="cnt">\${n}/\${s.activities.length}</span></div>\`;
    for (const a of acts)
      h += \`<button class="nav-a\${has(a.id) ? ' has' : ''}" data-go="\${a.id}"
        \${current === a.id ? 'aria-current="true"' : ''} \${has(a.id) ? '' : 'disabled'}>
        <span class="id">\${a.id}</span><span>\${esc(a.text)}</span></button>\`;
  }
  if (!q) h += \`<div class="nav-stage full"><span>Appendix</span><span class="cnt">2</span></div>
    <button class="nav-a has" data-go="__glossary" \${current==='__glossary'?'aria-current="true"':''}>
      <span class="id">TERMS</span><span>Glossary — \${Object.keys(D.glossary).length} abbreviations expanded</span></button>
    <button class="nav-a has" data-go="__tensions" \${current==='__tensions'?'aria-current="true"':''}>
      <span class="id">SCHED</span><span>Schedule tensions — \${D.tensions.length} late inputs</span></button>\`;
  document.getElementById('list').innerHTML = h || '<p class="ad-none" style="padding:20px 18px">Nothing matches.</p>';
}

/* ---------- detail ---------- */
const listSteps = ns => ns.length === 1 ? 'step ' + ns[0]
  : 'steps ' + ns.slice(0, -1).join(', ') + ' and ' + ns[ns.length - 1];
const absOf = id => { const {s} = findAct(id); const dd = D.details[id]; return [s.start + dd.window[0], s.start + dd.window[1]]; };
function chain(ids, withGap, anchor){
  return ids.map(x => {
    const t = (findAct(x)||{a:{text:'not in template'}}).a.text;
    let tag = '';
    if (withGap && has(x)) { const [uS] = absOf(x), [, vE] = absOf(anchor); tag = ' +' + (uS - vE) + 'w'; }
    return '<button data-go="' + x + '"' + (has(x)?'':' class="dead" disabled') +
      ' title="' + esc(t) + '">' + x + (tag ? '<em>' + tag + '</em>' : '') + '</button>';
  }).join('');
}
var GROUPS = {program:'Program and commercial', process:'Process, foundry and manufacturing', ip:'IP and libraries',
  design:'Design and implementation', verif:'Verification and DFT', pkg:'Signal, power and package',
  test:'Test', qual:'Reliability and compliance', iface:'Interfaces and memory', tool:'Data formats and tooling'};

function renderGlossary(){
  const g = D.glossary, by = {};
  for (const k in g) (by[g[k].group] = by[g[k].group] || []).push(k);
  return \`<div class="pane-inner">
    <div class="ad-head"><span class="ad-id">TERMS</span><h2>Glossary</h2><span class="spacer"></span>
      <span class="ad-crumb">\${Object.keys(g).length} abbreviations · every one used somewhere in the template</span></div>
    <div class="pane-scroll">
    \${Object.keys(GROUPS).filter(k => by[k]).map(k => \`<section class="ad-sec">
      <span class="cap">\${GROUPS[k]} <span class="n">\${by[k].length}</span></span>
      <dl class="gloss">\${by[k].sort().map(t => \`<div id="term-\${encodeURIComponent(t)}">
        <dt>\${esc(t)}</dt><dd><b>\${esc(g[t].full)}</b><span>\${esc(g[t].note)}</span></dd></div>\`).join('')}</dl>
    </section>\`).join('')}
    </div>
  </div>\`;
}

function renderTensions(){
  const t = D.tensions;
  return \`<div class="pane-inner">
    <div class="ad-head"><span class="ad-id">SCHED</span><h2>Schedule tensions</h2><span class="spacer"></span>
      <span class="ad-crumb">\${t.length} edges where the input is scheduled after the activity that uses it</span></div>
    <div class="pane-scroll">
    <section class="ad-sec"><span class="cap">What this is</span>
      <p class="ad-lede">Every link in this template was authored as an engineering relationship, then checked against the
      calendar. These \${t.length} pass the first test and fail the second: the source activity starts <b>after</b> the
      activity that needs it has already closed.</p>
      <p class="ad-lede">Some are expected — <code>TC-08</code> and <code>PTV-12</code> exist precisely to feed results
      backwards, and chip-package co-design iterates by construction. Others are real: an input the template assumes is
      available is not, and the receiving activity has to proceed on a provisional version. Both are shown, largest gap
      first, because only a program manager can tell them apart.</p></section>
    <section class="ad-sec"><span class="cap">Late inputs <span class="n">\${t.length}</span></span>
      <div class="tens-head"><span>Needs it</span><span>Window</span><span>Source</span><span>Window</span><span>Gap</span></div>
      <ul class="tens">\${t.map(x => \`<li>
        <button data-go="\${x.to}">\${x.to}</button><span class="w">w\${x.vS}–w\${x.vE}</span>
        <button data-go="\${x.from}">\${x.from}</button><span class="w">w\${x.uS}–w\${x.uE}</span>
        <span class="gap\${x.gap >= 10 ? ' hot' : ''}">+\${x.gap}w</span>
        <span class="tx">\${esc((findAct(x.from)||{a:{text:''}}).a.text)}</span></li>\`).join('')}</ul>
    </section>
    </div>
  </div>\`;
}

function renderDetail(id){
  const pane = document.getElementById('pane');
  if (id === '__glossary') { pane.innerHTML = renderGlossary(); pane.scrollTop = 0; return; }
  if (id === '__tensions') { pane.innerHTML = renderTensions(); pane.scrollTop = 0; return; }
  if (!id || !has(id)) {
    pane.innerHTML = \`<div class="empty"><p>Pick an activity on the left. Entries that are not yet written are dimmed —
      \${D.authoredCount} of \${ALL.length} are done so far.</p></div>\`;
    return;
  }
  const d = D.details[id], {a, s} = findAct(id);
  const span = d.window[1] - d.window[0];
  const fte = (a.mm * 4.345 / Math.abs(a.tat)).toFixed(1);
  const pos = w => ((w - d.window[0]) / span * 100);
  const lanes = ['main','par'];
  const placed = place(d);
  const ticks = []; for (let w = d.window[0]; w <= d.window[1] + 0.001; w += span <= 4 ? 1 : Math.ceil(span/5)) ticks.push(w);
  if (ticks[ticks.length-1] !== d.window[1]) ticks.push(d.window[1]);

  const idx = ALL.filter(has).indexOf(id);
  const written = ALL.filter(has);

  const gives = {};
  d.produces.forEach((p, i) => (gives[d.producedBy[i]] = gives[d.producedBy[i]] || []).push(p));
  const owns = d.rel.filter(r => r.rel === 'produces');
  const rest = d.rel.filter(r => r.rel !== 'produces');
  const title = x => (s.deliverables.find(y => y.id === x) || {}).title || x;

  pane.innerHTML = \`<div class="pane-inner">
    <div class="ad-head">
      <span class="ad-id">\${id}</span>
      <h2\${ed(id + '|tpl')}>\${esc(a.text)}</h2>
      <span class="spacer"></span>
      <span class="ad-crumb">\${String(s.n).padStart(2,'0')} \${esc(s.code)} · \${esc(s.name)} · stage w\${s.start}–\${s.start + s.dur}</span>
      <span class="ad-nav">
        <button data-go="\${written[(idx - 1 + written.length) % written.length]}">←</button>
        <button data-go="\${written[(idx + 1) % written.length]}">→</button>
      </span>
    </div>

    <div class="ad-facts">
      <div class="ad-fact"\${ed(id + '|tpl')}><span class="k">Takes</span><span class="v">\${wk(Math.abs(a.tat))}</span><span class="d">w\${d.window[0]}–w\${d.window[1]} of the stage</span></div>
      <div class="ad-fact"\${ed(id + '|tpl')}><span class="k">Costs</span><span class="v">\${a.mm.toFixed(1)} <small>M/M</small></span><span class="d">~\${fte} people while it runs</span></div>
      <div class="ad-fact"><span class="k">Owner</span><span class="v sm">\${esc(d.roles[0].r)}</span><span class="d">\${esc(d.roles[d.roles.length-1].r)} approves</span></div>
      <div class="ad-fact"><span class="k">Critical path</span><span class="v">\${d.criticalPath ? 'yes' : 'no'}</span><span class="d">\${d.criticalPath ? 'slipping moves the program' : 'has float'}</span></div>
    </div>

    <div class="ad-grid">
      <div class="ad-main">
        <section class="ad-sec"><span class="cap">Why it exists</span>
          \${d.purpose.map((p, i) => '<p class="ad-lede"' + ed(id + '|purpose|' + i) + '>' + p + '</p>').join('')}
        </section>

        <section class="ad-sec"><span class="cap">What it delivers</span>
          \${owns.length ? owns.map(r => \`<div class="deliv">
            <p class="deliv-h"\${ed(id + '|del|' + r.id)}><span class="did">\${r.id}</span>\${esc(title(r.id))}</p>
            <p class="deliv-w"\${ed(id + '|rel|' + d.rel.indexOf(r) + '|text')}>\${r.text.replace(/^<b>[^<]*<\\/b>\\s*/, '')}</p>
          </div>\`).join('') : '<p class="ad-none">No key deliverable is owned here — this activity contributes to the ones below.</p>'}
        </section>

        <section class="ad-sec"><span class="cap">Needs first</span>
          <ul class="ad-list">\${d.consumes.map((x, i) => '<li' + ed(id + '|consumes|' + i) + '>' + esc(x) + '</li>').join('')}</ul>
        </section>

        <section class="ad-sec"><span class="cap">Done when</span>
          <ul class="ad-list ad-crit">\${d.exit.map((x, i) => '<li' + ed(id + '|exit|' + i) + '>' + esc(x) + '</li>').join('')}</ul>
        </section>

        <section class="ad-sec">
          <span class="cap">How it gets there <span class="n">\${d.steps.length} steps · \${d.steps.some(x=>x.lane==='par') ? '2 lanes' : '1 lane'}</span></span>
          <div class="ad-flow">
            <div class="ad-axis">\${ticks.map(w => '<span style="left:' + pos(w).toFixed(1) + '%">w' + w + '</span>').join('')}</div>
            \${lanes.filter(l => d.steps.some(x => x.lane === l)).map(l => \`
              <p class="ad-lane-tag">\${l === 'main' ? 'Main sequence' : 'In parallel'}</p>
              <div class="ad-lane">\${placed.filter(p => p.st.lane === l).map(p =>
                '<span class="ad-step' + (l === 'par' ? ' par' : '') + '" style="left:' + pos(p.x).toFixed(2) + '%;width:' + (p.st.tat / span * 100).toFixed(2) + '%" title="' + esc(p.st.text) + '"><b>' + p.st.n + '</b></span>').join('')}</div>\`).join('')}
          </div>
          <div class="ad-steps-head"><span>#</span><span>Step</span><span>What it adds</span><span>TAT</span></div>
          <ul class="ad-steps">\${d.steps.map((st, si) =>
            '<li' + (st.lane === 'par' ? ' class="par"' : '') + '><span class="n">' + st.n + '</span>' +
            '<span' + ed(id + '|steps|' + si) + '>' + esc(st.text) + (st.lane === 'par' ? '<em class="ln">runs in parallel</em>' : '') + '</span>' +
            '<span class="gives">' + (gives[st.n]
               ? gives[st.n].map(g => '<span class="give"' + ed(id + '|prod|' + d.produces.indexOf(g)) + '>' + esc(g) + '</span>').join('')
               : '<span class="give-none">—</span>') + '</span>' +
            '<span class="w">' + wk(st.tat) + '</span></li>').join('')}</ul>
          \${d.flowNote ? '<p class="ad-note"' + ed(id + '|flowNote') + '>' + esc(d.flowNote) + '</p>' : ''}
        </section>

        <section class="ad-sec"><span class="cap">Watch out for <span class="n">\${d.risks.length}</span></span>
          <ul class="ad-risks simple">\${d.risks.map((x, i) => {
            const m = x.match(/^<b>([^<]*)<\\/b>/);
            const full = x.replace(/<[^>]+>/g, '');
            return '<li><span' + ed(id + '|risks|' + i) + ' title="' + esc(full) + '">' + esc(m ? m[1] : full) + '</span></li>';
          }).join('')}</ul>
        </section>
      </div>

      <aside class="ad-side">
        <section><span class="cap">Where the effort goes <span class="n">\${a.mm} M/M</span></span><div class="ad-split">
          \${d.effort.map(([l, v], i) => '<div' + ed(id + '|effort|' + i) + '><span>' + esc(l) + '</span><span class="mm">' + v.toFixed(1) + '</span></div>').join('')}
        </div></section>

        <section><span class="cap">Who is on it <span class="n">~\${fte} FTE</span></span><div class="ad-roles">
          \${d.roles.map((r, i) => '<div' + ed(id + '|roles|' + i) + '><b>' + esc(r.r) + '</b>' + (i === 0 ? '<em>owns it</em>' : '') + '</div>').join('')}
        </div></section>

        <section><span class="cap">Connections</span>
          \${[['Depends on', d.links.dependsOn, false],
              ['Runs with', d.links.runsWith, false],
              ['Feeds into', d.links.feedsInto, false],
              ['Later input', d.links.revisedBy, true],
              ['Feeds back into', d.links.feedsBackInto, false]]
            .filter(([, v]) => v.length)
            .map(([label, v, gap]) => '<div class="conn"><p class="conn-k">' + label + '</p><div class="ad-chain">' + chain(v, gap, id) + '</div></div>').join('')
            || '<p class="ad-none">' + esc(d.dependsNote || 'Nothing linked.') + '</p>'}
          \${!d.links.dependsOn.length && d.dependsNote ? '<p class="ad-none" style="margin-top:10px">' + esc(d.dependsNote) + '</p>' : ''}
        </section>

        \${d.terms.length ? \`<section><span class="cap">Terms here <span class="n">\${d.terms.length}</span></span>
          <div class="ad-terms">\${d.terms.map(t => '<button data-term="' + esc(t) + '">' + esc(t) + '</button>').join('')}</div></section>\` : ''}
      </aside>
    </div>
  </div>\`;
  pane.scrollTop = 0;
  decorate();
}

D.authoredCount = Object.keys(D.details).length;
document.getElementById('tally').textContent =
  D.authoredCount + ' of ' + ALL.length + ' activities written · ' + D.stages.length + ' stages';

/* ---------- editing ---------- */
/* A parallel step runs alongside the main step it follows — the same rule the
   build uses, recomputed here because step TAT is editable. */
function place(d) {
  let main = d.window[0], par = d.window[0], prevMainStart = d.window[0], prevWasMain = false;
  return d.steps.map(st => {
    const t = Number(st.tat) || 0;
    if (st.lane === 'main') { const x = main; prevMainStart = x; main += t; prevWasMain = true; return { st, x }; }
    if (prevWasMain) par = prevMainStart;
    const x = par; par += t; prevWasMain = false; return { st, x };
  });
}

const EKEY = 'atlaspm-activity-edits-v1';
let edits = {};
if (EDIT) { try { edits = JSON.parse(localStorage.getItem(EKEY) || '{}'); } catch (e) { edits = {}; } }
const BASE = EDIT ? JSON.parse(JSON.stringify({ details: D.details, stages: D.stages })) : null;

/* every editable path resolves to a container object and a key inside it */
function slot(root, path) {
  const [id, field, i, k] = path.split('|');
  if (field === 'tpl') {
    for (const s of root.stages) { const a = s.activities.find(x => x.id === id); if (a) return { o: a, k: i }; }
  }
  if (field === 'del') {
    for (const s of root.stages) { const dl = s.deliverables.find(x => x.id === i); if (dl) return { o: dl, k: 'title' }; }
  }
  const d = root.details[id];
  if (field === 'prod') return { o: d.produces, k: +i };
  if (i === undefined) return { o: d, k: field };
  if (k === undefined) return { o: d[field], k: +i };
  return { o: d[field][+i], k };
}
const baseAt = p => { const s = slot(BASE, p); return s.o[s.k]; };
const liveAt = p => { const s = slot(D, p); return s.o[s.k]; };
function setAt(path, val) {
  const s = slot(D, path);
  s.o[s.k] = val;
  if (String(val) === String(baseAt(path))) delete edits[path]; else edits[path] = val;
}
const saveStore = () => localStorage.setItem(EKEY, JSON.stringify(edits));
const dirtyPaths = id => Object.keys(edits).filter(p => p.split('|')[0] === id);

/* what the pencil opens, per kind of item */
const SPEC = {
  purpose:   { title: 'Paragraph', f: [{ p: '', t: 'area', rows: 6, rich: 1 }] },
  risks:     { title: 'Risk', f: [{ p: '', t: 'area', rows: 5, rich: 1, hint: 'Lead with a bolded claim: <b>…</b>' }] },
  consumes:  { title: 'Input', f: [{ p: '', t: 'area', rows: 3 }] },
  exit:      { title: 'Done when', f: [{ p: '', t: 'area', rows: 3 }] },
  flowNote:  { title: 'Flow note', f: [{ p: '', t: 'area', rows: 5 }] },
  rel:       { title: 'Deliverable relationship', f: [{ p: 'text', t: 'area', rows: 6, rich: 1 }] },
  steps:     { title: 'Step', f: [{ p: 'text', t: 'area', rows: 3, label: 'Step' },
                                  { p: 'tat', t: 'num', step: 0.25, label: 'TAT (weeks)' },
                                  { p: 'lane', t: 'sel', opts: ['main', 'par'], label: 'Lane' }] },
  roles:     { title: 'Role', f: [{ p: 'r', t: 'line', label: 'Role' }, { p: 'd', t: 'area', rows: 3, label: 'What they do' }] },
  effort:    { title: 'Effort line', f: [{ p: '0', t: 'line', label: 'Line' }, { p: '1', t: 'num', step: 0.25, label: 'M/M' }] },
  prod:      { title: 'Output', f: [{ p: '', t: 'area', rows: 3, label: 'Output' }] },
  del:       { title: 'Key deliverable title', f: [{ p: '', t: 'area', rows: 2, hint: 'Shared with every activity in this stage' }] },
  tpl:       { title: 'Activity title, TAT and effort', f: [{ p: 'text', t: 'area', rows: 3, label: 'Title' },
                                  { p: 'tatWeeks', t: 'num', step: 0.5, label: 'TAT (weeks; negative = continuous)' },
                                  { p: 'manMonths', t: 'num', step: 0.5, label: 'Effort (M/M)' }] },
};

/* the invariants, live against whatever is on screen */
function checks(id) {
  const d = D.details[id], a = findAct(id).a, s = findAct(id).s, out = [];
  const n = v => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };
  const tat = Math.abs(n(a.tat)), mm = n(a.mm);
  const mainSum = d.steps.reduce((t, st) => t + (st.lane === 'main' ? n(st.tat) : 0), 0);
  out.push([Math.abs(mainSum - tat) < 0.011, 'Main-lane steps sum to ' + mainSum.toFixed(2).replace(/\.?0+$/, '') + 'w; TAT is ' + tat + 'w']);
  const eff = d.effort.reduce((t, e) => t + n(e[1]), 0);
  out.push([Math.abs(eff - mm) < 0.011, 'Effort lines sum to ' + eff.toFixed(2).replace(/\.?0+$/, '') + ' M/M; activity is ' + mm + ' M/M']);
  const span = n(d.window[1]) - n(d.window[0]);
  out.push([Math.abs(span - tat) < 0.011, 'Window w' + d.window[0] + '–w' + d.window[1] + ' spans ' + span + 'w; TAT is ' + tat + 'w']);
  const ns = new Set(d.steps.map(x => n(x.n)));
  out.push([d.producedBy.every(x => ns.has(n(x))), 'Every output points at a step that exists']);
  return out;
}

function decorate() {
  if (!EDIT) return;
  const id = current;
  document.querySelectorAll('#pane [data-e]').forEach(el => {
    if (el.querySelector(':scope > .pen')) return;
    const b = document.createElement('button');
    b.className = 'pen'; b.title = 'Edit'; b.textContent = '✎';
    b.dataset.ep = el.dataset.e;
    el.appendChild(b);
    if (isDirty(el.dataset.e)) el.classList.add('on');
  });
  refreshTools();
}
const isDirty = path => {
  const [id, field, i] = path.split('|');
  if (field === 'tpl') return Object.keys(edits).some(p => p.startsWith(id + '|tpl|'));
  if (field === 'prod') return (id + '|prod|' + i) in edits || (id + '|producedBy|' + i) in edits;
  return Object.keys(edits).some(p => p === path || p.startsWith(path + '|'));
};

function refreshTools() {
  const st = document.getElementById('tool-st'); if (!st) return;
  const n = Object.keys(edits).length;
  const ids = new Set(Object.keys(edits).map(p => p.split('|')[0]));
  const bad = D.details[current] ? checks(current).filter(c => !c[0]).length : 0;
  st.innerHTML = (n ? '<b>' + n + ' edits</b> · ' + ids.size + ' activities' : 'no edits yet') +
                 (bad ? ' · <span class="bad">' + bad + ' checks failing</span>' : '');
  document.getElementById('t-export').disabled = !n;
  document.getElementById('t-revert').disabled = !dirtyPaths(current).length;
}

function openEdit(path) {
  const [id, field, i] = path.split('|');
  const spec = SPEC[field] || SPEC.consumes;
  const card = document.getElementById('ep-card');
  const val = f => {
    if (field === 'prod') return f.p === '' ? D.details[id].produces[+i] : '';
    if (field === 'tpl' || field === 'del') return liveAt(path.split('|').slice(0, 2).concat(f.p || (field === 'del' ? i : '')).join('|'));
    return f.p === '' ? liveAt(path) : liveAt(path + '|' + f.p);
  };
  const inputs = spec.f.map((f, n) => {
    const v = field === 'tpl' ? liveAt(id + '|tpl|' + f.p) : field === 'del' ? liveAt(path) : val(f);
    const lab = f.label ? '<label>' + f.label + '</label>' : '';
    if (f.t === 'num') return lab + '<input type="number" step="' + f.step + '" data-i="' + n + '" value="' + esc(v) + '">';
    if (f.t === 'sel') return lab + '<select data-i="' + n + '">' + f.opts.map(o =>
      '<option' + (String(v) === o ? ' selected' : '') + '>' + o + '</option>').join('') + '</select>';
    if (f.t === 'line') return lab + '<input type="text" data-i="' + n + '" value="' + esc(v) + '">';
    return lab + '<textarea rows="' + f.rows + '" data-i="' + n + '">' + esc(v) + '</textarea>' +
      (f.rich ? '<div class="prev" data-pv="' + n + '">' + v + '</div>' : '') +
      (f.hint ? '<p class="sub">' + f.hint + '</p>' : '');
  }).join('');
  const extra = field === 'prod'
    ? '<label>Produced by step</label><input type="number" step="1" data-i="99" value="' + esc(D.details[id].producedBy[+i]) + '">' : '';
  card.innerHTML = '<p class="ttl">' + spec.title + '</p><p class="sub">' + id + (SPEC[field] ? '' : '') + '</p>' +
    inputs + extra +
    '<div class="chk">' + checks(id).map(c => '<p class="' + (c[0] ? 'ok' : 'bad') + '">' + esc(c[1]) + '</p>').join('') + '</div>' +
    '<div class="row"><button class="primary" data-ep-save>Save</button>' +
    '<button data-ep-close>Cancel</button><span class="grow"></span>' +
    (isDirty(path) ? '<button class="warn" data-ep-reset>Revert this item</button>' : '') + '</div>';
  card.dataset.path = path;
  document.getElementById('ep').hidden = false;
  const first = card.querySelector('textarea,input,select'); if (first) { first.focus(); }
}

function commitEdit() {
  const card = document.getElementById('ep-card');
  const path = card.dataset.path;
  const [id, field, i] = path.split('|');
  const spec = SPEC[field] || SPEC.consumes;
  card.querySelectorAll('[data-i]').forEach(el => {
    const n = el.dataset.i;
    if (n === '99') { setAt(id + '|producedBy|' + i, Number(el.value)); return; }
    const f = spec.f[+n];
    const v = f.t === 'num' ? Number(el.value) : el.value;
    if (field === 'tpl') setAt(id + '|tpl|' + f.p, v);
    else if (field === 'del') setAt(path, v);
    else if (field === 'prod') setAt(id + '|prod|' + i, v);
    else setAt(f.p === '' ? path : path + '|' + f.p, v);
  });
  saveStore();
  document.getElementById('ep').hidden = true;
  renderNav(); renderDetail(current);
}

function resetItem() {
  const path = document.getElementById('ep-card').dataset.path;
  const [id, field, i] = path.split('|');
  const kill = Object.keys(edits).filter(p =>
    field === 'tpl' ? p.startsWith(id + '|tpl|')
    : field === 'prod' ? (p === id + '|prod|' + i || p === id + '|producedBy|' + i)
    : (p === path || p.startsWith(path + '|')));
  kill.forEach(p => { const s = slot(D, p); s.o[s.k] = baseAt(p); delete edits[p]; });
  saveStore();
  document.getElementById('ep').hidden = true;
  renderNav(); renderDetail(current);
}

function buildPatch() {
  const acts = {}, template = {}, touched = {};
  for (const p of Object.keys(edits)) {
    const [id, field] = p.split('|');
    (touched[id] = touched[id] || new Set()).add(field === 'prod' ? 'produces' : field);
  }
  for (const id in touched) for (const field of touched[id]) {
    if (field === 'tpl') {
      const t = template[id] = template[id] || {};
      const a = findAct(id).a;
      for (const [k, src] of [['text', 'text'], ['tatWeeks', 'tat'], ['manMonths', 'mm']])
        if ((id + '|tpl|' + k) in edits) t[k] = a[src];
      continue;
    }
    if (field === 'del') {
      for (const p of Object.keys(edits)) {
        const [aid, f, did] = p.split('|');
        if (aid === id && f === 'del') template[did] = { title: liveAt(p) };
      }
      continue;
    }
    (acts[id] = acts[id] || {})[field] = JSON.parse(JSON.stringify(D.details[id][field]));
    if (field === 'produces') acts[id].producedBy = D.details[id].producedBy.map(Number);
  }
  return { format: 'atlaspm-activity-edits', version: 1, baseAsset: 'v3',
           savedAt: new Date().toISOString(), activities: acts, template };
}

if (EDIT) {
  /* Replay stored edits over the loaded data before anything renders. An edit
     whose value now matches the build has already been applied upstream, so it
     is dropped — otherwise the item would stay flagged as changed forever. */
  let settled = 0;
  for (const p of Object.keys(edits)) {
    try {
      if (String(edits[p]) === String(baseAt(p))) { delete edits[p]; settled++; continue; }
      const s = slot(D, p); s.o[s.k] = edits[p];
    } catch (e) { delete edits[p]; settled++; }
  }
  if (settled) saveStore();

  document.addEventListener('click', e => {
    const pen = e.target.closest('[data-ep]'); if (pen) { e.stopPropagation(); openEdit(pen.dataset.ep); return; }
    if (e.target.closest('[data-ep-save]')) return commitEdit();
    if (e.target.closest('[data-ep-reset]')) return resetItem();
    if (e.target.closest('[data-ep-close]')) { document.getElementById('ep').hidden = true; return; }
  }, true);
  document.addEventListener('input', e => {
    const t = e.target.closest('#ep-card [data-i]'); if (!t) return;
    const pv = document.querySelector('#ep-card [data-pv="' + t.dataset.i + '"]');
    if (pv) pv.innerHTML = t.value;
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.getElementById('ep').hidden) document.getElementById('ep').hidden = true;
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !document.getElementById('ep').hidden) commitEdit();
  });
  document.getElementById('t-revert').onclick = () => {
    if (!confirm('Discard every edit on ' + current + '?')) return;
    dirtyPaths(current).forEach(p => { const s = slot(D, p); s.o[s.k] = baseAt(p); delete edits[p]; });
    saveStore(); renderNav(); renderDetail(current);
  };
  function download(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 8000);
  }

  /* The page rewrites itself: the edited data goes back into its own JSON block,
     the editing chrome comes out, and what is left is the read-only viewer. */
  function editedViewer() {
    const doc = document.documentElement.cloneNode(true);
    doc.querySelector('#ad-data').textContent = JSON.stringify(D).replace(/</g, '\\\\u003c');
    const sc = [...doc.querySelectorAll('script')].find(x => x.textContent.includes('const EDIT = true;'));
    sc.textContent = sc.textContent.replace('const EDIT = true;', 'const EDIT = false;');
    doc.querySelector('#tools').remove();
    doc.querySelector('#ep').remove();
    doc.querySelector('title').textContent = 'Activity Details — AtlasPM (edited)';
    doc.querySelector('#pane').innerHTML = '';        // let the clone render itself on load
    doc.querySelector('#list').innerHTML = '';
    const q = doc.querySelector('#q'); if (q) q.removeAttribute('value');
    return '<!doctype html>' + String.fromCharCode(10) + doc.outerHTML;
  }

  document.getElementById('t-export').onclick = () => {
    const n = Object.keys(edits).length;
    download('atlaspm-edits.json', JSON.stringify(buildPatch(), null, 1), 'application/json');
    /* Chrome asks once before letting a page save a second file */
    setTimeout(() => {
      download('activity-details-edited.html', editedViewer(), 'text/html');
      const st = document.getElementById('tool-st');
      const was = st.innerHTML;
      st.innerHTML = 'saved ' + n + ' edits — json + html';
      setTimeout(() => { st.innerHTML = was; refreshTools(); }, 2600);
    }, 350);
  };
  document.getElementById('t-import').onclick = () => document.getElementById('t-file').click();
  document.getElementById('t-file').onchange = ev => {
    const f = ev.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      let p; try { p = JSON.parse(r.result); } catch (err) { alert('Not valid JSON.'); return; }
      if (p.format !== 'atlaspm-activity-edits') { alert('Not an AtlasPM edit file.'); return; }
      let n = 0;
      for (const id in (p.activities || {})) for (const field in p.activities[id]) {
        const src = D.details[id] && D.details[id][field]; if (src === undefined) continue;
        const val = p.activities[id][field];
        if (!Array.isArray(src)) { setAt(id + '|' + field, val); n++; continue; }
        val.forEach((row, i) => {
          if (typeof row !== 'object') { setAt(id + '|' + field + '|' + i, row); n++; }
          else if (Array.isArray(row)) row.forEach((v, k) => { setAt(id + '|' + field + '|' + i + '|' + k, v); n++; });
          else for (const k in row) { setAt(id + '|' + field + '|' + i + '|' + k, row[k]); n++; }
        });
      }
      for (const tid in (p.template || {})) for (const k in p.template[tid]) {
        try { setAt(tid + (k === 'title' ? '|del|' + tid : '|tpl|' + k), p.template[tid][k]); n++; } catch (e) {}
      }
      saveStore(); alert('Loaded ' + n + ' field values.'); renderNav(); renderDetail(current);
    };
    r.readAsText(f); ev.target.value = '';
  };
  window.addEventListener('beforeunload', e => { if (Object.keys(edits).length) { e.preventDefault(); e.returnValue = ''; } });
}

function go(id){ if (!has(id) && id !== '__glossary' && id !== '__tensions') return; current = id; location.hash = id; renderNav(); renderDetail(id); }
document.addEventListener('click', e => {
  const b = e.target.closest('[data-go]');
  if (b && !b.disabled) { go(b.dataset.go); return; }
  const t = e.target.closest('[data-term]');
  if (t) { openTerm(t.dataset.term); return; }
  if (e.target.closest('[data-close-term]')) closeTerm();
});

/* ---------- term card ---------- */
const pop = document.getElementById('termpop');
function openTerm(key){
  const g = D.glossary[key];
  if (!g) return;
  pop.querySelector('.tp-k').textContent = key;
  pop.querySelector('.tp-full').textContent = g.full;
  pop.querySelector('.tp-note').textContent = g.note;
  pop.querySelector('.tp-group').textContent = GROUPS[g.group] || g.group;
  pop.hidden = false;
  pop.querySelector('.tp-x').focus();
}
function closeTerm(){ pop.hidden = true; }
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) closeTerm(); });
document.getElementById('q').addEventListener('input', e => { query = e.target.value; renderNav(); });
const bAll = document.getElementById('f-all'), bHas = document.getElementById('f-has');
const setF = v => { onlyWritten = v; bAll.setAttribute('aria-pressed', String(!v)); bHas.setAttribute('aria-pressed', String(v)); renderNav(); };
bAll.onclick = () => setF(false); bHas.onclick = () => setF(true);
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h && has(h) && h !== current) go(h); });

const start = location.hash.slice(1);
current = has(start) ? start : Object.keys(D.details)[0];
renderNav(); renderDetail(current);
</script>
</body>
</html>`;
  return html;
};
