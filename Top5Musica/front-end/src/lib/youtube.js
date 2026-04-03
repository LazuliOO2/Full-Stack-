const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function extractYouTubeVideoId(url) {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLowerCase();
    const segments = parsedUrl.pathname.split('/').filter(Boolean);

    let videoId = null;

    if (host === 'youtu.be' || host === 'www.youtu.be') {
      videoId = segments[0] || null;
    } else if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      if (parsedUrl.pathname === '/watch') {
        videoId = parsedUrl.searchParams.get('v');
      } else if (['embed', 'shorts', 'live', 'v'].includes(segments[0])) {
        videoId = segments[1] || null;
      }
    }

    return YOUTUBE_VIDEO_ID_PATTERN.test(videoId || '') ? videoId : null;
  } catch {
    return null;
  }
}

export function getYouTubeThumbnailUrl(videoId) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
}
