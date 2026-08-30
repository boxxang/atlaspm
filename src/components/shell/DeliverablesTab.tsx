'use client';

import { useAppStore } from '@/store/useAppStore';
import { DeliverableTable } from './DeliverableTable';

/** A stage's key deliverables. */
export function DeliverablesTab({
  stageId,
  projectId,
}: {
  stageId: string;
  projectId: string;
}) {
  const list = useAppStore((s) => s.deliverables)[stageId] ?? [];
  if (list.length === 0) {
    return <div className="empty">This stage has no key deliverables.</div>;
  }
  return <DeliverableTable stageId={stageId} projectId={projectId} list={list} />;
}
