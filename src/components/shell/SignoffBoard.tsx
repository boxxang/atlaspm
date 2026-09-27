'use client';

import Link from 'next/link';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { deleteAttachment, saveSignoff, uploadAttachments } from '@/app/actions';
import { PROGRAM_DEFAULT_TEAM, PROGRAM_TPM } from '@/data/programTeam';
import { attachmentUrl, formatBytes, rejectFile, rejectionMessage, type AttachmentMeta } from '@/lib/attachments';
import { dragBoundary, gridTemplate, readWidths, tableMinWidth, type ColumnSpec, type Widths } from '@/lib/columnWidths';
import { templateFor } from '@/data/deliverableTemplates';
import {
  FINAL_DECISIONS,
  approversOf,
  confirmEntry,
  LEAD_STATUSES,
  OWNER_STATUSES,
  reopenEntry,
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
  type WaiverRow,
  waiverFor,
} from '@/lib/signoff';
import type { SignoffDefinition } from '@/lib/signoffDefinition';
import { teamRoster, type TeamMember } from '@/lib/people';
import { fmtDate, fromISO } from '@/lib/schedule';
import { uid, useAppStore } from '@/store/useAppStore';
import { Avatar, IconDownload, IconFile, IconPlus } from './icons';

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
  'Under review': 'pill acc',
  'Not updated': 'pill',
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
  initialFiles,
}: {
  projectId: string;
  def: SignoffDefinition;
  initial: string | null;
  /** evidence files attached to each item, by item ID */
  initialFiles: Record<string, AttachmentMeta[]>;
}) {
  const programme = useAppStore((s) => s.projectName);
  const stages = useAppStore((s) => s.stages);
  const leaders = useAppStore((s) => s.leaders);
  const contacts = useAppStore((s) => s.contacts);
  /* who a field that names a person can name: the programme team, this stage first */
  const roster = useMemo(
    () => teamRoster(stages.map((s) => s.id), leaders, contacts, def.stageKey, 'Stage lead', PROGRAM_DEFAULT_TEAM),
    [stages, leaders, contacts, def.stageKey],
  );
  /* the stage's own lead confirms by default; with none named, the TPM */
  const people: People = {
    roster,
    stageKey: def.stageKey,
    projectId,
    stageLead: leaders[def.stageKey]?.name || PROGRAM_TPM.name,
    approvers: approversOf(leaders[def.stageKey]?.name ?? '', PROGRAM_TPM.name),
  };
  const [files, setFiles] = useState<Record<string, AttachmentMeta[]>>(initialFiles);
  const fileCounts = useMemo(
    () => Object.fromEntries(Object.entries(files).map(([k, v]) => [k, v.length])),
    [files],
  );
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

  const summary = useMemo(() => summarize(def.items, state, fileCounts), [def.items, state, fileCounts]);
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
          item; the stage lead or the TPM confirms each on that evidence, and the stage lead decides on the Sign-off tab.
        </p>

        <div className="card sdash" data-summary>
          <Dstat
            cap="Confirmed"
            value={`${summary.confirmed}/${summary.total}`}
            sub={`${Math.round(summary.progress * 100)}% by the stage lead or TPM`}
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
                  : 'A failing item or an open Critical or High issue holds the gate.'}
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
        <Checklist
          refName={def.ref}
          items={def.items}
          state={state}
          people={people}
          files={files}
          setFiles={setFiles}
          onSave={(id, entry) => update((s) => void (s.items[id] = entry))}
        />
      )}

      {tab === 'issues' && (
        <Register
          people={people}
          what="issue"
          intro="Anything that stops an item being confirmed, linked to the item it blocks. A Critical or High issue left Open holds the gate."
          rows={state.issues}
          columns={[
            { key: 'id', label: 'ID', width: '64px', given: true },
            { key: 'description', label: 'Description', width: '2fr', long: true },
            { key: 'itemId', label: 'Item', width: '80px', options: def.items.map((i) => i.id) },
            { key: 'severity', label: 'Severity', width: '96px', options: [...SEVERITIES], pill: true },
            { key: 'owner', label: 'Owner', width: '1fr', person: true },
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
          people={people}
          what="waiver"
          intro="Every item marked Waived needs a waiver here, raised against that item, and every waiver needs an approver. A waiver without one holds the gate."
          rows={state.waivers}
          columns={[
            { key: 'id', label: 'ID', width: '64px', given: true },
            { key: 'itemId', label: 'Item', width: '80px', options: def.items.map((i) => i.id) },
            { key: 'rule', label: 'Check or rule waived', width: '1.3fr', long: true },
            { key: 'justification', label: 'Justification', width: '1.6fr', long: true },
            { key: 'risk', label: 'Risk accepted', width: '1.2fr', long: true },
            { key: 'condition', label: 'Condition or expiry', width: '1fr' },
            { key: 'approvedBy', label: 'Approved by', width: '1fr', person: true },
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
          people={people}
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
          people={people}
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
            { key: 'receivedBy', label: 'Received by', width: '1fr', person: true },
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

      {tab === 'signoff' && (
        <SignoffTab def={def} state={state} programme={programme} summary={summary} update={update} people={people} />
      )}
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

/**
 * The checklist's columns. The item takes what width is left; the rest can be
 * dragged, and what somebody drags them to is kept in this browser.
 */
const CHECK_COLS: ColumnSpec[] = [
  { key: 'ref', label: 'REF', width: 60, min: 52, align: 'center' },
  { key: 'item', label: 'ITEM AND TARGET', width: 260, min: 180, grow: true, align: 'left' },
  { key: 'owner', label: 'EVIDENCE OWNER', width: 150, min: 112, align: 'center' },
  { key: 'status', label: 'EVIDENCE STATUS', width: 136, min: 120, align: 'center' },
  { key: 'lead', label: 'ITEM STATUS', width: 120, min: 104, align: 'center' },
  { key: 'by', label: 'CONFIRMED BY', width: 146, min: 104, align: 'center' },
  { key: 'on', label: 'CONFIRMED ON', width: 116, min: 104, align: 'center' },
  { key: 'flag', label: 'FLAG', width: 150, min: 90, align: 'center' },
];
const COL_GAP = 12;
const WIDTHS_KEY = 'atlaspm.signoff.columns.v1';

/* The column widths, kept in this browser. localStorage is read as the
   external store it is, as the attention panel's row limit is: the server
   renders the defaults and the stored widths come in after hydration.
   Storage that is unavailable is simply not used. */
const widthListeners = new Set<() => void>();
const DEFAULT_WIDTHS = readWidths(CHECK_COLS, null);
let cachedWidths: Widths | null = null;
const subscribeWidths = (fn: () => void) => {
  widthListeners.add(fn);
  return () => {
    widthListeners.delete(fn);
  };
};
const widthsSnapshot = (): Widths => {
  if (cachedWidths) return cachedWidths;
  try {
    cachedWidths = readWidths(CHECK_COLS, window.localStorage.getItem(WIDTHS_KEY));
  } catch {
    cachedWidths = DEFAULT_WIDTHS;
  }
  return cachedWidths;
};

function useColumnWidths(): [Widths, (w: Widths) => void, () => void] {
  const widths = useSyncExternalStore(subscribeWidths, widthsSnapshot, () => DEFAULT_WIDTHS);
  const commit = useCallback((w: Widths) => {
    cachedWidths = w;
    try {
      window.localStorage.setItem(WIDTHS_KEY, JSON.stringify(w));
    } catch {
      /* the widths still hold for this visit */
    }
    for (const fn of widthListeners) fn();
  }, []);
  const reset = useCallback(() => commit(DEFAULT_WIDTHS), [commit]);
  return [widths, commit, reset];
}

function Checklist({
  refName,
  items,
  state,
  people,
  files,
  setFiles,
  onSave,
}: {
  refName: string;
  items: SignoffItem[];
  state: SignoffState;
  people: People;
  files: Record<string, AttachmentMeta[]>;
  setFiles: React.Dispatch<React.SetStateAction<Record<string, AttachmentMeta[]>>>;
  onSave: (id: string, entry: ItemEntry) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'flagged' | 'pending'>('all');
  const [open, setOpen] = useState<string | null>(null);
  const [widths, commitWidths, resetWidths] = useColumnWidths();
  const table = useRef<HTMLDivElement>(null);
  const sections = [...new Set(items.map((i) => i.section))];
  const flagFor = (id: string) => flagOf(entryOf(state, id), state.waivers, files[id]?.length ?? 0, id);
  const shown = items.filter((it) => {
    if (filter === 'flagged') return flagFor(it.id) !== '';
    if (filter === 'pending') return entryOf(state, it.id).lead !== 'Confirmed';
    return true;
  });
  const confirmed = items.filter((i) => entryOf(state, i.id).lead === 'Confirmed').length;
  const template = gridTemplate(CHECK_COLS, widths);

  /* Dragging the boundary between two columns: the one on the left gains
     what the one on the right gives, so the boundary follows the pointer and
     nothing else moves. Nothing re-renders while the pointer moves: the grid
     template is written straight onto the table, and only the widths the drag
     settles on are kept — the way the side panels are dragged. */
  const drag = (index: number) => (e: React.PointerEvent<HTMLSpanElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const grip = e.currentTarget;
    const startX = e.clientX;
    /* the widths the columns are shown at — the item column is wider than its stored minimum */
    const heads = table.current?.querySelectorAll<HTMLElement>('[data-col-head]') ?? [];
    const shown: Widths = {};
    heads.forEach((h) => (shown[h.dataset.colHead!] = h.getBoundingClientRect().width));
    let live = widths;
    grip.setPointerCapture(e.pointerId);
    document.body.classList.add('col-resizing');
    const move = (ev: PointerEvent) => {
      live = dragBoundary(CHECK_COLS, widths, shown, index, ev.clientX - startX);
      table.current?.style.setProperty('--so-cols', gridTemplate(CHECK_COLS, live));
      table.current?.style.setProperty('--so-minw', `${tableMinWidth(CHECK_COLS, live, COL_GAP) + 40}px`);
    };
    const up = () => {
      document.body.classList.remove('col-resizing');
      grip.removeEventListener('pointermove', move);
      grip.removeEventListener('pointerup', up);
      grip.removeEventListener('pointercancel', up);
      commitWidths(live);
    };
    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', up);
    grip.addEventListener('pointercancel', up);
  };

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
          {confirmed} of {items.length} confirmed
        </span>
        <button type="button" className="btn sm" onClick={resetWidths} title="Put every column back to its default width">
          Reset columns
        </button>
      </div>
      <div
        className="so-table"
        ref={table}
        style={
          {
            '--so-cols': template,
            '--so-minw': `${tableMinWidth(CHECK_COLS, widths, COL_GAP) + 40}px`,
          } as React.CSSProperties
        }
      >
        <div className="thead so-grid so-head" role="row">
          {CHECK_COLS.map((c, i) => (
            <span key={c.key} className="so-th" role="columnheader" data-col-head={c.key}>
              <span className="so-thl">{c.label}</span>
              <span
                className="so-grip"
                role="separator"
                aria-orientation="vertical"
                aria-label={`Resize between ${c.label} and ${CHECK_COLS[i + 1]?.label ?? ''}`}
                data-grip={c.key}
                onPointerDown={drag(i)}
                onDoubleClick={() => commitWidths({ ...widths, [c.key]: c.width })}
              />
            </span>
          ))}
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
                const flag = flagFor(it.id);
                const isOpen = open === it.id;
                const count = files[it.id]?.length ?? 0;
                return (
                  <Fragment key={it.id}>
                    <button
                      type="button"
                      className={`trow so-grid${isOpen ? ' open' : ''}`}
                      data-item={it.id}
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : it.id)}
                    >
                      <span className="so-c">
                        <span className="ref">{it.id}</span>
                      </span>
                      <span className="so-item">
                        <span>{it.item}</span>
                        <span className="so-sub">
                          Target: {it.target}
                          {count > 0 && (
                            <span className="so-clip" title={`${count} evidence file${count === 1 ? '' : 's'}`}>
                              <IconFile /> {count}
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="so-c" data-col="evidence-owner">
                        <Who name={e.evidenceOwner} />
                      </span>
                      <span className="so-c">
                        <span className={STATUS_PILL[e.status]} data-owner-status>
                          {e.status}
                        </span>
                      </span>
                      <span className="so-c">
                        <span className={STATUS_PILL[e.lead]} data-lead>
                          {e.lead}
                        </span>
                      </span>
                      <span className="so-c" data-col="confirmed-by">
                        <Who name={e.confirmedBy} />
                      </span>
                      <span className="so-c num" data-col="confirmed-on">
                        {e.confirmedOn ? shownDate(e.confirmedOn) : <span className="so-none">—</span>}
                      </span>
                      <span className="so-c so-flag" data-flag={flag}>
                        {flag}
                      </span>
                    </button>
                    {isOpen && (
                      <ItemCard
                        refName={refName}
                        people={people}
                        item={it}
                        entry={e}
                        flag={flag}
                        files={files[it.id] ?? []}
                        setFiles={(f) => setFiles((all) => ({ ...all, [it.id]: f(all[it.id] ?? []) }))}
                        waiver={waiverFor(e, state.waivers, it.id)}
                        onSave={(entry) => onSave(it.id, entry)}
                      />
                    )}
                  </Fragment>
                );
              })}
            </Fragment>
          );
        })}
      </div>
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
 * One check item, opened under its row. The row already says what the item
 * is, who owns its evidence and where it stands, so the card says none of
 * that again: it is the result and the evidence — what was measured, the
 * link or file name, and the files themselves — with the stage lead's
 * comment under them. It becomes a form on Edit and is kept on Save; files
 * are attached while editing and go up at once, as a handover's do.
 */
function ItemCard({
  refName,
  people,
  item,
  entry,
  flag,
  files,
  setFiles,
  waiver,
  onSave,
}: {
  refName: string;
  people: People;
  item: SignoffItem;
  entry: ItemEntry;
  flag: string;
  files: AttachmentMeta[];
  setFiles: (f: (prev: AttachmentMeta[]) => AttachmentMeta[]) => void;
  /** the waiver in the register covering this item, if it is waived */
  waiver: WaiverRow | undefined;
  onSave: (entry: ItemEntry) => void;
}) {
  const [draft, setDraft] = useState<ItemEntry | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<ItemEntry>) =>
    setDraft((d) => {
      const prev = d ?? entry;
      const next = { ...prev, ...patch };
      /* Confirming passes the evidence, and is dated today and the stage
         lead's unless somebody dated it or named the TPM; moving a confirmed
         item back reopens it. */
      if (patch.lead === 'Confirmed' && prev.lead !== 'Confirmed')
        return confirmEntry(
          next,
          people.approvers.includes(next.confirmedBy) ? next.confirmedBy : people.stageLead,
          next.confirmedOn || today(),
        );
      if (patch.lead && patch.lead !== 'Confirmed' && prev.lead === 'Confirmed')
        return { ...reopenEntry(next), lead: patch.lead };
      return next;
    });

  const attach = async (picked: FileList) => {
    const accepted: File[] = [];
    const refused: string[] = [];
    for (const f of Array.from(picked)) {
      const reason = rejectFile(f, files.length + accepted.length);
      if (reason) refused.push(rejectionMessage(reason, f.name));
      else accepted.push(f);
    }
    setProblems(refused);
    if (!accepted.length) return;
    const form = new FormData();
    form.set('projectId', people.projectId);
    form.set('signoffRef', refName);
    form.set('signoffItem', item.id);
    for (const f of accepted) {
      form.append('files', f);
      form.append('ids', uid());
    }
    setUploading(true);
    try {
      const saved = await uploadAttachments(form);
      setFiles((prev) => [...prev, ...saved]);
    } catch {
      setProblems((p) => [...p, 'Upload failed — the files were not attached.']);
    } finally {
      setUploading(false);
    }
  };
  const detach = async (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    await deleteAttachment(people.projectId, id);
  };

  const evidenceText = (draft ?? entry).evidence;

  return (
    <div className="delivwrap">
      <div className="delivcard so-card" data-card={item.id}>
        <div className="notecard-hd">
          <span className="cap">Result and evidence</span>
          <span style={{ flexGrow: 1 }} />
          {!draft && (
            <span className="so-state" data-card-state={entry.lead}>
              <span className={STATUS_PILL[entry.lead]}>{entry.lead}</span>
              {entry.lead === 'Confirmed' && entry.confirmedBy && (
                <span className="so-meta">
                  by <Who name={entry.confirmedBy} />
                  {entry.confirmedOn && <> on {shownDate(entry.confirmedOn)}</>}
                </span>
              )}
            </span>
          )}
          {!draft && entry.lead === 'Confirmed' && (
            <button
              type="button"
              className="btn sm"
              data-reopen-item={item.id}
              title="Back to Not updated, with the evidence open again"
              onClick={() => onSave(reopenEntry(entry))}
            >
              Reopen
            </button>
          )}
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
          {!draft ? (
            <div data-view={item.id}>
              <div className="so-sec">
                <div className="subcap">Result</div>
                {entry.result ? (
                  <div className="so-result">{entry.result}</div>
                ) : (
                  <p className="mono-note">Nothing recorded yet. Choose Edit to add the result and its evidence.</p>
                )}
              </div>
              <div className="so-sec">
                <div className="subcap">Evidence</div>
                {evidenceText &&
                  (isUrl(evidenceText) ? (
                    <a className="so-evlink" href={evidenceText} target="_blank" rel="noreferrer">
                      {evidenceText}
                    </a>
                  ) : (
                    <div className="so-evtext">{evidenceText}</div>
                  ))}
                <EvidenceFiles files={files} />
                {!evidenceText && !files.length && <p className="mono-note">No evidence yet.</p>}
              </div>
              {(entry.comment || (entry.status === 'Waived' && waiver)) && (
                <div className="so-sec so-note">
                  {entry.status === 'Waived' && waiver && (
                    <span className="pill warn" style={{ marginRight: 8 }}>
                      Waiver {waiver.id}
                    </span>
                  )}
                  {entry.comment && (
                    <span>
                      <b>Comment:</b> {entry.comment}
                    </span>
                  )}
                </div>
              )}
              {flag && (
                <p className="mono-note late" data-card-flag>
                  {flag}
                </p>
              )}
            </div>
          ) : (
            <div className="so-form" data-form={item.id}>
              <label className="so-f so-span">
                <span className="subcap">Result or measured value</span>
                <textarea className="notebody so-ta so-big" rows={4} value={draft.result} onChange={(ev) => set({ result: ev.target.value })} />
              </label>
              <div className="so-f so-span">
                <span className="subcap">Evidence — a link or file name, and the files</span>
                <input
                  className="lnkin"
                  aria-label="Evidence — link or file name"
                  placeholder="https://… or a path the reviewer can find"
                  value={draft.evidence}
                  onChange={(ev) => set({ evidence: ev.target.value })}
                />
                <div className="so-files">
                  <EvidenceFiles files={files} onRemove={detach} />
                  <button type="button" className="btn sm" disabled={uploading} onClick={() => input.current?.click()} data-attach={item.id}>
                    <IconPlus /> {uploading ? 'Uploading…' : 'Attach file'}
                  </button>
                  <input
                    ref={input}
                    type="file"
                    multiple
                    className="visually-hidden"
                    aria-label={`Attach evidence to ${item.id}`}
                    onChange={async (ev) => {
                      if (ev.target.files?.length) await attach(ev.target.files);
                      ev.target.value = '';
                    }}
                  />
                </div>
                {problems.map((p) => (
                  <p className="mono-note late" key={p}>
                    {p}
                  </p>
                ))}
              </div>
              <label className="so-f">
                <span className="subcap">Evidence owner</span>
                <PersonSelect people={people} label={`${item.id} evidence owner`} value={draft.evidenceOwner} onChange={(v) => set({ evidenceOwner: v })} />
              </label>
              <label className="so-f">
                <span className="subcap">Evidence status{draft.lead === 'Confirmed' ? ' — reopen the item to change it' : ''}</span>
                <select
                  className="dateinp"
                  aria-label={`${item.id} evidence status`}
                  disabled={draft.lead === 'Confirmed'}
                  value={draft.status}
                  onChange={(ev) => set({ status: ev.target.value as ItemEntry['status'] })}
                >
                  {OWNER_STATUSES.map((st) => (
                    <option key={st}>{st}</option>
                  ))}
                </select>
              </label>
              {draft.status === 'Waived' && (
                <p className="mono-note so-f" style={{ alignSelf: 'end' }}>
                  {waiver ? `Covered by ${waiver.id} in the Waivers register.` : 'Raise a waiver against this item in the Waivers register.'}
                </p>
              )}

              <div className="so-formhd">Item status</div>
              <label className="so-f">
                <span className="subcap">Item status</span>
                <select
                  className="dateinp"
                  aria-label={`${item.id} item status`}
                  value={draft.lead}
                  onChange={(ev) => set({ lead: ev.target.value as ItemEntry['lead'] })}
                >
                  {LEAD_STATUSES.map((st) => (
                    <option key={st}>{st}</option>
                  ))}
                </select>
              </label>
              {draft.lead === 'Confirmed' ? (
                <>
                  <label className="so-f">
                    <span className="subcap">Confirmed by — the stage lead or the TPM</span>
                    <PersonSelect
                      people={{ ...people, roster: people.roster.filter((m) => people.approvers.includes(m.name)) }}
                      label={`${item.id} confirmed by`}
                      value={draft.confirmedBy}
                      onChange={(v) => set({ confirmedBy: v })}
                    />
                  </label>
                  <label className="so-f">
                    <span className="subcap">Confirmed on</span>
                    <input type="date" className="dateinp" value={draft.confirmedOn} onChange={(ev) => set({ confirmedOn: ev.target.value })} />
                  </label>
                </>
              ) : (
                <p className="mono-note so-f" style={{ alignSelf: 'end' }}>
                  {draft.lead === 'Not updated'
                    ? 'Record the result and its evidence, then set Under review.'
                    : 'The stage lead or the TPM confirms it; confirming passes the evidence.'}
                </p>
              )}
              <label className="so-f so-span">
                <span className="subcap">Comment</span>
                <textarea className="notebody so-ta" rows={2} value={draft.comment} onChange={(ev) => set({ comment: ev.target.value })} />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** The files attached as evidence, as chips that open them; removable while editing. */
function EvidenceFiles({ files, onRemove }: { files: AttachmentMeta[]; onRemove?: (id: string) => void }) {
  if (!files.length) return null;
  return (
    <div className="att-list" data-evidence-files>
      {files.map((f) => (
        <span key={f.id} className="att">
          <a className="att-link" href={attachmentUrl(f.id)} target="_blank" rel="noreferrer" title={f.filename}>
            <span className="att-doc">
              <IconFile />
            </span>
            <span className="att-name">{f.filename}</span>
            <span className="att-size">{formatBytes(f.size)}</span>
          </a>
          {onRemove && (
            <button type="button" className="att-del" aria-label={`Remove ${f.filename}`} onClick={() => onRemove(f.id)}>
              ×
            </button>
          )}
        </span>
      ))}
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
  /** names a person: picked from the programme team */
  person?: boolean;
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
  people,
  what,
  intro,
  rows,
  columns,
  blank,
  fixed,
  onSave,
}: {
  people: People;
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
                if (c.person)
                  return (
                    <span key={c.key} className="so-cell">
                      <Who name={v} />
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
              if (c.person)
                return <PersonSelect key={c.key} people={people} label={`${row.id} ${c.label}`} value={v} onChange={(x) => set(c.key, x)} />;
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
  people,
}: {
  people: People;
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
    ['Under review', summary.review],
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
              <PersonSelect
                people={people}
                label="Stage lead"
                value={decision.d.lead}
                onChange={(v) => setDecision({ ...decision, d: { ...decision.d, lead: v } })}
              />
            ) : (
              <Who name={state.decision.lead} />
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
                    <PersonSelect people={people} label={`${role} name`} value={rd.name} onChange={(v) => set({ name: v })} />
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
                    <span className="so-cell">
                      <Who name={rd.name} />
                    </span>
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

/* ---------- naming a person ---------- */

/** A person as the rest of the app shows one: their initials in a circle, then the name. */
function Who({ name }: { name: string }) {
  if (!name.trim()) return <span className="so-none">—</span>;
  return (
    <span className="so-who">
      <Avatar name={name} small />
      <span className="so-name">{name}</span>
    </span>
  );
}

interface People {
  roster: TeamMember[];
  stageKey: string;
  projectId: string;
  /** who confirms by default: the stage's own lead, if the Team tab names one */
  stageLead: string;
  /** who may confirm an item: the stage lead and the TPM */
  approvers: string[];
}

/**
 * A person, picked from the programme team — the stage's own people first.
 * A name already recorded that is no longer on the team stays selectable, so
 * editing a row never silently drops who it named.
 */
function PersonSelect({
  people,
  label,
  value,
  onChange,
}: {
  people: People;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const { roster, stageKey, projectId } = people;
  if (!roster.length)
    return (
      <span className="so-meta">
        No one on the team yet —{' '}
        <Link href={`/p/${projectId}/team`}>add people on the Team page</Link>
      </span>
    );
  const here = roster.filter((m) => m.stageId === stageKey);
  const rest = roster.filter((m) => m.stageId !== stageKey);
  const known = roster.some((m) => m.name === value);
  const option = (m: TeamMember) => (
    <option key={m.name} value={m.name}>
      {m.name} — {m.role}
    </option>
  );
  return (
    <select className="dateinp so-person" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">— select —</option>
      {value && !known && <option value={value}>{value} (not on the team)</option>}
      {here.length > 0 && <optgroup label="This stage">{here.map(option)}</optgroup>}
      {rest.length > 0 && <optgroup label="Programme">{rest.map(option)}</optgroup>}
    </select>
  );
}
