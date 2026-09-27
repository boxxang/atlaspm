/**
 * /data/e2Signoffs.ts — the in-app sign-off checklists of the E2 example.
 *
 * Two gates confirmed item by item and closed — RTL Freeze (ERTL-D7, 06/22)
 * and DV closure (EDV-D7, 08/31) — and the one physical design is working
 * towards now, the signoff-ready database handoff (EPD-D8), with its baseline
 * and entry criteria confirmed and its checks still open on the final turn.
 *
 * Plain rows in the shape the sign-off page stores (/lib/signoff), keyed by
 * the item IDs the gate's definition gives; tests/unit/e2Demo.test.ts holds
 * them to that definition.
 */

type Evidence = 'Not updated' | 'Under review' | 'Confirmed';
type Item = 'Pending' | 'Under review' | 'Confirmed';

export interface E2Entry {
  result: string;
  evidence: string;
  evidenceOwner: string;
  status: Evidence;
  lead: Item;
  comment: string;
  confirmedBy: string;
  confirmedOn: string;
}

export interface E2Signoff {
  v: 1;
  doc: { programme: string; version: string; issuedOn: string };
  items: Record<string, E2Entry>;
  issues: {
    id: string;
    description: string;
    itemId: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low' | '';
    owner: string;
    due: string;
    status: 'Open' | 'Closed';
    disposition: string;
  }[];
  waivers: {
    id: string;
    itemId: string;
    rule: string;
    justification: string;
    risk: string;
    condition: string;
    approvedBy: string;
    approvedOn: string;
  }[];
  extra: string[][];
  receipts: Record<string, { takes: string; receivedBy: string; receivedOn: string }>;
  decision: { decision: '' | 'Signed off' | 'Signed off with conditions' | 'Not signed off'; conditions: string; lead: string; decidedOn: string };
  roles: Record<string, { name: string; decision: string; date: string; comment: string }>;
}

/** A confirmed item: result, evidence, who owned it, and the lead's confirmation on a day. */
const ok = (result: string, evidence: string, evidenceOwner: string, confirmedBy: string, confirmedOn: string, comment = ''): E2Entry => ({
  result,
  evidence,
  evidenceOwner,
  status: 'Confirmed',
  lead: 'Confirmed',
  comment,
  confirmedBy,
  confirmedOn,
});

const RTL = 'Ethan Brooks';
const DV = 'Meera Iyer';
const PD = 'Alex Morgan';

export const E2_SIGNOFFS: Readonly<Record<string, E2Signoff>> = {
  'ERTL-D7': {
    v: 1,
    doc: { programme: 'Embedded_SoC (E2)', version: '1.0', issuedOn: '2026-06-22' },
    items: {
      'B-01': ok('Block and top-level RTL tagged for freeze.', 'git tag rtl-2026.06.19 (e2_top, 41 blocks)', 'Julia Martins', RTL, '2026-06-19'),
      'B-02': ok('IP manifest at final versions: eMRAM controller 3.2.0, PLL 1.4, OTP 2.1, I²S / PDM 1.0.', 'docs/ip/e2-ip-manifest-v7.xlsx', 'Lena Fischer', RTL, '2026-06-19'),
      'B-03': ok('UPF 2.1, 5 power domains, 3 retention groups.', 'upf/e2_top.upf @ upf-v2.1', 'Owen Gallagher', RTL, '2026-06-19'),
      'B-04': ok('Register map frozen; headers regenerated for the SDK.', 'rdl/e2_regs.rdl @ rdl-v5.0', 'Julia Martins', RTL, '2026-06-18'),
      'B-05': ok('Boot ROM image frozen and checksummed; secure boot and eMRAM boot paths passed on FPGA.', 'bootrom-1.0.0 (sha256 9f3c…e21a)', 'Grace Liu', RTL, '2026-06-19'),
      'E-01': ok('ECO board named: RTL lead (chair), DV lead, synthesis lead, PD lead, TPM.', 'Programme plan §6.2', '@me', RTL, '2026-06-01'),
      'E-02': ok('Change requests through the tracker only, template with impact fields, announced to all teams.', 'Tracker project E2-CR', '@me', RTL, '2026-06-01'),
      'E-03': ok('Freeze criteria in the programme plan since Arch Freeze.', 'Programme plan §6.1', '@me', RTL, '2026-06-01'),
      'C-01': ok('41 of 41 blocks and the top level in the release; manifest diffed against the build.', 'ci/release/rtl-2026.06.19/manifest.txt', 'Julia Martins', RTL, '2026-06-19'),
      'C-02': ok('Lint 0 errors; CDC 0 violations with 37 waivers; RDC 0 with 5 waivers — every waiver signed by the block owner.', 'reports/lint_cdc_rdc/rtl-2026.06.19/', 'Sam Okafor', RTL, '2026-06-20'),
      'C-03': ok('Trial synthesis at 120 MHz: fabric tile −2% area against budget, noc_arb +3% (dispositioned: within the tile budget).', 'syn/trial/rtl-2026.06.19/qor.html', 'Nikhil Rao', RTL, '2026-06-20'),
      'C-04': ok('No open CRs. Two deferred to the post-freeze policy with owners: CR-212 (PDM gain table), CR-219 (debug counter width).', 'Tracker E2-CR, filter "open at freeze"', '@me', RTL, '2026-06-21'),
      'C-05': ok('Functional coverage 96.4%, code 98.1%; holes listed: 11 in aon_hub low-power corners, closure planned in EDV by 08/14.', 'dv/coverage/merged-2026.06.19/summary.html', 'Meera Iyer', RTL, '2026-06-21'),
      'C-06': ok('All IP at final version, manifest v7 matches the delivered views.', 'docs/ip/e2-ip-manifest-v7.xlsx', 'Lena Fischer', RTL, '2026-06-19'),
      'C-07': ok('UPF checked against the RTL: 0 errors in the static low-power check.', 'reports/lp/rtl-2026.06.19/lp_check.rpt', 'Owen Gallagher', RTL, '2026-06-20'),
      'X-01': ok('Freeze declared on 06/22 against the checklist above, not the calendar: two items (C-02, C-05) closed on 06/20–06/21 before declaring.', 'This checklist', '@me', RTL, '2026-06-22'),
      'X-02': ok('All 23 CRs approved since Arch Freeze carry an impact assessment from DV and synthesis.', 'Tracker E2-CR, impact field audit', '@me', RTL, '2026-06-22'),
      'X-03': ok('Post-freeze exception policy published (Conditions tab) and used for CR-212 and CR-219.', 'Programme plan §6.3', '@me', RTL, '2026-06-22'),
      'F-01': ok('Addressed: the freeze date was held by closing criteria early, not by waiving them — see X-01.', 'This checklist', '@me', RTL, '2026-06-22'),
      'F-02': ok('Addressed: the CR template will not submit without the DV and synthesis impact fields, small changes included.', 'Tracker E2-CR template', '@me', RTL, '2026-06-22'),
      'F-03': ok('Addressed: post-freeze changes admitted only as ECOs through the ECO board with a written impact.', 'Programme plan §6.3', '@me', RTL, '2026-06-22'),
      'F-04': ok('Addressed: synthesis and PD leads are voting members of the ECO board.', 'ECO board charter', '@me', RTL, '2026-06-22'),
      'F-05': ok('Addressed: CI rebuilds the release from the change log and diffs it against the tag on every freeze candidate.', 'ci/release/rtl-2026.06.19/reconcile.log', 'Julia Martins', RTL, '2026-06-22'),
    },
    issues: [],
    waivers: [],
    extra: [
      ['Functional bug fix', 'ECO board approval with DV and synthesis impact; regression rerun', 'RTL lead + DV lead'],
      ['Timing or area ECO (no function change)', 'PD request, equivalence clean', 'Synthesis lead'],
      ['Feature or register change', 'Not admitted after freeze without an executive exception', 'VP Engineering'],
    ],
    receipts: {},
    decision: { decision: 'Signed off', conditions: '', lead: RTL, decidedOn: '2026-06-22' },
    roles: {
      'Program manager': { name: '@me', decision: 'Approve', date: '2026-06-22', comment: '' },
      'RTL lead': { name: RTL, decision: 'Approve', date: '2026-06-22', comment: '' },
      'Verification lead': { name: DV, decision: 'Approve with conditions', date: '2026-06-22', comment: 'aon_hub coverage holes closed by 08/14' },
      'Synthesis and PD representatives': { name: 'Nikhil Rao', decision: 'Approve', date: '2026-06-22', comment: '' },
      'Configuration manager': { name: 'Julia Martins', decision: 'Approve', date: '2026-06-22', comment: '' },
    },
  },

  'EDV-D7': {
    v: 1,
    doc: { programme: 'Embedded_SoC (E2)', version: '1.0', issuedOn: '2026-08-31' },
    items: {
      'B-01': ok('RTL verified: rtl-2026.08.14 (freeze + CR-212, CR-219).', 'git tag rtl-2026.08.14', 'Nora Lindqvist', DV, '2026-08-24'),
      'B-02': ok('Regression suite v4.3, tier "closure" (1,860 tests, 3 seeds each).', 'dv/regress/suites/closure-v4.3.yaml', 'Nora Lindqvist', DV, '2026-08-24'),
      'B-03': ok('Merged coverage database cov-2026.08.28.', 'dv/coverage/merged-2026.08.28/', 'Pablo Reyes', DV, '2026-08-28'),
      'B-04': ok('Verification plan v2.4.', 'docs/dv/e2-vplan-v2.4.pdf', 'Meera Iyer', DV, '2026-08-24'),
      'E-01': ok('Coverage model defined and mapped to the vPlan.', 'docs/dv/e2-vplan-v2.4.pdf §4', 'Pablo Reyes', DV, '2026-08-24'),
      'E-02': ok('All block suites producing coverage in nightly.', 'CI dashboard — nightly', 'Nora Lindqvist', DV, '2026-08-24'),
      'E-03': ok('Regression capacity: 1,200 slots reserved through 09/15.', 'Compute reservation RES-4471', 'Nora Lindqvist', DV, '2026-08-24'),
      'C-01': ok('Functional coverage 100% of must-have bins at block level, 98.7% at chip level; remaining 1.3% analysed and waived as unreachable configurations.', 'dv/coverage/merged-2026.08.28/functional.html', 'Pablo Reyes', DV, '2026-08-28'),
      'C-02': ok('Line 99.2%, branch 97.8%, toggle 96.9%, FSM 100%; every hole reviewed with the block owner.', 'dv/coverage/merged-2026.08.28/code.html', 'Pablo Reyes', DV, '2026-08-28'),
      'C-03': ok('Assertion coverage 97.5% (target 95%).', 'dv/coverage/merged-2026.08.28/assert.html', 'Irene Wu', DV, '2026-08-28'),
      'C-04': ok('184 properties proven; 6 bounded at 60 cycles with the bound justified against the NoC depth.', 'formal/reports/2026.08.27/summary.pdf', 'Irene Wu', DV, '2026-08-27', 'Arbiter proofs to be re-run after any arbiter change.'),
      'C-05': ok('All 9 sleep modes, 3 retention groups and 7 wake sources passing in power-aware simulation.', 'dv/lp/2026.08.26/lp_regress.html', 'Meera Iyer', DV, '2026-08-26'),
      'C-06': ok('Zero-delay and SDF (Turn 1) gate-level simulation passing; X-propagation clean after reset.', 'dv/gls/2026.08.22/summary.html', 'Nora Lindqvist', DV, '2026-08-27'),
      'C-07': ok('Pass rate 99.6% for three weeks; flake rate 0.2%, every flake ticketed.', 'CI dashboard — closure tier, 3 weeks', 'Nora Lindqvist', DV, '2026-08-28'),
      'C-08': ok('0 critical, 0 high open; 4 medium with fix-in-firmware or documented workaround.', 'Bug tracker E2-DV, open at 08/28', 'Meera Iyer', DV, '2026-08-28'),
      'C-09': ok('Coverage flat for four weeks (±0.1%).', 'dv/coverage/trend.html', 'Pablo Reyes', DV, '2026-08-28'),
      'X-01': ok('Regression stable; every red result in the last three weeks triaged within a day.', 'CI dashboard — triage log', 'Nora Lindqvist', DV, '2026-08-31'),
      'X-02': ok('All 41 holes analysed before closure or waiver; waivers signed by block owners.', 'dv/coverage/holes-2026.08.28.xlsx', 'Pablo Reyes', DV, '2026-08-31'),
      'X-03': ok('Curve flat — see C-09.', 'dv/coverage/trend.html', 'Pablo Reyes', DV, '2026-08-31'),
      'F-01': ok('Addressed: flakes are ticketed and fixed or quarantined within 48 h; none tolerated in the closure tier.', 'CI flake policy', 'Nora Lindqvist', DV, '2026-08-31'),
      'F-02': ok('Addressed: coverage merged only from runs of the stable closure tier.', 'Merge script cov-merge v3', 'Pablo Reyes', DV, '2026-08-31'),
      'F-03': ok('Addressed: waiver requires an analysis note and the block owner’s signature; 17 holes were closed with tests instead.', 'dv/coverage/holes-2026.08.28.xlsx', 'Pablo Reyes', DV, '2026-08-31'),
      'F-04': ok('Addressed: capacity reserved through the closure window; queue time under 40 min at peak.', 'Compute reservation RES-4471', 'Nora Lindqvist', DV, '2026-08-31'),
      'F-05': ok('Addressed: signed only after four flat weeks. The soak-found deadlock (08/19) is outside simulation reach and is tracked on the FFN risk, with the fix re-verified before the FFN.', 'This checklist; FFN risk', 'Meera Iyer', DV, '2026-08-31'),
    },
    issues: [],
    waivers: [],
    extra: [],
    receipts: {},
    decision: { decision: 'Signed off with conditions', conditions: 'NoC arbiter fix (FFN risk) to pass full regression, formal re-proof and 72 h FPGA soak before the FFN.', lead: DV, decidedOn: '2026-08-31' },
    roles: {
      'Regression owner': { name: 'Nora Lindqvist', decision: 'Approve', date: '2026-08-31', comment: '' },
      'Coverage lead': { name: 'Pablo Reyes', decision: 'Approve', date: '2026-08-31', comment: '' },
      'Verification lead': { name: DV, decision: 'Approve with conditions', date: '2026-08-31', comment: 'Arbiter fix re-verification before FFN' },
      'Block verification owners': { name: 'Irene Wu', decision: 'Approve', date: '2026-08-31', comment: '' },
    },
  },

  'EPD-D8': {
    v: 1,
    doc: { programme: 'Embedded_SoC (E2)', version: '0.3', issuedOn: '2026-09-15' },
    items: {
      'B-01': ok('Final turn built from the FFN.', 'e2-ffn-2026.09.11', 'Nikhil Rao', PD, '2026-09-15'),
      'B-03': ok('SDC frozen at FFN; UPF unchanged since freeze.', 'sdc-v3.4, upf-v2.1', 'Hannah Scott', PD, '2026-09-15'),
      'B-04': ok('PDK 1.2, std-cell libraries 1.1 (ULL 9-track), signoff decks: DRC 1.4, LVS 1.4 (updated from 1.3 in the dry run).', 'pdk/manifest-2026.09.22.txt', 'Aisha Rahman', PD, '2026-09-22'),
      'E-01': ok('Partitions defined at floorplan: 576 abutted tiles, noc_arb, emram subsystem, aon_hub, periph_top, top.', 'Floorplan and PDN specification (EPD-D2)', 'Ben Carter', PD, '2026-09-15'),
      'E-02': ok('Interface budgets from EARCH-09, re-issued for the FFN arbiter paths.', 'docs/arch/interface-budgets-v3.xlsx', 'Diego Santos', PD, '2026-09-16'),
      'E-03': ok('Blocks converging: Turn 2 at −17 ps / 212 endpoints.', 'PnR QoR tracker (key info)', 'Yuki Tanaka', PD, '2026-09-18'),
      'C-01': {
        result: 'Final placement with useful skew: WNS −38 ps, TNS −2.9 ns, 604 endpoints at SSG 0.72 V / −40 °C. Hold not yet run on the final trees.',
        evidence: 'pd/final/place_us/timing_summary.rpt',
        evidenceOwner: 'Yuki Tanaka',
        status: 'Under review',
        lead: 'Pending',
        comment: '',
        confirmedBy: '',
        confirmedOn: '',
      },
      'C-02': {
        result: 'Tile model against flat on 12 reference paths: within 4 ps, tolerance 5 ps. Re-check after final CTS.',
        evidence: 'pd/final/hier/model_vs_flat.rpt',
        evidenceOwner: 'Diego Santos',
        status: 'Under review',
        lead: 'Under review',
        comment: '',
        confirmedBy: '',
        confirmedOn: '',
      },
      'C-04': {
        result: 'Static IR 2.1% (ok). Dynamic IR 9.4% at eMRAM banks 2–3 with W7 vectors after the first PDN mitigation; budget 8%.',
        evidence: 'pd/final/ir/dyn_w7_iter2.rpt',
        evidenceOwner: 'Ben Carter',
        status: 'Under review',
        lead: 'Pending',
        comment: 'Blocked on the write-throttle ECO decision (ECO board 09/29).',
        confirmedBy: '',
        confirmedOn: '',
      },
      'C-06': {
        result: 'Chains reordered on the final placement; 64 of 64 chains pass shift simulation. Capture on the final trees still to run.',
        evidence: 'dft/pd/reorder_final/chain_check.log',
        evidenceOwner: 'Tariq Aziz',
        status: 'Under review',
        lead: 'Pending',
        comment: '',
        confirmedBy: '',
        confirmedOn: '',
      },
      'C-08': ok('eMRAM, PMU and oscillator macros placed to the vendor rules; keep-outs and shielding checked by the foundry.', 'Foundry review record FR-0918', 'Hana Yoshida', PD, '2026-09-18'),
    },
    issues: [
      {
        id: 'I-01',
        description: 'Dynamic IR 9.4% at eMRAM banks 2–3 during concurrent writes and a fabric burst (budget 8%)',
        itemId: 'C-04',
        severity: 'High',
        owner: 'Ben Carter',
        due: '2026-10-09',
        status: 'Open',
        disposition: 'PDN mitigation applied (11.2% → 9.4%); write-throttle ECO to the ECO board 09/29',
      },
      {
        id: 'I-02',
        description: 'Setup WNS −38 ps on NoC arbiter → PE paths at SSG 0.72 V / −40 °C',
        itemId: 'C-01',
        severity: 'High',
        owner: 'Yuki Tanaka',
        due: '2026-11-06',
        status: 'Open',
        disposition: 'Useful skew applied; targeted LVT on the top 300 paths after final CTS',
      },
    ],
    waivers: [],
    extra: [
      ['Netlist (FFN)', 'e2-ffn-2026.09.11', ''],
      ['SDC', 'sdc-v3.4', ''],
      ['UPF', 'upf-v2.1', ''],
    ],
    receipts: {},
    decision: { decision: '', conditions: '', lead: '', decidedOn: '' },
    roles: {},
  },
};

/** The day each checklist was completed, for the gates it closed. */
export const E2_SIGNOFF_CLOSED: Readonly<Record<string, string>> = {
  'ERTL-D7': '2026-06-22',
  'EDV-D7': '2026-08-31',
};
