// Save and Share on the post page's vote row (D-063, layout-spec 5.4).

import { useEffect, useRef, useState } from 'preact/hooks';
import type { Post } from '../lib/reddit-data';
import { browserShareTools, shareLink, shareUrl, type ShareResult } from '../lib/share';
import { BookmarkIcon, ShareIcon } from './icons';

const NOTES: Record<ShareResult, string> = {
  shared: '',
  cancelled: '',
  copied: 'Link copied',
  failed: 'Copy the link below',
};

export function PostTools({ post, onSave }: { post: Post; onSave?: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  /** The browser would not copy: the link shows in a field to copy by hand. */
  const [manual, setManual] = useState(false);
  const manualField = useRef<HTMLInputElement>(null);
  const url = shareUrl(post.permalink);

  useEffect(() => {
    if (manual) {
      manualField.current?.focus();
      manualField.current?.select();
    }
  }, [manual]);

  // A short note fades away by itself.
  useEffect(() => {
    if (!note) {
      return;
    }
    const timer = window.setTimeout(() => {
      setNote('');
    }, 3000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [note]);

  const save = () => {
    if (!onSave || busy) {
      return;
    }
    setBusy(true);
    setNote('');
    onSave()
      .catch((cause: unknown) => {
        setNote(`Not saved: ${cause instanceof Error ? cause.message : String(cause)}`);
      })
      .finally(() => {
        setBusy(false);
      });
  };

  const share = () => {
    void shareLink(post.title, url, browserShareTools()).then((result) => {
      setNote(NOTES[result]);
      setManual(result === 'failed');
    });
  };

  return (
    <>
      <div class="post-tools">
        {/* Always present, so screen readers announce the note when it appears. */}
        <span class="tool-note" role="status">
          {note}
        </span>
        <button
          type="button"
          class={post.saved ? 'icon-button save saved' : 'icon-button save'}
          aria-label={post.saved ? 'Unsave' : 'Save'}
          aria-pressed={post.saved}
          title={post.saved ? 'Saved' : 'Save'}
          disabled={!onSave}
          onClick={save}
        >
          <BookmarkIcon filled={post.saved} />
        </button>
        <button
          type="button"
          class="icon-button share"
          aria-label="Share"
          title="Share"
          onClick={share}
        >
          <ShareIcon />
        </button>
      </div>
      {manual && (
        <div class="share-fallback">
          <label class="sr-only" for="share-link">
            Link to this post
          </label>
          <input
            id="share-link"
            ref={manualField}
            class="share-field"
            type="text"
            readOnly
            value={url}
            onFocus={(event) => {
              event.currentTarget.select();
            }}
          />
          <button
            type="button"
            class="text-button"
            onClick={() => {
              setManual(false);
            }}
          >
            Done
          </button>
        </div>
      )}
    </>
  );
}
