'use client';

import { useEffect, useRef } from 'react';

/**
 * .g-tip — one cursor-following tooltip for every [data-tip] element on the
 * page. `data-tip="head|sub"`; the sub half renders as a <small> second line.
 * Ported verbatim from the reference tooltip handler.
 */
export function Tooltip() {
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tip = tipRef.current;
    if (!tip) return;
    const onMove = (e: MouseEvent) => {
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-tip]');
      if (t) {
        const [head, sub] = (t.dataset.tip ?? '').split('|');
        tip.innerHTML = head + (sub ? `<small>${sub}</small>` : '');
        tip.style.opacity = '1';
        const pad = 14;
        let x = e.clientX + pad;
        let y = e.clientY - 10;
        if (x + tip.offsetWidth > innerWidth - 8) x = e.clientX - tip.offsetWidth - pad;
        if (y + tip.offsetHeight > innerHeight - 8) y = innerHeight - tip.offsetHeight - 8;
        tip.style.left = `${x}px`;
        tip.style.top = `${y}px`;
      } else {
        tip.style.opacity = '0';
      }
    };
    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  return <div className="g-tip" id="g-tip" ref={tipRef} />;
}
