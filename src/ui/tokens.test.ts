import { describe, expect, it } from 'vitest';
import { contrast } from '../lib/contrast';
import { themeCss, themes, themeVariables } from './tokens';

const dark = themes.dark;
const light = themes.light;

describe('contrast()', () => {
  it('matches the WCAG reference values', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrast('#777', '#777')).toBeCloseTo(1, 5);
  });
});

// Every pair design/color-spec.md promises. Text needs 4.5:1; graphics 3:1.
describe('color-spec contrast promises', () => {
  const text: [string, string, string][] = [
    ['dark text on bg', dark.text, dark.bg],
    ['dark muted on bg', dark.muted, dark.bg],
    ['dark faint on bg', dark.faint, dark.bg],
    ['dark faint on raised (worst case)', dark.faint, dark.raised],
    ['dark blue on bg', dark.blue, dark.bg],
    ['dark text on blue', dark.onBlue, dark.blue],
    ['dark upvote score on bg', dark.up, dark.bg],
    ['dark downvote score on bg', dark.down, dark.bg],
    ['dark unread count on bg', dark.dot, dark.bg],
    ['light text on bg', light.text, light.bg],
    ['light muted on bg', light.muted, light.bg],
    ['light faint on bg', light.faint, light.bg],
    ['light blue on bg', light.blue, light.bg],
    ['light text on blue', light.onBlue, light.blue],
    ['light text on upvote chip', light.onVote, light.up],
    ['light text on downvote chip', light.onVote, light.down],
  ];
  for (const [name, fg, bg] of text) {
    it(`${name} is at least 4.5:1`, () => {
      expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
    });
  }

  it('light unread dot is at least 3:1 (graphic)', () => {
    expect(contrast(light.dot, light.bg)).toBeGreaterThanOrEqual(3);
  });

  it('grounds, surfaces, lines and text are neutral grey (rule 1)', () => {
    for (const theme of [dark, light]) {
      for (const key of ['bg', 'surface', 'raised', 'line', 'line2', 'text', 'muted'] as const) {
        const hex = theme[key].slice(1);
        expect(hex.slice(0, 2)).toBe(hex.slice(2, 4));
        expect(hex.slice(2, 4)).toBe(hex.slice(4, 6));
      }
    }
  });
});

describe('theme CSS', () => {
  it('names variables in kebab case', () => {
    const css = themeVariables('dark');
    expect(css).toContain('--bg: #1A1A1A;');
    expect(css).toContain('--on-blue: #1A1A1A;');
    expect(css).toContain('--placeholder-4: #2E3540;');
  });

  it('follows the device and allows an override', () => {
    const css = themeCss();
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain(':host(:not([data-theme="light"]))');
    expect(css).toContain(':host([data-theme="dark"])');
    expect(css).toContain(':host([data-theme="light"])');
  });

  it('uses plain attribute selectors outside a shadow root', () => {
    expect(themeCss('html')).toContain('html[data-theme="dark"]');
  });
});
