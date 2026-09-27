import fs from 'node:fs';
import path from 'node:path';
import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import { ALL_ACTIVITIES, ALL_DELIVERABLE_TITLES } from '@/data/builtins';
import { DELIVERABLE_TEMPLATES, templateFor } from '@/data/deliverableTemplates';
import { deliverableStep, producersOf } from '@/lib/deliverableStatus';

/**
 * The templates a gate deliverable's handover offers exist, are Excel
 * workbooks a stage lead can confirm item by item, and belong to a deliverable
 * some activity hands over.
 *
 * They are generated (tools/deliverable-templates/build.ts) and served from
 * public/, so a listed template whose file was never written is a download
 * link to a 404 — the thing this holds against.
 */
const PUBLIC = path.join(process.cwd(), 'public');

describe('the deliverable templates', () => {
  it('offers the eight gate templates asked for', () => {
    expect(Object.keys(DELIVERABLE_TEMPLATES).sort()).toEqual(
      ['EDFT-D7', 'EDV-D7', 'EPD-D8', 'ERTL-D7', 'ESO-D7', 'FPV-D6', 'MRAM-D7', 'PMU-D7'].sort(),
    );
  });

  it('serves each from public/, as an Excel workbook', () => {
    for (const [ref, t] of Object.entries(DELIVERABLE_TEMPLATES)) {
      const file = path.join(PUBLIC, t.href);
      expect(fs.existsSync(file), `${ref}: ${t.href} was never generated`).toBe(true);
      /* an .xlsx is a zip */
      expect(fs.readFileSync(file).subarray(0, 2).toString('latin1'), ref).toBe('PK');
      expect(t.href, ref).toMatch(new RegExp(`^/templates/${ref}-[a-z0-9-]+\\.xlsx$`));
      expect(t.filename, ref).toMatch(/\.xlsx$/);
    }
  });

  /* The point of the workbook: every item carries its evidence and the stage
     lead's confirmation, and the sign-off is counted from them. */
  it('lets the stage lead confirm each item on its evidence, then decide', async () => {
    for (const [ref, t] of Object.entries(DELIVERABLE_TEMPLATES)) {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.readFile(path.join(PUBLIC, t.href));
      const names = wb.worksheets.map((ws) => ws.name);
      for (const n of ['Sign-off', 'Checklist', 'Open issues', 'Waivers', 'Handover', 'Guide']) {
        expect(names, `${ref} has no ${n} sheet`).toContain(n);
      }
      const check = wb.getWorksheet('Checklist')!;
      expect(check.getCell(3, 6).value, ref).toMatch(/Evidence/);
      expect(check.getCell(3, 10).value, ref).toBe('Stage lead confirmation');
      const items: number[] = [];
      for (let r = 4; r <= check.rowCount; r++) if (check.getCell(r, 3).value) items.push(r);
      expect(items.length, `${ref} lists too few items`).toBeGreaterThan(15);
      const sections = new Set(items.map((r) => String(check.getCell(r, 2).value)));
      for (const s of ['Baseline', 'Entry criteria', 'Checks', 'Exit criteria', 'Failure modes']) {
        expect(sections, `${ref} has no ${s}`).toContain(s);
      }
      for (const r of items) {
        expect(check.getCell(r, 10).value, `${ref} row ${r}`).toBe('Pending');
        expect(check.getCell(r, 10).dataValidation?.formulae?.[0], `${ref} row ${r}`).toBe('"Pending,Confirmed,Rejected"');
        expect(check.getCell(r, 8).dataValidation?.formulae?.[0], `${ref} row ${r}`).toBe('"Pass,Fail,Waived,N/A,Open"');
        expect(String((check.getCell(r, 13).value as { formula?: string })?.formula), `${ref} row ${r}`).toContain('Evidence missing');
      }
      const signoff = wb.getWorksheet('Sign-off')!;
      const labels: string[] = [];
      signoff.eachRow((row) => labels.push(String(row.getCell(1).value ?? '')));
      for (const l of ['Items to confirm', 'Stage lead — Confirmed', 'Suggested outcome', 'Decision', 'Stage lead']) {
        expect(labels, `${ref} Sign-off has no ${l}`).toContain(l);
      }
    }
  });

  it('belongs to a deliverable an activity hands over', () => {
    const producers = producersOf(ALL_ACTIVITIES);
    for (const ref of Object.keys(DELIVERABLE_TEMPLATES)) {
      expect(ALL_DELIVERABLE_TITLES[ref], `${ref} is not a deliverable`).toBeTruthy();
      expect(deliverableStep(ref, producers), `${ref} has no producing activity`).toBeTruthy();
    }
  });

  it('offers nothing for a deliverable without one', () => {
    expect(templateFor('EDV-D7')).toBe(DELIVERABLE_TEMPLATES['EDV-D7']);
    expect(templateFor('EDV-D1')).toBeUndefined();
    expect(templateFor(null)).toBeUndefined();
  });
});
