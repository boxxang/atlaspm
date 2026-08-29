'use client';

import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { useProgramWork } from './useProgramWork';

/**
 * The risks flagged on this stage's steps.
 *
 * The same derivation the Risks board and the nav badge read — a risk is a flag
 * on a step, open while that step is — filtered to one stage. Three screens, one
 * answer, which is the point of resolving it once.
 *
 * Raising a risk happens on the step, not here: a risk with no step to close it
 * is a risk nothing can answer.
 */
export function StageRisksTab({
  stageId,
  projectId,
}: {
  stageId: string;
  projectId: string;
}) {
  const { risks } = useProgramWork();
  const today = useAppStore((s) => s.today);
  const mine = risks
    .filter((r) => r.stageId === stageId)
    .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());

  if (mine.length === 0) {
    return (
      <p className="mono-note">
        Nothing flagged on this stage. Flag a risk from the step it is about, on the{' '}
        <Link href={`/p/${projectId}/stage/${stageId}/activity`}>Activity</Link> tab.
      </p>
    );
  }

  return (
    <table className="ptable pboard" data-board>
      <thead>
        <tr>
          <th className="mid">Activity</th>
          <th className="mid pnarrow">Step</th>
          <th className="pwrapcol">Risk</th>
          <th className="mid num">Quiet for</th>
          <th className="mid">Raised by</th>
        </tr>
      </thead>
      <tbody>
        {mine.map((r) => (
          <tr key={r.id}>
            <td className="mid">
              <span className="ref">{r.act}</span>
            </td>
            <td className="mid num pnarrow">{r.stepN ?? '—'}</td>
            <th scope="row" className="pwrap pwrapcol">
              {r.title}
            </th>
            <td className="mid num">
              {Math.max(0, Math.round((today.getTime() - r.updatedAt.getTime()) / 864e5))} days
            </td>
            <td className="mid">{r.owner || 'Unassigned'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
