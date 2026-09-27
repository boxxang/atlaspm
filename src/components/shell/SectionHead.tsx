'use client';

import type { ReactNode } from 'react';

/**
 * A panel section's heading that folds the section away: the caption is the
 * button, with a chevron that says which way it is. Whatever the section keeps
 * beside its caption — a count, a link, an Edit — sits after it and stays
 * clickable on its own.
 */
export function SectionHead({
  title,
  folded,
  onToggle,
  section,
  children,
}: {
  title: string;
  folded: boolean;
  onToggle: () => void;
  /** names the section for tests and for the fold state */
  section: string;
  children?: ReactNode;
}) {
  return (
    <span className="sec-hd" data-section={section} data-folded={folded ? '' : undefined}>
      <button type="button" className="sec-tg" aria-expanded={!folded} onClick={onToggle}>
        <span className="sec-chev" aria-hidden>
          ▸
        </span>
        <span className="cap">{title}</span>
      </button>
      {children}
    </span>
  );
}
