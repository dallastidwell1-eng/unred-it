// @vitest-environment happy-dom
import { render } from 'preact';
import { describe, expect, it } from 'vitest';
import { profilePath, UserLink } from './UserLink';

describe('UserLink (D-068)', () => {
  it('links a username to its old.reddit.com profile', () => {
    const box = document.createElement('div');
    render(<UserLink name="some_reader" />, box);
    const link = box.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/user/some_reader/');
    expect(link?.textContent).toBe('u/some_reader');
  });

  it('keeps its own look and text when given them', () => {
    const box = document.createElement('div');
    render(
      <UserLink name="op-name" className="comment-author op">
        op-name
      </UserLink>,
      box,
    );
    expect(box.querySelector('a')?.className).toBe('user-link comment-author op');
    expect(box.textContent).toBe('op-name');
  });

  it('does not link a deleted author', () => {
    expect(profilePath('[deleted]')).toBeNull();
    const box = document.createElement('div');
    render(<UserLink name="[deleted]" />, box);
    expect(box.querySelector('a')).toBeNull();
    expect(box.textContent).toBe('u/[deleted]');
  });
});
