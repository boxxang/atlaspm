'use client';

import Link from 'next/link';
import { activitySteps } from '@/data/activitySteps';
import { fmtDT } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';

/**
 * Everything said on the programme, newest first.
 *
 * Both kinds: posts on steps, notes, handovers and their replies, and the
 * updates filed against the communication board's entries. They are different
 * tables — the second is V1's — and this is the one screen that has to show
 * them together, because "what has been said lately" does not care which.
 */
export function UpdatesPage({
  projectId,
  stageId,
}: {
  projectId: string;
  /** Given, this is the stage's own Updates tab rather than the programme's. */
  stageId?: string;
}) {
  const posts = useAppStore((s) => s.posts);
  const content = useAppStore((s) => s.content);
  const stages = useAppStore((s) => s.stages);

  const stageOfAct = (ref: string | null) => (ref ? (activitySteps[ref]?.st ?? null) : null);

  const fromPosts = posts.map((p) => ({
    id: p.id,
    when: p.editedAt ?? p.createdAt,
    who: p.author,
    text: p.text,
    kind: p.kind,
    ref: p.activityRef,
    stageId: p.stageId ?? stageOfAct(p.activityRef),
  }));

  const fromItems = Object.entries(content).flatMap(([id, c]) =>
    (['keyinfo', 'activities', 'risks'] as const).flatMap((k) =>
      c[k].flatMap((it) =>
        it.updates.map((u) => ({
          id: u.id,
          when: u.date,
          who: it.owner,
          text: u.text,
          kind: 'update',
          ref: null as string | null,
          stageId: id,
        })),
      ),
    ),
  );

  const rows = [...fromPosts, ...fromItems]
    .filter((r) => !stageId || r.stageId === stageId)
    .sort((a, b) => b.when.getTime() - a.when.getTime());

  const titleOf = (id: string | null) => stages.find((s) => s.id === id)?.title ?? '—';

  const table =
    rows.length === 0 ? (
      <p className="pview-todo">Nothing has been said here yet.</p>
    ) : (
      <table className="ptable pboard">
        <thead>
          <tr>
            <th className="mid num">When</th>
            <th className="mid">Who</th>
            <th className="pwrapcol">Said</th>
            {!stageId && <th className="mid">Stage</th>}
            <th className="mid">Tag</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} data-update={r.id}>
              <td className="mid num prole">{fmtDT(r.when)}</td>
              <td className="mid prole">{r.who || <span className="pmuted">—</span>}</td>
              <th scope="row" className="pwrap pwrapcol">
                {r.kind === 'risk' && <span className="ppill risk">Risk</span>}
                {r.kind === 'handover' && <span className="ppill ok">Handover</span>}
                {r.kind === 'reply' && <span className="ppill">Reply</span>}
                {r.text}
              </th>
              {!stageId && (
                <td className="mid prole">
                  {r.stageId ? (
                    <Link href={`/p/${projectId}/stage/${r.stageId}/updates`}>
                      {titleOf(r.stageId)}
                    </Link>
                  ) : (
                    <span className="pmuted">—</span>
                  )}
                </td>
              )}
              <td className="mid">
                {r.ref ? <span className="pref">{r.ref}</span> : <span className="pmuted">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );

  if (stageId) return table;

  return (
    <>
      <header className="pview-head">
        <h1 className="pview-title">Updates</h1>
        <span className="pview-count">{rows.length}</span>
      </header>
      <div className="pview-body">{table}</div>
    </>
  );
}
