'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { relatedToWork } from '@/lib/meetings/related';
import { fmtZonedDate } from '@/lib/meetings/zonedTime';
import { fmtDate } from '@/lib/schedule';
import { useMeetingStore } from '@/store/meetingStore';
import { useAppStore } from '@/store/useAppStore';
import { DecisionStatusPill, MeetingStatusPill, TimingPill } from './atoms';

/**
 * The meetings an activity or a step has been in, in its panel.
 *
 * Read from the meetings' side: the decisions and action items listed are the
 * meetings' own rows, linked, not copies — and nothing here changes the step.
 * An action marked done does not tick the step, and an overdue one moves no
 * date; this only says what was said and what is owed.
 */
export function RelatedMeetings({ projectId, act, n }: { projectId: string; act: string; n?: number }) {
  const meetings = useMeetingStore((s) => s.meetings);
  const agenda = useMeetingStore((s) => s.agenda);
  const decisions = useMeetingStore((s) => s.decisions);
  const actions = useMeetingStore((s) => s.actions);
  const posts = useAppStore((s) => s.posts);
  const today = useAppStore((s) => s.today);

  const r = useMemo(() => {
    const riskSteps: Record<string, { act: string; stepN: number | null }> = {};
    for (const p of posts) if (p.kind === 'risk' && p.activityRef) riskSteps[p.id] = { act: p.activityRef, stepN: p.stepN };
    return relatedToWork({
      target: n == null ? { act } : { act, n },
      meetings,
      agenda,
      decisions,
      actions,
      riskSteps,
      now: today,
      today,
    });
  }, [act, n, meetings, agenda, decisions, actions, posts, today]);

  const base = `/p/${projectId}/meetings`;
  const byId = new Map(meetings.map((m) => [m.id, m]));
  const isStep = n != null;
  const nothing = !r.upcoming.length && !r.recent.length && !r.decisions.length && !r.openActions.length;

  return (
    <div className="mt-section" data-related-meetings={isStep ? `${act}:${n}` : act}>
      <span className="cap">
        Meetings
        <span className="pill" style={{ fontSize: 10.5 }}>
          {r.upcoming.length + r.recent.length}
        </span>
        <span style={{ flexGrow: 1 }} />
        <Link href={base} style={{ fontSize: 11.5, fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--accent)' }}>
          All meetings
        </Link>
      </span>

      {nothing ? (
        <p className="mono-note">
          {isStep
            ? 'No meeting has discussed this step yet. Link it from a meeting, an agenda item or an action item.'
            : 'No meeting has linked this activity yet. Link it from a meeting’s related items.'}
        </p>
      ) : (
        <>
          <div className="prop">
            <span className="pk">{isStep ? 'Last discussed' : 'Last reviewed'}</span>
            <span className="num" style={{ fontSize: 13 }} data-last-reviewed>
              {r.lastReviewed ? fmtDate(r.lastReviewed) : 'Not yet'}
            </span>
          </div>
          <div className="prop">
            <span className="pk">Next review</span>
            <span style={{ fontSize: 13, minWidth: 0 }} className="ell">
              {r.nextReview ? (
                <Link href={`${base}/${r.nextReview.id}`}>
                  {fmtZonedDate(r.nextReview.startsAt, r.nextReview.timeZone)} · {r.nextReview.title}
                </Link>
              ) : (
                <span style={{ color: 'var(--ink-4)' }}>None scheduled</span>
              )}
            </span>
          </div>
          <div className="prop">
            <span className="pk">Open actions</span>
            <span style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }} data-open-actions={r.openActions.length}>
              <b className="num">{r.openActions.length}</b>
              {r.overdueActions.length > 0 && (
                <span className="pill risk" style={{ fontSize: 10 }} data-overdue-actions={r.overdueActions.length}>
                  {r.overdueActions.length} overdue
                </span>
              )}
              {r.blocked.length > 0 && (
                <span className="pill risk" style={{ fontSize: 10 }}>
                  {r.blocked.length} blocked
                </span>
              )}
            </span>
          </div>

          {r.upcoming.length > 0 && (
            <Group title="Coming up">
              {r.upcoming.slice(0, 3).map((m) => (
                <Link key={m.id} className="mt-mini" href={`${base}/${m.id}`} data-related-meeting={m.id}>
                  <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span className="num" style={{ color: 'var(--ink-3)', fontSize: 11.5 }}>
                      {fmtZonedDate(m.startsAt, m.timeZone)}
                    </span>
                    <span className="ell" style={{ fontWeight: 550 }}>
                      {m.title}
                    </span>
                  </span>
                </Link>
              ))}
            </Group>
          )}

          {r.recent.length > 0 && (
            <Group title={isStep ? 'Discussed in' : 'Recently completed'}>
              {r.recent.slice(0, 3).map((m) => (
                <Link key={m.id} className="mt-mini" href={`${base}/${m.id}?tab=agenda`} data-related-meeting={m.id}>
                  <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span className="num" style={{ color: 'var(--ink-3)', fontSize: 11.5 }}>
                      {fmtZonedDate(m.startsAt, m.timeZone)}
                    </span>
                    <span className="ell">{m.title}</span>
                    <MeetingStatusPill status={m.status} />
                  </span>
                </Link>
              ))}
            </Group>
          )}

          {r.decisions.length > 0 && (
            <Group title={isStep ? 'Key decisions' : 'Decisions'}>
              {r.decisions.slice(0, 4).map((d) => {
                const m = byId.get(d.meetingId);
                return (
                  <Link key={d.id} className="mt-mini" href={`${base}/${d.meetingId}?tab=decisions`} data-related-decision={d.id}>
                    <span style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <DecisionStatusPill status={d.status} />
                      <span className="wrapcell">{d.title}</span>
                    </span>
                    {m && <span className="mt-meta" style={{ marginTop: 0 }}>{m.title}</span>}
                  </Link>
                );
              })}
            </Group>
          )}

          {r.openActions.length > 0 && (
            <Group title="Open action items">
              {r.openActions.slice(0, 5).map((a) => (
                <Link key={a.id} className="mt-mini" href={`${base}/${a.meetingId}?tab=actions`} data-related-action={a.id}>
                  <span className="wrapcell">{a.description}</span>
                  <span className="mt-meta" style={{ marginTop: 0 }}>
                    {a.owner || 'No owner'}
                    {a.due && <span className="num">· due {fmtDate(a.due)}</span>}
                    <TimingPill action={a} today={today} />
                  </span>
                </Link>
              ))}
            </Group>
          )}

          {isStep && r.blocked.length > 0 && (
            <Group title="Open blockers">
              {r.blocked.map((a) => (
                <div key={a.id} className="mt-mini" data-blocker={a.id}>
                  <span className="wrapcell">{a.blocker || a.description}</span>
                  <span className="mt-meta" style={{ marginTop: 0 }}>
                    {a.owner || 'No owner'}
                  </span>
                </div>
              ))}
            </Group>
          )}
        </>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div className="subcap" style={{ marginBottom: 3 }}>
        {title}
      </div>
      {children}
    </div>
  );
}
