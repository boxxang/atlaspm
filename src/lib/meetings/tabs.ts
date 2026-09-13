/**
 * /lib/meetings/tabs.ts — the sections of the meetings screens.
 *
 * Their own module, and not a client one, because the routes read the tab from
 * the URL before anything renders: an unknown tab opens the default rather
 * than a blank page. History, decisions and action items are deliberately not
 * top-level tabs — history is All Meetings filtered to what is past, and the
 * follow-up lists open from the Upcoming summaries.
 *
 * Pure: no DOM.
 */
export const MEETINGS_TABS = [
  { slug: 'upcoming', label: 'Upcoming' },
  { slug: 'calendar', label: 'Calendar' },
  { slug: 'all', label: 'All Meetings' },
  { slug: 'series', label: 'Series' },
] as const;
export type MeetingsTab = (typeof MEETINGS_TABS)[number]['slug'];
export const isMeetingsTab = (s: unknown): s is MeetingsTab =>
  MEETINGS_TABS.some((t) => t.slug === s);

export const MEETING_DETAIL_TABS = [
  { slug: 'overview', label: 'Overview' },
  { slug: 'agenda', label: 'Agenda & Minutes' },
  { slug: 'decisions', label: 'Decisions' },
  { slug: 'actions', label: 'Action Items' },
  { slug: 'files', label: 'Files' },
] as const;
export type MeetingDetailTab = (typeof MEETING_DETAIL_TABS)[number]['slug'];
export const isMeetingDetailTab = (s: unknown): s is MeetingDetailTab =>
  MEETING_DETAIL_TABS.some((t) => t.slug === s);

/** The follow-up lists the Upcoming summaries open. */
export const ACTION_VIEWS = [
  { slug: 'mine', label: 'My open actions' },
  { slug: 'overdue', label: 'Overdue' },
  { slug: 'blocked', label: 'Blocked' },
  { slug: 'due_soon', label: 'Due soon' },
  { slug: 'all', label: 'All action items' },
] as const;
export type ActionViewSlug = (typeof ACTION_VIEWS)[number]['slug'];
export const isActionView = (s: unknown): s is ActionViewSlug => ACTION_VIEWS.some((v) => v.slug === s);
