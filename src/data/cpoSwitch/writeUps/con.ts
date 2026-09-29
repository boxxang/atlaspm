/**
 * CON — Concept & Product Planning, written up.
 */
import type { CpoWriteUps } from '../types';

export const CON_WRITE_UPS: CpoWriteUps = {
  'CON-01': {
    criticalPath: true,
    purpose: [
      'Capture what the <b>target customers actually need</b> from the switch — bandwidth, radix, port speeds, power, serviceability and reach — ranked, so the concept is chosen against a market rather than against a technology.',
      'Co-packaged optics changes how a switch is serviced and deployed. Requirements gathered only as port counts miss the questions that decide adoption: whether an operator will accept optics that cannot be swapped at the front panel, and what a field failure costs them.',
    ],
    flowNote:
      'Step 1 fixes who the product is for. Step 2 interviews run alongside the consolidation so gaps can be chased while customers are still engaged. Step 3 ranks the needs, and step 4 releases the document the concept is selected against.',
    consumes: [
      'Company product strategy and roadmap',
      'Account team input on lead customers',
      'Field data on current switch deployments and failures',
      'Analyst and industry forecasts for switch bandwidth',
      'Prior program retrospectives',
    ],
    rel: {
      'CON-D1': '<b>Market requirements document.</b> Produced here and signed by product management; the concept and every later requirement trace back to it.',
      'CON-D3': '<b>Product concept brief.</b> The ranked needs are what the candidate concepts are scored against.',
    },
    risks: [
      '<b>One customer becomes the market.</b> Requirements from a single lead account are generalized, and the product fits nobody else.',
      '<b>Serviceability not asked.</b> Operators are asked about bandwidth but not about optics that cannot be replaced in the field.',
      '<b>Needs recorded as solutions.</b> A customer asks for a specific optical form and the underlying need is lost.',
      '<b>No ranking.</b> Every need is equally important, so the concept cannot trade any of them away.',
      '<b>Requirements stale by tapeout.</b> The market moves over a multi-year program and nobody owns refreshing them.',
    ],
    roles: [
      { r: 'Product management', d: 'Owns the market requirements and their ranking' },
      { r: 'Field applications engineer', d: 'Customer interviews and deployment context' },
      { r: 'System architect', d: 'Translates needs into measurable system parameters' },
      { r: 'Sales account lead', d: 'Access to lead customers' },
      { r: 'Program TPM', d: 'Keeps the requirements under change control once released' },
    ],
    effort: [
      ['Customer interviews', 1.5],
      ['Requirements consolidation and ranking', 1],
      ['Document release', 0.5],
    ],
    entry: [
      'Target segments proposed by product strategy',
      'Lead customers identified and willing to engage',
      'Interview template agreed with architecture',
    ],
    exit: [
      'Every requirement ranked and traced to at least one customer',
      'Serviceability and deployment constraints captured explicitly',
      'Market requirements document released under change control',
    ],
    dependsOn: [],
    dependsNote: 'The first activity of the program: it starts from strategy and customers rather than from other work.',
    feedsInto: ['CON-03', 'REQ-01'],
    measuredBy: [
      'Number of customers whose needs are represented',
      'Requirements changed after the concept is selected',
      'Requirements with no customer source',
    ],
    links: {
      dependsOn: [],
      feedsInto: ['CON-03', 'CON-04', 'REQ-01'],
      runsWith: ['CON-02'],
      revisedBy: ['CERT-06'],
      feedsBackInto: [],
    },
    terms: ['PRD', 'KPI'],
  },
  'CON-02': {
    criticalPath: false,
    purpose: [
      'Map the <b>technology and competitive landscape</b> the product will enter — switching bandwidth trends, optical interconnect options, packaging maturity and the supplier ecosystem — so the concept is chosen knowing what else is possible.',
      'The decision to co-package optics is only sound against the alternatives: pluggable and near-packaged optics keep improving. This assessment states which technology bets the program is making and how mature each supplier base is.',
    ],
    flowNote:
      'Step 1 surveys the trends. Step 2 compares optics architectures at system level alongside the supplier mapping in step 3, because maturity and availability often decide between options that look equal on paper. Step 4 publishes the bets.',
    consumes: [
      'Public technology roadmaps and industry standards activity',
      'Supplier briefings under NDA',
      'Market requirements in draft from CON-01',
      'Internal technology research results',
      'Prior program lessons on optical and packaging suppliers',
    ],
    rel: {
      'CON-D2': '<b>Competitive and technology landscape assessment.</b> Produced here; it records the technology bets the concept makes.',
      'CON-D3': '<b>Product concept brief.</b> The comparison of optics architectures is the evidence the concept selection cites.',
    },
    risks: [
      '<b>Alternatives compared on best-case numbers.</b> Co-packaged optics is judged on a roadmap while pluggables are judged on shipping parts.',
      '<b>Supplier maturity ignored.</b> An option that needs a supplier who is not yet producing is treated as available.',
      '<b>Landscape frozen at kickoff.</b> The assessment is never revisited as the market moves.',
      '<b>Standards trajectory unread.</b> The product lands between standard generations.',
      '<b>Competitor capability assumed.</b> Positioning rests on guesses presented as facts.',
    ],
    roles: [
      { r: 'Product management', d: 'Owns the assessment and its conclusions' },
      { r: 'System architect', d: 'System-level comparison of optics architectures' },
      { r: 'Photonics lead', d: 'Optical technology maturity' },
      { r: 'Supply chain lead', d: 'Supplier ecosystem mapping' },
      { r: 'Program TPM', d: 'Carries the technology bets into the risk register' },
    ],
    effort: [
      ['Technology survey', 0.5],
      ['Optics architecture comparison', 1],
      ['Supplier maturity mapping', 0.5],
    ],
    entry: [
      'Market segments drafted in CON-01',
      'Supplier NDAs in place for briefings',
      'Comparison criteria agreed with architecture',
    ],
    exit: [
      'Co-packaged, near-packaged and pluggable options compared on the same criteria',
      'Supplier maturity stated for every technology the concept depends on',
      'Technology bets written down and entered in the risk register',
    ],
    dependsOn: [],
    dependsNote: null,
    feedsInto: ['CON-03'],
    measuredBy: [
      'Technology bets later reversed',
      'Suppliers assessed per critical technology',
      'Time since the assessment was last refreshed',
    ],
    links: {
      dependsOn: [],
      feedsInto: ['CON-03', 'CON-06', 'FEAS-01'],
      runsWith: ['CON-01'],
      revisedBy: ['FEAS-09'],
      feedsBackInto: [],
    },
    terms: ['NDA'],
  },
  'CON-03': {
    criticalPath: true,
    purpose: [
      'Choose the <b>product concept</b>: aggregate bandwidth, radix and port configuration, power per bit, density and form factor — and write down what it was chosen over and why.',
      'The concept fixes the numbers every workstream later designs to. Its power-per-bit and density claims against pluggable optics are the reason the program exists, so they are estimated with stated assumptions rather than asserted.',
    ],
    flowNote:
      'Step 1 frames candidates against the ranked needs. Step 2 estimates power and density for each. Step 3 sets the physical envelope alongside, since form factor and cooling constrain which candidates survive. Step 4 selects and records the alternatives, and step 5 releases the brief.',
    consumes: [
      'Market requirements document from CON-01',
      'Landscape assessment from CON-02',
      'Switch silicon bandwidth scaling assumptions',
      'Optical engine power estimates from prior work',
      'Data center deployment and cooling constraints',
    ],
    rel: {
      'CON-D3': '<b>Product concept brief.</b> Produced here; it is the single statement of what the product is until the requirements baseline replaces it.',
      'CON-D4': '<b>Business case.</b> The selected configuration and its power per bit are the inputs the cost model is built on.',
    },
    risks: [
      '<b>Power per bit unanchored.</b> The headline number has no stated assumptions and cannot be checked later.',
      '<b>Form factor decided last.</b> A concept that does not fit the target chassis and cooling is selected on bandwidth alone.',
      '<b>Alternatives unrecorded.</b> The rejected options are forgotten and re-argued at every review.',
      '<b>Serviceability deferred.</b> How a failed optical engine is handled is left to after architecture.',
      '<b>Configuration too specific.</b> One customer’s port map is designed in and limits the rest of the market.',
    ],
    roles: [
      { r: 'System architecture', d: 'Owns the concept and its selection record' },
      { r: 'Product manager', d: 'Market fit of each candidate' },
      { r: 'Photonics lead', d: 'Optical engine power and density estimates' },
      { r: 'Thermal and mechanical lead', d: 'Form factor and cooling envelope' },
      { r: 'Program TPM', d: 'Carries the concept into the plan and the risk register' },
    ],
    effort: [
      ['Candidate framing', 1],
      ['Power and density estimation', 1.5],
      ['Envelope definition', 0.5],
      ['Selection and brief', 1],
    ],
    entry: [
      'Market requirements released by CON-01',
      'Optics comparison available from CON-02',
      'Estimation assumptions agreed with photonics and thermal',
    ],
    exit: [
      'One concept selected with its alternatives and reasons recorded',
      'Power per bit and density stated with their assumptions',
      'Form factor, cooling and serviceability assumptions written into the brief',
    ],
    dependsOn: ['CON-01', 'CON-02'],
    dependsNote: null,
    feedsInto: ['CON-04', 'REQ-02'],
    measuredBy: [
      'Change in estimated power per bit at each later gate',
      'Concept parameters reopened after the requirements baseline',
      'Assumptions without an owner',
    ],
    links: {
      dependsOn: ['CON-01', 'CON-02'],
      feedsInto: ['CON-04', 'CON-05', 'REQ-02', 'SARC-01'],
      runsWith: [],
      revisedBy: ['FEAS-09', 'SARC-12'],
      feedsBackInto: [],
    },
    terms: ['KPI'],
  },
  'CON-04': {
    criticalPath: true,
    purpose: [
      'Build the <b>business case</b>: a cost-of-goods model covering every subsystem, the volume and pricing it sells at, the development cost and when it pays back.',
      'The cost of a co-packaged optics switch is dominated by items a silicon-only model forgets — the optical source, fiber assembly, optical alignment, calibration test time and yield loss at assembly. The model names them so the program can manage them.',
    ],
    flowNote:
      'Step 1 builds cost of goods by subsystem. Step 2 models volume and pricing alongside it. Step 3 estimates development cost, step 4 tests the result against the assumptions most likely to be wrong, and step 5 releases the case.',
    consumes: [
      'Product concept brief from CON-03',
      'Supplier budgetary quotes',
      'Yield and test-time assumptions from prior programs',
      'Pricing and volume input from product management',
      'Engineering cost rates',
    ],
    rel: {
      'CON-D4': '<b>Business case and cost-of-goods model.</b> Produced here; later gates re-run it with better numbers.',
      'CON-D6': '<b>Go / no-go decision package.</b> The business case is the financial half of the decision.',
    },
    risks: [
      '<b>Optical costs underestimated.</b> Fiber attach, alignment and calibration time are left out of cost of goods.',
      '<b>Yield assumed at maturity.</b> Early assembly yield of a multi-die optical package is priced as if it were a mature process.',
      '<b>No sensitivity.</b> The case is presented as one number and nobody knows which assumption breaks it.',
      '<b>Development cost partial.</b> Test hardware, qualification and compliance are missing from the NRE.',
      '<b>Model not maintained.</b> It is built for the go decision and never updated.',
    ],
    roles: [
      { r: 'Product management', d: 'Owns the business case' },
      { r: 'Finance partner', d: 'Cost, pricing and payback modeling' },
      { r: 'Supply chain lead', d: 'Supplier cost inputs' },
      { r: 'Manufacturing lead', d: 'Yield and test-time assumptions' },
      { r: 'Program TPM', d: 'Development cost and its phasing' },
    ],
    effort: [
      ['Cost-of-goods model', 1.5],
      ['Volume, pricing and payback', 1],
      ['Sensitivity analysis', 0.5],
    ],
    entry: [
      'Product concept selected in CON-03',
      'Budgetary quotes for the major subsystems',
      'Pricing assumptions from product management',
    ],
    exit: [
      'Cost of goods covers silicon, photonics, optical source, package, fiber, board and test',
      'Sensitivity to yield, optical source cost and test time stated',
      'Business case approved by product management and finance',
    ],
    dependsOn: ['CON-03'],
    dependsNote: null,
    feedsInto: ['CON-06'],
    measuredBy: [
      'Change in modeled cost of goods at each gate',
      'Cost items added after the go decision',
      'Actual versus modeled assembly yield at pilot build',
    ],
    links: {
      dependsOn: ['CON-03', 'CON-01'],
      feedsInto: ['CON-06', 'REQ-08'],
      runsWith: ['CON-05'],
      revisedBy: ['SARC-11', 'NPI-05'],
      feedsBackInto: [],
    },
    terms: ['BOM', 'NRE'],
  },
  'CON-05': {
    criticalPath: true,
    purpose: [
      'Plan the <b>program</b>: milestones from concept to production release, staffing by discipline, the external partners it depends on, the long-lead suppliers and the budget.',
      'This program runs silicon, photonics, optical sources, advanced packaging, boards, firmware and a factory in parallel, with several external suppliers on the critical path. The plan says which of them must be engaged before architecture is even frozen.',
    ],
    flowNote:
      'Step 1 lays out the milestones. Step 2 estimates staffing and partners in parallel. Step 3 finds the long-lead items that force decisions early, step 4 builds the budget, and step 5 releases the plan.',
    consumes: [
      'Product concept brief from CON-03',
      'Template milestone structure and durations',
      'Resource availability by discipline',
      'Supplier lead times from supply chain',
      'Prior program actuals',
    ],
    rel: {
      'CON-D5': '<b>Program plan.</b> Produced here; it is the baseline schedule and budget the program reports against.',
      'CON-D6': '<b>Go / no-go decision package.</b> The plan is what the decision commits resources to.',
    },
    risks: [
      '<b>Suppliers assumed ready.</b> The plan starts supplier engagement after architecture and meets lead times it cannot absorb.',
      '<b>Serial workstreams.</b> Package, board and test are planned after tapeout rather than beside design.',
      '<b>Staffing by headcount only.</b> Scarce skills — photonics, optical assembly, test — are not planned by name.',
      '<b>No schedule margin at integration.</b> Every subsystem finishes on time in the plan, so the first system build has no slack.',
      '<b>Budget without phasing.</b> Spending peaks are invisible until they arrive.',
    ],
    roles: [
      { r: 'Program management', d: 'Owns the plan' },
      { r: 'Engineering directors', d: 'Staffing by discipline' },
      { r: 'Supply chain lead', d: 'Long-lead items and supplier engagement' },
      { r: 'Finance partner', d: 'Budget and phasing' },
      { r: 'System architect', d: 'Technical sequencing and integration points' },
    ],
    effort: [
      ['Milestone plan', 1],
      ['Staffing and partners', 1],
      ['Budget and release', 1],
    ],
    entry: [
      'Concept selected in CON-03',
      'Template milestones available',
      'Supplier lead times gathered',
    ],
    exit: [
      'Every integration gate dated with its prerequisites',
      'Long-lead suppliers named with the decision each forces and when',
      'Budget and staffing approved by the engineering directors',
    ],
    dependsOn: ['CON-03'],
    dependsNote: null,
    feedsInto: ['CON-06'],
    measuredBy: [
      'Milestone slip at each gate',
      'Long-lead items engaged later than planned',
      'Staffing gaps by discipline',
    ],
    links: {
      dependsOn: ['CON-03'],
      feedsInto: ['CON-06', 'TRDY-10', 'REQ-09'],
      runsWith: ['CON-04'],
      revisedBy: ['SARC-12', 'ICD-10'],
      feedsBackInto: [],
    },
    terms: ['TAT'],
  },
  'CON-06': {
    criticalPath: true,
    purpose: [
      'Take the <b>go / no-go decision</b> on evidence: the concept, the business case, the plan and a risk register whose top risks each have an owner and a mitigation.',
      'A go decision commits the company to years of work across many suppliers. It is recorded with its conditions — the risks that must be retired by named gates — so later reviews can check whether the conditions still hold.',
    ],
    flowNote:
      'Step 1 builds the risk register. Step 2 assembles the package from the concept, business case and plan, and step 3 holds the review and records the decision with its conditions.',
    consumes: [
      'Product concept brief from CON-03',
      'Business case from CON-04',
      'Program plan from CON-05',
      'Landscape assessment and technology bets from CON-02',
      'Executive decision criteria',
    ],
    rel: {
      'CON-D6': '<b>Go / no-go decision package.</b> Produced and decided here; the decision and its conditions open the program.',
    },
    risks: [
      '<b>Decision without conditions.</b> The program starts with no named risks it must retire by a named gate.',
      '<b>Risks unowned.</b> The register lists risks nobody is accountable for.',
      '<b>Optimism bias.</b> The case is reviewed by its authors only.',
      '<b>Feasibility assumed.</b> Technologies still unproven are presented as ready.',
      '<b>Decision unrecorded.</b> What was agreed, and on what basis, cannot be recovered a year later.',
    ],
    roles: [
      { r: 'Program management', d: 'Owns the review and the risk register' },
      { r: 'Executive sponsor', d: 'Takes the decision' },
      { r: 'Product manager', d: 'Presents the market and business case' },
      { r: 'System architect', d: 'Presents the concept and technical risks' },
      { r: 'Finance partner', d: 'Confirms the financial case' },
    ],
    effort: [
      ['Risk register', 0.5],
      ['Review package', 0.5],
      ['Decision review', 0.5],
    ],
    entry: [
      'Concept, business case and plan released',
      'Top risks identified with draft owners',
      'Decision criteria agreed with the sponsor',
    ],
    exit: [
      'Decision recorded with its conditions and the gates that retire them',
      'Every top risk has an owner and a mitigation',
      'Program baseline — concept, budget and plan — approved',
    ],
    dependsOn: ['CON-03', 'CON-04', 'CON-05'],
    dependsNote: null,
    feedsInto: ['REQ-01', 'FEAS-01'],
    measuredBy: [
      'Decision conditions retired on time',
      'Top risks without an owner',
      'Weeks from concept brief to decision',
    ],
    links: {
      dependsOn: ['CON-03', 'CON-04', 'CON-05', 'CON-02'],
      feedsInto: ['REQ-01', 'FEAS-01', 'TRDY-01', 'REQ-09'],
      runsWith: [],
      revisedBy: [],
      feedsBackInto: [],
    },
    terms: ['NRE'],
  },
};
