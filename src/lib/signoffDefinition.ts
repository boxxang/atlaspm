/**
 * /lib/signoffDefinition.ts — everything a gate's sign-off lists, for one
 * deliverable.
 *
 * The items the stage lead confirms are the baseline and the checks from the
 * gate's spec, and the entry criteria, exit criteria and failure modes from the
 * write-up of the activity that produces the deliverable. The Excel workbook
 * (tools/deliverable-templates) and the in-app sign-off both read this, so the
 * two list the same items under the same IDs.
 *
 * Server-only in practice: it reads the write-ups, which are prose the browser
 * is not handed. The page reads it and passes the definition down.
 */
import { ALL_ACTIVITIES, ALL_ACTIVITY_TITLES, ALL_DELIVERABLE_TITLES } from '@/data/builtins';
import { SIGNOFF_SPECS, type SignoffSpec } from '@/data/deliverableSignoffSpecs';
import { EMBEDDED_PROFILE } from '@/data/embeddedSoc';
import { phaseById } from '@/data/scheduleProfiles';
import { embeddedDetail } from '@/data/embeddedSocDetails';
import { deliverableStep, producersOf } from '@/lib/deliverableStatus';
import type { SignoffItem } from '@/lib/signoff';

export interface SignoffDefinition {
  ref: string;
  title: string;
  /** the producing activity */
  act: string;
  actTitle: string;
  stageKey: string;
  stageTitle: string;
  /** the roadmap band the stage sits under, for the breadcrumb */
  bandLabel: string;
  owner: string;
  items: SignoffItem[];
  extra?: SignoffSpec['extra'];
  receivers: { ref: string; title: string }[];
  roles: string[];
}

const strip = (s: string) =>
  s
    .replace(/<\/?(b|code)>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const pad = (n: number) => String(n).padStart(2, '0');
const producers = producersOf(ALL_ACTIVITIES);

export function signoffDefinition(ref: string): SignoffDefinition | undefined {
  const spec = SIGNOFF_SPECS[ref];
  const step = spec && deliverableStep(ref, producers);
  const w = step ? embeddedDetail(step.act) : undefined;
  if (!spec || !step || !w) return undefined;
  const a = ALL_ACTIVITIES[step.act];
  return {
    ref,
    title: ALL_DELIVERABLE_TITLES[ref],
    act: step.act,
    actTitle: ALL_ACTIVITY_TITLES[step.act],
    stageKey: a.st,
    stageTitle: EMBEDDED_PROFILE.stages.find((s) => s.key === a.st)?.title ?? a.st,
    bandLabel: phaseById(EMBEDDED_PROFILE.stages.find((s) => s.key === a.st)?.phaseId ?? '').label,
    owner: a.ro,
    items: [
      ...spec.baseline.map((b, i) => ({ id: `B-${pad(i + 1)}`, section: 'Baseline', item: b, target: 'Version, tag or ID recorded' })),
      ...w.entry.map((e, i) => ({ id: `E-${pad(i + 1)}`, section: 'Entry criteria', item: strip(e), target: 'Met' })),
      ...spec.checks.map(([c, t], i) => ({ id: `C-${pad(i + 1)}`, section: 'Checks', item: c, target: t })),
      ...w.exit.map((e, i) => ({ id: `X-${pad(i + 1)}`, section: 'Exit criteria', item: strip(e), target: 'Met' })),
      ...w.risks.map((r, i) => ({
        id: `F-${pad(i + 1)}`,
        section: 'Failure modes',
        item: strip(r),
        target: 'Addressed — say how in the result',
      })),
    ],
    extra: spec.extra,
    receivers: w.feedsInto.map((f) => ({ ref: f, title: ALL_ACTIVITY_TITLES[f] ?? '' })),
    roles: w.roles.map((r) => r.r),
  };
}
