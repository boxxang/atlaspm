/**
 * /lib/meetings/completion.ts — what has to be true before a meeting is done.
 *
 * A meeting that closes with no minutes, a decision nobody landed, or an
 * action with no name on it is a meeting whose follow-up will not happen. So
 * completing one runs these checks and says which fail.
 *
 * Whether a failure stops the meeting closing is the programme's call — some
 * teams want the discipline enforced, most want the nudge — so the checks and
 * the verdict are separate, and the verdict takes the programme's mode.
 *
 * Pure: no DOM, no database.
 */
import { isActionOpen } from './followUp';
import type { ActionItem, AgendaItem, CompletionMode, Decision, Meeting } from './types';

export type CompletionKey = 'minutes' | 'decisions' | 'owners' | 'dueDates' | 'deferred';

export interface CompletionCheck {
  key: CompletionKey;
  label: string;
  ok: boolean;
  message: string;
}

const count = (n: number, noun: string) => `${n} ${noun}${n === 1 ? '' : 's'}`;
const has = (n: number) => (n === 1 ? 'has' : 'have');

export function completionChecks(input: {
  meeting: Meeting;
  agenda: readonly AgendaItem[];
  decisions: readonly Decision[];
  actions: readonly ActionItem[];
}): CompletionCheck[] {
  const { meeting } = input;
  const agenda = input.agenda.filter((a) => a.meetingId === meeting.id);
  const decisions = input.decisions.filter((d) => d.meetingId === meeting.id);
  /* raised here or carried in: either way this sitting is where it was tracked */
  const open = input.actions.filter(
    (a) => (a.meetingId === meeting.id || a.carriedToMeetingId === meeting.id) && isActionOpen(a),
  );

  const recorded = !!meeting.minutes.trim() || agenda.some((a) => a.notes.trim() || a.outcome);
  const proposed = decisions.filter((d) => d.status === 'proposed').length;
  const ownerless = open.filter((a) => !a.owner.trim()).length;
  const undated = open.filter((a) => !a.due).length;
  const adrift = agenda.filter((a) => a.outcome === 'deferred' && !a.deferral).length;

  return [
    {
      key: 'minutes',
      label: 'Minutes or outcomes recorded',
      ok: recorded,
      message: recorded ? 'Minutes are recorded.' : 'No minutes or agenda outcome recorded.',
    },
    {
      key: 'decisions',
      label: 'Every decision has a status',
      ok: proposed === 0,
      message: proposed
        ? `${count(proposed, 'decision')} ${proposed === 1 ? 'is' : 'are'} still Proposed.`
        : 'Every decision has been approved, rejected or superseded.',
    },
    {
      key: 'owners',
      label: 'Every open action item has an owner',
      ok: ownerless === 0,
      message: ownerless
        ? `${count(ownerless, 'open action item')} ${has(ownerless)} no owner.`
        : 'Every open action item has an owner.',
    },
    {
      key: 'dueDates',
      label: 'Every open action item has a due date',
      ok: undated === 0,
      message: undated
        ? `${count(undated, 'open action item')} ${has(undated)} no due date.`
        : 'Every open action item has a due date.',
    },
    {
      key: 'deferred',
      label: 'Deferred agenda items say what happens next',
      ok: adrift === 0,
      message: adrift
        ? `${count(adrift, 'deferred agenda item')} ${has(adrift)} no next step.`
        : 'Nothing was deferred without a next step.',
    },
  ];
}

export function canComplete(
  checks: readonly CompletionCheck[],
  mode: CompletionMode,
): { allowed: boolean; failing: CompletionCheck[] } {
  const failing = checks.filter((c) => !c.ok);
  return { allowed: mode === 'warn' || failing.length === 0, failing };
}
