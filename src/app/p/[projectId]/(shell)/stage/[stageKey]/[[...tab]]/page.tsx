import { redirect } from 'next/navigation';
import { StagePage } from '@/components/shell/StagePage';
import { DEFAULT_TAB, isStageTab } from '@/lib/stageTabs';

/**
 * /p/:id/stage/:key           — opens on the default tab
 * /p/:id/stage/:key/:tab      — opens on that tab
 *
 * An unknown tab redirects rather than 404s: the stage is real, and the part
 * that is wrong is a section name a link may simply have got stale about.
 */
export default async function Stage({
  params,
}: PageProps<'/p/[projectId]/stage/[stageKey]/[[...tab]]'>) {
  const { projectId, stageKey, tab } = await params;
  const seg = tab?.[0];
  if (seg !== undefined && !isStageTab(seg)) {
    redirect(`/p/${projectId}/stage/${stageKey}/${DEFAULT_TAB}`);
  }
  return (
    <StagePage projectId={projectId} stageKey={stageKey} tab={seg ?? DEFAULT_TAB} />
  );
}
