import { OverduePage } from '@/components/shell/OverduePage';

export default async function Overdue({ params }: PageProps<'/p/[projectId]/overdue'>) {
  const { projectId } = await params;
  return <OverduePage projectId={projectId} />;
}
