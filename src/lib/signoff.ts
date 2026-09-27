/**
 * /lib/signoff.ts — confirming a gate deliverable item by item, in the app.
 *
 * The sign-off workbook (tools/deliverable-templates) has a Checklist the
 * owners fill with a result, its evidence and a status, and a stage lead who
 * confirms or rejects each item on that evidence before deciding. These are
 * its rules, as functions, so the page and the workbook judge a row the same
 * way:
 *
 *  - a row is flagged when the evidence does not support what it claims —
 *    confirmed without evidence, waived without a waiver, rejected without a
 *    reason, a failing item confirmed, a confirmation undated — and, here as
 *    the workbook cannot, a waiver ID that names no waiver;
 *  - the outcome is Not ready if anything blocks (a Fail, a rejection, a
 *    Critical or High issue still open), Ready to sign off once every item is
 *    confirmed with nothing flagged and every waiver approved, and In review
 *    otherwise.
 *
 * Pure: the page holds the state, the server stores it as JSON.
 */

export const OWNER_STATUSES = ['Pass', 'Fail', 'Waived', 'N/A', 'Open'] as const;
export type OwnerStatus = (typeof OWNER_STATUSES)[number];
export const LEAD_STATUSES = ['Pending', 'Confirmed', 'Rejected'] as const;
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
  status: OwnerStatus;
  waiverId: string;
  lead: LeadStatus;
  comment: string;
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
  status: 'Open',
  waiverId: '',
  lead: 'Pending',
  comment: '',
  confirmedOn: '',
});

/** An item's entry, or the blank one every item starts from. */
export const entryOf = (state: SignoffState, id: string): ItemEntry => ({ ...blankEntry(), ...state.items[id] });

const blank = (s: string) => !s.trim();

/**
 * What stops a row being taken as confirmed, or '' when nothing does. The
 * first reason only, in the workbook's order, so the row says the next thing
 * to fix.
 */
export function flagOf(entry: ItemEntry, waivers: readonly WaiverRow[]): string {
  if (entry.lead === 'Confirmed' && blank(entry.evidence)) return 'Evidence missing';
  if (entry.status === 'Waived' && blank(entry.waiverId)) return 'Waiver ID missing';
  if (entry.status === 'Waived' && !waivers.some((w) => w.id.trim() === entry.waiverId.trim()))
    return 'Waiver not found';
  if (entry.lead === 'Rejected' && blank(entry.comment)) return 'Comment required';
  if (entry.lead === 'Confirmed' && (entry.status === 'Fail' || entry.status === 'Open'))
    return 'Confirmed without a passing status';
  if (entry.lead === 'Confirmed' && blank(entry.confirmedOn)) return 'Date missing';
  return '';
}

export type Outcome = 'Ready to sign off' | 'In review' | 'Not ready — blocking items';

export interface SignoffSummary {
  total: number;
  pass: number;
  waived: number;
  na: number;
  fail: number;
  open: number;
  confirmed: number;
  rejected: number;
  pending: number;
  /** confirmed / total, 0 when there is nothing to confirm */
  progress: number;
  flagged: number;
  /** Critical or High issues still open */
  blocking: number;
  /** waivers with an ID but nobody who approved them */
  unapproved: number;
  outcome: Outcome;
}

export function summarize(items: readonly SignoffItem[], state: SignoffState): SignoffSummary {
  const entries = items.map((it) => entryOf(state, it.id));
  const count = (f: (e: ItemEntry) => boolean) => entries.filter(f).length;
  const total = items.length;
  const fail = count((e) => e.status === 'Fail');
  const confirmed = count((e) => e.lead === 'Confirmed');
  const rejected = count((e) => e.lead === 'Rejected');
  const flagged = count((e) => flagOf(e, state.waivers) !== '');
  const blocking = state.issues.filter(
    (i) => i.status === 'Open' && (i.severity === 'Critical' || i.severity === 'High'),
  ).length;
  const unapproved = state.waivers.filter((w) => !blank(w.id) && blank(w.approvedBy)).length;
  const outcome: Outcome =
    fail > 0 || rejected > 0 || blocking > 0
      ? 'Not ready — blocking items'
      : total > 0 && confirmed === total && flagged === 0 && unapproved === 0
        ? 'Ready to sign off'
        : 'In review';
  return {
    total,
    pass: count((e) => e.status === 'Pass'),
    waived: count((e) => e.status === 'Waived'),
    na: count((e) => e.status === 'N/A'),
    fail,
    open: count((e) => e.status === 'Open'),
    confirmed,
    rejected,
    pending: count((e) => e.lead === 'Pending'),
    progress: total ? confirmed / total : 0,
    flagged,
    blocking,
    unapproved,
    outcome,
  };
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
