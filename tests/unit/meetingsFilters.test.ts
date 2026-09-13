import { describe, expect, it } from 'vitest';
import { filterMeetings } from '@/lib/meetings/filters';
import { agendaItem, meeting } from './meetingFixtures';

const ACTS: Record<string, { title: string; stageId: string }> = {
  'DFT-02': { title: 'ATPG pattern generation', stageId: 'dft' },
  'PD-11': { title: 'Signal integrity', stageId: 'physicalDesign' },
};
const CTX = {
  activity: (ref: string) => ACTS[ref],
  risk: (id: string) =>
    id === 'r1' ? { text: 'Crosstalk', act: 'PD-11', stepN: 4, stageId: 'physicalDesign' } : undefined,
  deliverable: (id: string) => (id === 'dlv' ? { title: 'Substrate PO', stageId: 'packageDesign' } : undefined),
  milestone: (id: string) => (id === 'tapeout' ? { label: 'Tapeout', stageId: 'tapeout' } : undefined),
};
const RISK_STEPS = { r1: { act: 'PD-11', stepN: 4 } };
const NOW = new Date('2026-09-13T19:00:00Z');
const t = (iso: string) => new Date(iso);

const MEETINGS = [
  meeting({
    id: 'dft',
    title: 'DFT Weekly Review',
    type: 'working_group',
    status: 'completed',
    seriesId: 's-dft',
    owner: 'Yusuf Demir',
    startsAt: t('2026-09-08T16:00:00Z'),
    endsAt: t('2026-09-08T17:00:00Z'),
    links: [{ type: 'activity', ref: 'DFT-02' }],
  }),
  meeting({
    id: 'pd',
    title: 'Physical Design Closure Review',
    type: 'design_review',
    owner: 'Marco Bianchi',
    startsAt: t('2026-09-15T17:00:00Z'),
    endsAt: t('2026-09-15T18:00:00Z'),
    links: [{ type: 'risk', ref: 'r1' }],
  }),
  meeting({
    id: 'pkg',
    title: 'Package Supplier Review',
    type: 'supplier_review',
    status: 'cancelled',
    startsAt: t('2026-09-10T16:00:00Z'),
    endsAt: t('2026-09-10T17:00:00Z'),
    links: [{ type: 'deliverable', ref: 'dlv' }],
  }),
  meeting({
    id: 'to',
    title: 'Tapeout Readiness Review',
    type: 'readiness_review',
    startsAt: t('2026-09-22T16:00:00Z'),
    endsAt: t('2026-09-22T17:00:00Z'),
    links: [{ type: 'milestone', ref: 'tapeout' }],
    attendees: [{ id: 'a', name: 'Brian Walsh', optional: false }],
  }),
];
const AGENDA = [
  agendaItem({ meetingId: 'to', title: 'ECO closure plan', links: [{ type: 'step', ref: 'DFT-02:3' }] }),
];

const ids = (f: Parameters<typeof filterMeetings>[2]) =>
  filterMeetings(MEETINGS, AGENDA, f, CTX, RISK_STEPS, NOW).map((m) => m.id);

describe('filterMeetings', () => {
  it('lists everything, newest first, when nothing is asked', () => {
    expect(ids({})).toEqual(['to', 'pd', 'pkg', 'dft']);
    expect(ids({ sort: 'oldest' })).toEqual(['dft', 'pkg', 'pd', 'to']);
  });

  it('filters by status — which is how history is read', () => {
    expect(ids({ status: 'completed' })).toEqual(['dft']);
  });

  it('splits what is still to happen from what is past', () => {
    expect(ids({ when: 'upcoming' })).toEqual(['to', 'pd']);
    expect(ids({ when: 'past' })).toEqual(['pkg', 'dft']);
  });

  it('filters by date range on the calendar day where the meeting is held', () => {
    expect(ids({ from: '2026-09-10', to: '2026-09-15' })).toEqual(['pd', 'pkg']);
  });

  it('filters by type, owner and series', () => {
    expect(ids({ type: 'supplier_review' })).toEqual(['pkg']);
    expect(ids({ owner: 'Yusuf Demir' })).toEqual(['dft']);
    expect(ids({ seriesId: 's-dft' })).toEqual(['dft']);
  });

  it('finds a meeting by the stage its work is in, however that work was linked', () => {
    expect(ids({ stageId: 'physicalDesign' })).toEqual(['pd']);
    expect(ids({ stageId: 'packageDesign' })).toEqual(['pkg']);
    expect(ids({ stageId: 'tapeout' })).toEqual(['to']);
    expect(ids({ stageId: 'dft' })).toEqual(['to', 'dft']);
  });

  it('finds a meeting by activity, through its agenda as well as its own links', () => {
    expect(ids({ activityRef: 'DFT-02' })).toEqual(['to', 'dft']);
  });

  it('searches titles, people and agenda items, every word', () => {
    expect(ids({ query: 'supplier' })).toEqual(['pkg']);
    expect(ids({ query: 'brian' })).toEqual(['to']);
    expect(ids({ query: 'eco closure' })).toEqual(['to']);
    expect(ids({ query: 'eco supplier' })).toEqual([]);
  });
});
