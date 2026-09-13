'use client';

import { useState } from 'react';
import { canComplete, completionChecks } from '@/lib/meetings/completion';
import type { Meeting } from '@/lib/meetings/types';
import { useMeetingStore } from '@/store/meetingStore';
import { EditorDialog } from './EditorDialog';

/**
 * Completing a meeting: the checks, said plainly, before it closes.
 *
 * Under the default mode a failing check is a warning and the meeting can
 * still be completed; under a programme that requires them, the button stays
 * off until they pass. The server runs the same checks again, so the verdict
 * cannot be skipped by a stale screen.
 */
export function CompleteDialog({ meeting, onClose, onGo }: { meeting: Meeting; onClose: () => void; onGo: (tab: string) => void }) {
  const agenda = useMeetingStore((s) => s.agenda);
  const decisions = useMeetingStore((s) => s.decisions);
  const actions = useMeetingStore((s) => s.actions);
  const mode = useMeetingStore((s) => s.completionMode);
  const setStatus = useMeetingStore((s) => s.setMeetingStatus);
  const [pending, setPending] = useState(false);
  const [refused, setRefused] = useState<string[] | null>(null);

  const checks = completionChecks({ meeting, agenda, decisions, actions });
  const verdict = canComplete(checks, mode);
  const where: Record<string, string> = {
    minutes: 'agenda',
    decisions: 'decisions',
    owners: 'actions',
    dueDates: 'actions',
    deferred: 'agenda',
  };

  return (
    <EditorDialog label="Complete meeting" onClose={onClose} wide={false}>
      <div style={{ padding: '14px 18px' }} data-complete-dialog>
        <div className="mt-checks" role="list" aria-label="Completion checks">
          {checks.map((c) => (
            <div key={c.key} className={c.ok ? 'mt-check ok' : 'mt-check bad'} role="listitem" data-check={c.key} data-ok={c.ok ? '' : undefined}>
              <span className="mk" aria-hidden="true">
                {c.ok ? '✓' : '!'}
              </span>
              <span style={{ flexGrow: 1 }}>
                <b style={{ fontWeight: 600 }}>{c.label}.</b> {c.message}
              </span>
              {!c.ok && (
                <button
                  type="button"
                  className="btn sm"
                  onClick={() => {
                    onClose();
                    onGo(where[c.key]);
                  }}
                >
                  Fix
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="mono-note" style={{ marginTop: 12 }} data-completion-mode={mode}>
          {verdict.failing.length === 0
            ? 'Everything is in place.'
            : mode === 'block'
              ? 'This program requires every check to pass before a meeting can be completed.'
              : 'These are warnings. The meeting can still be completed, and anything open keeps being tracked.'}
        </p>
        <p className="mono-note" style={{ marginTop: 6 }}>
          Completing the meeting closes no risk, approves no deliverable and completes no step.
        </p>
        {refused && (
          <div className="delconf" role="alert" style={{ marginTop: 10 }}>
            Not completed: {refused.join(' ')}
          </div>
        )}
      </div>
      <div className="dlg-foot">
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn pri sm"
          data-confirm-complete
          disabled={!verdict.allowed || pending}
          onClick={async () => {
            setPending(true);
            const res = await setStatus(meeting.id, 'completed');
            setPending(false);
            if (res) setRefused(res);
            else onClose();
          }}
        >
          {verdict.failing.length ? 'Complete anyway' : 'Complete meeting'}
        </button>
      </div>
    </EditorDialog>
  );
}
