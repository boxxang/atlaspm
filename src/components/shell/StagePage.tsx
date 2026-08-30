'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { phaseById } from '@/data/scheduleProfiles';
import { estimateCost, formatManMonths } from '@/lib/effort';
import { fmtDate } from '@/lib/schedule';
import { stagePace } from '@/lib/stagePace';
import { STAGE_TABS, type StageTab } from '@/lib/stageTabs';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { CommsTab } from './CommsTab';
import { DeliverablesTab } from './DeliverablesTab';
import { IconPlus } from './icons';
import { KeyInfoTab } from './KeyInfoTab';
import { StageActivityTab } from './StageActivity';
import { StageRisksTab } from './StageRisksTab';
import { TeamTab } from './TeamTab';
import { UpdatesPage } from './UpdatesPage';
import { useProgramWork } from './useProgramWork';
import { useStageSteps } from './useStageSteps';

/**
 * One stage: its write-up, the band of figures across the top, and seven tabs.
 *
 * The tab is in the URL rather than in component state, which the prototype
 * does not do — its hash carries only the stage. A tab is where you are, so a
 * link to it should reopen it, and that is worth the divergence. The list
 * itself lives in /lib/stageTabs.ts, because the route validates the segment on
 * the server before this renders at all.
 */
export function StagePage({
  projectId,
  stageKey,
  tab,
}: {
  projectId: string;
  stageKey: string;
  tab: StageTab;
}) {
  const stages = useAppStore((s) => s.stages);
  const schedule = useAppStore((s) => s.schedule);
  const deliverables = useAppStore((s) => s.deliverables);
  const stageDetails = useAppStore((s) => s.stageDetails);
  const content = useAppStore((s) => s.content);
  const contacts = useAppStore((s) => s.contacts);
  const posts = useAppStore((s) => s.posts);
  const costPerManMonth = useAppStore((s) => s.costPerManMonth);
  const today = useAppStore((s) => s.today);
  const { risks } = useProgramWork();
  const params = useSearchParams();

  const stage = stages.find((s) => s.id === stageKey);
  const index = stages.findIndex((s) => s.id === stageKey);
  const activities = useStageSteps(stageKey);

  /**
   * What the rail opens on.
   *
   * A stage on its own selects itself, so the rail answers the question the page
   * is about before anything has been clicked. A link that names an activity, a
   * step or a deliverable — the Overview's rows and the Timeline's do — selects
   * that instead.
   *
   * It travels in the URL rather than being set before the navigation, because
   * the shell clears the rail on every route change: setting it first and
   * navigating second is a race the clear always wins.
   */
  const wantStep = params.get('step');
  const wantAct = params.get('act');
  const wantDeliverable = params.get('deliverable');
  useEffect(() => {
    if (!stage) return;
    if (wantStep) {
      const [act, n] = wantStep.split(':');
      if (act && n) {
        useRailStore.setState({ selection: { kind: 'step', act, n: Number(n) } });
        return;
      }
    }
    if (wantAct) {
      useRailStore.setState({ selection: { kind: 'activity', act: wantAct } });
      return;
    }
    if (wantDeliverable) {
      useRailStore.setState({
        selection: { kind: 'deliverable', stageId: stage.id, deliverableId: wantDeliverable },
      });
      return;
    }
    useRailStore.setState({ selection: { kind: 'stage', stageId: stage.id } });
  }, [stage, wantStep, wantAct, wantDeliverable]);

  if (!stage) {
    return (
      <div className="empty">
        <p className="mono-note">
          No stage <code>{stageKey}</code> on this program.
        </p>
        <Link className="btn sm" href={`/p/${projectId}/stages`}>
          All stages
        </Link>
      </div>
    );
  }

  const span = schedule.stages[stage.id];
  const dl = deliverables[stage.id] ?? [];
  const done = dl.filter((d) => d.done).length;
  const prev = index > 0 ? stages[index - 1] : null;
  const next = index < stages.length - 1 ? stages[index + 1] : null;

  const steps = activities.flatMap((a) => a.steps);
  const stepsDone = steps.filter((s) => s.done).length;
  const late = steps.filter((s) => !s.done && s.due < today).length;
  const running = activities.filter((a) => a.state.phase === 'run').length;
  const stageRisks = risks.filter((r) => r.stageId === stage.id).length;
  const mm = stage.engineeringEffort.reduce((n, e) => n + e, 0);
  const pace = span ? stagePace(span, { done: stepsDone, total: steps.length }, today) : null;
  const refs = new Set(activities.map((a) => a.ref));

  const counts: Partial<Record<StageTab, string>> = {
    activity: String(activities.length),
    board: String(content[stage.id]?.activities.length ?? 0),
    keyinfo: String(posts.filter((p) => p.stageId === stage.id && p.kind === 'note').length),
    risks: String(stageRisks),
    deliverables: `${done}/${dl.length}`,
    updates: String(posts.filter((p) => p.activityRef && refs.has(p.activityRef)).length),
    team: String(contacts[stage.id]?.length ?? 0),
  };

  const description = stageDetails[stage.id]?.description ?? stage.description;

  return (
    <>
      <div className="hd">
        <Link className="crumb" href={`/p/${projectId}/stages`}>
          Stages
        </Link>
        <span className="crumb sep">/</span>
        <span className="crumb">{phaseById(stage.phaseId).label}</span>
        <span className="crumb sep">/</span>
        <h1>{stage.title}</h1>
        <span className="pill" style={{ fontSize: 10.5 }}>
          {stage.shortTitle}
        </span>
        <span style={{ flexGrow: 1 }} />
        <span className="num" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          {index + 1} of {stages.length}
        </span>
        <div className="seg-ctl">
          <Link
            href={`/p/${projectId}/stage/${(prev ?? stage).id}/${tab}`}
            aria-label={prev ? `Previous stage: ${prev.title}` : 'No previous stage'}
          >
            ‹
          </Link>
          <Link
            href={`/p/${projectId}/stage/${(next ?? stage).id}/${tab}`}
            aria-label={next ? `Next stage: ${next.title}` : 'No next stage'}
          >
            ›
          </Link>
        </div>
        <button className="btn pri sm" type="button">
          <IconPlus light />
          New
        </button>
      </div>

      <div style={{ padding: '18px 20px 0' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.02em', margin: '0 0 6px' }}>
          {stage.title}
        </h2>
        <p style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: '76ch' }}>
          {description}
        </p>

        <div className="card sdash">
          <Dstat
            cap="Steps"
            value={`${pace?.stepsPct ?? 0}%`}
            sub={`${stepsDone} of ${steps.length} done`}
            bar={pace?.stepsPct ?? 0}
            href={`/p/${projectId}/stage/${stage.id}/activity`}
          />
          <Dstat
            cap="Key deliverables"
            value={`${done}/${dl.length}`}
            sub={`${dl.length ? Math.round((done / dl.length) * 100) : 0}% released`}
            bar={dl.length ? Math.round((done / dl.length) * 100) : 0}
            barColour="var(--ok)"
            href={`/p/${projectId}/stage/${stage.id}/deliverables`}
          />
          <Dstat
            cap="Open risks"
            value={String(stageRisks)}
            sub={stageRisks ? 'on steps still running' : 'none flagged'}
            tone={stageRisks > 0}
            href={`/p/${projectId}/stage/${stage.id}/risks`}
          />
          <Dstat
            cap="Past due"
            value={String(late)}
            sub={`step${late === 1 ? '' : 's'} overdue`}
            tone={late > 0}
            href={`/p/${projectId}/stage/${stage.id}/activity`}
          />
          <Dstat cap="Activities" value={`${running} / ${activities.length}`} sub="running now" />
          <Dstat
            cap="Effort"
            value={formatManMonths(mm).replace(' MM', '')}
            sub={`M/M${costPerManMonth ? ` · $${(estimateCost(mm, costPerManMonth) / 1e6).toFixed(1)}M` : ''}`}
          />

          {pace && span && (
            <div className="sdash-pace">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <b style={{ fontSize: 12.5, color: paceColour(pace.kind) }}>
                  {paceWords(pace, span)}
                </b>
                <span style={{ flexGrow: 1 }} />
                <span className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                  {fmtDate(span.start)} → {fmtDate(span.end)}
                </span>
              </div>
              <span className="pacebar">
                <i style={{ width: `${pace.stepsPct}%` }} />
                <b style={{ left: `calc(${pace.elapsedPct.toFixed(1)}% - 1px)` }} />
              </span>
              <div className="pacekey">
                <span>
                  <i style={{ background: 'var(--accent)' }} />
                  {pace.stepsPct}% of steps done
                </span>
                <span>
                  <i style={{ background: 'var(--ink)', width: 2 }} />
                  {Math.round(pace.elapsedPct)}% of the window spent
                  {today >= span.start && today <= span.end
                    ? ` · week ${pace.week} of ${span.durationWeeks}`
                    : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="tabs" style={{ marginTop: 15 }}>
          {STAGE_TABS.map((t) => (
            <Link
              key={t.slug}
              href={`/p/${projectId}/stage/${stage.id}/${t.slug}`}
              className={t.slug === tab ? 'tab on' : 'tab'}
              aria-current={t.slug === tab ? 'page' : undefined}
            >
              {t.label}
              <span
                className={t.slug === 'risks' && stageRisks ? 'pill risk' : 'pill'}
                style={{ fontSize: 10.5 }}
              >
                {counts[t.slug]}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {tab === 'activity' && (
        <div className="filterbar">
          <button className="btn sm" type="button">
            Status: All
          </button>
          <button className="btn sm" type="button">
            Owner: All
          </button>
          <span style={{ flexGrow: 1 }} />
          <span className="num" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            {stepsDone} of {steps.length} steps done · {formatManMonths(mm).replace(' MM', '')} M/M
          </span>
        </div>
      )}

      {tab === 'activity' && <StageActivityTab stageId={stage.id} />}
      {tab === 'keyinfo' && <KeyInfoTab stageId={stage.id} />}
      {tab === 'risks' && <StageRisksTab stageId={stage.id} projectId={projectId} />}
      {tab === 'deliverables' && <DeliverablesTab stageId={stage.id} projectId={projectId} />}
      {tab === 'team' && <TeamTab stageId={stage.id} />}
      {tab === 'board' && <CommsTab stageId={stage.id} />}
      {tab === 'updates' && <UpdatesPage projectId={projectId} stageId={stage.id} />}
    </>
  );
}

function Dstat({
  cap,
  value,
  sub,
  bar,
  barColour,
  tone,
  href,
}: {
  cap: string;
  value: string;
  sub: string;
  bar?: number;
  barColour?: string;
  tone?: boolean;
  href?: string;
}) {
  const body = (
    <>
      <div className="subcap" style={tone ? { color: 'var(--risk-ink)' } : undefined}>
        {cap}
      </div>
      <div
        className="num"
        style={{
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: '-.02em',
          marginTop: 3,
          color: tone ? 'var(--risk)' : undefined,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>{sub}</div>
      {bar !== undefined && (
        <span className="bar dbar" style={{ display: 'block' }}>
          <i style={{ width: `${bar}%`, background: barColour }} />
        </span>
      )}
    </>
  );
  return href ? (
    <Link className="dstat go" href={href}>
      {body}
    </Link>
  ) : (
    <div className="dstat">{body}</div>
  );
}

const paceColour = (kind: string) =>
  kind === 'behind' || kind === 'overrun'
    ? 'var(--risk)'
    : kind === 'ahead' || kind === 'complete'
      ? 'var(--ok)'
      : kind === 'future'
        ? 'var(--ink-3)'
        : 'var(--ink-2)';

/**
 * The verdict in words. The gap between work done and window spent is the
 * figure a TPM is after — 60% of the calendar against 30% of the steps is the
 * sentence, not either number on its own.
 */
function paceWords(p: ReturnType<typeof stagePace>, span: { start: Date; end: Date }): string {
  switch (p.kind) {
    case 'future':
      return `Not started · begins ${fmtDate(span.start)}`;
    case 'complete':
      return `Complete · closed ${fmtDate(span.end)}`;
    case 'overrun':
      return `Past its window with ${p.openSteps} step${p.openSteps === 1 ? '' : 's'} still open`;
    case 'behind':
      return `Work is ${-p.gap} points behind the calendar`;
    case 'ahead':
      return `Work is ${p.gap} points ahead of the calendar`;
    default:
      return `On pace · within ${Math.abs(p.gap)} points of the calendar`;
  }
}
