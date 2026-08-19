'use client';

import { useEffect, useState } from 'react';
import { journeyData } from '@/data/journey';
import { fmtDate, fromISO, toISO } from '@/lib/schedule';
import { useModalStore } from '@/store/modalStore';
import { useAppStore } from '@/store/useAppStore';
import { BoardModal } from './BoardModal';
import { Roadmap } from './Roadmap';
import { StagePanel } from './StagePanel';
import { Toolbar, type ViewMode } from './Toolbar';
import { Tooltip } from './Tooltip';

/**
 * Phase 3 shell. All state lives in the Zustand store, which seeds itself from
 * projectSeed on mount — the seed reads a clock, so running it during SSR would
 * not survive hydration.
 */
export function AppShell() {
  const hydrated = useAppStore((s) => s.hydrated);
  const hydrate = useAppStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return hydrated ? <App /> : null;
}

function App() {
  const projectName = useAppStore((s) => s.projectName);
  const setProjectName = useAppStore((s) => s.setProjectName);
  const kickoff = useAppStore((s) => s.kickoff);
  const setKickoff = useAppStore((s) => s.setKickoff);
  const profileId = useAppStore((s) => s.profileId);
  const setProfile = useAppStore((s) => s.setProfile);
  const schedule = useAppStore((s) => s.schedule);
  const edited = useAppStore((s) => s.edited);
  const resetSchedule = useAppStore((s) => s.resetSchedule);
  const closeAllInline = useAppStore((s) => s.closeAllInline);
  const [mode, setMode] = useState<ViewMode>('journey');

  /* setMode(): the dashboard is a fixed overlay, so the page behind it locks. */
  useEffect(() => {
    const dash = mode === 'schedule';
    document.body.classList.toggle('schedule-mode', dash);
    document.documentElement.style.overflow = dash ? 'hidden' : '';
  }, [mode]);

  /* EDITED flag is CSS-driven off the body class, as in the reference. */
  useEffect(() => {
    document.body.classList.toggle('has-overrides', edited);
  }, [edited]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      /* ESC layering: pop-up first, then the dashboard, then inline sheets */
      if (useModalStore.getState().open) return;
      setMode('journey');
      closeAllInline();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeAllInline]);

  return (
    <>
      <Toolbar
        projectName={projectName}
        onProjectNameChange={setProjectName}
        kickoff={toISO(kickoff)}
        onKickoffChange={(iso) => iso && setKickoff(fromISO(iso))}
        profileId={profileId}
        onProfileChange={(id) => setProfile(id as typeof profileId)}
        tapeout={fmtDate(schedule.tapeout)}
        firstSilicon={fmtDate(schedule.firstSilicon)}
        production={fmtDate(schedule.production)}
        mode={mode}
        onModeChange={setMode}
        onResetSchedule={resetSchedule}
      />

      <div id="brand-badge">AtlasPM</div>

      <Roadmap />

      <main id="stage-panels" aria-live="polite">
        {journeyData.map((s, i) => (
          <StagePanel stage={s} index={i} key={s.id} />
        ))}
      </main>

      {/* Dashboard body lands in Phase 5. */}
      <section id="schedule-view" aria-label="Dashboard" aria-hidden={mode !== 'schedule'}>
        <div className="inner">
          <h2 id="dash-title">{projectName} — Dashboard</h2>
          <p className="note" id="dash-sub">
            Program status at a glance.
          </p>
        </div>
      </section>

      <BoardModal />

      <Tooltip />
    </>
  );
}
