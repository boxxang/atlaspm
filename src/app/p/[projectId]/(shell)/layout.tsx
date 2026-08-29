import { notFound } from 'next/navigation';
import { ProgramShell } from '@/components/shell/ProgramShell';
import { getProjectState } from '@/lib/queries';

/**
 * Every view of a programme renders inside the shell, so the programme is read
 * once here rather than once per screen. The route group keeps /classic — the
 * V1 page — outside it, which is the whole reason the group exists.
 *
 * Dynamic for the same reason the V1 page is: the programme comes out of the
 * database, and a prerender would serve whatever it held at build time.
 */
export const dynamic = 'force-dynamic';

export default async function ProgramLayout({
  params,
  children,
}: LayoutProps<'/p/[projectId]'>) {
  const { projectId } = await params;
  const initial = await getProjectState(projectId);
  if (!initial) notFound();
  return <ProgramShell initial={initial}>{children}</ProgramShell>;
}
