/**
 * UTCI — Test Chip Build for Silicon Proof. Weeks 48–74; closes on Test Chip Ready.
 */
import type { UcieStageModule } from '../types';

export const UTCI: UcieStageModule = {
  content: {
    tagline: 'Build the chip whose only job is to prove the IP — and make sure every claim in the datasheet has a test on it.',
    description:
      'Define a test chip that can prove the PHY the way licensees will use it: two dies linked across an advanced-package test vehicle, two modules per die so multi-module operation is exercised, plus loopback paths for single-die and wafer-level testing. Wrap the PHY in pattern generators, checkers, a protocol-side traffic source on the FDI, register and debug access, a probe-able observation path for bench calibration — the die-to-die bumps themselves cannot be probed once assembled — and the controls bring-up needs. Integrate the PHY macros with pads, bumps and power at top level and verify the full chip. Implementation starts on signoff-candidate macros, a trial database goes through the foundry’s intake checks early, and the signed-off macro revision is dropped in and delta-checked after the hard macro signoff. The stage closes when the test chip database is ready for tapeout.',
    activities: ['Test chip architecture', 'Wrapper and test logic', 'Top-level integration', 'Test chip verification', 'Test chip signoff', 'Readiness review'],
    deliverables: [
      'Test chip architecture specification — two-die, two-module link, loopback configurations and test coverage map',
      'Test chip wrapper, traffic generators, checkers, observation path and frozen register map',
      'Integrated test chip top level — macro placement, pad ring, bumps and power',
      'Test chip top-level verification and connectivity report',
      'Test chip signoff report and final tapeout database',
      'Test chip readiness decision record',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5],
    deliverableWeek: [4, 12, 18, 22, 26, 26],
    engineeringEffort: [2.5, 6, 6, 4.5, 6, 1],
    risks: [
      'A test chip that cannot exercise a feature the datasheet claims, discovered when characterization starts',
      'Test chip signoff waiting on the hard macro signoff and absorbing all of its slip before the shuttle date',
    ],
    potentialRisks: [
      'Only a loopback configuration built, so the die-to-die link is never proven across a real package channel',
      'Traffic generators slower than the FDI at 64 GT/s, so the link is never run at full bandwidth',
      'Test chip power grid sized for the PHY alone while the traffic logic adds its own switching noise',
      'Debug access that depends on the link it is meant to debug',
      'Test chip bump map differing from the macro bump map the release documents',
      'A first database submission at the shuttle deadline, so a foundry intake rejection costs the slot',
    ],
    leader: { name: 'Takumi Sorensen', short: 'T. Sorensen', phone: '+1 (408) 555-0632', email: 'takumi.sorensen@example.com' },
    collaboration: ['Test chip integration', 'Design verification', 'Physical design', 'DFT', 'Packaging', 'Validation', 'Test engineering'],
    tools: ['RTL simulation and regression', 'Top-level floorplanning and place and route', 'Static timing and physical verification', 'Connectivity checking'],
    programView: [
      'Test chip features covered against the datasheet claims',
      'Top-level integration milestones against the shuttle date',
      'Open top-level verification failures',
      'Test chip signoff readiness versus hard macro signoff',
    ],
    perspective:
      'The test chip is a measurement instrument with a PHY inside it. Design it backwards from the characterization report and the compliance tests: if a number has to be in the production release report, the chip needs a way to produce it at full rate, on the real channel, with visibility when it fails.',
  },
  steps: {
    'UTCI-01': {
      s: [
        [1, 'List every datasheet claim and compliance test the test chip must be able to demonstrate', 1],
        [2, 'Define the two-die link with two modules per die across the advanced-package test vehicle, the loopback configurations, and the die outline and full bump plan — PHY modules, power and control — the package is drawn to', 1.5],
        [3, 'Define traffic sources, checkers, clock and reset control, debug access and a probe-able observation path for bench calibration', 1, 1],
        [4, 'Release the architecture specification with its test coverage map', 0.5],
      ],
      o: [
        'Claims and tests the test chip must cover',
        'Two-die, two-module and loopback configuration definition',
        'Traffic, control, debug and observation architecture',
        'Test chip architecture specification with coverage map',
      ],
      r: [['UTCI-D1', 'produces'], ['UTCI-D6', 'feeds']],
    },
    'UTCI-02': {
      s: [
        [1, 'Design an FDI-side traffic generator and checker that sustains full bandwidth in each mode', 3],
        [2, 'Add register access over the sideband and a separate debug path that does not need the link', 2, 1],
        [3, 'Integrate the PHY’s PRBS, loopback, BIST, analog test bus and observation lane controls into the test chip control plane', 2],
        [4, 'Add clock, reset, power and calibration controls for bring-up and characterization', 2, 1],
        [5, 'Lint, clean CDC and release the wrapper and test logic', 1.5],
        [6, 'Freeze the test chip register map and hand it to bring-up software and the test vehicle team', 0.5],
      ],
      o: [
        'FDI traffic generator and checker',
        'Register and independent debug access',
        'Integrated PRBS, loopback and BIST controls',
        'Bring-up and characterization controls',
        'Released wrapper and test logic',
        'Test chip wrapper, traffic generators, checkers, observation path and frozen register map',
      ],
      r: [['UTCI-D2', 'produces'], ['UTCI-D4', 'feeds']],
    },
    'UTCI-03': {
      s: [
        [1, 'Place two PHY modules at the die edge in the orientation the test vehicle channel requires', 2],
        [2, 'Implement the bump plan from the architecture — the frozen module bump map and the power and control pads — so the die matches the package drawn to it', 3],
        [3, 'Build the top-level power grid for the PHY and the traffic logic', 2, 1],
        [4, 'Integrate the hardened digital macro and the Electrical PHY macro at top level', 3],
        [5, 'Release the integrated top level for verification and implementation', 1],
      ],
      o: [
        'Two-module PHY placement and orientation',
        'Top-level bump map and pad ring',
        'Top-level power grid',
        'Integrated macros at top level',
        'Integrated test chip top level',
      ],
      r: [['UTCI-D3', 'produces'], ['UTCI-D5', 'feeds']],
    },
    'UTCI-04': {
      s: [
        [1, 'Run top-level simulations of link training and traffic in the two-die configuration', 4],
        [2, 'Simulate each loopback configuration and the register and debug paths', 3, 1],
        [3, 'Check connectivity of bumps, pads, supplies and test signals against the specification', 2],
        [4, 'Run gate-level simulation of the test chip with timing', 3],
        [5, 'Release the top-level verification report', 1],
      ],
      o: [
        'Two-die training and traffic simulation results',
        'Loopback, register and debug path results',
        'Connectivity check results',
        'Test chip gate-level simulation results',
        'Test chip top-level verification report',
      ],
      r: [['UTCI-D4', 'produces'], ['UTCI-D6', 'feeds']],
    },
    'UTCI-05': {
      s: [
        [1, 'Implement the test chip top level around the signoff-candidate macro revisions', 3],
        [2, 'Submit a trial database through the foundry intake checks and close every rejection', 1, 1],
        [3, 'Close top-level timing for the traffic and control logic', 2],
        [4, 'Run full-chip EM, IR drop, DRC and LVS', 2, 1],
        [5, 'Drop in the macro revision the hard macro signoff authorized and run the delta checks on what changed', 1.5],
        [6, 'Release the test chip signoff report and final database', 0.5],
      ],
      o: [
        'Implemented test chip top level',
        'Trial database accepted by the foundry intake checks',
        'Closed top-level timing',
        'Full-chip EM, IR, DRC and LVS results',
        'Signed-off macro revision in place with delta checks clean',
        'Test chip signoff report and final tapeout database',
      ],
      r: [['UTCI-D5', 'produces'], ['UTCI-D6', 'feeds']],
    },
    'UTCI-06': {
      s: [
        [1, 'Review the coverage map, verification report and signoff report together', 0.5],
        [2, 'Confirm the frozen register map, pinout and bump map are the ones the test vehicle and bring-up are built to', 0.5],
        [3, 'Hold the readiness review and record the decision for tapeout', 1],
      ],
      o: [
        'Consolidated coverage, verification and signoff review',
        'Register map, pinout and bump map consistency confirmation',
        'Test chip readiness decision record',
      ],
      r: [['UTCI-D6', 'produces']],
    },
  },
};
