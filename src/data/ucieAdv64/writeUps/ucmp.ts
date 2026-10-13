/**
 * UCMP — Compliance & Interoperability, written up.
 */
import type { UcieWriteUps } from '../types';

export const UCMP_WRITE_UPS: UcieWriteUps = {
  'UCMP-01': {
    criticalPath: false,
    purpose: [
      'Plan compliance and interoperability: <b>every compliance requirement for an Advanced module at 64 GT/s mapped to a test and a pass criterion</b>, the compliance scenarios already run in pre-silicon verification carried over as the protocol test set, partner dies and a shared test vehicle arranged, and the setup proven on a known-good unit.',
      'Compliance is judged requirement by requirement. A mapping written before testing — rather than a list of tests that happened to be run — is what lets the results review say which requirements are covered, which passed and which were waived.',
    ],
    flowNote:
      'Step 1 maps requirements to tests and step 2 carries over the pre-silicon scenarios, with partner dies arranged in parallel in step 3. Step 4 proves the setup and releases the plan.',
    consumes: [
      'Compliance and interoperability targets from UREQ-07',
      'Compliance scenario verification results from UDV-09',
      'First link-up decision and unit allocation from UBUP-06',
      'Characterization plan and corner matrix from UCHR-01',
      'Lab equipment and automation from UTVP-05',
    ],
    rel: {
      'UCMP-D1': '<b>Compliance test plan and test setup record.</b> Produced here; every compliance and interoperability test is run from it.',
      'UCMP-D5': '<b>Compliance results summary and compliance pass record.</b> The requirement mapping is the backbone of the summary.',
    },
    risks: [
      '<b>Requirements unmapped.</b> Tests are run without a link to the requirement each covers.',
      '<b>Pre-silicon work wasted.</b> The scenarios already verified in simulation are rewritten from scratch.',
      '<b>No partner in time.</b> Partner dies are requested when silicon arrives and come too late.',
      '<b>Setup unproven.</b> The first failures are setup errors that consume the schedule.',
      '<b>Units mismatched.</b> Compliance and characterization use different units and results cannot be joined.',
    ],
    roles: [
      { r: 'Compliance and interoperability', d: 'Owns the compliance and interoperability plan' },
      { r: 'Design verification engineer', d: 'Pre-silicon compliance scenarios' },
      { r: 'Validation engineer', d: 'Test setup and units' },
      { r: 'Customer engineering manager', d: 'Partner die arrangements' },
      { r: 'Program manager', d: 'Approves the plan' },
    ],
    effort: [
      ['Requirement mapping', 0.75],
      ['Scenario carry-over', 0.25],
      ['Partner arrangements', 0.5],
      ['Setup proving and release', 0.5],
    ],
    entry: [
      'Compliance targets baselined in UREQ-07',
      'Pre-silicon compliance scenarios closed in UDV-09',
      'Units allocated to compliance at the first link-up review',
    ],
    exit: [
      'Every compliance requirement in scope mapped to a test with a pass criterion',
      'At least one partner die and a shared test vehicle committed with a delivery date',
      'Test setup proven on a known-good unit with a recorded baseline result',
    ],
    dependsOn: ['UREQ-07', 'UDV-09', 'UBUP-06'],
    dependsNote: null,
    feedsInto: ['UCMP-02', 'UCMP-03', 'UCMP-04', 'UCMP-05'],
    measuredBy: [
      'Requirements with a mapped test',
      'Partner dies committed',
      'Setup issues found on the known-good unit',
    ],
    links: {
      dependsOn: ['UREQ-07', 'UDV-09', 'UBUP-06', 'UCHR-01', 'UTVP-05'],
      feedsInto: ['UCMP-02', 'UCMP-03', 'UCMP-04', 'UCMP-05'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Compliance', 'Interoperability'],
  },
  'UCMP-02': {
    criticalPath: true,
    purpose: [
      'Test <b>electrical compliance at 64 GT/s</b>: transmitter parameters per lane against the compliance limits, receiver tolerance with stressed signals through the loopback modes, fixture contributions de-embedded, and the worst-case units from characterization re-tested.',
      'Electrical compliance is where the front-end design is held to the specification’s numbers rather than the design team’s. Testing the worst-case units, not the best, is what makes a pass meaningful to a licensee with a worse channel.',
    ],
    flowNote:
      'Step 1 measures transmitter parameters and step 2 receiver tolerance, with de-embedding run in parallel in step 3. Step 4 repeats on the worst-case units and step 5 releases the results.',
    consumes: [
      'Compliance test plan and setup from UCMP-01',
      'Per-lane margin data from UCHR-02',
      'BER measurement report from UCHR-03',
      'Loopback modes from UDFT-04',
      'Compliance targets from UREQ-07',
    ],
    rel: {
      'UCMP-D2': '<b>Electrical compliance test results at 64 GT/s.</b> Produced here; it records every electrical requirement’s result.',
      'UCMP-D5': '<b>Compliance results summary and compliance pass record.</b> Electrical results feed the pass decision.',
    },
    risks: [
      '<b>Fixture fails good silicon.</b> Fixture loss is not removed and lanes near the limit fail.',
      '<b>Best units only.</b> Compliance is run on golden units and the worst-case units are never tested.',
      '<b>Loopback not representative.</b> Receiver tolerance through loopback misses the forwarded clock path used in the link.',
      '<b>Limits misread.</b> Limits for a different package type or rate are applied.',
      '<b>Late failures.</b> A failure needs a silicon change that cannot reach GA.',
    ],
    roles: [
      { r: 'Compliance and interoperability', d: 'Owns electrical compliance testing' },
      { r: 'Analog and mixed-signal designer', d: 'Interpretation of failures near limits' },
      { r: 'DFT engineer', d: 'Loopback modes' },
      { r: 'SI/PI engineer', d: 'Fixture de-embedding' },
      { r: 'Validation lead', d: 'Accepts the electrical results' },
    ],
    effort: [
      ['Transmitter measurements', 2],
      ['Receiver tolerance', 2],
      ['De-embedding', 0.5],
      ['Worst-case units', 1],
      ['Release', 0.5],
    ],
    entry: [
      'Compliance plan released in UCMP-01',
      'Worst-case units identified in characterization',
      'Fixture characterized for de-embedding',
    ],
    exit: [
      'Every electrical compliance requirement in scope measured on every lane and recorded as pass, fail or waived',
      'Results recorded on at least the nominal and the worst-case units from characterization',
      'Every failure has a root-cause hypothesis and an owner',
    ],
    dependsOn: ['UCMP-01', 'UCHR-02', 'UDFT-04'],
    dependsNote: null,
    feedsInto: ['UCMP-05'],
    measuredBy: [
      'Electrical requirements passed',
      'Worst-case margin to compliance limits',
      'Failures open',
    ],
    links: {
      dependsOn: ['UCMP-01', 'UCHR-02', 'UCHR-03', 'UDFT-04', 'UREQ-07'],
      feedsInto: ['UCMP-05', 'UGA-02'],
      runsWith: ['UCMP-03'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Compliance', 'Loopback', 'Forwarded clock'],
  },
  'UCMP-03': {
    criticalPath: true,
    purpose: [
      'Test <b>link training and protocol compliance</b>: sideband messages and register access from both dies, the training state sequence through SBINIT, MBINIT, MBTRAIN and LINKINIT, lane repair and reversal handshakes, error and retrain behavior, low-power entry and exit and Raw and Flit mode negotiation.',
      'Another vendor’s die will follow the specification’s state machine, not this IP’s interpretation of it. Testing the sequence and handshakes as the specification defines them is what turns a link that trains with itself into one that trains with anyone.',
    ],
    flowNote:
      'Step 1 tests sideband and register access and step 2 the training sequence, with repair, reversal, error and retrain behavior tested in parallel in step 3. Step 4 tests low-power and mode negotiation and step 5 releases the results.',
    consumes: [
      'Compliance test plan and protocol test set from UCMP-01',
      'Compliance scenario verification results from UDV-09',
      'Link training state machine from URTL-05',
      'Sideband link-up record from UBUP-02',
      'Lane repair and reversal silicon results from UCHR-06',
    ],
    rel: {
      'UCMP-D3': '<b>Link training and protocol compliance test results.</b> Produced here; it records the protocol behavior against each requirement.',
      'UCMP-D5': '<b>Compliance results summary and compliance pass record.</b> Training and protocol results feed the pass decision.',
    },
    risks: [
      '<b>Self-consistent but wrong.</b> Both dies share the same misinterpretation and the link trains anyway.',
      '<b>One initiator.</b> Sequences are tested only with one die leading.',
      '<b>Error paths skipped.</b> Only the happy path is tested and TRAINERROR recovery is never seen.',
      '<b>Mode negotiation untested.</b> Raw and Flit mode selection is assumed from configuration.',
      '<b>Captures unread.</b> Sideband captures are stored but never checked message by message.',
    ],
    roles: [
      { r: 'Compliance and interoperability', d: 'Owns training and protocol compliance testing' },
      { r: 'RTL designer', d: 'Training and sideband behavior' },
      { r: 'Design verification engineer', d: 'Mapping to pre-silicon scenarios' },
      { r: 'Validation engineer', d: 'Protocol capture and units' },
      { r: 'Validation lead', d: 'Accepts the protocol results' },
    ],
    effort: [
      ['Sideband and register access', 1.25],
      ['Training state sequence', 1.75],
      ['Repair, reversal, error and retrain', 1.5],
      ['Low-power and mode negotiation', 1],
      ['Release', 0.5],
    ],
    entry: [
      'Protocol test set carried over in UCMP-01',
      'Sideband capture available on the test setup',
      'Repair and reversal behavior characterized in UCHR-06',
    ],
    exit: [
      'Every training and protocol requirement in scope tested with either die as initiator',
      'Error injection reaches TRAINERROR and PHYRETRAIN and recovery is recorded',
      'Every failure has a root-cause hypothesis and an owner',
    ],
    dependsOn: ['UCMP-01', 'UDV-09', 'URTL-05'],
    dependsNote: null,
    feedsInto: ['UCMP-04', 'UCMP-05'],
    measuredBy: [
      'Protocol requirements passed',
      'Error paths exercised',
      'Failures open',
    ],
    links: {
      dependsOn: ['UCMP-01', 'UDV-09', 'URTL-05', 'UBUP-02', 'UCHR-06'],
      feedsInto: ['UCMP-04', 'UCMP-05'],
      runsWith: ['UCMP-02'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['SBINIT', 'MBINIT', 'MBTRAIN', 'LINKINIT', 'TRAINERROR', 'Sideband', 'Raw mode'],
  },
  'UCMP-04': {
    criticalPath: true,
    purpose: [
      'Prove <b>interoperability with other UCIe dies</b>: link bring-up with each partner die from either side as initiator, Flit and Raw mode traffic across the partner link with errors and retries counted, joint recovery from injected errors and forced retrains, and low-power entry and exit across the link.',
      'Interoperability is the claim licensees value most and can least check themselves. Two different implementations agreeing on training, repair and recovery is the strongest evidence the IP follows the specification rather than its own test bench.',
    ],
    flowNote:
      'Step 1 brings up each partner link from either side. Step 2 runs traffic while step 3 injects errors and forced retrains in parallel. Step 4 exercises low-power states and step 5 releases the report.',
    consumes: [
      'Compliance plan and partner die arrangements from UCMP-01',
      'First link-up and data transfer record from UBUP-04',
      'Training and protocol compliance results from UCMP-03',
      'Compliance and interoperability targets from UREQ-07',
      'Partner dies and the shared test vehicle provided by the interoperability partners',
    ],
    rel: {
      'UCMP-D4': '<b>Interoperability test report with partner dies.</b> Produced here; the silicon report and customer collateral cite it.',
      'UCMP-D5': '<b>Compliance results summary and compliance pass record.</b> Interoperability results feed the pass decision.',
    },
    risks: [
      '<b>Self-interop only.</b> No partner die arrives and two copies of the same IP are reported as interoperability.',
      '<b>One-sided bring-up.</b> The link is brought up only with this IP as initiator.',
      '<b>Traffic too short.</b> A few minutes of traffic is reported as interoperable.',
      '<b>Recovery untested.</b> Joint error recovery is assumed rather than forced.',
      '<b>Package mismatch.</b> The partner die sits on a different package technology and results do not transfer.',
    ],
    roles: [
      { r: 'Compliance and interoperability', d: 'Owns interoperability testing' },
      { r: 'Partner engineering contact', d: 'Partner die configuration and debug' },
      { r: 'Validation engineer', d: 'Traffic and error injection' },
      { r: 'Packaging engineer', d: 'Shared test vehicle' },
      { r: 'Customer engineering lead', d: 'Use of results with licensees' },
    ],
    effort: [
      ['Partner link bring-up', 2],
      ['Traffic across partner links', 2.5],
      ['Joint error and retrain recovery', 1.5],
      ['Low-power across partner links', 1],
      ['Report', 1],
    ],
    entry: [
      'Partner dies on the shared test vehicle delivered',
      'Training and protocol compliance largely passed in UCMP-03',
      'Error injection available on both sides of the link',
    ],
    exit: [
      'Link trained with each partner die from either side as initiator',
      'Flit and Raw traffic run across each partner link with error and retry counts recorded',
      'Joint recovery from injected errors and forced retrains shown on each partner link',
    ],
    dependsOn: ['UCMP-01', 'UBUP-04', 'UCMP-03'],
    dependsNote: 'Partner dies come from outside the program, so their arrangement is part of the plan in UCMP-01.',
    feedsInto: ['UCMP-05'],
    measuredBy: [
      'Partners linked',
      'Traffic hours per partner',
      'Recovery scenarios passed',
    ],
    links: {
      dependsOn: ['UCMP-01', 'UBUP-04', 'UCMP-03', 'UREQ-07'],
      feedsInto: ['UCMP-05', 'UGA-02', 'UCUS-04'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Interoperability', 'Flit', 'Raw mode', 'Retry'],
  },
  'UCMP-05': {
    criticalPath: true,
    purpose: [
      'Hold the <b>compliance results review</b>: compliance and interoperability results collected against the requirement mapping, failures and waivers reviewed with design and customer engineering, and the compliance pass decision recorded.',
      'A pass is only as good as the record behind it. Writing down every waiver, the requirement it covers and why it is acceptable is what lets customer engineering answer a licensee’s compliance questions without reopening the lab notes.',
    ],
    flowNote:
      'Step 1 collects results against the requirement mapping. Step 2 reviews failures and waivers. Step 3 records the decision and releases the summary.',
    consumes: [
      'Compliance test plan and requirement mapping from UCMP-01',
      'Electrical compliance results from UCMP-02',
      'Training and protocol compliance results from UCMP-03',
      'Interoperability report from UCMP-04',
      'Compliance and interoperability targets from UREQ-07',
    ],
    rel: {
      'UCMP-D5': '<b>Compliance results summary and compliance pass record.</b> Produced here; it closes the Compliance Pass gate.',
    },
    risks: [
      '<b>Waivers unrecorded.</b> Waived requirements are not listed and resurface with licensees.',
      '<b>Pass on partial coverage.</b> The pass is declared with requirements still untested.',
      '<b>Failures deferred silently.</b> Open failures are moved to sustaining without a decision.',
      '<b>Customer view missing.</b> The summary is not usable by customer engineering.',
      '<b>No link to GA.</b> The GA review does not see which waivers apply to the release.',
    ],
    roles: [
      { r: 'Compliance and interoperability', d: 'Owns the compliance results review' },
      { r: 'Analog and mixed-signal lead', d: 'Electrical failures and waivers' },
      { r: 'RTL design lead', d: 'Protocol failures and waivers' },
      { r: 'Customer engineering lead', d: 'Waiver acceptability for licensees' },
      { r: 'Quality manager', d: 'Approves the Compliance Pass gate' },
    ],
    effort: [
      ['Collecting results', 0.5],
      ['Failure and waiver review', 0.5],
      ['Decision and summary', 0.5],
    ],
    entry: [
      'Electrical, protocol and interoperability results released',
      'Requirement mapping current',
      'Reviewers from design and customer engineering named',
    ],
    exit: [
      'Every requirement in scope recorded as passed, failed or waived with a reason',
      'Every waiver approved with its effect on the release stated',
      'Compliance pass decision recorded and handed to the GA review',
    ],
    dependsOn: ['UCMP-01', 'UCMP-02', 'UCMP-03', 'UCMP-04'],
    dependsNote: null,
    feedsInto: ['UGA-05'],
    measuredBy: [
      'Requirements passed against total',
      'Waivers granted',
      'Failures open at the gate',
    ],
    links: {
      dependsOn: ['UCMP-01', 'UCMP-02', 'UCMP-03', 'UCMP-04', 'UREQ-07'],
      feedsInto: ['UGA-02', 'UGA-05', 'UCUS-04'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Compliance', 'GA'],
  },
};
