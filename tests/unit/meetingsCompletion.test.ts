import { describe, expect, it } from 'vitest';
import { canComplete, completionChecks } from '@/lib/meetings/completion';
import { action, agendaItem, decision, meeting } from './meetingFixtures';

const failing = (input: Parameters<typeof completionChecks>[0]) =>
  completionChecks(input)
    .filter((c) => !c.ok)
    .map((c) => c.key);

const tidy = {
  meeting: meeting({ minutes: 'Agreed the compression plan.' }),
  agenda: [agendaItem({ status: 'discussed', outcome: 'decision' as const })],
  decisions: [decision()],
  actions: [action()],
};

describe('completionChecks', () => {
  it('passes a meeting that recorded what happened and who does what by when', () => {
    expect(failing(tidy)).toEqual([]);
  });

  it('wants minutes, or at least one agenda item that says what came of it', () => {
    expect(failing({ ...tidy, meeting: meeting(), agenda: [agendaItem()] })).toEqual(['minutes']);
    expect(failing({ ...tidy, meeting: meeting(), agenda: [agendaItem({ notes: 'Covered.' })] })).toEqual([]);
    expect(
      failing({ ...tidy, meeting: meeting(), agenda: [agendaItem({ outcome: 'info' })] }),
    ).toEqual([]);
  });

  it('wants every decision to have landed somewhere other than Proposed', () => {
    const checks = completionChecks({ ...tidy, decisions: [decision({ status: 'proposed' })] });
    const c = checks.find((x) => x.key === 'decisions')!;
    expect(c.ok).toBe(false);
    expect(c.message).toBe('1 decision is still Proposed.');
  });

  it('wants an owner and a date on every action still open, raised here or carried in', () => {
    expect(failing({ ...tidy, actions: [action({ owner: '' })] })).toEqual(['owners']);
    expect(failing({ ...tidy, actions: [action({ due: null })] })).toEqual(['dueDates']);
    expect(
      failing({
        ...tidy,
        actions: [action({ meetingId: 'm0', carriedToMeetingId: 'm1', owner: '', due: null })],
      }),
    ).toEqual(['owners', 'dueDates']);
    const c = completionChecks({ ...tidy, actions: [action({ owner: '' }), action({ id: 'x2', owner: '' })] })
      .find((x) => x.key === 'owners')!;
    expect(c.message).toBe('2 open action items have no owner.');
  });

  it('ignores closed actions and other meetings’ rows', () => {
    expect(
      failing({
        ...tidy,
        actions: [
          action({ owner: '', due: null, status: 'done' }),
          action({ id: 'x9', meetingId: 'm9', owner: '', due: null }),
        ],
        decisions: [decision(), decision({ id: 'd9', meetingId: 'm9', status: 'proposed' })],
      }),
    ).toEqual([]);
  });

  it('wants a deferred agenda item to say what happens to it next', () => {
    expect(
      failing({ ...tidy, agenda: [...tidy.agenda, agendaItem({ id: 'a2', outcome: 'deferred' })] }),
    ).toEqual(['deferred']);
    expect(
      failing({
        ...tidy,
        agenda: [...tidy.agenda, agendaItem({ id: 'a2', outcome: 'deferred', deferral: 'offline' })],
      }),
    ).toEqual([]);
  });
});

describe('canComplete', () => {
  const bad = completionChecks({ ...tidy, actions: [action({ owner: '' })] });

  it('only warns when the programme asks for warnings', () => {
    const got = canComplete(bad, 'warn');
    expect(got.allowed).toBe(true);
    expect(got.failing.map((c) => c.key)).toEqual(['owners']);
  });

  it('refuses when the programme asks for the checks to be enforced', () => {
    expect(canComplete(bad, 'block').allowed).toBe(false);
    expect(canComplete(completionChecks(tidy), 'block').allowed).toBe(true);
  });
});
