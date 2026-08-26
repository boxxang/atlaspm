/**
 * Written-up detail for the engineering activities of a stage — what the
 * activity is for, the steps it runs, what it needs, what it produces, who is
 * on it, and what to watch.
 *
 * Product Definition (DEF-01 … DEF-09) is written; the rest of the programme's
 * activities are not yet. `activityDetail()` returns undefined for those, and
 * the engineering table only links the rows it can open.
 *
 * The source is a separate authoring document; this module is its export, so
 * nothing here is edited by hand. Weeks are weeks from the stage start.
 */

/** One step inside an activity. `par` runs alongside the main step before it. */
export interface DetailStep {
  n: number;
  text: string;
  tat: number;
  lane: 'main' | 'par';
}

/**
 * A deliverable this activity stands in some relation to. `produces` means the
 * activity owns it; the rest mean it contributes to one somebody else owns.
 */
export interface DetailRelation {
  id: string;
  rel: 'produces' | 'feeds' | 'informs' | 'gates';
  /** Sentence explaining the relationship. Carries inline <b> markup. */
  text: string;
}

export interface DetailRole {
  /** Role name. The first owns the activity, the last approves it. */
  r: string;
  d: string;
}

/** How the activity's man-months divide, as [label, man-months]. */
export type DetailEffort = [string, number];

export interface DetailLinks {
  dependsOn: string[];
  feedsInto: string[];
  runsWith: string[];
  revisedBy: string[];
  feedsBackInto: string[];
}

export interface ActivityDetail {
  stage: string;
  /** [from, to] in weeks from the stage start. */
  window: [number, number];
  criticalPath: boolean;
  /** Lead paragraphs. Carry inline <b> markup. */
  purpose: string[];
  steps: DetailStep[];
  flowNote: string;
  consumes: string[];
  produces: string[];
  /** Index-aligned to `produces`: the step number that yields each output. */
  producedBy: number[];
  rel: DetailRelation[];
  /** Carry inline <b> markup: the bold half is the headline. */
  risks: string[];
  roles: DetailRole[];
  effort: DetailEffort[];
  entry: string[];
  exit: string[];
  dependsOn: string[];
  /** Present only where there is something to say about the dependencies. */
  dependsNote: string | null;
  feedsInto: string[];
  measuredBy: string[];
  links: DetailLinks;
  terms: string[];
}

export interface GlossaryTerm {
  full: string;
  group: string;
  note: string;
}

/** Keyed by activity reference — DEF-01, DEF-02, … */
export const activityDetails: Record<string, ActivityDetail> = {
 "DEF-01": {
  "stage": "productDefinition",
  "window": [
   0,
   4
  ],
  "criticalPath": true,
  "purpose": [
   "Turn customer and market needs into a single prioritized set of <b>products requirements</b> that serves as the baseline for the the entire program",
   "These product requirements drive PPA, cost, feasibility, and architecture decisions. Until they are baselined and approved, downstream work remains provisional. Late changes can significantly increase cost and delay the program."
  ],
  "steps": [
   {
    "n": 1,
    "text": "Identify stakeholders and plan interviews",
    "tat": 0.5,
    "lane": "main"
   },
   {
    "n": 2,
    "text": "Conduct anchor-customer interviews - two accounts, six sessions",
    "tat": 1.5,
    "lane": "main"
   },
   {
    "n": 3,
    "text": "Analyze market, analyst, and segment data",
    "tat": 1,
    "lane": "par"
   },
   {
    "n": 4,
    "text": "Consolidate and prioritize product requirements",
    "tat": 1,
    "lane": "main"
   },
   {
    "n": 5,
    "text": "Resolve conflicts and set priorities- must-have, should-have, nice-to-have",
    "tat": 0.5,
    "lane": "main"
   },
   {
    "n": 6,
    "text": "Link product requirements to KPIs and PPA targets",
    "tat": 0.5,
    "lane": "par"
   },
   {
    "n": 7,
    "text": "Review and baseline product requirements ",
    "tat": 0.5,
    "lane": "main"
   }
  ],
  "flowNote": "The seven steps total 5.5 weeks of work inside a 4-week window because steps 3 and 6 run in parallel with the main sequence. This is why the activity TAT does not equal the sum of its step durations. If either parallel step has to move onto the critical path, the activity takes 1.5 weeks longer.",
  "consumes": [
   "Customer RFI / RFQ responses",
   "Previous-generation field feedback and known issues",
   "Market forecasts and segment sizing",
   "Competitor specifications and public benchmarks",
   "Sales pipeline and expected volumes"
  ],
  "produces": [
   "Stakeholder map and interview schedule",
   "Customer needs and feedback by account",
   "Market outlook and target segment sizing",
   "Product requirements- ID, owner, priority, and acceptance criteria",
   "Priority decisions and deferred requirements log",
   "Priority ranking record",
   "Requirement-to-KPI and PPA traceability",
   "Approved product requirements baseline"
  ],
  "producedBy": [
   1,
   2,
   3,
   4,
   5,
   5,
   6,
   7
  ],
  "rel": [
   {
    "id": "DEF-D1",
    "rel": "produces",
    "text": "<b>Product requirements document (PRD).</b> The requirements list built here becomes the body of the PRD. This activity does not contribute to the PRD—it produces its content."
   },
   {
    "id": "DEF-D2",
    "rel": "feeds",
    "text": "<b>Target specification—PPA and KPI table.</b> Each ranked requirement becomes a KPI line that <code>DEF-03</code> converts into a number. A target that cannot be traced back to a requirement is a target no customer asked for."
   },
   {
    "id": "DEF-D3",
    "rel": "informs",
    "text": "<b>Product cost and margin model.</b> Provides the volume, segment and ASP assumptions the cost model is built on."
   },
   {
    "id": "DEF-D4",
    "rel": "feeds",
    "text": "<b>Feasibility report.</b> <code>DEF-07</code> assesses feasibility against this specific requirement set. A feasibility study run against a different or older set does not tell the program anything useful."
   },
   {
    "id": "DEF-D6",
    "rel": "gates",
    "text": "<b>Kickoff Go / No-Go decision record.</b> The gate review checks the signoff sheet. If the requirements are not signed, the program does not pass the gate."
   }
  ],
  "risks": [
   "<b>Product requirements not approved by all key stakeholders </b>",
   "<b>New customer requirements introduced after baseline</b> ",
   "<b>Requirements that prescribe solutions instead of defining needs</b>",
   "<b>Requirements without clear acceptance criteria</b> ",
   "<b>Requirements driven too heavily by a single customer</b> "
  ],
  "roles": [
   {
    "r": "Requirements lead",
    "d": "Owns the requirements list and its baseline"
   },
   {
    "r": "Customer engagement",
    "d": "One per anchor account; runs the customer interviews"
   },
   {
    "r": "Product cost analyst",
    "d": "Supplies volume, segment and ASP assumptions"
   },
   {
    "r": "Feasibility liaison",
    "d": "Flags requirements the target node cannot support"
   },
   {
    "r": "Stage lead",
    "d": "Approves the baseline"
   }
  ],
  "effort": [
   [
    "Interviews and market input",
    1.5
   ],
   [
    "Register build and traceability",
    1.5
   ],
   [
    "Workshops and review",
    0.5
   ],
   [
    "Documentation and signoff",
    0.5
   ]
  ],
  "entry": [
   "Program charter drafted and funded to study",
   "Anchor customers identified, NDAs executed",
   "Previous-generation field feedback available"
  ],
  "exit": [
   "Each product requirement has an owner, priority, and acceptance criteria",
   "Requirement conflicts are resolved or assigned to a clear decision owner",
   "Product requirements are baselined and approved by product, engineering, and sales"
  ],
  "dependsOn": [],
  "dependsNote": "Nothing upstream — this is the program's first activity. What it needs is bought, licensed or asked for, not produced by anything before it.",
  "feedsInto": [
   "DEF-02",
   "DEF-05",
   "DEF-06",
   "DEF-07",
   "ARCH-01",
   "IPR-01"
  ],
  "measuredBy": [
   "Requirements baselined against the expected count",
   "Share carrying an acceptance measure",
   "Change requests raised after baseline"
  ],
  "links": {
   "dependsOn": [],
   "feedsInto": [
    "DEF-02",
    "DEF-04",
    "DEF-05",
    "DEF-07",
    "DEF-08",
    "ARCH-01",
    "ARCH-07",
    "TECH-01",
    "TECH-09",
    "IPR-01",
    "PKGD-01"
   ],
   "runsWith": [
    "DEF-06"
   ],
   "revisedBy": [],
   "feedsBackInto": []
  },
  "terms": [
   "TAT",
   "PPA",
   "KPI",
   "ASP",
   "PRD",
   "RFI",
   "RFQ",
   "GB/s",
   "ID",
   "HBM3E"
  ]
 },
 "DEF-02": {
  "stage": "productDefinition",
  "window": [
   1,
   6
  ],
  "criticalPath": true,
  "purpose": [
   "The product requirements define what customers expect. <b>This activity translates those requirements into representative workloads and measurable KPI targets for the silicon.</b>",
   "These workloads guide the architecture optimization in <code>ARCH-01</code>. If they don not represent real customer usage, the architecture may be optimized for the wrong use cases. Verification may not catch this because it validates design correctness, not workload selection."
  ],
  "steps": [
   {
    "n": 1,
    "text": "Define key use cases from product requirements",
    "tat": 0.5,
    "lane": "main"
   },
   {
    "n": 2,
    "text": "Capture workload traces for LLM, vision, and recommendation",
    "tat": 1.5,
    "lane": "main"
   },
   {
    "n": 3,
    "text": "Run workloads on previous-generation silicon for baseline",
    "tat": 1,
    "lane": "par"
   },
   {
    "n": 4,
    "text": "Define KPIs — TOPS, TOPS/W, tokens/s, TTFT, batch scaling",
    "tat": 1.5,
    "lane": "main"
   },
   {
    "n": 5,
    "text": "Define precision and quantization policy — INT8, FP8, mixed",
    "tat": 1,
    "lane": "par"
   },
   {
    "n": 6,
    "text": "Analyze KPI sensitivity to architecture choices",
    "tat": 1,
    "lane": "main"
   },
   {
    "n": 7,
    "text": "Package workload suite and hand off to architecture",
    "tat": 0.5,
    "lane": "main"
   }
  ],
  "flowNote": "The main sequence fills the 5-week window exactly. Steps 3 and 5 run in parallel: the reference runs need lab time rather than analyst time, and the precision policy can be settled while traces are still being captured.",
  "consumes": [
   "Product requirement from DEF-01",
   "Customer models and workload traces, where permitted by NDA",
   "Previous-generation silicon and reference platform",
   "Public models and benchmarks workloads",
   "Expected deployment mix by target segment"
  ],
  "produces": [
   "Prioritized use cases with expected workloads mix",
   "Representative workload traces for each use case",
   "Baseline performance measurements",
   "KPI targets and measurement conditions for each workload",
   "Precision and quantization policy",
   "KPI sensitivity by architectural parameter",
   "Models, traces, and execution harness ready for architecture modeling"
  ],
  "producedBy": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "rel": [
   {
    "id": "DEF-D2",
    "rel": "produces",
    "text": "<b>Target specification—PPA and KPI table.</b> This activity derives the KPI half of the deliverable; <code>DEF-03</code> derives the PPA half. The two are published as a single table."
   },
   {
    "id": "DEF-D1",
    "rel": "feeds",
    "text": "<b>Product requirements document.</b> The use-case list and the deployment mix are written back into the PRD as the context the requirements are based on."
   },
   {
    "id": "DEF-D4",
    "rel": "feeds",
    "text": "<b>Feasibility report.</b> Feasibility is assessed against these KPI numbers rather than against the requirement text."
   }
  ],
  "risks": [
   "<b>Workload traces that do not represent real customer usage</b>",
   "<b>Limited access to customer models due to NDA restriction</b> ",
   "<b>Workload mix based on estimates rather than measured data</b> ",
   "<b>Undefined precision and quantization policy</b> ",
   "<b>KPIs without Cleary defined operating conditions</b> "
  ],
  "roles": [
   {
    "r": "Workload architect",
    "d": "Owns the workload suite and the KPI derivation"
   },
   {
    "r": "ML performance engineer",
    "d": "Trace capture, reference runs and the precision study"
   },
   {
    "r": "Systems analyst",
    "d": "Deployment mix and sensitivity analysis"
   },
   {
    "r": "Customer engagement",
    "d": "Obtains customer models and confirms they are representative"
   },
   {
    "r": "Architecture liaison",
    "d": "Accepts the handoff and confirms the suite can be modeled"
   }
  ],
  "effort": [
   [
    "Trace capture and reference runs",
    2
   ],
   [
    "KPI derivation",
    1.5
   ],
   [
    "Sensitivity study",
    1
   ],
   [
    "Precision and quantization policy",
    1
   ],
   [
    "Suite packaging and handoff",
    0.5
   ]
  ],
  "entry": [
   "Requirement register at v0.9 or better",
   "Lab access to the previous-generation platform",
   "NDA coverage for any customer-supplied model"
  ],
  "exit": [
   "Each KPI is linked to a defined workload and test conditions",
   "Workload suite runs end to end on the reference platform",
   "The architecture team confirms the workloads are ready for modeling."
  ],
  "dependsOn": [
   "DEF-01"
  ],
  "dependsNote": null,
  "feedsInto": [
   "DEF-03",
   "DEF-05",
   "DEF-07",
   "ARCH-01",
   "DV-09"
  ],
  "measuredBy": [
   "KPIs traceable to a workload",
   "Workload suite runtime on the reference platform",
   "Spread between the sensitivity study and the eventual ARCH-01 model"
  ],
  "links": {
   "dependsOn": [
    "DEF-01"
   ],
   "feedsInto": [
    "DEF-03",
    "DEF-05",
    "DEF-07",
    "ARCH-01",
    "ARCH-03",
    "DV-08",
    "DV-09"
   ],
   "runsWith": [],
   "revisedBy": [],
   "feedsBackInto": []
  },
  "terms": [
   "PPA",
   "KPI",
   "PRD",
   "NDA",
   "TOPS",
   "TOPS/W",
   "INT8",
   "FP8",
   "LLM",
   "ML"
  ]
 },
 "DEF-03": {
  "stage": "productDefinition",
  "window": [
   3,
   7
  ],
  "criticalPath": true,
  "purpose": [
   "<b>Translate the KPI targets into clear frequency, power and die-area budgets, and allocate them to each block</b>",
   "Program-level targets only become actionable when they are assigned to specific owners. For example, a 75 W board power target should be broken down into die, domain, and block-level budgets. This makes budget overruns visible early, when the design can still be adjusted without impacting performance or requiring a respin."
  ],
  "steps": [
   {
    "n": 1,
    "text": "Define frequency target from KPIs and expected IPC",
    "tat": 0.75,
    "lane": "main"
   },
   {
    "n": 2,
    "text": "Break down the power envelope - board, package, die, and domain level",
    "tat": 1,
    "lane": "main"
   },
   {
    "n": 3,
    "text": "Allocate die area based on block list and IP reuse",
    "tat": 1,
    "lane": "main"
   },
   {
    "n": 4,
    "text": "Defince initial operating voltage and multi-Vt strategy",
    "tat": 0.5,
    "lane": "par"
   },
   {
    "n": 5,
    "text": "Evaluate PPA sensitivity across candidate nodes",
    "tat": 0.75,
    "lane": "par"
   },
   {
    "n": 6,
    "text": "Allocate PPA budgets to each block and assign owners",
    "tat": 0.75,
    "lane": "main"
   },
   {
    "n": 7,
    "text": "Review PPA targets with architecture and physical design",
    "tat": 0.5,
    "lane": "main"
   }
  ],
  "flowNote": "Allocation is the step that matters, and it sits late in the sequence because it cannot begin until the block list is stable. Steps 4 and 5 run in parallel with the budget work; both feed the review rather than the budgets themselves.",
  "consumes": [
   "KPI targets from DEF-02",
   "Block list and IP reuse plan from the architecture definition",
   "Node PPA data from TECH-03",
   "Previous-generation power and area data",
   "Thermal and board constraints from the product requirements"
  ],
  "produces": [
   "Frequency target with the IPC assumption",
   "Power budget from board to domain level",
   "Die area budget by block",
   "Operating voltage and multi-Vt strategy",
   "PPA sensitivity by candidate node",
   "Per-block PPA budget with owners",
   "Approved PPA targets and review record"
  ],
  "producedBy": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "rel": [
   {
    "id": "DEF-D2",
    "rel": "produces",
    "text": "<b>Target specification—PPA and KPI table.</b> This activity defines the PPA target. <code>DEF-02</code> defines the KPI targets, and both are combined into a single target specification."
   },
   {
    "id": "DEF-D4",
    "rel": "feeds",
    "text": "<b>Feasibility report.</b> These are the numbers <code>DEF-07</code> asks each candidate process node to support."
   },
   {
    "id": "DEF-D3",
    "rel": "informs",
    "text": "<b>Product cost and margin model.</b> The die area budget is the single largest input to the cost model."
   }
  ],
  "risks": [
   "PPA targets that exceed realistic process capability",
   "Power budgets without sufficient margin",
   "Area budgets that do not account for IP reuse",
   "PPA budgets without clear owners",
   "PPA targets finalized before the DEF-07 feasibility assessment"
  ],
  "roles": [
   {
    "r": "PPA lead",
    "d": "Owns the budget tree and its allocation"
   },
   {
    "r": "Architect",
    "d": "Supplies max frequency and IPC assumptions and the block list"
   },
   {
    "r": "Power analyst",
    "d": "Decomposes the power budget and sets the voltage strategy"
   },
   {
    "r": "Physical design liaison",
    "d": "Confirms the frequency and area targets are achievable on the node"
   },
   {
    "r": "Stage lead",
    "d": "Arbitrates when two blocks contest the same budget"
   }
  ],
  "effort": [
   [
    "Frequency and power budgets",
    1
   ],
   [
    "Die area budget",
    0.75
   ],
   [
    "Node sensitivity",
    0.5
   ],
   [
    "Per-block allocation",
    0.5
   ],
   [
    "Review and arbitration",
    0.25
   ]
  ],
  "entry": [
   "KPI table available from DEF-02",
   "Block list stable enough to allocate against",
   "At least two candidate nodes characterized by TECH-03"
  ],
  "exit": [
   "Frequency, power and area targets include clearly defined assumptions",
   "Each block has an allocated PPA budget and a clear owner",
   "Architecture and physical design approve the PPA targets."
  ],
  "dependsOn": [
   "DEF-02",
   "DEF-05",
   "TECH-03"
  ],
  "dependsNote": null,
  "feedsInto": [
   "DEF-04",
   "DEF-07",
   "ARCH-06",
   "SYN-01",
   "PD-09"
  ],
  "measuredBy": [
   "Share of the die budget allocated to a named owner",
   "Margin held back against each budget",
   "Delta between these targets and the ARCH-06 allocation"
  ],
  "links": {
   "dependsOn": [
    "DEF-02",
    "DEF-05"
   ],
   "feedsInto": [
    "DEF-04",
    "DEF-07",
    "ARCH-01",
    "ARCH-05",
    "ARCH-06",
    "ARCH-08",
    "TECH-02",
    "SYN-01",
    "PD-09",
    "PKGD-07",
    "BU-08",
    "MP-01"
   ],
   "runsWith": [
    "TECH-03"
   ],
   "revisedBy": [],
   "feedsBackInto": []
  },
  "terms": [
   "PPA",
   "KPI",
   "IP",
   "ECO",
   "IPC"
  ]
 },
 "DEF-04": {
  "stage": "productDefinition",
  "window": [
   3,
   7
  ],
  "criticalPath": false,
  "purpose": [
   "<b>Estimate the product cost before committing to development. Combine wafer, mask, package, test, and yield assumptions to determine the expected unit cost and product margin at volume. </b>",
   "The cost model is also a key feasibility check. A product that meets its KPI targets but exceeds the cost target may not be commercially viable. Identifying this early allows the team to adjust die size, packaging, or cost drivers before the design is finalized. "
  ],
  "steps": [
   {
    "n": 1,
    "text": "Estimate die area from the block list and IP reuse plan",
    "tat": 0.75,
    "lane": "main"
   },
   {
    "n": 2,
    "text": "Calculate wafer cost and gross die per wafer for each candidate node",
    "tat": 0.5,
    "lane": "main"
   },
   {
    "n": 3,
    "text": "Estimate yield using defect density for each candidate node",
    "tat": 1,
    "lane": "main"
   },
   {
    "n": 4,
    "text": "Estimate package and substrate cost - interposer, substrate, and HBM",
    "tat": 0.75,
    "lane": "par"
   },
   {
    "n": 5,
    "text": "Estimate wafer sort and final test",
    "tat": 0.5,
    "lane": "par"
   },
   {
    "n": 6,
    "text": "Calculate unit cost and margin at a forecast volume",
    "tat": 1,
    "lane": "main"
   },
   {
    "n": 7,
    "text": "Analyze sensitivities to the three largest cost drivers",
    "tat": 0.75,
    "lane": "main"
   }
  ],
  "flowNote": "The sensitivity analysis in step 7 is not optional. On a 2.5D product, cost is dominated by yield, interposer supply and HBM pricing, and at this point in the program all three are assumptions rather than quoted prices.",
  "consumes": [
   "Die area budget from DEF-03",
   "Wafer, mask and NRE cost estimate from TECH-04",
   "Package architecture assumptions from the product requirement",
   "HBM and substrate cost estimate",
   "Volume forecast and target ASP"
  ],
  "produces": [
   "Die area estimate with expected range",
   "Wafer cost and gross die per wafer by node",
   "Yield model and expected yield by node",
   "Package and substrate cost breakdown",
   "Test cost with its test-time assumption",
   "Product cost model and margin at the forecast volume",
   "Margin roll-up at the forecast volume",
   "Cost ceiling statement for the design",
   "Sensitivity analysis and impact range"
  ],
  "producedBy": [
   1,
   2,
   3,
   4,
   5,
   6,
   6,
   6,
   7
  ],
  "rel": [
   {
    "id": "DEF-D3",
    "rel": "produces",
    "text": "<b>Product cost and margin model.</b> This activity produces the product cost and margin model with all key assumptions, allowing downstream teams to update and re-run the model as inputs change."
   },
   {
    "id": "DEF-D4",
    "rel": "feeds",
    "text": "<b>Feasibility report.</b> A process node that meets the PPA targets but breaks the cost ceiling is recorded as infeasible, and this model is the basis for that finding."
   },
   {
    "id": "DEF-D6",
    "rel": "gates",
    "text": "<b>Kickoff Go / No-Go decision record.</b> The funding decision is a margin decision. If the cost model does not close, the program does not pass the gate."
   }
  ],
  "risks": [
   "<b>Yield assumptions based on mature-node data</b> ",
   "<b>Package costs underestimated in the overall cost model</b> ",
   "<b>Test costs without clear test-time assumptions</b>",
   "<b>ASP based on a single-point estimate</b> ",
   "<b>Die area estimates without sufficient margin</b> "
  ],
  "roles": [
   {
    "r": "Product cost analyst",
    "d": "Owns the cost model and its assumptions"
   },
   {
    "r": "Yield engineer",
    "d": "Supplies defect density and yield curves per node"
   },
   {
    "r": "Package cost liaison",
    "d": "Supplies interposer, substrate and HBM pricing"
   },
   {
    "r": "Test engineering liaison",
    "d": "Supplies test time and tester rate assumptions"
   },
   {
    "r": "Finance partner",
    "d": "Owns volume, ASP and margin treatment"
   }
  ],
  "effort": [
   [
    "Yield model per node",
    1
   ],
   [
    "Cost roll-up and margin",
    0.75
   ],
   [
    "Package and test cost lines",
    0.75
   ],
   [
    "Sensitivity analysis",
    0.5
   ]
  ],
  "entry": [
   "Die area budget available from DEF-03",
   "Wafer and mask quotations received from TECH-04",
   "Volume forecast agreed with sales"
  ],
  "exit": [
   "Unit cost and margin targets are met at the forecast volume",
   "Each cost assumption has a clear source and date",
   "Sensitivities analysis identifies the top three cost drivers and their impact range."
  ],
  "dependsOn": [
   "DEF-01",
   "DEF-03",
   "TECH-04"
  ],
  "dependsNote": null,
  "feedsInto": [
   "DEF-07",
   "DEF-09",
   "TECH-04",
   "MP-05"
  ],
  "measuredBy": [
   "Margin at forecast volume against the target",
   "Share of model inputs backed by a quotation rather than an estimate",
   "Cost delta carried by the sensitivity range"
  ],
  "links": {
   "dependsOn": [
    "DEF-01",
    "DEF-03",
    "DEF-06",
    "TECH-07"
   ],
   "feedsInto": [
    "DEF-07",
    "DEF-09",
    "ARCH-02",
    "PDK-06",
    "DFT-02",
    "PKGD-01",
    "TEST-01",
    "TEST-07",
    "MP-01",
    "MP-05"
   ],
   "runsWith": [
    "TECH-04"
   ],
   "revisedBy": [
    "AMS-08",
    "TC-08"
   ],
   "feedsBackInto": []
  },
  "terms": [
   "PPA",
   "KPI",
   "NRE",
   "ASP",
   "DFT",
   "HBM (ESD)",
   "HBM"
  ]
 },
 "DEF-05": {
  "stage": "productDefinition",
  "window": [
   2,
   5
  ],
  "criticalPath": false,
  "purpose": [
   "<b>Define the memory and interface bandwidth required by the target workloads, and translate those requirements into the interface configuration needed by the package and Floorplan. </b>",
   "Bandwidth decisions directly affect the physical design and product cost. For example, using two HBM stacks instead of one impacts the interposer, substrate, power delivery, and package cost. Defining these requirements early reduces the risk of costly changes later in the program."
  ],
  "steps": [
   {
    "n": 1,
    "text": "Determine bandwidth demand from DEF-02 workloads",
    "tat": 0.75,
    "lane": "main"
   },
   {
    "n": 2,
    "text": "Size the memory hierarchy - on-die SRAM, HBM capacity, stacks, and channels.",
    "tat": 1,
    "lane": "main"
   },
   {
    "n": 3,
    "text": "Size the host interface - PCIe/CXL generation and lane count",
    "tat": 0.5,
    "lane": "par"
   },
   {
    "n": 4,
    "text": "Define Die-to-die interface requirement for chiplet option",
    "tat": 0.5,
    "lane": "par"
   },
   {
    "n": 5,
    "text": "Translate interface requirements into pin and bump budgets",
    "tat": 0.75,
    "lane": "main"
   },
   {
    "n": 6,
    "text": "Review requirements with architecture and package teams",
    "tat": 0.5,
    "lane": "main"
   }
  ],
  "flowNote": "Step 5 is the step that creates the commitment. A bandwidth figure stated in GB/s does not constrain any downstream team. The same figure expressed as a bump count constrains the floorplan, the package design and the cost model at the same time.",
  "consumes": [
   "Workload traces and KPI target from DEF-02",
   "capacity and latency requirements from the product requirements ",
   "HBM technology availability and roadmap",
   "PCIe, CXL, and UCIe standard roadmap",
   "Previous-generation bandwidth utilization data"
  ],
  "produces": [
   "Bandwidth requirements by workload and memory hierarchy level",
   "Memory configuration — capacity, stacks, and channels",
   "Host interface configuration — generation and lane count",
   "Die-to-die interface requirement",
   "Pin and bump budget",
   "Approved memory, interface and bump requirements"
  ],
  "producedBy": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "rel": [
   {
    "id": "DEF-D1",
    "rel": "feeds",
    "text": "<b>Product requirements document.</b> Bandwidth and capacity enter the PRD as numbered requirements rather than as qualitative statements."
   },
   {
    "id": "DEF-D2",
    "rel": "feeds",
    "text": "<b>Target specification.</b> The bandwidth figures become KPI lines, and the bump budget becomes an area constraint on the PPA half of the table."
   }
  ],
  "risks": [
   "<b>Bandwidth requirements based on peak rather than sustained demand</b>",
   "<b>Capacity and bandwidth treated as the same requirement</b>",
   "<b>Interface standard still under revision.",
   "<b>Interface requirements defined without a pin and bump budget. </b>",
   "<b>Chiplet decision deferred without clear assumptions</b> "
  ],
  "roles": [
   {
    "r": "Memory systems architect",
    "d": "Owns hierarchy sizing and the bandwidth table"
   },
   {
    "r": "Interface architect",
    "d": "Selects the host and die-to-die interfaces"
   },
   {
    "r": "Workload analyst",
    "d": "Extracts sustained bandwidth demand from the workload traces"
   },
   {
    "r": "Package liaison",
    "d": "Confirms the bump budget is physically buildable"
   },
   {
    "r": "Architecture liaison",
    "d": "Carries the requirement into ARCH-03"
   }
  ],
  "effort": [
   [
    "Hierarchy sizing and bandwidth analysis",
    1
   ],
   [
    "Interface sizing",
    0.5
   ],
   [
    "Bump budget translation and review",
    0.5
   ]
  ],
  "entry": [
   "Workload traces available from DEF-02",
   "Requirement register carries capacity and latency requirements",
   "HBM and interface roadmaps available under NDA"
  ],
  "exit": [
   "Sustained bandwidth requirements are defined for each workload and operating condition",
   "Memory configuration and interface counts are defined with clear rationale. ",
   "Package team confirms the bump budget is physically feasible"
  ],
  "dependsOn": [
   "DEF-01",
   "DEF-02"
  ],
  "dependsNote": null,
  "feedsInto": [
   "DEF-03",
   "ARCH-03",
   "ARCH-04",
   "PKGD-02"
  ],
  "measuredBy": [
   "Bandwidth headroom against sustained demand",
   "Bump budget against the package's stated capability",
   "Interface revisions still open at architecture freeze"
  ],
  "links": {
   "dependsOn": [
    "DEF-01",
    "DEF-02"
   ],
   "feedsInto": [
    "DEF-03",
    "ARCH-01",
    "ARCH-03",
    "ARCH-04",
    "PKGD-01",
    "PKGD-02",
    "TEST-02",
    "MP-10",
    "MP-11"
   ],
   "runsWith": [],
   "revisedBy": [],
   "feedsBackInto": []
  },
  "terms": [
   "PPA",
   "KPI",
   "PRD",
   "NDA",
   "SRAM",
   "HBM (ESD)",
   "HBM",
   "PCIe",
   "CXL",
   "UCIe",
   "GB/s"
  ]
 },
 "DEF-06": {
  "stage": "productDefinition",
  "window": [
   0,
   4
  ],
  "criticalPath": false,
  "purpose": [
   "<b>Benchmark the product against competitors expected to be available at the target launch date, not just products available today.</b>",
   "Current-generation comparisons do not reflect the competitive landscape at launch. Since the product is expected to reach the market in about thirty months, competitor performance should be projected for the same timeframe using public roadmaps, technology trends, and expected product cycles."
  ],
  "steps": [
   {
    "n": 1,
    "text": "Identify target competitor and expected launch timing",
    "tat": 0.5,
    "lane": "main"
   },
   {
    "n": 2,
    "text": "Collect public benchmarks, specifications, and public product information",
    "tat": 1,
    "lane": "main"
   },
   {
    "n": 3,
    "text": "Normalize benchmark data and comparison conditions",
    "tat": 1,
    "lane": "par"
   },
   {
    "n": 4,
    "text": "Project competitor capabilities to our target launch window",
    "tat": 1,
    "lane": "main"
   },
   {
    "n": 5,
    "text": "Compare our product targets against expected competitors",
    "tat": 1,
    "lane": "main"
   },
   {
    "n": 6,
    "text": "Review gaps with product and sales teams",
    "tat": 0.5,
    "lane": "main"
   }
  ],
  "flowNote": "Normalization runs in parallel because it is time-consuming and independent of data collection. Vendors quote TOPS at different precisions, batch sizes and power points, and none of the published figures are comparable until they have been restated on a common basis.",
  "consumes": [
   "Competitor specifications, disclosures and conference material",
   "Public benchmark results including MLPerf",
   "Foundry process roadmaps and node timing",
   "Analyst forecasts for competitor launches",
   "Competitive insights from sales and customer engagement"
  ],
  "produces": [
   "Target competitor list with expected launch timing",
   "Competitor benchmark and specification data",
   "Comparable benchmark data with clearly defined conditions",
   "Expected competitor performance and capabilities at launch",
   "Prioritized performance and capability gaps",
   "",
   "Competitive gaps to feed into DEF-01 product requirements"
  ],
  "producedBy": [
   1,
   2,
   3,
   4,
   5,
   5,
   6
  ],
  "rel": [
   {
    "id": "DEF-D1",
    "rel": "feeds",
    "text": "<b>Product requirements document.</b> The capability gaps identified here become requirements. A gap that is not written into the requirement set is not addressed by the design."
   },
   {
    "id": "DEF-D3",
    "rel": "informs",
    "text": "<b>Product cost and margin model.</b> Competitive position is the basis on which the ASP assumption is defended."
   }
  ],
  "risks": [
   "<b>Comparing only against products available today</b>",
   "<b>Using competitor performance data without consistent comparison conditions</b> ",
   "<b>Competitive gaps without clear owners or follow-up actions</b> ",
   "<b>Positioning based on a single performance metric</b> ",
   "<b>Competitor launch dates treated as fixed.</b> "
  ],
  "roles": [
   {
    "r": "Product marketing lead",
    "d": "Owns the competitor set and the positioning statement"
   },
   {
    "r": "Performance analyst",
    "d": "Normalizes published figures and projects them forward"
   },
   {
    "r": "Technology analyst",
    "d": "Reads node cadence and vendor roadmaps"
   },
   {
    "r": "Sales liaison",
    "d": "Supplies field intelligence and account-level context"
   },
   {
    "r": "Stage lead",
    "d": "Converts the gap list into requirements"
   }
  ],
  "effort": [
   [
    "Collection and competitor set",
    0.75
   ],
   [
    "Normalization and projection",
    0.75
   ],
   [
    "Positioning and gap list",
    0.5
   ]
  ],
  "entry": [
   "Product concept defined well enough to name a competitor set",
   "Access to analyst material and benchmark submissions",
   "Launch-window assumption from the program schedule"
  ],
  "exit": [
   "Competitor comparisons use consistent and clearly defined conditions",
   "Competitive performance is projected to the target launch window",
   "Key competitive gaps are identified and fed back to DEF-01 as candidate product requirements."
  ],
  "dependsOn": [
   "DEF-01"
  ],
  "dependsNote": null,
  "feedsInto": [
   "DEF-01",
   "DEF-04",
   "DEF-09"
  ],
  "measuredBy": [
   "Competitors covered against the expected launch field",
   "Share of comparisons normalized rather than quoted",
   "Gaps converted into tracked requirements"
  ],
  "links": {
   "dependsOn": [],
   "feedsInto": [
    "DEF-04",
    "DEF-09",
    "TEST-01",
    "MP-05"
   ],
   "runsWith": [
    "DEF-01"
   ],
   "revisedBy": [
    "TEST-09"
   ],
   "feedsBackInto": []
  },
  "terms": [
   "ASP",
   "TOPS",
   "TOPS/W",
   "MLPerf"
  ]
 },
 "DEF-07": {
  "stage": "productDefinition",
  "window": [
   4,
   8
  ],
  "criticalPath": true,
  "purpose": [
   "<b>Evaluate the product requirements, PPA targets, and cost model against candidate process nodes</b> to determine whether the product is feasible as defined or requires specific tradeoffs.",
   "This assessment provides an early Go / No-Go input before the process node and development budget are committed. If major feasibility gaps are identified, the team can adjust requirements, PPA targets, cost assumptions, or node selection before committing to development."
  ],
  "steps": [
   {
    "n": 1,
    "text": "Confirm candidate process nodes with the technology team",
    "tat": 0.5,
    "lane": "main"
   },
   {
    "n": 2,
    "text": "Evaluate PPA feasibility for each node - density, frequency, and leakage",
    "tat": 1.25,
    "lane": "main"
   },
   {
    "n": 3,
    "text": "Assess IP availability and readiness for each node",
    "tat": 0.75,
    "lane": "par"
   },
   {
    "n": 4,
    "text": "Re-run the product cost model for each node",
    "tat": 0.5,
    "lane": "par"
   },
   {
    "n": 5,
    "text": "Evaluate package and thermal feasibility at target power",
    "tat": 0.75,
    "lane": "main"
   },
   {
    "n": 6,
    "text": "Identify required tradeoffs and their impact for each node",
    "tat": 0.75,
    "lane": "main"
   },
   {
    "n": 7,
    "text": "Determine feasibility and recommend a path forward",
    "tat": 0.75,
    "lane": "main"
   }
  ],
  "flowNote": "The concession list is the part of the deliverable that actually gets used. A binary verdict gives the decision review nothing to act on. A list stating \"this node, at 200 MHz below target, with the PHY licensed rather than developed internally\" gives the review a decision it can make.",
  "consumes": [
   "Product requirement from DEF-01",
   "PPA targets from DEF-03",
   "Product cost model from DEF-04",
   "Node characterization and DTCO results from TECH-03",
   "IP availability and readiness by candidate node"
  ],
  "produces": [
   "Candidate process node shortlist",
   "PPA feasibility assessment by node",
   "IP readiness assessment by node",
   "Product cost and margin by node",
   "Package and thermal feasibility by node",
   "Required tradeoffs and impact by node",
   "Feasibility decision and recommended path"
  ],
  "producedBy": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "rel": [
   {
    "id": "DEF-D4",
    "rel": "produces",
    "text": "The feasibility report includes the feasibility decision, assessment matrix, and required tradeoffs, providing the basis for the Go / No-Go decision."
   },
   {
    "id": "DEF-D6",
    "rel": "gates",
    "text": "<b>Kickoff Go / No-Go decision record.</b> A No-Go recommendation from this activity is the only mechanism in the stage that can stop the program, and it has to reach the decision review without being edited."
   }
  ],
  "risks": [
   "<b>Feasibility assessed after the node has been selected.</b> ",
   "<b>Optimistic assessment at the boundary.</b> ",
   "<b>IP availability taken from the vendor roadmap.</b>",
   "<b>Thermal feasibility checked at typical rather than maximum power.</b>",
   "<b>Required tradeoffs identified without their impact being quantified</b> "
  ],
  "roles": [
   {
    "r": "Feasibility lead",
    "d": "Owns the verdict and the concession list"
   },
   {
    "r": "PPA analyst",
    "d": "Assesses achievability per node against the DEF-03 targets"
   },
   {
    "r": "IP strategist",
    "d": "Assesses IP availability and porting status per node"
   },
   {
    "r": "Thermal and package liaison",
    "d": "Assesses feasibility at rated power"
   },
   {
    "r": "Stage lead",
    "d": "Carries the recommendation into the gate review"
   }
  ],
  "effort": [
   [
    "PPA achievability per node",
    1
   ],
   [
    "IP and cost checks",
    0.75
   ],
   [
    "Package and thermal feasibility",
    0.5
   ],
   [
    "Concession list and verdict",
    0.75
   ]
  ],
  "entry": [
   "PPA targets published by DEF-03",
   "Cost model closing in DEF-04",
   "At least two nodes characterized by TECH-03"
  ],
  "exit": [
   "Each key target is assessed for feasibility on every candidate node",
   "Required tradeoffs and their cost or impact are clearly identified.",
   "Feasibility decision and recommended path forward are documented."
  ],
  "dependsOn": [
   "DEF-01",
   "DEF-03",
   "DEF-04",
   "TECH-03"
  ],
  "dependsNote": null,
  "feedsInto": [
   "DEF-09",
   "TECH-01",
   "ARCH-01",
   "IPR-03"
  ],
  "measuredBy": [
   "Targets assessed against every candidate node",
   "Concessions accepted at the gate against those raised",
   "Findings later contradicted by ARCH-01 modeling"
  ],
  "links": {
   "dependsOn": [
    "DEF-01",
    "DEF-02",
    "DEF-03",
    "DEF-04",
    "TECH-03",
    "TECH-04",
    "TECH-07"
   ],
   "feedsInto": [
    "DEF-08",
    "DEF-09",
    "ARCH-01",
    "IPR-03"
   ],
   "runsWith": [
    "TECH-01"
   ],
   "revisedBy": [],
   "feedsBackInto": []
  },
  "terms": [
   "PPA",
   "DTCO",
   "IP",
   "PHY"
  ]
 },
 "DEF-08": {
  "stage": "productDefinition",
  "window": [
   4,
   8
  ],
  "criticalPath": false,
  "purpose": [
   "<b>Translate the program milestones into a detailed schedule and determine the engineering resources required to execute it.</b> Compare those needs against the resources actually available.",
   "<b>The schedule is only achievable if the required resources are available at the right time.</b> Identifying resource gaps early allows the team to adjust staffing, priorities, or the schedule before the program is committed."
  ],
  "steps": [
   {
    "n": 1,
    "text": "Select the program profile and set the kickoff date",
    "tat": 0.5,
    "lane": "main"
   },
   {
    "n": 2,
    "text": "Adjust stage baseline for the program scope",
    "tat": 0.75,
    "lane": "main"
   },
   {
    "n": 3,
    "text": "Estimate engineering effort by stage and discipline",
    "tat": 1,
    "lane": "main"
   },
   {
    "n": 4,
    "text": "Compare staffing needs against available capacity",
    "tat": 1,
    "lane": "main"
   },
   {
    "n": 5,
    "text": "Add external lead times — substrate, probe card, IP, and shuttle",
    "tat": 0.75,
    "lane": "par"
   },
   {
    "n": 6,
    "text": "Identify the critical path and define schedule buffers",
    "tat": 0.75,
    "lane": "main"
   },
   {
    "n": 7,
    "text": "Review and commit the program schedule",
    "tat": 0.5,
    "lane": "par"
   }
  ],
  "flowNote": "The supplier lead-time overlay runs in parallel and changes more dates than the internal plan does. A probe card and an advanced substrate each carry roughly twenty weeks of lead time, they are ordered against dates this activity sets, and once ordered they are outside the program's control.",
  "consumes": [
   "Program milestones and stage baselines",
   "Effort estimates by activity",
   "Available engineering capacity and existing program commitments",
   "Supplier lead times - substrate, interposer, probe card, IP, and shuttle",
   "Required tradeoffs from DEF-07"
  ],
  "produces": [
   "Program profile with committed kickoff date",
   "Program schedule with stage boundaries and milestones",
   "Engineering effort by stage and discipline",
   "Staffing plan with identified resource gaps",
   "External lead times and required order dates",
   "Critical path and schedule buffers",
   "Approved program schedule and resource plan"
  ],
  "producedBy": [
   1,
   2,
   3,
   4,
   5,
   6,
   7
  ],
  "rel": [
   {
    "id": "DEF-D5",
    "rel": "produces",
    "text": "The program charter combines the execution schedule, staffing plan, and resource requirements into a single baseline for program execution."
   },
   {
    "id": "DEF-D6",
    "rel": "gates",
    "text": "<b>Kickoff Go / No-Go decision record.</b> The gate approves both a schedule and a headcount. A plan with no resources committed against it does not pass the gate."
   }
  ],
  "risks": [
   "<b>Staffing needs that exceed available engineering capacity</b> ",
   "<b>Program baselines used without adjusting for actual scope</b>",
   "<b>Supplier lead times not included in the program schedule</b> ",
   "<b>Schedule buffers concentrated only at the end of the program</b>",
   "<b>Critical path not derived from actual task dependencies</b> "
  ],
  "roles": [
   {
    "r": "Program manager",
    "d": "Owns the schedule, the buffers and the critical path"
   },
   {
    "r": "Resource manager",
    "d": "Owns capacity, the headcount curve and the hiring plan"
   },
   {
    "r": "Discipline leads",
    "d": "Confirm the effort roll-up for their own stages"
   },
   {
    "r": "Procurement liaison",
    "d": "Supplies supplier lead times and order-by dates"
   },
   {
    "r": "Finance partner",
    "d": "Converts effort into budget"
   }
  ],
  "effort": [
   [
    "Effort roll-up by stage and discipline",
    1
   ],
   [
    "Headcount curve against capacity",
    0.75
   ],
   [
    "Lead-time overlay",
    0.5
   ],
   [
    "Buffer and critical path",
    0.5
   ],
   [
    "Review and commitment",
    0.25
   ]
  ],
  "entry": [
   "Milestone profile selected",
   "Scope stable enough to adjust baselines against",
   "Organization capacity data available"
  ],
  "exit": [
   "Program schedule is based on a committed kickoff date",
   "Required staffing is matched against available capacity, with resource gaps identified",
   "Critical path and schedule buffers are defined for key milestones"
  ],
  "dependsOn": [
   "DEF-01",
   "DEF-07"
  ],
  "dependsNote": null,
  "feedsInto": [
   "DEF-09",
   "TECH-05",
   "IPR-09",
   "TEST-02",
   "PKGD-09"
  ],
  "measuredBy": [
   "Peak headcount against available capacity",
   "Buffer weeks held in front of fixed gates",
   "Long-lead items with an order-by date on the plan"
  ],
  "links": {
   "dependsOn": [
    "DEF-01",
    "DEF-07"
   ],
   "feedsInto": [
    "DEF-09",
    "TECH-05",
    "PDK-12",
    "IPR-09",
    "RTL-10",
    "FAB-09",
    "PKGD-09",
    "TEST-02"
   ],
   "runsWith": [],
   "revisedBy": [],
   "feedsBackInto": []
  },
  "terms": [
   "IP"
  ]
 },
 "DEF-09": {
  "stage": "productDefinition",
  "window": [
   5,
   8
  ],
  "criticalPath": true,
  "purpose": [
   "Bring together the feasibility assessment, product cost model, and program plan <b>into a clear business case for the funding decision.</b> Provide a recommendation supported by both the expected outcome and downside scenarios.",
   "This activity consolidates the analysis completed during product definition rather than creating new analysis. The business case should clearly show the expected return, required investment, key risks, and downside impact so decision-makers can make an informed Go / No-Go decision."
  ],
  "steps": [
   {
    "n": 1,
    "text": "Build the financial model - NRE, operating cost, revenue, and breakeven\n",
    "tat": 1,
    "lane": "main"
   },
   {
    "n": 2,
    "text": "Evaluate expected, downside, and upside scenarios",
    "tat": 0.75,
    "lane": "par"
   },
   {
    "n": 3,
    "text": "Summary key program risks and mitigation plans",
    "tat": 0.5,
    "lane": "main"
   },
   {
    "n": 4,
    "text": "Define recommendation and required funding",
    "tat": 0.5,
    "lane": "main"
   },
   {
    "n": 5,
    "text": "Prepare executive review package",
    "tat": 0.75,
    "lane": "main"
   },
   {
    "n": 6,
    "text": "Conduct the Go / No-Go review and record the decision",
    "tat": 0.25,
    "lane": "main"
   }
  ],
  "flowNote": "The decision meeting takes a quarter of a week and the preparation takes three weeks, which is the correct ratio. A gate decision argued in the room rather than resolved before it produces an outcome that depends on who attended.",
  "consumes": [
   "Product cost and margin model from DEF-04",
   "Feasibility decision and required tradeoffs from DEF-07",
   "Program schedule and resource plan from DEF-08",
   "Competitive gap assessment from DEF-06",
   "Program risks and mitigation plans"
  ],
  "produces": [
   "Financial model and expected product economics",
   "Financial impact across key scenarios",
   "Key risks and mitigation actions",
   "Recommended path and funding request",
   "Business case for funding review",
   "Go / No-Go decision, conditions, and action owners"
  ],
  "producedBy": [
   1,
   2,
   3,
   4,
   5,
   6
  ],
  "rel": [
   {
    "id": "DEF-D6",
    "rel": "produces",
    "text": "<b>Kickoff Go / No-Go decision record.</b> This activity records the final Go / No-Go decision, including approval conditions, required follow-up actions, and any unresolved concerns."
   },
   {
    "id": "DEF-D5",
    "rel": "feeds",
    "text": "<b>Program charter, staffing and budget plan.</b> The charter is only funded once this decision is made, and the approved figure is written back into it."
   }
  ],
  "risks": [
   "<b>Business case based only on the expected scenario</b> ",
   "<b>Approval conditions not formally documented</b> ",
   "<b>Unresolved concerns or dissenting views not recorded</b>",
   "<b>Feasibility tradeoffs or risks understated during the funding review</b",
   "<b>Go / No-Go decision authority not clearly defined</b>"
  ],
  "roles": [
   {
    "r": "Program manager",
    "d": "Owns the decision pack, the funding request and the record"
   },
   {
    "r": "Finance partner",
    "d": "Owns the financial model and the scenario set"
   },
   {
    "r": "Product lead",
    "d": "Owns revenue, positioning and the market case"
   },
   {
    "r": "Stage lead",
    "d": "Carries the feasibility verdict into the review unedited"
   },
   {
    "r": "Executive sponsor",
    "d": "Chairs the decision and owns the outcome"
   }
  ],
  "effort": [
   [
    "Financial model assembly",
    0.75
   ],
   [
    "Scenario set",
    0.5
   ],
   [
    "Review pack",
    0.5
   ],
   [
    "Decision meeting and record",
    0.25
   ]
  ],
  "entry": [
   "Cost model closed by DEF-04",
   "Feasibility verdict issued by DEF-07",
   "Resourced schedule available from DEF-08"
  ],
  "exit": [
   "Business case includes both expected and downside scenarios",
   "Go / No-Go decision, approval conditions, and action owners are documented",
   "Approved funding is reflected in the program charter"
  ],
  "dependsOn": [
   "DEF-04",
   "DEF-06",
   "DEF-07",
   "DEF-08"
  ],
  "dependsNote": null,
  "feedsInto": [
   "ARCH-01",
   "TECH-06",
   "IPR-07"
  ],
  "measuredBy": [
   "Scenarios presented against those prepared",
   "Conditions attached to the decision and their owners",
   "Days from pack circulation to decision"
  ],
  "links": {
   "dependsOn": [
    "DEF-04",
    "DEF-06",
    "DEF-07",
    "DEF-08",
    "TECH-04"
   ],
   "feedsInto": [
    "ARCH-01",
    "TECH-06",
    "IPR-07"
   ],
   "runsWith": [],
   "revisedBy": [
    "TECH-08",
    "IPR-10"
   ],
   "feedsBackInto": []
  },
  "terms": [
   "NRE"
  ]
 }
};

/** Every term the written activities reference. */
export const activityGlossary: Record<string, GlossaryTerm> = {
 "ASP": {
  "full": "Average Selling Price",
  "group": "program",
  "note": "What the part is expected to sell for. With yield and cost it decides whether the program has a margin."
 },
 "CXL": {
  "full": "Compute Express Link",
  "group": "iface",
  "note": "A coherent protocol layered on the PCIe physical layer, used for memory and accelerator attachment."
 },
 "DFT": {
  "full": "Design For Test",
  "group": "verif",
  "note": "Structure added to the design purely so it can be tested and debugged — scan, BIST, compression, trace."
 },
 "DTCO": {
  "full": "Design-Technology Co-Optimization",
  "group": "process",
  "note": "Tuning design style and process options together rather than treating the process as fixed. Where standard-cell track height gets decided."
 },
 "ECO": {
  "full": "Engineering Change Order",
  "group": "design",
  "note": "A late, targeted change to a design that is otherwise frozen. A metal-only ECO touches routing layers alone."
 },
 "FP8": {
  "full": "8-bit floating point",
  "group": "test",
  "note": "A low-precision format used for training and inference."
 },
 "GB/s": {
  "full": "Gigabytes per second",
  "group": "iface",
  "note": "Bandwidth unit used for memory and interface targets."
 },
 "HBM": {
  "full": "High Bandwidth Memory",
  "group": "iface",
  "note": "Stacked DRAM placed beside the die on an interposer. Two stacks are assumed here. Also stands for Human Body Model in ESD contexts."
 },
 "HBM (ESD)": {
  "full": "Human Body Model",
  "group": "qual",
  "note": "The ESD model representing a person touching a pin. Distinct from HBM the memory — context decides which is meant."
 },
 "HBM3E": {
  "full": "High Bandwidth Memory 3 Extended",
  "group": "iface",
  "note": "The extended-speed revision of HBM3."
 },
 "ID": {
  "full": "Identifier",
  "group": "tool",
  "note": "The stable reference used to trace a requirement, activity or deliverable through the program."
 },
 "INT8": {
  "full": "8-bit integer",
  "group": "test",
  "note": "A low-precision numeric format used for inference. Throughput is quoted per format."
 },
 "IP": {
  "full": "Intellectual Property block",
  "group": "ip",
  "note": "A pre-designed functional block — a PHY, a memory compiler, a controller — bought or reused rather than written."
 },
 "IPC": {
  "full": "Inter-Process Communication",
  "group": "verif",
  "note": "Used here for co-simulation links between separate simulators."
 },
 "KPI": {
  "full": "Key Performance Indicator",
  "group": "program",
  "note": "A measurable target derived from a requirement. A requirement without a KPI cannot be tested at the end."
 },
 "LLM": {
  "full": "Large Language Model",
  "group": "tool",
  "note": "The workload class driving the memory bandwidth and capacity targets assumed here."
 },
 "ML": {
  "full": "Machine Learning",
  "group": "tool",
  "note": "The broader workload family the product serves."
 },
 "MLPerf": {
  "full": "MLPerf benchmark suite",
  "group": "test",
  "note": "The industry-standard machine-learning benchmark set customers compare parts with."
 },
 "NDA": {
  "full": "Non-Disclosure Agreement",
  "group": "program",
  "note": "The contract that has to exist before a foundry, IP vendor or customer will share anything useful. Routinely on the critical path early."
 },
 "NRE": {
  "full": "Non-Recurring Engineering",
  "group": "program",
  "note": "One-off cost — masks, tooling, IP licences — as opposed to per-unit cost. Dominates the business case for an advanced node."
 },
 "PCIe": {
  "full": "Peripheral Component Interconnect Express",
  "group": "iface",
  "note": "The host interface standard. Compliance is obtained at scheduled plugfests, not on demand."
 },
 "PHY": {
  "full": "Physical layer",
  "group": "ip",
  "note": "The analog and mixed-signal circuitry that drives an interface's wires — as opposed to the digital controller above it."
 },
 "PPA": {
  "full": "Power, Performance, Area",
  "group": "program",
  "note": "The three quantities every chip design trades against each other. A \"PPA target\" is the contract the architecture must meet."
 },
 "PRD": {
  "full": "Product Requirements Document",
  "group": "program",
  "note": "The baselined statement of what the product must do. Everything downstream is an answer to it."
 },
 "RFI": {
  "full": "Request For Information",
  "group": "program",
  "note": "An early, non-binding enquiry to a supplier — used to scope options before quoting."
 },
 "RFQ": {
  "full": "Request For Quotation",
  "group": "program",
  "note": "A formal request for price and terms. Precedes a purchase order."
 },
 "SRAM": {
  "full": "Static Random-Access Memory",
  "group": "ip",
  "note": "On-die memory. Usually generated by a compiler; when the compiler misses the PPA target, a custom instance has to be developed."
 },
 "TAT": {
  "full": "Turn-Around Time",
  "group": "program",
  "note": "Elapsed calendar time an activity occupies, in weeks. Not the same as effort — a 20-week activity may take one person or ten."
 },
 "TOPS": {
  "full": "Tera-Operations Per Second",
  "group": "test",
  "note": "Throughput measure for an accelerator — 10¹² operations a second."
 },
 "TOPS/W": {
  "full": "Tera-Operations Per Second per Watt",
  "group": "test",
  "note": "Efficiency measure. The metric this product class is actually bought on."
 },
 "UCIe": {
  "full": "Universal Chiplet Interconnect Express",
  "group": "iface",
  "note": "The standard die-to-die interface for chiplet construction."
 }
};

/** Deliverable titles by reference, for the 'what it delivers' section. */
export const detailDeliverables: Record<string, string> = {
 "DEF-D1": "Product requirements document (PRD)",
 "DEF-D2": "Target specification — PPA and KPI table",
 "DEF-D3": "Product cost and margin model",
 "DEF-D4": "Feasibility report",
 "DEF-D5": "Program charter, schedule, and resource plan",
 "DEF-D6": "Kickoff Go / No-Go decision record"
};

/** Titles for the activities a detail links to, including other stages. */
export const detailActivityTitles: Record<string, string> = {
 "AMS-08": "Statistical margin and yield analysis — importance sampling, sigma-Vmin, bitcell variation",
 "ARCH-01": "System-level performance modeling and workload simulation",
 "ARCH-02": "Compute / memory / interconnect partitioning; monolithic vs chiplet decision",
 "ARCH-03": "Dataflow and memory hierarchy definition (on-die SRAM capacity, HBM channels)",
 "ARCH-04": "Interface and protocol selection (PCIe gen, CXL, UCIe, HBM3/3E)",
 "ARCH-05": "Power domain, clock domain and DVFS architecture; UPF intent draft",
 "ARCH-06": "PPA budget allocation per block",
 "ARCH-07": "Security and safety architecture — secure boot, root of trust, fusing",
 "ARCH-08": "Chip-level floorplan intent, pin and bump budget",
 "BU-08": "Performance validation against the architecture model",
 "DEF-01": "Customer and Market Requirements Definition",
 "DEF-02": "Workload Definition and KPI Targets",
 "DEF-03": "PPA target definition",
 "DEF-04": "Product Cost and Margin Model",
 "DEF-05": "Memory and Interface Requirements",
 "DEF-06": "Competitive benchmarking and gap analysis",
 "DEF-07": "Technology Node Feasibility Assessment",
 "DEF-08": "Program Planning and Resourcing",
 "DEF-09": "Business Case and Funding Approval",
 "DFT-02": "Test coverage and test-time target negotiation with product and test engineering",
 "DV-08": "Emulation and FPGA prototype bring-up — capacity, partitioning, speed",
 "DV-09": "Performance and bandwidth validation against the architecture model",
 "FAB-09": "Hot-lot management and WIP tracking",
 "IPR-01": "Product requirement → IP requirement decomposition (IP bill of materials)",
 "IPR-03": "Make / buy / reuse decision per IP block",
 "IPR-07": "Licence negotiation, PO issue and delivery-date commitment",
 "IPR-09": "IP delivery schedule alignment to RTL and PD integration windows",
 "IPR-10": "IP maturity risk rating and second-source contingency",
 "MP-01": "Qualification plan definition against JEDEC / AEC standards",
 "MP-05": "Yield learning, failure pareto and defect analysis",
 "MP-10": "Capacity, supply chain and ramp commitment — wafer starts, substrate, HBM",
 "MP-11": "Compliance and certification — PCIe/CXL compliance, RoHS/REACH, safety",
 "PD-09": "Multi-corner multi-mode timing closure",
 "PDK-06": "Custom / pushed-rule memory instance decision, scope and schedule impact assessment",
 "PDK-12": "Compute farm, EDA license and storage capacity planning",
 "PKGD-01": "Package architecture selection — 2.5D interposer type, organic substrate, layer count",
 "PKGD-02": "Bump map, pitch and power-ground planning with physical design",
 "PKGD-07": "Thermal and mechanical simulation — warpage, co-planarity, TIM, lid",
 "PKGD-09": "Substrate and interposer supplier selection and lead-time booking",
 "RTL-10": "Specification change control and ECO board",
 "SYN-01": "SDC constraint development and validation",
 "TC-08": "Feedback into the production design — model correction and margin decisions",
 "TECH-01": "Foundry and node long-list to short-list evaluation",
 "TECH-02": "Process option and flavor selection (HPC/HD, multi-Vt menu, backside PDN, RF/HV adders)",
 "TECH-03": "Density / performance / leakage benchmarking against product targets (DTCO study)",
 "TECH-04": "Wafer price, mask and NRE quotation; MPW and volume pricing",
 "TECH-05": "Fab capacity and tapeout slot reservation; hot-lot policy agreement",
 "TECH-06": "Foundry legal engagement — NDA, design agreement, IP licensing frame",
 "TECH-07": "Foundry roadmap and risk-production timing alignment",
 "TECH-08": "Second-source and node-migration strategy assessment",
 "TECH-09": "OSAT and backend supply chain preliminary alignment",
 "TEST-01": "Test plan and coverage strategy — wafer sort, final test, system-level test",
 "TEST-02": "ATE platform selection and tester time booking",
 "TEST-07": "Characterization test content — shmoo, Vmin/Fmax, PVT sweeps",
 "TEST-09": "Test time and cost optimization — parallelism, site count"
};

/** The written-up detail for an activity, if one exists. */
export const activityDetail = (id: string): ActivityDetail | undefined =>
  activityDetails[id];

/** Whether a stage has any written activities, so the table knows to link. */
export const stageHasDetails = (stageId: string): boolean =>
  Object.values(activityDetails).some((d) => d.stage === stageId);
