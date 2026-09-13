'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  actionsOfMeeting,
  actionTiming,
  isActionOpen,
  nextInSeries,
  previousInSeries,
} from '@/lib/meetings/followUp';
import { describeRule } from '@/lib/meetings/recurrence';
import { MEETING_TYPE_LABEL, type Meeting } from '@/lib/meetings/types';
import { fmtZonedDate, fmtZonedTime } from '@/lib/meetings/zonedTime';
import { fmtDT } from '@/lib/schedule';
import { useMeetingStore } from '@/store/meetingStore';
import { useAppStore } from '@/store/useAppStore';
import { Avatar } from '../shell/icons';
import { LinkChips, MeetingStatusPill, MeetingWhen } from './atoms';
import { RaiseRiskDialog } from './RaiseRiskDialog';
import { Card } from './UpcomingTab';
import { useLinkContext } from './useLinkContext';

/** Everything about a meeting on one screen, and the numbers its follow-up is judged by. */
export function OverviewTab({ meeting, projectId }: { meeting: Meeting; projectId: string }) {
  const meetings = useMeetingStore((s) => s.meetings);
  const series = useMeetingStore((s) => s.series.find((x) => x.id === meeting.seriesId));
  const decisions = useMeetingStore((s) => s.decisions);
  const actions = useMeetingStore((s) => s.actions);
  const posts = useAppStore((s) => s.posts);
  const today = useAppStore((s) => s.today);
  const { ctx } = useLinkContext();
  const [raising, setRaising] = useState(false);

  const base = `/p/${projectId}/meetings`;
  const prev = previousInSeries(meeting, meetings);
  const next = nextInSeries(meeting, meetings);
  const mine = actionsOfMeeting(meeting.id, actions);
  const open = mine.filter(isActionOpen);
  const overdue = open.filter((a) => actionTiming(a, today) === 'overdue');
  const decs = decisions.filter((d) => d.meetingId === meeting.id);
  const risks = posts.filter((p) => p.kind === 'risk' && p.meetingId === meeting.id);
  const isLink = /^https?:\/\//i.test(meeting.location);

  return (
    <div className="mt-page" data-overview-tab>
      <div className="mt-cols">
        <Card title="Meeting" hook="facts">
          <dl className="mt-props" style={{ padding: '14px 16px' }}>
            <dt>Title</dt>
            <dd style={{ fontWeight: 600 }}>{meeting.title}</dd>
            <dt>Series</dt>
            <dd>
              {series ? (
                <>
                  <Link href={`${base}?tab=series`}>{series.title}</Link>
                  <span style={{ color: 'var(--ink-3)', fontSize: 12 }}> · {describeRule(series.recurrence)}</span>
                </>
              ) : (
                <span style={{ color: 'var(--ink-3)' }}>A single meeting</span>
              )}
            </dd>
            <dt>Date and time</dt>
            <dd>
              <MeetingWhen startsAt={meeting.startsAt} endsAt={meeting.endsAt} timeZone={meeting.timeZone} />
              <span style={{ color: 'var(--ink-3)', fontSize: 12 }}> · {meeting.timeZone}</span>
            </dd>
            <dt>Status</dt>
            <dd>
              <MeetingStatusPill status={meeting.status} />
              {meeting.completedAt && <span style={{ color: 'var(--ink-3)', fontSize: 12 }}> · completed {fmtDT(meeting.completedAt)}</span>}
              {meeting.status === 'cancelled' && meeting.cancelReason && (
                <span style={{ color: 'var(--ink-3)', fontSize: 12 }}> · {meeting.cancelReason}</span>
              )}
            </dd>
            <dt>Type</dt>
            <dd>{MEETING_TYPE_LABEL[meeting.type]}</dd>
            <dt>Owner</dt>
            <dd>{meeting.owner ? <Person name={meeting.owner} /> : <span style={{ color: 'var(--ink-4)' }}>Unassigned</span>}</dd>
            <dt>Facilitator</dt>
            <dd>{meeting.facilitator ? <Person name={meeting.facilitator} /> : <span style={{ color: 'var(--ink-4)' }}>—</span>}</dd>
            <dt>Attendees</dt>
            <dd>
              {meeting.attendees.length ? (
                <span className="mt-people-list">
                  {meeting.attendees.map((a) => (
                    <span key={a.id} className="mt-person" data-attendee={a.name}>
                      <Avatar name={a.name} small />
                      {a.name}
                      <span style={{ color: 'var(--ink-3)', fontSize: 11, paddingRight: 4 }}>{a.optional ? 'Optional' : 'Required'}</span>
                    </span>
                  ))}
                </span>
              ) : (
                <span style={{ color: 'var(--ink-4)' }}>Nobody listed</span>
              )}
            </dd>
            <dt>Location</dt>
            <dd>
              {meeting.location ? (
                isLink ? (
                  <a href={meeting.location} target="_blank" rel="noreferrer noopener">
                    {meeting.location}
                  </a>
                ) : (
                  meeting.location
                )
              ) : (
                <span style={{ color: 'var(--ink-4)' }}>—</span>
              )}
            </dd>
            <dt>Purpose</dt>
            <dd className="mt-minutes" style={{ fontSize: 13 }}>
              {meeting.purpose || <span style={{ color: 'var(--ink-4)' }}>—</span>}
            </dd>
            <dt>Linked to</dt>
            <dd>{meeting.links.length ? <LinkChips links={meeting.links} projectId={projectId} ctx={ctx} /> : <span style={{ color: 'var(--ink-4)' }}>Nothing on the plan yet</span>}</dd>
            <dt>Previous meeting</dt>
            <dd>{prev ? <SittingLink m={prev} base={base} /> : <span style={{ color: 'var(--ink-4)' }}>—</span>}</dd>
            <dt>Next meeting</dt>
            <dd>{next ? <SittingLink m={next} base={base} /> : <span style={{ color: 'var(--ink-4)' }}>{meeting.seriesId ? 'None scheduled' : '—'}</span>}</dd>
          </dl>
        </Card>

        <div className="mt-stack">
          <Card title="Follow-up" hook="follow-up">
            <div className="mt-sum" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))', padding: 12, gap: 8 }}>
              <Figure href={`${base}/${meeting.id}?tab=actions`} cap="Open actions" value={open.length} hook="open" />
              <Figure href={`${base}/${meeting.id}?tab=actions`} cap="Overdue" value={overdue.length} tone={overdue.length > 0} hook="overdue" />
              <Figure href={`${base}/${meeting.id}?tab=decisions`} cap="Decisions" value={decs.length} hook="decisions" />
            </div>
          </Card>

          <Card
            title="Risks raised here"
            count={risks.length}
            hook="risks"
            action={
              <button type="button" className="btn sm" data-raise-risk onClick={() => setRaising(true)}>
                Raise a risk
              </button>
            }
          >
            {risks.length === 0 ? (
              <p className="mono-note" style={{ padding: '12px 16px' }}>
                A risk found in this meeting is raised on the step it threatens, and stays open until that step is handed over.
              </p>
            ) : (
              risks.map((r) => (
                <div key={r.id} className="mt-mini" style={{ padding: '9px 16px' }} data-meeting-risk={r.id}>
                  <span className="wrapcell">{r.text}</span>
                  <LinkChips links={[{ type: 'risk', ref: r.id }]} projectId={projectId} ctx={ctx} />
                </div>
              ))
            )}
          </Card>

          <Card title="Record" hook="record">
            <p className="mono-note" style={{ padding: '12px 16px' }}>
              Created by {meeting.createdBy || '—'} on {fmtZonedDate(meeting.createdAt, meeting.timeZone)}
              {' · '}last changed by {meeting.updatedBy || '—'} on {fmtZonedDate(meeting.updatedAt, meeting.timeZone)}{' '}
              {fmtZonedTime(meeting.updatedAt, meeting.timeZone)}
            </p>
          </Card>
        </div>
      </div>
      {raising && <RaiseRiskDialog meeting={meeting} projectId={projectId} links={meeting.links} onClose={() => setRaising(false)} />}
    </div>
  );
}

const Person = ({ name }: { name: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
    <Avatar name={name} small />
    {name}
  </span>
);

const SittingLink = ({ m, base }: { m: Meeting; base: string }) => (
  <span>
    <Link href={`${base}/${m.id}`} data-sitting-link={m.id}>
      {m.title}
    </Link>{' '}
    <span className="num" style={{ color: 'var(--ink-3)', fontSize: 12 }}>
      {fmtZonedDate(m.startsAt, m.timeZone)}
    </span>{' '}
    <MeetingStatusPill status={m.status} />
  </span>
);

function Figure({ href, cap, value, tone = false, hook }: { href: string; cap: string; value: number; tone?: boolean; hook: string }) {
  return (
    <Link className="mt-stat" href={href} style={{ padding: '8px 10px', borderRadius: 'var(--r)' }} data-figure={hook}>
      <span className="subcap" style={tone ? { color: 'var(--risk-ink)' } : undefined}>
        {cap}
      </span>
      <span className="num" style={{ fontSize: 20, fontWeight: 600, color: tone ? 'var(--risk)' : undefined }}>
        {value}
      </span>
    </Link>
  );
}
