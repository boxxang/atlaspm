'use client';

import { TeamTable } from './TeamTable';

/**
 * A stage's Team tab — the same table the programme-wide Team page uses, so
 * adding somebody reads identically wherever it is done.
 */
export function TeamTab({ stageId }: { stageId: string }) {
  return <TeamTable stageId={stageId} />;
}
