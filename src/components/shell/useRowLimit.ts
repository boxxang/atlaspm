'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { ATTN_LIMIT } from '@/lib/attention';

const KEY = 'atlaspm.attention.limit';

/**
 * How many rows the attention panel shows before it scrolls.
 *
 * A display preference, so it lives in the browser rather than the database:
 * it is a property of the person reading, not of the program.
 *
 * localStorage is an external store, and read as one — the server has no
 * localStorage, so the first render has to be the default on both sides or the
 * markup will not match. useSyncExternalStore swaps in the stored value after
 * hydration, which is what it is for; reading it in an effect and calling
 * setState would do the same thing one render later and by the wrong route.
 */
const listeners = new Set<() => void>();

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

/* Cached, because getSnapshot must return the same value until it changes —
   parsing on every call would be a new number each time only if it changed,
   but reading storage on every render is wasteful either way. */
let cached: number | null = null;

const snapshot = () => {
  if (cached !== null) return cached;
  try {
    const stored = Number(window.localStorage.getItem(KEY));
    cached = Number.isFinite(stored) && stored > 0 ? stored : ATTN_LIMIT;
  } catch {
    /* private browsing, or storage turned off: the default is fine */
    cached = ATTN_LIMIT;
  }
  return cached;
};

const serverSnapshot = () => ATTN_LIMIT;

export function useRowLimit(): [number, (n: number) => void] {
  const limit = useSyncExternalStore(subscribe, snapshot, serverSnapshot);

  const choose = useCallback((n: number) => {
    cached = n;
    try {
      window.localStorage.setItem(KEY, String(n));
    } catch {
      /* the choice still holds for this session */
    }
    for (const fn of listeners) fn();
  }, []);

  return [limit, choose];
}
