'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useProgramActivities } from './useProgramActivities';
import { ALL_ACTIVITY_TITLES as detailActivityTitles } from '@/data/builtins';
import { fmtDT } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { Avatar } from './icons';
import { threads, whenSaid, type FeedThread } from '@/lib/updateFeed';
import type { ProgramPost } from '@/lib/projectState';

/**
 * Everything said on the programme, newest first.
 *
 * Both kinds: posts on steps, notes, handovers and their replies, and the
 * updates filed against the communication board's entries. They are different
 * tables — the second is the older board's — and this is the one screen that
 * has to show them together, because "what has been said lately" does not care
 * which.
 *
 * A reply is not a row of its own. It belongs to the post it answers, so the
 * feed lists threads: the post, the newest thing said back, and a click to
 * open the rest. A thread rises to the top when anybody says anything in it —
 * that is what "updates" means to somebody scanning for what moved.
 *
 * The name's line carries what the post is about and the body carries what was
 * said, and nothing sits between them. A post on a step already names its
 * activity and its step in the pills, so printing the activity's title
 * underneath was the same sentence twice; a board update names neither, so its
 * own subject moves up onto that line rather than being dropped. Every pill
 * that can name somewhere is a link to it — the reference to the write-up, the
 * step to the step itself, the stage to the stage — because the reason to read
 * a post in a feed is usually to go to what it is about.
 */
export function UpdatesPage({
  stageId,
  projectId,
}: {
  /** Given, this is the stage's own Updates tab rather than the programme's. */
  stageId?: string;
  projectId: string;
}) {
  const posts = useAppStore((s) => s.posts);
  const content = useAppStore((s) => s.content);
  const stages = useAppStore((s) => s.stages);

  const activitySteps = useProgramActivities();
  const stageOfAct = (ref: string | null) => (ref ? (activitySteps[ref]?.st ?? null) : null);

  /* One row per thread, ordered by when it was last spoken in — a key-info
     note heads no thread, and a reply heads none either. */
  const fromPosts = threads(posts).map((t) => ({
    id: t.root.id,
    at: t.at,
    who: t.root.author,
    text: t.root.text,
    stageId: t.root.stageId ?? stageOfAct(t.root.activityRef),
    act: t.root.activityRef,
    stepN: t.root.stepN,
    /* Only a board update carries one: what a post on a step is about is the
       activity and the step its pills already name. */
    subject: null as string | null,
    risk: t.root.kind === 'risk',
    edited: !!t.root.editedAt,
    thread: t as FeedThread<ProgramPost>,
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
          subject: it.title as string | null,
          risk: k === 'risks',
          edited: false,
          thread: null as FeedThread<ProgramPost> | null,
        })),
      ),
    ),
  );

  const rows = [...fromPosts, ...fromItems]
    .filter((r) => !stageId || r.stageId === stageId)
    .sort((a, b) => b.at.getTime() - a.at.getTime());

  const shortOf = (id: string | null) => stages.find((s) => s.id === id)?.shortTitle;
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  const feed =
    rows.length === 0 ? (
      <div className="empty">
        <p className="mono-note">Nothing has been said here yet.</p>
      </div>
    ) : (
      rows.map((p) => (
        <div
          key={p.id}
          className={p.thread?.replies.length ? 'feedrow ovfeed thr-row' : 'feedrow ovfeed'}
          data-update={p.id}
          data-open={p.thread?.replies.length && open[p.id] ? '' : undefined}
          /* The post opens its own thread, because that is what somebody
             reaches for. Not a link, which has somewhere else to go, and not a
             click that lands after selecting a line of it. */
          onClick={(e) => {
            if (!p.thread?.replies.length) return;
            if ((e.target as HTMLElement).closest('a,button')) return;
            if (window.getSelection()?.toString()) return;
            toggle(p.id);
          }}
        >
          <Avatar name={p.who || '—'} />
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
              <b style={{ fontSize: 13 }}>{p.who || '—'}</b>
              {/* On a stage's own tab every row is that stage's, so the pill
                  would be a label that never varies. */}
              {!stageId && p.stageId && shortOf(p.stageId) && (
                <Link
                  className="pill"
                  style={{ fontSize: 10.5 }}
                  href={`/p/${projectId}/stage/${p.stageId}/activity`}
                  data-stage-pill={p.stageId}
                >
                  {shortOf(p.stageId)}
                </Link>
              )}
              {p.act && (
                <Link
                  className="ref"
                  /* The stage, with the activity open — not the write-up. The
                     write-up describes the template; a post is about this
                     programme's run of it, and the row it belongs to is where
                     the steps, the dates and the state are. */
                  href={
                    p.stageId
                      ? `/p/${projectId}/stage/${p.stageId}/activity?act=${p.act}`
                      : `/p/${projectId}/activity/${p.act}`
                  }
                  /* the name the row no longer prints, for whoever wants it
                     without leaving the feed */
                  title={detailActivityTitles[p.act] ?? p.act}
                  data-ref={p.act}
                >
                  {p.act}
                </Link>
              )}
              {p.stepN != null &&
                (p.act && p.stageId ? (
                  <Link
                    className="pill acc"
                    style={{ fontSize: 10.5 }}
                    /* the step itself, where its state and this thread are —
                       not the write-up, which is about the template — and the
                       post in that thread, which is what was clicked */
                    href={`/p/${projectId}/stage/${p.stageId}/activity?step=${p.act}:${p.stepN}&post=${p.id}`}
                    data-step-link={`${p.act}:${p.stepN}`}
                  >
                    STEP {p.stepN}
                  </Link>
                ) : (
                  <span className="pill acc" style={{ fontSize: 10.5 }}>
                    STEP {p.stepN}
                  </span>
                ))}
              {/* Not a link: an entry on a board has no address of its own to
                  send anybody to. */}
              {p.subject && (
                <span className="pill subject" title={p.subject} data-subject={p.id}>
                  {p.subject}
                </span>
              )}
              <span className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                {fmtDT(p.at)}
              </span>
              {p.risk && <span className="dot" style={{ background: 'var(--risk)' }} />}
              {p.edited && <span className="edited">edited</span>}
            </div>
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
            {p.thread && p.thread.replies.length > 0 && (
              <Thread t={p.thread} open={!!open[p.id]} onToggle={() => toggle(p.id)} />
            )}
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

/**
 * What was said back.
 *
 * Collapsed it shows the newest reply, because that is what somebody scanning
 * the feed is looking for — the answer, not the argument. Open it shows the
 * whole thread in the order it was written, which is the order it makes sense
 * in. The post itself is already above either way: the row prints it in full.
 */
function Thread({
  t,
  open,
  onToggle,
}: {
  t: FeedThread<ProgramPost>;
  open: boolean;
  onToggle: () => void;
}) {
  const n = t.replies.length;
  const shown = open ? t.replies : t.latest ? [t.latest] : [];
  return (
    <div className="thr">
      <button
        type="button"
        className="thr-more"
        aria-expanded={open}
        data-thread-toggle={t.root.id}
        onClick={onToggle}
      >
        {open ? 'Hide replies' : n === 1 ? '1 reply' : `${n} replies`}
        {!open && n > 1 && <span className="thr-n">· showing the latest</span>}
      </button>
      {shown.map((r) => (
        <div key={r.id} className="thr-reply" data-reply={r.id}>
          <Avatar name={r.author || '—'} small />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
              <b style={{ fontSize: 12.5 }}>{r.author || '—'}</b>
              <span className="num" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                {fmtDT(whenSaid(r))}
              </span>
              {r.editedAt && <span className="edited">edited</span>}
            </div>
            <div className="thr-txt">{r.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
