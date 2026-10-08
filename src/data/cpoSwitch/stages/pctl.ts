/**
 * PCTL — Program Integration & Change Control. Weeks 20–210; closes on Change Control Handed to Sustaining.
 */
import type { CpoStageModule } from '../types';

export const PCTL: CpoStageModule = {
  content: {
    tagline: 'Hold the program together between the gates: one schedule, one risk log, one configuration and one change board.',
    description:
      'Run the program-level controls that span every stage from the requirements baseline to production release: the integrated master schedule and the handoffs between workstreams, the risk, issue and decision logs, the interface change control board that takes over from the interface freeze, configuration management of design databases, firmware, test programs, calibration tables and bills of materials, program reviews with every supplier and partner, and cost-of-goods and budget tracking against target. These are operating cadences rather than one-off tasks, each producing a controlled record every week or month. The stage closes when change control, open risks, the configuration baseline and supplier actions are handed to sustaining.',
    activities: [
      'Master schedule',
      'Risks, issues, decisions',
      'Interface change board',
      'Configuration management',
      'Supplier reviews',
      'Cost and budget tracking',
      'Sustaining handover',
    ],
    deliverables: [
      'Integrated master schedule and cross-workstream dependency register',
      'Program risk, issue and decision log',
      'Interface change request log and ICD revision history',
      'Configuration baseline index — design databases, firmware, test programs and BOMs',
      'Supplier and partner program review record and scorecards',
      'Cost-of-goods and program budget tracking report',
      'Change control handover package to sustaining',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6],
    deliverableWeek: [188, 188, 188, 188, 188, 188, 190],
    engineeringEffort: [30, 15, 20, 24, 14, 10, 2],
    risks: [
      'Changes after the interface freeze agreed between two engineers and never reaching the baseline',
      'Master schedule maintained per workstream, so cross-workstream handoffs slip unseen',
    ],
    potentialRisks: [
      'A build or tapeout made from a configuration nobody can reconstruct, so a failure cannot be tied to what was built',
      'Change board that meets but cannot stop a design team, so its decisions are advisory',
      'Supplier reviews that report status but never test capacity commitments against the ramp plan',
      'Cost-of-goods roll-up not refreshed after yield and test-time data arrive, so the release decision sees the business-case number',
      'Risks closed by being forgotten rather than retired, with no evidence recorded',
      'Handover to sustaining that transfers documents but not board membership, tools and open actions',
    ],
    leader: { name: 'Hannah Voss', short: 'H. Voss', phone: '+1 (408) 555-0515', email: 'hannah.voss@example.com' },
    collaboration: ['Program management', 'System architecture', 'Quality', 'Supply chain', 'Finance', 'Manufacturing and NPI', 'Every engineering discipline'],
    tools: [
      'Integrated master schedule tool',
      'Risk and issue register',
      'Change request tracker',
      'Configuration and version control system',
      'Cost-of-goods model',
    ],
    programView: [
      'Critical path float to the next major gate',
      'Open interface change requests and their age',
      'Top risks above threshold and their mitigation dates',
      'Cost of goods versus target',
      'Builds with a reconciled configuration record (%)',
    ],
    perspective:
      'A co-packaged optics program fails at the seams between workstreams and companies, not inside them. The controls here are dull by design: a change that is not in the log, a build that is not in the baseline and a handoff that is not in the schedule did not happen — and the program behaves accordingly.',
  },
  steps: {
    'PCTL-01': {
      s: [
        [1, 'Build the integrated master schedule from every stage plan with cross-workstream dependencies and the critical path', 6],
        [2, 'Agree each cross-workstream handoff with a date, an owner on both sides and an acceptance criterion', 4, 1],
        [3, 'Run the weekly schedule review — critical and near-critical paths, slipping handoffs and recovery actions', 178],
        [4, 'Re-plan at each major gate — both tapeout waves, first silicon, first package build and production release', 20, 1],
        [5, 'Report integrated schedule health to the steering committee every month', 178, 1],
        [6, 'Close the schedule and archive the as-run record and dependency history at handover', 4],
      ],
      o: [
        'Integrated master schedule baseline with critical path',
        'Cross-workstream handoff register',
        'Weekly critical-path and handoff status report',
        'Re-baselined schedule at each major gate',
        'Monthly steering committee schedule report',
        'Archived as-run schedule and dependency history',
      ],
      r: [['PCTL-D1', 'produces'], ['PCTL-D7', 'feeds']],
    },
    'PCTL-02': {
      s: [
        [1, 'Set up the risk, issue and decision logs with scoring, owners, thresholds and escalation rules', 3],
        [2, 'Run the weekly risk and issue review — score changes, mitigations due and new entries from every workstream', 181],
        [3, 'Record every cross-workstream decision with its options, rationale, approver and date', 181, 1],
        [4, 'Escalate risks past threshold to the steering committee with a recovery plan and a decision date', 181, 1],
        [5, 'Hand open risks, issues and the decision history to sustaining', 4],
      ],
      o: [
        'Risk, issue and decision log with scoring rules',
        'Weekly risk and issue review record',
        'Decision record with options and rationale',
        'Escalation record with recovery plans',
        'Open risk and decision history handed to sustaining',
      ],
      r: [['PCTL-D2', 'produces'], ['PCTL-D7', 'feeds']],
    },
    'PCTL-03': {
      s: [
        [1, 'Take over the change control baseline from the interface freeze in ICD-12 and publish the board calendar', 2],
        [2, 'Run the weekly interface change board — impact assessment from both sides of each ICD for every request', 144],
        [3, 'Issue new ICD revisions and notify every design, test and supplier team building to the old revision', 144, 1],
        [4, 'Audit design databases against the current ICD revisions before each tapeout and each build', 10],
        [5, 'Track freeze waivers to closure at their named gates', 144, 1],
        [6, 'Hand the interface baseline, open change requests and waivers to product change control in sustaining', 4],
      ],
      o: [
        'Change board calendar and inherited interface baseline',
        'Change request decisions with two-sided impact assessments',
        'Released ICD revisions with distribution record',
        'ICD conformance audit per tapeout and build',
        'Waiver closure tracker',
        'Interface baseline and open change requests handed to sustaining',
      ],
      r: [['PCTL-D3', 'produces'], ['PCTL-D7', 'feeds']],
    },
    'PCTL-04': {
      s: [
        [1, 'Define configuration items and identifiers — design databases, firmware, test programs, calibration tables and BOMs', 4],
        [2, 'Stand up version control and release procedures for every configuration item class', 6],
        [3, 'Release a configuration baseline at every gate and record exactly what each tapeout and build used', 156],
        [4, 'Reconcile the as-built configuration of every engineering and NPI build against its baseline', 156, 1],
        [5, 'Audit configuration at tapeout and production release for untracked changes', 8],
        [6, 'Hand the production configuration baseline to sustaining', 4],
      ],
      o: [
        'Configuration item list with identifiers',
        'Version control and release procedure per item class',
        'Gate configuration baselines',
        'As-built reconciliation record per build',
        'Configuration audit reports at tapeout and release',
        'Production configuration baseline handed to sustaining',
      ],
      r: [['PCTL-D4', 'produces'], ['PCTL-D7', 'feeds']],
    },
    'PCTL-05': {
      s: [
        [1, 'Set the review cadence, scorecard and escalation path for every supplier and partner', 3],
        [2, 'Run monthly program reviews with the silicon and photonic foundries, optical source, substrate, OSAT and system manufacturing partners', 181],
        [3, 'Track partner deliverables, capacity commitments and long-lead orders against the master schedule', 181, 1],
        [4, 'Run quarterly executive reviews with critical partners on scorecards and open escalations', 181, 1],
        [5, 'Hand supplier scorecards and open supplier actions to sustaining supplier management', 4],
      ],
      o: [
        'Supplier review cadence, scorecard and escalation path',
        'Monthly partner review minutes and action lists',
        'Partner deliverable, capacity and long-lead tracker',
        'Quarterly executive review scorecards',
        'Supplier scorecards and open actions handed to sustaining',
      ],
      r: [['PCTL-D5', 'produces'], ['PCTL-D7', 'feeds']],
    },
    'PCTL-06': {
      s: [
        [1, 'Baseline the cost-of-goods model and program budget from the business case and the budget allocation', 4],
        [2, 'Refresh the cost-of-goods roll-up at each gate from quotes, measured yields and test times', 158],
        [3, 'Track program spend, NRE and headcount against the budget every month', 158, 1],
        [4, 'Report cost variance with recovery actions to the steering committee', 158, 1],
        [5, 'Deliver the cost-of-goods position to the production readiness review and the release decision', 6],
        [6, 'Hand the cost baseline and the cost-reduction backlog to sustaining', 4],
      ],
      o: [
        'Cost-of-goods and budget baseline',
        'Cost-of-goods roll-up per gate',
        'Monthly spend, NRE and headcount report',
        'Cost variance report with recovery actions',
        'Cost-of-goods position for release',
        'Cost baseline and reduction backlog handed to sustaining',
      ],
      r: [['PCTL-D6', 'produces'], ['PCTL-D7', 'feeds']],
    },
    'PCTL-07': {
      s: [
        [1, 'Audit open change requests, waivers, risks and configuration baselines for handover', 2],
        [2, 'Transfer change control procedures, board membership and tools to quality in sustaining', 2],
        [3, 'Hold the handover review with program, quality and sustaining owners', 1.5],
        [4, 'Release the change control handover package', 1],
      ],
      o: [
        'Handover audit of open items and baselines',
        'Change control transfer record',
        'Handover review decision record',
        'Change control handover package released',
      ],
      r: [['PCTL-D7', 'produces']],
    },
  },
};
