/**
 * UCMP — Compliance & Interoperability, written up.
 */
import type { UcieWriteUps } from '../types';

export const UCMP_WRITE_UPS: UcieWriteUps = {
  'UCMP-01': {
    criticalPath: false,
    purpose: [
      'Plan compliance and interoperability: <b>every compliance requirement for an Advanced module at 64 GT/s mapped to a test, the register controls it drives and a pass criterion</b>, the pre-silicon compliance scenarios carried over as the protocol test set, the reference die and partner die units confirmed on their test vehicle sites, and the sideband-driven setup proven on a known-good unit.',
      'Compliance is judged requirement by requirement, and on an Advanced package it is run over the sideband against a reference die rather than with probes. A mapping written before testing — naming which compliance register each test drives — is what lets the results review say which requirements are covered, which passed and which were waived.',
    ],
    flowNote:
      'Step 1 maps requirements to tests and step 2 carries over the pre-silicon scenarios, with the reference and partner dies confirmed in parallel in step 3. Step 4 proves the setup and releases the plan.',
    consumes: [
      'Compliance and interoperability targets from UREQ-07',
      'Compliance scenario verification results from UDV-09',
      'Reference and partner die agreement and mated bump map from UTEC-07',
      'Test vehicle variants with reference and partner die sites from UTVP-01',
      'First link-up decision and unit allocation from UBUP-06',
    ],
    rel: {
      'UCMP-D1': '<b>Compliance test plan and reference-die test setup record.</b> Produced here; every compliance and interoperability test is run from it.',
      'UCMP-D5': '<b>Compliance results summary and compliance pass record.</b> The requirement mapping is the backbone of the summary.',
    },
    risks: [
      '<b>Requirements unmapped.</b> Tests are run without a link to the requirement each covers.',
      '<b>Pre-silicon work wasted.</b> The scenarios already verified in simulation are rewritten from scratch.',
      '<b>Reference die missing.</b> The reference die secured at technology selection is not on an assembled variant when testing starts.',
      '<b>Setup unproven.</b> The first failures are sideband scripting errors that consume the schedule.',
      '<b>Units mismatched.</b> Compliance and characterization use different units and results cannot be joined.',
    ],
    roles: [
      { r: 'Compliance and interoperability', d: 'Owns the compliance and interoperability plan' },
      { r: 'Design verification engineer', d: 'Pre-silicon compliance scenarios' },
      { r: 'Validation engineer', d: 'Test setup and units' },
      { r: 'Packaging engineer', d: 'Reference and partner die sites on the test vehicle' },
      { r: 'Program manager', d: 'Approves the plan' },
    ],
    effort: [
      ['Requirement mapping', 0.75],
      ['Scenario carry-over', 0.25],
      ['Reference and partner die confirmation', 0.5],
      ['Setup proving and release', 0.5],
    ],
    entry: [
      'Compliance targets baselined in UREQ-07',
      'Pre-silicon compliance scenarios closed in UDV-09',
      'Reference and partner die units assembled on test vehicle variants from UFAB-03',
    ],
    exit: [
      'Every compliance requirement in scope mapped to a test, its register controls and a pass criterion',
      'Reference die and partner die units linked to the device under test on at least one variant each',
      'Sideband-driven test setup proven on a known-good unit with a recorded baseline result',
    ],
    dependsOn: ['UREQ-07', 'UDV-09', 'UBUP-06', 'UTEC-07'],
    dependsNote: 'The partner and reference die were secured at technology selection and built into the test vehicle; this plan only confirms them.',
    feedsInto: ['UCMP-02', 'UCMP-03', 'UCMP-04', 'UCMP-05'],
    measuredBy: [
      'Requirements with a mapped test',
      'Reference and partner die units linked',
      'Setup issues found on the known-good unit',
    ],
    links: {
      dependsOn: ['UREQ-07', 'UDV-09', 'UBUP-06', 'UTEC-07', 'UTVP-01', 'UFAB-03', 'UCHR-01', 'UTVP-05'],
      feedsInto: ['UCMP-02', 'UCMP-03', 'UCMP-04', 'UCMP-05'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Compliance', 'Interoperability', 'Reference die'],
  },
  'UCMP-02': {
    criticalPath: true,
    purpose: [
      'Test <b>electrical compliance against a reference die over the sideband</b>: the device under test linked to a known-good reference die over a known-good bridge or interposer, per-lane voltage and timing margin from the on-die margining, per-lane BER and lane-to-lane skew at 64 GT/s, and the transmitter equalization settings, all driven by compliance software over the sideband, repeated on the worst-case units and each package variant.',
      'The die-to-die bumps sit under the other die and never reach a pin, so there is nothing to probe. Compliance is measured the way the specification intends for an Advanced package: by the dies themselves, against a reference die whose behavior is known, which is also the only way a licensee can repeat the test on their own product.',
    ],
    flowNote:
      'Step 1 links the device to the reference die. Step 2 measures margins while step 3 measures BER and skew in parallel. Step 4 checks transmitter equalization, step 5 repeats on worst-case units and variants and step 6 releases the results.',
    consumes: [
      'Compliance test plan and setup from UCMP-01',
      'Eye and lane margining functions from UDFT-06',
      'Compliance control registers in the Adapter from URTL-02',
      'Per-lane margins and worst-case units from UCHR-02',
      'Reference die units and assembled variants from UTVP-02',
    ],
    rel: {
      'UCMP-D2': '<b>Electrical compliance test results at 64 GT/s against the reference die.</b> Produced here; the GA release and the silicon report quote it.',
      'UCMP-D5': '<b>Compliance results summary and compliance pass record.</b> Electrical results and waivers are a section of the summary.',
    },
    risks: [
      '<b>Reference die not known-good.</b> A marginal reference die fails good silicon.',
      '<b>Uncalibrated margining.</b> On-die margin steps are compared with limits without the calibration done in characterization.',
      '<b>Short BER runs.</b> BER is counted for too short a time to support a pass at the target.',
      '<b>One variant only.</b> Compliance is shown on one package variant and claimed for all.',
      '<b>Equalization unchecked.</b> The transmitter equalization settings licensees will use are not the ones tested.',
    ],
    roles: [
      { r: 'Compliance and interoperability', d: 'Owns electrical compliance testing' },
      { r: 'Validation engineer', d: 'Sideband-driven margin and BER runs' },
      { r: 'DFT engineer', d: 'Margining and compliance access' },
      { r: 'Analog and mixed-signal designer', d: 'Transmitter equalization settings and electrical failures' },
      { r: 'Compliance lead', d: 'Accepts the electrical results' },
    ],
    effort: [
      ['Reference-die link and sideband control', 0.8],
      ['Margin measurement', 1.6],
      ['BER and lane-to-lane skew', 1.6],
      ['Transmitter equalization', 0.8],
      ['Worst-case units, variants and release', 1.2],
    ],
    entry: [
      'Compliance plan and reference-die setup released in UCMP-01',
      'On-die margining calibrated in characterization',
      'Compliance control registers verified in UDV-09',
    ],
    exit: [
      'Margin, BER and lane-to-lane skew recorded per lane against the compliance limits on every allocated unit',
      'Transmitter equalization settings tested with the margin the reference die receives',
      'Results recorded per package variant, with every failure opened against a requirement',
    ],
    dependsOn: ['UCMP-01', 'UCHR-02', 'URTL-02', 'UDFT-06'],
    dependsNote: null,
    feedsInto: ['UCMP-05'],
    measuredBy: [
      'Electrical requirements passed per lane',
      'Worst-lane margin against the limit',
      'Package variants tested',
    ],
    links: {
      dependsOn: ['UCMP-01', 'UCHR-02', 'UCHR-03', 'URTL-02', 'UDFT-06', 'UTVP-02', 'UREQ-07'],
      feedsInto: ['UCMP-05', 'UGA-02'],
      runsWith: ['UCMP-03'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['Compliance', 'Reference die', 'Margining', 'Equalization'],
  },
  'UCMP-03': {
    criticalPath: false,
    purpose: [
      'Test <b>link training and protocol compliance</b>: sideband messages and register access from both dies, the training state sequence through SBINIT, MBINIT, MBTRAIN and LINKINIT against the reference die, test and NOP Flit, link-state request and retry injection through the compliance control registers, lane repair and reversal handshakes, error and retrain behavior, low-power entry and exit and Flit format and protocol negotiation.',
      'Protocol compliance is judged on how the IP responds to what the specification can inject. The compliance control registers exist so that each injected Flit, link-state request and retry can be driven from the sideband and its response checked — without them a whole class of requirements can only be waived.',
    ],
    flowNote:
      'Step 1 tests sideband and register access. Step 2 runs the training sequence while step 3 drives the injection registers in parallel. Step 4 tests repair, reversal, retrain, low power and negotiation, and step 5 releases the results.',
    consumes: [
      'Compliance test plan and protocol test set from UCMP-01',
      'Compliance scenario verification results from UDV-09',
      'Link training state machine from URTL-05',
      'Compliance control registers in the Adapter from URTL-02',
      'Compliance and debug hooks from UDFT-07',
    ],
    rel: {
      'UCMP-D3': '<b>Link training and protocol compliance test results.</b> Produced here.',
      'UCMP-D5': '<b>Compliance results summary and compliance pass record.</b> Protocol results and waivers are a section of the summary.',
    },
    risks: [
      '<b>One initiator.</b> Training is tested only with the device under test as initiator.',
      '<b>Injection gaps.</b> An injection the specification requires is missing from the compliance registers and the requirement is waived.',
      '<b>Negotiation untested.</b> Flit format and protocol negotiation is only exercised for the default format.',
      '<b>Retrain from idle only.</b> Retrain is tested without traffic and fails under load.',
      '<b>Low-power exit untested at speed.</b> L1 and L2 exit is checked at a low data rate.',
    ],
    roles: [
      { r: 'Compliance and interoperability', d: 'Owns training and protocol compliance' },
      { r: 'RTL designer', d: 'Training, Adapter and compliance register behavior' },
      { r: 'Design verification engineer', d: 'Pre-silicon scenario mapping' },
      { r: 'Validation engineer', d: 'Sideband capture and scripts' },
      { r: 'Compliance lead', d: 'Accepts the protocol results' },
    ],
    effort: [
      ['Sideband and register access tests', 1.2],
      ['Training sequence tests', 1.6],
      ['Injection through compliance registers', 1.4],
      ['Repair, retrain, low power and negotiation', 1.2],
      ['Release', 0.6],
    ],
    entry: [
      'Protocol test set released in UCMP-01',
      'Compliance control registers verified in UDV-09',
      'Reference die linked and sideband control proven',
    ],
    exit: [
      'Every training and protocol requirement in scope tested with each die as initiator',
      'Every specified injection driven through the compliance registers and its response recorded',
      'Every failure opened against its requirement with a cause',
    ],
    dependsOn: ['UCMP-01', 'UDV-09', 'URTL-05', 'URTL-02'],
    dependsNote: null,
    feedsInto: ['UCMP-04', 'UCMP-05'],
    measuredBy: [
      'Protocol requirements passed',
      'Injections driven against those specified',
      'Requirements waived for lack of a control',
    ],
    links: {
      dependsOn: ['UCMP-01', 'UDV-09', 'URTL-05', 'URTL-02', 'UDFT-07', 'UBUP-02', 'UCHR-06'],
      feedsInto: ['UCMP-04', 'UCMP-05'],
      runsWith: ['UCMP-02'],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['SBINIT', 'MBINIT', 'MBTRAIN', 'LINKINIT', 'TRAINERROR', 'Sideband', 'Flit'],
  },
  'UCMP-04': {
    criticalPath: true,
    purpose: [
      'Prove <b>interoperability with the partner’s UCIe die</b>: link bring-up on the shared test vehicle from either side as initiator, Flit format and Raw format traffic across the partner link with errors and retries counted, joint recovery from injected errors and forced retrains, and low-power entry and exit across the link.',
      'On an advanced package a partner die has to sit on the same bridge or interposer with a bump map that mates, so interoperability was planned at technology selection and built into the test vehicle rather than arranged when silicon arrived. This activity collects the payoff: a link between two independent implementations, which is what licensees ask about first.',
    ],
    flowNote:
      'Step 1 brings the partner link up from both sides. Step 2 runs traffic while step 3 injects errors and retrains in parallel. Step 4 exercises low power and step 5 releases the report.',
    consumes: [
      'Compliance test plan from UCMP-01',
      'Partner die agreement and mated bump map from UTEC-07',
      'Partner die supply and assembled shared test vehicle from UTVP-02',
      'First link-up on the device under test from UBUP-04',
      'Training and protocol compliance results from UCMP-03',
    ],
    rel: {
      'UCMP-D4': '<b>Interoperability test report with the partner die.</b> Produced here; the GA release and customer engineering cite it.',
      'UCMP-D5': '<b>Compliance results summary and compliance pass record.</b> Interoperability results are a section of the summary.',
    },
    risks: [
      '<b>Partner silicon late.</b> The partner’s die arrives after the window and interoperability slips past GA.',
      '<b>Self-interop only.</b> The only links run are between two copies of this IP.',
      '<b>One-way training.</b> The link trains only when this IP initiates.',
      '<b>Recovery untested.</b> Errors are not injected across the partner link, so joint recovery is unknown.',
      '<b>Partner findings unshared.</b> Issues found on the partner side are not fed back under the agreement.',
    ],
    roles: [
      { r: 'Compliance and interoperability', d: 'Owns interoperability testing' },
      { r: 'Partner engineering contact', d: 'Partner die behavior and fixes' },
      { r: 'Validation engineer', d: 'Link bring-up and traffic' },
      { r: 'RTL designer', d: 'Training and Adapter interaction across implementations' },
      { r: 'Customer engineering lead', d: 'Accepts the interoperability claim' },
    ],
    effort: [
      ['Partner link bring-up', 2],
      ['Traffic runs', 2.5],
      ['Error and retrain recovery', 1.5],
      ['Low-power across the link', 1],
      ['Report', 1],
    ],
    entry: [
      'Partner die assembled on the shared test vehicle',
      'Device under test linked up in UBUP-04',
      'Partner contact and issue-sharing terms in place from UTEC-07',
    ],
    exit: [
      'Partner link trained at 64 GT/s with each die as initiator',
      'Flit and Raw format traffic run across the partner link for the planned duration with errors and retries recorded',
      'Joint recovery from injected errors and forced retrains shown, and partner-side issues shared',
    ],
    dependsOn: ['UCMP-01', 'UBUP-04', 'UCMP-03', 'UTEC-07'],
    dependsNote: 'The partner was secured at technology selection; this activity cannot recover a partner that was not.',
    feedsInto: ['UCMP-05'],
    measuredBy: [
      'Partner links trained',
      'Traffic hours across the partner link',
      'Joint recovery cases passed',
    ],
    links: {
      dependsOn: ['UCMP-01', 'UBUP-04', 'UCMP-03', 'UREQ-07', 'UTEC-07', 'UTVP-02', 'UFAB-03'],
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
      'Interoperability report with the partner die from UCMP-04',
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
