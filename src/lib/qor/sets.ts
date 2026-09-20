/**
 * /lib/qor/sets.ts — which columns the block table shows at once.
 *
 * Six sets rather than thirty columns. Block, P&R stage and QoR stay in every
 * set — they are the context that survives a set change — and no measure
 * appears in two, because a repeated column reads as though the set meant it.
 *
 * Setup and hold are apart because they are fixed in opposite directions: a
 * setup violation wants a faster path, a hold violation a slower one, and a
 * design rule violation is neither. A unit rides with a column only where the
 * number has one — a count of endpoints has none.
 */
import type { MeasureKey } from './schema';

export interface SetCol {
  /** a measure, or one of the two composed columns */
  key: MeasureKey | 'delta' | 'pgap' | 'setupScn' | 'holdScn';
  label: string;
  unit?: string;
  /** a scenario name needs room; a number does not */
  wide?: boolean;
}

export const SET_KEYS = ['setup', 'hold', 'drv', 'physical', 'power', 'flow'] as const;
export type SetKey = (typeof SET_KEYS)[number];

export const SET_LABEL: Record<SetKey, string> = {
  setup: 'Setup',
  hold: 'Hold',
  drv: 'DRV',
  physical: 'Physical',
  power: 'Power & IR',
  flow: 'Flow',
};

export const SETS: Record<SetKey, SetCol[]> = {
  setup: [
    { key: 'wns', label: 'Setup WNS', unit: 'ps' },
    { key: 'setupScn', label: 'Setup scenario', wide: true },
    { key: 'tns', label: 'Setup TNS', unit: 'ns' },
    { key: 'feps', label: 'Failing endpoints' },
    { key: 'delta', label: 'WNS Δ', unit: 'ps' },
  ],
  hold: [
    { key: 'holdW', label: 'Hold WNS', unit: 'ps' },
    { key: 'holdScn', label: 'Hold scenario', wide: true },
    { key: 'holdTns', label: 'Hold TNS', unit: 'ns' },
    { key: 'holdV', label: 'Failing endpoints' },
    { key: 'skew', label: 'Skew', unit: 'ps' },
  ],
  drv: [
    { key: 'maxTran', label: 'Max tran viol' },
    { key: 'worstTran', label: 'Worst tran', unit: 'ns' },
    { key: 'maxCap', label: 'Max cap viol' },
    { key: 'maxFanout', label: 'Max fanout viol' },
    { key: 'minPeriod', label: 'Min period viol' },
    { key: 'mpw', label: 'MPW viol' },
  ],
  physical: [
    { key: 'util', label: 'Util', unit: '%' },
    { key: 'inst', label: 'Inst' },
    { key: 'overflow', label: 'Overflow', unit: '%' },
    { key: 'drc', label: 'DRC' },
  ],
  power: [
    { key: 'power', label: 'Power', unit: 'mW' },
    { key: 'budget', label: 'Budget', unit: 'mW' },
    { key: 'pgap', label: 'vs budget', unit: 'mW' },
    { key: 'dyn', label: 'Dynamic', unit: 'mW' },
    { key: 'irStatic', label: 'IR static', unit: 'mV' },
    { key: 'irDynamic', label: 'IR dynamic', unit: 'mV' },
  ],
  flow: [
    { key: 'runtime', label: 'Runtime', unit: 'h' },
    { key: 'ecos', label: 'ECOs' },
    { key: 'ecoRounds', label: 'ECO rounds' },
  ],
};
