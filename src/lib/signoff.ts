/**
 * /lib/signoff.ts — confirming a gate deliverable item by item, in the app.
 *
 * Every item carries a result and its evidence, and two statuses:
 *
 *  - the evidence status, the owner's: Not updated → Under review, as the
 *    result and its evidence are recorded and put up for checking;
 *  - the item status: Pending → Under review → Confirmed. The stage lead or
 *    the TPM confirms, and that confirms the evidence with it. Reopening a
 *    confirmed item sends it back to Pending with its evidence Not updated, to
 *    be brought up to date; what was recorded stays.
 *
 * A row is flagged when a confirmation is not supported — no evidence written
 * or attached, nobody named, no date. The outcome is Not ready while a
 * Critical or High issue is open, Ready to sign off once every item is
 * confirmed with nothing flagged and every waiver approved, and In review
 * otherwise. When every item is confirmed the checklist is complete, and the
 * deliverable it gates closes on the day of the last confirmation.
 *
 * Pure: the page holds the state, the server stores it as JSON.
 */

export const EVIDENCE_STATUSES = ['Not updated', 'Under review', 'Confirmed'] as const;
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];
export const LEAD_STATUSES = ['Pending', 'Under review', 'Confirmed'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export const FINAL_DECISIONS = ['Signed off', 'Signed off with conditions', 'Not signed off'] as const;
export type FinalDecision = (typeof FINAL_DECISIONS)[number];
export const ROLE_DECISIONS = ['Approve', 'Approve with conditions', 'Reject'] as const;
export const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'] as const;
export type Severity = (typeof SEVERITIES)[number];

/** One thing the gate stands on — given by the template, not stored. */
export interface SignoffItem {
  id: string;
  section: string;
  item: string;
  target: string;
}

/** What the owners and the stage lead have recorded against one item. */
export interface ItemEntry {
  result: string;
  evidence: string;
  evidenceOwner: string;
  /** the evidence status */
  status: EvidenceStatus;
  /** the item status */
  lead: LeadStatus;
  comment: string;
  /** who confirmed it — the stage lead or the TPM */
  confirmedBy: string;
  /** ISO date, or '' */
  confirmedOn: string;
}

export interface IssueRow {
  id: string;
  description: string;
  itemId: string;
  severity: Severity | '';
  owner: string;
  due: string;
  status: 'Open' | 'Closed';
  disposition: string;
}

export interface WaiverRow {
  id: string;
  itemId: string;
  rule: string;
  justification: string;
  risk: string;
  condition: string;
  approvedBy: string;
  approvedOn: string;
}

export interface Receipt {
  takes: string;
  receivedBy: string;
  receivedOn: string;
}

export interface RoleDecision {
  name: string;
  decision: string;
  date: string;
  comment: string;
}

export interface SignoffState {
  v: 1;
  doc: { programme: string; version: string; issuedOn: string };
  items: Record<string, ItemEntry>;
  issues: IssueRow[];
  waivers: WaiverRow[];
  /** The gate's own sheet — residual risk, reopening conditions, … — as rows of cells. */
  extra: string[][];
  /** By receiving activity reference. */
  receipts: Record<string, Receipt>;
  decision: { decision: FinalDecision | ''; conditions: string; lead: string; decidedOn: string };
  /** By role name. */
  roles: Record<string, RoleDecision>;
}

export const emptySignoff = (): SignoffState => ({
  v: 1,
  doc: { programme: '', version: '', issuedOn: '' },
  items: {},
  issues: [],
  waivers: [],
  extra: [],
  receipts: {},
  decision: { decision: '', conditions: '', lead: '', decidedOn: '' },
  roles: {},
});

export const blankEntry = (): ItemEntry => ({
  result: '',
  evidence: '',
  evidenceOwner: '',
  status: 'Not updated',
  lead: 'Pending',
  comment: '',
  confirmedBy: '',
  confirmedOn: '',
});

/* Entries saved under earlier names: the item statuses were Pending,
   Confirmed and Rejected, then Not updated, Under review and Confirmed; the
   evidence was Pass, Fail, Waived, N/A or Open. */
const OLD_LEAD: Record<string, LeadStatus> = { 'Not updated': 'Pending', Rejected: 'Under review' };

/** An item's entry, or the blank one every item starts from. */
export const entryOf = (state: SignoffState, id: string): ItemEntry => {
  const e = { ...blankEntry(), ...state.items[id] };
  const lead = OLD_LEAD[e.lead] ?? e.lead;
  const status = (EVIDENCE_STATUSES as readonly string[]).includes(e.status)
    ? e.status
    : lead === 'Confirmed'
      ? 'Confirmed'
      : (e.status as string) === 'Open'
        ? 'Not updated'
        : 'Under review';
  return { ...e, lead, status };
};

/** Confirmed, by whom and when — and its evidence with it. */
export const confirmEntry = (entry: ItemEntry, by: string, on: string): ItemEntry => ({
  ...entry,
  lead: 'Confirmed',
  status: 'Confirmed',
  confirmedBy: by,
  confirmedOn: on,
});

/** Reopened: Pending, its evidence Not updated; what was recorded stays to be brought up to date. */
export const reopenEntry = (entry: ItemEntry): ItemEntry => ({
  ...entry,
  lead: 'Pending',
  status: 'Not updated',
  confirmedBy: '',
  confirmedOn: '',
});

/** Who may confirm an item: the stage lead, and the TPM. */
export const approversOf = (stageLead: string, tpm: string): string[] =>
  [...new Set([stageLead.trim(), tpm.trim()].filter(Boolean))];

const blank = (s: string) => !s.trim();

/**
 * What stops a row being taken as confirmed, or '' when nothing does. The
 * first reason only, so the row says the next thing to fix.
 */
export function flagOf(entry: ItemEntry, _waivers: readonly WaiverRow[] = [], evidenceFiles = 0): string {
  if (entry.lead !== 'Confirmed') return '';
  /* evidence is a link or file name written down, or a file attached */
  if (blank(entry.evidence) && evidenceFiles === 0) return 'Evidence missing';
  /* a confirmation is somebody's, and dated */
  if (blank(entry.confirmedBy)) return 'Confirmed by missing';
  if (blank(entry.confirmedOn)) return 'Date missing';
  return '';
}

export type Outcome = 'Ready to sign off' | 'In review' | 'Not ready — blocking items';

export interface SignoffSummary {
  total: number;
  /** item status */
  confirmed: number;
  review: number;
  pending: number;
  /** evidence status, by value */
  evidence: Record<EvidenceStatus, number>;
  /** confirmed / total, 0 when there is nothing to confirm */
  progress: number;
  flagged: number;
  /** Critical or High issues still open */
  blocking: number;
  /** waivers with an ID but nobody who approved them */
  unapproved: number;
  outcome: Outcome;
}

export function summarize(
  items: readonly SignoffItem[],
  state: SignoffState,
  /** files attached as evidence, by item */
  files: Readonly<Record<string, number>> = {},
): SignoffSummary {
  const entries = items.map((it) => entryOf(state, it.id));
  const count = (f: (e: ItemEntry) => boolean) => entries.filter(f).length;
  const total = items.length;
  const confirmed = count((e) => e.lead === 'Confirmed');
  const flagged = items.filter((it, i) => flagOf(entries[i], state.waivers, files[it.id] ?? 0) !== '').length;
  const blocking = state.issues.filter(
    (i) => i.status === 'Open' && (i.severity === 'Critical' || i.severity === 'High'),
  ).length;
  const unapproved = state.waivers.filter((w) => !blank(w.id) && blank(w.approvedBy)).length;
  const outcome: Outcome =
    blocking > 0
      ? 'Not ready — blocking items'
      : total > 0 && confirmed === total && flagged === 0 && unapproved === 0
        ? 'Ready to sign off'
        : 'In review';
  return {
    total,
    confirmed,
    review: count((e) => e.lead === 'Under review'),
    pending: count((e) => e.lead === 'Pending'),
    evidence: {
      'Not updated': count((e) => e.status === 'Not updated'),
      'Under review': count((e) => e.status === 'Under review'),
      Confirmed: count((e) => e.status === 'Confirmed'),
    },
    progress: total ? confirmed / total : 0,
    flagged,
    blocking,
    unapproved,
    outcome,
  };
}

/**
 * The day the checklist was completed — every item confirmed — as an ISO
 * date, or '' while it is not. The latest confirmation dates it, and `today`
 * when none is dated.
 */
export function checklistCompletedOn(
  items: readonly SignoffItem[],
  state: SignoffState,
  /** the date to use when no confirmation carries one */
  today = '',
): string {
  if (!items.length) return '';
  const entries = items.map((it) => entryOf(state, it.id));
  if (entries.some((e) => e.lead !== 'Confirmed')) return '';
  return entries.map((e) => e.confirmedOn).filter(Boolean).sort().at(-1) ?? today;
}

/** The stage lead may sign off against the counts — but the page says so. */
export const consistencyWarning = (state: SignoffState, outcome: Outcome): string =>
  state.decision.decision === 'Signed off' && outcome !== 'Ready to sign off'
    ? 'Signed off while the checklist is not ready — record the reason in Conditions'
    : '';

/**
 * A stored payload, read back. Anything that is not version 1 of this shape
 * starts the sign-off afresh rather than breaking the page.
 */
export function parseSignoff(json: string | null | undefined): SignoffState {
  if (!json) return emptySignoff();
  try {
    const x = JSON.parse(json) as Partial<SignoffState>;
    if (!x || x.v !== 1) return emptySignoff();
    const base = emptySignoff();
    return {
      ...base,
      ...x,
      doc: { ...base.doc, ...x.doc },
      decision: { ...base.decision, ...x.decision },
      items: x.items ?? {},
      issues: x.issues ?? [],
      waivers: x.waivers ?? [],
      extra: x.extra ?? [],
      receipts: x.receipts ?? {},
      roles: x.roles ?? {},
    } as SignoffState;
  } catch {
    return emptySignoff();
  }
}

/** The next free ID in a register: W-01, W-02 … or I-01 … */
export const nextId = (prefix: string, rows: readonly { id: string }[]): string => {
  const used = rows.map((r) => Number(r.id.replace(`${prefix}-`, ''))).filter((n) => Number.isFinite(n));
  return `${prefix}-${String((used.length ? Math.max(...used) : 0) + 1).padStart(2, '0')}`;
};
