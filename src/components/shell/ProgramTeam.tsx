'use client';

import { PROGRAM_DEFAULT_TEAM } from '@/data/programTeam';
import { useAppStore } from '@/store/useAppStore';
import { peopleOf, ProgrammeTable, TeamTable } from './TeamTable';

/**
 * Everyone on the programme, by the stage they are on.
 *
 * The same table as a stage's own Team tab under each heading, so a person is
 * added the same way wherever the question is asked. The TPM is on every
 * programme and heads the list, under the programme rather than a stage.
 */
export function ProgramTeam() {
  const stages = useAppStore((s) => s.stages);
  const contacts = useAppStore((s) => s.contacts);
  const leaders = useAppStore((s) => s.leaders);

  const groups = stages.filter(
    (s) => (contacts[s.id]?.length ?? 0) > 0 || !!leaders[s.id]?.name,
  );
  const total = groups.reduce(
    (n, s) => n + peopleOf(leaders[s.id], contacts[s.id] ?? []).length,
    PROGRAM_DEFAULT_TEAM.length,
  );

  return (
    <>
      <div className="hd">
        <h1>Team</h1>
        <span className="pill">{total}</span>
      </div>
      <div>
        <div className="groupbar" style={{ cursor: 'default' }} data-group="programme">
          <b>Programme</b>
          <span className="pill" style={{ fontSize: 10.5 }}>
            All stages
          </span>
        </div>
        <ProgrammeTable />
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
