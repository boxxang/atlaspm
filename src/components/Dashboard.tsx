'use client';

import { journeyData } from '@/data/journey';
import type { StageId } from '@/data/types';
import {
  allDeliverables,
  allUpdates,
  dday,
  inFlightStageIds,
  openRiskCount,
  overdueCount,
  progressPct,
  riskStageIds,
  upcomingMilestones,
} from '@/lib/derive';
import { fmtDT, fmtDate } from '@/lib/schedule';
import { useModalStore } from '@/store/modalStore';
import { useAppStore } from '@/store/useAppStore';
import { Gantt } from './Gantt';

const titleOf = (id: StageId) => journeyData.find((s) => s.id === id)!;

export function Dashboard({ hidden }: { hidden: boolean }) {
  const projectName = useAppStore((s) => s.projectName);
  const schedule = useAppStore((s) => s.schedule);
  const today = useAppStore((s) => s.today);
  const content = useAppStore((s) => s.content);
  const deliverables = useAppStore((s) => s.deliverables);
  const openAgg = useModalStore((m) => m.openAgg);
  const openBoard = useModalStore((m) => m.openBoard);

  /* progress = completed deliverables across the whole flow */
  const allDlv = allDeliverables(deliverables);
  const dlvDone = allDlv.filter((d) => d.done).length;
  const progress = progressPct(deliverables);
  const openRisks = openRiskCount(content);
  const riskStages = riskStageIds(content).map((id) => titleOf(id).title);
  const overdue = overdueCount(content, today);
  const inFlight = inFlightStageIds(schedule, today);
  const upcoming = upcomingMilestones(schedule, today).slice(0, 4);
  const recent = allUpdates(content);

  return (
    <section id="schedule-view" aria-label="Dashboard" aria-hidden={hidden}>
      <div className="inner">
        <h2 id="dash-title">{projectName} — Dashboard</h2>
        <p className="note" id="dash-sub">
          Program status at a glance.
        </p>

        <div id="dash">
          <div className="stat-row">
            <div className="stat">
              <span className="k cap">Program Progress</span>
              <span className="v">{progress}%</span>
              <span className="sub">
                {dlvDone} of {allDlv.length} deliverables complete
              </span>
            </div>
            <div className="stat">
              <span className="k cap">Tapeout</span>
              <span className="v mono">{dday(schedule.tapeout, today)}</span>
              <span className="sub">{fmtDate(schedule.tapeout)}</span>
            </div>
            <div className={`stat${openRisks ? ' alert' : ''}`}>
              <span className="k cap">Open Risks</span>
              <button
                className="v v-link"
                data-dash-open="risks"
                title="View all open risks"
                onClick={() => openAgg('risks')}
              >
                {openRisks}
              </button>
              <span className="sub">
                {riskStages.length ? riskStages.join(', ') : 'no stages flagged'}
              </span>
            </div>
            <div className={`stat${overdue ? ' alert' : ''}`}>
              <span className="k cap">Overdue Activities</span>
              <button
                className="v v-link"
                data-dash-open="overdue"
                title="View all overdue activities"
                onClick={() => openAgg('overdue')}
              >
                {overdue}
              </button>
              <span className="sub">past target due date</span>
            </div>
          </div>

          <div className="dash-grid">
            <div className="dash-col">
              <span className="cap">Upcoming Milestones</span>
              {upcoming.length ? (
                upcoming.map((m) => (
                  <div className="dash-item" key={m.id}>
                    <span className="d">{fmtDate(m.date)}</span>
                    <span className="t">
                      {m.major ? '◆ ' : '◇ '}
                      {m.label}
                    </span>
                    <span className="dday">{dday(m.date, today)}</span>
                  </div>
                ))
              ) : (
                <div className="dash-empty">No upcoming milestones.</div>
              )}

              <span className="cap" style={{ marginTop: '22px' }}>
                In Flight Today
              </span>
              <div className="dash-flight">
                {inFlight.length ? (
                  inFlight.map((id) => (
                    <span key={id} className={content[id].risks.length ? 'risky' : undefined}>
                      {titleOf(id).shortTitle} · {titleOf(id).title}
                    </span>
                  ))
                ) : (
                  <span>No stage active today</span>
                )}
              </div>
            </div>

            <div className="dash-col">
              <div className="dash-head-row">
                <span className="cap">Recent Status Updates</span>
                <span className="spacer" />
                <button
                  className="board-btn"
                  style={{ color: 'var(--accent)' }}
                  data-dash-open="updates"
                  onClick={() => openAgg('updates')}
                >
                  Show more
                </button>
              </div>
              {recent.length ? (
                recent.slice(0, 6).map((r) => (
                  <button
                    className="dash-su"
                    key={r.su.id}
                    data-su-stage={r.stageId}
                    data-su-kind={r.kind}
                    data-su-item={r.item.id}
                    onClick={() => openBoard(r.stageId, r.kind, 'item', r.item.id, 'direct')}
                  >
                    <span className="d">{fmtDT(r.su.date)}</span>
                    <span className="su2">
                      <span className="t1">
                        <span className="b-stage">{titleOf(r.stageId).shortTitle}</span>
                        {r.item.title}
                      </span>
                      <span className="t2">{r.su.text}</span>
                    </span>
                  </button>
                ))
              ) : (
                <div className="dash-empty">
                  No status updates yet — post one from any activity or risk.
                </div>
              )}
            </div>
          </div>
        </div>

        <h2 id="sched-cap" style={{ fontSize: '1.1em' }}>
          Program Schedule
        </h2>
        <p className="note">
          Baseline planning assumptions — semiconductor development is highly concurrent; stages
          overlap by design.
        </p>
        <Gantt id="gantt-b" />
      </div>
    </section>
  );
}
