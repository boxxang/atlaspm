'use client';

import { useMemo } from 'react';
import type { LinkContext, RiskSteps } from '@/lib/meetings/links';
import type { LinkRef, LinkType } from '@/lib/meetings/types';
import { useAppStore } from '@/store/useAppStore';
import { useDeliverableRefs } from '../shell/useDeliverableRefs';
import { useProgramActivities, useProgramActivityTitles } from '../shell/useProgramActivities';
import { useProgramWork } from '../shell/useProgramWork';

/** One thing on the plan a meeting row can be linked to, as the picker lists it. */
export interface LinkOption {
  link: LinkRef;
  group: LinkType;
  tag: string;
  text: string;
  /** Lower-cased tag and text, for the search box. */
  haystack: string;
}

/**
 * The joins a link needs to be shown or picked, built once from what the app
 * store already holds: the programme's stages, its own activity list, every
 * resolved step, the risk posts, the key deliverables and the checkpoints.
 */
export function useLinkContext(): {
  ctx: LinkContext;
  riskSteps: RiskSteps;
  options: LinkOption[];
} {
  const stages = useAppStore((s) => s.stages);
  const posts = useAppStore((s) => s.posts);
  const deliverables = useAppStore((s) => s.deliverables);
  const schedule = useAppStore((s) => s.schedule);
  const activities = useProgramActivities();
  const titles = useProgramActivityTitles();
  const { steps } = useProgramWork();
  const refOf = useDeliverableRefs();

  return useMemo(() => {
    const stageById = new Map(stages.map((s) => [s.id, s]));
    const stepByKey = new Map(steps.map((s) => [`${s.act}:${s.n}`, s]));
    const riskPosts = posts.filter((p) => p.kind === 'risk' && p.activityRef);
    const riskById = new Map(riskPosts.map((p) => [p.id, p]));
    const dlvById = new Map(
      Object.entries(deliverables).flatMap(([stageId, list]) => list.map((d) => [d.id, { d, stageId }] as const)),
    );
    const msById = new Map(schedule.milestones.map((m) => [m.id, m]));
    const stageOfAct = (ref: string) => {
      const st = activities[ref]?.st;
      return st && stageById.has(st) ? st : undefined;
    };

    const ctx: LinkContext = {
      stage: (id) => {
        const s = stageById.get(id);
        return s ? { short: s.shortTitle, title: s.title } : undefined;
      },
      activity: (ref) => {
        const stageId = stageOfAct(ref);
        return stageId ? { title: titles[ref] ?? ref, stageId } : undefined;
      },
      step: (act, n) => {
        const s = stepByKey.get(`${act}:${n}`);
        return s ? { text: s.text } : undefined;
      },
      risk: (id) => {
        const p = riskById.get(id);
        return p ? { text: p.text, act: p.activityRef!, stepN: p.stepN, stageId: stageOfAct(p.activityRef!) ?? null } : undefined;
      },
      deliverable: (id) => {
        const hit = dlvById.get(id);
        return hit ? { title: hit.d.title, stageId: hit.stageId } : undefined;
      },
      milestone: (id) => {
        const m = msById.get(id);
        return m ? { label: m.label, stageId: m.anchor.stage } : undefined;
      },
    };

    const riskSteps: Record<string, { act: string; stepN: number | null }> = {};
    for (const p of riskPosts) riskSteps[p.id] = { act: p.activityRef!, stepN: p.stepN };

    const opt = (type: LinkType, ref: string, tag: string, text: string): LinkOption => ({
      link: { type, ref },
      group: type,
      tag,
      text,
      haystack: `${tag} ${text}`.toLowerCase(),
    });
    const options: LinkOption[] = [
      ...stages.map((s) => opt('stage', s.id, s.shortTitle, s.title)),
      ...schedule.milestones.map((m) => opt('milestone', m.id, 'Milestone', m.label)),
      ...Object.keys(activities)
        .filter((ref) => stageOfAct(ref))
        .map((ref) => opt('activity', ref, ref, titles[ref] ?? ref)),
      ...steps.map((s) => opt('step', `${s.act}:${s.n}`, `${s.act} · Step ${s.n}`, s.text)),
      ...riskPosts
        .filter((p) => stageOfAct(p.activityRef!))
        .map((p) => opt('risk', p.id, `Risk · ${p.activityRef}${p.stepN != null ? ` step ${p.stepN}` : ''}`, p.text)),
      ...Object.values(deliverables)
        .flat()
        .map((d) => opt('deliverable', d.id, refOf.get(d.id) ?? 'Deliverable', d.title)),
    ];

    return { ctx, riskSteps, options };
  }, [stages, posts, deliverables, schedule, activities, titles, steps, refOf]);
}
