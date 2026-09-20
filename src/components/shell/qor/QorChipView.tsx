'use client';

/**
 * The full chip: six key numbers, then every measure against the target it was
 * committed to. A measure nobody reported prints as a dash and reads as Not
 * reported — never as a zero that happens to meet a target of zero.
 */
import { MEASURES, MEASURE_ORDER, QOR_STATUS_LABEL, type MeasureKey, type QorBlockRow } from '@/lib/qor/schema';
import type { QorRollup } from '@/lib/qor/rollup';

const nn = (v: number | null | undefined): v is number => v !== null && v !== undefined;
const tx = (v: number | null | undefined, u = '') => (nn(v) ? `${v}${u}` : '—');

export function QorStatusChip({ s }: { s: 'clean' | 'watch' | 'fail' | 'partial' | 'none' }) {
  return (
    <span className={`qor-st qor-st-${s}`}>
      <i />
      {QOR_STATUS_LABEL[s]}
    </span>
  );
}

function Delta({ now, before, good, digits = 0 }: { now: number | null; before: number | null | undefined; good: 'up' | 'down'; digits?: number }) {
  if (!nn(now) || !nn(before)) return <span className="qor-delta flat">—</span>;
  const d = +(now - before).toFixed(digits);
  if (d === 0) return <span className="qor-delta flat">0</span>;
  const better = good === 'down' ? d < 0 : d > 0;
  return <span className={`qor-delta ${better ? 'up' : 'down'}`}>{d > 0 ? '+' : ''}{d}</span>;
}

const scnOf = (r: QorBlockRow, which: 'setup' | 'hold') => {
  const c = which === 'setup' ? r.setupCorner : r.holdCorner;
  const m = which === 'setup' ? r.setupMode : r.holdMode;
  return c || m ? [c, m].filter(Boolean).join(' · ') : '';
};

export function QorTiles({ now, prev }: { now: QorRollup; prev: QorRollup | null }) {
  const v = now.values;
  const p = prev?.values;
  const against = (a: number | null | undefined, t: number | null | undefined, unit = '') =>
    nn(a) && nn(t) ? `${a > t ? '+' : ''}${+(a - t).toFixed(2)}${unit} against target` : 'no target to read against';

  const tiles: { cap: string; value: string; bad: boolean; sub: React.ReactNode }[] = [
    { cap: 'Setup WNS', value: tx(v.wns, ' ps'), bad: nn(v.wns) && v.wns < 0,
      sub: <><Delta now={v.wns ?? null} before={p?.wns} good="up" /> vs last drop</> },
    { cap: 'Setup TNS', value: tx(v.tns, ' ns'), bad: nn(v.tns) && v.tns < 0,
      sub: <><Delta now={v.tns ?? null} before={p?.tns} good="up" digits={1} /> vs last drop</> },
    { cap: 'Setup failing endpoints', value: nn(v.feps) ? v.feps.toLocaleString() : '—', bad: !!v.feps,
      sub: <><Delta now={v.feps ?? null} before={p?.feps} good="down" /> vs last drop</> },
    { cap: 'Total power', value: nn(v.power) ? `${(v.power / 1000).toFixed(2)} W` : '—',
      bad: nn(v.power) && nn(now.budget) && v.power > now.budget, sub: against(v.power, now.budget, ' mW') },
    { cap: 'IR drop — dynamic', value: tx(v.irDynamic, ' mV'),
      bad: nn(v.irDynamic) && v.irDynamic > (MEASURES.irDynamic.target ?? 0), sub: against(v.irDynamic, MEASURES.irDynamic.target, ' mV') },
    { cap: 'DRC after route', value: nn(v.drc) ? v.drc.toLocaleString() : '—', bad: !!v.drc,
      sub: <><Delta now={v.drc ?? null} before={p?.drc} good="down" /> vs last drop</> },
  ];

  return (
    <div className="qor-tiles">
      {tiles.map((t) => (
        <div className="qor-tile" key={t.cap}>
          <div className="cap">{t.cap}</div>
          <div className={`v ${t.value === '—' ? '' : t.bad ? 'bad' : 'good'}`}>{t.value}</div>
          <div className="sub">{t.sub}</div>
        </div>
      ))}
    </div>
  );
}

export function QorChipTable({ now, prev, targets }: {
  now: QorRollup;
  prev: QorRollup | null;
  targets: Partial<Record<MeasureKey, number>>;
}) {
  /* power is read against what the blocks were budgeted, so the chip row and
     the block rows cannot say different things */
  const targetOf = (k: MeasureKey): number | null =>
    k === 'power' ? now.budget
      : k === 'dyn' ? (nn(now.budget) ? Math.round(now.budget * 0.9) : null)
      : targets[k] ?? MEASURES[k].target;

  /* the group heading is shown on the first row of each group, decided up
     front rather than by a counter the render mutates as it goes */
  const firstOfGroup = new Set<string>();
  const seenGroups = new Set<string>();
  for (const k of MEASURE_ORDER) {
    if (seenGroups.has(MEASURES[k].group)) continue;
    seenGroups.add(MEASURES[k].group);
    firstOfGroup.add(k);
  }

  return (
    <div className="qor-qtbl">
      <div className="qor-qrow qhead">
        <span>Measure</span>
        <span className="right">Target</span>
        <span className="right">Actual</span>
        <span className="right">Against target</span>
        <span className="right">Against last drop</span>
        <span>Status</span>
        <span>Worst block · scenario</span>
      </div>
      {MEASURE_ORDER.map((k) => {
        const c = MEASURES[k];
        const head = firstOfGroup.has(k) ? c.group : null;
        const v = now.values[k] ?? null;
        const t = targetOf(k);
        const w = now.worst[k];
        const pass = !nn(t) || (c.good === 'below' ? nn(v) && v <= t : nn(v) && v >= t);
        const near = !nn(t) || !nn(v) || (c.good === 'below' ? v <= t * 1.15 : v >= -5);
        const gap = nn(v) && nn(t) ? +(v - t).toFixed(2) : null;
        return (
          <div key={k} style={{ display: 'contents' }}>
            {head && <div className="qor-qgroup">{head}</div>}
            <div className="qor-qrow">
              <span>
                <span className="m">{c.label}</span>
                {c.unit && <span className="unit">{c.unit}</span>}
              </span>
              <span className="right num flat">{tx(t)}</span>
              <span className={`right num ${nn(v) && !pass ? 'bad' : ''}`} style={{ fontWeight: 600 }}>{tx(v)}</span>
              <span className={`right num ${nn(v) && !pass ? 'bad' : ''}`}>{nn(gap) ? `${gap > 0 ? '+' : ''}${gap}` : '—'}</span>
              <span className="right">
                <Delta now={v} before={prev?.values[k] ?? null} good={c.good === 'below' ? 'down' : 'up'} digits={2} />
              </span>
              <span><QorStatusChip s={!nn(v) ? 'partial' : pass ? 'clean' : near ? 'watch' : 'fail'} /></span>
              <span className="where">
                {w ? (
                  <>
                    {w.name} · {w[k]}{c.unit}
                    {c.scn && scnOf(w, c.scn) && <span className="scnq">{scnOf(w, c.scn)}</span>}
                  </>
                ) : '—'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
