'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { keyOfLocal } from '@/lib/meetings/calendar';
import {
  MEETING_TYPE_LABEL,
  MEETING_TYPES,
  type AgendaItem,
  type LinkRef,
  type Meeting,
  type MeetingType,
} from '@/lib/meetings/types';
import {
  addMinutesToTime,
  COMMON_TIME_ZONES,
  fmtZonedTime,
  zonedDayKey,
  zonedToUtc,
} from '@/lib/meetings/zonedTime';
import { ME, useMeetingStore } from '@/store/meetingStore';
import { uid } from '@/store/useAppStore';
import { IconPlus } from '../shell/icons';
import { Field, PersonInput } from './atoms';
import { LinkPicker } from './LinkPicker';
import { PeopleField, type PersonDraft } from './PeopleField';
import { useLinkContext } from './useLinkContext';
import { usePeople } from './usePeople';

/** The zone the viewer's clock is in — the default for a new meeting. */
export const viewerZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

/**
 * Create a meeting, or edit one.
 *
 * Picking a series fills in what the series says a sitting starts with — its
 * type, owner, attendees, length, place, purpose, links and agenda — and every
 * one of those can still be changed for this sitting alone. Nothing typed here
 * is written back to the series.
 */
export function MeetingDialog({
  projectId,
  meeting,
  seriesId = null,
  defaultDate,
  onClose,
}: {
  projectId: string;
  meeting?: Meeting;
  seriesId?: string | null;
  /** YYYY-MM-DD, when opened from a day on the calendar. */
  defaultDate?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const series = useMeetingStore((s) => s.series);
  const saveMeeting = useMeetingStore((s) => s.saveMeeting);
  const people = usePeople();
  const { options, ctx } = useLinkContext();
  const box = useRef<HTMLDialogElement>(null);
  const editing = !!meeting;

  const preset = series.find((s) => s.id === (meeting?.seriesId ?? seriesId));
  const zone0 = meeting?.timeZone ?? preset?.timeZone ?? viewerZone();
  const start0 = meeting ? fmtZonedTime(meeting.startsAt, zone0) : (preset?.recurrence.time ?? '09:00');

  const [title, setTitle] = useState(meeting?.title ?? preset?.title ?? '');
  const [sid, setSid] = useState(meeting?.seriesId ?? preset?.id ?? '');
  const [type, setType] = useState<MeetingType>(meeting?.type ?? preset?.type ?? 'working_group');
  const [status, setStatus] = useState<'draft' | 'scheduled'>('scheduled');
  const [date, setDate] = useState(meeting ? zonedDayKey(meeting.startsAt, zone0) : (defaultDate ?? keyOfLocal(new Date())));
  const [start, setStart] = useState(start0);
  const [end, setEnd] = useState(
    meeting ? fmtZonedTime(meeting.endsAt, zone0) : addMinutesToTime(start0, preset?.durationMinutes ?? 60),
  );
  const [zone, setZone] = useState(zone0);
  const [owner, setOwner] = useState(meeting?.owner ?? preset?.owner ?? ME);
  const [facilitator, setFacilitator] = useState(meeting?.facilitator ?? '');
  const [attendees, setAttendees] = useState<PersonDraft[]>(
    meeting?.attendees.map((a) => ({ name: a.name, optional: a.optional })) ??
      preset?.attendees.map((name) => ({ name, optional: false })) ??
      [],
  );
  const [location, setLocation] = useState(meeting?.location ?? preset?.location ?? '');
  const [purpose, setPurpose] = useState(meeting?.purpose ?? preset?.purpose ?? '');
  const [links, setLinks] = useState<LinkRef[]>(meeting?.links ?? preset?.links ?? []);
  const [agenda, setAgenda] = useState<string[]>(editing ? [] : (preset?.agendaTemplate ?? []));
  const [item, setItem] = useState('');
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

  /* A series chosen while creating brings its defaults with it. */
  const chooseSeries = (id: string) => {
    setSid(id);
    const s = series.find((x) => x.id === id);
    if (!s || editing) return;
    setTitle((t) => (t.trim() ? t : s.title));
    setType(s.type);
    setOwner(s.owner || ME);
    setAttendees(s.attendees.map((name) => ({ name, optional: false })));
    setStart(s.recurrence.time);
    setEnd(addMinutesToTime(s.recurrence.time, s.durationMinutes));
    setZone(s.timeZone);
    setLocation(s.location);
    setPurpose(s.purpose);
    setLinks(s.links);
    setAgenda(s.agendaTemplate);
  };

  const submit = () => {
    if (!title.trim()) return setError('Give the meeting a title.');
    if (!date || !start || !end) return setError('Set a date, a start time and an end time.');
    const startsAt = zonedToUtc(date, start, zone);
    const endsAt = zonedToUtc(date, end, zone);
    if (endsAt <= startsAt) return setError('The meeting has to end after it starts.');
    setError('');

    const now = new Date();
    const id = meeting?.id ?? uid();
    const row: Meeting = {
      id,
      projectId,
      seriesId: sid || null,
      title: title.trim(),
      type,
      status: meeting?.status ?? status,
      startsAt,
      endsAt,
      timeZone: zone,
      owner: owner.trim(),
      facilitator: facilitator.trim(),
      location: location.trim(),
      purpose,
      minutes: meeting?.minutes ?? '',
      attendees: attendees.map((a) => ({ id: uid(), name: a.name, optional: a.optional })),
      links,
      completedAt: meeting?.completedAt ?? null,
      cancelReason: meeting?.cancelReason ?? '',
      createdAt: meeting?.createdAt ?? now,
      updatedAt: now,
      createdBy: meeting?.createdBy ?? ME,
      updatedBy: ME,
    };
    const items: AgendaItem[] = agenda.map((t, position) => ({
      id: uid(),
      projectId,
      meetingId: id,
      position,
      title: t,
      description: '',
      presenter: '',
      minutes: 0,
      notes: '',
      outcome: '',
      status: 'pending',
      deferral: '',
      deferNote: '',
      carriedFromId: null,
      links: [],
      createdAt: now,
      updatedAt: now,
      createdBy: ME,
      updatedBy: ME,
    }));
    saveMeeting(row, items);
    onClose();
    if (!editing) router.push(`/p/${projectId}/meetings/${id}`);
  };

  const zones = COMMON_TIME_ZONES.includes(zone as (typeof COMMON_TIME_ZONES)[number])
    ? COMMON_TIME_ZONES
    : [zone, ...COMMON_TIME_ZONES];

  return (
    <dialog className="dlg wide" ref={box} aria-label={editing ? 'Edit meeting' : 'New meeting'} data-meeting-dialog>
      <div className="dlg-hd">
        <b style={{ fontSize: 14.5 }}>{editing ? 'Edit meeting' : 'New meeting'}</b>
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
            aria-label="Title"
            placeholder="DFT Weekly Review"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>

        <div className="mt-grid2">
          <Field label="Series" hint="A recurring meeting this is one sitting of. Leave empty for a one-off.">
            <select className="lnkin" aria-label="Series" value={sid} onChange={(e) => chooseSeries(e.target.value)}>
              <option value="">No series — a single meeting</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                  {s.status === 'inactive' ? ' (inactive)' : ''}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Meeting type">
            <select className="lnkin" aria-label="Meeting type" value={type} onChange={(e) => setType(e.target.value as MeetingType)}>
              {MEETING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {MEETING_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-grid2">
          <Field label="Date" required>
            <input className="dateinp" type="date" aria-label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Time" hint="Start and end, in the time zone below." group required>
            <input className="dateinp" type="time" aria-label="Start time" value={start} onChange={(e) => setStart(e.target.value)} />
            <span style={{ color: 'var(--ink-3)' }}>to</span>
            <input className="dateinp" type="time" aria-label="End time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </Field>
        </div>

        <div className="mt-grid2">
          <Field label="Time zone" hint="Where the meeting is held. Its times are shown in this zone everywhere.">
            <select className="lnkin" aria-label="Time zone" value={zone} onChange={(e) => setZone(e.target.value)}>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </Field>
          {!editing && (
            <Field label="Status" hint="A draft is not on anyone's list until it is scheduled.">
              <select className="lnkin" aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'scheduled')}>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
          )}
        </div>

        <div className="mt-grid2">
          <Field label="Owner" hint="Accountable for the meeting happening and its minutes.">
            <PersonInput value={owner} onChange={setOwner} people={people} label="Owner" hook="owner" />
          </Field>
          <Field label="Facilitator" hint="Runs the room, if not the owner.">
            <PersonInput value={facilitator} onChange={setFacilitator} people={people} label="Facilitator" />
          </Field>
        </div>

        <Field label="Attendees" hint="Pick from the program's people or type a name. Mark who is optional." group>
          <PeopleField value={attendees} onChange={setAttendees} people={people} label="Attendees" allowOptional />
        </Field>

        <Field label="Location or meeting link">
          <input
            className="lnkin"
            style={{ minWidth: 0, width: '100%' }}
            aria-label="Location or meeting link"
            placeholder="B2-Tahoe, or https://…"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Field>

        <Field label="Purpose" hint="What the meeting is for — the question it answers.">
          <textarea className="mt-text" aria-label="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
        </Field>

        <Field
          label="Related items"
          hint="The stages, activities, steps, risks, deliverables and milestones this meeting is about. Linking changes nothing on them."
          group
        >
          <LinkPicker value={links} onChange={setLinks} options={options} ctx={ctx} projectId={projectId} />
        </Field>

        {!editing && (
          <Field label="Initial agenda" hint="Titles now; presenters, time and notes on the meeting's Agenda tab." group>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
              {agenda.map((t, i) => (
                <span key={`${i}:${t}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }} data-initial-agenda>
                  <span className="mt-agenda-num">{i + 1}</span>
                  <span style={{ flexGrow: 1, fontSize: 13 }}>{t}</span>
                  <button
                    type="button"
                    className="btn sm"
                    aria-label={`Remove ${t}`}
                    onClick={() => setAgenda(agenda.filter((_, j) => j !== i))}
                  >
                    ✕
                  </button>
                </span>
              ))}
              <span style={{ display: 'flex', gap: 7 }}>
                <input
                  className="lnkin"
                  aria-label="Agenda item"
                  placeholder="Add an agenda item"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && item.trim()) {
                      e.preventDefault();
                      setAgenda([...agenda, item.trim()]);
                      setItem('');
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn sm"
                  disabled={!item.trim()}
                  onClick={() => {
                    setAgenda([...agenda, item.trim()]);
                    setItem('');
                  }}
                >
                  <IconPlus />
                  Add
                </button>
              </span>
            </div>
          </Field>
        )}
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
        <button className="btn pri sm" type="button" data-save-meeting onClick={submit}>
          {editing ? 'Save meeting' : 'Create meeting'}
        </button>
      </div>
    </dialog>
  );
}
