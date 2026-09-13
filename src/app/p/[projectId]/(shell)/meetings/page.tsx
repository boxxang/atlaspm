import { MeetingsPage } from '@/components/meetings/MeetingsPage';
import { isMeetingsTab } from '@/lib/meetings/tabs';

/**
 * /p/:id/meetings              — Upcoming
 * /p/:id/meetings?tab=calendar — and the other three
 *
 * The programme and its meetings are already in the stores by the time the
 * shell renders, so only the tab is read here.
 */
export default async function Meetings({ params, searchParams }: PageProps<'/p/[projectId]/meetings'>) {
  const { projectId } = await params;
  const { tab } = await searchParams;
  return <MeetingsPage projectId={projectId} tab={isMeetingsTab(tab) ? tab : 'upcoming'} />;
}
