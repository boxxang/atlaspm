import { notFound } from 'next/navigation';
import { ActivityDetailView } from '@/components/ActivityDetailView';
import { activityDetail } from '@/data/activityDetails';
import { getProjectState } from '@/lib/queries';

/**
 * One engineering activity, written up.
 *
 * A page of its own rather than a panel over the programme: it is a long read
 * and it is linked to, so it needs an address someone can send. The programme
 * still loads, because the detail is dated against that programme's schedule —
 * "week 2 of the stage" is a date only once you know when the stage starts.
 */
export const dynamic = 'force-dynamic';

export default async function ActivityPage({
  params,
}: PageProps<'/p/[projectId]/activity/[activityId]'>) {
  const { projectId, activityId } = await params;
  const id = decodeURIComponent(activityId).toUpperCase();
  const detail = activityDetail(id);
  if (!detail) notFound();

  const project = await getProjectState(projectId);
  if (!project) notFound();

  return <ActivityDetailView projectId={projectId} activityId={id} detail={detail} project={project} />;
}
