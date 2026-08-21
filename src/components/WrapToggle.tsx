'use client';

import { useWrapStore, useWrapped, type WrapKey } from '@/store/wrapStore';

/**
 * The wrap-text mark editors use: lines of text, the middle one running out to
 * a hook that turns back and points at the line below.
 */
function WrapIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <path d="M2 3.2h12" />
        <path d="M2 8h9a2.4 2.4 0 0 1 0 4.8H8.4" />
        <path d="M2 12.8h2.6" />
      </g>
      <path d="M9.4 10.4 6.4 12.8l3 2.4z" fill="currentColor" />
    </svg>
  );
}

/**
 * Turns a board's rows from one clipped line into as many lines as the content
 * needs. It sits in the board's header next to Add, so the board you are
 * reading is the board you change.
 */
export function WrapToggle({ boardKey }: { boardKey: WrapKey }) {
  const wrapped = useWrapped(boardKey);
  const toggleWrap = useWrapStore((s) => s.toggleWrap);
  return (
    <button
      className="board-btn wrap-btn"
      data-wrap={boardKey}
      aria-pressed={wrapped}
      title={wrapped ? 'Show each row on one line' : 'Wrap rows — show the whole text'}
      aria-label={wrapped ? 'Show each row on one line' : 'Wrap rows to show the whole text'}
      onClick={() => toggleWrap(boardKey)}
    >
      <WrapIcon />
    </button>
  );
}
