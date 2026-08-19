/**
 * /components/stageViz.ts — one schematic per stage, ported 1:1.
 * Static SVG markup with no user content; StageViz mounts it as-is.
 */
import type { StageId } from '@/data/types';

const VB = 'viewBox="0 0 440 260" preserveAspectRatio="xMidYMid meet"';
const arrow = (x: number, y: number) => `<path class="s" d="M${x} ${y} h22"/><path class="fi" d="M${x + 22} ${y - 4} l8 4 -8 4 z"/>`;

export const stageViz = {
  productDefinition: () => `<svg ${VB}>
    ${([["MARKET",46],["PERFORMANCE",92],["POWER",138],["COST",184],["SCHEDULE",230]] as [string, number][]).map(([t,y],i)=>`
      <text x="18" y="${y-8}">${t}</text>
      <path class="g" d="M18 ${y} C 110 ${y}, 150 ${130 + (i-2)*6}, 208 ${130 + (i-2)*4}"/>`).join("")}
    ${arrow(216,130)}
    <rect class="s" x="258" y="82" width="160" height="96"/>
    <text class="tk big" x="270" y="106">PPA TARGETS</text>
    <text class="tk big" x="270" y="130">COST TARGET</text>
    <text class="tk big" x="270" y="154">SCHEDULE</text>
    <text x="258" y="72">TARGET SPECIFICATION</text>
  </svg>`,

  architecture: () => `<svg ${VB}>
    <rect class="s" x="90" y="28" width="260" height="204"/>
    <rect class="g" x="104" y="42" width="130" height="86"/><text class="tk" x="112" y="60">CPU</text>
    <rect class="g" x="248" y="42" width="88" height="86"/><text class="tk" x="256" y="60">NPU</text>
    <rect class="g" x="104" y="142" width="76" height="76"/><text class="tk" x="112" y="160">MEM CTRL</text>
    <rect class="a" x="194" y="142" width="142" height="30"/><text class="tk" x="202" y="161">NOC</text>
    <rect class="g" x="194" y="186" width="142" height="32"/><text class="tk" x="202" y="205">IO / SERDES</text>
    <text x="90" y="18">SYSTEM PARTITIONING</text>
  </svg>`,

  rtl: () => `<svg ${VB}>
    <text class="tk" x="20" y="40">module top;</text>
    ${[58,74,90,106,122,138,154,170].map((y,i)=>`<path class="g" d="M32 ${y} h${[96,72,110,60,88,104,54,80][i]}"/>`).join("")}
    <text x="20" y="196">RTL SOURCE</text>
    ${arrow(178,120)}
    <rect class="gl" x="240" y="36" width="180" height="188" stroke-dasharray="4 4"/>
    <rect class="s" x="254" y="50" width="72" height="62"/><text class="tk" x="262" y="68">CPU</text>
    <rect class="s" x="338" y="50" width="68" height="62"/><text class="tk" x="346" y="68">NPU</text>
    <rect class="s" x="254" y="126" width="72" height="62"/><text class="tk" x="262" y="144">MEM</text>
    <rect class="s" x="338" y="126" width="68" height="62"/><text class="tk" x="346" y="144">IO</text>
    <text x="240" y="246">INTEGRATED BLOCKS</text>
  </svg>`,

  verification: () => `<svg ${VB}>
    <rect class="gl" x="66" y="34" width="308" height="152" stroke-dasharray="5 4"/>
    <text x="66" y="26">UVM TESTBENCH</text>
    <rect class="s" x="182" y="76" width="80" height="64"/><text class="tk" x="196" y="112">DUT</text>
    ${[92,108,124].map(y=>`<path class="g" d="M88 ${y} h78"/><path class="fi" d="M166 ${y-3} l7 3 -7 3 z"/>`).join("")}
    <text x="88" y="82">STIMULUS</text>
    ${[92,110,128].map(y=>`<text class="tk" x="286" y="${y+3}">✓ CHECK</text>`).join("")}
    <text x="66" y="212">FUNCTIONAL COVERAGE</text>
    <rect class="g" x="66" y="220" width="308" height="10"/>
    <rect class="sf" x="66" y="220" width="226" height="10"/>
    <text class="tk" x="382" y="229">73%</text>
  </svg>`,

  synthesis: () => `<svg ${VB}>
    <text class="tk" x="20" y="72">always @(posedge clk)</text>
    <text class="tk" x="20" y="92">&#160;&#160;q &lt;= a &amp; b | c;</text>
    <text x="20" y="130">RTL</text>
    ${arrow(176,110)}
    <path class="s" d="M250 60 h22 a20 20 0 0 1 0 40 h-22 z"/>
    <path class="s" d="M250 130 q18 0 30 20 q-12 20 -30 20 q8 -20 0 -40 z"/>
    <path class="s" d="M340 92 l30 18 -30 18 z"/><circle class="s" cx="375" cy="110" r="4"/>
    <path class="g" d="M230 70 h20 M230 90 h20 M230 140 h20 M230 160 h20 M294 80 h30 v22 M280 150 h44 v-32 M383 110 h30"/>
    <text x="250" y="216">TECHNOLOGY-MAPPED GATES</text>
    <text class="tk" x="250" y="240">TIMING · POWER · AREA</text>
  </svg>`,

  physicalDesign: () => `<svg ${VB}>
    <path class="s" d="M140 28 h172 l18 18 v186 h-190 z"/>
    <rect class="g" x="156" y="44" width="70" height="58"/>
    <rect class="g" x="240" y="44" width="72" height="58"/>
    <rect class="g" x="156" y="116" width="70" height="98"/>
    <rect class="g" x="240" y="116" width="72" height="44"/>
    <path class="a" d="M226 73 h14 M226 150 h14 M276 102 v14 M191 102 v14 M276 160 v22 h-36"/>
    <path class="a" d="M312 73 h10 v100"/>
    <text x="140" y="18">DIE FLOORPLAN</text>
    <text x="140" y="250">FLOORPLAN → PLACE → CTS → ROUTE</text>
  </svg>`,

  signoff: () => `<svg ${VB}>
    <path class="g" d="M150 48 h124 l16 16 v132 h-140 z"/>
    <rect class="gl" x="164" y="62" width="50" height="42"/><rect class="gl" x="226" y="62" width="50" height="42"/>
    <rect class="gl" x="164" y="116" width="50" height="64"/><rect class="gl" x="226" y="116" width="50" height="34"/>
    <path class="gl" d="M60 62 h74 M380 62 h-74 M60 198 h74 M380 198 h-74"/>
    <text class="tk" x="24" y="58">STA ✓</text>
    <text class="tk" x="386" y="58">DRC ✓</text>
    <text class="tk" x="24" y="202">LVS ✓</text>
    <text class="tk" x="386" y="202">EM/IR ✓</text>
    <text x="150" y="236">ALL CORNERS · ALL MODES</text>
  </svg>`,

  tapeout: () => `<svg ${VB}>
    <path class="sf" d="M156 52 h112 l16 16 v140 h-128 z"/>
    <path class="a" d="M172 84 h96 M172 116 h96 M172 148 h96 M172 180 h96" opacity=".45"/>
    <path class="fi" d="M220 14 l9 9 -9 9 -9 -9 z"/>
    <text class="tk big" x="240" y="27">TAPEOUT</text>
    <text class="tk" x="156" y="236">GDSII RELEASED — GO</text>
    <text x="156" y="252">DESIGN BECOMES MANUFACTURING DATA</text>
  </svg>`,

  fabrication: () => `<svg ${VB}>
    <circle class="s" cx="220" cy="126" r="100"/>
    <path class="s" d="M172 214 h96"/>
    <g clip-path="url(#wclip)">
      ${[-80,-58,-36,-14,8,30,52,74].map(o=>`<path class="gl" d="M${220+o} 26 v200"/><path class="gl" d="M120 ${126+o} h200"/>`).join("")}
      <rect class="sf" x="208" y="92" width="22" height="22"/>
      <rect class="sf" x="164" y="136" width="22" height="22"/>
      <rect class="sf" x="252" y="158" width="22" height="22"/>
    </g>
    <defs><clipPath id="wclip"><circle cx="220" cy="126" r="99"/></clipPath></defs>
    <text x="20" y="30">WAFER PROCESSING</text>
    <text class="tk" x="20" y="250">WAFER OUT → FIRST SILICON</text>
  </svg>`,

  packaging: () => `<svg ${VB}>
    <rect class="g" x="120" y="70" width="54" height="44"/><text x="120" y="62">HBM</text>
    <rect class="sf" x="192" y="60" width="106" height="54"/><text x="192" y="52">LOGIC DIE</text>
    <rect class="g" x="316" y="70" width="54" height="44"/><text x="316" y="62">HBM</text>
    ${[132,152,204,232,260,288,328,348].map(x=>`<path class="g" d="M${x} 114 v14"/>`).join("")}
    <rect class="s" x="104" y="128" width="282" height="30"/><text class="tk" x="196" y="147">INTERPOSER</text>
    ${[120,150,180,210,240,270,300,330,360].map(x=>`<circle class="g" cx="${x}" cy="166" r="2.6"/>`).join("")}
    <rect class="s" x="76" y="174" width="338" height="34"/><text class="tk" x="180" y="195">PACKAGE SUBSTRATE</text>
    ${[110,160,210,260,310,360].map(x=>`<circle class="g" cx="${x}" cy="216" r="3.4"/>`).join("")}
    <text x="76" y="250">2.5D INTEGRATION — THE JOURNEY LEAVES THE DIE</text>
  </svg>`,

  bringup: () => `<svg ${VB}>
    <rect class="s" x="56" y="148" width="328" height="62"/>
    <text class="tk" x="72" y="196">EVALUATION BOARD</text>
    <rect class="sf" x="150" y="108" width="84" height="40"/><text x="150" y="100">PACKAGED PART</text>
    <path class="g" d="M234 128 h36 v-58"/>
    <path class="a" d="M280 70 h16 v-26 h18 v26 h18 v-26 h18 v26 h16"/>
    <text x="280" y="86">MEASURE</text>
    <text class="tk" x="56" y="244">POWER-ON ✓ · BOOT ✓ · CHARACTERIZE</text>
  </svg>`,

  qualification: () => `<svg ${VB}>
    ${Array.from({length:12},(_,i)=>{
      const c=i%4, r=(i/4)|0;
      const x=36+c*54, y=48+r*54;
      const cl = i<7 ? "sf" : "s";
      return `<rect class="${cl}" x="${x}" y="${y}" width="38" height="30"/>`;
    }).join("")}
    <text x="36" y="234">VOLUME UNITS</text>
    <path class="gl" d="M282 210 h132 M282 210 v-160"/>
    <path class="a" d="M282 204 L316 192 342 168 366 122 392 62"/>
    <path class="fi" d="M392 62 l-2 12 10 -6 z"/>
    <text x="300" y="234">YIELD / RAMP</text>
    <text class="tk" x="300" y="46">MASS PRODUCTION</text>
  </svg>`,
} satisfies Record<StageId, () => string>;
