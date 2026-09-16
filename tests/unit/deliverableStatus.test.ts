import { describe, expect, it } from 'vitest';
import {
  deliverableStatus,
  deliverableStep,
  producersOf,
  handoverComplete,
  producerStarted,
} from '@/lib/deliverableStatus';

const d = (iso: string) => new Date(`${iso}T00:00:00`);
const TODAY = d('2025-06-01');

describe('deliverableStatus', () => {
  it('is Completed once it has been handed over, whatever its date says', () => {
    expect(deliverableStatus({ done: true, due: d('2025-01-01') }, TODAY, false).label).toBe(
      'Completed',
    );
  });

  it('is Delayed once its date has gone by with nothing handed over', () => {
    expect(deliverableStatus({ done: false, due: d('2025-05-31') }, TODAY, true)).toEqual({
      kind: 'late',
      label: 'Delayed',
    });
  });

  it('is not delayed on the day it is due', () => {
    expect(deliverableStatus({ done: false, due: TODAY }, TODAY, true).label).toBe('In progress');
  });

  it('is In progress once the work behind it has started', () => {
    expect(deliverableStatus({ done: false, due: d('2025-09-01') }, TODAY, true).label).toBe(
      'In progress',
    );
  });

  it('is Not started before that', () => {
    expect(deliverableStatus({ done: false, due: d('2025-09-01') }, TODAY, false).label).toBe(
      'Not started',
    );
  });

  it('says Not started rather than nothing when it has no date at all', () => {
    expect(deliverableStatus({ done: false, due: null }, TODAY, false).label).toBe('Not started');
  });
});

describe('producerStarted', () => {
  it('follows the activity that produces it where there is one', () => {
    expect(producerStarted({ done: 0, phase: 'future' }, d('2020-01-01'), TODAY)).toBe(false);
    expect(producerStarted({ done: 0, phase: 'run' }, null, TODAY)).toBe(true);
    expect(producerStarted({ done: 0, phase: 'done' }, null, TODAY)).toBe(true);
  });

  it('counts a step already handed over as started, whatever the window says', () => {
    expect(producerStarted({ done: 1, phase: 'future' }, null, TODAY)).toBe(true);
  });

  it('falls back to the stage where no activity claims it', () => {
    expect(producerStarted(null, d('2025-01-01'), TODAY)).toBe(true);
    expect(producerStarted(null, d('2025-12-01'), TODAY)).toBe(false);
    expect(producerStarted(null, null, TODAY)).toBe(false);
  });
});

describe('deliverableStep', () => {
  const acts = [
    { ref: 'DEF-01', produces: ['DEF-D1', 'DEF-D2'], stepCount: 6 },
    { ref: 'DEF-03', produces: ['DEF-D3'], stepCount: 4 },
  ];

  it('is the release step — the last one — of the activity that produces it', () => {
    expect(deliverableStep('DEF-D2', acts)).toEqual({ act: 'DEF-01', n: 6 });
  });

  it('has no step for a deliverable nobody produces', () => {
    expect(deliverableStep('PKGD-D9', acts)).toBeNull();
    expect(deliverableStep(null, acts)).toBeNull();
  });

  it('has no step for an activity with none written up', () => {
    expect(deliverableStep('X-D1', [{ ref: 'X-01', produces: ['X-D1'], stepCount: 0 }])).toBeNull();
  });
});

describe('producersOf', () => {
  it('counts only the activities that produce a deliverable, not the ones that feed it', () => {
    const acts = {
      'PKGD-03': { s: [1, 2, 3, 4], r: [['PKGD-D2', 'produces'], ['PKGD-D8', 'feeds']] as [string, string][] },
      'PKGD-06': { s: [1, 2, 3, 4, 5, 6, 7], r: [['PKGD-D8', 'produces']] as [string, string][] },
    };
    const producers = producersOf(acts);
    expect(deliverableStep('PKGD-D8', producers)).toEqual({ act: 'PKGD-06', n: 7 });
    expect(deliverableStep('PKGD-D2', producers)).toEqual({ act: 'PKGD-03', n: 4 });
  });
});

describe('handoverComplete', () => {
  const att = [{ id: 'a', filename: 'spec.pdf', mimeType: 'application/pdf', size: 1 }];
  const on = d('2025-05-02');

  it('needs the artefact, the word, and the date it was accepted', () => {
    expect(handoverComplete({ text: 'Released to the fab.', attachments: att, doneAt: on })).toBe(
      true,
    );
  });

  it('is not done without something said', () => {
    expect(handoverComplete({ text: '', attachments: att, doneAt: on })).toBe(false);
    expect(handoverComplete({ text: '   ', attachments: att, doneAt: on })).toBe(false);
  });

  it('is not done without the artefact', () => {
    expect(handoverComplete({ text: 'Released.', attachments: [], doneAt: on })).toBe(false);
  });

  /* a handover with no date is a record of what was sent, not a claim that it
     is finished */
  it('is not done without a date it was accepted', () => {
    expect(handoverComplete({ text: 'Released.', attachments: att, doneAt: null })).toBe(false);
  });

  it('is not done when nothing has been filed at all', () => {
    expect(handoverComplete(null)).toBe(false);
  });
});

