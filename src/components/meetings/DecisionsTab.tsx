'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  DECISION_STATUS_LABEL,
  DECISION_STATUSES,
  type Decision,
  type DecisionStatus,
  type Meeting,
} from '@/lib/meetings/types';
import { fmtDate, fromISO, toISO } from '@/lib/schedule';
import { useMeetingStore } from '@/store/meetingStore';
import { ctVar, CTHead, type Col } from '../shell/ctable';
import { Avatar, IconPlus } from '../shell/icons';
import { DecisionStatusPill, Empty, Field, LinkChips, PersonInput } from './atoms';
import { blankDecision } from './blank';
import { FilesList } from './FilesTab';
import { LinkPicker } from './LinkPicker';
import { useLinkContext } from './useLinkContext';
import { usePeople } from './usePeople';

const COLS: Col[] = [
  ['status', 104, 'STATUS'],
  ['title', null, 'DECISION'],
  ['owner', 150, 'OWNER'],
  ['date', 100, 'DECIDED'],
];

/**
 * What a meeting decided.
 *
 * The decision belongs to this meeting, and the activity, step or deliverable
 * it is about lists the same row — linking is how it gets there, not copying.
 * Approving one that supersedes another marks the other Superseded.
 */
export function DecisionsTab({ meeting, projectId }: { meeting: Meeting; projectId: string }) {
  const decisions = useMeetingStore((s) => s.decisions);
  const agenda = useMeetingStore((s) => s.agenda);
  const { ctx } = useLinkContext();
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState<Decision | null>(null);
  const list = decisions
    .filter((d) => d.meetingId === meeting.id)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return (
    <div data-decisions-tab>
      <div className="filterbar">
        <button type="button" className="btn pri sm" data-new-decision onClick={() => setDraft(blankDecision(projectId, meeting.id, { decidedOn: meeting.startsAt }))}>
          <IconPlus light />
          New decision
        </button>
        <span style={{ flexGrow: 1 }} />
        <span className="num" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          {list.length} decision{list.length === 1 ? '' : 's'} · {list.filter((d) => d.status === 'proposed').length} proposed
        </span>
      </div>

      {draft && (
        <div style={{ padding: '14px 20px 2px' }}>
          <DecisionEditor decision={draft} projectId={projectId} isNew onDone={() => setDraft(null)} />
        </div>
      )}

      {list.length === 0 ? (
        <Empty>No decisions recorded. Record one here, or from the agenda item it came out of.</Empty>
      ) : (
        <div className={open ? 'ctable focused' : 'ctable'} style={{ ['--ct' as string]: ctVar(COLS) }} data-decisions-table data-board-stack>
          <CTHead cols={COLS} />
          {list.map((d) => {
            const isOpen = open === d.id;
            const item = agenda.find((a) => a.id === d.agendaItemId);
            const older = decisions.find((x) => x.id === d.supersedesId);
            const toggle = () => setOpen(isOpen ? null : d.id);
            return (
              <div key={d.id} style={{ display: 'contents' }}>
                <div
                  className={isOpen ? 'trow open' : 'trow'}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  data-decision={d.id}
                  onClick={toggle}
                  onKeyDown={(e) => {
                    if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      toggle();
                    }
                  }}
                  style={{ alignItems: 'start', paddingTop: 9, paddingBottom: 9, cursor: 'pointer' }}
                >
                  <span>
                    <DecisionStatusPill status={d.status} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span className="wrapcell" style={{ display: 'block', fontWeight: 550 }}>
                      {d.title}
                    </span>
                    {d.description && (
                      <span className="wrapcell" style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>
                        {d.description}
                      </span>
                    )}
                    <span className="mt-meta">
                      {item && <span>From agenda item {item.position + 1}: {item.title}</span>}
                      {older && <span>· Supersedes “{older.title}”</span>}
                      {d.approvedBy && <span>· Approved by {d.approvedBy}</span>}
                      {d.scope && <span>· Scope: {d.scope}</span>}
                    </span>
                    {d.links.length > 0 && (
                      <span style={{ display: 'block', marginTop: 5 }} onClick={(e) => e.stopPropagation()}>
                        <LinkChips links={d.links} projectId={projectId} ctx={ctx} max={4} />
                      </span>
                    )}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    {d.owner ? (
                      <>
                        <Avatar name={d.owner} small />
                        <span className="ell" style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                          {d.owner}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>—</span>
                    )}
                  </span>
                  <span className="num" style={{ fontSize: 12.5 }}>
                    {d.decidedOn ? fmtDate(d.decidedOn) : '—'}
                  </span>
                </div>
                {isOpen && (
                  <div className="notewrap">
                    <DecisionEditor decision={d} projectId={projectId} onDone={() => setOpen(null)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DecisionEditor({
  decision,
  projectId,
  isNew = false,
  onDone,
}: {
  decision: Decision;
  projectId: string;
  isNew?: boolean;
  onDone: () => void;
}) {
  const saveDecision = useMeetingStore((s) => s.saveDecision);
  const deleteDecision = useMeetingStore((s) => s.deleteDecision);
  const stored = useMeetingStore((s) => s.decisions.find((x) => x.id === decision.id));
  const decisions = useMeetingStore((s) => s.decisions);
  const meetings = useMeetingStore((s) => s.meetings);
  const agenda = useMeetingStore((s) => s.agenda);
  const people = usePeople();
  const { options, ctx } = useLinkContext();
  const [d, setD] = useState<Decision>(decision);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState('');
  const set = (p: Partial<Decision>) => setD((x) => ({ ...x, ...p }));

  const items = agenda.filter((a) => a.meetingId === d.meetingId).sort((a, b) => a.position - b.position);
  const olderChoices = decisions.filter((x) => x.id !== d.id && x.status !== 'superseded');
  const meetingOf = (id: string) => meetings.find((m) => m.id === id);

  const save = () => {
    if (!d.title.trim()) return setError('Give the decision a title.');
    setError('');
    saveDecision({ ...d, title: d.title.trim() });
    onDone();
  };

  return (
    <div className="notecard" data-decision-editor={d.id}>
      <div className="notecard-hd">
        <span className="cap">{isNew ? 'New decision' : 'Decision'}</span>
        <span style={{ flexGrow: 1 }} />
        {!isNew && !asking && (
          <button type="button" className="btn sm dng" onClick={() => setAsking(true)}>
            Delete
          </button>
        )}
      </div>
      <div className="notecard-body" style={{ maxWidth: 'none' }}>
        <Field label="Decision" required>
          <input className="lnkin" style={{ minWidth: 0, width: '100%' }} autoFocus={isNew} aria-label="Decision title" value={d.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="Description">
          <textarea className="mt-text" aria-label="Decision description" value={d.description} onChange={(e) => set({ description: e.target.value })} />
        </Field>
        <div className="mt-grid2">
          <Field label="Decision owner">
            <PersonInput value={d.owner} onChange={(v) => set({ owner: v })} people={people} label="Decision owner" />
          </Field>
          <Field label="Approved by">
            <PersonInput value={d.approvedBy} onChange={(v) => set({ approvedBy: v })} people={people} label="Approved by" />
          </Field>
        </div>
        <div className="mt-grid2">
          <Field label="Decision date">
            <input type="date" className="dateinp" aria-label="Decision date" value={d.decidedOn ? toISO(d.decidedOn) : ''} onChange={(e) => set({ decidedOn: e.target.value ? fromISO(e.target.value) : null })} />
          </Field>
          <Field label="Status" hint="Approving a decision changes nothing on the plan by itself — a deliverable it approves still needs its handover.">
            <select className="lnkin" aria-label="Decision status" value={d.status} onChange={(e) => set({ status: e.target.value as DecisionStatus })}>
              {DECISION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {DECISION_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Rationale" hint="Why — the part somebody will ask for in six months.">
          <textarea className="mt-text" aria-label="Rationale" value={d.rationale} onChange={(e) => set({ rationale: e.target.value })} />
        </Field>
        <div className="mt-grid2">
          <Field label="Effective scope" hint="What it applies to, in words.">
            <input className="lnkin" aria-label="Effective scope" value={d.scope} onChange={(e) => set({ scope: e.target.value })} />
          </Field>
          <Field label="Supersedes">
            <select className="lnkin" aria-label="Supersedes decision" value={d.supersedesId ?? ''} onChange={(e) => set({ supersedesId: e.target.value || null })}>
              <option value="">Nothing</option>
              {olderChoices.map((x) => {
                const m = meetingOf(x.meetingId);
                return (
                  <option key={x.id} value={x.id}>
                    {x.title}
                    {m ? ` — ${m.title}` : ''}
                  </option>
                );
              })}
            </select>
          </Field>
        </div>
        {items.length > 0 && (
          <Field label="Created from agenda item">
            <select className="lnkin" aria-label="Created from agenda item" value={d.agendaItemId ?? ''} onChange={(e) => set({ agendaItemId: e.target.value || null })}>
              <option value="">None</option>
              {items.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.position + 1}. {a.title}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Related items" hint="A deliverable this approves, the activity or step it changes, the risk it answers." group>
          <LinkPicker value={d.links} onChange={(links) => set({ links })} options={options} ctx={ctx} projectId={projectId} label="Decision related items" />
        </Field>
        {stored ? (
          <div style={{ padding: '6px 0 12px' }}>
            <FilesList owner={{ decisionId: d.id }} defaultCategory="report" title="Supporting evidence" />
          </div>
        ) : (
          <p className="mono-note" style={{ padding: '6px 0 12px' }}>
            Supporting evidence can be attached once the decision is saved.
          </p>
        )}

        {asking ? (
          <div className="delconf">
            Delete this decision and its evidence?
            <span style={{ flexGrow: 1 }} />
            <button type="button" className="btn sm" onClick={() => setAsking(false)}>
              Keep
            </button>
            <button
              type="button"
              className="btn sm dng"
              onClick={() => {
                deleteDecision(d.id);
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
            {!isNew && meetingOf(d.meetingId) && (
              <Link className="btn sm" href={`/p/${projectId}/meetings/${d.meetingId}?tab=decisions`}>
                Open its meeting
              </Link>
            )}
            <button type="button" className="btn sm" onClick={onDone}>
              Cancel
            </button>
            <button type="button" className="btn pri sm" data-save-decision onClick={save}>
              {isNew ? 'Record decision' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
