'use client';

import { useEffect, useState } from 'react';
import {
  COLUMN_VARS,
  DISP_DEFS,
  cloneDefaults,
  type DisplayScope,
  type DisplayValues,
} from '@/lib/displaySettings';
import { Popover } from './Popover';

const GEAR_PATH =
  'M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.12-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.12 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01A1.7 1.7 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01c.26.63.87 1.04 1.55 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51.95z';

/**
 * Display settings — Main and Dashboard hold independent values. Main writes
 * the root vars; Dashboard overrides the same vars scoped on #schedule-view
 * (custom properties inherit downward). Phase 5 hangs the dashboard off it.
 */
export function SettingsPopover({ onResetSchedule }: { onResetSchedule?: () => void }) {
  const [scope, setScope] = useState<DisplayScope>('main');
  const [disp, setDisp] = useState<Record<DisplayScope, DisplayValues>>(cloneDefaults);

  // applyDisplay(): main → :root, dash → #schedule-view
  useEffect(() => {
    const root = document.documentElement.style;
    const sv = document.getElementById('schedule-view')?.style;
    for (const d of DISP_DEFS) {
      if (d.scopes.includes('main') && disp.main[d.key] !== undefined)
        root.setProperty(d.varName, `${disp.main[d.key]}${d.unit}`);
      if (sv && d.scopes.includes('dash') && disp.dash[d.key] !== undefined)
        sv.setProperty(d.varName, `${disp.dash[d.key]}${d.unit}`);
    }
  }, [disp]);

  const resetDisplay = () => {
    setDisp(cloneDefaults());
    // also restore board + deliverables column widths
    for (const v of COLUMN_VARS) document.documentElement.style.removeProperty(v);
  };

  return (
    <Popover
      id="settings-note"
      btnId="settings-btn"
      btnClassName="pop-btn gear"
      title="Display settings"
      ariaLabel="Display settings"
      panelId="settings-panel"
      trigger={
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3.2" />
          <path d={GEAR_PATH} />
        </svg>
      }
    >
      <span className="cap">Display Settings</span>
      <div className="set-scope" id="set-scope" role="group" aria-label="Settings scope">
        {(['main', 'dash'] as const).map((s) => (
          <button
            key={s}
            data-scope={s}
            aria-pressed={scope === s}
            onClick={() => setScope(s)}
          >
            {s === 'main' ? 'Main' : 'Dashboard'}
          </button>
        ))}
      </div>
      {DISP_DEFS.map((d) => {
        const inScope = d.scopes.includes(scope);
        const value = disp[scope][d.key] ?? d.min;
        return (
          <div className="set-row" data-key={d.key} key={d.key} hidden={!inScope}>
            <span className="k">{d.label}</span>
            <input
              type="range"
              id={d.input}
              min={d.min}
              max={d.max}
              step={d.step}
              value={value}
              aria-label={d.label}
              onChange={(e) => {
                const v = Number(e.target.value);
                setDisp((prev) => ({ ...prev, [scope]: { ...prev[scope], [d.key]: v } }));
              }}
            />
            <span className="val" id={d.valEl}>
              {d.fmt(value)}
            </span>
          </div>
        );
      })}
      <div className="set-actions">
        <button id="set-reset" onClick={resetDisplay}>
          Reset display
        </button>
        <button id="sched-reset" onClick={onResetSchedule}>
          Reset schedule to baseline
        </button>
      </div>
    </Popover>
  );
}
