'use client';

import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'atlaspm.rail.collapsed';

/**
 * Which sections of the step panel are folded away.
 *
 * The panel stacks progress, outputs, key deliverables, details, meetings and
 * the step's updates in one narrow column, and the updates — where most of the
 * writing happens — end up below the fold. Folding the others is what gives
 * the composer its room, and somebody who folds Details once wants it folded
 * on the next step too, so the choice outlives the step and the page.
 *
 * A reading preference, so it lives in the browser, read as the external store
 * localStorage is: the server renders every section open and the stored
 * choice comes in after hydration. Storage that is unavailable is simply not
 * used.
 */
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

const NONE: readonly string[] = [];
let cached: readonly string[] | null = null;

const snapshot = (): readonly string[] => {
  if (cached) return cached;
  try {
    const x: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? '[]');
    cached = Array.isArray(x) ? x.filter((k): k is string => typeof k === 'string') : NONE;
  } catch {
    cached = NONE;
  }
  return cached;
};

const write = (next: readonly string[]) => {
  cached = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* the choice still holds for this visit */
  }
  for (const fn of listeners) fn();
};

export function useRailSections() {
  const folded = useSyncExternalStore(subscribe, snapshot, () => NONE);
  const isFolded = useCallback((key: string) => folded.includes(key), [folded]);
  const toggle = useCallback(
    (key: string) => write(folded.includes(key) ? folded.filter((k) => k !== key) : [...folded, key]),
    [folded],
  );
  /** Fold every one of `keys`, or open them all. */
  const setAll = useCallback((keys: readonly string[], fold: boolean) => write(fold ? [...keys] : []), []);
  return { isFolded, toggle, setAll };
}
