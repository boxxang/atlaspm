import { ActivitiesPage } from '@/components/shell/ActivitiesPage';

export default async function Activities({ params }: PageProps<'/p/[projectId]/activities'>) {
  const { projectId } = await params;
  return <ActivitiesPage projectId={projectId} />;
}
