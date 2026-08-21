'use client';

import { useEffect } from 'react';
import type { Item, ItemKind, Stage, StageId } from '@/data/types';
import { isOverdue } from '@/lib/derive';
import { fmtDT } from '@/lib/schedule';
import {
  KIND_LABELS,
  PAGE_SIZE,
  useModalStore,
  type ModalState,
} from '@/store/modalStore';
import { flushWrites, sortedItems, useAppStore, type AppState } from '@/store/useAppStore';
import { useWrapped } from '@/store/wrapStore';
import { BoardCols, BoardRow } from './Board';
import { WrapToggle } from './WrapToggle';
import { ItemEditor, ItemView } from './ItemView';

/* Which stages exist belongs to the program's profile, so the aggregate views
   are handed its stage list rather than reading one out of the code. */
const finder = (stages: readonly Stage[]) => (id: StageId) =>
  stages.find((s) => s.id === id) ?? null;

interface Entry {
  it: Item;
  stage: Stage | null;
}

/** Rows for the current board view — one stage, or every stage when aggregate. */
function boardEntries(
  m: ModalState,
  content: AppState['content'],
  stages: readonly Stage[],
  today: Date,
): Entry[] {
  if (!m.kind) return [];
  if (!m.agg) {
    return sortedItems(content[m.stageId!], m.kind).map((it) => ({ it, stage: null }));
  }
  const stageOf = finder(stages);
  const out: Entry[] = [];
  for (const id of stages.map((s) => s.id)) {
    for (const it of content[id][m.kind]) {
      if (m.agg.type === 'overdue' && !isOverdue(it, today)) continue;
      out.push({ it, stage: stageOf(id) });
    }
  }
  return out.sort((a, b) => b.it.updated.getTime() - a.it.updated.getTime());
}

/** Every status update across all stages, newest first. */
function updateEntries(content: AppState['content'], stages: readonly Stage[]) {
  const out: { u: Item['updates'][number]; it: Item; kind: ItemKind; stage: Stage | null }[] = [];
  const stageOf = finder(stages);
  for (const id of stages.map((s) => s.id)) {
    for (const kind of ['keyinfo', 'activities', 'risks'] as const) {
      for (const it of content[id][kind]) {
        for (const u of it.updates) out.push({ u, it, kind, stage: stageOf(id) });
      }
    }
  }
  return out.sort((a, b) => b.u.date.getTime() - a.u.date.getTime());
}

function Pager({
  total,
  page,
  pages,
  onPage,
}: {
  total: number;
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="board-foot">
      <span className="note" style={{ fontSize: '.7em', color: 'var(--ink-3)' }}>
        {total} entries
      </span>
      <span className="pager">
        <button data-page-m={page - 1} disabled={page === 0} onClick={() => onPage(page - 1)}>
          ‹
        </button>
        {Array.from({ length: pages }, (_, p) => (
          <button key={p} data-page-m={p} aria-current={p === page} onClick={() => onPage(p)}>
            {p + 1}
          </button>
        ))}
        <button
          data-page-m={page + 1}
          disabled={page === pages - 1}
          onClick={() => onPage(page + 1)}
        >
          ›
        </button>
      </span>
    </div>
  );
}

export function BoardModal() {
  const m = useModalStore();
  const close = m.close;
  const content = useAppStore((s) => s.content);
  const today = useAppStore((s) => s.today);
  const projectName = useAppStore((s) => s.projectName);
  const saveItem = useAppStore((s) => s.saveItem);
  const deleteItem = useAppStore((s) => s.deleteItem);
  const postUpdate = useAppStore((s) => s.postUpdate);
  const saveUpdate = useAppStore((s) => s.saveUpdate);
  const deleteUpdate = useAppStore((s) => s.deleteUpdate);
  const attachFiles = useAppStore((s) => s.attachFiles);
  const removeAttachment = useAppStore((s) => s.removeAttachment);

  /* The page behind the pop-up locks while it is open. Unmounting has to give
     that back — navigating away with a pop-up open otherwise left body.modal-open
     stranded on the next page. */
  useEffect(() => {
    document.body.classList.toggle('modal-open', m.open);
    return () => document.body.classList.remove('modal-open');
  }, [m.open]);

  useEffect(() => {
    if (!m.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    /* capture so ESC closes the pop-up before the page-level handler sees it */
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [m.open, close]);

  const { stageId, kind, view, itemId, agg, origin } = m;
  const stages = useAppStore((s) => s.stages);
  const stage = stageId ? stages.find((s) => s.id === stageId) ?? null : null;
  const label = kind ? KIND_LABELS[kind] : '';
  /* The pane's own scope: the list's, unless a row from another stage was
     opened out of an aggregate board. */
  const paneStageId = m.selStageId ?? stageId;
  const paneKind = m.selKind ?? kind;
  const paneStage = paneStageId ? stages.find((s) => s.id === paneStageId) ?? null : null;
  const item =
    itemId && paneStageId && paneKind
      ? content[paneStageId][paneKind].find((x) => x.id === itemId) ?? null
      : null;

  const isSu = agg?.type === 'updates';
  const entries = isSu ? updateEntries(content, stages) : boardEntries(m, content, stages, today);
  const pages = Math.max(Math.ceil(entries.length / PAGE_SIZE), 1);
  const page = Math.min(m.page, pages - 1);
  const visible = entries.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const boardTitle = agg ? agg.title : label + ' Board';
  /* The pop-up over a stage board is that board, so it shares its wrap key; the
     aggregate views are their own boards and keep their own. */
  const wrapKey = agg ? `agg:${agg.type}` : kind ?? 'board';
  const wrapped = useWrapped(wrapKey);
  const paneLabel = paneKind ? KIND_LABELS[paneKind] : label;
  const paneOpen = view !== 'board';

  return (
    <>
      <div id="modal-scrim" onClick={m.close} />
      <div id="modal" role="dialog" aria-modal="true" aria-label="Board" aria-hidden={!m.open}>
        <div className="modal-win">
          <div className="modal-head" id="modal-head">
            <h3>{boardTitle}</h3>
            <span className="meta">{agg ? projectName : stage ? stage.title : ''}</span>
            <span className="spacer" />
            <WrapToggle boardKey={wrapKey} />
            {!agg && kind && (
              <button
                className="board-btn"
                data-add={kind}
                onClick={() => m.setView('edit', null)}
              >
                + Add
              </button>
            )}
            <button id="modal-close" aria-label="Close" onClick={m.close}>
              ESC ✕
            </button>
          </div>
          {/* The list stays put and the pane below it holds whatever is open,
              so reading an entry, writing one and editing one are all this one
              window rather than three screens of it. */}
          <div
            className={`modal-body${paneOpen ? ' split' : ''}`}
            id="modal-body"
            data-pane={view}
          >
            <div className={`mb-list${wrapped ? ' wrapped' : ''}`} id="modal-list">
            {isSu && (
              <>
                <div className="board-cols su-cols">
                  <span>Posted</span>
                  <span>Item — Update</span>
                </div>
                {visible.length ? (
                  (visible as ReturnType<typeof updateEntries>).map((e) => (
                    <button
                      className="su-brow b-row"
                      key={e.u.id}
                      data-stage-id={e.stage!.id}
                      data-kind={e.kind}
                      data-item-id={e.it.id}
                      aria-current={e.it.id === itemId || undefined}
                      onClick={() => m.drillInto(e.stage!.id, e.kind, e.it.id)}
                    >
                      <span className="b-date">{fmtDT(e.u.date)}</span>
                      <span className="su2">
                        <span className="t1">
                          <span className="b-stage">{e.stage!.shortTitle}</span>
                          {e.it.title}
                        </span>
                        <span className="t2">{e.u.text}</span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="b-empty">No status updates yet.</div>
                )}
                <Pager total={entries.length} page={page} pages={pages} onPage={m.setPage} />
              </>
            )}

            {!isSu && kind && (
              <div className={`board${wrapped ? ' wrapped' : ''}`} data-kind={kind}>
                <BoardCols kind={kind} />
                {visible.length ? (
                  (visible as Entry[]).map((e) => (
                    <BoardRow
                      key={e.it.id}
                      it={e.it}
                      kind={kind}
                      updates={3}
                      withTime
                      stageTag={e.stage?.shortTitle}
                      stageId={e.stage?.id}
                      mailStageId={e.stage?.id ?? stageId ?? undefined}
                      selected={e.it.id === itemId}
                      onOpen={() =>
                        e.stage
                          ? m.drillInto(e.stage.id, kind, e.it.id)
                          : m.setView('item', e.it.id)
                      }
                    />
                  ))
                ) : (
                  <div className="b-empty">Nothing here yet.</div>
                )}
                <Pager total={entries.length} page={page} pages={pages} onPage={m.setPage} />
              </div>
            )}

            </div>

            {paneOpen && (
              <div className="mb-pane" id="modal-pane">
                <div className="mb-pane-head">
                  <span className="cap">
                    {view === 'edit' ? (item ? 'Edit ' : 'New ') + paneLabel : paneLabel}
                  </span>
                  {paneStage && agg && <span className="meta">{paneStage.title}</span>}
                  <span className="spacer" />
                  <button className="mb-pane-close" data-close-pane onClick={m.back}>
                    ✕
                  </button>
                </div>

            {view === 'item' && item && paneKind && paneStageId && (
              <ItemView
                key={item.id}
                item={item}
                kind={paneKind}
                stageId={paneStageId}
                editingSuId={m.editingSuId}
                onEdit={() => m.setView('edit')}
                onSuEdit={m.setEditingSu}
                onSuSave={(suId, text) => {
                  saveUpdate(paneStageId, paneKind, item.id, suId, text);
                  m.setEditingSu(null);
                }}
                onSuDelete={(suId) => deleteUpdate(paneStageId, paneKind, item.id, suId)}
                onSuPost={(text) => postUpdate(paneStageId, paneKind, item.id, text)}
                onAttach={(files, statusUpdateId) =>
                  attachFiles(paneStageId, paneKind, item.id, { statusUpdateId }, files)
                }
                onDetach={(attachmentId, statusUpdateId) =>
                  removeAttachment(paneStageId, paneKind, item.id, attachmentId, statusUpdateId)
                }
              />
            )}

            {view === 'edit' && paneKind && paneStageId && (
              <ItemEditor
                /* keyed by session so each open starts on a clean form */
                key={`${item?.id ?? 'new'}-${m.session}`}
                item={item}
                kind={paneKind}
                stageId={paneStageId}
                onSave={async (f, files) => {
                  const saved = saveItem(paneStageId, paneKind, itemId, f);
                  /* the item has to be stored before files can hang off it */
                  if (files.length) {
                    await flushWrites();
                    await attachFiles(paneStageId, paneKind, saved.id, {}, files);
                  }
                  /* +Add from main: the save lands on the main page */
                  if (origin === 'add') return m.close();
                  m.setView('item', saved.id);
                }}
                onDetach={(attachmentId) =>
                  removeAttachment(paneStageId, paneKind, item!.id, attachmentId)
                }
                onDelete={() => {
                  deleteItem(paneStageId, paneKind, itemId!);
                  if (origin === 'add') return m.close();
                  m.setView('board', null);
                }}
              />
            )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
