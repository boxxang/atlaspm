import { create } from 'zustand';

/**
 * Whether a board shows its rows on one line or on as many as the content
 * needs.
 *
 * A board row is a grid: a date, a title, an owner, a due date. One line per
 * row keeps those columns readable down the board, which is what you want when
 * you are scanning — and useless when the titles are long enough that the
 * scanning turns up an ellipsis every time. So it is a per-board switch, not a
 * setting: the risks board can stay wrapped while the key-info board beside it
 * stays compact.
 *
 * Per browser, like the roadmap pin and the display settings — it describes how
 * someone reads, not what the program is, so it does not belong in the database.
 */
const KEY = 'atlaspm.boards.wrapped.v1';

/** Board keys: the three item kinds, plus the lists that are boards too. */
export type WrapKey = string;

const load = (): Record<string, boolean> => {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [k, v === true]),
    );
  } catch {
    /* a browser with storage disabled, or a value from an older shape */
    return {};
  }
};

interface WrapState {
  wrapped: Record<string, boolean>;
  toggleWrap: (key: WrapKey) => void;
}

export const useWrapStore = create<WrapState>((set) => ({
  wrapped: load(),
  toggleWrap: (key) =>
    set((s) => {
      const wrapped = { ...s.wrapped, [key]: !s.wrapped[key] };
      try {
        localStorage.setItem(KEY, JSON.stringify(wrapped));
      } catch {
        /* nothing to do about a full or disabled store; the toggle still works
           for this page */
      }
      return { wrapped };
    }),
}));

/** True when this board is showing its rows over as many lines as they need. */
export const useWrapped = (key: WrapKey) => useWrapStore((s) => !!s.wrapped[key]);
