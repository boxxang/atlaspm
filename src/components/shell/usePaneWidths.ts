'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  PANE_DEFAULTS,
  fitPanes,
  readPanes,
  writePanes,
  type PaneKey,
  type PaneWidths,
} from '@/lib/paneWidths';

const KEY = 'atlaspm.panes.v1';

/**
 * How wide the left nav and the right rail are.
 *
 * A display preference, so it lives in the browser rather than the database:
 * it is a property of the person reading, not of the program.
 *
 * localStorage is an external store and read as one. The programs list renders
 * its own shell on the server with no hydration gate, so the first render has
 * to be the default on both sides or the markup will not match;
 * useSyncExternalStore swaps the stored value in afterwards, which is what it
 * is for.
 */
const listeners = new Set<() => void>();

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

/* Cached, because getSnapshot must return the same object until it changes —
   parsing on every render would hand React a new object each time and loop. */
let cached: PaneWidths | null = null;

const snapshot = (): PaneWidths => {
  if (cached) return cached;
  try {
    cached = readPanes(window.localStorage.getItem(KEY));
  } catch {
    /* private browsing, or storage turned off: the defaults are fine */
    cached = { ...PANE_DEFAULTS };
  }
  return cached;
};

const serverSnapshot = (): PaneWidths => PANE_DEFAULTS;

const announce = () => {
  for (const fn of listeners) fn();
};

/**
 * Written straight onto the root, so a drag moves the panel without a render.
 *
 * Zero width is not enough to make a panel disappear — its own padding and
 * border hold a seventeen-pixel sliver open, which reads as a rendering fault
 * rather than as a closed panel. So collapse is also an attribute, and the
 * stylesheet takes the contents out. The grip is what stays.
 */
export function paintPane(key: PaneKey, px: number) {
  const root = document.documentElement;
  root.style.setProperty(`--${key}-w`, `${px}px`);
  root.toggleAttribute(`data-${key}-collapsed`, px === 0);
}

export function usePaneWidths() {
  const stored = useSyncExternalStore(subscribe, snapshot, serverSnapshot);

  /* What is stored is what the person chose; what is painted is what fits the
     window they are looking at now. The choice is never overwritten by a
     window they happened to make small. */
  useEffect(() => {
    const paint = () => {
      const fitted = fitPanes(stored, window.innerWidth);
      paintPane('side', fitted.side);
      paintPane('peek', fitted.peek);
    };
    paint();
    window.addEventListener('resize', paint);
    return () => window.removeEventListener('resize', paint);
  }, [stored]);

  const commit = useCallback((key: PaneKey, px: number) => {
    const next = { ...snapshot(), [key]: px };
    cached = next;
    try {
      window.localStorage.setItem(KEY, writePanes(next));
    } catch {
      /* the choice still holds for this session */
    }
    announce();
  }, []);

  return { widths: stored, commit };
}
