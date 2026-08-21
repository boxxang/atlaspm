/**
 * /data/teamSeeds.ts — working-level engineering contacts per stage (fictional).
 * [name, role]; email and phone are derived at seed time.
 */
import type { StageId } from './types';

export const TEAM_SEEDS: Partial<
  Record<StageId, readonly (readonly [string, string])[]>
> = {
  technology: [["Ines Moreau", "Foundry engagement"], ["Bo Lindqvist", "Wafer & NRE costing"]],
  pdk: [["Ravi Shankar", "PDK & rule decks"], ["Elin Dahl", "Library qualification"], ["Peter Voss", "EDA tool qualification"]],
  ipReadiness: [["Amara Nwosu", "IP evaluation"], ["Tomasz Lis", "Vendor management"]],
  amsIp: [["Sylvie Roche", "PLL & clocking"], ["Hyunwoo Baek", "SerDes / PHY"], ["Marta Ferreira", "Custom memory design"], ["Gil Amrani", "Analog layout"]],
  testChip: [["Ola Bergstrom", "Test chip integration"], ["Ravi Nair", "Silicon characterization"]],
  dft: [["Yusuf Demir", "Scan & compression"], ["Anja Keller", "MBIST & repair"], ["Tarek Haddad", "ATPG"]],
  packageDesign: [["Aya Nakamura", "Interposer integration"], ["Carlos Vega", "Substrate design"], ["Femi Ade", "Thermal & mechanical"]],
  packageTestVehicle: [["Sunita Rege", "Vehicle build & DOE"], ["Piotr Zieba", "Reliability testing"]],
  chipPackageCoVerification: [["Hannah Storm", "PDN co-analysis"], ["Rui Alves", "Channel simulation"]],
  validationHardware: [["Max Richter", "Board design"], ["Ana Sousa", "PCB layout & SI"], ["Jonas Ek", "Lab infrastructure"]],
  testDevelopment: [["Grace Holt", "Test program development"], ["Ken Abe", "Probe card & load board"], ["Nadia Petrov", "Test data & yield"]],
  productDefinition: [["Nora Feld", "Market & requirements analysis"], ["Ian Brooks", "Cost / die-size modeling"], ["Seojin Ha", "Feasibility studies"]],
  architecture: [["Leo Martins", "System modeling & workloads"], ["Aisha Bello", "Interconnect / NoC architecture"], ["Tim Nguyen", "Memory subsystem"], ["Rhea Kapoor", "IP evaluation"]],
  rtl: [["Jae Song", "Top-level integration"], ["Mira Patel", "Lint / CDC / RDC"], ["Ken Watanabe", "Third-party IP interface"], ["Olga Petrova", "Build & CI infrastructure"]],
  verification: [["Diego Ruiz", "UVM environment"], ["Hana Cho", "Coverage & regression"], ["Sam Okafor", "Formal verification"], ["Lena Vogel", "Gate-level simulation"], ["Arjun Mehta", "Emulation platform"]],
  synthesis: [["Petra Kral", "Synthesis flow & constraints"], ["Yusuf Demir", "DFT / scan insertion"], ["Claire Fontaine", "PPA analysis"]],
  physicalDesign: [["Marco Bianchi", "Floorplan & placement"], ["Jiwoo Park", "Clock tree synthesis"], ["Nate Coleman", "Routing & DRC convergence"], ["Ingrid Berg", "Power delivery network"]],
  signoff: [["Ravi Iyer", "STA / timing signoff"], ["Sofia Marin", "Physical verification"], ["Tom Eriksen", "EM / IR analysis"]],
  tapeout: [["Elena Sokolov", "GDS assembly & release"], ["Brian Walsh", "Tapeout checklist & QA"], ["Mai Tran", "Mask data preparation"]],
  fabrication: [["Kurt Weiss", "Foundry program interface"], ["Priti Rao", "Process & WAT data"], ["Josh Adler", "Wafer logistics"]],
  packaging: [["Aya Nakamura", "Interposer integration"], ["Carlos Vega", "SI / PI analysis"], ["Femi Ade", "Thermal & mechanical"], ["Lucy Zhang", "OSAT program"]],
  bringup: [["Max Richter", "Board & lab infrastructure"], ["Dana Levi", "Functional validation"], ["Vik Sharma", "Characterization"], ["Emma Toth", "Failure analysis"]],
  qualification: [["Owen Price", "Reliability stress testing"], ["Sunita Nair", "Yield analysis"], ["Greg Holt", "Production test"], ["Ines Duarte", "Quality & ramp"]],
};
