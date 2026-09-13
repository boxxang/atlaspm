'use client';

import { useEffect } from 'react';

/**
 * A meetings screen that failed to draw. The rest of the programme's shell
 * stays up around it, and nothing already saved is at stake — the failure is
 * in showing it, so the one thing offered is to try again.
 */
export default function MeetingsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error('[atlaspm] meetings screen failed', error);
  }, [error]);

  return (
    <>
      <div className="hd">
        <h1>Meetings</h1>
      </div>
      <div className="empty" role="alert">
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>
          This meetings screen could not be shown.
        </div>
        <p className="mono-note" style={{ maxWidth: '48ch' }}>
          Nothing saved has been lost. Try again, or reload the page.
        </p>
        <button type="button" className="btn sm" onClick={() => retry()}>
          Try again
        </button>
      </div>
    </>
  );
}
