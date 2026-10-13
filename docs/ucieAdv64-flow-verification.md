# UCIe Advanced 64G Die-to-Die PHY IP — template verification

_The final release was renamed from “GA” to “Production release” after this report was written; stage, gate and activity identifiers (ucieGa, ucieIpGa, UGA-nn) are unchanged so existing programs keep resolving._

This report covers the new built-in template `ucieAdv64` ("UCIe Advanced 64G Die-to-Die PHY IP"). It is a new-development PHY IP
for UCIe Advanced packages at 64 GT/s, proven on a test chip and released to licensees as v0.5, v0.9 and production release.

**Sources.**

- The tables in the appendix are generated from the template by `npx tsx tools/ucieFlow/report.ts`.
- The checks code can decide are unit tests in `tests/unit/ucieAdv64.test.ts`.
- The judgements below are written by hand.

## Result at a glance

| | |
|---|---|
| Stages | 25 (8 bands, two of them new: Silicon Validation, IP Release & Enablement) |
| Activities | 198 (adapter 30, logical PHY 30, electrical PHY 51, channel 18, test chip 25, program 44) |
| Steps | 972, one output each |
| Key deliverables | 200, one producer each |
| Glossary | 115 UCIe and IP-development terms that no other template defines |
| Kickoff → production release | W132 (the test requires 124–132) |
| Kickoff → sustaining handover | W140 |
| Engineering effort | 867 man-months |

**Stage changes from the brief.** One stage moved, one gate is now closed by an event, and several stages were rescheduled.

| Stage | Change | Why |
|---|---|---|
| UCHN | Starts at W16, not W24; still ends at W70 | The co-design rule says the channel starts before the architecture freezes at W22. The brief's table had it start two weeks after. |
| UTPO | Its gate closes on the database release itself, not on a review | Tapeout is an event. |
| USGN | Shortened to W62–72, ending at its review | Leaves two weeks between hard macro signoff and the database release. Review V7b #1. |
| UFAB | Lengthened to W76–98 (22 weeks) | Wafer fab with bumping takes 14 weeks and assembling every package variant takes 6. Reviews V7a #4 and V7b #14. |
| UBUP, UCHR, UCMP, URLQ | Moved 2 weeks later | They follow first silicon. |
| UGA | W120–132 | The rollup and production release QA now come after compliance and the silicon-proven decision. Review V7b #3. |

**Prefixes.** All 25 prefixes (UCON … UCUS) were checked against every stage, activity and deliverable prefix of the four existing templates, and none collides. A unit test holds this.

## Critical path (V5)

**Method.** The template is read with the same critical-path model the CPO template uses (`tools/flowLib`):

- each activity keeps its length;
- each dependency keeps its relation;
- an overlap keeps any positive lead the template gives it;
- total float comes from a backward pass.

**Into production release approval (UGA-05).** The logic finishes at W132, the same as the template. The template carries no padding.

| Segment | Driving chain |
|---|---|
| Definition | UREQ-01 → UTEC-01 → UFND-02/03/06 |
| RTL | URTL-01 → URTL-02 (Adapter) → URTL-09 → **URTL-10 RTL Freeze (W52)** |
| Digital implementation | UDPD-02 → UDPD-04 → UDPD-05 → UDPD-06 |
| Test chip | UTCI-03 → UTCI-05 |
| Tapeout | **UTPO-04 database release (W76)** |
| Fab and assembly | UFAB-01 → UFAB-02 → UFAB-03 → UFAB-05 **silicon in hand (W98)** |
| Bring-up | UBUP-01 → 02 → 03 → 04 → UBUP-06 **first link-up (W106)** |
| Reliability | URLQ-02 HTOL (W106–124) → URLQ-05 |
| Production release | UGA-01 → UGA-03 → UGA-04 → **UGA-05 production release (W132)** |

**Against the brief's intended spine.** The brief's path was UREQ → UARC → UAFE/URTL → UDV/UAMS → USGN → UTCI → UTPO → UFAB → UBUP → UCHR/UCMP/URLQ → UGA. In the computed path, float (in weeks) on each spine gate into production release is:

| Gate | Float into production release |
|---|---|
| UREQ-09, UARC-12 | 0 |
| UAFE-09, URTL-10 | 0 — the electrical PHY and the RTL are both critical |
| UDV-12 | 10 |
| UAMS-08 | 8 |
| USGN-07, UTCI-06, UTPO-04, UFAB-05, UBUP-06 | 0 |
| UCHR-10 | 2 |
| UCMP-05 | 3 |
| URLQ-06 | 1 |
| UGA-05 | 0 |

**Two places where the computed path differs from the brief:**

- **Verification is not on the critical path.** DV sign-off and the link margin review close at W60, and hard macro signoff ends at W72. What sets tapeout is digital implementation and the test chip, not verification closure. Bugs found late still have a path through the functional ECO activity (UDPD-08), which feeds signoff.
- **Reliability, not characterization, sets the end of silicon validation.** HTOL cannot start until the parts have passed time-zero screening at first link-up, and it then runs 18 weeks. Characterization has 2 weeks of float and compliance has 3.

No schedule change is needed. These are the true long poles of a first-pass 64 GT/s PHY, and the brief's 124–132-week window holds.

**Float on the channel and the test vehicle.**

**Channel (UCHN).** Every activity except UCHN-06 has zero float:

- **UCHN-01..05, 07, 08:** the channel specification, routing rules and bump map freeze, and the SI/PI work behind them, all feed layout, the test chip and signoff.
- **UCHN-06, the customer kit:** 2 weeks of float.

Slipping the channel specification or the bump map freeze moves tapeout.

**Test vehicle (UTVP)**, float into silicon in hand:

| Activity | Float into silicon in hand (weeks) |
|---|---|
| UTVP-04 ATE load board and probe card | 1 |
| UTVP-09 stress boards and package final test program | 1 |
| UTVP-03 evaluation boards | 3 |
| UTVP-07 readiness review | 4 |
| UTVP-05 lab equipment | 6 |
| UTVP-06 bring-up plan | 6 |
| UTVP-01 package design | 14 |
| UTVP-02 substrate, bridge and interposer fabrication | 21 |
| UTVP-08 bridge and interposer tapeout | 21 |

The load board, probe card and stress hardware are the tightest. Every test vehicle activity ends before silicon is in hand, and a unit test holds that.

## V1 — gaps against the brief

Each content item the brief required, per stage, is listed in `tools/ucieFlow/requirements.ts` against the activities that carry it. The full table is in the appendix.

- **Result:** 150 required items (136 from the brief plus 14 added by the reviews), 0 missing.

## V2 — each block, end to end

The appendix lists every block's activities in time order, by band.

| Block | Define | Enable | Design & verify | Implement | Integrate | Manufacture | Silicon validation | IP release |
|---|---|---|---|---|---|---|---|---|
| adapter | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | ✓ |
| logicalPhy | ✓ | — | ✓ | ✓ | — | — | ✓ | — |
| afe | ✓ | ✓ | ✓ | ✓ | — | — | ✓ | ✓ |
| channel | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ |
| testchip | — | ✓ | — | — | ✓ | ✓ | ✓ | — |
| program | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | ✓ |

**Where a track is empty, it is by design:**

- **Fab and assembly** are carried as test-chip work. The digital and analog blocks have no Manufacture activity of their own because the test chip is what gets fabricated.
- **The logical PHY in release** goes out in the adapter's v0.5 RTL and the afe/channel views and models. There is no separate logical-PHY release activity.
- **The test chip has no Define activity.** It exists to prove the IP, and its architecture is decided in UTCI-01 once the IP architecture is frozen.

A unit test ("gives every block a track …") holds that each block is defined, built, and proven or released.

## V3 — producer and consumer

| Check | Result |
|---|---|
| Activity references named in write-ups' consumes lists | 917 |
| Linked as dependencies | 914 |
| Linked as runs-with or revised-by only | 3 |
| Producer finishes before the consumer does | 902 of 917 |
| Producer outlasts the consumer | 15 — each is an interim output (a draft, a first drop or an early model) re-checked by a later activity |
| Isolated activities | none |
| Deliverables that feed nothing downstream | 1: UCUS-D5, the sustaining handover package — the program's final output |

**The three runs-with links are deliberate:**

- **UAFE-07 ↔ UAFE-12:** the calibration hooks and the sensors are designed together.
- **UDPD-06 ↔ ULAY-06:** the digital and analog abstracts are exchanged both ways during macro assembly.
- **UCUS-06 → UGA-04:** errata keep running after production release. Production release consumes the errata log frozen at the cut-off, not the activity's end.

**Every hand-off the brief named exists and is tested.** For each one, the consumer waits on the producer and starts after it.

| Hand-off | Producer → consumer | Weeks |
|---|---|---|
| Architecture freeze → AFE and RTL design | UARC-12 → UAFE-02..07, URTL-02..08 | W22 → W22 |
| RTL freeze → digital implementation | URTL-10 → UDPD-02..08 | W52 → W52 |
| Circuit freeze → layout | UAFE-09 → ULAY-02..07 | W50 → W50 |
| Hard macro signoff → test chip signoff | USGN-07 → UTCI-05 | W72 → W74 |
| Hard macro signoff → database release | USGN-07 → UTPO-04 | W72 → W74 |
| Bump map and channel freeze → macro assembly and test chip top level | UCHN-03 → ULAY-04, UTCI-03 | W36 → W56, W54 |
| Pre-silicon test plan and margin predictions → test vehicle prep and bring-up | UDV-11, UAMS-07 → UTVP-06, UBUP-05 | W58 → W70, W101 |
| Margin predictions → measurement-to-simulation correlation | UAMS-07 → UCHR-09 | W58 → W114 |
| RTL freeze → v0.5 | URTL-10 → UPRE-02 | W52 → W54 |
| Hard macro signoff → v0.9 | USGN-07 → UPRE-08 | W72 → W76 |
| Characterization, compliance and reliability results → production release | UCHR-10, UCMP-05, URLQ-06 → UGA-05 | W122, W126, W128 → W131 |
| v0.5 → customer support | UPRE-02 → UCUS-01 | W60 → W56 onward (support starts from the v0.5 drop; it ends past production release, at W140) |

## V4 — gates and their exit criteria

The appendix lists every gate with the activity that closes it and that activity's three exit criteria.

- **What closes each gate.** Every gate closes on an activity of its own stage that ends in the stage's last two weeks. That activity is a review or decision where the gate is a judgement, and the event itself where the gate is an event: tapeout, silicon in hand. A unit test holds this.
- **Exit criteria are measurable.** They state counts, coverage, closed items and recorded decisions against agreed thresholds. Examples:
  - RTL freeze: agreed coverage, zero open high-priority bugs and a falling bug-arrival trend.
  - Link margin review: eye height and width at the target BER, and Monte Carlo yield against agreed thresholds, per package type.
  - Silicon-proven: the lot and sample count behind the claim.

The numeric thresholds themselves are left to the program, because the brief allows only publicly confirmed numbers.

## V6 — schedule and effort realism

- **Windows fit.** Every activity's window sits inside its stage, and every activity's main-lane step weeks fit inside its window. In each stage the steps fill 63–100 % of the windows.
- **Effort was rescaled once.** The first draft totalled 1,228 man-months and staffed RTL at 36 people, design verification at 31 and analog design at 29. That is three times what a die-to-die PHY IP team runs, so effort was scaled to a realistic team.
- **The reviews added effort back.** They added the PLL, sideband I/O, sensors, test-vehicle variants, ECO and release work, and the architecture effort was raised from 18 to 32 man-months. The total is now 867 man-months, about 72 person-years over 2.7 years.

**Peak staffing.** Effort is spread evenly over each activity's window:

| Owner | Peak people | When |
|---|---|---|
| Analog and mixed-signal | 18 | W28–40 — TX, RX, clocking, PLL, sideband I/O and sensors in parallel |
| Physical design | 17 | W65–66 — a two-week overlap of digital closure, signoff and test chip PD |
| Design verification | 16 | W50–52 — a two-week overlap of regression, gate-level and test chip verification |
| Validation | 14 | W110–114 |
| Everyone else | 12 or fewer | |

The two-week spikes in physical design and verification come from overlapping windows. A real plan would level them by staggering the test chip work. They are flagged here, not leveled, because the template's windows follow the flow rules.

**Schedule against typical programs:**

| Phase | Weeks | Verdict |
|---|---|---|
| Architecture | 12 | Typical |
| Circuit design to freeze | 32 | Within the 6–9 months a new 64 GT/s AFE takes |
| RTL to freeze | 32 | Typical |
| Layout plus signoff | 28 | Typical |
| Fab, bumping and assembly | 22 | Reasonable for a shuttle with first-article 2.5D assembly |
| Bring-up | 8 | Typical |
| Characterization | 20 | Typical |
| Reliability | 26, of which HTOL is 18 | Typical |

## V8 — in the app

`next dev` was run on the local database. A program, "UCIe Flow Check", was created from the template with kickoff 01/04/2027 and deleted afterwards. Screenshots are in `docs/ucieAdv64-screens/`.

| Screen | Result |
|---|---|
| Templates (`1-templates.jpg`) | The fifth built-in, with 25 stages and a flowchart, listed beside the other four, which are unchanged. |
| Overview (`2-overview.jpg`) | The tapeout countdown reads the test chip tapeout. The effort and schedule panels show the template's stages. |
| Timeline (`3-timeline.jpg`) | All 25 stages under their bands, including **Silicon Validation** and **IP Release & Enablement**. Major gates: Architecture Freeze, Hard Macro Signoff, Tapeout, Silicon-Proven, IP Production Release. |
| Stages (`4-stages.jpg`) | Grouped by band, in start order. |
| Activity URTL-05 (`5-activity-URTL-05.jpg`) | Steps, deliverable tag, needs-first and connection links, and the glossary terms SBINIT, MBINIT, MBTRAIN, LINKINIT, PHYRETRAIN and TRAINERROR. |
| Flowchart (`6-flowchart-top.jpg`, `7-flowchart-merge.jpg`) | The digital, electrical PHY, channel and test vehicle, and release workstreams are labelled. They join at the test chip tapeout and again at silicon validation and production release. |
| Other templates | Their timelines do not show the new bands. The e2e test "leaves the other templates' timelines without the new bands" checks the Typical SoC and CPO templates. The band pickers list the new bands, as intended. |

The V8 screenshots were taken before the review fixes. After the fixes, the e2e suite was run again and passed in full.

## V9 — automation

Run with no `next dev` holding :3000:

| Check | Result |
|---|---|
| `npm run test` | 3,286 passed |
| `npm run typecheck` | Clean |
| `npx playwright test` | 269 passed — the full suite, including `tests/e2e/ucieAdv64.spec.ts` |
| `npm run lint` | Clean |

## Figures written without numbers

Only publicly confirmed figures appear in the template:

- 64 GT/s;
- the x64 Advanced module;
- a bump pitch of roughly 25–55 µm;
- a short Advanced reach of around 2 mm.

The features of the revision that defines 64 GT/s, as the consortium announced them, are named without a revision number: runtime recalibration, extended sideband reach, early firmware download, priority sideband packets, continuous transmission in Raw mode, and the open-drain throttle and emergency-shutdown signal.

The following are written generically, because public sources either do not state them or disagree:

- the number of redundant lanes per module, and per signal type;
- the BER target at 64 GT/s, written as "the target the specification sets for 64 GT/s";
- channel reach per package type at 64 GT/s;
- sideband reach;
- energy-per-bit, area, shoreline-density and latency targets;
- the termination requirement at 48/64 GT/s, written as "decided per package type and reach";
- ESD levels, written as "the level the integration guide states";
- fab, assembly and substrate lead times, and stress durations and sample sizes;
- freeze and sign-off thresholds (coverage, margin and yield), written as "agreed".

## Countdown labels

| Countdown | Reads | Where it shows |
|---|---|---|
| tapeout | `ucieTapeout` | Overview and Programs, labelled "Tapeout" — correct for an IP program |
| first silicon | `ucieFab` | Only in the email summary |
| production | `ucieGa` | Only in the email summary (`src/lib/mailDrafts.ts`), labelled "Production" |

**The problem.** "Production" is wrong for an IP program, and so is "First Silicon" to a lesser degree.

**Proposed fix.** This was not implemented; it is beyond this template's scope.

- Add an optional `countdownLabels` to the built-in profile data, e.g. `{ firstSilicon: 'Silicon in Hand', production: 'IP Production Release' }` for `ucieAdv64`.
- Look the labels up by the program's `profileId` where `buildSummaryDraft` is called. The call site already has the program, so this is a few lines.
- Default to the current labels for every other template.

No shared structure changes: the schedule keys stay `tapeout`, `firstSilicon` and `production`.

## V7 — independent reviews

Two agents that had not written any of the content reviewed the template. One reviewed it as a UCIe PHY IP expert, focusing on technical accuracy and missing work, and checked claims against public UCIe material. The other reviewed it as an IP program manager, focusing on flow, release structure and realism. Every finding is listed below with what was done.

### V7a — UCIe PHY expert

| # | Sev. | Finding | Done |
|---|---|---|---|
| 1 | H | Electrical compliance was planned like a SerDes bench test. The die-to-die bumps of an Advanced package cannot be probed. | **Fixed.** UCMP now tests against a reference die on a known-good bridge or interposer. The tests are driven over the sideband using on-die margining, BER, lane skew and TX equalization. The compliance control registers and injection hooks are designed into URTL-01/02 and UDFT-07, and UDV-09 verifies them. |
| 2 | H | The interop partner was arranged after silicon. | **Fixed.** New UTEC-07 (W14–20) secures the partner and reference die and a mated bump map before the bump map freezes (W36). UTVP-01 builds the partner die into the test vehicle. A unit test holds the order. |
| 3 | H | One test vehicle backed claims for three package types, and the reversed build was never made. | **Fixed.** UREQ-03 decides which package types are silicon-proven at production release and which are supported by simulation only. UTVP-01 and UFAB-03 build bridge, interposer, reversed-orientation and partner variants. UCHR and UGA report results per package type. |
| 4 | H | The interposer or bridge was treated as a purchase. | **Fixed.** New UTVP-08 signs off and tapes out the bridge and interposer (W54–68), with its slot booked in UTEC-05. UFAB-03 assembly is now 6 weeks. |
| 5 | H | No one owned the PLL, and "PLL or DLL" were offered as alternatives. | **Fixed.** UREQ-08 and UARC-06 decide that the PLL sits inside the macro, with a reference-clock jitter specification. A PLL generates the clock and a DLL places phases. New UAFE-10 designs the PLL, ULAY-02 lays it out and new UCHR-11 characterizes it. |
| 6 | H/M | Width degrade was applied to the Advanced package. | **Fixed.** Advanced now repairs a lane onto a redundant lane, then degrades speed, then goes to TRAINERROR. This changed the glossary and UARC-03, URTL-05, UDV-03/05 and UAMS-03. |
| 7 | M | The channel was specified by insertion loss, and IBIS-AMI was the customer model. | **Fixed.** UCHN-01 now specifies VTF loss and crosstalk against an eye mask. Licensees get a channel compliance kit (UCHN-06 → UPRE-05) as the primary model, and IBIS-AMI only on request. |
| 8 | M | Receiver termination and TX/RX voltage compatibility were never decided. | **Fixed.** UREQ-08 and UARC-07 decide termination per package type and reach, optional receiver equalization and voltage compatibility. UAMS-04 studies margin with and without termination. |
| 9 | M | The revision's open-drain throttle / emergency shutdown and a hard-macro test wrapper were missing. | **Fixed.** UREQ-01 decides whether each is in scope. URTL-08 handles the throttle and shutdown, and UDFT-02 adds the wrapper. |
| 10 | M | On-die sensors were used but never designed. | **Fixed.** New UAFE-12. UARC-03 triggers recalibration from the sensors, and UAMS-03 verifies the triggers. |
| 11 | M | The sideband's electrical side had no owner. | **Fixed.** New UAFE-11 covers the sideband TX, RX, redundant path and always-on supply, and ULAY-02 lays them out. |
| 12 | M | The schedule assumed first silicon works. | **Fixed** as a decision with a mask and slot option. New UBUP-07 is the respin or metal-fix decision, and UTEC-05 holds the mask and slot option. Production release is not re-planned for a respin; see V7b #4. |
| 13 | M | Multi-module support was in the requirements only. | **Fixed.** Multi-module striping, module alignment and synchronized training are added in URTL-03/04/05 and verified in UDV-07. The test chip carries two modules. |
| 14 | M | CDM on assembled microbumps cannot be done. | **Fixed.** URLQ-03 qualifies the die-to-die bumps at die or wafer level on test structures. Package-level ESD applies to external pins only. |
| 15 | L/M | Formats and protocols were mixed. | **Fixed.** Flit and Raw formats are now kept apart from the protocols (PCIe, CXL and streaming are negotiated at the FDI). This changed UREQ-01, URTL-03, UDV-07 and the glossary. The UAFE tagline's "few millimeters" is also removed. |

### V7b — IP program manager

| # | Sev. | Finding | Done |
|---|---|---|---|
| 1 | H | Test chip signoff and tapeout overlapped hard macro signoff, and one dependency pointed backwards. | **Fixed.** USGN now closes at W72, two weeks before the database release (W74–76). UTCI-05 integrates signoff-candidate macros, makes a trial database submission and runs a delta check after USGN-07. UTCI-06 no longer depends on the W88 bring-up plan. A unit test holds the 2-week gap. |
| 2 | H | The bridge or interposer was a purchase, and one test vehicle covered three packages. | **Fixed.** See V7a #3 and #4. The backward dependency from UCHN-04 to UTVP-01 is removed. |
| 3 | H | The production release rollup consumed results that arrive after it. | **Fixed.** production release now runs W120–132: rollup at W126–129, QA after the silicon-proven decision, approval at W131–132. UGA-03 consumes the ECO log frozen at the production release cut-off. A unit test holds "production release QA after silicon-proven". |
| 4 | H | There was no respin path, and qualification rested on one lot. | **Partly fixed.** UBUP-07 is the respin decision, UTPO-03 offers a corner or engineering lot, and URLQ-06 states the lot and sample count. A respin branch is not scheduled: production release would move by several months, and the brief's 124–132-week window assumes first-pass silicon. |
| 5 | H | There was no stress hardware, and HTOL started before first link-up. | **Fixed.** New UTVP-09 provides stress boards, sockets and a package final test program. HTOL (URLQ-02) starts at W106, after time-zero screening. A unit test holds this. |
| 6 | H | The interop partner was arranged too late. | **Fixed.** See V7a #2. |
| 7 | M-H | The RTL freeze and DV sign-off were not measurable, there was no ECO path, and gate-level simulation could not have SDF. | **Fixed.** URTL-10 and UDV-12 now have measurable criteria. New UDPD-08 is the functional ECO. New USGN-08 runs timing-annotated gate-level simulation and feeds USGN-07. |
| 8 | M | The circuit freeze came before the margin verdict, and the channel spec did not feed signoff. | **Fixed.** UAFE-09 adds a pre-freeze statistical margin checkpoint. UAMS-08 has pass criteria. UCHN-08 and ULAY-05 feed USGN-07, and UCHN-08 also feeds UPRE-05. |
| 9 | M | Implementation consumers started before their inputs. | **Fixed.** ULAY-02 delivers early timing models and abstracts at about W56 for UDPD-05. Signoff starts on near-final databases. The remaining overlaps are interim drops, listed in V3. |
| 10 | M | v0.5 had no gate, and its collateral was thin. | **Fixed.** New UPRE-09 is the v0.5 sign-off (QA, entitlement, distribution). v0.5 now adds a placeholder outline and abstract, a preliminary bump map, power and area, SDC, UPF, an integration testbench, waiver reports and a verification status report. |
| 11 | M | v0.9 was missing signoff collateral. | **Fixed.** v0.9 now adds SDC, UPF, a gate-level netlist with SDF, CDL, DFT collateral, training firmware and programming sequences, signoff summaries, a mission profile and the channel compliance kit. |
| 12 | M | Release governance was missing. | **Fixed.** UPRE-01 covers export classification and entitlement. New UCUS-06 covers errata and patch releases, and new UCUS-07 covers variant and porting requests. |
| 13 | M | Licensees saw no silicon data for 50 weeks. | **Fixed.** New UCUS-08 gives early silicon briefs under NDA (W108–118), which UCUS-02 consumes. |
| 14 | M | 20 weeks for fab and assembly was aggressive. | **Fixed.** It is now 22 weeks, with bumping and package final test explicit. The brief's production release window does not allow 24–26 weeks without dropping something else; that is noted as a risk. |
| 15 | L | Architecture and program management effort were thin, and there was no ECO reserve. | **Partly fixed.** Architecture effort rose from 18 to 32 man-months and concept from 9 to 12. Program management stays on its activities rather than a standing 1 FTE: the template counts engineering effort per activity, and standing overhead is outside that model. ECO effort sits in UDPD-08 and UCUS-06. |

### Not applied, and why

| Finding | Why it was not applied |
|---|---|
| A scheduled respin branch (V7b #4, V7a #12) | The decision point and the mask option are in the plan, but the dates assume first-pass silicon, as the brief's 124–132-week production release window does. |
| 24–26 weeks for fab and assembly (V7b #14) | 22 weeks are planned. 26 would push production release to W136, outside the brief's window. |
| Program management as a standing 1 FTE (V7b #15) | Outside the template's per-activity effort model. |

## Appendix — generated tables

Regenerate with `npx tsx tools/ucieFlow/report.ts`.

### V1 — the brief’s required content, against the activities

| Stage | Required by the brief | Carried by | Status |
| --- | --- | --- | --- |
| UCON | Market and customer requirements | UCON-01 Market and Customer Requirements Capture — Chiplet Interconnect Demand, Target SoCs and Package Types | covered |
| UCON | Competitive IP analysis | UCON-02 Competitive Die-to-Die PHY IP Landscape and Differentiation Analysis | covered |
| UCON | Business case and pricing model | UCON-03 Business Case, Licensing and Pricing Model | covered |
| UCON | IP roadmap position | UCON-04 IP Roadmap Position — Speed Grades, Process Nodes and Derivatives | covered |
| UCON | Program plan and Go / No-Go | UCON-05 Program Plan — Schedule, Resources, Test Chip Budget and Partners; UCON-06 Program Risk Assessment and IP Program Go / No-Go Review | covered |
| UREQ | Target UCIe revision and features — 64 GT/s, x64 module, module count, Raw / Streaming / Flit modes | UREQ-01 Target UCIe Revision and Feature Selection — 64 GT/s, x64 Advanced Module, Module Count, Flit and Raw Formats and Protocol Support | covered |
| UREQ | PPA targets — shoreline bandwidth, energy per bit, area, latency | UREQ-02 PPA Targets — Shoreline Bandwidth Density, Energy per Bit, Area and Latency | covered |
| UREQ | Supported package types and bump pitch range | UREQ-03 Supported Package Technologies and Bump Pitch Range — Silicon Bridge, Silicon Interposer and RDL Interposer | covered |
| UREQ | Customer integration — metal stack, orientation, power domains | UREQ-04 Customer Integration Requirements — Metal Stack, Macro Orientation, Power Domains and Test Access | covered |
| UREQ | Compliance and interoperability targets | UREQ-07 Compliance and Interoperability Targets | covered |
| UREQ | Requirements traceability | UREQ-09 Requirements Traceability Matrix and Requirements Baseline Review | covered |
| UARC | Adapter, Logical PHY, AFE and sideband partitioning | UARC-01 IP Partitioning and Interfaces — Adapter, Logical PHY, Electrical PHY, Sideband, FDI, RDI and Register Interface | covered |
| UARC | FDI / RDI and configuration / register interface | UARC-01 IP Partitioning and Interfaces — Adapter, Logical PHY, Electrical PHY, Sideband, FDI, RDI and Register Interface | covered |
| UARC | Clocking — PLL / DLL, forwarded clock, 64 GT/s timing budget | UARC-06 Clocking Architecture — PLL and DLL, Forwarded Clock, Phase Adjustment and the 64 GT/s Timing Budget | covered |
| UARC | Lane repair, reversal and deskew | UARC-04 Lane Repair, Lane Reversal and Deskew Scheme | covered |
| UARC | Link training and runtime recalibration structure | UARC-03 Logical PHY Architecture — Lane Mapping, Scrambling, Link Training and Runtime Recalibration | covered |
| UARC | Low-power states | UARC-08 Low-Power States and Power Management Architecture | covered |
| UARC | Bump map concept and module floorplan | UARC-09 Bump Map Concept and Module Floorplan | covered |
| UARC | DFT and debug strategy | UARC-10 DFT and Debug Strategy — Scan, BIST, PRBS, Loopback and Margining | covered |
| UARC | Power and area budget | UARC-11 Power, Area and Latency Budget Allocation | covered |
| UARC | Architecture review | UARC-12 Architecture Review and Architecture Freeze | covered |
| UTEC | Process and metal stack selection | UTEC-01 Process Node and Metal Stack Selection | covered |
| UTEC | PDK maturity | UTEC-02 PDK Maturity and Device Model Readiness for 64 GT/s Circuits | covered |
| UTEC | Package technology and bump pitch agreement | UTEC-03 Package Technology Selection and Bump Pitch Agreement — Bridge, Interposer and RDL | covered |
| UTEC | Package partner design rules | UTEC-04 Package Partner Design Rules and Assembly Constraints | covered |
| UTEC | Technology risk assessment | UTEC-06 Technology Risk Assessment and Technology Selection Review | covered |
| UFND | Foundation IP — PLL / DLL, ESD / IO | UFND-01 Foundation IP Sourcing — PLL or DLL, ESD and I/O Cells | covered |
| UFND | Standard cells and memories | UFND-02 Standard Cells, Memories and Retry Buffer Memory Compilers | covered |
| UFND | EDA and AMS flow readiness | UFND-03 Digital Implementation Flow Readiness; UFND-04 Analog and Mixed-Signal Flow Readiness — Simulation, Extraction and Reliability Checks | covered |
| UFND | UCIe verification IP | UFND-05 UCIe Verification IP Acquisition and Qualification | covered |
| UFND | Design and verification environment | UFND-06 Design and Verification Environment — Repositories, Regression and Configuration Management | covered |
| UAFE | TX driver | UAFE-02 TX Driver Design — Output Swing, Impedance, Equalization and Duty-Cycle Control | covered |
| UAFE | RX front-end and sampler | UAFE-03 RX Front-End and Sampler Design — Gain, Offset Calibration and Sampling Phase | covered |
| UAFE | Clock distribution and phase adjustment | UAFE-04 Clock Distribution, DLL and Phase Adjustment Design | covered |
| UAFE | Bias and reference | UAFE-05 Bias, Reference and Supply Regulation Design | covered |
| UAFE | ESD | UAFE-06 ESD Protection and Bump Interface Design | covered |
| UAFE | PVT corner simulation at 64 GT/s | UAFE-08 PVT Corner and Monte Carlo Simulation at 64 GT/s | covered |
| UAFE | Circuit review and freeze | UAFE-09 Circuit Review and Circuit Freeze | covered |
| URTL | D2D Adapter — CRC, retry buffer, ARB / MUX, Flit, FDI | URTL-02 D2D Adapter RTL — CRC, Retry Buffer, Arbitration and Multiplexing; URTL-03 Flit Formats, Raw Format, Protocol Negotiation and the FDI | covered |
| URTL | Logical PHY — lane mapping, scrambling, training FSM, repair / reversal, deskew, runtime recalibration | URTL-04 Logical PHY RTL — Lane Mapping, Scrambling and Deskew; URTL-05 Link Training State Machine — SBINIT, MBINIT, MBTRAIN, LINKINIT, ACTIVE, PHYRETRAIN and TRAINERROR; URTL-06 Lane Repair, Lane Reversal and Runtime Recalibration Logic | covered |
| URTL | Sideband controller | URTL-07 Sideband Controller and Manageability Logic | covered |
| URTL | Register map | URTL-01 RTL Coding Guidelines, Block Specifications and Register Map | covered |
| URTL | Low-power control | URTL-08 Low-Power State Control — L1 and L2 Entry and Exit | covered |
| URTL | Lint and CDC | URTL-09 Lint, CDC and RDC Clean-Up | covered |
| URTL | RTL freeze | URTL-10 RTL Freeze Review | covered |
| UDFT | Scan and ATPG | UDFT-02 Scan Insertion Plan and ATPG Coverage Targets | covered |
| UDFT | PRBS generators and checkers | UDFT-03 PRBS Generators and Checkers per Lane | covered |
| UDFT | Loopback modes | UDFT-04 Loopback Modes — Near-End, Far-End and Analog | covered |
| UDFT | BIST | UDFT-05 BIST and Built-In Lane Test for Bump Repair | covered |
| UDFT | Eye and lane margin measurement | UDFT-06 Eye and Lane Margining Functions | covered |
| UDFT | Debug access | UDFT-07 Debug Access — Register Snapshots, Trace and Sideband Debug | covered |
| UDFT | DFT freeze | UDFT-08 DFT Review and DFT Freeze | covered |
| UDV | UVM environment and VIP integration | UDV-02 UVM Environment and Verification IP Integration | covered |
| UDV | Training and state machines | UDV-03 Link Training and State Machine Verification | covered |
| UDV | Error injection and retry | UDV-04 Error Injection, CRC and Retry Verification | covered |
| UDV | Lane repair / reversal | UDV-05 Lane Repair, Lane Reversal and Deskew Verification | covered |
| UDV | Low-power entry and exit | UDV-06 Low-Power Entry and Exit Verification | covered |
| UDV | Raw / Streaming / Flit modes | UDV-07 Flit Format, Raw Format and Protocol Negotiation Verification | covered |
| UDV | Compliance scenarios | UDV-09 Compliance Scenario Verification | covered |
| UDV | Coverage closure | UDV-11 Coverage Closure and Post-Silicon Test Plan Hand-Off | covered |
| UDV | Verification sign-off | UDV-12 Verification Sign-Off Review | covered |
| UAMS | Mixed-signal simulation of the AFE models with the RTL | UAMS-02 Mixed-Signal Co-Simulation of the Electrical PHY with the Logical PHY RTL | covered |
| UAMS | Training with analog models | UAMS-03 Link Training with Analog Models in the Loop | covered |
| UAMS | Link margin with channel models | UAMS-04 Link Margin Simulation with Package Channel Models | covered |
| UAMS | PVT and Monte Carlo | UAMS-05 PVT and Monte Carlo Link Margin Statistics | covered |
| UAMS | Model consistency | UAMS-01 Electrical PHY Behavioral Models and Model Validation Plan; UAMS-06 Model-to-Circuit Correlation | covered |
| UAMS | Link margin review | UAMS-08 Link Margin Review | covered |
| UDPD | Synthesis | UDPD-01 Synthesis Trials and Constraints on Pre-Freeze RTL; UDPD-02 Final Synthesis and Netlist Release | covered |
| UDPD | Floorplan and place and route | UDPD-03 Digital Floorplan and Power Grid; UDPD-04 Place and Route | covered |
| UDPD | Timing closure | UDPD-05 Timing Closure Across Corners and Modes | covered |
| UDPD | Digital hard macro | UDPD-06 Digital Hard Macro Hardening and Abstract Generation | covered |
| ULAY | AFE layout | ULAY-01 Electrical PHY Layout Floorplan and Critical-Block Placement; ULAY-02 TX, RX, Clocking, PLL and Sideband I/O Layout | covered |
| ULAY | Matching and parasitics | ULAY-03 Matching, Shielding and Parasitic Control | covered |
| ULAY | Bump map and macro assembly | ULAY-04 Bump Map Implementation and PHY Macro Assembly | covered |
| ULAY | Post-layout simulation | ULAY-05 Post-Layout Extraction and Simulation | covered |
| ULAY | Abstract and timing models | ULAY-06 Abstract, Timing and Power Model Generation | covered |
| USGN | STA | USGN-01 Static Timing Signoff | covered |
| USGN | EM / IR | USGN-02 EM and IR Drop Signoff | covered |
| USGN | DRC / LVS | USGN-03 Physical Verification — DRC, LVS and Antenna | covered |
| USGN | ESD and latch-up | USGN-04 ESD and Latch-Up Verification | covered |
| USGN | Aging and reliability | USGN-05 Aging and Reliability Verification | covered |
| USGN | Signoff review | USGN-07 Hard Macro Signoff Review | covered |
| UCHN | Channel specification — loss, crosstalk, reach | UCHN-01 Channel Specification — Voltage Transfer Function Loss, Crosstalk, Reach and Eye Mask | covered |
| UCHN | Bump and routing design rules | UCHN-02 Bump and Routing Design Rules for Bridge, Interposer and RDL Packages | covered |
| UCHN | Package channel extraction and SI simulation | UCHN-04 Package Channel Extraction and SI Simulation | covered |
| UCHN | PDN and PI | UCHN-05 Power Delivery Network and PI Analysis | covered |
| UCHN | Customer channel guidelines and reference design | UCHN-06 Customer Channel Guidelines and Reference Design | covered |
| UTCI | Test chip architecture — two dies or loopback | UTCI-01 Test Chip Architecture — Two-Die Link and Loopback Configurations | covered |
| UTCI | Wrapper and test logic | UTCI-02 Test Chip Wrapper, Pattern Generators and Test Logic | covered |
| UTCI | Top-level integration and verification | UTCI-03 Test Chip Top-Level Integration — PHY Macros, Pads, Bumps and Power; UTCI-04 Test Chip Verification — Top-Level Simulation and Connectivity | covered |
| UTCI | Test chip signoff | UTCI-05 Test Chip Physical Design and Signoff | covered |
| UTVP | Test vehicle package — two dies on the advanced package | UTVP-01 Test Vehicle Package Design — Bridge and Interposer Variants, a Reversed-Orientation Build and the Partner Die | covered |
| UTVP | Substrate and bridge / interposer procurement | UTVP-02 Substrate Procurement, Bridge and Interposer Fabrication and Partner Die Supply | covered |
| UTVP | Evaluation board | UTVP-03 Evaluation Board Design and Fabrication | covered |
| UTVP | ATE load board and probe card | UTVP-04 ATE Load Board and Probe Card | covered |
| UTVP | Lab equipment | UTVP-05 Lab Equipment and Automation Readiness | covered |
| UTPO | Tapeout checklist | UTPO-01 Tapeout Checklist — Signoff Waivers and Deliverable Completeness | covered |
| UTPO | Database release | UTPO-04 Database Release and Foundry Handoff | covered |
| UTPO | Mask and shuttle schedule | UTPO-03 Mask, Shuttle and Lot Confirmation | covered |
| UFAB | Wafer fab tracking | UFAB-01 Wafer Fabrication and Wafer Bumping Tracking | covered |
| UFAB | Wafer sort | UFAB-02 Wafer Sort and Known-Good-Die Selection | covered |
| UFAB | Package assembly | UFAB-03 Test Vehicle Package Assembly — Every Variant | covered |
| UFAB | Board assembly | UFAB-04 Board Assembly and Inspection | covered |
| UFAB | First samples received | UFAB-05 First Samples Received in the Lab | covered |
| UBUP | Power-on | UBUP-01 Power-On and Supply Sequencing | covered |
| UBUP | Sideband link-up | UBUP-02 Sideband Link-Up and Register Access | covered |
| UBUP | Mainband training | UBUP-03 Mainband Training — MBINIT and MBTRAIN | covered |
| UBUP | First link-up, register access, basic data transfer | UBUP-02 Sideband Link-Up and Register Access; UBUP-04 First Link-Up and Basic Data Transfer | covered |
| UCHR | Eye margin | UCHR-02 Eye Margin and Timing Margin per Lane | covered |
| UCHR | BER | UCHR-03 BER Measurement at 64 GT/s | covered |
| UCHR | Energy per bit | UCHR-04 Energy per Bit Measurement | covered |
| UCHR | PVT shmoo | UCHR-05 PVT Shmoo — Voltage, Temperature and Process Splits | covered |
| UCHR | Lane repair and reversal on silicon | UCHR-06 Lane Repair and Lane Reversal on Silicon | covered |
| UCHR | Runtime recalibration on silicon | UCHR-07 Runtime Recalibration and Low-Power State Behavior on Silicon | covered |
| UCHR | Measurement-to-simulation correlation | UCHR-09 Measurement-to-Simulation Correlation | covered |
| UCHR | Characterization report | UCHR-10 Characterization Report Review | covered |
| UCMP | UCIe compliance testing | UCMP-02 Electrical Compliance Testing Against a Reference Die over the Sideband; UCMP-03 Link Training and Protocol Compliance Testing | covered |
| UCMP | Interop with other UCIe IP or dies | UCMP-04 Interoperability with Other UCIe Dies | covered |
| UCMP | Compliance results | UCMP-05 Compliance Results Review | covered |
| URLQ | HTOL | URLQ-02 High-Temperature Operating Life Stress | covered |
| URLQ | ESD and latch-up | URLQ-03 ESD and Latch-Up Qualification | covered |
| URLQ | Temperature cycling | URLQ-04 Temperature Cycling and Package-Level Reliability on the Test Vehicle | covered |
| URLQ | Reliability report | URLQ-05 Reliability Report | covered |
| URLQ | Silicon-proven decision | URLQ-06 Silicon-Proven Decision Review | covered |
| UPRE | v0.5 — RTL, behavioral model, preliminary integration guide | UPRE-02 v0.5 Release — RTL, Behavioral Models and Preliminary Integration Guide | covered |
| UPRE | v0.9 — GDS / LEF / lib, timing and power models, IBIS-AMI or channel model, integration guide | UPRE-04 Physical Views — GDS, LEF and Liberty; UPRE-05 Timing, Power and Channel Models — Channel Compliance Kit with Behavioral TX and RX Models; UPRE-06 Integration Guide and Application Notes; UPRE-08 v0.9 Release Decision | covered |
| UPRE | Release package QA | UPRE-07 v0.9 Release Package QA | covered |
| UGA | Final release package with silicon data | UGA-01 Silicon Data Rollup into the Release Package; UGA-03 Final Release Package — Views, Models and Documents Updated to Silicon | covered |
| UGA | Silicon report and characterization summary | UGA-02 Silicon Report and Characterization Summary | covered |
| UGA | Release QA | UGA-04 Production Release QA | covered |
| UGA | Production release approval | UGA-05 Production Release Approval Review | covered |
| UCUS | Customer integration reviews — floorplan, bump, power, channel | UCUS-01 Customer Integration Reviews — Floorplan, Bump Map, Power and Channel | covered |
| UCUS | SoC-level signoff support | UCUS-02 SoC-Level Signoff Support | covered |
| UCUS | Documentation and FAQ | UCUS-03 Documentation, FAQ and Knowledge Base | covered |
| UCUS | Customer issues and ECOs | UCUS-04 Customer Issue Tracking and ECO Handling | covered |
| UCUS | Sustaining handover | UCUS-05 Sustaining Handover Review | covered |
| UTEC | Interoperability partner and reference die secured before the bump map freezes | UTEC-07 Interoperability Partner and Reference Die Agreement — Mated Bump Map and Shared Test Vehicle | covered |
| UAFE | PLL design — clock generation, jitter, relock | UAFE-10 PLL Design — Clock Generation, Jitter and Relock from Low-Power States | covered |
| UAFE | Sideband I/O circuits and always-on supply | UAFE-11 Sideband I/O Circuits — Transmitter, Receiver, Redundant Path and Always-On Supply | covered |
| UAFE | On-die temperature and voltage sensors for runtime recalibration | UAFE-12 On-Die Temperature and Voltage Sensors for Runtime Recalibration | covered |
| UDPD | Post-freeze functional ECO | UDPD-08 Functional ECO Implementation on the Released Netlist | covered |
| USGN | Timing-annotated gate-level simulation | USGN-08 Timing-Annotated Gate-Level Simulation on the Signoff Netlist | covered |
| UTVP | Bridge and interposer design signoff and tapeout | UTVP-08 Bridge and Interposer Design Signoff and Tapeout for the Test Vehicle | covered |
| UTVP | Reliability stress boards, sockets and package final test | UTVP-09 Reliability Stress Boards, Sockets and Package Final Test Program | covered |
| UBUP | Respin or metal-fix decision | UBUP-07 Silicon Respin or Metal-Fix Decision | covered |
| UCHR | PLL characterization | UCHR-11 PLL Jitter, Supply Sensitivity and Relock Characterization | covered |
| UPRE | v0.5 release sign-off and licensee entitlement | UPRE-09 v0.5 Release Sign-Off — QA, Entitlement and Distribution; UPRE-01 Release Package Structure, Release QA Process, Export Classification and Licensee Entitlement | covered |
| UCUS | Errata and patch releases | UCUS-06 Errata, Patch Releases and Customer Notification | covered |
| UCUS | Variant and porting requests | UCUS-07 Customer Variant and Porting Request Evaluation | covered |
| UCUS | Early silicon data to licensees | UCUS-08 Early Silicon Data Briefs to Licensees | covered |

Required items: 150; missing: 0.

### V2 — each block, from definition to production release

**adapter**

| Band | Activities (weeks) |
| --- | --- |
| Define | UREQ-05 (W6–11), UARC-01 (W10–15), UARC-02 (W12–18) |
| Enable | UFND-02 (W8–16), UFND-03 (W10–18), UFND-05 (W10–18), UTEC-07 (W14–20) |
| Design & verify | URTL-01 (W20–26), URTL-02 (W22–42), UDV-01 (W22–28), URTL-03 (W24–44), UDV-02 (W24–34), UDV-04 (W32–52), URTL-09 (W34–50), UDV-07 (W34–54), UDV-09 (W42–56), URTL-10 (W48–52), UDV-11 (W50–58), UDV-12 (W56–60) |
| Implement | UDPD-01 (W46–52), UDPD-02 (W52–56), UDPD-08 (W54–64), UDPD-04 (W56–62), UDPD-05 (W58–64), USGN-01 (W62–69), USGN-08 (W63–70), UDPD-07 (W64–66) |
| Integrate | — |
| Manufacture | — |
| Silicon validation | UBUP-04 (W102–105), UCMP-04 (W114–124) |
| IP release | UPRE-02 (W54–60) |

**logicalPhy**

| Band | Activities (weeks) |
| --- | --- |
| Define | UREQ-06 (W7–12), UARC-03 (W12–18), UARC-04 (W13–18), UARC-05 (W13–19), UARC-08 (W14–19), UARC-10 (W14–20) |
| Enable | — |
| Design & verify | URTL-04 (W22–42), URTL-05 (W24–44), URTL-07 (W24–44), URTL-06 (W26–46), UDFT-01 (W26–30), URTL-08 (W28–46), UDFT-02 (W28–44), UDFT-03 (W28–42), UDFT-05 (W30–46), UDV-03 (W30–52), UDV-05 (W32–52), UDFT-07 (W34–48), UDV-08 (W34–52), UDV-06 (W36–54), UAMS-03 (W40–54), UDFT-08 (W48–52), UDV-10 (W48–58) |
| Implement | UDPD-03 (W52–58), UDPD-06 (W62–66) |
| Integrate | — |
| Manufacture | — |
| Silicon validation | UBUP-02 (W99–101), UBUP-03 (W100–103), UCHR-06 (W108–116), UCHR-07 (W110–118), UCMP-03 (W113–121) |
| IP release | — |

**afe**

| Band | Activities (weeks) |
| --- | --- |
| Define | UREQ-08 (W6–11), UARC-06 (W11–18), UARC-07 (W12–19) |
| Enable | UTEC-01 (W6–12), UTEC-02 (W8–14), UFND-01 (W8–16), UFND-04 (W10–18) |
| Design & verify | UAFE-01 (W18–24), UAFE-02 (W22–42), UAFE-03 (W22–42), UAFE-04 (W22–44), UAFE-10 (W22–44), UAFE-05 (W24–42), UAFE-06 (W24–40), UAFE-11 (W24–40), UAFE-12 (W26–40), UAFE-07 (W28–44), UDFT-04 (W30–44), UAFE-08 (W32–46), UDFT-06 (W32–46), UAMS-01 (W34–40), UAMS-02 (W38–52), UAMS-05 (W44–56), UAFE-09 (W46–50), UAMS-06 (W46–56), UAMS-07 (W52–58), UAMS-08 (W56–60) |
| Implement | ULAY-01 (W44–50), ULAY-02 (W50–60), ULAY-03 (W52–62), ULAY-05 (W58–66), ULAY-06 (W62–66), USGN-02 (W62–69), USGN-03 (W63–70), USGN-04 (W63–70), USGN-05 (W64–70), ULAY-07 (W66–68) |
| Integrate | — |
| Manufacture | — |
| Silicon validation | UBUP-05 (W101–106), UCHR-01 (W102–104), UCHR-02 (W104–114), URLQ-03 (W104–112), UCHR-03 (W106–116), UCHR-04 (W106–114), UCHR-11 (W106–116), URLQ-02 (W106–124), UCHR-05 (W108–118), UCMP-02 (W112–120), UCHR-09 (W114–120), UCHR-10 (W118–122) |
| IP release | UPRE-04 (W72–76), UGA-02 (W124–129) |

**channel**

| Band | Activities (weeks) |
| --- | --- |
| Define | UREQ-03 (W5–10), UARC-09 (W13–19) |
| Enable | UTEC-03 (W8–16), UTEC-04 (W10–18) |
| Design & verify | UAMS-04 (W42–56) |
| Implement | ULAY-04 (W56–64), USGN-06 (W65–70) |
| Integrate | UCHN-01 (W16–26), UCHN-02 (W20–32), UCHN-03 (W32–36), UCHN-04 (W32–52), UCHN-05 (W34–54), UCHN-06 (W46–64), UCHN-07 (W52–66), UCHN-08 (W66–70) |
| Manufacture | — |
| Silicon validation | URLQ-04 (W106–124), UCHR-08 (W110–118) |
| IP release | UPRE-05 (W68–76) |

**testchip**

| Band | Activities (weeks) |
| --- | --- |
| Define | — |
| Enable | UTEC-05 (W12–18) |
| Design & verify | — |
| Implement | — |
| Integrate | UTCI-01 (W48–52), UTCI-02 (W50–60), UTVP-01 (W50–64), UTCI-03 (W54–66), UTVP-08 (W54–68), UTVP-03 (W56–80), UTCI-04 (W58–70), UTVP-04 (W58–84), UTVP-02 (W60–84), UTVP-09 (W60–90), UTCI-05 (W64–74), UTVP-05 (W64–88), UTVP-06 (W70–88), UTCI-06 (W72–74), UTVP-07 (W88–92) |
| Manufacture | UTPO-02 (W72–74), UTPO-03 (W73–76), UTPO-04 (W74–76), UFAB-01 (W76–90), UFAB-02 (W90–92), UFAB-03 (W91–97), UFAB-04 (W95–97), UFAB-05 (W96–98) |
| Silicon validation | UBUP-01 (W98–99) |
| IP release | — |

**program**

| Band | Activities (weeks) |
| --- | --- |
| Define | UCON-01 (W0–4), UCON-02 (W0–4), UCON-03 (W2–6), UCON-04 (W2–6), UCON-05 (W3–7), UREQ-01 (W4–8), UREQ-02 (W5–10), UCON-06 (W6–8), UREQ-04 (W6–11), UREQ-07 (W7–12), UREQ-09 (W11–14), UARC-11 (W16–20), UARC-12 (W20–22) |
| Enable | UFND-06 (W12–20), UTEC-06 (W16–20), UFND-07 (W20–22) |
| Design & verify | — |
| Implement | USGN-07 (W70–72) |
| Integrate | — |
| Manufacture | UTPO-01 (W72–74), UTPO-05 (W74–76) |
| Silicon validation | URLQ-01 (W102–104), UBUP-07 (W104–106), UBUP-06 (W105–106), UCMP-01 (W110–113), URLQ-05 (W122–126), UCMP-05 (W123–126), URLQ-06 (W126–128) |
| IP release | UPRE-01 (W52–56), UCUS-01 (W56–116), UPRE-03 (W58–72), UPRE-09 (W58–61), UPRE-06 (W62–76), UCUS-03 (W62–136), UCUS-07 (W66–136), UPRE-07 (W74–77), UPRE-08 (W76–78), UCUS-02 (W76–128), UCUS-04 (W76–136), UCUS-06 (W78–136), UCUS-08 (W108–118), UGA-03 (W125–130), UGA-01 (W126–129), UGA-04 (W129–131), UGA-05 (W131–132), UCUS-05 (W136–140) |

### V3 — producer → consumer

Inputs named in a write-up's consumes list that are linked only as runsWith or revisedBy: 3 — UAFE-07 → UAFE-12, UDPD-06 → ULAY-06, UCUS-06 → UGA-04

Named inputs: 917. Producer finishes before the consumer finishes: 902. Producer finishes after (an interim output is consumed): 15.

| Producer (ends) | Consumer (ends) | Consumes |
| --- | --- | --- |
| UARC-06 (W18) | UFND-01 (W16) | Draft clocking architecture from UARC-06 |
| UARC-02 (W18) | UFND-02 (W16) | Draft D2D Adapter architecture and retry depth from UARC-02 |
| UAFE-05 (W42) | UAFE-11 (W40) | Bias and supply regulation from UAFE-05 |
| UAFE-05 (W42) | UAFE-12 (W40) | Bias and reference design from UAFE-05 |
| UAFE-07 (W44) | UAFE-12 (W40) | Analog control register specification from UAFE-07 |
| URTL-02 (W42) | UDV-02 (W34) | First Adapter and Logical PHY RTL drops from URTL-02 and URTL-04 |
| URTL-04 (W42) | UDV-02 (W34) | First Adapter and Logical PHY RTL drops from URTL-02 and URTL-04 |
| UAFE-02 (W42) | UAMS-01 (W40) | TX driver schematic database from UAFE-02 |
| UAFE-03 (W42) | UAMS-01 (W40) | RX front-end and sampler database from UAFE-03 |
| UAFE-04 (W44) | UAMS-01 (W40) | Clocking and PLL databases from UAFE-04 and UAFE-10 |
| UAFE-10 (W44) | UAMS-01 (W40) | Clocking and PLL databases from UAFE-04 and UAFE-10 |
| UAFE-07 (W44) | UAMS-01 (W40) | Analog control register specification and sensor thresholds from UAFE-07 and UAFE-12 |
| ULAY-06 (W66) | UDPD-05 (W64) | Early front-end timing models and abstracts released by ULAY-06, refreshed as the layout closes |
| UBUP-05 (W106) | UCHR-01 (W104) | Bring-up results against plan and predictions, with agreed corner changes, from UBUP-05 |
| UCUS-06 (W136) | UGA-04 (W131) | Errata and workarounds from the errata and patch process in UCUS-06 |

Isolated activities: none
Deliverables whose producer feeds nothing downstream: UCUS-D5 (UCUS-05)

### V4 — gates and their exit criteria

| Stage | Gate | Week | Closed by | Exit criteria |
| --- | --- | --- | --- | --- |
| UCON | IP Program Go | W8 | UCON-06 Program Risk Assessment and IP Program Go / No-Go Review | Decision recorded as go, conditional go or no-go with sponsor signatures · Every condition has an owner and a due date · Kill criteria for later gates recorded |
| UREQ | Requirements Baseline | W14 | UREQ-09 Requirements Traceability Matrix and Requirements Baseline Review | Every requirement traced to a need and a verification owner · No unresolved conflict between requirements · Baseline under change control with an approved version |
| UARC | Architecture Freeze ★ | W22 | UARC-12 Architecture Review and Architecture Freeze | Every requirement mapped to an architecture decision · No open question without an owner and a due date · Specifications frozen under change control with an approved version |
| UTEC | Technology Selected | W20 | UTEC-06 Technology Risk Assessment and Technology Selection Review | Every technology choice recorded with its alternatives considered · Every open risk scored and assigned an owner and date · Selection signed by circuit, packaging, program and product leads |
| UFND | Design Kickoff Ready | W22 | UFND-07 Design Kickoff Readiness Review | Every kickoff criterion marked met or accepted with an owner and date · Readiness decision recorded and signed by the design leads · Open items entered in the program risk register |
| UAFE | Circuit Freeze | W50 | UAFE-09 Circuit Review and Circuit Freeze | Every block meets its margin with a recorded allowance for layout parasitics, checked at the worst Monte Carlo sample · Waivers and carried issues recorded with an owner each · Schematics frozen and released to layout under change control |
| URTL | RTL Freeze | W52 | URTL-10 RTL Freeze Review | Every requirement traced to implemented RTL and the agreed functional coverage reached · No open high-priority bug, a falling bug-arrival rate, and every remaining bug with an owner, a severity and a fix release · Database tagged and rebuilt from the tag into the same netlist |
| UDFT | DFT Freeze | W52 | UDFT-08 DFT Review and DFT Freeze | Every feature in the specification implemented and covered by verification · Projected coverage at or above target, or each shortfall waived with a plan · DFT frozen on the same database tag as the RTL |
| UDV | Verification Closure | W60 | UDV-12 Verification Sign-Off Review | Agreed functional and code coverage reached, no open high-priority bug, and every other bug fixed, waived with justification or deferred with a release note · Compliance scenarios passing, the post-freeze ECO log closed, and the residual risk per feature accepted by architecture · Sign-off decision recorded against the frozen RTL revision |
| UAMS | Link Margin Review | W60 | UAMS-08 Link Margin Review | Eye height and width at the target BER and Monte Carlo yield meet the agreed thresholds for every supported package type, or the shortfall is recorded with the restriction it imposes · Required design changes owned and dated in layout · No open co-simulation failure without a disposition |
| UDPD | Digital Timing Closure | W66 | UDPD-07 Digital Timing Closure Review | Every residual violation fixed or waived with a written reason, and every post-freeze ECO in the reviewed database · Hand-off to signoff accepted by the signoff engineer · Decision recorded against the database revision |
| ULAY | Layout Complete | W68 | ULAY-07 Layout Completion Review | Every block’s post-layout margin accepted or waived with an owner · Every open rule check listed for signoff · Macro and views released to signoff at one database revision |
| USGN | Hard Macro Signoff ★ | W72 | USGN-07 Hard Macro Signoff Review | Signoff decision recorded with every waiver and its owner · One database revision named for the test chip, the tapeout and the v0.9 release · Conditions carried into the tapeout checklist and the release notes |
| UCHN | Channel Spec Met | W70 | UCHN-08 Channel Specification Compliance Review | Every supported package type meets the channel specification or has a waiver with its margin · Supply noise within budget on every PHY supply · Compliance decision recorded and passed to hard macro signoff |
| UTCI | Test Chip Ready | W74 | UTCI-06 Test Chip Readiness Review | Every coverage-map item traced to a feature present in the final database · Test vehicle bump map and bring-up register map confirmed against the database · Readiness decision recorded with the waivers passed to the tapeout checklist |
| UTVP | Hardware Ready | W92 | UTVP-07 Hardware Readiness Review | Every long-lead item complete or with a workaround that lands before silicon is in hand · All hardware confirmed against the final test chip database · Open items recorded with owners and dates |
| UTPO | Tapeout ★ | W76 | UTPO-04 Database Release and Foundry Handoff | Foundry intake acceptance received in writing · Submitted database checksum identical to the checked database · Data preparation on the PHY layers reviewed and approved |
| UFAB | Silicon in Hand | W98 | UFAB-05 First Samples Received in the Lab | Every received unit logged with wafer, split, assembly and board serial · Units allocated to bring-up, characterization, compliance and reliability per plan · First units handed to bring-up with silicon in hand recorded |
| UBUP | First Link-up | W106 | UBUP-06 First Link-Up Review | First link-up declared on named units with the link active at 64 GT/s · Every open issue and workaround has an owner and a decision on whether it blocks characterization · Units allocated to characterization, compliance and reliability, with repaired lanes identified |
| UCHR | Characterization Report | W122 | UCHR-10 Characterization Report Review | Every PPA target reported as met or missed with the measured value, its conditions and the package type it was measured on · Every open deviation listed with an owner and its effect on the release · Report released and handed to the production release rollup |
| UCMP | Compliance Pass | W126 | UCMP-05 Compliance Results Review | Every requirement in scope recorded as passed, failed or waived with a reason · Every waiver approved with its effect on the release stated · Compliance pass decision recorded and handed to the production release review |
| URLQ | Silicon-Proven ★ | W128 | URLQ-06 Silicon-Proven Decision Review | Silicon-proven decision recorded against the reliability, characterization and compliance evidence, with the lots and sample counts behind it · Every condition on the claim written for the production release notes · Every open finding assigned an owner and a disposition |
| UPRE | v0.9 Release | W78 | UPRE-08 v0.9 Release Decision | Every v0.9 release criterion recorded as met or waived with customer impact · Go or no-go decision recorded with attendees · v0.9 delivered to every entitled licensee |
| UGA | IP Production Release ★ | W132 | UGA-05 Production Release Approval Review | Characterization, compliance and reliability each recorded as passed against the production release criteria · Production release decision recorded with any conditions and the open errata it accepts · Production release package published to every licensee |
| UCUS | Sustaining Handover | W140 | UCUS-05 Sustaining Handover Review | Every open issue and customer commitment has a named owner in sustaining · Every release rebuilt successfully from the handed-over archive · Support model with staffing and response targets signed by sustaining and product management |

### V5 — critical path

Into production release approval (UGA-05): logic finish W132, template finish W132.

| Activity | Item | Logic weeks | Template weeks | Wait |
| --- | --- | --- | --- | --- |
| UCON-01 Market and Customer Requirements Capture — Chiplet Interconnect Demand, Target SoCs and Package Types | program | W0–4 | W0–4 | — |
| UREQ-01 Target UCIe Revision and Feature Selection — 64 GT/s, x64 Advanced Module, Module Count, Flit and Raw Formats and Protocol Support | program | W4–8 | W4–8 | FS |
| UREQ-02 PPA Targets — Shoreline Bandwidth Density, Energy per Bit, Area and Latency | program | W5–10 | W5–10 | FF |
| UTEC-01 Process Node and Metal Stack Selection | afe | W6–12 | W6–12 | FF |
| UFND-02 Standard Cells, Memories and Retry Buffer Memory Compilers | adapter | W8–16 | W8–16 | FF |
| UFND-03 Digital Implementation Flow Readiness | adapter | W10–18 | W10–18 | FF |
| UFND-06 Design and Verification Environment — Repositories, Regression and Configuration Management | program | W12–20 | W12–20 | FF |
| URTL-01 RTL Coding Guidelines, Block Specifications and Register Map | adapter | W20–26 | W20–26 | FS |
| URTL-02 D2D Adapter RTL — CRC, Retry Buffer, Arbitration and Multiplexing | adapter | W22–42 | W22–42 | FF |
| URTL-09 Lint, CDC and RDC Clean-Up | adapter | W34–50 | W34–50 | FF |
| URTL-10 RTL Freeze Review | adapter | W48–52 | W48–52 | FF |
| UDPD-02 Final Synthesis and Netlist Release | adapter | W52–56 | W52–56 | FS |
| UDPD-04 Place and Route | adapter | W56–62 | W56–62 | FS |
| UDPD-05 Timing Closure Across Corners and Modes | adapter | W58–64 | W58–64 | FF |
| UDPD-06 Digital Hard Macro Hardening and Abstract Generation | logicalPhy | W62–66 | W62–66 | FF |
| UTCI-03 Test Chip Top-Level Integration — PHY Macros, Pads, Bumps and Power | testchip | W54–66 | W54–66 | FF |
| UTCI-05 Test Chip Physical Design and Signoff | testchip | W64–74 | W64–74 | FF |
| UTPO-04 Database Release and Foundry Handoff | testchip | W74–76 | W74–76 | FS |
| UFAB-01 Wafer Fabrication and Wafer Bumping Tracking | testchip | W76–90 | W76–90 | FS |
| UFAB-02 Wafer Sort and Known-Good-Die Selection | testchip | W90–92 | W90–92 | FS |
| UFAB-03 Test Vehicle Package Assembly — Every Variant | testchip | W91–97 | W91–97 | FF |
| UFAB-04 Board Assembly and Inspection | testchip | W95–97 | W95–97 | FF |
| UFAB-05 First Samples Received in the Lab | testchip | W96–98 | W96–98 | FF |
| UBUP-01 Power-On and Supply Sequencing | testchip | W98–99 | W98–99 | FS |
| UBUP-02 Sideband Link-Up and Register Access | logicalPhy | W99–101 | W99–101 | FS |
| UBUP-03 Mainband Training — MBINIT and MBTRAIN | logicalPhy | W100–103 | W100–103 | FF |
| UBUP-04 First Link-Up and Basic Data Transfer | adapter | W102–105 | W102–105 | FF |
| UBUP-06 First Link-Up Review | program | W105–106 | W105–106 | FS |
| URLQ-02 High-Temperature Operating Life Stress | afe | W106–124 | W106–124 | FS |
| URLQ-05 Reliability Report | program | W122–126 | W122–126 | FF |
| UGA-01 Silicon Data Rollup into the Release Package | program | W126–129 | W126–129 | FS |
| UGA-02 Silicon Report and Characterization Summary | afe | W124–129 | W124–129 | FF |
| UGA-03 Final Release Package — Views, Models and Documents Updated to Silicon | program | W125–130 | W125–130 | FF |
| UGA-04 Production Release QA | program | W129–131 | W129–131 | FF |
| UGA-05 Production Release Approval Review | program | W131–132 | W131–132 | FS |

The planned spine, stage by stage, with total float into production release approval:

| Stage | Gate activity | Weeks | Float into production release (weeks) |
| --- | --- | --- | --- |
| ucieRequirements | UREQ-09 Requirements Traceability Matrix and Requirements Baseline Review | W11–14 | 0 |
| ucieArchitecture | UARC-12 Architecture Review and Architecture Freeze | W20–22 | 0 |
| ucieAfe | UAFE-09 Circuit Review and Circuit Freeze | W46–50 | 0 |
| ucieRtl | URTL-10 RTL Freeze Review | W48–52 | 0 |
| ucieDv | UDV-12 Verification Sign-Off Review | W56–60 | 10 |
| ucieAms | UAMS-08 Link Margin Review | W56–60 | 8 |
| ucieSignoff | USGN-07 Hard Macro Signoff Review | W70–72 | 0 |
| ucieTestChip | UTCI-06 Test Chip Readiness Review | W72–74 | 0 |
| ucieTapeout | UTPO-04 Database Release and Foundry Handoff | W74–76 | 0 |
| ucieFab | UFAB-05 First Samples Received in the Lab | W96–98 | 0 |
| ucieBringup | UBUP-06 First Link-Up Review | W105–106 | 0 |
| ucieCharacterization | UCHR-10 Characterization Report Review | W118–122 | 2 |
| ucieCompliance | UCMP-05 Compliance Results Review | W123–126 | 3 |
| ucieReliability | URLQ-06 Silicon-Proven Decision Review | W126–128 | 1 |
| ucieGa | UGA-05 Production Release Approval Review | W131–132 | 0 |

Float on the channel and the test vehicle:

| Activity | Weeks | Float into production release | Float into tapeout (UTPO-04) | Float into silicon in hand (UFAB-05) |
| --- | --- | --- | --- | --- |
| UCHN-01 Channel Specification — Voltage Transfer Function Loss, Crosstalk, Reach and Eye Mask | W16–26 | 0 | 0 | 0 |
| UCHN-02 Bump and Routing Design Rules for Bridge, Interposer and RDL Packages | W20–32 | 0 | 0 | 0 |
| UCHN-03 Bump Map and Channel Specification Freeze | W32–36 | 0 | 0 | 0 |
| UCHN-04 Package Channel Extraction and SI Simulation | W32–52 | 0 | 0 | 0 |
| UCHN-05 Power Delivery Network and PI Analysis | W34–54 | 0 | 0 | 0 |
| UCHN-06 Customer Channel Guidelines and Reference Design | W46–64 | 2 | 2 | 2 |
| UCHN-07 Test Vehicle Channel Correlation Plan | W52–66 | 0 | 0 | 0 |
| UCHN-08 Channel Specification Compliance Review | W66–70 | 0 | 0 | 0 |
| UTVP-01 Test Vehicle Package Design — Bridge and Interposer Variants, a Reversed-Orientation Build and the Partner Die | W50–64 | 14 | 14 | 14 |
| UTVP-02 Substrate Procurement, Bridge and Interposer Fabrication and Partner Die Supply | W60–84 | 21 | — | 21 |
| UTVP-03 Evaluation Board Design and Fabrication | W56–80 | 3 | — | 3 |
| UTVP-04 ATE Load Board and Probe Card | W58–84 | 1 | — | 1 |
| UTVP-05 Lab Equipment and Automation Readiness | W64–88 | 6 | — | 6 |
| UTVP-06 Bring-Up Plan and Test Programs from the Pre-Silicon Test Plan | W70–88 | 6 | — | 6 |
| UTVP-07 Hardware Readiness Review | W88–92 | 4 | — | 4 |
| UTVP-08 Bridge and Interposer Design Signoff and Tapeout for the Test Vehicle | W54–68 | 21 | — | 21 |
| UTVP-09 Reliability Stress Boards, Sockets and Package Final Test Program | W60–90 | 1 | — | 1 |

### V6 — schedule and effort realism

| Stage | Weeks | Activities | Step weeks / window (min–max) | Effort (man-months) |
| --- | --- | --- | --- | --- |
| UCON | W0–8 | 6 | 0.88–1.00 | 12 |
| UREQ | W4–14 | 9 | 0.70–1.00 | 20 |
| UARC | W10–22 | 12 | 0.70–1.00 | 32 |
| UTEC | W6–20 | 7 | 0.75–1.00 | 19 |
| UFND | W8–22 | 7 | 0.69–0.94 | 24 |
| UAFE | W18–50 | 12 | 0.75–1.00 | 91 |
| URTL | W20–52 | 10 | 0.75–1.00 | 50 |
| UDFT | W26–52 | 8 | 0.75–0.93 | 32 |
| UDV | W22–60 | 12 | 0.78–0.95 | 70 |
| UAMS | W34–60 | 8 | 0.70–1.00 | 45 |
| UDPD | W46–66 | 8 | 0.75–0.92 | 22.5 |
| ULAY | W44–68 | 7 | 0.90–1.00 | 34.5 |
| USGN | W62–72 | 8 | 0.79–1.00 | 24 |
| UCHN | W16–70 | 8 | 0.64–1.00 | 41 |
| UTCI | W48–74 | 6 | 0.70–1.00 | 26 |
| UTVP | W50–92 | 9 | 0.63–0.93 | 52 |
| UTPO | W72–76 | 5 | 0.75–1.00 | 6 |
| UFAB | W76–98 | 5 | 0.92–1.00 | 12 |
| UBUP | W98–106 | 7 | 0.67–1.00 | 11 |
| UCHR | W102–122 | 11 | 0.70–1.00 | 39 |
| UCMP | W110–126 | 5 | 0.80–1.00 | 23.5 |
| URLQ | W102–128 | 6 | 0.88–1.00 | 18.5 |
| UPRE | W52–78 | 9 | 0.67–1.00 | 43.5 |
| UGA | W120–132 | 5 | 0.75–1.00 | 23 |
| UCUS | W56–140 | 8 | 0.77–0.90 | 95 |

Peak staffing by owner — effort spread evenly over each window, in full-time people (man-months per week × 52 / 12):

| Owner | Total man-months | Peak people | Peak weeks |
| --- | --- | --- | --- |
| Analog and mixed-signal | 104 | 17.7 | W28–40 |
| Physical design | 58 | 17.3 | W65–66 |
| Design verification | 80 | 16.2 | W50–52 |
| Validation | 62 | 13.6 | W110–114 |
| IP architecture | 29 | 12.2 | W14–15 |
| RTL design | 50 | 10.5 | W34–42 |
| Analog layout | 29 | 10.3 | W56–60 |
| Mixed-signal verification | 54 | 10.0 | W44–46 |
| Customer engineering | 101 | 10.0 | W126–128 |
| Compliance and interoperability | 28 | 10.0 | W114–120 |
| Product management | 14 | 9.8 | W2–4 |
| DFT | 34 | 8.7 | W34–42 |
| Program management | 13 | 8.7 | W131–132 |
| Technical documentation | 29 | 7.5 | W125–130 |
| SI/PI | 51 | 7.5 | W46–52 |
| Test engineering | 17 | 6.5 | W90–92 |
| Quality | 8 | 6.5 | W129–131 |
| Design methodology and CAD | 11 | 6.0 | W12–18 |
| Test chip integration | 14 | 5.3 | W50–52 |
| Packaging | 38 | 5.2 | W13–16 |
| Technology and foundry | 13 | 5.1 | W8–12 |
| Reliability | 20 | 4.8 | W122–124 |
| Board and lab hardware | 10 | 4.3 | W95–97 |

Total engineering effort: 867 man-months over 140 weeks.
