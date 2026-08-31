/**
 * /lib/stageTabs.ts — the seven sections of a stage page.
 *
 * Its own module, and not a client one, because the route validates the tab in
 * the URL before it renders anything: an unknown section redirects to the
 * default rather than 404ing, and that decision is made on the server.
 *
 * Pure: no DOM.
 */
export const STAGE_TABS = [
  { slug: 'activity', label: 'Activity' },
  { slug: 'keyinfo', label: 'Key info' },
  { slug: 'risks', label: 'Risks' },
  { slug: 'deliverables', label: 'Key deliverables' },
  { slug: 'updates', label: 'Updates' },
  { slug: 'team', label: 'Team' },
  /* Last, and marked N/A: the board is where a stage gets talked about, and
     nobody is talking yet — the tool is one TPM's. It works, and it is the
     first thing that becomes real when a second person arrives, so it keeps
     its place rather than being hidden. */
  { slug: 'board', label: 'Communication board (N/A)' },
] as const;

export type StageTab = (typeof STAGE_TABS)[number]['slug'];

/** The one a stage opens on. */
export const DEFAULT_TAB: StageTab = 'activity';

export const isStageTab = (s: string): s is StageTab => STAGE_TABS.some((t) => t.slug === s);

export const tabLabel = (slug: StageTab): string =>
  STAGE_TABS.find((t) => t.slug === slug)?.label ?? slug;
