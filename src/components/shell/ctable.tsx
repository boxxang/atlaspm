'use client';

/**
 * The prototype's table: a CSS-grid "ctable" rather than a <table>.
 *
 * It is a grid because a row has to be one clickable thing with an expandable
 * block underneath it, which a table row cannot be. The column widths live in a
 * `--ct` custom property so head and body cannot drift apart.
 *
 * `null` for a width means "take the slack" — exactly one column should.
 *
 * The widths are what a column wants, not what it must have. A fixed column is
 * `minmax(0,Npx)` so it gives ground when the window is narrow, and the
 * flexible one keeps a floor so it is the last to be squeezed rather than the
 * first: it is the column the row is about, and at `minmax(0,1fr)` it
 * collapsed to forty pixels and wrapped a title one letter per line while the
 * fixed columns sat at their full width beside it.
 */
export type Col = [key: string, width: number | null, label: string];

/** Below this the flexible column stops giving ground and the pane scrolls. */
const FLEX_MIN = 168;

export const ctVar = (cols: readonly Col[]) =>
  cols.map(([, w]) => (w == null ? `minmax(${FLEX_MIN}px,1fr)` : `minmax(0,${w}px)`)).join(' ');

export function CTHead({ cols, cls = 'thead' }: { cols: readonly Col[]; cls?: string }) {
  return (
    <div className={`${cls} chead`}>
      {cols.map(([k, , label]) => (
        <span key={k} style={{ position: 'relative' }}>
          {label}
        </span>
      ))}
    </div>
  );
}

/** The caret at the head of an expandable row. */
export const Chevron = ({ open }: { open: boolean }) => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke={open ? '#5b5bd6' : '#b4b7bd'}
    strokeWidth="2.4"
    aria-hidden="true"
  >
    {open ? <path d="m6 9 6 6 6-6" /> : <path d="m9 18 6-6-6-6" />}
  </svg>
);
