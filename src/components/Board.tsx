'use client';

import { useMemo } from 'react';
import type { Item, ItemKind, StageContent, StageId } from '@/data/types';
import { activityListDraft, itemDraft } from '@/lib/mailDrafts';
import { buildDirectory, resolveEmail } from '@/lib/people';
import { fmtDT, fmtDate } from '@/lib/schedule';
import { sortedItems, useAppStore } from '@/store/useAppStore';
import { ColGrip } from './ColGrip';
import { MailButton } from './MailButton';

/** The program's own address book, used to route an item to its owner. */
export function useDirectory() {
  const leaders = useAppStore((s) => s.leaders);
  const contacts = useAppStore((s) => s.contacts);
  return useMemo(() => buildDirectory(leaders, contacts), [leaders, contacts]);
}

/** Board rows show the newest N status updates under the title. */
export function BoardRow({
  it,
  kind,
  stageId,
  stageTag,
  updates = 1,
  onOpen,
  mailStageId,
}: {
  it: Item;
  kind: ItemKind;
  stageId?: StageId;
  stageTag?: string;
  updates?: number;
  onOpen?: () => void;
  /** Set to show the row's envelope; needs to know which stage it belongs to. */
  mailStageId?: StageId;
}) {
  const today = useAppStore((s) => s.today);
  const projectName = useAppStore((s) => s.projectName);
  const dir = useDirectory();
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
        {mailStageId && (
          <MailButton
            className="mail-btn icon"
            title={`Email ${it.owner || 'the owner'} about this ${kind === 'risks' ? 'risk' : kind === 'keyinfo' ? 'item' : 'activity'}`}
            noRecipientHint="owner not in this program's contacts"
            draft={itemDraft({
              projectName,
              stageId: mailStageId,
              kind,
              item: it,
              today,
              ownerEmail: resolveEmail(dir, it.owner),
            })}
          />
        )}
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
  mailWholeList = false,
  limit = 3,
}: {
  stageId: StageId;
  kind: ItemKind;
  title: string;
  extraBtns?: React.ReactNode;
  onOpenItem?: (itemId: string) => void;
  onAdd?: () => void;
  onShowMore?: () => void;
  /** Adds an envelope in the header addressed to everyone on the list. */
  mailWholeList?: boolean;
  /** How many entries the board's window is tall enough to show at once.
   *  The rest are still rendered — they scroll. */
  limit?: number;
}) {
  const content = useAppStore((s) => s.content[stageId]);
  const projectName = useAppStore((s) => s.projectName);
  const today = useAppStore((s) => s.today);
  const dir = useDirectory();
  const list = sortedItems(content, kind);

  return (
    <div className="board" data-kind={kind} style={{ '--board-rows': limit } as React.CSSProperties}>
      <div className="board-head">
        <span className="cap">{title}</span>
        <span className="note">{boardNote(content, kind)}</span>
        <span className="spacer" />
        {mailWholeList && list.length > 0 && (
          <MailButton
            title="Email this activity list to its owners"
            draft={activityListDraft({
              projectName,
              stageId,
              items: list,
              today,
              recipients: [
                ...new Set(
                  list.map((i) => resolveEmail(dir, i.owner)).filter((e): e is string => !!e),
                ),
              ],
            })}
          />
        )}
        {extraBtns}
        <button className="board-btn" data-add={kind} onClick={onAdd}>
          + Add
        </button>
      </div>
      <BoardCols kind={kind} />
      <div className="board-rows">
        {list.length ? (
          list
            .map((it) => (
              <BoardRow
                it={it}
                kind={kind}
                key={it.id}
                mailStageId={stageId}
                onOpen={onOpenItem ? () => onOpenItem(it.id) : undefined}
              />
            ))
        ) : (
          <div className="b-empty">Nothing here yet.</div>
        )}
      </div>
      <div className="board-foot">
        <button className="board-btn" data-more={kind} onClick={onShowMore}>
          Show more
        </button>
      </div>
    </div>
  );
}
