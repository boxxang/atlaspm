import { TimelinePage } from '@/components/shell/TimelinePage';

export default async function Timeline({ params }: PageProps<'/p/[projectId]/timeline'>) {
  const { projectId } = await params;
  return <TimelinePage projectId={projectId} />;
}
