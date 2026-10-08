/**
 * RAMP — Production Release & Ramp. Weeks 204–218; closes on Production Release.
 */
import type { CpoStageModule } from '../types';

export const RAMP: CpoStageModule = {
  content: {
    tagline: 'Release one configuration to production and grow its volume without losing control of it.',
    description:
      'Lock the product that passed PVT into a production configuration baseline — BOM, drawings, recipes, test programs, calibration recipes and signed firmware — and release it; then ramp the line in steps, with a yield dashboard and statistical process control catching excursions as volume grows, supply and inventory buffered for the long-lead optical and substrate parts, and outgoing quality measured on the first customer shipments. The stage closes on a production release decision review that checks qualification, PVT exit, compliance and ramp readiness together — the point after which every change goes through change control and every unit shipped is counted in the field quality record.',
    activities: ['Release package', 'Production firmware', 'Ramp plan', 'Yield dashboard', 'Supply ramp', 'Shipments and outgoing quality', 'Release decision'],
    deliverables: [
      'CPO production release package and configuration baseline',
      'Production configuration audit against the PVT build',
      'Signed production firmware and software release with rollback protection',
      'Volume ramp plan and build schedule',
      'Production yield dashboard and SPC control plan',
      'Supply and inventory ramp plan with long-lead buffers',
      'Outgoing quality report and early-shipment DPPM baseline',
      'Production release decision record and gate package',
    ],
    deliverableFrom: [0, 0, 1, 2, 3, 4, 5, 6],
    deliverableWeek: [6, 4, 6, 10, 13, 13, 14, 14],
    engineeringEffort: [5, 8, 4, 7, 5, 5, 2],
    risks: [
      'Production configuration differs from the configuration that was qualified',
      'Excursion on the optical alignment or calibration line reaches customers before it is detected',
    ],
    potentialRisks: [
      'Release package assembled from what the line happens to be running rather than from released revisions',
      'Production firmware signed with development keys, or with no anti-rollback protection set',
      'Ramp steps taken on the calendar rather than on the exit criterion of the previous rate',
      'Control limits copied from the specification, so the line alarms constantly or never',
      'Optical source or substrate buffer sized on the business-case yield and exhausted in the first month',
      'Customer incoming failures reported through sales and never reaching the quality record',
    ],
    leader: { name: 'Marcus Oyelaran', short: 'M. Oyelaran', phone: '+1 (408) 555-0525', email: 'marcus.oyelaran@example.com' },
    collaboration: ['Quality', 'Manufacturing and NPI', 'Firmware', 'Supply chain', 'Test engineering', 'Product management', 'Security'],
    tools: ['Product lifecycle management system', 'Manufacturing execution system', 'Statistical process control software', 'Code signing infrastructure', 'Supply planning system'],
    programView: [
      'Weekly units out versus ramp plan',
      'Line yield and open excursions',
      'Days of supply for long-lead parts',
      'Early-shipment DPPM',
    ],
    perspective:
      'Production release is a configuration, not a date. If the program cannot print the exact revisions of every die, recipe, test program, calibration table and firmware image a shipped unit was built with, it has released nothing it can defend in front of a customer.',
  },
  steps: {
    'RAMP-01': {
      s: [
        [1, 'Collect the released revisions of the BOM, drawings, process recipes, test programs, calibration recipes and firmware images', 1.5],
        [2, 'Reconcile every item against the configuration built in PVT and close each mismatch', 1.5],
        [3, 'Place the configuration baseline under change control in the product lifecycle system', 1],
        [4, 'Obtain release sign-off from quality, manufacturing, test, firmware and product management', 1],
        [5, 'Release the production package to the factory and suppliers', 0.5],
      ],
      o: [
        'Released revision list across hardware, test and firmware',
        'Production configuration audit against the PVT build',
        'Configuration baseline under change control',
        'Functional release sign-offs',
        'Released production package and baseline',
      ],
      r: [['RAMP-D1', 'produces'], ['RAMP-D2', 'produces'], ['RAMP-D4', 'feeds'], ['RAMP-D8', 'feeds']],
    },
    'RAMP-02': {
      s: [
        [1, 'Freeze the production firmware and SDK release from the validated candidate and tag every component', 1],
        [2, 'Sign the images with production keys in the controlled signing environment', 1],
        [3, 'Set the anti-rollback counter and verify that older vulnerable images are refused', 1, 1],
        [4, 'Verify secure update, interrupted-update recovery and fallback to the last good image on production units', 2],
        [5, 'Publish release notes, known issues and the software bill of materials', 0.5, 1],
        [6, 'Release the signed production images to the factory and to customers', 0.5],
      ],
      o: [
        'Tagged production firmware and SDK release',
        'Images signed with production keys',
        'Anti-rollback counter setting verified',
        'Secure update and recovery test results on production units',
        'Release notes and software bill of materials',
        'Signed production firmware and software release',
      ],
      r: [['RAMP-D3', 'produces'], ['RAMP-D1', 'feeds']],
    },
    'RAMP-03': {
      s: [
        [1, 'Convert demand and customer commitments into a weekly build and ship schedule', 1.5],
        [2, 'Plan line loading, shifts and tester utilization against the committed capacity', 1.5],
        [3, 'Set weekly output and yield targets with the learning curve assumed', 1, 1],
        [4, 'Stage the ramp in rate steps, each with an exit criterion before the next increase', 1.5],
        [5, 'Release the volume ramp plan and build schedule', 0.5],
      ],
      o: [
        'Weekly build and ship schedule',
        'Line loading and tester utilization plan',
        'Weekly output and yield targets',
        'Staged ramp with rate-step exit criteria',
        'Volume ramp plan and build schedule',
      ],
      r: [['RAMP-D4', 'produces'], ['RAMP-D6', 'feeds']],
    },
    'RAMP-04': {
      s: [
        [1, 'Define the yield, cycle time and parametric metrics shown per station, lot and site', 1],
        [2, 'Connect tester, calibration and assembly data to the dashboard with lot and unit genealogy', 2],
        [3, 'Set SPC control limits on critical parameters from PVT and early ramp data', 1.5],
        [4, 'Write out-of-control action plans and the excursion hold and release procedure', 1, 1],
        [5, 'Run the daily yield and excursion review and track every excursion to closure', 3],
        [6, 'Pull periodic reliability samples from production lots — optical source aging and fiber attach stress above all', 2, 1],
        [7, 'Release the yield dashboard and SPC control plan', 0.5],
      ],
      o: [
        'Yield and parametric metric definitions',
        'Dashboard fed by tester, calibration and assembly data',
        'SPC control limits for critical parameters',
        'Out-of-control action plans and excursion procedure',
        'Excursion log with closure status',
        'Production-lot reliability sample results',
        'Production yield dashboard and SPC control plan',
      ],
      r: [['RAMP-D5', 'produces'], ['RAMP-D7', 'informs']],
    },
    'RAMP-05': {
      s: [
        [1, 'Explode the build schedule into material requirements by part and week', 1.5],
        [2, 'Set safety stock and long-lead buffers for wafers, substrates, optical sources and fiber assemblies', 1.5],
        [3, 'Release purchase orders and wafer starts against the ramp and obtain supplier confirmations', 2],
        [4, 'Set allocation rules for constrained parts across customers and builds', 1, 1],
        [5, 'Track deliveries, inventory and shortages weekly and escalate every gap', 4],
        [6, 'Release the supply and inventory ramp plan', 0.5],
      ],
      o: [
        'Material requirements by part and week',
        'Safety stock and long-lead buffer levels',
        'Confirmed purchase orders and wafer starts',
        'Allocation rules for constrained parts',
        'Weekly supply, inventory and shortage report',
        'Supply and inventory ramp plan',
      ],
      r: [['RAMP-D6', 'produces'], ['RAMP-D4', 'feeds']],
    },
    'RAMP-06': {
      s: [
        [1, 'Set the outgoing quality audit plan — sample size, electrical and optical checks per shipment', 0.5],
        [2, 'Ship the first production units with conformance certificates and unit-level test and calibration records', 1.5],
        [3, 'Ship fiber handling, inspection and cleaning instructions to every receiving customer', 0.5, 1],
        [4, 'Run outgoing quality audits and collect customer incoming inspection results', 2],
        [5, 'Host customer line audits and partner quality audits and close their findings', 1, 1],
        [6, 'Compute early-shipment DPPM and classify every customer-reported failure', 1, 1],
        [7, 'Release the outgoing quality report and DPPM baseline', 0.5],
      ],
      o: [
        'Outgoing quality audit plan',
        'First production shipments with unit records',
        'Customer fiber handling and cleaning instructions',
        'Outgoing audit and customer incoming inspection results',
        'Customer and partner audit reports with closed findings',
        'Early-shipment DPPM and failure classification',
        'Outgoing quality report and DPPM baseline',
      ],
      r: [['RAMP-D7', 'produces'], ['RAMP-D8', 'feeds']],
    },
    'RAMP-07': {
      s: [
        [1, 'Confirm the release criteria — qualification approved, PVT exit conditions closed, compliance and interoperability complete, release baseline locked', 1],
        [2, 'Check ramp readiness — yield dashboard live, supply buffers in place, signed firmware released, outgoing quality running', 1, 1],
        [3, 'Assemble the production release gate package with open conditions, owners and dates', 1],
        [4, 'Hold the production release decision review and record the decision and its conditions', 1],
      ],
      o: [
        'Release criteria status against thresholds',
        'Ramp readiness checklist result',
        'Production release gate package',
        'Production release decision record',
      ],
      r: [['RAMP-D8', 'produces']],
    },
  },
};
