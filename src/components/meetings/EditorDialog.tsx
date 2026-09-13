'use client';

import { useEffect, useRef } from 'react';

/**
 * A native dialog around an editor, for the editors opened from somewhere
 * other than their own list — a decision or an action raised from an agenda
 * item. The browser gives the top layer, the focus trap and Escape.
 */
export function EditorDialog({
  label,
  onClose,
  children,
  wide = true,
}: {
  label: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const box = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (!el.open) el.showModal();
    const cancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener('cancel', cancel);
    return () => el.removeEventListener('cancel', cancel);
  }, [onClose]);

  return (
    <dialog className={wide ? 'dlg wide' : 'dlg'} ref={box} aria-label={label}>
      <div className="dlg-hd">
        <b style={{ fontSize: 14.5 }}>{label}</b>
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="dlg-body" style={{ padding: 0 }}>
        {children}
      </div>
    </dialog>
  );
}
