import { UpdatesPage } from '@/components/shell/UpdatesPage';

export default async function Updates({ params }: PageProps<'/p/[projectId]/updates'>) {
  const { projectId } = await params;
  return <UpdatesPage projectId={projectId} />;
}
