/**
 * UGA — Production Release on Silicon Data. Weeks 120–132; closes on IP Production Release.
 */
import type { UcieStageModule } from '../types';

export const UGA: UcieStageModule = {
  content: {
    tagline: 'Turn silicon results into a release any licensee can build production silicon on.',
    description:
      'General availability is the release backed by silicon, and it waits for all of it: the rollup starts only once characterization, compliance and the reliability report have reported, and production release QA runs after the silicon-proven decision. The characterization, compliance and reliability results from the test chip are rolled up against every datasheet parameter and every pre-silicon prediction they replace, stated per package type with the package types supported by simulation only labelled as such; a silicon report summarizes eye margin, BER, energy per bit, PVT behavior, lane repair and reversal, runtime recalibration and low-power behavior, compliance, interoperability and reliability for licensees; and the release package — views, models, datasheet, integration guide and application notes — is updated to what silicon showed and to the fixes in the customer ECO log as it stands at the production release cut-off. The package passes the same release QA as v0.9, release notes and errata are written, and the production release decision is taken against the silicon-proven verdict, the compliance results and the open issues. The stage closes on IP Production Release.',
    activities: ['Silicon data rollup', 'Silicon report', 'Final release package', 'Production release QA', 'Production release approval'],
    deliverables: [
      'Silicon data rollup — measured results mapped to every datasheet parameter and prediction',
      'Silicon report and characterization summary for licensees',
      'Production release package — views, models and documents updated to silicon',
      'Production release QA record, release notes and errata',
      'Production release approval decision record',
    ],
    deliverableFrom: [0, 1, 2, 3, 4],
    deliverableWeek: [9, 9, 10, 11, 12],
    engineeringEffort: [4, 6, 8, 3, 0.5],
    risks: [
      'A datasheet parameter silicon missed is published unchanged because nobody mapped measurements to parameters',
      'Production release declared before compliance or reliability results are final, so the silicon-proven claim does not hold',
    ],
    potentialRisks: [
      'Models left at their pre-silicon state although silicon correlation moved them',
      'Errata found on silicon communicated by email but not in the release notes',
      'Fixes made for one customer since v0.9 missing from the production release package other licensees receive',
      'Silicon report quoting best-lane results rather than the distribution across lanes and corners',
      'Production release package re-tagged without re-running release QA on the changed files',
      'A package type the test vehicle never built presented in the silicon report as if it were measured',
      'Production release criteria never written, so the approval review has nothing to decide against',
    ],
    leader: { name: 'Marcus Feld', short: 'M. Feld', phone: '+1 (408) 555-0662', email: 'marcus.feld@example.com' },
    collaboration: ['Customer engineering', 'Validation', 'Technical documentation', 'Quality', 'Compliance and interoperability', 'Reliability', 'Product management'],
    tools: ['Characterization data analysis and reporting', 'Release configuration management and version tagging', 'View and model consistency checkers', 'Secure customer file distribution portal'],
    programView: [
      'Datasheet parameters with measured silicon data against the total',
      'Errata open and their workarounds',
      'Production release date against the silicon-proven decision',
      'Licensees on the production release',
    ],
    perspective:
      'Production release is a promise that the numbers in the datasheet are numbers silicon met. Every parameter traces to a measurement or is marked as not yet measured — a datasheet that quietly keeps pre-silicon targets is the fastest way to lose a licensee’s trust.',
  },
  steps: {
    'UGA-01': {
      s: [
        [1, 'Gather the reported characterization, compliance and reliability results with their test conditions, package types and sample counts', 0.5],
        [2, 'Map each measured result to the datasheet parameter and the pre-silicon prediction it replaces, per package type', 1],
        [3, 'Flag parameters that miss target and agree a datasheet change, an erratum or a fix for each', 1],
        [4, 'Release the silicon data rollup to documentation and the silicon report', 0.5],
      ],
      o: [
        'Collected silicon results with test conditions',
        'Parameter-to-measurement map',
        'Disposition of parameters that miss target',
        'Silicon data rollup — measured results mapped to every datasheet parameter and prediction',
      ],
      r: [['UGA-D1', 'produces'], ['UGA-D2', 'feeds']],
    },
    'UGA-02': {
      s: [
        [1, 'Summarize eye margin, BER, energy per bit, PLL jitter and PVT shmoo results across lanes, corners and package types', 1.5],
        [2, 'Summarize lane repair, lane reversal, runtime recalibration and low-power behavior on silicon', 1, 1],
        [3, 'Summarize compliance, interoperability and reliability results with the lot and sample counts behind them', 1],
        [4, 'Add the measurement-to-simulation correlation, describe each test vehicle channel and label package types supported by simulation only', 1],
        [5, 'Review and release the silicon report for licensees', 1],
      ],
      o: [
        'Electrical performance summary',
        'Link feature behavior summary',
        'Compliance, interoperability and reliability summary',
        'Correlation and test vehicle description',
        'Silicon report and characterization summary for licensees',
      ],
      r: [['UGA-D2', 'produces'], ['UGA-D3', 'feeds']],
    },
    'UGA-03': {
      s: [
        [1, 'Update the datasheet, integration guide and application notes to measured silicon', 1.5],
        [2, 'Update the channel compliance kit, timing and power models where silicon correlation moved them', 1, 1],
        [3, 'Fold in every fix and ECO in the customer ECO log frozen at the production release cut-off', 1],
        [4, 'Rebuild the release package with production release version tags against the final deliverable checklist', 1.5],
        [5, 'Hand the production release package to release QA', 0.5],
      ],
      o: [
        'Documents updated to silicon',
        'Models updated to silicon correlation',
        'ECO log fixes merged up to the production release cut-off',
        'GA-tagged release package',
        'Production release package — views, models and documents updated to silicon',
      ],
      r: [['UGA-D3', 'produces'], ['UGA-D4', 'feeds']],
    },
    'UGA-04': {
      s: [
        [1, 'Run the release QA checklist on the production release package once the silicon-proven decision is recorded', 0.5],
        [2, 'Re-run the sanity flows on every view and model', 1, 1],
        [3, 'Write the production release notes and errata with workarounds from the errata process', 0.5],
        [4, 'Close or waive every QA finding with its customer impact', 0.5],
      ],
      o: [
        'Production release checklist results',
        'Sanity flow results',
        'Release notes and errata',
        'Production release QA record, release notes and errata',
      ],
      r: [['UGA-D4', 'produces'], ['UGA-D5', 'feeds']],
    },
    'UGA-05': {
      s: [
        [1, 'Review the silicon-proven verdict, characterization, compliance and QA results against the production release criteria', 0.25],
        [2, 'Review open errata and customer issues and their workarounds', 0.25],
        [3, 'Decide production release and record the decision with any conditions', 0.25],
        [4, 'Announce production release and publish the package to every entitled licensee', 0.25],
      ],
      o: [
        'Production release criteria review',
        'Errata and issue review',
        'Production release decision',
        'Production release approval decision record',
      ],
      r: [['UGA-D5', 'produces']],
    },
  },
};
