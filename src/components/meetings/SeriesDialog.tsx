'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { keyOfLocal, WEEKDAY_SHORT } from '@/lib/meetings/calendar';
import { defaultRule, describeRule, nextOccurrences } from '@/lib/meetings/recurrence';
import {
  ACCESS_SCOPE_LABEL,
  ACCESS_SCOPES,
  MEETING_TYPE_LABEL,
  MEETING_TYPES,
  type AccessScope,
  type Frequency,
  type LinkRef,
  type MeetingSeries,
  type MeetingType,
  type RecurrenceRule,
} from '@/lib/meetings/types';
import {
  addMinutesToTime,
  COMMON_TIME_ZONES,
  fmtZonedDate,
  fmtZonedTime,
  minutesBetweenTimes,
} from '@/lib/meetings/zonedTime';
import { ME, useMeetingStore } from '@/store/meetingStore';
import { uid } from '@/store/useAppStore';
import { Field, PersonInput } from './atoms';
import { LinkPicker } from './LinkPicker';
import { viewerZone } from './MeetingDialog';
import { PeopleField, type PersonDraft } from './PeopleField';
import { useLinkContext } from './useLinkContext';
import { usePeople } from './usePeople';

const FREQUENCY_LABEL: Record<Frequency, string> = {
  none: 'On demand — no fixed schedule',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

/**
 * Create or edit a recurring meeting.
 *
 * A series holds defaults and a rule, nothing else. Saving it schedules
 * nothing: the Series tab schedules sittings from it when somebody asks, which
 * is when they become meetings with agendas of their own.
 */
export function SeriesDialog({
  projectId,
  series,
  onClose,
}: {
  projectId: string;
  series?: MeetingSeries;
  onClose: () => void;
}) {
  const saveSeries = useMeetingStore((s) => s.saveSeries);
  const people = usePeople();
  const { options, ctx } = useLinkContext();
  const box = useRef<HTMLDialogElement>(null);

  const [title, setTitle] = useState(series?.title ?? '');
  const [purpose, setPurpose] = useState(series?.purpose ?? '');
  const [type, setType] = useState<MeetingType>(series?.type ?? 'working_group');
  const [owner, setOwner] = useState(series?.owner ?? ME);
  const [attendees, setAttendees] = useState<PersonDraft[]>(
    (series?.attendees ?? []).map((name) => ({ name, optional: false })),
  );
  const [rule, setRule] = useState<RecurrenceRule>(series?.recurrence ?? defaultRule(keyOfLocal(new Date())));
  const [end, setEnd] = useState(() =>
    addMinutesToTime(series?.recurrence.time ?? '09:00', series?.durationMinutes ?? 60),
  );
  const [zone, setZone] = useState(series?.timeZone ?? viewerZone());
  const [location, setLocation] = useState(series?.location ?? '');
  const [template, setTemplate] = useState((series?.agendaTemplate ?? []).join('\n'));
  const [links, setLinks] = useState<LinkRef[]>(series?.links ?? []);
  const [scope, setScope] = useState<AccessScope>(series?.accessScope ?? 'program');
  const [active, setActive] = useState(series?.status !== 'inactive');
  const [error, setError] = useState('');

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (!el.open) el.showModal();
    const cancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener('cancel', cancel);
    return () => el.removeEventListener('cancel', cancel);
  }, [onClose]);

  const duration = minutesBetweenTimes(rule.time, end);
  const preview = useMemo(
    () => (rule.freq === 'none' ? [] : nextOccurrences(rule, zone, new Date(), 3)),
    [rule, zone],
  );
  const patch = (p: Partial<RecurrenceRule>) => setRule((r) => ({ ...r, ...p }));

  const submit = () => {
    if (!title.trim()) return setError('Give the series a title.');
    if (duration <= 0) return setError('A sitting has to end after it starts.');
    if (rule.freq === 'weekly' && rule.weekdays.length === 0) return setError('Pick the days it meets.');
    if (rule.until && rule.until < rule.startDate) return setError('It cannot stop before it starts.');
    setError('');
    const now = new Date();
    saveSeries({
      id: series?.id ?? uid(),
      projectId,
      title: title.trim(),
      purpose,
      type,
      owner: owner.trim(),
      attendees: attendees.map((a) => a.name),
      recurrence: rule,
      durationMinutes: duration,
      agendaTemplate: template
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean),
      timeZone: zone,
      location: location.trim(),
      accessScope: scope,
      status: active ? 'active' : 'inactive',
      links,
      createdAt: series?.createdAt ?? now,
      updatedAt: now,
      createdBy: series?.createdBy ?? ME,
      updatedBy: ME,
    });
    onClose();
  };

  const zones = COMMON_TIME_ZONES.includes(zone as (typeof COMMON_TIME_ZONES)[number])
    ? COMMON_TIME_ZONES
    : [zone, ...COMMON_TIME_ZONES];

  return (
    <dialog className="dlg wide" ref={box} aria-label={series ? 'Edit series' : 'New series'} data-series-dialog>
      <div className="dlg-hd">
        <b style={{ fontSize: 14.5 }}>{series ? 'Edit series' : 'New series'}</b>
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="dlg-body">
        <Field label="Title" required>
          <input
            className="lnkin"
            style={{ minWidth: 0, width: '100%' }}
            autoFocus
            aria-label="Series title"
            placeholder="Weekly SoC Program Review"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="Purpose">
          <textarea className="mt-text" aria-label="Series purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        </Field>

        <div className="mt-grid2">
          <Field label="Meeting type">
            <select className="lnkin" aria-label="Series type" value={type} onChange={(e) => setType(e.target.value as MeetingType)}>
              {MEETING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {MEETING_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Owner">
            <PersonInput value={owner} onChange={setOwner} people={people} label="Series owner" />
          </Field>
        </div>

        <Field label="Default attendees" hint="Every new sitting starts with these people." group>
          <PeopleField value={attendees} onChange={setAttendees} people={people} label="Default attendees" />
        </Field>

        <Field label="Recurrence" hint={describeRule(rule)} group>
          <select
            className="lnkin"
            aria-label="Frequency"
            value={rule.freq}
            onChange={(e) => patch({ freq: e.target.value as Frequency })}
          >
            {(Object.keys(FREQUENCY_LABEL) as Frequency[]).map((f) => (
              <option key={f} value={f}>
                {FREQUENCY_LABEL[f]}
              </option>
            ))}
          </select>
          {rule.freq !== 'none' && (
            <>
              <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>every</span>
              <input
                className="dateinp"
                type="number"
                min={1}
                max={12}
                style={{ width: 56 }}
                aria-label="Interval"
                value={rule.interval}
                onChange={(e) => patch({ interval: Math.max(1, Number(e.target.value) || 1) })}
              />
              <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
                {rule.freq === 'daily' ? 'day(s)' : rule.freq === 'weekly' ? 'week(s)' : 'month(s)'}
              </span>
            </>
          )}
          {(rule.freq === 'weekly' || rule.freq === 'daily') && (
            <span className="chips" style={{ height: 'auto', padding: 0, border: 'none', flexWrap: 'wrap' }} role="group" aria-label="Days">
              {WEEKDAY_SHORT.map((d, i) => {
                const on = rule.weekdays.includes(i);
                return (
                  <button
                    key={d}
                    type="button"
                    className={on ? 'chip on' : 'chip'}
                    aria-pressed={on}
                    data-weekday={d}
                    onClick={() =>
                      patch({
                        weekdays: on ? rule.weekdays.filter((x) => x !== i) : [...rule.weekdays, i].sort((a, b) => a - b),
                      })
                    }
                  >
                    {d}
                  </button>
                );
              })}
            </span>
          )}
          {rule.freq === 'monthly' && (
            <>
              <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>on day</span>
              <input
                className="dateinp"
                type="number"
                min={1}
                max={31}
                style={{ width: 56 }}
                aria-label="Day of the month"
                value={rule.monthDay ?? Number(rule.startDate.slice(8))}
                onChange={(e) => patch({ monthDay: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })}
              />
            </>
          )}
        </Field>

        <div className="mt-grid2">
          <Field label="Starts on" group>
            <input className="dateinp" type="date" aria-label="Starts on" value={rule.startDate} onChange={(e) => e.target.value && patch({ startDate: e.target.value })} />
            <span style={{ color: 'var(--ink-3)', fontSize: 12.5 }}>until</span>
            <input
              className="dateinp"
              type="date"
              aria-label="Until"
              value={rule.until ?? ''}
              onChange={(e) => patch({ until: e.target.value || null })}
            />
          </Field>
          <Field label="Time" hint={duration > 0 ? `${duration} minutes` : 'Ends before it starts'} group>
            <input className="dateinp" type="time" aria-label="Series start time" value={rule.time} onChange={(e) => patch({ time: e.target.value })} />
            <span style={{ color: 'var(--ink-3)' }}>to</span>
            <input className="dateinp" type="time" aria-label="Series end time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </Field>
        </div>

        {preview.length > 0 && (
          <p className="mono-note" data-series-preview style={{ padding: '0 0 10px' }}>
            Next sittings:{' '}
            {preview.map((d) => `${fmtZonedDate(d, zone)} ${fmtZonedTime(d, zone)}`).join(' · ')}
          </p>
        )}

        <div className="mt-grid2">
          <Field label="Time zone">
            <select className="lnkin" aria-label="Series time zone" value={zone} onChange={(e) => setZone(e.target.value)}>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Location or meeting link">
            <input className="lnkin" aria-label="Series location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
        </div>

        <Field label="Default agenda" hint="One item per line. Each new sitting starts with these." >
          <textarea
            className="mt-text"
            aria-label="Default agenda"
            placeholder={'Open actions from last week\nCoverage and pattern count\nRisks and escalations'}
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          />
        </Field>

        <Field label="Related stages and activities" group>
          <LinkPicker
            value={links}
            onChange={setLinks}
            options={options}
            ctx={ctx}
            projectId={projectId}
            types={['stage', 'activity']}
            label="Series related items"
          />
        </Field>

        <div className="mt-grid2">
          <Field label="Access" hint="Who the series is meant for. There is no sign-in yet, so this is a label, not a lock.">
            <select className="lnkin" aria-label="Access scope" value={scope} onChange={(e) => setScope(e.target.value as AccessScope)}>
              {ACCESS_SCOPES.map((s) => (
                <option key={s} value={s}>
                  {ACCESS_SCOPE_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select className="lnkin" aria-label="Series status" value={active ? 'active' : 'inactive'} onChange={(e) => setActive(e.target.value === 'active')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="dlg-foot">
        {error && (
          <span className="err" role="alert" style={{ fontSize: 12, color: 'var(--risk)' }}>
            {error}
          </span>
        )}
        <span style={{ flexGrow: 1 }} />
        <button className="btn sm" type="button" onClick={onClose}>
          Cancel
        </button>
        <button className="btn pri sm" type="button" data-save-series onClick={submit}>
          {series ? 'Save series' : 'Create series'}
        </button>
      </div>
    </dialog>
  );
}
