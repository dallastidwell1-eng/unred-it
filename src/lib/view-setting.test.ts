import { describe, expect, it, vi } from 'vitest';
import {
  otherView,
  parseView,
  storageViewStore,
  VIEW_KEY,
  type StorageAreaLike,
} from './view-setting';

type Listener = (changes: Record<string, { newValue?: unknown }>) => void;

function fakeArea(initial: Record<string, unknown> = {}) {
  const items = { ...initial };
  const listeners = new Set<Listener>();
  const area: StorageAreaLike = {
    get: vi.fn((key: string) => Promise.resolve(key in items ? { [key]: items[key] } : {})),
    set: vi.fn((next: Record<string, unknown>) => {
      Object.assign(items, next);
      return Promise.resolve();
    }),
    onChanged: {
      addListener: (listener) => listeners.add(listener),
      removeListener: (listener) => listeners.delete(listener),
    },
  };
  const change = (changes: Record<string, { newValue?: unknown }>) => {
    listeners.forEach((listener) => {
      listener(changes);
    });
  };
  return { area, items, listeners, change };
}

describe('parseView', () => {
  it('accepts the two views and falls back to compact', () => {
    expect(parseView('card')).toBe('card');
    expect(parseView('compact')).toBe('compact');
    expect(parseView(undefined)).toBe('compact');
    expect(parseView('grid')).toBe('compact');
    expect(parseView(1)).toBe('compact');
  });

  it('names the other view', () => {
    expect(otherView('card')).toBe('compact');
    expect(otherView('compact')).toBe('card');
  });
});

describe('storageViewStore', () => {
  it('loads compact when nothing is saved, and the saved view otherwise', async () => {
    expect(await storageViewStore(fakeArea().area).load()).toBe('compact');
    expect(await storageViewStore(fakeArea({ [VIEW_KEY]: 'card' }).area).load()).toBe('card');
  });

  it('saves under its key', async () => {
    const fake = fakeArea();
    await storageViewStore(fake.area).save('card');
    expect(fake.items).toEqual({ [VIEW_KEY]: 'card' });
  });

  it('reports changes to the view only, until stopped', () => {
    const fake = fakeArea();
    const seen = vi.fn();
    const stop = storageViewStore(fake.area).watch(seen);
    fake.change({ other: { newValue: 1 } });
    fake.change({ [VIEW_KEY]: { newValue: 'card' } });
    fake.change({ [VIEW_KEY]: {} }); // removed: back to the default
    expect(seen.mock.calls).toEqual([['card'], ['compact']]);
    stop();
    expect(fake.listeners.size).toBe(0);
  });
});
