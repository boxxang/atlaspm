'use client';

import { useEffect, useState } from 'react';
import { Toolbar, type ViewMode } from './Toolbar';
import { Tooltip } from './Tooltip';

/**
 * Phase 1 layout shell. Holds the toolbar-level state locally; Phase 3 replaces
 * this with the Zustand store mirroring the prototype's `state` shape.
 */
export function AppShell() {
  const [projectName, setProjectName] = useState('AtlasEX');
  const [kickoff, setKickoff] = useState('2027-05-12');
  const [profileId, setProfileId] = useState('typicalSoC');
  const [mode, setMode] = useState<ViewMode>('journey');

  // setMode(): the dashboard is a fixed overlay, so the page behind it locks.
  useEffect(() => {
    const schedule = mode === 'schedule';
    document.body.classList.toggle('schedule-mode', schedule);
    document.documentElement.style.overflow = schedule ? 'hidden' : '';
  }, [mode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMode('journey');
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <Toolbar
        projectName={projectName}
        onProjectNameChange={setProjectName}
        kickoff={kickoff}
        onKickoffChange={(iso) => iso && setKickoff(iso)}
        profileId={profileId}
        onProfileChange={setProfileId}
        mode={mode}
        onModeChange={setMode}
      />

      <div id="brand-badge">AtlasPM</div>

      {/* Roadmap (Phase 3), stage panels (Phase 3) and the dashboard body
          (Phase 5) mount inside these landmarks. */}
      <section id="roadmap" aria-label="Development roadmap" />
      <main id="stage-panels" aria-live="polite" />

      <section id="schedule-view" aria-label="Dashboard" aria-hidden={mode !== 'schedule'}>
        <div className="inner">
          <h2 id="dash-title">{projectName} — Dashboard</h2>
          <p className="note" id="dash-sub">
            Program status at a glance.
          </p>
        </div>
      </section>

      <Tooltip />
    </>
  );
}
