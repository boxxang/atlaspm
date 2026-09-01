'use client';

import { useProgramActivities } from './useProgramActivities';
import { detailActivityTitles } from '@/data/activityIndex';
import { fmtDT } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { Avatar } from './icons';

/**
 * Everything said on the programme, newest first.
 *
 * Both kinds: posts on steps, notes, handovers and their replies, and the
 * updates filed against the communication board's entries. They are different
 * tables — the second is the older board's — and this is the one screen that
 * has to show them together, because "what has been said lately" does not care
 * which.
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

  const activitySteps = useProgramActivities();
    const stageOfAct = (ref: string | null) => (ref ? (activitySteps[ref]?.st ?? null) : null);

  const fromPosts = posts.map((p) => ({
    id: p.id,
    at: p.editedAt ?? p.createdAt,
    who: p.author,
    text: p.text,
    stageId: p.stageId ?? stageOfAct(p.activityRef),
    act: p.activityRef,
    stepN: p.stepN,
    /* What the update is about, which is the line the mockup puts under the
       name: a feed of texts with no subject reads as a chat log. */
    title: p.activityRef ? (detailActivityTitles[p.activityRef] ?? p.activityRef) : null,
    risk: p.kind === 'risk',
    edited: !!p.editedAt,
  }));
  const fromItems = Object.entries(content).flatMap(([id, c]) =>
    (['keyinfo', 'activities', 'risks'] as const).flatMap((k) =>
      c[k].flatMap((it) =>
        it.updates.map((u) => ({
          id: u.id,
          at: u.date,
          who: it.owner,
          text: u.text,
          stageId: id,
          act: null as string | null,
          stepN: null as number | null,
          title: it.title as string | null,
          risk: k === 'risks',
          edited: false,
        })),
      ),
    ),
  );

  const rows = [...fromPosts, ...fromItems]
    .filter((r) => !stageId || r.stageId === stageId)
    .sort((a, b) => b.at.getTime() - a.at.getTime());

  const shortOf = (id: string | null) => stages.find((s) => s.id === id)?.shortTitle;

  const feed =
    rows.length === 0 ? (
      <div className="empty">
        <p className="mono-note">Nothing has been said here yet.</p>
      </div>
    ) : (
      rows.map((p) => (
        <div key={p.id} className="feedrow ovfeed" data-update={p.id}>
          <Avatar name={p.who || '—'} />
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
              <b style={{ fontSize: 13 }}>{p.who || '—'}</b>
              {shortOf(p.stageId) && (
                <span className="pill" style={{ fontSize: 10.5 }}>
                  {shortOf(p.stageId)}
                </span>
              )}
              {p.act && <span className="ref">{p.act}</span>}
              {p.stepN != null && (
                <span className="pill acc" style={{ fontSize: 10.5 }}>
                  STEP {p.stepN}
                </span>
              )}
              <span className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                {fmtDT(p.at)}
              </span>
              {p.risk && <span className="dot" style={{ background: 'var(--risk)' }} />}
              {p.edited && <span className="edited">edited</span>}
            </div>
            {p.title && (
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{p.title}</div>
            )}
            <div
              /* the whole body, as it was typed — this row is not a preview */
              style={{
                fontSize: 13,
                color: 'var(--ink-2)',
                marginTop: 1,
                lineHeight: 1.45,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
              }}
            >
              {p.text}
            </div>
          </div>
        </div>
      ))
    );

  if (stageId) return <>{feed}</>;

  return (
    <>
      <div className="hd">
        <h1>Updates</h1>
        <span className="pill">{rows.length}</span>
      </div>
      {feed}
    </>
  );
}
