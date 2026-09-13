'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { upcomingDigest, UPCOMING_DAYS } from '@/lib/meetings/digest';
import { fmtDate } from '@/lib/schedule';
import type { Meeting } from '@/lib/meetings/types';
import { fmtZonedDate } from '@/lib/meetings/zonedTime';
import { ME, useMeetingStore } from '@/store/meetingStore';
import { useAppStore } from '@/store/useAppStore';
import { Avatar, IconEmptyList } from '../shell/icons';
import { useProgramWork } from '../shell/useProgramWork';
import { DecisionStatusPill, Empty, LinkChips, MeetingWhen, TimingPill } from './atoms';
import { MeetingRow } from './MeetingRow';
import { useLinkContext } from './useLinkContext';

/**
 * The morning read: the follow-up numbers worth chasing, what is on today and
 * what is coming, what needs preparing, what was carried in unfinished, and
 * which coming meetings are about work that is already late or flagged.
 */
export function UpcomingTab({ projectId, onNew }: { projectId: string; onNew: () => void }) {
  const meetings = useMeetingStore((s) => s.meetings);
  const agenda = useMeetingStore((s) => s.agenda);
  const actions = useMeetingStore((s) => s.actions);
  const decisions = useMeetingStore((s) => s.decisions);
  const today = useAppStore((s) => s.today);
  const { overdue, risks } = useProgramWork();
  const { ctx, riskSteps } = useLinkContext();

  const d = useMemo(
    () =>
      upcomingDigest({
        meetings,
        agenda,
        actions,
        decisions,
        me: ME,
        now: today,
        today,
        overdueSteps: overdue.map((o) => `${o.act}:${o.stepN}`),
        openRisks: risks.map((r) => r.postId),
        riskSteps,
      }),
    [meetings, agenda, actions, decisions, today, overdue, risks, riskSteps],
  );
  const base = `/p/${projectId}/meetings`;
  const byId = new Map(meetings.map((m) => [m.id, m]));

  return (
    <div className="mt-page" data-upcoming>
      <div className="mt-sum">
        <SumCard
          href={`${base}/actions?view=mine`}
          cap="My open actions"
          value={d.summary.myOpen}
          sub={`${d.summary.dueSoon} due within 3 days, across the program`}
          hook="mine"
        />
        <SumCard
          href={`${base}/actions?view=overdue`}
          cap="Overdue actions"
          value={d.summary.overdue}
          sub="past their due date"
          tone={d.summary.overdue > 0}
          hook="overdue"
        />
        <SumCard
          href={`${base}/actions?view=blocked`}
          cap="Blocked actions"
          value={d.summary.blocked}
          sub="waiting on something"
          tone={d.summary.blocked > 0}
          hook="blocked"
        />
        <SumCard
          href="#awaiting"
          cap="Decisions awaiting approval"
          value={d.summary.awaitingDecisions}
          sub="still Proposed"
          hook="awaiting"
        />
      </div>

      <div className="mt-cols">
        <div className="mt-stack">
          <MeetingList
            title="Today"
            hook="today"
            list={d.today}
            projectId={projectId}
            ctx={ctx}
            empty="Nothing on the calendar today."
          />
          <MeetingList
            title="Coming up"
            sub={`the next ${UPCOMING_DAYS} days`}
            hook="coming"
            list={d.upcoming}
            projectId={projectId}
            ctx={ctx}
            empty={
              <>
                No meetings scheduled in the next {UPCOMING_DAYS} days. Schedule sittings from a series, or{' '}
                <button type="button" className="btn sm" onClick={onNew} style={{ display: 'inline-flex' }}>
                  create a meeting
                </button>
              </>
            }
          />
          <MeetingList
            title="Meetings you own"
            hook="mine"
            list={d.mine}
            projectId={projectId}
            ctx={ctx}
            empty="You own none of the meetings coming up."
          />
        </div>

        <div className="mt-stack">
          <Card title="Prepare before the meeting" count={d.prep.reduce((n, p) => n + p.items.length, 0)} hook="prep">
            {d.prep.length === 0 ? (
              <Empty>Every agenda item on the meetings coming up has been discussed or has none.</Empty>
            ) : (
              d.prep.map(({ meeting, items }) => (
                <div key={meeting.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--line-soft)' }}>
                  <Link href={`${base}/${meeting.id}?tab=agenda`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                    {meeting.title}
                  </Link>
                  <div className="mt-meta" style={{ marginBottom: 6 }}>
                    <MeetingWhen startsAt={meeting.startsAt} endsAt={meeting.endsAt} timeZone={meeting.timeZone} />
                  </div>
                  {items.map((a) => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 0' }} data-prep={a.id}>
                      <span className="mt-agenda-num">{a.position + 1}</span>
                      <span className="wrapcell" style={{ fontSize: 12.5, flexGrow: 1 }}>
                        {a.title}
                      </span>
                      {a.presenter === ME ? (
                        <span className="pill acc" style={{ fontSize: 10 }}>
                          You present
                        </span>
                      ) : a.presenter ? (
                        <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{a.presenter}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              ))
            )}
          </Card>

          <Card title="Carried over from earlier meetings" count={d.carriedOver.length} hook="carried">
            {d.carriedOver.length === 0 ? (
              <Empty>Nothing unfinished has been carried into a meeting that is coming up.</Empty>
            ) : (
              d.carriedOver.map(({ action, meeting }) => {
                const source = action.meetingId ? byId.get(action.meetingId) : undefined;
                return (
                  <div key={action.id} className="mt-mini" style={{ padding: '9px 16px' }} data-carried={action.id}>
                    <span className="wrapcell" style={{ fontWeight: 550 }}>
                      {action.description}
                    </span>
                    <span className="mt-meta">
                      {action.owner ? (
                        <>
                          <Avatar name={action.owner} small /> {action.owner}
                        </>
                      ) : (
                        <span className="pill risk" style={{ fontSize: 10 }}>
                          No owner
                        </span>
                      )}
                      {action.due && <span className="num">· due {fmtDate(action.due)}</span>}
                      <TimingPill action={action} today={today} />
                    </span>
                    <span className="mt-meta">
                      {source && (
                        <>
                          from <Link href={`${base}/${source.id}?tab=actions`}>{source.title}</Link>
                          <span className="num">({fmtZonedDate(source.startsAt, source.timeZone)})</span>
                        </>
                      )}
                      into <Link href={`${base}/${meeting.id}?tab=actions`}>{meeting.title}</Link>
                    </span>
                  </div>
                );
              })
            )}
          </Card>

          <Card title="About work that needs attention" count={d.alerts.length} hook="alerts">
            {d.alerts.length === 0 ? (
              <Empty>No meeting coming up is about a late step or an open risk.</Empty>
            ) : (
              d.alerts.map((a, i) => (
                <div key={`${a.meeting.id}:${a.kind}:${i}`} className="mt-mini" style={{ padding: '9px 16px' }} data-alert={a.kind}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    <span className="pill risk" style={{ fontSize: 10 }}>
                      {a.kind === 'overdue' ? 'Overdue step' : 'Open risk'}
                    </span>
                    <Link href={`${base}/${a.meeting.id}`} style={{ fontWeight: 550, color: 'var(--ink)' }}>
                      {a.meeting.title}
                    </Link>
                    <span className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                      {fmtZonedDate(a.meeting.startsAt, a.meeting.timeZone)}
                    </span>
                  </span>
                  <LinkChips links={[a.link]} projectId={projectId} ctx={ctx} />
                </div>
              ))
            )}
          </Card>

          <Card title="Decisions awaiting approval" count={d.awaiting.length} hook="awaiting-list" id="awaiting">
            {d.awaiting.length === 0 ? (
              <Empty>No decision is waiting on approval.</Empty>
            ) : (
              d.awaiting.map((dec) => {
                const m = byId.get(dec.meetingId);
                return (
                  <Link
                    key={dec.id}
                    className="mt-mini"
                    style={{ padding: '9px 16px' }}
                    href={`${base}/${dec.meetingId}?tab=decisions`}
                    data-awaiting={dec.id}
                  >
                    <span style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                      <DecisionStatusPill status={dec.status} />
                      <span className="wrapcell" style={{ fontWeight: 550 }}>
                        {dec.title}
                      </span>
                    </span>
                    <span className="mt-meta">
                      {m && `${m.title} · ${fmtZonedDate(m.startsAt, m.timeZone)}`}
                      {dec.owner && ` · ${dec.owner}`}
                    </span>
                  </Link>
                );
              })
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function SumCard({
  href,
  cap,
  value,
  sub,
  tone = false,
  hook,
}: {
  href: string;
  cap: string;
  value: number;
  sub: string;
  tone?: boolean;
  hook: string;
}) {
  return (
    <Link className="card mt-stat" href={href} data-summary={hook}>
      <span className="subcap" style={tone ? { color: 'var(--risk-ink)' } : undefined}>
        {cap}
      </span>
      <span
        className="num"
        style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.02em', marginTop: 3, color: tone ? 'var(--risk)' : undefined }}
      >
        {value}
      </span>
      <span style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>{sub}</span>
    </Link>
  );
}

export function Card({
  title,
  count,
  sub,
  children,
  hook,
  id,
  action,
}: {
  title: string;
  count?: number;
  sub?: string;
  children: React.ReactNode;
  hook?: string;
  id?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="card" style={{ overflow: 'hidden' }} data-card={hook} id={id}>
      <div className="card-hd">
        <b style={{ fontSize: 13.5 }}>{title}</b>
        {count != null && <span className="pill">{count}</span>}
        {sub && <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{sub}</span>}
        <span style={{ flexGrow: 1 }} />
        {action}
      </div>
      {children}
    </section>
  );
}

function MeetingList({
  title,
  sub,
  list,
  projectId,
  ctx,
  empty,
  hook,
}: {
  title: string;
  sub?: string;
  list: Meeting[];
  projectId: string;
  ctx: ReturnType<typeof useLinkContext>['ctx'];
  empty: React.ReactNode;
  hook: string;
}) {
  return (
    <Card title={title} count={list.length} sub={sub} hook={hook}>
      {list.length === 0 ? (
        <Empty icon={<IconEmptyList />}>{empty}</Empty>
      ) : (
        list.map((m) => <MeetingRow key={m.id} meeting={m} projectId={projectId} ctx={ctx} />)
      )}
    </Card>
  );
}
