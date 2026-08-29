'use client';

import { useAppStore } from '@/store/useAppStore';
import { peopleOf, TeamTable } from './TeamTable';

/**
 * Everyone on the programme, by the stage they are on.
 *
 * The same table as a stage's own Team tab under each heading, so a person is
 * added the same way wherever the question is asked.
 */
export function ProgramTeam({ projectId }: { projectId: string }) {
  const stages = useAppStore((s) => s.stages);
  const contacts = useAppStore((s) => s.contacts);
  const leaders = useAppStore((s) => s.leaders);

  const groups = stages.filter(
    (s) => (contacts[s.id]?.length ?? 0) > 0 || !!leaders[s.id]?.name,
  );
  const total = groups.reduce(
    (n, s) => n + peopleOf(leaders[s.id], contacts[s.id] ?? []).length,
    0,
  );

  return (
    <>
      <div className="hd">
        <h1>Team</h1>
        <span className="pill">{total}</span>
      </div>
      {groups.map((s) => (
        <div key={s.id}>
          <div className="groupbar" style={{ cursor: 'default' }} data-group={s.id}>
            <b>{s.title}</b>
            <span className="pill" style={{ fontSize: 10.5 }}>
              {s.shortTitle}
            </span>
          </div>
          <TeamTable stageId={s.id} />
        </div>
      ))}
    </>
  );
}
