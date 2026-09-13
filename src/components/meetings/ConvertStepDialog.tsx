'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { appendStepPreview } from '@/lib/meetings/convert';
import { parseStepRef } from '@/lib/meetings/links';
import type { ActionItem } from '@/lib/meetings/types';
import { fmtDate } from '@/lib/schedule';
import { fromStepIndex } from '@/lib/steps';
import { useMeetingStore } from '@/store/meetingStore';
import { useAppStore } from '@/store/useAppStore';
import { useProgramActivities, useProgramActivityTitles } from '../shell/useProgramActivities';
import { EditorDialog } from './EditorDialog';
import { Field } from './atoms';

/**
 * Turn an action into a new step on its activity.
 *
 * The one place a meeting changes the plan, so it asks first and says what it
 * will do: which activity grows a step, the new step's planned dates, how far
 * the activity's planned end moves, and — when the programme shares its plan
 * with a template — that the programme gets its own copy and the template is
 * left alone. Nothing is converted until the box saying so is ticked.
 */
export function ConvertStepDialog({
  action,
  projectId,
  onClose,
}: {
  action: ActionItem;
  projectId: string;
  onClose: () => void;
}) {
  const convert = useMeetingStore((s) => s.convertActionToStep);
  const schedule = useAppStore((s) => s.schedule);
  const profile = useAppStore((s) => s.profile);
  const projectName = useAppStore((s) => s.projectName);
  const activities = useProgramActivities();
  const titles = useProgramActivityTitles();

  /* the activities this action is already about come first */
  const linked = [
    ...new Set(
      action.links
        .map((l) => (l.type === 'activity' ? l.ref : l.type === 'step' ? parseStepRef(l.ref)?.act : undefined))
        .filter((x): x is string => !!x && !!activities[x]),
    ),
  ];
  const others = Object.keys(activities).filter((r) => !linked.includes(r) && schedule.stages[activities[r].st]);
  const [act, setAct] = useState(linked[0] ?? '');
  const [text, setText] = useState(action.description);
  const [tat, setTat] = useState('1');
  const [sure, setSure] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const weeks = Number(tat);
  const preview = useMemo(() => {
    const entry = activities[act];
    const span = entry ? schedule.stages[entry.st] : undefined;
    if (!entry || !span || !(weeks > 0)) return null;
    return appendStepPreview(span.start, fromStepIndex(act, entry), weeks, text);
  }, [act, activities, schedule, weeks, text]);
  const shared = profile.builtin || profile.template;
  const valid = !!preview && !!text.trim() && weeks >= 1 / 7 && weeks <= 52;

  return (
    <EditorDialog label="Convert to a new step" onClose={onClose}>
      <div style={{ padding: '4px 18px 8px' }} data-convert-dialog>
        <Field label="Activity" hint="The activity the new step is added to." required>
          <select className="lnkin" aria-label="Activity" value={act} onChange={(e) => { setAct(e.target.value); setSure(false); }}>
            <option value="">Pick an activity</option>
            {linked.length > 0 && (
              <optgroup label="Linked to this action">
                {linked.map((r) => (
                  <option key={r} value={r}>
                    {r} · {titles[r] ?? r}
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label="Every activity on the program">
              {others.map((r) => (
                <option key={r} value={r}>
                  {r} · {titles[r] ?? r}
                </option>
              ))}
            </optgroup>
          </select>
        </Field>
        <Field label="The new step" required>
          <textarea className="mt-text" aria-label="New step" value={text} onChange={(e) => { setText(e.target.value); setSure(false); }} />
        </Field>
        <Field label="How long it takes" hint="In weeks. Half a week is 0.5." required>
          <input className="dateinp" type="number" min={0.25} max={52} step={0.25} style={{ width: 90 }} aria-label="Weeks" value={tat} onChange={(e) => { setTat(e.target.value); setSure(false); }} />
        </Field>

        {preview && (
          <div className="card" style={{ padding: '12px 14px', margin: '8px 0', boxShadow: 'none' }} data-convert-preview>
            <div className="cap" style={{ marginBottom: 6 }}>What this does to the plan</div>
            <p className="mono-note">
              Adds <b>step {preview.n}</b> to <b>{act}</b>, planned {fmtDate(preview.start)} → {fmtDate(preview.end)}, after its
              last step.
            </p>
            <p className="mono-note" style={{ marginTop: 4 }}>
              {preview.addedDays > 0 ? (
                <>
                  {act}&rsquo;s planned end moves from <b>{fmtDate(preview.previousEnd)}</b> to <b>{fmtDate(preview.newEnd)}</b> —{' '}
                  {preview.addedDays} day{preview.addedDays === 1 ? '' : 's'} later. Its effort grows by the step&rsquo;s time. No stage
                  date or milestone is moved by this.
                </>
              ) : (
                <>{act}&rsquo;s planned end does not move: another step already runs past this one.</>
              )}
            </p>
            {shared && (
              <p className="mono-note" style={{ marginTop: 4 }}>
                {projectName} runs on the <b>{profile.label}</b> template. The step is added to {projectName} only: it gets its own copy of the
                plan first, and the template is not changed.
              </p>
            )}
            <p className="mono-note" style={{ marginTop: 4 }}>
              The action stays open and keeps a reference to the step. Finishing either does not finish the other.
            </p>
            <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 10, fontSize: 12.5 }}>
              <input type="checkbox" checked={sure} onChange={(e) => setSure(e.target.checked)} aria-label="Confirm the change to the plan" />
              <span>I have checked this with the activity&rsquo;s owner and want to add the step.</span>
            </label>
          </div>
        )}
        {act && (
          <p className="mono-note" style={{ marginBottom: 8 }}>
            <Link href={`/p/${projectId}/stage/${activities[act]?.st}/activity?act=${act}`} target="_blank">
              Open {act} in a new tab
            </Link>
          </p>
        )}
      </div>
      <div className="dlg-foot">
        {error && (
          <span role="alert" style={{ fontSize: 12, color: 'var(--risk)' }}>
            {error}
          </span>
        )}
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn pri sm"
          data-confirm-convert
          disabled={!valid || !sure || pending}
          onClick={async () => {
            setPending(true);
            const problem = await convert(action.id, act, text.trim(), weeks);
            setPending(false);
            if (problem) setError(problem);
            else onClose();
          }}
        >
          {pending ? 'Adding the step…' : 'Add the step'}
        </button>
      </div>
    </EditorDialog>
  );
}
