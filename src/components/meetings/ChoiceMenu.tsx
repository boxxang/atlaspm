'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A toolbar button that drops open a list of choices, each with a line saying
 * what it means — the programs list's Filter and Sort menus, in the same
 * markup. Closes on a choice, on Escape and on a click anywhere else.
 */
export function ChoiceMenu<K extends string>({
  hook,
  label,
  options,
  chosen,
  onChoose,
  on = false,
  align = 'right',
}: {
  hook: string;
  label: string;
  options: readonly { key: K; label: string; hint?: string }[];
  chosen: K;
  onChoose: (k: K) => void;
  on?: boolean;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <span className="menu" ref={box} style={{ display: 'inline-flex' }}>
      <button
        type="button"
        className={on || open ? 'btn sm on' : 'btn sm'}
        data-menu={hook}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
        <svg
          width="9"
          height="9"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8b8f98"
          strokeWidth="2.6"
          style={{ transform: open ? 'rotate(180deg)' : undefined }}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className={align === 'left' ? 'menu-pop left' : 'menu-pop'} data-menu-pop={hook}>
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              className="mi"
              data-opt={o.key}
              aria-current={o.key === chosen || undefined}
              onClick={() => {
                onChoose(o.key);
                setOpen(false);
              }}
            >
              <span style={{ width: 13, flexShrink: 0, color: 'var(--accent)' }}>{o.key === chosen ? '✓' : ''}</span>
              <span>
                {o.label}
                {o.hint && <span className="d">{o.hint}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </span>
  );
}
