/**
 * Every UCIe write-up, by activity reference. Server-only in practice: the
 * page reads it, the browser is never handed the prose.
 */
import type { UcieWriteUps } from '../types';
import { UCON_WRITE_UPS } from './ucon';
import { UREQ_WRITE_UPS } from './ureq';
import { UARC_WRITE_UPS } from './uarc';
import { UTEC_WRITE_UPS } from './utec';
import { UFND_WRITE_UPS } from './ufnd';
import { UAFE_WRITE_UPS } from './uafe';
import { URTL_WRITE_UPS } from './urtl';
import { UDFT_WRITE_UPS } from './udft';
import { UDV_WRITE_UPS } from './udv';
import { UAMS_WRITE_UPS } from './uams';
import { UDPD_WRITE_UPS } from './udpd';
import { ULAY_WRITE_UPS } from './ulay';
import { USGN_WRITE_UPS } from './usgn';
import { UCHN_WRITE_UPS } from './uchn';
import { UTCI_WRITE_UPS } from './utci';
import { UTVP_WRITE_UPS } from './utvp';
import { UTPO_WRITE_UPS } from './utpo';
import { UFAB_WRITE_UPS } from './ufab';
import { UBUP_WRITE_UPS } from './ubup';
import { UCHR_WRITE_UPS } from './uchr';
import { UCMP_WRITE_UPS } from './ucmp';
import { URLQ_WRITE_UPS } from './urlq';
import { UPRE_WRITE_UPS } from './upre';
import { UGA_WRITE_UPS } from './uga';
import { UCUS_WRITE_UPS } from './ucus';

export const UCIE_WRITE_UPS: UcieWriteUps = {
  ...UCON_WRITE_UPS,
  ...UREQ_WRITE_UPS,
  ...UARC_WRITE_UPS,
  ...UTEC_WRITE_UPS,
  ...UFND_WRITE_UPS,
  ...UAFE_WRITE_UPS,
  ...URTL_WRITE_UPS,
  ...UDFT_WRITE_UPS,
  ...UDV_WRITE_UPS,
  ...UAMS_WRITE_UPS,
  ...UDPD_WRITE_UPS,
  ...ULAY_WRITE_UPS,
  ...USGN_WRITE_UPS,
  ...UCHN_WRITE_UPS,
  ...UTCI_WRITE_UPS,
  ...UTVP_WRITE_UPS,
  ...UTPO_WRITE_UPS,
  ...UFAB_WRITE_UPS,
  ...UBUP_WRITE_UPS,
  ...UCHR_WRITE_UPS,
  ...UCMP_WRITE_UPS,
  ...URLQ_WRITE_UPS,
  ...UPRE_WRITE_UPS,
  ...UGA_WRITE_UPS,
  ...UCUS_WRITE_UPS,
};
