'use client';

import Link from 'next/link';
import type { ProfileSummary, ScheduleProfile } from '@/data/types';
import { dday } from '@/lib/derive';
import { fmtDate } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { Popover } from './Popover';
import { ProjectName } from './ProjectName';
import { SettingsPopover } from './SettingsPopover';

export type ViewMode = 'journey' | 'schedule';

/**
 * The three dates a program is held to, beside the name it is held under:
 * when it started, when the masks go out, when it ships.
 *
 * The milestone axis below carries every checkpoint, positioned in time, and
 * that is the right place to read the shape of the schedule. It is the wrong
 * place to answer "when is tapeout" from across a room, which is the question
 * these three get asked. They are read-outs — kick-off is edited on the axis
 * where it is drawn, and the other two are where the stages put them.
 */
function ProgramDates() {
  const kickoff = useAppStore((s) => s.kickoff);
  const schedule = useAppStore((s) => s.schedule);
  const today = useAppStore((s) => s.today);
  const dates = [
    { k: 'Kick-off', v: kickoff, cls: '' },
    { k: 'MTO', v: schedule.tapeout, cls: ' tb-opt1', tip: 'Tapeout — mask order' },
    { k: 'MP', v: schedule.production, cls: ' tb-opt2', tip: 'Mass production' },
  ];
  return (
    <div className="tb-dates" data-tb-dates>
      {dates.map((d) => (
        <span
          className={`tb-date${d.cls}`}
          key={d.k}
          data-tb-date={d.k}
          data-tip={d.tip ? `${d.tip}|${fmtDate(d.v)} · ${dday(d.v, today)}` : undefined}
        >
          <span className="k">{d.k}</span>
          <span className="v">{fmtDate(d.v)}</span>
        </span>
      ))}
    </div>
  );
}

export function Toolbar({
  projectName,
  onProjectNameChange,
  profile,
  profiles,
  onProfileChange,
  onEditStages,
  mode,
  onModeChange,
  onResetSchedule,
}: {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  /** The profile this program runs on, and every profile it could run on. */
  profile: ScheduleProfile;
  profiles: readonly ProfileSummary[];
  onProfileChange: (id: string) => void;
  onEditStages: () => void;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onResetSchedule?: () => void;
}) {
  return (
    <header id="toolbar">
      <Link id="to-programs" href="/" title="All programs">
        <span aria-hidden="true">‹</span> Programs
      </Link>

      {/* Program, the three dates it is held to, the template it runs on, and
          the way into editing that template. */}
      <div className="tb-centre">
        <ProjectName value={projectName} onChange={onProjectNameChange} />
        <ProgramDates />
        <div className="tb-field">
          <label htmlFor="profile-select">Milestone template</label>
          <select
            id="profile-select"
            value={profile.id}
            onChange={(e) => onProfileChange(e.target.value)}
          >
            {/* The list is the templates a program can start from; a program
                that has edited its own stages is on a profile of its own,
                which belongs in the list only while it is the one selected. */}
            {!profiles.some((p) => p.id === profile.id) && (
              <option value={profile.id}>{profile.label}</option>
            )}
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        {/* the template is a list of stages, so editing them lives beside it */}
        <button
          id="stages-btn"
          data-edit-stages
          onClick={onEditStages}
          title="Add, reorder or remove stages"
        >
          Edit template
        </button>
        <span className="edited-flag" data-tip="Schedule has manual date edits — reset in Settings|">
          EDITED
        </span>
        <Popover
          id="info-note"
          btnId="info-btn"
          title="Baseline Planning Assumptions"
          panelRole="tooltip"
          trigger="i"
        >
          <strong>Baseline Planning Assumptions.</strong> These durations represent simplified
          planning assumptions for visualization purposes. Actual semiconductor development
          schedules vary significantly depending on product complexity, process node, IP reuse,
          verification requirements, design resources, foundry capacity, packaging technology, and
          qualification requirements.
        </Popover>
      </div>

      <SettingsPopover scope={mode === 'schedule' ? 'dash' : 'main'} onResetSchedule={onResetSchedule} />
      <div id="mode-toggle" role="group" aria-label="View mode">
        <button data-mode="journey" aria-pressed={mode === 'journey'} onClick={() => onModeChange('journey')}>
          Main
        </button>
        <button data-mode="schedule" aria-pressed={mode === 'schedule'} onClick={() => onModeChange('schedule')}>
          Dashboard
        </button>
      </div>
    </header>
  );
}
