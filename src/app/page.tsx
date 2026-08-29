import { ProgramsView } from '@/components/shell/ProgramsView';
import { getProjectSummaries, listProfiles } from '@/lib/queries';

/** Reads the database on every request, so it must not be prerendered. */
export const dynamic = 'force-dynamic';

export default async function Home() {
  const [projects, profiles] = await Promise.all([getProjectSummaries(), listProfiles()]);
  return <ProgramsView projects={projects} profiles={profiles} />;
}
