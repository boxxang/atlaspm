'use client';

import Link from 'next/link';
import { actionTiming, type ActionTiming } from '@/lib/meetings/followUp';
import { viewLink, type LinkContext } from '@/lib/meetings/links';
import {
  ACTION_STATUS_LABEL,
  DECISION_STATUS_LABEL,
  MEETING_STATUS_LABEL,
  PRIORITY_LABEL,
  type ActionItem,
  type ActionStatus,
  type DecisionStatus,
  type LinkRef,
  type MeetingStatus,
  type Priority,
} from '@/lib/meetings/types';
import { fmtZonedDate, fmtZonedTime, tzLabel } from '@/lib/meetings/zonedTime';
import { useMeetingStore } from '@/store/meetingStore';

/**
 * The small pieces every meetings screen is made of.
 *
 * Every status and priority is a pill with its word in it. The colour is the
 * app's own — accent for what is moving, risk for what is wrong, warn for what
 * is waiting — and it is never the only thing saying which is which.
 */

const pill = (cls: string, label: string, hook?: Record<string, string>) => (
  <span className={cls} style={{ fontSize: 10.5 }} {...hook}>
    {label}
  </span>
);

const MEETING_TONE: Record<MeetingStatus, string> = {
  draft: 'pill',
  scheduled: 'pill acc',
  in_progress: 'pill warn',
  completed: 'pill ok',
  cancelled: 'pill',
};

export const MeetingStatusPill = ({ status }: { status: MeetingStatus }) =>
  pill(MEETING_TONE[status], MEETING_STATUS_LABEL[status], { 'data-meeting-status': status });

const ACTION_TONE: Record<ActionStatus, string> = {
  open: 'pill',
  in_progress: 'pill acc',
  blocked: 'pill risk',
  done: 'pill ok',
  cancelled: 'pill',
};

export const ActionStatusPill = ({ status }: { status: ActionStatus }) =>
  pill(ACTION_TONE[status], ACTION_STATUS_LABEL[status], { 'data-action-status': status });

const PRIORITY_TONE: Record<Priority, string> = {
  critical: 'pill risk',
  high: 'pill warn',
  normal: 'pill',
  low: 'pill',
};

export const PriorityPill = ({ priority }: { priority: Priority }) =>
  pill(PRIORITY_TONE[priority], PRIORITY_LABEL[priority], { 'data-priority': priority });

const DECISION_TONE: Record<DecisionStatus, string> = {
  proposed: 'pill warn',
  approved: 'pill ok',
  superseded: 'pill',
  rejected: 'pill risk',
};

export const DecisionStatusPill = ({ status }: { status: DecisionStatus }) =>
  pill(DECISION_TONE[status], DECISION_STATUS_LABEL[status], { 'data-decision-status': status });

const TIMING: Partial<Record<ActionTiming, [string, string]>> = {
  overdue: ['pill risk', 'Overdue'],
  due_soon: ['pill warn', 'Due soon'],
  no_due: ['pill', 'No due date'],
};

/** Only says something when there is something to say: late, nearly due, or undated. */
export function TimingPill({ action, today }: { action: ActionItem; today: Date }) {
  const t = TIMING[actionTiming(action, today)];
  return t ? pill(t[0], t[1], { 'data-timing': actionTiming(action, today) }) : null;
}

/** "09/15/2026 · 09:00–10:00 PDT", in the meeting's own zone. */
export function MeetingWhen({
  startsAt,
  endsAt,
  timeZone,
  dateless = false,
}: {
  startsAt: Date;
  endsAt: Date;
  timeZone: string;
  dateless?: boolean;
}) {
  return (
    <span className="num">
      {dateless ? '' : `${fmtZonedDate(startsAt, timeZone)} · `}
      {fmtZonedTime(startsAt, timeZone)}–{fmtZonedTime(endsAt, timeZone)}{' '}
      <span style={{ color: 'var(--ink-4)' }}>{tzLabel(startsAt, timeZone)}</span>
    </span>
  );
}

/** What a row is about, as pills that go there. */
export function LinkChips({
  links,
  projectId,
  ctx,
  max,
}: {
  links: readonly LinkRef[];
  projectId: string;
  ctx: LinkContext;
  /** Show this many and count the rest. */
  max?: number;
}) {
  if (!links.length) return null;
  const shown = max ? links.slice(0, max) : links;
  return (
    <span className="mt-links">
      {shown.map((l) => {
        const v = viewLink(l, projectId, ctx);
        const body = (
          <>
            <b>{v.tag}</b>
            <span className="ell">{v.text}</span>
          </>
        );
        return v.href ? (
          <Link
            key={`${l.type}:${l.ref}`}
            className="mt-link"
            href={v.href}
            title={`${v.tag} — ${v.text}`}
            data-link={`${l.type}:${l.ref}`}
          >
            {body}
          </Link>
        ) : (
          <span key={`${l.type}:${l.ref}`} className="mt-link gone" title={v.text} data-link={`${l.type}:${l.ref}`}>
            {body}
          </span>
        );
      })}
      {max && links.length > max && <span className="pill" style={{ fontSize: 10.5 }}>+{links.length - max}</span>}
    </span>
  );
}

/**
 * A labelled field, the way the New program dialog lays one out: a name, the
 * sentence saying what it is for, and the control. A div rather than a label
 * when the control is more than one input.
 */
export function Field({
  label,
  hint,
  children,
  group = false,
  required = false,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  group?: boolean;
  required?: boolean;
}) {
  const Tag = group ? 'div' : 'label';
  return (
    <Tag className="dlg-field">
      <span className="dlg-label">
        {label}
        {required && (
          <span className="reqmark" style={{ marginLeft: 7, fontSize: 10.5, fontWeight: 500 }}>
            required
          </span>
        )}
      </span>
      {hint && <span className="dlg-hint">{hint}</span>}
      <span className="dlg-control">{children}</span>
    </Tag>
  );
}

/** A name, typed or picked from the programme's people. */
export function PersonInput({
  value,
  onChange,
  people,
  label,
  placeholder = 'Name',
  hook,
}: {
  value: string;
  onChange: (v: string) => void;
  people: readonly string[];
  label: string;
  placeholder?: string;
  hook?: string;
}) {
  const listId = `people-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <>
      <input
        className="lnkin"
        list={listId}
        aria-label={label}
        placeholder={placeholder}
        value={value}
        data-person={hook}
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id={listId}>
        {people.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
    </>
  );
}

/** A write the server refused, said where the reader is looking. */
export function SaveErrorBanner() {
  const error = useMeetingStore((s) => s.saveError);
  const dismiss = useMeetingStore((s) => s.dismissError);
  if (!error) return null;
  return (
    <div className="mt-banner" role="alert" data-save-error>
      <span style={{ flexGrow: 1 }}>{error}</span>
      <button type="button" className="btn sm" onClick={() => location.reload()}>
        Reload
      </button>
      <button type="button" className="btn sm" onClick={dismiss}>
        Dismiss
      </button>
    </div>
  );
}

/** An empty list, saying what would fill it. */
export function Empty({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="empty" style={{ padding: '34px 24px' }}>
      {icon}
      <p className="mono-note" style={{ maxWidth: '52ch' }}>
        {children}
      </p>
    </div>
  );
}
