/**
 * The prototype's icons, as components.
 *
 * Ported rather than swapped for a library: they are part of what the shell
 * looks like, and "the same as the mockup" includes the shape of the glyph in
 * the nav. Same viewBox, same stroke widths.
 */
const S = (props: { children: React.ReactNode; size?: number; stroke?: string; width?: number }) => (
  <svg
    width={props.size ?? 14}
    height={props.size ?? 14}
    viewBox="0 0 24 24"
    fill="none"
    stroke={props.stroke ?? 'currentColor'}
    strokeWidth={props.width ?? 1.9}
    aria-hidden="true"
  >
    {props.children}
  </svg>
);

export const IconOverview = () => (
  <S>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </S>
);

export const IconTimeline = () => (
  <S>
    <path d="M4 6h9M4 12h16M4 18h6" />
  </S>
);

export const IconStages = () => (
  <S>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18" />
  </S>
);

export const IconRisk = () => (
  <S stroke="#e5484d">
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
  </S>
);

export const IconLate = () => (
  <S>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </S>
);

export const IconActivities = () => (
  <S>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </S>
);

export const IconDeliverables = () => (
  <S>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </S>
);

export const IconUpdates = () => (
  <S>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </S>
);

export const IconTeam = () => (
  <S>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
  </S>
);

export const IconProfile = () => (
  <S>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M8 4v16" />
  </S>
);

export const IconSwitch = () => (
  <S size={12} stroke="#8b8f98" width={2.2}>
    <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
  </S>
);

export const IconSearch = () => (
  <S size={13} stroke="#8b8f98" width={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </S>
);

export const IconPlus = ({ light = false }: { light?: boolean }) => (
  <S size={12} stroke={light ? '#fff' : '#62666d'} width={2.4}>
    <path d="M12 5v14M5 12h14" />
  </S>
);

export const IconFilter = () => (
  <S size={12} stroke="#62666d" width={2}>
    <path d="M3 6h18M7 12h10M11 18h2" />
  </S>
);

export const IconSort = () => (
  <S size={12} stroke="#62666d" width={2}>
    <path d="M3 6h18M3 12h12M3 18h6" />
  </S>
);

export const IconMail = () => (
  <S size={12} stroke="#62666d" width={2}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 6 10-6" />
  </S>
);

/** The paperclip a row wears when something is actually attached to it. */
export const IconClip = () => (
  <S size={9} width={2.4}>
    <path d="M21.4 11 12.3 20.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />
  </S>
);

/** The sheet an attached file wears in an output row. */
export const IconFile = () => (
  <S size={13} stroke="#5b5bd6">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </S>
);

/** The speech bubble an update wears. */
export const IconMessage = ({ large = false }: { large?: boolean }) => (
  <S size={large ? 30 : 10} stroke={large ? '#d8dade' : '#b4b7bd'} width={large ? 1.5 : 2}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </S>
);

/** The warning triangle an empty risk board wears. */
export const IconRiskLarge = () => (
  <S size={30} stroke="#d8dade" width={1.5}>
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
  </S>
);

export const IconEmptyList = () => (
  <S size={34} stroke="#d8dade" width={1.4}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M9 10v10" />
  </S>
);

/**
 * Someone's initials on a colour drawn from their name.
 *
 * The colour is a hash rather than a stored field, so the same person is the
 * same colour on every screen without anybody having to pick one — and a person
 * added a minute ago has one immediately.
 */
const AVATAR_COLOURS = [
  '#5b5bd6',
  '#d6624a',
  '#3d7f6e',
  '#8b6cc9',
  '#b07d2e',
  '#2f6fb8',
  '#a0527a',
  '#4a7f3d',
];

export const avatarColour = (name: string): string => {
  let h = 0;
  for (const c of String(name || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_COLOURS[h % AVATAR_COLOURS.length];
};

export const initialsOf = (name: string): string =>
  String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';

export function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  return (
    <span
      className={small ? 'av s' : 'av'}
      style={{ background: avatarColour(name) }}
      title={name}
    >
      {initialsOf(name)}
    </span>
  );
}
