import type { ActivityWriteUp } from '../activityDetailTypes';

/** Multi-Die Test & Repair — testing a part whose dies can only be reached through each other. */
export const MDT_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'MDT-01': {
    criticalPath: true,
    purpose: [
      'Decide <b>what is tested before, during and after bonding</b>, and how a tester reaches a die that is buried under another one once the stack is assembled.',
      'A stacked part cannot be tested like a single die. Every bond hides a surface the prober could once touch, and every insertion that is skipped moves a defect further down the flow, where it costs a whole stack instead of one die. The strategy sets where each class of defect is caught, which is why it has to exist before the stack-level patterns and the known-good-stack criteria are written against it.',
    ],
    flowNote:
      'Step 1 splits the defects across the pre-bond, mid-bond and post-bond insertions, and steps 2 and 3 run on that split together: the access plan says what can be reached through the IEEE 1838 wrapper, and the coverage targets say what each insertion has to prove with it. Step 4 is a review rather than a formality, because test development, DFT and product engineering all sign the same plan and each of them inherits a piece of it.',
    consumes: [
      'Test and repair architecture from D2D-05',
      'DFT architecture and test strategy from DFT-01',
      'Known-good-die criteria and sort flow from KGD-01',
      'Test plan and coverage strategy from TEST-01',
      'Stack yield and KGD economics from PART-04',
    ],
    rel: {
      'MDT-D1':
        '<b>Post-bond test strategy.</b> The strategy is written and released here, and every later test activity in the stage works to it.',
      'MDT-D3':
        '<b>Stack-level pattern set.</b> The access plan and the coverage per insertion define what the ported patterns must reach and through which path.',
    },
    risks: [
      '<b>Strategy written after the stack is designed.</b> The wrapper and the test ports are then fixed without the access the post-bond insertion needs, and a buried die cannot be reached.',
      '<b>Mid-bond insertion dropped to save tester time.</b> A bad bond on the first pair is then found only after the next die is stacked on it, and the whole stack is scrapped.',
      '<b>Coverage counted per die, not per stack.</b> Two dies at ninety-nine percent each say nothing about the bonds and the link between them.',
      '<b>No budget for test time on a stacked part.</b> Serial access through the wrapper is slow, and a plan that ignores it is rewritten on the tester.',
      '<b>Pre-bond test treated as KGD sort.</b> Sort proves a die against its own specification; it does not prove the die-to-die side, which only the stack can exercise.',
    ],
    roles: [
      { r: 'Test architect', d: 'Owns the insertion split and the strategy' },
      { r: 'DFT architect', d: 'Wrapper, test ports and what they can reach' },
      { r: 'Test development lead', d: 'Tester time, sites and program feasibility' },
      { r: 'OSAT test liaison', d: 'Mid-bond insertion at the assembly line' },
      { r: 'Product engineering lead', d: 'Approves the strategy against the yield and cost model' },
    ],
    effort: [
      ['Insertion split', 1.5],
      ['Buried-die access plan', 2],
      ['Coverage targets per insertion', 1.25],
      ['Review and release', 1.25],
    ],
    entry: [
      'D2D test and repair architecture defined in D2D-05',
      'KGD criteria available from KGD-01',
      'Stack topology and die list frozen',
    ],
    exit: [
      'Every defect class assigned to an insertion that can catch it',
      'Access path to each buried die documented and agreed with DFT',
      'Strategy released to test development and product engineering',
    ],
    dependsOn: ['D2D-05', 'DFT-01', 'KGD-01'],
    dependsNote: null,
    feedsInto: ['MDT-02', 'MDT-03', 'MDT-04'],
    measuredBy: [
      'Defect classes with an assigned insertion against those identified',
      'Test time per insertion against the cost model',
      'Strategy changes requested after pattern porting started',
    ],
    links: {
      dependsOn: ['D2D-05', 'DFT-01', 'KGD-01', 'TEST-01'],
      feedsInto: ['MDT-02', 'MDT-03', 'MDT-04', 'TEST-07'],
      runsWith: [],
      revisedBy: ['PART-04'],
      feedsBackInto: [],
    },
    terms: ['IEEE 1838', 'KGD', 'DFT', 'ATE'],
  },

  'MDT-02': {
    criticalPath: true,
    purpose: [
      'Bring up the <b>die-to-die link BIST and its lane repair</b> on real assembled stacks, and prove the link has margin before it is trusted in production.',
      'The link is the one interface nobody can probe once the dies are bonded. Its built-in self-test is the only instrument, and its repair mechanism is the only way a stack with a failed bump survives. Both were designed in D2D-05 against a model; this activity is the first time either runs on silicon.',
    ],
    flowNote:
      'Step 1 has to succeed before anything else means much: a BIST that does not run cannot report a failure. Step 2 then injects the failures the repair must handle, and step 3 runs beside it, sweeping voltage and temperature on the stacks that pass. Step 4 is the long one because the report has to say which lanes were remapped on which units and whether the margin left is enough.',
    consumes: [
      'Test and repair architecture from D2D-05',
      'Post-bond test strategy from MDT-01',
      'Interface compliance and interop results from D2D-06',
      'Die-to-die interface bring-up findings from BU-06',
      'First assembled stacks from ASSY-10',
    ],
    rel: {
      'MDT-D2':
        '<b>D2D BIST and repair bring-up report.</b> The report is written here, from the first stacks on which the link was exercised and repaired.',
      'MDT-D5':
        '<b>Test escape and repair yield analysis.</b> The remap data from bring-up is the baseline the repair yield is later measured against.',
    },
    risks: [
      '<b>BIST that cannot run at mission speed.</b> A link that passes at a reduced rate proves continuity, not that it will carry traffic.',
      '<b>Repair exercised only on injected faults.</b> Real bump failures are marginal rather than open, and a repair that only triggers on hard opens misses them.',
      '<b>Margin measured at room temperature.</b> The stack runs hot in the middle, and the lanes nearest the hotspot are the first to fail.',
      '<b>Remap results not stored per unit.</b> Without the lane map in the eFuse and the test database, a repaired unit looks like a good one and field returns cannot be traced.',
      '<b>Bring-up on too few stacks.</b> Three units show the mechanism works; they say nothing about how often it is needed.',
    ],
    roles: [
      { r: 'DFT engineer', d: 'Owns BIST bring-up and the repair exercise' },
      { r: 'D2D PHY engineer', d: 'Link training, lane behavior and margin' },
      { r: 'Test engineer', d: 'ATE setup and data collection' },
      { r: 'Validation engineer', d: 'Correlation with system-level link behavior' },
      { r: 'Test architect', d: 'Approves readiness against the post-bond strategy' },
    ],
    effort: [
      ['Link BIST bring-up', 2.5],
      ['Lane repair and remap exercise', 2],
      ['Voltage and temperature margin sweep', 2],
      ['Unit data and traceability', 1],
      ['Readiness report', 1.5],
    ],
    entry: [
      'First assembled stacks available from the assembly line',
      'BIST and repair collateral delivered with the D2D PHY IP',
      'Post-bond test strategy released in MDT-01',
    ],
    exit: [
      'Link BIST runs at mission rate on the ATE and on the bench',
      'Lane repair demonstrated on real failures, with the remap recorded per unit',
      'Link margin reported across voltage and temperature corners',
    ],
    dependsOn: ['MDT-01', 'D2D-05', 'BU-06'],
    dependsNote: null,
    feedsInto: ['MDT-03', 'MDT-05'],
    measuredBy: [
      'Stacks on which the link BIST ran at mission rate',
      'Lanes remapped per hundred stacks',
      'Worst-case eye or error margin across the corners',
    ],
    links: {
      dependsOn: ['MDT-01', 'D2D-05', 'D2D-06', 'BU-06'],
      feedsInto: ['MDT-03', 'MDT-05', 'MP-07'],
      runsWith: ['BU-08'],
      revisedBy: [],
      feedsBackInto: ['D2D-04'],
    },
    terms: ['BIST', 'D2D', 'BISR', 'PVT', 'Shmoo', 'UCIe'],
  },

  'MDT-03': {
    criticalPath: true,
    purpose: [
      'Port <b>each die’s ATPG patterns to the stacked access path</b>, fit them on the tester and debug them on real stacks until the set can be released.',
      'Every die arrives with patterns that were generated for its own pins. In the stack those pins are gone, and the only way in is through the IEEE 1838 wrapper and whichever die sits between the tester and the target. The patterns have to be retargeted, shortened and proven on silicon, and the stack-level set is what production test runs.',
    ],
    flowNote:
      'Step 1 is mechanical when the wrapper was designed well and very slow when it was not, which is why the access plan from MDT-01 matters. Step 2 fits the ported set within tester memory and time. Step 3 runs alongside it on the first stacks: patterns that fail on good units are almost always access or timing problems, not defects. Step 4 releases the set only once the debug log is clean.',
    consumes: [
      'Post-bond test strategy and access plan from MDT-01',
      'Die-level ATPG patterns from DFT-10',
      'ATE-format patterns and debug learning from TEST-08',
      'Link BIST readiness from MDT-02',
      'Final test program structure from TEST-07',
    ],
    rel: {
      'MDT-D3':
        '<b>Stack-level pattern set.</b> The set is ported, fitted to the tester, debugged and released here.',
      'MDT-D4':
        '<b>Known-good-stack criteria.</b> What the patterns cover is what a known-good stack can claim to have been proven against.',
    },
    risks: [
      '<b>Serial access that blows the test time.</b> Patterns pushed through a single wrapper port can take many times longer than on the bare die; the parallel port has to be used or the cost model breaks.',
      '<b>Coverage lost in the retargeting.</b> Faults on the wrapper boundary and on the TSV-connected nets are easy to drop and are exactly the ones a stack adds.',
      '<b>Patterns debugged on a single stack.</b> Failures that depend on which die pair was matched only appear across a population.',
      '<b>Die patterns updated after porting.</b> An ECO on one die silently invalidates the stack set unless the port is rerun from the same source.',
      '<b>Timing of the inter-die scan path ignored.</b> Shift through the stack crosses a bond, and at-speed capture across it needs its own constraints.',
    ],
    roles: [
      { r: 'Test engineer', d: 'Owns porting, debug and release of the set' },
      { r: 'DFT engineer', d: 'Wrapper configuration and pattern retargeting' },
      { r: 'ATE applications engineer', d: 'Tester memory, format and parallel access' },
      { r: 'Product engineer', d: 'Failures on good units and their disposition' },
      { r: 'Test architect', d: 'Approves the set against the coverage targets' },
    ],
    effort: [
      ['Pattern retargeting through the wrapper', 2.5],
      ['Compression and tester fit', 2],
      ['Debug on assembled stacks', 2.5],
      ['Coverage accounting', 1],
      ['Release and version control', 1],
    ],
    entry: [
      'Die-level ATPG patterns closed in DFT-10',
      'Access plan released in MDT-01',
      'First assembled stacks mounted on the load board',
    ],
    exit: [
      'Stack-level set passes on known-good stacks across the population',
      'Coverage per insertion reported against the MDT-01 targets',
      'Pattern set versioned against the die netlists it was ported from',
    ],
    dependsOn: ['MDT-01', 'DFT-10', 'TEST-08'],
    dependsNote: null,
    feedsInto: ['MDT-04', 'MP-07'],
    measuredBy: [
      'Stack-level stuck-at and transition coverage',
      'Test time per stack against the cost model',
      'Pattern failures on good units still open at release',
    ],
    links: {
      dependsOn: ['MDT-01', 'DFT-10', 'DFT-11', 'TEST-08'],
      feedsInto: ['MDT-04', 'MP-07', 'MP-10'],
      runsWith: ['MDT-02'],
      revisedBy: ['TEST-07'],
      feedsBackInto: [],
    },
    terms: ['ATPG', 'IEEE 1838', 'ATE', 'STIL', 'TSV'],
  },

  'MDT-04': {
    criticalPath: false,
    purpose: [
      'Define <b>what makes an assembled stack known good</b>, how stacked parts are binned, and which failures are repaired rather than scrapped.',
      'A stack is not known good because its dies were. Bonds, the link and the repaired lanes all have to pass, and the part has to fall into a bin a customer will accept. These criteria turn test results into a shipping decision, and without them every marginal stack is argued about unit by unit.',
    ],
    flowNote:
      'Step 1 sets the definition and step 2 builds the bins on it. Step 3 runs beside the binning, because what can be repaired changes what a bin means: a stack with one remapped lane may belong in the main bin or in a lower one. Step 4 takes longest because production has to be able to apply the rules without an engineer at the tester.',
    consumes: [
      'Known-good-die criteria from KGD-01',
      'Stack-level pattern set from MDT-03',
      'Link BIST and repair readiness from MDT-02',
      'Stack yield and KGD economics from PART-04',
      'Production test guard-band approach from MP-07',
    ],
    rel: {
      'MDT-D4':
        '<b>Known-good-stack criteria.</b> The criteria, bins and repair dispositions are written and released to production here.',
      'MDT-D5':
        '<b>Test escape and repair yield analysis.</b> The criteria are what an escape is measured against, so the analysis inherits their definitions.',
    },
    risks: [
      '<b>Known good stack defined as two known good dies.</b> The bond and the link are then never part of the decision, and they are where a stack fails.',
      '<b>Repaired stacks binned as untouched ones.</b> A unit that has spent its redundancy has no margin left, and the customer should not get it silently.',
      '<b>Bins that no customer asked for.</b> A speed or power split nobody can sell becomes inventory rather than yield.',
      '<b>Scrap rules written after the first lot.</b> The first disposition decisions then become precedent without a cost behind them.',
      '<b>Criteria that production cannot apply.</b> Rules that need an engineer’s judgement at the tester stop the line at volume.',
    ],
    roles: [
      { r: 'Product engineering', d: 'Owns the KGS definition, bins and dispositions' },
      { r: 'Test engineer', d: 'Implements the bins in the test program' },
      { r: 'Quality engineer', d: 'Outgoing quality and repaired-unit policy' },
      { r: 'Marketing product manager', d: 'Bins the customers will buy' },
      { r: 'Operations director', d: 'Approves the criteria for production' },
    ],
    effort: [
      ['Known-good-stack definition', 1.25],
      ['Binning rules', 1.25],
      ['Repair and scrap disposition', 1],
      ['Production release', 1.5],
    ],
    entry: [
      'Stack-level pattern set in debug from MDT-03',
      'Repair behavior demonstrated in MDT-02',
      'KGD criteria and yield economics available',
    ],
    exit: [
      'Known-good stack defined across dies, bonds, link and repair state',
      'Every bin mapped to a sellable product or a disposition',
      'Criteria implemented in the production test program without manual judgement',
    ],
    dependsOn: ['MDT-03', 'MDT-02', 'KGD-01'],
    dependsNote: null,
    feedsInto: ['MDT-05', 'MP-07'],
    measuredBy: [
      'Stacks dispositioned without engineering review',
      'Known-good-stack yield against the cost model',
      'Units shipped in a bin later found to be wrong',
    ],
    links: {
      dependsOn: ['MDT-03', 'KGD-01', 'PART-04'],
      feedsInto: ['MDT-05', 'MP-07', 'MP-12'],
      runsWith: ['MDT-02'],
      revisedBy: [],
      feedsBackInto: ['KGD-03'],
    },
    terms: ['KGS', 'KGD', 'BISR', 'DPPM'],
  },

  'MDT-05': {
    criticalPath: false,
    purpose: [
      'Find the <b>defects the stacked test flow lets through</b>, name the die, bond or insertion each came from, and measure how much yield the repair scheme actually buys.',
      'On a stacked part an escape has three possible owners and each blames the others. Without attribution the fix lands in the wrong flow, and without the repair yield the redundancy budget agreed in partitioning is never checked against what the line delivers.',
    ],
    flowNote:
      'Step 1 collects the escapes from final test, system test and early returns. Step 2 is the hard one: attribution needs the unit traceability from KGD-04 and the lane maps from MDT-02, or every escape reads as the stack. Step 3 runs beside it on the same data. Step 4 is where the analysis changes something, and it is the longest because the changes land in test, assembly and sort.',
    consumes: [
      'Known-good-stack criteria from MDT-04',
      'Link repair and remap data from MDT-02',
      'Wafer-to-stack traceability from KGD-04',
      'Assembly yield analysis from ASSY-08',
      'Yield learning and failure Pareto from MP-02',
    ],
    rel: {
      'MDT-D5':
        '<b>Test escape and repair yield analysis.</b> The analysis is produced here and closes the loop on the stage’s test decisions.',
    },
    risks: [
      '<b>Escapes attributed to the stack as a whole.</b> Nothing then changes, because no single flow owns the fix.',
      '<b>Traceability broken at the thinning step.</b> A failing stack cannot be traced back to its wafer and die location, and the sort data is useless for the analysis.',
      '<b>Repair yield reported without the units that ran out of redundancy.</b> The scheme looks better than it is, and the budget is never revisited.',
      '<b>Failure analysis queue shared with the SoC program.</b> Stacked parts need destructive FA through the bond, which is slow and gets deprioritized.',
      '<b>Findings reported but not fed back.</b> An analysis that does not change a limit, a pattern or a bond recipe was a report, not a loop.',
    ],
    roles: [
      { r: 'Quality engineer', d: 'Owns escape analysis and the feedback loop' },
      { r: 'Product engineer', d: 'Attribution by die, bond and insertion' },
      { r: 'Failure analysis engineer', d: 'Physical FA through the bond interface' },
      { r: 'Yield engineer', d: 'Repair yield against the redundancy budget' },
      { r: 'Product engineering lead', d: 'Approves the changes fed back into the flows' },
    ],
    effort: [
      ['Escape collection', 1],
      ['Attribution and failure analysis', 2],
      ['Repair yield measurement', 1.25],
      ['Feedback into test, sort and assembly', 1.75],
    ],
    entry: [
      'Known-good-stack criteria released in MDT-04',
      'Unit traceability from wafer to stack in place',
      'Escapes or returns available from final and system test',
    ],
    exit: [
      'Every escape attributed to a die, a bond or an insertion',
      'Repair yield reported against the redundancy budget',
      'Changes agreed and owned in the test, sort and assembly flows',
    ],
    dependsOn: ['MDT-04', 'MDT-02', 'KGD-04'],
    dependsNote: null,
    feedsInto: ['MP-02', 'MP-07'],
    measuredBy: [
      'Escapes attributed against escapes found',
      'Repair yield gain against the redundancy budget',
      'Escape rate in DPPM after the feedback lands',
    ],
    links: {
      dependsOn: ['MDT-04', 'MDT-02', 'KGD-04', 'ASSY-08'],
      feedsInto: ['MP-02', 'MP-07', 'MP-12'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: ['MDT-03', 'KGD-02', 'DCTV-07'],
    },
    terms: ['DPPM', 'FA', 'KGS', 'BISR'],
  },
};
