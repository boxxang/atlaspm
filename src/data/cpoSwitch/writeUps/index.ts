/**
 * Every CPO write-up, by activity reference. Server-only in practice, like
 * every other template's write-ups: the page reads it, the browser is never
 * handed the prose.
 */
import type { CpoWriteUps } from '../types';
import { CON_WRITE_UPS } from './con';
import { REQ_WRITE_UPS } from './req';
import { SARC_WRITE_UPS } from './sarc';
import { ICD_WRITE_UPS } from './icd';
import { PCTL_WRITE_UPS } from './pctl';
import { FEAS_WRITE_UPS } from './feas';
import { TRDY_WRITE_UPS } from './trdy';
import { MODL_WRITE_UPS } from './modl';
import { DSGN_WRITE_UPS } from './dsgn';
import { PSV_WRITE_UPS } from './psv';
import { OESD_WRITE_UPS } from './oesd';
import { PKTV_WRITE_UPS } from './pktv';
import { IMPL_WRITE_UPS } from './impl';
import { SGNO_WRITE_UPS } from './sgno';
import { OTO_WRITE_UPS } from './oto';
import { MTO_WRITE_UPS } from './mto';
import { WFAB_WRITE_UPS } from './wfab';
import { SORT_WRITE_UPS } from './sort';
import { OEB_WRITE_UPS } from './oeb';
import { TINF_WRITE_UPS } from './tinf';
import { PKGA_WRITE_UPS } from './pkga';
import { PON_WRITE_UPS } from './pon';
import { OBU_WRITE_UPS } from './obu';
import { SINT_WRITE_UPS } from './sint';
import { CHAR_WRITE_UPS } from './char';
import { SDBG_WRITE_UPS } from './sdbg';
import { CERT_WRITE_UPS } from './cert';
import { RELQ_WRITE_UPS } from './relq';
import { NPI_WRITE_UPS } from './npi';
import { RAMP_WRITE_UPS } from './ramp';
import { SUST_WRITE_UPS } from './sust';

export const CPO_WRITE_UPS: CpoWriteUps = {
  ...CON_WRITE_UPS,
  ...REQ_WRITE_UPS,
  ...SARC_WRITE_UPS,
  ...ICD_WRITE_UPS,
  ...PCTL_WRITE_UPS,
  ...FEAS_WRITE_UPS,
  ...TRDY_WRITE_UPS,
  ...MODL_WRITE_UPS,
  ...DSGN_WRITE_UPS,
  ...PSV_WRITE_UPS,
  ...OESD_WRITE_UPS,
  ...PKTV_WRITE_UPS,
  ...IMPL_WRITE_UPS,
  ...SGNO_WRITE_UPS,
  ...OTO_WRITE_UPS,
  ...MTO_WRITE_UPS,
  ...WFAB_WRITE_UPS,
  ...SORT_WRITE_UPS,
  ...OEB_WRITE_UPS,
  ...TINF_WRITE_UPS,
  ...PKGA_WRITE_UPS,
  ...PON_WRITE_UPS,
  ...OBU_WRITE_UPS,
  ...SINT_WRITE_UPS,
  ...CHAR_WRITE_UPS,
  ...SDBG_WRITE_UPS,
  ...CERT_WRITE_UPS,
  ...RELQ_WRITE_UPS,
  ...NPI_WRITE_UPS,
  ...RAMP_WRITE_UPS,
  ...SUST_WRITE_UPS,
};
