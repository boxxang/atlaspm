# 3DIC template: two dies, a stack bonding run, and a schedule that holds

Date: 2026-09-16 · Status: approved in conversation, implementing

## Why

The 3DIC template shipped as the SoC flow with seven stack stages laid inside
its 136 weeks. A stacked-die program builds two chips, so it ran the same
length as an SoC program (136 weeks) and cost 6.9% more (3,919 against 3,667
M/M). Two dies means two netlists, two floorplans, two signoffs, two mask sets,
two wafer runs and two sort programs; none of that was in the template.

Reviewing it also turned up two faults in what shipped:

- **Order.** KGD released dies to assembly at weeks 79–86, but wafers ship at
  99–101. MDT brought up link BIST on the stack at 90–100, but the stack is
  bonded at 101–104. A test enforced the wrong order (KGD before packaging).
- **A missing run.** Nothing bonds the product. BOND is process enablement,
  DCTV is a test vehicle, and ASSY-05 is package die attach.

Est. Cost stays labor-only (M/M × rate); non-labor NRE is out of scope.

## Decisions (made in conversation)

- **Per-die stages** for SYN, PD, SO, DFT, TEST, TO and FAB. RTL, DV and every
  other stage remain shared.
- **Approach A.** The SoC stages are the bottom die: keys and references
  unchanged (`PD-06` stays `PD-06`), titled "… — Bottom Die" in the 3DIC
  profile. The top die's stages are *derived in code* from the SoC ones.
- **Top die = 90%** of the bottom die's effort.
- **A new stage, STK — Product Stack Bonding,** authored by hand.
- **Shift inherited stages, never stretch them.** A stretched stage keeps its
  activities and leaves empty weeks at its end, so the milestone anchored there
  lands after the work. The backside TSV reveal sits in STK, after bonding,
  which is where a TSV-middle, face-to-face hybrid-bonded flow does it, so FAB
  needs no extra weeks.

## The top die, derived

`/data/threeDicTopDie.ts` maps each split stage to its top-die counterpart:

| SoC stage | key | short | top key | top short |
|---|---|---|---|---|
| Synthesis | `synthesis` | SYN | `synthesisTop` | SYNT |
| Physical design | `physicalDesign` | PD | `physicalDesignTop` | PDT |
| Signoff | `signoff` | SO | `signoffTop` | SOT |
| DFT | `dft` | DFT | `dftTop` | DFTT |
| Tapeout | `tapeout` | TO | `tapeoutTop` | TOT |
| Fabrication | `fabrication` | FAB | `fabricationTop` | FABT |
| Test development | `testDevelopment` | TEST | `testDevelopmentTop` | TESTT |

Derivation rules, one function each:

- **Reference remap.** `PD-06` → `PDT-06` and `PD-D3` → `PDT-D3` for the seven
  split prefixes, and nothing else: `RTL-05` in a top-die write-up still names
  the shared RTL activity, while `SYN-12` names the top die's own netlist. It
  applies to activity IDs in lists and in prose, and to deliverable IDs.
- **Stage content.** The SoC stage with `id` = top key, the short title, the
  title "… — Top Die", the description prefixed "For the top die: ", each
  deliverable title suffixed " — top die" (so the catalogue never holds two
  refs with one title, which the tag matcher cannot tell apart), and
  `engineeringEffort` × 0.9.
- **Activities.** The same steps, windows, outputs and role; the ref and the
  deliverable relations remapped; the stage set to the top key. The title gets
  " (Top Die)", so an activity named out of context (overdue lists, meetings)
  says which die.
- **Write-ups.** Server-side only: the SoC write-up, with its stage, relations,
  connection lists and prose refs remapped, and its effort split × 0.9.

The bottom die's content is the SoC content, untouched.

## STK — Product Stack Bonding

Stage key `stackBonding`, phase `manufacture`, weeks 116–124, 18 M/M, authored
in `/data/threeDic.ts` with its write-ups under `/data/threeDicWriteUps/stk.ts`:

| ref | window | work | M/M |
|---|---|---|---|
| STK-01 | w0–3 | Product hybrid bonding run on known-good dies | 6 |
| STK-02 | w2–4 | Post-bond CSAM, X-ray and overlay inspection | 3 |
| STK-03 | w3–7 | Backside thinning, TSV reveal and backside RDL | 6 |
| STK-04 | w6–8 | Stack dicing, traceability and release to assembly | 3 |

Each activity gets one output per step and a deliverable relation. The last
activity produces the released stack.

## Schedule (weeks from kickoff)

| stage | was | now |
|---|---|---|
| DFT bottom / top | 18–78 | 18–78 / 20–80 |
| SYN bottom / top | 42–66 | 42–66 / 44–68 |
| PD bottom / top | 46–76 | 50–80 / 52–82 |
| SO bottom / top | 62–78 | 66–82 / 68–84 |
| 3DI | 46–72 | 46–86; 3DI-06 moves to w30–40, after both signoffs |
| TO bottom / top | 78–86 | 86–94 / 88–96 |
| FAB bottom / top | 82–101 | 90–109 / 92–111 |
| TEST bottom / top | 54–96 | 62–104 / 64–106 |
| KGD | 70–86 | 102–118 |
| STK | — | 116–124 |
| MDT | 84–114 | 114–144 |
| ASSY | 76–107 | 99–130 |
| BU | 106–124 | 129–147 |
| MP | 110–136 | 133–159 |

Everything else is where it was. New checkpoints: **Top Die Tapeout**
(`tapeoutTop` end), **Top Die First Silicon** (`fabricationTop` end) and
**Stack Bonded** (`stackBonding` end). The SoC checkpoints anchored to split
stages stay on the bottom die.

The result is 38 stages over 159 weeks, about 4,950 M/M (+35% against SoC),
or $74M at $15k per M/M.

## What holds it (tests)

- The schedule's order, as assertions rather than as comments:
  - Stack signoff ends at or after both dies' signoff.
  - Each die tapes out after stack signoff.
  - KGD's criteria and sort program (KGD-01, KGD-02) may be written before
    wafers exist. Binning (KGD-03) starts once the bottom die's wafers begin
    shipping (FAB-10), and the release (KGD-04) ends after the top die's
    wafers have shipped (FABT-10).
  - STK's bonding run starts at or after KGD's release begins, and STK ends
    before ASSY-05's die attach.
  - MDT-02 starts after the stack exists.
  - Every stage ends by BU and MP.
- Top-die derivation: every top activity mirrors its base (steps, outputs,
  windows, role); every relation resolves to a top deliverable; no ref or
  deliverable title collides; effort is 0.9 × base; prose refs to split prefixes
  point at the top counterpart and other refs are untouched.
- The existing 3DIC content invariants extended to the top-die stages and STK:
  tags resolve, a deliverable's source is its last producer, write-ups have the
  SoC shape.
- e2e: a new 3DIC program has 38 stages, a top-die stage with tags and
  outputs, a top-die write-up, and the STK stage.

## Out of scope

- Existing 3DIC programs. A program copies its template when it is created and
  is independent afterwards, so they keep 30 stages. Recreating one picks this up.
- Non-labor NRE in Est. Cost.
- Die-specific wording for the bottom die's SoC content, and hand-authored
  top-die steps (approach C). Either can come later.
