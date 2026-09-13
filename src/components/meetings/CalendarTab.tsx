'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  addDaysKey,
  addMonthsKey,
  fmtDayKey,
  keyOfLocal,
  monthGrid,
  monthLabel,
  parseKey,
  WEEKDAY_SHORT,
  weekOf,
} from '@/lib/meetings/calendar';
import {
  MEETING_STATUS_LABEL,
  MEETING_STATUSES,
  MEETING_TYPE_LABEL,
  type Meeting,
} from '@/lib/meetings/types';
import { fmtZonedTime, tzLabel, zonedDayKey } from '@/lib/meetings/zonedTime';
import { useMeetingStore } from '@/store/meetingStore';
import { useAppStore } from '@/store/useAppStore';

/**
 * A month or a week of meetings.
 *
 * Built here rather than taken from a library: a calendar that only needs to
 * place titled blocks on days is a grid, and the app's own tokens draw it the
 * way the rest of the app looks. Each block says its time, type, status and
 * whether it recurs in words; its colour repeats the status and is never the
 * only thing that says it. A meeting sits on the day where it is held.
 */
export function CalendarTab({ projectId, onNew }: { projectId: string; onNew: (date: string) => void }) {
  const meetings = useMeetingStore((s) => s.meetings);
  const today = useAppStore((s) => s.today);
  const todayKey = keyOfLocal(today);
  const [mode, setMode] = useState<'month' | 'week'>('month');
  const [anchor, setAnchor] = useState(todayKey);

  const [year, month] = parseKey(anchor);
  const weeks = mode === 'month' ? monthGrid(year, month - 1) : [weekOf(anchor)];
  const byDay = useMemo(() => {
    const out = new Map<string, Meeting[]>();
    for (const m of [...meetings].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())) {
      const key = zonedDayKey(m.startsAt, m.timeZone);
      const list = out.get(key);
      if (list) list.push(m);
      else out.set(key, [m]);
    }
    return out;
  }, [meetings]);

  const step = (dir: -1 | 1) =>
    setAnchor(mode === 'month' ? addMonthsKey(anchor, dir) : addDaysKey(anchor, 7 * dir));
  const heading =
    mode === 'month' ? monthLabel(year, month - 1) : `${fmtDayKey(weeks[0][0])} – ${fmtDayKey(weeks[0][6])}`;

  return (
    <div className="mt-page" data-calendar={mode}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <div className="seg-ctl" role="group" aria-label="Move">
          <button type="button" onClick={() => step(-1)} aria-label={mode === 'month' ? 'Previous month' : 'Previous week'}>
            ‹
          </button>
          <button type="button" onClick={() => setAnchor(todayKey)}>
            Today
          </button>
          <button type="button" onClick={() => step(1)} aria-label={mode === 'month' ? 'Next month' : 'Next week'}>
            ›
          </button>
        </div>
        <h2 style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-.01em' }} data-calendar-heading>
          {heading}
        </h2>
        <span style={{ flexGrow: 1 }} />
        <div className="seg-ctl" role="group" aria-label="View">
          <button type="button" className={mode === 'month' ? 'on' : ''} aria-pressed={mode === 'month'} onClick={() => setMode('month')}>
            Month
          </button>
          <button type="button" className={mode === 'week' ? 'on' : ''} aria-pressed={mode === 'week'} onClick={() => setMode('week')}>
            Week
          </button>
        </div>
      </div>

      <div className={mode === 'week' ? 'mt-cal mt-week' : 'mt-cal'} role="grid" aria-label={heading}>
        {WEEKDAY_SHORT.map((d) => (
          <div key={d} className="mt-cal-hd" role="columnheader">
            {d}
          </div>
        ))}
        {weeks.flat().map((key) => {
          const list = byDay.get(key) ?? [];
          const out = mode === 'month' && parseKey(key)[1] !== month;
          const cls = ['mt-day', out ? 'out' : '', key === todayKey ? 'today' : ''].filter(Boolean).join(' ');
          return (
            <div key={key} className={cls} role="gridcell" data-day={key}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="mt-daynum" aria-label={fmtDayKey(key)}>
                  {Number(key.slice(8))}
                </span>
                <span style={{ flexGrow: 1 }} />
                <button
                  type="button"
                  className="btn sm"
                  style={{ height: 20, padding: '0 6px', fontSize: 11, boxShadow: 'none' }}
                  aria-label={`New meeting on ${fmtDayKey(key)}`}
                  title={`New meeting on ${fmtDayKey(key)}`}
                  onClick={() => onNew(key)}
                >
                  +
                </button>
              </span>
              {list.map((m) => (
                <Link
                  key={m.id}
                  className={`mt-ev st-${m.status}`}
                  href={`/p/${projectId}/meetings/${m.id}`}
                  title={`${m.title} — ${fmtZonedTime(m.startsAt, m.timeZone)} ${tzLabel(m.startsAt, m.timeZone)}, ${MEETING_TYPE_LABEL[m.type]}, ${MEETING_STATUS_LABEL[m.status]}${m.seriesId ? ', recurring' : ''}`}
                  data-calendar-meeting={m.id}
                >
                  <span className="t">
                    <span className="num">{fmtZonedTime(m.startsAt, m.timeZone)}</span> {m.title}
                  </span>
                  <span className="s">
                    {MEETING_TYPE_LABEL[m.type]} · {MEETING_STATUS_LABEL[m.status]}
                    {m.seriesId ? ' · ↻ Recurring' : ''}
                  </span>
                </Link>
              ))}
            </div>
          );
        })}
      </div>

      <div className="mt-meta" style={{ marginTop: 10, gap: 10 }} aria-label="Legend">
        {MEETING_STATUSES.map((s) => (
          <span key={s} className={`mt-ev st-${s}`} style={{ width: 'auto', display: 'inline-block' }}>
            <span className="t" style={{ fontWeight: 500 }}>
              {MEETING_STATUS_LABEL[s]}
            </span>
          </span>
        ))}
        <span>Times are in each meeting&rsquo;s own time zone.</span>
      </div>
    </div>
  );
}
