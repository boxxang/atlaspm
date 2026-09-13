'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { actionsOfMeeting } from '@/lib/meetings/followUp';
import { MEETING_DETAIL_TABS, type MeetingDetailTab } from '@/lib/meetings/tabs';
import type { MeetingStatus } from '@/lib/meetings/types';
import { useMeetingStore } from '@/store/meetingStore';
import { ActionItemsTab } from './ActionItems';
import { AgendaTab } from './AgendaTab';
import { MeetingStatusPill, SaveErrorBanner } from './atoms';
import { CompleteDialog } from './CompleteDialog';
import { DecisionsTab } from './DecisionsTab';
import { EditorDialog } from './EditorDialog';
import { FilesTab } from './FilesTab';
import { MeetingDialog } from './MeetingDialog';
import { OverviewTab } from './OverviewTab';

/**
 * One meeting: its facts, its agenda and minutes, what it decided, what it
 * left for people to do, and the files it produced — five tabs, in the URL.
 *
 * The header carries the meeting's life: schedule a draft, start it, complete
 * it (with its checks), cancel it with a reason, or reopen it.
 */
export function MeetingDetail({
  projectId,
  meetingId,
  tab,
}: {
  projectId: string;
  meetingId: string;
  tab: MeetingDetailTab;
}) {
  const hydrated = useMeetingStore((s) => s.hydrated);
  const meeting = useMeetingStore((s) => s.meetings.find((m) => m.id === meetingId));
  const agenda = useMeetingStore((s) => s.agenda);
  const decisions = useMeetingStore((s) => s.decisions);
  const actions = useMeetingStore((s) => s.actions);
  const files = useMeetingStore((s) => s.files);
  const setStatus = useMeetingStore((s) => s.setMeetingStatus);
  const deleteMeeting = useMeetingStore((s) => s.deleteMeeting);
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');
  const [problem, setProblem] = useState<string[] | null>(null);
  const base = `/p/${projectId}/meetings`;

  if (!hydrated) {
    return (
      <div className="empty" role="status" aria-live="polite">
        <p className="mono-note">Loading the meeting…</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <>
        <div className="hd">
          <Link className="crumb" href={base}>
            Meetings
          </Link>
          <span className="crumb sep">/</span>
          <h1>Not found</h1>
        </div>
        <div className="empty" data-meeting-missing>
          <p className="mono-note">
            No meeting <code>{meetingId}</code> on this program.
          </p>
          <Link className="btn sm" href={base}>
            All meetings
          </Link>
        </div>
      </>
    );
  }

  const counts: Record<MeetingDetailTab, number | null> = {
    overview: null,
    agenda: agenda.filter((a) => a.meetingId === meeting.id).length,
    decisions: decisions.filter((d) => d.meetingId === meeting.id).length,
    actions: actionsOfMeeting(meeting.id, actions).length,
    files: files.filter((f) => f.meetingId === meeting.id).length,
  };
  const go = (status: MeetingStatus, cancelReason?: string) =>
    setStatus(meeting.id, status, cancelReason).then(setProblem);
  const s = meeting.status;

  return (
    <>
      <div className="hd" style={{ height: 'auto', minHeight: 48, flexWrap: 'wrap', paddingTop: 6, paddingBottom: 6 }}>
        <Link className="crumb" href={base}>
          Meetings
        </Link>
        <span className="crumb sep">/</span>
        <h1 className="ell" style={{ maxWidth: '46vw' }}>
          {meeting.title}
        </h1>
        <MeetingStatusPill status={s} />
        <span style={{ flexGrow: 1 }} />
        {s === 'draft' && (
          <>
            <button type="button" className="btn sm dng" data-delete-draft onClick={() => { deleteMeeting(meeting.id); router.push(base); }}>
              Delete draft
            </button>
            <button type="button" className="btn pri sm" data-schedule onClick={() => go('scheduled')}>
              Schedule
            </button>
          </>
        )}
        {s === 'scheduled' && (
          <button type="button" className="btn sm" data-start onClick={() => go('in_progress')}>
            Start meeting
          </button>
        )}
        {(s === 'scheduled' || s === 'in_progress') && (
          <>
            <button type="button" className="btn sm" data-cancel-meeting onClick={() => setCancelling(true)}>
              Cancel meeting
            </button>
            <button type="button" className="btn pri sm" data-complete onClick={() => setCompleting(true)}>
              Complete
            </button>
          </>
        )}
        {s === 'completed' && (
          <button type="button" className="btn sm" data-reopen onClick={() => go('in_progress')}>
            Reopen
          </button>
        )}
        {s === 'cancelled' && (
          <button type="button" className="btn sm" data-reinstate onClick={() => go('scheduled')}>
            Reinstate
          </button>
        )}
        <button type="button" className="btn sm" data-edit-meeting onClick={() => setEditing(true)}>
          Edit
        </button>
      </div>

      <SaveErrorBanner />
      {problem && (
        <div className="mt-banner" role="alert">
          <span style={{ flexGrow: 1 }}>{problem.join(' ')}</span>
          <button type="button" className="btn sm" onClick={() => setProblem(null)}>
            Dismiss
          </button>
        </div>
      )}

      <div style={{ padding: '14px 20px 0' }}>
        <nav className="tabs" aria-label="Meeting">
          {MEETING_DETAIL_TABS.map((t) => (
            <Link
              key={t.slug}
              href={`${base}/${meeting.id}${t.slug === 'overview' ? '' : `?tab=${t.slug}`}`}
              className={t.slug === tab ? 'tab on' : 'tab'}
              aria-current={t.slug === tab ? 'page' : undefined}
              data-meeting-tab={t.slug}
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

      {tab === 'overview' && <OverviewTab meeting={meeting} projectId={projectId} />}
      {tab === 'agenda' && <AgendaTab key={meeting.id} meeting={meeting} projectId={projectId} />}
      {tab === 'decisions' && <DecisionsTab meeting={meeting} projectId={projectId} />}
      {tab === 'actions' && <ActionItemsTab meeting={meeting} projectId={projectId} />}
      {tab === 'files' && <FilesTab meeting={meeting} projectId={projectId} />}

      {editing && <MeetingDialog projectId={projectId} meeting={meeting} onClose={() => setEditing(false)} />}
      {completing && (
        <CompleteDialog
          meeting={meeting}
          onClose={() => setCompleting(false)}
          onGo={(t) => router.push(`${base}/${meeting.id}?tab=${t}`)}
        />
      )}
      {cancelling && (
        <EditorDialog label="Cancel meeting" onClose={() => setCancelling(false)} wide={false}>
          <div style={{ padding: '14px 18px' }}>
            <p className="mono-note">
              A cancelled meeting stays on the record with its agenda. Its open action items keep being tracked.
            </p>
            <label className="dlg-field" style={{ borderBottom: 'none' }}>
              <span className="dlg-label">Reason</span>
              <span className="dlg-control">
                <input className="lnkin" style={{ width: '100%' }} aria-label="Cancellation reason" value={reason} onChange={(e) => setReason(e.target.value)} />
              </span>
            </label>
          </div>
          <div className="dlg-foot">
            <span style={{ flexGrow: 1 }} />
            <button type="button" className="btn sm" onClick={() => setCancelling(false)}>
              Keep it
            </button>
            <button
              type="button"
              className="btn sm dng"
              data-confirm-cancel
              onClick={() => {
                go('cancelled', reason.trim());
                setCancelling(false);
              }}
            >
              Cancel meeting
            </button>
          </div>
        </EditorDialog>
      )}
    </>
  );
}
