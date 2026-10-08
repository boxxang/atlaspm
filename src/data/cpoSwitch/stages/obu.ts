/**
 * OBU — Optical Bring-Up & Calibration. Weeks 150–160; closes on First
 * Optical Link.
 */
import type { CpoStageModule } from '../types';

export const OBU: CpoStageModule = {
  content: {
    tagline: 'Light the optical engines, lock every lane to its wavelength, and close the first optical link against the budget.',
    description:
      'Bring the optics up on the first packages once the electrical path is working: power the optical source behind verified laser safety interlocks and measure delivered power, bias the electrical and photonic ICs, tune heaters and lock each lane to its wavelength, close optical loopback to a first optical link with a measured bit error rate, and run the factory calibration flow and the optical control firmware on real parts. Every lane is then held against the optical link budget term by term, and lanes that miss go to silicon debug. The stage closes on First Optical Link.',
    activities: ['Optical source power-up', 'Bias and wavelength lock', 'First optical link', 'Per-lane calibration', 'Optical control firmware', 'Margin correlation'],
    deliverables: [
      'Optical source power-up and laser safety interlock verification report',
      'Bias, heater tuning and wavelength lock bring-up record per lane',
      'First optical link report — optical loopback, BER and link-up per lane',
      'Per-lane calibration flow bring-up report with first-silicon calibration tables',
      'Optical monitoring and control firmware release for bring-up',
      'Optical link margin versus budget correlation report',
    ],
    deliverableFrom: [0, 1, 2, 3, 4, 5],
    deliverableWeek: [3, 5, 8, 9, 9, 10],
    engineeringEffort: [4, 8, 8, 8, 8, 6],
    risks: [
      'Wavelength lock that holds on the bench but not as the package heats',
      'Optical margin below budget with no term-by-term explanation',
      'Calibration flow that works in the lab but not as the factory runs it',
    ],
    potentialRisks: [
      'Optical source powered before the laser safety interlock and fiber-open detection were proven',
      'Heater power needed for lock larger than the thermal and power budget assumed',
      'First optical link declared on a few hand-tuned lanes rather than every lane with calibrated settings',
      'Calibration tables written in the lab by scripts that differ from the production flow',
      'Optical control firmware that handles steady state but not loss of lock or source failure',
      'Margin shortfall absorbed silently into the budget instead of traced to coupling, source or modulator',
    ],
    leader: { name: 'Tomasz Wierzbicki', short: 'T. Wierzbicki', phone: '+1 (408) 555-0518', email: 'tomasz.wierzbicki@example.com' },
    collaboration: ['Photonics', 'Laser and optical source', 'Firmware', 'Validation', 'Analog and mixed-signal', 'Optical engineering'],
    tools: ['Optical power meter and spectrum analyzer', 'Bit error rate tester', 'Optical sampling oscilloscope', 'Calibration database', 'Anomaly tracking system'],
    programView: [
      'Lanes locked to wavelength per unit',
      'Lanes with measured BER below target',
      'Calibration time and pass rate per lane',
      'Measured optical margin against budget',
    ],
    perspective:
      'An optical link that works on one lane with an engineer’s hand on the heater proves nothing. First optical link means every lane, calibrated by the production flow, controlled by firmware, with its margin explained term by term against the budget.',
  },
  steps: {
    'OBU-01': {
      s: [
        [1, 'Verify the laser safety interlocks, fiber-open detection and shutdown before enabling any optical source', 0.5],
        [2, 'Power the optical source at low current and step to the operating point while monitoring temperature', 0.5],
        [3, 'Measure delivered optical power per lane at the photonic IC and at the fiber output against the budget', 1],
        [4, 'Check source wavelength and stability over temperature on the bring-up system', 0.5, 1],
        [5, 'Release the optical source power-up report', 0.5],
      ],
      o: [
        'Interlock and shutdown verification record',
        'Optical source current and temperature ramp log',
        'Delivered optical power per lane',
        'Source wavelength and stability measurements',
        'Optical source power-up report',
      ],
      r: [['OBU-D1', 'produces'], ['OBU-D6', 'feeds']],
    },
    'OBU-02': {
      s: [
        [1, 'Bias the electrical IC drivers and transimpedance amplifiers and verify currents per lane', 0.5],
        [2, 'Measure heater efficiency and tune each wavelength-selective element onto its channel', 1],
        [3, 'Close the wavelength lock loop and check it holds across power and temperature steps', 1],
        [4, 'Bias the modulators and measure extinction ratio and output power per lane', 1, 1],
        [5, 'Release the bias, tuning and lock record per lane', 0.5],
      ],
      o: [
        'Electrical IC bias currents per lane',
        'Heater efficiency and tuning set points',
        'Wavelength lock stability across power and temperature',
        'Modulator extinction ratio and output power per lane',
        'Bias, heater tuning and wavelength lock record',
      ],
      r: [['OBU-D2', 'produces'], ['OBU-D3', 'feeds']],
    },
    'OBU-03': {
      s: [
        [1, 'Close optical loopback on the package with a fiber loop and run PRBS on every lane', 1],
        [2, 'Bring up the optical links end to end through the electrical IC, photonic IC and fiber', 1],
        [3, 'Measure bit error rate per lane before and after forward error correction', 1],
        [4, 'Run the crosstalk check with every lane active at once', 1, 1],
        [5, 'Declare first optical link and release the report', 0.5],
      ],
      o: [
        'Optical loopback PRBS results per lane',
        'End-to-end optical link state per lane',
        'Bit error rate per lane before and after correction',
        'All-lanes-active crosstalk results',
        'First optical link report',
      ],
      r: [['OBU-D3', 'produces'], ['OBU-D6', 'feeds']],
    },
    'OBU-04': {
      s: [
        [1, 'Run the factory calibration flow on bring-up parts with the production algorithms', 1],
        [2, 'Compare calibrated set points with the lab-tuned values from bias and tuning bring-up', 1],
        [3, 'Verify the tables are written, stored and read back by firmware across power cycles', 1],
        [4, 'Measure calibration time and convergence failures per lane', 1, 1],
        [5, 'Feed algorithm and limit fixes back to the calibration process and release the bring-up report', 1],
      ],
      o: [
        'Calibration results on bring-up parts',
        'Calibrated versus lab-tuned set point comparison',
        'Table write, storage and read-back verification',
        'Calibration time and convergence data per lane',
        'Per-lane calibration flow bring-up report',
      ],
      r: [['OBU-D4', 'produces'], ['OBU-D3', 'feeds']],
    },
    'OBU-05': {
      s: [
        [1, 'Load the optical control firmware and verify it reads every monitor — photodiode currents, temperatures, heater power', 1],
        [2, 'Close the control loops in firmware — wavelength lock, bias tracking and optical power control', 2],
        [3, 'Implement and test fault handling — loss of lock, source failure and over-temperature shutdown', 1.5],
        [4, 'Expose the optical monitors to the management software', 1, 1],
        [5, 'Release the optical control firmware for bring-up', 0.5],
      ],
      o: [
        'Monitor read-back verified against instruments',
        'Firmware control loops closed and stable',
        'Fault handling test results',
        'Optical monitors exposed to management software',
        'Optical monitoring and control firmware release',
      ],
      r: [['OBU-D5', 'produces'], ['OBU-D4', 'feeds']],
    },
    'OBU-06': {
      s: [
        [1, 'Measure received optical power, modulation amplitude and receiver sensitivity per lane', 1],
        [2, 'Build the measured link budget per lane — source power, coupling loss, modulator and detector terms', 1.5],
        [3, 'Compare every term with the budget and the model and rank the gaps', 1],
        [4, 'Feed corrections to the optical models and open anomalies for lanes outside budget', 1],
        [5, 'Release the margin correlation report', 0.5],
      ],
      o: [
        'Received power, modulation amplitude and sensitivity per lane',
        'Measured link budget per lane',
        'Ranked gaps between measured and budgeted terms',
        'Model corrections and anomalies opened',
        'Optical link margin versus budget correlation report',
      ],
      r: [['OBU-D6', 'produces']],
    },
  },
};
