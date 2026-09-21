'use client';

import { useCallback, useRef } from 'react';
import { PANE_DEFAULT, snapPane, type PaneKey } from '@/lib/paneWidths';
import { IconChevron } from './icons';
import { paintPane, usePaneWidths } from './usePaneWidths';

/**
 * The edge you drag to make a panel wider or narrower.
 *
 * While the pointer is down nothing re-renders: the width is written straight
 * onto the root as a CSS variable, and only the width the drag settles on is
 * committed. A React state update per pointermove would re-render the whole
 * shell sixty times a second to move one border.
 *
 * Dragged past half its minimum a panel collapses. The grip stays, but at the
 * very edge of the screen only five of its nine pixels are reachable — the
 * rest is past the window, under the scrollbar — so a collapsed panel also
 * leaves a handle that says what it opens. Double-click on the grip does the
 * same thing for anyone who finds it first.
 */
export function PaneGrip({ pane }: { pane: PaneKey }) {
  const { widths, commit } = usePaneWidths();
  /* the live width during a drag, so pointerup commits what the eye last saw
     rather than re-deriving it from a pointer that has already been released */
  const live = useRef(widths[pane]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const grip = e.currentTarget;
      const startX = e.clientX;
      /* what is on screen, which after fitPanes is not always what is stored */
      const from = grip.parentElement
        ? Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(`--${pane}-w`)) || 0
        : widths[pane];
      live.current = from;
      grip.setPointerCapture(e.pointerId);
      grip.classList.add('on');
      document.body.classList.add('panedrag');

      const move = (ev: PointerEvent) => {
        /* the left nav grows rightwards, the rail leftwards */
        const delta = pane === 'side' ? ev.clientX - startX : startX - ev.clientX;
        live.current = snapPane(pane, from + delta);
        paintPane(pane, live.current);
      };
      const up = () => {
        grip.classList.remove('on');
        document.body.classList.remove('panedrag');
        grip.removeEventListener('pointermove', move);
        grip.removeEventListener('pointerup', up);
        grip.removeEventListener('pointercancel', up);
        commit(pane, live.current);
      };
      grip.addEventListener('pointermove', move);
      grip.addEventListener('pointerup', up);
      grip.addEventListener('pointercancel', up);
    },
    [pane, widths, commit],
  );

  const name = pane === 'side' ? 'navigation' : 'properties';
  const reopen = () => {
    paintPane(pane, PANE_DEFAULT[pane]);
    commit(pane, PANE_DEFAULT[pane]);
  };

  return (
    <>
      <div
        className="panegrip"
        data-pane={pane}
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize the ${name} panel`}
        onPointerDown={onPointerDown}
        onDoubleClick={reopen}
      />
      {widths[pane] === 0 && (
        <button
          type="button"
          className="panereopen"
          data-pane={pane}
          aria-label={`Show the ${name} panel`}
          title={`Show the ${name} panel`}
          onClick={reopen}
        >
          <IconChevron dir={pane === 'side' ? 'right' : 'left'} />
        </button>
      )}
    </>
  );
}
