/**
 * /data/journey.ts — content model
 * The 23 stages of the built-in profile, generated from docs/stage-template-v2.json.
 *
 * engineeringView is the stage's engineering activity list; engineeringTat and
 * engineeringEffort are index-aligned to it — elapsed weeks and man-months per
 * activity. A program inherits all three and may override them (see
 * /lib/stageDetail.ts); row IDs (DEF-01, DEF-D1) are derived from position, not
 * stored (see /lib/rowIds.ts).
 *
 * potentialRisks: PM must-check library per stage (example content)
 * leader: example stage leader (editable in UI)
 */
import type { JourneyStage } from './types';

export const journeyData = [
  {
    id: "productDefinition", stage: 1, title: "Product Definition", shortTitle: "DEF",
    tagline: "Setting the boundaries of the program.",
    description: "Fix what the product must achieve and the technical, cost and schedule boundaries the program will be held to. Nothing downstream is negotiable if this is vague.",
    activities: ["Market requirements analysis", "PPA target definition", "Cost target modeling", "Feasibility study"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "Product requirements document (PRD)",
      "Target specification — PPA and KPI table",
      "Feasibility report",
      "Product cost and margin model",
      "Program charter, staffing and budget plan",
      "Kickoff Go / No-Go decision record"
    ],
    engineeringView: [
      "Customer and Market Requirements Definition",
      "Workload Definition and KPI Targets",
      "PPA target definition",
      "Product Cost and Margin Model",
      "Memory and Interface Requirements",
      "Competitive benchmarking and gap analysis",
      "Technology Node Feasibility Assessment",
      "Program Planning and Resourcing",
      "Business Case and Funding Approval"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [4, 5, 4, 4, 3, 4, 4, 4, 3],
    engineeringEffort: [4, 6, 3, 3, 2, 2, 3, 3, 2],
    /* The plan this stage runs to, in weeks from its start. Requirements first, with benchmarking beside them; the targets they imply, then the models those targets are costed against, and the charter and go/no-go the whole thing exists to produce. */
    engineeringStart: [0, 1, 2, 3, 3, 0, 3, 4, 5],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [0, 2, 6, 3, 7, 8],
    deliverableWeek: [4, 6, 7, 7, 8, 8],
    risks: ["Specification instability", "Unrealistic PPA targets", "Technology availability"],
    potentialRisks: [
      "Requirements not signed off by all stakeholders",
      "Business case sensitive to cost assumptions",
      "Process node / PDK maturity uncertainty",
      "Competitive window shifts during definition",
      "Staffing and budget plan not committed",
      "Third-party IP licensing terms still open"
    ],
    leader: { name: "Daniel Kim", short: "D. Kim", phone: "+1 (408) 555-0142", email: "daniel.kim@example.com" },
    collaboration: ["Product", "Architecture", "Program Management", "Foundry"],
    tools: ["Requirements management", "Cost modeling", "Feasibility analysis"],
    programView: [
      "Business case approval",
      "Program charter & budget",
      "Kickoff decision gate",
      "Resource & staffing plan",
      "Top-level schedule commitment"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "architecture", stage: 2, title: "Architecture", shortTitle: "ARCH",
    tagline: "The decisions that shape everything downstream.",
    description: "Turn requirements into a system architecture and make the decisions — partitioning, memory hierarchy, interfaces, power — that every downstream team inherits.",
    activities: ["System architecture", "Partitioning", "Interface selection", "PPA tradeoffs"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "Interface and protocol definition document",
      "Power / clock / reset architecture and UPF intent",
      "Performance model and workload analysis report",
      "Block partitioning and PPA budget table",
      "Chip-level block diagram with pin and bump budget",
      "Architecture specification",
      "Architecture Freeze review package"
    ],
    engineeringView: [
      "System-level performance modeling and workload simulation",
      "System Architecture Partitioning",
      "Dataflow and Memory Hierarchy Definition",
      "Interface and protocol selection",
      "Power, Clock, and DVFS Architecture",
      "Block-Level PPA Budget Allocation",
      "Security and Safety Architecture",
      "Chip-Level Floorplan and Bump Planning",
      "Architecture Specification and Freeze",
      "Block Microarchitecture Definition"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [14, 8, 8, 6, 7, 4, 6, 5, 9, 6],
    engineeringEffort: [28, 14, 12, 6, 9, 4, 7, 5, 14, 12],
    /* The plan this stage runs to, in weeks from its start. Modelling runs almost the whole stage because everything else is argued against it; interfaces settle early, partitioning and budgets fall out of the model, and the specification is written across the back half. */
    engineeringStart: [0, 2, 3, 0, 6, 10, 4, 10, 9, 12],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [3, 4, 0, 5, 7, 8, 9],
    deliverableWeek: [6, 13, 14, 14, 15, 18, 18],
    risks: ["Late architecture changes", "Workload model gaps", "Underestimated complexity"],
    potentialRisks: [
      "Architecture not validated against key workloads",
      "Memory bandwidth margin insufficient",
      "Interface standard revision still in flux",
      "PPA budget allocation not agreed across blocks",
      "Feature creep channels left open after freeze",
      "Security architecture decided too late to implement"
    ],
    leader: { name: "Priya Sharma", short: "P. Sharma", phone: "+1 (408) 555-0177", email: "priya.sharma@example.com" },
    collaboration: ["Product", "RTL", "Verification", "Physical Design", "Program Management"],
    tools: ["Architecture modeling", "Performance simulation", "Power estimation"],
    programView: [
      "Architecture Freeze milestone",
      "Cross-team dependency mapping",
      "PPA target signoff",
      "Block ownership assignment",
      "Risk register established"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "technology", stage: 3, title: "Technology & Foundry Selection", shortTitle: "TECH",
    tagline: "The choice everything else is downstream of.",
    description: "Choose the foundry, the node and the process flavour, and convert that choice into signed commercial and capacity commitments. Everything in IP, PDK and library land is downstream of this decision.",
    activities: ["Foundry evaluation", "Process option selection", "Capacity booking", "Commercial agreement"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "Technology selection report and decision record",
      "Process option / flavour sheet agreed with foundry",
      "Wafer, mask and NRE cost sheet",
      "Node risk assessment — maturity, defect density, yield learning curve",
      "Executed foundry design agreement (DA) and NDA",
      "Capacity and tapeout slot commitment"
    ],
    engineeringView: [
      "Foundry and Process Node Selection",
      "Process Option and Flavor Selection",
      "Process PPA Benchmarking and DTCO Assessment",
      "Wafer, Mask, and NRE Cost Assessment",
      "Fab Capacity and Tapeout Slot Planning",
      "Foundry Commercial and Legal Alignment",
      "Foundry Roadmap and Production Readiness Alignment",
      "Second-Source and Node Migration Assessment",
      "OSAT and Backend Supply Chain Alignment"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [5, 5, 7, 6, 5, 8, 4, 4, 5],
    engineeringEffort: [4, 4, 6, 3, 2, 2, 1.5, 1.5, 2],
    /* The plan this stage runs to, in weeks from its start. The benchmarking decides the node, the commercial work runs alongside it, and the capacity commitment closes the stage because it is what cannot be signed until everything else is. */
    engineeringStart: [0, 4, 2, 4, 9, 4, 6, 8, 9],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [2, 1, 3, 6, 5, 4],
    deliverableWeek: [9, 9, 10, 10, 12, 14],
    risks: ["Node maturity", "Capacity commitment", "Wafer cost volatility"],
    potentialRisks: [
      "Selection made before workload targets are firm",
      "Tapeout slot not confirmed in writing",
      "Hot-lot policy left to goodwill",
      "Second-source path never assessed",
      "Design agreement signature slipping past IP decisions",
      "Mask and NRE cost outside the approved business case"
    ],
    leader: { name: "Rebecca Lange", short: "R. Lange", phone: "+1 (408) 555-0208", email: "rebecca.lange@example.com" },
    collaboration: ["Program Management", "Architecture", "Procurement", "Legal", "Foundry"],
    tools: ["DTCO benchmarking", "Cost modeling", "Supplier scorecards"],
    programView: [
      "Technology decision gate",
      "Capacity & slot commitment",
      "NRE and wafer cost approval",
      "Foundry engagement status",
      "Node risk acceptance"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "pdk", stage: 4, title: "PDK & Design Enablement", shortTitle: "PDK",
    tagline: "What the flow is allowed to assume.",
    description: "Get the design kit, the libraries, the tools and the signoff conditions to a state the program can actually build on — and keep tracking them as the foundry releases new versions underneath you.",
    activities: ["PDK version tracking", "Library qualification", "EDA tool qualification", "Signoff corner definition"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "PDK readiness dashboard — version, release date, open gap list",
      "Qualified library list with .lib / LEF / GDS views",
      "Compute and license capacity plan",
      "EDA tool and version matrix (qualified and frozen)",
      "Internal reference flow and methodology guide",
      "Signoff corner definition agreed with foundry",
      "Memory PPA gap analysis and custom-instance decision record",
      "Golden environment release notes"
    ],
    engineeringView: [
      "PDK Version Readiness and Change Management",
      "Design Rule Review and Disposition",
      "Standard Cell Library Selection and Qualification",
      "Memory Compiler Evaluation and Instance Planning",
      "Memory Compiler PPA Characterization",
      "Custom Memory Decision and Planning",
      "I/O, ESD, and Latch-Up Library Qualification",
      "EDA Tool Qualification",
      "Reference Flow Bring-Up and Methodology Development",
      "Signoff Deck and QRC Version Control",
      "Signoff Corner and Derate Definition",
      "Compute, License, and Storage Capacity Planning",
      "Golden Design Environment Release and Regression"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [-34, 6, 8, 9, 6, 4, 6, 10, 10, -6, 6, 6, 8],
    engineeringEffort: [14, 5, 9, 10, 7, 3, 5, 12, 12, 4, 5, 3, 8],
    /* The plan this stage runs to, in weeks from its start. Libraries and tools qualify first because the flow is built on them; the flow follows, corners are agreed against it, and the golden environment is released once there is something to freeze. */
    engineeringStart: [0, 0, 2, 4, 13, 19, 8, 4, 10, 0, 16, 6, 28],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [0, 2, 11, 7, 8, 10, 5, 12],
    deliverableWeek: [8, 10, 12, 14, 20, 22, 23, 36],
    risks: ["PDK version churn", "Library gaps", "Tool qualification lag"],
    potentialRisks: [
      "Design started on a PDK the foundry still calls preliminary",
      "0.5 to 1.0 delta not impact-assessed",
      "Memory compiler instances never checked against block budgets",
      "Signoff corners not agreed with the foundry",
      "Tool versions drifting between teams",
      "Compute and license capacity assumed rather than booked"
    ],
    leader: { name: "Arjun Mehta", short: "A. Mehta", phone: "+1 (408) 555-0219", email: "arjun.mehta@example.com" },
    collaboration: ["CAD / Methodology", "Synthesis", "Physical Design", "Signoff", "Foundry"],
    tools: ["PDK release tracking", "Library characterization", "Flow regression"],
    programView: [
      "PDK readiness dashboard",
      "Library qualification status",
      "Memory instance decision gate",
      "Tool & license capacity plan",
      "Golden environment release"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "ipReadiness", stage: 5, title: "IP Strategy & Readiness", shortTitle: "IPR",
    tagline: "Knowing what you need before you need it.",
    description: "Decompose the product into the IP it needs, decide make / buy / reuse for each, and prove that every bought or reused block is actually available and silicon-proven on the selected process option — before anyone schedules integration around it.",
    activities: ["IP bill of materials", "Make / buy / reuse", "Silicon-proven check", "Licensing & PO"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "IP bill of materials with make / buy / reuse decision per block",
      "Vendor evaluation matrix and selection record",
      "IP readiness report — silicon-proven status and maturity level per IP",
      "IP deliverable acceptance checklist",
      "Executed licences and POs with committed delivery dates",
      "IP risk register and contingency plan",
      "IP delivery schedule folded into the program plan"
    ],
    engineeringView: [
      "IP Requirement Definition",
      "Internal IP Reuse Assessment",
      "IP Make / Buy / Reuse Decision",
      "IP Vendor Evaluation and Selection",
      "IP Silicon-Proven and Node Readiness Assessment",
      "IP Deliverable and Integration Readiness Review",
      "IP Licensing and Procurement",
      "IP Porting and Hardening Planning",
      "IP Delivery and Integration Schedule Alignment",
      "IP Maturity Risk and Contingency Planning"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [5, 4, 5, 9, 7, 7, 12, 5, 4, 4],
    engineeringEffort: [5, 3, 4, 10, 6, 6, 5, 4, 2, 2],
    /* The plan this stage runs to, in weeks from its start. Decomposition and the reuse audit come first, evaluation and licensing overlap because the negotiation is long, and the delivery dates fold into the program plan last. */
    engineeringStart: [0, 2, 5, 6, 8, 10, 8, 15, 18, 17],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [2, 3, 4, 5, 6, 9, 8],
    deliverableWeek: [10, 15, 15, 17, 20, 21, 22],
    risks: ["IP not proven on node", "Licensing lead time", "Vendor delivery slip"],
    potentialRisks: [
      "IP list derived from the last program rather than this product",
      "Silicon-proven status assumed from the vendor's website",
      "Deliverable checklist not agreed before PO",
      "Licence signature on the critical path",
      "Porting effort for unproven IP not scheduled",
      "No second source for a single-vendor block"
    ],
    leader: { name: "Seojin Ha", short: "S. Ha", phone: "+82 10-5550-1140", email: "seojin.ha@example.com" },
    collaboration: ["Architecture", "RTL", "Physical Design", "Procurement", "IP vendors"],
    tools: ["IP catalogue", "Vendor scorecards", "Deliverable checklists"],
    programView: [
      "IP Plan Freeze milestone",
      "IP delivery date tracking",
      "Licence & PO status",
      "IP risk register",
      "Integration window alignment"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "amsIp", stage: 6, title: "Custom, AMS & Memory IP Development", shortTitle: "AMS",
    tagline: "The blocks nobody will sell you.",
    description: "Build the analog, custom and memory blocks that no vendor and no compiler is delivering — PLLs, SerDes and PHYs, regulators, custom SRAM arrays — through schematic, layout, post-layout characterisation and hardening into usable macros.",
    activities: ["PLL & SerDes design", "Custom SRAM instance", "Post-layout characterization", "Macro hardening"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "AMS IP specifications and design review packages",
      "Custom SRAM instance specification with Vmin and sigma-yield report",
      "Per-macro DRC / LVS clean signoff, pushed rules approved by foundry",
      "Reliability report — EM/IR, ESD, latch-up, aging",
      "Characterisation reports across PVT and Monte Carlo",
      "Custom memory views characterised to compiler equivalence",
      "Hard macro GDS with abstract views (LEF, .lib, CDL, UPF, wreal/Verilog model)",
      "Integration guide with known limitations and errata"
    ],
    engineeringView: [
      "AMS IP Specification and Budget Definition",
      "PLL and Clock Generator Design",
      "SerDes and PHY Design / Hardening",
      "Analog Power Management Design",
      "Custom SRAM Architecture",
      "SRAM Read / Write Assist Design",
      "Custom SRAM Layout and Foundry Rule Closure",
      "SRAM Statistical Margin and Yield Analysis",
      "Memory Redundancy and Repair Integration",
      "Custom Memory Characterization and View Generation",
      "AMS Schematic Design and Pre-Layout Verification",
      "AMS Custom Layout and Physical Verification",
      "Post-Layout Extracted Verification",
      "AMS Reliability Verification",
      "Hard Macro Abstraction and View Generation",
      "AMS–Digital Integration and Co-Simulation"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [6, 26, 34, 20, 10, 10, 16, 10, 6, 10, 16, 18, 16, 10, 8, -16],
    engineeringEffort: [8, 32, 60, 22, 14, 12, 22, 12, 6, 12, 20, 26, 20, 10, 8, 12],
    /* The plan this stage runs to, in weeks from its start. The long analogue blocks — SerDes, PLL, LDO — run most of the stage; layout and post-layout simulation trail them, and the macro views that the digital side integrates come out at the end. */
    engineeringStart: [0, 6, 4, 6, 4, 12, 18, 24, 22, 30, 8, 20, 24, 28, 34, 0],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [0, 4, 11, 13, 12, 9, 14, 15],
    deliverableWeek: [6, 14, 38, 38, 40, 40, 42, 42],
    risks: ["Analog schedule slip", "Vmin margin shortfall", "Macro late to floorplan"],
    potentialRisks: [
      "Abstract views arriving after floorplan needs them",
      "Custom SRAM decision taken too late to execute",
      "Pushed-rule layout not pre-agreed with the foundry",
      "Monte Carlo coverage thinner than the yield target implies",
      "Analog headcount shared across two programs",
      "Macro errata discovered during integration"
    ],
    leader: { name: "Laurent Bisset", short: "L. Bisset", phone: "+33 6 55 50 22 71", email: "laurent.bisset@example.com" },
    collaboration: ["Architecture", "Physical Design", "Foundry", "DFT", "Verification"],
    tools: ["Custom layout", "SPICE / Monte Carlo", "Reliability analysis"],
    programView: [
      "AMS macro handoff milestone",
      "Abstract view delivery dates",
      "Custom memory decision impact",
      "Analog resource loading",
      "Macro errata disposition"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "testChip", stage: 7, title: "Test Chip / MPW Shuttle", shortTitle: "TC",
    tagline: "Buying certainty with a small piece of silicon.",
    description: "De-risk the parts of the design that cannot be trusted to simulation — new IP, new process, marginal circuits — on a small shuttle vehicle whose silicon comes back in time to change the production design.",
    activities: ["Risk item selection", "Test chip design", "Shuttle tapeout", "Silicon correlation"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "Test chip specification and risk coverage matrix",
      "Test chip GDS and shuttle submission record",
      "Test chip silicon and characterisation report",
      "Silicon-to-model correlation report",
      "Design guidance and margin decisions for the production chip"
    ],
    engineeringView: [
      "Test Chip Objectives and Risk Coverage",
      "Test Chip Design and Integration",
      "MPW Shuttle Planning and Booking",
      "Test Chip Physical Implementation and Signoff",
      "MPW Tapeout and Fabrication",
      "Test Chip Board and Lab Preparation",
      "Silicon Characterization and Model Correlation",
      "Production Design Feedback and Margin Update"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [5, 12, 4, 12, 16, 9, 12, 6],
    engineeringEffort: [4, 18, 1, 20, 4, 8, 20, 8],
    /* The plan this stage runs to, in weeks from its start. Design, implement, submit, wait for the shuttle — and then characterise against the clock, which is why the correlation and the guidance are cut at the gate. */
    engineeringStart: [0, 4, 3, 14, 20, 26, 34, 36],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [0, 3, 4, 6, 7],
    deliverableWeek: [5, 26, 36, 40, 40],
    risks: ["Shuttle slot availability", "Correlation gap", "Feedback arrives too late"],
    potentialRisks: [
      "Test chip scope grows until it misses the shuttle",
      "Shuttle date lands after the production design needs the answer",
      "Test setup not ready when shuttle silicon arrives",
      "Structures chosen do not cover the actual risk",
      "No decision rule for what the results change"
    ],
    leader: { name: "Ingrid Sollberg", short: "I. Sollberg", phone: "+46 70 555 0163", email: "ingrid.sollberg@example.com" },
    collaboration: ["Analog", "Physical Design", "Foundry", "Validation", "Architecture"],
    tools: ["MPW shuttle flow", "Lab characterization", "Model correlation"],
    programView: [
      "Test Chip Silicon milestone",
      "Shuttle slot tracking",
      "Risk coverage vs objective",
      "Feedback decision gate",
      "Margin decisions for production"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "rtl", stage: 8, title: "RTL Design & Integration", shortTitle: "RTL",
    tagline: "Implementing the architecture in logic.",
    description: "Implement the architecture in synthesisable logic, integrate the IP that IPR and AMS deliver, and hold the design under change control until freeze.",
    activities: ["RTL development", "IP integration", "Lint & CDC", "Change control"],
    /* Listed in the order they are produced, which is the order the plan below
       produces them in — see deliverableWeek. */
    deliverables: [
      "Integration testbench and build system",
      "Register map / RDL and generated headers",
      "UPF power intent file",
      "IP integration report and version manifest",
      "Block and top-level RTL release, tagged",
      "Lint / CDC / RDC clean reports with waiver list",
      "RTL Freeze package"
    ],
    engineeringView: [
      "Block Microarchitecture Specification Completion",
      "Block-Level RTL Implementation",
      "Third-Party and Internal IP Integration",
      "Chip-Level Integration and Top-Level Assembly",
      "Clock, Reset, and Power Intent (UPF) Implementation",
      "Lint, CDC, and RDC Closure",
      "Register Map / RDL Definition and Header Generation",
      "Trial Synthesis and RTL PPA Feedback Loop",
      "CI Build, Nightly Regression, and Release Management",
      "Specification Change Control and ECO Board"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [10, 24, 16, 12, 10, 16, 8, 12, -30, -30],
    engineeringEffort: [40, 180, 45, 35, 18, 30, 10, 20, 20, 12],
    /* The plan this stage runs to, in weeks from its start. It reads as an RTL
       stage reads: the spec goes first and the RTL implementation starts under
       its tail rather than after it; the register map comes early because the
       headers it generates are what the RTL includes; IP integration begins
       once the first blocks exist; top assembly waits for blocks; UPF and
       lint/CDC run across the back half; trial synthesis closes the stage
       against freeze. CI and change control run the whole way. */
    engineeringStart: [0, 4, 8, 16, 12, 14, 2, 20, 0, 0],
    /* Which activity produces each deliverable, so the artefact is drawn on
       the work that makes it rather than on a row of its own. */
    deliverableFrom: [8, 6, 4, 2, 3, 5, 7],
    /* And when each is due: the week its producing activity finishes, except
       the build system, which lands early and is then maintained. The last
       falls on the gate, as every stage's last does. */
    deliverableWeek: [6, 10, 22, 24, 28, 30, 32],
    risks: ["Late IP readiness", "Integration issues", "Spec churn"],
    potentialRisks: [
      "Third-party IP delivery dates unconfirmed",
      "Integration environment not ready when blocks land",
      "CDC / RDC methodology gaps across teams",
      "Weak specification change control",
      "Block owners over-allocated across projects",
      "Configuration / version management discipline"
    ],
    leader: { name: "Minho Lee", short: "M. Lee", phone: "+82 10-5550-2211", email: "minho.lee@example.com" },
    collaboration: ["Architecture", "Verification", "DFT", "Analog", "IP vendors"],
    tools: ["SystemVerilog", "Lint / CDC", "Version control", "Build automation"],
    programView: [
      "RTL Freeze milestone",
      "IP delivery tracking",
      "Integration readiness reviews",
      "Block completion metrics",
      "Verification handoff criteria"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "verification", stage: 9, title: "Verification", shortTitle: "DV",
    tagline: "Building confidence before silicon.",
    description: "Build the evidence that the design does what the specification says, across block, chip and system level — the longest and most schedule-critical pre-silicon activity, and the largest single line of effort in the program.",
    activities: ["UVM testbench", "Regression & coverage", "Formal", "Emulation"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "Verification plan (vPlan) and coverage model",
      "UVM testbenches and integrated VIP",
      "Emulation platform and system test suite",
      "Formal proof reports with assumption list",
      "Low-power verification report",
      "Regression and coverage dashboards",
      "Gate-level simulation report",
      "DV closure signoff package"
    ],
    engineeringView: [
      "Verification Plan and Coverage Model Definition",
      "UVM Environment and VIP Bring-Up",
      "Block-Level Constrained-Random and Directed Testing",
      "Chip-Level and System-Level Scenario Testing",
      "Formal Verification of Control, Connectivity, and Security Properties",
      "Low-Power (UPF) Verification",
      "AMS / Mixed-Signal Co-Simulation",
      "Emulation and FPGA Prototype Bring-Up",
      "Performance and Bandwidth Validation Against the Architecture Model",
      "Coverage Closure and Regression Stability Management",
      "Functional and Timing-Annotated Gate-Level Simulation",
      "Bug Triage and Disposition Board"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [8, 14, 30, 22, 16, 10, 12, 20, 12, -26, 10, -34],
    engineeringEffort: [25, 60, 200, 110, 40, 20, 20, 55, 30, 45, 20, 25],
    /* The plan this stage runs to, in weeks from its start. The plan, then the environment, then thirty weeks of block-level testing under it; emulation starts early because its bring-up is long, and gate-level simulation closes the stage. */
    engineeringStart: [0, 4, 8, 16, 12, 22, 18, 6, 24, 0, 30, 0],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [0, 1, 7, 4, 5, 9, 10, 11],
    deliverableWeek: [8, 18, 26, 28, 32, 34, 40, 40],
    risks: ["Coverage closure", "Late bug discovery", "Spec changes"],
    potentialRisks: [
      "Verification plan has coverage holes vs spec",
      "Testbench bring-up slower than planned",
      "Regression compute capacity shortfall",
      "Coverage closure criteria not agreed",
      "Late RTL churn invalidating test content",
      "Emulation capacity contended with another program"
    ],
    leader: { name: "Sofia Alvarez", short: "S. Alvarez", phone: "+1 (512) 555-0193", email: "sofia.alvarez@example.com" },
    collaboration: ["RTL", "Architecture", "Analog", "Software", "Program Management"],
    tools: ["UVM", "Simulation", "Formal", "Emulation", "Coverage analysis"],
    programView: [
      "Verification closure milestone",
      "Bug discovery & closure rate trends",
      "Coverage dashboard by block",
      "Regression stability metrics",
      "Tapeout readiness contribution"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "dft", stage: 10, title: "DFT Architecture", shortTitle: "DFT",
    tagline: "Deciding now how it will be tested later.",
    description: "Decide how the chip will be tested before it can be built to be testable — scan and compression, memory BIST and repair, JTAG and debug access — then produce and validate the patterns the tester will run.",
    activities: ["Scan architecture", "MBIST & repair", "ATPG closure", "Debug access"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "DFT architecture specification and coverage plan",
      "MBIST / BISR insertion and test collateral",
      "JTAG / IJTAG description files (BSDL, ICL, PDL)",
      "DFT DRC clean report",
      "ATPG pattern sets with coverage report",
      "Pattern validation (GLS) report and ATE-ready pattern files",
      "DFT signoff entry for the tapeout checklist"
    ],
    engineeringView: [
      "DFT Architecture and Test Strategy Definition",
      "Test Coverage and Test-Time Target Negotiation",
      "MBIST / BIRA / BISR Architecture for Embedded Memories",
      "TAP, Boundary Scan, and IJTAG Debug Access Architecture",
      "On-Chip Clock Controller Design for At-Speed Test",
      "Scan Insertion and DFT DRC Closure",
      "ATPG Pattern Generation and Coverage Closure",
      "Gate-Level Pattern Validation and ATE Format Conversion",
      "Scan Compression and Chain Routing Feasibility with Physical Design",
      "eFuse, Chip ID, and Memory Repair Infrastructure",
      "Design-for-Debug and Trace Observability Architecture"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [8, 5, 10, 8, 7, 10, 16, 10, 10, 6, 8],
    engineeringEffort: [12, 4, 14, 10, 8, 14, 28, 14, 10, 6, 10],
    /* The plan this stage runs to, in weeks from its start. Architecture first, then the on-chip infrastructure it calls for; scan insertion waits on synthesis, and ATPG and its validation run against the gate. */
    engineeringStart: [0, 2, 6, 8, 10, 18, 24, 30, 16, 12, 14],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [0, 2, 3, 5, 6, 7, 7],
    deliverableWeek: [8, 16, 16, 28, 40, 40, 40],
    risks: ["Coverage target miss", "Pattern volume", "Debug access gaps"],
    potentialRisks: [
      "Coverage and test-time targets never agreed with product engineering",
      "Compression ratio decided without routing feasibility",
      "Pattern volume exceeding tester memory",
      "Debug hooks cut for area late in the schedule",
      "ATPG closure colliding with the final PD turn"
    ],
    leader: { name: "Owen Bradley", short: "O. Bradley", phone: "+1 (512) 555-0244", email: "owen.bradley@example.com" },
    collaboration: ["RTL", "Synthesis", "Physical Design", "Test", "Product Engineering"],
    tools: ["Scan insertion", "ATPG", "MBIST insertion", "Pattern validation"],
    programView: [
      "DFT Architecture Freeze milestone",
      "Coverage vs target tracking",
      "Test time budget",
      "Pattern release schedule",
      "Tapeout checklist contribution"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "synthesis", stage: 11, title: "Logic Synthesis & Netlist Drops", shortTitle: "SYN",
    tagline: "Four netlists, not one handover.",
    description: "Map verified RTL onto the qualified library under real constraints — and issue it as a sequence of netlists rather than one handover. The first drop exists so physical design can build its flow; the last one, the FFN, is the only netlist the final turn is allowed to see.",
    activities: ["Constraints (SDC)", "Technology mapping", "Netlist drops", "FFN release"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "N0 flow-flush netlist for PD flow setup",
      "Validated SDC constraint set per mode and corner",
      "Power intent implementation report",
      "N1 and N2 netlist drops with QoR delta reports",
      "Synthesis QoR report per drop against PPA targets",
      "Formal equivalence clean report per drop",
      "Physical design handoff package per drop",
      "FFN — final full netlist, release-tagged"
    ],
    engineeringView: [
      "SDC Constraint Development and Validation",
      "Technology Mapping and Optimization",
      "N0 Flow-Flush Netlist Release",
      "Physical-Aware Synthesis with Congestion Feedback",
      "N1 Netlist Drop and QoR Baseline",
      "Dynamic and Leakage Power Optimization",
      "Low-Power Synthesis and UPF Consistency Checking",
      "N2 Netlist Drop and Closure Risk Statement",
      "FFN (Final Full Netlist) Release and Functional Freeze",
      "RTL-to-Netlist Formal Equivalence Checking per Drop",
      "Per-Drop QoR Reporting Against PPA Budgets",
      "Per-Drop Netlist Handoff and QoR Delta Review"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [8, 8, 4, 7, 5, 7, 5, 5, 4, -20, -22, -22],
    engineeringEffort: [18, 16, 6, 14, 12, 12, 8, 12, 10, 12, 10, 6],
    /* The plan this stage runs to, in weeks from its start. N0 goes out in week four so physical design has something to build a flow on; the drops step through the stage and the FFN closes it. */
    engineeringStart: [0, 4, 0, 8, 10, 12, 13, 15, 20, 0, 0, 0],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [2, 0, 6, 7, 10, 9, 11, 8],
    deliverableWeek: [4, 8, 18, 20, 20, 22, 22, 24],
    risks: ["Timing infeasibility", "Constraint quality", "Late RTL churn"],
    potentialRisks: [
      "SDC constraints incomplete or unvalidated",
      "N0 released so late that PD flow setup starts cold",
      "Quality turns skipped under schedule pressure",
      "FFN issued before RTL is genuinely frozen",
      "Congestion signals ignored until placement"
    ],
    leader: { name: "Ethan Chen", short: "E. Chen", phone: "+1 (408) 555-0126", email: "ethan.chen@example.com" },
    collaboration: ["RTL", "Physical Design", "DFT", "Timing"],
    tools: ["Synthesis", "Constraint validation", "Formal equivalence"],
    programView: [
      "FFN Release milestone",
      "Netlist drop calendar",
      "PPA status vs targets per drop",
      "Constraint completeness review",
      "Physical design readiness gate"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "physicalDesign", stage: 12, title: "Physical Design", shortTitle: "PD",
    tagline: "Turn by turn, until it closes.",
    description: "Make the netlist physically real — floorplan, power grid, placement, clock trees, routing — across a sequence of turns whose quality climbs with each netlist drop, then close the design on the final turn against the FFN.",
    activities: ["Flow setup", "Floorplan & PDN", "Quality turns", "Final FFN turn"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "Flow setup release — MMMC environment, scripts and runtime baseline",
      "Floorplan and PDN specification",
      "Bump map, RDL and package interface files",
      "Turn 1 and Turn 2 databases with QoR delta reports",
      "Interim physical DRC / LVS clean",
      "MCMM timing closure reports with violation burn-down across turns",
      "ECO log and change control record",
      "Final-turn routed database on the FFN, per block and top",
      "Signoff-ready database handoff"
    ],
    engineeringView: [
      "Flow Setup and MMMC Environment Build on N0",
      "Floorplan, Macro Placement, and Partition Definition",
      "Power Delivery Network Design and Early IR Analysis",
      "Bump and RDL Planning with Chip-Package Co-Design",
      "Turn 1 on the N1 Netlist and QoR Baseline",
      "Turn 2 on the N2 Netlist and Closure Risk Quantification",
      "Clock Tree Synthesis with Skew and Jitter Budgeting",
      "Detailed Routing and DRC Convergence",
      "Multi-Corner Multi-Mode Timing Closure",
      "Signal and Power Integrity Iteration",
      "Chip Power Model (CPM/CPS) Extraction and Handoff",
      "Scan Chain Reordering and DFT-Aware Routing",
      "Final Turn on the FFN and Full Closure",
      "Functional and Timing ECO Implementation",
      "Chip Finishing and Post-Fill Verification",
      "Hierarchical Block Closure and Top-Level Assembly"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [7, 9, 8, 8, 8, 8, -12, -16, -22, 10, 5, 6, 11, -18, 5, 14],
    engineeringEffort: [22, 32, 20, 14, 45, 45, 26, 40, 60, 18, 6, 8, 55, 22, 6, 30],
    /* The plan this stage runs to, in weeks from its start. The flow is built on N0, the floorplan and PDN under it, and then the turns: each on its netlist drop, with clock trees, routing and timing closure running continuously across all of them. */
    engineeringStart: [0, 3, 6, 8, 10, 16, 0, 0, 0, 16, 18, 14, 19, 0, 25, 12],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [0, 2, 3, 5, 7, 8, 13, 12, 14],
    deliverableWeek: [7, 14, 16, 24, 24, 26, 28, 30, 30],
    risks: ["Timing convergence", "Congestion", "Power grid weaknesses"],
    potentialRisks: [
      "Flow setup starting without an N0 netlist",
      "Floorplan not converged before placement starts",
      "Power delivery network margin unproven",
      "Late ECO storm consuming closure schedule",
      "Tool license / compute capacity bottlenecks",
      "Package co-design inputs arriving late"
    ],
    leader: { name: "Grace Park", short: "G. Park", phone: "+82 10-5550-3388", email: "grace.park@example.com" },
    collaboration: ["Synthesis", "Signoff", "Package", "DFT", "Foundry"],
    tools: ["Place & route", "STA", "Power analysis", "ECO flows"],
    programView: [
      "Design Freeze trajectory",
      "Turn-by-turn QoR tracking",
      "ECO budget & change control",
      "Signoff readiness reviews",
      "Package co-design checkpoints"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "signoff", stage: 13, title: "Signoff", shortTitle: "SO",
    tagline: "Proving the design is manufacturable.",
    description: "Prove the final implementation holds across every electrical, timing, reliability and manufacturing check the foundry and the product demand, and dispose of every waiver on the record. The decks are rehearsed on an intermediate turn so the final turn is not the first time the flow runs at full chip.",
    activities: ["Dry run on turn 2", "MCMM STA", "DRC / LVS", "Waiver disposition"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "EM/IR and SI/PI signoff reports",
      "Reliability reports — ESD, latch-up, FIT",
      "DFM and lithography hotspot report",
      "STA signoff reports across all corners and modes, with waiver list",
      "Clean DRC / LVS / antenna / density reports",
      "Final formal equivalence report",
      "Signoff summary and Design Freeze package"
    ],
    engineeringView: [
      "Signoff Flow Dry Run on the Turn 2 Database",
      "Multi-Corner Multi-Mode Signoff STA and Closure",
      "Full-Chip DRC, LVS, Antenna, and Density Verification",
      "Static and Dynamic EM / IR-Drop Signoff",
      "Power and Signal Integrity Signoff",
      "Chip-Package-System Co-Analysis Signoff Review",
      "ESD, Latch-Up, and Soft Error / FIT Verification",
      "DFM, Lithography Hotspot, and CMP Analysis",
      "Final Formal Equivalence and LVS Netlist Consistency",
      "Waiver Review Board and Foundry Waiver Alignment",
      "Gate-Level Simulation with Final SDF",
      "Signoff Corner Correlation Against Foundry Decks"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [6, 10, 9, 8, 6, 4, 6, 6, 5, 6, 5, 5],
    engineeringEffort: [14, 34, 26, 20, 12, 5, 10, 10, 8, 6, 8, 6],
    /* The plan this stage runs to, in weeks from its start. A dry run on the Turn 2 database rehearses the decks and the triage, then everything runs at once on the final turn and the waiver board closes it. */
    engineeringStart: [0, 5, 6, 6, 8, 11, 8, 8, 10, 10, 9, 0],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [4, 6, 7, 1, 2, 8, 9],
    deliverableWeek: [14, 14, 14, 15, 15, 15, 16],
    risks: ["Late violations", "IR drop hotspots", "Signoff iteration loops"],
    potentialRisks: [
      "Signoff corner list not agreed with foundry",
      "Waiver review process undefined",
      "IR / EM hotspots discovered late",
      "Decks never rehearsed before the final turn",
      "Physical verification runtime underestimated"
    ],
    leader: { name: "Tomas Rivera", short: "T. Rivera", phone: "+1 (971) 555-0164", email: "tomas.rivera@example.com" },
    collaboration: ["Physical Design", "Foundry", "Package", "Reliability"],
    tools: ["STA", "Physical verification", "EM/IR analysis"],
    programView: [
      "Design Freeze milestone",
      "Violation burn-down tracking",
      "Waiver review board",
      "Tapeout checklist completion",
      "Go / No-Go preparation"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "tapeout", stage: 14, title: "Tapeout & Mask Release (MTO)", shortTitle: "TO",
    tagline: "Two releases, four weeks apart.",
    description: "Release the design to mask in two steps. Front-end layers go out first and the mask shop starts cutting them; back-end layers follow about a month later. That gap is not slack — it is the last window in which a metal-layer fix can still be made without touching the front-end mask set.",
    activities: ["Final GDS assembly", "Go / No-Go", "FEOL MTO", "BEOL MTO"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "Released GDSII / OASIS database with checksum record",
      "Tapeout checklist with sign-off matrix",
      "Open issue and risk acceptance record",
      "Go / No-Go decision minutes",
      "FEOL MTO release package and mask order confirmation",
      "BEOL ECO log covering the fix window",
      "BEOL MTO release package and mask order confirmation",
      "Full mask set completion record"
    ],
    engineeringView: [
      "Final GDSII / OASIS Assembly and Layer Map Verification",
      "Final Full-Chip Verification Re-Run on the Released Database",
      "Tapeout Checklist Completion and Owner Signoff",
      "Open-Issue Risk Assessment and Waiver Acceptance",
      "Go / No-Go Decision Meeting",
      "FEOL Layer Data Preparation and MTO Release",
      "FEOL Mask Order Confirmation and Mask Shop Scheduling",
      "BEOL Fix Window for Metal-Layer ECOs",
      "BEOL DRC, LVS, Antenna, and Density Re-Verification",
      "BEOL Layer Data Preparation and MTO Release",
      "BEOL Mask Order Confirmation and Full Mask Set Completion Tracking"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [2, 2, 3, 2, 0.5, 1.5, 1, 4, 2.5, 1.5, 1],
    engineeringEffort: [6, 8, 5, 3, 1, 3, 1, 10, 6, 3, 1],
    /* The plan this stage runs to, in weeks from its start. Eight weeks with the split in the middle: FEOL goes out on the go/no-go, and the BEOL fix window runs while the front-end masks are being cut. */
    engineeringStart: [0, 1, 0, 2, 3.5, 4, 5, 2, 5, 6.5, 7],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [0, 2, 3, 4, 6, 7, 9, 10],
    deliverableWeek: [2, 3, 4, 4, 6, 6, 8, 8],
    risks: ["Escaped bugs", "Checklist gaps", "Mask schedule slips"],
    potentialRisks: [
      "Checklist items waived without formal risk review",
      "Open bug risk assessment incomplete at Go / No-Go",
      "BEOL fix window consumed by unplanned work",
      "Final GDS assembly flow not dry-run in advance",
      "Decision owners and criteria unclear in the room"
    ],
    leader: { name: "Hana Yoon", short: "H. Yoon", phone: "+82 10-5550-7702", email: "hana.yoon@example.com" },
    collaboration: ["All engineering teams", "Foundry", "Program Management", "Executive"],
    tools: ["GDS assembly", "Final verification", "Release management"],
    programView: [
      "Go / No-Go decision meeting",
      "FEOL and BEOL release tracking",
      "Open issue risk acceptance",
      "Mask shop scheduling",
      "Decision owners & criteria"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "fabrication", stage: 15, title: "Fabrication", shortTitle: "FAB",
    tagline: "Hundreds of steps, weeks of patience.",
    description: "Masks are cut and wafers are processed. The program has almost no levers here — only hot-lot priority, WIP visibility and an honest wafer-out forecast. Eighteen weeks from FEOL MTO to wafer out: seven for an EUV mask set, eleven for a hot-lot cycle.",
    activities: ["Mask fabrication", "Wafer processing", "Process monitoring", "Wafer acceptance"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "FEOL and BEOL mask sets with qualification reports",
      "Wafer-out forecast versus actual log",
      "Processed engineering-lot wafers",
      "Inline, PCM and WAT data package",
      "Wafer acceptance disposition record",
      "First Silicon availability notice"
    ],
    engineeringView: [
      "FEOL Mask Set Fabrication, Inspection, and Qualification",
      "Wafer Start on FEOL Mask Availability",
      "BEOL Mask Set Fabrication, Inspection, and Qualification",
      "Front-End Wafer Processing",
      "Back-End-of-Line Wafer Processing",
      "Inline Metrology and Defect Inspection Monitoring",
      "E-Test / PCM Data Review",
      "Wafer Acceptance Test and Lot Disposition",
      "Hot-Lot Management and WIP Tracking",
      "Wafer Shipment and Logistics to Sort and Assembly"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [7, 1, 6, 8, 5, -14, 3, 3, -18, 2],
    engineeringEffort: [4, 1, 4, 3, 2, 5, 3, 3, 4, 1],
    /* The plan this stage runs to, in weeks from its start. Masks, then wafer start on FEOL availability; back-end processing overlaps the front-end tail lot by lot, and inline monitoring runs the whole way. */
    engineeringStart: [0, 7, 3, 8, 13, 0, 15, 16, 0, 17],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [2, 8, 4, 6, 7, 9],
    deliverableWeek: [9, 14, 18, 18, 19, 19],
    risks: ["Fab cycle time variation", "Process excursions", "Hot lot priority"],
    potentialRisks: [
      "Fab slot / hot-lot priority not confirmed in writing",
      "No contingency plan for process excursions",
      "Wafer acceptance criteria not agreed with foundry",
      "Wafer-out forecast volatility not communicated",
      "Wafers arriving before the assembly process is qualified"
    ],
    leader: { name: "Marcus Webb", short: "M. Webb", phone: "+1 (480) 555-0139", email: "marcus.webb@example.com" },
    collaboration: ["Foundry", "Test", "Product Engineering", "Program Management"],
    tools: ["Foundry WIP tracking", "Process monitoring", "Yield analysis"],
    programView: [
      "Wafer-out forecast tracking",
      "Hot lot vs standard flow decisions",
      "First Silicon milestone",
      "Package validation gate",
      "Risk buffer management"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "packageDesign", stage: 16, title: "Package & Substrate Design", shortTitle: "PKGD",
    tagline: "Substrate lead time sets this date, not the die.",
    description: "Design the package the die will live in — interposer, substrate, bump map, thermal and mechanical solution — on a schedule driven by substrate lead time rather than by the die.",
    activities: ["Package architecture", "Bump map & RDL", "Substrate design", "Supplier booking"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "Package architecture specification",
      "Test vehicle requirement specification for PTV",
      "Bump map and interposer / RDL database",
      "Substrate and interposer PO with committed lead time",
      "Substrate design files (Gerber / ODB++) and stack-up",
      "Package electrical design intent and model handoff to co-verification",
      "OSAT assembly process flow and agreement",
      "Thermal and mechanical (warpage) simulation reports",
      "Package Design Freeze package"
    ],
    engineeringView: [
      "Package Architecture Selection",
      "Bump Map, Pitch, and Power-Ground Planning with Physical Design",
      "Interposer / RDL Routing Design",
      "Substrate Stack-Up, Escape Routing, and Package DRC",
      "Package Routing for Signal Integrity",
      "Package PDN and Decap Footprint Design",
      "Thermal and Mechanical (Warpage) Simulation",
      "Test Vehicle Requirement Definition and Handoff to PTV",
      "Substrate and Interposer Supplier Selection and Lead-Time Booking",
      "OSAT Selection and Assembly Process Definition",
      "Package Design Freeze, DRC, and Tooling Release"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [8, 10, 14, 14, 10, 9, 12, 4, 10, 9, 6],
    engineeringEffort: [10, 12, 18, 18, 12, 10, 12, 3, 4, 5, 6],
    /* The plan this stage runs to, in weeks from its start. The architecture and the test vehicle requirements go out early because PTV is waiting on them; routing and analysis fill the middle, and the freeze closes a stage that ran a year. */
    engineeringStart: [0, 8, 18, 16, 24, 28, 30, 6, 10, 32, 46],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [0, 7, 1, 8, 3, 5, 9, 6, 10],
    deliverableWeek: [8, 10, 18, 20, 30, 37, 41, 42, 52],
    risks: ["Substrate lead time", "Interposer supply", "Design freeze slip"],
    potentialRisks: [
      "Substrate lead times longer than the fab cycle",
      "Interposer supply constrained",
      "Bump map churn from late floorplan changes",
      "OSAT capacity commitments not secured",
      "Package design freeze slipping past the substrate order date",
      "Test vehicle requirements handed over too late"
    ],
    leader: { name: "Yuki Tanaka", short: "Y. Tanaka", phone: "+81 90-5550-4416", email: "yuki.tanaka@example.com" },
    collaboration: ["Package", "Foundry / OSAT", "Physical Design", "Thermal", "Procurement"],
    tools: ["Package co-design", "Thermal analysis", "Substrate design"],
    programView: [
      "Package Design Freeze milestone",
      "Substrate & interposer lead-time tracking",
      "OSAT capacity & scheduling",
      "Bump map handoff checkpoints",
      "Material cost tracking"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "packageTestVehicle", stage: 17, title: "Package Test Vehicle (CPI / TTV)", shortTitle: "PTV",
    tagline: "Stress the package before the die exists.",
    description: "Prove the package before the product die exists. Mechanical, thermal and daisy-chain vehicles carry the chip-package interaction, warpage and thermal risk, so the first real assembly is not the first experiment.",
    activities: ["Vehicle design", "Assembly DOE", "CPI & warpage", "Process window freeze"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "Test vehicle plan and risk coverage matrix",
      "MTV, TTV and daisy-chain vehicle designs",
      "Built vehicle lots with assembly travelers",
      "Warpage and co-planarity data across the reflow profile",
      "CPI stress assessment report — ULK, bump and BEOL integrity",
      "Thermal characterisation report with model correlation (Rjc, TIM, hotspot map)",
      "Board-level reliability data on vehicles",
      "Frozen assembly process window definition",
      "Package validation complete record — gate for product wafer-out"
    ],
    engineeringView: [
      "Test Vehicle Strategy and Risk Coverage Definition",
      "Mechanical Test Vehicle (MTV) Design",
      "Thermal Test Vehicle (TTV) Design",
      "Daisy-Chain Electrical Vehicle Design",
      "TV Die Fabrication and Interposer / Substrate Vehicle Build",
      "OSAT Vehicle Assembly with Process Window DOE",
      "Warpage and Co-Planarity Measurement Across the Reflow Profile",
      "Chip-Package Interaction (CPI) Stress Evaluation",
      "Thermal Characterization and Model Correlation",
      "Board-Level Reliability Testing on Vehicles",
      "Daisy-Chain Continuity Test and Assembly Yield Learning",
      "Package Design Feedback and Assembly Process Window Freeze"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [6, 9, 9, 8, 16, 11, 7, 11, 9, 14, 9, 7],
    engineeringEffort: [5, 8, 8, 6, 6, 12, 8, 14, 10, 8, 6, 5],
    /* The plan this stage runs to, in weeks from its start. Three vehicles designed together, built together, and then measured for the rest of the stage — the stress and reliability work is what the vehicles exist for. */
    engineeringStart: [0, 6, 6, 8, 16, 30, 38, 38, 40, 36, 40, 45],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [0, 3, 5, 6, 7, 8, 9, 11, 11],
    deliverableWeek: [6, 16, 41, 45, 49, 49, 50, 52, 52],
    risks: ["Vehicle build slip", "CPI failure late", "Process window unproven"],
    potentialRisks: [
      "Vehicle results arriving after product wafer-out",
      "Warpage measured only at room temperature",
      "CPI structures not representative of the product stack",
      "Board-level reliability started too late to finish",
      "Assembly process window frozen on a single build"
    ],
    leader: { name: "Nadia Farouk", short: "N. Farouk", phone: "+1 (480) 555-0287", email: "nadia.farouk@example.com" },
    collaboration: ["Package", "OSAT", "Reliability", "Thermal", "Quality"],
    tools: ["Shadow moiré", "CSAM / X-ray", "Thermal characterization", "Reliability chambers"],
    programView: [
      "Package Validation Complete milestone",
      "Wafer-out gate readiness",
      "Vehicle build schedule",
      "Assembly process window status",
      "Reliability data review"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "chipPackageCoVerification", stage: 18, title: "Chip-Package-System Co-Verification", shortTitle: "SIPI",
    tagline: "One power network, one channel, one signoff.",
    description: "Verify the die, the package and the board as one electrical system — one power delivery network, one channel — and close it as a signoff with named exit criteria, not as three separate simulations that never met.",
    activities: ["CPM extraction", "PDN co-simulation", "Channel compliance", "Co-verification signoff"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "Chip power model (CPM/CPS) release per domain and mode",
      "Extracted package and board electrical models",
      "Channel compliance report per interface, with margins",
      "PDN impedance and dynamic IR co-simulation report",
      "Decap budget and placement specification across die, package and board",
      "Power-aware STA correlation report",
      "Eye, jitter and BER budget closure record",
      "Chip-package-system co-verification signoff — tapeout gate"
    ],
    engineeringView: [
      "Chip Power Model (CPM/CPS) Extraction per Power Domain and Operating Mode",
      "Package and Board Electrical Model Extraction",
      "Die-Package-Board PDN Impedance Co-Simulation",
      "Dynamic Voltage-Drop Analysis with Package Inductance",
      "Decap Budget and Placement Optimization Across Die, Package, and Board",
      "Simultaneous-Switching Noise (SSN / SSO) Analysis at the IO Ring",
      "High-Speed Channel Simulation with Extracted Package Models",
      "Eye, Jitter, and BER Budget Closure per Interface",
      "Power-Aware STA Correlation with Back-Annotated Voltage Drop",
      "Electro-Thermal Co-Analysis with the Package Thermal Model",
      "Co-Verification Signoff Review and Criteria Disposition"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [7, 8, 9, 8, 7, 5, 9, 8, 5, 5, 4],
    engineeringEffort: [8, 10, 12, 10, 7, 5, 11, 9, 5, 5, 3],
    /* The plan this stage runs to, in weeks from its start. Nothing can be simulated until the models exist, so the extractions come first; the power and channel work then runs in parallel and meets at the signoff review. */
    engineeringStart: [0, 2, 8, 12, 14, 16, 8, 16, 18, 18, 22],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [0, 1, 6, 3, 4, 8, 7, 10],
    deliverableWeek: [7, 10, 17, 20, 21, 23, 24, 26],
    risks: ["Package-induced droop", "Channel margin", "Model availability"],
    potentialRisks: [
      "Each team simulating with its own model of the other two",
      "Chip power model released too late for co-analysis",
      "Decap budget split without a shared impedance target",
      "Channel compliance closed on nominal package models only",
      "Exit criteria never written down"
    ],
    leader: { name: "Viktor Halvorsen", short: "V. Halvorsen", phone: "+47 40 55 01 92", email: "viktor.halvorsen@example.com" },
    collaboration: ["Physical Design", "Package", "Signoff", "Analog", "Board design"],
    tools: ["3D EM extraction", "PDN analysis", "Channel simulation", "Electro-thermal co-analysis"],
    programView: [
      "Co-Verification Signoff milestone",
      "MTO gate readiness",
      "Model delivery tracking",
      "Decap budget disposition",
      "Exit criteria review"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "packaging", stage: 19, title: "Assembly & Package Build", shortTitle: "ASSY",
    tagline: "The journey leaves the die.",
    description: "Build the package and then the units. The interposer and the substrate are ordered off the design freeze and take months, so they start long before the die exists; then stack, bond and build — known-good die, HBM stacks, underfill, lid — and learn the assembly yield on the parts bring-up and qualification will consume.",
    activities: ["Interposer & substrate build", "Known-good-die sort", "Bonding & underfill", "Inline inspection", "Unit allocation"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "Assembly travelers and process data",
      "Assembled units — bring-up, qualification and sample lots",
      "Package-level inspection and test data",
      "Assembly yield report and failure pareto",
      "Unit allocation record across bring-up, qual and customers"
    ],
    engineeringView: [
      "Known-Good-Die Sort and Selection",
      "HBM Stack Procurement and Incoming Inspection",
      "Die Attach and Micro-Bump Thermo-Compression Bonding",
      "Interposer-to-Substrate Attach, Underfill, and Molding",
      "Lid / TIM Attach and Ball Attach",
      "X-Ray, CSAM, and Warpage Inline Inspection",
      "Assembly Yield Analysis and Process Tuning",
      "Package-Level Open / Short and Continuity Test",
      "Unit Build and Allocation for Bring-Up, Qualification, and Samples",
      "Production Silicon Interposer Fabrication",
      "Production Package Substrate Build"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [3, 3, 3, 3, 2, 2, 5, 2, 3, 20, 16],
    engineeringEffort: [5, 2, 6, 5, 3, 3, 6, 3, 3, 8, 6],
    /* The plan this stage runs to, in weeks from its start. The stage opens on the
       package design freeze, not on wafer-out: the interposer and the substrate are
       built first and take five months between them. The eight weeks of line work —
       known-good die and HBM in, bonding and assembly through the middle, units out —
       run at the end, on top of parts that now exist. */
    engineeringStart: [23, 23, 25, 26, 28, 26, 26, 29, 28, 0, 0],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [3, 4, 7, 6, 8],
    deliverableWeek: [29, 30, 31, 31, 31],
    risks: ["Assembly yield", "Material availability", "Inspection escapes"],
    potentialRisks: [
      "Known-good-die test coverage insufficient",
      "HBM stack supply timing",
      "Interposer or substrate lead time consuming the assembly slot",
      "Assembly running outside the frozen process window",
      "Unit allocation contended between bring-up and qual",
      "Yield learning starting on the first build"
    ],
    leader: { name: "Rafael Duarte", short: "R. Duarte", phone: "+1 (480) 555-0311", email: "rafael.duarte@example.com" },
    collaboration: ["Package", "OSAT", "Test", "Product Engineering", "Quality"],
    tools: ["Assembly travelers", "X-ray / CSAM", "Yield analysis"],
    programView: [
      "Assembly yield ramp plan",
      "Unit allocation record",
      "Material lead-time tracking",
      "Bring-up sample readiness",
      "Qualification vehicle supply"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "validationHardware", stage: 20, title: "Validation Hardware / EVB", shortTitle: "EVB",
    tagline: "Ready before the silicon arrives.",
    description: "Design, build and debug the boards and lab infrastructure that first silicon will be plugged into — finished and shaken out before the parts arrive, not after.",
    activities: ["Schematic & layout", "Board fabrication", "Debug infrastructure", "Lab setup"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "Validation platform specification",
      "Debug and trace access documentation",
      "Lab setup and instrument reservation plan",
      "EVB schematics, BOM and layout database",
      "Fabricated and assembled boards, rev A/B with quantity plan",
      "Board bring-up report and known issues"
    ],
    engineeringView: [
      "Validation Platform Requirements and Topology Definition",
      "EVB Schematic Design and BOM",
      "PCB Layout with High-Speed Channel SI/PI Simulation",
      "PCB Fabrication and Assembly",
      "Power Delivery, VRM, and Telemetry Design and Bring-Up",
      "Debug and Trace Access Infrastructure",
      "Board Bring-Up with Socketed or Dummy Parts",
      "Thermal Solution and Cooling for the Lab Platform",
      "Lab Instrumentation Reservation and Test Rack Build",
      "Minimum Host-Side Enablement for Power-On"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [5, 10, 12, 8, 7, 7, 7, 7, 7, 7],
    engineeringEffort: [5, 14, 18, 4, 8, 8, 10, 7, 8, 10],
    /* The plan this stage runs to, in weeks from its start. Schematic, layout, fabrication and bring-up in sequence because each waits on the last; the lab and thermal work is fitted around them. */
    engineeringStart: [0, 5, 15, 27, 8, 10, 31, 18, 20, 28],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [0, 5, 8, 2, 3, 6],
    deliverableWeek: [5, 17, 27, 27, 35, 38],
    risks: ["Board respin", "Lab capacity", "Debug access gaps"],
    potentialRisks: [
      "Boards not ready when silicon arrives",
      "Rev A respin not budgeted in the schedule",
      "Debug access (JTAG / trace) designed out for cost",
      "Lab equipment and staffing not reserved",
      "Thermal solution sized for a lower power number"
    ],
    leader: { name: "Claire Whitfield", short: "C. Whitfield", phone: "+1 (503) 555-0226", email: "claire.whitfield@example.com" },
    collaboration: ["Validation", "Board design", "Software", "Thermal", "Design"],
    tools: ["Schematic capture", "PCB layout", "SI/PI simulation", "Lab instrumentation"],
    programView: [
      "EVB Ready milestone",
      "Board revision plan",
      "Lab capacity & instrument booking",
      "Debug access review",
      "Bring-up platform readiness"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "testDevelopment", stage: 21, title: "Test Development", shortTitle: "TEST",
    tagline: "Probe card lead time is the critical path.",
    description: "Build the ability to test the product — tester platform, probe card and load board, sort and final programs — on a critical path set by probe card lead time, not by wafer-out.",
    activities: ["Test plan", "Probe card & load board", "Sort & final programs", "Test time optimisation"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "Test plan and test coverage matrix",
      "ATE-ready pattern set with debug log",
      "Test data infrastructure and yield database",
      "Qualified probe card and load board",
      "Characterisation test suite",
      "Test time and test cost model",
      "Wafer sort and final test programs, release-tagged"
    ],
    engineeringView: [
      "Test Plan and Coverage Strategy Definition",
      "ATE Platform Selection and Tester Time Booking",
      "Probe Card Design, Fabrication, and Qualification",
      "Load Board / DUT Board Design, Fabrication, and Bring-Up",
      "Wafer Sort Test Program Development",
      "Final / Package Test Program Development",
      "Characterization Test Suite Development",
      "DFT Pattern Porting to ATE Format and Pattern Debug",
      "Test Time and Cost Optimization",
      "ATE, Bench, and System Correlation",
      "Test Data Infrastructure and Yield Database"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [8, 6, 20, 17, 16, 16, 12, 10, 9, 8, 8],
    engineeringEffort: [12, 4, 16, 16, 30, 28, 20, 16, 12, 10, 10],
    /* The plan this stage runs to, in weeks from its start. The hardware has the longest lead time, so the probe card is started as soon as the plan allows; programs are written against it and released at the gate. */
    engineeringStart: [0, 4, 10, 12, 18, 26, 24, 14, 30, 34, 20],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [0, 7, 10, 2, 6, 8, 5],
    deliverableWeek: [8, 24, 28, 30, 36, 39, 42],
    risks: ["Probe card lead time", "Program maturity", "Tester availability"],
    potentialRisks: [
      "Probe card ordered after wafer-out is committed",
      "Load board bring-up colliding with first silicon",
      "Test program written against patterns that later change",
      "Tester time not booked for characterization",
      "Test cost model absent from the product cost target"
    ],
    leader: { name: "Dae-hyun Jo", short: "D. Jo", phone: "+82 10-5550-6620", email: "daehyun.jo@example.com" },
    collaboration: ["Test", "DFT", "Product Engineering", "Validation", "OSAT"],
    tools: ["ATE platform", "Probe card design", "Test program development", "STDF / yield database"],
    programView: [
      "Probe Card Ready milestone",
      "Test hardware lead-time tracking",
      "Program release schedule",
      "Test time & cost model",
      "Wafer sort readiness"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "bringup", stage: 22, title: "Silicon Bring-up", shortTitle: "BU",
    tagline: "The moment of truth.",
    description: "Find out what the silicon actually does. Power on, train the interfaces, characterise the margins, debug what does not match, and decide whether the program respins.",
    activities: ["Lab bring-up", "Interface training", "Characterization", "Respin decision"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "Bring-up report with per-milestone health status",
      "Failure analysis reports",
      "Interface compliance results with training margins",
      "Errata list with workarounds",
      "Characterisation data set — V/F/T shmoo and power measurements",
      "Respin versus metal-fix decision record",
      "Customer sample release package"
    ],
    engineeringView: [
      "Sample Receipt, Incoming Inspection, and Board Mounting",
      "Power-On, Power Sequencing, and Basic Health Check",
      "Reset, Clocking, and PLL Lock Validation",
      "Boot, Firmware Load, and Functional Smoke Test",
      "PCIe/CXL, HBM, and Die-to-Die Interface Bring-Up",
      "Memory Subsystem and Bandwidth Validation",
      "Shmoo Across Voltage, Frequency, and Temperature",
      "Performance Validation Against the Architecture Model",
      "Silicon Anomaly Debug and Failure Analysis",
      "Errata Capture, Workaround Definition, and Documentation",
      "Respin versus Metal-Fix Decision Analysis",
      "Customer Sample Readiness and Release Package"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [1.5, 3, 3, 4, 8, 6, 7, 6, 10, 7, 4, 5],
    engineeringEffort: [2, 8, 8, 12, 26, 16, 16, 16, 28, 10, 5, 6],
    /* The plan this stage runs to, in weeks from its start. Power-on, clocks, boot, interfaces — in that order because each depends on the last — with debug running under all of it and the respin call made near the end. */
    engineeringStart: [0, 1.5, 3, 5, 7, 9, 10, 11, 4, 8, 13, 13],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [3, 8, 4, 9, 6, 10, 11],
    deliverableWeek: [9, 14, 15, 15, 17, 17, 18],
    risks: ["Silicon bugs", "Debug cycle time", "Respin decision"],
    potentialRisks: [
      "Evaluation boards not ready when silicon arrives",
      "Lab equipment and staffing not reserved",
      "Debug access (JTAG / trace) gaps found late",
      "Sample allocation & logistics not planned",
      "Respin decision criteria undefined before data"
    ],
    leader: { name: "Alex Novak", short: "A. Novak", phone: "+1 (503) 555-0181", email: "alex.novak@example.com" },
    collaboration: ["Validation", "Design", "Test", "Software", "Failure Analysis"],
    tools: ["Lab instrumentation", "ATE", "Debug infrastructure", "Characterization suites"],
    programView: [
      "First Silicon health assessment",
      "Respin vs metal-fix decision framework",
      "Customer sampling readiness",
      "Qualification entry criteria",
      "Bug disposition board"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
  {
    id: "qualification", stage: 23, title: "Qualification & Production", shortTitle: "MP",
    tagline: "Engineering becomes a product.",
    description: "Prove reliability to standard, drive yield to the cost model, release the production test program, and commit to a ramp the supply chain can actually hold.",
    activities: ["Reliability qual", "Yield learning", "Production test release", "Volume ramp"],
    /* Listed in the order this stage's plan produces them. */
    deliverables: [
      "Qualification plan and JEDEC-compliant qualification report",
      "Yield model versus cost target report",
      "Production test program release",
      "Compliance certificates",
      "Reliability and package qualification data packages",
      "Ramp plan and supply commitment",
      "Datasheet and product documentation set",
      "Production readiness review sign-off",
      "Mass Production release record"
    ],
    engineeringView: [
      "Qualification Plan Definition Against JEDEC / AEC Standards",
      "Reliability Stress Execution (HTOL, HTS, Temperature Cycle, uHAST, THB)",
      "ESD (HBM, CDM) and Latch-Up Qualification",
      "Package Qualification (MSL, Drop, Bend, Board-Level Reliability)",
      "Yield Learning, Failure Pareto, and Defect Analysis",
      "Production Test Program Release and Guard-Band Validation",
      "Test Time Reduction and Multi-Site Conversion",
      "Process Corner and Split-Lot Validation",
      "Production Readiness Review and Change Control (PCN) Setup",
      "Capacity, Supply Chain, and Ramp Commitment",
      "Compliance and Certification (PCIe/CXL, RoHS/REACH, Safety)",
      "Product Documentation Release"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [6, 18, 6, 12, -20, 9, 9, 9, 6, 12, 12, 10],
    engineeringEffort: [8, 30, 8, 18, 40, 20, 16, 14, 8, 12, 18, 16],
    /* The plan this stage runs to, in weeks from its start. Reliability stress sets the length of the stage — eighteen weeks of it — and everything else is arranged to finish before the production readiness review that releases the product. */
    engineeringStart: [0, 4, 6, 8, 0, 10, 14, 8, 20, 10, 8, 12],
    /* Which activity produces each deliverable, and the week it is due. */
    deliverableFrom: [0, 4, 5, 10, 1, 9, 11, 8, 8],
    deliverableWeek: [6, 16, 19, 20, 22, 22, 22, 26, 26],
    risks: ["Qualification failures", "Yield shortfall", "Supply constraints"],
    potentialRisks: [
      "Qualification vehicles not ready on time",
      "No contingency plan for reliability failures",
      "Yield model gap vs product cost target",
      "Production guard-bands not validated",
      "Compliance certification starting after the launch date",
      "Supply chain ramp commitments unsecured"
    ],
    leader: { name: "Sarah Osei", short: "S. Osei", phone: "+1 (737) 555-0155", email: "sarah.osei@example.com" },
    collaboration: ["Reliability", "Test", "Foundry / OSAT", "Quality", "Operations"],
    tools: ["Reliability stress systems", "ATE", "Yield management", "SPC"],
    programView: [
      "Qualification Complete milestone",
      "Yield vs cost model tracking",
      "Production readiness review",
      "Ramp commitment to customers",
      "Mass Production milestone"
    ],
    perspective: "A short engineering or program-management insight will appear here.",
  },
] satisfies readonly JourneyStage[];
