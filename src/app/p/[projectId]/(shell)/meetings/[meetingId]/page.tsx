import { MeetingDetail } from '@/components/meetings/MeetingDetail';
import { isMeetingDetailTab } from '@/lib/meetings/tabs';

/**
 * One meeting. The id is looked up in this programme's meetings only — the
 * store holds nothing else — so another programme's meeting id answers "no
 * such meeting" rather than rendering it.
 */
export default async function MeetingPage({
  params,
  searchParams,
}: PageProps<'/p/[projectId]/meetings/[meetingId]'>) {
  const { projectId, meetingId } = await params;
  const { tab } = await searchParams;
  return (
    <MeetingDetail
      projectId={projectId}
      meetingId={decodeURIComponent(meetingId)}
      tab={isMeetingDetailTab(tab) ? tab : 'overview'}
    />
  );
}
