'use client';

import { useCallback, useRef } from 'react';
import { PANE_DEFAULT, snapPane, type PaneKey } from '@/lib/paneWidths';
import { paintPane, usePaneWidths } from './usePaneWidths';

/**
 * The edge you drag to make a panel wider or narrower.
 *
 * While the pointer is down nothing re-renders: the width is written straight
 * onto the root as a CSS variable, and only the width the drag settles on is
 * committed. A React state update per pointermove would re-render the whole
 * shell sixty times a second to move one border.
 *
 * Dragged past half its minimum a panel collapses, and the grip stays at the
 * edge of the screen to pull it back out. Double-click puts it back where it
 * shipped, which is the way out of a width somebody cannot undo by eye.
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

  return (
    <div
      className="panegrip"
      data-pane={pane}
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize the ${pane === 'side' ? 'navigation' : 'properties'} panel`}
      onPointerDown={onPointerDown}
      onDoubleClick={() => {
        paintPane(pane, PANE_DEFAULT[pane]);
        commit(pane, PANE_DEFAULT[pane]);
      }}
    />
  );
}
