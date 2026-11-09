// What an opened post shows under its title: text, picture, video, gallery,
// or a link card. Media keeps its own shape (D-056).

import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { GalleryItem, Post, VideoInfo } from '../lib/reddit-data';
import { toReaderUrl } from '../lib/reddit-links';
import { cleanRedditHtml, safeHref } from '../lib/sanitize';
import { BackIcon, ExternalIcon } from './icons';

const REDDIT = 'https://old.reddit.com';

/** Reddit's HTML, cleaned (D-052) and added as real nodes. */
export function PostText({ html, className = 'post-text' }: { html: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = box.current;
    if (!element) {
      return;
    }
    element.replaceChildren(cleanRedditHtml(html, document, new DOMParser()));
    // Spoilers reveal on hover, tap or keyboard focus.
    element.querySelectorAll('.spoiler').forEach((spoiler) => {
      spoiler.setAttribute('tabindex', '0');
    });
  }, [html]);
  return <div class={className} ref={box} />;
}

/** A Reddit video (D-054): HLS with sound through hls.js, else the silent MP4. */
export function VideoPlayer({
  video,
  poster,
  redditUrl,
}: {
  video: VideoInfo;
  poster: string | null;
  redditUrl: string;
}) {
  const element = useRef<HTMLVideoElement>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    const player = element.current;
    if (!player) {
      return;
    }
    let hls: Hls | null = null;
    const playSilent = (why: string) => {
      if (video.mp4Url) {
        player.src = video.mp4Url;
      }
      setNote(why);
    };

    if (video.isGif || !video.hlsUrl) {
      if (video.mp4Url) {
        player.src = video.mp4Url;
      }
    } else if (Hls.isSupported()) {
      // No worker: a worker would be blocked by the page's security rules.
      hls = new Hls({ enableWorker: false, capLevelToPlayerSize: true });
      const stream = hls;
      stream.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.warn('Unred It: video stream failed', data.type, data.details);
          stream.destroy();
          hls = null;
          playSilent(`The sound could not load (${data.details}). Playing without sound.`);
        }
      });
      stream.loadSource(video.hlsUrl);
      stream.attachMedia(player);
    } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = video.hlsUrl;
    } else {
      playSilent('This browser cannot play the sound here. Playing without sound.');
    }

    return () => {
      hls?.destroy();
      player.removeAttribute('src');
      player.load();
    };
  }, [video]);

  const ratio =
    video.width > 0 && video.height > 0
      ? `${String(video.width)} / ${String(video.height)}`
      : '16 / 9';

  return (
    <figure class="media video">
      <video
        ref={element}
        class="media-frame"
        style={{ aspectRatio: ratio }}
        controls
        playsInline
        preload="metadata"
        poster={poster ?? undefined}
        loop={video.isGif}
        muted={video.isGif}
        autoPlay={video.isGif}
      />
      {note && (
        <figcaption class="media-note">
          {note}{' '}
          <a href={redditUrl} target="_blank" rel="noopener noreferrer">
            Play on Reddit
          </a>
        </figcaption>
      )}
    </figure>
  );
}

/** A gallery (D-055): one picture at a time, Previous and Next buttons, no swipe. */
export function Gallery({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState(0);
  const item = items[index];
  if (!item) {
    return null;
  }
  // The frame keeps the shape of the tallest picture, so the buttons never jump.
  const tallest = items.reduce(
    (best, i) =>
      i.height / Math.max(i.width, 1) > best.height / Math.max(best.width, 1) ? i : best,
    item,
  );
  const last = items.length - 1;

  return (
    <figure class="media gallery" aria-roledescription="gallery">
      <div
        class="gallery-frame"
        style={{
          aspectRatio: `${String(Math.max(tallest.width, 1))} / ${String(Math.max(tallest.height, 1))}`,
        }}
      >
        {item.isVideo ? (
          <video key={item.url} src={item.url} controls autoPlay loop muted playsInline />
        ) : (
          <img
            key={item.url}
            src={item.url}
            width={item.width}
            height={item.height}
            alt={item.caption}
            decoding="async"
            referrerpolicy="no-referrer"
          />
        )}
      </div>
      <div class="gallery-bar">
        <button
          type="button"
          class="gallery-button"
          aria-label="Previous picture"
          disabled={index === 0}
          onClick={() => {
            setIndex((i) => Math.max(0, i - 1));
          }}
        >
          <BackIcon />
        </button>
        <span class="gallery-count" aria-live="polite">
          {index + 1} / {items.length}
        </span>
        <button
          type="button"
          class="gallery-button next"
          aria-label="Next picture"
          disabled={index === last}
          onClick={() => {
            setIndex((i) => Math.min(last, i + 1));
          }}
        >
          <BackIcon />
        </button>
      </div>
      {item.caption && <figcaption class="gallery-caption">{item.caption}</figcaption>}
    </figure>
  );
}

function LinkCard({ post }: { post: Post }) {
  const href = safeHref(post.url);
  // A link to another Reddit page opens it in the reader, same tab (D-027).
  const reader = href ? toReaderUrl(href) : null;
  const image = post.previewImage;
  return (
    <div class="link-card">
      {image && (
        <img
          class="link-card-image"
          src={image.url}
          width={image.width}
          height={image.height}
          alt=""
          decoding="async"
          referrerpolicy="no-referrer"
        />
      )}
      <div class="link-card-body">
        <p class="link-source">{post.domain}</p>
        {reader && (
          <a class="open-button" href={reader}>
            Open linked post
          </a>
        )}
        {href && !reader && (
          <a class="open-button" href={href} target="_blank" rel="noopener noreferrer">
            {post.postHint === 'rich:video' ? 'Open video' : 'Open article'}
            <ExternalIcon />
          </a>
        )}
      </div>
    </div>
  );
}

export function PostMedia({ post }: { post: Post }) {
  // Reddit's own page (?unred=off), since the reader now opens post pages too.
  const redditUrl = `${REDDIT}${post.permalink}?unred=off`;
  const body = post.selftextHtml ? <PostText html={post.selftextHtml} /> : null;

  if (post.gallery) {
    return (
      <>
        <Gallery items={post.gallery} />
        {body}
      </>
    );
  }
  if (post.video) {
    return (
      <>
        <VideoPlayer
          video={post.video}
          poster={post.previewImage?.url ?? null}
          redditUrl={redditUrl}
        />
        {body}
      </>
    );
  }
  if (post.isSelf) {
    return body;
  }
  if (post.postHint === 'image' && post.previewImage) {
    return (
      <img
        class="post-image"
        src={post.previewImage.url}
        width={post.previewImage.width}
        height={post.previewImage.height}
        alt=""
        decoding="async"
        referrerpolicy="no-referrer"
      />
    );
  }
  return <LinkCard post={post} />;
}
