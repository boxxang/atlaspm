/**
 * /data/stageNotes.ts — key-info notes every new program starts with.
 *
 * Reference material a PM reaches for on every program, written once here and
 * placed on a new program's stage when it is created. A note belongs to the
 * built-in stage it is about (`baseKey`), so it lands on that stage whatever
 * the program's template calls it, and a program that does not run the stage
 * does not get the note.
 *
 * Written as blocks — paragraphs, headings, bullet lists and tables — which
 * /lib/stageNotes.ts turns into the note's document and its plain text.
 */

export type NoteBlock =
  | { p: string }
  | { h: string }
  | { bullets: readonly string[] }
  | { table: { head: readonly string[]; rows: readonly (readonly string[])[] } };

export interface StageNoteSeed {
  /** Stable name for the note, part of its id on each program. */
  key: string;
  /** The built-in stage the note is about. */
  baseKey: string;
  title: string;
  blocks: readonly NoteBlock[];
}

export const STAGE_NOTES: readonly StageNoteSeed[] = [
  {
    key: 'netlist-maturity',
    baseKey: 'physicalDesign',
    title: 'Netlist drop maturity criteria — N0 → N1 → N2 → FFN',
    blocks: [
      {
        p: 'Typical entry criteria for each netlist drop handed from synthesis to physical design. The numbers are starting points: agree this program’s own with the synthesis lead before N1.',
      },
      {
        table: {
          head: ['Criterion', 'N0 — flow-flush netlist', 'N1 — first quality drop', 'N2 — last structural drop', 'FFN — final full netlist'],
          rows: [
            ['RTL', 'Early; stubbed blocks allowed', 'Feature-complete (~90%); no major architectural change left', 'Code-freeze candidate; bug fixes only', 'Freeze declared; DV regressions passing'],
            ['Hierarchy / macros / IP', 'Final hierarchy; macros at the right size and location (models or placeholders)', 'Real macro views (LEF/LIB); IP may be preliminary', 'Final IP versions', 'Signed-off IP versions, locked'],
            ['SDC', 'Bootstrap — main clocks and basic I/O', 'All clocks and generated clocks; draft I/O budgets; exceptions partial', 'Complete — false paths, multicycles and CDC reviewed', 'Frozen and validated'],
            ['UPF', 'None, or a power-domain skeleton', 'Domains, isolation and retention defined', 'Complete; static low-power checks clean', 'Frozen; low-power equivalence clean'],
            ['DFT', 'None, or scan stubs', 'Scan inserted, MBIST wrappers', 'Scan, compression, MBIST, JTAG; DFT DRC clean', 'Final; ATPG coverage estimate in hand'],
            ['Synthesis', 'Fast recipe, not physical-aware', 'Physical-aware with the floorplan; most optimizations on', 'Final recipe — power, low-power and physical optimizations', 'The N2 recipe, unchanged'],
            ['Equivalence', 'Not required', 'Run; every non-equivalence explained', 'Clean', 'Clean against the frozen, verified RTL'],
            ['Netlist checks', 'Black boxes allowed, listed', 'No unresolved references except listed IP', 'Zero unresolved references, multiple or undriven drivers', 'All zero'],
            ['Timing QoR', 'Not judged', 'WNS within −10 to −20% of the clock period; TNS baseline recorded', 'WNS within −5% of the period; remaining violations explained', 'Synthesis targets met with margin for PD; exceptions waived in writing'],
            ['Area', 'Roughly right (±20%)', 'Within ±10% of the floorplan budget', 'Within ±5%', 'Final'],
            ['Handed over', 'Netlist, draft SDC, macro views, issue list', '+ synthesis QoR report, delta report against N0', '+ delta report, closure risk statement, issue list carried forward', '+ release tag, functional freeze declaration, equivalence report'],
            ['PD uses it for', 'Proving the flow runs end to end', 'Turn 1 — placement, optimization, CTS; the QoR baseline', 'Turn 2 — full route and real closure', 'The final turn — full closure, then the signoff database handoff'],
          ],
        },
      },
      { h: 'Rules that decide it' },
      {
        bullets: [
          'N0 is only worth anything early. An N0 held until it is good has become N1, and the PD flow is still unproven.',
          'Do not take N1 from RTL that is not worth synthesizing: the baseline means nothing and turn 1 chases a moving target.',
          'PD feedback from flow setup must reach synthesis before N1 is run, not after it is released.',
          'Do not switch every optimization on for the first time at N2 — nobody can attribute the QoR change.',
          'Carry the issue list forward, or N2 rediscovers what N1 already found.',
          'An optimistic closure risk statement at N2 throws away the last cheap chance to trade frequency or features.',
          'Release the FFN only against RTL that is actually frozen, and freeze the constraints with it.',
          'Functional ECOs after the FFN happen, but must be exceptional, visible and costed.',
          'Run equivalence from N1 on, and against the verified RTL — not only against the FFN.',
        ],
      },
    ],
  },
];
