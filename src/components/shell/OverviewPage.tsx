'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { activitySteps } from '@/data/activitySteps';
import { estimateCost, formatManMonths } from '@/lib/effort';
import { fmtDate } from '@/lib/schedule';
import { fromStepIndex, isStepLate, resolveSteps } from '@/lib/steps';
import { useAppStore } from '@/store/useAppStore';
import { useAttention } from './useAttention';
import { useProgramWork } from './useProgramWork';

/**
 * Where the programme is, on one screen.
 *
 * The row of figures says how it stands; *Needs you today* says what to do
 * about it. Everything in the row is a link into the list behind it, because a
 * number a TPM cannot open is a number they have to go and look up.
 */
export function OverviewPage({ projectId }: { projectId: string }) {
  const { overdue, risks, steps } = useProgramWork();
  const deliverables = useAppStore((s) => s.deliverables);
  const schedule = useAppStore((s) => s.schedule);
  const stages = useAppStore((s) => s.stages);
  const costPerManMonth = useAppStore((s) => s.costPerManMonth);
  const today = useAppStore((s) => s.today);

  const allDeliv = Object.values(deliverables).flat();
  const doneDeliv = allDeliv.filter((d) => d.done).length;
  const progress = allDeliv.length ? Math.round((doneDeliv / allDeliv.length) * 100) : 0;

  const days = Math.round((schedule.tapeout.getTime() - today.getTime()) / 864e5);
  const mm = Object.keys(activitySteps).length ? programEffort(stages) : 0;

  return (
    <>
      <header className="pview-head">
        <h1 className="pview-title">Overview</h1>
        <span className="pview-count">
          {stepsDone(steps)} of {steps.length} steps
        </span>
      </header>

      <div className="pview-body">
        <div className="pstats">
          <Stat
            cap="Progress"
            value={`${progress}%`}
            sub={`${doneDeliv} of ${allDeliv.length} deliverables`}
            href={`/p/${projectId}/deliverables`}
          />
          <Stat
            cap="Tapeout"
            value={days >= 0 ? `D−${days}` : `D+${Math.abs(days)}`}
            sub={fmtDate(schedule.tapeout)}
            href={`/p/${projectId}/timeline`}
          />
          <Stat
            cap="Open risks"
            value={String(risks.length)}
            sub={risks.length ? `across ${new Set(risks.map((r) => r.stageId)).size} stages` : 'none flagged'}
            href={`/p/${projectId}/risks`}
            tone={risks.length ? 'risk' : undefined}
          />
          <Stat
            cap="Overdue"
            value={String(overdue.length)}
            sub="steps past their date"
            href={`/p/${projectId}/overdue`}
            tone={overdue.length ? 'risk' : undefined}
          />
          <Stat
            cap="Estimated cost"
            value={costPerManMonth ? money(estimateCost(mm, costPerManMonth)) : '—'}
            sub={formatManMonths(mm)}
          />
        </div>

        <NeedsYouToday projectId={projectId} />

        <div className="poverview-cols">
          <InFlight projectId={projectId} />
          <EffortSplit stages={stages} />
        </div>
      </div>
    </>
  );
}

function Stat({
  cap,
  value,
  sub,
  href,
  tone,
}: {
  cap: string;
  value: string;
  sub: string;
  href?: string;
  tone?: 'risk';
}) {
  const body = (
    <>
      <span className="pfact-cap">{cap}</span>
      <span className={tone === 'risk' ? 'pfact-n risk' : 'pfact-n'}>{value}</span>
      <span className="pstat-sub">{sub}</span>
    </>
  );
  return href ? (
    <Link className="pstat go" href={href}>
      {body}
    </Link>
  ) : (
    <div className="pstat">{body}</div>
  );
}

/**
 * The list the screen exists for.
 *
 * Every row goes somewhere: a step to the step, a deliverable to the step that
 * hands it over. And it is all of it — there used to be a per-tag cap, which
 * meant that with seventeen things overdue thirteen were missing from the one
 * list that says what to answer. It scrolls instead.
 */
function NeedsYouToday({ projectId }: { projectId: string }) {
  const rows = useAttention();
  const stages = useAppStore((s) => s.stages);
  const router = useRouter();

  const stageOf = (id: string) => stages.find((s) => s.id === id);

  /* The selection travels in the URL. Selecting first and navigating second is
     a race the shell's clear-on-navigation always wins — and a link that names
     what it opens is one somebody can send. */
  const open = (row: (typeof rows)[number]) => {
    const stage = stageOf(row.stageId);
    if (!stage) return;
    const base = `/p/${projectId}/stage/${stage.id}`;
    router.push(
      row.step
        ? `${base}/activity?step=${row.step.act}:${row.step.n}`
        : `${base}/deliverables?deliverable=${row.deliverableId ?? ''}`,
    );
  };

  return (
    <section className="pcard">
      <header className="pcard-head">
        <h2 className="pcard-title">Needs you today</h2>
        <span className="pview-count">{rows.length}</span>
        <span className="pcard-note">
          Overdue first, then due inside three weeks, then risks nobody has answered.
        </span>
      </header>
      {rows.length === 0 ? (
        <p className="pview-todo">Nothing is late, close, or unanswered.</p>
      ) : (
        <div className="pattn-scroll">
          <table className="ptable pboard pattn">
            <thead>
              <tr>
                <th className="mid">Status</th>
                <th className="mid">Type</th>
                <th className="pwrapcol">Item</th>
                <th className="mid">Timing</th>
                <th className="mid">Tag</th>
                <th className="mid">Owner</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} data-attn={r.key} onClick={() => open(r)} className="pattn-row">
                  <td className="mid">
                    <span className={`ppill ${r.tag === 'Overdue' ? 'risk' : 'warn'}`}>{r.tag}</span>
                  </td>
                  <td className="mid prole">{r.type}</td>
                  <th scope="row" className="pwrap pwrapcol">
                    {r.title}
                  </th>
                  <td className={r.tag === 'Overdue' ? 'mid late' : 'mid prole'}>{r.why}</td>
                  <td className="mid">
                    {r.ref ? <span className="pref">{r.ref}</span> : <span className="pmuted">—</span>}
                  </td>
                  <td className="mid">
                    {r.owner || <span className="pmuted">Unassigned</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** The stages running today, and how far each has got. */
function InFlight({ projectId }: { projectId: string }) {
  const stages = useAppStore((s) => s.stages);
  const schedule = useAppStore((s) => s.schedule);
  const stepStates = useAppStore((s) => s.stepStates);
  const today = useAppStore((s) => s.today);

  const running = stages.filter((s) => {
    const span = schedule.stages[s.id];
    return span && span.start <= today && today <= span.end;
  });

  return (
    <section className="pcard">
      <header className="pcard-head">
        <h2 className="pcard-title">In flight today</h2>
        <span className="pview-count">{running.length}</span>
      </header>
      <ul className="pflight">
        {running.map((s) => {
          const span = schedule.stages[s.id];
          const refs = Object.keys(activitySteps).filter((r) => activitySteps[r].st === s.id);
          const all = refs.flatMap((r) =>
            resolveSteps(span.start, fromStepIndex(r, activitySteps[r]), stepStates),
          );
          const done = all.filter((x) => x.done).length;
          const late = all.filter((x) => isStepLate(x, today)).length;
          const pct = all.length ? Math.round((done / all.length) * 100) : 0;
          return (
            <li key={s.id}>
              <Link href={`/p/${projectId}/stage/${s.id}/activity`} className="pflight-name">
                <span className="pcode">{s.shortTitle}</span>
                <span className="ell">{s.title}</span>
              </Link>
              <span className="pbar">
                <i style={{ width: `${pct}%` }} />
              </span>
              <span className="pflight-n">
                {done}/{all.length}
              </span>
              {late > 0 && <span className="pflight-late">{late} late</span>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Where the man-months go, biggest first. */
function EffortSplit({ stages }: { stages: ReturnType<typeof useAppStore.getState>['stages'] }) {
  const all = stages
    .map((s) => ({ s, mm: stageEffort(s) }))
    .filter((r) => r.mm > 0)
    .sort((a, b) => b.mm - a.mm);
  /* The heaviest eight, but the figure in the header is the whole programme —
     a total that counts only the rows on screen is a total of nothing. */
  const rows = all.slice(0, 8);
  const top = rows[0]?.mm ?? 1;
  const hidden = all.length - rows.length;

  return (
    <section className="pcard">
      <header className="pcard-head">
        <h2 className="pcard-title">Where the effort goes</h2>
        <span className="pview-count">{formatManMonths(all.reduce((n, r) => n + r.mm, 0))}</span>
        {hidden > 0 && (
          <span className="pcard-note">heaviest {rows.length}, {hidden} more below</span>
        )}
      </header>
      <ul className="pflight">
        {rows.map((r) => (
          <li key={r.s.id}>
            <span className="pflight-name">
              <span className="ell">{r.s.title}</span>
            </span>
            <span className="pbar">
              <i style={{ width: `${Math.round((r.mm / top) * 100)}%` }} />
            </span>
            <span className="pflight-n">{formatManMonths(r.mm)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const stageEffort = (s: { engineeringEffort: readonly number[] }) =>
  s.engineeringEffort.reduce((n, e) => n + e, 0);

const programEffort = (stages: readonly { engineeringEffort: readonly number[] }[]) =>
  stages.reduce((n, s) => n + stageEffort(s), 0);

const stepsDone = (steps: readonly { done: boolean }[]) => steps.filter((s) => s.done).length;

const money = (n: number) =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${Math.round(n / 1000)}K`;
