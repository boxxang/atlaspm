/**
 * UDPD — Digital Implementation. Weeks 46–66; closes on Digital Timing Closure.
 */
import type { UcieStageModule } from '../types';

export const UDPD: UcieStageModule = {
  content: {
    tagline: 'Harden the Adapter and Logical PHY into a macro that meets timing beside the analog front-end, at every corner a customer will run.',
    description:
      'Turn the frozen Adapter and Logical PHY RTL into a digital hard macro that sits against the Electrical PHY at the die edge. Synthesis trials on pre-freeze RTL set the constraints and find the long paths early; after the RTL freeze, final synthesis inserts scan and releases the netlist to gate-level simulation, and every bug verification still finds after the freeze is fixed as a controlled functional ECO in both the RTL and the netlist, with equivalence re-proven. Floorplanning places the lane datapaths so each lines up with its bump column, with a power grid sized for the switching current of a 64-lane module; place and route and multi-corner, multi-mode timing closure then meet the clock frequencies the 64 GT/s datapath needs, including the timing arcs into and out of the analog front-end. The stage closes when the hardened macro, its abstract and its timing and power views are ready for hard macro signoff and for the test chip.',
    activities: [
      'Synthesis trials',
      'Final synthesis and netlist',
      'Floorplan and power grid',
      'Place and route',
      'Timing closure',
      'Macro hardening and views',
      'Timing closure review',
      'Post-freeze functional ECO',
    ],
    deliverables: [
      'Synthesis trial results and timing constraint set',
      'Scan-inserted synthesis netlist release',
      'Digital floorplan and power grid database',
      'Placed and routed digital database',
      'Multi-corner multi-mode timing closure report',
      'Digital hard macro database with abstract, timing and power views',
      'Digital timing closure review record',
      'Functional ECO log with the ECO-updated netlist and equivalence results',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6, 7],
    deliverableWeek: [6, 10, 12, 16, 18, 20, 20, 18],
    engineeringEffort: [3, 2, 3, 4, 4.5, 3, 0.5, 2.5],
    risks: [
      'Timing arcs at the boundary with the analog front-end left to the last iteration, so the macro closes internally and fails at assembly',
      'Lane datapaths placed without regard to the bump columns, adding routing skew the deskew range was never budgeted for',
    ],
    potentialRisks: [
      'Constraints written before the clocking architecture settles, so closure targets the wrong generated clocks',
      'Power grid sized for average current rather than all 64 lanes toggling, leaving IR drop to be found at signoff',
      'Late RTL fixes after the freeze forcing a re-synthesis that resets placement and timing work instead of a scoped functional ECO',
      'Retry buffer memories placed far from the Adapter logic, turning a timing-easy block into the critical path',
      'Macro aspect ratio fixed before the bump map, so the hardened block does not fit the shoreline it was meant to',
    ],
    leader: { name: 'Kenji Watanabe', short: 'K. Watanabe', phone: '+1 (408) 555-0612', email: 'kenji.watanabe@example.com' },
    collaboration: ['RTL design', 'Analog layout', 'DFT', 'Design verification', 'Packaging', 'Design methodology and CAD'],
    tools: [
      'Logic synthesis with scan insertion',
      'Place-and-route system',
      'Static timing analysis engine',
      'Power and IR drop analysis',
    ],
    programView: [
      'Worst negative slack and total negative slack per corner',
      'Netlist drops against the RTL freeze date',
      'Macro area against the shoreline budget',
      'Timing arcs closed at the analog boundary',
    ],
    perspective:
      'In a die-to-die PHY the digital macro is shaped by the bumps, not the other way round. Floorplan each lane’s datapath under its bump column first, and close timing to the analog boundary from the first placement — that is where the schedule is lost.',
  },
  steps: {
    'UDPD-01': {
      s: [
        [1, 'Write the timing constraints from the clocking architecture — generated clocks, multicycle and false paths', 1.5],
        [2, 'Synthesize successive pre-freeze RTL drops and report the worst paths per block', 2],
        [3, 'Feed long paths and area hot spots back to RTL design while the RTL can still change', 1.5, 1],
        [4, 'Release the trial results and the constraint set', 1],
      ],
      o: [
        'Timing constraints from the clocking architecture',
        'Synthesis trial reports per RTL drop',
        'Path and area feedback to RTL design',
        'Synthesis trial results and timing constraint set',
      ],
      r: [['UDPD-D1', 'produces'], ['UDPD-D2', 'informs']],
    },
    'UDPD-02': {
      s: [
        [1, 'Synthesize the frozen RTL with the final constraints and memories', 1.5],
        [2, 'Insert scan chains and test compression per the DFT freeze', 1],
        [3, 'Check logical equivalence between RTL and netlist', 1, 1],
        [4, 'Release the netlist to gate-level simulation and to place and route', 0.5],
      ],
      o: [
        'Final synthesized netlist',
        'Scan-inserted netlist',
        'RTL-to-netlist equivalence result',
        'Scan-inserted synthesis netlist release',
      ],
      r: [['UDPD-D2', 'produces'], ['UDPD-D4', 'feeds']],
    },
    'UDPD-03': {
      s: [
        [1, 'Define the macro outline and pin placement against the bump map and the analog front-end abutment', 2],
        [2, 'Place each lane datapath under its bump column and the retry buffer memories beside the Adapter', 2],
        [3, 'Design the power grid for all lanes toggling and check early IR drop', 1.5, 1],
        [4, 'Release the floorplan and power grid database', 0.5],
      ],
      o: [
        'Macro outline and pin plan aligned to the bumps',
        'Lane datapath and memory placement',
        'Power grid with early IR drop check',
        'Digital floorplan and power grid database',
      ],
      r: [['UDPD-D3', 'produces'], ['UDPD-D4', 'feeds']],
    },
    'UDPD-04': {
      s: [
        [1, 'Place the netlist and optimize for timing and congestion', 1.5],
        [2, 'Build the clock trees with balanced skew across the lane datapaths', 1.5],
        [3, 'Route the design and fix design-rule violations', 2],
        [4, 'Release the placed and routed database', 0.5],
      ],
      o: [
        'Placed and optimized design',
        'Clock trees with lane-to-lane skew report',
        'Routed design clean of design-rule violations',
        'Placed and routed digital database',
      ],
      r: [['UDPD-D4', 'produces'], ['UDPD-D5', 'feeds']],
    },
    'UDPD-05': {
      s: [
        [1, 'Run timing across every corner and mode — functional, scan, low-power and training', 1.5],
        [2, 'Close the timing arcs into and out of the analog front-end with its timing models', 2],
        [3, 'Fix violations with targeted placement and sizing changes', 2, 1],
        [4, 'Release the timing closure report', 1],
      ],
      o: [
        'Multi-corner multi-mode timing results',
        'Analog boundary timing arcs closed',
        'Timing fixes applied',
        'Multi-corner multi-mode timing closure report',
      ],
      r: [['UDPD-D5', 'produces'], ['UDPD-D7', 'feeds']],
    },
    'UDPD-06': {
      s: [
        [1, 'Finalize the macro boundary, pins and blockages for abutment with the PHY macro', 1],
        [2, 'Generate the abstract, the timing library and the power model of the digital macro', 1.5],
        [3, 'Check the views against the database and hand them to signoff and the test chip', 1],
      ],
      o: [
        'Final macro boundary and pins',
        'Abstract, timing and power views',
        'Digital hard macro database with abstract, timing and power views',
      ],
      r: [['UDPD-D6', 'produces'], ['UDPD-D7', 'feeds']],
    },
    'UDPD-07': {
      s: [
        [1, 'Collect the timing, power and view reports for the digital macro', 0.5],
        [2, 'Review residual violations and waivers with signoff and analog layout', 0.5],
        [3, 'Record the timing closure decision and the hand-off to signoff', 0.5],
      ],
      o: [
        'Implementation evidence set',
        'Residual violation and waiver review',
        'Digital timing closure review record',
      ],
      r: [['UDPD-D7', 'produces'], ['UDPD-D8', 'informs']],
    },
    'UDPD-08': {
      s: [
        [1, 'Triage each post-freeze bug from verification and gate-level simulation for an ECO fix or a documented waiver', 1],
        [2, 'Implement each fix in the RTL and as a netlist ECO with spare cells or a scoped re-synthesis', 3],
        [3, 'Re-prove logical equivalence between the fixed RTL and the ECO netlist', 1, 1],
        [4, 'Rerun the affected regressions and gate-level tests on the ECO netlist with verification', 2],
        [5, 'Fold the ECO into place and route and timing closure without reopening closed paths', 2],
        [6, 'Release the ECO log and the updated netlist', 1],
      ],
      o: [
        'Post-freeze bug triage with fix or waiver per bug',
        'RTL fixes and matching netlist ECOs',
        'RTL-to-ECO-netlist equivalence result',
        'Regression and gate-level results on the ECO netlist',
        'ECO folded into the routed and timed database',
        'Functional ECO log with the ECO-updated netlist and equivalence results',
      ],
      r: [['UDPD-D8', 'produces'], ['UDPD-D5', 'feeds'], ['UDPD-D7', 'feeds']],
    },
  },
};
