'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { fmtDate } from '@/lib/schedule';
import { phaseById } from '@/data/scheduleProfiles';
import { STAGE_TABS, tabLabel, type StageTab } from '@/lib/stageTabs';
import { StageActivityTab } from './StageActivity';
import { DeliverablesTab } from './DeliverablesTab';
import { KeyInfoTab } from './KeyInfoTab';
import { TeamTab } from './TeamTab';
import { StageRisksTab } from './StageRisksTab';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { useProgramWork } from './useProgramWork';

/**
 * One stage: its write-up, the band of figures across the top, and seven tabs.
 *
 * The tab is in the URL rather than in component state, which the prototype
 * does not do — its hash carries only the stage. A tab is where you are, so a
 * link to it should reopen it, and that is worth the divergence. The list
 * itself lives in /lib/stageTabs.ts, because the route has to validate the URL
 * on the server before this renders at all.
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
  const select = useRailStore((s) => s.select);
  const posts = useAppStore((s) => s.posts);
  const contacts = useAppStore((s) => s.contacts);
  const leaders = useAppStore((s) => s.leaders);
  const { risks } = useProgramWork();
  const params = useSearchParams();

  const stage = stages.find((s) => s.id === stageKey);
  const index = stages.findIndex((s) => s.id === stageKey);

  /**
   * What the rail opens on.
   *
   * A stage on its own selects itself, so the rail answers the question the page
   * is about before anything has been clicked. A link that names a step or a
   * deliverable — the Overview's rows do — selects that instead.
   *
   * It travels in the URL rather than being set before the navigation, because
   * the shell clears the rail on every route change: setting it first and
   * navigating second is a race the clear always wins.
   */
  const wantStep = params.get('step');
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
    if (wantDeliverable) {
      useRailStore.setState({
        selection: { kind: 'deliverable', stageId: stage.id, deliverableId: wantDeliverable },
      });
      return;
    }
    useRailStore.setState({ selection: { kind: 'stage', stageId: stage.id } });
  }, [stage, wantStep, wantDeliverable]);

  if (!stage) {
    return (
      <div className="pview-body">
        <p className="pview-todo">
          No stage <code>{stageKey}</code> on this program.{' '}
          <Link href={`/p/${projectId}/stages`}>All stages</Link>
        </p>
      </div>
    );
  }

  const span = schedule.stages[stage.id];
  const dl = deliverables[stage.id] ?? [];
  const done = dl.filter((d) => d.done).length;
  const prev = index > 0 ? stages[index - 1] : null;
  const next = index < stages.length - 1 ? stages[index + 1] : null;

  /* The badge and the tab behind it read the same thing. A tab whose contents
     are not built yet carries no number rather than a zero. */
  const stageRisks = risks.filter((r) => r.stageId === stage.id).length;
  const counts: Partial<Record<StageTab, string>> = {
    activity: String(stage.engineeringView.length),
    keyinfo: String(posts.filter((p) => p.stageId === stage.id && p.kind === 'note').length),
    risks: String(stageRisks),
    deliverables: `${done}/${dl.length}`,
    team: String((contacts[stage.id]?.length ?? 0) + (leaders[stage.id]?.name ? 1 : 0)),
  };

  return (
    <>
      <header className="pview-head">
        <nav className="pcrumb" aria-label="Breadcrumb">
          <Link href={`/p/${projectId}/stages`}>Stages</Link>
          <span aria-hidden="true">/</span>
          <span>{phaseById(stage.phaseId).label}</span>
        </nav>
        <h1 className="pview-title">{stage.title}</h1>
        <span className="pcode">{stage.shortTitle}</span>
        <span className="pview-spacer" />
        <span className="pview-count">
          {index + 1} of {stages.length}
        </span>
        <span className="pstep-nav">
          {prev ? (
            <Link href={`/p/${projectId}/stage/${prev.id}/${tab}`} aria-label={`Previous stage: ${prev.title}`}>
              ‹
            </Link>
          ) : (
            <span aria-hidden="true">‹</span>
          )}
          {next ? (
            <Link href={`/p/${projectId}/stage/${next.id}/${tab}`} aria-label={`Next stage: ${next.title}`}>
              ›
            </Link>
          ) : (
            <span aria-hidden="true">›</span>
          )}
        </span>
      </header>

      <div className="pview-body">
        <p className="pstage-lede">{stage.description}</p>

        <div className="pstage-facts">
          <Fact label="Starts" value={span ? fmtDate(span.start) : '—'} />
          <Fact label="Due" value={span ? fmtDate(span.end) : '—'} />
          <Fact label="TAT" value={span ? `${span.durationWeeks} weeks` : '—'} />
          <Fact label="Key deliverables" value={`${done}/${dl.length}`} />
          <Fact label="Activities" value={String(stage.engineeringView.length)} />
        </div>

        <nav className="ptabs" aria-label="Stage sections">
          {STAGE_TABS.map((t) => {
            const n = counts[t.slug];
            return (
              <Link
                key={t.slug}
                href={`/p/${projectId}/stage/${stage.id}/${t.slug}`}
                className="ptab"
                aria-current={t.slug === tab ? 'page' : undefined}
                onMouseDown={() => select({ kind: 'stage', stageId: stage.id })}
              >
                {t.label}
                {n !== undefined && (
                  <span className={t.slug === 'risks' && risks.length ? 'ptab-n risk' : 'ptab-n'}>
                    {n}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {tab === 'activity' && <StageActivityTab stageId={stage.id} />}
        {tab === 'keyinfo' && <KeyInfoTab stageId={stage.id} />}
        {tab === 'risks' && <StageRisksTab stageId={stage.id} projectId={projectId} />}
        {tab === 'deliverables' && <DeliverablesTab stageId={stage.id} />}
        {tab === 'team' && <TeamTab stageId={stage.id} />}
        {TAB_PHASE[tab] && (
          <p className="pview-todo">
            <span className="pview-phase">{TAB_PHASE[tab]}</span>
            The <b>{tabLabel(tab)}</b> tab.
          </p>
        )}
      </div>
    </>
  );
}

/* Which phase brings each tab that is not filled in yet, so it says what it is
   waiting for rather than showing an empty page. A tab that is built has no
   entry here. */
const TAB_PHASE: Partial<Record<StageTab, string>> = {
  board: 'V2-7',
  updates: 'V2-7',
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="pfact">
      <span className="pfact-cap">{label}</span>
      <span className="pfact-n">{value}</span>
    </div>
  );
}
