'use client';

import Link from 'next/link';
import { useState } from 'react';
import { actionSummary, filterActions, isActionOpen, type ActionFilter } from '@/lib/meetings/followUp';
import { ACTION_VIEWS, type ActionViewSlug } from '@/lib/meetings/tabs';
import { ME, useMeetingStore } from '@/store/meetingStore';
import { useAppStore } from '@/store/useAppStore';
import { SaveErrorBanner } from './atoms';
import { ActionFilters, ActionItemsTable } from './ActionItems';
import { MeetingsTabs } from './MeetingsTabs';

/**
 * Every action item on the programme, opened from the Action Items tab or an
 * Upcoming summary.
 *
 * The rows are the meetings' own: editing one here edits it in the meeting it
 * came from, because it is the same row.
 */
export function ActionsPage({ projectId, view }: { projectId: string; view: ActionViewSlug }) {
  const hydrated = useMeetingStore((s) => s.hydrated);
  const actions = useMeetingStore((s) => s.actions);
  const today = useAppStore((s) => s.today);
  const [filter, setFilter] = useState<ActionFilter>({});
  const base = `/p/${projectId}/meetings`;

  const summary = actionSummary(actions, ME, today);
  const counts: Record<ActionViewSlug, number> = {
    mine: summary.myOpen,
    overdue: summary.overdue,
    blocked: summary.blocked,
    due_soon: summary.dueSoon,
    all: actions.length,
  };
  const list = filterActions(actions, { ...filter, view }, ME, today);
  const owners = [...new Set(actions.map((a) => a.owner).filter(Boolean))].sort();
  const title = ACTION_VIEWS.find((v) => v.slug === view)?.label ?? 'Action items';

  return (
    <>
      <div className="hd">
        <Link className="crumb" href={base}>
          Meetings
        </Link>
        <span className="crumb sep">/</span>
        <h1>{title}</h1>
        <span className="pill" data-action-count>
          {list.length}
        </span>
        <span style={{ flexGrow: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          {actions.filter(isActionOpen).length} open across the program
        </span>
      </div>
      <SaveErrorBanner />
      <MeetingsTabs projectId={projectId} current="actions" />
      <div className="chips mt-chips" role="navigation" aria-label="Action item views">
        {ACTION_VIEWS.map((v) => (
          <Link key={v.slug} href={`${base}/actions?view=${v.slug}`} className={v.slug === view ? 'chip on' : 'chip'} aria-current={v.slug === view ? 'page' : undefined} data-action-view={v.slug}>
            {v.label} <span style={{ opacity: 0.65 }}>{counts[v.slug]}</span>
          </Link>
        ))}
      </div>
      <div className="filterbar" style={{ height: 'auto', minHeight: 38, flexWrap: 'wrap', padding: '8px 20px', gap: 7 }}>
        <ActionFilters value={filter} onChange={setFilter} owners={owners} />
      </div>
      {!hydrated ? (
        <div className="empty" role="status">
          <p className="mono-note">Loading action items…</p>
        </div>
      ) : (
        <ActionItemsTable
          list={list}
          projectId={projectId}
          empty={
            view === 'mine'
              ? 'Nothing is open with your name on it.'
              : view === 'overdue'
                ? 'No action item is past its due date.'
                : view === 'blocked'
                  ? 'Nothing is blocked.'
                  : view === 'due_soon'
                    ? 'Nothing is due in the next three days.'
                    : 'No action items yet. They are raised in meetings.'
          }
        />
      )}
    </>
  );
}
