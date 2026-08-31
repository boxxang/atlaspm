const REPO = require('path').resolve(__dirname, '../..');
const { chromium } = require(REPO + '/node_modules/playwright');
const SRC = 'file://' + REPO + '/docs/activity-details-print.html';
const OUT = REPO + '/docs/AtlasPM-Activity-Details.pdf';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(SRC, { waitUntil: 'load', timeout: 180000 });
  const opts = {
    path: OUT, format: 'A4', printBackground: true,
    margin: { top: '15mm', bottom: '16mm', left: '14mm', right: '14mm' },
    displayHeaderFooter: true,
    headerTemplate: `<div style="width:100%;font:7pt -apple-system,Arial;color:#9a988f;padding:0 14mm;
      display:flex;justify-content:space-between;letter-spacing:.08em;">
      <span>ATLASPM · ENGINEERING ACTIVITY DETAIL REFERENCE</span><span>23 STAGES · 257 ACTIVITIES</span></div>`,
    footerTemplate: `<div style="width:100%;font:7.5pt 'SF Mono',Menlo,monospace;color:#9a988f;padding:0 14mm;
      text-align:center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
    tagged: true, outline: true,
  };
  try {
    await page.pdf(opts);
    console.log('pdf written with tagged+outline');
  } catch (e) {
    console.log('tagged/outline rejected (' + e.message.split('\n')[0] + ') — retrying without');
    delete opts.tagged; delete opts.outline;
    await page.pdf(opts);
    console.log('pdf written without outline');
  }
  await browser.close();
})();
