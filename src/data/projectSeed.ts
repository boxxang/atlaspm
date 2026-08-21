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
 * Man-months and elapsed weeks per engineering activity. Both are the
 * template's own figures (/data/journey.ts), lifted here so the seeder can
 * write them without reaching into content it does not own — and so they can
 * never drift out of alignment with the activity list they index.
 */
export const SEED_EFFORT: Record<StageId, number[]> = Object.fromEntries(
  journeyData.map((s) => [s.id, [...s.engineeringEffort]]),
);

export const SEED_TAT: Record<StageId, number[]> = Object.fromEntries(
  journeyData.map((s) => [s.id, [...s.engineeringTat]]),
);

export const SEED_COST_PER_MAN_MONTH = 15000;

export interface ProjectSeed {
  projectName: string;
  content: Record<StageId, StageContent>;
  deliverables: Record<StageId, Deliverable[]>;
  leaders: Record<StageId, Leader>;
  contacts: Record<StageId, Contact[]>;
}

/** dlv entry: [title, done, due?, completedAt?] */
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
    { ki = [], acts = [], risks = [] }: { ki?: Item[]; acts?: Item[]; risks?: Item[] } = {},
  ) => {
    content[stage] = { keyinfo: ki, activities: acts, risks };
    /* The stage's key deliverables are the template's — every program starts
       with the same list — and they are dated the way a stage actually runs
       rather than at even intervals across it.
       
       A stage opens with a plan or a spec, which lands early and alone. What
       follows spreads out, and then the last few bunch against the gate,
       because the gate is what they are for: the review reads the closing
       artefacts together. So the fractions are eased toward the end rather
       than divided evenly, and each carries a couple of days of drift so the
       dates read as dates rather than as arithmetic.
       
       Anything due more than three weeks ago reads as done; the recent ones
       stay open, which is what leaves the program with a handful of genuinely
       overdue lines. Slips are the common case, so the completion drift runs
       late more often than early. */
    const titles = journeyData.find((s) => s.id === stage)?.deliverables ?? [];
    const span = sc[stage].durationWeeks;
    const settled = ago(21);
    const drift = [2, -1, 5, 0, 3, -2, 8, 1, -3, 4];
    const jitter = [0, 3, -2, 1, -3, 2, 0, -1, 4, -2, 1, 3];
    /** The first artefact lands a fifth of the way in; the last on the gate. */
    const OPENS_AT = 0.2;
    /** Below 1, so the gaps close as the stage runs down to its review. */
    const EASE = 0.75;
    deliverables[stage] = titles.map((title, i) => {
      const t = titles.length > 1 ? (i / (titles.length - 1)) ** EASE : 1;
      const due = W(stage, span * (OPENS_AT + (1 - OPENS_AT) * t));
      /* a couple of days either way, never enough to reorder the list */
      due.setDate(due.getDate() + jitter[i % jitter.length]);
      const done = due < settled;
      let completedAt: Date | null = null;
      if (done) {
        const c = new Date(due);
        c.setDate(c.getDate() + drift[i % drift.length]);
        c.setHours(16, 30, 0, 0);
        completedAt = c;
      }
      /* Seeded completions predate the delivery record — they are history,
         not filings. The rule that a tick needs an artefact applies to what
         is filed from here on; see saveDeliverableRecord. */
      return { id: uid(), title, done, due, completedAt, note: '', attachments: [] };
    });

    /* Every activity is work towards something, and in a schedule that
       something is the next artefact its own date feeds: the first deliverable
       due on or after the activity is due. Real programs are messier than that
       — an activity can serve two — but a seed has to pick, and picking by the
       schedule is at least a rule anyone can check against the dates in front
       of them. Work due past the last deliverable is towards none of them. */
    const dated = deliverables[stage].filter((d) => d.due);
    for (const a of acts) {
      if (!a.due) continue;
      const towards = dated.find((d) => d.due! >= a.due!);
      if (towards) a.deliverableId = towards.id;
    }
  };

    /* ---- 01 Product Definition — CLOSED ----
     Carries a full dozen on each board; the other stages keep the shorter
     lists, so one stage shows what a busy board looks like and the rest do not
     have to. */
  seed("productDefinition", {
    ki: [
      I("productDefinition", "AtlasAX1: 4nm-class AI inference accelerator — 2.5D package, 2× HBM3, PCIe Gen5 x16 host"),
      I("productDefinition", "Program targets: 250 TOPS (INT8) at 75 W board power; ES samples committed to two anchor customers"),
      I("productDefinition", "Business case approved at exec review; BOM cost ceiling locked against Q3 forecast"),
      I("productDefinition", "Process node fixed at N4P; a node change resets the cost model and the schedule baseline"),
      I("productDefinition", "Package technology decision deferred to Architecture — 2.5D interposer is the working assumption"),
      I("productDefinition", "Two anchor customers signed early-access agreements; ES quantities are contractual"),
      I("productDefinition", "Competitor launch expected two quarters after our mass production date"),
      I("productDefinition", "Initial die size estimate 19–21 mm per side, carrying ±15% until floorplan"),
      I("productDefinition", "IP licensing budget approved; PCIe Gen5 PHY and HBM3 controller are buy, not build"),
      I("productDefinition", "Program staffing plan approved at 80% of request — verification is the shortfall"),
      I("productDefinition", "Schedule baseline uses the Typical SoC profile; 132 weeks kickoff to mass production"),
      I("productDefinition", "Board power envelope 75 W is a customer requirement, not an engineering target"),
    ],
    acts: [
      I("productDefinition", "Market & customer requirements analysis", { o: "N. Feld", due: W("productDefinition", 3), dn: true,
        ups: [U(203, "PRD v1.0 signed off by all stakeholders — requirements baseline frozen.")] }),
      I("productDefinition", "PPA & cost target definition", { o: "I. Brooks", due: E("productDefinition"), dn: true }),
      I("productDefinition", "Technology node & package feasibility", { o: "Seojin Ha", due: E("productDefinition"), dn: true }),
      I("productDefinition", "Program schedule baseline (Typical SoC profile)", { due: E("productDefinition"), dn: true }),
      I("productDefinition", "Competitive benchmarking — inference TOPS/W", { o: "N. Feld", due: W("productDefinition", 2), dn: true,
        ups: [U(210, "Benchmarked four competing parts; our TOPS/W target sits mid-pack at launch.")] }),
      I("productDefinition", "Memory bandwidth requirement study", { o: "I. Brooks", due: W("productDefinition", 2), dn: true }),
      I("productDefinition", "Die size & wafer cost model v2", { o: "I. Brooks", due: W("productDefinition", 3), dn: true,
        ups: [U(198, "Cost model rebuilt on N4P wafer pricing; BOM lands 6% under ceiling.")] }),
      I("productDefinition", "Third-party IP make/buy shortlist", { o: "Seojin Ha", due: W("productDefinition", 3), dn: true }),
      I("productDefinition", "Feasibility gate review pack", { o: "Seojin Ha", due: W("productDefinition", 3), dn: true }),
      I("productDefinition", "Business case & exec approval", { due: E("productDefinition"), dn: true,
        ups: [U(196, "Approved at exec staff review; budget released against the 132-week baseline.")] }),
      I("productDefinition", "Program charter & staffing plan", { due: E("productDefinition"), dn: true }),
      I("productDefinition", "Anchor customer requirement interviews", { o: "N. Feld", due: W("productDefinition", 2), dn: true }),
    ],
    risks: [
      I("productDefinition", "Requirements not signed off by all stakeholders", { o: "N. Feld" }),
      I("productDefinition", "Business case sensitive to wafer cost assumptions", { o: "I. Brooks" }),
      I("productDefinition", "N4P PDK maturity uncertain at program start", { o: "Seojin Ha" }),
      I("productDefinition", "Competitive window shifts during definition", { o: "N. Feld" }),
      I("productDefinition", "Staffing plan approved below request", {}),
      I("productDefinition", "Third-party IP licensing terms open at gate", { o: "Seojin Ha" }),
      I("productDefinition", "Board power envelope leaves no thermal margin", { o: "I. Brooks" }),
      I("productDefinition", "Die size estimate carries ±15% into architecture", { o: "I. Brooks" }),
      I("productDefinition", "Package decision deferred out of this stage", { o: "Seojin Ha" }),
      I("productDefinition", "HBM3 supply commitments not secured at definition", {}),
      I("productDefinition", "ES sample dates are contractual, not best-effort", { o: "N. Feld" }),
      I("productDefinition", "Schedule baseline assumes no respin", {}),
    ],
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
    });

    /* ---- 03 Technology & Foundry Selection — CLOSED ---- */
    seed("technology", {
      ki: [
        I("technology", "N4P selected over N5P on density and leakage; HPC flavour with the multi-Vt menu"),
        I("technology", "Design agreement and NDA executed; tapeout slot reserved with hot-lot priority"),
      ],
      acts: [
        I("technology", "DTCO benchmarking against PPA targets", { o: "R. Lange", due: W("technology", 7), dn: true }),
        I("technology", "Wafer, mask and NRE quotation", { o: "R. Lange", due: E("technology"), dn: true }),
      ],
      risks: [],
    });

    /* ---- 04 PDK & Design Enablement — CLOSED ---- */
    seed("pdk", {
      ki: [
        I("pdk", "Production PDK adopted at week 26; the 0.5 → 1.0 delta reopened two timing corners"),
        I("pdk", "Memory compiler instances missed the L2 density budget — custom array path opened"),
      ],
      acts: [
        I("pdk", "EDA tool version qualification for N4P", { o: "A. Mehta", due: W("pdk", 18), dn: true }),
        I("pdk", "Signoff corner and derate definition with foundry", { o: "A. Mehta", due: W("pdk", 24), dn: true,
          ups: [U(120, "Corner list rev A agreed: 9 corners × 3 modes, POCV derates from the foundry deck.")] }),
      ],
      risks: [],
    });

    /* ---- 05 IP Strategy & Readiness — CLOSED ---- */
    seed("ipReadiness", {
      ki: [
        I("ipReadiness", "IP-BOM: 31 blocks — 18 reuse, 9 buy, 4 build. PCIe Gen5 PHY and HBM3 controller are buy"),
        I("ipReadiness", "Two bought blocks were not silicon-proven on N4P; both carry a hardening schedule"),
      ],
      acts: [
        I("ipReadiness", "Silicon-proven status check per IP on N4P", { o: "S. Ha", due: W("ipReadiness", 12), dn: true }),
        I("ipReadiness", "Licence negotiation and PO issue", { o: "S. Ha", due: E("ipReadiness"), dn: true,
          ups: [U(150, "All IP POs issued; vendor delivery dates folded into the RTL integration plan.")] }),
      ],
      risks: [],
    });

    /* ---- 06 Custom, AMS & Memory IP — CLOSED ---- */
    seed("amsIp", {
      ki: [
        I("amsIp", "Custom L2 SRAM instance built after the compiler missed density by 14%"),
        I("amsIp", "PLL and HBM PHY macros handed to PD ahead of floorplan; abstracts landed week 51"),
      ],
      acts: [
        I("amsIp", "Custom array layout and pushed-rule DRC closure", { o: "L. Bisset", due: W("amsIp", 32), dn: true,
          ups: [U(96, "Pushed rules approved by the foundry; array meets the density budget with 3% margin.")] }),
        I("amsIp", "Sigma-Vmin and Monte Carlo margin analysis", { o: "L. Bisset", due: W("amsIp", 36), dn: true }),
      ],
      risks: [],
    });

    /* ---- 07 Test Chip / MPW Shuttle — CLOSED ---- */
    seed("testChip", {
      ki: [
        I("testChip", "Shuttle carried the HBM PHY, the custom array and PCM structures"),
        I("testChip", "Silicon correlated within 6% of post-layout simulation; no production design change"),
      ],
      acts: [
        I("testChip", "Silicon characterisation and model correlation", { o: "I. Sollberg", due: W("testChip", 34), dn: true }),
        I("testChip", "Margin decisions fed into the production design", { o: "I. Sollberg", due: E("testChip"), dn: true }),
      ],
      risks: [],
    });

    /* ---- 10 DFT Architecture — CLOSED ---- */
    seed("dft", {
      ki: [
        I("dft", "Hierarchical DFT with 120× compression; stuck-at coverage 99.1%, transition 92.4%"),
        I("dft", "On-chip clock controllers per cluster for at-speed test; IJTAG network for debug"),
      ],
      acts: [
        I("dft", "ATPG pattern generation and coverage closure", { o: "O. Bradley", due: W("dft", 32), dn: true }),
        I("dft", "Pattern validation by gate-level simulation", { o: "O. Bradley", due: E("dft"), dn: true,
          ups: [U(60, "Patterns validated on the final netlist; STIL handed to test development.")] }),
      ],
      risks: [],
    });

    /* ---- 16 Package & Substrate Design — IN FLIGHT ---- */
    seed("packageDesign", {
      ki: [
        I("packageDesign", "2.5D on a silicon interposer; 6-2-6 organic substrate, 55×55 mm body"),
        I("packageDesign", "Substrate PO placed against a 20-week lead time — arrival aligned to wafer-out"),
      ],
      acts: [
        I("packageDesign", "Bump map and power-ground planning with PD", { o: "Y. Tanaka", due: W("packageDesign", 16), dn: true }),
        I("packageDesign", "Package design freeze, DRC and tooling release", { o: "Y. Tanaka", due: E("packageDesign"),
          ups: [U(3, "Freeze holds pending the last bump map delta from the PD final turn.")] }),
      ],
      risks: [
        I("packageDesign", "Substrate arrival buffer only two weeks against wafer-out", { o: "Y. Tanaka" }),
      ],
    });

    /* ---- 17 Package Test Vehicle — IN FLIGHT ---- */
    seed("packageTestVehicle", {
      ki: [
        I("packageTestVehicle", "MTV, TTV and daisy-chain vehicles built on the production substrate stack"),
        I("packageTestVehicle", "Package validation must close before wafer-out — ten weeks of margin in the plan"),
      ],
      acts: [
        I("packageTestVehicle", "Warpage measurement across the reflow profile", { o: "N. Farouk", due: W("packageTestVehicle", 34), dn: true,
          ups: [U(14, "Warpage peaks at 118 µm at 245 °C — inside the 150 µm limit across all four corners.")] }),
        I("packageTestVehicle", "CPI stress evaluation — ULK crack and bump integrity", { o: "N. Farouk", due: W("packageTestVehicle", 44) }),
      ],
      risks: [
        I("packageTestVehicle", "Board-level reliability finishes four weeks before the wafer-out gate", { o: "N. Farouk" }),
      ],
    });

    /* ---- 18 Chip-Package-System Co-Verification — IN FLIGHT ---- */
    seed("chipPackageCoVerification", {
      ki: [
        I("chipPackageCoVerification", "Co-verification signs off before signoff closes — the precondition for releasing mask data"),
        I("chipPackageCoVerification", "Chip power model released per domain from the PD turn-2 database"),
      ],
      acts: [
        I("chipPackageCoVerification", "Die-package-board PDN co-simulation", { o: "V. Halvorsen", due: W("chipPackageCoVerification", 16),
          ups: [U(2, "Package inductance adds 0.9% to worst dynamic IR; decap budget under review with PD.")] }),
        I("chipPackageCoVerification", "HBM and PCIe channel compliance with extracted models", { o: "V. Halvorsen", due: W("chipPackageCoVerification", 22) }),
      ],
      risks: [
        I("chipPackageCoVerification", "Dynamic IR margin thins once package inductance is included", { o: "V. Halvorsen",
          body: "Die-only analysis showed 4.1%; with the package model it reads 5.0% against a 5% budget." }),
      ],
    });

    /* ---- 20 Validation Hardware / EVB — IN FLIGHT ---- */
    seed("validationHardware", {
      ki: [
        I("validationHardware", "EVB rev A at the CM; rev B planned against bring-up findings"),
        I("validationHardware", "Board must be shaken out before first packaged parts arrive"),
      ],
      acts: [
        I("validationHardware", "PCB layout with high-speed channel SI/PI simulation", { o: "C. Whitfield", due: W("validationHardware", 22) }),
        I("validationHardware", "Debug infrastructure — JTAG and trace pods", { o: "C. Whitfield", due: W("validationHardware", 28) }),
      ],
      risks: [],
    });

    /* ---- 21 Test Development — IN FLIGHT ---- */
    seed("testDevelopment", {
      ki: [
        I("testDevelopment", "Probe card carries a twenty-week lead time — ordered against the wafer-out date"),
        I("testDevelopment", "Sort and final programs built on the DFT pattern release"),
      ],
      acts: [
        I("testDevelopment", "Probe card design, fabrication and qualification", { o: "D. Jo", due: W("testDevelopment", 20),
          ups: [U(5, "Probe card design frozen and released to the vendor; qualification slot booked.")] }),
        I("testDevelopment", "Wafer sort test program development", { o: "D. Jo", due: W("testDevelopment", 30) }),
      ],
      risks: [
        I("testDevelopment", "Probe card qualification lands two weeks before wafer sort", { o: "D. Jo" }),
      ],
    });

  /* A stage with no hand-written boards still owes its deliverables, so the
     backfill runs the same seeder with empty boards rather than leaving holes
     the UI would have to guard against. */
  for (const st of journeyData) if (!content[st.id]) seed(st.id);

  return { projectName: 'AtlasAX1', content, deliverables, leaders, contacts };
}
