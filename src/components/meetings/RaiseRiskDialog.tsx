'use client';

import Link from 'next/link';
import { useState } from 'react';
import { parseStepRef } from '@/lib/meetings/links';
import type { LinkRef, Meeting } from '@/lib/meetings/types';
import { useMeetingStore } from '@/store/meetingStore';
import { useAppStore } from '@/store/useAppStore';
import { useProgramActivities, useProgramActivityTitles } from '../shell/useProgramActivities';
import { useProgramWork } from '../shell/useProgramWork';
import { EditorDialog } from './EditorDialog';
import { Field } from './atoms';

/**
 * Raise a risk found in a meeting, through the app's own risk flow.
 *
 * A risk in AtlasPM is a flag on a step: it is posted on the step's thread,
 * counted by the nav and the boards, and closes when that step is handed over.
 * A risk raised here is exactly that, with the meeting recorded as where it
 * came from. Completing or cancelling the meeting does nothing to it.
 */
export function RaiseRiskDialog({
  meeting,
  projectId,
  links,
  defaultText = '',
  onClose,
}: {
  meeting: Meeting;
  projectId: string;
  /** What the meeting or agenda item is about — its steps are offered first. */
  links: readonly LinkRef[];
  defaultText?: string;
  onClose: () => void;
}) {
  const raise = useMeetingStore((s) => s.raiseRisk);
  const stages = useAppStore((s) => s.stages);
  const activities = useProgramActivities();
  const titles = useProgramActivityTitles();
  const { steps } = useProgramWork();

  const linkedActs = [
    ...new Set(
      links
        .map((l) => (l.type === 'activity' ? l.ref : l.type === 'step' ? parseStepRef(l.ref)?.act : undefined))
        .filter((x): x is string => !!x && !!activities[x]),
    ),
  ];
  const firstStep = links.map((l) => (l.type === 'step' ? parseStepRef(l.ref) : null)).find(Boolean);
  const [act, setAct] = useState(firstStep?.act ?? linkedActs[0] ?? '');
  const [n, setN] = useState(firstStep ? String(firstStep.n) : '');
  const [text, setText] = useState(defaultText);
  const [raised, setRaised] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const stepsOf = steps.filter((s) => s.act === act);
  /* Until somebody picks, the first step not yet handed over: a risk on a step
     that is already done is closed the moment it is raised. */
  const step = n || String(stepsOf.find((s) => !s.done)?.n ?? '');
  const stageOf = act ? activities[act]?.st : undefined;
  const otherActs = Object.keys(activities).filter((r) => !linkedActs.includes(r) && stages.some((s) => s.id === activities[r].st));

  if (raised && stageOf) {
    return (
      <EditorDialog label="Risk raised" onClose={onClose} wide={false}>
        <div style={{ padding: '14px 18px' }} data-risk-raised>
          <p className="mono-note">
            The risk is on {act} step {n}. It is counted with the program&rsquo;s other risks and stays open until that step is handed over.
          </p>
          <p style={{ marginTop: 10 }}>
            <Link className="btn sm" href={`/p/${projectId}/stage/${stageOf}/activity?step=${act}:${n}&post=${raised}`}>
              Open the step
            </Link>
          </p>
        </div>
        <div className="dlg-foot">
          <span style={{ flexGrow: 1 }} />
          <button type="button" className="btn pri sm" onClick={onClose}>
            Done
          </button>
        </div>
      </EditorDialog>
    );
  }

  return (
    <EditorDialog label="Raise a risk" onClose={onClose}>
      <div style={{ padding: '4px 18px 8px' }} data-raise-risk>
        <p className="mono-note" style={{ padding: '10px 0 4px' }}>
          A risk is raised on the step it threatens, the same way as from the step&rsquo;s own thread. It records this meeting as its
          source and closes when the step is handed over — not when this meeting is completed.
        </p>
        <Field label="Activity" required>
          <select className="lnkin" aria-label="Risk activity" value={act} onChange={(e) => { setAct(e.target.value); setN(''); }}>
            <option value="">Pick an activity</option>
            {linkedActs.length > 0 && (
              <optgroup label="What this meeting is about">
                {linkedActs.map((r) => (
                  <option key={r} value={r}>
                    {r} · {titles[r] ?? r}
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label="Every activity on the program">
              {otherActs.map((r) => (
                <option key={r} value={r}>
                  {r} · {titles[r] ?? r}
                </option>
              ))}
            </optgroup>
          </select>
        </Field>
        <Field label="Step" required>
          <select className="lnkin" aria-label="Risk step" value={step} disabled={!act} onChange={(e) => setN(e.target.value)}>
            <option value="">Pick a step</option>
            {stepsOf.map((s) => (
              <option key={s.n} value={s.n}>
                Step {s.n} · {s.text.slice(0, 70)}
                {s.done ? ' (handed over)' : ''}
              </option>
            ))}
          </select>
        </Field>
        <Field label="The risk" hint="What is wrong, and what it costs if it stays wrong." required>
          <textarea className="mt-text" aria-label="Risk text" value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
      </div>
      <div className="dlg-foot">
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn pri sm"
          data-confirm-risk
          disabled={!act || !step || !text.trim() || pending}
          onClick={async () => {
            setPending(true);
            setN(step);
            setRaised(await raise(meeting.id, act, Number(step), text.trim()));
            setPending(false);
          }}
        >
          Raise risk
        </button>
      </div>
    </EditorDialog>
  );
}
