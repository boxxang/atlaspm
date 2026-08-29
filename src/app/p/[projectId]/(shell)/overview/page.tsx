import { OverviewPage } from '@/components/shell/OverviewPage';

export default async function Overview({ params }: PageProps<'/p/[projectId]/overview'>) {
  const { projectId } = await params;
  return <OverviewPage projectId={projectId} />;
}
