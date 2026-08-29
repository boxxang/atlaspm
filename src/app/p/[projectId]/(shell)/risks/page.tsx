import { CrossBoard } from '@/components/shell/CrossBoard';

export default async function Risks({ params }: PageProps<'/p/[projectId]/risks'>) {
  const { projectId } = await params;
  return <CrossBoard kind="risks" projectId={projectId} />;
}
