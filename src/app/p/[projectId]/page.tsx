import { notFound } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getProjectState } from '@/lib/queries';

/**
 * The program comes out of the database, so this route has to render per
 * request. Without this the build prerenders it and every deploy would serve
 * whatever the database held at build time until something revalidated it.
 */
export const dynamic = 'force-dynamic';

export default async function ProgramPage({ params }: PageProps<'/p/[projectId]'>) {
  const { projectId } = await params;
  const initial = await getProjectState(projectId);
  if (!initial) notFound();
  return <AppShell initial={initial} />;
}
