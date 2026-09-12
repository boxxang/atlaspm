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
 "DEF-02": "Competitive benchmarking and gap analysis",
 "DEF-03": "Workload Definition and KPI Targets",
 "DEF-04": "Memory and Interface Requirements",
 "DEF-05": "PPA target definition",
 "DEF-06": "Product Cost and Margin Model",
 "DEF-07": "Technology Node Feasibility Assessment",
 "DEF-08": "Program Planning and Resourcing",
 "DEF-09": "Business Case and Funding Approval",
 "ARCH-01": "System-level performance modeling and workload simulation",
 "ARCH-02": "System Architecture Partitioning",
 "ARCH-03": "Interface and protocol selection",
 "ARCH-04": "Dataflow and Memory Hierarchy Definition",
 "ARCH-05": "Security and Safety Architecture",
 "ARCH-06": "Power, Clock, and DVFS Architecture",
 "ARCH-07": "Architecture Specification and Freeze",
 "ARCH-08": "Chip-Level Floorplan and Bump Planning",
 "ARCH-09": "Block-Level PPA Budget Allocation",
 "ARCH-10": "Block Microarchitecture Definition",
 "TECH-01": "Foundry and Process Node Selection",
 "TECH-02": "Foundry Roadmap and Production Readiness Alignment",
 "TECH-03": "Foundry Commercial and Legal Alignment",
 "TECH-04": "Process PPA Benchmarking and DTCO Assessment",
 "TECH-05": "Process Option and Flavor Selection",
 "TECH-06": "Wafer, Mask, and NRE Cost Assessment",
 "TECH-07": "Fab Capacity and Tapeout Slot Planning",
 "TECH-08": "Second-Source and Node Migration Assessment",
 "TECH-09": "OSAT and Backend Supply Chain Alignment",
 "PDK-01": "PDK Version Readiness and Change Management",
 "PDK-02": "Design Rule Review and Disposition",
 "PDK-03": "Standard Cell Library Selection and Qualification",
 "PDK-04": "Signoff Deck and QRC Version Control",
 "PDK-05": "Memory Compiler Evaluation and Instance Planning",
 "PDK-06": "I/O, ESD, and Latch-Up Library Qualification",
 "PDK-07": "EDA Tool Qualification",
 "PDK-08": "Reference Flow Bring-Up and Methodology Development",
 "PDK-09": "Memory Compiler PPA Characterization",
 "PDK-10": "Compute, License, and Storage Capacity Planning",
 "PDK-11": "Custom Memory Decision and Planning",
 "PDK-12": "Signoff Corner and Derate Definition",
 "PDK-13": "Golden Design Environment Release and Regression",
 "IPR-01": "IP Requirement Definition",
 "IPR-02": "Internal IP Reuse Assessment",
 "IPR-03": "IP Make / Buy / Reuse Decision",
 "IPR-04": "IP Vendor Evaluation and Selection",
 "IPR-05": "IP Silicon-Proven and Node Readiness Assessment",
 "IPR-06": "IP Licensing and Procurement",
 "IPR-07": "IP Deliverable and Integration Readiness Review",
 "IPR-08": "IP Porting and Hardening Planning",
 "IPR-09": "IP Delivery and Integration Schedule Alignment",
 "IPR-10": "IP Maturity Risk and Contingency Planning",
 "AMS-01": "AMS IP Specification and Budget Definition",
 "AMS-02": "Custom SRAM Architecture",
 "AMS-03": "PLL and Clock Generator Design",
 "AMS-04": "SerDes and PHY Design / Hardening",
 "AMS-05": "AMS Schematic Design and Pre-Layout Verification",
 "AMS-06": "Analog Power Management Design",
 "AMS-07": "SRAM Read / Write Assist Design",
 "AMS-08": "Memory Redundancy and Repair Integration",
 "AMS-09": "Custom SRAM Layout and Foundry Rule Closure",
 "AMS-10": "SRAM Statistical Margin and Yield Analysis",
 "AMS-11": "AMS Custom Layout and Physical Verification",
 "AMS-12": "Post-Layout Extracted Verification",
 "AMS-13": "AMS–Digital Integration and Co-Simulation",
 "AMS-14": "Custom Memory Characterization and View Generation",
 "AMS-15": "AMS Reliability Verification",
 "AMS-16": "Hard Macro Abstraction and View Generation",
 "TC-01": "Test Chip Objectives and Risk Coverage",
 "TC-02": "Test Chip Design and Integration",
 "TC-03": "MPW Shuttle Planning and Booking",
 "TC-04": "Test Chip Physical Implementation and Signoff",
 "TC-05": "MPW Tapeout and Fabrication",
 "TC-06": "Test Chip Board and Lab Preparation",
 "TC-07": "Silicon Characterization and Model Correlation",
 "TC-08": "Production Design Feedback and Margin Update",
 "RTL-01": "Block Microarchitecture Specification Completion",
 "RTL-02": "CI Build, Nightly Regression, and Release Management",
 "RTL-03": "Specification Change Control and ECO Board",
 "RTL-04": "Register Map / RDL Definition and Header Generation",
 "RTL-05": "Block-Level RTL Implementation",
 "RTL-06": "Clock, Reset, and Power Intent (UPF) Implementation",
 "RTL-07": "Third-Party and Internal IP Integration",
 "RTL-08": "Trial Synthesis and RTL PPA Feedback Loop",
 "RTL-09": "Lint, CDC, and RDC Closure",
 "RTL-10": "Chip-Level Integration and Top-Level Assembly",
 "DV-01": "Verification Plan and Coverage Model Definition",
 "DV-02": "UVM Environment and VIP Bring-Up",
 "DV-03": "Emulation and FPGA Prototype Bring-Up",
 "DV-04": "Bug Triage and Disposition Board",
 "DV-05": "Block-Level Constrained-Random and Directed Testing",
 "DV-06": "Formal Verification of Control, Connectivity, and Security Properties",
 "DV-07": "Coverage Closure and Regression Stability Management",
 "DV-08": "Chip-Level and System-Level Scenario Testing",
 "DV-09": "AMS / Mixed-Signal Co-Simulation",
 "DV-10": "Low-Power (UPF) Verification",
 "DV-11": "Performance and Bandwidth Validation Against the Architecture Model",
 "DV-12": "Functional and Timing-Annotated Gate-Level Simulation",
 "DFT-01": "DFT Architecture and Test Strategy Definition",
 "DFT-02": "Test Coverage and Test-Time Target Negotiation",
 "DFT-03": "TAP, Boundary Scan, and IJTAG Debug Access Architecture",
 "DFT-04": "Design-for-Debug and Trace Observability Architecture",
 "DFT-05": "MBIST / BIRA / BISR Architecture for Embedded Memories",
 "DFT-06": "On-Chip Clock Controller Design for At-Speed Test",
 "DFT-07": "eFuse, Chip ID, and Memory Repair Infrastructure",
 "DFT-08": "Scan Insertion and DFT DRC Closure",
 "DFT-09": "Scan Compression and Chain Routing Feasibility with Physical Design",
 "DFT-10": "ATPG Pattern Generation and Coverage Closure",
 "DFT-11": "Gate-Level Pattern Validation and ATE Format Conversion",
 "SYN-01": "SDC Constraint Development and Validation",
 "SYN-02": "Technology Mapping and Optimization",
 "SYN-03": "Per-Drop QoR Reporting Against PPA Budgets",
 "SYN-04": "Per-Drop Netlist Handoff and QoR Delta Review",
 "SYN-05": "N0 Flow-Flush Netlist Release",
 "SYN-06": "RTL-to-Netlist Formal Equivalence Checking per Drop",
 "SYN-07": "Physical-Aware Synthesis with Congestion Feedback",
 "SYN-08": "N1 Netlist Drop and QoR Baseline",
 "SYN-09": "Dynamic and Leakage Power Optimization",
 "SYN-10": "Low-Power Synthesis and UPF Consistency Checking",
 "SYN-11": "N2 Netlist Drop and Closure Risk Statement",
 "SYN-12": "FFN (Final Full Netlist) Release and Functional Freeze",
 "PD-01": "Flow Setup and MMMC Environment Build on N0",
 "PD-02": "Floorplan, Macro Placement, and Partition Definition",
 "PD-03": "Power Delivery Network Design and Early IR Analysis",
 "PD-04": "Bump and RDL Planning with Chip-Package Co-Design",
 "PD-05": "Turn 1 on the N1 Netlist and QoR Baseline",
 "PD-06": "Multi-Corner Multi-Mode Timing Closure",
 "PD-07": "Clock Tree Synthesis with Skew and Jitter Budgeting",
 "PD-08": "Detailed Routing and DRC Convergence",
 "PD-09": "Functional and Timing ECO Implementation",
 "PD-10": "Chip Power Model (CPM/CPS) Extraction and Handoff",
 "PD-11": "Turn 2 on the N2 Netlist and Closure Risk Quantification",
 "PD-12": "Hierarchical Block Closure and Top-Level Assembly",
 "PD-13": "Scan Chain Reordering and DFT-Aware Routing",
 "PD-14": "Signal and Power Integrity Iteration",
 "PD-15": "Final Turn on the FFN and Full Closure",
 "PD-16": "Chip Finishing and Post-Fill Verification",
 "SO-01": "Signoff Flow Dry Run on the Turn 2 Database",
 "SO-02": "Signoff Corner Correlation Against Foundry Decks",
 "SO-03": "Multi-Corner Multi-Mode Signoff STA and Closure",
 "SO-04": "Full-Chip DRC, LVS, Antenna, and Density Verification",
 "SO-05": "Static and Dynamic EM / IR-Drop Signoff",
 "SO-06": "ESD, Latch-Up, and Soft Error / FIT Verification",
 "SO-07": "DFM, Lithography Hotspot, and CMP Analysis",
 "SO-08": "Power and Signal Integrity Signoff",
 "SO-09": "Final Formal Equivalence and LVS Netlist Consistency",
 "SO-10": "Gate-Level Simulation with Final SDF",
 "SO-11": "Waiver Review Board and Foundry Waiver Alignment",
 "SO-12": "Chip-Package-System Co-Analysis Signoff Review",
 "TO-01": "Final GDSII / OASIS Assembly and Layer Map Verification",
 "TO-02": "Final Full-Chip Verification Re-Run on the Released Database",
 "TO-03": "Tapeout Checklist Completion and Owner Signoff",
 "TO-04": "Open-Issue Risk Assessment and Waiver Acceptance",
 "TO-05": "Go / No-Go Decision Meeting",
 "TO-06": "FEOL Layer Data Preparation and MTO Release",
 "TO-07": "BEOL Fix Window for Metal-Layer ECOs",
 "TO-08": "FEOL Mask Order Confirmation and Mask Shop Scheduling",
 "TO-09": "BEOL DRC, LVS, Antenna, and Density Re-Verification",
 "TO-10": "BEOL Layer Data Preparation and MTO Release",
 "TO-11": "BEOL Mask Order Confirmation and Full Mask Set Completion Tracking",
 "FAB-01": "FEOL Mask Set Fabrication, Inspection, and Qualification",
 "FAB-02": "Hot-Lot Management and WIP Tracking",
 "FAB-03": "BEOL Mask Set Fabrication, Inspection, and Qualification",
 "FAB-04": "Inline Metrology and Defect Inspection Monitoring",
 "FAB-05": "Wafer Start on FEOL Mask Availability",
 "FAB-06": "Front-End Wafer Processing",
 "FAB-07": "Back-End-of-Line Wafer Processing",
 "FAB-08": "E-Test / PCM Data Review",
 "FAB-09": "Wafer Acceptance Test and Lot Disposition",
 "FAB-10": "Wafer Shipment and Logistics to Sort and Assembly",
 "PKGD-01": "Package Architecture Selection",
 "PKGD-02": "Bump Map, Pitch, and Power-Ground Planning with Physical Design",
 "PKGD-03": "Test Vehicle Requirement Definition and Handoff to PTV",
 "PKGD-04": "Interposer / RDL Routing Design",
 "PKGD-05": "Substrate Stack-Up, Escape Routing, and Package DRC",
 "PKGD-06": "Thermal and Mechanical (Warpage) Simulation",
 "PKGD-07": "Substrate and Interposer Supplier Selection and Lead-Time Booking",
 "PKGD-08": "OSAT Selection and Assembly Process Definition",
 "PKGD-09": "Package Routing for Signal Integrity",
 "PKGD-10": "Package PDN and Decap Footprint Design",
 "PKGD-11": "Package Design Freeze, DRC, and Tooling Release",
 "PTV-01": "Test Vehicle Strategy and Risk Coverage Definition",
 "PTV-02": "Mechanical Test Vehicle (MTV) Design",
 "PTV-03": "Thermal Test Vehicle (TTV) Design",
 "PTV-04": "Daisy-Chain Electrical Vehicle Design",
 "PTV-05": "TV Die Fabrication and Interposer / Substrate Vehicle Build",
 "PTV-06": "OSAT Vehicle Assembly with Process Window DOE",
 "PTV-07": "Board-Level Reliability Testing on Vehicles",
 "PTV-08": "Chip-Package Interaction (CPI) Stress Evaluation",
 "PTV-09": "Warpage and Co-Planarity Measurement Across the Reflow Profile",
 "PTV-10": "Thermal Characterization and Model Correlation",
 "PTV-11": "Daisy-Chain Continuity Test and Assembly Yield Learning",
 "PTV-12": "Package Design Feedback and Assembly Process Window Freeze",
 "SIPI-01": "Chip Power Model (CPM/CPS) Extraction per Power Domain and Operating Mode",
 "SIPI-02": "Package and Board Electrical Model Extraction",
 "SIPI-03": "Die-Package-Board PDN Impedance Co-Simulation",
 "SIPI-04": "High-Speed Channel Simulation with Extracted Package Models",
 "SIPI-05": "Dynamic Voltage-Drop Analysis with Package Inductance",
 "SIPI-06": "Decap Budget and Placement Optimization Across Die, Package, and Board",
 "SIPI-07": "Simultaneous-Switching Noise (SSN / SSO) Analysis at the IO Ring",
 "SIPI-08": "Eye, Jitter, and BER Budget Closure per Interface",
 "SIPI-09": "Power-Aware STA Correlation with Back-Annotated Voltage Drop",
 "SIPI-10": "Electro-Thermal Co-Analysis with the Package Thermal Model",
 "SIPI-11": "Co-Verification Signoff Review and Criteria Disposition",
 "ASSY-01": "Production Package Substrate Build",
 "ASSY-02": "Production Silicon Interposer Fabrication",
 "ASSY-03": "Known-Good-Die Sort and Selection",
 "ASSY-04": "HBM Stack Procurement and Incoming Inspection",
 "ASSY-05": "Die Attach and Micro-Bump Thermo-Compression Bonding",
 "ASSY-06": "X-Ray, CSAM, and Warpage Inline Inspection",
 "ASSY-07": "Interposer-to-Substrate Attach, Underfill, and Molding",
 "ASSY-08": "Assembly Yield Analysis and Process Tuning",
 "ASSY-09": "Lid / TIM Attach and Ball Attach",
 "ASSY-10": "Unit Build and Allocation for Bring-Up, Qualification, and Samples",
 "ASSY-11": "Package-Level Open / Short and Continuity Test",
 "EVB-01": "Validation Platform Requirements and Topology Definition",
 "EVB-02": "EVB Schematic Design and BOM",
 "EVB-03": "Power Delivery, VRM, and Telemetry Design and Bring-Up",
 "EVB-04": "Debug and Trace Access Infrastructure",
 "EVB-05": "PCB Layout with High-Speed Channel SI/PI Simulation",
 "EVB-06": "Thermal Solution and Cooling for the Lab Platform",
 "EVB-07": "PCB Fabrication and Assembly",
 "EVB-08": "Lab Instrumentation Reservation and Test Rack Build",
 "EVB-09": "Minimum Host-Side Enablement for Power-On",
 "EVB-10": "Board Bring-Up with Socketed or Dummy Parts",
 "TEST-01": "Test Plan and Coverage Strategy Definition",
 "TEST-02": "ATE Platform Selection and Tester Time Booking",
 "TEST-03": "Test Time and Cost Optimization",
 "TEST-04": "Probe Card Design, Fabrication, and Qualification",
 "TEST-05": "Load Board / DUT Board Design, Fabrication, and Bring-Up",
 "TEST-06": "Wafer Sort Test Program Development",
 "TEST-07": "Final / Package Test Program Development",
 "TEST-08": "DFT Pattern Porting to ATE Format and Pattern Debug",
 "TEST-09": "Characterization Test Suite Development",
 "TEST-10": "Test Data Infrastructure and Yield Database",
 "TEST-11": "ATE, Bench, and System Correlation",
 "BU-01": "Sample Receipt, Incoming Inspection, and Board Mounting",
 "BU-02": "Power-On, Power Sequencing, and Basic Health Check",
 "BU-03": "Reset, Clocking, and PLL Lock Validation",
 "BU-04": "Boot, Firmware Load, and Functional Smoke Test",
 "BU-05": "Silicon Anomaly Debug and Failure Analysis",
 "BU-06": "PCIe/CXL, HBM, and Die-to-Die Interface Bring-Up",
 "BU-07": "Memory Subsystem and Bandwidth Validation",
 "BU-08": "Shmoo Across Voltage, Frequency, and Temperature",
 "BU-09": "Errata Capture, Workaround Definition, and Documentation",
 "BU-10": "Performance Validation Against the Architecture Model",
 "BU-11": "Respin versus Metal-Fix Decision Analysis",
 "BU-12": "Customer Sample Readiness and Release Package",
 "MP-01": "Qualification Plan Definition Against JEDEC / AEC Standards",
 "MP-02": "Yield Learning, Failure Pareto, and Defect Analysis",
 "MP-03": "Reliability Stress Execution (HTOL, HTS, Temperature Cycle, uHAST, THB)",
 "MP-04": "ESD (HBM, CDM) and Latch-Up Qualification",
 "MP-05": "Process Corner and Split-Lot Validation",
 "MP-06": "Package Qualification (MSL, Drop, Bend, Board-Level Reliability)",
 "MP-07": "Production Test Program Release and Guard-Band Validation",
 "MP-08": "Capacity, Supply Chain, and Ramp Commitment",
 "MP-09": "Compliance and Certification (PCIe/CXL, RoHS/REACH, Safety)",
 "MP-10": "Test Time Reduction and Multi-Site Conversion",
 "MP-11": "Product Documentation Release",
 "MP-12": "Production Readiness Review and Change Control (PCN) Setup"
};

/** Deliverable titles by reference, for the 'what it delivers' section. */
export const detailDeliverables: Record<string, string> = {
 "DEF-D1": "Product requirements document (PRD)",
 "DEF-D2": "Target specification — PPA and KPI table",
 "DEF-D3": "Product cost and margin model",
 "DEF-D4": "Feasibility report",
 "DEF-D5": "Program charter, schedule, and resource plan",
 "DEF-D6": "Kickoff Go / No-Go decision record",
 "ARCH-D1": "Interface and protocol definition document",
 "ARCH-D2": "Power / clock / reset architecture and UPF intent",
 "ARCH-D3": "Performance model and workload analysis report",
 "ARCH-D4": "Chip-level block diagram with pin and bump budget",
 "ARCH-D5": "Block partitioning and PPA budget table",
 "ARCH-D6": "Architecture specification",
 "ARCH-D7": "Architecture Freeze review package",
 "TECH-D1": "Technology selection report and decision record",
 "TECH-D2": "Process option / flavor sheet agreed with foundry",
 "TECH-D3": "Node risk assessment — maturity, defect density, yield learning curve",
 "TECH-D4": "Executed foundry design agreement (DA) and NDA",
 "TECH-D5": "Wafer, mask and NRE cost sheet",
 "TECH-D6": "Capacity and tapeout slot commitment",
 "PDK-D1": "PDK readiness dashboard — version, release date, open gap list",
 "PDK-D2": "Qualified library list with .lib / LEF / GDS views",
 "PDK-D3": "EDA tool and version matrix (qualified and frozen)",
 "PDK-D4": "Memory PPA gap analysis and custom-instance decision record",
 "PDK-D5": "Compute and license capacity plan",
 "PDK-D6": "Internal reference flow and methodology guide",
 "PDK-D7": "Signoff corner definition agreed with foundry",
 "PDK-D8": "Golden environment release notes",
 "IPR-D1": "IP bill of materials with make / buy / reuse decision per block",
 "IPR-D2": "Vendor evaluation matrix and selection record",
 "IPR-D3": "IP readiness report — silicon-proven status and maturity level per IP",
 "IPR-D4": "IP deliverable acceptance checklist",
 "IPR-D5": "Executed licences and POs with committed delivery dates",
 "IPR-D6": "IP risk register and contingency plan",
 "IPR-D7": "IP delivery schedule folded into the program plan",
 "AMS-D1": "AMS IP specifications and design review packages",
 "AMS-D2": "Custom SRAM instance specification with Vmin and sigma-yield report",
 "AMS-D3": "Per-macro DRC / LVS clean signoff, pushed rules approved by foundry",
 "AMS-D4": "Reliability report — EM/IR, ESD, latch-up, aging",
 "AMS-D5": "Characterization reports across PVT and Monte Carlo",
 "AMS-D6": "Custom memory views characterized to compiler equivalence",
 "AMS-D7": "Hard macro GDS with abstract views (LEF, .lib, CDL, UPF, wreal/Verilog model)",
 "AMS-D8": "Integration guide with known limitations and errata",
 "TC-D1": "Test chip specification and risk coverage matrix",
 "TC-D2": "Test chip GDS and shuttle submission record",
 "TC-D3": "Test chip silicon and characterization report",
 "TC-D4": "Silicon-to-model correlation report",
 "TC-D5": "Design guidance and margin decisions for the production chip",
 "RTL-D1": "Integration testbench and build system",
 "RTL-D2": "Register map / RDL and generated headers",
 "RTL-D3": "UPF power intent file",
 "RTL-D4": "IP integration report and version manifest",
 "RTL-D5": "Block and top-level RTL release, tagged",
 "RTL-D6": "Lint / CDC / RDC clean reports with waiver list",
 "RTL-D7": "RTL Freeze package",
 "DV-D1": "Verification plan (vPlan) and coverage model",
 "DV-D2": "UVM testbenches and integrated VIP",
 "DV-D3": "Emulation platform and system test suite",
 "DV-D4": "Formal proof reports with assumption list",
 "DV-D5": "Low-power verification report",
 "DV-D6": "Regression and coverage dashboards",
 "DV-D7": "Gate-level simulation report",
 "DV-D8": "DV closure signoff package",
 "DFT-D1": "DFT architecture specification and coverage plan",
 "DFT-D2": "MBIST / BISR insertion and test collateral",
 "DFT-D3": "JTAG / IJTAG description files (BSDL, ICL, PDL)",
 "DFT-D4": "DFT DRC clean report",
 "DFT-D5": "ATPG pattern sets with coverage report",
 "DFT-D6": "Pattern validation (GLS) report and ATE-ready pattern files",
 "DFT-D7": "DFT signoff entry for the tapeout checklist",
 "SYN-D1": "N0 flow-flush netlist for PD flow setup",
 "SYN-D2": "Validated SDC constraint set per mode and corner",
 "SYN-D3": "Power intent implementation report",
 "SYN-D4": "N1 and N2 netlist drops with QoR delta reports",
 "SYN-D5": "Synthesis QoR report per drop against PPA targets",
 "SYN-D6": "Formal equivalence clean report per drop",
 "SYN-D7": "Physical design handoff package per drop",
 "SYN-D8": "FFN — final full netlist, release-tagged",
 "PD-D1": "Flow setup release — MMMC environment, scripts and runtime baseline",
 "PD-D2": "Floorplan and PDN specification",
 "PD-D3": "Bump map, RDL and package interface files",
 "PD-D4": "Turn 1 and Turn 2 databases with QoR delta reports",
 "PD-D5": "Interim physical DRC / LVS clean",
 "PD-D6": "MCMM timing closure reports with violation burn-down across turns",
 "PD-D7": "ECO log and change control record",
 "PD-D8": "Final-turn routed database on the FFN, per block and top",
 "PD-D9": "Signoff-ready database handoff",
 "SO-D1": "Reliability reports — ESD, latch-up, FIT",
 "SO-D2": "DFM and lithography hotspot report",
 "SO-D3": "EM/IR and SI/PI signoff reports",
 "SO-D4": "STA signoff reports across all corners and modes, with waiver list",
 "SO-D5": "Clean DRC / LVS / antenna / density reports",
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
 "FAB-D2": "Wafer-out forecast versus actual log",
 "FAB-D3": "Inline, PCM and WAT data package",
 "FAB-D4": "Processed engineering-lot wafers",
 "FAB-D5": "Wafer acceptance disposition record",
 "FAB-D6": "First Silicon availability notice",
 "PKGD-D1": "Package architecture specification",
 "PKGD-D2": "Test vehicle requirement specification for PTV",
 "PKGD-D3": "Bump map and interposer / RDL database",
 "PKGD-D4": "Substrate and interposer PO with committed lead time",
 "PKGD-D5": "Substrate design files (Gerber / ODB++) and stack-up",
 "PKGD-D6": "Package electrical design intent and model handoff to co-verification",
 "PKGD-D7": "OSAT assembly process flow and agreement",
 "PKGD-D8": "Thermal and mechanical (warpage) simulation reports",
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
 "SIPI-D3": "Channel compliance report per interface, with margins",
 "SIPI-D4": "PDN impedance and dynamic IR co-simulation report",
 "SIPI-D5": "Decap budget and placement specification across die, package and board",
 "SIPI-D6": "Power-aware STA correlation report",
 "SIPI-D7": "Eye, jitter and BER budget closure record",
 "SIPI-D8": "Chip-package-system co-verification signoff — tapeout gate",
 "ASSY-D1": "Assembly travelers and process data",
 "ASSY-D2": "Assembled units — bring-up, qualification and sample lots",
 "ASSY-D3": "Package-level inspection and test data",
 "ASSY-D4": "Assembly yield report and failure pareto",
 "ASSY-D5": "Unit allocation record across bring-up, qual and customers",
 "EVB-D1": "Validation platform specification",
 "EVB-D2": "Debug and trace access documentation",
 "EVB-D3": "EVB schematics, BOM and layout database",
 "EVB-D4": "Lab setup and instrument reservation plan",
 "EVB-D5": "Fabricated and assembled boards, rev A/B with quantity plan",
 "EVB-D6": "Board bring-up report and known issues",
 "TEST-D1": "Test plan and test coverage matrix",
 "TEST-D2": "Qualified probe card and load board",
 "TEST-D3": "ATE-ready pattern set with debug log",
 "TEST-D4": "Test data infrastructure and yield database",
 "TEST-D5": "Characterization test suite",
 "TEST-D6": "Test time and test cost model",
 "TEST-D7": "Wafer sort and final test programs, release-tagged",
 "BU-D1": "Bring-up report with per-milestone health status",
 "BU-D2": "Failure analysis reports",
 "BU-D3": "Interface compliance results with training margins",
 "BU-D4": "Characterization data set — V/F/T shmoo and power measurements",
 "BU-D5": "Respin versus metal-fix decision record",
 "BU-D6": "Errata list with workarounds",
 "BU-D7": "Customer sample release package",
 "MP-D1": "Qualification plan and JEDEC-compliant qualification report",
 "MP-D2": "Yield model versus cost target report",
 "MP-D3": "Production test program release",
 "MP-D4": "Compliance certificates",
 "MP-D5": "Ramp plan and supply commitment",
 "MP-D6": "Reliability and package qualification data packages",
 "MP-D7": "Datasheet and product documentation set",
 "MP-D8": "Production readiness review signoff",
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
 "ASSY-10",
 "ASSY-11",
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

/**
 * What each activity feeds, as the write-ups state it — 1289 edges, 748 of
 * them crossing a stage boundary. This is the programme's dependency graph, and
 * it is here rather than with the write-ups because it is small and a browser
 * needs it: it is what says who waits when something is late.
 *
 * Not acyclic. An activity can feed one that later feeds back into it, so
 * anything walking this has to keep track of where it has been.
 */
export const activityFeeds: Record<string, string[]> = {
 "DEF-01": [
  "DEF-03",
  "DEF-06",
  "DEF-04",
  "DEF-07",
  "DEF-08",
  "ARCH-01",
  "ARCH-05",
  "TECH-01",
  "TECH-09",
  "IPR-01",
  "PKGD-01"
 ],
 "DEF-02": [
  "DEF-06",
  "DEF-09",
  "TEST-01",
  "MP-02"
 ],
 "DEF-03": [
  "DEF-05",
  "DEF-04",
  "DEF-07",
  "ARCH-01",
  "ARCH-04",
  "DV-03",
  "DV-11"
 ],
 "DEF-04": [
  "DEF-05",
  "ARCH-01",
  "ARCH-04",
  "ARCH-03",
  "PKGD-01",
  "PKGD-02",
  "TEST-02",
  "MP-08",
  "MP-09"
 ],
 "DEF-05": [
  "DEF-06",
  "DEF-07",
  "ARCH-01",
  "ARCH-06",
  "ARCH-09",
  "ARCH-08",
  "TECH-05",
  "SYN-01",
  "PD-06",
  "PKGD-06",
  "BU-10",
  "MP-01"
 ],
 "DEF-06": [
  "DEF-07",
  "DEF-09",
  "ARCH-02",
  "PDK-11",
  "DFT-02",
  "PKGD-01",
  "TEST-01",
  "TEST-09",
  "MP-01",
  "MP-02"
 ],
 "DEF-07": [
  "DEF-08",
  "DEF-09",
  "ARCH-01",
  "IPR-03"
 ],
 "DEF-08": [
  "DEF-09",
  "TECH-07",
  "PDK-10",
  "IPR-09",
  "RTL-03",
  "FAB-02",
  "PKGD-07",
  "TEST-02"
 ],
 "DEF-09": [
  "ARCH-01",
  "TECH-03",
  "IPR-06"
 ],
 "ARCH-01": [
  "ARCH-02",
  "ARCH-04",
  "ARCH-09",
  "ARCH-07",
  "DV-11"
 ],
 "ARCH-02": [
  "ARCH-04",
  "ARCH-03",
  "ARCH-06",
  "ARCH-09",
  "ARCH-05",
  "ARCH-08",
  "ARCH-07",
  "ARCH-10",
  "IPR-01",
  "DFT-01",
  "PKGD-01",
  "BU-10"
 ],
 "ARCH-03": [
  "ARCH-08",
  "ARCH-07",
  "PDK-06",
  "IPR-04",
  "AMS-01",
  "AMS-04",
  "PKGD-02",
  "PKGD-04",
  "PKGD-09",
  "SIPI-04",
  "TEST-01",
  "BU-07"
 ],
 "ARCH-04": [
  "ARCH-09",
  "ARCH-08",
  "ARCH-07",
  "ARCH-10",
  "PDK-05",
  "PDK-09",
  "PDK-11",
  "AMS-02",
  "RTL-01",
  "PKGD-04",
  "ASSY-04",
  "EVB-01",
  "EVB-02",
  "TEST-07"
 ],
 "ARCH-05": [
  "ARCH-07",
  "ARCH-10",
  "RTL-10",
  "RTL-04",
  "DV-06",
  "DFT-05",
  "DFT-03",
  "DFT-07",
  "DFT-04",
  "MP-09"
 ],
 "ARCH-06": [
  "ARCH-09",
  "ARCH-07",
  "PDK-08",
  "PDK-12",
  "AMS-01",
  "AMS-03",
  "AMS-06",
  "AMS-07",
  "RTL-06",
  "DV-10",
  "DFT-06",
  "SYN-01",
  "SYN-09",
  "PD-03",
  "PD-07",
  "SIPI-01",
  "BU-03"
 ],
 "ARCH-07": [
  "ARCH-10",
  "RTL-01",
  "RTL-04",
  "DV-01",
  "DFT-01",
  "SYN-01",
  "PD-01"
 ],
 "ARCH-08": [
  "ARCH-09",
  "ARCH-07",
  "PDK-06",
  "AMS-04",
  "DFT-03",
  "DFT-04",
  "PD-01",
  "PD-02",
  "PD-04",
  "PKGD-02",
  "SIPI-02",
  "EVB-01",
  "EVB-06",
  "TEST-05",
  "BU-02"
 ],
 "ARCH-09": [
  "ARCH-07",
  "ARCH-10",
  "PDK-09",
  "AMS-01",
  "AMS-02",
  "RTL-01",
  "RTL-08",
  "SYN-09",
  "SYN-10",
  "SYN-03",
  "PD-02",
  "PD-03",
  "PD-12",
  "EVB-09"
 ],
 "ARCH-10": [
  "RTL-01",
  "RTL-05",
  "RTL-04",
  "DV-01",
  "DFT-01"
 ],
 "TECH-01": [
  "TECH-05",
  "TECH-04",
  "TECH-06",
  "TECH-07",
  "TECH-03",
  "TECH-02",
  "TECH-08",
  "TECH-09",
  "PDK-01",
  "IPR-02",
  "IPR-05"
 ],
 "TECH-02": [
  "DEF-06",
  "DEF-07",
  "TECH-08",
  "AMS-08",
  "TC-01",
  "DFT-02",
  "SO-07",
  "FAB-04",
  "MP-02"
 ],
 "TECH-03": [
  "TECH-07",
  "PDK-01",
  "PDK-05",
  "IPR-06",
  "TC-03",
  "FAB-10"
 ],
 "TECH-04": [
  "DEF-07",
  "ARCH-01",
  "ARCH-03",
  "TECH-05",
  "TECH-02",
  "PDK-03",
  "PKGD-03",
  "PTV-01",
  "PTV-08"
 ],
 "TECH-05": [
  "ARCH-02",
  "TECH-06",
  "TECH-08",
  "PDK-01",
  "PDK-02",
  "PDK-03",
  "PDK-05",
  "PDK-07",
  "IPR-05",
  "SYN-02",
  "PD-11"
 ],
 "TECH-06": [
  "DEF-07",
  "DEF-09",
  "TC-03",
  "TO-08",
  "MP-08"
 ],
 "TECH-07": [
  "TC-03",
  "TO-06",
  "TO-08",
  "FAB-05",
  "FAB-02",
  "MP-05",
  "MP-08"
 ],
 "TECH-08": [
  "IPR-03",
  "IPR-10",
  "BU-11"
 ],
 "TECH-09": [
  "FAB-10",
  "PKGD-01",
  "PKGD-07",
  "PKGD-08",
  "PTV-01",
  "ASSY-03",
  "ASSY-04"
 ],
 "PDK-01": [
  "PDK-02",
  "PDK-03",
  "PDK-05",
  "PDK-06",
  "PDK-07",
  "PDK-04",
  "PDK-13",
  "AMS-03",
  "AMS-05",
  "SYN-01",
  "PD-01",
  "SO-11"
 ],
 "PDK-02": [
  "PDK-08",
  "PDK-04",
  "AMS-09",
  "AMS-11",
  "DFT-07",
  "PD-11",
  "PD-08",
  "PD-16",
  "SO-12",
  "SO-06",
  "SO-07"
 ],
 "PDK-03": [
  "ARCH-01",
  "ARCH-06",
  "PDK-12",
  "PDK-13",
  "RTL-06",
  "SYN-02",
  "SYN-09",
  "SYN-10",
  "PD-05",
  "SO-02"
 ],
 "PDK-04": [
  "PDK-08",
  "PDK-13",
  "AMS-12",
  "PD-11",
  "PD-08",
  "SO-01",
  "SO-03",
  "SO-04",
  "SO-11",
  "SO-02",
  "TO-02",
  "TO-09"
 ],
 "PDK-05": [
  "PDK-09",
  "PDK-13",
  "AMS-02",
  "RTL-07",
  "DFT-05",
  "PD-02"
 ],
 "PDK-06": [
  "PDK-12",
  "PDK-13",
  "AMS-15",
  "PD-01",
  "SO-06",
  "SIPI-07",
  "SIPI-04",
  "MP-04"
 ],
 "PDK-07": [
  "PDK-08",
  "PDK-10",
  "PDK-13",
  "IPR-07",
  "AMS-05",
  "RTL-09",
  "RTL-02",
  "DV-06",
  "SYN-01",
  "SYN-06",
  "PD-01",
  "SO-01"
 ],
 "PDK-08": [
  "PDK-10",
  "PDK-13",
  "DFT-08",
  "SYN-01",
  "SYN-02",
  "SYN-10",
  "PD-01",
  "PD-09",
  "SO-01"
 ],
 "PDK-09": [
  "PDK-11",
  "AMS-02",
  "AMS-10",
  "PD-02",
  "MP-05"
 ],
 "PDK-10": [
  "RTL-02",
  "DV-07",
  "SYN-03",
  "PD-01",
  "PD-06",
  "SO-01"
 ],
 "PDK-11": [
  "AMS-02",
  "AMS-07",
  "AMS-09",
  "PD-02"
 ],
 "PDK-12": [
  "PDK-10",
  "AMS-14",
  "AMS-12",
  "SYN-01",
  "PD-01",
  "PD-06",
  "SO-01",
  "SO-03",
  "SO-02"
 ],
 "PDK-13": [
  "AMS-11",
  "TC-02",
  "TC-04",
  "RTL-08",
  "DFT-08",
  "SYN-01",
  "PD-01",
  "SO-01"
 ],
 "IPR-01": [
  "TECH-08",
  "PDK-05",
  "IPR-02",
  "IPR-03",
  "IPR-04"
 ],
 "IPR-02": [
  "ARCH-09",
  "IPR-03",
  "IPR-05",
  "IPR-08"
 ],
 "IPR-03": [
  "IPR-04",
  "IPR-06",
  "IPR-08",
  "AMS-01",
  "AMS-04"
 ],
 "IPR-04": [
  "IPR-05",
  "IPR-07",
  "IPR-06",
  "AMS-04"
 ],
 "IPR-05": [
  "IPR-07",
  "IPR-06",
  "IPR-08",
  "IPR-10",
  "TC-01",
  "TC-02",
  "RTL-07"
 ],
 "IPR-06": [
  "IPR-09",
  "AMS-04",
  "RTL-07",
  "DV-02",
  "PD-02"
 ],
 "IPR-07": [
  "IPR-06",
  "IPR-09",
  "RTL-07",
  "PD-02"
 ],
 "IPR-08": [
  "IPR-09",
  "IPR-10",
  "AMS-04",
  "DV-02"
 ],
 "IPR-09": [
  "IPR-10",
  "RTL-07",
  "RTL-02",
  "PD-02",
  "PD-04"
 ],
 "IPR-10": [
  "AMS-01",
  "RTL-03"
 ],
 "AMS-01": [
  "AMS-03",
  "AMS-04",
  "AMS-06",
  "AMS-02",
  "AMS-05",
  "TC-01"
 ],
 "AMS-02": [
  "AMS-07",
  "AMS-09",
  "AMS-10",
  "AMS-08",
  "AMS-14"
 ],
 "AMS-03": [
  "AMS-05",
  "AMS-11",
  "AMS-12",
  "AMS-16",
  "DFT-06",
  "PD-05",
  "PD-07",
  "SIPI-08",
  "BU-03"
 ],
 "AMS-04": [
  "AMS-11",
  "AMS-12",
  "AMS-16",
  "PKGD-09",
  "SIPI-04",
  "SIPI-08",
  "BU-06"
 ],
 "AMS-05": [
  "AMS-11",
  "AMS-12",
  "AMS-15",
  "AMS-13"
 ],
 "AMS-06": [
  "AMS-11",
  "AMS-12",
  "AMS-15",
  "AMS-16",
  "SIPI-06",
  "TEST-06",
  "BU-03"
 ],
 "AMS-07": [
  "AMS-09",
  "AMS-10",
  "AMS-14",
  "AMS-15"
 ],
 "AMS-08": [
  "AMS-10",
  "AMS-14",
  "DFT-07",
  "TEST-06",
  "MP-04"
 ],
 "AMS-09": [
  "AMS-10",
  "AMS-14",
  "AMS-11",
  "AMS-16",
  "SO-03"
 ],
 "AMS-10": [
  "AMS-14",
  "AMS-15",
  "MP-02"
 ],
 "AMS-11": [
  "AMS-12",
  "AMS-15",
  "AMS-16",
  "PD-02",
  "PD-16",
  "SO-03"
 ],
 "AMS-12": [
  "AMS-15",
  "AMS-16",
  "AMS-13",
  "SO-03",
  "BU-08"
 ],
 "AMS-13": [
  "DV-09",
  "PD-02",
  "BU-03",
  "BU-06"
 ],
 "AMS-14": [
  "AMS-16",
  "DV-12",
  "SYN-02",
  "PD-02",
  "SO-03"
 ],
 "AMS-15": [
  "AMS-16",
  "SO-06",
  "MP-03",
  "MP-04"
 ],
 "AMS-16": [
  "AMS-13",
  "DV-09",
  "SYN-02",
  "PD-01",
  "PD-02",
  "SO-03",
  "TO-01"
 ],
 "TC-01": [
  "TC-02",
  "TC-03",
  "TC-04",
  "TC-06",
  "TC-07"
 ],
 "TC-02": [
  "TC-04",
  "TC-06",
  "TC-07"
 ],
 "TC-03": [
  "TC-02",
  "TC-04",
  "TC-05"
 ],
 "TC-04": [
  "TC-05",
  "TC-07"
 ],
 "TC-05": [
  "TC-07"
 ],
 "TC-06": [
  "TC-07",
  "EVB-01"
 ],
 "TC-07": [
  "AMS-12",
  "TC-08",
  "SO-11",
  "FAB-08"
 ],
 "TC-08": [
  "PD-06",
  "SO-11"
 ],
 "RTL-01": [
  "RTL-05",
  "RTL-10",
  "RTL-06",
  "RTL-04",
  "DV-01",
  "DV-02",
  "DV-05"
 ],
 "RTL-02": [
  "RTL-05",
  "RTL-10",
  "DV-07",
  "SYN-01"
 ],
 "RTL-03": [
  "DV-04",
  "SYN-12",
  "PD-09",
  "TO-03"
 ],
 "RTL-04": [
  "RTL-05",
  "RTL-10",
  "DV-01",
  "DV-02",
  "DV-05",
  "BU-04"
 ],
 "RTL-05": [
  "RTL-10",
  "RTL-09",
  "DV-06",
  "SYN-02",
  "SYN-05",
  "SYN-08"
 ],
 "RTL-06": [
  "RTL-10",
  "RTL-09",
  "DV-10",
  "DV-12",
  "SYN-09",
  "SYN-10",
  "PD-03",
  "BU-07"
 ],
 "RTL-07": [
  "AMS-13",
  "RTL-10",
  "RTL-09",
  "DV-05",
  "DV-09",
  "PD-02"
 ],
 "RTL-08": [
  "RTL-03",
  "SYN-02",
  "SYN-10",
  "PD-01"
 ],
 "RTL-09": [
  "RTL-03",
  "DV-12",
  "SYN-01",
  "SO-09",
  "EVB-09",
  "BU-04"
 ],
 "RTL-10": [
  "RTL-09",
  "RTL-08",
  "DV-08",
  "DV-03",
  "DFT-08",
  "SYN-01",
  "SYN-02",
  "BU-03"
 ],
 "DV-01": [
  "DV-02",
  "DV-05",
  "DV-08",
  "DV-06",
  "DV-07",
  "DV-04"
 ],
 "DV-02": [
  "DV-05",
  "DV-08",
  "DV-10",
  "DV-09",
  "DV-03",
  "DV-07",
  "DV-12"
 ],
 "DV-03": [
  "DV-11",
  "DV-07",
  "BU-04",
  "BU-05"
 ],
 "DV-04": [
  "SO-09",
  "TO-03",
  "TO-04",
  "TO-05",
  "BU-09"
 ],
 "DV-05": [
  "DV-08",
  "DV-07",
  "DV-04"
 ],
 "DV-06": [
  "DV-07",
  "DV-04",
  "SO-09"
 ],
 "DV-07": [
  "DV-04",
  "SYN-08",
  "SO-09",
  "TO-03"
 ],
 "DV-08": [
  "DV-11",
  "DV-07",
  "DV-04",
  "SYN-09",
  "PD-10",
  "SIPI-01",
  "BU-04"
 ],
 "DV-09": [
  "DV-07",
  "DV-04",
  "BU-03",
  "BU-06"
 ],
 "DV-10": [
  "DV-07",
  "DV-04",
  "SO-09",
  "BU-02"
 ],
 "DV-11": [
  "DV-07",
  "BU-10"
 ],
 "DV-12": [
  "DV-04",
  "DFT-11",
  "SO-09",
  "SO-10",
  "TO-02",
  "BU-05"
 ],
 "DFT-01": [
  "DFT-05",
  "DFT-03",
  "DFT-06",
  "DFT-08",
  "DFT-09",
  "DFT-04",
  "SYN-01",
  "TEST-01"
 ],
 "DFT-02": [
  "DFT-01",
  "DFT-10",
  "TEST-01",
  "TEST-03"
 ],
 "DFT-03": [
  "DFT-11",
  "DFT-07",
  "DFT-04",
  "TEST-08",
  "BU-03"
 ],
 "DFT-04": [
  "TEST-11",
  "BU-06",
  "BU-05",
  "MP-02"
 ],
 "DFT-05": [
  "AMS-08",
  "DFT-08",
  "DFT-07",
  "TEST-01",
  "TEST-06",
  "TEST-08",
  "MP-02"
 ],
 "DFT-06": [
  "DFT-08",
  "DFT-10",
  "SYN-02",
  "PD-05",
  "PD-07",
  "TEST-01"
 ],
 "DFT-07": [
  "TEST-06",
  "BU-02",
  "MP-07",
  "MP-12"
 ],
 "DFT-08": [
  "DV-12",
  "DFT-10",
  "DFT-09",
  "SYN-08",
  "SYN-06",
  "PD-13",
  "TEST-06"
 ],
 "DFT-09": [
  "DFT-10",
  "PD-11",
  "PD-13"
 ],
 "DFT-10": [
  "DFT-11",
  "TO-03",
  "TO-04",
  "TEST-08",
  "MP-07"
 ],
 "DFT-11": [
  "SO-10",
  "TO-03",
  "EVB-04",
  "TEST-08",
  "BU-02",
  "BU-05",
  "MP-07"
 ],
 "SYN-01": [
  "DV-12",
  "SYN-02",
  "SYN-05",
  "SYN-08",
  "SYN-03",
  "PD-01",
  "PD-06",
  "SO-03"
 ],
 "SYN-02": [
  "SYN-05",
  "SYN-07",
  "SYN-08",
  "SYN-09",
  "SYN-10",
  "SYN-06",
  "SYN-03",
  "PD-05"
 ],
 "SYN-03": [
  "SYN-04",
  "PD-06"
 ],
 "SYN-04": [
  "PD-01",
  "PD-05",
  "PD-11",
  "PD-15"
 ],
 "SYN-05": [
  "SYN-04",
  "PD-01",
  "PD-02"
 ],
 "SYN-06": [
  "SYN-12",
  "SO-09",
  "TO-02"
 ],
 "SYN-07": [
  "SYN-08",
  "SYN-11",
  "PD-05",
  "PD-11"
 ],
 "SYN-08": [
  "SYN-11",
  "SYN-04",
  "PD-02",
  "PD-05"
 ],
 "SYN-09": [
  "SYN-11",
  "SYN-03",
  "PD-06",
  "PD-14",
  "SO-05"
 ],
 "SYN-10": [
  "DV-10",
  "SYN-11",
  "SYN-06",
  "PD-03",
  "SO-09"
 ],
 "SYN-11": [
  "SYN-12",
  "PD-11",
  "SO-01"
 ],
 "SYN-12": [
  "PD-15",
  "SO-03",
  "SO-09",
  "TO-01"
 ],
 "PD-01": [
  "SYN-08",
  "PD-02",
  "PD-05"
 ],
 "PD-02": [
  "SYN-07",
  "PD-03",
  "PD-04",
  "PD-05",
  "PD-07",
  "PD-09",
  "PD-12"
 ],
 "PD-03": [
  "PD-04",
  "PD-05",
  "PD-08",
  "PD-14",
  "PD-10",
  "SO-05",
  "PKGD-04",
  "PKGD-10",
  "PKGD-06",
  "SIPI-03",
  "SIPI-06",
  "SIPI-07",
  "SIPI-10"
 ],
 "PD-04": [
  "PKGD-11",
  "SIPI-02",
  "SIPI-05"
 ],
 "PD-05": [
  "SYN-11",
  "PD-11",
  "PD-07",
  "PD-08",
  "PD-06",
  "PD-10",
  "SIPI-01"
 ],
 "PD-06": [
  "DV-12",
  "DFT-11",
  "PD-14",
  "PD-15",
  "PD-09",
  "PD-12",
  "SO-03",
  "SO-10",
  "SIPI-09"
 ],
 "PD-07": [
  "PD-11",
  "PD-08",
  "PD-06",
  "PD-15",
  "SO-03"
 ],
 "PD-08": [
  "PD-14",
  "PD-13",
  "PD-15",
  "PD-16",
  "SO-04",
  "SO-07",
  "EVB-02",
  "EVB-03",
  "BU-02"
 ],
 "PD-09": [
  "PD-15",
  "SO-09",
  "TO-03",
  "TO-07"
 ],
 "PD-10": [
  "SO-12",
  "SIPI-03",
  "SIPI-05",
  "MP-04"
 ],
 "PD-11": [
  "SYN-12",
  "PD-06",
  "PD-15",
  "SO-01"
 ],
 "PD-12": [
  "SO-03",
  "SO-04",
  "SO-09",
  "TO-01"
 ],
 "PD-13": [
  "PD-15",
  "SO-04"
 ],
 "PD-14": [
  "PD-15",
  "SO-05",
  "SO-08",
  "SIPI-05"
 ],
 "PD-15": [
  "PD-16",
  "PD-12",
  "SO-03",
  "SO-04",
  "SO-05",
  "SO-08",
  "SO-06",
  "SO-07",
  "SO-09",
  "SO-10",
  "TO-01"
 ],
 "PD-16": [
  "SO-04",
  "SO-07",
  "TO-01",
  "TEST-04",
  "MP-12"
 ],
 "SO-01": [
  "PD-06",
  "SO-03",
  "SO-04",
  "SO-05",
  "SO-08",
  "SO-02"
 ],
 "SO-02": [
  "SO-03",
  "TO-02"
 ],
 "SO-03": [
  "SO-12",
  "SO-11",
  "SO-10",
  "TO-02",
  "TO-03",
  "TO-09"
 ],
 "SO-04": [
  "SO-09",
  "SO-11",
  "TO-01",
  "TO-02",
  "TO-09",
  "TEST-08"
 ],
 "SO-05": [
  "SO-03",
  "SO-08",
  "SO-12",
  "SO-11",
  "TO-02",
  "MP-03"
 ],
 "SO-06": [
  "SO-11",
  "TO-02",
  "MP-03",
  "MP-04"
 ],
 "SO-07": [
  "SO-11",
  "TO-02",
  "FAB-04",
  "MP-02"
 ],
 "SO-08": [
  "SO-03",
  "SO-11",
  "TO-02"
 ],
 "SO-09": [
  "SO-11",
  "TO-02",
  "TO-03"
 ],
 "SO-10": [
  "SO-11",
  "TO-02",
  "BU-02"
 ],
 "SO-11": [
  "TO-03",
  "TO-04",
  "TO-05",
  "MP-12"
 ],
 "SO-12": [
  "SO-11",
  "TO-04",
  "TO-06"
 ],
 "TO-01": [
  "TO-02",
  "TO-03",
  "TO-06",
  "TO-07"
 ],
 "TO-02": [
  "TO-03",
  "TO-05",
  "TO-06"
 ],
 "TO-03": [
  "TO-04",
  "TO-05"
 ],
 "TO-04": [
  "TO-05",
  "BU-09",
  "MP-12"
 ],
 "TO-05": [
  "TO-06",
  "TO-07",
  "MP-12"
 ],
 "TO-06": [
  "TO-08",
  "TO-07",
  "TO-10",
  "FAB-01"
 ],
 "TO-07": [
  "TO-09",
  "TO-10",
  "BU-11"
 ],
 "TO-08": [
  "TO-11",
  "FAB-01",
  "FAB-05"
 ],
 "TO-09": [
  "TO-10"
 ],
 "TO-10": [
  "TO-11",
  "FAB-03"
 ],
 "TO-11": [
  "FAB-03",
  "FAB-07",
  "FAB-02"
 ],
 "FAB-01": [
  "FAB-05",
  "FAB-06",
  "FAB-02"
 ],
 "FAB-02": [
  "PTV-12",
  "ASSY-03",
  "TEST-04",
  "BU-01",
  "MP-02"
 ],
 "FAB-03": [
  "FAB-07",
  "FAB-02"
 ],
 "FAB-04": [
  "FAB-06",
  "FAB-07",
  "FAB-08",
  "FAB-09",
  "MP-02",
  "MP-05"
 ],
 "FAB-05": [
  "FAB-06",
  "FAB-04",
  "FAB-02"
 ],
 "FAB-06": [
  "FAB-03",
  "FAB-07",
  "FAB-08",
  "FAB-02"
 ],
 "FAB-07": [
  "FAB-08",
  "FAB-09",
  "FAB-10"
 ],
 "FAB-08": [
  "FAB-09",
  "BU-08",
  "MP-02",
  "MP-05"
 ],
 "FAB-09": [
  "FAB-10",
  "ASSY-03",
  "BU-01",
  "MP-02"
 ],
 "FAB-10": [
  "ASSY-03",
  "BU-01"
 ],
 "PKGD-01": [
  "PD-04",
  "PKGD-02",
  "PKGD-05",
  "PKGD-06",
  "PKGD-03",
  "PKGD-07",
  "PKGD-08",
  "PTV-01",
  "PTV-02",
  "PTV-03"
 ],
 "PKGD-02": [
  "PD-04",
  "PKGD-04",
  "PKGD-09",
  "PKGD-10",
  "PTV-04",
  "SIPI-02",
  "SIPI-07"
 ],
 "PKGD-03": [
  "PTV-01",
  "PTV-02",
  "PTV-03",
  "PTV-04",
  "EVB-06"
 ],
 "PKGD-04": [
  "PKGD-05",
  "PKGD-09",
  "PKGD-11",
  "PTV-04",
  "PTV-05",
  "SIPI-02",
  "SIPI-04",
  "TEST-04"
 ],
 "PKGD-05": [
  "PKGD-09",
  "PKGD-10",
  "PKGD-11",
  "PTV-05",
  "SIPI-02",
  "ASSY-11",
  "EVB-01",
  "EVB-02",
  "EVB-04",
  "TEST-01",
  "TEST-02",
  "TEST-05"
 ],
 "PKGD-06": [
  "PTV-02",
  "PTV-03",
  "PTV-09",
  "PTV-10",
  "SIPI-10"
 ],
 "PKGD-07": [
  "PKGD-05",
  "PKGD-11",
  "PTV-05",
  "ASSY-07",
  "MP-08"
 ],
 "PKGD-08": [
  "PKGD-11",
  "PTV-04",
  "PTV-06",
  "ASSY-03",
  "ASSY-04",
  "ASSY-05"
 ],
 "PKGD-09": [
  "SO-12",
  "PKGD-11",
  "SIPI-08",
  "EVB-03"
 ],
 "PKGD-10": [
  "SO-12",
  "PKGD-11",
  "SIPI-06"
 ],
 "PKGD-11": [
  "PTV-12",
  "ASSY-07",
  "ASSY-09",
  "MP-01",
  "MP-04",
  "MP-06",
  "MP-08",
  "MP-09"
 ],
 "PTV-01": [
  "PTV-02",
  "PTV-03",
  "PTV-04",
  "PTV-12"
 ],
 "PTV-02": [
  "PTV-05",
  "PTV-09",
  "PTV-08"
 ],
 "PTV-03": [
  "PTV-05",
  "PTV-10"
 ],
 "PTV-04": [
  "PTV-05",
  "PTV-11"
 ],
 "PTV-05": [
  "PTV-06",
  "PTV-12"
 ],
 "PTV-06": [
  "PTV-09",
  "PTV-08",
  "PTV-10",
  "PTV-07",
  "PTV-11",
  "PTV-12"
 ],
 "PTV-07": [
  "PTV-12",
  "MP-06",
  "MP-09"
 ],
 "PTV-08": [
  "PKGD-11",
  "PTV-12",
  "MP-06"
 ],
 "PTV-09": [
  "PTV-08",
  "PTV-12",
  "ASSY-06"
 ],
 "PTV-10": [
  "PTV-12",
  "ASSY-09",
  "MP-03"
 ],
 "PTV-11": [
  "PTV-12",
  "ASSY-08",
  "ASSY-11",
  "MP-02"
 ],
 "PTV-12": [
  "FAB-10",
  "ASSY-03",
  "ASSY-05",
  "ASSY-07",
  "ASSY-08",
  "MP-06"
 ],
 "SIPI-01": [
  "PD-10",
  "SIPI-03",
  "SIPI-05",
  "SIPI-09",
  "SIPI-10"
 ],
 "SIPI-02": [
  "SIPI-03",
  "SIPI-05",
  "SIPI-07",
  "SIPI-04",
  "EVB-05"
 ],
 "SIPI-03": [
  "SO-12",
  "SIPI-05",
  "SIPI-06",
  "SIPI-11"
 ],
 "SIPI-04": [
  "SO-12",
  "SIPI-08"
 ],
 "SIPI-05": [
  "SO-05",
  "SO-12",
  "SIPI-06",
  "SIPI-09",
  "SIPI-11",
  "EVB-05",
  "BU-06"
 ],
 "SIPI-06": [
  "SIPI-11",
  "EVB-03",
  "BU-06"
 ],
 "SIPI-07": [
  "SO-08",
  "SIPI-08",
  "SIPI-11",
  "EVB-05",
  "EVB-03"
 ],
 "SIPI-08": [
  "SO-12",
  "SIPI-11",
  "BU-06",
  "MP-09"
 ],
 "SIPI-09": [
  "SO-12",
  "SIPI-11"
 ],
 "SIPI-10": [
  "SO-12",
  "SIPI-11",
  "MP-03"
 ],
 "SIPI-11": [
  "SO-12",
  "TO-04",
  "PKGD-11",
  "BU-06"
 ],
 "ASSY-01": [
  "ASSY-07",
  "ASSY-09"
 ],
 "ASSY-02": [
  "ASSY-05",
  "ASSY-07"
 ],
 "ASSY-03": [
  "ASSY-05",
  "ASSY-08",
  "ASSY-10"
 ],
 "ASSY-04": [
  "ASSY-05",
  "ASSY-08",
  "MP-08",
  "MP-09"
 ],
 "ASSY-05": [
  "ASSY-07",
  "ASSY-06",
  "ASSY-08"
 ],
 "ASSY-06": [
  "ASSY-08",
  "ASSY-11",
  "MP-06"
 ],
 "ASSY-07": [
  "ASSY-09",
  "ASSY-06",
  "ASSY-08"
 ],
 "ASSY-08": [
  "MP-02",
  "MP-08"
 ],
 "ASSY-09": [
  "ASSY-11",
  "ASSY-10"
 ],
 "ASSY-10": [
  "BU-01",
  "BU-12",
  "MP-01",
  "MP-03",
  "MP-04",
  "MP-06"
 ],
 "ASSY-11": [
  "ASSY-08",
  "ASSY-10"
 ],
 "EVB-01": [
  "EVB-02",
  "EVB-07",
  "EVB-03",
  "EVB-04",
  "EVB-06",
  "EVB-08",
  "EVB-09"
 ],
 "EVB-02": [
  "EVB-05",
  "EVB-07",
  "EVB-03"
 ],
 "EVB-03": [
  "EVB-10",
  "BU-02",
  "BU-08"
 ],
 "EVB-04": [
  "EVB-02",
  "EVB-10",
  "EVB-09",
  "BU-04",
  "BU-06",
  "BU-05"
 ],
 "EVB-05": [
  "EVB-07",
  "EVB-10"
 ],
 "EVB-06": [
  "EVB-05",
  "EVB-10",
  "BU-07",
  "BU-08"
 ],
 "EVB-07": [
  "EVB-10",
  "BU-01"
 ],
 "EVB-08": [
  "BU-06",
  "BU-08",
  "BU-10"
 ],
 "EVB-09": [
  "EVB-10",
  "BU-02",
  "BU-04"
 ],
 "EVB-10": [
  "BU-01",
  "BU-02"
 ],
 "TEST-01": [
  "TEST-02",
  "TEST-04",
  "TEST-05",
  "TEST-06",
  "TEST-07",
  "TEST-09",
  "TEST-03"
 ],
 "TEST-02": [
  "TEST-04",
  "TEST-05",
  "TEST-06",
  "TEST-07",
  "TEST-08",
  "TEST-03",
  "MP-10"
 ],
 "TEST-03": [
  "MP-07",
  "MP-10"
 ],
 "TEST-04": [
  "FAB-09",
  "ASSY-03",
  "TEST-06",
  "MP-10"
 ],
 "TEST-05": [
  "TEST-07",
  "TEST-09",
  "TEST-11",
  "MP-10"
 ],
 "TEST-06": [
  "FAB-09",
  "ASSY-03",
  "TEST-03",
  "TEST-10",
  "MP-07"
 ],
 "TEST-07": [
  "TEST-11",
  "TEST-10",
  "BU-06",
  "MP-07"
 ],
 "TEST-08": [
  "TEST-06",
  "TEST-07",
  "MP-07"
 ],
 "TEST-09": [
  "TEST-11",
  "TEST-10",
  "BU-08",
  "BU-10",
  "MP-03",
  "MP-05",
  "MP-11"
 ],
 "TEST-10": [
  "FAB-02",
  "MP-02",
  "MP-12"
 ],
 "TEST-11": [
  "MP-07",
  "MP-05",
  "MP-11"
 ],
 "BU-01": [
  "BU-02"
 ],
 "BU-02": [
  "BU-03",
  "BU-05",
  "MP-02"
 ],
 "BU-03": [
  "BU-04",
  "BU-06",
  "BU-05"
 ],
 "BU-04": [
  "BU-06",
  "BU-07",
  "BU-08",
  "BU-05",
  "BU-09"
 ],
 "BU-05": [
  "BU-09",
  "BU-11",
  "MP-02"
 ],
 "BU-06": [
  "BU-07",
  "BU-08",
  "BU-10",
  "BU-05",
  "BU-09",
  "MP-09"
 ],
 "BU-07": [
  "BU-10",
  "BU-09",
  "MP-11"
 ],
 "BU-08": [
  "BU-10",
  "BU-11",
  "MP-07",
  "MP-05",
  "MP-11"
 ],
 "BU-09": [
  "BU-11",
  "BU-12",
  "MP-11"
 ],
 "BU-10": [
  "BU-11",
  "MP-11"
 ],
 "BU-11": [
  "BU-12",
  "MP-12",
  "MP-08"
 ],
 "BU-12": [
  "MP-08",
  "MP-11"
 ],
 "MP-01": [
  "MP-03",
  "MP-04",
  "MP-06",
  "MP-12"
 ],
 "MP-02": [
  "MP-07",
  "MP-12",
  "MP-08"
 ],
 "MP-03": [
  "MP-02",
  "MP-12",
  "MP-11"
 ],
 "MP-04": [
  "MP-12",
  "MP-11"
 ],
 "MP-05": [
  "MP-02",
  "MP-07",
  "MP-12"
 ],
 "MP-06": [
  "MP-12",
  "MP-11"
 ],
 "MP-07": [
  "MP-10",
  "MP-12",
  "MP-08"
 ],
 "MP-08": [
  "MP-12"
 ],
 "MP-09": [
  "MP-12",
  "MP-11"
 ],
 "MP-10": [
  "MP-12",
  "MP-08"
 ],
 "MP-11": [
  "MP-12"
 ]
};

/** The activities a slip moves the programme through. */
export const criticalPathActivities: string[] = [
 "DEF-01",
 "DEF-03",
 "DEF-05",
 "DEF-07",
 "DEF-09",
 "ARCH-01",
 "ARCH-02",
 "ARCH-04",
 "ARCH-07",
 "ARCH-09",
 "ARCH-10",
 "TECH-01",
 "TECH-03",
 "TECH-04",
 "TECH-05",
 "PDK-01",
 "PDK-03",
 "PDK-05",
 "PDK-08",
 "PDK-09",
 "PDK-11",
 "PDK-13",
 "IPR-01",
 "IPR-03",
 "IPR-04",
 "IPR-05",
 "IPR-06",
 "IPR-09",
 "AMS-02",
 "AMS-03",
 "AMS-04",
 "AMS-09",
 "AMS-11",
 "AMS-12",
 "AMS-14",
 "AMS-16",
 "TC-01",
 "TC-02",
 "TC-04",
 "TC-05",
 "TC-07",
 "TC-08",
 "RTL-01",
 "RTL-03",
 "RTL-05",
 "RTL-07",
 "RTL-09",
 "RTL-10",
 "DV-01",
 "DV-02",
 "DV-04",
 "DV-05",
 "DV-07",
 "DV-08",
 "DV-12",
 "DFT-01",
 "DFT-05",
 "DFT-08",
 "DFT-10",
 "DFT-11",
 "SYN-01",
 "SYN-02",
 "SYN-05",
 "SYN-08",
 "SYN-11",
 "SYN-12",
 "PD-01",
 "PD-02",
 "PD-05",
 "PD-06",
 "PD-08",
 "PD-11",
 "PD-12",
 "PD-15",
 "SO-01",
 "SO-03",
 "SO-04",
 "SO-05",
 "SO-09",
 "SO-11",
 "TO-01",
 "TO-02",
 "TO-03",
 "TO-05",
 "TO-06",
 "TO-07",
 "TO-09",
 "TO-10",
 "FAB-01",
 "FAB-05",
 "FAB-06",
 "FAB-07",
 "FAB-09",
 "FAB-10",
 "PKGD-01",
 "PKGD-02",
 "PKGD-04",
 "PKGD-05",
 "PKGD-07",
 "PKGD-11",
 "PTV-01",
 "PTV-05",
 "PTV-06",
 "PTV-07",
 "PTV-08",
 "PTV-12",
 "SIPI-01",
 "SIPI-02",
 "SIPI-03",
 "SIPI-04",
 "SIPI-05",
 "SIPI-08",
 "SIPI-11",
 "ASSY-01",
 "ASSY-02",
 "ASSY-03",
 "ASSY-05",
 "ASSY-07",
 "ASSY-09",
 "ASSY-10",
 "EVB-01",
 "EVB-02",
 "EVB-05",
 "EVB-07",
 "EVB-10",
 "TEST-01",
 "TEST-04",
 "TEST-06",
 "TEST-08",
 "BU-01",
 "BU-02",
 "BU-04",
 "BU-05",
 "BU-06",
 "BU-11",
 "MP-01",
 "MP-02",
 "MP-03",
 "MP-07",
 "MP-08",
 "MP-12"
];

const WRITTEN = new Set(writtenActivities);

/** Whether an activity opens a page. */
export const hasActivityDetail = (id: string): boolean => WRITTEN.has(id);
