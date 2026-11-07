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
