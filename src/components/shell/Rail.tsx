'use client';

import { usePathname } from 'next/navigation';
import { phaseById } from '@/data/scheduleProfiles';
import { formatManMonths } from '@/lib/effort';
import { fmtDate } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore, type RailSelection } from '@/store/railStore';
import { ActivityPanel } from './ActivityPanel';
import { DeliverableLines } from './DeliverableLines';
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
 *
 * With nothing picked the rail is not there at all, which is what the mockup
 * does: the Overview and the two cross-program boards want the width, and a
 * 400px column saying "pick something" is worse than the width it costs.
 *
 * A stage screen is the exception, and it is derived here rather than asserted
 * by the stage page. The rail clears on every navigation — moving between a
 * stage's tabs is a navigation, and clicking the open activity a second time is
 * "never mind" — and in the mockup neither of those empties the rail, because
 * `VIEWS.stage` always draws the stage's properties under whatever else is
 * picked. Deriving the floor from the route is the only version of that which
 * cannot come apart: an effect racing the shell's clear works or not depending
 * on which of them React runs last.
 */
export function Rail({ projectId }: { projectId: string }) {
  const picked = useRailStore((s) => s.selection);
  const stages = useAppStore((s) => s.stages);
  const route = usePathname().match(/\/stage\/([^/?]+)/)?.[1] ?? null;
  /* a route naming a stage this program does not run has nothing to show */
  const onStage = route && stages.some((s) => s.id === route) ? route : null;
  const selection: RailSelection =
    picked.kind === 'none' && onStage ? { kind: 'stage', stageId: onStage } : picked;

  if (selection.kind === 'none') return null;

  return (
    <aside id="peek" aria-label="Details">
      {selection.kind === 'stage' && (
        <StagePanel stageId={selection.stageId} projectId={projectId} />
      )}
      {selection.kind === 'activity' && <ActivityPanel act={selection.act} projectId={projectId} />}
      {selection.kind === 'step' && <StepPanel act={selection.act} n={selection.n} projectId={projectId} />}
      {/* A deliverable opens its handover inline under its row, as the mockup
          does, so the rail keeps showing the stage it belongs to. */}
      {selection.kind === 'deliverable' && (
        <StagePanel stageId={selection.stageId} projectId={projectId} />
      )}
    </aside>
  );
}

function StagePanel({ stageId, projectId }: { stageId: string; projectId: string }) {
  const stages = useAppStore((s) => s.stages);
  const schedule = useAppStore((s) => s.schedule);
  const leaders = useAppStore((s) => s.leaders);
  const deliverables = useAppStore((s) => s.deliverables);
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
        <Prop k="Phase">
          <span style={{ fontSize: 13 }}>{phaseById(stage.phaseId).label}</span>
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
