import { describe, expect, it } from 'vitest';
import { DEFAULT_MEETINGS_TAB, isMeetingsTab, MEETINGS_TABS, meetingsTabHref } from '@/lib/meetings/tabs';

describe('the meetings tabs', () => {
  it('put the calendar first, then Upcoming, Action Items, All Meetings and Series', () => {
    expect(MEETINGS_TABS.map((t) => t.label)).toEqual(['Calendar', 'Upcoming', 'Action Items', 'All Meetings', 'Series']);
  });

  it('open on the first of them', () => {
    expect(DEFAULT_MEETINGS_TAB).toBe('calendar');
    expect(isMeetingsTab(DEFAULT_MEETINGS_TAB)).toBe(true);
  });

  it('link the default tab bare, Action Items to my open actions, and the rest by name', () => {
    expect(meetingsTabHref('p1', 'calendar')).toBe('/p/p1/meetings');
    expect(meetingsTabHref('p1', 'upcoming')).toBe('/p/p1/meetings?tab=upcoming');
    expect(meetingsTabHref('p1', 'actions')).toBe('/p/p1/meetings/actions?view=mine');
    expect(meetingsTabHref('p1', 'all')).toBe('/p/p1/meetings?tab=all');
  });
});
