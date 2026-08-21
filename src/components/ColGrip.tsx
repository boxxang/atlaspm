'use client';

import { useRef } from 'react';

/**
 * Each grip drags the boundary it sits on; the cursor follows the boundary.
 * Widths are stored per board kind (--bck-<kind>-<col>) so resizing one board
 * never moves another. A grip either names a full CSS var (--dlv-*) or a
 * per-board column key. Ported from the reference pointerdown handler.
 */
export function ColGrip({
  col,
  dir,
  cell,
  kind = 'activities',
  min = 56,
}: {
  col: string;
  /** +1 when the column grows with the cursor, -1 when it shrinks. */
  dir: 1 | -1;
  /** Index of the header cell whose width this grip controls. */
  cell: number;
  kind?: string;
  /** Narrowest the column may get. A number column needs far less than a
      title one, and 56px is wider than "12w" ever needs to be. */
  min?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const grip = ref.current;
    if (!grip) return;
    const varName = col.startsWith('--') ? col : `--bck-${kind}-${col}`;
    const startX = e.clientX;
    /* measure the column this grip controls (not necessarily its own cell) */
    const cells = grip.closest('.board-cols, .dlv-cols, .mm-cols')?.children;
    if (!cells) return;
    const startW = cells[cell].getBoundingClientRect().width;
    document.body.classList.add('col-resizing');
    grip.classList.add('active');
    const move = (ev: PointerEvent) => {
      const w = Math.min(Math.max(startW + dir * (ev.clientX - startX), min), 420);
      document.documentElement.style.setProperty(varName, w + 'px');
    };
    const up = () => {
      document.body.classList.remove('col-resizing');
      grip.classList.remove('active');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <span
      className="col-grip"
      data-col={col}
      data-dir={dir}
      data-cell={cell}
      title="Drag to resize"
      ref={ref}
      onPointerDown={onPointerDown}
    />
  );
}
