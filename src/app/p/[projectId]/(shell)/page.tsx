import { redirect } from 'next/navigation';

/** The programme opens on its overview, as it does in the prototype. */
export default async function ProgramIndex({ params }: PageProps<'/p/[projectId]'>) {
  const { projectId } = await params;
  redirect(`/p/${projectId}/overview`);
}
