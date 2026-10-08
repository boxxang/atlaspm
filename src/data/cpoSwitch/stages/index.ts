/**
 * Every CPO stage module, by prefix. Composed in /data/cpoSwitch.
 */
import type { CpoStageModule } from '../types';
import { CON } from './con';
import { REQ } from './req';
import { SARC } from './sarc';
import { ICD } from './icd';
import { PCTL } from './pctl';
import { FEAS } from './feas';
import { TRDY } from './trdy';
import { MODL } from './modl';
import { DSGN } from './dsgn';
import { PSV } from './psv';
import { IMPL } from './impl';
import { SGNO } from './sgno';
import { OTO } from './oto';
import { MTO } from './mto';
import { WFAB } from './wfab';
import { SORT } from './sort';
import { TINF } from './tinf';
import { PKGA } from './pkga';
import { PON } from './pon';
import { OBU } from './obu';
import { SINT } from './sint';
import { CHAR } from './char';
import { SDBG } from './sdbg';
import { CERT } from './cert';
import { RELQ } from './relq';
import { NPI } from './npi';
import { RAMP } from './ramp';
import { SUST } from './sust';

export const CPO_STAGE_MODULES: Record<string, CpoStageModule> = {
  CON,
  REQ,
  SARC,
  ICD,
  PCTL,
  FEAS,
  TRDY,
  MODL,
  DSGN,
  PSV,
  IMPL,
  SGNO,
  OTO,
  MTO,
  WFAB,
  SORT,
  TINF,
  PKGA,
  PON,
  OBU,
  SINT,
  CHAR,
  SDBG,
  CERT,
  RELQ,
  NPI,
  RAMP,
  SUST,
};
