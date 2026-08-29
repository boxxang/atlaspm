'use client';

import { PostThread } from './PostThread';
import { useAppStore } from '@/store/useAppStore';

/**
 * A stage's key-info board.
 *
 * What a TPM has to know and what the programme learned along the way, written
 * down where it can be found again. It is not a list of tasks and has no owner
 * or due date — only who posted it, which is why it is the post thread rather
 * than a board of items with fields.
 *
 * A note belongs to the stage rather than to any one piece of work in it, which
 * is what `Post.stageId` is for.
 */
export function KeyInfoTab({ stageId }: { stageId: string }) {
  const posts = useAppStore((s) => s.posts);
  const notes = posts.filter((p) => p.stageId === stageId && p.kind === 'note');

  return (
    <div className="pnotes">
      <PostThread
        posts={notes}
        target={{ kind: 'note', stageId }}
        placeholder="Something worth finding again…"
        emptyText="Nothing written down for this stage yet."
      />
    </div>
  );
}
