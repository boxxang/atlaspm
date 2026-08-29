'use client';

import { fmtDate } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';

/**
 * The right rail. It shows whatever was last picked, and it is the same slot on
 * every screen — which is why the selection lives in its own store rather than
 * inside a view.
 *
 * The panels themselves arrive with the screens that fill them: the stage page
 * brings the activity and step panels, the deliverables board brings the
 * handover. Until then this renders the stage properties it can already answer,
 * and says so plainly for the rest rather than drawing an empty frame.
 */
export function Rail() {
  const selection = useRailStore((s) => s.selection);
  const clear = useRailStore((s) => s.clear);
  const stages = useAppStore((s) => s.stages);
  const schedule = useAppStore((s) => s.schedule);
  const leaders = useAppStore((s) => s.leaders);

  if (selection.kind === 'none') {
    return (
      <aside className="prail" aria-label="Details">
        <p className="prail-empty">Pick a stage, an activity or a step to see it here.</p>
      </aside>
    );
  }

  if (selection.kind === 'stage') {
    const stage = stages.find((s) => s.id === selection.stageId);
    const span = schedule.stages[selection.stageId];
    if (!stage || !span) return null;
    const leader = leaders[stage.id];
    return (
      <aside className="prail" aria-label="Details">
        <header className="prail-head">
          <h2 className="prail-cap">Properties</h2>
          <button type="button" className="prail-x" onClick={clear} aria-label="Close details">
            ×
          </button>
        </header>
        <dl className="prail-facts">
          <dt>Lead</dt>
          <dd>{leader?.name ?? '—'}</dd>
          <dt>Starts</dt>
          <dd>{fmtDate(span.start)}</dd>
          <dt>Ends</dt>
          <dd>{fmtDate(span.end)}</dd>
          <dt>TAT</dt>
          <dd>{span.durationWeeks} weeks</dd>
        </dl>
      </aside>
    );
  }

  return (
    <aside className="prail" aria-label="Details">
      <header className="prail-head">
        <h2 className="prail-cap">{selection.kind === 'step' ? 'Step' : 'Activity'}</h2>
        <button type="button" className="prail-x" onClick={clear} aria-label="Close details">
          ×
        </button>
      </header>
      <p className="prail-empty">
        {selection.kind === 'step'
          ? `${selection.act} step ${selection.n}`
          : selection.kind === 'activity'
            ? selection.act
            : selection.deliverableId}
      </p>
    </aside>
  );
}
