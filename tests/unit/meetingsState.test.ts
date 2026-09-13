import { describe, expect, it } from 'vitest';
import { buildMeetingsState, type MeetingsRows } from '@/lib/meetings/state';

const T = new Date('2026-09-01T16:00:00Z');
const stamp = { createdAt: T, updatedAt: T, createdBy: 'Sangwook Park', updatedBy: 'Sangwook Park' };

const rows = (over: Partial<MeetingsRows> = {}): MeetingsRows => ({
  completionMode: 'warn',
  series: [
    {
      id: 's1',
      projectId: 'p1',
      title: 'DFT Weekly Review',
      purpose: '',
      type: 'working_group',
      owner: 'Sangwook Park',
      attendees: 'Yusuf Demir\n\n  Anja Keller  \n',
      recurrence: JSON.stringify({ freq: 'weekly', interval: 1, weekdays: [2], monthDay: null, startDate: '2026-09-01', time: '09:00', until: null }),
      durationMinutes: 60,
      agendaTemplate: 'Coverage\nPattern count',
      timeZone: 'America/Los_Angeles',
      location: 'B2-Tahoe',
      accessScope: 'program',
      status: 'active',
      ...stamp,
    },
  ],
  meetings: [
    {
      id: 'm1',
      projectId: 'p1',
      seriesId: 's1',
      title: 'DFT Weekly Review',
      type: 'working_group',
      status: 'scheduled',
      startsAt: T,
      endsAt: new Date('2026-09-01T17:00:00Z'),
      timeZone: 'America/Los_Angeles',
      owner: 'Sangwook Park',
      facilitator: '',
      location: '',
      purpose: '',
      minutes: '',
      completedAt: null,
      cancelReason: '',
      attendees: [
        { id: 'at2', name: 'Anja Keller', optional: true, position: 1 },
        { id: 'at1', name: 'Yusuf Demir', optional: false, position: 0 },
      ],
      ...stamp,
    },
  ],
  agenda: [
    {
      id: 'a1',
      projectId: 'p1',
      meetingId: 'm1',
      position: 0,
      title: 'Coverage',
      description: '',
      presenter: '',
      minutes: 10,
      notes: '',
      outcome: '',
      status: 'pending',
      deferral: '',
      deferNote: '',
      carriedFromId: null,
      ...stamp,
    },
  ],
  decisions: [
    {
      id: 'd1',
      projectId: 'p1',
      meetingId: 'm1',
      agendaItemId: 'a1',
      title: 'Hold the pattern budget',
      description: '',
      owner: '',
      approvedBy: '',
      decidedOn: null,
      rationale: '',
      scope: '',
      status: 'approved',
      supersedesId: null,
      ...stamp,
    },
  ],
  actions: [
    {
      id: 'x1',
      projectId: 'p1',
      meetingId: 'm1',
      agendaItemId: null,
      description: 'Rerun ATPG',
      owner: 'Tarek Haddad',
      contributors: 'Yusuf Demir\nAnja Keller\n',
      dueDate: T,
      priority: 'high',
      status: 'open',
      actionType: 'new_step',
      evidence: '',
      blocker: '',
      escalationDate: null,
      verifiedBy: '',
      completedAt: null,
      scheduleImpact: '',
      impactNote: '',
      carriedToMeetingId: null,
      convertedActivityRef: 'DFT-02',
      convertedStepN: 9,
      ...stamp,
    },
  ],
  links: [
    { seriesId: 's1', meetingId: null, agendaItemId: null, decisionId: null, actionItemId: null, targetType: 'stage', targetRef: 'dft' },
    { seriesId: null, meetingId: 'm1', agendaItemId: null, decisionId: null, actionItemId: null, targetType: 'activity', targetRef: 'DFT-02' },
    { seriesId: null, meetingId: null, agendaItemId: 'a1', decisionId: null, actionItemId: null, targetType: 'step', targetRef: 'DFT-02:3' },
    { seriesId: null, meetingId: null, agendaItemId: null, decisionId: 'd1', actionItemId: null, targetType: 'deliverable', targetRef: 'dlv-1' },
    { seriesId: null, meetingId: null, agendaItemId: null, decisionId: null, actionItemId: 'x1', targetType: 'risk', targetRef: 'r1' },
    { seriesId: null, meetingId: 'm1', agendaItemId: null, decisionId: null, actionItemId: null, targetType: 'ticket', targetRef: 'JIRA-1' },
  ],
  files: [
    {
      id: 'f1',
      projectId: 'p1',
      meetingId: 'm1',
      decisionId: null,
      actionItemId: null,
      category: 'presentation',
      title: 'Coverage deck',
      url: '',
      createdAt: T,
      createdBy: 'Sangwook Park',
      attachments: [{ id: 'att', filename: 'deck.pdf', mimeType: 'application/pdf', size: 10 }],
    },
  ],
  ...over,
});

describe('buildMeetingsState', () => {
  it('hangs each link on the row that owns it, and drops a kind it does not know', () => {
    const s = buildMeetingsState(rows());
    expect(s.series[0].links).toEqual([{ type: 'stage', ref: 'dft' }]);
    expect(s.meetings[0].links).toEqual([{ type: 'activity', ref: 'DFT-02' }]);
    expect(s.agenda[0].links).toEqual([{ type: 'step', ref: 'DFT-02:3' }]);
    expect(s.decisions[0].links).toEqual([{ type: 'deliverable', ref: 'dlv-1' }]);
    expect(s.actions[0].links).toEqual([{ type: 'risk', ref: 'r1' }]);
  });

  it('reads the lists stored one per line, without the blanks', () => {
    const s = buildMeetingsState(rows());
    expect(s.series[0].attendees).toEqual(['Yusuf Demir', 'Anja Keller']);
    expect(s.series[0].agendaTemplate).toEqual(['Coverage', 'Pattern count']);
    expect(s.actions[0].contributors).toEqual(['Yusuf Demir', 'Anja Keller']);
  });

  it('orders attendees as they were entered', () => {
    expect(buildMeetingsState(rows()).meetings[0].attendees.map((a) => a.name)).toEqual([
      'Yusuf Demir',
      'Anja Keller',
    ]);
  });

  it('reads a recurrence back, and a broken one as weekly from the day the series was made', () => {
    expect(buildMeetingsState(rows()).series[0].recurrence.weekdays).toEqual([2]);
    const broken = rows();
    broken.series[0].recurrence = 'not json';
    const r = buildMeetingsState(broken).series[0].recurrence;
    expect(r.freq).toBe('weekly');
    expect(r.startDate).toBe('2026-09-01');
  });

  it('reads a value it does not recognise as the safe default', () => {
    const odd = rows({ completionMode: 'strict' });
    odd.meetings[0].status = 'archived';
    odd.actions[0].priority = 'urgent';
    odd.decisions[0].status = 'maybe';
    const s = buildMeetingsState(odd);
    expect(s.completionMode).toBe('warn');
    expect(s.meetings[0].status).toBe('scheduled');
    expect(s.actions[0].priority).toBe('normal');
    expect(s.decisions[0].status).toBe('proposed');
  });

  it('knows the step an action became, and the files a meeting carries', () => {
    const s = buildMeetingsState(rows());
    expect(s.actions[0].convertedStep).toEqual({ act: 'DFT-02', n: 9 });
    expect(s.actions[0].due).toEqual(T);
    expect(s.files[0].attachments.map((a) => a.filename)).toEqual(['deck.pdf']);
  });
});
