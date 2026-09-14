import { redirect } from 'next/navigation';
import { MeetingsPage } from '@/components/meetings/MeetingsPage';
import { DEFAULT_MEETINGS_TAB, isMeetingsTab, meetingsTabHref } from '@/lib/meetings/tabs';

/**
 * /p/:id/meetings              — Calendar
 * /p/:id/meetings?tab=upcoming — and the other tabs; Action Items is a screen
 *                                of its own, and ?tab=actions goes there
 *
 * The programme and its meetings are already in the stores by the time the
 * shell renders, so only the tab is read here.
 */
export default async function Meetings({ params, searchParams }: PageProps<'/p/[projectId]/meetings'>) {
  const { projectId } = await params;
  const { tab } = await searchParams;
  if (tab === 'actions') redirect(meetingsTabHref(projectId, 'actions'));
  return <MeetingsPage projectId={projectId} tab={isMeetingsTab(tab) && tab !== 'actions' ? tab : DEFAULT_MEETINGS_TAB} />;
}
