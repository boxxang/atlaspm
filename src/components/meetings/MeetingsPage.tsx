'use client';

import Link from 'next/link';
import { useState } from 'react';
import { countUpcoming } from '@/lib/meetings/digest';
import { DEFAULT_MEETINGS_TAB, MEETINGS_TABS, type MeetingsTab } from '@/lib/meetings/tabs';
import type { CompletionMode } from '@/lib/meetings/types';
import { useMeetingStore } from '@/store/meetingStore';
import { useAppStore } from '@/store/useAppStore';
import { IconPlus } from '../shell/icons';
import { SaveErrorBanner } from './atoms';
import { AllMeetingsTab } from './AllMeetingsTab';
import { CalendarTab } from './CalendarTab';
import { ChoiceMenu } from './ChoiceMenu';
import { MeetingDialog } from './MeetingDialog';
import { SeriesDialog } from './SeriesDialog';
import { SeriesTab } from './SeriesTab';
import { UpcomingTab } from './UpcomingTab';

const MODES: readonly { key: CompletionMode; label: string; hint: string }[] = [
  {
    key: 'warn',
    label: 'Warn only',
    hint: 'Completing a meeting lists what is missing and lets it close anyway.',
  },
  {
    key: 'block',
    label: 'Require the checks',
    hint: 'A meeting cannot be completed until it has minutes, landed decisions, and an owner and due date on every open action.',
  },
];

/**
 * Meetings: four tabs, in the URL like a stage's.
 *
 * The calendar is where it opens, and Upcoming — what is on this week and what
 * is owed — sits next to it. History is not a tab: it is All Meetings filtered to what
 * is past, which is the same list and should not be two.
 */
export function MeetingsPage({ projectId, tab }: { projectId: string; tab: MeetingsTab }) {
  const hydrated = useMeetingStore((s) => s.hydrated);
  const meetings = useMeetingStore((s) => s.meetings);
  const series = useMeetingStore((s) => s.series);
  const mode = useMeetingStore((s) => s.completionMode);
  const setMode = useMeetingStore((s) => s.setCompletionMode);
  const today = useAppStore((s) => s.today);
  const [dialog, setDialog] = useState<{ kind: 'meeting'; date?: string } | { kind: 'series' } | null>(null);

  const counts: Record<MeetingsTab, number | null> = {
    upcoming: countUpcoming(meetings, today),
    calendar: null,
    all: meetings.length,
    series: series.length,
  };

  return (
    <>
      <div className="hd mt-hd">
        <h1>Meetings</h1>
        <span style={{ flexGrow: 1 }} />
        <ChoiceMenu
          hook="completion-mode"
          label={`Completion checks: ${mode === 'block' ? 'Required' : 'Warn only'}`}
          options={MODES}
          chosen={mode}
          onChoose={setMode}
        />
        <button type="button" className="btn sm" data-new-series onClick={() => setDialog({ kind: 'series' })}>
          New series
        </button>
        <button type="button" className="btn pri sm" data-new-meeting onClick={() => setDialog({ kind: 'meeting' })}>
          <IconPlus light />
          New meeting
        </button>
      </div>

      <SaveErrorBanner />

      <div style={{ padding: '14px 20px 0' }}>
        <nav className="tabs" aria-label="Meetings">
          {MEETINGS_TABS.map((t) => (
            <Link
              key={t.slug}
              href={`/p/${projectId}/meetings${t.slug === DEFAULT_MEETINGS_TAB ? '' : `?tab=${t.slug}`}`}
              className={t.slug === tab ? 'tab on' : 'tab'}
              aria-current={t.slug === tab ? 'page' : undefined}
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

      {!hydrated ? (
        <div className="empty" role="status" aria-live="polite">
          <p className="mono-note">Loading meetings…</p>
        </div>
      ) : tab === 'upcoming' ? (
        <UpcomingTab projectId={projectId} onNew={() => setDialog({ kind: 'meeting' })} />
      ) : tab === 'calendar' ? (
        <CalendarTab projectId={projectId} onNew={(date) => setDialog({ kind: 'meeting', date })} />
      ) : tab === 'all' ? (
        <AllMeetingsTab projectId={projectId} />
      ) : (
        <SeriesTab projectId={projectId} onNew={() => setDialog({ kind: 'series' })} />
      )}

      {dialog?.kind === 'meeting' && (
        <MeetingDialog projectId={projectId} defaultDate={dialog.date} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === 'series' && <SeriesDialog projectId={projectId} onClose={() => setDialog(null)} />}
    </>
  );
}
