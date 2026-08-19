'use client';

import { useEffect, useRef, useState } from 'react';
import { journeyData } from '@/data/journey';
import type { StageId } from '@/data/types';
import { useAppStore, type InlineState } from '@/store/useAppStore';
import { Contacts } from './Contacts';
import { Deliverables } from './Deliverables';

const stageOf = (id: StageId) => journeyData.find((s) => s.id === id)!;

function InlineHead({
  title,
  meta,
  onClose,
}: {
  title: string;
  meta: string;
  onClose: () => void;
}) {
  return (
    <div className="inline-head">
      <h3>{title}</h3>
      <span className="meta">{meta}</span>
      <button className="inline-close" onClick={onClose}>
        ✕ CLOSE
      </button>
    </div>
  );
}

/** Engineering | Program — the two readings of the same stage. */
function ViewToggle({ stageId }: { stageId: StageId }) {
  const s = stageOf(stageId);
  const [view, setView] = useState<'eng' | 'prog'>('eng');
  return (
    <div>
      <div className="view-toggle" role="group">
        <button aria-pressed={view === 'eng'} data-view="eng" onClick={() => setView('eng')}>
          Engineering
        </button>
        <button aria-pressed={view === 'prog'} data-view="prog" onClick={() => setView('prog')}>
          Program
        </button>
      </div>
      <div className="view-pane enter" data-pane="eng" hidden={view !== 'eng'} key={`eng-${view}`}>
        <ul className="view-list">
          {s.engineeringView.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <div className="view-foot">
          <span className="cap">Tools</span>
          <span className="mono">{s.tools.join(' · ')}</span>
        </div>
      </div>
      <div className="view-pane enter" data-pane="prog" hidden={view !== 'prog'} key={`prog-${view}`}>
        <ul className="view-list">
          {s.programView.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <div className="view-foot">
          <span className="cap">Teams</span>
          <span className="mono">{s.collaboration.join(' · ')}</span>
        </div>
      </div>
    </div>
  );
}

function StageDetail({ stageId, editContact }: { stageId: StageId; editContact: string | null }) {
  const s = stageOf(stageId);
  const close = useAppStore((st) => st.closeInline);
  return (
    <>
      <InlineHead title="Stage Details" meta={s.title} onClose={() => close(stageId)} />
      <p className="sheet-what">{s.description}</p>
      <div className="sheet-grid">
        <ViewToggle stageId={stageId} />
        <div className="sheet-side">
          <Deliverables stageId={stageId} />
        </div>
      </div>
      <Contacts stageId={stageId} editId={editContact} />
    </>
  );
}

/** PM must-check library — anything here can be adopted onto the risk board. */
function PotentialRisks({ stageId }: { stageId: StageId }) {
  const s = stageOf(stageId);
  const risks = useAppStore((st) => st.content[stageId].risks);
  const adopt = useAppStore((st) => st.adoptPotentialRisk);
  const close = useAppStore((st) => st.closeInline);
  const existing = new Set(risks.map((r) => r.title));
  return (
    <>
      <InlineHead
        title="Potential Risks"
        meta={`${s.title} — PM checklist · add any to the risk board`}
        onClose={() => close(stageId)}
      />
      <div className="pr-list">
        {s.potentialRisks.map((t, i) => (
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
    </>
  );
}

function LeaderEditor({ stageId }: { stageId: StageId }) {
  const l = useAppStore((st) => st.leaders[stageId]);
  const save = useAppStore((st) => st.saveLeader);
  const close = useAppStore((st) => st.closeInline);
  const [f, setF] = useState({ name: l.name, phone: l.phone, email: l.email });
  const nameRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <InlineHead title="Stage Leader" meta={stageOf(stageId).title} onClose={() => close(stageId)} />
      <div className="item-editor">
        <div className="ie-field">
          <span className="cap">Name</span>
          <input
            className="ie-l-name"
            value={f.name}
            ref={nameRef}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
        </div>
        <div className="ie-field">
          <span className="cap">Phone</span>
          <input
            className="ie-l-phone"
            value={f.phone}
            onChange={(e) => setF({ ...f, phone: e.target.value })}
          />
        </div>
        <div className="ie-field">
          <span className="cap">Email</span>
          <input
            className="ie-l-email"
            type="email"
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
          />
        </div>
        <div className="ie-actions">
          <button
            data-leader-save
            onClick={() => {
              if (!f.name.trim()) return nameRef.current?.focus();
              save(stageId, { name: f.name.trim(), phone: f.phone.trim(), email: f.email.trim() });
              close(stageId);
            }}
          >
            Save
          </button>
        </div>
        <p className="session-note">
          Entries live in this browser session (prototype) — persistence arrives with the
          production build.
        </p>
      </div>
    </>
  );
}

export function InlineArea({
  stageId,
  state,
  scroll = true,
}: {
  stageId: StageId;
  state: InlineState;
  scroll?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!scroll) return;
    const el = ref.current;
    requestAnimationFrame(() => el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
    // Scroll on open only, not on every keystroke inside the sheet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageId, state.kind]);

  return (
    <div className="inline-area" data-kind={state.kind} ref={ref}>
      {state.kind === 'stage' && <StageDetail stageId={stageId} editContact={state.editContact} />}
      {state.kind === 'potential' && <PotentialRisks stageId={stageId} />}
      {state.kind === 'leader' && <LeaderEditor stageId={stageId} />}
    </div>
  );
}
