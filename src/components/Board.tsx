'use client';

import type { Item, ItemKind, StageContent, StageId } from '@/data/types';
import { fmtDT, fmtDate } from '@/lib/schedule';
import { sortedItems, useAppStore } from '@/store/useAppStore';
import { ColGrip } from './ColGrip';

/** Board rows show the newest N status updates under the title. */
export function BoardRow({
  it,
  kind,
  stageId,
  stageTag,
  updates = 1,
  onOpen,
}: {
  it: Item;
  kind: ItemKind;
  stageId?: StageId;
  stageTag?: string;
  updates?: number;
  onOpen?: () => void;
}) {
  const today = useAppStore((s) => s.today);
  const latest = [...it.updates]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, updates);

  return (
    <button
      className={`b-row${kind === 'risks' ? ' risk' : ''}`}
      data-kind={kind}
      data-item-id={it.id}
      data-stage-id={stageId}
      onClick={onOpen}
    >
      <span className="b-date">{fmtDT(it.updated)}</span>
      <span className="b-title">
        {stageTag && <span className="b-stage">{stageTag}</span>}
        <span className="t">{it.title}</span>
      </span>
      <span className="b-owner">{it.owner || '—'}</span>
      {/* key information has no DUE column */}
      {kind !== 'keyinfo' &&
        (!it.due ? (
          <span className="b-due">—</span>
        ) : (
          <span className={`b-due${!it.done && it.due < today ? ' overdue' : ''}`}>
            {fmtDate(it.due)}
          </span>
        ))}
      {latest.map((u) => (
        <span className="b-latest" key={u.id}>
          <span className="lu-date">{fmtDT(u.date)}</span> — {u.text}
        </span>
      ))}
    </button>
  );
}

export function BoardCols({ kind }: { kind: ItemKind }) {
  return (
    <div className="board-cols">
      <span>
        Updated
        <ColGrip col="date" dir={1} cell={0} kind={kind} />
      </span>
      <span>
        Title
        <ColGrip col="owner" dir={-1} cell={2} kind={kind} />
      </span>
      <span>
        Owner
        {kind !== 'keyinfo' && <ColGrip col="due" dir={-1} cell={3} kind={kind} />}
      </span>
      {kind !== 'keyinfo' && <span>Due</span>}
    </div>
  );
}

const boardNote = (content: StageContent, kind: ItemKind) => {
  const list = content[kind];
  const total = list.length;
  const upd = list.reduce((n, it) => n + it.updates.length, 0);
  const base = kind === 'risks' ? `${total} open` : `${total} item${total === 1 ? '' : 's'}`;
  return upd ? `${base} · ${upd} update${upd === 1 ? '' : 's'}` : base;
};

/** Main-page board: latest 3 + Show more (always) → pop-up. */
export function Board({
  stageId,
  kind,
  title,
  extraBtns,
  onOpenItem,
  onAdd,
  onShowMore,
}: {
  stageId: StageId;
  kind: ItemKind;
  title: string;
  extraBtns?: React.ReactNode;
  onOpenItem?: (itemId: string) => void;
  onAdd?: () => void;
  onShowMore?: () => void;
}) {
  const content = useAppStore((s) => s.content[stageId]);
  const list = sortedItems(content, kind);

  return (
    <div className="board" data-kind={kind}>
      <div className="board-head">
        <span className="cap">{title}</span>
        <span className="note">{boardNote(content, kind)}</span>
        <span className="spacer" />
        {extraBtns}
        <button className="board-btn" data-add={kind} onClick={onAdd}>
          + Add
        </button>
      </div>
      <BoardCols kind={kind} />
      {list.length ? (
        list
          .slice(0, 3)
          .map((it) => (
            <BoardRow
              it={it}
              kind={kind}
              key={it.id}
              onOpen={onOpenItem ? () => onOpenItem(it.id) : undefined}
            />
          ))
      ) : (
        <div className="b-empty">Nothing here yet.</div>
      )}
      <div className="board-foot">
        <button className="board-btn" data-more={kind} onClick={onShowMore}>
          Show more
        </button>
      </div>
    </div>
  );
}
