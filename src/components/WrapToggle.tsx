'use client';

import { useWrapStore, useWrapped, type WrapKey } from '@/store/wrapStore';

/** The pilcrow-ish return arrow every text editor uses for a line break. */
function WrapIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
      <path
        d="M14 3v5.5a2.5 2.5 0 0 1-2.5 2.5H4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M6.6 8.3 3.3 11l3.3 2.7z" fill="currentColor" />
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
