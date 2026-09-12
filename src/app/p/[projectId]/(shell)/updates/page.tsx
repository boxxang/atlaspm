import { UpdatesPage } from '@/components/shell/UpdatesPage';

/* The programme is already in the store by the time the shell renders, so only
   the route parameter the row links need is read here. */
export default async function Updates({ params }: PageProps<'/p/[projectId]/updates'>) {
  const { projectId } = await params;
  return <UpdatesPage projectId={projectId} />;
}
