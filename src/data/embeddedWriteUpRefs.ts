/**
 * /data/embeddedWriteUpRefs.ts — where an SoC write-up's cross-references land
 * in an embedded programme.
 *
 * The SoC write-ups the embedded ones derive from name activities the embedded
 * programme does not run: custom AMS IP, the test chip, the interposer and
 * substrate package, the package test vehicle, chip-package co-verification,
 * PCIe and HBM bring-up. Some of that work exists here under another stage —
 * the power manager is AMS-06's analog power management, the package is
 * EPKG's — and a reference to it moves there. The rest has no counterpart, and
 * a reference to it is `null`: dropped from a list, and never left in prose
 * (the write-up edits rewrite any sentence that names one, and a test holds
 * them to it).
 *
 * References to the derived stages move with /data/embeddedSocDerived's own
 * map (DEF-03 → EDEF-03); this one covers only what that map cannot.
 */
import { toEmbeddedRef } from './embeddedSocDerived';

export const WRITE_UP_REF_MAP: Record<string, string | null> = {
  /* custom, AMS and memory IP — the power manager and eMRAM carry what exists */
  'AMS-01': 'PMU-01',
  'AMS-02': null,
  'AMS-03': 'PMU-02',
  'AMS-04': null,
  'AMS-05': 'PMU-03',
  'AMS-06': 'PMU-03',
  'AMS-07': null,
  'AMS-08': 'MRAM-06',
  'AMS-09': null,
  'AMS-10': null,
  'AMS-11': 'PMU-05',
  'AMS-12': 'PMU-05',
  'AMS-13': 'PMU-06',
  'AMS-14': 'MRAM-05',
  'AMS-15': 'PMU-07',
  'AMS-16': 'PMU-05',
  'PDK-11': 'MRAM-01',
  /* no test chip */
  'TC-01': null,
  'TC-02': null,
  'TC-03': null,
  'TC-04': null,
  'TC-05': null,
  'TC-06': null,
  'TC-07': null,
  'TC-08': null,
  /* the package is EPKG's */
  'PKGD-01': 'EPKG-01',
  'PKGD-02': 'EPKG-02',
  'PKGD-03': null,
  'PKGD-04': 'EPKG-03',
  'PKGD-05': 'EPKG-03',
  'PKGD-06': 'EPKG-04',
  'PKGD-07': 'EPKG-05',
  'PKGD-08': 'EPKG-05',
  'PKGD-09': 'EPKG-04',
  'PKGD-10': 'EPKG-04',
  'PKGD-11': 'EPKG-06',
  'PD-04': 'EPKG-02',
  /* no package test vehicle */
  'PTV-01': null,
  'PTV-02': null,
  'PTV-03': null,
  'PTV-04': null,
  'PTV-05': null,
  'PTV-06': null,
  'PTV-07': null,
  'PTV-08': null,
  'PTV-09': null,
  'PTV-10': null,
  'PTV-11': null,
  'PTV-12': null,
  /* package electrical modelling is EPKG-04's; the channel work does not exist */
  'SIPI-01': 'EPKG-04',
  'SIPI-02': 'EPKG-04',
  'SIPI-03': 'EPKG-04',
  'SIPI-04': null,
  'SIPI-05': 'EPKG-04',
  'SIPI-06': 'EPKG-04',
  'SIPI-07': null,
  'SIPI-08': null,
  'SIPI-09': null,
  'SIPI-10': 'EPKG-04',
  'SIPI-11': null,
  'PD-10': null,
  'SO-12': null,
  /* assembly is EASSY's */
  'ASSY-01': 'EASSY-01',
  'ASSY-02': null,
  'ASSY-03': 'EASSY-02',
  'ASSY-04': null,
  'ASSY-05': 'EASSY-03',
  'ASSY-06': 'EASSY-04',
  'ASSY-07': 'EASSY-03',
  'ASSY-08': 'EASSY-04',
  'ASSY-09': 'EASSY-03',
  'ASSY-10': 'EASSY-05',
  'ASSY-11': 'EASSY-03',
  /* emulation and the FPGA prototype are FPV's */
  'DV-03': 'FPV-03',
  /* what an embedded part does not have */
  'EVB-06': null,
  'BU-06': null,
  'BU-07': null,
};

const ACTIVITY_REF = /\b\d?[A-Z][A-Z0-9]{1,4}-\d{2}\b/g;

/** One reference, as the embedded programme knows it; null if it has none. */
export const embeddedRefFor = (ref: string): string | null =>
  ref in WRITE_UP_REF_MAP ? WRITE_UP_REF_MAP[ref] : toEmbeddedRef(ref);

/**
 * Prose with every reference moved onto the embedded programme. A reference
 * with no counterpart is left as it is, for the test that catches it.
 */
export const toEmbeddedProse = (text: string): string =>
  toEmbeddedRef(
    text.replace(ACTIVITY_REF, (m) => (m in WRITE_UP_REF_MAP ? (WRITE_UP_REF_MAP[m] ?? m) : m)),
  );

/** A list of references, moved, with the ones that have no counterpart dropped. */
export const toEmbeddedRefs = (refs: readonly string[], self?: string): string[] => [
  ...new Set(refs.map(embeddedRefFor).filter((r): r is string => !!r && r !== self)),
];
