/**
 * /data/foundryDemo.ts — AtlasFX1, a foundry turnkey programme on the day its
 * timing signoff is found to be two weeks late.
 *
 * Written content, like the other seeds, but for one fixed moment rather than
 * placed relative to whenever the seed runs: the scenario turns on dates —
 * Design Freeze 09/21, FEOL MTO 10/05, BEOL MTO 11/02 — and it only reads
 * true on and around 09/14/2026. /lib/foundryDemo.ts turns it into rows and
 * /prisma/seedFoundryDemo.ts writes them.
 *
 * The story: signoff STA still has 17 critical paths failing after six ECO
 * rounds. With full-chip PV and EM/IR in every loop, clean timing lands on
 * 10/05, which misses the committed FEOL mask slot. The programme splits the
 * mask release — FEOL on 10/05, BEOL on 11/02 after a metal-only ECO window —
 * and is now finding out whether every one of the 17 can in fact be fixed in
 * metal.
 *
 * Only what the story needs is here. Stages it does not touch are left as the
 * template made them.
 *
 * Everything is entered by the PM, who is the tool's only user: every post,
 * meeting, decision and action item is written by `@me`. Other people appear
 * as owners, presenters and attendees — the people the PM is tracking.
 */

import type { NoteBlock } from './stageNotes';

export const FX1_ID = 'atlasfx1';
export const FX1_NAME = 'AtlasFX1';
/** Netlist hand-off: the day physical design started. */
export const FX1_KICKOFF = '2026-02-09';
export const FX1_COST_PER_MAN_MONTH = 16500;
/** The day the scenario is set, and the time of day it is read at. */
export const FX1_TODAY = '2026-09-14';
export const FX1_NOW = '2026-09-14 12:00';
export const FX1_TIME_ZONE = 'America/Los_Angeles';

export const FOUNDRY_TEMPLATE_ID = 'foundryTurnkey';
export const FOUNDRY_TEMPLATE_NAME = 'Foundry Turnkey';

/**
 * The built-in stages a foundry turnkey programme runs, re-timed from netlist
 * hand-off (week 0). Titles, prefixes, bands and content come from the
 * built-in stage of the same key.
 */
export const FOUNDRY_STAGES: readonly { key: string; startOffsetWeeks: number; durationWeeks: number }[] = [
  { key: 'physicalDesign', startOffsetWeeks: 0, durationWeeks: 30 },
  { key: 'signoff', startOffsetWeeks: 16, durationWeeks: 16 },
  { key: 'tapeout', startOffsetWeeks: 32, durationWeeks: 6 },
  { key: 'fabrication', startOffsetWeeks: 34, durationWeeks: 16 },
  { key: 'testDevelopment', startOffsetWeeks: 24, durationWeeks: 26 },
  { key: 'packaging', startOffsetWeeks: 36, durationWeeks: 26 },
  { key: 'qualification', startOffsetWeeks: 58, durationWeeks: 26 },
];

/**
 * Tapeout's activities re-timed into six weeks, [from, to] in weeks from the
 * stage start. A step's dates run from the window start by its TAT, so these
 * starts are what put the FEOL submission on 10/05 (3/7 week in) and the BEOL
 * submission on 11/02 (31/7 weeks in), to the day.
 */
export const FOUNDRY_TAPEOUT_WINDOWS: Readonly<Record<string, readonly [number, number]>> = {
  'TO-01': [0, 2],
  'TO-02': [0, 2],
  'TO-03': [0, 3],
  'TO-04': [0, 2],
  'TO-05': [1, 1.5],
  'TO-06': [3 / 7, 3 / 7 + 1.5],
  'TO-07': [0.5, 4.5],
  'TO-08': [1.5, 2.5],
  'TO-09': [2, 4.5],
  'TO-10': [31 / 7, 31 / 7 + 1.5],
  'TO-11': [5, 6],
};

/** Stages whose planned steps before today are simply done — no posts, no story. */
export const FX1_DONE_BEFORE_TODAY: readonly string[] = ['physicalDesign', 'signoff', 'testDevelopment'];

export interface FxPerson {
  name: string;
  role: string;
}

export const FX1_LEADERS: Readonly<Record<string, FxPerson>> = {
  physicalDesign: { name: 'Minjun Lee', role: 'Physical design lead' },
  signoff: { name: 'Hyunwoo Kang', role: 'Signoff lead' },
  tapeout: { name: 'Sujin Choi', role: 'Tapeout manager' },
  fabrication: { name: 'Jaewon Lim', role: 'Foundry program manager' },
};

export const FX1_CONTACTS: Readonly<Record<string, readonly FxPerson[]>> = {
  physicalDesign: [
    { name: 'Seoyeon Park', role: 'Timing ECO & place and route' },
    { name: 'Daniel Cho', role: 'Clock tree & CPU cluster' },
  ],
  signoff: [
    { name: 'Jisoo Han', role: 'STA signoff' },
    { name: 'Eric Moon', role: 'Physical verification' },
    { name: 'Nara Yoon', role: 'EM/IR & SI signoff' },
    { name: 'Tae Oh', role: 'Equivalence & ECO checks' },
  ],
  tapeout: [{ name: 'Kevin Seo', role: 'Mask data prep & layer split' }],
  fabrication: [{ name: 'Hana Jung', role: 'Foundry fab planning' }],
};

/**
 * Step records the story needs. A step not listed is done if its stage is in
 * FX1_DONE_BEFORE_TODAY and its plan ended before today, and untouched
 * otherwise. `due` is a date moved by hand.
 */
export const FX1_STEPS: readonly {
  ref: string;
  n: number;
  pct?: number;
  owner?: string;
  due?: string;
  doneAt?: string;
}[] = [
  /* still iterating a month after the plan said it would stop — the one
     overdue step, on purpose */
  { ref: 'SO-03', n: 5, pct: 75, owner: 'Seoyeon Park' },
  { ref: 'SO-03', n: 7, pct: 40, owner: 'Hyunwoo Kang', due: '2026-10-05' },
  { ref: 'SO-04', n: 6, pct: 60, owner: 'Eric Moon', due: '2026-10-05' },
  { ref: 'SO-05', n: 6, pct: 80, owner: 'Nara Yoon', due: '2026-10-05' },
  { ref: 'SO-08', n: 6, pct: 70, owner: 'Nara Yoon', due: '2026-10-05' },
  { ref: 'SO-09', n: 5, pct: 60, owner: 'Tae Oh', due: '2026-10-05' },
  { ref: 'SO-10', n: 5, pct: 70, owner: 'Jisoo Han', due: '2026-10-05' },
  { ref: 'SO-11', n: 6, pct: 30, owner: '@me', due: '2026-10-05' },
  { ref: 'SO-12', n: 5, doneAt: '2026-09-11' },
  { ref: 'TO-03', n: 1, pct: 50, owner: '@me' },
  { ref: 'TO-06', n: 1, pct: 20, owner: 'Kevin Seo' },
  { ref: 'TO-07', n: 1, pct: 30, owner: 'Seoyeon Park' },
];

/** Deliverables by stage and position: finished, or re-dated by hand. */
export const FX1_DELIVERABLES: readonly { stageId: string; position: number | 'all'; doneAt?: string; due?: string }[] = [
  { stageId: 'physicalDesign', position: 'all', doneAt: 'due' },
  { stageId: 'signoff', position: 0, doneAt: '2026-09-07' },
  { stageId: 'signoff', position: 1, doneAt: '2026-09-07' },
  { stageId: 'signoff', position: 2, due: '2026-10-05' },
  { stageId: 'signoff', position: 3, due: '2026-10-05' },
  { stageId: 'signoff', position: 4, due: '2026-10-05' },
  { stageId: 'signoff', position: 5, due: '2026-10-05' },
  { stageId: 'signoff', position: 6, due: '2026-10-05' },
  { stageId: 'tapeout', position: 4, due: '2026-10-05' },
  { stageId: 'tapeout', position: 5, due: '2026-10-26' },
  { stageId: 'tapeout', position: 6, due: '2026-11-02' },
];

export interface FxPost {
  key: string;
  kind: 'update' | 'risk' | 'note' | 'reply';
  /** Local date and time, YYYY-MM-DD HH:MM. */
  at: string;
  /** The post's text — a note written as blocks gives only its title here. */
  text: string;
  /** A key-info note's body as blocks: paragraphs, headings, lists and tables. */
  blocks?: readonly NoteBlock[];
  /** A step, as ACT:n. */
  step?: string;
  stageId?: string;
  parent?: string;
  /** The meeting a risk was raised in, by key. */
  meeting?: string;
}

export const FX1_POSTS: readonly FxPost[] = [
  {
    key: 'sta-baseline',
    kind: 'update',
    at: '2026-08-21 18:10',
    step: 'SO-03:4',
    text:
      'Signoff STA on the Turn 3 final database across 24 MCMM corners: 214 setup and 37 hold violating endpoints. Worst setup WNS −118 ps at SSGNP 0.72 V / −40 °C. About 60% of the setup failures are SI-induced; the rest are OCV on long CPU cluster routes. Triage classes: CPU core ↔ L3 cache, PCIe Gen4 PIPE crossing, DDR PHY DFI (hold).',
  },
  {
    key: 'eco-r2',
    kind: 'update',
    at: '2026-08-28 19:00',
    step: 'SO-03:5',
    text:
      'ECO round 2 closed: setup 214 → 131, hold 37 → 9. One loop is STA 1 day + ECO place and route 1 day + full-chip DRC/LVS 2.5 days + EM/IR delta 0.5 day — five working days end to end.',
  },
  {
    key: 'eco-r4',
    kind: 'update',
    at: '2026-09-04 18:30',
    step: 'SO-03:5',
    text:
      'ECO round 4: 131 → 58 critical paths. What is left is concentrated in the CPU cluster, and each round gains less as the easy upsizing and buffering fixes run out.',
  },
  {
    key: 'eco-r5',
    kind: 'update',
    at: '2026-09-08 09:20',
    step: 'SO-03:5',
    text:
      'ECO round 5: 58 → 38 (WNS −52 ps). At this rate two more loops are needed before timing is clean, not counting the PV and EM/IR re-runs every loop reopens.',
  },
  {
    key: 'risk-timing',
    kind: 'risk',
    at: '2026-09-08 11:40',
    step: 'SO-03:7',
    text:
      'Timing signoff will not close by Design Freeze on 09/21. After ECO round 5, 38 critical paths still fail setup at SSGNP 0.72 V / −40 °C. Each ECO loop including full-chip PV and EM/IR takes five working days, so clean timing lands around 10/05 — two weeks late — and a full-mask tapeout would miss the 10/05 FEOL slot.',
  },
  {
    key: 'risk-pv',
    kind: 'risk',
    at: '2026-09-10 17:45',
    step: 'SO-04:6',
    text:
      'Every metal ECO loop reopens full-chip DRC, LVS and antenna — 2.5 days per run. Four loops between FEOL and BEOL MTO leave no margin unless the foundry accepts incremental PV on the changed metal windows.',
  },
  {
    key: 'eco-r6',
    kind: 'update',
    at: '2026-09-11 08:50',
    step: 'SO-03:5',
    text:
      'ECO round 6: 38 → 17 critical paths (WNS −41 ps, TNS −0.41 ns). 12 setup on CPU core ↔ L3 cache, 3 setup on the PCIe Gen4 PIPE crossing, 2 hold on DDR PHY DFI at FFGNP 0.88 V / 125 °C.',
  },
  {
    key: 'risk-timing-split',
    kind: 'reply',
    at: '2026-09-11 16:05',
    parent: 'risk-timing',
    text:
      'Split MTO agreed in the decision review: FEOL on 10/05 from the round 6 database, and the 17 paths closed with metal-only ECO before BEOL MTO on 11/02. Held until every path is confirmed fixable without a base-layer change — classification due 09/16.',
  },
  {
    key: 'risk-feol',
    kind: 'risk',
    at: '2026-09-11 16:20',
    step: 'TO-06:1',
    meeting: 'split-decision',
    text:
      'FEOL MTO on 10/05 is only safe if all 17 remaining violations can be fixed in metal. First pass: 12 look fixable by detour, layer promotion or spare-cell buffering; 3 CPU core paths may need a Vt swap or cell resize (base layer); 2 DDR hold paths depend on spare delay cells sitting close enough to the endpoints. If any path needs a base-layer change, FEOL cannot be released from the round 6 database.',
  },
  {
    key: 'note-signoff',
    kind: 'note',
    at: '2026-09-11 17:30',
    stageId: 'signoff',
    text: 'Timing closure status — 09/11',
    blocks: [
      { p: 'Signoff STA on the final database after ECO round 6, 24 MCMM corners.' },
      { h: 'Burn-down by ECO round' },
      {
        table: {
          head: ['ECO round', 'Date', 'Critical paths', 'Reduction', 'Worst setup WNS'],
          rows: [
            ['Baseline — Turn 3 final database', '08/21', '214', '—', '−118 ps'],
            ['Round 2', '08/28', '131', '−83', '—'],
            ['Round 4', '09/04', '58', '−73', '—'],
            ['Round 5', '09/08', '38', '−20', '−52 ps'],
            ['Round 6', '09/11', '17', '−21', '−41 ps'],
          ],
        },
      },
      { h: 'The 17 paths still failing' },
      {
        table: {
          head: ['Group', 'Paths', 'Type', 'Corner', 'Candidate fix'],
          rows: [
            ['CPU core ↔ L3 cache', '12', 'Setup', 'SSGNP 0.72 V / −40 °C', 'Detour, layer promotion, spare-cell buffering — 3 may need a Vt swap'],
            ['PCIe Gen4 PIPE crossing', '3', 'Setup', 'SSGNP 0.72 V / −40 °C', 'Layer promotion'],
            ['DDR PHY DFI', '2', 'Hold', 'FFGNP 0.88 V / 125 °C', 'Spare delay cells near the endpoints'],
          ],
        },
      },
      { h: 'One ECO loop, in working days' },
      {
        table: {
          head: ['STA', 'ECO place and route', 'Full-chip DRC / LVS', 'EM/IR delta', 'Total'],
          rows: [['1', '1', '2.5', '0.5', '5']],
        },
      },
      { h: 'Forecast and plan' },
      {
        bullets: [
          'Clean timing forecast 10/05 — two weeks past Design Freeze on 09/21.',
          'FEOL MTO on 10/05 from the round 6 database; metal-only ECO through BEOL MTO on 11/02.',
          'Held until each of the 17 paths is classified metal-only or base-layer — due 09/16.',
        ],
      },
    ],
  },
  {
    key: 'note-tapeout',
    kind: 'note',
    at: '2026-09-11 17:50',
    stageId: 'tapeout',
    text: 'Split MTO — how it works on this program',
    blocks: [
      { p: 'The mask release is split so FEOL wafers keep moving while timing closes in metal.' },
      { h: 'The two releases' },
      {
        table: {
          head: ['Release', 'Layers', 'Database', 'MTO', 'Status'],
          rows: [
            ['FEOL', 'Base layers through V0', 'ECO round 6, placement frozen', '10/05', 'Proposed — held until the 17 paths are classified'],
            ['BEOL', 'M1 to top metal and RDL', 'After the metal-only ECO window', '11/02', 'Planned'],
          ],
        },
      },
      { h: 'What the ECO window admits' },
      {
        table: {
          head: ['Change', 'Admitted', 'Why'],
          rows: [
            ['Detours and re-routes', 'Yes', 'Metal only'],
            ['Layer promotion', 'Yes', 'Metal only'],
            ['Spare-cell and gate-array ECO cells already placed in FEOL', 'Yes', 'The cells are in FEOL; only metal connects them'],
            ['New cells, resizing or Vt swaps outside the spare sites', 'No', 'Needs base layers — reopens FEOL'],
          ],
        },
      },
      { h: 'Constraints still open' },
      {
        table: {
          head: ['Item', 'Status', 'Owner', 'Due'],
          rows: [
            ['FEOL wafer hold before M1', 'Asked for 4 weeks; the foundry has answered only for 3', 'Jaewon Lim', '09/15'],
            ['Incremental PV on the changed metal windows', 'Asked; answer pending', 'Eric Moon', '09/16'],
            ['All 17 paths fixable in metal', 'First pass: 12 look metal-only, not confirmed', 'Jisoo Han', '09/16'],
          ],
        },
      },
      { h: 'If it goes wrong' },
      {
        bullets: [
          'Any base-layer change reopens FEOL and moves First Silicon by at least 3 weeks.',
          'A hold shorter than 4 weeks forces BEOL MTO earlier than 11/02, with fewer ECO loops.',
        ],
      },
    ],
  },
  {
    key: 'classify-0914',
    kind: 'update',
    at: '2026-09-14 09:30',
    step: 'SO-03:7',
    text:
      'Path classification, day 2: 9 of 17 confirmed metal-only (detour and M8/M9 promotion). Still open: 3 CPU core paths under resize analysis, 2 PCIe PIPE paths waiting on SI re-extraction, 2 DDR hold paths waiting on the spare delay cell map. Readout at Tuesday’s readiness review.',
  },
  {
    key: 'feol-prep',
    kind: 'update',
    at: '2026-09-14 10:15',
    step: 'TO-06:1',
    text:
      'FEOL layer list agreed with the foundry MDP team: base layers through V0 go on 10/05, M1 and above held for BEOL. Dry run of the FEOL layer data prep on the round 6 database booked for 09/18.',
  },
];

/* ---------- meetings ---------- */

/**
 * What a meeting links to. Steps are ACT:n; a risk is a post key above; a
 * deliverable is stage:position.
 */
export interface FxLink {
  type: 'stage' | 'activity' | 'step' | 'risk' | 'deliverable' | 'milestone';
  ref: string;
}

export interface FxSeries {
  key: string;
  title: string;
  purpose: string;
  type: string;
  attendees: readonly string[];
  freq: 'daily' | 'weekly';
  weekdays: readonly number[];
  startDate: string;
  time: string;
  durationMinutes: number;
  agendaTemplate: readonly string[];
  location: string;
  stage: string;
  links: readonly FxLink[];
}

export interface FxAgenda {
  title: string;
  presenter: string;
  minutes: number;
  notes?: string;
  outcome?: 'info' | 'decision' | 'action' | 'risk' | 'escalation' | 'deferred';
  links?: readonly FxLink[];
}

export interface FxDecision {
  title: string;
  description: string;
  rationale: string;
  status: 'proposed' | 'approved' | 'superseded' | 'rejected';
  owner: string;
  approvedBy: string;
  scope: string;
  agenda?: number;
  links?: readonly FxLink[];
}

export interface FxAction {
  description: string;
  owner: string;
  contributors?: readonly string[];
  due: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  status: 'open' | 'in_progress' | 'blocked' | 'done';
  type: 'support' | 'new_step' | 'standalone';
  agenda?: number;
  blocker?: string;
  escalation?: string;
  impact?: 'none' | 'step_at_risk' | 'activity_end' | 'milestone' | 'not_assessed';
  impactNote?: string;
  evidence?: string;
  verifiedBy?: string;
  completed?: string;
  /** The meeting it was carried into, by key. */
  carriedTo?: string;
  links?: readonly FxLink[];
}

export interface FxMeeting {
  key: string;
  series?: string;
  /** A one-off meeting names itself; a sitting takes its series'. */
  title?: string;
  type?: string;
  purpose?: string;
  attendees?: readonly string[];
  location?: string;
  stage?: string;
  links?: readonly FxLink[];
  date: string;
  time: string;
  durationMinutes?: number;
  status: 'draft' | 'scheduled' | 'completed' | 'cancelled';
  minutes?: string;
  agenda: readonly FxAgenda[];
  decisions?: readonly FxDecision[];
  actions?: readonly FxAction[];
}

export const FX1_SERIES: readonly FxSeries[] = [
  {
    key: 'warroom',
    title: 'Timing Closure War-room',
    purpose:
      'Every working day until timing closes: what the overnight STA says, which paths are still failing and who owns each, and what goes into the next ECO loop.',
    type: 'war_room',
    attendees: ['Hyunwoo Kang', 'Jisoo Han', 'Seoyeon Park', 'Daniel Cho', 'Eric Moon', 'Nara Yoon', 'Minjun Lee'],
    freq: 'daily',
    weekdays: [1, 2, 3, 4, 5],
    startDate: '2026-08-24',
    time: '17:00',
    durationMinutes: 30,
    agendaTemplate: ['Overnight STA results', 'Paths still failing and owners', 'Next ECO loop scope', 'PV / EM-IR status'],
    location: 'Design center 3F war-room / Teams',
    stage: 'signoff',
    links: [
      { type: 'stage', ref: 'signoff' },
      { type: 'activity', ref: 'SO-03' },
    ],
  },
  {
    key: 'readiness',
    title: 'Weekly Tapeout Readiness Review',
    purpose:
      'Tuesdays through Design Freeze and both MTOs: schedule against the mask slots, signoff status by domain, the tapeout checklist, and the decisions that need the program lead.',
    type: 'readiness_review',
    attendees: ['Minjun Lee', 'Hyunwoo Kang', 'Sujin Choi', 'Kevin Seo', 'Jaewon Lim', 'Eric Moon'],
    freq: 'weekly',
    weekdays: [2],
    startDate: '2026-08-18',
    time: '10:00',
    durationMinutes: 60,
    agendaTemplate: ['Schedule against the mask slots', 'Signoff status by domain', 'Tapeout checklist', 'Decisions and escalations'],
    location: 'Conference room B / Teams',
    stage: 'tapeout',
    links: [
      { type: 'stage', ref: 'signoff' },
      { type: 'stage', ref: 'tapeout' },
      { type: 'milestone', ref: 'designFreeze' },
      { type: 'milestone', ref: 'tapeoutBeolMto' },
    ],
  },
];

export const FX1_MEETINGS: readonly FxMeeting[] = [
  {
    key: 'readiness-0901',
    series: 'readiness',
    date: '2026-09-01',
    time: '10:00',
    status: 'completed',
    minutes: 'Signoff yellow: ECO round 3 in progress, violating paths down from 214 to 96. Tapeout checklist baselined.',
    agenda: [
      {
        title: 'Schedule against the mask slots',
        presenter: '@me',
        minutes: 15,
        notes: 'Foundry confirmed the FEOL slot on 10/05 and the BEOL slot on 11/02. Design Freeze on 09/21 holds if ECO converges by round 4.',
        outcome: 'info',
        links: [{ type: 'milestone', ref: 'designFreeze' }],
      },
      {
        title: 'Signoff status by domain',
        presenter: 'Hyunwoo Kang',
        minutes: 25,
        notes: 'STA: 96 violating paths after round 3. PV, EM/IR and reliability on track.',
        outcome: 'risk',
        links: [{ type: 'activity', ref: 'SO-03' }],
      },
      {
        title: 'Tapeout checklist',
        presenter: 'Sujin Choi',
        minutes: 15,
        notes: 'Checklist baselined at 186 items, each with an owner.',
        outcome: 'info',
        links: [{ type: 'deliverable', ref: 'tapeout:1' }],
      },
    ],
    decisions: [
      {
        title: 'Hold Design Freeze on 09/21 and review convergence again after ECO round 4',
        description: 'No change to the plan this week; the date is re-checked against the round 4 result.',
        rationale: 'Round 3 took violations from 131 to 96; one more round decides whether the curve flattens.',
        status: 'approved',
        owner: '@me',
        approvedBy: 'Minjun Lee',
        scope: 'Design Freeze date',
        agenda: 0,
        links: [{ type: 'milestone', ref: 'designFreeze' }],
      },
    ],
    actions: [
      {
        description: 'Report the ECO burn-down per round in the war-room, with the loop time',
        owner: 'Hyunwoo Kang',
        due: '2026-09-04',
        priority: 'normal',
        status: 'done',
        type: 'standalone',
        agenda: 1,
        evidence: 'Burn-down chart added to the war-room deck from round 4, with loop time per stage.',
        verifiedBy: '@me',
        completed: '2026-09-04',
      },
    ],
  },
  {
    key: 'readiness-0908',
    series: 'readiness',
    date: '2026-09-08',
    time: '10:00',
    status: 'completed',
    minutes: 'Design Freeze on 09/21 is at risk: 38 paths remain after round 5 and a loop with PV takes five working days. Options asked for before Friday.',
    agenda: [
      {
        title: 'Schedule against the mask slots',
        presenter: '@me',
        minutes: 15,
        notes: 'Clean timing forecast 10/05 at the current rate. A full-mask tapeout on that date misses the 10/05 FEOL slot; the next slot is 10/26.',
        outcome: 'risk',
        links: [
          { type: 'milestone', ref: 'designFreeze' },
          { type: 'risk', ref: 'risk-timing' },
        ],
      },
      {
        title: 'Signoff status by domain',
        presenter: 'Hyunwoo Kang',
        minutes: 25,
        notes: 'STA 38 paths (WNS −52 ps). PV clean on the round 4 database; EM/IR clean apart from the ECO deltas.',
        outcome: 'escalation',
        links: [{ type: 'step', ref: 'SO-03:7' }],
      },
      {
        title: 'Decisions and escalations',
        presenter: '@me',
        minutes: 15,
        notes: 'Options to prepare for Friday: full slip, split MTO, or a derated waiver. The customer is told Design Freeze is red.',
        outcome: 'decision',
      },
    ],
    decisions: [
      {
        title: 'Report Design Freeze as red and take split-MTO and full-slip options to a decision review on 09/11',
        description: 'Status goes red in this week’s customer report; the options are decided on Friday.',
        rationale: 'The forecast already misses Design Freeze by two weeks, and the FEOL slot is committed.',
        status: 'approved',
        owner: '@me',
        approvedBy: 'Minjun Lee',
        scope: 'Program status and escalation',
        agenda: 2,
        links: [{ type: 'milestone', ref: 'designFreeze' }],
      },
    ],
    actions: [
      {
        description: 'Prepare the split-MTO and full-slip options with schedule and mask cost impact',
        owner: '@me',
        due: '2026-09-10',
        priority: 'high',
        status: 'done',
        type: 'standalone',
        agenda: 2,
        evidence: 'Options deck issued 09/10: a split keeps First Silicon on 01/25; a full slip moves it to 02/15 at the next slot.',
        verifiedBy: 'Minjun Lee',
        completed: '2026-09-10',
        links: [{ type: 'milestone', ref: 'tapeoutBeolMto' }],
      },
      {
        description: 'Ask the foundry whether the 10/05 slot can take FEOL alone, and how long FEOL wafers can be held before M1',
        owner: 'Jaewon Lim',
        due: '2026-09-11',
        priority: 'high',
        status: 'done',
        type: 'standalone',
        agenda: 0,
        evidence: 'Foundry confirmed a split on the 10/05 slot. The hold window answer is still pending.',
        verifiedBy: '@me',
        completed: '2026-09-11',
      },
    ],
  },
  {
    key: 'warroom-0910',
    series: 'warroom',
    date: '2026-09-10',
    time: '17:00',
    status: 'completed',
    minutes: 'Round 6 ECO submitted at 14:00; its PV run finishes Friday noon.',
    agenda: [
      {
        title: 'Overnight STA results',
        presenter: 'Jisoo Han',
        minutes: 10,
        notes: 'Round 5 re-run confirms 38 paths; 21 of them targeted in round 6.',
        outcome: 'info',
        links: [{ type: 'step', ref: 'SO-03:5' }],
      },
      {
        title: 'Next ECO loop scope',
        presenter: 'Seoyeon Park',
        minutes: 10,
        notes: 'Round 6: the 12 CPU core ↔ L3 cache paths by detour and upsizing; PCIe PIPE by layer promotion.',
        outcome: 'action',
      },
      {
        title: 'PV / EM-IR status',
        presenter: 'Eric Moon',
        minutes: 10,
        notes: 'Full-chip DRC/LVS on round 5: clean. Round 6 PV finishes Friday noon.',
        outcome: 'risk',
        links: [{ type: 'risk', ref: 'risk-pv' }],
      },
    ],
    decisions: [
      {
        title: 'Put the 12 CPU core ↔ L3 cache paths first in ECO round 6',
        description: 'Round 6 capacity goes to the CPU cluster before the PCIe and DDR paths.',
        rationale: 'They are 12 of the 17 worst paths and the ones most likely to need a base-layer fix.',
        status: 'approved',
        owner: 'Hyunwoo Kang',
        approvedBy: '@me',
        scope: 'ECO round 6',
        agenda: 1,
        links: [{ type: 'activity', ref: 'SO-03' }],
      },
    ],
    actions: [
      {
        description: 'Check spare delay cell coverage within 50 µm of the 2 DDR PHY hold endpoints',
        owner: 'Daniel Cho',
        due: '2026-09-14',
        priority: 'normal',
        status: 'open',
        type: 'support',
        agenda: 1,
        carriedTo: 'warroom-0914',
        links: [{ type: 'step', ref: 'SO-03:7' }],
      },
      {
        description: 'Ask the foundry whether incremental PV on the changed metal windows is accepted for BEOL MTO',
        owner: 'Eric Moon',
        due: '2026-09-16',
        priority: 'high',
        status: 'in_progress',
        type: 'support',
        agenda: 2,
        links: [{ type: 'risk', ref: 'risk-pv' }],
      },
    ],
  },
  {
    key: 'split-decision',
    title: 'Split MTO decision review',
    type: 'program_review',
    purpose: 'Decide how to protect the mask slots now that timing signoff is two weeks late.',
    attendees: ['Minjun Lee', 'Hyunwoo Kang', 'Sujin Choi', 'Jaewon Lim', 'Eric Moon', 'Seoyeon Park', 'Kevin Seo'],
    location: 'Conference room A / Teams',
    stage: 'tapeout',
    links: [
      { type: 'stage', ref: 'signoff' },
      { type: 'stage', ref: 'tapeout' },
      { type: 'milestone', ref: 'tapeoutBeolMto' },
    ],
    date: '2026-09-11',
    time: '14:00',
    durationMinutes: 90,
    status: 'completed',
    minutes:
      'Timing signoff forecast is 10/05, two weeks past Design Freeze. Agreed to split the mask release: FEOL on the 10/05 slot from the round 6 database, BEOL on 11/02 after a metal-only ECO window. Releasing FEOL from round 6 is held until the 17 paths are confirmed fixable in metal.',
    agenda: [
      {
        title: 'Where timing signoff stands',
        presenter: 'Hyunwoo Kang',
        minutes: 20,
        notes: '17 critical paths after round 6 (WNS −41 ps). Five working days per loop with PV and EM/IR; clean timing forecast 10/05.',
        outcome: 'info',
        links: [{ type: 'step', ref: 'SO-03:7' }],
      },
      {
        title: 'Options: full slip, split MTO, derated waiver',
        presenter: '@me',
        minutes: 30,
        notes:
          'Full slip: next slot 10/26, First Silicon 02/15 (+3 weeks). Split MTO: First Silicon holds 01/25 at extra mask handling cost, and every fix must be metal-only. Derated waiver: the customer will not accept a 3% frequency derate.',
        outcome: 'decision',
        links: [{ type: 'milestone', ref: 'tapeoutBeolMto' }],
      },
      {
        title: 'Can all 17 paths be fixed in metal?',
        presenter: 'Seoyeon Park',
        minutes: 25,
        notes: '12 look metal-only. 3 CPU core paths may need a Vt swap; 2 DDR hold paths depend on spare delay cells near the endpoints. Not confirmed.',
        outcome: 'risk',
        links: [{ type: 'risk', ref: 'risk-feol' }],
      },
      {
        title: 'Foundry constraints on a split',
        presenter: 'Jaewon Lim',
        minutes: 15,
        notes: 'A split is possible on the 10/05 slot. FEOL wafers are held before M1; the maximum hold is not yet confirmed (asked for 4 weeks).',
        outcome: 'action',
        links: [{ type: 'deliverable', ref: 'tapeout:4' }],
      },
    ],
    decisions: [
      {
        title: 'Split the mask release: FEOL MTO 10/05, BEOL MTO 11/02',
        description: 'FEOL goes on the committed 10/05 slot; BEOL follows on 11/02 once timing is closed by metal-only ECO.',
        rationale:
          'A full two-week slip misses the 10/05 slot and the next one is 10/26, moving First Silicon three weeks. Splitting keeps FEOL wafers moving while timing closes in metal.',
        status: 'approved',
        owner: '@me',
        approvedBy: 'Minjun Lee',
        scope: 'AtlasFX1 mask release plan',
        agenda: 1,
        links: [
          { type: 'milestone', ref: 'tapeoutBeolMto' },
          { type: 'activity', ref: 'TO-06' },
        ],
      },
      {
        title: 'Release FEOL from the ECO round 6 database with placement frozen',
        description: 'Base layers through V0 from the round 6 database; no cell changes after 09/18.',
        rationale: 'Safe only if every remaining violation can be fixed in metal — waiting on the path classification due 09/16.',
        status: 'proposed',
        owner: 'Hyunwoo Kang',
        approvedBy: '',
        scope: 'FEOL database for the 10/05 MTO',
        agenda: 2,
        links: [{ type: 'risk', ref: 'risk-feol' }],
      },
      {
        title: 'Slip the full-mask tapeout two weeks to the 10/26 slot',
        description: 'Hold every mask until timing is clean.',
        rationale: 'Moves First Silicon from 01/25 to 02/15, and the customer sample date with it.',
        status: 'rejected',
        owner: '@me',
        approvedBy: 'Minjun Lee',
        scope: 'AtlasFX1 mask release plan',
        agenda: 1,
        links: [{ type: 'milestone', ref: 'firstSilicon' }],
      },
    ],
    actions: [
      {
        description: 'Confirm spare-cell and gate-array ECO cell coverage near all 17 path endpoints',
        owner: 'Seoyeon Park',
        contributors: ['Daniel Cho'],
        due: '2026-09-16',
        priority: 'high',
        status: 'in_progress',
        type: 'support',
        agenda: 2,
        links: [{ type: 'step', ref: 'TO-07:1' }],
      },
      {
        description: 'Confirm the maximum FEOL hold before M1 and the extra mask handling cost of the split',
        owner: 'Jaewon Lim',
        due: '2026-09-15',
        priority: 'high',
        status: 'blocked',
        type: 'standalone',
        agenda: 3,
        blocker: 'Foundry fab planning has not answered on a hold longer than 3 weeks; four metal ECO loops need 4.',
        escalation: '2026-09-16',
        impact: 'milestone',
        impactNote: 'A hold shorter than 4 weeks forces BEOL MTO earlier than 11/02.',
        links: [{ type: 'deliverable', ref: 'tapeout:4' }],
      },
      {
        description: 'Plan the metal ECO loops from 10/05 to 11/02 with PV and EM/IR turnaround per loop',
        owner: 'Eric Moon',
        due: '2026-09-17',
        priority: 'high',
        status: 'open',
        type: 'support',
        agenda: 3,
        links: [{ type: 'activity', ref: 'TO-09' }],
      },
      {
        description: 'Re-baseline the tapeout plan — Design Freeze 10/05, FEOL MTO 10/05, BEOL MTO 11/02 — and brief the customer',
        owner: '@me',
        due: '2026-09-15',
        priority: 'high',
        status: 'in_progress',
        type: 'standalone',
        agenda: 1,
        impact: 'milestone',
        impactNote: 'Design Freeze moves two weeks; both MTO dates hold.',
        links: [{ type: 'milestone', ref: 'designFreeze' }],
      },
      {
        description: 'Prepare the FEOL layer data from the round 6 database for a dry run',
        owner: 'Kevin Seo',
        due: '2026-09-18',
        priority: 'normal',
        status: 'open',
        type: 'support',
        agenda: 3,
        links: [{ type: 'step', ref: 'TO-06:1' }],
      },
    ],
  },
  {
    key: 'warroom-0911',
    series: 'warroom',
    date: '2026-09-11',
    time: '17:00',
    status: 'completed',
    minutes: 'Round 6 result in: 17 critical paths remain. Split MTO agreed in principle at the 14:00 review; path classification started.',
    agenda: [
      {
        title: 'Overnight STA results',
        presenter: 'Jisoo Han',
        minutes: 10,
        notes: '17 paths: WNS −41 ps, TNS −0.41 ns. 12 CPU core, 3 PCIe PIPE, 2 DDR hold.',
        outcome: 'info',
        links: [{ type: 'step', ref: 'SO-03:5' }],
      },
      {
        title: 'Paths still failing and owners',
        presenter: 'Hyunwoo Kang',
        minutes: 10,
        notes: 'Each of the 17 paths has an owner and a candidate metal-only fix.',
        outcome: 'action',
        links: [{ type: 'step', ref: 'SO-03:7' }],
      },
      {
        title: 'Next ECO loop scope',
        presenter: 'Seoyeon Park',
        minutes: 10,
        notes: 'No more cell-level ECO until the classification is back; round 7 takes metal-only candidates.',
        outcome: 'decision',
      },
    ],
    decisions: [
      {
        title: 'ECO round 7 admits metal-only fixes',
        description: 'Detours, layer promotion and spare-cell buffering only; no new cells and no resizing outside the spare-cell sites.',
        rationale: 'Anything else would invalidate the FEOL database the program intends to release on 10/05.',
        status: 'approved',
        owner: 'Hyunwoo Kang',
        approvedBy: '@me',
        scope: 'ECO round 7 onward',
        agenda: 2,
        links: [{ type: 'activity', ref: 'TO-07' }],
      },
    ],
    actions: [
      {
        description: 'Classify each of the 17 paths as metal-only or base-layer, with the proposed fix',
        owner: 'Jisoo Han',
        contributors: ['Seoyeon Park', 'Daniel Cho'],
        due: '2026-09-16',
        priority: 'critical',
        status: 'in_progress',
        type: 'support',
        agenda: 1,
        impact: 'milestone',
        impactNote: 'Decides whether FEOL can be released on 10/05.',
        links: [{ type: 'risk', ref: 'risk-feol' }],
      },
    ],
  },
  {
    key: 'warroom-0914',
    series: 'warroom',
    date: '2026-09-14',
    time: '17:00',
    status: 'scheduled',
    agenda: [
      { title: 'Overnight STA results', presenter: 'Jisoo Han', minutes: 10, links: [{ type: 'step', ref: 'SO-03:5' }] },
      { title: 'Path classification — 9 of 17 confirmed', presenter: 'Jisoo Han', minutes: 10, links: [{ type: 'risk', ref: 'risk-feol' }] },
      { title: 'Spare delay cells near the DDR PHY', presenter: 'Daniel Cho', minutes: 10 },
    ],
  },
  {
    key: 'readiness-0915',
    series: 'readiness',
    date: '2026-09-15',
    time: '10:00',
    status: 'scheduled',
    agenda: [
      { title: 'Path classification readout: can all 17 be fixed in metal?', presenter: 'Jisoo Han', minutes: 20, links: [{ type: 'risk', ref: 'risk-feol' }] },
      { title: 'Foundry answer on the FEOL hold window', presenter: 'Jaewon Lim', minutes: 15, links: [{ type: 'deliverable', ref: 'tapeout:4' }] },
      { title: 'Re-baselined tapeout plan', presenter: '@me', minutes: 15, links: [{ type: 'milestone', ref: 'tapeoutBeolMto' }] },
      { title: 'Go / No-Go criteria for FEOL MTO', presenter: 'Sujin Choi', minutes: 10, links: [{ type: 'activity', ref: 'TO-05' }] },
    ],
  },
  {
    key: 'warroom-0915',
    series: 'warroom',
    date: '2026-09-15',
    time: '17:00',
    status: 'scheduled',
    agenda: [
      { title: 'Overnight STA results', presenter: 'Jisoo Han', minutes: 10 },
      { title: 'Round 7 metal-only candidates', presenter: 'Seoyeon Park', minutes: 15, links: [{ type: 'activity', ref: 'TO-07' }] },
    ],
  },
  {
    key: 'foundry-0916',
    title: 'Foundry alignment: FEOL/BEOL split MTO',
    type: 'supplier_review',
    purpose: 'Settle the split with the foundry: FEOL hold window, BEOL slot, mask handling cost, and whether incremental PV is accepted.',
    attendees: ['Jaewon Lim', 'Hana Jung', 'Sujin Choi', 'Kevin Seo', 'Eric Moon'],
    location: 'Teams (foundry bridge)',
    stage: 'tapeout',
    links: [
      { type: 'stage', ref: 'tapeout' },
      { type: 'activity', ref: 'TO-06' },
      { type: 'deliverable', ref: 'tapeout:4' },
    ],
    date: '2026-09-16',
    time: '08:00',
    durationMinutes: 60,
    status: 'scheduled',
    agenda: [
      { title: 'FEOL hold before M1 — 3 or 4 weeks', presenter: 'Hana Jung', minutes: 20, links: [{ type: 'risk', ref: 'risk-feol' }] },
      { title: 'BEOL slot on 11/02 and mask handling cost', presenter: 'Jaewon Lim', minutes: 15, links: [{ type: 'milestone', ref: 'tapeoutBeolMto' }] },
      { title: 'Incremental PV on the changed metal windows', presenter: 'Eric Moon', minutes: 15, links: [{ type: 'risk', ref: 'risk-pv' }] },
    ],
  },
  {
    key: 'feol-gonogo',
    title: 'FEOL MTO Go / No-Go',
    type: 'readiness_review',
    purpose: 'Decide whether the FEOL database is released on 10/05.',
    attendees: ['Minjun Lee', 'Hyunwoo Kang', 'Sujin Choi', 'Kevin Seo', 'Jaewon Lim'],
    location: 'Conference room A',
    stage: 'tapeout',
    links: [
      { type: 'activity', ref: 'TO-05' },
      { type: 'deliverable', ref: 'tapeout:4' },
    ],
    date: '2026-09-29',
    time: '15:00',
    durationMinutes: 60,
    status: 'draft',
    agenda: [
      { title: 'All 17 paths confirmed fixable in metal', presenter: 'Hyunwoo Kang', minutes: 15, links: [{ type: 'risk', ref: 'risk-feol' }] },
      { title: 'FEOL layer data dry run result', presenter: 'Kevin Seo', minutes: 15, links: [{ type: 'step', ref: 'TO-06:1' }] },
      { title: 'Tapeout checklist — FEOL items', presenter: 'Sujin Choi', minutes: 15, links: [{ type: 'deliverable', ref: 'tapeout:1' }] },
    ],
  },
];
