'use client';

import { fmtDate } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { ActivityPanel } from './ActivityPanel';
import { StepPanel } from './StepPanel';

/**
 * The right rail. It shows whatever was last picked, and it is the same slot on
 * every screen — which is why the selection lives in its own store rather than
 * inside a view.
 *
 * A stage shows its properties, an activity shows where it has got to, a step
 * shows everything you can change about it. The deliverable panel arrives with
 * the handover flow.
 */
export function Rail({ projectId }: { projectId: string }) {
  const selection = useRailStore((s) => s.selection);

  return (
    <aside className="prail" aria-label="Details">
      {selection.kind === 'none' && (
        <p className="prail-empty">Pick a stage, an activity or a step to see it here.</p>
      )}
      {selection.kind === 'stage' && <StagePanel stageId={selection.stageId} />}
      {selection.kind === 'activity' && (
        <ActivityPanel act={selection.act} projectId={projectId} />
      )}
      {selection.kind === 'step' && <StepPanel act={selection.act} n={selection.n} />}
      {selection.kind === 'deliverable' && (
        <p className="prail-empty">
          <span className="pview-phase">V2-6</span>
          The handover that completes {selection.deliverableId}: a body, an attachment and a
          completion date.
        </p>
      )}
    </aside>
  );
}

function StagePanel({ stageId }: { stageId: string }) {
  const stages = useAppStore((s) => s.stages);
  const schedule = useAppStore((s) => s.schedule);
  const leaders = useAppStore((s) => s.leaders);
  const clear = useRailStore((s) => s.clear);

  const stage = stages.find((s) => s.id === stageId);
  const span = schedule.stages[stageId];
  if (!stage || !span) return null;

  return (
    <>
      <header className="prail-head">
        <h2 className="prail-cap">Properties</h2>
        <button type="button" className="prail-x" onClick={clear} aria-label="Close details">
          ×
        </button>
      </header>
      <dl className="prail-facts">
        <dt>Lead</dt>
        <dd>{leaders[stage.id]?.name || '—'}</dd>
        <dt>Starts</dt>
        <dd>{fmtDate(span.start)}</dd>
        <dt>Ends</dt>
        <dd>{fmtDate(span.end)}</dd>
        <dt>TAT</dt>
        <dd>{span.durationWeeks} weeks</dd>
      </dl>
    </>
  );
}
