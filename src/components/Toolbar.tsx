'use client';

import Link from 'next/link';
import type { ProfileSummary, ScheduleProfile } from '@/data/types';
import { Popover } from './Popover';
import { ProjectName } from './ProjectName';
import { SettingsPopover } from './SettingsPopover';

export type ViewMode = 'journey' | 'schedule';

export function Toolbar({
  projectName,
  onProjectNameChange,
  kickoff,
  onKickoffChange,
  profile,
  profiles,
  onProfileChange,
  onEditStages,
  tapeout = '—',
  firstSilicon = '—',
  production = '—',
  mode,
  onModeChange,
  onResetSchedule,
}: {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  /** ISO yyyy-mm-dd, the value the date input round-trips. */
  kickoff: string;
  onKickoffChange: (iso: string) => void;
  /** The profile this program runs on, and every profile it could run on. */
  profile: ScheduleProfile;
  profiles: readonly ProfileSummary[];
  onProfileChange: (id: string) => void;
  onEditStages: () => void;
  /** Derived in Phase 2 — the toolbar only displays what it is handed. */
  tapeout?: string;
  firstSilicon?: string;
  production?: string;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onResetSchedule?: () => void;
}) {
  return (
    <header id="toolbar">
      <Link id="to-programs" href="/" title="All programs">
        <span aria-hidden="true">‹</span> Programs
      </Link>

      <div className="tb-centre">
        <ProjectName value={projectName} onChange={onProjectNameChange} />
        <div className="tb-field">
          <label htmlFor="kickoff-input">Kickoff</label>
          <input
            type="date"
            id="kickoff-input"
            value={kickoff}
            onChange={(e) => onKickoffChange(e.target.value)}
          />
        </div>
        <div className="tb-field">
          <label htmlFor="profile-select">Profile</label>
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
          {/* the profile is a list of stages, so editing them lives beside it */}
          <button id="stages-btn" data-edit-stages onClick={onEditStages} title="Add, reorder or remove stages">
            Stages
          </button>
        </div>
        <div className="tb-field">
          <span className="k">Tapeout</span>
          <span className="v" data-computed="tapeout">
            {tapeout}
          </span>
        </div>
        <div className="tb-field tb-opt1">
          <span className="k">First Silicon</span>
          <span className="v" data-computed="firstSilicon">
            {firstSilicon}
          </span>
        </div>
        <div className="tb-field tb-opt2">
          <span className="k">Production</span>
          <span className="v" data-computed="production">
            {production}
          </span>
        </div>
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
