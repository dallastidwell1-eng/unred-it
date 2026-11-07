// Design tokens: the one source for colors, type, spacing, shape and motion.
// From design/color-spec.md (D-035) and design/layout-spec.md (D-041).
// Changing a value here changes it everywhere; tokens.test.ts re-checks contrast.

export type ThemeName = 'dark' | 'light';

export interface ThemeColors {
  bg: string;
  surface: string;
  raised: string;
  line: string;
  line2: string;
  marker: string;
  text: string;
  muted: string;
  faint: string;
  /** Actions only (buttons, links, active tab, switches, OP name). */
  blue: string;
  /** Text on a blue fill. */
  onBlue: string;
  /** Upvote. Dark: pale brass arrow and score. Light: bright brass chip and arrow. */
  up: string;
  /** Downvote. Dark: brick arrow and score. Light: bright red chip and arrow. */
  down: string;
  /** Text on a vote chip (light mode only; dark mode has no chips). */
  onVote: string;
  /** Unread dot and counts. */
  dot: string;
  scrim: string;
  /** Image placeholder tiles. */
  placeholders: readonly string[];
}

export const themes: Record<ThemeName, ThemeColors> = {
  // Deep
  dark: {
    bg: '#1A1A1A',
    surface: '#212121',
    raised: '#282828',
    line: '#2A2A2A',
    line2: '#363636',
    marker: '#545454',
    text: '#E6E6E6',
    muted: '#BDBDBD',
    faint: '#A8A8A8',
    blue: '#8FB0E6',
    onBlue: '#1A1A1A',
    up: '#E2C98A',
    down: '#E5736B',
    onVote: '#1A1A1A',
    dot: '#E5736B',
    scrim: 'rgba(0, 0, 0, 0.5)',
    placeholders: ['#3A3C40', '#2B3340', '#33363B', '#2E3540'],
  },
  // Paper
  light: {
    bg: '#FAFAFA',
    surface: '#FFFFFF',
    raised: '#F0F0F0',
    line: '#E8E8E8',
    line2: '#D6D6D6',
    marker: '#A8A8A8',
    text: '#222222',
    muted: '#4D4D4D',
    faint: '#5E5E5E',
    blue: '#3A5F98',
    onBlue: '#FFFFFF',
    up: '#E8C04A',
    down: '#F2605D',
    onVote: '#222222',
    dot: '#C2413A',
    scrim: 'rgba(0, 0, 0, 0.25)',
    placeholders: ['#D8DADD', '#D2D9E2', '#DFE1E4', '#D6DCE3'],
  },
};

/** Viewport widths (px) where the tablet and desktop layouts start. */
export const breakpoints = { tablet: 768, desktop: 1024 } as const;

export interface TypeRole {
  phone: number;
  desktop: number;
  weight: number;
  lineHeight: number;
  /** em; negative is tighter. */
  tracking?: number;
}

/** layout-spec.md section 2. Sizes in px. */
export const type = {
  feedTitle: { phone: 16, desktop: 17, weight: 500, lineHeight: 1.38, tracking: -0.005 },
  cardTitle: { phone: 18, desktop: 18, weight: 600, lineHeight: 1.3, tracking: -0.01 },
  layerTitle: { phone: 22, desktop: 26, weight: 600, lineHeight: 1.25, tracking: -0.02 },
  commentsTitle: { phone: 19, desktop: 22, weight: 600, lineHeight: 1.3, tracking: -0.015 },
  postBody: { phone: 17, desktop: 17, weight: 400, lineHeight: 1.6 },
  commentBody: { phone: 16, desktop: 16, weight: 400, lineHeight: 1.5 },
  barTitle: { phone: 17, desktop: 16, weight: 600, lineHeight: 1 },
  pageHeading: { phone: 22, desktop: 22, weight: 600, lineHeight: 1.2 },
  sectionLabel: { phone: 12, desktop: 12, weight: 600, lineHeight: 1.2, tracking: 0.06 },
  meta: { phone: 13, desktop: 13, weight: 400, lineHeight: 1.3 },
  commentAuthor: { phone: 13, desktop: 13, weight: 600, lineHeight: 1.3 },
  control: { phone: 15, desktop: 14, weight: 500, lineHeight: 1 },
  badge: { phone: 11, desktop: 11, weight: 700, lineHeight: 1 },
} as const satisfies Record<string, TypeRole>;

/** The "Large text" setting multiplies every type size by this. */
export const largeTextScale = 1.125;

export const fonts = {
  ui: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  wordmark: '"Inter Tight", "Inter", system-ui, sans-serif',
} as const;

/** px. Base unit 4. */
export const space = { 1: 4, 1.5: 6, 2: 8, 2.5: 10, 3: 12, 3.5: 14, 4: 16, 5: 20, 6: 24 } as const;

/** px. */
export const radius = {
  chip: 7,
  thumb: 8,
  control: 10,
  image: 12,
  card: 14,
  sheet: 16,
  full: 9999,
} as const;

/** Minimum touch target, px (layout-spec 1.4). */
export const minTarget = 44;

/** ms. layout-spec section 7. */
export const motion = {
  layerIn: 200,
  layerOut: 160,
  commentsIn: 220,
  pickerIn: 180,
  fold: 150,
  reduced: 100,
} as const;

function kebab(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/** The CSS custom properties (`--bg`, `--on-blue`, ...) for one theme. */
export function themeVariables(theme: ThemeName): string {
  const colors = themes[theme];
  const lines: string[] = [];
  for (const [name, value] of Object.entries(colors)) {
    if (typeof value === 'string') {
      lines.push(`--${kebab(name)}: ${value};`);
    }
  }
  colors.placeholders.forEach((value, index) => {
    lines.push(`--placeholder-${String(index + 1)}: ${value};`);
  });
  // Vote display (color-spec rules 4 and 5): dark = colored score, no chip;
  // light = filled chip with charcoal text.
  if (theme === 'dark') {
    lines.push('--up-fg: var(--up);', '--up-bg: transparent;');
    lines.push('--down-fg: var(--down);', '--down-bg: transparent;');
  } else {
    lines.push('--up-fg: var(--on-vote);', '--up-bg: var(--up);');
    lines.push('--down-fg: var(--on-vote);', '--down-bg: var(--down);');
  }
  return lines.join('\n');
}

/**
 * CSS for a root element (for example a shadow root's :host). The device
 * theme applies by default; data-theme="dark" or "light" overrides it (D-024).
 */
export function themeCss(selector = ':host'): string {
  // A shadow host takes conditions inside parentheses: :host([data-theme]).
  const when = (condition: string): string =>
    selector === ':host' ? `:host(${condition})` : `${selector}${condition}`;
  return [
    `${selector} { color-scheme: light dark; ${themeVariables('light')} }`,
    `@media (prefers-color-scheme: dark) { ${when(':not([data-theme="light"])')} { ${themeVariables('dark')} } }`,
    `${when('[data-theme="dark"]')} { color-scheme: dark; ${themeVariables('dark')} }`,
    `${when('[data-theme="light"]')} { color-scheme: light; }`,
  ].join('\n');
}
