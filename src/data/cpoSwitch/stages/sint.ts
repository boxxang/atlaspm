/**
 * SINT — System Integration & Traffic Bring-Up. Weeks 154–166; closes on
 * First End-to-End Traffic.
 */
import type { CpoStageModule } from '../types';

export const SINT: CpoStageModule = {
  content: {
    tagline: 'Make the switch forward real traffic through every port, under its own software, at line rate.',
    description:
      'Turn working electrical and optical links into a working switch: bring up the packet datapath, forwarding and buffering, integrate the SDK, network operating system and management plane on silicon, bring up every optical and electrical port, and run the first end-to-end traffic at line rate. Telemetry, diagnostics and health monitoring come up alongside, the system’s thermal and power behavior is measured under real traffic rather than assumed, and laser safety classification and EMC pre-compliance are checked on first-build hardware while design changes are still cheap. Every port or packet that misbehaves is routed to silicon debug. The stage closes on First End-to-End Traffic.',
    activities: [
      'Datapath and forwarding',
      'Software integration',
      'Port bring-up',
      'First traffic',
      'Telemetry and health',
      'Thermal and power under traffic',
      'Laser safety and EMC pre-compliance',
    ],
    deliverables: [
      'Switch datapath and forwarding bring-up report',
      'Integrated SDK, network OS and management plane build for bring-up systems',
      'Port bring-up matrix — link status, BER and error statistics for every optical and electrical port',
      'First end-to-end traffic at line rate report',
      'Telemetry, diagnostics and health monitoring bring-up release',
      'System thermal and power behavior under traffic report',
      'Laser safety classification assessment and EMC pre-compliance report on first-build hardware',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5, 6],
    deliverableWeek: [5, 8, 9, 10, 12, 12, 12],
    engineeringEffort: [8, 12, 10, 6, 8, 5, 5],
    risks: [
      'A handful of bad ports that hold up first traffic on all the others',
      'Software that worked on emulation but not at silicon speed',
      'Optical margin that collapses as the system heats under traffic',
    ],
    potentialRisks: [
      'Datapath brought up only at low rate, so buffer and congestion defects surface at line rate',
      'Network operating system integration left until after first traffic, hiding management plane defects',
      'Port failures blamed on silicon when the cause is a fiber, a connector or a front-panel fixture',
      'First traffic declared on a subset of ports without stating which and why',
      'Optical telemetry reporting values nobody has compared with an instrument',
      'Thermal and power measured idle, with the full-traffic corner left to characterization',
    ],
    leader: { name: 'Adaeze Lindqvist', short: 'A. Lindqvist', phone: '+1 (408) 555-0519', email: 'adaeze.lindqvist@example.com' },
    collaboration: ['Validation', 'Software', 'Firmware', 'Switch ASIC architecture', 'Thermal and mechanical', 'Photonics', 'Board and system hardware'],
    tools: ['Line-rate network traffic generator and analyzer', 'Network operating system test harness', 'Thermal imaging and data logging', 'Power analyzer', 'Anomaly tracking system'],
    programView: [
      'Ports up per type against the total',
      'Traffic loss at line rate per port',
      'Software regression pass rate on silicon',
      'System power and hottest optical engine temperature at full traffic',
    ],
    perspective:
      'First traffic is the first time a co-packaged switch behaves like a product. Declare it honestly — which ports, what rate, what loss — because the ports left out are exactly the ones characterization and the customer will find.',
  },
  steps: {
    'SINT-01': {
      s: [
        [1, 'Initialize the packet pipeline, tables and buffers through the SDK', 1],
        [2, 'Inject packets through internal loopback and verify parsing, lookup and forwarding', 1.5],
        [3, 'Exercise buffering, queuing and the traffic manager at low rate', 1],
        [4, 'Check error counters, drops and memory error correction events under directed tests', 0.5, 1],
        [5, 'Release the datapath bring-up report', 0.5],
      ],
      o: [
        'Packet pipeline, tables and buffers initialized',
        'Forwarding verified through internal loopback',
        'Buffering and queuing results at low rate',
        'Error counter and drop analysis',
        'Switch datapath and forwarding bring-up report',
      ],
      r: [['SINT-D1', 'produces'], ['SINT-D4', 'feeds']],
    },
    'SINT-02': {
      s: [
        [1, 'Port the SDK onto the bring-up systems and reconcile differences between silicon and emulation', 2],
        [2, 'Integrate the network operating system and its switch abstraction layer', 2],
        [3, 'Bring up the management plane — board management, inventory and the firmware update path', 1.5],
        [4, 'Run the software regression on silicon and log failures', 1.5, 1],
        [5, 'Release the integrated software build for bring-up', 0.5],
      ],
      o: [
        'SDK running on silicon with emulation differences resolved',
        'Network operating system integrated',
        'Management plane running with firmware update path',
        'Software regression results on silicon',
        'Integrated software build for bring-up systems',
      ],
      r: [['SINT-D2', 'produces'], ['SINT-D4', 'feeds']],
    },
    'SINT-03': {
      s: [
        [1, 'Bring up every electrical port through the board and front-panel paths with PRBS', 1.5],
        [2, 'Bring up every optical port with calibrated tables and firmware control', 2],
        [3, 'Record link-up, BER and correction statistics per port in the port matrix', 1],
        [4, 'Swap fibers, connectors and units to separate port faults from fixture faults', 1, 1],
        [5, 'Route failing ports to the anomaly board and release the port matrix', 0.5],
      ],
      o: [
        'Electrical port link results',
        'Optical port link results with calibrated settings',
        'Per-port link, BER and correction statistics',
        'Fixture versus port fault separation results',
        'Port bring-up matrix',
      ],
      r: [['SINT-D3', 'produces'], ['SINT-D4', 'feeds']],
    },
    'SINT-04': {
      s: [
        [1, 'Configure the traffic generator for line-rate traffic across a representative port set', 0.5],
        [2, 'Run first end-to-end traffic at line rate and verify zero loss on clean ports', 1],
        [3, 'Scale traffic to every port that passed bring-up', 1.5],
        [4, 'Run mixed packet sizes and congestion patterns and check drops against expectation', 1],
        [5, 'Declare first end-to-end traffic and release the report', 0.5],
      ],
      o: [
        'Traffic generator configuration and port set',
        'First line-rate traffic results',
        'Traffic results across every passing port',
        'Mixed-size and congestion traffic results',
        'First end-to-end traffic at line rate report',
      ],
      r: [['SINT-D4', 'produces'], ['SINT-D6', 'feeds']],
    },
    'SINT-05': {
      s: [
        [1, 'Bring up telemetry collection — port counters, optical monitors, temperatures and power', 2],
        [2, 'Validate optical diagnostics — per-lane power, bias, BER and lock status — against lab instruments', 2],
        [3, 'Implement health thresholds and alarms for optical degradation and thermal events', 1.5],
        [4, 'Stream telemetry to the management plane and measure its load on the control processor', 1, 1],
        [5, 'Release the telemetry and diagnostics build', 0.5],
      ],
      o: [
        'Telemetry collection running on silicon',
        'Optical diagnostics validated against instruments',
        'Health thresholds and alarms',
        'Telemetry streaming and control processor load results',
        'Telemetry, diagnostics and health monitoring release',
      ],
      r: [['SINT-D5', 'produces'], ['SINT-D2', 'feeds']],
    },
    'SINT-06': {
      s: [
        [1, 'Instrument the system — die and optical engine temperatures, rail currents and airflow', 1],
        [2, 'Measure power and temperatures idle, at half load and at full line-rate traffic', 1.5],
        [3, 'Check wavelength lock and optical margin as the optical engines heat under traffic', 1],
        [4, 'Compare with the thermal and power models and flag the gaps', 1, 1],
        [5, 'Release the thermal and power under traffic report', 0.5],
      ],
      o: [
        'Instrumented system with sensor map',
        'Power and temperature at idle, half and full load',
        'Optical lock and margin under thermal load',
        'Model comparison and gap list',
        'System thermal and power behavior under traffic report',
      ],
      r: [['SINT-D6', 'produces']],
    },
    'SINT-07': {
      s: [
        [1, 'Measure accessible optical emission at every port and under fiber-open conditions against the applicable laser safety classification limits', 2],
        [2, 'Verify interlock and automatic power reduction behavior under fault conditions', 1.5],
        [3, 'Run radiated and conducted emissions pre-scans on the first-build system at full traffic', 2, 1],
        [4, 'Run immunity and electrostatic discharge pre-checks on the front panel and fiber ports', 1.5],
        [5, 'Log findings and the design changes needed before formal certification', 1],
        [6, 'Release the classification assessment and pre-compliance report', 0.5],
      ],
      o: [
        'Accessible emission measurements per port',
        'Interlock and power reduction fault test results',
        'Emissions pre-scan results at full traffic',
        'Immunity and discharge pre-check results',
        'Findings and required design change list',
        'Laser safety classification and EMC pre-compliance report',
      ],
      r: [['SINT-D7', 'produces']],
    },
  },
};
