'use client';

import { useState } from 'react';
import { fmtDate } from '@/lib/schedule';
import { isStepLate } from '@/lib/steps';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { ctVar, CTHead, type Col } from './ctable';
import { Avatar, IconRiskLarge } from './icons';
import { PostThread } from './PostThread';
import { useStageSteps } from './useStageSteps';
import { useProgramWork } from './useProgramWork';

/**
 * The risks flagged on this stage's steps.
 *
 * The same derivation the Risks board and the nav badge read — a risk is a flag
 * on a step, open while that step is — filtered to one stage. Three screens, one
 * answer, which is the point of resolving it once.
 *
 * A row says what the risk is and, under it, the step it is flagged on: those
 * two sentences together are the risk, and either alone is half of it. Opening
 * a row shows the post and the thread that answers it, because how a risk was
 * argued down is the part worth keeping.
 *
 * Ordered by where the work is, not by when it was raised: the stage runs its
 * activities in order, so the risk on the earliest open step is the one in the
 * way.
 */
const COLS: Col[] = [
  ['dot', 16, ''],
  ['step', 96, 'STEP'],
  ['title', null, 'RISK'],
  ['status', 104, 'STEP STATUS'],
  ['due', 90, 'STEP DUE'],
  ['owner', 130, 'RAISED BY'],
];

export function StageRisksTab({ stageId }: { stageId: string }) {
  const { risks } = useProgramWork();
  const today = useAppStore((s) => s.today);
  const posts = useAppStore((s) => s.posts);
  const select = useRailStore((s) => s.select);
  const activities = useStageSteps(stageId);
  const [open, setOpen] = useState<string | null>(null);

  const order = activities.map((a) => a.ref);
  const stepOf = (act: string, n: number | null) =>
    n == null ? null : (activities.find((a) => a.ref === act)?.steps.find((s) => s.n === n) ?? null);

  const mine = risks
    .filter((r) => r.stageId === stageId)
    .sort((a, b) => order.indexOf(a.act) - order.indexOf(b.act) || (a.stepN ?? 0) - (b.stepN ?? 0));

  if (mine.length === 0) {
    return (
      <div className="empty">
        <IconRiskLarge />
        <p className="mono-note" style={{ maxWidth: '48ch' }}>
          No open risks on this stage. Flagging <b>risk</b> on a step&rsquo;s progress puts it here.
        </p>
      </div>
    );
  }

  return (
    <div
      className={open ? 'ctable focused' : 'ctable'}
      data-board
      style={{ ['--ct' as string]: ctVar(COLS) }}
    >
      <CTHead cols={COLS} />
      {mine.map((r) => {
        const step = stepOf(r.act, r.stepN);
        const late = step ? isStepLate(step, today) : false;
        const isOpen = open === r.postId;
        const post = posts.find((p) => p.id === r.postId);
        const replies = posts.filter((p) => p.parentId === r.postId);
        return (
          <div key={r.id} style={{ display: 'contents' }}>
            <button
              type="button"
              className={isOpen ? 'trow open' : 'trow'}
              data-risk={r.postId}
              style={{ alignItems: 'start', paddingTop: 10, paddingBottom: 10 }}
              onClick={() => setOpen(isOpen ? null : r.postId)}
            >
              <span className="dot" style={{ background: 'var(--risk)', marginTop: 5 }} />
              <span
                style={{
                  justifySelf: 'start',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  marginTop: 2,
                }}
              >
                <span className="ref">{r.act}</span>
                {r.stepN != null && (
                  <span className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                    step {r.stepN}
                  </span>
                )}
              </span>
              <span style={{ minWidth: 0 }}>
                <span
                  className="ell"
                  style={{ display: 'block', fontWeight: 500, textAlign: 'left' }}
                >
                  {r.title}
                </span>
                <span
                  className="ell"
                  style={{
                    display: 'block',
                    fontSize: 11.5,
                    color: 'var(--ink-3)',
                    marginTop: 3,
                    textAlign: 'left',
                  }}
                >
                  {step?.text ?? 'Not matched to a step on this stage'}
                </span>
              </span>
              <span style={{ justifySelf: 'start', marginTop: 1 }}>
                <span
                  className={
                    !step ? 'pill' : step.done ? 'pill ok' : late ? 'pill risk' : 'pill acc'
                  }
                  style={{ fontSize: 10.5 }}
                >
                  {!step
                    ? '—'
                    : step.done
                      ? 'Completed'
                      : late
                        ? 'Overdue'
                        : today >= step.start
                          ? 'In progress'
                          : 'Not started'}
                </span>
              </span>
              <span
                className="num"
                data-due
                style={{
                  fontSize: 12,
                  marginTop: 2,
                  color: late ? 'var(--risk)' : 'var(--ink-2)',
                  fontWeight: late ? 600 : 400,
                }}
              >
                {step ? fmtDate(step.due) : '—'}
              </span>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  minWidth: 0,
                  marginTop: 1,
                }}
              >
                {r.owner ? (
                  <>
                    <Avatar name={r.owner} small />
                    <span className="ell" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                      {r.owner}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>—</span>
                )}
              </span>
            </button>

            {isOpen && post && (
              <div className="riskwrap">
                <div className="riskcard">
                  <div className="riskcard-hd">
                    <span className="ref">{r.act}</span>
                    {r.stepN != null && (
                      <span className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                        step {r.stepN}
                      </span>
                    )}
                    <span
                      className="ell"
                      style={{ fontSize: 12.5, color: 'var(--ink-2)', minWidth: 0 }}
                    >
                      {step?.text ?? ''}
                    </span>
                    <span style={{ flexGrow: 1 }} />
                    <span className="pill" style={{ fontSize: 10.5 }}>
                      {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                    </span>
                    {r.stepN != null && (
                      <button
                        type="button"
                        className="btn sm"
                        onClick={() => select({ kind: 'step', act: r.act, n: r.stepN as number })}
                      >
                        Open step →
                      </button>
                    )}
                  </div>
                  <div className="riskcard-body">
                    <PostThread
                      posts={[post]}
                      target={{ kind: 'update', activityRef: r.act, stepN: r.stepN }}
                      placeholder="What moved, and what would close this…"
                      emptyText=""
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
