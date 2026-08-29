'use client';

import Link from 'next/link';
import { detailActivityTitles } from '@/data/activityIndex';
import { fmtDate } from '@/lib/schedule';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { DeliverableLines } from './DeliverableLines';
import { PostThread } from './PostThread';
import { Segments } from './StageActivity';
import { useDeliverableRefs } from './useDeliverableRefs';
import { useActivitySteps } from './useStageSteps';

/**
 * One activity, in the rail: where it has got to, when it runs, the key
 * deliverables it hands over, and everything anybody has posted about it.
 *
 * The write-up itself is a page of its own — a megabyte of prose lives on the
 * server, and the rail is not where you read it — so this links to it rather
 * than trying to summarise it.
 *
 * The thread here is the activity's, not one step's, so each post says which
 * step it is about and the composer offers the step picker. A post filed
 * against no step is still an update about the activity, which is why "No step"
 * is an option rather than the field being required.
 */
export function ActivityPanel({ act, projectId }: { act: string; projectId: string }) {
  const a = useActivitySteps(act);
  const deliverables = useAppStore((s) => s.deliverables);
  const posts = useAppStore((s) => s.posts);
  const refOf = useDeliverableRefs();
  /* And closing an activity goes back to the stage that runs it. */
  const close = () =>
    useRailStore.setState({ selection: { kind: 'stage', stageId: a?.activity.stageId ?? '' } });

  if (!a) return null;

  const first = a.steps[0];
  const last = a.steps[a.steps.length - 1];
  /* Matched by reference rather than by title: the two seed lists word some
     deliverables differently, and a ref cannot drift. */
  const tags = new Set(a.delivers.map(([ref]) => ref));
  const rows = (deliverables[a.activity.stageId] ?? []).filter((d) =>
    tags.has(refOf.get(d.id) ?? ''),
  );
  const mine = posts.filter((p) => p.activityRef === a.ref && !p.parentId);

  return (
    <>
      <div className="peek-hd">
        <span className="ref">{a.ref}</span>
        <b style={{ fontSize: 12.5 }}>Activity</b>
        <span style={{ flexGrow: 1 }} />
        <button type="button" className="btn sm" onClick={close} aria-label="Close details">
          ✕
        </button>
      </div>

      <div className="peek-body">
        <h2
          style={{
            fontSize: 16.5,
            fontWeight: 600,
            lineHeight: 1.35,
            marginBottom: 12,
            letterSpacing: '-.015em',
            textWrap: 'balance',
          }}
        >
          {detailActivityTitles[act] ?? act}
        </h2>

        <div className="prop">
          <span className="pk">On step</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Segments steps={a.steps} />
            <b className="num" style={{ fontSize: 13 }}>
              {a.state.done} of {a.state.total}
            </b>
          </span>
        </div>
        <div className="prop">
          <span className="pk">Lead role</span>
          <span style={{ fontSize: 13 }}>{a.activity.role || '—'}</span>
        </div>
        <div className="prop">
          <span className="pk">Runs</span>
          <span className="num" style={{ fontSize: 13 }}>
            {first && last ? `${fmtDate(first.start)} → ${fmtDate(last.end)}` : '—'}
          </span>
        </div>
        <div className="prop">
          <span className="pk">Write-up</span>
          <Link
            href={`/p/${projectId}/activity/${a.ref}`}
            style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', justifySelf: 'start' }}
          >
            Read {a.ref} →
          </Link>
        </div>

        <DeliverableLines
          title="Key deliverables"
          list={rows}
          stageId={a.activity.stageId}
          projectId={projectId}
          empty="This activity does not release a key deliverable of its own."
        />

        <div style={{ borderTop: '1px solid var(--line-soft)', marginTop: 14, paddingTop: 13 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 13 }}>
            <span className="cap">Progress</span>
            <span className="pill" style={{ fontSize: 10.5 }}>
              {mine.length} post{mine.length === 1 ? '' : 's'}
            </span>
          </div>
          <PostThread
            posts={mine}
            target={{ kind: 'update', activityRef: a.ref }}
            placeholder="Post an update…"
            allowRisk
            showStep
            steps={a.steps.map((s) => ({ n: s.n, text: s.text }))}
            emptyText="No updates yet. Post one below and tag the step it is about."
          />
        </div>
      </div>
    </>
  );
}
