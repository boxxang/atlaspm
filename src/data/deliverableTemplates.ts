/**
 * /data/deliverableTemplates.ts — the documents a key deliverable's handover
 * can be started from.
 *
 * A handover is complete when the artefact is attached. For a gate — a freeze,
 * a closure, a signoff — the artefact is a document, and one written from a
 * blank page is one that forgets its waivers or its reopening conditions. So
 * these deliverables offer a template beside the Handover heading, built by
 * tools/deliverable-templates/build.ts from the write-up of the activity that
 * produces each one, and served from public/templates.
 *
 * Keyed by deliverable reference, which is how the handover knows its row.
 * Client-safe: a list of paths.
 */
export interface DeliverableTemplate {
  /** Where the file is served. */
  href: string;
  /** What the download is called. */
  filename: string;
}

const docx = (ref: string, slug: string): DeliverableTemplate => ({
  href: `/templates/${ref}-${slug}.docx`,
  filename: `${ref}-${slug}-template.docx`,
});

export const DELIVERABLE_TEMPLATES: Record<string, DeliverableTemplate> = {
  'ERTL-D7': docx('ERTL-D7', 'rtl-freeze-package'),
  'EDV-D7': docx('EDV-D7', 'dv-closure-signoff'),
  'MRAM-D7': docx('MRAM-D7', 'emram-integration-signoff'),
  'PMU-D7': docx('PMU-D7', 'pmu-always-on-signoff'),
  'FPV-D6': docx('FPV-D6', 'fpga-verification-signoff'),
  'EDFT-D7': docx('EDFT-D7', 'dft-signoff-entry'),
  'EPD-D8': docx('EPD-D8', 'signoff-ready-database-handoff'),
  'ESO-D7': docx('ESO-D7', 'signoff-summary-design-freeze'),
};

export const templateFor = (ref: string | null | undefined): DeliverableTemplate | undefined =>
  ref ? DELIVERABLE_TEMPLATES[ref] : undefined;
