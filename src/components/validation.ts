'use client';

/**
 * Feedback for a save that could not go through.
 *
 * A field keeps an `invalid` class while it is empty, and blinks each time the
 * save is attempted again — a class alone would not replay, since the animation
 * has already run. The Web Animations API restarts cleanly without remounting
 * the input, which would cost the caret.
 */
const BLINK: Keyframe[] = [
  { backgroundColor: 'transparent', borderColor: 'var(--risk)' },
  { backgroundColor: 'rgba(208, 59, 59, 0.16)', borderColor: 'var(--risk)' },
  { backgroundColor: 'transparent', borderColor: 'var(--risk)' },
];

export function blinkInvalid(el: HTMLElement | null | undefined) {
  if (!el) return;
  /* reduced-motion callers get the standing red border and no flashing */
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  el.animate(BLINK, { duration: 520, iterations: 3, easing: 'ease-in-out' });
}

/** Blinks every missing field and focuses the first, so the caret lands there. */
export function reportMissing(fields: (HTMLElement | null | undefined)[]) {
  fields.forEach(blinkInvalid);
  fields.find(Boolean)?.focus();
}

/** "Title is required." / "Title and owner are required." */
export function missingMessage(labels: string[]): string {
  if (!labels.length) return '';
  const list =
    labels.length === 1
      ? labels[0]
      : `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
  return `${list} ${labels.length === 1 ? 'is' : 'are'} required.`;
}
