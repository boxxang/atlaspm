/**
 * /data/stageNotes.ts — key-info notes every new program starts with.
 *
 * Reference material a PM reaches for on every program, written once here and
 * placed on a new program's stage when it is created. A note belongs to the
 * built-in stage it is about (`baseKey`), so it lands on that stage whatever
 * the program's template calls it, and a program that does not run the stage
 * does not get the note.
 *
 * Stored as a note's text: the first line is its title, the rest its body.
 */

export interface StageNoteSeed {
  /** Stable name for the note, part of its id on each program. */
  key: string;
  /** The built-in stage the note is about. */
  baseKey: string;
  text: string;
}

export const STAGE_NOTES: readonly StageNoteSeed[] = [
  {
    key: 'netlist-maturity',
    baseKey: 'physicalDesign',
    text: [
      'Netlist drop maturity criteria — N0 → N1 → N2 → FFN',
      'Typical entry criteria for each netlist drop handed from synthesis to physical design. The numbers are starting points: agree this program’s own with the synthesis lead before N1.',
      '',
      'N0 — flow-flush netlist (early, not correct)',
      '- RTL: early; stubbed blocks allowed',
      '- Hierarchy / macros / IP: final hierarchy; macros at the right size and location (models or placeholders)',
      '- SDC: bootstrap — main clocks and basic I/O only',
      '- UPF: none, or a power-domain skeleton',
      '- DFT: none, or scan stubs',
      '- Synthesis: fast recipe, not physical-aware',
      '- Equivalence: not required',
      '- Netlist checks: black boxes allowed, listed',
      '- Timing QoR: not judged',
      '- Area: roughly right (±20%)',
      '- Handed over: netlist, draft SDC, macro views, issue list',
      '- PD uses it to: prove the flow runs end to end',
      '',
      'N1 — first quality drop (the baseline)',
      '- RTL: feature-complete (~90%); no major architectural change left',
      '- Hierarchy / macros / IP: real macro views (LEF/LIB); IP may be preliminary',
      '- SDC: all clocks and generated clocks; draft I/O budgets; exceptions partial',
      '- UPF: power domains, isolation and retention defined',
      '- DFT: scan inserted, MBIST wrappers',
      '- Synthesis: physical-aware with the floorplan; most optimizations on',
      '- Equivalence: run; every non-equivalence explained',
      '- Netlist checks: no unresolved references except listed IP',
      '- Timing QoR: WNS within −10 to −20% of the clock period; TNS baseline recorded',
      '- Area: within ±10% of the floorplan budget',
      '- Handed over: + synthesis QoR report, delta report against N0',
      '- PD uses it for: turn 1 — placement, optimization, CTS; the QoR baseline',
      '',
      'N2 — last structurally changeable drop (predicts the final turn)',
      '- RTL: code-freeze candidate; bug fixes only',
      '- Hierarchy / macros / IP: final IP versions',
      '- SDC: complete — false paths, multicycles and CDC constraints reviewed',
      '- UPF: complete; static low-power checks clean',
      '- DFT: fully inserted — scan, compression, MBIST, JTAG; DFT DRC clean',
      '- Synthesis: final recipe with power, low-power and physical optimizations',
      '- Equivalence: clean',
      '- Netlist checks: zero unresolved references, multiple or undriven drivers',
      '- Timing QoR: WNS within −5% of the clock period; remaining violations explained',
      '- Area: within ±5%',
      '- Handed over: + delta report, closure risk statement, issue list carried forward',
      '- PD uses it for: turn 2 — full route and real closure',
      '',
      'FFN — final full netlist (functional freeze, release-tagged)',
      '- RTL: freeze declared; DV regressions passing',
      '- Hierarchy / macros / IP: signed-off IP versions, locked',
      '- SDC: frozen and validated — no changes after this',
      '- UPF: frozen; equivalence clean including low power',
      '- DFT: final; ATPG coverage estimate in hand',
      '- Synthesis: the N2 recipe, unchanged',
      '- Equivalence: clean against the frozen, verified RTL',
      '- Netlist checks: all zero',
      '- Timing QoR: synthesis targets met with margin for PD; exceptions waived in writing',
      '- Area: final',
      '- Handed over: + release tag, functional freeze declaration, equivalence report',
      '- PD uses it for: the final turn — full closure, then the signoff database handoff',
      '',
      'Rules that decide it',
      '- N0 is only worth anything early. An N0 held until it is good has become N1, and the PD flow is still unproven.',
      '- Do not take N1 from RTL that is not worth synthesizing: the baseline means nothing and turn 1 chases a moving target.',
      '- PD feedback from flow setup must reach synthesis before N1 is run, not after it is released.',
      '- Do not switch every optimization on for the first time at N2 — nobody can attribute the QoR change.',
      '- Carry the issue list forward, or N2 rediscovers what N1 already found.',
      '- An optimistic closure risk statement at N2 throws away the last cheap chance to trade frequency or features.',
      '- Release the FFN only against RTL that is actually frozen, and freeze the constraints with it.',
      '- Functional ECOs after the FFN happen, but must be exceptional, visible and costed.',
      '- Run equivalence from N1 on, and against the verified RTL — not only against the FFN.',
    ].join('\n'),
  },
];
