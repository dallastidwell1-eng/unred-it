// Line icons on a 24 px grid, 2 px stroke, round caps and joins (layout-spec 6).
// Decorative: the control that holds an icon carries the accessible name.

import type { ComponentChildren } from 'preact';

function Icon({ size, children }: { size: number; children: ComponentChildren }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Text post placeholder ("lines"). */
export function LinesIcon({ size = 20 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M5 7h14M5 12h14M5 17h9" />
    </Icon>
  );
}

/** Link post placeholder. */
export function LinkIcon({ size = 20 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
    </Icon>
  );
}

export function CommentIcon({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M20 12a8 8 0 0 1-11.5 7.2L4 20l1-4.2A8 8 0 1 1 20 12Z" />
    </Icon>
  );
}

export function UpIcon({ size = 14 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </Icon>
  );
}

export function DownIcon({ size = 14 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </Icon>
  );
}

export function ChevronDownIcon({ size = 18 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

export function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </Icon>
  );
}

export function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  );
}

export function BackIcon({ size = 20 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M15 18l-6-6 6-6" />
    </Icon>
  );
}

export function ExternalIcon({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </Icon>
  );
}

/** Card view: two stacked cards. */
export function CardsIcon({ size = 20 }: { size?: number }) {
  return (
    <Icon size={size}>
      <rect x="4" y="3" width="16" height="8" rx="2" />
      <rect x="4" y="13" width="16" height="8" rx="2" />
    </Icon>
  );
}

/** Compact view: rows with a small picture each. */
export function RowsIcon({ size = 20 }: { size?: number }) {
  return (
    <Icon size={size}>
      <rect x="3" y="4" width="5" height="5" rx="1" />
      <rect x="3" y="15" width="5" height="5" rx="1" />
      <path d="M12 6.5h9M12 17.5h9" />
    </Icon>
  );
}

/** Play mark on a video's picture (filled triangle). */
export function PlayIcon({ size = 20 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
    </Icon>
  );
}

/** Gallery mark: stacked pictures. */
export function GalleryIcon({ size = 14 }: { size?: number }) {
  return (
    <Icon size={size}>
      <rect x="7" y="7" width="14" height="14" rx="2" />
      <path d="M17 3H5a2 2 0 0 0-2 2v12" />
    </Icon>
  );
}
