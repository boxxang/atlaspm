/**
 * /data/embeddedWriteUps.ts — the Embedded SoC's own activities, written up.
 * Prose authored per stage under /data/embeddedWriteUps; server-only in
 * practice, like every other write-up.
 */
import type { ActivityWriteUp } from './activityDetailTypes';
import { FCD_WRITE_UPS } from './embeddedWriteUps/fcd';
import { CMP_WRITE_UPS } from './embeddedWriteUps/cmp';
import { MRAM_WRITE_UPS } from './embeddedWriteUps/mram';
import { PMU_WRITE_UPS } from './embeddedWriteUps/pmu';
import { VP_WRITE_UPS } from './embeddedWriteUps/vp';
import { FPV_WRITE_UPS } from './embeddedWriteUps/fpv';
import { SDK_WRITE_UPS } from './embeddedWriteUps/sdk';
import { EPKG_WRITE_UPS } from './embeddedWriteUps/epkg';
import { EAP_WRITE_UPS } from './embeddedWriteUps/eap';
import { EVK_WRITE_UPS } from './embeddedWriteUps/evk';
import { EASSY_WRITE_UPS } from './embeddedWriteUps/eassy';
import { CREL_WRITE_UPS } from './embeddedWriteUps/crel';
import { EVKL_WRITE_UPS } from './embeddedWriteUps/evkl';

export const EMBEDDED_WRITE_UPS: Record<string, ActivityWriteUp> = {
  ...FCD_WRITE_UPS,
  ...CMP_WRITE_UPS,
  ...MRAM_WRITE_UPS,
  ...PMU_WRITE_UPS,
  ...VP_WRITE_UPS,
  ...FPV_WRITE_UPS,
  ...SDK_WRITE_UPS,
  ...EPKG_WRITE_UPS,
  ...EAP_WRITE_UPS,
  ...EVK_WRITE_UPS,
  ...EASSY_WRITE_UPS,
  ...CREL_WRITE_UPS,
  ...EVKL_WRITE_UPS,
};
