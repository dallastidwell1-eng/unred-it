import { describe, expect, it } from 'vitest';
import { parseListing } from './reddit-data';

function one(data: Record<string, unknown>) {
  const [post] = parseListing({
    kind: 'Listing',
    data: { children: [{ kind: 't3', data: { name: 't3_x', ...data } }] },
  });
  if (!post) {
    throw new Error('no post');
  }
  return post;
}

const redditVideo = {
  hls_url: 'https://v.redd.it/abc/HLSPlaylist.m3u8?a=1',
  fallback_url: 'https://v.redd.it/abc/CMAF_720.mp4?source=fallback',
  width: 1280,
  height: 720,
  is_gif: false,
};

describe('video', () => {
  it('reads a Reddit-hosted video from secure_media', () => {
    expect(one({ is_video: true, secure_media: { reddit_video: redditVideo } }).video).toEqual({
      hlsUrl: 'https://v.redd.it/abc/HLSPlaylist.m3u8?a=1',
      mp4Url: 'https://v.redd.it/abc/CMAF_720.mp4?source=fallback',
      width: 1280,
      height: 720,
      isGif: false,
    });
  });

  it('treats the preview clip of a GIF post as a GIF', () => {
    const post = one({ preview: { reddit_video_preview: { ...redditVideo, is_gif: false } } });
    expect(post.video?.isGif).toBe(true);
  });

  it("uses a crosspost's original video", () => {
    const post = one({ crosspost_parent_list: [{ secure_media: { reddit_video: redditVideo } }] });
    expect(post.video?.width).toBe(1280);
  });

  it('ignores non-https or missing addresses', () => {
    expect(one({ secure_media: { reddit_video: { hls_url: 'http://x', width: 1 } } }).video).toBe(
      null,
    );
    expect(one({}).video).toBeNull();
  });
});

describe('gallery', () => {
  const metadata = {
    a: {
      status: 'valid',
      e: 'Image',
      s: { u: 'https://preview.redd.it/a.jpg?width=3000', x: 3000, y: 2000 },
      p: [
        { u: 'https://preview.redd.it/a.jpg?width=640', x: 640, y: 427 },
        { u: 'https://preview.redd.it/a.jpg?width=1080', x: 1080, y: 720 },
      ],
    },
    b: {
      status: 'valid',
      e: 'Image',
      s: { u: 'https://i.redd.it/b.png', x: 800, y: 1200 },
      p: [],
    },
    c: {
      status: 'valid',
      e: 'AnimatedImage',
      s: { gif: 'https://i.redd.it/c.gif', mp4: 'https://i.redd.it/c.mp4', x: 400, y: 300 },
    },
    d: { status: 'failed' },
  };

  it('reads the pictures in order with captions and display sizes', () => {
    const post = one({
      is_gallery: true,
      gallery_data: {
        items: [
          { media_id: 'b', caption: 'Second in the data, first shown' },
          { media_id: 'a' },
          { media_id: 'd' },
          { media_id: 'c' },
        ],
      },
      media_metadata: metadata,
    });
    expect(post.gallery).toEqual([
      {
        url: 'https://i.redd.it/b.png',
        width: 800,
        height: 1200,
        caption: 'Second in the data, first shown',
        isVideo: false,
      },
      {
        url: 'https://preview.redd.it/a.jpg?width=1080',
        width: 1080,
        height: 720,
        caption: '',
        isVideo: false,
      },
      { url: 'https://i.redd.it/c.mp4', width: 400, height: 300, caption: '', isVideo: true },
    ]);
  });

  it('is null for a normal post', () => {
    expect(one({}).gallery).toBeNull();
  });
});
