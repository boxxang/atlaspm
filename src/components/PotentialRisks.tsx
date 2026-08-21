'use client';

import { useEffect } from 'react';
import type { StageId } from '@/data/types';
import { useAppStore } from '@/store/useAppStore';

/**
 * The PM checklist for a stage: risks worth carrying, whether or not this
 * program has hit them yet. Adopting one puts it on the risk board.
 *
 * It opens over the page rather than inside it. The list is a reference you
 * consult and close — reading it against a board you cannot see while it is
 * open, which is what the inline panel did, is exactly backwards.
 */
export function PotentialRisksWindow({
  stageId,
  onClose,
}: {
  stageId: StageId;
  onClose: () => void;
}) {
  const stage = useAppStore((s) => s.stages.find((st) => st.id === stageId));
  const potential = stage?.potentialRisks ?? [];
  const risks = useAppStore((s) => s.content[stageId].risks);
  const adopt = useAppStore((s) => s.adoptPotentialRisk);
  const existing = new Set(risks.map((r) => r.title));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="dr-scrim" onClick={onClose} />
      <div
        className="dr-win pr-win"
        role="dialog"
        aria-modal="true"
        aria-label="Potential risks"
        data-pr-win
      >
        <div className="dr-head">
          <span className="cap">Potential Risks</span>
          <span className="meta">{stage?.title} — PM checklist</span>
          <span className="spacer" />
          <button className="dr-close" data-pr-close aria-label="Close" onClick={onClose}>
            ESC ✕
          </button>
        </div>
        <p className="dr-hint">
          Anything here can be tracked on this stage&rsquo;s risk board. Adding one copies its
          wording across; what happens to it afterwards is the board&rsquo;s business.
        </p>
        <div className="pr-list">
          {potential.map((t, i) => (
            <div className="pr-row" key={t}>
              <span className="t">{t}</span>
              <button
                className="pr-add"
                data-pr-index={i}
                disabled={existing.has(t)}
                onClick={() => adopt(stageId, t)}
              >
                {existing.has(t) ? 'Added' : '+ Track'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
