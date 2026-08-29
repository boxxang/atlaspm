import { CrossBoard } from '@/components/shell/CrossBoard';

export default async function Overdue({ params }: PageProps<'/p/[projectId]/overdue'>) {
  const { projectId } = await params;
  return <CrossBoard kind="overdue" projectId={projectId} />;
}
