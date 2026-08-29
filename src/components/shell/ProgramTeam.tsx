'use client';

import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';

/**
 * Everyone on the programme, by the stage they are on.
 *
 * Read-only here: somebody is added or corrected on their stage's Team tab,
 * where the question "who is on this stage" is being asked. This answers the
 * other one — "who is on this programme, and where do I find them".
 */
export function ProgramTeam({ projectId }: { projectId: string }) {
  const stages = useAppStore((s) => s.stages);
  const contacts = useAppStore((s) => s.contacts);
  const leaders = useAppStore((s) => s.leaders);

  const groups = stages
    .map((s) => ({
      stage: s,
      lead: leaders[s.id]?.name ? leaders[s.id] : null,
      rows: contacts[s.id] ?? [],
    }))
    .filter((g) => g.lead || g.rows.length > 0);

  const total = groups.reduce((n, g) => n + g.rows.length + (g.lead ? 1 : 0), 0);

  return (
    <>
      <header className="pview-head">
        <h1 className="pview-title">Team</h1>
        <span className="pview-count">{total}</span>
      </header>

      <div className="pview-body">
        <table className="ptable pboard">
          <thead>
            <tr>
              <th className="pwrapcol">Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          {groups.map((g) => (
            <tbody key={g.stage.id}>
              <tr className="ptable-group">
                <th colSpan={4} scope="colgroup">
                  <Link href={`/p/${projectId}/stage/${g.stage.id}/team`}>{g.stage.title}</Link>
                  <span className="pview-count">{g.rows.length + (g.lead ? 1 : 0)}</span>
                </th>
              </tr>
              {g.lead && (
                <tr data-person={`${g.stage.id}:leader`}>
                  <th scope="row" className="pwrap pwrapcol">
                    {g.lead.name}
                    <span className="ppill">Lead</span>
                  </th>
                  <td className="prole">Stage lead</td>
                  <td className="prole">{g.lead.email || '—'}</td>
                  <td className="prole">{g.lead.phone || '—'}</td>
                </tr>
              )}
              {g.rows.map((c) => (
                <tr key={c.id} data-person={c.id}>
                  <th scope="row" className="pwrap pwrapcol">
                    {c.name}
                  </th>
                  <td className="prole">{c.role || '—'}</td>
                  <td className="prole">{c.email || '—'}</td>
                  <td className="prole">{c.phone || '—'}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </>
  );
}
