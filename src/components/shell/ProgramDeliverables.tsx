'use client';

import { useAppStore } from '@/store/useAppStore';
import { DeliverableTable } from './DeliverableTable';

/**
 * Every key deliverable on the programme, grouped by the stage that owns it.
 *
 * The same table as a stage's own tab under each heading, so a handover is
 * filed the same way wherever it is reached from.
 */
export function ProgramDeliverables({ projectId }: { projectId: string }) {
  const stages = useAppStore((s) => s.stages);
  const deliverables = useAppStore((s) => s.deliverables);

  const groups = stages
    .map((s) => ({ stage: s, rows: deliverables[s.id] ?? [] }))
    .filter((g) => g.rows.length > 0);
  const all = groups.flatMap((g) => g.rows);
  const done = all.filter((d) => d.done).length;

  return (
    <>
      <div className="hd">
        <h1>Deliverables</h1>
        <span className="pill">
          {done} of {all.length}
        </span>
        <span style={{ flexGrow: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          Completed by a handover — a body, an artefact and the date it was accepted
        </span>
      </div>
      {groups.map((g) => (
        <div key={g.stage.id}>
          <div className="groupbar" style={{ cursor: 'default' }} data-group={g.stage.id}>
            <b>{g.stage.title}</b>
            <span className="pill" style={{ fontSize: 10.5 }}>
              {g.stage.shortTitle}
            </span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              {g.rows.filter((d) => d.done).length}/{g.rows.length}
            </span>
          </div>
          <DeliverableTable stageId={g.stage.id} list={g.rows} />
        </div>
      ))}
    </>
  );
}
