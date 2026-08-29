'use client';

import { useRef, useState } from 'react';
import { RISK_AUTHOR } from '@/data/riskSeeds';
import { attachmentUrl, formatBytes } from '@/lib/attachments';
import { handoverComplete } from '@/lib/deliverableStatus';
import { fmtDate, fromISO, toISO } from '@/lib/schedule';
import { uid, useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { PostThread } from './PostThread';

/**
 * Handing a key deliverable over.
 *
 * One post, not three controls: a body saying what was handed over, the
 * artefacts themselves, and the date it was accepted. All three, or the
 * deliverable is not complete — the prototype's point being that "complete"
 * should mean the thing exists and somebody said so, rather than that a box
 * was ticked.
 *
 * Comments hang off the handover like any other reply, so the argument about
 * whether it was really finished lives with the claim that it was.
 *
 * The panel is keyed on the deliverable where it is rendered, so picking a
 * different one remounts it. The draft body is local state seeded from what is
 * stored, and syncing that from a prop in an effect is how you get a panel that
 * throws away what somebody was halfway through typing.
 */
export function HandoverPanel({
  stageId,
  deliverableId,
}: {
  stageId: string;
  deliverableId: string;
}) {
  const deliverable = useAppStore((s) => s.deliverables)[stageId]?.find(
    (d) => d.id === deliverableId,
  );
  const posts = useAppStore((s) => s.posts);
  const savePost = useAppStore((s) => s.savePost);
  const editPost = useAppStore((s) => s.editPost);
  const deletePost = useAppStore((s) => s.deletePost);
  const attachToHandover = useAppStore((s) => s.attachToHandover);
  const detachFromHandover = useAppStore((s) => s.detachFromHandover);
  const clear = useRailStore((s) => s.clear);

  const handover = posts.find((p) => p.deliverableId === deliverableId && p.kind === 'handover');
  const [draft, setDraft] = useState(handover?.text ?? '');
  const [problems, setProblems] = useState<string[]>([]);
  const file = useRef<HTMLInputElement>(null);

  if (!deliverable) return null;

  const files = handover?.attachments ?? [];
  const done = handoverComplete(handover ?? null);

  /* The post has to exist before a file can hang off it. */
  const ensure = (text: string, doneAt: Date | null): string => {
    if (handover) {
      editPost(handover.id, text, doneAt);
      return handover.id;
    }
    const id = uid();
    savePost({ id, kind: 'handover', text, author: RISK_AUTHOR, deliverableId, doneAt });
    return id;
  };

  return (
    <>
      <header className="prail-head">
        <h2 className="prail-cap">Handover</h2>
        <button type="button" className="prail-x" onClick={clear} aria-label="Close details">
          ×
        </button>
      </header>

      <h3 className="prail-title">{deliverable.title}</h3>
      <p className="prail-sub">
        {done ? (
          <span className="ppill ok">Completed</span>
        ) : (
          <span className="ppill">Not handed over</span>
        )}
        {deliverable.due && (
          <span className="prail-hint"> · due {fmtDate(deliverable.due)}</span>
        )}
      </p>

      <section className="prail-sec">
        <div className="prail-seccap">
          <span>What was handed over</span>
        </div>
        <textarea
          className="phandover-text"
          rows={4}
          value={draft}
          aria-label="What was handed over"
          placeholder="What is being handed over, and anything the next person needs to know."
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            if (draft.trim() !== (handover?.text ?? '')) {
              ensure(draft.trim(), handover?.doneAt ?? null);
            }
          }}
        />
      </section>

      <section className="prail-sec">
        <div className="prail-seccap">
          <span>Artefacts</span>
          <span className="num">{files.length}</span>
          <button type="button" className="pbtn tiny" onClick={() => file.current?.click()}>
            + Attach
          </button>
        </div>
        <input
          ref={file}
          type="file"
          multiple
          className="visually-hidden"
          aria-label="Attach an artefact"
          onChange={async (e) => {
            const picked = e.target.files;
            if (!picked?.length) return;
            const id = ensure(draft.trim(), handover?.doneAt ?? null);
            setProblems(await attachToHandover(stageId, deliverableId, id, picked));
            e.target.value = '';
          }}
        />
        {files.length === 0 ? (
          <p className="prail-hint">
            Nothing attached. A handover with no artefact is a claim with nothing behind it.
          </p>
        ) : (
          <ul className="prail-atts">
            {files.map((a) => (
              <li key={a.id}>
                <a href={attachmentUrl(a.id)} target="_blank" rel="noreferrer">
                  {a.filename}
                </a>
                <span className="prail-hint">{formatBytes(a.size)}</span>
                <button
                  type="button"
                  className="prail-x"
                  aria-label={`Remove ${a.filename}`}
                  onClick={() => detachFromHandover(stageId, deliverableId, a.id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {problems.map((p) => (
          <p className="prail-hint late" key={p}>
            {p}
          </p>
        ))}
      </section>

      <dl className="prail-facts">
        <dt>Accepted</dt>
        <dd>
          <input
            type="date"
            value={handover?.doneAt ? toISO(handover.doneAt) : ''}
            aria-label="Accepted"
            onChange={(e) =>
              ensure(draft.trim(), e.target.value ? fromISO(e.target.value) : null)
            }
          />
        </dd>
      </dl>

      {!done && (
        <p className="prail-hint">
          Needs a body, an artefact and the date it was accepted. Missing:{' '}
          {[
            !draft.trim() && 'what was handed over',
            files.length === 0 && 'an artefact',
            !handover?.doneAt && 'the date',
          ]
            .filter(Boolean)
            .join(', ')}
          .
        </p>
      )}

      {handover && (
        <section className="prail-sec">
          <div className="prail-seccap">
            <span>Comments</span>
          </div>
          <PostThread
            posts={[handover]}
            target={{ kind: 'handover', deliverableId }}
            placeholder="Comment on this handover…"
            emptyText=""
          />
          <button
            type="button"
            className="pbtn tiny"
            onClick={() => deletePost(handover.id)}
          >
            Delete handover
          </button>
        </section>
      )}
    </>
  );
}
