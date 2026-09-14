'use client';

import Link from 'next/link';
import { countUpcoming } from '@/lib/meetings/digest';
import { actionSummary } from '@/lib/meetings/followUp';
import { MEETINGS_TABS, meetingsTabHref, type MeetingsTab } from '@/lib/meetings/tabs';
import { ME, useMeetingStore } from '@/store/meetingStore';
import { useAppStore } from '@/store/useAppStore';

/**
 * The Meetings tabs, drawn the same on the Meetings page and on the Action
 * Items screen, so moving between them reads as one section.
 */
export function MeetingsTabs({ projectId, current }: { projectId: string; current: MeetingsTab }) {
  const meetings = useMeetingStore((s) => s.meetings);
  const series = useMeetingStore((s) => s.series);
  const actions = useMeetingStore((s) => s.actions);
  const today = useAppStore((s) => s.today);

  const counts: Record<MeetingsTab, number | null> = {
    calendar: null,
    upcoming: countUpcoming(meetings, today),
    actions: actionSummary(actions, ME, today).myOpen,
    all: meetings.length,
    series: series.length,
  };

  return (
    <div style={{ padding: '14px 20px 0' }}>
      <nav className="tabs" aria-label="Meetings">
        {MEETINGS_TABS.map((t) => (
          <Link
            key={t.slug}
            href={meetingsTabHref(projectId, t.slug)}
            className={t.slug === current ? 'tab on' : 'tab'}
            aria-current={t.slug === current ? 'page' : undefined}
            data-meetings-tab={t.slug}
          >
            {t.label}
            {counts[t.slug] != null && (
              <span className="pill" style={{ fontSize: 10.5 }}>
                {counts[t.slug]}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
