'use client';

import { useState } from 'react';
import type { MeetingsTab } from '@/lib/meetings/tabs';
import type { CompletionMode } from '@/lib/meetings/types';
import { useMeetingStore } from '@/store/meetingStore';
import { IconPlus } from '../shell/icons';
import { SaveErrorBanner } from './atoms';
import { AllMeetingsTab } from './AllMeetingsTab';
import { CalendarTab } from './CalendarTab';
import { ChoiceMenu } from './ChoiceMenu';
import { MeetingDialog } from './MeetingDialog';
import { MeetingsTabs } from './MeetingsTabs';
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
 * Meetings: its tabs, in the URL like a stage's.
 *
 * The calendar is where it opens, and Upcoming — what is on this week and what
 * is owed — sits next to it. Action Items is a tab that opens the follow-up
 * screen of its own. History is not a tab: it is All Meetings filtered to what
 * is past, which is the same list and should not be two.
 */
export function MeetingsPage({ projectId, tab }: { projectId: string; tab: Exclude<MeetingsTab, 'actions'> }) {
  const hydrated = useMeetingStore((s) => s.hydrated);
  const mode = useMeetingStore((s) => s.completionMode);
  const setMode = useMeetingStore((s) => s.setCompletionMode);
  const [dialog, setDialog] = useState<{ kind: 'meeting'; date?: string } | { kind: 'series' } | null>(null);

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

      <MeetingsTabs projectId={projectId} current={tab} />

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
