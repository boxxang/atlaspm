'use client';

import { activitySteps } from '@/data/activitySteps';
import { attachmentUrl } from '@/lib/attachments';
import { deliverableStatus, deliverableStep, producerStarted } from '@/lib/deliverableStatus';
import { fmtDate } from '@/lib/schedule';
import type { Deliverable } from '@/data/types';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { ctVar, CTHead, type Col } from './ctable';
import { HandoverPanel } from './HandoverPanel';
import { IconClip } from './icons';
import { useDeliverableRefs } from './useDeliverableRefs';
import { useStageSteps } from './useStageSteps';

/**
 * Key deliverables, as both the stage tab and the programme board list them.
 *
 * TICKED BY names the step that hands it over, so the row says where the work
 * is rather than only that it is not done. The tick is a report, not a control:
 * a deliverable is completed by a handover, and there is no box here that would
 * let somebody claim otherwise.
 *
 * Opening a row opens that handover under it, where the mockup puts it: the row
 * is already the title, so the card does not repeat it, and the rest of the
 * list stays on screen while it is being written.
 */
const COLS: Col[] = [
  ['chk', 22, ''],
  ['ref', 78, 'TAG'],
  ['title', null, 'DELIVERABLE'],
  ['status', 112, 'STATUS'],
  ['by', 150, 'TICKED BY'],
  ['due', 88, 'DUE'],
  ['done', 88, 'COMPLETED'],
];

const producers = Object.keys(activitySteps).map((ref) => ({
  ref,
  produces: activitySteps[ref].r.map(([id]) => id),
  stepCount: activitySteps[ref].s.length,
}));

export function DeliverableTable({
  stageId,
  projectId,
  list,
}: {
  stageId: string;
  projectId: string;
  list: readonly Deliverable[];
}) {
  const posts = useAppStore((s) => s.posts);
  const schedule = useAppStore((s) => s.schedule);
  const today = useAppStore((s) => s.today);
  const selection = useRailStore((s) => s.selection);
  const select = useRailStore((s) => s.select);
  const activities = useStageSteps(stageId);
  const refOf = useDeliverableRefs();

  const span = schedule.stages[stageId];
  /* Which activity produces it, so "In progress" means the work has started
     rather than merely that the stage has. */
  const producerOf = (ref: string | null) => {
    if (!ref) return null;
    const owner = activities.find((a) => a.delivers.some(([id]) => id === ref));
    return owner ? owner.state : null;
  };

  return (
    <div className="ctable" data-board style={{ ['--ct' as string]: ctVar(COLS) }}>
      <CTHead cols={COLS} />
      {list.map((d) => {
        const ref = refOf.get(d.id) ?? null;
        const handover = posts.find((p) => p.deliverableId === d.id && p.kind === 'handover');
        const files = handover?.attachments ?? [];
        const st = deliverableStatus(
          d,
          today,
          producerStarted(producerOf(ref), span?.start ?? null, today),
        );
        const late = st.kind === 'late';
        const ticked = deliverableStep(ref, producers);
        const completedAt = handover?.doneAt ?? d.completedAt;
        const open = selection.kind === 'deliverable' && selection.deliverableId === d.id;
        return (
          <div key={d.id} style={{ display: 'contents' }}>
          <div
            className={open ? 'trow open' : 'trow'}
            data-deliverable={d.id}
            onClick={() => select({ kind: 'deliverable', stageId, deliverableId: d.id })}
          >
            <button
              type="button"
              className={d.done ? 'cb on' : 'cb'}
              title={
                d.done
                  ? 'Completed by a handover'
                  : 'Attach an output and say what was handed over to complete this'
              }
              aria-label={`Open the handover for ${d.title}`}
              onClick={(e) => {
                e.stopPropagation();
                select({ kind: 'deliverable', stageId, deliverableId: d.id });
              }}
            >
              {d.done && (
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3.4"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
            <span style={{ justifySelf: 'start' }}>
              {ref ? (
                <span className="ref">{ref}</span>
              ) : (
                <span style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>—</span>
              )}
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                minWidth: 0,
              }}
            >
              <span
                className="ell"
                style={{
                  minWidth: 0,
                  color: d.done ? 'var(--ink-3)' : undefined,
                }}
              >
                {d.title}
              </span>
              {files.length > 0 && (
                <a
                  className="clip"
                  href={attachmentUrl(files[0].id)}
                  target="_blank"
                  rel="noreferrer"
                  title={files[0].filename}
                  aria-label={`Open ${files[0].filename}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconClip />
                  {files.length}
                </a>
              )}
            </span>
            <span style={{ justifySelf: 'start' }}>
              <span
                className={
                  st.kind === 'done'
                    ? 'pill ok'
                    : st.kind === 'late'
                      ? 'pill risk'
                      : st.kind === 'run'
                        ? 'pill acc'
                        : 'pill'
                }
                style={{ fontSize: 10.5 }}
              >
                {st.label}
              </span>
            </span>
            <span className="ell" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
              {ticked ? `${ticked.act} step ${ticked.n}` : '—'}
            </span>
            <span
              className="num"
              style={{
                fontSize: 12,
                color: late ? 'var(--risk)' : 'var(--ink-2)',
              }}
            >
              {d.due ? fmtDate(d.due) : '—'}
            </span>
            <span className="num" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
              {completedAt ? fmtDate(completedAt) : '—'}
            </span>
          </div>
          {open && (
            <HandoverPanel key={d.id} stageId={stageId} deliverableId={d.id} projectId={projectId} />
          )}
          </div>
        );
      })}
    </div>
  );
}
