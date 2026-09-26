/**
 * /data/embeddedWriteUpEdits.ts — every edit the embedded write-ups make to
 * the SoC write-ups they derive from, one module per stage. Server-only in
 * practice: it is prose, and only the write-up page reads it.
 */
import { DEF_WRITE_UP_EDITS } from './embeddedWriteUpEdits/productDefinition';
import { TECH_WRITE_UP_EDITS } from './embeddedWriteUpEdits/technology';
import { ARCH_WRITE_UP_EDITS } from './embeddedWriteUpEdits/architecture';
import { IPR_WRITE_UP_EDITS } from './embeddedWriteUpEdits/ipReadiness';
import { PDK_WRITE_UP_EDITS } from './embeddedWriteUpEdits/pdk';
import { RTL_WRITE_UP_EDITS } from './embeddedWriteUpEdits/rtl';
import { DV_WRITE_UP_EDITS } from './embeddedWriteUpEdits/verification';
import { DFT_WRITE_UP_EDITS } from './embeddedWriteUpEdits/dft';
import { SYN_WRITE_UP_EDITS } from './embeddedWriteUpEdits/synthesis';
import { PD_WRITE_UP_EDITS } from './embeddedWriteUpEdits/physicalDesign';
import { SO_WRITE_UP_EDITS } from './embeddedWriteUpEdits/signoff';
import { TO_WRITE_UP_EDITS } from './embeddedWriteUpEdits/tapeout';
import { FAB_WRITE_UP_EDITS } from './embeddedWriteUpEdits/fabrication';
import { EVB_WRITE_UP_EDITS } from './embeddedWriteUpEdits/validationHardware';
import { TEST_WRITE_UP_EDITS } from './embeddedWriteUpEdits/testDevelopment';
import { BU_WRITE_UP_EDITS } from './embeddedWriteUpEdits/bringup';
import { MP_WRITE_UP_EDITS } from './embeddedWriteUpEdits/qualification';
import type { WriteUpEdit } from './embeddedWriteUpEdits/types';

export type { WriteUpEdit };

export const EMBEDDED_WRITE_UP_EDITS: Record<string, WriteUpEdit> = {
  ...DEF_WRITE_UP_EDITS,
  ...TECH_WRITE_UP_EDITS,
  ...ARCH_WRITE_UP_EDITS,
  ...IPR_WRITE_UP_EDITS,
  ...PDK_WRITE_UP_EDITS,
  ...RTL_WRITE_UP_EDITS,
  ...DV_WRITE_UP_EDITS,
  ...DFT_WRITE_UP_EDITS,
  ...SYN_WRITE_UP_EDITS,
  ...PD_WRITE_UP_EDITS,
  ...SO_WRITE_UP_EDITS,
  ...TO_WRITE_UP_EDITS,
  ...FAB_WRITE_UP_EDITS,
  ...EVB_WRITE_UP_EDITS,
  ...TEST_WRITE_UP_EDITS,
  ...BU_WRITE_UP_EDITS,
  ...MP_WRITE_UP_EDITS,
};
