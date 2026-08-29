import { ProgramTeam } from '@/components/shell/ProgramTeam';

export default async function Team({ params }: PageProps<'/p/[projectId]/team'>) {
  const { projectId } = await params;
  return <ProgramTeam projectId={projectId} />;
}
