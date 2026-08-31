'use client';

import { guessActivity } from '@/lib/guessActivity';
import { fmtDate } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { ctVar, CTHead, type Col } from './ctable';
import { Avatar, IconMessage, IconPlus } from './icons';
import { useDeliverableRefs } from './useDeliverableRefs';
import { useStageSteps } from './useStageSteps';

/**
 * The communication board: everything people added on this program.
 *
 * The Activity tab holds what the template names; this holds what this program
 * turned out to need — entries with an owner and a date but no steps, because
 * nobody wrote them up in advance. It is where a stage actually gets talked
 * about.
 *
 * MATCHES is the board's one piece of cleverness, and it is deliberately a
 * question: an entry whose wording is close to a template activity offers the
 * link rather than making it, because half these entries are the same work
 * under a different name and the other half only sound like it.
 *
 * The latest update sits under the title. A board of headlines with the news
 * one click away is a board nobody reads twice.
 */
const COLS: Col[] = [
  ['chk', 16, ''],
  ['title', null, 'ENTRY'],
  ['match', 128, 'MATCHES'],
  ['delivers', 108, 'DELIVERS'],
  ['due', 84, 'DUE'],
  ['owner', 120, 'OWNER'],
];

export function CommsTab({ stageId }: { stageId: string }) {
  const items = useAppStore((s) => s.content)[stageId]?.activities ?? [];
  const deliverables = useAppStore((s) => s.deliverables)[stageId] ?? [];
  const today = useAppStore((s) => s.today);
  const activities = useStageSteps(stageId);
  const tagOf = useDeliverableRefs();
  const candidates = activities.map((a) => ({ ref: a.ref, title: a.title }));

  if (items.length === 0) {
    return (
      <div className="empty">
        <IconMessage large />
        <p className="mono-note" style={{ maxWidth: '48ch' }}>
          Nothing added on this program yet. The Activity tab holds the {activities.length}{' '}
          activities the template names; anything else this stage needs to track goes here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="filterbar">
        <button className="btn sm" type="button">
          Status: All
        </button>
        <button className="btn sm" type="button">
          Owner: All
        </button>
        <button className="btn pri sm" type="button">
          <IconPlus light />
          New entry
        </button>
        <span style={{ flexGrow: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          Work this program is tracking that the template does not name
        </span>
      </div>

      <div className="ctable" data-board style={{ ['--ct' as string]: ctVar(COLS) }}>
        <CTHead cols={COLS} />
        {items.map((it) => {
          const late = !it.done && !!it.due && it.due < today;
          const latest = [...it.updates].sort((a, b) => b.date.getTime() - a.date.getTime())[0];
          const guess = guessActivity(it.title, candidates);
          const towards = deliverables.find((d) => d.id === it.deliverableId);
          const ref = towards ? (tagOf.get(towards.id) ?? null) : null;
          return (
            <button
              type="button"
              key={it.id}
              className="trow"
              data-item={it.id}
              style={{ alignItems: 'start', paddingTop: 10, paddingBottom: 10 }}
            >
              <span
                className="dot"
                style={{
                  background: it.done ? 'var(--ok)' : late ? 'var(--risk)' : 'var(--st-run)',
                  marginTop: 5,
                }}
              />
              <span style={{ minWidth: 0 }}>
                <span
                  className="wrapcell"
                  style={{ display: 'block', fontWeight: 500, textAlign: 'left', lineHeight: 1.4 }}
                >
                  {it.title}
                </span>
                {latest ? (
                  <span
                    style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 3 }}
                  >
                    <IconMessage />
                    <span
                      className="num"
                      style={{ fontSize: 11, color: 'var(--ink-4)', flexShrink: 0 }}
                    >
                      {fmtDate(latest.date)}
                    </span>
                    <span
                      className="wrapcell"
                      style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.4 }}
                    >
                      {latest.text}
                    </span>
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'block',
                      fontSize: 12,
                      color: 'var(--ink-4)',
                      marginTop: 3,
                      textAlign: 'left',
                    }}
                  >
                    No updates yet
                  </span>
                )}
              </span>
              <span style={{ justifySelf: 'start' }}>
                {guess ? (
                  <span className="pill acc" style={{ fontSize: 10.5 }}>
                    {guess} · link?
                  </span>
                ) : (
                  <span style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>—</span>
                )}
              </span>
              <span style={{ justifySelf: 'start', minWidth: 0 }}>
                {towards ? (
                  ref ? (
                    <span className="pill" style={{ fontSize: 10.5 }} title={towards.title}>
                      {ref}
                    </span>
                  ) : (
                    <span
                      className="ell"
                      style={{ fontSize: 11.5, color: 'var(--ink-3)' }}
                      title={towards.title}
                    >
                      {towards.title}
                    </span>
                  )
                ) : (
                  <span style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>—</span>
                )}
              </span>
              <span
                className="num"
                style={{ fontSize: 12.5, color: late ? 'var(--risk)' : 'var(--ink-2)' }}
              >
                {it.due ? fmtDate(it.due) : '—'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                {it.owner && (
                  <>
                    <Avatar name={it.owner} small />
                    <span className="ell" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                      {it.owner}
                    </span>
                  </>
                )}
              </span>
            </button>
          );
        })}
        <div className="trow" style={{ color: 'var(--ink-4)' }}>
          <span />
          <span>Add an entry this stage needs to track…</span>
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </>
  );
}
