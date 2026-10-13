/**
 * Every UCIe stage module, by prefix. Composed in /data/ucieAdv64.
 */
import type { UcieStageModule } from '../types';
import { UCON } from './ucon';
import { UREQ } from './ureq';
import { UARC } from './uarc';
import { UTEC } from './utec';
import { UFND } from './ufnd';
import { UAFE } from './uafe';
import { URTL } from './urtl';
import { UDFT } from './udft';
import { UDV } from './udv';
import { UAMS } from './uams';
import { UDPD } from './udpd';
import { ULAY } from './ulay';
import { USGN } from './usgn';
import { UCHN } from './uchn';
import { UTCI } from './utci';
import { UTVP } from './utvp';
import { UTPO } from './utpo';
import { UFAB } from './ufab';
import { UBUP } from './ubup';
import { UCHR } from './uchr';
import { UCMP } from './ucmp';
import { URLQ } from './urlq';
import { UPRE } from './upre';
import { UGA } from './uga';
import { UCUS } from './ucus';

export const UCIE_STAGE_MODULES: Record<string, UcieStageModule> = {
  UCON,
  UREQ,
  UARC,
  UTEC,
  UFND,
  UAFE,
  URTL,
  UDFT,
  UDV,
  UAMS,
  UDPD,
  ULAY,
  USGN,
  UCHN,
  UTCI,
  UTVP,
  UTPO,
  UFAB,
  UBUP,
  UCHR,
  UCMP,
  URLQ,
  UPRE,
  UGA,
  UCUS,
};
