/**
 * The seeded programme's meetings: the series a TPM on a 4nm accelerator runs
 * or sits in while physical design is closing, the one-off meetings around
 * them, and what was said at their recent sittings.
 *
 * Written content, like the risk seeds — about this programme rather than the
 * template. The dates are not here: /lib/meetingSeed.ts places each sitting on
 * the series' own rule, relative to the day the seed runs, and only once the
 * stage the meeting is about has started. The work each row links to is chosen
 * there too, from what is actually in flight, so a meeting is never about an
 * activity that has not begun.
 *
 * People are named as the programme names them: `@lead` is the meeting's own
 * stage lead, `@lead:<stage>` another stage's lead, `@me` the TPM, anything
 * else a contact by name.
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

interface SeedAbout {
  key: string;
  title: string;
  purpose: string;
  type: 'program_review' | 'working_group' | 'war_room' | 'supplier_review' | 'readiness_review' | 'design_review' | 'bringup' | 'ad_hoc';
  /** The stage the meeting is about — nothing is placed before it starts. */
  stage: string;
  /** Other stages it covers, linked too. */
  alsoStages?: string[];
  milestone?: string;
  /** Words to find the deliverable it reviews by. */
  deliverable?: string;
  owner: string;
  attendees: string[];
  durationMinutes: number;
  location: string;
}

export interface SeedSeries extends SeedAbout {
  freq: 'daily' | 'weekly' | 'monthly';
  interval: number;
  weekdays: number[];
  time: string;
  agendaTemplate: string[];
  active: boolean;
  sittings: SeedSitting[];
}

/** A meeting called once, outside any series. */
export interface SeedOneOff extends SeedAbout {
  /** Days from today; negative is past. A weekend moves to the nearest working day in the same direction. */
  inDays: number;
  time: string;
  sitting: Omit<SeedSitting, 'when'>;
}

export const MEETING_SEEDS: SeedSeries[] = [
  {
    key: 'prog',
    title: 'Weekly SoC Program Review',
    purpose:
      'One hour a week across the workstreams in flight: schedule against the tapeout date, the risks that move it, and the decisions that need the whole program in the room.',
    type: 'program_review',
    stage: 'verification',
    alsoStages: ['synthesis', 'physicalDesign', 'signoff', 'packageDesign'],
    milestone: 'tapeoutBeolMto',
    owner: '@me',
    attendees: ['@lead:verification', '@lead:synthesis', '@lead:physicalDesign', '@lead:signoff', '@lead:packageDesign', '@lead:testDevelopment'],
    freq: 'weekly',
    interval: 1,
    weekdays: [1],
    time: '10:00',
    durationMinutes: 60,
    agendaTemplate: ['Schedule against tapeout', 'Top risks and what moves them', 'Decisions needed this week', 'Staffing and escalations'],
    location: 'B1-Whitney / Teams',
    active: true,
    sittings: [
      {
        when: -3,
        status: 'completed',
        minutes: 'Tapeout date held. DV closure and FFN release both land the same week, which is the pinch point for the next month.',
        agenda: [
          { title: 'Schedule against tapeout', presenter: '@me', minutes: 20, notes: 'Critical path runs DV closure → FFN → final PD turn → signoff. Float to MTO is two weeks.', outcome: 'info', link: 'milestone' },
          { title: 'Top risks and what moves them', presenter: '@lead:verification', minutes: 20, notes: 'Coherency coverage and the cross-domain timing budget are the two that could each eat the float.', outcome: 'risk', link: 'risk' },
          { title: 'Staffing and escalations', presenter: '@me', minutes: 15, notes: 'Two DV contractors roll off at month end; extension requested.', outcome: 'escalation' },
        ],
        decisions: [
          {
            title: 'Keep the tapeout date; protect the two weeks of float for signoff',
            description: 'No workstream plans against the float. Slips are reported against their own milestone first.',
            rationale: 'The mask slot is committed and the float is the only buffer for signoff iterations.',
            status: 'approved',
            owner: '@me',
            approvedBy: '@lead:signoff',
            scope: 'AtlasAX1 schedule baseline',
            agenda: 0,
            link: 'milestone',
          },
        ],
        actions: [
          { description: 'Get the two DV contractor extensions approved through end of quarter', owner: '@me', dueAfter: 7, priority: 'high', status: 'done', type: 'standalone', agenda: 2, evidence: 'Both extensions approved by the VP of engineering; POs updated.', verifiedBy: '@lead:verification' },
        ],
      },
      {
        when: -2,
        status: 'completed',
        minutes: 'DV closure will not be clean on the planned date. Discussed a waiver path versus a one-week slip.',
        agenda: [
          { title: 'Schedule against tapeout', presenter: '@me', minutes: 15, notes: 'DV closure trending one week late; FFN release depends on it.', outcome: 'info', link: 'milestone' },
          { title: 'DV closure: waiver or slip', presenter: '@lead:verification', minutes: 25, notes: 'A scoped coverage waiver on the coherency block would hold the date; the alternative is a one-week slip into FFN.', outcome: 'decision', link: 'risk' },
          { title: 'Decisions needed this week', presenter: '@me', minutes: 10, notes: 'Package supplier second source needs program sign-off on cost.', outcome: 'deferred', deferral: 'next_meeting' },
        ],
        decisions: [
          {
            title: 'Pursue a scoped coverage waiver for the coherency block rather than slip DV closure',
            description: 'DV prepares a waiver package with directed tests for the hazard cases; signoff reviews it before FFN.',
            rationale: 'A one-week slip lands inside the signoff float; a scoped waiver with directed tests covers the actual exposure.',
            status: 'approved',
            owner: '@lead:verification',
            approvedBy: '@me',
            scope: 'DV closure criteria for the coherency subsystem',
            agenda: 1,
            link: 'activity',
          },
        ],
        actions: [
          { description: 'Prepare the coherency coverage waiver package with the directed hazard tests', owner: 'Hana Cho', contributors: ['Sam Okafor'], dueAfter: 9, priority: 'critical', status: 'in_progress', type: 'support', agenda: 1, impact: 'milestone', impactNote: 'DV closure checkpoint depends on the waiver being accepted.', link: 'risk' },
        ],
      },
      {
        when: -1,
        status: 'completed',
        minutes: 'Waiver package in progress. PD crosstalk fix needs a floorplan decision this week; package second source approved on cost.',
        agenda: [
          { title: 'Schedule against tapeout', presenter: '@me', minutes: 15, notes: 'Float down to eight working days after the DV slip-in-place.', outcome: 'info', link: 'milestone' },
          { title: 'Top risks and what moves them', presenter: '@lead:physicalDesign', minutes: 20, notes: 'Crosstalk fix needs the M3 macro move; decision taken to the PD closure review.', outcome: 'escalation', link: 'risk' },
          { title: 'Package second-source cost', presenter: '@lead:packageDesign', minutes: 15, notes: 'Cost delta accepted for builds after the first.', outcome: 'decision', link: 'deliverable' },
        ],
        decisions: [
          {
            title: 'Fund the second substrate supplier for builds after the first',
            description: 'Program accepts the unit-cost increase in exchange for a second source from the second build.',
            rationale: 'Single-source lead time is the largest schedule exposure in packaging.',
            status: 'approved',
            owner: '@lead:packageDesign',
            approvedBy: '@me',
            scope: 'Substrate supply, build 2 onward',
            agenda: 2,
            link: 'deliverable',
          },
        ],
        actions: [
          { description: 'Bring the M3 macro move decision back from the PD closure review', owner: '@lead:physicalDesign', dueAfter: 4, priority: 'high', status: 'open', type: 'standalone', agenda: 1, carry: true, link: 'risk' },
          { description: 'Re-baseline the signoff float in the program schedule after the DV waiver lands', owner: '@me', dueAfter: 8, priority: 'normal', status: 'open', type: 'standalone', agenda: 0, link: 'milestone' },
        ],
      },
      {
        when: 1,
        status: 'scheduled',
        agenda: [
          { title: 'Schedule against tapeout', presenter: '@me', minutes: 15, link: 'milestone' },
          { title: 'M3 macro move and Turn 3', presenter: '@lead:physicalDesign', minutes: 20, link: 'risk' },
          { title: 'DV waiver status', presenter: '@lead:verification', minutes: 15, link: 'risk' },
          { title: 'Staffing and escalations', presenter: '@me', minutes: 10 },
        ],
      },
    ],
  },
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
        when: -3,
        status: 'completed',
        minutes: 'MBIST repair flow signed off. Pattern count first flagged as over budget.',
        agenda: [
          { title: 'MBIST and repair status', presenter: 'Anja Keller', minutes: 15, notes: 'Repair flow verified on all memory instances; BISR collateral delivered.', outcome: 'info', link: 'stage' },
          { title: 'ATPG coverage and pattern count', presenter: 'Tarek Haddad', minutes: 20, notes: 'First full-netlist run: pattern count 14% over the tester-time budget at 40x compression.', outcome: 'risk', link: 'activity' },
        ],
        decisions: [
          {
            title: 'Keep MBIST repair enabled on all memory instances for first silicon',
            description: 'No instance is excluded from repair for the first builds.',
            rationale: 'Yield learning on first silicon outweighs the small area cost.',
            status: 'approved',
            owner: 'Anja Keller',
            approvedBy: '@lead',
            scope: 'First silicon',
            agenda: 0,
          },
        ],
        actions: [
          { description: 'Quantify how much compression would bring the pattern count inside budget', owner: 'Yusuf Demir', dueAfter: 6, priority: 'normal', status: 'done', type: 'support', agenda: 1, evidence: 'Model says 60x recovers the budget with an estimated 0.6% transition-coverage loss.', verifiedBy: '@lead', link: 'step' },
        ],
      },
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
    key: 'dv',
    title: 'DV Closure Sync',
    purpose:
      'Drive coverage, regression and bug burn-down to DV closure, and decide what is waived, deferred or blocking.',
    type: 'working_group',
    stage: 'verification',
    deliverable: 'DV closure signoff',
    owner: '@lead',
    attendees: ['Diego Ruiz', 'Hana Cho', 'Sam Okafor', 'Lena Vogel', 'Arjun Mehta', '@me'],
    freq: 'weekly',
    interval: 1,
    weekdays: [3],
    time: '11:00',
    durationMinutes: 45,
    agendaTemplate: ['Regression health', 'Coverage closure by block', 'Open bugs by severity', 'Closure criteria and waivers'],
    location: 'B2-Rainier',
    active: true,
    sittings: [
      {
        when: -2,
        status: 'completed',
        minutes: 'Regression pass rate recovered after the clock-gating fix. Coherency coverage flagged as the closure blocker.',
        agenda: [
          { title: 'Regression health', presenter: 'Diego Ruiz', minutes: 10, notes: 'Nightly pass rate back to 97.8% after the clock-gating fix.', outcome: 'info', link: 'activity' },
          { title: 'Coverage closure by block', presenter: 'Hana Cho', minutes: 20, notes: 'All blocks above 95% functional coverage except coherency at 88%; hazard cases have no directed tests.', outcome: 'risk', link: 'risk' },
          { title: 'Open bugs by severity', presenter: 'Sam Okafor', minutes: 10, notes: 'Two S1 bugs open, both with fixes in review.', outcome: 'action' },
        ],
        decisions: [
          {
            title: 'Gate-level simulation starts on the N2 netlist, not N3',
            description: 'GLS setup proceeds on N2 so closure is not waiting on the final netlist.',
            rationale: 'N2 to N3 changes are ECO-scale; starting GLS now removes two weeks from the closure path.',
            status: 'approved',
            owner: 'Lena Vogel',
            approvedBy: '@lead',
            scope: 'Gate-level simulation plan',
            agenda: 0,
            link: 'activity',
          },
        ],
        actions: [
          { description: 'Land the fixes for the two open S1 bugs and rerun the affected regressions', owner: 'Sam Okafor', dueAfter: 6, priority: 'critical', status: 'done', type: 'support', agenda: 2, evidence: 'Both fixes merged; targeted regressions clean, nightly pass rate 98.1%.', verifiedBy: 'Diego Ruiz', link: 'activity' },
        ],
      },
      {
        when: -1,
        status: 'completed',
        minutes: 'Program review approved the waiver path. Directed hazard tests are the work that remains.',
        agenda: [
          { title: 'Coverage closure by block', presenter: 'Hana Cho', minutes: 20, notes: 'Directed hazard tests written for 5 of 9 cases; coverage at 91%.', outcome: 'action', link: 'risk' },
          { title: 'Closure criteria and waivers', presenter: '@lead', minutes: 20, notes: 'Waiver to state which hazard cases are covered by directed tests and which by formal.', outcome: 'decision', link: 'deliverable' },
        ],
        decisions: [
          {
            title: 'Close the remaining hazard cases with formal where directed tests cannot reach them',
            description: 'The four hardest hazard cases are proven with formal properties rather than simulated.',
            rationale: 'Directed tests for those cases would take longer than the closure window allows; formal gives a complete answer.',
            status: 'proposed',
            owner: 'Sam Okafor',
            approvedBy: '',
            scope: 'Coherency subsystem closure',
            agenda: 1,
            link: 'risk',
          },
        ],
        actions: [
          { description: 'Write formal properties for the four remaining coherency hazard cases', owner: 'Sam Okafor', dueAfter: 8, priority: 'high', status: 'open', type: 'support', agenda: 1, impact: 'milestone', impactNote: 'DV closure cannot be signed until the hazard cases are covered.', link: 'step' },
          { description: 'Get the emulation slot back for the coherency soak test', owner: 'Arjun Mehta', dueAfter: 3, priority: 'normal', status: 'blocked', type: 'support', agenda: 0, blocker: 'The emulation platform is booked by the other program until next Friday.', escalateAfter: 5, impact: 'step_at_risk', impactNote: 'The soak test is the last regression before closure.', link: 'activity' },
        ],
      },
      {
        when: 1,
        status: 'scheduled',
        agenda: [
          { title: 'Regression health', presenter: 'Diego Ruiz', minutes: 10 },
          { title: 'Formal proofs for the hazard cases', presenter: 'Sam Okafor', minutes: 20, link: 'risk' },
          { title: 'Closure criteria and waivers', presenter: '@lead', minutes: 15, link: 'deliverable' },
        ],
      },
    ],
  },
  {
    key: 'syn',
    title: 'Netlist Drop Review',
    purpose:
      'Review each netlist drop before it goes to physical design: timing budget, equivalence, power intent and what changed since the last drop.',
    type: 'design_review',
    stage: 'synthesis',
    deliverable: 'Formal equivalence',
    owner: '@lead',
    attendees: ['Petra Kral', 'Claire Fontaine', 'Yusuf Demir', 'Jiwoo Park', '@me'],
    freq: 'weekly',
    interval: 2,
    weekdays: [5],
    time: '13:00',
    durationMinutes: 60,
    agendaTemplate: ['What changed since the last drop', 'Timing budget by domain', 'Equivalence and power intent', 'Go / no-go to PD'],
    location: 'B3-Shasta',
    active: true,
    sittings: [
      {
        when: -1,
        status: 'completed',
        minutes: 'N2 released to PD with a known timing gap on the two fabric-crossing clock domains.',
        agenda: [
          { title: 'Timing budget by domain', presenter: 'Claire Fontaine', minutes: 20, notes: 'Both fabric-crossing domains miss budget by 35–60 ps at SS; everything else closes.', outcome: 'risk', link: 'risk' },
          { title: 'Equivalence and power intent', presenter: 'Petra Kral', minutes: 15, notes: 'Equivalence clean except two black-boxed IP wrappers; UPF checks clean.', outcome: 'action', link: 'deliverable' },
          { title: 'Go / no-go to PD', presenter: '@lead', minutes: 10, notes: 'Go, with the timing gap tracked as a PD-visible risk.', outcome: 'decision' },
        ],
        decisions: [
          {
            title: 'Release N2 to PD with the cross-domain timing gap documented',
            description: 'PD starts Turn 2 on N2; the gap is closed by a pipeline stage in N3 or by floorplan in PD, whichever is cheaper.',
            rationale: 'Holding N2 would idle PD for two weeks for a gap that has two known fixes.',
            status: 'approved',
            owner: '@lead',
            approvedBy: '@lead:physicalDesign',
            scope: 'Netlist drop N2',
            agenda: 2,
            link: 'activity',
          },
        ],
        actions: [
          { description: 'Close equivalence on the two black-boxed IP wrappers', owner: 'Petra Kral', dueAfter: 6, priority: 'high', status: 'in_progress', type: 'support', agenda: 1, link: 'deliverable' },
          { description: 'Cost the pipeline-stage fix against the floorplan fix for the fabric-crossing domains', owner: 'Claire Fontaine', contributors: ['Jiwoo Park'], dueAfter: 10, priority: 'high', status: 'open', type: 'support', agenda: 0, impact: 'activity_end', impactNote: 'The pipeline option changes the N3 drop date.', carry: true, link: 'risk' },
        ],
      },
      {
        when: 1,
        status: 'scheduled',
        agenda: [
          { title: 'What changed since the last drop', presenter: 'Petra Kral', minutes: 15 },
          { title: 'Pipeline or floorplan for the crossing domains', presenter: 'Claire Fontaine', minutes: 25, link: 'risk' },
          { title: 'Go / no-go to PD for N3', presenter: '@lead', minutes: 10, link: 'deliverable' },
        ],
      },
    ],
  },
  {
    key: 'pdwar',
    title: 'Physical Design Daily War-room',
    purpose:
      'Thirty minutes at the end of each day during closure: what the overnight runs showed, what is stuck, and who is on what tonight.',
    type: 'war_room',
    stage: 'physicalDesign',
    owner: '@lead',
    attendees: ['Marco Bianchi', 'Jiwoo Park', 'Nate Coleman', 'Ingrid Berg'],
    freq: 'daily',
    interval: 1,
    weekdays: [1, 2, 3, 4, 5],
    time: '17:30',
    durationMinutes: 30,
    agendaTemplate: ['Overnight run results', 'Blockers', 'Tonight’s runs and owners'],
    location: 'PD pit / Teams',
    active: true,
    sittings: [
      {
        when: -2,
        status: 'completed',
        agenda: [
          { title: 'Overnight run results', presenter: 'Jiwoo Park', minutes: 10, notes: 'Hold clean on 14 of 16 clusters after buffer insertion.', outcome: 'info', link: 'activity' },
          { title: 'Blockers', presenter: 'Nate Coleman', minutes: 10, notes: 'Route overflow near the NoC crossbar still 2.3%.', outcome: 'action', link: 'step' },
        ],
        decisions: [
          {
            title: 'Rerun the last two hold clusters tonight with the relaxed buffer rule',
            description: 'Use the relaxed buffer spacing rule on the two failing clusters only.',
            rationale: 'Keeps the change local rather than reopening the clusters that are already clean.',
            status: 'approved',
            owner: 'Jiwoo Park',
            approvedBy: '@lead',
            scope: 'Turn 2 hold fixing',
            agenda: 0,
          },
        ],
        actions: [
          { description: 'Re-bundle the NoC links through the crossbar to bring overflow under 1.5%', owner: 'Nate Coleman', dueAfter: 1, priority: 'high', status: 'done', type: 'support', agenda: 1, evidence: 'Overflow down to 1.1% after re-bundling.', verifiedBy: 'Marco Bianchi', link: 'step' },
        ],
      },
      {
        when: -1,
        status: 'completed',
        agenda: [
          { title: 'Overnight run results', presenter: 'Jiwoo Park', minutes: 10, notes: 'WNS −41 ps at SS 0.675 V after CTS rebalance.', outcome: 'info', link: 'activity' },
          { title: 'Blockers', presenter: 'Ingrid Berg', minutes: 10, notes: 'IR drop at the worst corner needs the PDN change signoff asked for.', outcome: 'escalation', link: 'step' },
          { title: 'Tonight’s runs and owners', presenter: '@lead', minutes: 5, notes: 'SI rerun on Nate; PDN what-if on Ingrid.', outcome: 'action' },
        ],
        actions: [
          { description: 'Run the PDN what-if with the added straps on the worst-corner region', owner: 'Ingrid Berg', dueAfter: 2, priority: 'high', status: 'in_progress', type: 'support', agenda: 2, link: 'step' },
        ],
      },
      {
        when: 1,
        status: 'scheduled',
        agenda: [
          { title: 'Overnight run results', presenter: 'Jiwoo Park', minutes: 10 },
          { title: 'PDN what-if results', presenter: 'Ingrid Berg', minutes: 10, link: 'step' },
          { title: 'Tonight’s runs and owners', presenter: '@lead', minutes: 5 },
        ],
      },
      {
        when: 2,
        status: 'scheduled',
        agenda: [
          { title: 'Overnight run results', presenter: 'Jiwoo Park', minutes: 10 },
          { title: 'Blockers', presenter: 'Nate Coleman', minutes: 10 },
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
        when: -2,
        status: 'completed',
        minutes: 'Turn 1 retrospective and Turn 2 plan. Crosstalk first seen on the high-speed routes.',
        agenda: [
          { title: 'Timing closure by corner', presenter: 'Jiwoo Park', minutes: 20, notes: 'Turn 1 closed setup at all but SS; hold violations concentrated in 16 clusters.', outcome: 'info', link: 'activity' },
          { title: 'SI and crosstalk', presenter: 'Nate Coleman', minutes: 20, notes: 'Crosstalk on the high-speed routes worse than the model predicted.', outcome: 'risk', link: 'risk' },
        ],
        decisions: [
          {
            title: 'Start Turn 2 on netlist drop N2 without waiting for N3',
            description: 'Turn 2 uses N2; N3 changes are taken as ECOs.',
            rationale: 'Closure learning on Turn 2 is worth more than a cleaner netlist two weeks later.',
            status: 'approved',
            owner: '@lead',
            approvedBy: '@me',
            scope: 'Turn 2',
            agenda: 0,
            link: 'activity',
          },
        ],
        actions: [
          { description: 'Characterise the crosstalk on the high-speed routes against the SI model', owner: 'Nate Coleman', dueAfter: 5, priority: 'high', status: 'done', type: 'support', agenda: 1, evidence: 'Correlation report filed: model under-predicts coupling by ~30% on the 16-layer routes.', verifiedBy: 'Ravi Iyer', link: 'step' },
        ],
      },
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
          { title: 'Signoff exceptions and waivers', presenter: 'Ravi Iyer', minutes: 25, notes: 'Waiver list to be reviewed item by item two reviews before MTO.', outcome: 'info', link: 'risk' },
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
    key: 'ptv',
    title: 'Package Test Vehicle Review',
    purpose:
      'Track the CPI and thermal test vehicles from build to measurement, and decide what the assembly window is based on until they are measured.',
    type: 'working_group',
    stage: 'packageTestVehicle',
    alsoStages: ['chipPackageCoVerification'],
    milestone: 'assemblyWindowFreeze',
    deliverable: 'Warpage',
    owner: '@lead',
    attendees: ['Sunita Rege', 'Piotr Zieba', 'Femi Ade', 'Hannah Storm', '@me'],
    freq: 'weekly',
    interval: 2,
    weekdays: [2],
    time: '15:00',
    durationMinutes: 45,
    agendaTemplate: ['Vehicle build status', 'Warpage and co-planarity', 'Thermal correlation'],
    location: 'Teams',
    active: true,
    sittings: [
      {
        when: -1,
        status: 'completed',
        minutes: 'The CPI vehicle has still not been built; the assembly window is being planned on simulation.',
        agenda: [
          { title: 'Vehicle build status', presenter: 'Sunita Rege', minutes: 20, notes: 'CPI vehicle build slipped: substrate panels arrived out of spec.', outcome: 'risk', link: 'risk' },
          { title: 'Warpage and co-planarity', presenter: 'Piotr Zieba', minutes: 15, notes: 'Simulation shows 62 µm at peak reflow; spec is 80 µm.', outcome: 'decision', link: 'deliverable' },
        ],
        decisions: [
          {
            title: 'Plan the assembly window on simulated warpage with a 20% guard band until measured',
            description: 'The window uses 75 µm as the planning number rather than the simulated 62 µm.',
            rationale: 'Waiting for measurement would freeze the window three weeks late; the guard band covers the usual simulation error.',
            status: 'approved',
            owner: 'Piotr Zieba',
            approvedBy: '@lead',
            scope: 'Assembly window planning',
            agenda: 1,
            link: 'milestone',
          },
        ],
        actions: [
          { description: 'Get replacement in-spec substrate panels for the CPI vehicle build', owner: 'Sunita Rege', dueAfter: 7, priority: 'critical', status: 'in_progress', type: 'support', agenda: 0, impact: 'milestone', impactNote: 'Assembly window freeze assumes measured warpage before it lands.', carry: true, link: 'risk' },
        ],
      },
      {
        when: 1,
        status: 'scheduled',
        agenda: [
          { title: 'Replacement panels and build date', presenter: 'Sunita Rege', minutes: 20, link: 'risk' },
          { title: 'Thermal correlation', presenter: 'Hannah Storm', minutes: 15 },
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

export const ONE_OFF_MEETINGS: SeedOneOff[] = [
  {
    key: 'irdrop',
    title: 'Signoff IR-drop escalation',
    purpose:
      'Called after the PD war-room escalated IR drop at the worst corner: agree whether the PDN fix is taken in the final turn or waived with a derate.',
    type: 'design_review',
    stage: 'signoff',
    alsoStages: ['physicalDesign'],
    deliverable: 'EM/IR',
    owner: '@lead',
    attendees: ['Tom Eriksen', 'Ravi Iyer', 'Ingrid Berg', '@lead:physicalDesign', '@me'],
    durationMinutes: 45,
    location: 'B3-Shasta',
    inDays: -4,
    time: '15:00',
    sitting: {
      status: 'completed',
      minutes: 'Agreed to take the PDN fix rather than waive. The strap change is local to the worst-corner region.',
      agenda: [
        { title: 'Where the IR drop is and how bad', presenter: 'Tom Eriksen', minutes: 15, notes: 'Worst case 11.2% at the SS corner in the NPU cluster; budget is 8%.', outcome: 'info', link: 'risk' },
        { title: 'Fix in the final turn or waive with a derate', presenter: 'Ingrid Berg', minutes: 20, notes: 'A strap addition fixes it locally; a derate would cost 4% frequency on the NPU.', outcome: 'decision', link: 'step' },
      ],
      decisions: [
        {
          title: 'Take the PDN strap fix in the final turn; no IR derate waiver',
          description: 'Add power straps in the NPU cluster region in the final turn.',
          rationale: 'The derate costs a performance number customers were given; the strap fix is local and fits the turn.',
          status: 'approved',
          owner: 'Ingrid Berg',
          approvedBy: '@lead',
          scope: 'Final PD turn, NPU cluster',
          agenda: 1,
          link: 'risk',
        },
      ],
      actions: [
        { description: 'Re-run EM/IR signoff on the strap change and report against the 8% budget', owner: 'Tom Eriksen', dueAfter: 8, priority: 'critical', status: 'open', type: 'support', agenda: 1, impact: 'step_at_risk', link: 'deliverable' },
      ],
    },
  },
  {
    key: 'evb',
    title: 'EVB Rev B schematic review',
    purpose:
      'Review the Rev B validation board schematic before layout: power sequencing, the HBM3 debug headers, and the changes from Rev A bring-up notes.',
    type: 'design_review',
    stage: 'validationHardware',
    deliverable: 'EVB schematics',
    owner: '@lead',
    attendees: ['Max Richter', 'Ana Sousa', 'Jonas Ek', '@me'],
    durationMinutes: 60,
    location: 'Lab 1',
    inDays: 6,
    time: '10:30',
    sitting: {
      status: 'draft',
      agenda: [
        { title: 'Changes from Rev A', presenter: 'Max Richter', minutes: 20, link: 'deliverable' },
        { title: 'Power sequencing and HBM3 debug headers', presenter: 'Ana Sousa', minutes: 25, link: 'activity' },
      ],
    },
  },
  {
    key: 'ate',
    title: 'ATE vendor kickoff for the production test program',
    purpose:
      'Kick off test program development with the ATE vendor: tester configuration, probe card lead time and the tester-time budget.',
    type: 'supplier_review',
    stage: 'testDevelopment',
    alsoStages: ['dft'],
    deliverable: 'probe card',
    owner: '@lead',
    attendees: ['Grace Holt', 'Ken Abe', 'Nadia Petrov', 'Tarek Haddad', '@me'],
    durationMinutes: 90,
    location: 'Teams',
    inDays: 9,
    time: '08:00',
    sitting: {
      status: 'scheduled',
      agenda: [
        { title: 'Tester configuration and site count', presenter: 'Grace Holt', minutes: 30, link: 'activity' },
        { title: 'Probe card and load board lead time', presenter: 'Ken Abe', minutes: 30, link: 'deliverable' },
        { title: 'Tester-time budget', presenter: 'Tarek Haddad', minutes: 20 },
      ],
    },
  },
];
