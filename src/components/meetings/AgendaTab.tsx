'use client';

import Link from 'next/link';
import { useState } from 'react';
import { nextInSeries } from '@/lib/meetings/followUp';
import {
  ACTION_STATUS_LABEL,
  DECISION_STATUS_LABEL,
  DEFERRAL_LABEL,
  DEFERRALS,
  OUTCOME_LABEL,
  OUTCOMES,
  type AgendaItem,
  type Deferral,
  type Meeting,
  type Outcome,
} from '@/lib/meetings/types';
import { fmtZonedDate } from '@/lib/meetings/zonedTime';
import { fmtDate } from '@/lib/schedule';
import { useMeetingStore } from '@/store/meetingStore';
import { IconPlus } from '../shell/icons';
import { Empty, Field, LinkChips, MeetingWhen, PersonInput } from './atoms';
import { ActionEditor } from './ActionItems';
import { blankAction, blankAgenda, blankDecision } from './blank';
import { DecisionEditor } from './DecisionsTab';
import { EditorDialog } from './EditorDialog';
import { LinkPicker } from './LinkPicker';
import { RaiseRiskDialog } from './RaiseRiskDialog';
import { useLinkContext } from './useLinkContext';
import { usePeople } from './usePeople';

/**
 * The agenda and the minutes, which are one record with two halves: the notes
 * and outcome on each item, and whatever was said that belongs to no item.
 *
 * Items can be added, reordered, discussed and deferred; a decision or an
 * action raised from an item remembers which item it came from. A completed
 * meeting opens on the minutes as a document, since reading them is what it
 * is for by then.
 */
export function AgendaTab({ meeting, projectId }: { meeting: Meeting; projectId: string }) {
  const agenda = useMeetingStore((s) => s.agenda);
  const saveAgendaItem = useMeetingStore((s) => s.saveAgendaItem);
  const saveMeeting = useMeetingStore((s) => s.saveMeeting);
  const [adding, setAdding] = useState('');
  const [reading, setReading] = useState(meeting.status === 'completed');
  const [minutes, setMinutes] = useState(meeting.minutes);
  const items = agenda.filter((a) => a.meetingId === meeting.id).sort((a, b) => a.position - b.position);
  const dirty = minutes !== meeting.minutes;
  const total = items.reduce((n, a) => n + a.minutes, 0);

  const add = () => {
    if (!adding.trim()) return;
    saveAgendaItem(blankAgenda(projectId, meeting.id, (items[items.length - 1]?.position ?? -1) + 1, adding.trim()));
    setAdding('');
  };

  return (
    <div data-agenda-tab>
      <div className="filterbar">
        <div className="seg-ctl" role="group" aria-label="View">
          <button type="button" className={!reading ? 'on' : ''} aria-pressed={!reading} onClick={() => setReading(false)}>
            Edit
          </button>
          <button type="button" className={reading ? 'on' : ''} aria-pressed={reading} data-read-minutes onClick={() => setReading(true)}>
            Read the minutes
          </button>
        </div>
        <span style={{ flexGrow: 1 }} />
        <span className="num" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          {items.length} item{items.length === 1 ? '' : 's'} · {total} min allocated · {items.filter((a) => a.status === 'discussed').length} discussed
        </span>
      </div>

      {reading ? (
        <MinutesDocument meeting={meeting} projectId={projectId} />
      ) : (
        <div className="mt-page">
          <section className="card" style={{ padding: '12px 16px', marginBottom: 16 }} data-minutes>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <b style={{ fontSize: 13.5 }}>Minutes</b>
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>what was said that belongs to no single agenda item</span>
            </div>
            <textarea
              className="mt-text"
              style={{ minHeight: 110 }}
              aria-label="Meeting minutes"
              placeholder="Attendance, context, anything said outside the agenda…"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 7, marginTop: 8, alignItems: 'center' }}>
              {dirty && <span className="mono-note">Unsaved changes.</span>}
              <span style={{ flexGrow: 1 }} />
              <button type="button" className="btn sm" disabled={!dirty} onClick={() => setMinutes(meeting.minutes)}>
                Discard
              </button>
              <button type="button" className="btn pri sm" disabled={!dirty} data-save-minutes onClick={() => saveMeeting({ ...meeting, minutes })}>
                Save minutes
              </button>
            </div>
          </section>

          {items.length === 0 ? (
            <Empty>No agenda yet. Add the first item below.</Empty>
          ) : (
            items.map((a, i) => (
              <AgendaCard key={a.id} item={a} meeting={meeting} projectId={projectId} first={i === 0} last={i === items.length - 1} />
            ))
          )}

          <div style={{ display: 'flex', gap: 7, marginTop: 6 }}>
            <input
              className="lnkin"
              aria-label="New agenda item"
              placeholder="Add an agenda item"
              value={adding}
              onChange={(e) => setAdding(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  add();
                }
              }}
            />
            <button type="button" className="btn sm" data-add-agenda disabled={!adding.trim()} onClick={add}>
              <IconPlus />
              Add item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AgendaCard({
  item,
  meeting,
  projectId,
  first,
  last,
}: {
  item: AgendaItem;
  meeting: Meeting;
  projectId: string;
  first: boolean;
  last: boolean;
}) {
  const saveAgendaItem = useMeetingStore((s) => s.saveAgendaItem);
  const moveAgendaItem = useMeetingStore((s) => s.moveAgendaItem);
  const deleteAgendaItem = useMeetingStore((s) => s.deleteAgendaItem);
  const carryAgendaItem = useMeetingStore((s) => s.carryAgendaItem);
  const meetings = useMeetingStore((s) => s.meetings);
  const agenda = useMeetingStore((s) => s.agenda);
  const decisions = useMeetingStore((s) => s.decisions);
  const actions = useMeetingStore((s) => s.actions);
  const people = usePeople();
  const { options, ctx } = useLinkContext();
  const [open, setOpen] = useState(false);
  const [d, setD] = useState<AgendaItem>(item);
  const [asking, setAsking] = useState(false);
  const [raising, setRaising] = useState<'decision' | 'action' | 'risk' | null>(null);
  const set = (p: Partial<AgendaItem>) => setD((x) => ({ ...x, ...p }));

  const from = item.carriedFromId ? agenda.find((a) => a.id === item.carriedFromId) : undefined;
  const fromMeeting = from ? meetings.find((m) => m.id === from.meetingId) : undefined;
  const carriedOn = agenda.find((a) => a.carriedFromId === item.id);
  const carriedOnMeeting = carriedOn ? meetings.find((m) => m.id === carriedOn.meetingId) : undefined;
  const next = nextInSeries(meeting, meetings);
  const mineDecisions = decisions.filter((x) => x.agendaItemId === item.id);
  const mineActions = actions.filter((x) => x.agendaItemId === item.id);

  const save = () => {
    saveAgendaItem({ ...d, title: d.title.trim() || item.title });
    setOpen(false);
  };

  return (
    <article className={item.status === 'discussed' ? 'mt-agenda discussed' : 'mt-agenda'} data-agenda-item={item.id}>
      <div className="mt-agenda-hd">
        <span className="mt-agenda-num">{item.position + 1}</span>
        <button type="button" style={{ fontWeight: 600, fontSize: 13.5, textAlign: 'left', flexGrow: 1, minWidth: 160 }} aria-expanded={open} onClick={() => { setD(item); setOpen(!open); }}>
          {item.title}
        </button>
        <span className={item.status === 'discussed' ? 'pill ok' : 'pill'} style={{ fontSize: 10.5 }}>
          {item.status === 'discussed' ? 'Discussed' : 'Pending'}
        </span>
        {item.outcome && (
          <span className={item.outcome === 'risk' || item.outcome === 'escalation' ? 'pill risk' : item.outcome === 'deferred' ? 'pill warn' : 'pill acc'} style={{ fontSize: 10.5 }} data-outcome={item.outcome}>
            {OUTCOME_LABEL[item.outcome]}
          </span>
        )}
        {item.presenter && <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{item.presenter}</span>}
        {item.minutes > 0 && (
          <span className="num" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            {item.minutes} min
          </span>
        )}
        <span className="seg-ctl" style={{ height: 24 }}>
          <button type="button" disabled={first} aria-label={`Move ${item.title} up`} onClick={() => moveAgendaItem(item.id, -1)}>
            ↑
          </button>
          <button type="button" disabled={last} aria-label={`Move ${item.title} down`} onClick={() => moveAgendaItem(item.id, 1)}>
            ↓
          </button>
        </span>
        <button
          type="button"
          className="btn sm"
          data-toggle-discussed
          onClick={() => saveAgendaItem({ ...item, status: item.status === 'discussed' ? 'pending' : 'discussed' })}
        >
          {item.status === 'discussed' ? 'Mark pending' : 'Mark discussed'}
        </button>
      </div>

      {(item.notes || item.links.length > 0 || from || carriedOn || mineDecisions.length > 0 || mineActions.length > 0) && !open && (
        <div style={{ padding: '0 12px 10px 42px', display: 'grid', gap: 5 }}>
          {from && fromMeeting && (
            <span className="mt-meta" style={{ marginTop: 0 }}>
              Carried from <Link href={`/p/${projectId}/meetings/${fromMeeting.id}?tab=agenda`}>{fromMeeting.title}</Link>
              <span className="num">{fmtZonedDate(fromMeeting.startsAt, fromMeeting.timeZone)}</span>
            </span>
          )}
          {carriedOn && carriedOnMeeting && (
            <span className="mt-meta" style={{ marginTop: 0 }}>
              Carried to <Link href={`/p/${projectId}/meetings/${carriedOnMeeting.id}?tab=agenda`}>{carriedOnMeeting.title}</Link>
            </span>
          )}
          {item.notes && <span className="mt-minutes" style={{ fontSize: 13 }}>{item.notes}</span>}
          {item.links.length > 0 && <LinkChips links={item.links} projectId={projectId} ctx={ctx} />}
          {mineDecisions.map((x) => (
            <span key={x.id} className="mt-meta" style={{ marginTop: 0 }}>
              Decision ({DECISION_STATUS_LABEL[x.status]}): {x.title}
            </span>
          ))}
          {mineActions.map((x) => (
            <span key={x.id} className="mt-meta" style={{ marginTop: 0 }}>
              Action ({ACTION_STATUS_LABEL[x.status]}): {x.description}
              {x.owner ? ` — ${x.owner}` : ''}
              {x.due ? `, due ${fmtDate(x.due)}` : ''}
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="mt-agenda-body">
          <div className="mt-grid2">
            <Field label="Title">
              <input className="lnkin" aria-label="Agenda title" value={d.title} onChange={(e) => set({ title: e.target.value })} />
            </Field>
            <Field label="Presenter or owner" group>
              <PersonInput value={d.presenter} onChange={(v) => set({ presenter: v })} people={people} label="Presenter" />
              <input className="dateinp" type="number" min={0} max={600} step={5} style={{ width: 70 }} aria-label="Allocated minutes" value={d.minutes} onChange={(e) => set({ minutes: Math.max(0, Number(e.target.value) || 0) })} />
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>min</span>
            </Field>
          </div>
          <Field label="Description" hint="What is to be covered, and what the room should decide.">
            <textarea className="mt-text" style={{ minHeight: 56 }} aria-label="Agenda description" value={d.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
          <Field label="Related items" group>
            <LinkPicker value={d.links} onChange={(links) => set({ links })} options={options} ctx={ctx} projectId={projectId} label="Agenda related items" />
          </Field>
          <Field label="Discussion notes" hint="The structured half of the minutes.">
            <textarea className="mt-text" style={{ minHeight: 90 }} aria-label="Discussion notes" value={d.notes} onChange={(e) => set({ notes: e.target.value })} />
          </Field>
          <div className="mt-grid2">
            <Field label="Outcome">
              <select className="lnkin" aria-label="Outcome" value={d.outcome} onChange={(e) => set({ outcome: e.target.value as Outcome | '' })}>
                <option value="">Not recorded</option>
                {OUTCOMES.map((o) => (
                  <option key={o} value={o}>
                    {OUTCOME_LABEL[o]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select className="lnkin" aria-label="Agenda status" value={d.status} onChange={(e) => set({ status: e.target.value as AgendaItem['status'] })}>
                <option value="pending">Pending</option>
                <option value="discussed">Discussed</option>
              </select>
            </Field>
          </div>
          {d.outcome === 'deferred' && (
            <div className="mt-grid2">
              <Field label="What happens next" hint="A deferred item needs a next step before the meeting can be completed cleanly." required>
                <select className="lnkin" aria-label="What happens next" value={d.deferral} onChange={(e) => set({ deferral: e.target.value as Deferral | '' })}>
                  <option value="">Not decided</option>
                  {DEFERRALS.map((x) => (
                    <option key={x} value={x}>
                      {DEFERRAL_LABEL[x]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Note">
                <input className="lnkin" aria-label="Deferral note" value={d.deferNote} onChange={(e) => set({ deferNote: e.target.value })} />
              </Field>
            </div>
          )}

          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" className="btn sm" data-decision-from-agenda onClick={() => setRaising('decision')}>
              <IconPlus />
              Decision
            </button>
            <button type="button" className="btn sm" data-action-from-agenda onClick={() => setRaising('action')}>
              <IconPlus />
              Action item
            </button>
            <button type="button" className="btn sm" data-risk-from-agenda onClick={() => setRaising('risk')}>
              <IconPlus />
              Risk
            </button>
            {next && !carriedOn && (
              <button
                type="button"
                className="btn sm"
                data-carry-agenda
                onClick={() => {
                  carryAgendaItem(item.id, next.id);
                  setOpen(false);
                }}
                title={`Adds it to ${next.title} and marks it deferred here`}
              >
                Defer to {fmtZonedDate(next.startsAt, next.timeZone)}
              </button>
            )}
            <span style={{ flexGrow: 1 }} />
            {asking ? (
              <span className="delconf" style={{ marginTop: 0 }}>
                Delete this item?
                <button type="button" className="btn sm" onClick={() => setAsking(false)}>
                  Keep
                </button>
                <button type="button" className="btn sm dng" onClick={() => deleteAgendaItem(item.id)}>
                  Delete
                </button>
              </span>
            ) : (
              <>
                <button type="button" className="btn sm dng" onClick={() => setAsking(true)}>
                  Delete
                </button>
                <button type="button" className="btn sm" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="btn pri sm" data-save-agenda onClick={save}>
                  Save item
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {raising === 'decision' && (
        <EditorDialog label="Decision from this agenda item" onClose={() => setRaising(null)}>
          <DecisionEditor
            decision={blankDecision(projectId, meeting.id, { agendaItemId: item.id, title: item.title, links: item.links, decidedOn: meeting.startsAt })}
            projectId={projectId}
            isNew
            onDone={() => setRaising(null)}
          />
        </EditorDialog>
      )}
      {raising === 'action' && (
        <EditorDialog label="Action item from this agenda item" onClose={() => setRaising(null)}>
          <ActionEditor action={blankAction(projectId, meeting.id, { agendaItemId: item.id, links: item.links })} projectId={projectId} isNew onDone={() => setRaising(null)} />
        </EditorDialog>
      )}
      {raising === 'risk' && (
        <RaiseRiskDialog meeting={meeting} projectId={projectId} links={[...item.links, ...meeting.links]} defaultText={item.notes} onClose={() => setRaising(null)} />
      )}
    </article>
  );
}

/** The minutes as one readable record: the meeting, then each item, what came of it, and who does what. */
function MinutesDocument({ meeting, projectId }: { meeting: Meeting; projectId: string }) {
  const agenda = useMeetingStore((s) => s.agenda);
  const decisions = useMeetingStore((s) => s.decisions);
  const actions = useMeetingStore((s) => s.actions);
  const { ctx } = useLinkContext();
  const items = agenda.filter((a) => a.meetingId === meeting.id).sort((a, b) => a.position - b.position);
  const loose = (id: string | null) => !id || !items.some((a) => a.id === id);
  const otherDecisions = decisions.filter((d) => d.meetingId === meeting.id && loose(d.agendaItemId));
  const otherActions = actions.filter((a) => a.meetingId === meeting.id && loose(a.agendaItemId));

  return (
    <div className="mt-page" data-minutes-document>
      <article className="card" style={{ padding: '22px 26px', maxWidth: 900 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.02em' }}>{meeting.title}</h2>
        <p className="mt-meta" style={{ fontSize: 12.5 }}>
          <MeetingWhen startsAt={meeting.startsAt} endsAt={meeting.endsAt} timeZone={meeting.timeZone} />
          {meeting.owner && <span>· Owner {meeting.owner}</span>}
          {meeting.facilitator && <span>· Facilitator {meeting.facilitator}</span>}
        </p>
        {meeting.attendees.length > 0 && (
          <p className="mono-note" style={{ marginTop: 6 }}>
            Attendees: {meeting.attendees.map((a) => (a.optional ? `${a.name} (optional)` : a.name)).join(', ')}
          </p>
        )}
        {meeting.minutes.trim() ? (
          <div className="mt-minutes" style={{ marginTop: 14 }}>
            {meeting.minutes}
          </div>
        ) : (
          <p className="mono-note" style={{ marginTop: 14 }}>
            No general minutes recorded.
          </p>
        )}

        {items.map((a) => {
          const ds = decisions.filter((d) => d.agendaItemId === a.id);
          const as = actions.filter((x) => x.agendaItemId === a.id);
          return (
            <section key={a.id} style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--line-soft)' }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 600 }}>
                {a.position + 1}. {a.title}
              </h3>
              <p className="mt-meta">
                {a.presenter && <span>{a.presenter}</span>}
                <span>{a.status === 'discussed' ? 'Discussed' : 'Not discussed'}</span>
                {a.outcome && <span>· {OUTCOME_LABEL[a.outcome]}</span>}
                {a.outcome === 'deferred' && a.deferral && <span>· {DEFERRAL_LABEL[a.deferral]}</span>}
              </p>
              {a.links.length > 0 && (
                <div style={{ marginTop: 5 }}>
                  <LinkChips links={a.links} projectId={projectId} ctx={ctx} />
                </div>
              )}
              {a.notes && (
                <div className="mt-minutes" style={{ marginTop: 8 }}>
                  {a.notes}
                </div>
              )}
              <DocLists decisions={ds} actions={as} />
            </section>
          );
        })}
        {(otherDecisions.length > 0 || otherActions.length > 0) && (
          <section style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--line-soft)' }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 600 }}>Outside the agenda</h3>
            <DocLists decisions={otherDecisions} actions={otherActions} />
          </section>
        )}
      </article>
    </div>
  );
}

function DocLists({
  decisions,
  actions,
}: {
  decisions: ReturnType<typeof useMeetingStore.getState>['decisions'];
  actions: ReturnType<typeof useMeetingStore.getState>['actions'];
}) {
  return (
    <>
      {decisions.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div className="cap" style={{ marginBottom: 4 }}>Decisions</div>
          <ul style={{ display: 'grid', gap: 4 }}>
            {decisions.map((d) => (
              <li key={d.id} style={{ fontSize: 13 }}>
                <b>{DECISION_STATUS_LABEL[d.status]}:</b> {d.title}
                {d.rationale && <span style={{ color: 'var(--ink-3)' }}> — {d.rationale}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {actions.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div className="cap" style={{ marginBottom: 4 }}>Action items</div>
          <ul style={{ display: 'grid', gap: 4 }}>
            {actions.map((x) => (
              <li key={x.id} style={{ fontSize: 13 }}>
                {x.description} — <b>{x.owner || 'no owner'}</b>, {x.due ? `due ${fmtDate(x.due)}` : 'no due date'} ({ACTION_STATUS_LABEL[x.status]})
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
