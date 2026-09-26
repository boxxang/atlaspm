import type { ActivityWriteUp } from '../activityDetailTypes';

export const EPKG_WRITE_UPS: Record<string, ActivityWriteUp> = {
  'EPKG-01': {
    criticalPath: true,
    purpose: [
      'Choose <b>the package the part ships in</b>—QFN, FC-CSP or WLCSP—against the pin count, the board footprint customers will accept, the cost the margin model allows and what the EVK has to carry.',
      'For an embedded processor the package is a large share of the unit cost and the first thing a customer’s board designer sees. A QFN is cheap and easy to route on a two-layer board but runs out of pins and adds lead inductance; an FC-CSP fits the GPIO count in a small footprint but brings a substrate and a finer board; a WLCSP is the smallest and cheapest to assemble but pushes the pitch onto the customer. The choice fixes the pin-out, the supplier base and the EVK, so it is made once and recorded.',
    ],
    flowNote:
      'Step 1 consolidates what the package has to carry, and step 2 compares the three options against it. Step 3 runs alongside the comparison, because an option the EVK or a customer board cannot route is eliminated whatever it costs; step 4 costs the survivors against the product cost model, and step 5 records the choice.',
    consumes: [
      'Peripheral, GPIO and interface counts from EDEF-04',
      'Customer footprint and board-class expectations from EDEF-01',
      'Unit cost target and package cost allowance from EDEF-06',
      'Pad ring budget and die size estimate from EARCH-08',
      'Package-level magnetic shielding findings from MRAM-04',
    ],
    rel: {
      'EPKG-D1':
        '<b>Package selection record.</b> The options, the comparison and the reasons for the choice are written down and released here.',
    },
    risks: [
      '<b>Pin count counted without the supplies.</b> The GPIO total fits a QFN until every always-on, eMRAM, analog and I/O supply gets its own pin and ground, and then it does not.',
      '<b>Cost compared on the package alone.</b> A cheaper package that needs a four-layer customer board or a finer-pitch assembly process moves the cost to the customer, and design-ins are lost over it.',
      '<b>WLCSP chosen without the die size settled.</b> A chip-scale package is the die, so a floorplan that grows after the choice changes the ball pattern and the board footprint with it.',
      '<b>EVK constraints checked after the choice.</b> Arduino-format boards have little room, and a package that cannot be escaped on the EVK stack-up is found only at schematic.',
      '<b>One package assumed for every market.</b> A second package variant later is a second pin-out, a second test board and a second qualification, and the choice should say whether one is planned.',
    ],
    roles: [
      { r: 'Package architect', d: 'Owns the comparison and the selection record' },
      { r: 'Product cost analyst', d: 'Costs each option against the margin model' },
      { r: 'Physical architect', d: 'Pad ring and die size constraints on each option' },
      { r: 'Board design engineer', d: 'Escape routing on the EVK and typical customer boards' },
      { r: 'Product marketing lead', d: 'Customer footprint and package-family expectations' },
    ],
    effort: [
      ['Package requirement consolidation', 0.25],
      ['QFN, FC-CSP and WLCSP comparison', 0.75],
      ['EVK and customer board constraint review', 0.25],
      ['Package cost comparison', 0.5],
      ['Selection and record', 0.25],
    ],
    entry: [
      'Peripheral and interface counts released from EDEF-04',
      'Pad ring budget available from EARCH-08',
      'Package cost allowance in the product cost model from EDEF-06',
    ],
    exit: [
      'Each option costed and checked against the EVK and customer boards',
      'Package choice signed by architecture, cost and product marketing',
      'Selection record released to pin-out, OSAT screening and the EVK team',
    ],
    dependsOn: ['EDEF-04', 'EDEF-06', 'EARCH-08'],
    dependsNote: null,
    feedsInto: ['EPKG-02', 'EPKG-03', 'EPKG-05', 'EEVB-01', 'EVK-01'],
    measuredBy: [
      'Pins available against pins required, supplies included',
      'Package cost against the allowance in the cost model',
      'Package changes requested after the selection record',
    ],
    links: {
      dependsOn: ['EDEF-04', 'EDEF-06', 'EARCH-08'],
      feedsInto: ['EPKG-02', 'EPKG-03', 'EPKG-05', 'EEVB-01', 'EVK-01'],
      runsWith: [],
      revisedBy: ['MRAM-04', 'EDEF-01'],
      feedsBackInto: [],
    },
    terms: ['QFN', 'FC-CSP', 'WLCSP', 'EVK', 'OSAT'],
  },
  'EPKG-02': {
    criticalPath: true,
    purpose: [
      'Fix <b>which signal and supply sits on which pin</b>, and the pad ring and bond pads on the die that reach them, so the package, the floorplan and every board can be drawn to one map.',
      'The pin-out is the interface the part is judged by for its whole life: customers lay boards out against it, the SDK pin-mux tables encode it and the EVK headers are wired to it. It is also where supply noise is won or lost, because the always-on and eMRAM supplies need their own pins and grounds next to the pads they feed, and a pin-out drawn for routing convenience makes that impossible.',
    ],
    flowNote:
      'Step 1 assigns the signals and step 2 places the supplies against the regulator topology; they are done in that order because the supplies take the positions they need first in practice, and the signals are then reshuffled around them. Step 3 plans the pad ring with physical design, and step 4 runs alongside it, because the EVK and applications teams review against the same draft the floorplan is being built on. Step 5 freezes the map.',
    consumes: [
      'Package selection record from EPKG-01',
      'Chip-level pad ring plan from EARCH-08',
      'Regulator topology and supply domains from PMU-03',
      'Peripheral and interface list from EARCH-03',
      'JTAG and debug pin requirements from EDFT-03',
    ],
    rel: {
      'EPKG-D2':
        '<b>Pin-out, pad ring and lead map.</b> The map is drawn, reviewed with the board teams and frozen here.',
      'EPKG-D3':
        '<b>Leadframe or substrate design database.</b> The frozen lead map is what the leadframe or substrate is routed to.',
    },
    risks: [
      '<b>Sensitive supplies share pins.</b> The always-on and eMRAM supplies pick up switching noise from the I/O ring through a shared pin, and the sleep-current and write-margin targets are missed on a correct design.',
      '<b>Pin-out frozen before the floorplan agrees.</b> A pad order that forces long core routes or crossings is changed in EPD-02 after the board teams have started, and every board that follows the old map is redrawn.',
      '<b>Pin-mux alternatives not captured.</b> A peripheral that can appear on two pins is only useful if both are in the map, and the SDK and EVK need the same table the package uses.',
      '<b>Debug and boot-mode pins left to the end.</b> JTAG and boot straps land wherever pins are left over, and the EVK and customer boards cannot reach them cleanly.',
      '<b>ESD and latch-up spacing not checked on the pad ring.</b> A supply-to-signal pad order that looks tidy can violate the I/O cell rules and is found only at ESO-06.',
    ],
    roles: [
      { r: 'Package architect', d: 'Owns the pin-out and the freeze' },
      { r: 'Physical architect', d: 'Pad ring order and bond pad placement on the die' },
      { r: 'Analog design lead', d: 'Supply and ground pin needs for the regulators and clocks' },
      { r: 'Applications engineer', d: 'Pin-mux usability on customer designs' },
      { r: 'Board design engineer', d: 'EVK header wiring and escape routing' },
    ],
    effort: [
      ['Signal pin assignment', 0.75],
      ['Supply and ground pin plan', 0.5],
      ['Pad ring and bond pad plan with physical design', 1],
      ['Board and applications review', 0.5],
      ['Freeze and release', 0.25],
    ],
    entry: [
      'Package selected in EPKG-01',
      'Pad ring plan available from EARCH-08',
      'Supply domains defined in PMU-03',
    ],
    exit: [
      'Every signal, supply and ground assigned to a pin and a pad',
      'Pad order accepted by physical design for the floorplan',
      'Map reviewed by the EVK and applications teams and frozen',
    ],
    dependsOn: ['EPKG-01', 'EARCH-08', 'PMU-03', 'EARCH-03'],
    dependsNote:
      'The pad ring order is agreed here but is only proven when EPD-02 builds the floorplan on it; a change that comes back from the floorplan is taken through the same freeze.',
    feedsInto: ['EPKG-03', 'EPD-02', 'EEVB-02', 'SDK-02', 'EVK-02'],
    measuredBy: [
      'Pin-out changes after the freeze',
      'Sensitive supplies with dedicated pins against the plan',
      'Pad ring changes requested by the floorplan',
    ],
    links: {
      dependsOn: ['EPKG-01', 'EARCH-08', 'PMU-03', 'EARCH-03'],
      feedsInto: ['EPKG-03', 'EPD-02', 'EEVB-02', 'SDK-02', 'EVK-02'],
      runsWith: [],
      revisedBy: ['EPD-02', 'EDFT-03'],
      feedsBackInto: [],
    },
    terms: ['QFN', 'eMRAM', 'JTAG', 'ESD', 'IO'],
  },
  'EPKG-03': {
    criticalPath: true,
    purpose: [
      'Draw <b>the leadframe or substrate the die sits on</b>: the routing from bond pad to pin, the wire-bond diagram or the ball map, and the database the supplier builds tooling from.',
      'On a QFN this is a leadframe and a bond diagram, and the work is mostly about wire lengths, bond angles and keeping the sensitive supplies short. On an FC-CSP it is a small substrate with its own layer count and design rules, and the work is routing the die pads to the ball grid without crossing noisy nets over quiet ones. Either way it is the longest-lead item in the package, because the tooling cannot be ordered until the database is released.',
    ],
    flowNote:
      'The four steps run in sequence: the routing is drawn first, the bond diagram or ball map follows from it, package DRC runs on the finished design against the supplier rules, and the database is released. None can start earlier because each checks the one before.',
    consumes: [
      'Frozen pin-out, pad ring and lead map from EPKG-02',
      'Package selection record from EPKG-01',
      'Supplier design rules through the OSAT screening in EPKG-05',
      'Die size and pad coordinates from EPD-02',
      'Sensitive-rail list from PMU-03',
    ],
    rel: {
      'EPKG-D3':
        '<b>Leadframe or substrate design database.</b> The routing, the bond diagram or ball map and the DRC-clean database are produced here.',
    },
    risks: [
      '<b>Long wires on the sensitive supplies.</b> Every extra millimetre of bond wire on the always-on or eMRAM supply is inductance the package model in EPKG-04 will find, and fixing it then means redrawing the bond diagram.',
      '<b>Bond angles and wire crossings outside the OSAT rules.</b> A diagram that DRC passes can still be one the bonder cannot run at yield, so the OSAT’s own rules are checked, not only the leadframe supplier’s.',
      '<b>Die pad coordinates taken from an early floorplan.</b> The pads move as the floorplan converges, and a leadframe drawn to the old coordinates is off by enough to fail bond placement.',
      '<b>Substrate layer count set by routing convenience.</b> On FC-CSP one extra layer is a large share of the package cost, and the routing should be pushed before a layer is added.',
      '<b>Exposed pad and ground paths treated as a mechanical detail.</b> On a QFN the exposed pad is the main ground and heat path, and its connection pattern matters to both.',
    ],
    roles: [
      { r: 'Package designer', d: 'Owns the routing and the design database' },
      { r: 'Package architect', d: 'Approves the design against the selection and pin-out' },
      { r: 'SI/PI engineer', d: 'Wire length and routing limits on sensitive supplies' },
      { r: 'OSAT process engineer', d: 'Bond and assembly rules the design has to meet' },
      { r: 'Physical design lead', d: 'Die pad coordinates and their changes' },
    ],
    effort: [
      ['Leadframe or substrate routing', 2],
      ['Wire-bond diagram or ball map', 1],
      ['Package DRC against supplier rules', 0.75],
      ['Database release', 0.25],
    ],
    entry: [
      'Pin-out, pad ring and lead map frozen in EPKG-02',
      'Supplier design rules in hand from the candidate OSATs',
      'Die pad coordinates available from the floorplan',
    ],
    exit: [
      'Routing complete with every pin connected to its pad',
      'Package DRC clean against the supplier and OSAT rules',
      'Design database released to modelling and to the design freeze',
    ],
    dependsOn: ['EPKG-02', 'EPKG-01'],
    dependsNote:
      'Supplier rules and die pad coordinates arrive while the routing is under way, from EPKG-05 and EPD-02; the database is re-checked against each before release.',
    feedsInto: ['EPKG-04', 'EPKG-06', 'EASSY-01'],
    measuredBy: [
      'Package DRC violations open at release',
      'Wire length on the sensitive supplies against the limit',
      'Design changes after release to the supplier',
    ],
    links: {
      dependsOn: ['EPKG-02', 'EPKG-01'],
      feedsInto: ['EPKG-04', 'EPKG-06', 'EASSY-01'],
      runsWith: ['EPKG-05'],
      revisedBy: ['EPD-02'],
      feedsBackInto: [],
    },
    terms: ['QFN', 'FC-CSP', 'DRC', 'OSAT'],
  },
  'EPKG-04': {
    criticalPath: false,
    purpose: [
      'Produce <b>the electrical and thermal models of the package</b>—parasitics per pin, supply noise on the always-on and eMRAM rails, and thermal resistance—and release them to the board and signoff teams.',
      'An ultra-low-power part does not fail on heat; it fails on noise. The always-on domain runs from a small regulator with little decoupling, and an eMRAM write draws a current pulse that the package inductance turns into a supply dip. The models are how the signoff and board teams see that before silicon, and the thermal model is kept because the highest-power mode and the datasheet still need a number.',
    ],
    flowNote:
      'Step 1 extracts the parasitics and step 2 simulates supply noise on them. Step 3 models thermal resistance alongside the noise work, because it needs only the package geometry and not the extraction, and step 4 releases both sets of models together.',
    consumes: [
      'Leadframe or substrate design database from EPKG-03',
      'Supply domains and regulator models from PMU-05',
      'eMRAM write current profile from MRAM-05',
      'Mode power budget from PMU-06',
      'Die power map from EPD-03',
    ],
    rel: {
      'EPKG-D4':
        '<b>Package electrical and thermal models.</b> The per-pin parasitics, the noise results and the thermal model are produced and released here.',
    },
    risks: [
      '<b>Noise simulated with average currents.</b> An eMRAM write or a wake from deep sleep is a step, and a model driven by averages shows margin that the step takes away.',
      '<b>Models released late for signoff.</b> ESO-08 and ESO-05 then sign off with generic package values, and the first real check is the bring-up board.',
      '<b>Board decoupling assumed rather than modelled.</b> The rail noise depends on the board as much as the package, and the EVB and EVK decoupling need to be in the loop.',
      '<b>Thermal resistance quoted for a JEDEC board only.</b> Customers use the number on small, thin boards, and a datasheet figure from a large test board overstates the headroom.',
      '<b>Model format not agreed with the users.</b> Signoff, board PI and the datasheet want different views, and a model that suits none of them is redone by each.',
    ],
    roles: [
      { r: 'SI/PI engineer', d: 'Owns the extraction, the noise simulation and the model release' },
      { r: 'Package designer', d: 'Geometry and design changes that come out of the results' },
      { r: 'Analog design lead', d: 'Regulator models and acceptable noise on each rail' },
      { r: 'Memory IP lead', d: 'eMRAM write current and supply margin' },
      { r: 'Thermal engineer', d: 'Junction-to-ambient and junction-to-case figures for the datasheet' },
    ],
    effort: [
      ['Per-pin parasitic extraction', 0.75],
      ['Supply noise simulation on sensitive rails', 1.25],
      ['Thermal resistance model', 0.5],
      ['Model release to board and signoff', 0.5],
    ],
    entry: [
      'Package routing far enough along in EPKG-03 to extract',
      'Regulator and supply models available from PMU-05',
      'eMRAM write current profile from MRAM-05',
    ],
    exit: [
      'Noise on the always-on and eMRAM rails within the analog team’s limits',
      'Thermal resistance figures for the datasheet and the highest-power mode',
      'Models released in the formats signoff and board PI use',
    ],
    dependsOn: ['EPKG-03', 'PMU-05', 'MRAM-05'],
    dependsNote: null,
    feedsInto: ['EPKG-06', 'ESO-08', 'ESO-05', 'EEVB-05', 'EVK-03'],
    measuredBy: [
      'Peak supply dip on the always-on and eMRAM rails against the limit',
      'Models delivered to signoff against the signoff start date',
      'Model-to-silicon noise correlation on the bring-up boards',
    ],
    links: {
      dependsOn: ['EPKG-03', 'PMU-05', 'MRAM-05'],
      feedsInto: ['EPKG-06', 'ESO-08', 'ESO-05', 'EEVB-05', 'EVK-03'],
      runsWith: ['EPKG-05'],
      revisedBy: ['EPD-12'],
      feedsBackInto: ['EPKG-03'],
    },
    terms: ['SI/PI', 'eMRAM', 'Rja', 'Rjc', 'LDO'],
  },
  'EPKG-05': {
    criticalPath: false,
    purpose: [
      'Choose <b>who assembles the part and how</b>: the OSAT, the assembly flow with its test insertions, and the capacity, lead time and price the engineering lots and the ramp depend on.',
      'An embedded part lives on unit cost and supply continuity, so the OSAT is a commercial decision as much as a technical one. It is also a quality decision for eMRAM, because the assembly flow has cure and reflow steps the stored trim has to survive and magnetised handling that the cells must not see.',
    ],
    flowNote:
      'Step 1 screens the OSATs for the package and the volume, and step 2 defines the assembly flow with the shortlist. Step 3 negotiates capacity and price alongside the flow definition, because the commercial terms depend on which steps and insertions are in it, and step 4 selects the OSAT and issues the specification.',
    consumes: [
      'Package selection record from EPKG-01',
      'Volume forecast and cost allowance from EDEF-06',
      'Test insertion plan from ETEST-01',
      'Reflow and retention constraints for eMRAM from MRAM-03',
      'Magnetic handling limits from MRAM-04',
    ],
    rel: {
      'EPKG-D5':
        '<b>OSAT selection and assembly specification.</b> The OSAT is chosen and the assembly flow it will run is specified here.',
    },
    risks: [
      '<b>OSAT chosen on price for the ramp alone.</b> An engineering lot needs fast turns and engineering attention, and a supplier that only wants volume gives neither.',
      '<b>Assembly thermal profile not checked against eMRAM retention.</b> Mold cure and reflow can shift the stored trim, and the flow has to be agreed against the retention data in MRAM-03.',
      '<b>Magnetic handling not specified.</b> Magnetised pick tools or fixtures near eMRAM wafers and units are a failure the OSAT will not think of unless the specification says so.',
      '<b>Single source for a high-volume embedded part.</b> A customer designing in a long-life part asks about a second source, and a flow that only one OSAT can run has no answer.',
      '<b>Test insertions left out of the flow.</b> Where open/short and final test run changes what the OSAT quotes, and adding them later reopens the price.',
    ],
    roles: [
      { r: 'Supply chain manager', d: 'Owns the selection and the commercial terms' },
      { r: 'Package architect', d: 'Technical fit of the OSAT to the package' },
      { r: 'Package engineer', d: 'Assembly flow and specification' },
      { r: 'Test engineering manager', d: 'Test insertions and where they run' },
      { r: 'Reliability engineer', d: 'eMRAM thermal and magnetic limits on the flow' },
    ],
    effort: [
      ['OSAT screening', 0.5],
      ['Assembly flow and test insertions', 0.75],
      ['Capacity, lead time and price', 0.5],
      ['Selection and assembly specification', 0.25],
    ],
    entry: [
      'Package selected in EPKG-01',
      'Volume forecast available from EDEF-06',
      'Test insertion plan drafted in ETEST-01',
    ],
    exit: [
      'OSAT selected with capacity for the engineering lots and the ramp',
      'Assembly flow specified with eMRAM thermal and magnetic limits',
      'Assembly specification issued to the OSAT',
    ],
    dependsOn: ['EPKG-01', 'EDEF-06', 'MRAM-03'],
    dependsNote: null,
    feedsInto: ['EPKG-06', 'EASSY-01', 'EASSY-03', 'EMP-08'],
    measuredBy: [
      'Engineering lot cycle time committed by the OSAT',
      'Unit assembly cost against the cost model',
      'Specification changes after issue',
    ],
    links: {
      dependsOn: ['EPKG-01', 'EDEF-06', 'MRAM-03'],
      feedsInto: ['EPKG-06', 'EASSY-01', 'EASSY-03', 'EMP-08'],
      runsWith: ['EPKG-03', 'EPKG-04', 'ETEST-01'],
      revisedBy: ['MRAM-04'],
      feedsBackInto: [],
    },
    terms: ['OSAT', 'eMRAM', 'MSL', 'RFQ'],
  },
  'EPKG-06': {
    criticalPath: true,
    purpose: [
      'Close the package: review it against the pad ring and the signoff inputs, clear the open comments, <b>freeze the design and release the tooling orders</b> so the leadframe or substrate is ready when the wafers leave the fab.',
      'Package tooling takes months, and the first engineering lot cannot be assembled without it. The freeze is set so that tooling is built while the wafers are in the fab, which only works if nothing about the package moves afterwards; a change after this point is paid for in new tooling and weeks on first samples.',
    ],
    flowNote:
      'Step 1 reviews the design against the pad ring and the signoff inputs, and step 2 closes what the review and the supplier raised. Step 3 releases the tooling orders alongside the closure, because the long-lead items can be ordered once their part of the design has no open comments, and step 4 freezes the whole package.',
    consumes: [
      'Leadframe or substrate design database from EPKG-03',
      'Package electrical and thermal models from EPKG-04',
      'OSAT selection and assembly specification from EPKG-05',
      'Final die pad coordinates from EPD-02',
      'Pin-out, pad ring and lead map from EPKG-02',
    ],
    rel: {
      'EPKG-D6':
        '<b>Package design freeze and tooling release.</b> The freeze is declared and the tooling orders placed here.',
    },
    risks: [
      '<b>Freeze declared with the floorplan still moving.</b> A pad that moves after tooling is ordered is a new leadframe or substrate, and first samples wait for it.',
      '<b>Tooling ordered before the supplier comments close.</b> An order placed early to save time is re-cut when the last comment turns out to change the design.',
      '<b>Signoff inputs not checked back into the package.</b> A noise or EM finding in signoff that needs a package change arrives after the freeze if nobody traces it back.',
      '<b>Tooling lead time quoted optimistically.</b> Leadframe and substrate suppliers fill capacity by quarter, and an order that misses a slot can move first samples past the fab out date.',
      '<b>Mechanical drawings not released with the freeze.</b> Test boards and the EVK need the outline and footprint on the same date, and a late drawing holds up both.',
    ],
    roles: [
      { r: 'Package architect', d: 'Owns the review, the freeze and its record' },
      { r: 'Package designer', d: 'Closes the DRC and supplier comments' },
      { r: 'Supply chain manager', d: 'Places the tooling orders and tracks lead time' },
      { r: 'Physical design lead', d: 'Confirms the die pads will not move again' },
      { r: 'Program manager', d: 'Holds the freeze against later change requests' },
    ],
    effort: [
      ['Design review against pad ring and signoff inputs', 0.5],
      ['DRC and supplier comment closure', 0.5],
      ['Tooling order release', 0.25],
      ['Freeze and record', 0.25],
    ],
    entry: [
      'Design database released from EPKG-03',
      'Package models released from EPKG-04',
      'OSAT selected in EPKG-05',
    ],
    exit: [
      'No open DRC or supplier comments on the design',
      'Tooling orders placed with the committed delivery dates',
      'Package design frozen with mechanical drawings released',
    ],
    dependsOn: ['EPKG-03', 'EPKG-04', 'EPKG-05', 'EPD-02'],
    dependsNote: null,
    feedsInto: ['EASSY-01', 'ETEST-05', 'EVK-01', 'EVK-02'],
    measuredBy: [
      'Package changes after the freeze',
      'Tooling delivery against the date the first wafers leave the fab',
      'Open comments at the freeze',
    ],
    links: {
      dependsOn: ['EPKG-03', 'EPKG-04', 'EPKG-05', 'EPD-02'],
      feedsInto: ['EASSY-01', 'ETEST-05', 'EVK-01', 'EVK-02'],
      runsWith: [],
      revisedBy: ['ESO-08'],
      feedsBackInto: [],
    },
    terms: ['OSAT', 'DRC', 'NRE', 'QFN'],
  },
};
