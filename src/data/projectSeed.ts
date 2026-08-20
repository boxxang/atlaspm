/**
 * /data/projectSeed.ts — AtlasAX1
 * 4nm-class AI inference accelerator, 2.5D + 2× HBM3.
 * Program is mid-PnR today; earlier stages closed, signoff
 * ramping, manufacturing/packaging logistics in flight.
 * All content is generic industry practice — nothing confidential.
 *
 * A factory, not a constant: every date is relative to the computed schedule
 * and to "now", both of which the caller supplies. Pure — no DOM, no clock of
 * its own unless you leave `now` off.
 */
import { addWeeks, type Schedule } from '@/lib/schedule';
import { journeyData } from './journey';
import { TEAM_SEEDS } from './teamSeeds';
import type {
  Contact,
  Deliverable,
  Item,
  Leader,
  StageContent,
  StageId,
  StatusUpdate,
} from './types';

/**
 * Illustrative man-months per engineering line, aligned to each stage's
 * engineeringView in /data/journey.ts. Like the rest of the seed these are
 * example figures for a large 4nm-class accelerator — roughly 700 man-months,
 * or 58 person-years — not a benchmark. A new program starts empty.
 */
export const SEED_EFFORT: Record<StageId, number[]> = {
  productDefinition: [2, 2, 1.5, 1.5, 1],
  architecture: [8, 6, 4, 4, 2],
  rtl: [40, 32, 18, 20, 10],
  verification: [60, 36, 30, 30, 24],
  synthesis: [10, 8, 6, 4, 2],
  physicalDesign: [28, 24, 30, 34, 24],
  signoff: [16, 12, 10, 6, 4],
  tapeout: [4, 3, 2, 1],
  fabrication: [2, 2, 1.5, 1.5, 1],
  packaging: [10, 8, 8, 6, 4],
  bringup: [12, 10, 10, 8, 5],
  qualification: [18, 14, 12, 8, 8],
};

/** Example fully-loaded rate for the seeded program; change it in the app. */
export const SEED_COST_PER_MAN_MONTH = 15000;

export interface ProjectSeed {
  projectName: string;
  content: Record<StageId, StageContent>;
  deliverables: Record<StageId, Deliverable[]>;
  leaders: Record<StageId, Leader>;
  contacts: Record<StageId, Contact[]>;
}

/** dlv entry: [title, done, due?, completedAt?] */
type DlvSeed = [title: string, done: boolean, due?: Date, completedAt?: Date];

interface ItemOpts {
  o?: string;
  due?: Date | null;
  dn?: boolean;
  ups?: StatusUpdate[];
  body?: string;
}

export function createProjectSeed({
  schedule,
  now = new Date(),
}: {
  schedule: Schedule;
  now?: Date;
}): ProjectSeed {
  const sc = schedule.stages;

  let _uid = 0;
  const uid = () => 'u' + ++_uid;

  const leaders = {} as Record<StageId, Leader>;
  const contacts = {} as Record<StageId, Contact[]>;
  journeyData.forEach((s, si) => {
    leaders[s.id] = { ...s.leader };
    contacts[s.id] = (TEAM_SEEDS[s.id] ?? []).map(([name, role], i) => ({
      id: uid(),
      name,
      role,
      email:
        name.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, '.') +
        '@example.com',
      phone: `+1 (408) 555-0${String(2 * si + i + 10).padStart(3, '0')}`,
    }));
  });

  const ago = (days: number, hrs = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    d.setHours(d.getHours() - hrs);
    return d;
  };
  const W = (stage: StageId, weeks: number) => addWeeks(sc[stage].start, weeks);
  const E = (stage: StageId) => new Date(sc[stage].end);
  const U = (days: number, text: string, hrs = 0): StatusUpdate => ({
    id: uid(),
    text,
    date: ago(days, hrs),
    attachments: [],
  });
  /* item factory: newest update first in `ups` */
  const I = (
    stage: StageId,
    t: string,
    { o, due = null, dn = false, ups = [], body = '' }: ItemOpts = {},
  ): Item => ({
    id: uid(),
    title: t,
    owner: o || leaders[stage].short,
    body,
    due,
    done: dn,
    updates: ups,
    attachments: [],
    updated: ups.length ? ups[0].date : dn ? E(stage) : ago(6),
  });

  const content = {} as Record<StageId, StageContent>;
  const deliverables = {} as Record<StageId, Deliverable[]>;

  const seed = (
    stage: StageId,
    {
      ki = [],
      acts = [],
      risks = [],
      dlv = [],
    }: { ki?: Item[]; acts?: Item[]; risks?: Item[]; dlv?: DlvSeed[] },
  ) => {
    content[stage] = { keyinfo: ki, activities: acts, risks };
    /* dlv entry: [title, done, due?, completedAt?] — due defaults to stage end,
       completedAt defaults to stage end for items seeded as done */
    deliverables[stage] = dlv.map(([title, done, due, comp]) => ({
      id: uid(),
      title,
      done,
      due: due !== undefined ? due : E(stage),
      completedAt: done ? (comp !== undefined ? comp : E(stage)) : null,
    }));
  };

    /* ---- 01 Product Definition — CLOSED ---- */
    seed("productDefinition", {
      ki: [
        I("productDefinition", "AtlasAX1: 4nm-class AI inference accelerator — 2.5D package, 2× HBM3, PCIe Gen5 x16 host"),
        I("productDefinition", "Program targets: 250 TOPS (INT8) at 75 W board power; ES samples committed to two anchor customers"),
        I("productDefinition", "Business case approved at exec review; BOM cost ceiling locked against Q3 forecast"),
      ],
      acts: [
        I("productDefinition", "Market & customer requirements analysis", { o: "N. Feld", due: W("productDefinition", 3), dn: true,
          ups: [U(203, "PRD v1.0 signed off by all stakeholders — requirements baseline frozen.")] }),
        I("productDefinition", "PPA & cost target definition", { o: "I. Brooks", due: E("productDefinition"), dn: true }),
        I("productDefinition", "Technology node & package feasibility", { o: "Seojin Ha", due: E("productDefinition"), dn: true }),
        I("productDefinition", "Program schedule baseline (Typical SoC profile)", { due: E("productDefinition"), dn: true }),
      ],
      risks: [],
      dlv: [["PRD v1.0 (signed off)", true], ["Target specification — PPA & cost", true], ["Feasibility & die-size report", true], ["Program charter & budget", true]],
    });

    /* ---- 02 Architecture — CLOSED ---- */
    seed("architecture", {
      ki: [
        I("architecture", "16-cluster NPU (≈16 TOPS/cluster) + dual-core management CPU + LPDDR5X sideband"),
        I("architecture", "NoC: 2D mesh, 512-bit links @ 1.2 GHz; HBM3 2 stacks — 819 GB/s aggregate bandwidth"),
        I("architecture", "Arch Freeze held with zero open P1 issues; PPA budgets allocated to all blocks"),
      ],
      acts: [
        I("architecture", "Workload modeling — LLM inference traces", { o: "L. Martins", due: W("architecture", 3), dn: true }),
        I("architecture", "Compute / memory partitioning & NoC topology", { o: "A. Bello", due: W("architecture", 4), dn: true }),
        I("architecture", "HBM3 + PCIe Gen5 IP selection", { o: "R. Kapoor", due: W("architecture", 5), dn: true,
          ups: [U(175, "IP contracts executed; PHY delivery schedule attached to vendor SOW.")] }),
        I("architecture", "Architecture specification v2.0", { due: E("architecture"), dn: true }),
      ],
      risks: [],
      dlv: [["Architecture spec v2.0", true], ["IP make/buy decision record", true], ["Interface & bandwidth budgets", true], ["Per-block PPA budgets", true]],
    });

    /* ---- 03 IP & RTL — CLOSED ---- */
    seed("rtl", {
      ki: [
        I("rtl", "Final top level: ~148M placeable instances, 41 clock domains, 212 memory instances"),
        I("rtl", "All third-party IP received — PCIe Gen5 PHY drop 3 (final) integrated"),
        I("rtl", "RTL Freeze declared week 19; ECO-only change control since"),
      ],
      acts: [
        I("rtl", "NPU cluster RTL & top integration", { o: "Jae Song", due: W("rtl", 9), dn: true }),
        I("rtl", "NoC & coherency fabric implementation", { due: W("rtl", 10), dn: true }),
        I("rtl", "Lint / CDC / RDC closure", { o: "M. Patel", due: W("rtl", 11), dn: true,
          ups: [U(112, "CDC closure complete — 0 waiver-pending crossings; report archived.")] }),
        I("rtl", "UPF power intent v1.2", { due: E("rtl"), dn: true }),
      ],
      risks: [],
      dlv: [["Block & top RTL (frozen)", true], ["Integration testbench", true], ["CDC / RDC closure reports", true], ["UPF v1.2", true]],
    });

    /* ---- 04 Verification — CLOSED ---- */
    seed("verification", {
      ki: [
        I("verification", "Coverage closure: 100% code / 96.4% functional (all waivers reviewed by arch)"),
        I("verification", "Regression: 14.2k tests nightly at peak; farm peaked at 5,800 slots"),
        I("verification", "3 late RTL bugs found post-freeze — all metal-fixable, none tapeout-blocking"),
      ],
      acts: [
        I("verification", "UVM env & sequences — NPU / NoC / HBM ctrl", { o: "D. Ruiz", due: W("verification", 8), dn: true }),
        I("verification", "Formal verification — arbiters & CSR blocks", { o: "S. Okafor", due: W("verification", 12), dn: true }),
        I("verification", "Gate-level simulation @ SS corner", { o: "L. Vogel", due: W("verification", 15), dn: true }),
        I("verification", "DV closure review & signoff", { due: E("verification"), dn: true,
          ups: [U(14, "DV signoff review complete; scoreboard archived. Two functional-coverage waivers approved by architecture.")] }),
      ],
      risks: [],
      dlv: [["Verification plan & closure report", true], ["Final coverage dashboard", true], ["GLS report (SS corner)", true], ["DV signoff memo", true]],
    });

    /* ---- 05 Synthesis — CLOSED ---- */
    seed("synthesis", {
      ki: [
        I("synthesis", "Netlist handoff week 24: 0 unmapped cells; −12 ns TNS budgeted for PD recovery"),
        I("synthesis", "Scan stitching 99.2% coverage; MBIST inserted on all 212 memories"),
      ],
      acts: [
        I("synthesis", "SDC v3 constraint set", { o: "P. Kral", due: W("synthesis", 2), dn: true }),
        I("synthesis", "DFT insertion — scan & MBIST", { o: "Y. Demir", due: W("synthesis", 3), dn: true }),
        I("synthesis", "Formal equivalence RTL ↔ netlist", { due: E("synthesis"), dn: true,
          ups: [U(42, "LEC clean on all partitions; handoff package delivered to PD.")] }),
      ],
      risks: [],
      dlv: [["Gate-level netlist r2", true], ["SDC v3", true], ["DFT insertion report", true], ["LEC report", true]],
    });

    /* ---- 06 Physical Design — IN PROGRESS (today) ---- */
    seed("physicalDesign", {
      ki: [
        I("physicalDesign", "Die 19.6 × 18.1 mm; 11 metal + RDL; utilization 68% post-CTS"),
        I("physicalDesign", "Timing today: NPU domain 1.2 GHz @ SS 0.675 V — WNS −41 ps / TNS −3.8 ns and improving"),
        I("physicalDesign", "Block-level closure: 14 of 16 NPU clusters closed; top-level route 82% complete"),
        I("physicalDesign", "ECO budget: two metal-only drops reserved before signoff (weeks 32 and 34)"),
      ],
      acts: [
        I("physicalDesign", "Floorplan rev C & macro placement", { o: "M. Bianchi", due: W("physicalDesign", 4), dn: true,
          ups: [U(21, "Rev C frozen — HBM PHY keep-outs finalized with the package team.")] }),
        I("physicalDesign", "Clock tree synthesis — compute clusters", { o: "J. Park", due: W("physicalDesign", 7), dn: true,
          ups: [U(9, "Global skew 38 ps → 22 ps after mesh rebalance on clusters 12–15.")] }),
        I("physicalDesign", "Top-level detailed routing", { o: "N. Coleman", due: W("physicalDesign", 10),
          body: "Full-chip detail route to DRC-clean. Crossbar region is the watch item.",
          ups: [U(2, "82% routed. NoC crossbar overflow down to 1.1% after link re-bundling — DRC-clean ETA Friday."),
                U(5, "Initial global route: 3.2% overflow concentrated in NoC crossbar; re-bundling NoC links with arch.")] }),
        I("physicalDesign", "Multi-corner timing closure", { o: "M. Bianchi", due: W("physicalDesign", 11),
          ups: [U(0, "WNS −86 → −41 ps at SS 0.675 V after CTS rebalance; hold clean at FF −40 °C.", 5)] }),
        I("physicalDesign", "PDN IR-drop analysis rev 2", { o: "I. Berg", due: ago(3),
          body: "Rev 2 with final package ball map. Blocking item for signoff entry.",
          ups: [U(3, "Blocked on updated package ball map — expected from package team today; escalated at PD standup.")] }),
        I("physicalDesign", "ECO drop 1 planning with DV / SYN", { due: W("physicalDesign", 11) }),
      ],
      risks: [
        I("physicalDesign", "Routing congestion — NoC crossbar region", { o: "N. Coleman",
          body: "Congestion could push DRC-clean past the ECO-1 window and compress signoff.",
          ups: [U(2, "Overflow 3.2% → 1.1% after NoC link re-bundling; monitoring daily during detail route.")] }),
        I("physicalDesign", "Hold closure at SS / −40 °C after CTS rework", { o: "J. Park",
          ups: [U(1, "Hold clean on 14/16 clusters after buffer insertion; remaining 2 clusters re-running tonight.")] }),
        I("physicalDesign", "IR-drop hotspot under compute clusters 9–12", { o: "I. Berg",
          body: "Worst dynamic IR 4.8% vs 5% budget — margin too thin for signoff.",
          ups: [U(3, "Interim mesh straps added: 4.8% → 4.1% in sims. Final answer needs the updated ball map.")] }),
      ],
      dlv: [
        ["Floorplan rev C", true, W("physicalDesign", 4), ago(21)],
        ["CTS implementation report", true, W("physicalDesign", 7), ago(9)],
        ["Routed database (DRC clean)", false, W("physicalDesign", 10)],
        ["Multi-corner timing closure report", false, W("physicalDesign", 11)],
        ["Pre-signoff IR/EM report", false, E("physicalDesign")],
      ],
    });

    /* ---- 07 Signoff — RAMPING ---- */
    seed("signoff", {
      ki: [
        I("signoff", "Corner list rev C agreed with foundry — 9 corners × 3 modes"),
        I("signoff", "Waiver review board scheduled Tue/Thu through the closure window"),
      ],
      acts: [
        I("signoff", "Signoff STA environment bring-up", { o: "R. Iyer", due: W("signoff", 2),
          ups: [U(4, "Signoff STA env validated against PD timing on 3 blocks — deltas under 5 ps.")] }),
        I("signoff", "Physical verification runset validation", { o: "S. Marin", due: W("signoff", 2) }),
        I("signoff", "EM / IR signoff preparation", { o: "T. Eriksen", due: W("signoff", 3) }),
      ],
      risks: [
        I("signoff", "Closure window compresses if PD route slips past week 32", { o: "T. Rivera",
          body: "Six-week signoff window assumes DRC-clean route at ECO-1. One week slip consumes the schedule buffer.",
          ups: [U(2, "Tracking PD route daily; go/no-go checkpoint with PD lead set for Monday.")] }),
      ],
      dlv: [
        ["Signoff STA env validation memo", true, W("signoff", 1), ago(4)],
        ["Full-chip DRC/LVS clean report", false, W("signoff", 4)],
        ["EM/IR signoff report", false, W("signoff", 5)],
        ["Timing signoff report", false, E("signoff")],
      ],
    });

    /* ---- 08 Tapeout — PLANNED ---- */
    seed("tapeout", {
      ki: [
        I("tapeout", "Mask order window: 3 business days after Go decision; foundry slot reserved"),
        I("tapeout", "Full-chip GDS assembly dry run scheduled week 33"),
      ],
      acts: [
        I("tapeout", "Tapeout checklist v0.9 baseline", { o: "B. Walsh", due: W("tapeout", -3),
          ups: [U(6, "Checklist v0.9 circulated — 12 items still owner-less; chasing in Friday program review.")] }),
        I("tapeout", "GDS assembly dry run", { o: "E. Sokolov", due: W("tapeout", -4) }),
      ],
      risks: [
        I("tapeout", "Mask slot vs closure schedule alignment", { o: "H. Yoon",
          body: "Reserved mask slot assumes Go decision on plan. Slip >1 week likely means requeueing." }),
      ],
      dlv: [["Tapeout checklist (all items closed)", false], ["GDSII release", false], ["Mask order confirmation", false]],
    });

    /* ---- 09 Fabrication — PLANNED ---- */
    seed("fabrication", {
      ki: [
        I("fabrication", "Hot-lot priority confirmed in writing for the first three lots"),
        I("fabrication", "Wafer acceptance (WAT) criteria rev B agreed with foundry"),
      ],
      acts: [
        I("fabrication", "Wafer logistics & export documentation", { o: "J. Adler", due: W("fabrication", 1) }),
        I("fabrication", "Weekly bring-up readiness sync (with BU team)", { o: "K. Weiss" }),
      ],
      risks: [],
      dlv: [["First-silicon wafers out", false], ["WAT / PCM data report", false], ["Wafer acceptance memo", false]],
    });

    /* ---- 10 Advanced Packaging — LOGISTICS IN FLIGHT ---- */
    seed("packaging", {
      ki: [
        I("packaging", "Substrate PO placed week 12 (20-week lead) — arrival aligned to wafer-out"),
        I("packaging", "Interposer test-vehicle assembly passed; warpage within spec"),
      ],
      acts: [
        I("packaging", "Known-good-die test program", { o: "L. Zhang", due: W("packaging", -6),
          ups: [U(7, "KGD coverage at 96.8% — closing the last scan chains to hit the 98% gate before stacking.")] }),
        I("packaging", "Thermal solution validation (TIM selection)", { o: "F. Ade", due: W("packaging", 2) }),
      ],
      risks: [
        I("packaging", "HBM3 allocation for qual builds unconfirmed", { o: "Y. Tanaka",
          body: "ES build quantities are covered; qualification build allocation is still verbal only.",
          ups: [U(1, "Supplier call: allocation letter expected next week; qual quantities committed verbally.")] }),
        I("packaging", "Substrate arrival buffer only 1 week vs wafer-out", { o: "Y. Tanaka" }),
      ],
      dlv: [["Assembled ES units", false], ["KGD test program (98% gate)", false], ["Assembly yield report", false], ["Thermal validation report", false]],
    });

    /* ---- 11 Bring-up — PREP ---- */
    seed("bringup", {
      ki: [
        I("bringup", "Evaluation board rev A at CM — delivery aligned 6 weeks before first packaged parts"),
        I("bringup", "Lab slots and instruments reserved for the full bring-up window"),
      ],
      acts: [
        I("bringup", "Bring-up plan & smoke test suite", { o: "D. Levi", due: W("bringup", -4) }),
        I("bringup", "Debug access validation — JTAG & on-die trace", { o: "M. Richter", due: W("bringup", -2) }),
      ],
      risks: [],
      dlv: [["Bring-up report", false], ["Characterization data pack", false], ["Errata list r0", false]],
    });

    /* ---- 12 Qualification & Production — PLANNED ---- */
    seed("qualification", {
      ki: [
        I("qualification", "Qualification per JEDEC-based plan — HTOL 1000 h, TC 700 cycles"),
        I("qualification", "Ramp staged over three quarters; capacity LOI signed with foundry/OSAT"),
      ],
      acts: [
        I("qualification", "Qualification vehicle build plan", { o: "O. Price", due: W("qualification", -4) }),
        I("qualification", "Production test time budget", { o: "G. Holt", due: W("qualification", 2) }),
      ],
      risks: [],
      dlv: [["Qualification report", false], ["Production test release", false], ["Ramp readiness review", false]],
    });
  return { projectName: 'AtlasAX1', content, deliverables, leaders, contacts };
}
