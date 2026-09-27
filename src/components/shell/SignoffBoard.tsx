'use client';

import Link from 'next/link';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { saveSignoff } from '@/app/actions';
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
  type ItemEntry,
  type SignoffItem,
  type SignoffState,
} from '@/lib/signoff';
import type { SignoffDefinition } from '@/lib/signoffDefinition';
import { fmtDate, fromISO } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { IconDownload } from './icons';

/**
 * A gate deliverable confirmed item by item — the sign-off workbook, in the
 * app, laid out as a stage is.
 *
 * Each check item reads like a post on a board: what it is, what the target
 * is, what the owner recorded and on what evidence, and what the stage lead
 * made of it. Nothing on the page is an input until somebody chooses Edit,
 * and nothing is kept until they choose Save — the way a handover or a note is
 * edited everywhere else in the app. The registers and the decision work the
 * same way, a row or a section at a time.
 *
 * The rules are /lib/signoff.ts's, which the workbook shares. What is saved is
 * one document per deliverable, written a moment after each Save.
 */

type Tab = 'checklist' | 'issues' | 'waivers' | 'extra' | 'handover' | 'signoff';

const today = () => new Date().toISOString().slice(0, 10);
/** MM/DD/YYYY, as every date in the app; '—' when there is none */
const shownDate = (iso: string) => (iso ? fmtDate(fromISO(iso)) : '—');

const STATUS_PILL: Record<string, string> = {
  Pass: 'pill ok',
  Fail: 'pill risk',
  Waived: 'pill warn',
  'N/A': 'pill',
  Open: 'pill',
  Confirmed: 'pill ok',
  Rejected: 'pill risk',
  Pending: 'pill',
};

const OUTCOME_PILL: Record<string, string> = {
  'Ready to sign off': 'pill ok',
  'In review': 'pill warn',
  'Not ready — blocking items': 'pill risk',
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
  const [saving, setSaving] = useState<'saved' | 'saving' | 'failed'>('saved');

  /* written a moment after each Save; the first render is what was stored */
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
    }, 400);
    return () => clearTimeout(t);
  }, [state, projectId, def.ref]);

  const summary = useMemo(() => summarize(def.items, state), [def.items, state]);
  const template = templateFor(def.ref);
  const update = (f: (s: SignoffState) => void) =>
    setState((prev) => {
      const next = structuredClone(prev);
      f(next);
      return next;
    });

  const TABS: [Tab, string, number | null][] = [
    ['checklist', 'Checklist', def.items.length],
    ['issues', 'Open issues', state.issues.filter((i) => i.status === 'Open').length],
    ['waivers', 'Waivers', state.waivers.length],
    ...(def.extra ? ([['extra', def.extra.heading, state.extra.length]] as [Tab, string, number][]) : []),
    ['handover', 'Handover', def.receivers.length],
    ['signoff', 'Sign-off', null],
  ];

  return (
    <div data-signoff={def.ref}>
      <div className="hd">
        <Link className="crumb" href={`/p/${projectId}/stages`}>
          Stages
        </Link>
        <span className="crumb sep">/</span>
        <span className="crumb">{def.bandLabel}</span>
        <span className="crumb sep">/</span>
        <Link className="crumb" href={`/p/${projectId}/stage/${def.stageKey}/deliverables`}>
          {def.stageTitle}
        </Link>
        <span className="crumb sep">/</span>
        <h1>Sign-off</h1>
        <span className="pill" style={{ fontSize: 10.5 }}>
          {def.ref}
        </span>
        <span style={{ flexGrow: 1 }} />
        <span className={`so-save ${saving}`} aria-live="polite">
          {saving === 'saving' ? 'Saving…' : saving === 'failed' ? 'Could not save' : 'Saved'}
        </span>
        {template && (
          <a className="btn sm" href={template.href} download={template.filename}>
            <IconDownload /> Excel
          </a>
        )}
      </div>

      <div style={{ padding: '18px 20px 0' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.02em', margin: '0 0 6px' }}>{def.title}</h2>
        <p style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: '76ch' }}>
          Produced by <b>{def.act}</b> {def.actTitle}. Owners record a result, its evidence and a status against every
          item; the stage lead confirms or rejects each on that evidence, then decides on the Sign-off tab.
        </p>

        <div className="card sdash" data-summary>
          <Dstat
            cap="Confirmed"
            value={`${summary.confirmed}/${summary.total}`}
            sub={`${Math.round(summary.progress * 100)}% by the stage lead`}
            bar={Math.round(summary.progress * 100)}
            stat="confirmed"
          />
          <Dstat cap="Pass" value={String(summary.pass)} sub={`${summary.waived} waived · ${summary.na} N/A`} />
          <Dstat cap="Fail" value={String(summary.fail)} sub={`${summary.open} still open`} tone={summary.fail > 0} />
          <Dstat cap="Flagged rows" value={String(summary.flagged)} sub="not yet supported" tone={summary.flagged > 0} stat="flagged" />
          <Dstat cap="Blocking issues" value={String(summary.blocking)} sub="Critical or High, open" tone={summary.blocking > 0} />
          <Dstat cap="Unapproved waivers" value={String(summary.unapproved)} sub="no approver yet" tone={summary.unapproved > 0} />
          <div className="sdash-pace">
            <div className="subcap">Suggested outcome</div>
            <div>
              <span className={OUTCOME_PILL[summary.outcome]} style={{ fontSize: 12.5 }} data-outcome>
                {summary.outcome}
              </span>
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
              {summary.outcome === 'Ready to sign off'
                ? 'Every item confirmed on its evidence — the stage lead can decide.'
                : summary.outcome === 'In review'
                  ? 'Items still to confirm, or rows the evidence does not yet support.'
                  : 'A failing item, a rejection or an open Critical or High issue holds the gate.'}
            </span>
          </div>
        </div>

        <div className="tabs" style={{ marginTop: 15 }} role="tablist">
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
              {n !== null && (
                <span className="pill" style={{ fontSize: 10.5 }}>
                  {n}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === 'checklist' && (
        <Checklist items={def.items} state={state} onSave={(id, entry) => update((s) => void (s.items[id] = entry))} />
      )}

      {tab === 'issues' && (
        <Register
          what="issue"
          intro="Anything that stops an item being confirmed, linked to the item it blocks. A Critical or High issue left Open holds the gate."
          rows={state.issues}
          columns={[
            { key: 'id', label: 'ID', width: '64px', given: true },
            { key: 'description', label: 'Description', width: '2fr', long: true },
            { key: 'itemId', label: 'Item', width: '80px', options: def.items.map((i) => i.id) },
            { key: 'severity', label: 'Severity', width: '96px', options: [...SEVERITIES], pill: true },
            { key: 'owner', label: 'Owner', width: '1fr' },
            { key: 'due', label: 'Due', width: '120px', date: true },
            { key: 'status', label: 'Status', width: '84px', options: ['Open', 'Closed'], pill: true },
            { key: 'disposition', label: 'Disposition', width: '1.4fr', long: true },
          ]}
          blank={() => ({
            id: nextId('I', state.issues),
            description: '',
            itemId: '',
            severity: '',
            owner: '',
            due: '',
            status: 'Open',
            disposition: '',
          })}
          onSave={(rows) => update((s) => void (s.issues = rows as unknown as SignoffState['issues']))}
        />
      )}

      {tab === 'waivers' && (
        <Register
          what="waiver"
          intro="Every item whose owner status is Waived names a waiver here, and every waiver needs an approver. A waiver without one holds the gate."
          rows={state.waivers}
          columns={[
            { key: 'id', label: 'ID', width: '64px', given: true },
            { key: 'itemId', label: 'Item', width: '80px', options: def.items.map((i) => i.id) },
            { key: 'rule', label: 'Check or rule waived', width: '1.3fr', long: true },
            { key: 'justification', label: 'Justification', width: '1.6fr', long: true },
            { key: 'risk', label: 'Risk accepted', width: '1.2fr', long: true },
            { key: 'condition', label: 'Condition or expiry', width: '1fr' },
            { key: 'approvedBy', label: 'Approved by', width: '1fr' },
            { key: 'approvedOn', label: 'Approved on', width: '120px', date: true },
          ]}
          blank={() => ({
            id: nextId('W', state.waivers),
            itemId: '',
            rule: '',
            justification: '',
            risk: '',
            condition: '',
            approvedBy: '',
            approvedOn: '',
          })}
          onSave={(rows) => update((s) => void (s.waivers = rows as unknown as SignoffState['waivers']))}
        />
      )}

      {tab === 'extra' && def.extra && (
        <Register
          what="entry"
          intro={def.extra.intro}
          rows={state.extra.map((cells, i) => ({
            id: String(i + 1),
            ...Object.fromEntries(def.extra!.columns.map((_, k) => [`c${k}`, cells[k] ?? ''])),
          }))}
          columns={def.extra.columns.map((c, k) => ({ key: `c${k}`, label: c, width: '1fr', long: true }))}
          blank={() => ({
            id: String(state.extra.length + 1),
            ...Object.fromEntries(def.extra!.columns.map((_, k) => [`c${k}`, ''])),
          })}
          onSave={(rows) =>
            update((s) => void (s.extra = rows.map((r) => def.extra!.columns.map((_, k) => String(r[`c${k}`] ?? '')))))
          }
        />
      )}

      {tab === 'handover' && (
        <Register
          what="receipt"
          intro={`Who receives ${def.ref}, and what they take from it. The receiving owner records receipt.`}
          fixed
          rows={def.receivers.map((r) => ({
            id: r.ref,
            activity: `${r.ref} — ${r.title}`,
            ...(state.receipts[r.ref] ?? { takes: '', receivedBy: '', receivedOn: '' }),
          }))}
          columns={[
            { key: 'activity', label: 'Receiving activity', width: '1.5fr', given: true },
            { key: 'takes', label: 'What it takes', width: '1.6fr', long: true },
            { key: 'receivedBy', label: 'Received by', width: '1fr' },
            { key: 'receivedOn', label: 'Received on', width: '120px', date: true },
          ]}
          onSave={(rows) =>
            update((s) => {
              for (const r of rows)
                s.receipts[r.id] = {
                  takes: String(r.takes ?? ''),
                  receivedBy: String(r.receivedBy ?? ''),
                  receivedOn: String(r.receivedOn ?? ''),
                };
            })
          }
        />
      )}

      {tab === 'signoff' && <SignoffTab def={def} state={state} programme={programme} summary={summary} update={update} />}
    </div>
  );
}

/* ---------- the dashboard strip, as the stage page draws it ---------- */

function Dstat({
  cap,
  value,
  sub,
  bar,
  tone,
  stat,
}: {
  cap: string;
  value: string;
  sub: string;
  bar?: number;
  tone?: boolean;
  stat?: string;
}) {
  return (
    <div className="dstat">
      <div className="subcap" style={tone ? { color: 'var(--risk-ink)' } : undefined}>
        {cap}
      </div>
      <div
        className="num"
        data-stat={stat}
        style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', marginTop: 3, color: tone ? 'var(--risk)' : undefined }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>{sub}</div>
      {bar !== undefined && (
        <span className="bar dbar" style={{ display: 'block' }}>
          <i style={{ width: `${bar}%` }} />
        </span>
      )}
    </div>
  );
}

/* ---------- the checklist ---------- */

function Checklist({
  items,
  state,
  onSave,
}: {
  items: SignoffItem[];
  state: SignoffState;
  onSave: (id: string, entry: ItemEntry) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'flagged' | 'pending'>('all');
  const [open, setOpen] = useState<string | null>(null);
  const sections = [...new Set(items.map((i) => i.section))];
  const shown = items.filter((it) => {
    const e = entryOf(state, it.id);
    if (filter === 'flagged') return flagOf(e, state.waivers) !== '';
    if (filter === 'pending') return e.lead !== 'Confirmed';
    return true;
  });
  const confirmed = items.filter((i) => entryOf(state, i.id).lead === 'Confirmed').length;

  return (
    <>
      <div className="filterbar">
        {(['all', 'flagged', 'pending'] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={filter === f ? 'btn sm so-on' : 'btn sm'}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All items' : f === 'flagged' ? 'Flagged' : 'Not yet confirmed'}
          </button>
        ))}
        <span style={{ flexGrow: 1 }} />
        <span className="num" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          {confirmed} of {items.length} confirmed by the stage lead
        </span>
      </div>
      <div className="thead so-grid">
        <span>REF</span>
        <span>ITEM</span>
        <span>OWNER STATUS</span>
        <span>STAGE LEAD</span>
        <span>FLAG</span>
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
                  <button
                    type="button"
                    className={`trow so-grid${isOpen ? ' open' : ''}`}
                    data-item={it.id}
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : it.id)}
                  >
                    <span className="ref">{it.id}</span>
                    <span className="so-item">
                      <span>{it.item}</span>
                      <span className="so-sub">Target: {it.target}</span>
                    </span>
                    <span>
                      <span className={STATUS_PILL[e.status]} data-owner-status>
                        {e.status}
                      </span>
                    </span>
                    <span>
                      <span className={STATUS_PILL[e.lead]} data-lead>
                        {e.lead}
                      </span>
                    </span>
                    <span className="so-flag" data-flag={flag}>
                      {flag}
                    </span>
                  </button>
                  {isOpen && (
                    <ItemCard
                      item={it}
                      entry={e}
                      flag={flag}
                      waiverIds={state.waivers.map((w) => w.id)}
                      onSave={(entry) => onSave(it.id, entry)}
                    />
                  )}
                </Fragment>
              );
            })}
          </Fragment>
        );
      })}
      {!shown.length && (
        <div className="empty">
          <p className="mono-note">Nothing to show under this filter.</p>
        </div>
      )}
    </>
  );
}

const isUrl = (s: string) => /^https?:\/\//i.test(s.trim());

/**
 * One check item, opened where it sits. It reads as a post — what the owner
 * recorded, on what evidence, and what the stage lead made of it — until
 * somebody chooses Edit; then it is a form, kept only on Save.
 */
function ItemCard({
  item,
  entry,
  flag,
  waiverIds,
  onSave,
}: {
  item: SignoffItem;
  entry: ItemEntry;
  flag: string;
  waiverIds: string[];
  onSave: (entry: ItemEntry) => void;
}) {
  const [draft, setDraft] = useState<ItemEntry | null>(null);
  const set = (patch: Partial<ItemEntry>) =>
    setDraft((d) => {
      const next = { ...(d ?? entry), ...patch };
      /* a confirmation is dated when it is given, unless somebody dated it */
      if (patch.lead === 'Confirmed' && !next.confirmedOn) next.confirmedOn = today();
      return next;
    });
  const recorded = entry.result || entry.evidence || entry.evidenceOwner;
  const reviewed = entry.lead !== 'Pending' || entry.comment;

  return (
    <div className="delivwrap">
      <div className="delivcard" data-card={item.id}>
        <div className="notecard-hd">
          <span className="ref">{item.id}</span>
          <span className="cap">{item.section}</span>
          <span style={{ flexGrow: 1 }} />
          {!draft ? (
            <button type="button" className="btn sm" onClick={() => setDraft({ ...entry })} data-edit-item={item.id}>
              Edit
            </button>
          ) : (
            <>
              <button type="button" className="btn sm" onClick={() => setDraft(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn pri sm"
                data-save-item={item.id}
                onClick={() => {
                  onSave(draft);
                  setDraft(null);
                }}
              >
                Save
              </button>
            </>
          )}
        </div>

        <div className="notecard-body">
          <p className="so-title">{item.item}</p>
          <p className="so-sub" style={{ marginBottom: 14 }}>
            Target: {item.target}
          </p>

          {!draft ? (
            <div data-view={item.id}>
              <div className="so-post">
                <div className="who">
                  <b>Owner</b>
                  <span className={STATUS_PILL[entry.status]}>{entry.status}</span>
                  {entry.status === 'Waived' && entry.waiverId && <span className="pill">Waiver {entry.waiverId}</span>}
                  {entry.evidenceOwner && <span className="so-meta">Evidence owner: {entry.evidenceOwner}</span>}
                </div>
                {recorded ? (
                  <>
                    <div className="txt">{entry.result || 'No result written.'}</div>
                    <div className="so-meta" style={{ marginTop: 6 }}>
                      Evidence:{' '}
                      {entry.evidence ? (
                        isUrl(entry.evidence) ? (
                          <a href={entry.evidence} target="_blank" rel="noreferrer">
                            {entry.evidence}
                          </a>
                        ) : (
                          <span className="so-evidence">{entry.evidence}</span>
                        )
                      ) : (
                        <i>none attached</i>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="mono-note">Nothing recorded yet. Choose Edit to add the result and its evidence.</p>
                )}
              </div>

              <div className="so-post">
                <div className="who">
                  <b>Stage lead</b>
                  <span className={STATUS_PILL[entry.lead]}>{entry.lead}</span>
                  {entry.confirmedOn && <span className="so-meta">{shownDate(entry.confirmedOn)}</span>}
                </div>
                {reviewed ? entry.comment && <div className="txt">{entry.comment}</div> : <p className="mono-note">Not yet reviewed.</p>}
              </div>

              {flag && (
                <p className="mono-note late" data-card-flag>
                  {flag}
                </p>
              )}
            </div>
          ) : (
            <div className="so-form" data-form={item.id}>
              <div className="so-formhd">Owner</div>
              <label className="so-f so-span">
                <span className="subcap">Result or measured value</span>
                <textarea className="notebody so-ta" rows={3} value={draft.result} onChange={(ev) => set({ result: ev.target.value })} />
              </label>
              <label className="so-f so-span">
                <span className="subcap">Evidence — link or file name</span>
                <input className="lnkin" value={draft.evidence} onChange={(ev) => set({ evidence: ev.target.value })} />
              </label>
              <label className="so-f">
                <span className="subcap">Evidence owner</span>
                <input className="lnkin" value={draft.evidenceOwner} onChange={(ev) => set({ evidenceOwner: ev.target.value })} />
              </label>
              <label className="so-f">
                <span className="subcap">Owner status</span>
                <select
                  className="dateinp"
                  aria-label={`${item.id} owner status`}
                  value={draft.status}
                  onChange={(ev) => set({ status: ev.target.value as ItemEntry['status'] })}
                >
                  {OWNER_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="so-f">
                <span className="subcap">Waiver ID {draft.status === 'Waived' ? '(required)' : ''}</span>
                <input className="lnkin" list={`so-w-${item.id}`} value={draft.waiverId} onChange={(ev) => set({ waiverId: ev.target.value })} />
                <datalist id={`so-w-${item.id}`}>
                  {waiverIds.map((w) => (
                    <option key={w} value={w} />
                  ))}
                </datalist>
              </label>

              <div className="so-formhd">Stage lead</div>
              <label className="so-f">
                <span className="subcap">Confirmation</span>
                <select
                  className="dateinp"
                  aria-label={`${item.id} stage lead confirmation`}
                  value={draft.lead}
                  onChange={(ev) => set({ lead: ev.target.value as ItemEntry['lead'] })}
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="so-f">
                <span className="subcap">Confirmed on</span>
                <input type="date" className="dateinp" value={draft.confirmedOn} onChange={(ev) => set({ confirmedOn: ev.target.value })} />
              </label>
              <label className="so-f so-span">
                <span className="subcap">Comment {draft.lead === 'Rejected' ? '(required)' : ''}</span>
                <textarea className="notebody so-ta" rows={2} value={draft.comment} onChange={(ev) => set({ comment: ev.target.value })} />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- registers: issues, waivers, the gate's own sheet, receipts ---------- */

interface Column {
  key: string;
  label: string;
  width: string;
  given?: boolean;
  options?: string[];
  date?: boolean;
  long?: boolean;
  pill?: boolean;
}

type Row = { id: string } & Record<string, string>;

const pillFor = (v: string) =>
  v === 'Critical' || v === 'High' || v === 'Open' ? 'pill risk' : v === 'Closed' ? 'pill ok' : 'pill';

/**
 * A register read row by row. A row becomes a form on Edit and is kept on
 * Save; a new one opens as a form. A fixed register — the receivers, which
 * come from the write-up — takes no new rows and loses none.
 */
function Register({
  what,
  intro,
  rows,
  columns,
  blank,
  fixed,
  onSave,
}: {
  what: string;
  intro: string;
  rows: Row[] | readonly object[];
  columns: Column[];
  blank?: () => Row;
  fixed?: boolean;
  onSave: (rows: Row[]) => void;
}) {
  const [editing, setEditing] = useState<{ id: string; draft: Row; isNew: boolean } | null>(null);
  const grid = `${columns.map((c) => c.width).join(' ')} 150px`;
  const current = rows as Row[];
  const list = editing?.isNew ? [...current, editing.draft] : current;

  const save = () => {
    if (!editing) return;
    onSave(editing.isNew ? [...current, editing.draft] : current.map((r) => (r.id === editing.id ? editing.draft : r)));
    setEditing(null);
  };

  return (
    <div data-register={what}>
      <div className="filterbar">
        <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{intro}</span>
        <span style={{ flexGrow: 1 }} />
        {!fixed && blank && (
          <button
            type="button"
            className="btn sm"
            disabled={!!editing}
            data-add={what}
            onClick={() => {
              const r = blank();
              setEditing({ id: r.id, draft: r, isNew: true });
            }}
          >
            + Add {what}
          </button>
        )}
      </div>
      <div className="thead" style={{ gridTemplateColumns: grid }}>
        {columns.map((c) => (
          <span key={c.key}>{c.label.toUpperCase()}</span>
        ))}
        <span />
      </div>
      {list.map((row) => {
        if (editing?.id !== row.id)
          return (
            <div key={row.id} className="trow so-regrow" style={{ gridTemplateColumns: grid }} data-row={row.id}>
              {columns.map((c) => {
                const v = String(row[c.key] ?? '');
                if (c.key === 'id')
                  return (
                    <span key={c.key} className="ref">
                      {v}
                    </span>
                  );
                if (c.pill && v)
                  return (
                    <span key={c.key}>
                      <span className={pillFor(v)}>{v}</span>
                    </span>
                  );
                return (
                  <span key={c.key} className={c.long ? 'so-cell long' : 'so-cell'}>
                    {c.date ? shownDate(v) : v || '—'}
                  </span>
                );
              })}
              <span className="so-rowacts">
                <button
                  type="button"
                  className="btn sm"
                  disabled={!!editing}
                  data-edit-row={row.id}
                  onClick={() => setEditing({ id: row.id, draft: { ...row }, isNew: false })}
                >
                  Edit
                </button>
              </span>
            </div>
          );
        const d = editing.draft;
        const set = (k: string, v: string) => setEditing({ ...editing, draft: { ...d, [k]: v } });
        return (
          <div key={row.id} className="trow so-regrow so-editing" style={{ gridTemplateColumns: grid }} data-row={row.id} data-editing>
            {columns.map((c) => {
              const v = String(d[c.key] ?? '');
              if (c.given)
                return (
                  <span key={c.key} className={c.key === 'id' ? 'ref' : 'so-cell'}>
                    {v}
                  </span>
                );
              if (c.options)
                return (
                  <select key={c.key} className="dateinp" value={v} aria-label={`${row.id} ${c.label}`} onChange={(ev) => set(c.key, ev.target.value)}>
                    <option value="">—</option>
                    {c.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                );
              if (c.date)
                return <input key={c.key} type="date" className="dateinp" value={v} aria-label={`${row.id} ${c.label}`} onChange={(ev) => set(c.key, ev.target.value)} />;
              if (c.long)
                return <textarea key={c.key} className="lnkin so-ta" rows={2} value={v} aria-label={`${row.id} ${c.label}`} onChange={(ev) => set(c.key, ev.target.value)} />;
              return <input key={c.key} className="lnkin" value={v} aria-label={`${row.id} ${c.label}`} onChange={(ev) => set(c.key, ev.target.value)} />;
            })}
            <span className="so-rowacts">
              {!fixed && !editing.isNew && (
                <button
                  type="button"
                  className="btn sm dng"
                  aria-label={`Remove ${row.id}`}
                  onClick={() => {
                    onSave(current.filter((r) => r.id !== row.id));
                    setEditing(null);
                  }}
                >
                  ×
                </button>
              )}
              <button type="button" className="btn sm" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="button" className="btn pri sm" onClick={save} data-save-row={row.id}>
                Save
              </button>
            </span>
          </div>
        );
      })}
      {!list.length && (
        <div className="empty">
          <p className="mono-note">No {what}s yet.</p>
        </div>
      )}
    </div>
  );
}

/* ---------- the decision ---------- */

function SignoffTab({
  def,
  state,
  programme,
  summary,
  update,
}: {
  def: SignoffDefinition;
  state: SignoffState;
  programme: string;
  summary: ReturnType<typeof summarize>;
  update: (f: (s: SignoffState) => void) => void;
}) {
  const [doc, setDoc] = useState<SignoffState['doc'] | null>(null);
  const [decision, setDecision] = useState<{ d: SignoffState['decision']; roles: SignoffState['roles'] } | null>(null);
  const warning = consistencyWarning(state, summary.outcome);

  const readiness: [string, React.ReactNode][] = [
    ['Items confirmed', `${summary.confirmed} of ${summary.total} (${Math.round(summary.progress * 100)}%)`],
    ['Rejected by the stage lead', summary.rejected],
    ['Failing items', summary.fail],
    ['Rows flagged', summary.flagged],
    ['Critical or High issues still open', summary.blocking],
    ['Waivers without an approver', summary.unapproved],
    [
      'Suggested outcome',
      <span key="o" className={OUTCOME_PILL[summary.outcome]}>
        {summary.outcome}
      </span>,
    ],
  ];

  return (
    <div className="so-cols">
      <div className="delivcard" data-section="doc">
        <div className="notecard-hd">
          <span className="cap">Document control</span>
          <span style={{ flexGrow: 1 }} />
          {!doc ? (
            <button type="button" className="btn sm" onClick={() => setDoc({ ...state.doc })}>
              Edit
            </button>
          ) : (
            <>
              <button type="button" className="btn sm" onClick={() => setDoc(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn pri sm"
                onClick={() => {
                  update((s) => void (s.doc = doc));
                  setDoc(null);
                }}
              >
                Save
              </button>
            </>
          )}
        </div>
        <div className="notecard-body">
          <Prop label="Programme">
            {doc ? (
              <input className="lnkin" value={doc.programme} placeholder={programme} onChange={(e) => setDoc({ ...doc, programme: e.target.value })} />
            ) : (
              state.doc.programme || programme
            )}
          </Prop>
          <Prop label="Deliverable">
            {def.ref} — {def.title}
          </Prop>
          <Prop label="Producing activity">
            {def.act} — {def.actTitle} ({def.owner})
          </Prop>
          <Prop label="Version">
            {doc ? <input className="lnkin" value={doc.version} onChange={(e) => setDoc({ ...doc, version: e.target.value })} /> : state.doc.version || '—'}
          </Prop>
          <Prop label="Issued for review">
            {doc ? (
              <input type="date" className="dateinp" value={doc.issuedOn} onChange={(e) => setDoc({ ...doc, issuedOn: e.target.value })} />
            ) : (
              shownDate(state.doc.issuedOn)
            )}
          </Prop>
          <div className="so-formhd">Readiness</div>
          {readiness.map(([l, v]) => (
            <Prop key={l} label={l}>
              {v}
            </Prop>
          ))}
        </div>
      </div>

      <div className="delivcard" data-section="decision">
        <div className="notecard-hd">
          <span className="cap">Final decision — stage lead</span>
          <span style={{ flexGrow: 1 }} />
          {!decision ? (
            <button
              type="button"
              className="btn sm"
              data-edit-decision
              onClick={() => setDecision({ d: { ...state.decision }, roles: structuredClone(state.roles) })}
            >
              Edit
            </button>
          ) : (
            <>
              <button type="button" className="btn sm" onClick={() => setDecision(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn pri sm"
                data-save-decision
                onClick={() => {
                  update((s) => {
                    s.decision = decision.d;
                    s.roles = decision.roles;
                  });
                  setDecision(null);
                }}
              >
                Save
              </button>
            </>
          )}
        </div>
        <div className="notecard-body">
          <Prop label="Decision">
            {decision ? (
              <select
                className="dateinp"
                aria-label="Final decision"
                value={decision.d.decision}
                onChange={(e) =>
                  setDecision({ ...decision, d: { ...decision.d, decision: e.target.value as SignoffState['decision']['decision'] } })
                }
              >
                <option value="">— not decided —</option>
                {FINAL_DECISIONS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            ) : state.decision.decision ? (
              <span className={state.decision.decision === 'Not signed off' ? 'pill risk' : 'pill ok'} data-decision>
                {state.decision.decision}
              </span>
            ) : (
              '— not decided —'
            )}
          </Prop>
          <Prop label="Conditions">
            {decision ? (
              <textarea
                className="notebody so-ta"
                rows={3}
                value={decision.d.conditions}
                onChange={(e) => setDecision({ ...decision, d: { ...decision.d, conditions: e.target.value } })}
              />
            ) : (
              <span className="so-pre">{state.decision.conditions || '—'}</span>
            )}
          </Prop>
          <Prop label="Stage lead">
            {decision ? (
              <input className="lnkin" value={decision.d.lead} onChange={(e) => setDecision({ ...decision, d: { ...decision.d, lead: e.target.value } })} />
            ) : (
              state.decision.lead || '—'
            )}
          </Prop>
          <Prop label="Decided on">
            {decision ? (
              <input
                type="date"
                className="dateinp"
                value={decision.d.decidedOn}
                onChange={(e) => setDecision({ ...decision, d: { ...decision.d, decidedOn: e.target.value } })}
              />
            ) : (
              shownDate(state.decision.decidedOn)
            )}
          </Prop>
          {warning && !decision && (
            <p className="mono-note late" data-warning>
              {warning}
            </p>
          )}

          <div className="so-formhd">Sign-off by role</div>
          {def.roles.map((role) => {
            const rd = (decision ? decision.roles[role] : state.roles[role]) ?? { name: '', decision: '', date: '', comment: '' };
            const set = (patch: Partial<typeof rd>) =>
              decision && setDecision({ ...decision, roles: { ...decision.roles, [role]: { ...rd, ...patch } } });
            return (
              <div key={role} className="so-role">
                <span className="so-rolename">{role}</span>
                {decision ? (
                  <>
                    <input className="lnkin" placeholder="Name" aria-label={`${role} name`} value={rd.name} onChange={(e) => set({ name: e.target.value })} />
                    <select className="dateinp" aria-label={`${role} decision`} value={rd.decision} onChange={(e) => set({ decision: e.target.value })}>
                      <option value="">—</option>
                      {ROLE_DECISIONS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                    <input type="date" className="dateinp" aria-label={`${role} date`} value={rd.date} onChange={(e) => set({ date: e.target.value })} />
                  </>
                ) : (
                  <>
                    <span className="so-cell">{rd.name || '—'}</span>
                    <span>{rd.decision ? <span className={rd.decision === 'Reject' ? 'pill risk' : 'pill ok'}>{rd.decision}</span> : '—'}</span>
                    <span className="so-cell">{shownDate(rd.date)}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Prop({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="prop so-prop">
      <span className="pk">{label}</span>
      <span className="so-pv">{children}</span>
    </div>
  );
}
