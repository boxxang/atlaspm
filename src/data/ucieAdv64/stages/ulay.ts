/**
 * ULAY — Electrical PHY Layout & Macro Assembly. Weeks 44–68; closes on
 * Layout Complete.
 */
import type { UcieStageModule } from '../types';

export const ULAY: UcieStageModule = {
  content: {
    tagline: 'Draw the analog so it still meets 64 GT/s after the wires are counted, and assemble the PHY into one macro on its bumps.',
    description:
      'Lay out the frozen Electrical PHY and assemble the PHY hard macro. The floorplan and critical-block placement start before the circuit freeze so the module’s shape is settled against the bump map concept; the TX, RX and clocking layout itself is drawn to the frozen schematics, with matching, shielding and symmetric routing on every path the timing budget depends on. The bump map from the channel freeze is implemented under the macro, the digital hard macro is placed beside the analog, and the result is extracted and re-simulated across corners to prove the margin survived the parasitics. The stage releases the abstract, timing and power models customers and the test chip will integrate, and closes when layout is complete and ready for signoff.',
    activities: [
      'Floorplan and placement',
      'TX, RX and clocking layout',
      'Matching and parasitics',
      'Bump map and macro assembly',
      'Post-layout simulation',
      'Abstract and models',
      'Layout completion review',
    ],
    deliverables: [
      'Electrical PHY layout floorplan with critical-block placement',
      'TX, RX and clocking layout database',
      'Matching, shielding and parasitic control record with extraction comparison',
      'Assembled PHY hard macro layout with the implemented bump map',
      'Post-layout simulation report across corners at 64 GT/s',
      'PHY hard macro abstract, timing and power models',
      'Layout completion review record',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6],
    deliverableWeek: [6, 16, 18, 20, 22, 22, 24],
    engineeringEffort: [5, 14, 6, 8, 7, 4, 1],
    risks: [
      'Clock-path parasitics adding skew across the module that phase adjustment cannot remove lane by lane',
      'Bump map implemented after the macro outline is fixed, forcing analog blocks to move under the bumps late',
    ],
    potentialRisks: [
      'Layout started on pre-freeze schematics and redrawn when the circuits change at the freeze',
      'Matching rules followed on the sampler but not on the clock distribution that feeds it',
      'Extraction run only on blocks, so coupling between TX and RX routing across the macro is never simulated',
      'Abstract pins and blockages that disagree with the layout, found only when the test chip integrates the macro',
      'Power grid under the bumps sized for average current while all 64 drivers switch at once',
    ],
    leader: { name: 'Ana Ferreira', short: 'A. Ferreira', phone: '+1 (408) 555-0613', email: 'ana.ferreira@example.com' },
    collaboration: ['Analog layout', 'Analog and mixed-signal', 'Mixed-signal verification', 'Packaging', 'SI/PI', 'Physical design', 'Test chip integration'],
    tools: ['Custom layout editor', 'Parasitic extraction', 'Transistor-level circuit simulator', 'Physical verification and design rule checking', 'Abstract and model generation tools'],
    programView: [
      'Post-layout timing margin against schematic margin, per block',
      'Blocks laid out against plan, by week',
      'Bump map changes after implementation started',
      'Abstract and model consistency issues open',
    ],
    perspective:
      'Layout is where the timing budget is spent a second time. Measure every block’s post-layout margin against its schematic margin and treat the difference as consumption against a budget — the clock path will try to take more than its share.',
  },
  steps: {
    'ULAY-01': {
      s: [
        [1, 'Draw the module outline against the bump map concept and the shoreline target', 1.5],
        [2, 'Place the TX, RX, clocking and bias blocks per lane group with the clock spine at the center', 2],
        [3, 'Plan supply, ground and shielding layers on the metal stack', 1.5, 1],
        [4, 'Reserve the digital hard macro region and the interface between them', 1],
        [5, 'Release the floorplan with critical-block placement', 1],
      ],
      o: [
        'Module outline against bump map and shoreline',
        'Block placement per lane group',
        'Supply, ground and shielding layer plan',
        'Digital macro region and interface plan',
        'Electrical PHY layout floorplan with critical-block placement',
      ],
      r: [['ULAY-D1', 'produces'], ['ULAY-D4', 'feeds']],
    },
    'ULAY-02': {
      s: [
        [1, 'Lay out the TX driver and serializer per lane to the frozen schematics', 3],
        [2, 'Lay out the RX front-end, sampler and deserializer per lane', 3],
        [3, 'Lay out the forwarded clock receiver, DLL, phase adjustment and clock spine', 3, 1],
        [4, 'Lay out bias, references, regulation and ESD at the bumps', 2],
        [5, 'Run design rule and connectivity checks per block and fix', 1],
        [6, 'Release the TX, RX and clocking layout database', 1],
      ],
      o: [
        'TX driver and serializer layout',
        'RX front-end, sampler and deserializer layout',
        'Clocking layout with clock spine',
        'Bias, regulation and ESD layout',
        'Block-level DRC and LVS clean',
        'TX, RX and clocking layout database',
      ],
      r: [['ULAY-D2', 'produces'], ['ULAY-D4', 'feeds']],
    },
    'ULAY-03': {
      s: [
        [1, 'Apply matching rules to the sampler, phase adjustment and clock distribution', 3],
        [2, 'Shield the clock spine and the sensitive receive inputs from driver switching', 2],
        [3, 'Balance routing lengths across lanes for skew and symmetry', 2, 1],
        [4, 'Extract each block and compare its parasitics with the layout estimates the circuits assumed', 3],
        [5, 'Release the matching, shielding and parasitic record', 1],
      ],
      o: [
        'Matching applied to critical paths',
        'Shielding of clock spine and receive inputs',
        'Lane-to-lane routing balance',
        'Extraction comparison against assumed parasitics',
        'Matching, shielding and parasitic control record with extraction comparison',
      ],
      r: [['ULAY-D3', 'produces'], ['ULAY-D5', 'feeds']],
    },
    'ULAY-04': {
      s: [
        [1, 'Implement the frozen bump map — signal, redundant, clock, valid, track, sideband and supply bumps', 2],
        [2, 'Route from every bump to its lane through the ESD and bump interface', 2],
        [3, 'Place the digital hard macro and connect the analog control and data interfaces', 2, 1],
        [4, 'Build the power grid under the bumps for full-module switching current', 2],
        [5, 'Assemble the PHY hard macro and run macro-level design rule and connectivity checks', 1.5],
        [6, 'Release the assembled macro layout with the implemented bump map', 0.5],
      ],
      o: [
        'Bump map implemented under the macro',
        'Bump-to-lane routing',
        'Digital macro placed and connected',
        'Power grid sized for full-module switching',
        'Macro-level DRC and LVS clean',
        'Assembled PHY hard macro layout with the implemented bump map',
      ],
      r: [['ULAY-D4', 'produces'], ['ULAY-D6', 'feeds']],
    },
    'ULAY-05': {
      s: [
        [1, 'Extract the full macro with coupling between blocks and lanes', 2],
        [2, 'Re-run the PVT corner testbenches on the extracted netlist at 64 GT/s', 3],
        [3, 'Re-run Monte Carlo on the sampler and phase paths with layout parasitics', 2, 1],
        [4, 'Compare post-layout margins with schematic margins and fix the blocks that lost too much', 2],
        [5, 'Release the post-layout simulation report', 1],
      ],
      o: [
        'Full-macro extracted netlist',
        'Post-layout corner results',
        'Post-layout Monte Carlo results',
        'Margin comparison and layout fixes',
        'Post-layout simulation report across corners at 64 GT/s',
      ],
      r: [['ULAY-D5', 'produces'], ['ULAY-D7', 'feeds']],
    },
    'ULAY-06': {
      s: [
        [1, 'Generate the macro abstract — outline, pins, bumps and blockages', 1],
        [2, 'Characterize timing at the macro’s digital interface across corners', 1.5],
        [3, 'Generate the power model and current profiles for the customer’s grid analysis', 1, 1],
        [4, 'Check the abstract and models against the layout and the interface specification', 1],
        [5, 'Release the abstract, timing and power models', 0.5],
      ],
      o: [
        'Macro abstract',
        'Interface timing characterization',
        'Power model and current profiles',
        'Abstract and model consistency check',
        'PHY hard macro abstract, timing and power models',
      ],
      r: [['ULAY-D6', 'produces'], ['ULAY-D7', 'feeds']],
    },
    'ULAY-07': {
      s: [
        [1, 'Collect the layout database, post-layout report, abstracts and models', 0.5],
        [2, 'Review post-layout margins, open checks and model consistency', 1],
        [3, 'Hold the layout completion review and release the macro to signoff', 0.5],
      ],
      o: [
        'Collected layout deliverables',
        'Margin and open-check review',
        'Layout completion review record',
      ],
      r: [['ULAY-D7', 'produces']],
    },
  },
};
