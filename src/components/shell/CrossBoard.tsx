'use client';

import Link from 'next/link';
import { useState } from 'react';
import { fmtDate, fmtDT } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { Avatar } from './icons';
import { ctVar, CTHead, type Col } from './ctable';
import { useProgramWork } from './useProgramWork';
import { useStageSteps } from './useStageSteps';

/**
 * Risks and Overdue: one board, two readings of the same two numbers.
 *
 * Both lists are read by the date the step was due and how far past it we are.
 * A risk carries no date of its own — the one that matters belongs to the step
 * it was flagged against — so the two screens differ only in what fills the
 * middle column and who the last one names.
 *
 * No stage grouping. The activity tag on every row already names the stage, and
 * grouping cut the list into six blocks with six orderings, which hid the one
 * thing worth reading across the whole programme: what is furthest past due.
 */
type Kind = 'risks' | 'overdue';

const FILTERS: Record<Kind, [key: string, label: string][]> = {
  risks: [
    ['all', 'All'],
    ['mto', 'On stages before tapeout'],
    ['stale', 'No update in 7 days'],
  ],
  overdue: [
    ['all', 'All'],
    ['mto', 'On stages before tapeout'],
    ['stale', 'Over two weeks late'],
  ],
};

interface Row {
  key: string;
  act: string;
  stepN: number | null;
  stageId: string;
  title: string;
  /** The step's own text, shown under a risk so the sentence has a subject. */
  stepText: string;
  who: string;
  due: Date | null;
  late: number;
  status: 'done' | 'run' | 'future';
  quiet: number;
}

export function CrossBoard({ kind, projectId }: { kind: Kind; projectId: string }) {
  const { overdue, risks } = useProgramWork();
  const schedule = useAppStore((s) => s.schedule);
  const stages = useAppStore((s) => s.stages);
  const posts = useAppStore((s) => s.posts);
  const today = useAppStore((s) => s.today);
  const [filter, setFilter] = useState('all');

  const stepsOf = useAllSteps();
  const days = (d: Date) => Math.max(0, Math.round((today.getTime() - d.getTime()) / 864e5));

  const all: Row[] = (kind === 'risks' ? risks : overdue).map((i) => {
    const isRisk = 'postId' in i;
    const act = i.act;
    const stepN = isRisk ? (i as (typeof risks)[number]).stepN : (i as (typeof overdue)[number]).stepN;
    const step = stepN == null ? undefined : stepsOf.get(`${act}:${stepN}`);
    const due = step?.due ?? null;
    const late = due && !step?.done && due < today ? days(due) : 0;
    return {
      key: isRisk ? (i as (typeof risks)[number]).id : (i as (typeof overdue)[number]).id,
      act,
      stepN,
      stageId: i.stageId,
      title: i.title,
      stepText: step?.text ?? '',
      who: isRisk
        ? (i as (typeof risks)[number]).owner
        : (i as (typeof overdue)[number]).owner,
      due,
      late,
      /* Whether the work has started, not whether it is late — every row on
         the Overdue board is late by definition, and a column that repeats the
         filter says nothing. Lateness is carried by the red date and LATE BY;
         this says whether anybody has picked the step up. */
      status: !step
        ? 'future'
        : step.done
          ? 'done'
          : step.pct > 0 || today >= step.start
            ? 'run'
            : 'future',
      quiet: isRisk ? days((i as (typeof risks)[number]).updatedAt) : 0,
    };
  });

  /* A stage that closes before tapeout, which is what "blocks the mask order"
     actually means — a property of the stage, not of the row. */
  const blocksMto = (stageId: string) => {
    const mto = schedule.tapeout;
    /* No tapeout, nothing to block: the filter answers nobody rather than
       silently meaning "before the program ends". */
    if (!mto) return false;
    const end = schedule.stages[stageId]?.end;
    return !!end && end <= mto && end >= today;
  };
  const passes = (r: Row) =>
    filter === 'mto'
      ? blocksMto(r.stageId)
      : filter === 'stale'
        ? kind === 'risks'
          ? r.quiet > 7
          : r.late > 14
        : true;

  const rows = all
    .filter(passes)
    .sort((a, b) => b.late - a.late || (a.due?.getTime() ?? Infinity) - (b.due?.getTime() ?? Infinity));

  const COLS: Col[] = [
    ['ref', 84, 'ACTIVITY'],
    ['n', 54, 'STEP'],
    ['title', null, kind === 'risks' ? 'RISK' : 'WHAT IS LATE'],
    ['status', 104, 'STATUS'],
    ['due', 86, 'DUE'],
    ['late', 88, 'LATE BY'],
    ['by', 168, kind === 'risks' ? 'RAISED BY' : 'OWNER'],
  ];

  const repliesTo = (rowKey: string) => {
    const postId = rowKey.replace(/^sr:/, '');
    return posts
      .filter((p) => p.parentId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  };
  const stageOf = (id: string) => stages.find((s) => s.id === id);

  return (
    <>
      <div className="hd">
        <h1>{kind === 'risks' ? 'Risks' : 'Overdue'}</h1>
        <span className="pill">
          {all.length} {kind === 'risks' ? 'open' : 'late'}
        </span>
        <span style={{ flexGrow: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          Furthest past due first, then soonest due
        </span>
      </div>

      <div className="chips">
        {FILTERS[kind].map(([k, label]) => (
          <button
            key={k}
            type="button"
            className={filter === k ? 'chip on' : 'chip'}
            data-filter={k}
            onClick={() => setFilter(k)}
          >
            {label} <span style={{ opacity: 0.65 }}>{all.filter((r) => (k === 'all' ? true : k === 'mto' ? blocksMto(r.stageId) : kind === 'risks' ? r.quiet > 7 : r.late > 14)).length}</span>
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="empty">
          <p className="mono-note" style={{ maxWidth: '48ch' }}>
            {filter === 'all'
              ? kind === 'risks'
                ? 'No open risks on the programme. Flagging risk on a step’s progress puts it here.'
                : 'No step is past its due date.'
              : `Nothing matches this filter. ${all.length} ${
                  kind === 'risks' ? 'open risk' : 'late step'
                }${all.length === 1 ? '' : 's'} in total.`}
          </p>
        </div>
      ) : (
        <div className="ctable xtable" data-board style={{ ['--ct' as string]: ctVar(COLS) }}>
          <CTHead cols={COLS} />
          {rows.map((r) => {
            const replies = kind === 'risks' ? repliesTo(r.key) : [];
            const wrap = kind === 'risks';
            const stage = stageOf(r.stageId);
            return (
              <Link
                key={r.key}
                className="trow"
                data-row={r.key}
                href={
                  stage && r.stepN != null
                    ? `/p/${projectId}/stage/${stage.id}/activity?step=${r.act}:${r.stepN}`
                    : `/p/${projectId}/stage/${r.stageId}/activity`
                }
                style={wrap ? { alignItems: 'start', paddingTop: 11, paddingBottom: 12 } : undefined}
              >
                <span style={{ justifySelf: 'center', marginTop: wrap ? 1 : undefined }}>
                  <span className="ref">{r.act}</span>
                </span>
                <span
                  className="num"
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    color: 'var(--ink-2)',
                    marginTop: wrap ? 2 : undefined,
                  }}
                >
                  {r.stepN ?? '—'}
                </span>
                <span style={{ minWidth: 0 }} data-title>
                  {/* A risk is a sentence, not a label — cutting it off at the
                      column edge throws away the thing you came to read. */}
                  <span
                    className={wrap ? undefined : 'ell'}
                    style={{
                      display: 'block',
                      fontWeight: 500,
                      lineHeight: wrap ? 1.5 : undefined,
                    }}
                  >
                    {r.title}
                  </span>
                  {wrap && r.stepText && (
                    <span
                      className="ell"
                      style={{ fontSize: 11.5, color: 'var(--ink-3)', display: 'block', marginTop: 3 }}
                    >
                      {r.stepText}
                    </span>
                  )}
                  {replies.length > 0 && (
                    <span className="replies xreplies">
                      {replies.map((p) => (
                        <span className="reply" key={p.id}>
                          <Avatar name={p.author} small />
                          <span style={{ minWidth: 0 }}>
                            <span className="who">
                              <b style={{ fontSize: 12 }}>{p.author}</b>
                              <span className="num" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>
                                {fmtDT(p.createdAt)}
                              </span>
                            </span>
                            <span className="txt">{p.text}</span>
                          </span>
                        </span>
                      ))}
                    </span>
                  )}
                </span>
                <span style={{ justifySelf: 'center', marginTop: wrap ? 1 : undefined }}>
                  <StatusPill kind={r.status} />
                </span>
                <span
                  className="num"
                  data-due
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: r.late ? 600 : 400,
                    color: r.late ? 'var(--risk)' : 'var(--ink-2)',
                    marginTop: wrap ? 2 : undefined,
                  }}
                >
                  {r.due ? fmtDate(r.due) : '—'}
                </span>
                <span
                  className="num"
                  style={{
                    textAlign: 'center',
                    fontSize: 12.5,
                    fontWeight: r.late > 14 ? 600 : 400,
                    color: r.late ? 'var(--risk)' : 'var(--ink-4)',
                    marginTop: wrap ? 1 : undefined,
                  }}
                >
                  {r.late ? `${r.late} day${r.late === 1 ? '' : 's'}` : '—'}
                </span>
                <span
                  data-who
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 0,
                    marginTop: wrap ? 1 : undefined,
                  }}
                >
                  {r.who ? (
                    <>
                      <Avatar name={r.who} small />
                      <span className="ell" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                        {r.who}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>Unassigned</span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

function StatusPill({ kind }: { kind: Row['status'] }) {
  if (kind === 'done')
    return (
      <span className="pill ok" style={{ fontSize: 10.5 }}>
        Completed
      </span>
    );
  if (kind === 'run')
    return (
      <span className="pill acc" style={{ fontSize: 10.5 }}>
        In progress
      </span>
    );
  return (
    <span className="pill" style={{ fontSize: 10.5 }}>
      Not started
    </span>
  );
}

/** Every step on the programme, addressable by `ref:n`. */
function useAllSteps() {
  const { steps } = useProgramWork();
  return new Map(steps.map((s) => [`${s.act}:${s.n}`, s]));
}

/* re-exported so the stage tab can use the same shape */
export { useStageSteps };
