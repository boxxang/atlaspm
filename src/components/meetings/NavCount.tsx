'use client';

import { countUpcoming } from '@/lib/meetings/digest';
import { useMeetingStore } from '@/store/meetingStore';
import { useAppStore } from '@/store/useAppStore';

/** The Meetings entry's count: sittings from today on that are still to happen. */
export function UpcomingMeetingsCount() {
  const meetings = useMeetingStore((s) => s.meetings);
  const today = useAppStore((s) => s.today);
  return (
    <span className="c" data-meetings-count>
      {countUpcoming(meetings, today)}
    </span>
  );
}
