/**
 * /lib/displaySettings.ts — display-only settings (no schedule, no DOM).
 *
 * Main and Dashboard hold independent values. Main writes the root vars;
 * Dashboard overrides the same vars scoped on #schedule-view (custom
 * properties inherit downward). Ported from the reference DISP_DEFS block.
 */

export type DisplayScope = 'main' | 'dash';
export type DisplayKey = 'font' | 'icon' | 'bar' | 'cp' | 'drow';

export interface DisplayDef {
  key: DisplayKey;
  /** DOM id of the range input — kept identical to the reference. */
  input: string;
  /** DOM id of the value readout. */
  valEl: string;
  label: string;
  varName: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  scopes: DisplayScope[];
  fmt: (v: number | string) => string;
}

const px = (v: number | string) => `${v}px`;

/** 2 → "2×", 2.25 → "2.25×", 0.75 → "0.75×" */
export const fmtIcon = (v: number | string) =>
  `${(+v)
    .toFixed(2)
    .replace(/0+$/, '')
    .replace(/\.$/, '')}×`;

export const DISP_DEFS: readonly DisplayDef[] = [
  { key: 'font', input: 'set-font', valEl: 'set-font-val', label: 'Text size',
    varName: '--fs-base', unit: 'px', min: 13, max: 23, step: 1,
    scopes: ['main', 'dash'], fmt: px },
  { key: 'icon', input: 'set-icon', valEl: 'set-icon-val', label: 'Icon size',
    varName: '--icon-scale', unit: '', min: 0.75, max: 3.25, step: 0.25,
    scopes: ['main'], fmt: fmtIcon },
  { key: 'bar', input: 'set-bar', valEl: 'set-bar-val', label: 'Bar thickness',
    varName: '--gbar-h', unit: 'px', min: 11, max: 21, step: 1,
    scopes: ['main', 'dash'], fmt: px },
  { key: 'cp', input: 'set-cp', valEl: 'set-cp-val', label: 'Milestone text',
    varName: '--cp-fs', unit: 'px', min: 6, max: 16, step: 1,
    scopes: ['main', 'dash'], fmt: px },
  { key: 'drow', input: 'set-drow', valEl: 'set-drow-val', label: 'Row height',
    varName: '--dash-row-h', unit: 'px', min: 24, max: 96, step: 4,
    scopes: ['dash'], fmt: px },
] as const;

export type DisplayValues = Partial<Record<DisplayKey, number>>;

export const DISP_DEFAULTS: Record<DisplayScope, DisplayValues> = {
  main: { font: 18, icon: 2, bar: 16, cp: 11 },
  dash: { font: 18, bar: 16, cp: 11, drow: 36 },
};

export const cloneDefaults = (): Record<DisplayScope, DisplayValues> => ({
  main: { ...DISP_DEFAULTS.main },
  dash: { ...DISP_DEFAULTS.dash },
});

/**
 * Where display settings live (Phase 6 decision): localStorage, not the
 * database.
 *
 * They are per-browser preferences — text size, icon scale, bar thickness,
 * dashboard row height, and the dragged board column widths. This pass has no
 * auth (see PORTING_PLAN Phase 8), so a DisplaySettings table would be global
 * to the database: one viewer bumping the font would resize it for everyone.
 * localStorage keeps them where they belong and costs nothing to run.
 *
 * The tradeoff: settings do not follow a user across browsers or devices, and
 * clearing site data resets them. When auth arrives, move this to a
 * DisplaySettings row keyed by user id — the shape below is already
 * { scope, json }, so the migration is a read/write swap, not a redesign.
 */
export const STORAGE_KEY = 'atlaspm.display.v1';

export interface StoredDisplay {
  scopes: Record<DisplayScope, DisplayValues>;
  /** Column vars dragged off their defaults, as CSS var name → width. */
  columns: Record<string, string>;
}

export const readStored = (raw: string | null): StoredDisplay | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredDisplay>;
    if (!parsed || typeof parsed !== 'object' || !parsed.scopes) return null;
    return {
      scopes: {
        main: { ...DISP_DEFAULTS.main, ...parsed.scopes.main },
        dash: { ...DISP_DEFAULTS.dash, ...parsed.scopes.dash },
      },
      columns: parsed.columns ?? {},
    };
  } catch {
    return null;
  }
};

/** The board / deliverable column vars "Reset display" clears off :root. */
export const COLUMN_VARS: readonly string[] = [
  ...(['keyinfo', 'activities', 'risks'] as const).flatMap((k) =>
    (['date', 'owner', 'due'] as const).map((c) => `--bck-${k}-${c}`)),
  '--dlv-due',
  '--dlv-comp',
];
