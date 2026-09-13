'use client';

import Link from 'next/link';
import { useState } from 'react';
import { nextSittingOf } from '@/lib/meetings/digest';
import { describeRule } from '@/lib/meetings/recurrence';
import { ACCESS_SCOPE_LABEL, MEETING_TYPE_LABEL, type MeetingSeries } from '@/lib/meetings/types';
import { fmtZonedDate, fmtZonedTime, tzLabel } from '@/lib/meetings/zonedTime';
import { useMeetingStore } from '@/store/meetingStore';
import { useAppStore } from '@/store/useAppStore';
import { Avatar, IconEmptyList, IconPlus } from '../shell/icons';
import { ChoiceMenu } from './ChoiceMenu';
import { Empty, LinkChips } from './atoms';
import { MeetingDialog } from './MeetingDialog';
import { SeriesDialog } from './SeriesDialog';
import { useLinkContext } from './useLinkContext';

type Schedule = '1' | '4' | '8';
const SCHEDULE: readonly { key: Schedule; label: string; hint: string }[] = [
  { key: '1', label: 'The next sitting', hint: 'One meeting, on the next date the rule gives.' },
  { key: '4', label: 'The next 4 sittings', hint: 'Each starts with the series’ attendees and agenda.' },
  { key: '8', label: 'The next 8 sittings', hint: 'A quarter of a weekly series.' },
];

/**
 * Recurring meetings: the rule, the defaults, and the sittings made from them.
 *
 * Scheduling is explicit. A series never fills the calendar by itself — its
 * next sittings are made when somebody asks, and each is then a meeting of its
 * own that can be moved, cancelled or given a different agenda without
 * touching the series or the other sittings.
 */
export function SeriesTab({ projectId, onNew }: { projectId: string; onNew: () => void }) {
  const series = useMeetingStore((s) => s.series);
  const meetings = useMeetingStore((s) => s.meetings);
  const saveSeries = useMeetingStore((s) => s.saveSeries);
  const schedule = useMeetingStore((s) => s.scheduleFromSeries);
  const today = useAppStore((s) => s.today);
  const { ctx } = useLinkContext();
  const [editing, setEditing] = useState<MeetingSeries | null>(null);
  const [sitting, setSitting] = useState<string | null>(null);
  const [note, setNote] = useState<{ id: string; text: string } | null>(null);

  if (series.length === 0) {
    return (
      <Empty icon={<IconEmptyList />}>
        No recurring meetings yet. A series holds a meeting&rsquo;s rule and defaults — who comes, how long, what
        is on the agenda — and schedules sittings from them when you ask.{' '}
        <button type="button" className="btn sm" onClick={onNew} style={{ display: 'inline-flex' }}>
          New series
        </button>
      </Empty>
    );
  }

  return (
    <div className="mt-page" data-series-list>
      <div className="card" style={{ overflow: 'hidden' }}>
        {series.map((s) => {
          const sittings = meetings.filter((m) => m.seriesId === s.id);
          const next = nextSittingOf(s.id, meetings, today);
          const active = s.status === 'active';
          return (
            <div key={s.id} className="mt-row" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }} data-series={s.id}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <b style={{ fontSize: 14 }}>{s.title}</b>
                  <span className={active ? 'pill ok' : 'pill'} style={{ fontSize: 10.5 }}>
                    {active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="pill" style={{ fontSize: 10.5 }}>
                    {MEETING_TYPE_LABEL[s.type]}
                  </span>
                </span>
                <span className="mt-meta">
                  <span data-rule>{describeRule(s.recurrence)}</span>
                  <span>
                    · {s.durationMinutes} min · {tzLabel(new Date(), s.timeZone)}
                  </span>
                  {s.owner && (
                    <>
                      · <Avatar name={s.owner} small /> {s.owner}
                    </>
                  )}
                  <span>
                    · {s.attendees.length} default attendee{s.attendees.length === 1 ? '' : 's'}
                  </span>
                  <span>· {ACCESS_SCOPE_LABEL[s.accessScope]}</span>
                </span>
                {s.purpose && (
                  <p className="mono-note wrapcell" style={{ marginTop: 5, maxWidth: '90ch' }}>
                    {s.purpose}
                  </p>
                )}
                <span className="mt-meta">
                  {next ? (
                    <>
                      Next:{' '}
                      <Link href={`/p/${projectId}/meetings/${next.id}`} data-next-sitting>
                        {fmtZonedDate(next.startsAt, next.timeZone)} {fmtZonedTime(next.startsAt, next.timeZone)}
                      </Link>
                    </>
                  ) : (
                    <span>No sitting scheduled.</span>
                  )}
                  <span>
                    · {sittings.length} sitting{sittings.length === 1 ? '' : 's'} so far
                  </span>
                  {s.agendaTemplate.length > 0 && <span>· {s.agendaTemplate.length}-item agenda</span>}
                </span>
                {s.links.length > 0 && (
                  <span style={{ display: 'block', marginTop: 6 }}>
                    <LinkChips links={s.links} projectId={projectId} ctx={ctx} />
                  </span>
                )}
                {note?.id === s.id && (
                  <p className="mono-note" role="status" style={{ marginTop: 6, color: 'var(--ok)' }} data-scheduled-note>
                    {note.text}
                  </p>
                )}
              </span>
              <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {s.recurrence.freq !== 'none' && active && (
                  <ChoiceMenu
                    hook={`schedule-${s.id}`}
                    label="Schedule sittings"
                    options={SCHEDULE}
                    chosen={'1'}
                    onChoose={(k) => {
                      const ids = schedule(s.id, Number(k));
                      setNote({
                        id: s.id,
                        text: ids.length
                          ? `Scheduled ${ids.length} sitting${ids.length === 1 ? '' : 's'}.`
                          : 'The rule gives no further dates.',
                      });
                    }}
                  />
                )}
                <button type="button" className="btn sm" data-new-sitting={s.id} onClick={() => setSitting(s.id)}>
                  <IconPlus />
                  One sitting
                </button>
                <button type="button" className="btn sm" data-edit-series={s.id} onClick={() => setEditing(s)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn sm"
                  onClick={() => saveSeries({ ...s, status: active ? 'inactive' : 'active' })}
                >
                  {active ? 'Deactivate' : 'Activate'}
                </button>
              </span>
            </div>
          );
        })}
      </div>

      {editing && <SeriesDialog projectId={projectId} series={editing} onClose={() => setEditing(null)} />}
      {sitting && <MeetingDialog projectId={projectId} seriesId={sitting} onClose={() => setSitting(null)} />}
    </div>
  );
}
