/**
 * The shape of an edit to an SoC write-up an embedded activity derives from.
 *
 * Each field, when present, replaces the SoC field whole — a list is rewritten
 * as a list, so what is left of the SoC wording is exactly what was reviewed
 * and kept. References are written as the SoC write-up writes them (DEF-03,
 * DEF-D2) and move onto the embedded programme when the write-up is composed.
 */
import type { DetailRole } from '../activityDetailTypes';

export interface WriteUpEdit {
  purpose?: string[];
  flowNote?: string;
  consumes?: string[];
  /** Relation sentences, by the SoC deliverable reference they explain. */
  rel?: Record<string, string>;
  risks?: string[];
  roles?: DetailRole[];
  /** Effort labels, in the SoC order; the man-months are scaled, not written. */
  effortLabels?: string[];
  entry?: string[];
  exit?: string[];
  measuredBy?: string[];
  dependsNote?: string | null;
  terms?: string[];
}
