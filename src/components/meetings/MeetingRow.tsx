'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { LinkContext } from '@/lib/meetings/links';
import { MEETING_TYPE_LABEL, type Meeting } from '@/lib/meetings/types';
import { fmtZonedDate } from '@/lib/meetings/zonedTime';
import { useMeetingStore } from '@/store/meetingStore';
import { Avatar } from '../shell/icons';
import { LinkChips, MeetingStatusPill, MeetingWhen } from './atoms';

/**
 * One meeting in a list: when, what, who, what it is about, and where it
 * stands.
 *
 * The whole row opens the meeting, but it is not one link — the chips inside it
 * are links of their own, and a link inside a link is not HTML. So the title is
 * the link a keyboard reaches, and the rest of the row forwards a click to it.
 */
export function MeetingRow({
  meeting,
  projectId,
  ctx,
  showLinks = true,
}: {
  meeting: Meeting;
  projectId: string;
  ctx: LinkContext;
  showLinks?: boolean;
}) {
  const router = useRouter();
  const series = useMeetingStore((s) => s.series.find((x) => x.id === meeting.seriesId));
  const href = `/p/${projectId}/meetings/${meeting.id}`;

  return (
    <div className="mt-row" data-meeting-row={meeting.id} onClick={() => router.push(href)} style={{ cursor: 'pointer' }}>
      <span>
        <b className="num" style={{ fontSize: 13, display: 'block' }}>
          {fmtZonedDate(meeting.startsAt, meeting.timeZone)}
        </b>
        <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
          <MeetingWhen startsAt={meeting.startsAt} endsAt={meeting.endsAt} timeZone={meeting.timeZone} dateless />
        </span>
      </span>
      <span style={{ minWidth: 0 }}>
        <Link
          href={href}
          className="wrapcell"
          style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', display: 'block' }}
          onClick={(e) => e.stopPropagation()}
        >
          {meeting.title}
        </Link>
        <span className="mt-meta">
          <span>{MEETING_TYPE_LABEL[meeting.type]}</span>
          {series && (
            <span className="pill" style={{ fontSize: 10 }} title={`Part of ${series.title}`}>
              ↻ Recurring
            </span>
          )}
          {meeting.owner && (
            <>
              <Avatar name={meeting.owner} small />
              <span>{meeting.owner}</span>
            </>
          )}
          {meeting.attendees.length > 0 && (
            <span>
              · {meeting.attendees.length} attendee{meeting.attendees.length === 1 ? '' : 's'}
            </span>
          )}
        </span>
        {showLinks && meeting.links.length > 0 && (
          <span style={{ display: 'block', marginTop: 6 }} onClick={(e) => e.stopPropagation()}>
            <LinkChips links={meeting.links} projectId={projectId} ctx={ctx} max={3} />
          </span>
        )}
      </span>
      <span style={{ justifySelf: 'end' }}>
        <MeetingStatusPill status={meeting.status} />
      </span>
    </div>
  );
}
