/**
 * UDFT — Test, Lane Repair & Debug Hooks. Weeks 26–52; closes on DFT Freeze.
 */
import type { UcieStageModule } from '../types';

export const UDFT: UcieStageModule = {
  content: {
    tagline: 'Build the features that prove the PHY on the tester, in the lab and in the customer’s package — before there is anything to test.',
    description:
      'Design the test and debug logic the IP carries into every customer’s chip: the test access plan, scan insertion rules and ATPG coverage targets for the digital hard macro, per-lane PRBS generators and checkers, near-end, far-end and analog loopback modes, BIST and the built-in lane test that finds bad microbumps after assembly and hands the result to lane repair, eye and lane margining that sweeps sampling time and voltage per lane at 64 GT/s, with a probe-able observation path and on-die analog test bus to calibrate it on the bench, a hard-macro test wrapper the licensee’s SoC test access can reach, the compliance hooks a reference-die test drives over the sideband — there is nothing to probe on assembled die-to-die bumps — and debug access through registers, snapshots, trace and the sideband. These features serve three customers at once — the IP team on its own test chip, test engineering at wafer sort and package test, and the licensee who has to test the PHY inside their SoC without the IP team in the room. The stage closes on a DFT freeze, together with the RTL freeze, with every feature specified, implemented and covered by verification.',
    activities: [
      'DFT spec and access plan',
      'Scan and ATPG targets',
      'PRBS per lane',
      'Loopback modes',
      'BIST and lane test',
      'Eye and lane margining',
      'Debug access',
      'DFT freeze review',
    ],
    deliverables: [
      'DFT specification and test access plan',
      'Scan insertion plan, test wrapper and ATPG coverage targets',
      'Per-lane PRBS generator and checker RTL',
      'Loopback mode RTL and loopback test descriptions',
      'BIST and built-in lane test RTL with repair map output',
      'Eye and lane margining logic and margin readout specification',
      'Debug access logic and debug user guide',
      'DFT freeze package and freeze decision record',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6, 7],
    deliverableWeek: [4, 18, 16, 18, 20, 20, 22, 26],
    engineeringEffort: [1.5, 6, 4.5, 4.5, 5.5, 5, 4, 1],
    risks: [
      'The built-in lane test cannot tell a marginal microbump from a good one, so assembled parts ship with lanes that fail in the field instead of being repaired',
      'Margining logic steps too coarsely at 64 GT/s, so silicon eye margins cannot be compared with the simulated ones',
    ],
    potentialRisks: [
      'Test access defined for the IP team’s test chip only, leaving licensees no documented way to test the PHY inside their SoC',
      'PRBS checkers that count errors but cannot localize them to a lane, so bring-up spends days isolating one bad bump',
      'Analog loopback paths that load the front-end and cost the margin they are meant to measure',
      'Scan coverage targets met on the digital macro while the front-end control logic is left untested',
      'Debug registers readable only over the mainband, so a link that fails training cannot be debugged at all',
      'DFT features added after the RTL freeze and never seen by gate-level simulation',
    ],
    leader: { name: 'Marcus Lindqvist', short: 'M. Lindqvist', phone: '+1 (408) 555-0612', email: 'marcus.lindqvist@example.com' },
    collaboration: ['RTL design', 'Analog and mixed-signal', 'Test engineering', 'Validation', 'Design verification', 'Customer engineering'],
    tools: ['Scan insertion and ATPG', 'RTL simulator', 'Test pattern conversion for automatic test equipment', 'Register map generator'],
    programView: [
      'DFT features implemented and verified against the plan',
      'Projected scan coverage against target',
      'Lanes covered by PRBS, loopback and margining',
      'Test access documented for licensee integration',
    ],
    perspective:
      'Every licensee will bring up this PHY without its designers in the room. The test and debug features are the only engineers the IP team can ship inside the customer’s chip — design them for a stranger with a scope and a register dump.',
  },
  steps: {
    'UDFT-01': {
      s: [
        [1, 'Turn the DFT and debug strategy into a feature list per block and per use — test chip, wafer sort, package test, reference-die compliance and licensee SoC', 1],
        [2, 'Define the test access path for each feature from the scan port, the register map and the sideband', 1],
        [3, 'Define the test modes, their entry and exit and their effect on functional state', 1, 1],
        [4, 'Release the DFT specification and test access plan after review with test engineering and customer engineering', 1],
      ],
      o: [
        'DFT feature list per block and use',
        'Test access path per feature',
        'Test mode definitions',
        'DFT specification and test access plan',
      ],
      r: [['UDFT-D1', 'produces'], ['UDFT-D8', 'feeds']],
    },
    'UDFT-02': {
      s: [
        [1, 'Define scan chain structure, compression and clocking for the digital hard macro', 3],
        [2, 'Set stuck-at and transition fault coverage targets per block', 2],
        [3, 'Define test points and observe points for logic that scan cannot reach, including the front-end control interface', 3, 1],
        [4, 'Define the hard-macro test wrapper an SoC test access network reaches — wrapper cells, control and the test modes it exposes', 2],
        [5, 'Run trial scan insertion and ATPG on the current RTL to project coverage', 5],
        [6, 'Release the scan insertion plan, the wrapper definition and the ATPG coverage targets', 2],
      ],
      o: [
        'Scan chain structure and compression scheme',
        'Fault coverage targets per block',
        'Test and observe points for unreachable logic',
        'Hard-macro test wrapper definition',
        'Projected coverage from trial insertion',
        'Scan insertion plan, test wrapper and ATPG coverage targets',
      ],
      r: [['UDFT-D2', 'produces'], ['UDFT-D8', 'feeds']],
    },
    'UDFT-03': {
      s: [
        [1, 'Select the PRBS polynomials and patterns, including the patterns the compliance tests call for', 2],
        [2, 'Implement per-lane PRBS generators selectable on every data lane and the redundant lanes', 4],
        [3, 'Implement per-lane checkers with error counters, first-error capture and lane-level error localization', 4],
        [4, 'Expose generator and checker control and counters through registers and the sideband', 2, 1],
        [5, 'Pass directed tests with errors injected on individual lanes', 2],
      ],
      o: [
        'Selected PRBS polynomials and patterns',
        'Per-lane PRBS generator RTL',
        'Per-lane checker RTL with localization',
        'PRBS control and counter registers',
        'Per-lane PRBS generator and checker RTL',
      ],
      r: [['UDFT-D3', 'produces'], ['UDFT-D8', 'feeds']],
    },
    'UDFT-04': {
      s: [
        [1, 'Define near-end digital, far-end and analog loopback points with the analog team', 2],
        [2, 'Implement the digital loopback controls and the far-end loopback through the partner die', 4],
        [3, 'Implement the controls for the analog loopback path in the front-end', 3, 1],
        [4, 'Check that the analog loopback path does not load the receive path in normal operation', 2],
        [5, 'Write loopback test descriptions for sort, package test and bring-up', 3],
      ],
      o: [
        'Loopback point definitions',
        'Digital and far-end loopback RTL',
        'Analog loopback controls',
        'Loading check of the analog loopback path',
        'Loopback mode RTL and loopback test descriptions',
      ],
      r: [['UDFT-D4', 'produces'], ['UDFT-D8', 'feeds']],
    },
    'UDFT-05': {
      s: [
        [1, 'Define the built-in lane test that finds open and marginal microbumps on every lane after assembly', 3],
        [2, 'Implement the lane test sequence with PRBS and per-lane pass, fail and marginal classification', 5],
        [3, 'Implement the repair map output that lane repair consumes at MBINIT', 3],
        [4, 'Implement logic BIST or memory BIST for the retry buffer and other memories as the plan requires', 3, 1],
        [5, 'Pass directed tests with open and marginal lanes injected', 2],
      ],
      o: [
        'Built-in lane test definition',
        'Lane test sequence with per-lane classification',
        'Repair map output for lane repair',
        'Logic and memory BIST RTL',
        'BIST and built-in lane test RTL with repair map output',
      ],
      r: [['UDFT-D5', 'produces'], ['UDFT-D8', 'feeds']],
    },
    'UDFT-06': {
      s: [
        [1, 'Define the margining sweep — sampling phase and reference voltage steps fine enough to resolve a 64 GT/s eye', 2],
        [2, 'Implement per-lane eye sweep control using the front-end’s phase and reference adjustments', 4],
        [3, 'Implement margin readout per lane, with error counts at each sweep point', 3],
        [4, 'Specify how margins are read in mission mode without disturbing traffic on other lanes', 2, 1],
        [5, 'Add a probe-able observation path and an on-die analog test bus so the margining can be calibrated on the bench', 2],
        [6, 'Release the margining logic and the margin readout specification', 2],
      ],
      o: [
        'Margining sweep definition',
        'Per-lane eye sweep control RTL',
        'Per-lane margin readout RTL',
        'Mission-mode margining specification',
        'Observation path and analog test bus',
        'Eye and lane margining logic and margin readout specification',
      ],
      r: [['UDFT-D6', 'produces'], ['UDFT-D8', 'feeds']],
    },
    'UDFT-07': {
      s: [
        [1, 'Define the debug signals worth observing — training state, lane status, error logs and recalibration history', 2],
        [2, 'Implement register snapshots captured on error or on a trigger', 3],
        [3, 'Implement a trace buffer for training and state-machine history', 3, 1],
        [4, 'Make debug readable over the sideband so a link that never trains can still be diagnosed', 3],
        [5, 'Support compliance testing against a reference die — compliance control registers, margining, BER and skew results reachable over the sideband', 3],
        [6, 'Write the debug and compliance-access user guide for the lab and for licensees', 2],
      ],
      o: [
        'Debug signal list',
        'Register snapshot logic',
        'Training and state trace buffer',
        'Sideband debug access',
        'Compliance access over the sideband',
        'Debug access logic and debug user guide',
      ],
      r: [['UDFT-D7', 'produces'], ['UDFT-D8', 'feeds']],
    },
    'UDFT-08': {
      s: [
        [1, 'Check every feature in the DFT specification against its implementation and verification status', 1],
        [2, 'Confirm projected scan coverage meets target and the waivers are reviewed', 1],
        [3, 'Confirm test access is documented for licensee integration', 1, 1],
        [4, 'Hold the DFT freeze review and record the decision', 1],
      ],
      o: [
        'Feature implementation and verification check',
        'Coverage and waiver confirmation',
        'Licensee test access documentation confirmation',
        'DFT freeze package and freeze decision record',
      ],
      r: [['UDFT-D8', 'produces']],
    },
  },
};
