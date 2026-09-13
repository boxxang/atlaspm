/**
 * /lib/meetings/links.ts — what a meeting row is about, and whether it is
 * about a given piece of work.
 *
 * A link names a thing on the plan the way the rest of the app names it. Steps
 * have no rows — they are content, addressed as `PD-02:3` — so a link to one is
 * that string; a risk is its post; a deliverable is its id.
 *
 * Whether a link is "about" an activity is decided here and nowhere else: an
 * activity is touched by a link to it, to one of its steps, or to a risk raised
 * on one of its steps; a step only by a link to that step or to a risk on it.
 * A meeting that reviewed PD-02 as a whole did not necessarily discuss step 3,
 * and the step's panel should not claim it did.
 *
 * Pure: no DOM, no database.
 */
import type { LinkRef } from './types';

export const linkKey = (l: LinkRef): string => `${l.type}:${l.ref}`;

export const stepRef = (act: string, n: number): string => `${act}:${n}`;

/** `PD-02:3` → { act: 'PD-02', n: 3 }; anything else is not a step. */
export function parseStepRef(ref: string): { act: string; n: number } | null {
  const i = ref.lastIndexOf(':');
  if (i <= 0) return null;
  const tail = ref.slice(i + 1);
  if (!/^\d+$/.test(tail)) return null;
  const n = Number(tail);
  return n >= 1 ? { act: ref.slice(0, i), n } : null;
}

/** First of each, in the order given. */
export function dedupeLinks(links: readonly LinkRef[]): LinkRef[] {
  const seen = new Set<string>();
  return links.filter((l) => {
    const k = linkKey(l);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Where each risk post sits — the join the store already holds. */
export type RiskSteps = Readonly<Record<string, { act: string; stepN: number | null }>>;

/** An activity, or one step of it. */
export interface WorkTarget {
  act: string;
  n?: number;
}

/** How the screens look a link's target up — the joins the stores already hold. */
export interface LinkContext {
  stage(id: string): { short: string; title: string } | undefined;
  activity(ref: string): { title: string; stageId: string } | undefined;
  step(act: string, n: number): { text: string } | undefined;
  risk(postId: string): { text: string; act: string; stepN: number | null; stageId: string | null } | undefined;
  deliverable(id: string): { title: string; stageId: string } | undefined;
  milestone(id: string): { label: string; stageId: string } | undefined;
}

export interface LinkView {
  tag: string;
  text: string;
  href: string | null;
  /** The thing it named is not on the programme any more. */
  missing: boolean;
}

const GONE = 'No longer on this program';

/**
 * A link as a row shows it: a short tag, the words, and where clicking goes —
 * to the work itself on its stage, the same places every other link in the app
 * goes. A link whose target has gone is still shown, and says so, rather than
 * vanishing from the record of what a meeting was about.
 */
export function viewLink(l: LinkRef, projectId: string, ctx: LinkContext): LinkView {
  const base = `/p/${projectId}/stage`;
  const gone = (tag: string): LinkView => ({ tag, text: GONE, href: null, missing: true });
  switch (l.type) {
    case 'stage': {
      const s = ctx.stage(l.ref);
      return s
        ? { tag: s.short, text: s.title, href: `${base}/${l.ref}/activity`, missing: false }
        : gone(l.ref);
    }
    case 'activity': {
      const a = ctx.activity(l.ref);
      return a
        ? { tag: l.ref, text: a.title, href: `${base}/${a.stageId}/activity?act=${l.ref}`, missing: false }
        : gone(l.ref);
    }
    case 'step': {
      const s = parseStepRef(l.ref);
      if (!s) return gone(l.ref);
      const tag = `${s.act} · Step ${s.n}`;
      const a = ctx.activity(s.act);
      const step = ctx.step(s.act, s.n);
      return a && step
        ? { tag, text: step.text, href: `${base}/${a.stageId}/activity?step=${s.act}:${s.n}`, missing: false }
        : gone(tag);
    }
    case 'risk': {
      const r = ctx.risk(l.ref);
      if (!r || !r.stageId) return gone('Risk');
      return {
        tag: 'Risk',
        text: r.text,
        href:
          r.stepN != null
            ? `${base}/${r.stageId}/activity?step=${r.act}:${r.stepN}&post=${l.ref}`
            : `${base}/${r.stageId}/risks`,
        missing: false,
      };
    }
    case 'deliverable': {
      const d = ctx.deliverable(l.ref);
      return d
        ? {
            tag: 'Deliverable',
            text: d.title,
            href: `${base}/${d.stageId}/deliverables?deliverable=${l.ref}`,
            missing: false,
          }
        : gone('Deliverable');
    }
    case 'milestone': {
      const m = ctx.milestone(l.ref);
      return m
        ? { tag: 'Milestone', text: m.label, href: `${base}/${m.stageId}/activity`, missing: false }
        : gone('Milestone');
    }
  }
}

export function touchesWork(
  links: readonly LinkRef[],
  target: WorkTarget,
  riskSteps: RiskSteps,
): boolean {
  const wholeActivity = target.n == null;
  return links.some((l) => {
    switch (l.type) {
      case 'activity':
        return wholeActivity && l.ref === target.act;
      case 'step': {
        const s = parseStepRef(l.ref);
        return !!s && s.act === target.act && (wholeActivity || s.n === target.n);
      }
      case 'risk': {
        const r = riskSteps[l.ref];
        return !!r && r.act === target.act && (wholeActivity || r.stepN === target.n);
      }
      default:
        return false;
    }
  });
}
