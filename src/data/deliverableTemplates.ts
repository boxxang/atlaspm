/**
 * /data/deliverableTemplates.ts — the sign-off workbooks a key deliverable's
 * handover can be started from.
 *
 * A gate — a freeze, a closure, a signoff — is confirmed item by item: every
 * item carries a result, its evidence and an owner's status, and the stage lead
 * confirms or rejects each on that evidence before deciding. These deliverables
 * offer an Excel workbook built for that beside the Handover heading, generated
 * by tools/deliverable-templates/build.ts from the write-up of the activity that
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

const xlsx = (ref: string, slug: string): DeliverableTemplate => ({
  href: `/templates/${ref}-${slug}.xlsx`,
  filename: `${ref}-${slug}-template.xlsx`,
});

export const DELIVERABLE_TEMPLATES: Record<string, DeliverableTemplate> = {
  'ERTL-D7': xlsx('ERTL-D7', 'rtl-freeze-package'),
  'EDV-D7': xlsx('EDV-D7', 'dv-closure-signoff'),
  'MRAM-D7': xlsx('MRAM-D7', 'emram-integration-signoff'),
  'PMU-D7': xlsx('PMU-D7', 'pmu-always-on-signoff'),
  'FPV-D6': xlsx('FPV-D6', 'fpga-verification-signoff'),
  'EDFT-D7': xlsx('EDFT-D7', 'dft-signoff-entry'),
  'EPD-D8': xlsx('EPD-D8', 'signoff-ready-database-handoff'),
  'ESO-D7': xlsx('ESO-D7', 'signoff-summary-design-freeze'),
};

export const templateFor = (ref: string | null | undefined): DeliverableTemplate | undefined =>
  ref ? DELIVERABLE_TEMPLATES[ref] : undefined;
