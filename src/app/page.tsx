import { ProjectList } from '@/components/ProjectList';
import { getProjectSummaries } from '@/lib/queries';

/** Reads the database on every request, so it must not be prerendered. */
export const dynamic = 'force-dynamic';

export default async function Home() {
  const projects = await getProjectSummaries();
  return <ProjectList projects={projects} />;
}
