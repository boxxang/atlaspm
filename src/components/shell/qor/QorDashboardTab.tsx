'use client';

/**
 * The QoR dashboard for a stage: one netlist drop at a time, read either as
 * the whole chip or block by block.
 *
 * It holds no numbers of its own. Everything comes from a workbook the design
 * team loads — the file is parsed in the browser and stored whole — so the
 * screen is exactly as current as the last file somebody put in it, and says
 * which file that was.
 */
import { useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { parseSheets } from '@/lib/qor/parse';
import { buildWorkbook, sheetsFromFile } from '@/lib/qor/xlsx';
import { rollup } from '@/lib/qor/rollup';
import type { StageId } from '@/data/types';
import { QorChipTable, QorTiles } from './QorChipView';
import { QorBlockView } from './QorBlockView';

export function QorDashboardTab({ stageId }: { stageId: StageId }) {
  const stored = useAppStore((s) => s.qor[stageId]);
  const setQorDataset = useAppStore((s) => s.setQorDataset);
  const clearQorDataset = useAppStore((s) => s.clearQorDataset);

  const [drop, setDrop] = useState(0);
  const [view, setView] = useState<'chip' | 'block'>('chip');
  const [notes, setNotes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const data = stored?.dataset ?? null;
  const drops = data?.drops ?? [];
  /* the newest drop is the one being argued about, so that is where it opens */
  const at = Math.min(drop, Math.max(0, drops.length - 1));

  const rolls = useMemo(() => (data ? data.drops.map((d) => rollup(data.rows[d.id] ?? [])) : []), [data]);

  async function onFile(file: File) {
    setError('');
    setNotes([]);
    try {
      const sheets = await sheetsFromFile(file);
      const r = parseSheets(sheets, file.name);
      setQorDataset(stageId, file.name, r.dataset);
      setDrop(Math.max(0, r.dataset.drops.length - 1));
      const where = [r.dataset.meta.generatedby, r.dataset.meta.generatedat].filter(Boolean).join(' · ');
      setNotes([
        `${r.rows.toLocaleString()} block rows across ${r.dataset.drops.length} drops`
          + (r.unit !== 'ps' ? `, slack read in ${r.unit}` : '')
          + (where ? ` — ${where}` : ''),
        ...r.warn,
      ]);
    } catch (e) {
      setError(`${file.name}: ${e instanceof Error ? e.message : 'could not be read'}`);
    }
  }

  function download() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(buildWorkbook(data));
    a.download = 'qor-template.xlsx';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  const source = (
    <div className="qor-src">
      <span>Data</span>
      <span className="qor-srcname">{stored ? stored.fileName : 'No workbook loaded'}</span>
      <button type="button" className="qor-lnk" onClick={download}>Download template</button>
      <button type="button" className="qor-lnk" onClick={() => fileRef.current?.click()}>Load workbook…</button>
      {stored && (
        <button
          type="button"
          className="qor-lnk"
          onClick={() => { clearQorDataset(stageId); setNotes([]); setError(''); }}
        >
          Remove
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.csv"
        hidden
        onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void onFile(f); }}
      />
    </div>
  );

  if (!data) {
    return (
      <div className="qor">
        <div className="qor-srcbar"><span />{source}</div>
        <p className="mono-note">
          This tab draws one workbook: a Blocks sheet, a Drops sheet, a Targets sheet and one sheet per netlist
          drop, one row per block. Download the template to see the shape, or load a file a design script wrote —
          a flat .csv with a Drop column works too.
        </p>
        {error && <p className="qor-loadmsg"><span className="err">{error}</span></p>}
      </div>
    );
  }

  const roll = rolls[at];
  const prev = at > 0 ? rolls[at - 1] : null;
  const rows = data.rows[drops[at].id] ?? [];
  const prevRows = at > 0 ? data.rows[drops[at - 1].id] ?? null : null;

  return (
    <div className="qor">
      <div className="qor-drops" role="tablist" aria-label="Netlist drop">
        {drops.map((d, i) => (
          <button key={d.id} type="button" role="tab" className="qor-drop" aria-selected={i === at} onClick={() => setDrop(i)}>
            <span className="k">{d.label}</span>
            <span className="d">
              {[d.date, `${rolls[i].by.fail} failing`, `${rolls[i].stages[7]} complete`].filter(Boolean).join(' · ')}
            </span>
          </button>
        ))}
      </div>

      <div className="qor-srcbar">
        <div className="qor-switch" role="tablist" aria-label="What to read">
          <button type="button" role="tab" aria-selected={view === 'chip'} onClick={() => setView('chip')}>Full chip</button>
          <button type="button" role="tab" aria-selected={view === 'block'} onClick={() => setView('block')}>
            By block <span className="n">{rows.length}</span>
          </button>
        </div>
        {source}
      </div>

      {(notes.length > 0 || error) && (
        <p className="qor-loadmsg">
          {error && <span className="err">{error}</span>}
          {notes.map((n) => <span key={n}>{n}</span>)}
        </p>
      )}

      {view === 'chip' ? (
        <>
          <QorTiles now={roll} prev={prev} />
          <div className="qor-panel">
            <h2>Full-chip QoR</h2>
            <QorChipTable now={roll} prev={prev} targets={data.targets} />
          </div>
        </>
      ) : (
        <QorBlockView rows={rows} prevRows={prevRows} roll={roll} targets={data.targets} />
      )}
    </div>
  );
}
