'use client';

import Link from 'next/link';
import { detailActivityTitles } from '@/data/activityIndex';
import { fmtDate } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { useProgramWork } from './useProgramWork';

/**
 * Every open risk on the programme.
 *
 * A risk is a post flagged on a step, so each row is that step: which activity,
 * which step, what was said, and how long it has gone unanswered. The replies
 * sit underneath it indented, because how a risk was argued down is the part
 * worth reading and a board that hides it is a board of headlines.
 *
 * No stage column. Every row already carries its activity reference, and the
 * reference says which stage it is — a column repeating that is a column of
 * noise.
 *
 * Ordered by how long it has gone unanswered, longest first. The resolver hands
 * them back newest-first, which is right for a thread and wrong for a list of
 * what needs answering: the risk nobody has touched since February is the one
 * to read.
 */
export function RisksPage({ projectId }: { projectId: string }) {
  const { risks: found } = useProgramWork();
  const risks = [...found].sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
  const posts = useAppStore((s) => s.posts);
  const today = useAppStore((s) => s.today);

  const repliesOf = (postId: string) =>
    posts
      .filter((p) => p.parentId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return (
    <>
      <header className="pview-head">
        <h1 className="pview-title">Risks</h1>
        <span className="pview-count">{risks.length}</span>
        <span className="pview-spacer" />
        <span className="pview-note">
          Flagged on a step, and answered by handing that step over.
        </span>
      </header>

      <div className="pview-body">
        {risks.length === 0 ? (
          <p className="pview-todo">Nothing is flagged. Every step carrying a risk is done.</p>
        ) : (
          <table className="ptable pboard">
            <thead>
              <tr>
                <th className="mid">Activity</th>
                <th className="mid pnarrow">Step</th>
                <th className="pwrapcol">Risk</th>
                <th className="mid">Status</th>
                <th className="mid num">Quiet for</th>
                <th className="mid">Raised by</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((r) => {
                const replies = repliesOf(r.postId);
                const quiet = daysSince(r.updatedAt, today);
                return (
                  <tr key={r.id}>
                    <td className="mid">
                      <Link
                        className="pref"
                        href={`/p/${projectId}/stage/${r.stageId}/activity`}
                        title={detailActivityTitles[r.act] ?? r.act}
                      >
                        {r.act}
                      </Link>
                    </td>
                    <td className="mid num pnarrow">{r.stepN ?? '—'}</td>
                    <th scope="row" className="pwrap pwrapcol">
                      {r.title}
                      {replies.length > 0 && (
                        <ul className="preplies">
                          {replies.map((p) => (
                            <li key={p.id}>
                              <span className="preply-who">{p.author}</span>
                              <span className="preply-when">{fmtDate(p.createdAt)}</span>
                              <span className="preply-text">{p.text}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </th>
                    <td className="mid">
                      <span className={quiet > 7 ? 'ppill warn' : 'ppill run'}>
                        {quiet > 7 ? 'Stale' : 'Open'}
                      </span>
                    </td>
                    <td className="mid num">{quiet} days</td>
                    <td className="mid">{r.owner || 'Unassigned'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

const DAY = 864e5;
const daysSince = (d: Date, today: Date) =>
  Math.max(0, Math.round((today.getTime() - d.getTime()) / DAY));
