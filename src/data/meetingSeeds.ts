/**
 * The seeded programme's meetings: five series a TPM on a 4nm accelerator runs
 * or sits in, and what was said at their recent sittings.
 *
 * Written content, like the risk seeds — about this programme rather than the
 * template. The dates are not here: /lib/meetingSeed.ts places each sitting on
 * the series' own rule, relative to the day the seed runs, and only once the
 * stage the series is about has started. The work each row links to is chosen
 * there too, from what is actually in flight, so a meeting is never about an
 * activity that has not begun.
 *
 * People are named as the programme names them: `@lead` is the stage's lead,
 * `@me` the TPM, anything else a contact by name.
 */

export type SeedLink = 'stage' | 'activity' | 'step' | 'risk' | 'deliverable' | 'milestone';

export interface SeedAgenda {
  title: string;
  presenter: string;
  minutes: number;
  notes?: string;
  outcome?: 'info' | 'decision' | 'action' | 'risk' | 'escalation' | 'deferred';
  deferral?: 'next_meeting' | 'offline' | 'dropped';
  link?: SeedLink;
}

export interface SeedDecision {
  title: string;
  description: string;
  rationale: string;
  status: 'proposed' | 'approved' | 'superseded' | 'rejected';
  owner: string;
  approvedBy: string;
  scope: string;
  /** Index into the sitting's agenda. */
  agenda?: number;
  link?: SeedLink;
}

export interface SeedAction {
  description: string;
  owner: string;
  contributors?: string[];
  /** Days from the sitting it was raised in. */
  dueAfter: number;
  priority: 'critical' | 'high' | 'normal' | 'low';
  status: 'open' | 'in_progress' | 'blocked' | 'done';
  type: 'support' | 'new_step' | 'standalone';
  agenda?: number;
  blocker?: string;
  escalateAfter?: number;
  impact?: 'none' | 'step_at_risk' | 'activity_end' | 'milestone' | 'not_assessed';
  impactNote?: string;
  evidence?: string;
  verifiedBy?: string;
  /** Carried into the next sitting of the series, still unfinished. */
  carry?: boolean;
  link?: SeedLink;
}

export interface SeedSitting {
  /** -1 is the last sitting before today, -2 the one before it; 1 is the next one ahead. */
  when: number;
  status: 'completed' | 'cancelled' | 'scheduled' | 'draft';
  minutes?: string;
  cancelReason?: string;
  agenda: SeedAgenda[];
  decisions?: SeedDecision[];
  actions?: SeedAction[];
}

export interface SeedSeries {
  key: string;
  title: string;
  purpose: string;
  type: 'program_review' | 'working_group' | 'war_room' | 'supplier_review' | 'readiness_review' | 'design_review' | 'bringup' | 'ad_hoc';
  /** The stage the series is about — no sitting is placed before it starts. */
  stage: string;
  /** Other stages it covers, linked too. */
  alsoStages?: string[];
  milestone?: string;
  /** Words to find the deliverable it reviews by. */
  deliverable?: string;
  owner: string;
  attendees: string[];
  freq: 'daily' | 'weekly' | 'monthly';
  interval: number;
  weekdays: number[];
  time: string;
  durationMinutes: number;
  agendaTemplate: string[];
  location: string;
  active: boolean;
  sittings: SeedSitting[];
}

export const MEETING_SEEDS: SeedSeries[] = [
  {
    key: 'dft',
    title: 'DFT Weekly Review',
    purpose:
      'Track ATPG coverage, scan compression and pattern count against the tester-time budget, and clear DFT blockers before DFT signoff.',
    type: 'working_group',
    stage: 'dft',
    alsoStages: ['testDevelopment'],
    owner: '@lead',
    attendees: ['Yusuf Demir', 'Anja Keller', 'Tarek Haddad', 'Grace Holt', '@me'],
    freq: 'weekly',
    interval: 1,
    weekdays: [2],
    time: '09:00',
    durationMinutes: 60,
    agendaTemplate: ['Open actions from last week', 'ATPG coverage and pattern count', 'Scan compression versus tester time', 'Risks and escalations'],
    location: 'B2-Tahoe / Teams',
    active: true,
    sittings: [
      {
        when: -2,
        status: 'completed',
        minutes: 'Full attendance. Test development joined for the tester-time item.',
        agenda: [
          { title: 'ATPG coverage and pattern count', presenter: 'Tarek Haddad', minutes: 20, notes: 'Stuck-at coverage at 98.6%, transition at 91.2%. Pattern count 14% over the tester-time budget.', outcome: 'action', link: 'activity' },
          { title: 'Scan compression versus tester time', presenter: 'Yusuf Demir', minutes: 25, notes: 'Raising the ratio buys the budget back but costs coverage on the coherency block. Needs a trial run before deciding.', outcome: 'decision', link: 'step' },
          { title: 'Risks and escalations', presenter: '@me', minutes: 10, notes: 'Compression shortfall stays on the risk list until the trial run is back.', outcome: 'info', link: 'risk' },
        ],
        decisions: [
          {
            title: 'Trial a 60x compression ratio on the full netlist before changing the plan',
            description: 'Run ATPG at 60x on the latest netlist drop and compare coverage and pattern count with the current 40x.',
            rationale: 'Committing to 60x without data risks losing coverage we cannot win back after tapeout.',
            status: 'approved',
            owner: 'Yusuf Demir',
            approvedBy: '@lead',
            scope: 'DFT compression configuration for netlist drop N2',
            agenda: 1,
            link: 'activity',
          },
        ],
        actions: [
          { description: 'Rerun ATPG at 60x compression on netlist drop N2 and report coverage and pattern count', owner: 'Tarek Haddad', dueAfter: 5, priority: 'high', status: 'done', type: 'support', agenda: 1, evidence: 'Coverage 98.1% stuck-at, 90.4% transition; pattern count back inside budget.', verifiedBy: 'Yusuf Demir', link: 'step' },
        ],
      },
      {
        when: -1,
        status: 'completed',
        minutes: 'Trial results reviewed. Grace Holt raised that the tester-time budget itself has not been confirmed with the test house.',
        agenda: [
          { title: 'Open actions from last week', presenter: '@me', minutes: 10, notes: 'Trial run done and verified.', outcome: 'info' },
          { title: 'ATPG coverage and pattern count', presenter: 'Tarek Haddad', minutes: 20, notes: 'At 60x the transition coverage drop is concentrated in untestable faults on the coherency block.', outcome: 'action', link: 'step' },
          { title: 'Scan compression versus tester time', presenter: 'Yusuf Demir', minutes: 20, notes: 'Hold at 60x pending the untestable-fault analysis. Budget confirmation needed from test development.', outcome: 'deferred', deferral: 'next_meeting', link: 'risk' },
        ],
        decisions: [
          {
            title: 'Keep 60x compression for drop N2 while untestable faults are analysed',
            description: 'N2 goes forward at 60x; the ratio is revisited once the coherency-block analysis is back.',
            rationale: 'Pattern count fits the budget at 60x, and the coverage loss is explainable rather than random.',
            status: 'approved',
            owner: '@lead',
            approvedBy: '@me',
            scope: 'Netlist drop N2 only',
            agenda: 2,
            link: 'activity',
          },
        ],
        actions: [
          { description: 'Analyse untestable faults on the coherency block and justify the coverage number', owner: 'Yusuf Demir', contributors: ['Tarek Haddad'], dueAfter: 10, priority: 'high', status: 'in_progress', type: 'support', agenda: 1, impact: 'step_at_risk', impactNote: 'The coverage justification step cannot close until this analysis is back.', link: 'risk' },
          { description: 'Confirm the tester-time budget with the test house in writing', owner: 'Grace Holt', dueAfter: 4, priority: 'normal', status: 'open', type: 'standalone', agenda: 2, carry: true },
        ],
      },
      {
        when: 1,
        status: 'scheduled',
        agenda: [
          { title: 'Open actions from last week', presenter: '@me', minutes: 10 },
          { title: 'Untestable-fault analysis on the coherency block', presenter: 'Yusuf Demir', minutes: 25, link: 'risk' },
          { title: 'Tester-time budget confirmation', presenter: 'Grace Holt', minutes: 15 },
        ],
      },
    ],
  },
  {
    key: 'pd',
    title: 'Physical Design Closure Review',
    purpose:
      'Drive timing, SI and PDN closure turn by turn, decide floorplan changes, and keep the path to the PD database handoff visible.',
    type: 'design_review',
    stage: 'physicalDesign',
    alsoStages: ['signoff'],
    owner: '@lead',
    attendees: ['Marco Bianchi', 'Jiwoo Park', 'Nate Coleman', 'Ingrid Berg', 'Ravi Iyer', '@me'],
    freq: 'weekly',
    interval: 1,
    weekdays: [4],
    time: '10:00',
    durationMinutes: 60,
    agendaTemplate: ['Timing closure by corner', 'SI and crosstalk', 'PDN and IR drop', 'ECOs and turn plan'],
    location: 'B3-Shasta',
    active: true,
    sittings: [
      {
        when: -1,
        status: 'completed',
        minutes: 'Turn 2 review. Crosstalk on the high-speed routes is the item gating closure.',
        agenda: [
          { title: 'Timing closure by corner', presenter: 'Jiwoo Park', minutes: 15, notes: 'WNS -41 ps at SS 0.675 V after CTS rebalance; hold clean at FF -40 C.', outcome: 'info', link: 'activity' },
          { title: 'SI and crosstalk', presenter: 'Nate Coleman', minutes: 25, notes: 'Spacing fix needs room the floorplan does not have. Moving macro M3 by 40 um opens it, at the cost of re-running placement in that region.', outcome: 'decision', link: 'risk' },
          { title: 'PDN and IR drop', presenter: 'Ingrid Berg', minutes: 15, notes: 'IR drop at worst corner over budget; signoff wants the PDN change before the next turn.', outcome: 'escalation', link: 'step' },
        ],
        decisions: [
          {
            title: 'Move macro M3 by 40 um to open spacing on the high-speed routes',
            description: 'Shift M3 north by 40 um and re-place the surrounding region in Turn 3.',
            rationale: 'Spacing is the only fix for the crosstalk that does not touch the RTL, and M3 is the only macro with room to move.',
            status: 'proposed',
            owner: 'Marco Bianchi',
            approvedBy: '',
            scope: 'Floorplan for Turn 3',
            agenda: 1,
            link: 'risk',
          },
          {
            title: 'Freeze the Turn 3 floorplan apart from the M3 move',
            description: 'No other macro placement changes in Turn 3.',
            rationale: 'Every other change reopens timing that is already closed.',
            status: 'approved',
            owner: '@lead',
            approvedBy: '@me',
            scope: 'Turn 3',
            agenda: 1,
            link: 'activity',
          },
        ],
        actions: [
          { description: 'Rerun SI analysis with the revised spacing rule on the high-speed routes', owner: 'Nate Coleman', dueAfter: 6, priority: 'critical', status: 'in_progress', type: 'support', agenda: 1, impact: 'step_at_risk', impactNote: 'The routing convergence step closes on this result.', link: 'step' },
          { description: 'Get the foundry to confirm the non-default routing rule is allowed', owner: 'Marco Bianchi', dueAfter: 3, priority: 'high', status: 'blocked', type: 'support', agenda: 1, blocker: 'Waiting on the foundry to clarify the DRC deck for non-default rules.', escalateAfter: 5, impact: 'activity_end', impactNote: 'If the rule is refused, the M3 move does not fix the crosstalk and Turn 3 slips.', link: 'risk' },
        ],
      },
      {
        when: 1,
        status: 'scheduled',
        agenda: [
          { title: 'SI rerun results', presenter: 'Nate Coleman', minutes: 20, link: 'risk' },
          { title: 'Foundry answer on the routing rule', presenter: 'Marco Bianchi', minutes: 15 },
          { title: 'PDN change plan with signoff', presenter: 'Ingrid Berg', minutes: 20, link: 'step' },
        ],
      },
    ],
  },
  {
    key: 'to',
    title: 'Tapeout Readiness Review',
    purpose:
      'Walk the tapeout checklist against the mask order date: open ECOs, signoff exceptions, release packages and who signs each off.',
    type: 'readiness_review',
    stage: 'signoff',
    alsoStages: ['tapeout'],
    milestone: 'tapeoutBeolMto',
    deliverable: 'tapeout checklist',
    owner: '@me',
    attendees: ['Elena Sokolov', 'Brian Walsh', 'Mai Tran', 'Ravi Iyer', 'Marco Bianchi'],
    freq: 'weekly',
    interval: 2,
    weekdays: [1],
    time: '14:00',
    durationMinutes: 90,
    agendaTemplate: ['Checklist walk-through', 'Open ECOs against the final turn', 'Signoff exceptions and waivers', 'Release packages and owners'],
    location: 'B1-Whitney',
    active: true,
    sittings: [
      {
        when: -1,
        status: 'completed',
        minutes: 'First readiness review. Checklist baselined; owners named for every section.',
        agenda: [
          { title: 'Checklist walk-through', presenter: 'Brian Walsh', minutes: 30, notes: 'Checklist baselined at 212 items; 38 not yet owned.', outcome: 'action', link: 'deliverable' },
          { title: 'Signoff exceptions and waivers', presenter: 'Ravi Iyer', minutes: 25, notes: 'Waiver list to be reviewed item by item two reviews before MTO.', outcome: 'info', link: 'stage' },
          { title: 'Release packages and owners', presenter: 'Elena Sokolov', minutes: 20, notes: 'FEOL and BEOL release as separate packages.', outcome: 'decision', link: 'milestone' },
        ],
        decisions: [
          {
            title: 'Release FEOL and BEOL as two separate mask packages',
            description: 'FEOL masks are ordered first; BEOL follows after the ECO fix window.',
            rationale: 'Keeps the BEOL ECO window open without holding the whole mask order.',
            status: 'approved',
            owner: 'Elena Sokolov',
            approvedBy: '@me',
            scope: 'AtlasAX1 mask order',
            agenda: 2,
            link: 'milestone',
          },
        ],
        actions: [
          { description: 'Assign an owner to each of the 38 unowned checklist items', owner: 'Brian Walsh', dueAfter: 7, priority: 'high', status: 'open', type: 'standalone', agenda: 0, link: 'deliverable' },
          { description: 'Confirm the FEOL and BEOL mask slot dates with the foundry', owner: '@me', contributors: ['Elena Sokolov'], dueAfter: 18, priority: 'high', status: 'open', type: 'standalone', agenda: 2, link: 'milestone' },
        ],
      },
      {
        when: 1,
        status: 'scheduled',
        agenda: [
          { title: 'Checklist ownership', presenter: 'Brian Walsh', minutes: 20, link: 'deliverable' },
          { title: 'Open ECOs against the final turn', presenter: 'Marco Bianchi', minutes: 25 },
          { title: 'Mask order dates and slot confirmation', presenter: '@me', minutes: 20, link: 'milestone' },
        ],
      },
    ],
  },
  {
    key: 'pkg',
    title: 'Package Supplier Review',
    purpose:
      'Review substrate and assembly supplier commitments — capacity, lead times, qualification lots — against the package design freeze.',
    type: 'supplier_review',
    stage: 'packageDesign',
    alsoStages: ['packaging'],
    deliverable: 'OSAT assembly process',
    owner: '@lead',
    attendees: ['Aya Nakamura', 'Carlos Vega', 'Femi Ade', 'Lucy Zhang', '@me'],
    freq: 'weekly',
    interval: 2,
    weekdays: [3],
    time: '08:00',
    durationMinutes: 60,
    agendaTemplate: ['Substrate supplier status', 'OSAT capacity and assembly window', 'Qualification lots'],
    location: 'Teams',
    active: true,
    sittings: [
      {
        when: -2,
        status: 'completed',
        minutes: 'Substrate lead time moved out by the extra layer. OSAT has not committed an assembly window.',
        agenda: [
          { title: 'Substrate supplier status', presenter: 'Carlos Vega', minutes: 25, notes: 'Extra layer confirmed; quote and lead time revised upward.', outcome: 'decision', link: 'deliverable' },
          { title: 'OSAT capacity and assembly window', presenter: 'Lucy Zhang', minutes: 25, notes: 'OSAT verbally holding the window; nothing in writing.', outcome: 'action', link: 'activity' },
        ],
        decisions: [
          {
            title: 'Qualify a second substrate supplier for builds after the first',
            description: 'Start qualification with the alternate supplier now; the first build stays with the primary.',
            rationale: 'A single source with a moving lead time is the biggest schedule exposure in packaging.',
            status: 'approved',
            owner: 'Carlos Vega',
            approvedBy: '@lead',
            scope: 'Substrate supply from the second build on',
            agenda: 0,
            link: 'deliverable',
          },
        ],
        actions: [
          { description: 'Send the revised substrate stack-up to the alternate supplier for quotation', owner: 'Carlos Vega', dueAfter: 5, priority: 'normal', status: 'done', type: 'standalone', agenda: 0, evidence: 'Stack-up sent; quotation received and filed.', verifiedBy: 'Aya Nakamura' },
          { description: 'Get the OSAT to commit the assembly window in writing', owner: 'Lucy Zhang', dueAfter: 7, priority: 'high', status: 'open', type: 'support', agenda: 1, impact: 'not_assessed', link: 'deliverable' },
        ],
      },
      {
        when: -1,
        status: 'cancelled',
        cancelReason: 'Supplier travel — folded into the next review.',
        agenda: [
          { title: 'Substrate supplier status', presenter: 'Carlos Vega', minutes: 20 },
          { title: 'OSAT capacity and assembly window', presenter: 'Lucy Zhang', minutes: 20 },
        ],
      },
      {
        when: 1,
        status: 'scheduled',
        agenda: [
          { title: 'OSAT written commitment', presenter: 'Lucy Zhang', minutes: 20, link: 'deliverable' },
          { title: 'Alternate substrate quotation', presenter: 'Carlos Vega', minutes: 20 },
          { title: 'Qualification lots', presenter: 'Femi Ade', minutes: 15 },
        ],
      },
    ],
  },
  {
    key: 'bu',
    title: 'Silicon Bring-up Daily',
    purpose:
      'Daily stand-up during bring-up: what powered on, what failed, which debug path is blocked, and who is on the next board.',
    type: 'bringup',
    stage: 'bringup',
    owner: '@lead',
    attendees: ['Max Richter', 'Dana Levi', 'Vik Sharma', 'Emma Toth', '@me'],
    freq: 'daily',
    interval: 1,
    weekdays: [1, 2, 3, 4, 5],
    time: '08:30',
    durationMinutes: 30,
    agendaTemplate: ['Board status', 'Failures since yesterday', 'Debug blockers'],
    location: 'Lab 2 / Teams',
    /* not running yet: bring-up starts when first silicon arrives */
    active: false,
    sittings: [],
  },
];
