'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { filterMeetings, type MeetingFilter } from '@/lib/meetings/filters';
import { isActionOpen } from '@/lib/meetings/followUp';
import { parseStepRef } from '@/lib/meetings/links';
import {
  MEETING_STATUS_LABEL,
  MEETING_STATUSES,
  MEETING_TYPE_LABEL,
  MEETING_TYPES,
  type MeetingStatus,
  type MeetingType,
} from '@/lib/meetings/types';
import { useMeetingStore } from '@/store/meetingStore';
import { useAppStore } from '@/store/useAppStore';
import { ctVar, CTHead, type Col } from '../shell/ctable';
import { Avatar } from '../shell/icons';
import { useProgramActivityTitles } from '../shell/useProgramActivities';
import { Empty, LinkChips, MeetingStatusPill, MeetingWhen } from './atoms';
import { useLinkContext } from './useLinkContext';

const COLS: Col[] = [
  ['when', 150, 'WHEN'],
  ['title', null, 'MEETING'],
  ['status', 104, 'STATUS'],
  ['owner', 150, 'OWNER'],
  ['actions', 78, 'OPEN ACTIONS'],
  ['decisions', 72, 'DECISIONS'],
];

const EMPTY_FILTER: MeetingFilter = { sort: 'newest' };

/**
 * Every meeting the programme has held, will hold, or called off.
 *
 * History lives here: Completed and a date range before today is the record of
 * what was met about, and it is the same list as what is coming rather than a
 * second copy of it.
 */
export function AllMeetingsTab({ projectId }: { projectId: string }) {
  const meetings = useMeetingStore((s) => s.meetings);
  const agenda = useMeetingStore((s) => s.agenda);
  const actions = useMeetingStore((s) => s.actions);
  const decisions = useMeetingStore((s) => s.decisions);
  const series = useMeetingStore((s) => s.series);
  const stages = useAppStore((s) => s.stages);
  const today = useAppStore((s) => s.today);
  const titles = useProgramActivityTitles();
  const { ctx, riskSteps } = useLinkContext();
  const [f, setF] = useState<MeetingFilter>(EMPTY_FILTER);
  const set = (patch: Partial<MeetingFilter>) => setF((x) => ({ ...x, ...patch }));

  const rows = useMemo(
    () => filterMeetings(meetings, agenda, f, ctx, riskSteps, today),
    [meetings, agenda, f, ctx, riskSteps, today],
  );
  const owners = [...new Set(meetings.map((m) => m.owner).filter(Boolean))].sort();
  /* Only the activities some meeting is actually about — a picker of 259 would
     be a list of things that return nothing. */
  const linkedActs = [
    ...new Set(
      [...meetings.flatMap((m) => m.links), ...agenda.flatMap((a) => a.links)]
        .map((l) => (l.type === 'activity' ? l.ref : l.type === 'step' ? parseStepRef(l.ref)?.act : l.type === 'risk' ? riskSteps[l.ref]?.act : undefined))
        .filter((x): x is string => !!x),
    ),
  ].sort();
  const filtered = Object.entries(f).some(([k, v]) => k !== 'sort' && v);

  return (
    <div data-all-meetings>
      <div className="filterbar" style={{ height: 'auto', minHeight: 38, flexWrap: 'wrap', padding: '8px 20px', gap: 7 }}>
        <input
          className="lnkin"
          style={{ width: 220, flexGrow: 0 }}
          placeholder="Search meetings, people, agenda…"
          aria-label="Search meetings"
          value={f.query ?? ''}
          onChange={(e) => set({ query: e.target.value })}
        />
        <select className="lnkin" style={{ flexGrow: 0 }} aria-label="Status" value={f.status ?? ''} onChange={(e) => set({ status: e.target.value as MeetingStatus | '' })}>
          <option value="">Any status</option>
          {MEETING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {MEETING_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select className="lnkin" style={{ flexGrow: 0 }} aria-label="When" value={f.when ?? ''} onChange={(e) => set({ when: e.target.value as MeetingFilter['when'] })}>
          <option value="">Past and upcoming</option>
          <option value="upcoming">Still to happen</option>
          <option value="past">Past</option>
        </select>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-3)' }}>
          From
          <input className="dateinp" type="date" aria-label="From date" value={f.from ?? ''} onChange={(e) => set({ from: e.target.value })} />
          to
          <input className="dateinp" type="date" aria-label="To date" value={f.to ?? ''} onChange={(e) => set({ to: e.target.value })} />
        </span>
        <select className="lnkin" style={{ flexGrow: 0 }} aria-label="Meeting type" value={f.type ?? ''} onChange={(e) => set({ type: e.target.value as MeetingType | '' })}>
          <option value="">Any type</option>
          {MEETING_TYPES.map((t) => (
            <option key={t} value={t}>
              {MEETING_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <select className="lnkin" style={{ flexGrow: 0 }} aria-label="Owner" value={f.owner ?? ''} onChange={(e) => set({ owner: e.target.value })}>
          <option value="">Any owner</option>
          {owners.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <select className="lnkin" style={{ flexGrow: 0, maxWidth: 200 }} aria-label="Related stage" value={f.stageId ?? ''} onChange={(e) => set({ stageId: e.target.value })}>
          <option value="">Any stage</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.shortTitle} · {s.title}
            </option>
          ))}
        </select>
        <select className="lnkin" style={{ flexGrow: 0, maxWidth: 220 }} aria-label="Related activity" value={f.activityRef ?? ''} onChange={(e) => set({ activityRef: e.target.value })}>
          <option value="">Any activity</option>
          {linkedActs.map((ref) => (
            <option key={ref} value={ref}>
              {ref} · {titles[ref] ?? ''}
            </option>
          ))}
        </select>
        <select className="lnkin" style={{ flexGrow: 0, maxWidth: 220 }} aria-label="Meeting series" value={f.seriesId ?? ''} onChange={(e) => set({ seriesId: e.target.value })}>
          <option value="">Any series</option>
          {series.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        <select className="lnkin" style={{ flexGrow: 0 }} aria-label="Sort" value={f.sort ?? 'newest'} onChange={(e) => set({ sort: e.target.value as 'newest' | 'oldest' })}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        {filtered && (
          <button type="button" className="btn sm" data-clear-filters onClick={() => setF(EMPTY_FILTER)}>
            Clear filters
          </button>
        )}
        <span style={{ flexGrow: 1 }} />
        <span className="num" style={{ fontSize: 12, color: 'var(--ink-3)' }} data-meeting-count>
          {rows.length === meetings.length ? `${rows.length} meetings` : `${rows.length} of ${meetings.length} meetings`}
        </span>
      </div>

      {rows.length === 0 ? (
        <Empty>
          {meetings.length === 0
            ? 'No meetings yet. Create one, or schedule sittings from a series.'
            : 'No meeting matches these filters.'}
        </Empty>
      ) : (
        <div className="ctable" data-board data-board-stack style={{ ['--ct' as string]: ctVar(COLS) }}>
          <CTHead cols={COLS} />
          {rows.map((m) => {
            const open = actions.filter((a) => (a.meetingId === m.id || a.carriedToMeetingId === m.id) && isActionOpen(a)).length;
            const decs = decisions.filter((x) => x.meetingId === m.id).length;
            const s = series.find((x) => x.id === m.seriesId);
            return (
              <div key={m.id} className="trow" data-meeting={m.id} style={{ alignItems: 'start', paddingTop: 9, paddingBottom: 9 }}>
                <span style={{ fontSize: 12.5 }}>
                  <MeetingWhen startsAt={m.startsAt} endsAt={m.endsAt} timeZone={m.timeZone} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <Link href={`/p/${projectId}/meetings/${m.id}`} className="wrapcell" style={{ fontWeight: 600, color: 'var(--ink)' }}>
                    {m.title}
                  </Link>
                  <span className="mt-meta">
                    {MEETING_TYPE_LABEL[m.type]}
                    {s && (
                      <span className="pill" style={{ fontSize: 10 }} title={s.title}>
                        ↻ {s.title}
                      </span>
                    )}
                  </span>
                  {m.links.length > 0 && (
                    <span style={{ display: 'block', marginTop: 5 }}>
                      <LinkChips links={m.links} projectId={projectId} ctx={ctx} max={3} />
                    </span>
                  )}
                </span>
                <span>
                  <MeetingStatusPill status={m.status} />
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  {m.owner ? (
                    <>
                      <Avatar name={m.owner} small />
                      <span className="ell" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                        {m.owner}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>Unassigned</span>
                  )}
                </span>
                <span className="num" style={{ fontSize: 12.5, color: open ? 'var(--ink)' : 'var(--ink-4)' }}>
                  {open || '—'}
                </span>
                <span className="num" style={{ fontSize: 12.5, color: decs ? 'var(--ink)' : 'var(--ink-4)' }}>
                  {decs || '—'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
