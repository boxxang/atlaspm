'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * .pop-note wrapper — click the trigger to toggle, click outside to close.
 * Ported from initPopover() in the reference.
 */
export function Popover({
  id,
  btnId,
  btnClassName = 'pop-btn',
  title,
  ariaLabel,
  trigger,
  panelId,
  panelRole,
  children,
}: {
  id: string;
  btnId: string;
  btnClassName?: string;
  title: string;
  ariaLabel?: string;
  trigger: ReactNode;
  panelId?: string;
  panelRole?: 'tooltip';
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!noteRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  return (
    <div className={`pop-note${open ? ' open' : ''}`} id={id} ref={noteRef}>
      <button
        className={btnClassName}
        id={btnId}
        aria-expanded={open}
        title={title}
        aria-label={ariaLabel}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {trigger}
      </button>
      <div className="pop-panel" id={panelId} role={panelRole}>
        {children}
      </div>
    </div>
  );
}
