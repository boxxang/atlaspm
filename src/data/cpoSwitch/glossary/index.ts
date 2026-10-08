/**
 * The terms the CPO write-ups use that neither the SoC, 3DIC nor Embedded SoC
 * glossary explains. Client-safe and small, like the others.
 */
import type { CpoGlossary } from '../types';
import { CORE_GLOSSARY } from './core';
import { CON_GLOSSARY } from './con';
import { REQ_GLOSSARY } from './req';
import { SARC_GLOSSARY } from './sarc';
import { ICD_GLOSSARY } from './icd';
import { PCTL_GLOSSARY } from './pctl';
import { FEAS_GLOSSARY } from './feas';
import { TRDY_GLOSSARY } from './trdy';
import { MODL_GLOSSARY } from './modl';
import { DSGN_GLOSSARY } from './dsgn';
import { PSV_GLOSSARY } from './psv';
import { OESD_GLOSSARY } from './oesd';
import { IMPL_GLOSSARY } from './impl';
import { SGNO_GLOSSARY } from './sgno';
import { MTO_GLOSSARY } from './mto';
import { WFAB_GLOSSARY } from './wfab';
import { SORT_GLOSSARY } from './sort';
import { TINF_GLOSSARY } from './tinf';
import { PKGA_GLOSSARY } from './pkga';
import { PON_GLOSSARY } from './pon';
import { OBU_GLOSSARY } from './obu';
import { SINT_GLOSSARY } from './sint';
import { CHAR_GLOSSARY } from './char';
import { SDBG_GLOSSARY } from './sdbg';
import { CERT_GLOSSARY } from './cert';
import { RELQ_GLOSSARY } from './relq';
import { NPI_GLOSSARY } from './npi';
import { RAMP_GLOSSARY } from './ramp';
import { SUST_GLOSSARY } from './sust';

export const CPO_GLOSSARY: CpoGlossary = {
  ...CORE_GLOSSARY,
  ...CON_GLOSSARY,
  ...REQ_GLOSSARY,
  ...SARC_GLOSSARY,
  ...ICD_GLOSSARY,
  ...PCTL_GLOSSARY,
  ...FEAS_GLOSSARY,
  ...TRDY_GLOSSARY,
  ...MODL_GLOSSARY,
  ...DSGN_GLOSSARY,
  ...PSV_GLOSSARY,
  ...OESD_GLOSSARY,
  ...IMPL_GLOSSARY,
  ...SGNO_GLOSSARY,
  ...MTO_GLOSSARY,
  ...WFAB_GLOSSARY,
  ...SORT_GLOSSARY,
  ...TINF_GLOSSARY,
  ...PKGA_GLOSSARY,
  ...PON_GLOSSARY,
  ...OBU_GLOSSARY,
  ...SINT_GLOSSARY,
  ...CHAR_GLOSSARY,
  ...SDBG_GLOSSARY,
  ...CERT_GLOSSARY,
  ...RELQ_GLOSSARY,
  ...NPI_GLOSSARY,
  ...RAMP_GLOSSARY,
  ...SUST_GLOSSARY,
};
