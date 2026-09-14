import { describe, expect, it } from 'vitest';
import { DEFAULT_MEETINGS_TAB, isMeetingsTab, MEETINGS_TABS } from '@/lib/meetings/tabs';

describe('the meetings tabs', () => {
  it('put the calendar first, then Upcoming, All Meetings and Series', () => {
    expect(MEETINGS_TABS.map((t) => t.label)).toEqual(['Calendar', 'Upcoming', 'All Meetings', 'Series']);
  });

  it('open on the first of them', () => {
    expect(DEFAULT_MEETINGS_TAB).toBe('calendar');
    expect(isMeetingsTab(DEFAULT_MEETINGS_TAB)).toBe(true);
  });
});
