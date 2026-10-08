/**
 * tools/cpoFlow/tracks.ts — each die's and package's path through the
 * program, step by step, as the activities that carry it.
 */
export interface TrackStep {
  step: string;
  refs: string[];
  /** why the item has no activity at this step, where it has none */
  why?: string;
}
export interface Track {
  item: string;
  label: string;
  steps: TrackStep[];
}

export const TRACKS: Track[] = [
  {
    item: 'switch',
    label: 'Switch SoC',
    steps: [
      { step: 'Requirements', refs: ['REQ-03'] },
      { step: 'Architecture', refs: ['SARC-01'] },
      { step: 'Interface', refs: ['ICD-02'] },
      { step: 'Design', refs: ['DSGN-01', 'DSGN-02'] },
      { step: 'Verification', refs: ['PSV-02', 'PSV-03', 'PSV-08'] },
      { step: 'Implementation', refs: ['IMPL-01', 'IMPL-02'] },
      { step: 'Signoff', refs: ['SGNO-01'] },
      { step: 'Tapeout (wave 2)', refs: ['MTO-01'] },
      { step: 'Fab', refs: ['WFAB-01'] },
      { step: 'Sort / KGD', refs: ['SORT-01', 'SORT-06', 'SORT-07'] },
      { step: 'Main package mounting', refs: ['PKGA-03'] },
      { step: 'Bring-up', refs: ['PON-04', 'SINT-01'] },
      { step: 'Characterization', refs: ['CHAR-04'] },
      { step: 'Qualification', refs: ['RELQ-02'] },
      { step: 'NPI', refs: ['NPI-04'] },
    ],
  },
  {
    item: 'io',
    label: 'I/O die',
    steps: [
      { step: 'Requirements', refs: ['REQ-02'] },
      { step: 'Architecture', refs: ['SARC-02'] },
      { step: 'Interface', refs: ['ICD-02', 'ICD-03'] },
      { step: 'Design', refs: ['DSGN-04'] },
      { step: 'Verification', refs: ['PSV-05'] },
      { step: 'Implementation', refs: ['IMPL-03'] },
      { step: 'Signoff', refs: ['SGNO-02'] },
      { step: 'Tapeout (wave 2)', refs: ['MTO-02'] },
      { step: 'Fab', refs: ['WFAB-02'] },
      { step: 'Sort / KGD', refs: ['SORT-02', 'SORT-06', 'SORT-07'] },
      { step: 'Main package mounting', refs: ['PKGA-03'] },
      { step: 'Bring-up', refs: ['PON-05'] },
      { step: 'Characterization', refs: ['CHAR-02'] },
      { step: 'Qualification', refs: ['RELQ-02'] },
      { step: 'NPI', refs: ['NPI-04'] },
    ],
  },
  {
    item: 'eic',
    label: 'Electrical IC',
    steps: [
      { step: 'Requirements', refs: ['REQ-04'] },
      { step: 'Architecture', refs: ['SARC-03'] },
      { step: 'Interface', refs: ['ICD-03', 'ICD-04'] },
      { step: 'Feasibility test vehicle', refs: ['FEAS-04'] },
      { step: 'Design', refs: ['DSGN-05'] },
      { step: 'Verification', refs: ['PSV-15'] },
      { step: 'Implementation', refs: ['IMPL-04'] },
      { step: 'Signoff', refs: ['SGNO-03', 'SGNO-12'] },
      { step: 'Tapeout (wave 1)', refs: ['OTO-01'] },
      { step: 'Fab', refs: ['WFAB-03'] },
      { step: 'Sort', refs: ['SORT-03', 'SORT-05'] },
      { step: 'Optical engine stacking', refs: ['OEB-02'] },
    ],
  },
  {
    item: 'pic',
    label: 'Photonic IC',
    steps: [
      { step: 'Requirements', refs: ['REQ-04'] },
      { step: 'Architecture', refs: ['SARC-03'] },
      { step: 'Interface', refs: ['ICD-04', 'ICD-05', 'ICD-06'] },
      { step: 'Feasibility test vehicle', refs: ['FEAS-03'] },
      { step: 'Design', refs: ['DSGN-06'] },
      { step: 'Verification', refs: ['PSV-06'] },
      { step: 'Implementation', refs: ['IMPL-05'] },
      { step: 'Signoff', refs: ['SGNO-04', 'SGNO-12'] },
      { step: 'Tapeout (wave 1)', refs: ['OTO-02'] },
      { step: 'Fab and post-fab', refs: ['WFAB-04', 'WFAB-08'] },
      { step: 'Sort', refs: ['SORT-04', 'SORT-05'] },
      { step: 'Optical engine stacking', refs: ['OEB-02'] },
    ],
  },
  {
    item: 'oe',
    label: 'Optical engine package',
    steps: [
      { step: 'Feasibility test vehicle', refs: ['FEAS-06', 'FEAS-12'] },
      { step: 'Stack design and process development', refs: ['OESD-01', 'OESD-02', 'OESD-03', 'OESD-04', 'OESD-05', 'OESD-06'] },
      { step: 'Design freeze', refs: ['OESD-07', 'SGNO-12'] },
      { step: 'Optical engine build', refs: ['OEB-02', 'OEB-03', 'OEB-04'] },
      { step: 'Optical engine test', refs: ['OEB-05', 'OEB-06'] },
      { step: 'Known-good optical engines', refs: ['OEB-07', 'OEB-08', 'OEB-09'] },
      { step: 'Main package mounting', refs: ['PKGA-04'] },
      { step: 'Optical bring-up', refs: ['OBU-02', 'OBU-03'] },
      { step: 'Optical engine qualification', refs: ['RELQ-08'] },
    ],
  },
  {
    item: 'package',
    label: 'Main package',
    steps: [
      { step: 'Architecture', refs: ['SARC-05'] },
      { step: 'Design', refs: ['DSGN-12'] },
      { step: 'Implementation', refs: ['IMPL-07'] },
      { step: 'Signoff', refs: ['SGNO-06'] },
      { step: 'Substrate release', refs: ['SGNO-11'] },
      { step: 'Electrical-only build and dry run', refs: ['PKGA-11', 'PKGA-12'] },
      { step: 'First build', refs: ['PKGA-03', 'PKGA-04', 'PKGA-06'] },
      { step: 'Bring-up', refs: ['PON-02'] },
      { step: 'Qualification', refs: ['RELQ-04'] },
      { step: 'NPI', refs: ['NPI-03', 'NPI-04'] },
    ],
  },
  {
    item: 'bridge',
    label: 'Bridge / interposer and silicon capacitors',
    steps: [
      { step: 'Architecture', refs: ['SARC-04'] },
      { step: 'Design', refs: ['DSGN-09'] },
      { step: 'Verification', refs: ['PSV-13'] },
      { step: 'Implementation', refs: ['IMPL-06'] },
      { step: 'Signoff', refs: ['SGNO-05'] },
      { step: 'Release', refs: ['MTO-03'] },
      { step: 'Fab', refs: ['WFAB-05'] },
      { step: 'Main package mounting', refs: ['PKGA-03'] },
      { step: 'Bring-up', refs: ['PON-05'] },
      { step: 'Qualification', refs: ['RELQ-04'] },
    ],
  },
  {
    item: 'source',
    label: 'Optical source',
    steps: [
      { step: 'Requirements', refs: ['REQ-04'] },
      { step: 'Architecture', refs: ['SARC-03'] },
      { step: 'Interface', refs: ['ICD-05'] },
      { step: 'Feasibility test vehicle', refs: ['FEAS-05', 'FEAS-11'] },
      { step: 'Supplier qualification', refs: ['TRDY-07'] },
      { step: 'Design', refs: ['DSGN-07', 'DSGN-19'] },
      { step: 'Incoming screening', refs: ['TINF-12'] },
      { step: 'Material arrival (shared with the main package)', refs: ['WFAB-06'] },
      { step: 'Main package integration', refs: ['PKGA-05'] },
      { step: 'Bring-up', refs: ['OBU-01'] },
      { step: 'Characterization', refs: ['CHAR-10'] },
      { step: 'Qualification', refs: ['RELQ-03'] },
    ],
  },
];
