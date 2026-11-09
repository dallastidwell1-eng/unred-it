// The settings screen (layout-spec 5.8, D-024, D-064, D-065): Appearance
// (theme, feed view), Filters (hidden subreddits, hidden words, hide opened
// posts) and a note on sync. The same panel shows in two places: as a view
// over the feed (from the top bar's gear) and as the extension's options page
// (Firefox's add-on settings).

import { useEffect, useId, useRef, useState } from 'preact/hooks';
import {
  addEntry,
  cleanSubredditName,
  cleanWord,
  hasEntry,
  removeEntry,
  type Settings,
  type ThemeChoice,
} from '../lib/settings';
import type { FeedView } from '../lib/view-setting';
import { BackIcon, CloseIcon } from './icons';
import { useDialogKeys } from './useDialogKeys';

type Change = (changes: Partial<Settings>) => void;

const THEMES: { value: ThemeChoice; label: string }[] = [
  { value: 'device', label: 'Device' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const VIEWS: { value: FeedView; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'card', label: 'Cards' },
];

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <div class="setting">
      <div class="setting-label" id={id}>
        {label}
      </div>
      <div
        class="segmented"
        role="group"
        aria-labelledby={id}
        style={{ gridTemplateColumns: `repeat(${String(options.length)}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            onClick={() => {
              onChange(option.value);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** A list of hidden subreddits or words: chips with a remove button, and a field to add one. */
function ListSetting({
  label,
  placeholder,
  items,
  shown,
  clean,
  invalid,
  onChange,
}: {
  label: string;
  placeholder: string;
  items: string[];
  /** How an entry is shown, for example "r/books". */
  shown: (item: string) => string;
  /** The cleaned entry, or null when it cannot be one. */
  clean: (input: string) => string | null;
  /** Said when the typed text cannot be an entry. */
  invalid: string;
  onChange: (items: string[]) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');

  const add = () => {
    if (!text.trim()) {
      return;
    }
    const entry = clean(text);
    if (!entry) {
      setMessage(invalid);
      return;
    }
    if (hasEntry(items, entry)) {
      setMessage(`${shown(entry)} is already on the list.`);
      return;
    }
    onChange(addEntry(items, entry));
    setText('');
    setMessage('');
  };

  return (
    <div class="setting">
      <label class="setting-label" for={id}>
        {label}
      </label>
      {items.length > 0 && (
        <ul class="hidden-list" aria-label={label}>
          {items.map((item) => (
            <li key={item} class="hidden-chip">
              <span>{shown(item)}</span>
              <button
                type="button"
                class="chip-remove"
                aria-label={`Remove ${shown(item)}`}
                onClick={() => {
                  onChange(removeEntry(items, item));
                  input.current?.focus();
                }}
              >
                <CloseIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        class="add-row"
        onSubmit={(event) => {
          event.preventDefault();
          add();
        }}
      >
        <input
          id={id}
          ref={input}
          class="text-field"
          type="text"
          placeholder={placeholder}
          autocomplete="off"
          autocapitalize="off"
          spellcheck={false}
          enterkeyhint="done"
          value={text}
          aria-invalid={message ? true : undefined}
          onInput={(event) => {
            setText(event.currentTarget.value);
            setMessage('');
          }}
        />
        <button type="submit" class="add-button" disabled={!text.trim()}>
          Add
        </button>
      </form>
      {message && (
        <p class="setting-message" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}

function SwitchSetting({
  label,
  note,
  checked,
  onChange,
}: {
  label: string;
  note: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div class="setting switch-row">
      <span class="switch-text">
        <span class="setting-label" id={`${id}-label`}>
          {label}
        </span>
        <span class="setting-note" id={`${id}-note`}>
          {note}
        </span>
      </span>
      <button
        type="button"
        class="switch"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-note`}
        onClick={() => {
          onChange(!checked);
        }}
      >
        <span class="knob" aria-hidden="true" />
      </button>
    </div>
  );
}

/** The settings themselves; each change is passed on at once (there is no Save button). */
export function SettingsPanel({
  settings,
  onChange,
  version,
}: {
  settings: Settings;
  onChange: Change;
  /** The extension's version, shown at the bottom. */
  version?: string;
}) {
  return (
    <div class="settings">
      <section class="settings-section" aria-labelledby="settings-appearance">
        <h3 class="settings-label" id="settings-appearance">
          Appearance
        </h3>
        <Segmented
          label="Theme"
          value={settings.theme}
          options={THEMES}
          onChange={(theme) => {
            onChange({ theme });
          }}
        />
        <Segmented
          label="Feed view"
          value={settings.view}
          options={VIEWS}
          onChange={(view) => {
            onChange({ view });
          }}
        />
      </section>

      <section class="settings-section" aria-labelledby="settings-filters">
        <h3 class="settings-label" id="settings-filters">
          Filters
        </h3>
        <ListSetting
          label="Hidden subreddits"
          placeholder="Add a subreddit"
          items={settings.hiddenSubreddits}
          shown={(name) => `r/${name}`}
          clean={cleanSubredditName}
          invalid="That is not a subreddit name."
          onChange={(hiddenSubreddits) => {
            onChange({ hiddenSubreddits });
          }}
        />
        <p class="setting-note">
          Left out of Home, Popular, All and search. A subreddit you open still shows its posts.
        </p>
        <ListSetting
          label="Hidden words"
          placeholder="Add a word or phrase"
          items={settings.hiddenWords}
          shown={(word) => word}
          clean={cleanWord}
          invalid="Type a word or phrase."
          onChange={(hiddenWords) => {
            onChange({ hiddenWords });
          }}
        />
        <p class="setting-note">Posts with these words in the title are left out everywhere.</p>
        <SwitchSetting
          label="Hide posts I have opened"
          note="They are left out the next time a feed loads. Search still finds them."
          checked={settings.hideOpened}
          onChange={(hideOpened) => {
            onChange({ hideOpened });
          }}
        />
      </section>

      <section class="settings-section settings-about">
        <p>
          On a computer, settings follow you to your other computers through Firefox Sync, when
          Add-ons is ticked in Firefox’s Sync settings. Firefox for Android keeps its own settings.
        </p>
        <p>Unred It collects no data.{version ? ` Version ${version}` : ''}</p>
      </section>
    </div>
  );
}

/** Settings as a full-screen view over the feed (D-064). Back or Esc closes it. */
export function SettingsView({
  settings,
  onChange,
  version,
  onClose,
  active = true,
}: {
  settings: Settings;
  onChange: Change;
  version?: string;
  onClose: () => void;
  active?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useDialogKeys(panel, active, onClose);

  // Focus moves into the view when it opens (layout-spec 8).
  useEffect(() => {
    panel.current?.focus();
  }, []);

  return (
    <div
      class="settings-view"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      tabIndex={-1}
      ref={panel}
    >
      <div class="settings-head">
        <button class="back" type="button" onClick={onClose}>
          <BackIcon />
          Feed
        </button>
      </div>
      <div class="settings-scroll">
        <div class="settings-column">
          <h2 class="settings-title" id="settings-title">
            Settings
          </h2>
          <SettingsPanel settings={settings} onChange={onChange} version={version} />
        </div>
      </div>
    </div>
  );
}
