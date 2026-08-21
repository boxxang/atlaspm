'use client';

import { useMemo, useState } from 'react';
import type { Item, ItemKind, StageContent, StageId } from '@/data/types';
import { activityListDraft, itemDraft } from '@/lib/mailDrafts';
import { buildDirectory, resolveEmail } from '@/lib/people';
import { fmtDT, fmtDate } from '@/lib/schedule';
import { sortedItems, useAppStore } from '@/store/useAppStore';
import { useWrapped } from '@/store/wrapStore';
import { deliverableRowId } from '@/lib/rowIds';
import { ClipBadge } from './Attachments';
import { ColGrip } from './ColGrip';
import { MailButton } from './MailButton';
import { WrapToggle } from './WrapToggle';

/**
 * The reference an activity's deliverable goes by — PD-D3 — for every
 * deliverable of a stage. One place, so the picker, the filter and the board
 * column all print the same thing.
 */
export function useDeliverableTags(stageId: StageId | null | undefined) {
  const deliverables = useAppStore((s) => (stageId ? s.deliverables[stageId] : undefined));
  const shortTitle = useAppStore((s) =>
    stageId ? (s.stages.find((st) => st.id === stageId)?.shortTitle ?? '') : '',
  );
  return useMemo(() => {
    const list = deliverables ?? [];
    return {
      list,
      tagOf: (id: string | null | undefined) => {
        if (!id) return null;
        const i = list.findIndex((d) => d.id === id);
        return i < 0 ? null : deliverableRowId(shortTitle, i);
      },
    };
  }, [deliverables, shortTitle]);
}

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
  withTime = false,
  onOpen,
  mailStageId,
  selected = false,
  deliverableTag,
}: {
  it: Item;
  kind: ItemKind;
  stageId?: StageId;
  stageTag?: string;
  updates?: number;
  /** The pop-up shows the clock; a board row only needs the day. */
  withTime?: boolean;
  onOpen?: () => void;
  /** Set to show the row's envelope; needs to know which stage it belongs to. */
  mailStageId?: StageId;
  /** The row the pop-up's pane is showing, marked in the list. */
  selected?: boolean;
  /** Reference of the deliverable this is work towards, e.g. PD-D3. */
  deliverableTag?: string | null;
}) {
  const today = useAppStore((s) => s.today);
  const projectName = useAppStore((s) => s.projectName);
  const stages = useAppStore((s) => s.stages);
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
      aria-current={selected || undefined}
      onClick={onOpen}
    >
      {deliverableTag !== undefined && (
        <span className={`b-dlv${deliverableTag ? '' : ' none'}`} data-b-deliverable>
          {deliverableTag ?? '—'}
        </span>
      )}
      <span className="b-date">{withTime ? fmtDT(it.updated) : fmtDate(it.updated)}</span>
      <span className="b-title">
        {stageTag && <span className="b-stage">{stageTag}</span>}
        <span className="t">{it.title}</span>
        {/* An entry with files says so on the board, so nobody has to open
            each one to find where the evidence was filed. Updates count: a
            report attached to an update belongs to the entry it is under. */}
        <ClipBadge
          count={it.attachments.length + it.updates.reduce((n, u) => n + u.attachments.length, 0)}
        />
        {mailStageId && (
          <MailButton
            className="mail-btn icon"
            title={`Email ${it.owner || 'the owner'} about this ${kind === 'risks' ? 'risk' : kind === 'keyinfo' ? 'item' : 'activity'}`}
            noRecipientHint="owner not in this program's contacts"
            draft={itemDraft({
              projectName,
              stages,
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
      {/* only activities have a DUE column — see BoardCols */}
      {kind === 'activities' &&
        (!it.due ? (
          <span className="b-due">—</span>
        ) : (
          <span className={`b-due${!it.done && it.due < today ? ' overdue' : ''}`}>
            {fmtDate(it.due)}
          </span>
        ))}
      {latest.map((u) => (
        <span className="b-latest" key={u.id}>
          <span className="lu-date">{withTime ? fmtDT(u.date) : fmtDate(u.date)}</span> — {u.text}
        </span>
      ))}
    </button>
  );
}

export function BoardCols({
  kind,
  withDeliverable = false,
}: {
  kind: ItemKind;
  /** The opened board has the width for it; the one on the page does not. */
  withDeliverable?: boolean;
}) {
  return (
    <div className="board-cols">
      {withDeliverable && <span>Deliverable</span>}
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
        {kind === 'activities' && <ColGrip col="due" dir={-1} cell={3} kind={kind} />}
      </span>
      {/* Only activities carry a due date. A risk is open until it is closed —
          it has no deadline of its own, and the column it was given was empty
          on every row, at the cost of the titles beside it. */}
      {kind === 'activities' && <span>Due</span>}
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
}) {
  const content = useAppStore((s) => s.content[stageId]);
  const projectName = useAppStore((s) => s.projectName);
  const stages = useAppStore((s) => s.stages);
  const today = useAppStore((s) => s.today);
  const dir = useDirectory();
  const all = sortedItems(content, kind);
  /* keyed by kind, so the pop-up over this board reads the same way it does */
  const wrapped = useWrapped(kind);

  /**
   * Reading the board one deliverable at a time. An activity says what it is
   * work towards; this asks the board the question back — what is being done
   * about PD-D3 — which is the question a review actually opens with.
   */
  const { list: deliverables, tagOf } = useDeliverableTags(stageId);
  const [filter, setFilter] = useState('');
  const list = filter ? all.filter((i) => i.deliverableId === filter) : all;

  return (
    <div className={`board${wrapped ? ' wrapped' : ''}`} data-kind={kind}>
      <div className="board-head">
        <span className="cap">{title}</span>
        <span className="note">
          {filter ? `${list.length} of ${all.length}` : boardNote(content, kind)}
        </span>
        <span className="spacer" />
        {kind === 'activities' && deliverables.length > 0 && (
          <select
            className="board-filter"
            data-filter-deliverable
            data-on={filter || undefined}
            aria-label="Show only the activities towards one deliverable"
            title="Show only the activities towards one deliverable"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All deliverables</option>
            {deliverables.map((d) => (
              <option value={d.id} key={d.id}>
                {tagOf(d.id)}
              </option>
            ))}
          </select>
        )}
        {mailWholeList && list.length > 0 && (
          <MailButton
            title="Email this activity list to its owners"
            draft={activityListDraft({
              projectName,
              stages,
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
        <WrapToggle boardKey={kind} />
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
          <div className="b-empty">
            {filter ? 'Nothing towards this deliverable yet.' : 'Nothing here yet.'}
          </div>
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
