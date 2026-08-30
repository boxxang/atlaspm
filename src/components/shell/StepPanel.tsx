'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { attachmentUrl, formatBytes } from '@/lib/attachments';
import { fmtDate, fmtDT, fromISO, toISO } from '@/lib/schedule';
import { isStepLate, stepKey } from '@/lib/steps';
import { detailActivityTitles } from '@/data/activityIndex';
import { RISK_AUTHOR } from '@/data/riskSeeds';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { DeliverableLines } from './DeliverableLines';
import { Avatar, IconFile, IconPlus, IconTick } from './icons';
import { PostThread } from './PostThread';
import { useDeliverableRefs } from './useDeliverableRefs';
import { useActivitySteps } from './useStageSteps';
import { useProgramWork } from './useProgramWork';

/**
 * One step, in the rail: how far it has got, who is on it, when it is due, when
 * it was finished, and what it hands over.
 *
 * The order is the prototype's, and the order is the argument: the two things
 * people came to change — the percentage and the outputs — sit above the facts
 * of the step, and the thread sits under both.
 *
 * Everything here writes straight through. A step's percentage, owner and dates
 * are the sort of thing a TPM corrects in passing, and a panel that needed a
 * Save button would collect more abandoned edits than it prevented.
 */
export function StepPanel({ act, n, projectId }: { act: string; n: number; projectId: string }) {
  const a = useActivitySteps(act);
  const today = useAppStore((s) => s.today);
  const setStepState = useAppStore((s) => s.setStepState);
  const contacts = useAppStore((s) => s.contacts);
  const deliverables = useAppStore((s) => s.deliverables);
  const leaders = useAppStore((s) => s.leaders);
  const select = useRailStore((s) => s.select);
  /* Closing a step goes back to the activity it is in, not to nothing. The rail
     follows the selection, and the selection above a step is the work it
     belongs to — emptying the rail loses the reader's place. */
  const close = () => useRailStore.setState({ selection: { kind: 'activity', act } });
  const outputs = useAppStore((s) => s.stepOutputs)[stepKey(act, n)] ?? [];
  const posts = useAppStore((s) => s.posts);
  const attachToStep = useAppStore((s) => s.attachToStep);
  const detachFromStep = useAppStore((s) => s.detachFromStep);
  const { risks } = useProgramWork();
  const refOf = useDeliverableRefs();
  const file = useRef<HTMLInputElement>(null);
  const [problems, setProblems] = useState<string[]>([]);
  /* The three fields the panel lets you change, held as a draft while Edit is
     open so Cancel means something. Keyed on the step below, so moving to
     another step closes the editor rather than carrying the draft to it. */
  const [draft, setDraft] = useState<Facts | null>(null);

  const step = a?.steps.find((s) => s.n === n);
  if (!a || !step) return null;

  const late = isStepLate(step, today);
  const risky = risks.some((r) => r.act === act && r.stepN === n);
  const onThisStep = posts.filter((p) => p.activityRef === act && p.stepN === n && !p.parentId);
  /* Which key deliverables this step hands over. The release step — the last
     one — is what closes an activity, so it carries the activity's own; the
     steps before it produce outputs, not deliverables. */
  const rows = deliverables[a.activity.stageId] ?? [];
  const mine = new Set(a.delivers.map(([ref]) => ref));
  const handsOver = n === a.steps.length ? rows.filter((d) => mine.has(refOf.get(d.id) ?? '')) : [];
  const firstRef = a.delivers[0]?.[0] ?? null;
  /* Who can be put on a step: the stage's leader and its contacts, which is the
     same list the Team tab shows. A role is not a person and does not appear. */
  const stageId = a.activity.stageId;
  const people = [leaders[stageId]?.name, ...(contacts[stageId] ?? []).map((c) => c.name)]
    .filter((x): x is string => !!x)
    .filter((x, i, all) => all.indexOf(x) === i);

  const editingFacts = draft !== null;
  const shownOwner = editingFacts ? draft.owner : step.owner;
  const startFacts = () =>
    setDraft({
      owner: step.owner,
      due: toISO(step.due),
      doneAt: step.doneAt ? toISO(step.doneAt) : '',
    });
  const cancelFacts = () => setDraft(null);
  const saveFacts = () => {
    if (!draft) return;
    const at = draft.doneAt ? fromISO(draft.doneAt) : null;
    setStepState(act, n, {
      owner: draft.owner,
      /* Clearing the date puts the step back on the schedule's own, and the
         completion date and the tick are one fact: a step with a date is
         complete, and clearing it reopens the step. */
      dueOverride: draft.due ? fromISO(draft.due) : null,
      doneAt: at,
      done: !!at,
    });
    setDraft(null);
  };

  return (
    <>
      <div className="peek-hd">
        <span className="ref">{a.ref}</span>
        <b style={{ fontSize: 12.5 }}>
          Step {n} of {a.steps.length}
        </b>
        {step.par && (
          <span className="pill" style={{ fontSize: 10.5 }}>
            Parallel
          </span>
        )}
        {risky && (
          <span className="pill risk" style={{ fontSize: 10.5 }}>
            Risk
          </span>
        )}
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={close} aria-label="Close details">
          ✕
        </button>
      </div>

      <div className="peek-body">
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            lineHeight: 1.4,
            marginBottom: 11,
            letterSpacing: '-.015em',
            textWrap: 'balance',
          }}
        >
          {step.text}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 13 }}>
          {step.done ? (
            <span className="pill ok" style={{ fontSize: 10.5 }}>
              Completed
            </span>
          ) : late ? (
            <span className="pill risk" style={{ fontSize: 10.5 }}>
              Overdue
            </span>
          ) : today >= step.start ? (
            <span className="pill acc" style={{ fontSize: 10.5 }}>
              In progress
            </span>
          ) : (
            <span className="pill" style={{ fontSize: 10.5 }}>
              Not started
            </span>
          )}
          {n === a.steps.length && firstRef && (
            <span className="pill acc" style={{ fontSize: 10.5 }}>
              TICKS {firstRef}
            </span>
          )}
        </div>

        {/* progress — the number, the bar, and the handle that sets it */}
        <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 13 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 9 }}>
            <span className="cap">Progress</span>
            <span style={{ flexGrow: 1 }} />
            <b
              className="num"
              style={{
                fontSize: 18,
                letterSpacing: '-.02em',
                color: step.pct ? 'var(--ink)' : 'var(--ink-4)',
              }}
            >
              {step.pct}%
            </b>
          </div>
          <input
            className="rng"
            type="range"
            min={0}
            max={100}
            step={5}
            value={step.pct}
            aria-label="Percent complete"
            style={{ background: rangeFill(step.pct, step.done) }}
            onChange={(e) => setStepState(act, n, { pct: Number(e.target.value) })}
          />
          <p className="mono-note" style={{ marginTop: 7 }}>
            Drag to record how far this step has got. 100% marks it Completed, the same as
            attaching an output.
          </p>
        </div>

        {/* what has actually been handed over */}
        <div style={{ borderTop: '1px solid var(--line-soft)', marginTop: 15, paddingTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="cap">Outputs</span>
            <span className="pill" style={{ fontSize: 10.5 }}>
              {outputs.length}
            </span>
            <span style={{ flexGrow: 1 }} />
            <button type="button" className="btn sm" onClick={() => file.current?.click()}>
              <IconPlus size={11} />
              Attach
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
              Nothing attached yet. Attaching an output marks this step Completed.
            </p>
          ) : (
            outputs.map((o) => (
              <div className="att" key={o.id}>
                <span className="ic">
                  <IconFile />
                </span>
                <span style={{ flexGrow: 1, minWidth: 0 }}>
                  <a
                    className="ell"
                    style={{ display: 'block', fontSize: 12.5, fontWeight: 500 }}
                    href={attachmentUrl(o.id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {o.filename}
                  </a>
                  <span
                    className="num"
                    style={{ fontSize: 11, color: 'var(--ink-4)', display: 'block', marginTop: 2 }}
                  >
                    File · {formatBytes(o.size)} · {RISK_AUTHOR}
                    {step.doneAt ? ` · ${fmtDT(step.doneAt)}` : ''}
                  </span>
                </span>
                <button
                  type="button"
                  className="x"
                  title="Remove"
                  aria-label={`Remove ${o.filename}`}
                  onClick={() => detachFromStep(act, n, o.id)}
                >
                  ✕
                </button>
              </div>
            ))
          )}
          {problems.map((p) => (
            <p className="mono-note late" key={p}>
              {p}
            </p>
          ))}
        </div>

        {/* on most steps there are none, and then this says nothing rather than
            saying nothing at length */}
        {handsOver.length > 0 && (
          <DeliverableLines
            title="Key deliverables"
            list={handsOver}
            stageId={stageId}
            projectId={projectId}
            empty=""
          />
        )}

        {/* The facts of the step, kept below the two things people came to
            change. Read-only until Edit: the prototype leaves owner and both
            dates live, which is fine for a TPM correcting one in passing and
            not fine for everybody else reading the panel — a select and two
            date fields sitting open look like a form waiting to be filled in,
            and one stray click changes a date nobody meant to touch. */}
        <div style={{ borderTop: '1px solid var(--line-soft)', marginTop: 15, paddingTop: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
            <span className="cap">Details</span>
            <span style={{ flexGrow: 1 }} />
            {editingFacts ? (
              <>
                <button type="button" className="btn sm" onClick={cancelFacts}>
                  Cancel
                </button>
                <button type="button" className="btn pri sm" onClick={saveFacts}>
                  Save
                </button>
              </>
            ) : (
              <button type="button" className="btn sm" data-edit-facts onClick={startFacts}>
                Edit
              </button>
            )}
          </div>

          <div className="prop">
            <span className="pk">Activity</span>
            <button
              type="button"
              className="ell"
              style={{
                justifySelf: 'start',
                fontSize: 12.5,
                color: 'var(--accent)',
                fontWeight: 550,
                maxWidth: '100%',
              }}
              title={detailActivityTitles[act] ?? act}
              onClick={() => select({ kind: 'activity', act })}
            >
              {detailActivityTitles[act] ?? act}
            </button>
          </div>

          <div className="prop">
            <span className="pk">Owner</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
              {shownOwner && <Avatar name={shownOwner} small />}
              {editingFacts ? (
                <select
                  className="lnkin"
                  value={draft.owner}
                  aria-label="Owner"
                  onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {people.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className="ell"
                  style={{ fontSize: 13, color: shownOwner ? undefined : 'var(--ink-4)' }}
                >
                  {shownOwner || 'Unassigned'}
                </span>
              )}
            </span>
          </div>

          <div className="prop">
            <span className="pk">Lead role</span>
            <span className="ell" style={{ fontSize: 13 }}>
              {a.activity.role || '—'}
            </span>
          </div>

          {/* Both dates stay correctable after the fact — the upload sets the
              completion date, and someone can still put it right when the file
              went up a day late. */}
          <div className="prop">
            <span className="pk">Due</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
              {editingFacts ? (
                <input
                  type="date"
                  className={late ? 'dateinp late' : 'dateinp'}
                  value={draft.due}
                  aria-label="Due"
                  /* Clearing the field puts the step back on the schedule's own
                     date rather than leaving it with none. */
                  onChange={(e) => setDraft({ ...draft, due: e.target.value })}
                />
              ) : (
                <span
                  className="num"
                  style={{
                    fontSize: 13,
                    color: late ? 'var(--risk)' : undefined,
                    fontWeight: late ? 600 : 400,
                  }}
                >
                  {fmtDate(step.due)}
                </span>
              )}
              {late && (
                <span className="pill risk" style={{ fontSize: 10 }}>
                  overdue
                </span>
              )}
              {editingFacts && step.dueSet && (
                <button
                  type="button"
                  style={{ fontSize: 11, color: 'var(--accent)', whiteSpace: 'nowrap' }}
                  title="back to the schedule baseline"
                  onClick={() => setDraft({ ...draft, due: '' })}
                >
                  reset
                </button>
              )}
            </span>
          </div>

          <div className="prop">
            <span className="pk">Completed</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
              {editingFacts ? (
                <input
                  type="date"
                  className="dateinp"
                  value={draft.doneAt}
                  aria-label="Completed"
                  onChange={(e) => setDraft({ ...draft, doneAt: e.target.value })}
                />
              ) : (
                <span className="num" style={{ fontSize: 13 }}>
                  {step.doneAt ? fmtDate(step.doneAt) : '—'}
                </span>
              )}
              {!step.doneAt && !editingFacts && (
                <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                  set when an output is attached
                </span>
              )}
            </span>
          </div>

          <div className="prop">
            <span className="pk">TAT</span>
            <span className="num" style={{ fontSize: 13 }}>
              {step.tat} week{step.tat === 1 ? '' : 's'}
            </span>
          </div>

          {a.outputs.get(n) && a.outputs.get(n)!.length > 0 && (
            <div className="prop" style={{ alignItems: 'start' }}>
              <span className="pk" style={{ paddingTop: 2 }}>
                Hands over
              </span>
              <span style={{ fontSize: 12.5, lineHeight: 1.45, color: 'var(--ink-body)' }}>
                {a.outputs.get(n)!.join(' · ')}
              </span>
            </div>
          )}
        </div>

        {/* the thread, filtered to this step */}
        <div style={{ borderTop: '1px solid var(--line-soft)', marginTop: 15, paddingTop: 13 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 13 }}>
            <span className="cap">Updates on this step</span>
            <span className="pill" style={{ fontSize: 10.5 }}>
              {onThisStep.length}
            </span>
          </div>
          <PostThread
            posts={onThisStep}
            target={{ kind: 'update', activityRef: act, stepN: n }}
            placeholder={`What happened on step ${n}…`}
            fixedStep={n}
            squareBar
            allowRisk
            emptyText="No updates on this step yet."
          />
        </div>
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
          {!step.done && <IconTick size={11} />}
          {step.done ? 'Reopen step' : 'Mark complete'}
        </button>
        {step.done && (
          <span className="num" style={{ fontSize: 11.5, color: 'var(--ok)', fontWeight: 600 }}>
            Completed
          </span>
        )}
        <span style={{ flexGrow: 1 }} />
        <Link className="btn sm" href={`/p/${projectId}/activity/${act}`}>
          Read {act} →
        </Link>
      </div>
    </>
  );
}

/**
 * The filled part of the range track, painted rather than left grey: a slider
 * whose left side is not coloured reads as unset, whatever number is beside it.
 */
/** What Edit opens: the three things about a step somebody corrects by hand. */
interface Facts {
  owner: string;
  /** yyyy-mm-dd, as the date inputs carry it; empty means "the plan's own". */
  due: string;
  doneAt: string;
}

const rangeFill = (pct: number, done: boolean) => {
  const c = done ? 'var(--ok)' : 'var(--accent)';
  return `linear-gradient(to right,${c} 0%,${c} ${pct}%,var(--muted) ${pct}%,var(--muted) 100%)`;
};
