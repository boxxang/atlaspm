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
    deliverables: [
      "Product requirements document (PRD)",
      "Target specification — PPA and KPI table",
      "Product cost and margin model",
      "Feasibility report",
      "Program charter, staffing and budget plan",
      "Kickoff Go / No-Go decision record"
    ],
    engineeringView: [
      "Market and customer requirements consolidation",
      "Workload / use-case profiling and target KPI derivation (TOPS, TOPS/W, tokens/s)",
      "PPA target definition — frequency, power envelope, die area budget",
      "Die size, yield and product cost model (wafer, mask, package, test, ASP)",
      "Memory and interface bandwidth requirements (HBM stacks, PCIe/CXL lanes, D2D)",
      "Competitive benchmarking and product positioning",
      "Feasibility assessment against candidate technology nodes",
      "Program schedule, resource and staffing plan drafting",
      "Business case preparation and funding approval package"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [4, 5, 4, 4, 3, 4, 4, 4, 3],
    engineeringEffort: [4, 6, 3, 3, 2, 2, 3, 3, 2],
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
    deliverables: [
      "Architecture specification",
      "Performance model and workload analysis report",
      "Block partitioning and PPA budget table",
      "Interface and protocol definition document",
      "Power / clock / reset architecture and UPF intent",
      "Chip-level block diagram with pin and bump budget",
      "Architecture Freeze review package"
    ],
    engineeringView: [
      "System-level performance modelling and workload simulation",
      "Compute / memory / interconnect partitioning; monolithic vs chiplet decision",
      "Dataflow and memory hierarchy definition (on-die SRAM capacity, HBM channels)",
      "Interface and protocol selection (PCIe gen, CXL, UCIe, HBM3/3E)",
      "Power domain, clock domain and DVFS architecture; UPF intent draft",
      "PPA budget allocation per block",
      "Security and safety architecture — secure boot, root of trust, fusing",
      "Chip-level floorplan intent, pin and bump budget",
      "Architecture specification authoring and review",
      "Block microarchitecture specification kickoff"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [14, 8, 8, 6, 7, 4, 6, 5, 9, 6],
    engineeringEffort: [28, 14, 12, 6, 9, 4, 7, 5, 14, 12],
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
    deliverables: [
      "Technology selection report and decision record",
      "Process option / flavour sheet agreed with foundry",
      "Wafer, mask and NRE cost sheet",
      "Executed foundry design agreement (DA) and NDA",
      "Capacity and tapeout slot commitment",
      "Node risk assessment — maturity, defect density, yield learning curve"
    ],
    engineeringView: [
      "Foundry and node long-list to short-list evaluation",
      "Process option and flavour selection (HPC/HD, multi-Vt menu, backside PDN, RF/HV adders)",
      "Density / performance / leakage benchmarking against product targets (DTCO study)",
      "Wafer price, mask and NRE quotation; MPW and volume pricing",
      "Fab capacity and tapeout slot reservation; hot-lot policy agreement",
      "Foundry legal engagement — NDA, design agreement, IP licensing frame",
      "Foundry roadmap and risk-production timing alignment",
      "Second-source and node-migration strategy assessment",
      "OSAT and backend supply chain preliminary alignment"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [5, 5, 7, 6, 5, 8, 4, 4, 5],
    engineeringEffort: [4, 4, 6, 3, 2, 2, 1.5, 1.5, 2],
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
    deliverables: [
      "PDK readiness dashboard — version, release date, open gap list",
      "Qualified library list with .lib / LEF / GDS views",
      "Memory PPA gap analysis and custom-instance decision record",
      "EDA tool and version matrix (qualified and frozen)",
      "Internal reference flow and methodology guide",
      "Signoff corner definition agreed with foundry",
      "Compute and license capacity plan",
      "Golden environment release notes"
    ],
    engineeringView: [
      "PDK version roadmap tracking (0.1 → 0.5 → 1.0 → production) and delta impact analysis",
      "Design rule manual review; restricted and recommended rule disposition",
      "Standard cell library selection and qualification (track height, multi-Vt, multi-bit flops)",
      "Memory compiler evaluation and instance generation (SRAM, register file)",
      "Compiler instance PPA characterisation against block budgets — density, Vmin, access time, leakage",
      "Custom / pushed-rule memory instance decision, scope and schedule impact assessment",
      "IO, ESD and latch-up library qualification",
      "EDA tool version qualification for the node — synthesis, P&R, STA, PV, EM/IR",
      "Foundry reference flow bring-up and internal methodology deck",
      "Rule deck, QRC tech file and DRC/LVS deck version control",
      "Signoff corner and derate definition agreed with foundry (PVT, OCV/AOCV/POCV)",
      "Compute farm, EDA license and storage capacity planning",
      "Golden design environment release and flow regression"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [-34, 6, 8, 9, 6, 4, 6, 10, 10, -6, 6, 6, 8],
    engineeringEffort: [14, 5, 9, 10, 7, 3, 5, 12, 12, 4, 5, 3, 8],
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
    deliverables: [
      "IP bill of materials with make / buy / reuse decision per block",
      "Vendor evaluation matrix and selection record",
      "IP readiness report — silicon-proven status and maturity level per IP",
      "IP deliverable acceptance checklist",
      "Executed licences and POs with committed delivery dates",
      "IP delivery schedule folded into the program plan",
      "IP risk register and contingency plan"
    ],
    engineeringView: [
      "Product requirement → IP requirement decomposition (IP bill of materials)",
      "Reuse inventory audit — internal IP already available on the target node",
      "Make / buy / reuse decision per IP block",
      "Vendor RFI / RFQ and technical evaluation",
      "Silicon-proven status check per IP on the selected node and process option",
      "IP deliverable checklist review (GDS, LEF, multi-corner .lib, CDL, UPF, DV collateral, errata)",
      "Licence negotiation, PO issue and delivery-date commitment",
      "Porting / hardening scope and schedule for IP not proven on the node",
      "IP delivery schedule alignment to RTL and PD integration windows",
      "IP maturity risk rating and second-source contingency"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [5, 4, 5, 9, 7, 7, 12, 5, 4, 4],
    engineeringEffort: [5, 3, 4, 10, 6, 6, 5, 4, 2, 2],
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
    deliverables: [
      "AMS IP specifications and design review packages",
      "Characterisation reports across PVT and Monte Carlo",
      "Custom SRAM instance specification with Vmin and sigma-yield report",
      "Custom memory views characterised to compiler equivalence",
      "Hard macro GDS with abstract views (LEF, .lib, CDL, UPF, wreal/Verilog model)",
      "Per-macro DRC / LVS clean signoff, pushed rules approved by foundry",
      "Reliability report — EM/IR, ESD, latch-up, aging",
      "Integration guide with known limitations and errata"
    ],
    engineeringView: [
      "AMS IP specification and budget allocation (jitter, BER, PSRR, area)",
      "PLL / clock generator design and closure",
      "SerDes and PHY design or vendor hardening (PCIe/CXL, UCIe, HBM PHY)",
      "LDO, bandgap and power-management cell design",
      "Custom SRAM instance architecture — bitcell selection, array organisation, sense amp and replica timing",
      "Read / write assist circuit design for Vmin — WL boost, negative bitline, VDD collapse",
      "Custom array layout and pushed-rule DRC closure with foundry approval",
      "Statistical margin and yield analysis — importance sampling, sigma-Vmin, bitcell variation",
      "Redundancy and repair scheme integration with the BISR architecture",
      "Custom memory view generation and compiler-equivalent characterisation across corners",
      "Schematic design and pre-layout simulation",
      "Custom layout with DRC / LVS / antenna and fill closure",
      "Post-layout extracted simulation across PVT and Monte Carlo",
      "Reliability checks — EM/IR, aging, ESD, latch-up",
      "Hard macro abstraction and view generation (LEF, .lib, CDL, GDS, behavioural model)",
      "AMS–digital co-simulation and integration support"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [6, 26, 34, 20, 10, 10, 16, 10, 6, 10, 16, 18, 16, 10, 8, -16],
    engineeringEffort: [8, 32, 60, 22, 14, 12, 22, 12, 6, 12, 20, 26, 20, 10, 8, 12],
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
    deliverables: [
      "Test chip specification and risk coverage matrix",
      "Test chip GDS and shuttle submission record",
      "Test chip silicon and characterisation report",
      "Silicon-to-model correlation report",
      "Design guidance and margin decisions for the production chip"
    ],
    engineeringView: [
      "Test chip objective definition and risk-item selection",
      "Test chip design and integration (IP under test, ring oscillators, PCM structures)",
      "MPW shuttle slot booking and data submission scheduling",
      "Test chip physical implementation and signoff",
      "Shuttle tapeout and fabrication",
      "Test chip board and lab setup preparation",
      "Silicon characterisation and correlation to simulation",
      "Feedback into the production design — model correction and margin decisions"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [5, 12, 4, 12, 16, 9, 12, 6],
    engineeringEffort: [4, 18, 1, 20, 4, 8, 20, 8],
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
      "Block microarchitecture specification",
      "Block-level RTL implementation",
      "Third-party and internal IP integration — wrappers, glue, configuration",
      "Chip-level integration and top assembly",
      "Clock, reset and power intent (UPF) implementation",
      "Lint, CDC and RDC closure",
      "Register map / RDL definition and header generation",
      "Trial synthesis feedback loop on RTL PPA",
      "CI build, nightly regression and release management",
      "Specification change control and ECO board"
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
    deliverables: [
      "Verification plan (vPlan) and coverage model",
      "UVM testbenches and integrated VIP",
      "Regression and coverage dashboards",
      "Formal proof reports with assumption list",
      "Low-power verification report",
      "Emulation platform and system test suite",
      "Gate-level simulation report",
      "DV closure signoff package"
    ],
    engineeringView: [
      "Verification plan and coverage model definition",
      "UVM environment and VIP bring-up",
      "Block-level constrained-random and directed testing",
      "Chip-level and system-level scenario testing",
      "Formal property verification — control logic, connectivity, security",
      "Low-power (UPF) verification",
      "AMS / mixed-signal co-simulation",
      "Emulation and FPGA prototype bring-up — capacity, partitioning, speed",
      "Performance and bandwidth validation against the architecture model",
      "Coverage closure and regression stability management",
      "Gate-level simulation, functional and timing-annotated",
      "Bug triage and disposition board"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [8, 14, 30, 22, 16, 10, 12, 20, 12, -26, 10, -34],
    engineeringEffort: [25, 60, 200, 110, 40, 20, 20, 55, 30, 45, 20, 25],
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
    deliverables: [
      "DFT architecture specification and coverage plan",
      "MBIST / BISR insertion and test collateral",
      "JTAG / IJTAG description files (BSDL, ICL, PDL)",
      "ATPG pattern sets with coverage report",
      "DFT DRC clean report",
      "Pattern validation (GLS) report and ATE-ready pattern files",
      "DFT signoff entry for the tapeout checklist"
    ],
    engineeringView: [
      "DFT architecture definition — scan style, compression ratio, hierarchical DFT",
      "Test coverage and test-time target negotiation with product and test engineering",
      "MBIST / BIRA / BISR architecture for embedded memories",
      "Boundary scan and IJTAG (1149.1 / 1687), TAP and debug access architecture",
      "On-chip clock controller design for at-speed testing",
      "Scan insertion and DFT DRC during synthesis",
      "ATPG pattern generation — stuck-at, transition, cell-aware — and coverage closure",
      "Pattern validation by gate-level simulation and ATE format conversion (STIL/WGL)",
      "Scan compression and chain routing feasibility with physical design",
      "eFuse, chip ID and memory repair infrastructure",
      "Silicon debug hooks — trace, observability, design-for-debug"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [8, 5, 10, 8, 7, 10, 16, 10, 10, 6, 8],
    engineeringEffort: [12, 4, 14, 10, 8, 14, 28, 14, 10, 6, 10],
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
    deliverables: [
      "N0 flow-flush netlist for PD flow setup",
      "N1 and N2 netlist drops with QoR delta reports",
      "FFN — final full netlist, release-tagged",
      "Validated SDC constraint set per mode and corner",
      "Synthesis QoR report per drop against PPA targets",
      "Formal equivalence clean report per drop",
      "Power intent implementation report",
      "Physical design handoff package per drop"
    ],
    engineeringView: [
      "SDC constraint development and validation",
      "Technology mapping and optimisation — multi-Vt, multi-bit, useful skew",
      "N0 flow-flush netlist release — functionally incomplete, structurally representative, issued so PD can build the flow",
      "Physical-aware synthesis with congestion feedback from the PD flow setup",
      "N1 netlist drop — first quality turn against PD placement and congestion feedback",
      "Power optimisation — clock gating, operand isolation, Vt mix",
      "Low-power synthesis — isolation and level-shifter insertion against UPF",
      "N2 netlist drop — timing and congestion converged, late RTL changes absorbed",
      "FFN (final full netlist) release — RTL frozen, ECOs closed, no functional change beyond this point",
      "Formal equivalence checking per drop, RTL versus netlist",
      "Timing, area and power reporting against budget, per drop",
      "Netlist handoff and QoR delta review with physical design, per drop"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [8, 8, 4, 7, 5, 7, 5, 5, 4, -20, -22, -22],
    engineeringEffort: [18, 16, 6, 14, 12, 12, 8, 12, 10, 12, 10, 6],
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
    deliverables: [
      "Flow setup release — MMMC environment, scripts and runtime baseline",
      "Turn 1 and Turn 2 databases with QoR delta reports",
      "Final-turn routed database on the FFN, per block and top",
      "Floorplan and PDN specification",
      "MCMM timing closure reports with violation burn-down across turns",
      "Interim physical DRC / LVS clean",
      "Bump map, RDL and package interface files",
      "ECO log and change control record",
      "Signoff-ready database handoff"
    ],
    engineeringView: [
      "Flow setup and MMMC environment build on the N0 flow-flush netlist — scripts, decks, runtimes, capacity",
      "Floorplan, macro placement and partition definition",
      "Power delivery network design and early IR analysis",
      "Bump and RDL planning with chip-package co-design feedback",
      "Turn 1 on the N1 drop — placement, CTS and first full route; QoR baseline established",
      "Turn 2 on the N2 drop — congestion, timing and power convergence; closure risk quantified",
      "Clock tree synthesis with skew and jitter budgeting, refined across turns",
      "Detailed routing and DRC convergence",
      "Multi-corner multi-mode timing closure",
      "Signal and power integrity iteration — crosstalk, EM",
      "Chip power model (CPM/CPS) extraction and handoff to package co-verification",
      "Scan chain reordering and DFT-aware routing",
      "Final turn on the FFN — full closure, no functional change admitted",
      "Functional and timing ECO implementation",
      "Chip finishing — seal ring, dummy and metal fill, alignment marks",
      "Hierarchical block closure and top-level assembly"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [7, 9, 8, 8, 8, 8, -12, -16, -22, 10, 5, 6, 11, -18, 5, 14],
    engineeringEffort: [22, 32, 20, 14, 45, 45, 26, 40, 60, 18, 6, 8, 55, 22, 6, 30],
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
    deliverables: [
      "STA signoff reports across all corners and modes, with waiver list",
      "Clean DRC / LVS / antenna / density reports",
      "EM/IR and SI/PI signoff reports",
      "Reliability reports — ESD, latch-up, FIT",
      "DFM and lithography hotspot report",
      "Final formal equivalence report",
      "Signoff summary and Design Freeze package"
    ],
    engineeringView: [
      "Signoff flow dry run on the Turn 2 database — decks, runtimes, capacity and violation triage rehearsed",
      "Multi-corner multi-mode static timing analysis and closure on the final turn",
      "Full-chip DRC, LVS, antenna and density verification",
      "EM and IR-drop signoff, static and dynamic",
      "Power and signal integrity signoff — crosstalk, noise",
      "Chip-package-system co-analysis signoff review against SIPI results",
      "Reliability verification — ESD, latch-up, soft error / FIT",
      "DFM and lithography checks, CMP and hotspot analysis",
      "Final formal equivalence and LVS netlist consistency",
      "Waiver review board and foundry waiver alignment",
      "Gate-level simulation with final SDF",
      "Signoff corner correlation against foundry decks"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [6, 10, 9, 8, 6, 4, 6, 6, 5, 6, 5, 5],
    engineeringEffort: [14, 34, 26, 20, 12, 5, 10, 10, 8, 6, 8, 6],
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
      "Final GDSII / OASIS assembly on the FFN closure database, with layer map verification",
      "Final full-chip verification re-run on the released database",
      "Tapeout checklist completion and owner sign-off",
      "Open-issue risk assessment and waiver acceptance",
      "Go / No-Go decision meeting",
      "FEOL layer data preparation and MTO release to the mask shop",
      "FEOL mask order confirmation and mask shop scheduling",
      "BEOL design fix window — metal-layer ECOs and late fixes while FEOL masks are being cut",
      "BEOL layer re-verification — DRC, LVS, antenna and density on the fixed metal stack",
      "BEOL layer data preparation and MTO release",
      "BEOL mask order confirmation and full mask set completion tracking"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [2, 2, 3, 2, 0.5, 1.5, 1, 4, 2.5, 1.5, 1],
    engineeringEffort: [6, 8, 5, 3, 1, 3, 1, 10, 6, 3, 1],
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
    deliverables: [
      "FEOL and BEOL mask sets with qualification reports",
      "Processed engineering-lot wafers",
      "Inline, PCM and WAT data package",
      "Wafer acceptance disposition record",
      "Wafer-out forecast versus actual log",
      "First Silicon availability notice"
    ],
    engineeringView: [
      "FEOL mask set fabrication, inspection and qualification",
      "Wafer start on FEOL mask availability",
      "BEOL mask set fabrication, inspection and qualification, in parallel with front-end processing",
      "Front-end wafer processing",
      "Back-end-of-line processing",
      "Inline metrology and defect inspection monitoring",
      "E-test / PCM data review",
      "Wafer acceptance test and lot disposition",
      "Hot-lot management and WIP tracking",
      "Wafer shipment and logistics to sort and assembly"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [7, 1, 6, 8, 5, -14, 3, 3, -18, 2],
    engineeringEffort: [4, 1, 4, 3, 2, 5, 3, 3, 4, 1],
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
    deliverables: [
      "Package architecture specification",
      "Bump map and interposer / RDL database",
      "Substrate design files (Gerber / ODB++) and stack-up",
      "Package electrical design intent and model handoff to co-verification",
      "Thermal and mechanical (warpage) simulation reports",
      "Test vehicle requirement specification for PTV",
      "Substrate and interposer PO with committed lead time",
      "OSAT assembly process flow and agreement",
      "Package Design Freeze package"
    ],
    engineeringView: [
      "Package architecture selection — 2.5D interposer type, organic substrate, layer count",
      "Bump map, pitch and power-ground planning with physical design",
      "Interposer / RDL routing design",
      "Substrate stack-up, escape routing and package DRC",
      "Package routing for signal integrity — length matching, reference plane and via design",
      "Package PDN and decap footprint design (electrical closure owned by SIPI)",
      "Thermal and mechanical simulation — warpage, co-planarity, TIM, lid",
      "Test vehicle requirement definition and handoff to PTV",
      "Substrate and interposer supplier selection and lead-time booking",
      "OSAT selection and assembly process definition",
      "Package design freeze, DRC and tooling release"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [8, 10, 14, 14, 10, 9, 12, 4, 10, 9, 6],
    engineeringEffort: [10, 12, 18, 18, 12, 10, 12, 3, 4, 5, 6],
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
      "Test vehicle strategy and risk item definition — CPI, warpage, thermal, ULK/BEOL stress",
      "Mechanical test vehicle (MTV) design — bump array, dummy die stack, substrate coupon",
      "Thermal test vehicle (TTV) design — embedded heater array and RTD sensor placement",
      "Daisy-chain electrical vehicle design — interconnect continuity and bump yield structures",
      "TV die fabrication and interposer / substrate vehicle build",
      "OSAT assembly of vehicles with process window DOE",
      "Warpage and co-planarity measurement across the reflow profile (shadow moiré)",
      "Chip-package interaction stress evaluation — low-k / ULK crack, bump and BEOL integrity",
      "Thermal characterisation — Rjc / Rja, TIM performance, hotspot mapping against the thermal model",
      "Board-level reliability on vehicles — temperature cycle, drop, bend",
      "Daisy-chain continuity test and assembly yield learning",
      "Feedback into package design and assembly process window freeze"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [6, 9, 9, 8, 16, 11, 7, 11, 9, 14, 9, 7],
    engineeringEffort: [5, 8, 8, 6, 6, 12, 8, 14, 10, 8, 6, 5],
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
    deliverables: [
      "Chip power model (CPM/CPS) release per domain and mode",
      "Extracted package and board electrical models",
      "PDN impedance and dynamic IR co-simulation report",
      "Decap budget and placement specification across die, package and board",
      "Channel compliance report per interface, with margins",
      "Eye, jitter and BER budget closure record",
      "Power-aware STA correlation report",
      "Chip-package-system co-verification signoff — tapeout gate"
    ],
    engineeringView: [
      "Chip power model (CPM/CPS) extraction per power domain and operating mode",
      "Package and board model extraction — 3D EM, S-parameter and RLC network",
      "Die-package-board PDN co-simulation — DC and AC impedance versus target",
      "Dynamic voltage-drop analysis with package inductance and real switching profiles",
      "Decoupling capacitor budget and placement optimisation across die, package and board",
      "SSN / SSO and simultaneous-switching noise analysis at the IO ring",
      "High-speed channel simulation with extracted package models — insertion loss, crosstalk, return path",
      "Eye diagram, jitter and BER budget closure per interface (PCIe/CXL, HBM, die-to-die)",
      "Power-aware timing correlation — voltage drop back-annotated into STA",
      "Electro-thermal co-analysis coupled with the package thermal model",
      "Co-verification signoff review and criteria disposition with design and package teams"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [7, 8, 9, 8, 7, 5, 9, 8, 5, 5, 4],
    engineeringEffort: [8, 10, 12, 10, 7, 5, 11, 9, 5, 5, 3],
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
    description: "Stack, bond and build the units — known-good die, HBM stacks, underfill, lid — and learn the assembly yield on the parts bring-up and qualification will consume.",
    activities: ["Known-good-die sort", "Bonding & underfill", "Inline inspection", "Unit allocation"],
    deliverables: [
      "Assembled units — bring-up, qualification and sample lots",
      "Assembly travelers and process data",
      "Assembly yield report and failure pareto",
      "Package-level inspection and test data",
      "Unit allocation record across bring-up, qual and customers"
    ],
    engineeringView: [
      "Known-good-die sort and selection",
      "HBM stack procurement and incoming inspection",
      "Die attach, micro-bump and thermo-compression bonding",
      "Interposer and substrate assembly, underfill, molding",
      "Lid / TIM attach and ball attach",
      "Assembly inline inspection — X-ray, CSAM, warpage metrology",
      "Assembly yield analysis and process tuning",
      "Package-level open / short and continuity test",
      "Unit build for bring-up, qualification and customer samples"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [3, 3, 3, 3, 2, 2, 5, 2, 3],
    engineeringEffort: [5, 2, 6, 5, 3, 3, 6, 3, 3],
    risks: ["Assembly yield", "Material availability", "Inspection escapes"],
    potentialRisks: [
      "Known-good-die test coverage insufficient",
      "HBM stack supply timing",
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
    deliverables: [
      "Validation platform specification",
      "EVB schematics, BOM and layout database",
      "Fabricated and assembled boards, rev A/B with quantity plan",
      "Board bring-up report and known issues",
      "Debug and trace access documentation",
      "Lab setup and instrument reservation plan"
    ],
    engineeringView: [
      "Validation platform requirements and topology definition",
      "EVB schematic design — power tree, clocking, host interface, connectors",
      "PCB layout with high-speed channel SI/PI simulation",
      "PCB fabrication and assembly",
      "Power delivery, VRM and telemetry design and bring-up",
      "Debug infrastructure — JTAG and trace pods, interposers, instrumentation headers",
      "Board bring-up with socketed or dummy parts",
      "Thermal solution and cooling for the lab platform",
      "Lab instrumentation reservation and test rack build",
      "Minimum host-side enablement for power-on (BSP handoff boundary)"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [5, 10, 12, 8, 7, 7, 7, 7, 7, 7],
    engineeringEffort: [5, 14, 18, 4, 8, 8, 10, 7, 8, 10],
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
    deliverables: [
      "Test plan and test coverage matrix",
      "Qualified probe card and load board",
      "Wafer sort and final test programs, release-tagged",
      "Characterisation test suite",
      "ATE-ready pattern set with debug log",
      "Test time and test cost model",
      "Test data infrastructure and yield database"
    ],
    engineeringView: [
      "Test plan and coverage strategy — wafer sort, final test, system-level test",
      "ATE platform selection and tester time booking",
      "Probe card design, fabrication and qualification",
      "Load board / DUT board design, fabrication and bring-up",
      "Wafer sort test program development",
      "Final / package test program development",
      "Characterisation test content — shmoo, Vmin/Fmax, PVT sweeps",
      "DFT pattern porting to ATE format and pattern debug",
      "Test time and cost optimisation — parallelism, site count",
      "Correlation between ATE, bench and system results",
      "Test data infrastructure — STDF collection and yield database"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [8, 6, 20, 17, 16, 16, 12, 10, 9, 8, 8],
    engineeringEffort: [12, 4, 16, 16, 30, 28, 20, 16, 12, 10, 10],
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
    deliverables: [
      "Bring-up report with per-milestone health status",
      "Characterisation data set — V/F/T shmoo and power measurements",
      "Interface compliance results with training margins",
      "Errata list with workarounds",
      "Failure analysis reports",
      "Respin versus metal-fix decision record",
      "Customer sample release package"
    ],
    engineeringView: [
      "Sample receipt, incoming inspection and board mounting",
      "Power-on, power sequencing and basic health check",
      "Reset, clocking and PLL lock validation",
      "Boot, firmware load and functional smoke test",
      "Interface bring-up — PCIe/CXL link training, HBM training, die-to-die",
      "Memory subsystem and bandwidth validation",
      "Shmoo across voltage, frequency and temperature",
      "Performance validation against the architecture model",
      "Silicon debug of anomalies and failure analysis requests",
      "Errata capture, workaround definition and documentation",
      "Respin versus metal-fix decision analysis — ECO scope, cost, schedule",
      "Customer sample readiness and release package"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [1.5, 3, 3, 4, 8, 6, 7, 6, 10, 7, 4, 5],
    engineeringEffort: [2, 8, 8, 12, 26, 16, 16, 16, 28, 10, 5, 6],
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
    deliverables: [
      "Qualification plan and JEDEC-compliant qualification report",
      "Reliability and package qualification data packages",
      "Production test program release",
      "Yield model versus cost target report",
      "Production readiness review sign-off",
      "Ramp plan and supply commitment",
      "Compliance certificates",
      "Datasheet and product documentation set",
      "Mass Production release record"
    ],
    engineeringView: [
      "Qualification plan definition against JEDEC / AEC standards",
      "Reliability stress — HTOL, HTS, temperature cycle, uHAST, THB",
      "ESD (HBM, CDM) and latch-up qualification",
      "Package qualification — MSL, drop, bend, board-level reliability",
      "Yield learning, failure pareto and defect analysis",
      "Production test program release and guard-band validation",
      "Test time reduction and multi-site conversion",
      "Process corner and split-lot validation",
      "Production readiness review and change control (PCN) setup",
      "Capacity, supply chain and ramp commitment — wafer starts, substrate, HBM",
      "Compliance and certification — PCIe/CXL compliance, RoHS/REACH, safety",
      "Documentation release — datasheet, user guide, errata, application notes"
    ],
    /** Elapsed weeks per engineering activity; negative marks one that runs continuously. */
    engineeringTat: [6, 18, 6, 12, -20, 9, 9, 9, 6, 12, 12, 10],
    engineeringEffort: [8, 30, 8, 18, 40, 20, 16, 14, 8, 12, 18, 16],
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
