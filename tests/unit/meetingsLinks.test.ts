import { describe, expect, it } from 'vitest';
import {
  dedupeLinks,
  linkKey,
  parseStepRef,
  touchesWork,
  viewLink,
  type LinkContext,
} from '@/lib/meetings/links';
import type { LinkRef } from '@/lib/meetings/types';

const CTX: LinkContext = {
  stage: (id) => (id === 'physicalDesign' ? { short: 'PD', title: 'Physical Design' } : undefined),
  activity: (ref) => (ref === 'PD-02' ? { title: 'Floorplan and PDN', stageId: 'physicalDesign' } : undefined),
  step: (act, n) => (act === 'PD-02' && n === 3 ? { text: 'Close the PDN on the worst corner' } : undefined),
  risk: (id) =>
    id === 'r1'
      ? { text: 'IR drop over budget', act: 'PD-02', stepN: 3, stageId: 'physicalDesign' }
      : id === 'r2'
        ? { text: 'No step named', act: 'PD-02', stepN: null, stageId: 'physicalDesign' }
        : undefined,
  deliverable: (id) => (id === 'dlv' ? { title: 'Floorplan and PDN specification', stageId: 'physicalDesign' } : undefined),
  milestone: (id) => (id === 'tapeout' ? { label: 'Tapeout (BEOL MTO)', stageId: 'tapeout' } : undefined),
};

describe('viewLink', () => {
  const v = (l: LinkRef) => viewLink(l, 'p1', CTX);

  it('names each kind and sends it where that thing lives', () => {
    expect(v({ type: 'stage', ref: 'physicalDesign' })).toEqual({
      tag: 'PD',
      text: 'Physical Design',
      href: '/p/p1/stage/physicalDesign/activity',
      missing: false,
    });
    expect(v({ type: 'activity', ref: 'PD-02' })).toEqual({
      tag: 'PD-02',
      text: 'Floorplan and PDN',
      href: '/p/p1/stage/physicalDesign/activity?act=PD-02',
      missing: false,
    });
    expect(v({ type: 'step', ref: 'PD-02:3' })).toEqual({
      tag: 'PD-02 · Step 3',
      text: 'Close the PDN on the worst corner',
      href: '/p/p1/stage/physicalDesign/activity?step=PD-02:3',
      missing: false,
    });
    expect(v({ type: 'risk', ref: 'r1' }).href).toBe(
      '/p/p1/stage/physicalDesign/activity?step=PD-02:3&post=r1',
    );
    expect(v({ type: 'risk', ref: 'r2' }).href).toBe('/p/p1/stage/physicalDesign/risks');
    expect(v({ type: 'deliverable', ref: 'dlv' }).href).toBe(
      '/p/p1/stage/physicalDesign/deliverables?deliverable=dlv',
    );
    expect(v({ type: 'milestone', ref: 'tapeout' })).toEqual({
      tag: 'Milestone',
      text: 'Tapeout (BEOL MTO)',
      href: '/p/p1/stage/tapeout/activity',
      missing: false,
    });
  });

  it('still shows a link whose target has gone, and says so rather than linking nowhere', () => {
    expect(v({ type: 'activity', ref: 'GONE-01' })).toEqual({
      tag: 'GONE-01',
      text: 'No longer on this program',
      href: null,
      missing: true,
    });
    expect(v({ type: 'step', ref: 'PD-02:9' }).missing).toBe(true);
    expect(v({ type: 'risk', ref: 'deleted' }).href).toBeNull();
  });
});

const RISK_STEPS = {
  r1: { act: 'PD-02', stepN: 1 },
  r2: { act: 'PD-03', stepN: 2 },
  r3: { act: 'PD-02', stepN: 3 },
};

describe('step references', () => {
  it('reads an activity and a step number', () => {
    expect(parseStepRef('PD-02:3')).toEqual({ act: 'PD-02', n: 3 });
  });

  it('refuses what is not a step', () => {
    expect(parseStepRef('PD-02')).toBeNull();
    expect(parseStepRef('PD-02:x')).toBeNull();
    expect(parseStepRef(':3')).toBeNull();
  });
});

describe('link identity', () => {
  it('keys a link by what it points at', () => {
    expect(linkKey({ type: 'step', ref: 'PD-02:3' })).toBe('step:PD-02:3');
  });

  it('keeps one of each', () => {
    const a: LinkRef = { type: 'activity', ref: 'PD-02' };
    const b: LinkRef = { type: 'step', ref: 'PD-02:3' };
    expect(dedupeLinks([a, { ...a }, b])).toEqual([a, b]);
  });
});

describe('touchesWork', () => {
  it('finds an activity through a link to it, to one of its steps, or to a risk on one', () => {
    const act = { act: 'PD-02' };
    expect(touchesWork([{ type: 'activity', ref: 'PD-02' }], act, RISK_STEPS)).toBe(true);
    expect(touchesWork([{ type: 'step', ref: 'PD-02:4' }], act, RISK_STEPS)).toBe(true);
    expect(touchesWork([{ type: 'risk', ref: 'r1' }], act, RISK_STEPS)).toBe(true);
  });

  it('does not mistake one activity for another that starts the same way', () => {
    const act = { act: 'PD-02' };
    expect(touchesWork([{ type: 'activity', ref: 'PD-020' }], act, RISK_STEPS)).toBe(false);
    expect(touchesWork([{ type: 'step', ref: 'PD-020:1' }], act, RISK_STEPS)).toBe(false);
    expect(touchesWork([{ type: 'risk', ref: 'r2' }], act, RISK_STEPS)).toBe(false);
  });

  it('finds a step only through that step or a risk on it', () => {
    const step = { act: 'PD-02', n: 3 };
    expect(touchesWork([{ type: 'step', ref: 'PD-02:3' }], step, RISK_STEPS)).toBe(true);
    expect(touchesWork([{ type: 'risk', ref: 'r3' }], step, RISK_STEPS)).toBe(true);
    /* a meeting about the activity did not necessarily discuss this step */
    expect(touchesWork([{ type: 'activity', ref: 'PD-02' }], step, RISK_STEPS)).toBe(false);
    expect(touchesWork([{ type: 'step', ref: 'PD-02:4' }], step, RISK_STEPS)).toBe(false);
    expect(touchesWork([{ type: 'risk', ref: 'r1' }], step, RISK_STEPS)).toBe(false);
  });

  it('ignores stages, deliverables and milestones, which are not the work itself, when judging work', () => {
    const links: LinkRef[] = [
      { type: 'stage', ref: 'physicalDesign' },
      { type: 'deliverable', ref: 'd1' },
      { type: 'milestone', ref: 'tapeout' },
    ];
    expect(touchesWork(links, { act: 'PD-02' }, RISK_STEPS)).toBe(false);
  });
});
