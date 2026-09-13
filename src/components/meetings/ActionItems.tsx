'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  actionsOfMeeting,
  actionWarnings,
  carryOverCandidates,
  filterActions,
  nextInSeries,
  type ActionFilter,
  type ActionTiming,
} from '@/lib/meetings/followUp';
import { parseStepRef, viewLink } from '@/lib/meetings/links';
import {
  ACTION_STATUS_LABEL,
  ACTION_STATUSES,
  ACTION_TYPE_LABEL,
  ACTION_TYPES,
  PRIORITIES,
  PRIORITY_LABEL,
  SCHEDULE_IMPACT_LABEL,
  SCHEDULE_IMPACTS,
  type ActionItem,
  type ActionStatus,
  type ActionType,
  type Meeting,
  type Priority,
  type ScheduleImpact,
} from '@/lib/meetings/types';
import { fmtZonedDate } from '@/lib/meetings/zonedTime';
import { fmtDate, fromISO, toISO } from '@/lib/schedule';
import { ME, useMeetingStore } from '@/store/meetingStore';
import { useAppStore } from '@/store/useAppStore';
import { ctVar, CTHead, type Col } from '../shell/ctable';
import { Avatar, IconPlus } from '../shell/icons';
import { ActionStatusPill, Empty, Field, LinkChips, PersonInput, PriorityPill, TimingPill } from './atoms';
import { blankAction } from './blank';
import { ConvertStepDialog } from './ConvertStepDialog';
import { FilesList } from './FilesTab';
import { LinkPicker } from './LinkPicker';
import { PeopleField } from './PeopleField';
import { useLinkContext } from './useLinkContext';
import { usePeople } from './usePeople';

const COLS: Col[] = [
  ['status', 104, 'STATUS'],
  ['action', null, 'ACTION ITEM'],
  ['owner', 150, 'OWNER'],
  ['due', 116, 'DUE'],
  ['priority', 84, 'PRIORITY'],
];

const TYPE_HINT: Record<ActionType, string> = {
  support:
    'Work that helps an existing step get done. It is linked to that step; no new step is created, and finishing this does not finish the step.',
  new_step:
    'New work the meeting found. It becomes a step on its activity only when you convert it, which shows what that does to the plan first.',
  standalone: 'A follow-up that does not belong on the plan — sharing a document, confirming who owns something.',
};

/**
 * Action items as a list: what, who, when, how urgent, and where each came
 * from. Opening one edits it in place under its row, the way a note opens on
 * a stage's key-info board.
 */
export function ActionItemsTable({
  list,
  projectId,
  empty,
  sourceOtherThan,
}: {
  list: readonly ActionItem[];
  projectId: string;
  empty: React.ReactNode;
  /** Name the source meeting only when it is not this one. */
  sourceOtherThan?: string;
}) {
  const meetings = useMeetingStore((s) => s.meetings);
  const today = useAppStore((s) => s.today);
  const { ctx } = useLinkContext();
  const [open, setOpen] = useState<string | null>(null);

  if (list.length === 0) return <Empty>{empty}</Empty>;
  const base = `/p/${projectId}/meetings`;

  return (
    <div className={open ? 'ctable focused' : 'ctable'} style={{ ['--ct' as string]: ctVar(COLS) }} data-actions-table data-board-stack>
      <CTHead cols={COLS} />
      {list.map((a) => {
        const isOpen = open === a.id;
        const source = meetings.find((m) => m.id === a.meetingId);
        const into = meetings.find((m) => m.id === a.carriedToMeetingId);
        const warnings = actionWarnings(a);
        const toggle = () => setOpen(isOpen ? null : a.id);
        return (
          <div key={a.id} style={{ display: 'contents' }}>
            <div
              className={isOpen ? 'trow open' : 'trow'}
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              data-action={a.id}
              onClick={toggle}
              onKeyDown={(e) => {
                if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  toggle();
                }
              }}
              style={{ alignItems: 'start', paddingTop: 9, paddingBottom: 9, cursor: 'pointer' }}
            >
              <span style={{ marginTop: 1 }}>
                <ActionStatusPill status={a.status} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span className="wrapcell" style={{ display: 'block', fontWeight: 550, lineHeight: 1.45 }}>
                  {a.description}
                </span>
                <span className="mt-meta">
                  <span>{ACTION_TYPE_LABEL[a.actionType]}</span>
                  {warnings.map((w) => (
                    <span key={w} className="pill risk" style={{ fontSize: 10 }} data-warning={w}>
                      {w}
                    </span>
                  ))}
                  {a.status === 'blocked' && a.blocker && (
                    <span className="ell" style={{ maxWidth: 300 }}>
                      Blocked: {a.blocker}
                    </span>
                  )}
                  {a.scheduleImpact && a.scheduleImpact !== 'none' && (
                    <span className="pill warn" style={{ fontSize: 10 }}>
                      {SCHEDULE_IMPACT_LABEL[a.scheduleImpact]}
                    </span>
                  )}
                  {a.convertedStep && (
                    <span className="pill acc" style={{ fontSize: 10 }} data-converted>
                      Became {a.convertedStep.act} step {a.convertedStep.n}
                    </span>
                  )}
                </span>
                {((source && source.id !== sourceOtherThan) || into) && (
                  <span className="mt-meta" onClick={(e) => e.stopPropagation()}>
                    {source && source.id !== sourceOtherThan && (
                      <>
                        from <Link href={`${base}/${source.id}?tab=actions`}>{source.title}</Link>
                        <span className="num">{fmtZonedDate(source.startsAt, source.timeZone)}</span>
                      </>
                    )}
                    {into && into.id !== sourceOtherThan && (
                      <>
                        · carried into <Link href={`${base}/${into.id}?tab=actions`}>{into.title}</Link>
                      </>
                    )}
                  </span>
                )}
                {a.links.length > 0 && (
                  <span style={{ display: 'block', marginTop: 5 }} onClick={(e) => e.stopPropagation()}>
                    <LinkChips links={a.links} projectId={projectId} ctx={ctx} max={3} />
                  </span>
                )}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, marginTop: 1 }}>
                {a.owner ? (
                  <>
                    <Avatar name={a.owner} small />
                    <span className="ell" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                      {a.owner}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>No owner</span>
                )}
              </span>
              <span style={{ marginTop: 1 }}>
                <span className="num" style={{ fontSize: 12.5, display: 'block' }}>
                  {a.due ? fmtDate(a.due) : '—'}
                </span>
                <span style={{ display: 'block', marginTop: 3 }}>
                  <TimingPill action={a} today={today} />
                </span>
              </span>
              <span style={{ marginTop: 1 }}>
                <PriorityPill priority={a.priority} />
              </span>
            </div>
            {isOpen && (
              <div className="notewrap">
                <ActionEditor action={a} projectId={projectId} onDone={() => setOpen(null)} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Owner, status, priority and due-date filters, and a search. */
export function ActionFilters({
  value,
  onChange,
  owners,
}: {
  value: ActionFilter;
  onChange: (f: ActionFilter) => void;
  owners: readonly string[];
}) {
  const set = (p: Partial<ActionFilter>) => onChange({ ...value, ...p });
  return (
    <>
      <input className="lnkin" style={{ width: 200, flexGrow: 0 }} placeholder="Search actions…" aria-label="Search actions" value={value.query ?? ''} onChange={(e) => set({ query: e.target.value })} />
      <select className="lnkin" style={{ flexGrow: 0 }} aria-label="Action owner" value={value.owner ?? ''} onChange={(e) => set({ owner: e.target.value })}>
        <option value="">Any owner</option>
        {owners.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <select className="lnkin" style={{ flexGrow: 0 }} aria-label="Action status" value={value.status ?? ''} onChange={(e) => set({ status: e.target.value as ActionStatus | '' })}>
        <option value="">Any status</option>
        {ACTION_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ACTION_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <select className="lnkin" style={{ flexGrow: 0 }} aria-label="Action priority" value={value.priority ?? ''} onChange={(e) => set({ priority: e.target.value as Priority | '' })}>
        <option value="">Any priority</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABEL[p]}
          </option>
        ))}
      </select>
      <select className="lnkin" style={{ flexGrow: 0 }} aria-label="Due" value={value.timing ?? ''} onChange={(e) => set({ timing: e.target.value as ActionTiming | '' })}>
        <option value="">Any due date</option>
        <option value="overdue">Overdue</option>
        <option value="due_soon">Due within 3 days</option>
        <option value="on_track">Due later</option>
        <option value="no_due">No due date</option>
        <option value="closed">Closed</option>
      </select>
    </>
  );
}

/** A meeting's action items: raised here, and carried in from earlier sittings. */
export function ActionItemsTab({ meeting, projectId }: { meeting: Meeting; projectId: string }) {
  const actions = useMeetingStore((s) => s.actions);
  const meetings = useMeetingStore((s) => s.meetings);
  const carryActions = useMeetingStore((s) => s.carryActions);
  const today = useAppStore((s) => s.today);
  const [filter, setFilter] = useState<ActionFilter>({});
  const [draft, setDraft] = useState<ActionItem | null>(null);
  const [carried, setCarried] = useState('');

  const mine = actionsOfMeeting(meeting.id, actions);
  const list = filterActions(mine, filter, ME, today);
  const owners = [...new Set(mine.map((a) => a.owner).filter(Boolean))].sort();
  const candidates = carryOverCandidates(meeting.id, actions);
  const targets = meetings
    .filter((m) => m.id !== meeting.id && (m.status === 'scheduled' || m.status === 'draft' || m.status === 'in_progress') && m.startsAt > meeting.startsAt)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  const next = nextInSeries(meeting, meetings);
  const [target, setTarget] = useState('');
  const chosen = target || (next && targets.some((t) => t.id === next.id) ? next.id : (targets[0]?.id ?? ''));

  return (
    <div data-actions-tab>
      <div className="filterbar" style={{ height: 'auto', minHeight: 38, flexWrap: 'wrap', padding: '8px 20px', gap: 7 }}>
        <button type="button" className="btn pri sm" data-new-action onClick={() => setDraft(blankAction(projectId, meeting.id))}>
          <IconPlus light />
          New action item
        </button>
        <ActionFilters value={filter} onChange={setFilter} owners={owners} />
        <span style={{ flexGrow: 1 }} />
        <span className="num" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          {list.length === mine.length ? `${mine.length} action items` : `${list.length} of ${mine.length}`}
        </span>
      </div>

      {candidates.length > 0 && (
        <div className="filterbar" style={{ height: 'auto', minHeight: 38, flexWrap: 'wrap', padding: '8px 20px', gap: 7, background: 'var(--sunken)' }} data-carry-bar>
          <span style={{ fontSize: 12.5 }}>
            {candidates.length} open action item{candidates.length === 1 ? '' : 's'} can be carried to a later meeting.
          </span>
          {targets.length > 0 ? (
            <>
              <select className="lnkin" style={{ flexGrow: 0, maxWidth: 320 }} aria-label="Carry into" value={chosen} onChange={(e) => setTarget(e.target.value)}>
                {targets.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} · {fmtZonedDate(m.startsAt, m.timeZone)}
                    {m.id === next?.id ? ' (next in series)' : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn sm"
                data-carry
                onClick={() => {
                  carryActions(candidates.map((a) => a.id), chosen);
                  const t = targets.find((m) => m.id === chosen);
                  setCarried(`Carried ${candidates.length} into ${t?.title ?? 'the next meeting'}. They still belong to this meeting.`);
                }}
              >
                Carry {candidates.length} over
              </button>
            </>
          ) : (
            <span className="mono-note">There is no later meeting to carry them into — schedule the next sitting first.</span>
          )}
        </div>
      )}
      {carried && (
        <p className="mono-note" role="status" style={{ padding: '8px 20px', color: 'var(--ok)' }} data-carried-note>
          {carried}
        </p>
      )}

      {draft && (
        <div style={{ padding: '14px 20px 2px' }}>
          <ActionEditor action={draft} projectId={projectId} isNew onDone={() => setDraft(null)} />
        </div>
      )}

      <ActionItemsTable
        list={list}
        projectId={projectId}
        sourceOtherThan={meeting.id}
        empty={
          mine.length === 0
            ? 'No action items yet. Add one here, or from an agenda item that needs one.'
            : 'No action item matches these filters.'
        }
      />
    </div>
  );
}

/**
 * One action item, edited.
 *
 * An owner and a date are asked for, not demanded: a meeting captures an
 * action before anybody has agreed to it, so the warning stays on the action —
 * and on the meeting's completion checks — until somebody fills them in.
 */
export function ActionEditor({
  action,
  projectId,
  isNew = false,
  onDone,
}: {
  action: ActionItem;
  projectId: string;
  isNew?: boolean;
  onDone: () => void;
}) {
  const saveAction = useMeetingStore((s) => s.saveAction);
  const deleteAction = useMeetingStore((s) => s.deleteAction);
  const stored = useMeetingStore((s) => s.actions.find((a) => a.id === action.id));
  const meetings = useMeetingStore((s) => s.meetings);
  const agenda = useMeetingStore((s) => s.agenda);
  const people = usePeople();
  const { options, ctx } = useLinkContext();
  const [d, setD] = useState<ActionItem>(action);
  const [asking, setAsking] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const set = (p: Partial<ActionItem>) => setD((x) => ({ ...x, ...p }));

  const warnings = actionWarnings(d);
  const source = meetings.find((m) => m.id === d.meetingId);
  const items = agenda.filter((a) => a.meetingId === d.meetingId).sort((a, b) => a.position - b.position);
  const work = d.links.filter((l) => l.type === 'step' || l.type === 'activity');
  const converted = stored?.convertedStep ?? null;

  const save = () => {
    if (!d.description.trim()) return setError('Say what the action is.');
    setError('');
    saveAction({ ...d, description: d.description.trim(), owner: d.owner.trim() });
    onDone();
  };

  return (
    <div className="notecard" data-action-editor={d.id}>
      <div className="notecard-hd">
        <span className="cap">{isNew ? 'New action item' : 'Action item'}</span>
        {source && (
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            from{' '}
            <Link href={`/p/${projectId}/meetings/${source.id}`}>{source.title}</Link>
          </span>
        )}
        <span style={{ flexGrow: 1 }} />
        {!isNew && !asking && (
          <button type="button" className="btn sm dng" onClick={() => setAsking(true)}>
            Delete
          </button>
        )}
      </div>
      <div className="notecard-body" style={{ maxWidth: 'none' }}>
        {warnings.length > 0 && (
          <div className="mt-warn" role="status" data-action-warnings style={{ alignItems: 'center', marginBottom: 4 }}>
            {warnings.map((w) => (
              <span key={w} className="pill risk" style={{ fontSize: 10.5 }}>
                {w}
              </span>
            ))}
            <span className="mono-note">An action nobody owns, or that has no date, is the one that does not happen.</span>
          </div>
        )}

        <Field label="Description" required>
          <textarea className="mt-text" autoFocus={isNew} aria-label="Action description" value={d.description} onChange={(e) => set({ description: e.target.value })} />
        </Field>

        <div className="mt-grid2">
          <Field label="Accountable owner" hint="One person, answerable for it.">
            <PersonInput value={d.owner} onChange={(v) => set({ owner: v })} people={people} label="Accountable owner" hook="action-owner" />
          </Field>
          <Field label="Due date">
            <input type="date" className="dateinp" aria-label="Due date" value={d.due ? toISO(d.due) : ''} onChange={(e) => set({ due: e.target.value ? fromISO(e.target.value) : null })} />
          </Field>
        </div>

        <Field label="Contributors" group>
          <PeopleField
            value={d.contributors.map((name) => ({ name, optional: false }))}
            onChange={(list) => set({ contributors: list.map((p) => p.name) })}
            people={people}
            label="Contributors"
          />
        </Field>

        <div className="mt-grid2">
          <Field label="Priority">
            <select className="lnkin" aria-label="Priority" value={d.priority} onChange={(e) => set({ priority: e.target.value as Priority })}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select className="lnkin" aria-label="Action status value" value={d.status} onChange={(e) => set({ status: e.target.value as ActionStatus })}>
              {ACTION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ACTION_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {d.status === 'done' && work.length > 0 && (
          <p className="mono-note" role="note" data-done-note style={{ margin: '4px 0 8px' }}>
            Marking this done does not complete{' '}
            {work.map((l, i) => {
              const v = viewLink(l, projectId, ctx);
              const s = l.type === 'step' ? parseStepRef(l.ref) : null;
              return (
                <span key={`${l.type}:${l.ref}`}>
                  {i > 0 && ', '}
                  {v.href ? <Link href={v.href}>{s ? `${s.act} step ${s.n}` : l.ref}</Link> : v.tag}
                </span>
              );
            })}
            . Update the step on its stage if that work is finished too.
          </p>
        )}

        <Field label="Action type" hint={TYPE_HINT[d.actionType]}>
          <select className="lnkin" aria-label="Action type" value={d.actionType} onChange={(e) => set({ actionType: e.target.value as ActionType })}>
            {ACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACTION_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
          {d.actionType === 'new_step' &&
            (converted ? (
              <span className="pill acc" style={{ fontSize: 10.5 }} data-converted>
                Became {converted.act} step {converted.n}
              </span>
            ) : isNew || !stored ? (
              <span className="mono-note">Save the action first, then convert it.</span>
            ) : (
              <button type="button" className="btn sm" data-convert onClick={() => setConverting(true)}>
                Convert to a new step…
              </button>
            ))}
        </Field>

        {items.length > 0 && (
          <Field label="Source agenda item">
            <select className="lnkin" aria-label="Source agenda item" value={d.agendaItemId ?? ''} onChange={(e) => set({ agendaItemId: e.target.value || null })}>
              <option value="">None</option>
              {items.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.position + 1}. {a.title}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Related items" hint="The step it supports, the activity, the risk or deliverable it is about." group>
          <LinkPicker value={d.links} onChange={(links) => set({ links })} options={options} ctx={ctx} projectId={projectId} label="Action related items" />
        </Field>

        <div className="mt-grid2">
          <Field label="Blocker" hint="What it is waiting on, when it is blocked.">
            <textarea className="mt-text" style={{ minHeight: 52 }} aria-label="Blocker" value={d.blocker} onChange={(e) => set({ blocker: e.target.value })} />
          </Field>
          <Field label="Escalation date">
            <input type="date" className="dateinp" aria-label="Escalation date" value={d.escalationDate ? toISO(d.escalationDate) : ''} onChange={(e) => set({ escalationDate: e.target.value ? fromISO(e.target.value) : null })} />
          </Field>
        </div>

        <div className="mt-grid2">
          <Field label="Schedule impact" hint="Recorded, never applied: no step, activity or baseline date moves because of it.">
            <select className="lnkin" aria-label="Schedule impact" value={d.scheduleImpact} onChange={(e) => set({ scheduleImpact: e.target.value as ScheduleImpact | '' })}>
              <option value="">Not stated</option>
              {SCHEDULE_IMPACTS.map((s) => (
                <option key={s} value={s}>
                  {SCHEDULE_IMPACT_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Impact note" hint="If the plan has to move, move it on the stage; this app has no change-request flow yet.">
            <textarea className="mt-text" style={{ minHeight: 52 }} aria-label="Impact note" value={d.impactNote} onChange={(e) => set({ impactNote: e.target.value })} />
          </Field>
        </div>

        <Field label="Completion evidence" hint="What shows it is done: a result, a summary, where it was sent.">
          <textarea className="mt-text" style={{ minHeight: 52 }} aria-label="Completion evidence" value={d.evidence} onChange={(e) => set({ evidence: e.target.value })} />
        </Field>
        {stored && (
          <div style={{ padding: '6px 0 12px' }}>
            <FilesList owner={{ actionItemId: d.id }} defaultCategory="evidence" title="Evidence files" />
          </div>
        )}

        <div className="mt-grid2">
          <Field label="Verified by">
            <PersonInput value={d.verifiedBy} onChange={(v) => set({ verifiedBy: v })} people={people} label="Verified by" />
          </Field>
          <Field label="Completed on" hint={d.status === 'done' ? 'Today, unless you say otherwise.' : 'Set when it is Done.'}>
            <input
              type="date"
              className="dateinp"
              aria-label="Completed on"
              disabled={d.status !== 'done'}
              value={d.completedAt ? toISO(d.completedAt) : ''}
              onChange={(e) => set({ completedAt: e.target.value ? fromISO(e.target.value) : null })}
            />
          </Field>
        </div>

        {asking ? (
          <div className="delconf">
            Delete this action item and its evidence?
            <span style={{ flexGrow: 1 }} />
            <button type="button" className="btn sm" onClick={() => setAsking(false)}>
              Keep
            </button>
            <button
              type="button"
              className="btn sm dng"
              onClick={() => {
                deleteAction(d.id);
                onDone();
              }}
            >
              Delete
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 7, marginTop: 12, alignItems: 'center' }}>
            {error && (
              <span role="alert" style={{ fontSize: 12, color: 'var(--risk)' }}>
                {error}
              </span>
            )}
            <span style={{ flexGrow: 1 }} />
            <button type="button" className="btn sm" onClick={onDone}>
              Cancel
            </button>
            <button type="button" className="btn pri sm" data-save-action onClick={save}>
              {isNew ? 'Add action item' : 'Save'}
            </button>
          </div>
        )}
      </div>
      {converting && stored && <ConvertStepDialog action={stored} projectId={projectId} onClose={() => setConverting(false)} />}
    </div>
  );
}
