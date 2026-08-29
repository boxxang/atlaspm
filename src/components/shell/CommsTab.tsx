'use client';

import { fmtDate } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';

/**
 * The communication board: everything people added on this programme.
 *
 * The Activity tab holds what the template names; this holds what this
 * programme turned out to need — entries with an owner and a date but no steps,
 * because nobody wrote them up in advance. It is where a stage actually gets
 * talked about.
 */
export function CommsTab({ stageId }: { stageId: string }) {
  const items = useAppStore((s) => s.content)[stageId]?.activities ?? [];
  const deliverables = useAppStore((s) => s.deliverables)[stageId] ?? [];
  const today = useAppStore((s) => s.today);

  if (items.length === 0) {
    return (
      <p className="pview-todo">
        Nothing added on this programme yet. The Activity tab holds what the template names;
        anything else this stage has to track goes here.
      </p>
    );
  }

  return (
    <table className="ptable pboard">
      <thead>
        <tr>
          <th className="pwrapcol">Entry</th>
          <th className="mid">Delivers</th>
          <th className="mid num">Due</th>
          <th className="mid">Owner</th>
          <th className="mid num">Updates</th>
        </tr>
      </thead>
      <tbody>
        {items.map((it) => {
          const late = !it.done && !!it.due && it.due < today;
          const towards = deliverables.find((d) => d.id === it.deliverableId);
          return (
            <tr key={it.id} data-item={it.id}>
              <th scope="row" className="pwrap pwrapcol">
                {it.title}
                {it.done && <span className="ppill ok">Done</span>}
                {late && <span className="ppill risk">Overdue</span>}
                {it.body && <span className="pcomms-body">{it.body}</span>}
              </th>
              <td className="mid prole">{towards?.title ?? <span className="pmuted">—</span>}</td>
              <td className={late ? 'mid num late' : 'mid num'}>
                {it.due ? fmtDate(it.due) : '—'}
              </td>
              <td className="mid prole">{it.owner || <span className="pmuted">Unassigned</span>}</td>
              <td className="mid num prole">{it.updates.length || '—'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
