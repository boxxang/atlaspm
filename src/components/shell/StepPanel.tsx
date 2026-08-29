'use client';

import { useRef, useState } from 'react';
import { attachmentUrl, formatBytes } from '@/lib/attachments';
import { fmtDate, fromISO, toISO } from '@/lib/schedule';
import { isStepLate, stepKey } from '@/lib/steps';
import { detailActivityTitles, detailDeliverables } from '@/data/activityIndex';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { PostThread } from './PostThread';
import { useActivitySteps } from './useStageSteps';

/**
 * One step, in the rail: how far it has got, who is on it, when it is due, when
 * it was finished, and what it hands over.
 *
 * Everything here writes straight through. A step's percentage, owner and dates
 * are the sort of thing a TPM corrects in passing, and a panel that needed a
 * Save button would collect more abandoned edits than it prevented.
 */
export function StepPanel({ act, n }: { act: string; n: number }) {
  const a = useActivitySteps(act);
  const today = useAppStore((s) => s.today);
  const setStepState = useAppStore((s) => s.setStepState);
  const contacts = useAppStore((s) => s.contacts);
  const deliverables = useAppStore((s) => s.deliverables);
  const leaders = useAppStore((s) => s.leaders);
  /* Closing a step goes back to the activity it is in, not to nothing. The rail
     follows the selection, and the selection above a step is the work it
     belongs to — emptying the rail loses the reader's place. */
  const close = () => useRailStore.setState({ selection: { kind: 'activity', act } });
  const outputs = useAppStore((s) => s.stepOutputs)[stepKey(act, n)] ?? [];
  const posts = useAppStore((s) => s.posts);
  const attachToStep = useAppStore((s) => s.attachToStep);
  const detachFromStep = useAppStore((s) => s.detachFromStep);
  const file = useRef<HTMLInputElement>(null);
  const [problems, setProblems] = useState<string[]>([]);

  const step = a?.steps.find((s) => s.n === n);
  if (!a || !step) return null;

  const late = isStepLate(step, today);
  const onThisStep = posts.filter(
    (p) => p.activityRef === act && p.stepN === n && !p.parentId,
  );
  /* Which key deliverables this step hands over. The release step — the last
     one — is what closes an activity, so it carries the activity's own; the
     steps before it produce outputs, not deliverables. One resolver decides it
     (deliverableStep), so the rail and the link cannot point at different
     steps. */
  const rows = deliverables[a.activity.stageId] ?? [];
  const handsOver =
    n === a.steps.length
      ? a.delivers.map(([ref]) => ({
          ref,
          title: detailDeliverables[ref] ?? ref,
          row: rows.find((d) => d.title === detailDeliverables[ref]) ?? null,
        }))
      : [];
  /* Who can be put on a step: the stage's leader and its contacts, which is the
     same list the Team tab shows. A role is not a person and does not appear. */
  const stageId = a.activity.stageId;
  const people = [leaders[stageId]?.name, ...(contacts[stageId] ?? []).map((c) => c.name)]
    .filter((x): x is string => !!x)
    .filter((x, i, all) => all.indexOf(x) === i);

  return (
    <>
      <div className="peek-hd">
        <span className="ref">{a.ref}</span>
        <span className="cap">
          Step {n} of {a.steps.length}
        </span>
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={close} aria-label="Close details">
          ×
        </button>
      </div>
      <div className="peek-body">
      <h3 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, margin: '0 0 6px' }}>
        {step.text}
      </h3>
      <p style={{ marginBottom: 14 }}>
        {step.done ? (
          <span className="pill ok">Completed</span>
        ) : late ? (
          <span className="pill risk">Overdue</span>
        ) : today >= step.start ? (
          <span className="pill acc">In progress</span>
        ) : (
          <span className="pill">Not started</span>
        )}
      </p>

      <section className="sec-block">
        <div className="sec-cap">
          <span>Progress</span>
          <span className="num">{step.pct}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={step.pct}
          aria-label="Progress"
          disabled={step.done}
          onChange={(e) => setStepState(act, n, { pct: Number(e.target.value) })}
        />
        <p className="mono-note">
          {step.done
            ? 'A completed step is 100% by definition.'
            : 'Record how far this step has got. 100% marks it Completed, the same as attaching an output.'}
        </p>
      </section>

      <section className="sec-block">
        <div className="sec-cap">
          <span>Outputs</span>
          <span className="num">{outputs.length}</span>
          <button
            type="button"
            className="btn sm"
            onClick={() => file.current?.click()}
          >
            + Attach
          </button>
        </div>
        <input
          ref={file}
          type="file"
          multiple
          className="visually-hidden"
          aria-label="Attach an output"
          onChange={async (e) => {
            const picked = e.target.files;
            if (!picked?.length) return;
            setProblems(await attachToStep(act, n, picked));
            /* so picking the same file twice in a row still fires a change */
            e.target.value = '';
          }}
        />
        {outputs.length === 0 ? (
          <p className="mono-note">
            Nothing handed over yet. Attaching an output marks the step Completed.
          </p>
        ) : (
          <ul className="attlist">
            {outputs.map((o) => (
              <li key={o.id}>
                <a href={attachmentUrl(o.id)} target="_blank" rel="noreferrer">
                  {o.filename}
                </a>
                <span className="mono-note">{formatBytes(o.size)}</span>
                <button
                  type="button"
                  className="btn sm"
                  aria-label={`Remove ${o.filename}`}
                  onClick={() => detachFromStep(act, n, o.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {problems.map((p) => (
          <p className="mono-note late" key={p}>
            {p}
          </p>
        ))}
      </section>

      {handsOver.length > 0 && (
        <section className="sec-block">
          <div className="sec-cap">
            <span>Hands over</span>
            <span className="num">
              {handsOver.filter((h) => h.row?.done).length}/{handsOver.length}
            </span>
          </div>
          <ul className="attlist">
            {handsOver.map((h) => (
              <li key={h.ref}>
                <span className="ref">{h.ref}</span>
                <span className="listtitle">{h.title}</span>
                {h.row?.due && (
                  <span
                    className={
                      /* A key deliverable past its date with nothing handed over
                         is Delayed, and the date is where you see it. */
                      !h.row.done && h.row.due < today ? 'mono-note late' : 'mono-note'
                    }
                  >
                    due {fmtDate(h.row.due)}
                    {!h.row.done && h.row.due < today ? ' · delayed' : ''}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <dl className="props">
        <dt>Activity</dt>
        <dd>{detailActivityTitles[act] ?? act}</dd>

        <dt>Owner</dt>
        <dd>
          <select
            value={step.owner}
            aria-label="Owner"
            onChange={(e) => setStepState(act, n, { owner: e.target.value })}
          >
            <option value="">Unassigned</option>
            {people.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </dd>

        <dt>Lead role</dt>
        <dd>{a.activity.role || '—'}</dd>

        <dt>Due</dt>
        <dd>
          <input
            type="date"
            className={late ? 'late' : undefined}
            value={toISO(step.due)}
            aria-label="Due"
            onChange={(e) =>
              /* Clearing the field puts the step back on the schedule's own date
                 rather than leaving it with none. */
              setStepState(act, n, {
                dueOverride: e.target.value ? fromISO(e.target.value) : null,
              })
            }
          />
          {step.dueSet && <span className="pill">edited</span>}
          {late && <span className="pill risk" style={{ fontSize: 10.5 }}>overdue</span>}
        </dd>

        <dt>Completed</dt>
        <dd>
          <input
            type="date"
            value={step.doneAt ? toISO(step.doneAt) : ''}
            aria-label="Completed"
            onChange={(e) => {
              const at = e.target.value ? fromISO(e.target.value) : null;
              /* The date and the tick are one fact: a step with a completion
                 date is complete, and clearing it reopens the step. */
              setStepState(act, n, { doneAt: at, done: !!at });
            }}
          />
        </dd>

        <dt>TAT</dt>
        <dd>{step.tat} weeks</dd>

        <dt>Planned</dt>
        <dd>
          {fmtDate(step.start)} → {fmtDate(step.end)}
        </dd>
      </dl>

      <section className="sec-block">
        <div className="sec-cap">
          <span>Updates on this step</span>
          <span className="num">{onThisStep.length}</span>
        </div>
        <PostThread
          posts={onThisStep}
          target={{ kind: 'update', activityRef: act, stepN: n }}
          placeholder={`What happened on step ${n}?`}
          allowRisk
          emptyText="No updates on this step yet."
        />
      </section>

      </div>
      <div className="peek-foot">
        <button
          type="button"
          className="btn pri"
          onClick={() =>
            setStepState(act, n, {
              done: !step.done,
              doneAt: step.done ? null : new Date(),
              pct: step.done ? 0 : 100,
            })
          }
        >
          {step.done ? 'Reopen step' : 'Mark complete'}
        </button>
      </div>
    </>
  );
}
