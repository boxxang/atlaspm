/**
 * /lib/displaySettings.ts — display-only settings (no schedule, no DOM).
 *
 * Main and Dashboard hold independent values. Main writes the root vars;
 * Dashboard overrides the same vars scoped on #schedule-view (custom
 * properties inherit downward). Ported from the reference DISP_DEFS block.
 */

export type DisplayScope = 'main' | 'dash';
export type DisplayKey = 'font' | 'icon' | 'bar' | 'cp' | 'drow';

/** Each scope carries its own default and a range centred on it. */
export interface DisplayRange {
  min: number;
  max: number;
  step: number;
  default: number;
}

export interface DisplayDef {
  key: DisplayKey;
  /** DOM id of the range input — kept identical to the reference. */
  input: string;
  /** DOM id of the value readout. */
  valEl: string;
  label: string;
  varName: string;
  unit: string;
  scopes: DisplayScope[];
  /** Absent for a scope the setting does not apply to. */
  ranges: Partial<Record<DisplayScope, DisplayRange>>;
  fmt: (v: number | string) => string;
}

const px = (v: number | string) => `${v}px`;

/** 2 → "2×", 2.25 → "2.25×", 0.75 → "0.75×" */
export const fmtIcon = (v: number | string) =>
  `${(+v)
    .toFixed(2)
    .replace(/0+$/, '')
    .replace(/\.$/, '')}×`;

/**
 * Every range is centred on its scope's default, so the slider sits mid-track
 * when nothing has been changed and moves the same distance either way.
 */
const centred = (value: number, span: number, step: number): DisplayRange => ({
  min: value - span,
  max: value + span,
  step,
  default: value,
});

export const DISP_DEFS: readonly DisplayDef[] = [
  { key: 'font', input: 'set-font', valEl: 'set-font-val', label: 'Text size',
    varName: '--fs-base', unit: 'px', scopes: ['main', 'dash'], fmt: px,
    ranges: { main: centred(18, 5, 1), dash: centred(16, 5, 1) } },
  { key: 'icon', input: 'set-icon', valEl: 'set-icon-val', label: 'Icon size',
    varName: '--icon-scale', unit: '', scopes: ['main'], fmt: fmtIcon,
    ranges: { main: centred(2, 1.25, 0.25) } },
  { key: 'bar', input: 'set-bar', valEl: 'set-bar-val', label: 'Bar thickness',
    varName: '--gbar-h', unit: 'px', scopes: ['main', 'dash'], fmt: px,
    ranges: { main: centred(16, 5, 1), dash: centred(16, 5, 1) } },
  { key: 'cp', input: 'set-cp', valEl: 'set-cp-val', label: 'Milestone text',
    varName: '--cp-fs', unit: 'px', scopes: ['main', 'dash'], fmt: px,
    ranges: { main: centred(11, 5, 1), dash: centred(13, 5, 1) } },
  { key: 'drow', input: 'set-drow', valEl: 'set-drow-val', label: 'Row height',
    varName: '--dash-row-h', unit: 'px', scopes: ['dash'], fmt: px,
    ranges: { dash: centred(32, 16, 4) } },
] as const;

export type DisplayValues = Partial<Record<DisplayKey, number>>;

const defaultsFor = (scope: DisplayScope): DisplayValues =>
  Object.fromEntries(
    DISP_DEFS.filter((d) => d.ranges[scope]).map((d) => [d.key, d.ranges[scope]!.default]),
  );

export const DISP_DEFAULTS: Record<DisplayScope, DisplayValues> = {
  main: defaultsFor('main'),
  dash: defaultsFor('dash'),
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
