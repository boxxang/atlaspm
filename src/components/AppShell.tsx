'use client';

import { useEffect, useState } from 'react';
import type { ProfileSummary } from '@/data/types';
import type { ProjectState } from '@/lib/projectState';
import { useModalStore } from '@/store/modalStore';
import { useAppStore } from '@/store/useAppStore';
import { BoardModal } from './BoardModal';
import { Dashboard } from './Dashboard';
import { Roadmap } from './Roadmap';
import { SchedulePreview } from './SchedulePreview';
import { StageEditor } from './StageEditor';
import { StagePanel } from './StagePanel';
import { Toolbar, type ViewMode } from './Toolbar';
import { Tooltip } from './Tooltip';

/**
 * All state lives in the Zustand store, hydrated on mount from the DB state the
 * server component read. Hydration waits for mount because "today" has to come
 * from the viewer's clock, not the server's — TODAY markers and overdue counts
 * would otherwise be computed in the server's timezone.
 */
export function AppShell({
  initial,
  profiles,
}: {
  initial: ProjectState;
  profiles: ProfileSummary[];
}) {
  const hydrated = useAppStore((s) => s.hydrated);
  const hydrate = useAppStore((s) => s.hydrate);

  useEffect(() => {
    /* A pop-up belongs to the program it was opened from. Only close it on an
       actual switch — `initial` is a fresh object after every revalidatePath,
       and closing then would shut the pop-up out from under a mutation. */
    const switching = useAppStore.getState().projectId !== initial.projectId;
    hydrate(initial);
    if (switching) useModalStore.getState().close();
  }, [hydrate, initial]);

  return hydrated ? <App profiles={profiles} /> : null;
}

function App({ profiles }: { profiles: ProfileSummary[] }) {
  const projectName = useAppStore((s) => s.projectName);
  const setProjectName = useAppStore((s) => s.setProjectName);
  const profile = useAppStore((s) => s.profile);
  const stages = useAppStore((s) => s.stages);
  const setProfile = useAppStore((s) => s.setProfile);
  const edited = useAppStore((s) => s.edited);
  const resetSchedule = useAppStore((s) => s.resetSchedule);
  const closeAllInline = useAppStore((s) => s.closeAllInline);
  const currentStage = useAppStore((s) => s.currentStage);
  const [mode, setMode] = useState<ViewMode>('journey');
  const [stagesOpen, setStagesOpen] = useState(false);

  /* setMode(): the dashboard is a fixed overlay, so the page behind it locks.
     The cleanup matters on navigation: leaving a program in dashboard mode used
     to strand overflow:hidden on <html>, which left the program list unable to
     scroll. */
  useEffect(() => {
    const dash = mode === 'schedule';
    document.body.classList.toggle('schedule-mode', dash);
    document.documentElement.style.overflow = dash ? 'hidden' : '';
    return () => {
      document.body.classList.remove('schedule-mode');
      document.documentElement.style.overflow = '';
    };
  }, [mode]);

  /* EDITED flag is CSS-driven off the body class, as in the reference. */
  useEffect(() => {
    document.body.classList.toggle('has-overrides', edited);
    return () => document.body.classList.remove('has-overrides');
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
        profile={profile}
        profiles={profiles}
        onProfileChange={setProfile}
        onEditStages={() => setStagesOpen(true)}
        mode={mode}
        onModeChange={setMode}
        onResetSchedule={resetSchedule}
      />

      <div id="brand-badge">AtlasPM</div>

      <Roadmap />

      <main id="stage-panels" aria-live="polite">
        {stages.map((s, i) => (
          <StagePanel stage={s} index={i} key={s.id} />
        ))}
        {currentStage === null && (
          <p className="panel-hint">
            Select a stage on the concurrency chart above to open it.
          </p>
        )}
      </main>

      <Dashboard hidden={mode !== 'schedule'} />

      {stagesOpen && <StageEditor profiles={profiles} onClose={() => setStagesOpen(false)} />}

      <BoardModal />
      <SchedulePreview />

      <Tooltip />
    </>
  );
}
