'use client';

import { detailDeliverables } from '@/data/activityIndex';
import { activitySteps } from '@/data/activitySteps';
import { attachmentUrl } from '@/lib/attachments';
import { deliverableStatus, producerStarted } from '@/lib/deliverableStatus';
import { fmtDate } from '@/lib/schedule';
import { activityState, fromStepIndex, resolveSteps } from '@/lib/steps';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';

/**
 * A stage's key deliverables.
 *
 * Completion is a handover — a body, an artefact and a date it was accepted —
 * filed in the rail. Nothing here ticks a box, because a box is not evidence.
 *
 * A row carrying an artefact shows a clip that opens it. It opens the file
 * itself rather than navigating anywhere: the reason to click a clip is to see
 * the file.
 */
export function DeliverablesTab({ stageId }: { stageId: string }) {
  const deliverables = useAppStore((s) => s.deliverables)[stageId] ?? [];
  const posts = useAppStore((s) => s.posts);
  const schedule = useAppStore((s) => s.schedule);
  const stepStates = useAppStore((s) => s.stepStates);
  const today = useAppStore((s) => s.today);
  const selection = useRailStore((s) => s.selection);
  const select = useRailStore((s) => s.select);

  const span = schedule.stages[stageId];
  /* Which activity produces a deliverable, so "In progress" means the work has
     actually started rather than the stage has. */
  const producerOf = (title: string) => {
    const ref = Object.keys(detailDeliverables).find((r) => detailDeliverables[r] === title);
    if (!ref || !span) return null;
    const owner = Object.keys(activitySteps).find(
      (a) => activitySteps[a].st === stageId && activitySteps[a].r.some(([id]) => id === ref),
    );
    if (!owner) return null;
    const activity = fromStepIndex(owner, activitySteps[owner]);
    return activityState(resolveSteps(span.start, activity, stepStates), today);
  };

  if (deliverables.length === 0) {
    return <p className="mono-note">This stage has no key deliverables.</p>;
  }

  return (
    <table className="ptable pboard" data-board>
      <thead>
        <tr>
          <th className="pwrapcol">Key deliverable</th>
          <th className="mid">Status</th>
          <th className="mid num">Due</th>
          <th className="mid num">Completed</th>
        </tr>
      </thead>
      <tbody>
        {deliverables.map((d) => {
          const handover = posts.find((p) => p.deliverableId === d.id && p.kind === 'handover');
          const status = deliverableStatus(
            d,
            today,
            producerStarted(producerOf(d.title), span?.start ?? null, today),
          );
          const picked =
            selection.kind === 'deliverable' && selection.deliverableId === d.id;
          const files = handover?.attachments ?? [];
          return (
            <tr
              key={d.id}
              data-deliverable={d.id}
              className={picked ? 'pdeliv picked' : 'pdeliv'}
              onClick={() => select({ kind: 'deliverable', stageId, deliverableId: d.id })}
            >
              <th scope="row" className="pwrap pwrapcol">
                {d.title}
                {files.length > 0 && (
                  <a
                    className="pclip"
                    href={attachmentUrl(files[0].id)}
                    target="_blank"
                    rel="noreferrer"
                    title={files[0].filename}
                    aria-label={`Open ${files[0].filename}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    📎
                  </a>
                )}
              </th>
              <td className="mid">
                <span className={`pill ${pillTone(status.kind)}`}>{status.label}</span>
              </td>
              <td className={status.kind === 'late' ? 'mid num late' : 'mid num'}>
                {d.due ? fmtDate(d.due) : '—'}
              </td>
              <td className="mid num">{d.completedAt ? fmtDate(d.completedAt) : '—'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const pillTone = (kind: string) =>
  kind === 'done' ? 'ok' : kind === 'late' ? 'risk' : kind === 'run' ? 'run' : '';
