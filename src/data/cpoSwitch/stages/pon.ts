/**
 * PON — Power-On & Electrical Bring-Up. Weeks 140–148; closes on First
 * Electrical Link.
 */
import type { CpoStageModule } from '../types';

export const PON: CpoStageModule = {
  content: {
    tagline: 'Power the first packages safely, get the silicon talking, and close the first electrical link.',
    description:
      'Bring the first packaged switches to life on their validation boards — electrical-only packages first, so power-on does not wait for optical assembly: the bring-up plan executed on a daily cadence against its pass criteria, safe first power-on and rail verification, debug access and boot, clocks, resets and register access on every die, then die-to-die and SerDes link training through loopback and PRBS to a first electrical link. Nothing assumes the silicon is healthy — every deviation is logged, reproduced and handed to the silicon debug board from the first day. The stage closes on First Electrical Link, the point where optical bring-up has a working electrical path to drive.',
    activities: ['Daily bring-up execution', 'First power-on', 'Boot and firmware', 'Clock, reset, registers', 'First electrical link', 'Anomaly intake'],
    deliverables: [
      'Bring-up execution tracker and daily status record',
      'First power-on and rail verification report',
      'Bring-up firmware image and first boot log',
      'Clock, reset and register access verification record',
      'First electrical link report — die-to-die and SerDes training, loopback and PRBS results',
      'Initial silicon anomaly register and triage record',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5],
    deliverableWeek: [2, 3, 5, 5, 8, 8],
    engineeringEffort: [4, 4, 6, 4, 10, 4],
    risks: [
      'A first power-on that damages one of the few good units',
      'Link training blocked by a silicon bug with no firmware workaround',
      'Anomalies fixed in the lab and never recorded',
    ],
    potentialRisks: [
      'Rails ramped without current limits on a package whose shorts were not screened at package test',
      'Debug access that depends on the same firmware being brought up, leaving no way in when boot fails',
      'Register access proven through one path only, masking a management interface defect',
      'Die-to-die links that train at reduced rate and are declared up without a BER measurement',
      'Channel loss on the validation board mistaken for SerDes margin loss',
      'Bring-up workarounds kept in engineers’ scripts instead of the anomaly register and the firmware',
    ],
    leader: { name: 'Priya Castellanos', short: 'P. Castellanos', phone: '+1 (408) 555-0517', email: 'priya.castellanos@example.com' },
    collaboration: ['Validation', 'Board and system hardware', 'Firmware', 'SerDes and high-speed I/O', 'DFT', 'Switch ASIC architecture'],
    tools: ['Debug probe and boundary scan', 'Bit error rate tester', 'High-bandwidth oscilloscope', 'Programmable power supplies with current limit', 'Anomaly tracking system'],
    programView: [
      'Bring-up steps passed against the plan, day by day',
      'Units powered and units lost',
      'Lanes trained per link type',
      'Open anomalies by severity',
    ],
    perspective:
      'Bring-up is a race that rewards patience. The unit damaged by a rushed first power-on costs more schedule than a day spent checking the board on a dummy package, and every anomaly written down on day one is one the debug board does not have to rediscover in month three.',
  },
  steps: {
    'PON-01': {
      s: [
        [1, 'Assign units, systems and owners to every step of the certified bring-up plan', 0.5],
        [2, 'Run the daily bring-up stand-up — results per step, blockers, unit status and anomalies filed', 1],
        [3, 'Rebalance units and labs as steps pass or block, keeping electrical-only packages on electrical steps', 0.5, 1],
        [4, 'Publish the daily bring-up status against the plan and the gate dates', 0.5],
      ],
      o: [
        'Unit, system and owner assignment per step',
        'Daily stand-up record with blockers',
        'Unit and lab reallocation log',
        'Bring-up execution tracker and daily status record',
      ],
      r: [['PON-D1', 'produces'], ['PON-D2', 'feeds']],
    },
    'PON-02': {
      s: [
        [1, 'Power the board without the package and verify every rail, sequence and protection', 0.5],
        [2, 'Apply first power to the package with current limits, watching for shorts and thermal runaway', 0.5],
        [3, 'Verify rail voltage, ripple and power-up sequencing at the package against the specification', 1],
        [4, 'Measure idle current per rail and compare it with the power model', 0.5, 1],
        [5, 'Release the power-on report and the safe power-up procedure', 0.5],
      ],
      o: [
        'Board rails verified without the package',
        'First power applied with current profile recorded',
        'Rail voltage, ripple and sequencing measurements',
        'Idle current per rail against the power model',
        'First power-on and rail verification report',
      ],
      r: [['PON-D2', 'produces'], ['PON-D6', 'feeds']],
    },
    'PON-03': {
      s: [
        [1, 'Gain debug access through the test access port and confirm the scan chain and device identifiers', 0.5],
        [2, 'Run the boot ROM path through to the first-stage loader', 1],
        [3, 'Bring up the management firmware and its console', 1],
        [4, 'Exercise the secure boot path in debug mode with development keys', 0.5, 1],
        [5, 'Release the bring-up firmware image and boot log', 0.5],
      ],
      o: [
        'Debug access confirmed with device identifiers',
        'Boot ROM to first-stage loader log',
        'Management firmware running with console',
        'Secure boot path exercised with development keys',
        'Bring-up firmware image and first boot log',
      ],
      r: [['PON-D3', 'produces'], ['PON-D6', 'feeds']],
    },
    'PON-04': {
      s: [
        [1, 'Verify reference clocks, PLL lock and generated clock frequencies on every die', 0.5],
        [2, 'Verify reset sequencing and release order across the dies', 0.5],
        [3, 'Walk the register map — read defaults, write and read back every block through debug and management paths', 1],
        [4, 'Run in-system memory BIST and scan to confirm every die is alive', 0.5, 1],
        [5, 'Release the clock, reset and register access record', 0.5],
      ],
      o: [
        'Clock and PLL lock measurements per die',
        'Reset sequencing verification',
        'Register map read and write-back results',
        'In-system memory BIST and scan results',
        'Clock, reset and register access verification record',
      ],
      r: [['PON-D4', 'produces'], ['PON-D5', 'feeds']],
    },
    'PON-05': {
      s: [
        [1, 'Train the die-to-die links and run their built-in PRBS checks', 1],
        [2, 'Run SerDes internal and near-end loopback with PRBS on every lane', 1],
        [3, 'Tune equalization and run link training across the board channel', 1.5],
        [4, 'Measure pre-correction bit error rate per lane and compare it with the channel model', 1],
        [5, 'Declare first electrical link and release the report', 0.5],
      ],
      o: [
        'Die-to-die link training and PRBS results',
        'SerDes loopback PRBS results per lane',
        'Equalization settings and trained link state',
        'Bit error rate per lane against the channel model',
        'First electrical link report',
      ],
      r: [['PON-D5', 'produces'], ['PON-D6', 'feeds']],
    },
    'PON-06': {
      s: [
        [1, 'Stand up anomaly intake — template, severity scale, required data and ownership', 0.5],
        [2, 'Log every deviation seen during power-on, boot, register access and link training', 3],
        [3, 'Reproduce each anomaly on a second unit and board to separate silicon from setup', 2, 1],
        [4, 'Triage by die, block and suspected cause and hand each one to the debug board', 1.5],
        [5, 'Release the initial anomaly register to silicon debug', 0.5],
      ],
      o: [
        'Anomaly intake template and severity scale',
        'Anomaly log from electrical bring-up',
        'Reproduction results on a second unit',
        'Triaged anomalies with owners',
        'Initial silicon anomaly register',
      ],
      r: [['PON-D6', 'produces']],
    },
  },
};
