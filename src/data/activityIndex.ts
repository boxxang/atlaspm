/**
 * The small maps about activities — titles, deliverable titles, the glossary,
 * and which activities have been written up.
 *
 * Split from /data/activityDetails.ts because that module is a megabyte of
 * write-ups and this one is a few tens of kilobytes. Client components read
 * this; only the server reads the write-ups themselves.
 *
 * Generated from the same authoring document. Not edited by hand.
 */

export interface GlossaryTerm {
  full: string;
  group: string;
  note: string;
}

/** Every activity of the template, in the order the programme runs them. */
export const detailActivityTitles: Record<string, string> = {
 "DEF-01": "Customer and Market Requirements Definition",
 "DEF-02": "Workload Definition and KPI Targets",
 "DEF-03": "PPA target definition",
 "DEF-04": "Product Cost and Margin Model",
 "DEF-05": "Memory and Interface Requirements",
 "DEF-06": "Competitive benchmarking and gap analysis",
 "DEF-07": "Technology Node Feasibility Assessment",
 "DEF-08": "Program Planning and Resourcing",
 "DEF-09": "Business Case and Funding Approval",
 "ARCH-01": "System-level performance modeling and workload simulation",
 "ARCH-02": "System Architecture Partitioning",
 "ARCH-03": "Dataflow and Memory Hierarchy Definition",
 "ARCH-04": "Interface and protocol selection",
 "ARCH-05": "Power, Clock, and DVFS Architecture",
 "ARCH-06": "Block-Level PPA Budget Allocation",
 "ARCH-07": "Security and Safety Architecture",
 "ARCH-08": "Chip-Level Floorplan and Bump Planning",
 "ARCH-09": "Architecture Specification and Freeze",
 "ARCH-10": "Block Microarchitecture Definition",
 "TECH-01": "Foundry and node long-list to short-list evaluation",
 "TECH-02": "Process option and flavor selection",
 "TECH-03": "Density / performance / leakage benchmarking against product targets",
 "TECH-04": "Wafer price, mask and NRE quotation; MPW and volume pricing",
 "TECH-05": "Fab capacity and tapeout slot reservation; hot-lot policy agreement",
 "TECH-06": "Foundry legal engagement — NDA, design agreement, IP licensing frame",
 "TECH-07": "Foundry roadmap and risk-production timing alignment",
 "TECH-08": "Second-source and node-migration strategy assessment",
 "TECH-09": "OSAT and backend supply chain preliminary alignment",
 "PDK-01": "PDK version roadmap tracking (0.1 → 0.5 → 1.0 → production) and delta impact analysis",
 "PDK-02": "Design rule manual review; restricted and recommended rule disposition",
 "PDK-03": "Standard cell library selection and qualification",
 "PDK-04": "Memory compiler evaluation and instance generation",
 "PDK-05": "Compiler instance PPA characterization against block budgets — density, Vmin, access time, leakage",
 "PDK-06": "Custom / pushed-rule memory instance decision, scope and schedule impact assessment",
 "PDK-07": "IO, ESD and latch-up library qualification",
 "PDK-08": "EDA tool version qualification for the node — synthesis, P&R, STA, PV, EM/IR",
 "PDK-09": "Foundry reference flow bring-up and internal methodology deck",
 "PDK-10": "Rule deck, QRC tech file and DRC/LVS deck version control",
 "PDK-11": "Signoff corner and derate definition agreed with foundry",
 "PDK-12": "Compute farm, EDA license and storage capacity planning",
 "PDK-13": "Golden design environment release and flow regression",
 "IPR-01": "Product requirement → IP requirement decomposition",
 "IPR-02": "Reuse inventory audit — internal IP already available on the target node",
 "IPR-03": "Make / buy / reuse decision per IP block",
 "IPR-04": "Vendor RFI / RFQ and technical evaluation",
 "IPR-05": "Silicon-proven status check per IP on the selected node and process option",
 "IPR-06": "IP deliverable checklist review",
 "IPR-07": "Licence negotiation, PO issue and delivery-date commitment",
 "IPR-08": "Porting / hardening scope and schedule for IP not proven on the node",
 "IPR-09": "IP delivery schedule alignment to RTL and PD integration windows",
 "IPR-10": "IP maturity risk rating and second-source contingency",
 "AMS-01": "AMS IP specification and budget allocation",
 "AMS-02": "PLL / clock generator design and closure",
 "AMS-03": "SerDes and PHY design or vendor hardening",
 "AMS-04": "LDO, bandgap and power-management cell design",
 "AMS-05": "Custom SRAM instance architecture — bitcell selection, array organization, sense amp and replica timing",
 "AMS-06": "Read / write assist circuit design for Vmin — WL boost, negative bitline, VDD collapse",
 "AMS-07": "Custom array layout and pushed-rule DRC closure with foundry approval",
 "AMS-08": "Statistical margin and yield analysis — importance sampling, sigma-Vmin, bitcell variation",
 "AMS-09": "Redundancy and repair scheme integration with the BISR architecture",
 "AMS-10": "Custom memory view generation and compiler-equivalent characterization across corners",
 "AMS-11": "Schematic design and pre-layout simulation",
 "AMS-12": "Custom layout with DRC / LVS / antenna and fill closure",
 "AMS-13": "Post-layout extracted simulation across PVT and Monte Carlo",
 "AMS-14": "Reliability checks — EM/IR, aging, ESD, latch-up",
 "AMS-15": "Hard macro abstraction and view generation",
 "AMS-16": "AMS–digital co-simulation and integration support",
 "TC-01": "Test chip objective definition and risk-item selection",
 "TC-02": "Test chip design and integration",
 "TC-03": "MPW shuttle slot booking and data submission scheduling",
 "TC-04": "Test chip physical implementation and signoff",
 "TC-05": "Shuttle tapeout and fabrication",
 "TC-06": "Test chip board and lab setup preparation",
 "TC-07": "Silicon characterization and correlation to simulation",
 "TC-08": "Feedback into the production design — model correction and margin decisions",
 "RTL-01": "Block microarchitecture specification",
 "RTL-02": "Block-level RTL implementation",
 "RTL-03": "Third-party and internal IP integration — wrappers, glue, configuration",
 "RTL-04": "Chip-level integration and top assembly",
 "RTL-05": "Clock, reset and power intent (UPF) implementation",
 "RTL-06": "Lint, CDC and RDC closure",
 "RTL-07": "Register map / RDL definition and header generation",
 "RTL-08": "Trial synthesis feedback loop on RTL PPA",
 "RTL-09": "CI build, nightly regression and release management",
 "RTL-10": "Specification change control and ECO board",
 "DV-01": "Verification plan and coverage model definition",
 "DV-02": "UVM environment and VIP bring-up",
 "DV-03": "Block-level constrained-random and directed testing",
 "DV-04": "Chip-level and system-level scenario testing",
 "DV-05": "Formal property verification — control logic, connectivity, security",
 "DV-06": "Low-power (UPF) verification",
 "DV-07": "AMS / mixed-signal co-simulation",
 "DV-08": "Emulation and FPGA prototype bring-up — capacity, partitioning, speed",
 "DV-09": "Performance and bandwidth validation against the architecture model",
 "DV-10": "Coverage closure and regression stability management",
 "DV-11": "Gate-level simulation, functional and timing-annotated",
 "DV-12": "Bug triage and disposition board",
 "DFT-01": "DFT architecture definition — scan style, compression ratio, hierarchical DFT",
 "DFT-02": "Test coverage and test-time target negotiation with product and test engineering",
 "DFT-03": "MBIST / BIRA / BISR architecture for embedded memories",
 "DFT-04": "Boundary scan and IJTAG (1149.1 / 1687), TAP and debug access architecture",
 "DFT-05": "On-chip clock controller design for at-speed testing",
 "DFT-06": "Scan insertion and DFT DRC during synthesis",
 "DFT-07": "ATPG pattern generation — stuck-at, transition, cell-aware — and coverage closure",
 "DFT-08": "Pattern validation by gate-level simulation and ATE format conversion",
 "DFT-09": "Scan compression and chain routing feasibility with physical design",
 "DFT-10": "eFuse, chip ID and memory repair infrastructure",
 "DFT-11": "Silicon debug hooks — trace, observability, design-for-debug",
 "SYN-01": "SDC constraint development and validation",
 "SYN-02": "Technology mapping and optimization — multi-Vt, multi-bit, useful skew",
 "SYN-03": "N0 flow-flush netlist release — functionally incomplete, structurally representative, issued so PD can build the flow",
 "SYN-04": "Physical-aware synthesis with congestion feedback from the PD flow setup",
 "SYN-05": "N1 netlist drop — first quality turn against PD placement and congestion feedback",
 "SYN-06": "Power optimization — clock gating, operand isolation, Vt mix",
 "SYN-07": "Low-power synthesis — isolation and level-shifter insertion against UPF",
 "SYN-08": "N2 netlist drop — timing and congestion converged, late RTL changes absorbed",
 "SYN-09": "FFN (final full netlist) release — RTL frozen, ECOs closed, no functional change beyond this point",
 "SYN-10": "Formal equivalence checking per drop, RTL versus netlist",
 "SYN-11": "Timing, area and power reporting against budget, per drop",
 "SYN-12": "Netlist handoff and QoR delta review with physical design, per drop",
 "PD-01": "Flow setup and MMMC environment build on the N0 flow-flush netlist — scripts, decks, runtimes, capacity",
 "PD-02": "Floorplan, macro placement and partition definition",
 "PD-03": "Power delivery network design and early IR analysis",
 "PD-04": "Bump and RDL planning with chip-package co-design feedback",
 "PD-05": "Turn 1 on the N1 drop — placement, CTS and first full route; QoR baseline established",
 "PD-06": "Turn 2 on the N2 drop — congestion, timing and power convergence; closure risk quantified",
 "PD-07": "Clock tree synthesis with skew and jitter budgeting, refined across turns",
 "PD-08": "Detailed routing and DRC convergence",
 "PD-09": "Multi-corner multi-mode timing closure",
 "PD-10": "Signal and power integrity iteration — crosstalk, EM",
 "PD-11": "Chip power model (CPM/CPS) extraction and handoff to package co-verification",
 "PD-12": "Scan chain reordering and DFT-aware routing",
 "PD-13": "Final turn on the FFN — full closure, no functional change admitted",
 "PD-14": "Functional and timing ECO implementation",
 "PD-15": "Chip finishing — seal ring, dummy and metal fill, alignment marks",
 "PD-16": "Hierarchical block closure and top-level assembly",
 "SO-01": "Signoff flow dry run on the Turn 2 database — decks, runtimes, capacity and violation triage rehearsed",
 "SO-02": "Multi-corner multi-mode static timing analysis and closure on the final turn",
 "SO-03": "Full-chip DRC, LVS, antenna and density verification",
 "SO-04": "EM and IR-drop signoff, static and dynamic",
 "SO-05": "Power and signal integrity signoff — crosstalk, noise",
 "SO-06": "Chip-package-system co-analysis signoff review against SIPI results",
 "SO-07": "Reliability verification — ESD, latch-up, soft error / FIT",
 "SO-08": "DFM and lithography checks, CMP and hotspot analysis",
 "SO-09": "Final formal equivalence and LVS netlist consistency",
 "SO-10": "Waiver review board and foundry waiver alignment",
 "SO-11": "Gate-level simulation with final SDF",
 "SO-12": "Signoff corner correlation against foundry decks",
 "TO-01": "Final GDSII / OASIS assembly on the FFN closure database, with layer map verification",
 "TO-02": "Final full-chip verification re-run on the released database",
 "TO-03": "Tapeout checklist completion and owner signoff",
 "TO-04": "Open-issue risk assessment and waiver acceptance",
 "TO-05": "Go / No-Go decision meeting",
 "TO-06": "FEOL layer data preparation and MTO release to the mask shop",
 "TO-07": "FEOL mask order confirmation and mask shop scheduling",
 "TO-08": "BEOL design fix window — metal-layer ECOs and late fixes while FEOL masks are being cut",
 "TO-09": "BEOL layer re-verification — DRC, LVS, antenna and density on the fixed metal stack",
 "TO-10": "BEOL layer data preparation and MTO release",
 "TO-11": "BEOL mask order confirmation and full mask set completion tracking",
 "FAB-01": "FEOL mask set fabrication, inspection and qualification",
 "FAB-02": "Wafer start on FEOL mask availability",
 "FAB-03": "BEOL mask set fabrication, inspection and qualification, in parallel with front-end processing",
 "FAB-04": "Front-end wafer processing",
 "FAB-05": "Back-end-of-line processing",
 "FAB-06": "Inline metrology and defect inspection monitoring",
 "FAB-07": "E-test / PCM data review",
 "FAB-08": "Wafer acceptance test and lot disposition",
 "FAB-09": "Hot-lot management and WIP tracking",
 "FAB-10": "Wafer shipment and logistics to sort and assembly",
 "PKGD-01": "Package architecture selection — 2.5D interposer type, organic substrate, layer count",
 "PKGD-02": "Bump map, pitch and power-ground planning with physical design",
 "PKGD-03": "Interposer / RDL routing design",
 "PKGD-04": "Substrate stack-up, escape routing and package DRC",
 "PKGD-05": "Package routing for signal integrity — length matching, reference plane and via design",
 "PKGD-06": "Package PDN and decap footprint design",
 "PKGD-07": "Thermal and mechanical simulation — warpage, co-planarity, TIM, lid",
 "PKGD-08": "Test vehicle requirement definition and handoff to PTV",
 "PKGD-09": "Substrate and interposer supplier selection and lead-time booking",
 "PKGD-10": "OSAT selection and assembly process definition",
 "PKGD-11": "Package design freeze, DRC and tooling release",
 "PTV-01": "Test vehicle strategy and risk item definition — CPI, warpage, thermal, ULK/BEOL stress",
 "PTV-02": "Mechanical test vehicle (MTV) design — bump array, dummy die stack, substrate coupon",
 "PTV-03": "Thermal test vehicle (TTV) design — embedded heater array and RTD sensor placement",
 "PTV-04": "Daisy-chain electrical vehicle design — interconnect continuity and bump yield structures",
 "PTV-05": "TV die fabrication and interposer / substrate vehicle build",
 "PTV-06": "OSAT assembly of vehicles with process window DOE",
 "PTV-07": "Warpage and co-planarity measurement across the reflow profile",
 "PTV-08": "Chip-package interaction stress evaluation — low-k / ULK crack, bump and BEOL integrity",
 "PTV-09": "Thermal characterization — Rjc / Rja, TIM performance, hotspot mapping against the thermal model",
 "PTV-10": "Board-level reliability on vehicles — temperature cycle, drop, bend",
 "PTV-11": "Daisy-chain continuity test and assembly yield learning",
 "PTV-12": "Feedback into package design and assembly process window freeze",
 "SIPI-01": "Chip power model (CPM/CPS) extraction per power domain and operating mode",
 "SIPI-02": "Package and board model extraction — 3D EM, S-parameter and RLC network",
 "SIPI-03": "Die-package-board PDN co-simulation — DC and AC impedance versus target",
 "SIPI-04": "Dynamic voltage-drop analysis with package inductance and real switching profiles",
 "SIPI-05": "Decoupling capacitor budget and placement optimization across die, package and board",
 "SIPI-06": "SSN / SSO and simultaneous-switching noise analysis at the IO ring",
 "SIPI-07": "High-speed channel simulation with extracted package models — insertion loss, crosstalk, return path",
 "SIPI-08": "Eye diagram, jitter and BER budget closure per interface",
 "SIPI-09": "Power-aware timing correlation — voltage drop back-annotated into STA",
 "SIPI-10": "Electro-thermal co-analysis coupled with the package thermal model",
 "SIPI-11": "Co-verification signoff review and criteria disposition with design and package teams",
 "ASSY-01": "Known-good-die sort and selection",
 "ASSY-02": "HBM stack procurement and incoming inspection",
 "ASSY-03": "Die attach, micro-bump and thermo-compression bonding",
 "ASSY-04": "Interposer and substrate assembly, underfill, molding",
 "ASSY-05": "Lid / TIM attach and ball attach",
 "ASSY-06": "Assembly inline inspection — X-ray, CSAM, warpage metrology",
 "ASSY-07": "Assembly yield analysis and process tuning",
 "ASSY-08": "Package-level open / short and continuity test",
 "ASSY-09": "Unit build for bring-up, qualification and customer samples",
 "EVB-01": "Validation platform requirements and topology definition",
 "EVB-02": "EVB schematic design — power tree, clocking, host interface, connectors",
 "EVB-03": "PCB layout with high-speed channel SI/PI simulation",
 "EVB-04": "PCB fabrication and assembly",
 "EVB-05": "Power delivery, VRM and telemetry design and bring-up",
 "EVB-06": "Debug infrastructure — JTAG and trace pods, interposers, instrumentation headers",
 "EVB-07": "Board bring-up with socketed or dummy parts",
 "EVB-08": "Thermal solution and cooling for the lab platform",
 "EVB-09": "Lab instrumentation reservation and test rack build",
 "EVB-10": "Minimum host-side enablement for power-on",
 "TEST-01": "Test plan and coverage strategy — wafer sort, final test, system-level test",
 "TEST-02": "ATE platform selection and tester time booking",
 "TEST-03": "Probe card design, fabrication and qualification",
 "TEST-04": "Load board / DUT board design, fabrication and bring-up",
 "TEST-05": "Wafer sort test program development",
 "TEST-06": "Final / package test program development",
 "TEST-07": "Characterization test content — shmoo, Vmin/Fmax, PVT sweeps",
 "TEST-08": "DFT pattern porting to ATE format and pattern debug",
 "TEST-09": "Test time and cost optimization — parallelism, site count",
 "TEST-10": "Correlation between ATE, bench and system results",
 "TEST-11": "Test data infrastructure — STDF collection and yield database",
 "BU-01": "Sample receipt, incoming inspection and board mounting",
 "BU-02": "Power-on, power sequencing and basic health check",
 "BU-03": "Reset, clocking and PLL lock validation",
 "BU-04": "Boot, firmware load and functional smoke test",
 "BU-05": "Interface bring-up — PCIe/CXL link training, HBM training, die-to-die",
 "BU-06": "Memory subsystem and bandwidth validation",
 "BU-07": "Shmoo across voltage, frequency and temperature",
 "BU-08": "Performance validation against the architecture model",
 "BU-09": "Silicon debug of anomalies and failure analysis requests",
 "BU-10": "Errata capture, workaround definition and documentation",
 "BU-11": "Respin versus metal-fix decision analysis — ECO scope, cost, schedule",
 "BU-12": "Customer sample readiness and release package",
 "MP-01": "Qualification plan definition against JEDEC / AEC standards",
 "MP-02": "Reliability stress — HTOL, HTS, temperature cycle, uHAST, THB",
 "MP-03": "ESD (HBM, CDM) and latch-up qualification",
 "MP-04": "Package qualification — MSL, drop, bend, board-level reliability",
 "MP-05": "Yield learning, failure pareto and defect analysis",
 "MP-06": "Production test program release and guard-band validation",
 "MP-07": "Test time reduction and multi-site conversion",
 "MP-08": "Process corner and split-lot validation",
 "MP-09": "Production readiness review and change control (PCN) setup",
 "MP-10": "Capacity, supply chain and ramp commitment — wafer starts, substrate, HBM",
 "MP-11": "Compliance and certification — PCIe/CXL compliance, RoHS/REACH, safety",
 "MP-12": "Documentation release — datasheet, user guide, errata, application notes"
};

/** Deliverable titles by reference, for the 'what it delivers' section. */
export const detailDeliverables: Record<string, string> = {
 "DEF-D1": "Product requirements document (PRD)",
 "DEF-D2": "Target specification — PPA and KPI table",
 "DEF-D3": "Product cost and margin model",
 "DEF-D4": "Feasibility report",
 "DEF-D5": "Program charter, schedule, and resource plan",
 "DEF-D6": "Kickoff Go / No-Go decision record",
 "ARCH-D1": "Architecture specification",
 "ARCH-D2": "Performance model and workload analysis report",
 "ARCH-D3": "Block partitioning and PPA budget table",
 "ARCH-D4": "Interface and protocol definition document",
 "ARCH-D5": "Power / clock / reset architecture and UPF intent",
 "ARCH-D6": "Chip-level block diagram with pin and bump budget",
 "ARCH-D7": "Architecture Freeze review package",
 "TECH-D1": "Technology selection report and decision record",
 "TECH-D2": "Process option / flavor sheet agreed with foundry",
 "TECH-D3": "Wafer, mask and NRE cost sheet",
 "TECH-D4": "Executed foundry design agreement (DA) and NDA",
 "TECH-D5": "Capacity and tapeout slot commitment",
 "TECH-D6": "Node risk assessment — maturity, defect density, yield learning curve",
 "PDK-D1": "PDK readiness dashboard — version, release date, open gap list",
 "PDK-D2": "Qualified library list with .lib / LEF / GDS views",
 "PDK-D3": "Memory PPA gap analysis and custom-instance decision record",
 "PDK-D4": "EDA tool and version matrix (qualified and frozen)",
 "PDK-D5": "Internal reference flow and methodology guide",
 "PDK-D6": "Signoff corner definition agreed with foundry",
 "PDK-D7": "Compute and license capacity plan",
 "PDK-D8": "Golden environment release notes",
 "IPR-D1": "IP bill of materials with make / buy / reuse decision per block",
 "IPR-D2": "Vendor evaluation matrix and selection record",
 "IPR-D3": "IP readiness report — silicon-proven status and maturity level per IP",
 "IPR-D4": "IP deliverable acceptance checklist",
 "IPR-D5": "Executed licences and POs with committed delivery dates",
 "IPR-D6": "IP delivery schedule folded into the program plan",
 "IPR-D7": "IP risk register and contingency plan",
 "AMS-D1": "AMS IP specifications and design review packages",
 "AMS-D2": "Characterization reports across PVT and Monte Carlo",
 "AMS-D3": "Custom SRAM instance specification with Vmin and sigma-yield report",
 "AMS-D4": "Custom memory views characterized to compiler equivalence",
 "AMS-D5": "Hard macro GDS with abstract views (LEF, .lib, CDL, UPF, wreal/Verilog model)",
 "AMS-D6": "Per-macro DRC / LVS clean signoff, pushed rules approved by foundry",
 "AMS-D7": "Reliability report — EM/IR, ESD, latch-up, aging",
 "AMS-D8": "Integration guide with known limitations and errata",
 "TC-D1": "Test chip specification and risk coverage matrix",
 "TC-D2": "Test chip GDS and shuttle submission record",
 "TC-D3": "Test chip silicon and characterization report",
 "TC-D4": "Silicon-to-model correlation report",
 "TC-D5": "Design guidance and margin decisions for the production chip",
 "RTL-D1": "Block and top-level RTL release, tagged",
 "RTL-D2": "Register map / RDL and generated headers",
 "RTL-D3": "Integration testbench and build system",
 "RTL-D4": "Lint / CDC / RDC clean reports with waiver list",
 "RTL-D5": "UPF power intent file",
 "RTL-D6": "IP integration report and version manifest",
 "RTL-D7": "RTL Freeze package",
 "DV-D1": "Verification plan (vPlan) and coverage model",
 "DV-D2": "UVM testbenches and integrated VIP",
 "DV-D3": "Regression and coverage dashboards",
 "DV-D4": "Formal proof reports with assumption list",
 "DV-D5": "Low-power verification report",
 "DV-D6": "Emulation platform and system test suite",
 "DV-D7": "Gate-level simulation report",
 "DV-D8": "DV closure signoff package",
 "DFT-D1": "DFT architecture specification and coverage plan",
 "DFT-D2": "MBIST / BISR insertion and test collateral",
 "DFT-D3": "JTAG / IJTAG description files (BSDL, ICL, PDL)",
 "DFT-D4": "ATPG pattern sets with coverage report",
 "DFT-D5": "DFT DRC clean report",
 "DFT-D6": "Pattern validation (GLS) report and ATE-ready pattern files",
 "DFT-D7": "DFT signoff entry for the tapeout checklist",
 "SYN-D1": "N0 flow-flush netlist for PD flow setup",
 "SYN-D2": "N1 and N2 netlist drops with QoR delta reports",
 "SYN-D3": "FFN — final full netlist, release-tagged",
 "SYN-D4": "Validated SDC constraint set per mode and corner",
 "SYN-D5": "Synthesis QoR report per drop against PPA targets",
 "SYN-D6": "Formal equivalence clean report per drop",
 "SYN-D7": "Power intent implementation report",
 "SYN-D8": "Physical design handoff package per drop",
 "PD-D1": "Flow setup release — MMMC environment, scripts and runtime baseline",
 "PD-D2": "Turn 1 and Turn 2 databases with QoR delta reports",
 "PD-D3": "Final-turn routed database on the FFN, per block and top",
 "PD-D4": "Floorplan and PDN specification",
 "PD-D5": "MCMM timing closure reports with violation burn-down across turns",
 "PD-D6": "Interim physical DRC / LVS clean",
 "PD-D7": "Bump map, RDL and package interface files",
 "PD-D8": "ECO log and change control record",
 "PD-D9": "Signoff-ready database handoff",
 "SO-D1": "STA signoff reports across all corners and modes, with waiver list",
 "SO-D2": "Clean DRC / LVS / antenna / density reports",
 "SO-D3": "EM/IR and SI/PI signoff reports",
 "SO-D4": "Reliability reports — ESD, latch-up, FIT",
 "SO-D5": "DFM and lithography hotspot report",
 "SO-D6": "Final formal equivalence report",
 "SO-D7": "Signoff summary and Design Freeze package",
 "TO-D1": "Released GDSII / OASIS database with checksum record",
 "TO-D2": "Tapeout checklist with signoff matrix",
 "TO-D3": "Open issue and risk acceptance record",
 "TO-D4": "Go / No-Go decision minutes",
 "TO-D5": "FEOL MTO release package and mask order confirmation",
 "TO-D6": "BEOL ECO log covering the fix window",
 "TO-D7": "BEOL MTO release package and mask order confirmation",
 "TO-D8": "Full mask set completion record",
 "FAB-D1": "FEOL and BEOL mask sets with qualification reports",
 "FAB-D2": "Processed engineering-lot wafers",
 "FAB-D3": "Inline, PCM and WAT data package",
 "FAB-D4": "Wafer acceptance disposition record",
 "FAB-D5": "Wafer-out forecast versus actual log",
 "FAB-D6": "First Silicon availability notice",
 "PKGD-D1": "Package architecture specification",
 "PKGD-D2": "Bump map and interposer / RDL database",
 "PKGD-D3": "Substrate design files (Gerber / ODB++) and stack-up",
 "PKGD-D4": "Package electrical design intent and model handoff to co-verification",
 "PKGD-D5": "Thermal and mechanical (warpage) simulation reports",
 "PKGD-D6": "Test vehicle requirement specification for PTV",
 "PKGD-D7": "Substrate and interposer PO with committed lead time",
 "PKGD-D8": "OSAT assembly process flow and agreement",
 "PKGD-D9": "Package Design Freeze package",
 "PTV-D1": "Test vehicle plan and risk coverage matrix",
 "PTV-D2": "MTV, TTV and daisy-chain vehicle designs",
 "PTV-D3": "Built vehicle lots with assembly travelers",
 "PTV-D4": "Warpage and co-planarity data across the reflow profile",
 "PTV-D5": "CPI stress assessment report — ULK, bump and BEOL integrity",
 "PTV-D6": "Thermal characterization report with model correlation (Rjc, TIM, hotspot map)",
 "PTV-D7": "Board-level reliability data on vehicles",
 "PTV-D8": "Frozen assembly process window definition",
 "PTV-D9": "Package validation complete record — gate for product wafer-out",
 "SIPI-D1": "Chip power model (CPM/CPS) release per domain and mode",
 "SIPI-D2": "Extracted package and board electrical models",
 "SIPI-D3": "PDN impedance and dynamic IR co-simulation report",
 "SIPI-D4": "Decap budget and placement specification across die, package and board",
 "SIPI-D5": "Channel compliance report per interface, with margins",
 "SIPI-D6": "Eye, jitter and BER budget closure record",
 "SIPI-D7": "Power-aware STA correlation report",
 "SIPI-D8": "Chip-package-system co-verification signoff — tapeout gate",
 "ASSY-D1": "Assembled units — bring-up, qualification and sample lots",
 "ASSY-D2": "Assembly travelers and process data",
 "ASSY-D3": "Assembly yield report and failure pareto",
 "ASSY-D4": "Package-level inspection and test data",
 "ASSY-D5": "Unit allocation record across bring-up, qual and customers",
 "EVB-D1": "Validation platform specification",
 "EVB-D2": "EVB schematics, BOM and layout database",
 "EVB-D3": "Fabricated and assembled boards, rev A/B with quantity plan",
 "EVB-D4": "Board bring-up report and known issues",
 "EVB-D5": "Debug and trace access documentation",
 "EVB-D6": "Lab setup and instrument reservation plan",
 "TEST-D1": "Test plan and test coverage matrix",
 "TEST-D2": "Qualified probe card and load board",
 "TEST-D3": "Wafer sort and final test programs, release-tagged",
 "TEST-D4": "Characterization test suite",
 "TEST-D5": "ATE-ready pattern set with debug log",
 "TEST-D6": "Test time and test cost model",
 "TEST-D7": "Test data infrastructure and yield database",
 "BU-D1": "Bring-up report with per-milestone health status",
 "BU-D2": "Characterization data set — V/F/T shmoo and power measurements",
 "BU-D3": "Interface compliance results with training margins",
 "BU-D4": "Errata list with workarounds",
 "BU-D5": "Failure analysis reports",
 "BU-D6": "Respin versus metal-fix decision record",
 "BU-D7": "Customer sample release package",
 "MP-D1": "Qualification plan and JEDEC-compliant qualification report",
 "MP-D2": "Reliability and package qualification data packages",
 "MP-D3": "Production test program release",
 "MP-D4": "Yield model versus cost target report",
 "MP-D5": "Production readiness review signoff",
 "MP-D6": "Ramp plan and supply commitment",
 "MP-D7": "Compliance certificates",
 "MP-D8": "Datasheet and product documentation set",
 "MP-D9": "Mass Production release record"
};

/** The terms a write-up may offer to explain. */
export const activityGlossary: Record<string, GlossaryTerm> = {
 ".lib": {
  "full": "Liberty timing library",
  "group": "tool",
  "note": "Timing, power and noise characterization of a cell across corners. Missing corners silently limit signoff."
 },
 "AEC": {
  "full": "Automotive Electronics Council",
  "group": "qual",
  "note": "The body defining automotive-grade qualification, stricter than commercial JEDEC."
 },
 "AI": {
  "full": "Artificial Intelligence",
  "group": "tool",
  "note": "The product's application domain in this template — a training and inference accelerator."
 },
 "AMS": {
  "full": "Analog / Mixed-Signal",
  "group": "ip",
  "note": "Circuitry that is not purely digital. Characterized by simulation rather than by static timing, and on a different schedule from the digital flow."
 },
 "AOCV": {
  "full": "Advanced On-Chip Variation",
  "group": "design",
  "note": "Depth- and distance-dependent OCV derating — less pessimistic than a flat margin."
 },
 "ASP": {
  "full": "Average Selling Price",
  "group": "program",
  "note": "What the part is expected to sell for. With yield and cost it decides whether the program has a margin."
 },
 "ATE": {
  "full": "Automatic Test Equipment",
  "group": "test",
  "note": "The production tester. Its capability, pin count and cost per hour shape the whole test strategy."
 },
 "ATPG": {
  "full": "Automatic Test Pattern Generation",
  "group": "verif",
  "note": "Computing the input patterns that expose manufacturing defects, and the coverage they reach."
 },
 "BEOL": {
  "full": "Back End Of Line",
  "group": "process",
  "note": "The metal interconnect layers built above the transistors. Taped out about a month after FEOL to buy design-fix time."
 },
 "BER": {
  "full": "Bit Error Rate",
  "group": "iface",
  "note": "How often a link corrupts a bit. The headline quality number for a high-speed interface."
 },
 "BERT": {
  "full": "Bit Error Rate Tester",
  "group": "pkg",
  "note": "Instrument that drives a high-speed link and counts errors — how link margin is actually measured."
 },
 "BIRA": {
  "full": "Built-In Redundancy Analysis",
  "group": "verif",
  "note": "On-die logic that works out which spare rows or columns would repair a failing memory."
 },
 "BISR": {
  "full": "Built-In Self-Repair",
  "group": "verif",
  "note": "Applying that repair automatically. Turns memory defects from scrap into yield."
 },
 "BIST": {
  "full": "Built-In Self-Test",
  "group": "verif",
  "note": "On-die logic that tests a block without external equipment."
 },
 "BOM": {
  "full": "Bill of Materials",
  "group": "program",
  "note": "The itemized list of what goes into the product. An IP BOM lists every IP block the die needs and where it comes from."
 },
 "BSDL": {
  "full": "Boundary Scan Description Language",
  "group": "verif",
  "note": "The machine-readable description of a part's boundary-scan behavior, delivered to board makers."
 },
 "BSP": {
  "full": "Board Support Package",
  "group": "program",
  "note": "The minimum software that lets a host boot and talk to the board. Its boundary with the firmware team has to be agreed, not assumed."
 },
 "CAD": {
  "full": "Computer-Aided Design (methodology team)",
  "group": "tool",
  "note": "The group that owns tool flows, scripts and infrastructure rather than the design itself."
 },
 "CDC": {
  "full": "Clock Domain Crossing",
  "group": "design",
  "note": "A signal passing between unrelated clocks. Unsynchronized crossings fail intermittently and are invisible to simulation."
 },
 "CDL": {
  "full": "Circuit Description Language",
  "group": "tool",
  "note": "The transistor-level netlist used as the reference for LVS."
 },
 "CDM": {
  "full": "Charged Device Model",
  "group": "qual",
  "note": "The ESD model where the package itself is charged and discharges through a pin. Scales with package size, so it usually binds on a large 2.5D part."
 },
 "CI": {
  "full": "Continuous Integration",
  "group": "program",
  "note": "Automated build-and-test on every change. In hardware it usually means nightly regressions rather than per-commit."
 },
 "CMP": {
  "full": "Chemical Mechanical Planarization",
  "group": "process",
  "note": "The polishing step that keeps each layer flat. Drives metal-density fill rules in layout."
 },
 "CPI": {
  "full": "Chip-Package Interaction",
  "group": "process",
  "note": "Mechanical stress where die and package meet, driven by their different thermal expansion. The main reliability risk in 2.5D construction."
 },
 "CPM": {
  "full": "Chip Power Model",
  "group": "design",
  "note": "A compact model of the die's current demand, handed to package and board teams so they can size the PDN."
 },
 "CPS": {
  "full": "Chip Power/Signal model",
  "group": "design",
  "note": "CPM extended with signal behavior, for combined power and signal co-analysis."
 },
 "CSAM": {
  "full": "C-mode Scanning Acoustic Microscopy",
  "group": "pkg",
  "note": "Ultrasonic imaging that finds voids and delamination inside a sealed package without destroying it."
 },
 "CTS": {
  "full": "Clock Tree Synthesis",
  "group": "design",
  "note": "Building the buffer network that delivers the clock. Sets skew, and consumes a large share of dynamic power."
 },
 "CXL": {
  "full": "Compute Express Link",
  "group": "iface",
  "note": "A coherent protocol layered on the PCIe physical layer, used for memory and accelerator attachment."
 },
 "CoWoS": {
  "full": "Chip-on-Wafer-on-Substrate",
  "group": "process",
  "note": "A 2.5D packaging technology: die placed on a silicon interposer, which sits on the substrate. The construction assumed here."
 },
 "D2D": {
  "full": "Die-to-Die",
  "group": "iface",
  "note": "The link between two dies inside one package."
 },
 "DFM": {
  "full": "Design For Manufacturability",
  "group": "design",
  "note": "Changes that improve yield without changing function — via doubling, spacing, fill."
 },
 "DFT": {
  "full": "Design For Test",
  "group": "verif",
  "note": "Structure added to the design purely so it can be tested and debugged — scan, BIST, compression, trace."
 },
 "DK": {
  "full": "Design Kit",
  "group": "process",
  "note": "Used interchangeably with PDK; sometimes the assembly or package equivalent supplied by the OSAT."
 },
 "DOE": {
  "full": "Design Of Experiments",
  "group": "program",
  "note": "A structured set of experimental splits chosen so each variable's effect can be separated. How process windows get characterized."
 },
 "DPPM": {
  "full": "Defective Parts Per Million",
  "group": "test",
  "note": "The escape rate the test flow is designed to achieve. Coverage without a DPPM target is an engineering preference, not a commitment."
 },
 "DRC": {
  "full": "Design Rule Check",
  "group": "design",
  "note": "Verifying that layout geometry obeys the foundry rules. A tapeout gate."
 },
 "DRM": {
  "full": "Design Rule Manual",
  "group": "process",
  "note": "The foundry document defining what geometry is legal. Its version has to match the DRC deck actually being run."
 },
 "DTCO": {
  "full": "Design-Technology Co-Optimization",
  "group": "process",
  "note": "Tuning design style and process options together rather than treating the process as fixed. Where standard-cell track height gets decided."
 },
 "DUT": {
  "full": "Device Under Test",
  "group": "verif",
  "note": "Whatever is currently being tested — a block in simulation or a packaged part on a tester."
 },
 "DV": {
  "full": "Design Verification",
  "group": "verif",
  "note": "Proving the RTL does what the specification says, before any silicon exists."
 },
 "DVFS": {
  "full": "Dynamic Voltage and Frequency Scaling",
  "group": "design",
  "note": "Changing supply and clock at runtime to trade power against performance."
 },
 "ECC": {
  "full": "Error Correcting Code",
  "group": "iface",
  "note": "Redundancy that detects and repairs memory errors. Untested correction logic is indistinguishable from working correction logic."
 },
 "ECO": {
  "full": "Engineering Change Order",
  "group": "design",
  "note": "A late, targeted change to a design that is otherwise frozen. A metal-only ECO touches routing layers alone."
 },
 "EDA": {
  "full": "Electronic Design Automation",
  "group": "tool",
  "note": "The design-tool industry and its licences — a real capacity constraint during peak implementation."
 },
 "EM": {
  "full": "Electromigration",
  "group": "design",
  "note": "Metal atoms drifting under sustained current, eventually opening a wire. Bounds how much current a given wire width may carry."
 },
 "EM/IR": {
  "full": "Electromigration and IR drop",
  "group": "pkg",
  "note": "The two current-related checks on the on-die power grid, usually run as one analysis."
 },
 "EMC": {
  "full": "Electromagnetic Compatibility",
  "group": "qual",
  "note": "Regulatory limits on emitted and tolerated interference. A market-access gate."
 },
 "ESD": {
  "full": "Electrostatic Discharge",
  "group": "qual",
  "note": "A static discharge event the part must survive. Classified by model."
 },
 "EUV": {
  "full": "Extreme Ultraviolet lithography",
  "group": "process",
  "note": "The lithography used at advanced nodes. Its layer count drives mask cost and cycle time."
 },
 "EVB": {
  "full": "Evaluation Board",
  "group": "pkg",
  "note": "The lab platform built to bring up and characterize the silicon. Its capability bounds what can be measured."
 },
 "FA": {
  "full": "Failure Analysis",
  "group": "qual",
  "note": "Physically finding out why a part failed. Usually destroys the unit, which matters when there are only a handful."
 },
 "FEOL": {
  "full": "Front End Of Line",
  "group": "process",
  "note": "The transistor-forming steps of wafer fabrication. Taped out first in a split MTO, because it has the longest cycle time."
 },
 "FFN": {
  "full": "Final Full Netlist",
  "group": "design",
  "note": "The netlist released for the last physical-design turn — RTL frozen, ECOs closed, no functional change beyond it."
 },
 "FIT": {
  "full": "Failures In Time",
  "group": "qual",
  "note": "Failures per billion device-hours. The unit reliability commitments are written in."
 },
 "FP8": {
  "full": "8-bit floating point",
  "group": "test",
  "note": "A low-precision format used for training and inference."
 },
 "FPGA": {
  "full": "Field-Programmable Gate Array",
  "group": "verif",
  "note": "Reconfigurable hardware used to prototype the design far faster than simulation."
 },
 "FTE": {
  "full": "Full-Time Equivalent",
  "group": "program",
  "note": "One person working full time. Derived here as M/M ÷ TAT in months — the team size implied while the activity runs."
 },
 "Fmax": {
  "full": "Maximum operating frequency",
  "group": "test",
  "note": "The highest clock a part sustains at a given voltage and temperature."
 },
 "GB/s": {
  "full": "Gigabytes per second",
  "group": "iface",
  "note": "Bandwidth unit used for memory and interface targets."
 },
 "GDS": {
  "full": "Graphic Data System (GDSII)",
  "group": "tool",
  "note": "The layout database format handed to mask making. OASIS is its modern, smaller replacement."
 },
 "GDSII": {
  "full": "Graphic Data System II",
  "group": "tool",
  "note": "The full name of the GDS layout format handed to mask making."
 },
 "GLS": {
  "full": "Gate-Level Simulation",
  "group": "design",
  "note": "Simulating the actual netlist with real delays. Slow, but catches what RTL simulation and STA both miss."
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
 "HBM3": {
  "full": "High Bandwidth Memory generation 3",
  "group": "iface",
  "note": "The HBM generation assumed in this template; 3E is its extended-speed revision."
 },
 "HBM3E": {
  "full": "High Bandwidth Memory 3 Extended",
  "group": "iface",
  "note": "The extended-speed revision of HBM3."
 },
 "HD": {
  "full": "High Density",
  "group": "process",
  "note": "A standard-cell flavor optimized for area rather than speed; HPC is its high-performance counterpart. Process option menus offer both."
 },
 "HPC": {
  "full": "High Performance Computing",
  "group": "tool",
  "note": "The other workload family such parts serve, with different bandwidth and precision needs."
 },
 "HTOL": {
  "full": "High Temperature Operating Life",
  "group": "qual",
  "note": "A thousand hours of powered operation at elevated temperature. The core reliability stress, and the longest fixed item before mass production."
 },
 "HTS": {
  "full": "High Temperature Storage",
  "group": "qual",
  "note": "Unpowered bake, which exercises diffusion and interface degradation."
 },
 "HV": {
  "full": "High Voltage",
  "group": "ip",
  "note": "Devices rated above the core supply — used in IO and power management."
 },
 "ICL": {
  "full": "Instrument Connectivity Language",
  "group": "verif",
  "note": "Describes how on-die instruments are wired to the IJTAG network."
 },
 "ID": {
  "full": "Identifier",
  "group": "tool",
  "note": "The stable reference used to trace a requirement, activity or deliverable through the program."
 },
 "IJTAG": {
  "full": "Internal JTAG (IEEE 1687)",
  "group": "verif",
  "note": "A standard for reaching instruments inside the chip through the JTAG port."
 },
 "INT8": {
  "full": "8-bit integer",
  "group": "test",
  "note": "A low-precision numeric format used for inference. Throughput is quoted per format."
 },
 "IO": {
  "full": "Input / Output",
  "group": "design",
  "note": "The circuitry and pads connecting the die to the outside world."
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
 "IR": {
  "full": "IR drop",
  "group": "design",
  "note": "Supply voltage lost across the resistance of the power grid (I × R). Too much and the logic misses timing that STA said was fine."
 },
 "JEDEC": {
  "full": "Joint Electron Device Engineering Council",
  "group": "qual",
  "note": "The body whose standards define memory interfaces and reliability qualification methods."
 },
 "JTAG": {
  "full": "Joint Test Action Group (IEEE 1149.1)",
  "group": "verif",
  "note": "The standard serial access port used for boundary scan, debug and configuration."
 },
 "KGD": {
  "full": "Known Good Die",
  "group": "process",
  "note": "A die screened at wafer sort as worth packaging. On a 2.5D part an escaped bad die costs an entire assembled module."
 },
 "KPI": {
  "full": "Key Performance Indicator",
  "group": "program",
  "note": "A measurable target derived from a requirement. A requirement without a KPI cannot be tested at the end."
 },
 "LDO": {
  "full": "Low-Dropout regulator",
  "group": "ip",
  "note": "An on-die linear regulator giving a quiet local supply to sensitive analog blocks."
 },
 "LEC": {
  "full": "Logical Equivalence Checking",
  "group": "design",
  "note": "Proving two netlists implement the same function — used after every synthesis or ECO step."
 },
 "LEF": {
  "full": "Library Exchange Format",
  "group": "tool",
  "note": "The abstract physical view of a cell or macro — outline, pins, blockages — used for placement and routing."
 },
 "LLM": {
  "full": "Large Language Model",
  "group": "tool",
  "note": "The workload class driving the memory bandwidth and capacity targets assumed here."
 },
 "LVS": {
  "full": "Layout Versus Schematic",
  "group": "design",
  "note": "Verifying that the layout implements the intended netlist. The other tapeout gate."
 },
 "M/M": {
  "full": "Man-Month",
  "group": "program",
  "note": "One person working for one month. The unit of effort in this template; summing it across a stage gives the headcount the stage consumes."
 },
 "MBIST": {
  "full": "Memory Built-In Self-Test",
  "group": "verif",
  "note": "BIST for embedded memories — the only practical way to test thousands of SRAM instances."
 },
 "MCMM": {
  "full": "Multi-Corner Multi-Mode",
  "group": "design",
  "note": "The same thing as MMMC; vendors differ on word order."
 },
 "MDP": {
  "full": "Mask Data Preparation",
  "group": "process",
  "note": "Turning the design database into mask-writer input — fracturing, OPC, job deck. Weeks of work between tapeout and first wafer."
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
 "MMMC": {
  "full": "Multi-Mode Multi-Corner",
  "group": "design",
  "note": "Analyzing every operating mode against every process/voltage/temperature corner at once. The standard implementation setup."
 },
 "MPW": {
  "full": "Multi-Project Wafer",
  "group": "process",
  "note": "A shared mask set carrying several designs. The cheap way to get a test chip fabricated."
 },
 "MSL": {
  "full": "Moisture Sensitivity Level",
  "group": "qual",
  "note": "How long a package may sit in ambient air before it must be baked prior to soldering. A poor level forces handling procedures on every customer line."
 },
 "MTO": {
  "full": "Mask Tape-Out",
  "group": "process",
  "note": "The release of the design database to mask making. The irreversible commitment — masks cost millions and take weeks."
 },
 "MTV": {
  "full": "Mechanical Test Vehicle",
  "group": "process",
  "note": "A test vehicle for warpage, stress and assembly mechanics rather than electrical behavior."
 },
 "N0/N1/N2": {
  "full": "Netlist drop 0 / 1 / 2",
  "group": "design",
  "note": "The successive netlist releases from synthesis to physical design. N0 is flow-flush — structurally representative but functionally incomplete — and each drop raises quality."
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
 "NoC": {
  "full": "Network on Chip",
  "group": "ip",
  "note": "The on-die interconnect fabric carrying traffic between blocks."
 },
 "OASIS": {
  "full": "Open Artwork System Interchange Standard",
  "group": "tool",
  "note": "A compact layout format used instead of GDSII for large databases."
 },
 "OCC": {
  "full": "On-Chip Clock Controller",
  "group": "verif",
  "note": "Generates the fast clock pulses needed for at-speed scan testing."
 },
 "OCV": {
  "full": "On-Chip Variation",
  "group": "design",
  "note": "Allowance for variation between devices on the same die. AOCV and POCV are its advanced and parametric refinements."
 },
 "ODB": {
  "full": "ODB++ board database",
  "group": "tool",
  "note": "A PCB manufacturing data format."
 },
 "OPC": {
  "full": "Optical Proximity Correction",
  "group": "process",
  "note": "Pre-distorting mask shapes so the printed result matches intent. Part of mask data prep, after tapeout."
 },
 "OSAT": {
  "full": "Outsourced Semiconductor Assembly and Test",
  "group": "process",
  "note": "The subcontractor that packages and tests the die. Owns the assembly process knowledge the program depends on."
 },
 "OTP": {
  "full": "One-Time Programmable memory",
  "group": "ip",
  "note": "Fuse-based memory written once after manufacture — used for trim values, keys and repair settings."
 },
 "PCB": {
  "full": "Printed Circuit Board",
  "group": "pkg",
  "note": "The board the packaged part is mounted on."
 },
 "PCIe": {
  "full": "Peripheral Component Interconnect Express",
  "group": "iface",
  "note": "The host interface standard. Compliance is obtained at scheduled plugfests, not on demand."
 },
 "PCM": {
  "full": "Process Control Monitor",
  "group": "process",
  "note": "The test structures WAT measures. Their readings are the earliest signal that a lot drifted."
 },
 "PCN": {
  "full": "Product Change Notification",
  "group": "program",
  "note": "The formal notice to customers that something about a shipping product has changed. Once in production, changes go through it."
 },
 "PDK": {
  "full": "Process Design Kit",
  "group": "process",
  "note": "The foundry's package of models, rules and libraries that makes a process usable. Its version and maturity gate everything downstream."
 },
 "PDL": {
  "full": "Procedural Description Language",
  "group": "verif",
  "note": "Describes how to operate those instruments, alongside ICL."
 },
 "PDN": {
  "full": "Power Delivery Network",
  "group": "design",
  "note": "Everything carrying current from the regulator to the transistors — board, package and on-die grid together."
 },
 "PHY": {
  "full": "Physical layer",
  "group": "ip",
  "note": "The analog and mixed-signal circuitry that drives an interface's wires — as opposed to the digital controller above it."
 },
 "PI": {
  "full": "Power Integrity",
  "group": "pkg",
  "note": "Whether the supply stays inside its window under real switching current."
 },
 "PLL": {
  "full": "Phase-Locked Loop",
  "group": "ip",
  "note": "The circuit that multiplies a reference clock up to the operating frequency. Its lock range bounds the shmoo."
 },
 "PO": {
  "full": "Purchase Order",
  "group": "program",
  "note": "The binding commitment to buy. Long-lead items (masks, substrates, HBM) need one far earlier than intuition suggests."
 },
 "POCV": {
  "full": "Parametric On-Chip Variation",
  "group": "design",
  "note": "Statistical OCV using per-cell sigma rather than a derate table."
 },
 "PPA": {
  "full": "Power, Performance, Area",
  "group": "program",
  "note": "The three quantities every chip design trades against each other. A \"PPA target\" is the contract the architecture must meet."
 },
 "PPM": {
  "full": "Parts Per Million",
  "group": "test",
  "note": "Rate unit; DPPM is its defective-parts form."
 },
 "PRD": {
  "full": "Product Requirements Document",
  "group": "program",
  "note": "The baselined statement of what the product must do. Everything downstream is an answer to it."
 },
 "PSRR": {
  "full": "Power Supply Rejection Ratio",
  "group": "iface",
  "note": "How well an analog block ignores noise on its supply. Sets how much PDN noise a PHY tolerates."
 },
 "PTV": {
  "full": "Package Test Vehicle",
  "group": "pkg",
  "note": "The vehicle program that de-risks assembly and package construction before product silicon commits."
 },
 "PVT": {
  "full": "Process, Voltage, Temperature",
  "group": "design",
  "note": "The three axes of operating variation a design must survive. \"Corners\" are their extremes."
 },
 "QRC": {
  "full": "Parasitic extraction (Quantus RC)",
  "group": "tool",
  "note": "Extracting resistance and capacitance from layout so timing reflects real wires."
 },
 "QoR": {
  "full": "Quality of Results",
  "group": "design",
  "note": "The bundle of timing, area, power and congestion numbers a tool run produces. What \"the netlist got better\" actually means."
 },
 "RDC": {
  "full": "Reset Domain Crossing",
  "group": "design",
  "note": "The same hazard for signals passing between independently reset regions."
 },
 "RDL": {
  "full": "Redistribution Layer",
  "group": "process",
  "note": "Fine wiring on the die or interposer surface that moves connections to where the bumps are."
 },
 "REACH": {
  "full": "Registration, Evaluation, Authorization and Restriction of Chemicals",
  "group": "qual",
  "note": "The broader EU chemicals regulation, with the same supplier-declaration burden."
 },
 "RF": {
  "full": "Radio Frequency",
  "group": "ip",
  "note": "High-frequency analog circuitry."
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
 "RLC": {
  "full": "Resistance, Inductance, Capacitance",
  "group": "tool",
  "note": "The passive network form used for package and board models."
 },
 "ROM": {
  "full": "Read-Only Memory",
  "group": "ip",
  "note": "Fixed on-die memory, typically holding boot code."
 },
 "RTD": {
  "full": "Resistance Temperature Detector",
  "group": "pkg",
  "note": "A resistive on-die or in-package temperature sensor. Needs calibration before its reading is an absolute temperature rather than a relative one."
 },
 "RTL": {
  "full": "Register Transfer Level",
  "group": "design",
  "note": "The synthesisable hardware description — Verilog or SystemVerilog. \"RTL freeze\" means no further functional change."
 },
 "RX": {
  "full": "Receiver",
  "group": "iface",
  "note": "The receiving end of a serial link, including its equalization and clock recovery."
 },
 "Rja": {
  "full": "Thermal resistance, junction to ambient",
  "group": "pkg",
  "note": "The same, measured to the surrounding air — so it includes the cooling solution."
 },
 "Rjc": {
  "full": "Thermal resistance, junction to case",
  "group": "pkg",
  "note": "How many degrees the die rises per watt, measured to the package case. The package's share of the thermal path."
 },
 "RoHS": {
  "full": "Restriction of Hazardous Substances",
  "group": "qual",
  "note": "EU restriction on certain materials. Needs a declaration from every component supplier."
 },
 "SDC": {
  "full": "Synopsys Design Constraints",
  "group": "design",
  "note": "The file describing clocks, exceptions and IO timing. Wrong constraints make timing closure meaningless in both directions."
 },
 "SDF": {
  "full": "Standard Delay Format",
  "group": "verif",
  "note": "Back-annotated delays from the physical design, used to make gate-level simulation realistic."
 },
 "SI": {
  "full": "Signal Integrity",
  "group": "pkg",
  "note": "Whether a high-speed signal still resembles itself at the far end — loss, reflection, crosstalk, jitter."
 },
 "SI/PI": {
  "full": "Signal and Power Integrity",
  "group": "pkg",
  "note": "The two treated together, because on a high-speed interface they interact."
 },
 "SIPI": {
  "full": "Signal Integrity / Power Integrity",
  "group": "pkg",
  "note": "The stage that owns electrical closure across die, package and board together."
 },
 "SRAM": {
  "full": "Static Random-Access Memory",
  "group": "ip",
  "note": "On-die memory. Usually generated by a compiler; when the compiler misses the PPA target, a custom instance has to be developed."
 },
 "SSN": {
  "full": "Simultaneous Switching Noise",
  "group": "design",
  "note": "Supply disturbance when many outputs switch together. Couples into interfaces as jitter."
 },
 "SSO": {
  "full": "Simultaneous Switching Output",
  "group": "design",
  "note": "Many outputs switching at once; the current step they draw is what produces SSN."
 },
 "STA": {
  "full": "Static Timing Analysis",
  "group": "design",
  "note": "Exhaustive timing checking without simulation. The basis of timing signoff."
 },
 "STDF": {
  "full": "Standard Test Data Format",
  "group": "test",
  "note": "The industry format for per-unit test results. The raw material of all yield analysis."
 },
 "STIL": {
  "full": "Standard Test Interface Language",
  "group": "verif",
  "note": "A vendor-neutral test pattern format. Translated to tester-native format before use."
 },
 "SW/FW": {
  "full": "Software / Firmware",
  "group": "program",
  "note": "Out of scope for this template, which covers design and silicon enablement only — but the handoff boundary still has to be agreed."
 },
 "SerDes": {
  "full": "Serialiser / Deserialiser",
  "group": "ip",
  "note": "The circuit that turns parallel data into a high-speed serial stream and back. The heart of every high-speed interface."
 },
 "Shmoo": {
  "full": "Shmoo plot",
  "group": "test",
  "note": "A pass/fail map across two swept variables, usually voltage against frequency. Shows where the part stops working, and so how much margin it has."
 },
 "TAP": {
  "full": "Test Access Port",
  "group": "verif",
  "note": "The JTAG interface pins and controller."
 },
 "TAT": {
  "full": "Turn-Around Time",
  "group": "program",
  "note": "Elapsed calendar time an activity occupies, in weeks. Not the same as effort — a 20-week activity may take one person or ten."
 },
 "THB": {
  "full": "Temperature Humidity Bias",
  "group": "qual",
  "note": "Powered stress in heat and humidity — finds corrosion and moisture-driven failure."
 },
 "TIM": {
  "full": "Thermal Interface Material",
  "group": "pkg",
  "note": "The compound between die and lid or heatsink. Its bond line thickness directly sets how much power the part can dissipate."
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
 "TSV": {
  "full": "Through-Silicon Via",
  "group": "process",
  "note": "A vertical connection through a die or interposer. What makes stacked and 2.5D construction possible."
 },
 "TTV": {
  "full": "Thermal Test Vehicle",
  "group": "process",
  "note": "A test vehicle carrying heaters and sensors, used to characterize the package thermal path before real silicon exists."
 },
 "TV": {
  "full": "Test Vehicle",
  "group": "process",
  "note": "A structure built purely to learn about a process, not to sell. Retires risk before the real product commits."
 },
 "TX": {
  "full": "Transmitter",
  "group": "iface",
  "note": "The driving end of a serial link."
 },
 "TX/RX": {
  "full": "Transmit / Receive",
  "group": "iface",
  "note": "The two directions of a serial link."
 },
 "UCIe": {
  "full": "Universal Chiplet Interconnect Express",
  "group": "iface",
  "note": "The standard die-to-die interface for chiplet construction."
 },
 "ULK": {
  "full": "Ultra Low-K dielectric",
  "group": "process",
  "note": "The fragile low-capacitance insulator in BEOL. Mechanically weak, which is why chip-package interaction stress matters."
 },
 "UPF": {
  "full": "Unified Power Format",
  "group": "design",
  "note": "The machine-readable description of power domains, isolation and retention. Carries power intent through the whole flow."
 },
 "UVM": {
  "full": "Universal Verification Methodology",
  "group": "verif",
  "note": "The standard SystemVerilog framework for building constrained-random testbenches."
 },
 "VCO": {
  "full": "Voltage-Controlled Oscillator",
  "group": "ip",
  "note": "The tunable oscillator inside a PLL."
 },
 "VDD": {
  "full": "Supply voltage",
  "group": "design",
  "note": "The positive rail powering a block. \"VDD collapse\" is a deliberate momentary droop used as an SRAM write assist."
 },
 "VIP": {
  "full": "Verification IP",
  "group": "verif",
  "note": "A bought testbench component that models a protocol — PCIe, CXL, HBM — so the design can be checked against it."
 },
 "VRM": {
  "full": "Voltage Regulator Module",
  "group": "pkg",
  "note": "The board-level regulator supplying the part. Its transient response has to follow the die's current steps."
 },
 "Vmin": {
  "full": "Minimum operating voltage",
  "group": "test",
  "note": "The lowest supply at which a part still works. Its distribution across units is a core characterization result."
 },
 "WAT": {
  "full": "Wafer Acceptance Test",
  "group": "process",
  "note": "Parametric measurement on scribe-line structures. Tells you whether the process was in spec independently of whether the chip works."
 },
 "WGL": {
  "full": "Waveform Generation Language",
  "group": "verif",
  "note": "An older pattern interchange format, still used by some testers."
 },
 "WIP": {
  "full": "Work In Progress",
  "group": "program",
  "note": "Material already started but not finished. In a fab it is weeks of committed capacity that cannot be redirected."
 },
 "uHAST": {
  "full": "unbiased Highly Accelerated Stress Test",
  "group": "qual",
  "note": "Pressurized heat and humidity without bias. Accelerates moisture ingress into the package."
 }
};

/**
 * The activities that have a write-up, in template order — what the arrows walk
 * and what the engineering table decides to link on.
 */
export const writtenActivities: string[] = [
 "DEF-01",
 "DEF-02",
 "DEF-03",
 "DEF-04",
 "DEF-05",
 "DEF-06",
 "DEF-07",
 "DEF-08",
 "DEF-09",
 "ARCH-01",
 "ARCH-02",
 "ARCH-03",
 "ARCH-04",
 "ARCH-05",
 "ARCH-06",
 "ARCH-07",
 "ARCH-08",
 "ARCH-09",
 "ARCH-10",
 "TECH-01",
 "TECH-02",
 "TECH-03",
 "TECH-04",
 "TECH-05",
 "TECH-06",
 "TECH-07",
 "TECH-08",
 "TECH-09",
 "PDK-01",
 "PDK-02",
 "PDK-03",
 "PDK-04",
 "PDK-05",
 "PDK-06",
 "PDK-07",
 "PDK-08",
 "PDK-09",
 "PDK-10",
 "PDK-11",
 "PDK-12",
 "PDK-13",
 "IPR-01",
 "IPR-02",
 "IPR-03",
 "IPR-04",
 "IPR-05",
 "IPR-06",
 "IPR-07",
 "IPR-08",
 "IPR-09",
 "IPR-10",
 "AMS-01",
 "AMS-02",
 "AMS-03",
 "AMS-04",
 "AMS-05",
 "AMS-06",
 "AMS-07",
 "AMS-08",
 "AMS-09",
 "AMS-10",
 "AMS-11",
 "AMS-12",
 "AMS-13",
 "AMS-14",
 "AMS-15",
 "AMS-16",
 "TC-01",
 "TC-02",
 "TC-03",
 "TC-04",
 "TC-05",
 "TC-06",
 "TC-07",
 "TC-08",
 "RTL-01",
 "RTL-02",
 "RTL-03",
 "RTL-04",
 "RTL-05",
 "RTL-06",
 "RTL-07",
 "RTL-08",
 "RTL-09",
 "RTL-10",
 "DV-01",
 "DV-02",
 "DV-03",
 "DV-04",
 "DV-05",
 "DV-06",
 "DV-07",
 "DV-08",
 "DV-09",
 "DV-10",
 "DV-11",
 "DV-12",
 "DFT-01",
 "DFT-02",
 "DFT-03",
 "DFT-04",
 "DFT-05",
 "DFT-06",
 "DFT-07",
 "DFT-08",
 "DFT-09",
 "DFT-10",
 "DFT-11",
 "SYN-01",
 "SYN-02",
 "SYN-03",
 "SYN-04",
 "SYN-05",
 "SYN-06",
 "SYN-07",
 "SYN-08",
 "SYN-09",
 "SYN-10",
 "SYN-11",
 "SYN-12",
 "PD-01",
 "PD-02",
 "PD-03",
 "PD-04",
 "PD-05",
 "PD-06",
 "PD-07",
 "PD-08",
 "PD-09",
 "PD-10",
 "PD-11",
 "PD-12",
 "PD-13",
 "PD-14",
 "PD-15",
 "PD-16",
 "SO-01",
 "SO-02",
 "SO-03",
 "SO-04",
 "SO-05",
 "SO-06",
 "SO-07",
 "SO-08",
 "SO-09",
 "SO-10",
 "SO-11",
 "SO-12",
 "TO-01",
 "TO-02",
 "TO-03",
 "TO-04",
 "TO-05",
 "TO-06",
 "TO-07",
 "TO-08",
 "TO-09",
 "TO-10",
 "TO-11",
 "FAB-01",
 "FAB-02",
 "FAB-03",
 "FAB-04",
 "FAB-05",
 "FAB-06",
 "FAB-07",
 "FAB-08",
 "FAB-09",
 "FAB-10",
 "PKGD-01",
 "PKGD-02",
 "PKGD-03",
 "PKGD-04",
 "PKGD-05",
 "PKGD-06",
 "PKGD-07",
 "PKGD-08",
 "PKGD-09",
 "PKGD-10",
 "PKGD-11",
 "PTV-01",
 "PTV-02",
 "PTV-03",
 "PTV-04",
 "PTV-05",
 "PTV-06",
 "PTV-07",
 "PTV-08",
 "PTV-09",
 "PTV-10",
 "PTV-11",
 "PTV-12",
 "SIPI-01",
 "SIPI-02",
 "SIPI-03",
 "SIPI-04",
 "SIPI-05",
 "SIPI-06",
 "SIPI-07",
 "SIPI-08",
 "SIPI-09",
 "SIPI-10",
 "SIPI-11",
 "ASSY-01",
 "ASSY-02",
 "ASSY-03",
 "ASSY-04",
 "ASSY-05",
 "ASSY-06",
 "ASSY-07",
 "ASSY-08",
 "ASSY-09",
 "EVB-01",
 "EVB-02",
 "EVB-03",
 "EVB-04",
 "EVB-05",
 "EVB-06",
 "EVB-07",
 "EVB-08",
 "EVB-09",
 "EVB-10",
 "TEST-01",
 "TEST-02",
 "TEST-03",
 "TEST-04",
 "TEST-05",
 "TEST-06",
 "TEST-07",
 "TEST-08",
 "TEST-09",
 "TEST-10",
 "TEST-11",
 "BU-01",
 "BU-02",
 "BU-03",
 "BU-04",
 "BU-05",
 "BU-06",
 "BU-07",
 "BU-08",
 "BU-09",
 "BU-10",
 "BU-11",
 "BU-12",
 "MP-01",
 "MP-02",
 "MP-03",
 "MP-04",
 "MP-05",
 "MP-06",
 "MP-07",
 "MP-08",
 "MP-09",
 "MP-10",
 "MP-11",
 "MP-12"
];

const WRITTEN = new Set(writtenActivities);

/** Whether an activity opens a page. */
export const hasActivityDetail = (id: string): boolean => WRITTEN.has(id);
