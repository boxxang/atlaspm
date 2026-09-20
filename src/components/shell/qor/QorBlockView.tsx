'use client';

/**
 * By block: two column charts counting the same blocks, and the table under
 * them. The charts are drawn against the same total so a bar's height means
 * the same thing in either, and each column carries its own number so nothing
 * has to be read off an axis.
 */
import { useMemo, useState } from 'react';
import { statusOf, type QorRollup } from '@/lib/qor/rollup';
import {
  MEASURES,
  PNR_FILL,
  PNR_STAGES,
  QOR_STATUSES,
  QOR_STATUS_LABEL,
  type MeasureKey,
  type QorBlockRow,
  type QorStatus,
} from '@/lib/qor/schema';
import { SETS, SET_KEYS, SET_LABEL, type SetCol, type SetKey } from '@/lib/qor/sets';
import { QorStatusChip } from './QorChipView';

const nn = (v: number | null | undefined): v is number => v !== null && v !== undefined;
const fmtM = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : `${Math.round(n / 1000)}K`);

const STATUS_FILL: Record<QorStatus, string> = {
  clean: 'var(--ok)',
  watch: 'var(--warn)',
  fail: 'var(--risk)',
  partial: 'var(--ink-3)',
  none: 'var(--ink-4)',
};

function Column({ n, total, fill, tip }: { n: number; total: number; fill: string; tip: string }) {
  return (
    <div className="qor-col" title={tip}>
      <span className={`v ${n ? '' : 'zero'}`}>{n}</span>
      <span className="bar" style={{ height: `${total ? (n / total) * 100 : 0}%`, background: n ? fill : 'var(--shade)' }} />
    </div>
  );
}

function Chart({ title, cols }: { title: string; cols: { label: string; n: number; fill: string; total: number }[] }) {
  return (
    <div className="qor-panel">
      <h2>{title}</h2>
      <div className="qor-chart" role="img" aria-label={title}>
        {cols.map((c) => (
          <Column key={c.label} n={c.n} total={c.total} fill={c.fill} tip={`${c.label} — ${c.n} of ${c.total} blocks`} />
        ))}
      </div>
      <div className="qor-labels">{cols.map((c) => <span key={c.label}>{c.label}</span>)}</div>
    </div>
  );
}

const scnOf = (r: QorBlockRow, which: 'setup' | 'hold') => {
  const c = which === 'setup' ? r.setupCorner : r.holdCorner;
  const m = which === 'setup' ? r.setupMode : r.holdMode;
  return c || m ? [c, m].filter(Boolean).join(' · ') : '—';
};

/** The thresholds that turn a number red or amber, per measure. */
function tone(k: MeasureKey, v: number, targets: Partial<Record<MeasureKey, number>>, row: QorBlockRow): string {
  const t = (key: MeasureKey) => targets[key] ?? MEASURES[key].target ?? 0;
  switch (k) {
    case 'wns': return v < -40 ? 'bad' : v < 0 ? 'warnv' : '';
    case 'tns': return v < -4 ? 'bad' : '';
    case 'holdW': return row.holdV ? 'warnv' : '';
    case 'holdV': return v ? 'warnv' : '';
    case 'holdTns': return v < -1 ? 'bad' : '';
    case 'overflow': return v > 2.5 ? 'bad' : v > 1.2 ? 'warnv' : '';
    case 'drc': return v > 400 ? 'bad' : '';
    case 'util': return v > 88 ? 'bad' : v > 82 ? 'warnv' : '';
    case 'maxTran': return v > 200 ? 'bad' : v ? 'warnv' : '';
    case 'maxCap': return v > 120 ? 'bad' : v ? 'warnv' : '';
    case 'maxFanout': return v ? 'warnv' : '';
    case 'minPeriod': case 'mpw': return v ? 'bad' : '';
    case 'worstTran': case 'irStatic': case 'irDynamic': case 'skew': return v > t(k) ? 'bad' : '';
    case 'runtime': case 'ecoRounds': return v > t(k) ? 'warnv' : '';
    case 'budget': return 'flat';
    default: return '';
  }
}

function Cell({ c, row, was, targets }: { c: SetCol; row: QorBlockRow; was: QorBlockRow | null; targets: Partial<Record<MeasureKey, number>> }) {
  if (c.key === 'delta') {
    if (!was || !nn(row.wns) || !nn(was.wns)) return <span className="right qor-delta flat">—</span>;
    const d = row.wns - was.wns;
    return <span className={`right qor-delta ${d > 0 ? 'up' : d < 0 ? 'down' : 'flat'}`}>{d > 0 ? '+' : ''}{d}</span>;
  }
  if (c.key === 'pgap') {
    if (!nn(row.power) || !nn(row.budget)) return <span className="right num flat">—</span>;
    const g = row.power - row.budget;
    return <span className={`right num ${g > 0 ? 'bad' : ''}`}>{g > 0 ? '+' : ''}{g}</span>;
  }
  if (c.key === 'setupScn') return <span className="right qor-scn">{scnOf(row, 'setup')}</span>;
  if (c.key === 'holdScn') return <span className="right qor-scn">{row.holdV ? scnOf(row, 'hold') : '—'}</span>;

  const v = row[c.key];
  if (!nn(v)) return <span className="right num flat" title="not reported">—</span>;
  const text = c.key === 'inst' ? fmtM(v)
    : ['feps', 'drc', 'maxTran', 'maxCap', 'maxFanout', 'ecos'].includes(c.key) ? v.toLocaleString()
    : String(v);
  return <span className={`right num ${tone(c.key, v, targets, row)}`}>{text}</span>;
}

export function QorBlockView({ rows, prevRows, roll, targets }: {
  rows: QorBlockRow[];
  prevRows: QorBlockRow[] | null;
  roll: QorRollup;
  targets: Partial<Record<MeasureKey, number>>;
}) {
  const [set, setSet] = useState<SetKey>('setup');
  const [filter, setFilter] = useState<QorStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: 'wns', dir: 1 });

  const cols = SETS[set];
  const wasOf = useMemo(() => {
    const m: Record<string, QorBlockRow> = {};
    if (prevRows) for (const r of prevRows) m[r.name] = r;
    return m;
  }, [prevRows]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const s of QOR_STATUSES) c[s] = 0;
    for (const r of rows) c[statusOf(r)]++;
    return c;
  }, [rows]);

  const shown = useMemo(() => {
    const rank: Record<QorStatus, number> = { fail: 0, watch: 1, partial: 2, clean: 3, none: 4 };
    let out = rows.map((r) => ({ row: r, status: statusOf(r), was: wasOf[r.name] ?? null }));
    if (filter !== 'all') out = out.filter((x) => x.status === filter);
    if (query) {
      const q = query.toLowerCase();
      out = out.filter((x) => x.row.name.toLowerCase().includes(q) || x.row.group.toLowerCase().includes(q));
    }
    const valOf = (x: (typeof out)[number]): number | null => {
      const { row, was } = x;
      if (sort.key === 'delta') return was && nn(row.wns) && nn(was.wns) ? row.wns - was.wns : null;
      if (sort.key === 'pgap') return nn(row.power) && nn(row.budget) ? row.power - row.budget : null;
      const v = row[sort.key as MeasureKey];
      return nn(v) ? v : null;
    };
    return [...out].sort((a, b) => {
      if (a.row.missing !== b.row.missing) return a.row.missing ? 1 : -1;
      let d: number;
      if (sort.key === 'name') d = a.row.name.localeCompare(b.row.name);
      else if (sort.key === 'status') d = rank[a.status] - rank[b.status];
      else if (sort.key === 'stage') d = a.row.stage - b.row.stage;
      else {
        const av = valOf(a);
        const bv = valOf(b);
        /* a value nobody reported sorts last whichever way the column points:
           it is not a large number and it is not a small one */
        if (av === null || bv === null) return av === bv ? 0 : av === null ? 1 : -1;
        d = av - bv;
      }
      return d * sort.dir;
    });
  }, [rows, wasOf, filter, query, sort]);

  const grid = ['174px', '112px', '94px', ...cols.map((c) => (c.wide ? 'minmax(152px,1.7fr)' : 'minmax(62px,1fr)'))].join(' ');
  const head = (key: string, label: string, unit?: string) => (
    <button
      key={key}
      type="button"
      data-sorted={sort.key === key ? '' : undefined}
      onClick={() => setSort((s) => (s.key === key ? { key, dir: (s.dir === 1 ? -1 : 1) as 1 | -1 } : { key, dir: 1 }))}
    >
      {label}
      {unit && <span className="u">{unit}</span>}
      <span className="ar">{sort.key === key ? (sort.dir === 1 ? '▲' : '▼') : ''}</span>
    </button>
  );

  return (
    <>
      <div className="qor-cols">
        <Chart
          title="Blocks by QoR status"
          cols={QOR_STATUSES.map((s) => ({ label: QOR_STATUS_LABEL[s], n: roll.by[s], fill: STATUS_FILL[s], total: roll.total }))}
        />
        <Chart
          title="Blocks by P&R stage"
          cols={PNR_STAGES.map((label, i) => ({ label, n: roll.stages[i], fill: PNR_FILL[i], total: roll.total }))}
        />
      </div>

      <div className="qor-toolbar">
        <button type="button" className="qor-chip" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
          All <span className="c">{counts.all}</span>
        </button>
        {(['fail', 'watch', 'clean', 'partial', 'none'] as QorStatus[]).map((s) => (
          <button key={s} type="button" className="qor-chip" aria-pressed={filter === s} onClick={() => setFilter(s)}>
            {QOR_STATUS_LABEL[s]} <span className="c">{counts[s]}</span>
          </button>
        ))}
        <input
          className="qor-search"
          type="search"
          placeholder="Filter blocks — name or subsystem…"
          aria-label="Filter blocks"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="qor-sets" role="tablist" aria-label="Measures">
          {SET_KEYS.map((k) => (
            <button key={k} role="tab" type="button" aria-selected={set === k} onClick={() => setSet(k)}>
              {SET_LABEL[k]}
            </button>
          ))}
        </span>
        <span className="qor-count">{shown.length} of {rows.length} blocks</span>
      </div>

      <div className="qor-tbl">
        <div className="qor-trow qor-thead" style={{ gridTemplateColumns: grid }}>
          {head('name', 'Block')}
          {head('stage', 'P&R stage')}
          {head('status', 'QoR')}
          {cols.map((c) => head(c.key, c.label, c.unit))}
        </div>
        <div className="qor-tbody">
          {shown.length ? shown.map(({ row, status, was }) => (
            <div key={row.name} className="qor-trow" style={{ gridTemplateColumns: grid }}>
              <span className="r-name">{row.name}<span className="r-group">{row.group}</span></span>
              {row.missing ? (
                <>
                  <span><span className="qor-stage">{PNR_STAGES[0]}</span></span>
                  <span><QorStatusChip s="none" /></span>
                  <span className="flat" style={{ gridColumn: '4 / -1' }}>not in this netlist</span>
                </>
              ) : (
                <>
                  <span>
                    <span
                      className="qor-stage"
                      style={{ background: `${PNR_FILL[row.stage]}2e`, color: row.stage === 7 ? 'var(--ok-ink)' : 'var(--ink-2)' }}
                    >
                      {PNR_STAGES[row.stage]}
                    </span>
                  </span>
                  <span><QorStatusChip s={status} /></span>
                  {cols.map((c) => <Cell key={c.key} c={c} row={row} was={was} targets={targets} />)}
                </>
              )}
            </div>
          )) : <p className="qor-empty">No block matches that filter.</p>}
        </div>
      </div>
    </>
  );
}
