'use client';

import Link from 'next/link';
import { useMeetingStore } from '@/store/meetingStore';
import { useAppStore } from '@/store/useAppStore';

/** On a risk raised in a meeting: where it came from, and a way back there. */
export function MeetingSource({ meetingId }: { meetingId: string }) {
  const meeting = useMeetingStore((s) => s.meetings.find((m) => m.id === meetingId));
  const projectId = useAppStore((s) => s.projectId);
  if (!meeting) return null;
  return (
    <Link
      className="pill subject"
      style={{ fontSize: 10.5 }}
      href={`/p/${projectId}/meetings/${meeting.id}`}
      title={`Raised in ${meeting.title}`}
      data-meeting-source={meeting.id}
    >
      From meeting: {meeting.title}
    </Link>
  );
}

/**
 * On a deliverable's handover: the decisions meetings recorded about it.
 *
 * Shown, never applied — an approval in a meeting is a decision about the
 * deliverable, and the deliverable is still completed by its handover.
 */
export function DeliverableDecisions({ deliverableId, projectId }: { deliverableId: string; projectId: string }) {
  const decisions = useMeetingStore((s) => s.decisions);
  const meetings = useMeetingStore((s) => s.meetings);
  const mine = decisions.filter((d) => d.links.some((l) => l.type === 'deliverable' && l.ref === deliverableId));
  if (!mine.length) return null;
  return (
    <div style={{ marginBottom: 14 }} data-deliverable-decisions={deliverableId}>
      <div className="cap" style={{ marginBottom: 6 }}>
        Decisions about this deliverable
      </div>
      {mine.map((d) => {
        const m = meetings.find((x) => x.id === d.meetingId);
        return (
          <div key={d.id} className="mt-mini">
            <span style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={d.status === 'approved' ? 'pill ok' : d.status === 'rejected' ? 'pill risk' : d.status === 'proposed' ? 'pill warn' : 'pill'} style={{ fontSize: 10.5 }}>
                {d.status[0].toUpperCase() + d.status.slice(1)}
              </span>
              <Link href={`/p/${projectId}/meetings/${d.meetingId}?tab=decisions`}>{d.title}</Link>
            </span>
            {m && <span className="mt-meta" style={{ marginTop: 0 }}>{m.title}</span>}
          </div>
        );
      })}
      <p className="mono-note" style={{ marginTop: 6 }}>
        A decision recorded in a meeting does not complete the deliverable — its handover does.
      </p>
    </div>
  );
}
