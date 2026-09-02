/** Helpers for reel media: uploaded video files and external YouTube links. */

export function youtubeId(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([A-Za-z0-9_-]{11})/,
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /(?:youtube\.com\/(?:embed|shorts|live)\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m?.[1]) return m[1];
  }
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url;
  return null;
}

export function youtubeEmbedUrl(id: string, opts?: { autoplay?: boolean; muted?: boolean }) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    loop: "1",
    playlist: id,
    autoplay: opts?.autoplay ? "1" : "0",
    mute: opts?.muted === false ? "0" : "1",
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export function youtubeThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function parseTags(input: string, limit = 8) {
  return input
    .split(/[,\s]+/)
    .map((t) => t.replace(/^#/, "").trim().toLowerCase())
    .filter(Boolean)
    .filter((t, i, arr) => arr.indexOf(t) === i)
    .slice(0, limit);
}
