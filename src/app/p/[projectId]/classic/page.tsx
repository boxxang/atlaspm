import { notFound } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getProjectState, listProfiles } from '@/lib/queries';

/**
 * The V1 program page: toolbar, roadmap, and every stage as a panel in one long
 * scroll. The prototype replaced this shape with a left nav and one routed view
 * at a time, which is being built beside it under /p/[projectId] rather than on
 * top of it — so the screens it still owns keep working, and their tests keep
 * catching regressions, until the phase that replaces each one lands.
 *
 * PORTING_PLAN_V2 phase V2-8 deletes this route and everything only it renders.
 *
 * The program comes out of the database, so this route has to render per
 * request. Without this the build prerenders it and every deploy would serve
 * whatever the database held at build time until something revalidated it.
 */
export const dynamic = 'force-dynamic';

export default async function ProgramPage({ params }: PageProps<'/p/[projectId]/classic'>) {
  const { projectId } = await params;
  const [initial, profiles] = await Promise.all([getProjectState(projectId), listProfiles()]);
  if (!initial) notFound();
  return <AppShell initial={initial} profiles={profiles} />;
}
