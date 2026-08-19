'use client';

import { useEffect } from 'react';
import { journeyData } from '@/data/journey';
import { STAGE_ORDER } from '@/data/scheduleProfiles';
import type { Item, ItemKind, JourneyStage, StageId } from '@/data/types';
import { isOverdue } from '@/lib/derive';
import { fmtDT } from '@/lib/schedule';
import {
  KIND_LABELS,
  PAGE_SIZE,
  useModalStore,
  type ModalState,
} from '@/store/modalStore';
import { sortedItems, useAppStore, type AppState } from '@/store/useAppStore';
import { BoardCols, BoardRow } from './Board';
import { ItemEditor, ItemView } from './ItemView';

const stageOf = (id: StageId) => journeyData.find((s) => s.id === id)!;

interface Entry {
  it: Item;
  stage: JourneyStage | null;
}

/** Rows for the current board view — one stage, or every stage when aggregate. */
function boardEntries(m: ModalState, content: AppState['content'], today: Date): Entry[] {
  if (!m.kind) return [];
  if (!m.agg) {
    return sortedItems(content[m.stageId!], m.kind).map((it) => ({ it, stage: null }));
  }
  const out: Entry[] = [];
  for (const id of STAGE_ORDER) {
    for (const it of content[id][m.kind]) {
      if (m.agg.type === 'overdue' && !isOverdue(it, today)) continue;
      out.push({ it, stage: stageOf(id) });
    }
  }
  return out.sort((a, b) => b.it.updated.getTime() - a.it.updated.getTime());
}

/** Every status update across all stages, newest first. */
function updateEntries(content: AppState['content']) {
  const out: { u: Item['updates'][number]; it: Item; kind: ItemKind; stage: JourneyStage }[] = [];
  for (const id of STAGE_ORDER) {
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

  /* the page behind the pop-up locks while it is open */
  useEffect(() => {
    document.body.classList.toggle('modal-open', m.open);
  }, [m.open]);

  /* The dashboard stat tiles that open the aggregate boards arrive in Phase 5.
     Until then this is the only entry point, so expose it outside production
     builds for the e2e suite. */
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    (window as unknown as { __atlasOpenAgg?: unknown }).__atlasOpenAgg =
      useModalStore.getState().openAgg;
  }, []);

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
  const stage = stageId ? stageOf(stageId) : null;
  const label = kind ? KIND_LABELS[kind] : '';
  const item =
    itemId && stageId && kind ? content[stageId][kind].find((x) => x.id === itemId) ?? null : null;

  const isSu = agg?.type === 'updates';
  const entries = isSu ? updateEntries(content) : boardEntries(m, content, today);
  const pages = Math.max(Math.ceil(entries.length / PAGE_SIZE), 1);
  const page = Math.min(m.page, pages - 1);
  const visible = entries.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const showBack = view !== 'board' && (origin === 'board' || origin === 'agg');
  const boardTitle = agg ? agg.title : label + ' Board';
  const heading =
    view === 'edit' ? (item ? 'Edit ' : 'New ') + label : view === 'item' ? label : boardTitle;

  return (
    <>
      <div id="modal-scrim" onClick={m.close} />
      <div id="modal" role="dialog" aria-modal="true" aria-label="Board" aria-hidden={!m.open}>
        <div className="modal-win">
          <div className="modal-head" id="modal-head">
            {showBack && (
              <button className="mb-back" data-back onClick={m.back}>
                ‹ Board
              </button>
            )}
            <h3>{heading}</h3>
            <span className="meta">
              {view === 'board' && agg ? projectName : stage ? stage.title : ''}
            </span>
            <span className="spacer" />
            {view === 'board' && !agg && kind && (
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
          <div className="modal-body" id="modal-body">
            {view === 'board' && isSu && (
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
                      data-stage-id={e.stage.id}
                      data-kind={e.kind}
                      data-item-id={e.it.id}
                      onClick={() => m.drillInto(e.stage.id, e.kind, e.it.id)}
                    >
                      <span className="b-date">{fmtDT(e.u.date)}</span>
                      <span className="su2">
                        <span className="t1">
                          <span className="b-stage">{e.stage.shortTitle}</span>
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

            {view === 'board' && !isSu && kind && (
              <div className="board" data-kind={kind}>
                <BoardCols kind={kind} />
                {visible.length ? (
                  (visible as Entry[]).map((e) => (
                    <BoardRow
                      key={e.it.id}
                      it={e.it}
                      kind={kind}
                      updates={3}
                      stageTag={e.stage?.shortTitle}
                      stageId={e.stage?.id}
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

            {view === 'item' && item && kind && stageId && (
              <ItemView
                key={item.id}
                item={item}
                kind={kind}
                editingSuId={m.editingSuId}
                onEdit={() => m.setView('edit')}
                onSuEdit={m.setEditingSu}
                onSuSave={(suId, text) => {
                  saveUpdate(stageId, kind, item.id, suId, text);
                  m.setEditingSu(null);
                }}
                onSuDelete={(suId) => deleteUpdate(stageId, kind, item.id, suId)}
                onSuPost={(text) => postUpdate(stageId, kind, item.id, text)}
              />
            )}

            {view === 'edit' && kind && stageId && (
              <ItemEditor
                key={item?.id ?? 'new'}
                item={item}
                kind={kind}
                onSave={(f) => {
                  const saved = saveItem(stageId, kind, itemId, f);
                  /* +Add from main: the save lands on the main page */
                  if (origin === 'add') return m.close();
                  m.setView('item', saved.id);
                }}
                onDelete={() => {
                  deleteItem(stageId, kind, itemId!);
                  if (origin === 'add') return m.close();
                  m.setView('board', null);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
