'use client';

import Link from 'next/link';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { saveSignoff } from '@/app/actions';
import type { SignoffDefinition } from '@/lib/signoffDefinition';
import { templateFor } from '@/data/deliverableTemplates';
import {
  FINAL_DECISIONS,
  LEAD_STATUSES,
  OWNER_STATUSES,
  ROLE_DECISIONS,
  SEVERITIES,
  consistencyWarning,
  entryOf,
  flagOf,
  nextId,
  parseSignoff,
  summarize,
  type IssueRow,
  type ItemEntry,
  type SignoffState,
  type WaiverRow,
} from '@/lib/signoff';
import { useAppStore } from '@/store/useAppStore';
import { IconDownload } from './icons';

/**
 * A gate deliverable confirmed item by item — the sign-off workbook, in the
 * app.
 *
 * The Checklist is the work: the owners record a result, its evidence and a
 * status against each item, and the stage lead confirms or rejects each on
 * that evidence. A row the evidence does not support is flagged, and the
 * sign-off counts the rows, the open issues and the unapproved waivers into a
 * suggested outcome the lead then decides against. The rules are
 * /lib/signoff.ts's, which the workbook shares.
 *
 * Everything is saved as it is typed — one document per deliverable, written
 * a moment after the last change rather than on every keystroke.
 */

type Tab = 'checklist' | 'issues' | 'waivers' | 'extra' | 'handover' | 'signoff';

const today = () => new Date().toISOString().slice(0, 10);

const OUTCOME_CLASS: Record<string, string> = {
  'Ready to sign off': 'so-ok',
  'In review': 'so-rev',
  'Not ready — blocking items': 'so-bad',
};

export function SignoffBoard({
  projectId,
  def,
  initial,
}: {
  projectId: string;
  def: SignoffDefinition;
  initial: string | null;
}) {
  const programme = useAppStore((s) => s.projectName);
  const [state, setState] = useState<SignoffState>(() => parseSignoff(initial));
  const [tab, setTab] = useState<Tab>('checklist');
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'pending'>('all');
  const [saving, setSaving] = useState<'saved' | 'saving' | 'failed'>('saved');

  /* write a moment after the last change; the first render is what was stored */
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSaving('saving');
    const t = setTimeout(() => {
      saveSignoff(projectId, def.ref, JSON.stringify(state)).then(
        () => setSaving('saved'),
        () => setSaving('failed'),
      );
    }, 600);
    return () => clearTimeout(t);
  }, [state, projectId, def.ref]);

  const summary = useMemo(() => summarize(def.items, state), [def.items, state]);
  const warning = consistencyWarning(state, summary.outcome);
  const template = templateFor(def.ref);
  const itemIds = def.items.map((i) => i.id);

  const update = (f: (s: SignoffState) => void) =>
    setState((prev) => {
      const next = structuredClone(prev);
      f(next);
      return next;
    });

  const setEntry = (id: string, patch: Partial<ItemEntry>) =>
    update((s) => {
      const e = { ...entryOf(s, id), ...patch };
      /* a confirmation is dated when it is given, unless somebody dated it */
      if (patch.lead === 'Confirmed' && !e.confirmedOn) e.confirmedOn = today();
      s.items[id] = e;
    });

  const sections = [...new Set(def.items.map((i) => i.section))];
  const shown = def.items.filter((it) => {
    const e = entryOf(state, it.id);
    if (filter === 'flagged') return flagOf(e, state.waivers) !== '';
    if (filter === 'pending') return e.lead !== 'Confirmed';
    return true;
  });

  const TABS: [Tab, string, number | null][] = [
    ['checklist', 'Checklist', def.items.length],
    ['issues', 'Open issues', state.issues.filter((i) => i.status === 'Open').length],
    ['waivers', 'Waivers', state.waivers.length],
    ...(def.extra ? ([['extra', def.extra.heading, null]] as [Tab, string, null][]) : []),
    ['handover', 'Handover', def.receivers.length],
    ['signoff', 'Sign-off', null],
  ];

  return (
    <div className="so-page" data-signoff={def.ref}>
      <div className="hd">
        <Link className="btn sm" href={`/p/${projectId}/stage/${def.stageKey}/deliverables`}>
          ← {def.stageTitle}
        </Link>
        <h1>
          {def.ref} sign-off
        </h1>
        <span className="pill">{def.title}</span>
        <span style={{ flexGrow: 1 }} />
        <span className={`so-save ${saving}`} aria-live="polite">
          {saving === 'saving' ? 'Saving…' : saving === 'failed' ? 'Could not save — retry by editing' : 'Saved'}
        </span>
        {template && (
          <a className="btn sm" href={template.href} download={template.filename}>
            <IconDownload /> Excel
          </a>
        )}
      </div>

      <div className="so-body">
        <p className="so-lede">
          Produced by <b>{def.act}</b> {def.actTitle}. Owners record a result, its evidence and a status against
          every item; the stage lead confirms or rejects each on that evidence, then decides on the Sign-off tab.
        </p>

        <div className="so-strip" data-summary>
          <div className="so-stat">
            <span className="cap">Confirmed</span>
            <b data-confirmed>
              {summary.confirmed} / {summary.total}
            </b>
            <span className="so-bar">
              <span style={{ width: `${Math.round(summary.progress * 100)}%` }} />
            </span>
          </div>
          <div className="so-stat">
            <span className="cap">Owner status</span>
            <span className="so-counts">
              <span>Pass {summary.pass}</span>
              <span>Waived {summary.waived}</span>
              <span>N/A {summary.na}</span>
              <span className={summary.fail ? 'so-neg' : ''}>Fail {summary.fail}</span>
              <span>Open {summary.open}</span>
            </span>
          </div>
          <div className="so-stat">
            <span className="cap">Flagged rows</span>
            <b className={summary.flagged ? 'so-neg' : ''} data-flagged>
              {summary.flagged}
            </b>
          </div>
          <div className="so-stat">
            <span className="cap">Blocking issues</span>
            <b className={summary.blocking ? 'so-neg' : ''}>{summary.blocking}</b>
          </div>
          <div className="so-stat">
            <span className="cap">Unapproved waivers</span>
            <b className={summary.unapproved ? 'so-neg' : ''}>{summary.unapproved}</b>
          </div>
          <div className="so-stat">
            <span className="cap">Suggested outcome</span>
            <span className={`so-outcome ${OUTCOME_CLASS[summary.outcome]}`} data-outcome>
              {summary.outcome}
            </span>
          </div>
        </div>

        <div className="tabs so-tabs" role="tablist">
          {TABS.map(([k, label, n]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              className={tab === k ? 'tab on' : 'tab'}
              onClick={() => setTab(k)}
              data-so-tab={k}
            >
              {label}
              {n !== null && <span className="pill">{n}</span>}
            </button>
          ))}
        </div>

        {tab === 'checklist' && (
          <div className="card so-card">
            <div className="so-tools">
              <span className="cap">Show</span>
              {(['all', 'flagged', 'pending'] as const).map((f) => (
                <button key={f} type="button" className={filter === f ? 'btn sm on' : 'btn sm'} onClick={() => setFilter(f)}>
                  {f === 'all' ? 'All items' : f === 'flagged' ? 'Flagged' : 'Not yet confirmed'}
                </button>
              ))}
            </div>
            <div className="thead so-grid">
              <span>ID</span>
              <span>Item and target</span>
              <span>Owner status</span>
              <span>Stage lead</span>
              <span>Flag</span>
            </div>
            {sections.map((sec) => {
              const rows = shown.filter((i) => i.section === sec);
              if (!rows.length) return null;
              return (
                <Fragment key={sec}>
                  <div className="groupbar" style={{ cursor: 'default' }}>
                    <b>{sec}</b>
                    <span className="pill" style={{ fontSize: 10.5 }}>
                      {rows.filter((i) => entryOf(state, i.id).lead === 'Confirmed').length}/{rows.length}
                    </span>
                  </div>
                  {rows.map((it) => {
                    const e = entryOf(state, it.id);
                    const flag = flagOf(e, state.waivers);
                    const isOpen = open === it.id;
                    return (
                      <Fragment key={it.id}>
                        <div
                          className={`trow so-grid${isOpen ? ' open' : ''}`}
                          data-item={it.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setOpen(isOpen ? null : it.id)}
                          onKeyDown={(ev) => {
                            if (ev.key === 'Enter') setOpen(isOpen ? null : it.id);
                          }}
                        >
                          <span className="so-id">{it.id}</span>
                          <span className="so-item">
                            <span>{it.item}</span>
                            <span className="so-target">Target: {it.target}</span>
                            {e.evidence && <span className="so-ev">Evidence: {e.evidence}</span>}
                          </span>
                          <select
                            className={`dateinp so-st st-${e.status.replace('/', '')}`}
                            value={e.status}
                            aria-label={`${it.id} owner status`}
                            onClick={(ev) => ev.stopPropagation()}
                            onChange={(ev) => setEntry(it.id, { status: ev.target.value as ItemEntry['status'] })}
                          >
                            {OWNER_STATUSES.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                          <select
                            className={`dateinp so-st ld-${e.lead}`}
                            value={e.lead}
                            aria-label={`${it.id} stage lead confirmation`}
                            onClick={(ev) => ev.stopPropagation()}
                            onChange={(ev) => setEntry(it.id, { lead: ev.target.value as ItemEntry['lead'] })}
                          >
                            {LEAD_STATUSES.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                          <span className="so-flag" data-flag={flag}>
                            {flag}
                          </span>
                        </div>
                        {isOpen && (
                          <div className="so-edit" data-edit={it.id}>
                            <label className="so-f so-wide">
                              <span className="cap">Result or measured value</span>
                              <textarea
                                className="lnkin"
                                rows={2}
                                value={e.result}
                                onChange={(ev) => setEntry(it.id, { result: ev.target.value })}
                              />
                            </label>
                            <label className="so-f so-wide">
                              <span className="cap">Evidence — link or file name</span>
                              <input className="lnkin" value={e.evidence} onChange={(ev) => setEntry(it.id, { evidence: ev.target.value })} />
                            </label>
                            <label className="so-f">
                              <span className="cap">Evidence owner</span>
                              <input
                                className="lnkin"
                                value={e.evidenceOwner}
                                onChange={(ev) => setEntry(it.id, { evidenceOwner: ev.target.value })}
                              />
                            </label>
                            <label className="so-f">
                              <span className="cap">Waiver ID {e.status === 'Waived' ? '(required)' : ''}</span>
                              <input
                                className="lnkin"
                                list="so-waivers"
                                value={e.waiverId}
                                onChange={(ev) => setEntry(it.id, { waiverId: ev.target.value })}
                              />
                            </label>
                            <label className="so-f so-wide">
                              <span className="cap">Stage lead comment {e.lead === 'Rejected' ? '(required)' : ''}</span>
                              <textarea
                                className="lnkin"
                                rows={2}
                                value={e.comment}
                                onChange={(ev) => setEntry(it.id, { comment: ev.target.value })}
                              />
                            </label>
                            <label className="so-f">
                              <span className="cap">Confirmed on</span>
                              <input
                                type="date"
                                className="dateinp"
                                value={e.confirmedOn}
                                onChange={(ev) => setEntry(it.id, { confirmedOn: ev.target.value })}
                              />
                            </label>
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
                </Fragment>
              );
            })}
            {!shown.length && <div className="empty">Nothing to show under this filter.</div>}
            <datalist id="so-waivers">
              {state.waivers.map((w) => (
                <option key={w.id} value={w.id} />
              ))}
            </datalist>
          </div>
        )}

        {tab === 'issues' && (
          <Register<IssueRow>
            what="issue"
            intro="Anything that stops an item being confirmed, linked to the item it blocks. A Critical or High issue left Open blocks the sign-off."
            rows={state.issues}
            columns={[
              { key: 'id', label: 'ID', width: '70px', readOnly: true },
              { key: 'description', label: 'Description', width: '2fr' },
              { key: 'itemId', label: 'Item', width: '90px', options: itemIds },
              { key: 'severity', label: 'Severity', width: '100px', options: [...SEVERITIES] },
              { key: 'owner', label: 'Owner', width: '1fr' },
              { key: 'due', label: 'Due', width: '130px', date: true },
              { key: 'status', label: 'Status', width: '90px', options: ['Open', 'Closed'] },
              { key: 'disposition', label: 'Disposition', width: '1.5fr' },
            ]}
            onAdd={() =>
              update((s) =>
                s.issues.push({
                  id: nextId('I', s.issues),
                  description: '',
                  itemId: '',
                  severity: '',
                  owner: '',
                  due: '',
                  status: 'Open',
                  disposition: '',
                }),
              )
            }
            onChange={(i, patch) => update((s) => Object.assign(s.issues[i], patch))}
            onRemove={(i) => update((s) => s.issues.splice(i, 1))}
          />
        )}

        {tab === 'waivers' && (
          <Register<WaiverRow>
            what="waiver"
            intro="Every item whose owner status is Waived names a waiver here, and every waiver needs an approver. A waiver without one holds the sign-off."
            rows={state.waivers}
            columns={[
              { key: 'id', label: 'ID', width: '70px', readOnly: true },
              { key: 'itemId', label: 'Item', width: '90px', options: itemIds },
              { key: 'rule', label: 'Check or rule waived', width: '1.3fr' },
              { key: 'justification', label: 'Justification', width: '1.6fr' },
              { key: 'risk', label: 'Risk accepted', width: '1.2fr' },
              { key: 'condition', label: 'Condition or expiry', width: '1fr' },
              { key: 'approvedBy', label: 'Approved by', width: '1fr' },
              { key: 'approvedOn', label: 'Approved on', width: '130px', date: true },
            ]}
            onAdd={() =>
              update((s) =>
                s.waivers.push({
                  id: nextId('W', s.waivers),
                  itemId: '',
                  rule: '',
                  justification: '',
                  risk: '',
                  condition: '',
                  approvedBy: '',
                  approvedOn: '',
                }),
              )
            }
            onChange={(i, patch) => update((s) => Object.assign(s.waivers[i], patch))}
            onRemove={(i) => update((s) => s.waivers.splice(i, 1))}
          />
        )}

        {tab === 'extra' && def.extra && (
          <div className="card so-card">
            <p className="so-intro">{def.extra.intro}</p>
            <div className="thead so-reg" style={{ gridTemplateColumns: `${def.extra.columns.map(() => '1fr').join(' ')} 28px` }}>
              {def.extra.columns.map((c) => (
                <span key={c}>{c}</span>
              ))}
              <span />
            </div>
            {state.extra.map((row, i) => (
              <div key={i} className="so-reg so-regrow" style={{ gridTemplateColumns: `${def.extra!.columns.map(() => '1fr').join(' ')} 28px` }}>
                {def.extra!.columns.map((c, k) => (
                  <textarea
                    key={c}
                    className="lnkin"
                    rows={2}
                    aria-label={c}
                    value={row[k] ?? ''}
                    onChange={(ev) => update((s) => (s.extra[i][k] = ev.target.value))}
                  />
                ))}
                <button type="button" className="x" aria-label="Remove row" onClick={() => update((s) => s.extra.splice(i, 1))}>
                  ×
                </button>
              </div>
            ))}
            <div className="so-tools">
              <button type="button" className="btn sm" onClick={() => update((s) => s.extra.push(def.extra!.columns.map(() => '')))}>
                + Add row
              </button>
            </div>
          </div>
        )}

        {tab === 'handover' && (
          <div className="card so-card">
            <p className="so-intro">Who receives {def.ref}, and what they take from it. The receiving owner records receipt.</p>
            <div className="thead so-reg" style={{ gridTemplateColumns: '1.4fr 1.6fr 1fr 140px' }}>
              <span>Receiving activity</span>
              <span>What it takes</span>
              <span>Received by</span>
              <span>Received on</span>
            </div>
            {def.receivers.map((r) => {
              const rc = state.receipts[r.ref] ?? { takes: '', receivedBy: '', receivedOn: '' };
              const set = (patch: Partial<typeof rc>) => update((s) => (s.receipts[r.ref] = { ...rc, ...patch }));
              return (
                <div key={r.ref} className="so-reg so-regrow" style={{ gridTemplateColumns: '1.4fr 1.6fr 1fr 140px' }}>
                  <span className="so-given">
                    <b>{r.ref}</b> {r.title}
                  </span>
                  <input className="lnkin" value={rc.takes} aria-label={`${r.ref} takes`} onChange={(ev) => set({ takes: ev.target.value })} />
                  <input className="lnkin" value={rc.receivedBy} aria-label={`${r.ref} received by`} onChange={(ev) => set({ receivedBy: ev.target.value })} />
                  <input type="date" className="dateinp" value={rc.receivedOn} aria-label={`${r.ref} received on`} onChange={(ev) => set({ receivedOn: ev.target.value })} />
                </div>
              );
            })}
          </div>
        )}

        {tab === 'signoff' && (
          <div className="so-cols">
            <div className="card so-card">
              <div className="so-h">Document control</div>
              <Field label="Programme">
                <input
                  className="lnkin"
                  value={state.doc.programme}
                  placeholder={programme}
                  onChange={(ev) => update((s) => (s.doc.programme = ev.target.value))}
                />
              </Field>
              <Field label="Deliverable">
                <span className="so-given">
                  {def.ref} — {def.title}
                </span>
              </Field>
              <Field label="Producing activity">
                <span className="so-given">
                  {def.act} — {def.actTitle} ({def.owner})
                </span>
              </Field>
              <Field label="Version">
                <input className="lnkin" value={state.doc.version} onChange={(ev) => update((s) => (s.doc.version = ev.target.value))} />
              </Field>
              <Field label="Issued for review">
                <input type="date" className="dateinp" value={state.doc.issuedOn} onChange={(ev) => update((s) => (s.doc.issuedOn = ev.target.value))} />
              </Field>

              <div className="so-h">Readiness</div>
              {(
                [
                  ['Items confirmed', `${summary.confirmed} of ${summary.total} (${Math.round(summary.progress * 100)}%)`],
                  ['Rejected by the stage lead', summary.rejected],
                  ['Failing items', summary.fail],
                  ['Rows flagged', summary.flagged],
                  ['Critical or High issues still open', summary.blocking],
                  ['Waivers without an approver', summary.unapproved],
                ] as [string, string | number][]
              ).map(([l, v]) => (
                <Field key={l} label={l}>
                  <span className="so-given">{v}</span>
                </Field>
              ))}
              <Field label="Suggested outcome">
                <span className={`so-outcome ${OUTCOME_CLASS[summary.outcome]}`}>{summary.outcome}</span>
              </Field>
            </div>

            <div className="card so-card">
              <div className="so-h">Final decision — stage lead</div>
              <Field label="Decision">
                <select
                  className="dateinp"
                  value={state.decision.decision}
                  aria-label="Final decision"
                  onChange={(ev) => update((s) => (s.decision.decision = ev.target.value as SignoffState['decision']['decision']))}
                >
                  <option value="">— not decided —</option>
                  {FINAL_DECISIONS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Field>
              <Field label="Conditions">
                <textarea
                  className="lnkin"
                  rows={3}
                  value={state.decision.conditions}
                  onChange={(ev) => update((s) => (s.decision.conditions = ev.target.value))}
                />
              </Field>
              <Field label="Stage lead">
                <input className="lnkin" value={state.decision.lead} onChange={(ev) => update((s) => (s.decision.lead = ev.target.value))} />
              </Field>
              <Field label="Decided on">
                <input type="date" className="dateinp" value={state.decision.decidedOn} onChange={(ev) => update((s) => (s.decision.decidedOn = ev.target.value))} />
              </Field>
              {warning && (
                <div className="so-warn" data-warning>
                  {warning}
                </div>
              )}

              <div className="so-h">Sign-off by role</div>
              <div className="thead so-reg" style={{ gridTemplateColumns: '1.3fr 1fr 1fr 130px' }}>
                <span>Role</span>
                <span>Name</span>
                <span>Decision</span>
                <span>Date</span>
              </div>
              {def.roles.map((role) => {
                const rd = state.roles[role] ?? { name: '', decision: '', date: '', comment: '' };
                const set = (patch: Partial<typeof rd>) => update((s) => (s.roles[role] = { ...rd, ...patch }));
                return (
                  <div key={role} className="so-reg so-regrow" style={{ gridTemplateColumns: '1.3fr 1fr 1fr 130px' }}>
                    <span className="so-given">{role}</span>
                    <input className="lnkin" value={rd.name} aria-label={`${role} name`} onChange={(ev) => set({ name: ev.target.value })} />
                    <select className="dateinp" value={rd.decision} aria-label={`${role} decision`} onChange={(ev) => set({ decision: ev.target.value })}>
                      <option value="">—</option>
                      {ROLE_DECISIONS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                    <input type="date" className="dateinp" value={rd.date} aria-label={`${role} date`} onChange={(ev) => set({ date: ev.target.value })} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="so-field">
      <span className="so-label">{label}</span>
      <span className="so-value">{children}</span>
    </div>
  );
}

interface Column<T> {
  key: keyof T & string;
  label: string;
  width: string;
  readOnly?: boolean;
  options?: string[];
  date?: boolean;
}

/** An editable register — issues or waivers — with a row per entry. */
function Register<T extends { id: string }>({
  what,
  intro,
  rows,
  columns,
  onAdd,
  onChange,
  onRemove,
}: {
  what: string;
  intro: string;
  rows: T[];
  columns: Column<T>[];
  onAdd: () => void;
  onChange: (i: number, patch: Partial<T>) => void;
  onRemove: (i: number) => void;
}) {
  const grid = `${columns.map((c) => c.width).join(' ')} 28px`;
  return (
    <div className="card so-card" data-register={what}>
      <p className="so-intro">{intro}</p>
      <div className="thead so-reg" style={{ gridTemplateColumns: grid }}>
        {columns.map((c) => (
          <span key={c.key}>{c.label}</span>
        ))}
        <span />
      </div>
      {rows.map((row, i) => (
        <div key={row.id} className="so-reg so-regrow" style={{ gridTemplateColumns: grid }} data-row={row.id}>
          {columns.map((c) => {
            const v = String(row[c.key] ?? '');
            const set = (value: string) => onChange(i, { [c.key]: value } as Partial<T>);
            if (c.readOnly) return <span key={c.key} className="so-id">{v}</span>;
            if (c.options)
              return (
                <select key={c.key} className="dateinp" value={v} aria-label={`${row.id} ${c.label}`} onChange={(ev) => set(ev.target.value)}>
                  <option value="">—</option>
                  {c.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              );
            if (c.date)
              return <input key={c.key} type="date" className="dateinp" value={v} aria-label={`${row.id} ${c.label}`} onChange={(ev) => set(ev.target.value)} />;
            return <input key={c.key} className="lnkin" value={v} aria-label={`${row.id} ${c.label}`} onChange={(ev) => set(ev.target.value)} />;
          })}
          <button type="button" className="x" aria-label={`Remove ${row.id}`} onClick={() => onRemove(i)}>
            ×
          </button>
        </div>
      ))}
      {!rows.length && <div className="empty">No {what}s yet.</div>}
      <div className="so-tools">
        <button type="button" className="btn sm" onClick={onAdd} data-add={what}>
          + Add {what}
        </button>
      </div>
    </div>
  );
}
