'use client';

import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import type { ProjectState } from '@/lib/projectState';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { LeftNav } from './LeftNav';
import { Rail } from './Rail';

/**
 * The shell, laid out the way the prototype lays it out: a nav down the left, a
 * header strip, the view, and a rail on the right that follows the selection.
 *
 * The ids are the prototype's — #app, #side, #main, #view, #peek — because its
 * stylesheet is ported verbatim and addresses them. Following its markup rather
 * than deriving one is the point of this pass: an approximation is how you end
 * up with a screen that is nearly the mockup.
 *
 * Hydration waits for mount because "today" has to come from the viewer's
 * clock, not the server's — TODAY markers and overdue counts would otherwise be
 * computed in the server's timezone.
 */
export function ProgramShell({
  initial,
  children,
}: {
  initial: ProjectState;
  children: ReactNode;
}) {
  const hydrated = useAppStore((s) => s.hydrated);
  const hydrate = useAppStore((s) => s.hydrate);
  const pathname = usePathname();

  useEffect(() => {
    hydrate(initial);
  }, [hydrate, initial]);

  /* The rail clears on navigation. A step picked on one screen has nothing to
     say on the next, and a rail still showing it would be claiming a selection
     that is no longer on the page. A view that wants one sets it from the URL. */
  useEffect(() => {
    useRailStore.getState().clear();
  }, [pathname]);

  if (!hydrated) return null;

  return (
    <div id="app">
      <LeftNav projectId={initial.projectId} />
      <div id="main">
        <div className="body">
          <div className="scroll" id="view">
            {children}
          </div>
          <Rail projectId={initial.projectId} />
        </div>
      </div>
    </div>
  );
}
