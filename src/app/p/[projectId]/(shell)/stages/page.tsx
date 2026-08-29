import { StagesList } from '@/components/shell/StagesList';

export default async function StagesPage({ params }: PageProps<'/p/[projectId]/stages'>) {
  const { projectId } = await params;
  return <StagesList projectId={projectId} />;
}
