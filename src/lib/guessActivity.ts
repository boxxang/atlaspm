/**
 * Which template activity a board entry is probably about.
 *
 * People retype an activity in their own words — "Market & customer requirements
 * analysis" for "Customer and Market Requirements Definition" — so exact
 * matching finds none of them. Scoring on shared significant words does, and
 * the board shows the guess as a question ("PD-02 · link?") rather than acting
 * on it: a wrong guess costs a glance, and a silent link would cost a lot more.
 */
const STOP = new Set([
  'and',
  'the',
  'for',
  'with',
  'from',
  'into',
  'per',
  'of',
  'a',
  'an',
  'to',
  'on',
  'in',
  'at',
  'by',
]);

const words = (t: string): string[] =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

/**
 * The best match among `candidates`, or null when nothing is close enough.
 *
 * The threshold is deliberately high: below it the guess is noise, and a board
 * full of maybes reads as a board with nothing on it.
 */
export function guessActivity(
  title: string,
  candidates: readonly { ref: string; title: string }[],
): string | null {
  const tw = words(title);
  if (tw.length < 2) return null;

  let best: string | null = null;
  let bestScore = 0;
  for (const c of candidates) {
    const aw = words(c.title);
    if (!aw.length) continue;
    const shared = tw.filter((w) => aw.includes(w)).length;
    const score = shared / Math.min(tw.length, aw.length);
    if (score > bestScore) {
      bestScore = score;
      best = c.ref;
    }
  }
  return bestScore >= 0.6 ? best : null;
}
