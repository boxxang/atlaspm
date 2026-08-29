/**
 * /lib/deliverableStatus.ts — what a key deliverable's status word means.
 *
 * Four words, in this order: Completed once it has been handed over; Delayed
 * once its date has gone by with nothing handed over; In progress once the work
 * that produces it has started; Not started otherwise.
 *
 * Delayed is the one that is new. "In progress" was letting a deliverable sit
 * two months past its date without ever saying so, which is the opposite of
 * what a status column is for.
 *
 * Pure: no DOM. The colours live with the components; this says only which of
 * the four it is.
 */
import type { Deliverable } from '@/data/types';
import { startOfDay } from './schedule';

export type DeliverableStatusKind = 'done' | 'late' | 'run' | 'none';

export interface DeliverableStatus {
  kind: DeliverableStatusKind;
  label: string;
}

const STATUS: Record<DeliverableStatusKind, DeliverableStatus> = {
  done: { kind: 'done', label: 'Completed' },
  late: { kind: 'late', label: 'Delayed' },
  run: { kind: 'run', label: 'In progress' },
  none: { kind: 'none', label: 'Not started' },
};

/**
 * Whether the work behind a deliverable has begun: the activity that produces
 * it has steps done or its window has opened, or — where no activity claims it
 * — its stage has started. One boolean, computed by the caller that holds the
 * join, so the ladder below stays a ladder.
 */
export function producerStarted(
  producer: { done: number; phase: 'done' | 'run' | 'future' } | null,
  stageStart: Date | null,
  today: Date,
): boolean {
  if (producer) return producer.done > 0 || producer.phase === 'run' || producer.phase === 'done';
  return !!stageStart && today >= stageStart;
}

export function deliverableStatus(
  d: Pick<Deliverable, 'done' | 'due'>,
  today: Date,
  started: boolean,
): DeliverableStatus {
  if (d.done) return STATUS.done;
  if (d.due && startOfDay(d.due) < today) return STATUS.late;
  return started ? STATUS.run : STATUS.none;
}

/**
 * Which step hands a deliverable over: the release step — the last one — of the
 * activity that produces its ref. One resolver, so the label and the link
 * cannot point apart.
 */
export function deliverableStep(
  ref: string | null,
  activities: readonly { ref: string; produces: readonly string[]; stepCount: number }[],
): { act: string; n: number } | null {
  if (!ref) return null;
  const a = activities.find((x) => x.produces.includes(ref));
  return a && a.stepCount > 0 ? { act: a.ref, n: a.stepCount } : null;
}

/**
 * A deliverable is complete because the artefact is here and somebody said what
 * was handed over — not because a box was ticked.
 *
 * Three halves, in fact: a body, at least one attachment, and a date it was
 * accepted. A handover without a date is a record of what was sent, not a claim
 * that it is finished; a handover with no file attached is a claim with nothing
 * behind it.
 */
export const handoverComplete = (
  post: { text: string; attachments: readonly unknown[]; doneAt: Date | null } | null,
): boolean =>
  !!post && post.text.trim().length > 0 && post.attachments.length > 0 && !!post.doneAt;

