'use client';

import { lifecyclePhases, phaseById, stageMilestone } from '@/data/scheduleProfiles';
import type { Stage } from '@/data/types';
import { addWeeks, fromISO, toISO } from '@/lib/schedule';

/** Weeks as the field shows them: one decimal at most, never a float artefact. */
const roundW = (weeks: number) => Math.round(weeks * 10) / 10;
import { useModalStore } from '@/store/modalStore';
import { useAppStore } from '@/store/useAppStore';
import { Board } from './Board';
import { Contacts } from './Contacts';
import { InlineArea } from './InlineArea';
import { stageViz } from './stageViz';

function LeaderRow({ stage }: { stage: Stage }) {
  const l = useAppStore((s) => s.leaders[stage.id]);
  const openInline = useAppStore((s) => s.openInline);
  return (
    <div className="leader-row" data-role="leader">
      <span className="cap">Stage Leader</span>
      {/* a new program has no leaders until someone names them */}
      <span className={`l-name${l.name ? '' : ' none'}`}>{l.name || 'Unassigned'}</span>
      {(l.phone || l.email) && (
        <span className="l-contact">{[l.phone, l.email].filter(Boolean).join(' · ')}</span>
      )}
      <button className="l-edit" data-leader-edit onClick={() => openInline(stage.id, 'leader')}>
        Edit
      </button>
    </div>
  );
}

/** Editing either date ripples the rest of the program — see applyDateEdit. */
function DatesRow({ stage }: { stage: Stage }) {
  const st = useAppStore((s) => s.schedule.stages[stage.id]);
  const editStageDate = useAppStore((s) => s.editStageDate);
  const ms = stageMilestone[stage.id];
  return (
    <div className="dates-row">
      <input
        type="date"
        className="d-edit"
        data-role="start-edit"
        aria-label="Planned start"
        title="Edit planned start — later stages shift with it"
        value={toISO(st.start)}
        onChange={(e) => e.target.value && editStageDate(stage.id, 'start', fromISO(e.target.value))}
      />
      <span className="sep">━</span>
      {/* The middle field is editable too: with a start fixed, typing the
          number of weeks is how a completion date is usually decided. */}
      <span className="tat" data-role="tat">
        <input
          type="number"
          className="tat-edit"
          data-role="tat-edit"
          min={0.5}
          step={0.5}
          aria-label="Duration in weeks"
          title="Edit the duration — the completion date follows, and later stages shift"
          value={roundW(st.durationWeeks)}
          onChange={(e) => {
            const weeks = Number.parseFloat(e.target.value);
            if (!Number.isFinite(weeks) || weeks <= 0) return;
            editStageDate(stage.id, 'end', addWeeks(st.start, weeks));
          }}
        />
        <span className="tat-unit">W TAT</span>
      </span>
      <span className="sep">━</span>
      <input
        type="date"
        className="d-edit"
        data-role="end-edit"
        aria-label="Expected completion"
        title="Edit completion — TAT and later stages adjust"
        value={toISO(st.end)}
        onChange={(e) => e.target.value && editStageDate(stage.id, 'end', fromISO(e.target.value))}
      />
      {ms?.major && <span className="mslbl">{ms.label}</span>}
    </div>
  );
}

export function StagePanel({ stage, index }: { stage: Stage; index: number }) {
  const selected = useAppStore((s) => s.currentStage === index);
  const inline = useAppStore((s) => s.inline[stage.id]);
  const openInline = useAppStore((s) => s.openInline);
  const contactEdit = inline?.kind === 'stage' ? inline.editContact : null;
  const openBoard = useModalStore((m) => m.openBoard);
  const num = String(stage.stage).padStart(2, '0');
  const phase = phaseById(stage.phaseId);
  const phaseNo = lifecyclePhases.findIndex((p) => p.id === phase.id) + 1;
  const detailOpen = !!inline;

  return (
    <div
      className={[
        'stage-panel',
        stage.moment ? 'moment' : '',
        selected ? 'selected' : '',
        detailOpen ? 'detail-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-id={stage.id}
      data-index={index}
      role="tabpanel"
      aria-label={`Stage ${num}: ${stage.title}`}
    >
      <div className="panel-info">
        <span className="phase-cap">
          Phase {phaseNo} — {phase.label}
        </span>
        <div className="stage-meta">
          <span className="stage-num">{num} / 12</span>
          <span className="stage-short">{stage.shortTitle}</span>
        </div>
        <h2>{stage.title}</h2>
        <p className="tagline">{stage.tagline}</p>
        <LeaderRow stage={stage} />
        <DatesRow stage={stage} />
      </div>

      {/* The visual stretches to the info column beside it, so it ends on the
          dates row's bottom border rather than running past it. A stage someone
          added has no drawing, and keeps the empty column so the rest of the
          panel does not reflow around it. */}
      <div
        className="viz"
        aria-hidden="true"
        dangerouslySetInnerHTML={{
          __html: stage.vizKey ? stageViz[stage.vizKey]() : '',
        }}
      />

      {/* One full-width slot below the dates: the sheet when it is open, the
          button that opens it when it is not. */}
      {inline ? (
        <InlineArea stageId={stage.id} state={inline} scroll={false} />
      ) : (
        <div className="detail-slot">
          <button
            className="details-btn"
            data-toggle-detail
            onClick={() => openInline(stage.id, 'stage')}
          >
            Stage Details
          </button>
        </div>
      )}

      {/* Activity down the left; key information over risk on the right. */}
      <div className="facts">
        <Board
          stageId={stage.id}
          kind="activities"
          title="Activity"
          mailWholeList
          onOpenItem={(id) => openBoard(stage.id, 'activities', 'item', id, 'board')}
          onAdd={() => openBoard(stage.id, 'activities', 'edit', null, 'add')}
          onShowMore={() => openBoard(stage.id, 'activities', 'board')}
        />
        <Board
          stageId={stage.id}
          kind="keyinfo"
          title="Key Information"
          onOpenItem={(id) => openBoard(stage.id, 'keyinfo', 'item', id, 'board')}
          onAdd={() => openBoard(stage.id, 'keyinfo', 'edit', null, 'add')}
          onShowMore={() => openBoard(stage.id, 'keyinfo', 'board')}
        />
        <Board
          stageId={stage.id}
          kind="risks"
          title="Risk"
          onOpenItem={(id) => openBoard(stage.id, 'risks', 'item', id, 'board')}
          onAdd={() => openBoard(stage.id, 'risks', 'edit', null, 'add')}
          onShowMore={() => openBoard(stage.id, 'risks', 'board')}
          extraBtns={
            <button
              className="board-btn"
              data-potential
              onClick={() => openInline(stage.id, 'potential')}
            >
              Potential Risks
            </button>
          }
        />
      </div>

      <Contacts stageId={stage.id} editId={contactEdit} />
    </div>
  );
}
