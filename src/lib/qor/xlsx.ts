/**
 * /lib/qor/xlsx.ts — reading a workbook, and writing the template.
 *
 * Without a library, and deliberately. A .xlsx is a zip of XML; the browser
 * inflates it with DecompressionStream and reads it with DOMParser. Bringing
 * in a parser would add a megabyte to the bundle to do what two standard APIs
 * already do, and would put the one file this feature cannot work without
 * behind a download.
 *
 * Browser only: both APIs are the platform's, not Node's. The parsing that
 * follows — sheets to rows — is /lib/qor/parse.ts, which is pure and tested.
 */
import { MEASURES, MEASURE_ORDER, PNR_STAGES, SHEET_COLS, type QorDataset } from './schema';
import type { Cell, Sheets } from './parse';

/* ── zip ──────────────────────────────────────────────────── */

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c >>> 0;
  }
  return (u8: Uint8Array) => {
    let c = 0xffffffff;
    for (let i = 0; i < u8.length; i++) c = t[(c ^ u8[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
})();

/** Stored, not deflated: Excel opens a stored zip like any other. */
function zipWrite(files: [string, string][]): Blob {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const dir: Uint8Array[] = [];
  let off = 0;
  for (const [path, text] of files) {
    const name = enc.encode(path);
    const body = enc.encode(text);
    const crc = CRC(body);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
    lh.setUint32(14, crc, true); lh.setUint32(18, body.length, true); lh.setUint32(22, body.length, true);
    lh.setUint16(26, name.length, true);
    parts.push(new Uint8Array(lh.buffer), name, body);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
    ch.setUint16(8, 0x0800, true);
    ch.setUint32(16, crc, true); ch.setUint32(20, body.length, true); ch.setUint32(24, body.length, true);
    ch.setUint16(28, name.length, true); ch.setUint32(42, off, true);
    dir.push(new Uint8Array(ch.buffer), name);
    off += 30 + name.length + body.length;
  }
  const dirSize = dir.reduce((n, p) => n + p.length, 0);
  const eo = new DataView(new ArrayBuffer(22));
  eo.setUint32(0, 0x06054b50, true); eo.setUint16(8, files.length, true); eo.setUint16(10, files.length, true);
  eo.setUint32(12, dirSize, true); eo.setUint32(16, off, true);
  return new Blob([...parts, ...dir, new Uint8Array(eo.buffer)] as BlobPart[], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

async function zipRead(buf: ArrayBuffer): Promise<Record<string, string>> {
  const dv = new DataView(buf);
  const u8 = new Uint8Array(buf);
  let eo = -1;
  for (let i = buf.byteLength - 22; i >= 0 && i > buf.byteLength - 66000; i--)
    if (dv.getUint32(i, true) === 0x06054b50) { eo = i; break; }
  if (eo < 0) throw new Error('not a zip — is this really an .xlsx?');
  const n = dv.getUint16(eo + 10, true);
  let p = dv.getUint32(eo + 16, true);
  const out: Record<string, string> = {};
  const dec = new TextDecoder();
  for (let i = 0; i < n; i++) {
    const nameLen = dv.getUint16(p + 28, true);
    const extra = dv.getUint16(p + 30, true);
    const cmt = dv.getUint16(p + 32, true);
    const method = dv.getUint16(p + 10, true);
    const size = dv.getUint32(p + 20, true);
    const lo = dv.getUint32(p + 42, true);
    const name = dec.decode(u8.subarray(p + 46, p + 46 + nameLen));
    const ln = dv.getUint16(lo + 26, true);
    const le = dv.getUint16(lo + 28, true);
    const start = lo + 30 + ln + le;
    const raw = u8.subarray(start, start + size);
    out[name] = method === 0
      ? dec.decode(raw)
      : dec.decode(await new Response(
          new Blob([raw as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw')),
        ).arrayBuffer());
    p += 46 + nameLen + extra + cmt;
  }
  return out;
}

/* ── reading ──────────────────────────────────────────────── */

const REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

function readParts(parts: Record<string, string>): Sheets {
  const dom = (s: string) => new DOMParser().parseFromString(s, 'application/xml');
  if (!parts['xl/workbook.xml']) throw new Error('no workbook inside the file');
  const wb = dom(parts['xl/workbook.xml']);
  const rels: Record<string, string> = {};
  for (const r of Array.from(dom(parts['xl/_rels/workbook.xml.rels']).getElementsByTagName('Relationship')))
    rels[r.getAttribute('Id')!] = (r.getAttribute('Target') || '').replace(/^\/?(xl\/)?/, 'xl/');
  const shared: string[] = [];
  if (parts['xl/sharedStrings.xml'])
    for (const si of Array.from(dom(parts['xl/sharedStrings.xml']).getElementsByTagName('si')))
      shared.push(Array.from(si.getElementsByTagName('t')).map((t) => t.textContent).join(''));

  const out: Sheets = {};
  for (const sh of Array.from(wb.getElementsByTagName('sheet'))) {
    const id = sh.getAttributeNS(REL_NS, 'id') || sh.getAttribute('r:id');
    const xml = id ? parts[rels[id]] : undefined;
    if (!xml) continue;
    const rows: Cell[][] = [];
    for (const row of Array.from(dom(xml).getElementsByTagName('row'))) {
      const cells: Cell[] = [];
      for (const c of Array.from(row.getElementsByTagName('c'))) {
        const ref = (c.getAttribute('r') || '').replace(/\d+/g, '');
        let i = 0;
        for (const ch of ref) i = i * 26 + (ch.charCodeAt(0) - 64);
        const t = c.getAttribute('t');
        const v = c.getElementsByTagName('v')[0];
        const is = c.getElementsByTagName('is')[0];
        cells[i - 1] = t === 's' && v ? shared[+v.textContent!]
          : is ? Array.from(is.getElementsByTagName('t')).map((x) => x.textContent).join('')
          : v ? v.textContent : '';
      }
      rows.push(cells);
    }
    out[sh.getAttribute('name') || ''] = rows;
  }
  return out;
}

/** A csv is one flat table with a Drop column: what a script writes after a run. */
export function readCsv(text: string): Cell[][] {
  const rows: Cell[][] = [];
  let row: Cell[] = [];
  let cell = '';
  let q = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => String(x ?? '').trim() !== ''));
}

/** Everything a file can be, as a bag of sheets the pure parser understands. */
export async function sheetsFromFile(file: File): Promise<Sheets> {
  if (/\.csv$/i.test(file.name)) return { QoR: readCsv(await file.text()) };
  return readParts(await zipRead(await file.arrayBuffer()));
}

/* ── writing the template ─────────────────────────────────── */

const xe = (s: unknown) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const colName = (i: number) => {
  let s = '';
  let n = i + 1;
  while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; }
  return s;
};

function sheetXml(rows: Cell[][]): string {
  const body = rows.map((cells, r) => {
    const cs = cells.map((v, c) => {
      const ref = colName(c) + (r + 1);
      if (v === null || v === undefined || v === '') return '';
      return typeof v === 'number'
        ? `<c r="${ref}"><v>${v}</v></c>`
        : `<c r="${ref}" t="inlineStr" s="${r === 0 ? 1 : 0}"><is><t>${xe(v)}</t></is></c>`;
    }).join('');
    return `<row r="${r + 1}">${cs}</row>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`;
}

const STYLES = '<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';

/**
 * The template, written from whatever is loaded — so the file that comes out
 * is the file that goes back in, and a team starting from scratch gets the
 * example rows rather than an empty grid to guess at.
 */
export function buildWorkbook(data: QorDataset | null): Blob {
  const drops = data?.drops ?? [{ id: 'N0', label: 'N0', date: '' }];
  const blocks = data?.blocks ?? [{ name: 'block_top', group: 'CPU' }];
  const sheets: [string, Cell[][]][] = [
    ['Meta', [
      ['Key', 'Value'],
      ['Template version', 1],
      ['Slack unit', 'ps'],
      ['Generated at', new Date().toISOString().slice(0, 19).replace('T', ' ')],
      ['Generated by', 'AtlasPM'],
      ['Run directory', ''],
    ]],
    ['Blocks', [['Block', 'Group'], ...blocks.map((b) => [b.name, b.group] as Cell[])]],
    ['Drops', [['Drop', 'Label', 'Date'], ...drops.map((d) => [d.id, d.label, d.date] as Cell[])]],
    ['Targets', [
      ['Measure', 'Key', 'Target', 'Unit', 'Good when'],
      ...MEASURE_ORDER.map((k) => [
        MEASURES[k].label, k, data?.targets[k] ?? MEASURES[k].target, MEASURES[k].unit || '',
        MEASURES[k].good === 'above' ? 'higher' : 'lower',
      ] as Cell[]),
    ]],
    ...drops.map((d): [string, Cell[][]] => [d.id, [
      SHEET_COLS.map((c) => c.h),
      ...(data?.rows[d.id] ?? []).filter((r) => !r.missing).map((r) => SHEET_COLS.map((c) => {
        if (c.t === 'stage') return PNR_STAGES[r.stage];
        const v = (r as unknown as Record<string, Cell>)[c.k];
        return v === null || v === undefined ? '' : v;
      })),
    ]]),
  ];
  const files: [string, string][] = [
    ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`],
    ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ['xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${REL_NS}"><sheets>${sheets.map(([n], i) => `<sheet name="${xe(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`],
    ['xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${REL_NS}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rIdS" Type="${REL_NS}/styles" Target="styles.xml"/></Relationships>`],
    ['xl/styles.xml', STYLES],
    ...sheets.map(([, rows], i): [string, string] => [`xl/worksheets/sheet${i + 1}.xml`, sheetXml(rows)]),
  ];
  return zipWrite(files);
}
