'use client';

import { estimateCost, formatManMonths } from '@/lib/effort';
import { fmtDate } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { ActivityPanel } from './ActivityPanel';
import { DeliverableLines } from './DeliverableLines';
import { HandoverPanel } from './HandoverPanel';
import { Avatar } from './icons';
import { StepPanel } from './StepPanel';
import { useStageSteps } from './useStageSteps';

/**
 * The right rail. It shows whatever was last picked, and it is the same slot on
 * every screen — which is why the selection lives in its own store rather than
 * inside a view.
 *
 * A stage shows its properties, an activity shows where it has got to, a step
 * shows everything you can change about it, and a key deliverable shows the
 * handover that completes it.
 */
export function Rail({ projectId }: { projectId: string }) {
  const selection = useRailStore((s) => s.selection);

  return (
    <aside id="peek" aria-label="Details">
      {selection.kind === 'none' && (
        <>
          <div className="peek-hd">
            <span className="cap">Details</span>
          </div>
          <div className="peek-body">
            <p className="mono-note">Pick a stage, an activity or a step to see it here.</p>
          </div>
        </>
      )}
      {selection.kind === 'stage' && (
        <StagePanel stageId={selection.stageId} projectId={projectId} />
      )}
      {selection.kind === 'activity' && <ActivityPanel act={selection.act} projectId={projectId} />}
      {selection.kind === 'step' && <StepPanel act={selection.act} n={selection.n} />}
      {selection.kind === 'deliverable' && (
        <HandoverPanel
          key={selection.deliverableId}
          stageId={selection.stageId}
          deliverableId={selection.deliverableId}
        />
      )}
    </aside>
  );
}

function StagePanel({ stageId, projectId }: { stageId: string; projectId: string }) {
  const stages = useAppStore((s) => s.stages);
  const schedule = useAppStore((s) => s.schedule);
  const leaders = useAppStore((s) => s.leaders);
  const deliverables = useAppStore((s) => s.deliverables);
  const costPerManMonth = useAppStore((s) => s.costPerManMonth);
  const activities = useStageSteps(stageId);

  const stage = stages.find((s) => s.id === stageId);
  const span = schedule.stages[stageId];
  if (!stage || !span) return null;

  const lead = leaders[stage.id]?.name;
  const dl = deliverables[stage.id] ?? [];
  const steps = activities.flatMap((a) => a.steps);
  const done = steps.filter((s) => s.done).length;
  const mm = stage.engineeringEffort.reduce((n, e) => n + e, 0);

  return (
    <>
      <div className="peek-hd">
        <span className="cap">Properties</span>
      </div>
      <div className="peek-body">
        <Prop k="Lead">
          {lead ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
              <Avatar name={lead} small />
              {lead}
            </span>
          ) : (
            <span style={{ color: 'var(--ink-4)' }}>Unassigned</span>
          )}
        </Prop>
        <Prop k="Starts">
          <span className="num">{fmtDate(span.start)}</span>
        </Prop>
        <Prop k="TAT">
          <span className="num">{span.durationWeeks} weeks</span>
        </Prop>
        <Prop k="Ends">
          <span className="num">{fmtDate(span.end)}</span>
        </Prop>
        <Prop k="Steps">
          <span className="num">
            {done} of {steps.length} done
          </span>
        </Prop>
        <Prop k="Effort">
          <span className="num">
            {formatManMonths(mm).replace(' MM', '')} M/M
            {costPerManMonth ? ` · $${(estimateCost(mm, costPerManMonth) / 1e6).toFixed(1)}M` : ''}
          </span>
        </Prop>

        <DeliverableLines
          title="Key deliverables"
          list={dl}
          stageId={stage.id}
          projectId={projectId}
          empty="No deliverables on this stage."
        />
      </div>
    </>
  );
}

export function Prop({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="prop">
      <span className="pk">{k}</span>
      <span style={{ fontSize: 13 }}>{children}</span>
    </div>
  );
}
