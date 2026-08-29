'use client';

/**
 * The prototype's table: a CSS-grid "ctable" rather than a <table>.
 *
 * It is a grid because a row has to be one clickable thing with an expandable
 * block underneath it, which a table row cannot be. The column widths live in a
 * `--ct` custom property so head and body cannot drift apart.
 *
 * `null` for a width means "take the slack" — exactly one column should.
 */
export type Col = [key: string, width: number | null, label: string];

export const ctVar = (cols: readonly Col[]) =>
  cols.map(([, w]) => (w == null ? 'minmax(0,1fr)' : `${w}px`)).join(' ');

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
