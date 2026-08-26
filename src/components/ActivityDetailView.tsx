'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  activityDetail,
  activityGlossary,
  detailActivityTitles,
  detailDeliverables,
  type ActivityDetail,
  type DetailStep,
} from '@/data/activityDetails';
import type { ProjectState } from '@/lib/projectState';
import { addWeeks, computeSchedule, fmtDate, fmtW } from '@/lib/schedule';
import { resolveStages } from '@/lib/stages';
import { resolveStageDetail } from '@/lib/stageDetail';
import { activityRowId } from '@/lib/rowIds';

/** Steps carry weeks; the reader wants dates. One conversion, done here. */
const useWindow = (project: ProjectState, stageId: string) =>
  useMemo(() => {
    const schedule = computeSchedule(project.kickoff, project.profile, project.overrides);
    const stage = schedule.stages[stageId];
    return stage ? { start: stage.start, end: stage.end } : null;
  }, [project, stageId]);

/**
 * A parallel step runs alongside the main step it follows, so it starts where
 * that step started rather than where the previous step ended. Same rule the
 * authoring document lays out with, recomputed here from the step TATs.
 */
function place(detail: ActivityDetail): { st: DetailStep; x: number }[] {
  let main = detail.window[0];
  let par = detail.window[0];
  let prevMainStart = detail.window[0];
  let prevWasMain = false;
  return detail.steps.map((st) => {
    const t = Number(st.tat) || 0;
    if (st.lane === 'main') {
      const x = main;
      prevMainStart = x;
      main += t;
      prevWasMain = true;
      return { st, x };
    }
    if (prevWasMain) par = prevMainStart;
    const x = par;
    par += t;
    prevWasMain = false;
    return { st, x };
  });
}

/** The bold opening of a risk is its headline; the rest is the explanation. */
const splitRisk = (raw: string) => {
  const m = raw.match(/^<b>([^<]*)<\/b>\s*([\s\S]*)$/);
  const strip = (s: string) => s.replace(/<[^>]+>/g, '').trim();
  return m ? { head: strip(m[1]), rest: strip(m[2]) } : { head: strip(raw), rest: '' };
};

function BackIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
      <path
        d="M9.5 3 4.5 8l5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ActivityDetailView({
  projectId,
  activityId,
  detail,
  project,
}: {
  projectId: string;
  activityId: string;
  detail: ActivityDetail;
  project: ProjectState;
}) {
  const [term, setTerm] = useState<string | null>(null);

  const stages = useMemo(() => resolveStages(project.profile), [project.profile]);
  const stage = stages.find((s) => s.id === detail.stage);
  const win = useWindow(project, detail.stage);

  /* The engineering list is the programme's, so the title, TAT and effort come
     from it rather than from the authoring document — a stage whose numbers
     were edited reads its own numbers here. */
  const line = useMemo(() => {
    if (!stage) return null;
    const resolved = resolveStageDetail(stage, project.stageDetails[stage.id]);
    const i = resolved.engineeringView.findIndex(
      (_, idx) => activityRowId(stage.shortTitle, idx) === activityId,
    );
    if (i < 0) return null;
    return {
      index: i,
      text: resolved.engineeringView[i],
      tat: resolved.engineeringTat[i] ?? 0,
      mm: resolved.engineeringEffort[i] ?? 0,
    };
  }, [stage, project.stageDetails, activityId]);

  const placed = useMemo(() => place(detail), [detail]);
  const span = Math.max(detail.window[1] - detail.window[0], 0.5);
  const pos = (w: number) => ((w - detail.window[0]) / span) * 100;

  /* Which step yields which output, so the step table can show what it adds. */
  const gives = useMemo(() => {
    const by: Record<number, string[]> = {};
    detail.produces.forEach((p, i) => {
      const n = detail.producedBy[i];
      if (n === undefined) return;
      (by[n] ??= []).push(p);
    });
    return by;
  }, [detail]);

  const owns = detail.rel.filter((r) => r.rel === 'produces');
  const contributes = detail.rel.filter((r) => r.rel !== 'produces');
  const mm = line?.mm ?? 0;
  const fte = span > 0 ? (mm / (span / 4.345)).toFixed(1) : '0';

  const dateOf = (w: number) => (win ? fmtDate(addWeeks(win.start, w)) : null);

  const conn: [string, string[]][] = [
    ['Depends on', detail.links.dependsOn],
    ['Runs with', detail.links.runsWith],
    ['Feeds into', detail.links.feedsInto],
    ['Later input', detail.links.revisedBy],
    ['Feeds back into', detail.links.feedsBackInto],
  ];

  return (
    <div className="ad" data-activity={activityId}>
      <header className="ad-bar">
        {/* Back to the programme this activity is dated against. */}
        <Link className="ad-back" href={`/p/${projectId}`} data-ad-back>
          <BackIcon />
          <span>{project.projectName}</span>
        </Link>
        <span className="ad-crumb">
          {stage ? `${String(stage.stage).padStart(2, '0')} · ${stage.title}` : detail.stage}
        </span>
        <span className="spacer" />
        {detail.criticalPath && <span className="ad-cp">Critical path</span>}
      </header>

      <div className="ad-page">
        <p className="ad-eyebrow">
          <span className="ad-id">{activityId}</span>
          Engineering activity
        </p>
        <h1 className="ad-title">{line?.text ?? activityId}</h1>

        <div className="ad-facts">
          <div className="ad-fact">
            <span className="k">Takes</span>
            <span className="v">{fmtW(Math.abs(line?.tat ?? 0))}</span>
            <span className="d">
              w{detail.window[0]}–w{detail.window[1]} of the stage
            </span>
          </div>
          <div className="ad-fact">
            <span className="k">Costs</span>
            <span className="v">
              {mm.toFixed(1)} <small>M/M</small>
            </span>
            <span className="d">~{fte} people while it runs</span>
          </div>
          <div className="ad-fact">
            <span className="k">Owner</span>
            <span className="v sm">{detail.roles[0]?.r}</span>
            <span className="d">{detail.roles[detail.roles.length - 1]?.r} approves</span>
          </div>
          <div className="ad-fact">
            <span className="k">Runs</span>
            <span className="v sm">{dateOf(detail.window[0]) ?? '—'}</span>
            <span className="d">to {dateOf(detail.window[1]) ?? '—'}</span>
          </div>
        </div>

        <div className="ad-grid">
          <main className="ad-main">
            <section className="ad-sec">
              <span className="cap">Why it exists</span>
              {detail.purpose.map((p, i) => (
                <p
                  className="ad-lede"
                  key={i}
                  dangerouslySetInnerHTML={{ __html: p }}
                />
              ))}
            </section>

            <section className="ad-sec">
              <span className="cap">What it delivers</span>
              {owns.length ? (
                owns.map((r) => (
                  <div className="ad-deliv" key={r.id}>
                    <p className="ad-deliv-h">
                      <span className="did">{r.id}</span>
                      {detailDeliverables[r.id] ?? r.id}
                    </p>
                    <p
                      className="ad-deliv-w"
                      dangerouslySetInnerHTML={{
                        __html: r.text.replace(/^<b>[^<]*<\/b>\s*/, ''),
                      }}
                    />
                  </div>
                ))
              ) : (
                <p className="ad-none">
                  No key deliverable is owned here — this activity contributes to the ones below.
                </p>
              )}
              {contributes.length > 0 && (
                <div className="ad-contrib">
                  {contributes.map((r) => (
                    <p key={r.id}>
                      <span className="did">{r.id}</span>
                      <span className="rel">{r.rel}</span>
                      {detailDeliverables[r.id] ?? r.id}
                    </p>
                  ))}
                </div>
              )}
            </section>

            <section className="ad-sec">
              <span className="cap">Needs first</span>
              <ul className="ad-list">
                {detail.consumes.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </section>

            <section className="ad-sec">
              <span className="cap">Done when</span>
              <ul className="ad-list ad-crit-list">
                {detail.exit.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </section>

            <section className="ad-sec">
              <span className="cap">
                How it gets there
                <span className="n">
                  {detail.steps.length} steps ·{' '}
                  {detail.steps.some((x) => x.lane === 'par') ? '2 lanes' : '1 lane'}
                </span>
              </span>

              <div className="ad-flow">
                {(['main', 'par'] as const)
                  .filter((l) => detail.steps.some((x) => x.lane === l))
                  .map((l) => (
                    <div key={l}>
                      <p className="ad-lane-tag">
                        {l === 'main' ? 'Main sequence' : 'In parallel'}
                      </p>
                      <div className="ad-lane">
                        {placed
                          .filter((p) => p.st.lane === l)
                          .map((p) => (
                            <span
                              className={`ad-step${l === 'par' ? ' par' : ''}`}
                              key={p.st.n}
                              style={{
                                left: `${pos(p.x).toFixed(2)}%`,
                                width: `${((p.st.tat / span) * 100).toFixed(2)}%`,
                              }}
                              data-tip={`${p.st.n}. ${p.st.text}|${fmtW(p.st.tat)}`}
                            >
                              {p.st.n}
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="ad-steps-head">
                <span>#</span>
                <span>Step</span>
                <span>What it adds</span>
                <span>TAT</span>
              </div>
              <ul className="ad-steps">
                {detail.steps.map((st) => (
                  <li className={st.lane === 'par' ? 'par' : undefined} key={st.n}>
                    <span className="n">{st.n}</span>
                    <span>
                      {st.text}
                      {st.lane === 'par' && <em className="ln">runs in parallel</em>}
                    </span>
                    <span className="gives">
                      {gives[st.n] ? (
                        gives[st.n].map((g) => (
                          <span className="give" key={g}>
                            {g}
                          </span>
                        ))
                      ) : (
                        <span className="give-none">—</span>
                      )}
                    </span>
                    <span className="w">{fmtW(st.tat)}</span>
                  </li>
                ))}
              </ul>
              {detail.flowNote && <p className="ad-note">{detail.flowNote}</p>}
            </section>

            <section className="ad-sec">
              <span className="cap">
                Watch out for<span className="n">{detail.risks.length}</span>
              </span>
              <ul className="ad-risks">
                {detail.risks.map((raw, i) => {
                  const { head, rest } = splitRisk(raw);
                  return (
                    <li key={i}>
                      <b>{head}</b>
                      {rest && <span>{rest}</span>}
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="ad-sec">
              <span className="cap">Measured by</span>
              <ul className="ad-list">
                {detail.measuredBy.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </section>
          </main>

          <aside className="ad-side">
            <section>
              <span className="cap">
                Where the effort goes<span className="n">{mm} M/M</span>
              </span>
              <div className="ad-split">
                {detail.effort.map(([l, v]) => (
                  <div key={l}>
                    <span>{l}</span>
                    <span className="mm">{v.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <span className="cap">
                Who is on it<span className="n">~{fte} FTE</span>
              </span>
              <div className="ad-roles">
                {detail.roles.map((r, i) => (
                  <div key={r.r}>
                    <b>{r.r}</b>
                    {i === 0 && <em>owns it</em>}
                    <span>{r.d}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <span className="cap">Starts when</span>
              <ul className="ad-list sm">
                {detail.entry.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </section>

            <section>
              <span className="cap">Connections</span>
              {conn.some(([, v]) => v.length) ? (
                conn
                  .filter(([, v]) => v.length)
                  .map(([label, v]) => (
                    <div className="ad-conn" key={label}>
                      <p className="ad-conn-k">{label}</p>
                      <div className="ad-chain">
                        {v.map((x) =>
                          activityDetail(x) ? (
                            <Link
                              className="ad-chip on"
                              key={x}
                              href={`/p/${projectId}/activity/${x}`}
                              data-tip={`${x}|${detailActivityTitles[x] ?? ''}`}
                            >
                              {x}
                            </Link>
                          ) : (
                            <span
                              className="ad-chip"
                              key={x}
                              data-tip={
                                detailActivityTitles[x]
                                  ? `${x}|${detailActivityTitles[x]} — not written up yet`
                                  : x
                              }
                            >
                              {x}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <p className="ad-none">{detail.dependsNote ?? 'Nothing linked.'}</p>
              )}
              {!detail.links.dependsOn.length && detail.dependsNote && (
                <p className="ad-none dep">{detail.dependsNote}</p>
              )}
            </section>

            {detail.terms.length > 0 && (
              <section>
                <span className="cap">
                  Terms here<span className="n">{detail.terms.length}</span>
                </span>
                <div className="ad-terms">
                  {detail.terms.map((t) => (
                    <button key={t} data-term={t} onClick={() => setTerm(t)}>
                      {t}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>

      {term && activityGlossary[term] && (
        <>
          <div className="ad-scrim" onClick={() => setTerm(null)} />
          <div className="ad-termcard" role="dialog" aria-modal="true" aria-label={term}>
            <p className="tp-k">{term}</p>
            <p className="tp-full">{activityGlossary[term].full}</p>
            <p className="tp-note">{activityGlossary[term].note}</p>
            <button className="board-btn" data-term-close onClick={() => setTerm(null)}>
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}
