'use client';

import Link from 'next/link';
import { meetingsToday } from '@/lib/meetings/digest';
import { useMeetingStore } from '@/store/meetingStore';
import { useAppStore } from '@/store/useAppStore';
import { MeetingRow } from './MeetingRow';
import { useLinkContext } from './useLinkContext';

/**
 * Today's meetings, on the Overview: after what needs answering today and
 * before the schedule, because a TPM's day is those two lists and the meetings
 * where they get answered. Held ones stay on the list until the day is over —
 * what was decided this morning is still today's news. Cancelled ones do not.
 */
export function TodayMeetings({ projectId }: { projectId: string }) {
  const hydrated = useMeetingStore((s) => s.hydrated);
  const meetings = useMeetingStore((s) => s.meetings);
  const today = useAppStore((s) => s.today);
  const { ctx } = useLinkContext();
  const list = meetingsToday(meetings, today);
  const base = `/p/${projectId}/meetings`;

  return (
    <div className="card" style={{ marginTop: 16, overflow: 'hidden' }} data-today-meetings>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '13px 18px',
          borderBottom: list.length ? '1px solid var(--line-soft)' : undefined,
          flexWrap: 'wrap',
        }}
      >
        <b style={{ fontSize: 14 }}>Today’s meetings</b>
        <span className="pill">{hydrated ? list.length : '…'}</span>
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>in the order they start</span>
        <span style={{ flexGrow: 1 }} />
        <Link className="btn sm" href={`${base}?tab=upcoming`}>
          Upcoming
        </Link>
        <Link className="btn sm" href={base}>
          Calendar
        </Link>
      </div>

      {!hydrated ? (
        <div className="empty" role="status" aria-live="polite" style={{ padding: 22 }}>
          <p className="mono-note">Loading meetings…</p>
        </div>
      ) : list.length === 0 ? (
        <div className="empty" style={{ padding: 22 }}>
          <p className="mono-note">Nothing on the calendar today.</p>
        </div>
      ) : (
        list.map((m) => <MeetingRow key={m.id} meeting={m} projectId={projectId} ctx={ctx} />)
      )}
    </div>
  );
}
