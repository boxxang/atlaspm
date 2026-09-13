import { ActionsPage } from '@/components/meetings/ActionsPage';
import { isActionView } from '@/lib/meetings/tabs';

/**
 * Every action item on the programme, filtered to the view the Upcoming
 * summary was opened from. Not a nav entry of its own: follow-up is reached
 * from the meetings it came out of.
 */
export default async function MeetingActions({
  params,
  searchParams,
}: PageProps<'/p/[projectId]/meetings/actions'>) {
  const { projectId } = await params;
  const { view } = await searchParams;
  return <ActionsPage projectId={projectId} view={isActionView(view) ? view : 'mine'} />;
}
