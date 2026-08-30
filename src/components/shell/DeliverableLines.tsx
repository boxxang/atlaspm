'use client';

import Link from 'next/link';
import { activitySteps } from '@/data/activitySteps';
import { attachmentUrl } from '@/lib/attachments';
import { deliverableStatus, deliverableStep } from '@/lib/deliverableStatus';
import { fmtDate } from '@/lib/schedule';
import type { Deliverable } from '@/data/types';
import { useAppStore } from '@/store/useAppStore';
import { useRailStore } from '@/store/railStore';
import { IconClip, IconTick } from './icons';
import { useDeliverableRefs } from './useDeliverableRefs';

/**
 * Key deliverables, as the rail lists them.
 *
 * A row carrying an artefact shows a clip that opens the file itself rather
 * than navigating anywhere — the reason to click a clip is to see the file.
 * There is no tick to click: a deliverable is completed by a handover, and the
 * box only reports what the handover says.
 *
 * The line under the title names the step that hands it over before it says the
 * date, which is the mockup's wording: "PD-01 step 6 · due 09/26/2026" answers
 * where the work is, and a date on its own does not.
 */
const producers = Object.keys(activitySteps).map((ref) => ({
  ref,
  produces: activitySteps[ref].r.map(([id]) => id),
  stepCount: activitySteps[ref].s.length,
}));

export function DeliverableLines({
  title,
  list,
  stageId,
  projectId,
  empty,
}: {
  title: string;
  list: readonly Deliverable[];
  stageId: string;
  projectId: string;
  empty: string;
}) {
  const posts = useAppStore((s) => s.posts);
  const schedule = useAppStore((s) => s.schedule);
  const today = useAppStore((s) => s.today);
  const select = useRailStore((s) => s.select);

  const span = schedule.stages[stageId];
  const refOf = useDeliverableRefs();
  const done = list.filter((d) => d.done).length;

  return (
    <div
      style={{
        borderTop: '1px solid var(--line-soft)',
        marginTop: 14,
        paddingTop: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <span className="cap">{title}</span>
        <span className="pill" style={{ fontSize: 10.5 }}>
          {done}/{list.length}
        </span>
        <span style={{ flexGrow: 1 }} />
        <Link
          href={`/p/${projectId}/stage/${stageId}/deliverables`}
          style={{ fontSize: 11.5, color: 'var(--accent)', fontWeight: 500 }}
        >
          Open tab
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="mono-note">{empty}</p>
      ) : (
        list.map((d) => {
          const st = deliverableStatus(d, today, !!span && today >= span.start);
          const ref = refOf.get(d.id) ?? null;
          const handover = posts.find((p) => p.deliverableId === d.id && p.kind === 'handover');
          const files = handover?.attachments ?? [];
          const ticked = deliverableStep(ref, producers);
          return (
            <div
              key={d.id}
              data-deliverable={d.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                padding: '7px 0',
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              <button
                type="button"
                className={d.done ? 'cb on' : 'cb'}
                style={{ marginTop: 2 }}
                aria-label={`Open the handover for ${d.title}`}
                onClick={() => select({ kind: 'deliverable', stageId, deliverableId: d.id })}
              >
                {d.done && <IconTick />}
              </button>
              <span style={{ flexGrow: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  {ref && (
                    <span className="ref" style={{ fontSize: 10.5, padding: '1px 6px' }}>
                      {ref}
                    </span>
                  )}
                  <StatusPill kind={st.kind} label={st.label} />
                  {files.length > 0 && (
                    <a
                      className="clip"
                      href={attachmentUrl(files[0].id)}
                      target="_blank"
                      rel="noreferrer"
                      title={files[0].filename}
                      aria-label={`Open ${files[0].filename}`}
                    >
                      <IconClip />
                      {files.length}
                    </a>
                  )}
                </span>
                <span
                  style={{
                    fontSize: 12.5,
                    display: 'block',
                    marginTop: 3,
                    lineHeight: 1.4,
                    color: d.done ? 'var(--ink-3)' : undefined,
                  }}
                >
                  {d.title}
                </span>
                <span className="num" style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                  {ticked && `${ticked.act} step ${ticked.n} · `}
                  {d.done && d.completedAt ? (
                    `done ${fmtDate(d.completedAt)}`
                  ) : (
                    <span
                      style={
                        st.kind === 'late' ? { color: 'var(--risk)', fontWeight: 600 } : undefined
                      }
                    >
                      due {d.due ? fmtDate(d.due) : '—'}
                    </span>
                  )}
                </span>
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}

export function StatusPill({ kind, label }: { kind: string; label: string }) {
  const cls =
    kind === 'done'
      ? 'pill ok'
      : kind === 'late'
        ? 'pill risk'
        : kind === 'run'
          ? 'pill acc'
          : 'pill';
  return (
    <span className={cls} style={{ fontSize: 10.5 }}>
      {label}
    </span>
  );
}
