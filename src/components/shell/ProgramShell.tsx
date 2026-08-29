'use client';

import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import type { ProjectState } from '@/lib/projectState';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { LeftNav } from './LeftNav';
import { Rail } from './Rail';

/**
 * The shell the prototype runs in: a nav on the left, one view at a time in the
 * middle, and a rail on the right that follows whatever is selected.
 *
 * The V1 program page put every stage in one long scroll under a toolbar. That
 * shape is still reachable at /p/[id]/classic while the screens are ported one
 * at a time; this is what replaces it.
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

  /* The rail clears on navigation. A step picked on one stage has nothing to
     say on the next screen, and a rail still showing it would be claiming a
     selection that is no longer on the page. */
  useEffect(() => {
    useRailStore.getState().clear();
  }, [pathname]);

  if (!hydrated) return null;

  return (
    <div className="pshell">
      <LeftNav projectId={initial.projectId} />
      <main className="pview">{children}</main>
      <Rail projectId={initial.projectId} />
    </div>
  );
}
