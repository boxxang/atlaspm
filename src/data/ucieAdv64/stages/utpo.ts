/**
 * UTPO — Test Chip Tapeout. Weeks 72–76; closes on Tapeout.
 */
import type { UcieStageModule } from '../types';

export const UTPO: UcieStageModule = {
  content: {
    tagline: 'Four weeks of checklists that decide whether the next twenty prove the IP or just prove the test chip.',
    description:
      'Walk the tapeout checklist against every signoff report and waiver, run the final full-chip checks on the test chip database, confirm the mask set, the shuttle slot and the lot plan with the foundry, release the database through the foundry’s intake, and archive the exact configuration of the PHY macros and the test chip so the silicon, the v0.9 release and every later report trace back to one baseline. The stage closes when the foundry has accepted the database and the archive is complete.',
    activities: ['Tapeout checklist', 'Full-chip final checks', 'Mask, shuttle and lots', 'Database release', 'Archive and baseline'],
    deliverables: [
      'Signed tapeout checklist with the accepted waiver list',
      'Full-chip final DRC, LVS and density report on the tapeout database',
      'Mask set, shuttle slot and lot plan confirmation from the foundry',
      'Tapeout database release record with foundry intake acceptance',
      'Tapeout archive and configuration baseline for the test chip and the PHY macros',
    ],
    deliverableFrom: [0, 1, 2, 3, 4],
    deliverableWeek: [2, 2, 4, 4, 4],
    engineeringEffort: [1, 2, 1, 1, 1],
    risks: [
      'A foundry intake rejection late in the week that costs the shuttle slot and moves silicon by the next shuttle’s cadence',
      'A lot plan with no process splits, so characterization cannot separate PHY margin from where the wafers landed in the process window',
    ],
    potentialRisks: [
      'The tapeout database containing a PHY macro revision other than the one the hard macro signoff authorized',
      'Waivers accepted for the test chip that the v0.9 release does not disclose to licensees',
      'Density or fill changes made at intake that disturb matched analog structures',
      'Archive that cannot reproduce the signoff runs, so a silicon issue cannot be traced back to its database',
      'Shuttle die count too small for sort yield, reliability units and customer evaluation samples together',
    ],
    leader: { name: 'Andile Brennan', short: 'A. Brennan', phone: '+1 (408) 555-0634', email: 'andile.brennan@example.com' },
    collaboration: ['Program management', 'Physical design', 'Technology and foundry', 'Test chip integration', 'Quality'],
    tools: ['Foundry data transfer and intake portal', 'Physical verification', 'Configuration management and design archive'],
    programView: [
      'Checklist items closed against the shuttle deadline',
      'Foundry intake rejections and time to resolve',
      'Wafers and dies planned per use — sort, assembly, reliability, customer evaluation',
      'Configuration baseline restorable (yes or no)',
    ],
    perspective:
      'A test chip tapeout is cheap compared with a product, so it is tempting to treat it lightly. But the shuttle cadence sets the next chance to fix anything, and the archive made this week is what every silicon finding for the next year will be traced against.',
  },
  steps: {
    'UTPO-01': {
      s: [
        [1, 'Walk the tapeout checklist against every signoff report', 0.5],
        [2, 'Review and accept each open waiver with its owner and its disclosure to licensees', 0.5],
        [3, 'Confirm the release deliverables the tapeout database must also produce', 0.5, 1],
        [4, 'Confirm the foundry has re-committed the shuttle slot and the trial database cleared its intake checks', 0.5, 1],
        [5, 'Sign the checklist and hand it to database release', 0.5],
      ],
      o: [
        'Checklist walked against the signoff reports',
        'Accepted waiver list with owners and disclosure',
        'Release deliverables traced to the tapeout database',
        'Shuttle slot re-commitment and trial intake confirmation',
        'Signed tapeout checklist',
      ],
      r: [['UTPO-D1', 'produces'], ['UTPO-D4', 'gates']],
    },
    'UTPO-02': {
      s: [
        [1, 'Merge the final test chip database with fill and markers', 0.5],
        [2, 'Run full-chip DRC, LVS and density on the merged database', 1],
        [3, 'Resolve or waive the final violations and release the report', 0.5],
      ],
      o: [
        'Merged final test chip database',
        'Full-chip DRC, LVS and density results',
        'Full-chip final DRC, LVS and density report',
      ],
      r: [['UTPO-D2', 'produces'], ['UTPO-D4', 'feeds']],
    },
    'UTPO-03': {
      s: [
        [1, 'Confirm the shuttle slot and die count with the foundry', 0.5],
        [2, 'Define the lot plan with process splits, and take a corner or engineering lot option where the shuttle cannot carry splits', 1],
        [3, 'Approve the mask order and the reticle placement on the shuttle', 1],
        [4, 'Record the confirmation of slot, masks and lots', 0.5],
      ],
      o: [
        'Confirmed shuttle slot and die count',
        'Lot plan with process splits or a corner-lot option',
        'Approved mask order and reticle placement',
        'Mask set, shuttle slot and lot plan confirmation',
      ],
      r: [['UTPO-D3', 'produces'], ['UTPO-D5', 'feeds']],
    },
    'UTPO-04': {
      s: [
        [1, 'Submit the tapeout database through the foundry intake checks', 0.5],
        [2, 'Resolve intake rejections the same day', 0.5],
        [3, 'Review the foundry’s data preparation on the PHY layers', 0.5],
        [4, 'Record the release and the foundry acceptance', 0.5],
      ],
      o: [
        'Submitted tapeout database',
        'Resolved intake rejections',
        'Reviewed data preparation on the PHY layers',
        'Tapeout database release record with intake acceptance',
      ],
      r: [['UTPO-D4', 'produces'], ['UTPO-D5', 'feeds']],
    },
    'UTPO-05': {
      s: [
        [1, 'Archive the PHY macro and test chip databases, scripts and signoff runs', 0.5],
        [2, 'Record the macro, test chip and release revisions as one configuration baseline', 0.5],
        [3, 'Restore one signoff run from the archive to prove it reproduces', 0.5, 1],
        [4, 'Release the archive and the baseline', 0.5],
      ],
      o: [
        'Archived databases, scripts and signoff runs',
        'Recorded configuration baseline',
        'Reproduced signoff run from the archive',
        'Tapeout archive and configuration baseline',
      ],
      r: [['UTPO-D5', 'produces']],
    },
  },
};
