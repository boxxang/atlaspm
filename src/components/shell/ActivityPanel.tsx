'use client';

import Link from 'next/link';
import { fmtDate } from '@/lib/schedule';
import { detailActivityTitles, detailDeliverables } from '@/data/activityIndex';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { useActivitySteps } from './useStageSteps';

/**
 * One activity, in the rail: where it has got to, when it runs, and the key
 * deliverables it hands over.
 *
 * The write-up itself is a page of its own — a megabyte of prose lives on the
 * server, and the rail is not where you read it — so this links to it rather
 * than trying to summarise it.
 */
export function ActivityPanel({ act, projectId }: { act: string; projectId: string }) {
  const a = useActivitySteps(act);
  const deliverables = useAppStore((s) => s.deliverables);
  /* And closing an activity goes back to the stage that runs it. */
  const close = () =>
    useRailStore.setState({ selection: { kind: 'stage', stageId: a?.activity.stageId ?? '' } });

  if (!a) return null;

  const first = a.steps[0];
  const last = a.steps[a.steps.length - 1];
  /* Matched by reference rather than by title: the two seed lists word some
     deliverables differently, and a ref cannot drift. */
  const rows = deliverables[a.activity.stageId] ?? [];
  const handsOver = a.delivers.map(([ref, how]) => ({
    ref,
    how,
    title: detailDeliverables[ref] ?? ref,
    row: rows.find((d) => d.title === detailDeliverables[ref]) ?? null,
  }));

  return (
    <>
      <header className="peek-hd">
        <span className="ref">{a.ref}</span>
        <h2 className="cap">Activity</h2>
        <button type="button" className="btn sm" onClick={close} aria-label="Close details">
          ×
        </button>
      </header>

      <h3 className="peek-title">{detailActivityTitles[act] ?? act}</h3>

      <dl className="props">
        <dt>On step</dt>
        <dd>
          {a.state.done} of {a.state.total}
        </dd>
        <dt>Lead role</dt>
        <dd>{a.activity.role || '—'}</dd>
        <dt>Runs</dt>
        <dd>{first && last ? `${fmtDate(first.start)} → ${fmtDate(last.end)}` : '—'}</dd>
        <dt>Write-up</dt>
        <dd>
          <Link href={`/p/${projectId}/activity/${a.ref}`}>Read {a.ref} →</Link>
        </dd>
      </dl>

      {handsOver.length > 0 && (
        <section className="sec-block">
          <div className="sec-cap">
            <span>Key deliverables</span>
            <span className="num">{handsOver.filter((h) => h.row?.done).length}/{handsOver.length}</span>
          </div>
          <ul className="attlist">
            {handsOver.map((h) => (
              <li key={h.ref}>
                <span className="ref">{h.ref}</span>
                <span className="listtitle">{h.title}</span>
                <span className="mono-note">
                  {a.ref} {h.how} it
                  {h.row?.due ? ` · due ${fmtDate(h.row.due)}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
