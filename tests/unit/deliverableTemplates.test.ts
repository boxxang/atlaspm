import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_ACTIVITIES, ALL_DELIVERABLE_TITLES } from '@/data/builtins';
import { DELIVERABLE_TEMPLATES, templateFor } from '@/data/deliverableTemplates';
import { deliverableStep, producersOf } from '@/lib/deliverableStatus';

/**
 * The templates a gate deliverable's handover offers exist, are Word
 * documents, and belong to a deliverable some activity hands over.
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

  it('serves each from public/, as a Word document', () => {
    for (const [ref, t] of Object.entries(DELIVERABLE_TEMPLATES)) {
      const file = path.join(PUBLIC, t.href);
      expect(fs.existsSync(file), `${ref}: ${t.href} was never generated`).toBe(true);
      /* a .docx is a zip */
      expect(fs.readFileSync(file).subarray(0, 2).toString('latin1'), ref).toBe('PK');
      expect(t.href, ref).toMatch(new RegExp(`^/templates/${ref}-[a-z0-9-]+\\.docx$`));
      expect(t.filename, ref).toMatch(/\.docx$/);
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
