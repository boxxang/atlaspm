/**
 * `npx tsx tools/qor-samples/e2.ts [out.xlsx]` — the E2 example's P&R QoR
 * workbook, for the QoR Dashboard tab of Embedded_SoC's physical design stage.
 *
 * The numbers are the story's (/data/e2Demo.ts, the "PnR QoR tracker" note):
 * Turn 1 on N1, Turn 2 on N2, and the final turn on the FFN — placement,
 * placement with useful skew on the arbiter clock, and the CTS that is under
 * way on 09/27 with four of ten blocks reported. Chip totals roll up to what
 * the note says: setup WNS −142 / −17 / −61 / −38 ps, and so on.
 *
 * Written in the shape the dashboard reads (/lib/qor/schema): Meta, Blocks,
 * Drops, Targets, and one sheet per drop. Checked by parsing it back with the
 * dashboard's own parser before it is written.
 */
import ExcelJS from 'exceljs';
import { parseSheets, type Cell } from '../../src/lib/qor/parse';
import { rollup } from '../../src/lib/qor/rollup';
import { SHEET_COLS } from '../../src/lib/qor/schema';

const OUT = process.argv[2] ?? `${process.env.HOME}/Downloads/embedded-soc-e2-qor.xlsx`;

/* ── the design ── */

const BLOCKS: [string, string][] = [
  ['fabric_q0', 'Fabric'],
  ['fabric_q1', 'Fabric'],
  ['fabric_q2', 'Fabric'],
  ['fabric_q3', 'Fabric'],
  ['noc_arb', 'Fabric'],
  ['emram_ctrl', 'Memory'],
  ['aon_hub', 'Always-on'],
  ['scalar_ctl', 'Control'],
  ['periph_top', 'Peripherals'],
  ['e2_top', 'Top'],
];

const DROPS: [string, string, string][] = [
  ['T1', 'Turn 1 — N1', '2026-08-21'],
  ['T2', 'Turn 2 — N2', '2026-09-18'],
  ['F1', 'Final — FFN place', '2026-09-17'],
  ['F2', 'Final — FFN place, useful skew', '2026-09-25'],
  ['F3', 'Final — FFN CTS (in progress)', '2026-09-27'],
];

/** What E2 is signed off against — a 120 MHz ULP part, not the template's SoC defaults. */
const TARGETS: [string, number][] = [
  ['wns', 0], ['tns', 0], ['feps', 0], ['holdW', 0], ['holdTns', 0], ['holdV', 0],
  ['skew', 120], ['maxTran', 0], ['maxCap', 0], ['maxFanout', 0], ['worstTran', 0.45],
  ['minPeriod', 0], ['mpw', 0], ['util', 72], ['overflow', 1], ['drc', 0],
  ['leak', 12], ['irStatic', 20], ['irDynamic', 64], ['runtime', 20], ['ecos', 150], ['ecoRounds', 4],
];

/* ── the measurements ── */

type Row = {
  stage: string;
  inst: number;
  util: number;
  wns: number; tns: number; feps: number; sc?: string; sm?: string;
  holdW?: number | null; holdTns?: number | null; holdV?: number | null; hc?: string; hm?: string;
  skew?: number | null;
  maxTran: number; worstTran: number; maxCap: number; maxFanout: number; minPeriod?: number; mpw?: number;
  overflow: number; drc: number | null;
  dyn: number; leak: number; budget: number;
  irS: number; irD: number;
  runtime: number; ecos: number; ecoRounds: number;
};

const SS = 'ssg_0p72v_m40c';
const SS_LV = 'ssg_0p54v_m40c';
const FF = 'ffg_0p88v_125c';
const FUNC = 'func_120m';
const LV = 'func_lv40m';
const SHIFT = 'scan_shift';

/* dynamic power: W7 max-activity vectors at 120 MHz, TT 0.8 V; leakage at FFG 0.88 V / 125 °C */
/* total power (dynamic + leakage) each block is allowed; 92 mW for the chip */
const BUDGET: Record<string, number> = {
  fabric_q0: 17, fabric_q1: 17, fabric_q2: 17, fabric_q3: 17, noc_arb: 6,
  emram_ctrl: 5, aon_hub: 1, scalar_ctl: 4, periph_top: 3, e2_top: 5,
};

const b = (name: string, r: Omit<Row, 'budget'>): [string, Row] => [name, { ...r, budget: BUDGET[name] }];

const DATA: Record<string, [string, Row][]> = {
  /* Turn 1 on N1: everything routed once, far from closed */
  T1: [
    b('fabric_q0', { stage: 'Post-route opt', inst: 645000, util: 68.5, wns: -118, tns: -7.9, feps: 1210, sc: SS, sm: FUNC, holdW: -22, holdTns: -0.31, holdV: 410, hc: FF, hm: SHIFT, skew: 88, maxTran: 64, worstTran: 0.52, maxCap: 12, maxFanout: 0, overflow: 0.9, drc: 980, dyn: 15, leak: 2.2, irS: 17.1, irD: 66.4, runtime: 21.5, ecos: 38, ecoRounds: 2 }),
    b('fabric_q1', { stage: 'Post-route opt', inst: 645000, util: 68.8, wns: -124, tns: -8.6, feps: 1330, sc: SS, sm: FUNC, holdW: -25, holdTns: -0.35, holdV: 450, hc: FF, hm: SHIFT, skew: 92, maxTran: 71, worstTran: 0.54, maxCap: 14, maxFanout: 0, overflow: 1.1, drc: 1040, dyn: 15, leak: 2.2, irS: 17.4, irD: 68.0, runtime: 21.8, ecos: 41, ecoRounds: 2 }),
    b('fabric_q2', { stage: 'Post-route opt', inst: 645000, util: 69.1, wns: -142, tns: -9.8, feps: 1520, sc: SS, sm: FUNC, holdW: -41, holdTns: -0.52, holdV: 610, hc: FF, hm: SHIFT, skew: 97, maxTran: 88, worstTran: 0.58, maxCap: 19, maxFanout: 2, overflow: 1.6, drc: 1210, dyn: 16, leak: 2.2, irS: 18.4, irD: 72.8, runtime: 22.4, ecos: 47, ecoRounds: 2 }),
    b('fabric_q3', { stage: 'Post-route opt', inst: 645000, util: 68.7, wns: -131, tns: -8.9, feps: 1390, sc: SS, sm: FUNC, holdW: -28, holdTns: -0.38, holdV: 470, hc: FF, hm: SHIFT, skew: 90, maxTran: 69, worstTran: 0.53, maxCap: 13, maxFanout: 0, overflow: 1.2, drc: 1010, dyn: 15, leak: 2.2, irS: 17.6, irD: 67.1, runtime: 21.9, ecos: 40, ecoRounds: 2 }),
    b('noc_arb', { stage: 'Post-route opt', inst: 176000, util: 63.0, wns: -96, tns: -1.8, feps: 410, sc: SS, sm: FUNC, holdW: -14, holdTns: -0.08, holdV: 120, hc: FF, hm: FUNC, skew: 74, maxTran: 22, worstTran: 0.47, maxCap: 4, maxFanout: 0, overflow: 1.4, drc: 290, dyn: 5, leak: 0.4, irS: 15.2, irD: 58.3, runtime: 9.6, ecos: 16, ecoRounds: 2 }),
    b('emram_ctrl', { stage: 'Post-route opt', inst: 92000, util: 60.5, wns: -48, tns: -0.6, feps: 140, sc: SS, sm: FUNC, holdW: -9, holdTns: -0.03, holdV: 44, hc: FF, hm: FUNC, skew: 41, maxTran: 9, worstTran: 0.41, maxCap: 2, maxFanout: 0, overflow: 0.6, drc: 110, dyn: 4, leak: 0.9, irS: 16.0, irD: 61.5, runtime: 6.2, ecos: 9, ecoRounds: 1 }),
    b('aon_hub', { stage: 'Post-route opt', inst: 72000, util: 57.6, wns: -12, tns: -0.1, feps: 18, sc: SS_LV, sm: 'aon_32k', holdW: 3, holdTns: 0, holdV: 0, hc: FF, hm: 'aon_32k', skew: 22, maxTran: 3, worstTran: 0.39, maxCap: 0, maxFanout: 0, overflow: 0.2, drc: 12, dyn: 1, leak: 0.62, irS: 9.8, irD: 21.4, runtime: 4.1, ecos: 3, ecoRounds: 1 }),
    b('scalar_ctl', { stage: 'Post-route opt', inst: 119000, util: 65.8, wns: -35, tns: -0.4, feps: 96, sc: SS, sm: FUNC, holdW: -6, holdTns: -0.02, holdV: 31, hc: FF, hm: FUNC, skew: 55, maxTran: 11, worstTran: 0.43, maxCap: 1, maxFanout: 0, overflow: 0.4, drc: 45, dyn: 3, leak: 0.3, irS: 13.7, irD: 49.2, runtime: 7.4, ecos: 12, ecoRounds: 2 }),
    b('periph_top', { stage: 'Post-route opt', inst: 201000, util: 59.7, wns: -22, tns: -0.2, feps: 64, sc: SS, sm: FUNC, holdW: -11, holdTns: -0.05, holdV: 88, hc: FF, hm: SHIFT, skew: 63, maxTran: 14, worstTran: 0.44, maxCap: 3, maxFanout: 1, overflow: 0.3, drc: 38, dyn: 2, leak: 0.5, irS: 11.9, irD: 38.7, runtime: 8.3, ecos: 10, ecoRounds: 1 }),
    b('e2_top', { stage: 'Post-route opt', inst: 548000, util: 61.2, wns: -61, tns: -0.3, feps: 242, sc: SS, sm: FUNC, holdW: -18, holdTns: -0.09, holdV: 160, hc: FF, hm: SHIFT, skew: 118, maxTran: 36, worstTran: 0.49, maxCap: 8, maxFanout: 3, overflow: 0.8, drc: 135, dyn: 4, leak: 1.1, irS: 16.5, irD: 55.0, runtime: 18.6, ecos: 22, ecoRounds: 2 }),
  ],
  /* Turn 2 on N2: close — the fabric's worst paths move to the low-voltage mode;
     the always-on leakage comes down with the HVT swap */
  T2: [
    b('fabric_q0', { stage: 'Post-route opt', inst: 652500, util: 69.0, wns: -9, tns: -0.12, feps: 31, sc: SS, sm: FUNC, holdW: -3, holdTns: -0.01, holdV: 6, hc: FF, hm: SHIFT, skew: 71, maxTran: 6, worstTran: 0.43, maxCap: 1, maxFanout: 0, overflow: 0.6, drc: 58, dyn: 14, leak: 2.1, irS: 16.2, irD: 55.8, runtime: 19.4, ecos: 64, ecoRounds: 3 }),
    b('fabric_q1', { stage: 'Post-route opt', inst: 652500, util: 69.2, wns: -11, tns: -0.15, feps: 38, sc: SS, sm: FUNC, holdW: -4, holdTns: -0.01, holdV: 8, hc: FF, hm: SHIFT, skew: 74, maxTran: 7, worstTran: 0.44, maxCap: 1, maxFanout: 0, overflow: 0.7, drc: 64, dyn: 14, leak: 2.1, irS: 16.4, irD: 56.9, runtime: 19.6, ecos: 68, ecoRounds: 3 }),
    b('fabric_q2', { stage: 'Post-route opt', inst: 652500, util: 69.4, wns: -17, tns: -0.21, feps: 52, sc: SS_LV, sm: LV, holdW: -6, holdTns: -0.02, holdV: 11, hc: FF, hm: SHIFT, skew: 79, maxTran: 9, worstTran: 0.45, maxCap: 2, maxFanout: 0, overflow: 0.9, drc: 79, dyn: 15, leak: 2.1, irS: 16.8, irD: 58.1, runtime: 19.8, ecos: 77, ecoRounds: 3 }),
    b('fabric_q3', { stage: 'Post-route opt', inst: 652500, util: 69.1, wns: -10, tns: -0.13, feps: 34, sc: SS, sm: FUNC, holdW: -3, holdTns: -0.01, holdV: 5, hc: FF, hm: SHIFT, skew: 72, maxTran: 6, worstTran: 0.43, maxCap: 1, maxFanout: 0, overflow: 0.7, drc: 61, dyn: 14, leak: 2.1, irS: 16.3, irD: 56.2, runtime: 19.5, ecos: 66, ecoRounds: 3 }),
    b('noc_arb', { stage: 'Post-route opt', inst: 182000, util: 64.0, wns: -8, tns: -0.1, feps: 27, sc: SS, sm: FUNC, holdW: -2, holdTns: -0.01, holdV: 3, hc: FF, hm: FUNC, skew: 58, maxTran: 2, worstTran: 0.4, maxCap: 0, maxFanout: 0, overflow: 0.8, drc: 17, dyn: 5, leak: 0.4, irS: 14.8, irD: 54.0, runtime: 8.9, ecos: 21, ecoRounds: 3 }),
    b('emram_ctrl', { stage: 'Post-route opt', inst: 96000, util: 61.0, wns: -3, tns: -0.02, feps: 6, sc: SS, sm: FUNC, holdW: 2, holdTns: 0, holdV: 0, hc: FF, hm: FUNC, skew: 36, maxTran: 1, worstTran: 0.38, maxCap: 0, maxFanout: 0, overflow: 0.5, drc: 9, dyn: 4, leak: 0.9, irS: 15.6, irD: 59.2, runtime: 5.8, ecos: 11, ecoRounds: 2 }),
    b('aon_hub', { stage: 'Post-route opt', inst: 74000, util: 58.0, wns: 6, tns: 0, feps: 0, sc: SS_LV, sm: 'aon_32k', holdW: 4, holdTns: 0, holdV: 0, hc: FF, hm: 'aon_32k', skew: 19, maxTran: 0, worstTran: 0.36, maxCap: 0, maxFanout: 0, overflow: 0.2, drc: 0, dyn: 1, leak: 0.19, irS: 9.5, irD: 20.8, runtime: 4.4, ecos: 5, ecoRounds: 1 }),
    b('scalar_ctl', { stage: 'Post-route opt', inst: 121000, util: 66.0, wns: -2, tns: -0.01, feps: 3, sc: SS, sm: FUNC, holdW: 1, holdTns: 0, holdV: 0, hc: FF, hm: FUNC, skew: 44, maxTran: 0, worstTran: 0.39, maxCap: 0, maxFanout: 0, overflow: 0.3, drc: 4, dyn: 3, leak: 0.3, irS: 13.2, irD: 47.6, runtime: 7.1, ecos: 14, ecoRounds: 2 }),
    b('periph_top', { stage: 'Post-route opt', inst: 205000, util: 60.0, wns: 1, tns: 0, feps: 0, sc: SS, sm: FUNC, holdW: -1, holdTns: 0, holdV: 1, hc: FF, hm: SHIFT, skew: 51, maxTran: 0, worstTran: 0.4, maxCap: 0, maxFanout: 0, overflow: 0.3, drc: 3, dyn: 2, leak: 0.5, irS: 11.6, irD: 37.9, runtime: 8.0, ecos: 12, ecoRounds: 2 }),
    b('e2_top', { stage: 'Post-route opt', inst: 553000, util: 61.8, wns: -12, tns: -0.16, feps: 21, sc: SS, sm: FUNC, holdW: -5, holdTns: -0.02, holdV: 9, hc: FF, hm: SHIFT, skew: 104, maxTran: 4, worstTran: 0.42, maxCap: 1, maxFanout: 0, overflow: 0.6, drc: 17, dyn: 4, leak: 1.1, irS: 16.1, irD: 53.4, runtime: 17.2, ecos: 31, ecoRounds: 3 }),
  ],
  /* the FFN placed: the arbiter fix is the worst timing; W7 vectors find the eMRAM IR.
     DRC from trial detail route, hold from ideal-clock analysis — see Meta */
  F1: [
    b('fabric_q0', { stage: 'Place', inst: 657500, util: 69.2, wns: -24, tns: -0.9, feps: 210, sc: SS, sm: FUNC, holdW: -2, holdTns: 0, holdV: 3, hc: FF, hm: SHIFT, skew: null, maxTran: 118, worstTran: 0.61, maxCap: 26, maxFanout: 0, overflow: 0.7, drc: 96, dyn: 14, leak: 2.1, irS: 16.4, irD: 58.9, runtime: 6.2, ecos: 0, ecoRounds: 0 }),
    b('fabric_q1', { stage: 'Place', inst: 657500, util: 69.3, wns: -27, tns: -1.0, feps: 230, sc: SS, sm: FUNC, holdW: -2, holdTns: 0, holdV: 4, hc: FF, hm: SHIFT, skew: null, maxTran: 124, worstTran: 0.62, maxCap: 28, maxFanout: 0, overflow: 0.8, drc: 104, dyn: 14, leak: 2.1, irS: 16.6, irD: 60.2, runtime: 6.3, ecos: 0, ecoRounds: 0 }),
    b('fabric_q2', { stage: 'Place', inst: 657500, util: 69.5, wns: -33, tns: -1.3, feps: 280, sc: SS_LV, sm: LV, holdW: -3, holdTns: -0.01, holdV: 6, hc: FF, hm: SHIFT, skew: null, maxTran: 139, worstTran: 0.64, maxCap: 31, maxFanout: 1, overflow: 1.0, drc: 121, dyn: 15, leak: 2.1, irS: 16.9, irD: 62.7, runtime: 6.4, ecos: 0, ecoRounds: 0 }),
    b('fabric_q3', { stage: 'Place', inst: 657500, util: 69.2, wns: -26, tns: -0.9, feps: 220, sc: SS, sm: FUNC, holdW: -2, holdTns: 0, holdV: 3, hc: FF, hm: SHIFT, skew: null, maxTran: 121, worstTran: 0.61, maxCap: 27, maxFanout: 0, overflow: 0.8, drc: 99, dyn: 14, leak: 2.1, irS: 16.5, irD: 59.4, runtime: 6.2, ecos: 0, ecoRounds: 0 }),
    b('noc_arb', { stage: 'Place', inst: 193000, util: 68.0, wns: -61, tns: -2.4, feps: 470, sc: SS, sm: FUNC, holdW: -1, holdTns: 0, holdV: 2, hc: FF, hm: FUNC, skew: null, maxTran: 44, worstTran: 0.57, maxCap: 9, maxFanout: 0, overflow: 1.3, drc: 38, dyn: 6, leak: 0.42, irS: 15.1, irD: 57.6, runtime: 3.1, ecos: 0, ecoRounds: 0 }),
    b('emram_ctrl', { stage: 'Place', inst: 100000, util: 63.0, wns: -12, tns: -0.1, feps: 22, sc: SS, sm: FUNC, holdW: 1, holdTns: 0, holdV: 0, hc: FF, hm: FUNC, skew: null, maxTran: 12, worstTran: 0.46, maxCap: 2, maxFanout: 0, overflow: 0.6, drc: 14, dyn: 4, leak: 0.92, irS: 16.9, irD: 89.6, runtime: 2.2, ecos: 0, ecoRounds: 0 }),
    b('aon_hub', { stage: 'Place', inst: 76000, util: 60.0, wns: 4, tns: 0, feps: 0, sc: SS_LV, sm: 'aon_32k', holdW: 3, holdTns: 0, holdV: 0, hc: FF, hm: 'aon_32k', skew: null, maxTran: 2, worstTran: 0.38, maxCap: 0, maxFanout: 0, overflow: 0.2, drc: 0, dyn: 1, leak: 0.19, irS: 9.6, irD: 21.1, runtime: 1.6, ecos: 0, ecoRounds: 0 }),
    b('scalar_ctl', { stage: 'Place', inst: 121000, util: 66.0, wns: -8, tns: -0.05, feps: 14, sc: SS, sm: FUNC, holdW: 1, holdTns: 0, holdV: 0, hc: FF, hm: FUNC, skew: null, maxTran: 9, worstTran: 0.44, maxCap: 1, maxFanout: 0, overflow: 0.3, drc: 6, dyn: 3, leak: 0.3, irS: 13.3, irD: 48.1, runtime: 2.4, ecos: 0, ecoRounds: 0 }),
    b('periph_top', { stage: 'Place', inst: 206000, util: 60.2, wns: -5, tns: -0.02, feps: 9, sc: SS, sm: FUNC, holdW: 0, holdTns: 0, holdV: 0, hc: FF, hm: SHIFT, skew: null, maxTran: 11, worstTran: 0.45, maxCap: 1, maxFanout: 0, overflow: 0.3, drc: 5, dyn: 2, leak: 0.5, irS: 11.7, irD: 38.2, runtime: 2.7, ecos: 0, ecoRounds: 0 }),
    b('e2_top', { stage: 'Place', inst: 582000, util: 62.3, wns: -19, tns: -0.13, feps: 25, sc: SS, sm: FUNC, holdW: -1, holdTns: 0, holdV: 2, hc: FF, hm: SHIFT, skew: null, maxTran: 52, worstTran: 0.55, maxCap: 11, maxFanout: 2, overflow: 0.7, drc: 29, dyn: 4, leak: 1.1, irS: 16.3, irD: 54.2, runtime: 5.8, ecos: 0, ecoRounds: 0 }),
  ],
  /* useful skew on the arbiter clock, pipeline-aware placement; first PDN mitigation over banks 2–3 */
  F2: [
    b('fabric_q0', { stage: 'Place', inst: 657500, util: 69.2, wns: -15, tns: -0.35, feps: 88, sc: SS, sm: FUNC, holdW: -2, holdTns: 0, holdV: 3, hc: FF, hm: SHIFT, skew: null, maxTran: 74, worstTran: 0.55, maxCap: 15, maxFanout: 0, overflow: 0.7, drc: 88, dyn: 14, leak: 2.1, irS: 16.3, irD: 58.1, runtime: 7.0, ecos: 0, ecoRounds: 0 }),
    b('fabric_q1', { stage: 'Place', inst: 657500, util: 69.3, wns: -17, tns: -0.4, feps: 95, sc: SS, sm: FUNC, holdW: -2, holdTns: 0, holdV: 4, hc: FF, hm: SHIFT, skew: null, maxTran: 79, worstTran: 0.56, maxCap: 16, maxFanout: 0, overflow: 0.8, drc: 93, dyn: 14, leak: 2.1, irS: 16.5, irD: 59.3, runtime: 7.1, ecos: 0, ecoRounds: 0 }),
    b('fabric_q2', { stage: 'Place', inst: 657500, util: 69.5, wns: -21, tns: -0.5, feps: 118, sc: SS_LV, sm: LV, holdW: -3, holdTns: -0.01, holdV: 6, hc: FF, hm: SHIFT, skew: null, maxTran: 88, worstTran: 0.57, maxCap: 18, maxFanout: 0, overflow: 0.9, drc: 107, dyn: 15, leak: 2.1, irS: 16.8, irD: 61.4, runtime: 7.2, ecos: 0, ecoRounds: 0 }),
    b('fabric_q3', { stage: 'Place', inst: 657500, util: 69.2, wns: -16, tns: -0.36, feps: 90, sc: SS, sm: FUNC, holdW: -2, holdTns: 0, holdV: 3, hc: FF, hm: SHIFT, skew: null, maxTran: 76, worstTran: 0.55, maxCap: 15, maxFanout: 0, overflow: 0.8, drc: 90, dyn: 14, leak: 2.1, irS: 16.4, irD: 58.7, runtime: 7.0, ecos: 0, ecoRounds: 0 }),
    b('noc_arb', { stage: 'Place', inst: 193000, util: 68.0, wns: -38, tns: -1.1, feps: 170, sc: SS, sm: FUNC, holdW: -1, holdTns: 0, holdV: 2, hc: FF, hm: FUNC, skew: null, maxTran: 27, worstTran: 0.51, maxCap: 5, maxFanout: 0, overflow: 1.1, drc: 31, dyn: 6, leak: 0.43, irS: 15.0, irD: 57.1, runtime: 3.6, ecos: 0, ecoRounds: 0 }),
    b('emram_ctrl', { stage: 'Place', inst: 100000, util: 63.0, wns: -6, tns: -0.05, feps: 9, sc: SS, sm: FUNC, holdW: 1, holdTns: 0, holdV: 0, hc: FF, hm: FUNC, skew: null, maxTran: 8, worstTran: 0.44, maxCap: 1, maxFanout: 0, overflow: 0.6, drc: 12, dyn: 4, leak: 0.92, irS: 16.4, irD: 75.2, runtime: 2.5, ecos: 0, ecoRounds: 0 }),
    b('aon_hub', { stage: 'Place', inst: 76000, util: 60.0, wns: 5, tns: 0, feps: 0, sc: SS_LV, sm: 'aon_32k', holdW: 3, holdTns: 0, holdV: 0, hc: FF, hm: 'aon_32k', skew: null, maxTran: 1, worstTran: 0.37, maxCap: 0, maxFanout: 0, overflow: 0.2, drc: 0, dyn: 1, leak: 0.2, irS: 9.6, irD: 21.0, runtime: 1.7, ecos: 0, ecoRounds: 0 }),
    b('scalar_ctl', { stage: 'Place', inst: 121000, util: 66.0, wns: -4, tns: -0.02, feps: 6, sc: SS, sm: FUNC, holdW: 1, holdTns: 0, holdV: 0, hc: FF, hm: FUNC, skew: null, maxTran: 5, worstTran: 0.42, maxCap: 0, maxFanout: 0, overflow: 0.3, drc: 5, dyn: 3, leak: 0.3, irS: 13.2, irD: 47.8, runtime: 2.6, ecos: 0, ecoRounds: 0 }),
    b('periph_top', { stage: 'Place', inst: 206000, util: 60.2, wns: -3, tns: -0.01, feps: 4, sc: SS, sm: FUNC, holdW: 0, holdTns: 0, holdV: 0, hc: FF, hm: SHIFT, skew: null, maxTran: 6, worstTran: 0.43, maxCap: 0, maxFanout: 0, overflow: 0.3, drc: 4, dyn: 2, leak: 0.5, irS: 11.6, irD: 38.0, runtime: 2.9, ecos: 0, ecoRounds: 0 }),
    b('e2_top', { stage: 'Place', inst: 582000, util: 62.3, wns: -10, tns: -0.11, feps: 24, sc: SS, sm: FUNC, holdW: -1, holdTns: 0, holdV: 2, hc: FF, hm: SHIFT, skew: null, maxTran: 33, worstTran: 0.5, maxCap: 7, maxFanout: 1, overflow: 0.7, drc: 26, dyn: 4, leak: 1.1, irS: 16.2, irD: 53.9, runtime: 6.3, ecos: 0, ecoRounds: 0 }),
  ],
  /* final CTS, four blocks back so far: hold opens up as it always does before hold fixing */
  F3: [
    b('fabric_q0', { stage: 'CTS', inst: 671200, util: 70.1, wns: -12, tns: -0.28, feps: 71, sc: SS, sm: FUNC, holdW: -38, holdTns: -1.9, holdV: 2410, hc: FF, hm: SHIFT, skew: 84, maxTran: 41, worstTran: 0.49, maxCap: 8, maxFanout: 0, overflow: 0.8, drc: 91, dyn: 15, leak: 2.2, irS: 16.4, irD: 58.6, runtime: 9.8, ecos: 0, ecoRounds: 0 }),
    b('fabric_q1', { stage: 'CTS', inst: 671400, util: 70.2, wns: -14, tns: -0.31, feps: 77, sc: SS, sm: FUNC, holdW: -41, holdTns: -2.1, holdV: 2580, hc: FF, hm: SHIFT, skew: 87, maxTran: 44, worstTran: 0.5, maxCap: 9, maxFanout: 0, overflow: 0.9, drc: 96, dyn: 15, leak: 2.2, irS: 16.6, irD: 59.8, runtime: 9.9, ecos: 0, ecoRounds: 0 }),
    b('noc_arb', { stage: 'CTS', inst: 196800, util: 68.6, wns: -31, tns: -0.84, feps: 132, sc: SS, sm: FUNC, holdW: -22, holdTns: -0.6, holdV: 640, hc: FF, hm: FUNC, skew: 66, maxTran: 15, worstTran: 0.47, maxCap: 3, maxFanout: 0, overflow: 1.1, drc: 33, dyn: 6, leak: 0.44, irS: 15.1, irD: 57.4, runtime: 4.8, ecos: 0, ecoRounds: 0 }),
    b('scalar_ctl', { stage: 'CTS', inst: 123100, util: 66.5, wns: -3, tns: -0.01, feps: 4, sc: SS, sm: FUNC, holdW: -9, holdTns: -0.05, holdV: 55, hc: FF, hm: FUNC, skew: 47, maxTran: 3, worstTran: 0.41, maxCap: 0, maxFanout: 0, overflow: 0.3, drc: 5, dyn: 3, leak: 0.31, irS: 13.2, irD: 47.9, runtime: 3.4, ecos: 0, ecoRounds: 0 }),
  ],
};

/* ── sheets ── */

const blank = (v: number | null | undefined) => (v === null || v === undefined ? '' : v);

const dropSheet = (id: string): Cell[][] => [
  SHEET_COLS.map((c) => c.h),
  ...DATA[id].map(([name, r]) => {
    const v: Record<string, Cell> = {
      name, stage: r.stage, inst: r.inst, util: r.util, wns: r.wns, tns: r.tns, feps: r.feps,
      setupCorner: r.sc ?? '', setupMode: r.sm ?? '', holdW: blank(r.holdW), holdTns: blank(r.holdTns),
      holdV: blank(r.holdV), holdCorner: r.hc ?? '', holdMode: r.hm ?? '', skew: blank(r.skew),
      maxTran: r.maxTran, worstTran: r.worstTran, maxCap: r.maxCap, maxFanout: r.maxFanout,
      minPeriod: r.minPeriod ?? 0, mpw: r.mpw ?? 0, overflow: r.overflow, drc: blank(r.drc),
      dyn: r.dyn, leak: r.leak, budget: r.budget, irStatic: r.irS, irDynamic: r.irD,
      runtime: r.runtime, ecos: r.ecos, ecoRounds: r.ecoRounds,
    };
    return SHEET_COLS.map((c) => v[c.k]);
  }),
];

const SHEETS: [string, Cell[][]][] = [
  ['Meta', [
    ['Key', 'Value'],
    ['Template version', 1],
    ['Slack unit', 'ps'],
    ['Programme', 'Embedded_SoC (E2)'],
    ['Design', 'e2_top'],
    ['Process', '22 nm ULL + eMRAM, 9-track libraries'],
    ['Clocks', 'fabric 120 MHz @ 0.8 V (func_120m); 40 MHz @ 0.6 V (func_lv40m); AON 32 kHz'],
    ['Setup signoff corners', 'ssg_0p72v_m40c (func_120m), ssg_0p54v_m40c (func_lv40m, aon_32k)'],
    ['Hold signoff corner', 'ffg_0p88v_125c (func, scan_shift)'],
    ['Power', 'dynamic: W7 max-activity vectors, 120 MHz, TT 0.8 V 25 °C; leakage: FFG 0.88 V 125 °C'],
    ['IR drop', 'static and dynamic at 0.8 V; dynamic budget 64 mV (8%) set by the eMRAM macro'],
    ['Fabric', '576 abutted tiles reported as four 144-tile quadrants (fabric_q0..q3)'],
    ['F1, F2 (placement)', 'DRC from trial detail route; hold from ideal-clock analysis; skew not yet built'],
    ['F3 (CTS in progress)', '4 of 10 blocks through final CTS on 09/27; hold before hold fixing'],
    ['Generated at', '2026-09-27 18:40'],
    ['Generated by', 'pnr_qor_report.tcl v2.3'],
    ['Run directory', '/proj/e2/pd/final'],
  ]],
  ['Blocks', [['Block', 'Group'], ...BLOCKS]],
  ['Drops', [['Drop', 'Label', 'Date'], ...DROPS]],
  ['Targets', [['Measure', 'Key', 'Target'], ...TARGETS.map(([k, v]) => ['', k, v] as Cell[])]],
  ...DROPS.map(([id]) => [id, dropSheet(id)] as [string, Cell[][]]),
];

/* ── check it with the dashboard's own parser, then write it ── */

const parsed = parseSheets(Object.fromEntries(SHEETS), 'embedded-soc-e2-qor.xlsx');
/* the one thing it may say: placement has no clock trees, so F1 and F2 report no skew */
const unexpected = parsed.warn.filter((w) => !/^F[12]: 10 values blank/.test(w));
if (unexpected.length) throw new Error(`The dashboard would warn:\n${unexpected.join('\n')}`);
for (const [id] of DROPS) {
  const r = rollup(parsed.dataset.rows[id]);
  console.log(
    `${id}: WNS ${r.values.wns} ps, TNS ${r.values.tns} ns, FEP ${r.values.feps}, hold ${r.values.holdW} ps / ${r.values.holdV}, DRC ${r.values.drc}, IRdyn ${r.values.irDynamic} mV, leak ${r.values.leak} mW, dyn ${r.values.dyn}/${r.budget} mW — ` +
      Object.entries(r.by).filter(([, n]) => n).map(([s, n]) => `${s} ${n}`).join(', '),
  );
}

const wb = new ExcelJS.Workbook();
wb.creator = 'AtlasPM';
for (const [name, rows] of SHEETS) {
  const ws = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1, xSplit: name.length <= 2 ? 1 : 0 }] });
  for (const r of rows) ws.addRow(r.map((c) => (c === '' ? null : c)));
  ws.getRow(1).font = { bold: true, name: 'Arial' };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEDEDFB' } };
  ws.columns.forEach((col, i) => {
    const longest = Math.max(...rows.map((r) => String(r[i] ?? '').length));
    col.width = Math.min(Math.max(10, longest + 2), name === 'Meta' && i === 1 ? 90 : 34);
    col.font = { name: 'Arial', size: 10 };
  });
  ws.getRow(1).font = { bold: true, name: 'Arial', size: 10 };
}
wb.xlsx.writeFile(OUT).then(() => console.log(`Wrote ${OUT}`));
